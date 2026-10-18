import assert from "node:assert/strict";
import { test } from "node:test";
import { applyStudyAction, currentDayStudyTotal, initialStudyModel, reconcileStudyModel } from "./studyTimer.ts";
import { focusView } from "./focusTimer.ts";
import { encodeStudySnapshot } from "./studyTimerSync.ts";
import { snapshotStudyDayTotal } from "./studyTimerHistory.ts";

const minute = 60_000;
const start = Date.parse("2026-10-18T03:00:00Z");
function begin(kind: "focus" | "pomodoro" = "focus", minutes = 19, now = start) {
  const model = applyStudyAction(initialStudyModel(now, null), { type: "selectMode", mode: kind }, now);
  return applyStudyAction(model, { type: "startFocus", kind, workMs: minutes * minute,
    breakMs: 5 * minute, longBreakMs: 15 * minute, cycles: 4 }, now);
}

test("19-minute focus credits 12 minutes when ended early and never credits extra time after ending", () => {
  const running = begin();
  assert.equal(currentDayStudyTotal(running, start + 12 * minute), 12 * minute);
  const ended = applyStudyAction(running, { type: "endFocus" }, start + 12 * minute);
  assert.equal(currentDayStudyTotal(ended, start + 40 * minute), 12 * minute);
  assert.equal(ended.passCount, 0);
});

test("focus pause/resume excludes all pause time", () => {
  const paused = applyStudyAction(begin(), { type: "toggleFocus" }, start + 5 * minute);
  assert.equal(currentDayStudyTotal(paused, start + 15 * minute), 5 * minute);
  const resumed = applyStudyAction(paused, { type: "toggleFocus" }, start + 15 * minute);
  assert.equal(currentDayStudyTotal(resumed, start + 22 * minute), 12 * minute);
});

test("15-minute focus caps at its configured duration and restarting transfers prior credit exactly once", () => {
  const finished = reconcileStudyModel(begin("focus", 15), start + 40 * minute);
  assert.equal(finished.focus?.status, "finished");
  assert.equal(currentDayStudyTotal(finished, start + 40 * minute), 15 * minute);
  const again = applyStudyAction(finished, { type: "startFocus", kind: "focus", workMs: 15 * minute,
    breakMs: 5 * minute, longBreakMs: 15 * minute, cycles: 4 }, start + 40 * minute);
  assert.equal(currentDayStudyTotal(again, start + 41 * minute), 16 * minute);
});

test("pomodoro automatically changes phases; short and long breaks contribute no study time", () => {
  const running = begin("pomodoro", 25);
  assert.equal(focusView(running.focus!, start + 26 * minute).kind, "break");
  assert.equal(currentDayStudyTotal(running, start + 29 * minute), 25 * minute);
  assert.equal(focusView(running.focus!, start + 31 * minute).cycle, 2);
  assert.equal(currentDayStudyTotal(running, start + 31 * minute), 26 * minute);
  assert.equal(focusView(running.focus!, start + 116 * minute).kind, "longBreak");
  assert.equal(currentDayStudyTotal(running, start + 129 * minute), 100 * minute);
  const finished = reconcileStudyModel(running, start + 180 * minute);
  assert.equal(finished.focus?.status, "finished");
  assert.equal(currentDayStudyTotal(finished, start + 300 * minute), 100 * minute);
});

test("closed-client pomodoro restores the correct phase, cycle and credit from Supabase snapshot anchors", () => {
  const running = begin("pomodoro", 25);
  const restored = initialStudyModel(start + 32 * minute, JSON.stringify(running));
  assert.equal(focusView(restored.focus!, start + 32 * minute).cycle, 2);
  assert.equal(currentDayStudyTotal(restored, start + 32 * minute), 27 * minute);
});

test("03:00 KST splits a focus block exactly between history and today's total", () => {
  const time = Date.parse("2026-10-18T17:50:00Z");
  const running = begin("focus", 19, time);
  const later = time + 30 * minute;
  const restored = initialStudyModel(later, JSON.stringify(running));
  assert.equal(restored.date, "2026-10-19");
  assert.equal(currentDayStudyTotal(restored, later), 9 * minute);
  assert.equal(snapshotStudyDayTotal(encodeStudySnapshot(running, time), later), 10 * minute);
});

test("pausing across the daily boundary neither carries yesterday's credited time nor loses resumed work", () => {
  const time = Date.parse("2026-10-18T17:50:00Z");
  const paused = applyStudyAction(begin("focus", 19, time), { type: "toggleFocus" }, time + 5 * minute);
  const resumed = applyStudyAction(paused, { type: "toggleFocus" }, time + 15 * minute);
  assert.equal(currentDayStudyTotal(resumed, time + 22 * minute), 7 * minute);
});

test("switching modes settles work and prevents overlapping question/focus/rest timers", () => {
  const q = applyStudyAction(initialStudyModel(start, null), { type: "toggleStudy" }, start);
  const switched = applyStudyAction(q, { type: "selectMode", mode: "focus" }, start + 10_000);
  assert.equal(switched.studyStatus, "idle");
  assert.equal(switched.totalTimeMs, 10_000);
  assert.deepEqual(applyStudyAction(switched, { type: "toggleStudy" }, start + 11_000), switched);
  assert.deepEqual(applyStudyAction(switched, { type: "pass" }, start + 11_000), switched);
  assert.deepEqual(applyStudyAction(switched, { type: "startRest", durationMs: minute }, start + 11_000), switched);
});

test("focus credit is excluded from the solved-question average and RESET clears every mode", () => {
  let model = applyStudyAction(initialStudyModel(start, null), { type: "toggleStudy" }, start);
  model = applyStudyAction(model, { type: "pass" }, start + 10_000);
  model = applyStudyAction(model, { type: "selectMode", mode: "focus" }, start + 10_000);
  model = applyStudyAction(model, { type: "startFocus", kind: "focus", workMs: 19 * minute,
    breakMs: 5 * minute, longBreakMs: 15 * minute, cycles: 4 }, start + 10_000);
  model = applyStudyAction(model, { type: "endFocus" }, start + 10_000 + 12 * minute);
  assert.equal(model.questionTimeMs, 10_000);
  assert.equal(model.totalTimeMs, 10_000 + 12 * minute);
  const reset = applyStudyAction(model, { type: "resetStudy" }, start + 20 * minute);
  assert.equal(currentDayStudyTotal(reset, start + 30 * minute), 0);
  assert.equal(reset.focus, null);
});

test("legacy snapshots retain their existing daily totals and question timing", () => {
  const old: Record<string, unknown> = { ...initialStudyModel(start, null), totalTimeMs: 120_000, passCount: 3 };
  delete old.mode; delete old.focus; delete old.questionTimeMs;
  const restored = initialStudyModel(start, JSON.stringify(old));
  assert.equal(restored.mode, "question");
  assert.equal(restored.questionTimeMs, 120_000);
  assert.equal(currentDayStudyTotal(restored, start), 120_000);
});
