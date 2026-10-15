import assert from "node:assert/strict";
import { test } from "node:test";
import { currentDayStudyTotal, initialStudyModel } from "./studyTimer.ts";
import {
  commitSharedStudyAction, encodeStudySnapshot, loadSharedStudyTimer,
  type StudyTimerStore,
} from "./studyTimerSync.ts";

function memoryStore(): StudyTimerStore & { raw: string | null; writes: number } {
  return {
    raw: null, writes: 0,
    async read() { return this.raw; },
    async write(expected, value) {
      if (this.raw !== expected) return false;
      this.raw = value;
      this.writes++;
      return true;
    },
  };
}
const start = Date.parse("2026-10-14T03:00:00Z");
const empty = () => initialStudyModel(start, null);

test("browser B restores running anchors before PASS, without double counting or writing on load", async () => {
  const db = memoryStore();
  await loadSharedStudyTimer(db, empty(), () => start);
  await commitSharedStudyAction(db, { type: "toggleStudy" }, () => start);
  const writes = db.writes;
  const second = await loadSharedStudyTimer(db, empty(), () => start + 25_000);
  assert.equal(currentDayStudyTotal(second, start + 25_000), 25_000);
  assert.equal(db.writes, writes);
  const passed = await commitSharedStudyAction(db, { type: "pass" }, () => start + 25_000);
  const third = await loadSharedStudyTimer(db, second, () => start + 25_000);
  assert.equal(third.totalTimeMs, 25_000);
  assert.equal(currentDayStudyTotal(third, start + 25_000), 25_000);
  assert.equal(passed.passCount, 1);
});

test("pause, resume and overtime are shared across independent browsers", async () => {
  const db = memoryStore();
  await loadSharedStudyTimer(db, empty(), () => start);
  await commitSharedStudyAction(db, { type: "toggleStudy" }, () => start);
  await commitSharedStudyAction(db, { type: "toggleStudy" }, () => start + 10_000);
  const paused = await loadSharedStudyTimer(db, empty(), () => start + 40_000);
  assert.equal(paused.studyStatus, "paused");
  assert.equal(currentDayStudyTotal(paused, start + 40_000), 10_000);
  await commitSharedStudyAction(db, { type: "toggleStudy" }, () => start + 40_000);
  const finished = await loadSharedStudyTimer(db, empty(), () => start + 120_000);
  assert.equal(currentDayStudyTotal(finished, start + 120_000), 60_000);
  const passed = await commitSharedStudyAction(db, { type: "pass" }, () => start + 120_000);
  assert.equal(passed.totalTimeMs, 60_000);
  assert.equal(JSON.parse(db.raw!).pure_study_ms, 60_000);
});

test("simultaneous first visits initialize exactly once", async () => {
  const db = memoryStore();
  const [a, b] = await Promise.all([
    loadSharedStudyTimer(db, { ...empty(), totalTimeMs: 20_000 }, () => start),
    loadSharedStudyTimer(db, empty(), () => start),
  ]);
  assert.equal(a.totalTimeMs, 20_000);
  assert.equal(b.totalTimeMs, 20_000);
  assert.equal(db.writes, 1);
});

test("concurrent PASS operations retry against latest cloud state instead of overwriting it", async () => {
  const db = memoryStore();
  await loadSharedStudyTimer(db, empty(), () => start);
  await commitSharedStudyAction(db, { type: "toggleStudy" }, () => start);
  await Promise.all([
    commitSharedStudyAction(db, { type: "pass" }, () => start + 10_000),
    commitSharedStudyAction(db, { type: "pass" }, () => start + 10_000),
  ]);
  const latest = await loadSharedStudyTimer(db, empty(), () => start + 10_000);
  assert.equal(latest.totalTimeMs, 10_000);
  assert.equal(latest.passCount, 2);
});

test("cloud RESET wins over stale larger local totals", async () => {
  const db = memoryStore();
  const stale = { ...empty(), passCount: 10, totalTimeMs: 500_000 };
  await loadSharedStudyTimer(db, stale, () => start);
  await commitSharedStudyAction(db, { type: "resetStudy" }, () => start);
  const restored = await loadSharedStudyTimer(db, stale, () => start);
  assert.equal(restored.totalTimeMs, 0);
  assert.equal(restored.passCount, 0);
});

test("cloud reload at 03:00 KST credits only new-day running time", async () => {
  const db = memoryStore();
  const time = Date.parse("2026-10-14T17:59:30Z");
  await loadSharedStudyTimer(db, initialStudyModel(time, null), () => time);
  await commitSharedStudyAction(db, { type: "toggleStudy" }, () => time);
  const nextDay = await loadSharedStudyTimer(db, empty(), () => time + 40_000);
  assert.equal(nextDay.date, "2026-10-15");
  assert.equal(currentDayStudyTotal(nextDay, time + 40_000), 10_000);
  const passed = await commitSharedStudyAction(db, { type: "pass" }, () => time + 90_000);
  assert.equal(passed.totalTimeMs, 30_000);
});

test("read errors and corrupt cloud records never overwrite data with the local backup", async () => {
  const db = memoryStore();
  db.raw = "broken record";
  await assert.rejects(loadSharedStudyTimer(db, empty(), () => start));
  assert.equal(db.raw, "broken record");
  assert.equal(db.writes, 0);
  db.raw = encodeStudySnapshot(empty(), start);
  db.read = async () => { throw new Error("network offline"); };
  await assert.rejects(commitSharedStudyAction(db, { type: "pass" }, () => start));
  assert.equal(db.writes, 0);
});
