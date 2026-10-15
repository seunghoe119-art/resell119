import { useCallback, useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import { studyTimerStore } from "@/lib/studyTimerCloud";
import { commitSharedStudyAction, loadSharedStudyTimer } from "@/lib/studyTimerSync";
import {
  currentDayStudyTotal, currentStudyElapsed, formatStudyCountdown, formatStudyDate,
  formatStudyTime, initialStudyModel, reconcileStudyModel, restRemainingMs,
  STUDY_DURATION_MS, STUDY_STORAGE_KEY,
  type StudyTimerModel, type TimerAction,
} from "@/lib/studyTimer";
import "./StudyTimerPage.css";

const CIRCUMFERENCE = 2 * Math.PI * 126;

function makeInitialModel(): StudyTimerModel {
  let saved: string | null = null;
  try { saved = window.localStorage.getItem(STUDY_STORAGE_KEY); } catch { /* private mode */ }
  return initialStudyModel(Date.now(), saved);
}

/** Keep this component mounted in App while navigating other routes. */
export default function StudyTimerPage({ active = true }: { active?: boolean }) {
  const [model, setModel] = useState<StudyTimerModel>(makeInitialModel);
  const [clock, setClock] = useState(Date.now);
  const modelRef = useRef(model);
  modelRef.current = model;
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const wakeRequestRef = useRef(false);
  const mountedRef = useRef(true);
  const [syncStatus, setSyncStatus] = useState<"loading" | "saved" | "saving" | "error">("loading");
  const [cloudReady, setCloudReady] = useState(false);
  const syncBusy = useRef(false);
  const cloudReadyRef = useRef(false);

  const refreshCloud = useCallback(async () => {
    if (syncBusy.current) return;
    syncBusy.current = true;
    try {
      const next = await loadSharedStudyTimer(studyTimerStore, modelRef.current);
      if (!mountedRef.current) return;
      modelRef.current = next;
      setModel(next);
      setClock(Date.now());
      cloudReadyRef.current = true;
      setCloudReady(true);
      setSyncStatus("saved");
    } catch (error) {
      console.warn("Study timer cloud load failed", error);
      if (mountedRef.current) setSyncStatus("error");
    } finally {
      syncBusy.current = false;
    }
  }, []);

  const commit = useCallback(async (action: TimerAction) => {
    if (syncBusy.current || !cloudReadyRef.current) return;
    syncBusy.current = true;
    setSyncStatus("saving");
    try {
      const next = await commitSharedStudyAction(studyTimerStore, action);
      if (!mountedRef.current) return;
      modelRef.current = next;
      setModel(next);
      setClock(Date.now());
      setSyncStatus("saved");
    } catch (error) {
      console.warn("Study timer cloud save failed", error);
      if (mountedRef.current) setSyncStatus("error");
    } finally {
      syncBusy.current = false;
    }
  }, []);

  // A local backup is useful during an outage; the shared cloud model wins on load.
  useEffect(() => {
    try { window.localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(model)); }
    catch { /* storage disabled/full */ }
  }, [model]);

  useEffect(() => {
    void refreshCloud();
    const refresh = () => {
      if (document.visibilityState === "visible") void refreshCloud();
    };
    const interval = window.setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refreshCloud]);

  // One clock loop for both timers, even when this page is hidden by another route.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setClock(now);
      setModel(old => reconcileStudyModel(old, now));
    };
    const interval = window.setInterval(tick, 200);
    const onVisibility = () => tick();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, []);

  const studyNeedsWake = model.studyStatus === "running" || model.studyStatus === "finished";
  const restNeedsWake = model.restStatus === "running";
  const shouldWake = studyNeedsWake || restNeedsWake;

  useEffect(() => {
    let disposed = false;
    const updateWake = async () => {
      if (disposed || !mountedRef.current) return;
      if (!shouldWake || document.visibilityState !== "visible") {
        if (wakeLockRef.current) {
          const previous = wakeLockRef.current;
          wakeLockRef.current = null;
          try { await previous.release(); } catch { /* not supported */ }
        }
        return;
      }
      if (!("wakeLock" in navigator) || wakeLockRef.current || wakeRequestRef.current) return;
      wakeRequestRef.current = true;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (disposed || !mountedRef.current || document.visibilityState !== "visible" ||
          !(modelRef.current.studyStatus === "running" || modelRef.current.studyStatus === "finished" ||
            modelRef.current.restStatus === "running")) {
          await lock.release();
        } else {
          wakeLockRef.current = lock;
          lock.addEventListener("release", () => {
            if (wakeLockRef.current === lock) wakeLockRef.current = null;
          }, { once: true });
        }
      } catch { /* Timers still work if permission is denied */ }
      finally { wakeRequestRef.current = false; }
    };
    const onVisibility = () => { void updateWake(); };
    void updateWake();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [shouldWake]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const lock = wakeLockRef.current;
      wakeLockRef.current = null;
      if (lock) void lock.release().catch(() => {});
    };
  }, []);

  const pass = useCallback(() => { void commit({ type: "pass" }); }, [commit]);
  useEffect(() => {
    if (!active) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || event.isComposing ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const focused = event.target;
      if (focused instanceof Element &&
        (focused.closest("button, input, textarea, select, a, [role='button'], [contenteditable], [role='dialog'], [aria-modal='true']") ||
          (focused as HTMLElement).isContentEditable)) return;
      if (document.querySelector('[role="dialog"][data-state="open"], [aria-modal="true"]')) return;
      if (modelRef.current.studyStatus === "idle") return;
      event.preventDefault();
      pass();
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [active, pass]);

  const controlsDisabled = !cloudReady || syncStatus === "saving";

  const reset = () => {
    const message = model.passCount || model.totalTimeMs
      ? `통계를 초기화하시겠습니까?\n푼 문제: ${model.passCount}개  누적: ${formatStudyTime(currentDayStudyTotal(model, Date.now()))}`
      : "타이머를 초기화하시겠습니까?";
    if (window.confirm(message)) commit({ type: "resetStudy" });
  };

  const elapsed = currentStudyElapsed(model, clock);
  const displayedTotalTimeMs = currentDayStudyTotal(model, clock);
  const remaining = Math.max(0, STUDY_DURATION_MS - elapsed);
  const over = model.studyStatus !== "idle" && elapsed >= STUDY_DURATION_MS;
  const restRemaining = restRemainingMs(model, clock);
  const restDone = model.restStatus === "done";
  const runningRest = model.restStatus !== "idle";
  const progress = remaining / STUDY_DURATION_MS;
  const startLabel = model.studyStatus === "running" ? "PAUSE"
    : model.studyStatus === "paused" ? "RESUME" : "START";

  return (
    <div style={{ display: active ? undefined : "none" }} aria-hidden={!active}>
      <Navigation />
      <main className={"study-timer-shell" + (active && over ? " study-flash" : "") +
        (active && restDone ? " rest-flash" : "")}>
        <div className="study-timer-app">
          <header className="study-top-bar">
            <div className="study-date">{formatStudyDate(model.date)}</div>
            <div className={"study-sync-status" + (syncStatus === "error" ? " is-error" : "")} role="status">
              {syncStatus === "loading" ? "기록 불러오는 중…"
                : syncStatus === "saving" ? "저장 중…"
                : syncStatus === "saved" ? "Supabase 연결됨 · 다른 기기와 동기화"
                : "서버 연결 실패 · 변경사항을 저장할 수 없습니다"}
              {syncStatus === "error" && <button type="button" onClick={() => void refreshCloud()}>다시 연결</button>}
            </div>
          </header>
          <section className="study-stats" aria-label="오늘의 문제풀이 통계">
            <div className="study-stat"><span>푼 문제</span><strong>{model.passCount}개</strong></div>
            <div className="study-divider" />
            <div className="study-stat"><span>누적 시간</span><strong>{formatStudyTime(displayedTotalTimeMs)}</strong></div>
            <div className="study-divider" />
            <div className="study-stat"><span>문제당 평균</span>
              <strong>{model.passCount ? formatStudyTime(Math.round(model.totalTimeMs / model.passCount)) : "--:--"}</strong>
            </div>
          </section>

          <section className="study-timer-area" aria-label="60초 문제풀이 타이머">
            <div className={"study-ring-wrap" + (active && over ? " study-ring-blink" : "")}>
              <svg viewBox="0 0 300 300" className="study-ring" aria-hidden="true">
                <circle cx="150" cy="150" r="126" className="study-ring-track" />
                <circle cx="150" cy="150" r="126" className="study-ring-progress"
                  style={{ stroke: over ? "var(--study-red)" : "var(--study-teal)",
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: CIRCUMFERENCE * (1 - progress) }} />
              </svg>
              <div className="study-ring-center">
                <div className={"study-main-time" + (over ? " is-over" : "")}>
                  {over ? "0:00" : formatStudyCountdown(remaining)}
                </div>
              </div>
            </div>
            <div className="study-overtime" aria-live="off">
              {over ? "+" + formatStudyTime(elapsed - STUDY_DURATION_MS) : "\u00a0"}
            </div>
          </section>

          <div className="study-controls">
            <button type="button" className="study-btn study-reset" disabled={controlsDisabled} onClick={reset}>RESET</button>
            <button type="button" disabled={controlsDisabled} onClick={() => void commit({ type: "toggleStudy" })}
              className={"study-btn study-start " + (model.studyStatus === "running" ? "is-running" :
                model.studyStatus === "paused" || model.studyStatus === "finished" ? "is-paused" : "")}>
              {startLabel}
            </button>
          </div>
          <div className="study-pass-section">
            <button type="button" className="study-btn study-pass" disabled={controlsDisabled || model.studyStatus === "idle"}
              onClick={pass}>PASS</button>
            <p>스페이스바로도 PASS</p>
          </div>
          <section className="study-rest-section" aria-label="휴식 타이머">
            <div className="study-rest-label">휴식 타이머</div>
            <div className="study-rest-buttons">
              <button type="button" disabled={controlsDisabled} className="study-btn study-rest-btn"
                onClick={() => commit({ type: "startRest", durationMs: 300_000 })}>5분</button>
              <button type="button" disabled={controlsDisabled} className="study-btn study-rest-btn"
                onClick={() => commit({ type: "startRest", durationMs: 600_000 })}>10분</button>
            </div>
            {runningRest && (
              <div className={"study-rest-active" + (restDone ? " is-done" : "")}>
                <div className="study-rest-top">
                  <span className="study-rest-badge">{restDone ? "휴식 완료" : "휴식 중"}</span>
                  <strong className={"study-rest-countdown" + (restDone ? " done" : "")}>
                    {formatStudyCountdown(restRemaining)}
                  </strong>
                  <button type="button" disabled={controlsDisabled} className="study-btn study-rest-cancel"
                    onClick={() => commit({ type: "cancelRest" })}>취소</button>
                </div>
                <div className="study-rest-track">
                  <div className="study-rest-fill" style={{
                    width: model.restDurationMs ? (100 * restRemaining / model.restDurationMs) + "%" : "0%",
                  }} />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
