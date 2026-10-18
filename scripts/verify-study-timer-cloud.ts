import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { createStudyTimerStore } from "../client/src/lib/studyTimerStore.ts";
import { initialStudyModel, currentDayStudyTotal } from "../client/src/lib/studyTimer.ts";
import { loadSharedStudyTimer, commitSharedStudyAction, encodeStudySnapshot } from "../client/src/lib/studyTimerSync.ts";
import { snapshotStudyDayTotal } from "../client/src/lib/studyTimerHistory.ts";

const url = process.env.STUDY_SUPABASE_URL;
const key = process.env.STUDY_SUPABASE_KEY;
if (!url || !key) throw new Error("Set STUDY_SUPABASE_URL and STUDY_SUPABASE_KEY");
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const a = createStudyTimerStore(client(), "verification");
const b = createStudyTimerStore(client(), "verification");
await loadSharedStudyTimer(a, initialStudyModel(Date.now(), null));
await commitSharedStudyAction(a, { type: "resetStudy" });
await commitSharedStudyAction(a, { type: "toggleStudy" });
// Client A makes no more requests while elapsed time advances (as with suspension).
await new Promise(resolve => setTimeout(resolve, 2100));
const restored = await loadSharedStudyTimer(b, initialStudyModel(Date.now(), null));
assert.equal(restored.studyStatus, "running");
assert.ok(currentDayStudyTotal(restored, Date.now()) >= 2000);
const paused = await commitSharedStudyAction(b, { type: "toggleStudy" });
assert.equal(paused.studyStatus, "paused");
const passed = await commitSharedStudyAction(a, { type: "pass" });
assert.equal(passed.passCount, 1);
assert.equal(passed.totalTimeMs, paused.studyDayElapsedMs);
console.log("PASS: independent client restores pre-PASS credit and PAUSE; PASS credits once");

const raw = await a.read();
assert.ok(raw);
const replacement = encodeStudySnapshot(passed, Date.now());
assert.equal(await a.write(raw, replacement), true);
assert.equal(await b.write(raw, encodeStudySnapshot(restored, Date.now())), false);
console.log("PASS: stale client cannot overwrite newer cloud state");

const now = Date.now();
const expired = { ...initialStudyModel(now, null), studyStatus: "running" as const,
  studyStartedAt: now - 90_000, studyDayStartedAt: now - 90_000 };
assert.equal(await a.write(await a.read(), encodeStudySnapshot(expired, now)), true);
const capped = await loadSharedStudyTimer(b, initialStudyModel(now, null));
assert.equal(currentDayStudyTotal(capped, Date.now()), 60_000);
console.log("PASS: closed-client overtime is capped at 60 seconds");

await commitSharedStudyAction(a, { type: "resetStudy" });
const reset = await loadSharedStudyTimer(b, restored);
assert.equal(currentDayStudyTotal(reset, Date.now()), 0);
assert.equal(reset.studyStatus, "idle");
console.log("PASS: RESET restored on independent client; verification row left idle/zero");

const migrationTime = Date.now();
const small = { ...initialStudyModel(migrationTime, null), passCount: 7, totalTimeMs: 125_929 };
assert.equal(await a.write(await a.read(), encodeStudySnapshot(small, migrationTime)), true);
const legacy = { ...small, passCount: 44, totalTimeMs: 2_253_000 };
await loadSharedStudyTimer(a, legacy, () => migrationTime, true);
const migratedOnB = await loadSharedStudyTimer(b, small, () => migrationTime);
assert.equal(migratedOnB.passCount, 44);
assert.equal(migratedOnB.totalTimeMs, 2_253_000);
await commitSharedStudyAction(a, { type: "resetStudy" });
assert.equal((await loadSharedStudyTimer(b, legacy, Date.now, true)).passCount, 0);
console.log("PASS: legacy browser migration reaches another client; RESET blocks re-import; verification idle/zero");

const beforeBoundary = Date.parse("2026-10-14T17:59:30Z");
const yesterday = { ...initialStudyModel(beforeBoundary, null), totalTimeMs: 120_000,
  studyStatus: "running" as const, studyStartedAt: beforeBoundary, studyDayStartedAt: beforeBoundary };
await a.write(await a.read(), encodeStudySnapshot(yesterday, beforeBoundary));
await commitSharedStudyAction(a, { type: "resetStudy" });
const { data: history, error: historyError } = await client().from("study_timer_state")
  .select("snapshot").eq("id", "verification:day:2026-10-14").single();
if (historyError) throw historyError;
assert.equal(snapshotStudyDayTotal(history.snapshot, Date.now()), 150_000);
console.log("PASS: archived yesterday survives day rollover, with exact 03:00 KST pending credit");

await commitSharedStudyAction(a, { type: "selectMode", mode: "focus" });
await commitSharedStudyAction(a, { type: "startFocus", kind: "focus", workMs: 19 * 60_000,
  breakMs: 5 * 60_000, longBreakMs: 15 * 60_000, cycles: 4 });
await new Promise(resolve => setTimeout(resolve, 1100));
const focusOnB = await loadSharedStudyTimer(b, initialStudyModel(Date.now(), null));
assert.equal(focusOnB.mode, "focus");
assert.equal(focusOnB.focus?.workMs, 19 * 60_000);
assert.ok(currentDayStudyTotal(focusOnB, Date.now()) >= 1000);
const focusPaused = await commitSharedStudyAction(b, { type: "toggleFocus" });
const focusOnA = await loadSharedStudyTimer(a, initialStudyModel(Date.now(), null));
assert.equal(focusOnA.focus?.status, "paused");
assert.equal(currentDayStudyTotal(focusOnA, Date.now() + 60_000), focusPaused.totalTimeMs);
await commitSharedStudyAction(a, { type: "endFocus" });
await commitSharedStudyAction(a, { type: "selectMode", mode: "pomodoro" });
await commitSharedStudyAction(a, { type: "startFocus", kind: "pomodoro", workMs: 25 * 60_000,
  breakMs: 5 * 60_000, longBreakMs: 15 * 60_000, cycles: 4 });
const pomoOnB = await loadSharedStudyTimer(b, initialStudyModel(Date.now(), null));
assert.equal(pomoOnB.mode, "pomodoro");
assert.equal(pomoOnB.focus?.cycles, 4);
await commitSharedStudyAction(a, { type: "resetStudy" });
await commitSharedStudyAction(a, { type: "selectMode", mode: "question" });
console.log("PASS: independent clients restore focus, paused credit and Pomodoro configuration; verification reset");
