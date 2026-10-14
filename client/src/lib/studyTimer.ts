/**
 * Study Timer One의 실제 타이머 동작을 React에서 사용할 수 있도록 분리한 상태 로직.
 * 프레임 수가 아닌 Date.now()로 계산하고 현재 진행 상태도 복원한다.
 */
export const STUDY_DURATION_MS = 60_000;
export const STUDY_STORAGE_KEY = "study_timer_v2";
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
const STUDY_DAY_START_HOUR = 3;

export type StudyStatus = "idle" | "running" | "paused" | "finished";
export type RestStatus = "idle" | "running" | "done";

export interface StudyTimerModel {
  date: string;
  passCount: number;
  totalTimeMs: number;
  studyStatus: StudyStatus;
  studyElapsedMs: number; // 일시정지까지의 총 경과 시간
  studyStartedAt: number | null; // 실행 중인 구간의 시작 시각
  studyDayElapsedMs: number; // 오늘에 속한 일시정지 구간만
  studyDayStartedAt: number | null; // 오늘 실행 중인 구간의 시작 시각
  restStatus: RestStatus;
  restDurationMs: number;
  restStartedAt: number | null;
}

export type TimerAction =
  | { type: "toggleStudy" }
  | { type: "pass" }
  | { type: "resetStudy" }
  | { type: "startRest"; durationMs: number }
  | { type: "cancelRest" };

/** Study days run from 03:00 KST to 02:59:59 KST the next day. */
export function studyDayStart(now: number): number {
  const koreaNow = new Date(now + SEOUL_OFFSET_MS);
  const year = koreaNow.getUTCFullYear();
  const month = koreaNow.getUTCMonth();
  const day = koreaNow.getUTCDate();
  const todayStart = Date.UTC(year, month, day, STUDY_DAY_START_HOUR) - SEOUL_OFFSET_MS;
  return now < todayStart ? todayStart - 86_400_000 : todayStart;
}

export function localStudyDate(now: number): string {
  return new Date(studyDayStart(now) + SEOUL_OFFSET_MS).toISOString().slice(0, 10);
}

export function initialStudyModel(now: number, saved: string | null): StudyTimerModel {
  const empty: StudyTimerModel = {
    date: localStudyDate(now), passCount: 0, totalTimeMs: 0,
    studyStatus: "idle", studyElapsedMs: 0, studyStartedAt: null,
    studyDayElapsedMs: 0, studyDayStartedAt: null,
    restStatus: "idle", restDurationMs: 0, restStartedAt: null,
  };
  try {
    const p = saved ? JSON.parse(saved) : null;
    if (!p || typeof p !== "object") return empty;
    const nonnegative = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;
    const timestamp = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= now ? v : null;
    const currentDate = p.date === empty.date;
    const status: StudyStatus =
      ["idle", "running", "paused", "finished"].includes(p.studyStatus) ? p.studyStatus : "idle";
    const rest: RestStatus =
      ["idle", "running", "done"].includes(p.restStatus) ? p.restStatus : "idle";
    const studyStartedAt = timestamp(p.studyStartedAt);
    const restStartedAt = timestamp(p.restStartedAt);
    const validStatus = (status !== "running" && status !== "finished") || studyStartedAt !== null;
    const validRest = rest !== "running" || restStartedAt !== null;
    const next: StudyTimerModel = {
      date: typeof p.date === "string" ? p.date : empty.date,
      passCount: currentDate && Number.isSafeInteger(p.passCount) && p.passCount >= 0 ? p.passCount : 0,
      totalTimeMs: currentDate && nonnegative(p.totalTimeMs) ? p.totalTimeMs : 0,
      studyStatus: validStatus ? status : "idle",
      studyElapsedMs: nonnegative(p.studyElapsedMs) ? p.studyElapsedMs : 0,
      studyStartedAt: validStatus && (status === "running" || status === "finished") ? studyStartedAt : null,
      studyDayElapsedMs: currentDate && nonnegative(p.studyDayElapsedMs) ? p.studyDayElapsedMs : 0,
      studyDayStartedAt: currentDate ? timestamp(p.studyDayStartedAt) : null,
      restStatus: validRest ? rest : "idle",
      restDurationMs: nonnegative(p.restDurationMs) ? p.restDurationMs : 0,
      restStartedAt: validRest && rest === "running" ? restStartedAt : null,
    };
    return reconcileStudyModel(next, now);
  } catch {
    return empty;
  }
}

export function currentStudyElapsed(model: StudyTimerModel, now: number): number {
  return model.studyElapsedMs +
    (model.studyStartedAt === null ? 0 : Math.max(0, now - model.studyStartedAt));
}

