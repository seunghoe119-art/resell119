# Study timer cloud persistence

This personal site has no Supabase Auth login. Like WorkLogPage, StudyTimerPage
uses the existing `work_logs` table's shared access. No new table, credentials or
RLS changes are required. This is a shared personal timer, not separate user accounts.

The timer owns exactly one row:

- `author = __study_timer_v3__`
- `log_date = study-timer-state`
- `free_memo` contains a versioned JSON snapshot with `model`, `study_date`,
  `pass_count`, `pure_study_ms` and `saved_at`.

The complete model includes accumulated completed time, the current problem's
start/pause anchors and credited elapsed time. Other browsers restore this model
and calculate eligible live time from the anchors even if the original browser is
closed. `pure_study_ms` is the eligible total at save time; use the model to derive
the live value. It never includes flashing overtime. State changes are written
immediately; there is no write on each clock tick.

On the very first load only, an absent cloud row is initialized from the existing
browser backup. Open the browser with the existing study records first to migrate
those records. Subsequent loads always use cloud state, including RESET to zero.
Local storage remains a backup, never a MAX merge that double-counts pending time.

Each action reads the latest cloud state and uses compare-and-swap on `free_memo`.
Concurrent changes retry instead of overwriting newer data. Polling every five
seconds and focus/online events refresh other open browsers without writing.
Read failures never trigger empty upserts; failed actions report a visible error
and are not reported as saved. Controls wait for the initial cloud load.

The former `study_timer_daily` SQL file is for an Auth-based design and is not
used by this implementation. Existing work diary records are untouched.

Verification: `node --test client/src/lib/studyTimer.test.ts client/src/lib/studyTimerSync.test.ts client/src/lib/studyTimerStore.test.ts`
(Node 24), or `npx tsx --test client/src/lib/studyTimer.test.ts client/src/lib/studyTimerSync.test.ts client/src/lib/studyTimerStore.test.ts`.

Deployment still requires working `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` values for the Supabase project that contains `work_logs`.
If the configured project is paused/deleted, restore it or update both values and
redeploy. Application code cannot revive a nonexistent Supabase endpoint.
