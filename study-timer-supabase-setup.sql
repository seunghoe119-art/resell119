-- Run in Supabase SQL Editor. Uses the existing Supabase Auth user, not a public writable table.
create table if not exists public.study_timer_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  study_date date not null,
  pass_count integer not null default 0 check (pass_count >= 0),
  pure_study_ms bigint not null default 0 check (pure_study_ms >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, study_date)
);
comment on column public.study_timer_daily.study_date is 'KST study day, 03:00 through next-day 02:59:59';
comment on column public.study_timer_daily.pure_study_ms is 'Credited duration: each question is capped at 60000 ms; flashing overtime excluded';
create index if not exists study_timer_daily_study_date_idx on public.study_timer_daily (study_date desc);
alter table public.study_timer_daily enable row level security;
drop policy if exists study_timer_daily_owner_select on public.study_timer_daily;
drop policy if exists study_timer_daily_owner_insert on public.study_timer_daily;
drop policy if exists study_timer_daily_owner_update on public.study_timer_daily;
drop policy if exists study_timer_daily_owner_delete on public.study_timer_daily;
create policy study_timer_daily_owner_select on public.study_timer_daily for select to authenticated using (auth.uid() = user_id);
create policy study_timer_daily_owner_insert on public.study_timer_daily for insert to authenticated with check (auth.uid() = user_id);
create policy study_timer_daily_owner_update on public.study_timer_daily for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy study_timer_daily_owner_delete on public.study_timer_daily for delete to authenticated using (auth.uid() = user_id);