export function currentDayStudyElapsed(model: StudyTimerModel, now: number): number {
  // Never credit the flashing period after the first 60 seconds, even across 03:00.
  const allowed = Math.max(0, STUDY_DURATION_MS - model.studyElapsedMs);
  const live = model.studyDayStartedAt === null || model.studyStartedAt === null
    ? 0 : Math.min(allowed, Math.max(0, now - model.studyDayStartedAt),
      Math.max(0, model.studyStartedAt + allowed - model.studyDayStartedAt));
  return Math.min(STUDY_DURATION_MS, model.studyDayElapsedMs + live);
}

export function restRemainingMs(model: StudyTimerModel, now: number): number {
  if (model.restStatus === "done") return 0;
  if (model.restStatus !== "running" || model.restStartedAt === null) return model.restDurationMs;
  return Math.max(0, model.restDurationMs - Math.max(0, now - model.restStartedAt));
}

/** 날짜 경계와 완료 상태를 어느 탭에서도 일관되게 반영한다. */
export function reconcileStudyModel(model: StudyTimerModel, now: number): StudyTimerModel {
  let next = model;
  const date = localStudyDate(now);
  if (date !== next.date) {
    // 이전 날짜의 누적 통계는 이월하지 않는다. 타이머 자체의 총 경과 시간은 유지한다.
    const boundary = studyDayStart(now);
    next = {
      ...next, date, passCount: 0, totalTimeMs: 0,
      studyDayElapsedMs: 0,
      studyDayStartedAt: next.studyStartedAt === null
        ? null : Math.max(boundary, next.studyStartedAt),
    };
  }
  if (next.studyStatus === "running" && next.studyStartedAt !== null &&
      next.studyDayStartedAt === null) {
    next = { ...next, studyDayStartedAt: Math.max(studyDayStart(now), next.studyStartedAt) };
  }
  if (next.studyStatus === "running" &&
    currentStudyElapsed(next, now) >= STUDY_DURATION_MS) {
    next = { ...next, studyStatus: "finished" };
  }
  if (next.restStatus === "running" && restRemainingMs(next, now) <= 0) {
    next = { ...next, restStatus: "done" };
  }
  return next;
}

export function applyStudyAction(model: StudyTimerModel, action: TimerAction, now: number): StudyTimerModel {
  const next = reconcileStudyModel(model, now);
  switch (action.type) {
    case "toggleStudy":
      if (next.studyStatus === "running") {
        return {
          ...next, studyStatus: "paused",
          studyElapsedMs: currentStudyElapsed(next, now),
          studyStartedAt: null,
          studyDayElapsedMs: Math.min(STUDY_DURATION_MS, currentDayStudyElapsed(next, now)),
          studyDayStartedAt: null,
        };
      }
      if (next.studyStatus === "paused") {
        return { ...next, studyStatus: "running", studyStartedAt: now, studyDayStartedAt: now };
      }
      // 처음 시작하거나 60초 완료 후 START: 통계는 건드리지 않고 새 문제 시작
      return {
        ...next, studyStatus: "running", studyElapsedMs: 0, studyStartedAt: now,
        studyDayElapsedMs: 0, studyDayStartedAt: now,
      };
    case "pass":
      if (next.studyStatus === "idle") return next;
      return {
        ...next,
        passCount: next.passCount + 1,
        totalTimeMs: next.totalTimeMs + Math.min(STUDY_DURATION_MS, currentDayStudyElapsed(next, now)),
        studyStatus: "running",
        studyElapsedMs: 0, studyStartedAt: now,
        studyDayElapsedMs: 0, studyDayStartedAt: now,
      };
    case "resetStudy":
      return {
        ...next, passCount: 0, totalTimeMs: 0,
        studyStatus: "idle", studyElapsedMs: 0, studyStartedAt: null,
        studyDayElapsedMs: 0, studyDayStartedAt: null,
      };
    case "startRest":
      return {
        ...next, restStatus: "running",
        restDurationMs: action.durationMs, restStartedAt: now,
      };
    case "cancelRest":
      return {
        ...next, restStatus: "idle",
        restDurationMs: 0, restStartedAt: null,
      };
  }
}

export function formatStudyTime(ms: number, paddedMinutes = true): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(seconds / 60);
  return (paddedMinutes ? String(minutes).padStart(2, "0") : String(minutes)) +
    ":" + String(seconds % 60).padStart(2, "0");
}

export function formatStudyCountdown(ms: number): string {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

export function formatStudyDate(date: string): string {
  const parts = date.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return parts[0] + "년 " + parts[1] + "월 " + parts[2] + "일 (" + day + "요일)";
}
