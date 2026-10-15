import {
  applyStudyAction, currentDayStudyTotal, initialStudyModel,
  type StudyTimerModel, type TimerAction,
} from "./studyTimer.ts";

export const STUDY_SYNC_TABLE = "study_timer_state";
export const STUDY_SYNC_ID = "personal";
export const STUDY_MIGRATION_KEY = "study_timer_cloud_migrated_v1";
export const STUDY_LEGACY_BACKUP_KEY = "study_timer_before_cloud_v1";

export interface StudyTimerStore {
  read(): Promise<string | null>;
  // Compare-and-swap, including insert-if-absent when expected is null.
  write(expected: string | null, value: string): Promise<boolean>;
}

export function encodeStudySnapshot(model: StudyTimerModel, now: number, resetAt?: number): string {
  return JSON.stringify({
    version: 1, model,
    study_date: model.date, pass_count: model.passCount,
    pure_study_ms: currentDayStudyTotal(model, now),
    saved_at: now,
    ...(resetAt === undefined ? {} : { reset_at: resetAt }),
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
  migrateLegacy = false,
): Promise<StudyTimerModel> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const raw = await store.read();
    if (raw !== null) {
      const time = now();
      const cloud = decodeStudySnapshot(raw, time);
      const local = initialStudyModel(time, JSON.stringify(fallback));
      const resetAt = JSON.parse(raw).reset_at;
      // One-time migration of a pre-cloud browser. Totals overlap, so never sum
      // them. Preserve today's larger completed statistics and its timer anchors.
      // A cloud RESET is an explicit cutoff: old browsers must not resurrect it.
      if (migrateLegacy && resetAt === undefined && local.date === cloud.date &&
          local.passCount >= cloud.passCount && local.totalTimeMs >= cloud.totalTimeMs &&
          (local.passCount > cloud.passCount || local.totalTimeMs > cloud.totalTimeMs)) {
        if (await store.write(raw, encodeStudySnapshot(local, time))) return local;
        continue;
      }
      return cloud;
    }
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
    const resetAt = action.type === "resetStudy" ? time : JSON.parse(raw).reset_at;
    if (await store.write(raw, encodeStudySnapshot(model, time, resetAt))) return model;
  }
  throw new Error("Timer changed on another device; retry");
}
