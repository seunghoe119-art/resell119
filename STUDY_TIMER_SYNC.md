# Study timer cloud persistence

The owner selected the sjmemo project (`rebjcoazabhkcobjjzkj`). The public browser
configuration falls back to this project when no environment is supplied or when
the old deleted project (`lgyfgdbbkzchwvmelftw`) is still configured in deployment.
The checked-in key is a browser publishable key, not a service-role or secret key.

## Schema

`study-timer-shared-setup.sql` creates the dedicated `study_timer_state` table.
The application uses `id=personal`. Other existing application tables are untouched.
This is a shared personal-site timer and contains timing statistics only.

- `snapshot`: exact versioned serialized model used for conditional updates
- `model`: generated JSON with complete running/paused/rest anchors
- `study_date`: generated KST study date (03:00 day boundary)
- `pass_count`: generated completed question count
- `pure_study_ms`: generated eligible daily total at the last state change
- `study_status`, `study_started_at_ms`: generated current problem status/start time
- `updated_at`: last state change timestamp

Live pending time is derived from the saved anchors, capped at 60 seconds per
problem. A closed/sleeping laptop does not need to execute a background timer or
write every second: another browser restores the anchors and calculates the
eligible total. `pure_study_ms` itself is a save-time snapshot, not a ticking DB counter.

START/PAUSE/RESUME/PASS/RESET and rest actions save immediately. Each action reads
current cloud state and compares the exact previous snapshot before writing.
Concurrent changes retry instead of overwriting newer records. Read failures do
not upsert zero; errors are visible and unsaved actions are not reported as saved.
Other visible tabs refresh every five seconds and on focus/online.

Only the first successful initialization imports the original browser backup when
the `personal` row is absent. Open the browser with existing records first after
deployment. Later reads always restore cloud state, including a RESET to zero.

## Verification

`node --test client/src/lib/studyTimer.test.ts client/src/lib/studyTimerSync.test.ts client/src/lib/studyTimerStore.test.ts`

Node 24 is sufficient; Node 20 can use `npx tsx --test` with the same files.
The opt-in `scripts/verify-study-timer-cloud.ts` uses independent Supabase clients
against the real project and the isolated `verification` row; it never changes
`personal` or any work diary records. Supply `STUDY_SUPABASE_URL` and
`STUDY_SUPABASE_KEY`, then run with Node 24. The verification row is left idle/zero.
