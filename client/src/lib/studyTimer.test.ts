import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyStudyAction, currentDayStudyTotal, initialStudyModel, reconcileStudyModel,
} from "./studyTimer.ts";

const start = Date.parse("2026-10-13T17:59:30Z"); // 02:59:30 KST
const begin = (now = start) => applyStudyAction(initialStudyModel(now, null), { type: "toggleStudy" }, now);

test("live credit grows before PASS, caps at 60 seconds, and leaves persisted totals alone", () => {
  const model = { ...begin(), totalTimeMs: 120_000 };
  assert.equal(currentDayStudyTotal(model, start + 10_000), 130_000);
  // Use a time away from the daily boundary to test overtime.
  const daytime = start - 60_000;
  const running = { ...begin(daytime), totalTimeMs: 120_000 };
  assert.equal(currentDayStudyTotal(running, daytime + 60_000), 180_000);
  assert.equal(currentDayStudyTotal(reconcileStudyModel(running, daytime + 75_000), daytime + 80_000), 180_000);
  assert.equal(running.totalTimeMs, 120_000);
});

test("pause freezes credit; resume credits only running time", () => {
  const paused = applyStudyAction(begin(start - 60_000), { type: "toggleStudy" }, start - 50_000);
  assert.equal(currentDayStudyTotal(paused, start - 30_000), 10_000);
  const resumed = applyStudyAction(paused, { type: "toggleStudy" }, start - 30_000);
  assert.equal(currentDayStudyTotal(resumed, start - 20_000), 20_000);
});

test("PASS transfers credit once and the next problem starts at zero", () => {
  const model = begin();
  const now = start + 10_000;
  const passed = applyStudyAction(model, { type: "pass" }, now);
  assert.equal(currentDayStudyTotal(passed, now), currentDayStudyTotal(model, now));
  assert.equal(passed.totalTimeMs, 10_000);
  assert.equal(passed.passCount, 1);
  assert.equal(currentDayStudyTotal(passed, now + 5_000), 15_000);
  const second = applyStudyAction(passed, { type: "pass" }, now + 5_000);
  assert.equal(currentDayStudyTotal(second, now + 5_000), 15_000);
});

test("03:00 KST discards yesterday's totals and credits only today's allowed segment", () => {
  const model = { ...begin(), totalTimeMs: 120_000, passCount: 2 };
  const boundary = start + 30_000;
  assert.equal(currentDayStudyTotal(model, boundary - 1), 149_999);
  assert.equal(currentDayStudyTotal(model, boundary), 0);
  assert.equal(currentDayStudyTotal(model, boundary + 10_000), 10_000);
  assert.equal(currentDayStudyTotal(model, boundary + 60_000), 30_000);
  const passed = applyStudyAction(model, { type: "pass" }, boundary + 60_000);
  assert.equal(passed.date, "2026-10-14");
  assert.equal(passed.passCount, 1);
  assert.equal(currentDayStudyTotal(passed, boundary + 60_000), 30_000);
});

test("paused and expired timers carry no credit across the daily boundary", () => {
  const paused = applyStudyAction(begin(), { type: "toggleStudy" }, start + 10_000);
  assert.equal(currentDayStudyTotal(paused, start + 40_000), 0);
  const expired = begin(start - 60_000);
  assert.equal(currentDayStudyTotal(expired, start + 40_000), 0);
});

test("reload restores pending credit; reset clears it", () => {
  const model = begin();
  const restored = initialStudyModel(start + 10_000, JSON.stringify(model));
  assert.equal(currentDayStudyTotal(restored, start + 10_000), 10_000);
  const nextDay = initialStudyModel(start + 40_000, JSON.stringify(model));
  assert.equal(currentDayStudyTotal(nextDay, start + 40_000), 10_000);
  const reset = applyStudyAction(restored, { type: "resetStudy" }, start + 10_000);
  assert.equal(currentDayStudyTotal(reset, start + 20_000), 0);
  assert.equal(currentDayStudyTotal(initialStudyModel(start, null), start), 0);
});
