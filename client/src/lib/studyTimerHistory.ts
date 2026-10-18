import { currentDayFocusElapsed } from "./focusTimer.ts";
import { currentDayStudyElapsed, initialStudyModel, studyDayStart, type StudyTimerModel } from "./studyTimer.ts";

export function studyHistoryId(timerId: string, date: string): string {
  return `${timerId}:day:${date}`;
}

export function snapshotStudyDate(raw: string): string {
  const snapshot = JSON.parse(raw);
  if (snapshot?.version !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.model?.date ?? "")) {
    throw new Error("Invalid study history snapshot");
  }
  return snapshot.model.date;
}

export function snapshotStudyDayTotal(raw: string, now: number): number {
  const date = snapshotStudyDate(raw);
  // A study date ends at 18:00 UTC on that calendar date (next-day 03:00 KST).
  const end = Date.parse(`${date}T18:00:00Z`);
  const model: StudyTimerModel = initialStudyModel(Math.min(now, end - 1),
    JSON.stringify(JSON.parse(raw).model));
  return model.totalTimeMs + (model.studyStatus === "idle"
    ? 0 : currentDayStudyElapsed(model, Math.min(now, end))) +
    currentDayFocusElapsed(model.focus, Math.min(now, end), studyDayStart(end - 1));
}

export function calendarDates(month: string): (string | null)[] {
  const [year, m] = month.split("-").map(Number);
  const offset = new Date(Date.UTC(year, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const length = Math.ceil((offset + count) / 7) * 7;
  return Array.from({ length }, (_, i) => i < offset || i >= offset + count
    ? null : `${month}-${String(i - offset + 1).padStart(2, "0")}`);
}

export function adjacentMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

export function formatStudyDuration(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 3600)}시간 ${Math.floor(seconds / 60) % 60}분 ${seconds % 60}초`;
}
