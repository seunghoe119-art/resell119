-- sjmemo: dedicated shared personal timer. No changes to existing application tables.
create table if not exists public.study_timer_state (
  id text primary key default 'personal' check (length(id) between 1 and 100),
  snapshot text not null check (octet_length(snapshot) <= 20000),
  model jsonb generated always as (snapshot::jsonb -> 'model') stored,
  study_date text generated always as (snapshot::jsonb ->> 'study_date') stored,
  pass_count bigint generated always as ((snapshot::jsonb ->> 'pass_count')::bigint) stored,
  pure_study_ms bigint generated always as ((snapshot::jsonb ->> 'pure_study_ms')::bigint) stored,
  study_status text generated always as (snapshot::jsonb #>> '{model,studyStatus}') stored,
  study_started_at_ms bigint generated always as ((snapshot::jsonb #>> '{model,studyStartedAt}')::bigint) stored,
  updated_at timestamptz not null default now(),
  constraint study_timer_snapshot_valid check (
    (snapshot::jsonb ->> 'version') = '1'
    and jsonb_typeof(snapshot::jsonb -> 'model') = 'object'
    and (snapshot::jsonb ->> 'pass_count')::bigint >= 0
    and (snapshot::jsonb ->> 'pure_study_ms')::bigint >= 0
  )
);
comment on table public.study_timer_state is 'Shared personal-site timer; full anchors survive browser closure. Contains timer statistics only.';
comment on column public.study_timer_state.pure_study_ms is 'Eligible daily time at save; model anchors derive live pending time, capped at 60000 ms per question.';
alter table public.study_timer_state enable row level security;
grant select, insert, update on public.study_timer_state to anon, authenticated;
create policy study_timer_state_read on public.study_timer_state for select to anon, authenticated using (true);
create policy study_timer_state_insert on public.study_timer_state for insert to anon, authenticated with check (true);
create policy study_timer_state_update on public.study_timer_state for update to anon, authenticated using (true) with check (true);
notify pgrst, 'reload schema';
