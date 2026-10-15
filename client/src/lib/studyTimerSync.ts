import {
  applyStudyAction, currentDayStudyTotal, initialStudyModel,
  type StudyTimerModel, type TimerAction,
} from "./studyTimer.ts";

// The personal site already uses work_logs without Supabase Auth. Use an isolated
// author/key so timer state never overlaps real diary entries or requires new SQL.
export const STUDY_SYNC_AUTHOR = "__study_timer_v3__";
export const STUDY_SYNC_KEY = "study-timer-state";

export interface StudyTimerStore {
  read(): Promise<string | null>;
  // Compare-and-swap, including insert-if-absent when expected is null.
  write(expected: string | null, value: string): Promise<boolean>;
}

export function encodeStudySnapshot(model: StudyTimerModel, now: number): string {
  return JSON.stringify({
    version: 1, model,
    study_date: model.date, pass_count: model.passCount,
    pure_study_ms: currentDayStudyTotal(model, now),
    saved_at: now,
  });
}

export function decodeStudySnapshot(raw: string, now: number): StudyTimerModel {
  const snapshot = JSON.parse(raw);
  if (snapshot?.version !== 1 || typeof snapshot.model?.date !== "string" ||
      typeof snapshot.model.totalTimeMs !== "number") {
    throw new Error("Invalid cloud timer record");
  }
  // Restore the complete model, never MAX(cloud total) + local pending time:
  // both values can describe the same question on two different browsers.
  return initialStudyModel(now, JSON.stringify(snapshot.model));
}

export async function loadSharedStudyTimer(
  store: StudyTimerStore, fallback: StudyTimerModel, now: () => number = Date.now,
): Promise<StudyTimerModel> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const raw = await store.read();
    if (raw !== null) return decodeStudySnapshot(raw, now());
    const time = now();
    const model = initialStudyModel(time, JSON.stringify(fallback));
    if (await store.write(null, encodeStudySnapshot(model, time))) return model;
  }
  throw new Error("Timer changed on another device; retry");
}

export async function commitSharedStudyAction(
  store: StudyTimerStore, action: TimerAction, now: () => number = Date.now,
): Promise<StudyTimerModel> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const raw = await store.read();
    // Never replace a failed read/missing record with zero or stale browser data.
    if (raw === null) throw new Error("Cloud timer record is missing; reload first");
    const time = now();
    const model = applyStudyAction(decodeStudySnapshot(raw, time), action, time);
    if (await store.write(raw, encodeStudySnapshot(model, time))) return model;
  }
  throw new Error("Timer changed on another device; retry");
}
