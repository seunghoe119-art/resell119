import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { createStudyTimerStore } from "../client/src/lib/studyTimerStore.ts";
import { initialStudyModel, currentDayStudyTotal } from "../client/src/lib/studyTimer.ts";
import { loadSharedStudyTimer, commitSharedStudyAction, encodeStudySnapshot } from "../client/src/lib/studyTimerSync.ts";

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
