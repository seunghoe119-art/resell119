import { useEffect, useState } from "react";
import { focusView } from "@/lib/focusTimer";
import { formatStudyCountdown, type StudyTimerModel, type TimerAction } from "@/lib/studyTimer";

const CIRCUMFERENCE = 2 * Math.PI * 126;

export default function FocusTimerPanel({ model, clock, disabled, active, commit }: {
  model: StudyTimerModel; clock: number; disabled: boolean; active: boolean;
  commit: (action: TimerAction) => Promise<void>;
}) {
  const pomo = model.mode === "pomodoro";
  const session = model.focus;
  const [minutes, setMinutes] = useState(session ? session.workMs / 60_000 : 25);
  const [breakMinutes, setBreakMinutes] = useState(session ? session.breakMs / 60_000 : 5);
  const [longMinutes, setLongMinutes] = useState(session ? session.longBreakMs / 60_000 : 15);
  const [cycles, setCycles] = useState(session?.cycles ?? 4);
  useEffect(() => {
    if (!session) return;
    setMinutes(session.workMs / 60_000);
    setBreakMinutes(session.breakMs / 60_000);
    setLongMinutes(session.longBreakMs / 60_000);
    setCycles(session.cycles);
  }, [session?.workMs, session?.breakMs, session?.longBreakMs, session?.cycles]);
  const locked = session?.status === "running" || session?.status === "paused";
  const view = session ? focusView(session, clock) : null;
  const complete = view?.complete ?? false;
  const resting = Boolean(view && !complete && view.kind !== "work");
  const remaining = complete ? 0 : view?.remainingMs ?? minutes * 60_000;
  const duration = view?.durationMs ?? minutes * 60_000;
  const progress = duration > 0 ? remaining / duration : 0;
  const valid = Number.isInteger(minutes) && minutes >= 1 && minutes <= (pomo ? 120 : 240) &&
    Number.isInteger(breakMinutes) && breakMinutes >= 1 && breakMinutes <= 60 &&
    Number.isInteger(longMinutes) && longMinutes >= 1 && longMinutes <= 60 &&
    Number.isInteger(cycles) && cycles >= 1 && cycles <= 8;
  const glowing = active && complete && session?.startedAt !== null;
  const label = complete ? "세션 종료" : view?.paused ? "일시정지"
    : resting ? (view?.kind === "longBreak" ? "긴 휴식" : "휴식") : "집중 공부";

  return (
    <section className={"focus-mode-panel" + (resting ? " is-resting" : "")} aria-label={pomo ? "뽀모도로 타이머" : "집중 공부 타이머"}>
      <fieldset className="focus-settings" disabled={disabled || locked}>
        <legend>{pomo ? "나에게 맞는 집중 주기" : "집중할 시간을 선택하세요"}</legend>
        {!pomo && <div className="focus-presets">
          {[15, 19, 25, 50].map(n => <button key={n} type="button" aria-pressed={minutes === n}
            className={minutes === n ? "is-selected" : ""} onClick={() => setMinutes(n)}>{n}분</button>)}
        </div>}
        <div className={"focus-inputs" + (pomo ? " is-pomodoro" : "")}>
          <label>{pomo ? "공부" : "직접 입력"}<span><input type="number" inputMode="numeric" min={1} max={pomo ? 120 : 240} step={1}
            value={minutes} onChange={e => setMinutes(Number(e.target.value))} />분</span></label>
          {pomo && <>
            <label>짧은 휴식<span><input type="number" inputMode="numeric" min={1} max={60} step={1} value={breakMinutes}
              onChange={e => setBreakMinutes(Number(e.target.value))} />분</span></label>
            <label>긴 휴식<span><input type="number" inputMode="numeric" min={1} max={60} step={1} value={longMinutes}
              onChange={e => setLongMinutes(Number(e.target.value))} />분</span></label>
            <label>집중 회차<span><input type="number" inputMode="numeric" min={1} max={8} step={1} value={cycles}
              onChange={e => setCycles(Number(e.target.value))} />회</span></label>
          </>}
        </div>
        {!valid && <p className="focus-validation">공부는 1~{pomo ? 120 : 240}분, 휴식은 1~60분, 회차는 1~8회로 입력해주세요.</p>}
      </fieldset>
      <div className="focus-phase-label" role="status">{label}{pomo && ` · ${view?.cycle ?? 1}/${session?.cycles ?? cycles}회`}</div>
      {pomo && <div className="focus-cycle-dots" aria-hidden="true">
        {Array.from({ length: Math.max(1, Math.min(8, session?.cycles ?? cycles)) }, (_, i) => <i key={i}
          className={i < (view?.kind === "work" ? (view?.cycle ?? 1) - 1 : view?.cycle ?? 0) ? "is-done" : i === (view?.cycle ?? 1) - 1 ? "is-current" : ""} />)}
      </div>}
      <div className={"study-ring-wrap" + (glowing ? " study-ring-blink" : "")}>
        <svg viewBox="0 0 300 300" className="study-ring" aria-hidden="true">
          <circle cx="150" cy="150" r="126" className="study-ring-track" />
          <circle cx="150" cy="150" r="126" className="study-ring-progress" style={{
            stroke: complete ? "var(--study-red)" : "var(--study-teal)",
            strokeDasharray: CIRCUMFERENCE, strokeDashoffset: CIRCUMFERENCE * (1 - progress),
          }} />
        </svg>
        <div className="study-ring-center"><div className={"study-main-time" + (complete ? " is-over" : "")}>
          {formatStudyCountdown(Number.isFinite(remaining) ? remaining : 0)}
        </div></div>
      </div>
      <div className="focus-actions">
        <button type="button" className="study-btn study-start" disabled={disabled || (!locked && !valid)}
          onClick={() => void commit(locked ? { type: "toggleFocus" } : {
            type: "startFocus", kind: pomo ? "pomodoro" : "focus", workMs: minutes * 60_000,
            breakMs: breakMinutes * 60_000, longBreakMs: longMinutes * 60_000, cycles,
          })}>{session?.status === "running" ? "일시정지" : session?.status === "paused" ? "이어서 시작" : complete ? "다시 시작" : "시작"}</button>
        {pomo && session && !complete && view && <button type="button" className="study-btn study-reset" disabled={disabled}
          onClick={() => void commit({ type: "finishFocusPhase", phaseIndex: (view.cycle - 1) * 2 + (view.kind === "work" ? 0 : 1) })}>
          {view.kind === "work" ? "이번 회차 마치기" : "휴식 건너뛰기"}
        </button>}
        <button type="button" className="study-btn study-reset" disabled={disabled || !session || (complete && session.startedAt === null)}
          onClick={() => void commit({ type: "endFocus" })}>{complete ? "완료 확인" : pomo ? "전체 종료" : "종료"}</button>
      </div>
      <p className="focus-help">{pomo ? `공부와 휴식이 자동 전환됩니다. 회차를 일찍 마치면 휴식 대기 상태가 되고, 휴식을 건너뛰면 다음 공부로 이어집니다. ${cycles}회 집중 후 긴 휴식을 마치면 멈춥니다.`
        : "일찍 종료해도 실제 공부한 시간만 누적됩니다."}<br />일시정지와 휴식 시간은 순공부시간에 포함되지 않습니다.</p>
    </section>
  );
}
