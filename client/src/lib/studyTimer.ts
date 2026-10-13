/**
 * Study Timer One의 실제 타이머 동작을 React에서 사용할 수 있도록 분리한 상태 로직.
 * 시간은 프레임 수가 아니라 Date.now()로 계산하며, 브라우저에 저장하는 것은 당일 통계뿐이다.
 */
export const STUDY_DURATION_MS = 60_000;
export const STUDY_STORAGE_KEY = "study_timer_v1";

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

export function localStudyDate(now: number): string {
  const date = new Date(now);
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

function localMidnight(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function initialStudyModel(now: number, saved: string | null): StudyTimerModel {
  let passCount = 0;
  let totalTimeMs = 0;
  try {
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed && parsed.date === localStudyDate(now) &&
      Number.isSafeInteger(parsed.passCount) && parsed.passCount >= 0 &&
      Number.isFinite(parsed.totalTimeMs) && parsed.totalTimeMs >= 0) {
      passCount = parsed.passCount;
      totalTimeMs = parsed.totalTimeMs;
    }
  } catch {
    // 손상된 저장 데이터와 저장소 접근 거부는 타이머 사용을 막지 않는다.
  }
  return {
    date: localStudyDate(now), passCount, totalTimeMs,
    studyStatus: "idle", studyElapsedMs: 0, studyStartedAt: null,
    studyDayElapsedMs: 0, studyDayStartedAt: null,
    restStatus: "idle", restDurationMs: 0, restStartedAt: null,
  };
}

export function currentStudyElapsed(model: StudyTimerModel, now: number): number {
  return model.studyElapsedMs +
    (model.studyStartedAt === null ? 0 : Math.max(0, now - model.studyStartedAt));
}

export function currentDayStudyElapsed(model: StudyTimerModel, now: number): number {
  return model.studyDayElapsedMs +
    (model.studyDayStartedAt === null ? 0 : Math.max(0, now - model.studyDayStartedAt));
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
    const midnight = localMidnight(now);
    next = {
      ...next, date, passCount: 0, totalTimeMs: 0,
      studyDayElapsedMs: 0,
      studyDayStartedAt: next.studyStartedAt === null
        ? null : Math.max(midnight, next.studyStartedAt),
    };
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
          studyDayElapsedMs: currentDayStudyElapsed(next, now),
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
        totalTimeMs: next.totalTimeMs + currentDayStudyElapsed(next, now),
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
