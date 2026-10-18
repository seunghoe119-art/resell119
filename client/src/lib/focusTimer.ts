export type StudyMode = "question" | "focus" | "pomodoro";
export interface FocusSession {
  kind: "focus" | "pomodoro";
  status: "running" | "paused" | "finished";
  startedAt: number | null;
  elapsedMs: number;
  workMs: number;
  breakMs: number;
  longBreakMs: number;
  cycles: number;
}
export interface FocusPhase { kind: "work" | "break" | "longBreak"; durationMs: number; cycle: number }

export function focusPhases(session: FocusSession): FocusPhase[] {
  if (session.kind === "focus") return [{ kind: "work", durationMs: session.workMs, cycle: 1 }];
  return Array.from({ length: session.cycles }, (_, i) => [
    { kind: "work" as const, durationMs: session.workMs, cycle: i + 1 },
    { kind: i === session.cycles - 1 ? "longBreak" as const : "break" as const,
      durationMs: i === session.cycles - 1 ? session.longBreakMs : session.breakMs, cycle: i + 1 },
  ]).flat();
}

export function focusProgramDuration(session: FocusSession): number {
  return focusPhases(session).reduce((sum, phase) => sum + phase.durationMs, 0);
}

export function focusElapsed(session: FocusSession, now: number): number {
  return Math.min(focusProgramDuration(session), session.elapsedMs +
    (session.startedAt === null ? 0 : Math.max(0, now - session.startedAt)));
}

/** Only work intervals count; breaks and any time beyond the finite block do not. */
export function focusWorkBetween(session: FocusSession, from: number, to: number): number {
  let offset = 0;
  let work = 0;
  for (const phase of focusPhases(session)) {
    const end = offset + phase.durationMs;
    if (phase.kind === "work") work += Math.max(0, Math.min(to, end) - Math.max(from, offset));
    offset = end;
  }
  return work;
}

export function currentDayFocusElapsed(session: FocusSession | null | undefined, now: number, dayStart: number): number {
  if (!session || session.startedAt === null) return 0;
  const from = session.elapsedMs + Math.max(0, dayStart - session.startedAt);
  return focusWorkBetween(session, from, focusElapsed(session, now));
}

export function focusView(session: FocusSession, now: number) {
  const elapsed = focusElapsed(session, now);
  let offset = 0;
  for (const phase of focusPhases(session)) {
    if (elapsed < offset + phase.durationMs) return {
      ...phase, remainingMs: offset + phase.durationMs - elapsed,
      complete: session.status === "finished", paused: session.status === "paused",
    };
    offset += phase.durationMs;
  }
  const phase = focusPhases(session).at(-1)!;
  return { ...phase, remainingMs: 0, complete: true, paused: false };
}

export function restoreFocusSession(value: unknown, now: number): FocusSession | null {
  if (!value || typeof value !== "object") return null;
  const p = value as FocusSession;
  const finite = (v: number, min: number, max: number) => Number.isFinite(v) && v >= min && v <= max;
  if (!["focus", "pomodoro"].includes(p.kind) || !["running", "paused", "finished"].includes(p.status) ||
      !finite(p.workMs, 60_000, 14_400_000) || !finite(p.breakMs, 60_000, 3_600_000) ||
      !finite(p.longBreakMs, 60_000, 3_600_000) || !Number.isInteger(p.cycles) || p.cycles < 1 || p.cycles > 8 ||
      !finite(p.elapsedMs, 0, 172_800_000) ||
      (p.startedAt !== null && !finite(p.startedAt, 0, now)) ||
      (p.status === "running" && p.startedAt === null)) return null;
  return { kind: p.kind, status: p.status, startedAt: p.startedAt, elapsedMs: p.elapsedMs,
    workMs: p.workMs, breakMs: p.breakMs, longBreakMs: p.longBreakMs, cycles: p.cycles };
}
