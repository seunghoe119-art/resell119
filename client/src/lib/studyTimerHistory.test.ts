import assert from "node:assert/strict";
import { test } from "node:test";
import { applyStudyAction, initialStudyModel } from "./studyTimer.ts";
import { encodeStudySnapshot } from "./studyTimerSync.ts";
import { adjacentMonth, calendarDates, formatStudyDuration, snapshotStudyDayTotal, studyHistoryId } from "./studyTimerHistory.ts";

test("history includes the last unfinished question after the browser closes, capped at 60 seconds", () => {
  const now = Date.parse("2026-10-15T03:00:00Z");
  const model = applyStudyAction({ ...initialStudyModel(now, null), totalTimeMs: 120_000 }, { type: "toggleStudy" }, now);
  const raw = encodeStudySnapshot(model, now);
  assert.equal(snapshotStudyDayTotal(raw, now + 25_000), 145_000);
  assert.equal(snapshotStudyDayTotal(raw, now + 180_000), 180_000);
});

test("history cuts off exactly at 03:00 KST without losing the final millisecond", () => {
  const now = Date.parse("2026-10-15T17:59:30Z");
  const model = applyStudyAction({ ...initialStudyModel(now, null), totalTimeMs: 120_000 }, { type: "toggleStudy" }, now);
  const raw = encodeStudySnapshot(model, now);
  assert.equal(snapshotStudyDayTotal(raw, now + 90_000), 150_000);
  assert.equal(snapshotStudyDayTotal(raw, now + 3 * 86_400_000), 150_000);
});

test("paused history never includes pause time", () => {
  const now = Date.parse("2026-10-15T03:00:00Z");
  const started = applyStudyAction(initialStudyModel(now, null), { type: "toggleStudy" }, now);
  const paused = applyStudyAction(started, { type: "toggleStudy" }, now + 10_000);
  assert.equal(snapshotStudyDayTotal(encodeStudySnapshot(paused, now + 10_000), now + 90_000), 10_000);
});

test("calendar supports leap years, year changes and hour formatting", () => {
  const feb = calendarDates("2028-02");
  assert.equal(feb.filter(Boolean).length, 29);
  assert.ok(feb.includes("2028-02-29"));
  assert.equal(feb.length % 7, 0);
  assert.equal(adjacentMonth("2026-12", 1), "2027-01");
  assert.equal(adjacentMonth("2027-01", -1), "2026-12");
  assert.equal(formatStudyDuration(3_661_000), "1시간 1분 1초");
  assert.equal(studyHistoryId("personal", "2026-10-15"), "personal:day:2026-10-15");
});
