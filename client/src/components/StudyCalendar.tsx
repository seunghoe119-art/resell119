import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { currentDayStudyTotal, type StudyTimerModel } from "@/lib/studyTimer";
import { STUDY_SYNC_ID, STUDY_SYNC_TABLE } from "@/lib/studyTimerSync";
import { adjacentMonth, calendarDates, formatStudyDuration, snapshotStudyDate, snapshotStudyDayTotal } from "@/lib/studyTimerHistory";
import "./StudyCalendar.css";

export default function StudyCalendar({ model, clock }: { model: StudyTimerModel; clock: number }) {
  const [month, setMonth] = useState(() => model.date.slice(0, 7));
  const [selected, setSelected] = useState(model.date);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    const controller = new AbortController();
    const load = async (initial = false) => {
      if (inFlight) return;
      inFlight = true;
      if (initial) setStatus("loading");
      try {
        const { data, error } = await supabase.from(STUDY_SYNC_TABLE).select("snapshot")
          .like("id", `${STUDY_SYNC_ID}:day:${month}-%`).abortSignal(controller.signal);
        if (error) throw error;
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const row of data ?? []) next[snapshotStudyDate(row.snapshot)] = row.snapshot;
        setRecords(next);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      } finally { inFlight = false; }
    };
    void load(true);
    const interval = window.setInterval(() => void load(), 5000);
    return () => { cancelled = true; window.clearInterval(interval); controller.abort(); };
  }, [month, retry]);

  const total = selected === model.date ? currentDayStudyTotal(model, clock)
    : records[selected] ? snapshotStudyDayTotal(records[selected], clock) : 0;
  const chooseMonth = (delta: number) => {
    const next = adjacentMonth(month, delta);
    setMonth(next);
    setSelected(next === model.date.slice(0, 7) ? model.date : next + "-01");
  };

  return (
    <section className="study-calendar" aria-label="날짜별 공부 기록">
      <h2><CalendarDays size={17} aria-hidden="true" />공부 기록 달력</h2>
      <div className="study-calendar-month">
        <button type="button" aria-label="이전 달" onClick={() => chooseMonth(-1)}><ChevronLeft size={18} /></button>
        <strong>{Number(month.slice(0, 4))}년 {Number(month.slice(5))}월</strong>
        <button type="button" aria-label="다음 달" disabled={month >= model.date.slice(0, 7)} onClick={() => chooseMonth(1)}><ChevronRight size={18} /></button>
      </div>
      <div className="study-calendar-grid">
        {["일", "월", "화", "수", "목", "금", "토"].map(day => <span className="study-calendar-weekday" key={day}>{day}</span>)}
        {calendarDates(month).map((date, i) => date ? (
          <button type="button" key={date} disabled={date > model.date}
            aria-label={`${date} 공부 기록`} aria-pressed={selected === date}
            aria-current={date === model.date ? "date" : undefined}
            className={(selected === date ? "is-selected " : "") + (date === model.date ? "is-today" : "")}
            onClick={() => setSelected(date)}>
            {Number(date.slice(8))}
            {(date === model.date ? currentDayStudyTotal(model, clock) > 0
              : records[date] && snapshotStudyDayTotal(records[date], clock) > 0) && <i aria-hidden="true" />}
          </button>
        ) : <span key={`blank-${i}`} aria-hidden="true" />)}
      </div>
      <div className="study-calendar-result" aria-live={selected === model.date ? "off" : "polite"}>
        <span>{Number(selected.slice(5, 7))}월 {Number(selected.slice(8))}일 총 공부시간</span>
        {selected !== model.date && status === "loading" ? <p>기록 불러오는 중…</p>
          : selected !== model.date && status === "error" ? <p>기록을 불러오지 못했습니다.</p>
          : <><strong>{formatStudyDuration(total)}</strong>
            {selected !== model.date && !records[selected] && <small>저장된 기록이 없습니다.</small>}</>}
        {status === "error" && <button type="button" onClick={() => setRetry(n => n + 1)}>다시 불러오기</button>}
      </div>
      <p className="study-calendar-note">하루 기준: 새벽 03:00 ~ 다음 날 02:59<br />오늘은 진행 중인 인정 시간도 포함합니다.</p>
    </section>
  );
}
