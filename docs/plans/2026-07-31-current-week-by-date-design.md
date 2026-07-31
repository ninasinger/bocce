# Default "Current Week" to Today's Calendar Week

## Problem

When a captain opens the "My matches" page to submit scores, the week
dropdown auto-selects the first week that still has any open matches.
If Week 3 has an unsubmitted match but today is during Week 5, the
dropdown lands on Week 3 instead of the week actually being played.
The commissioner dashboard has the same behavior.

## Change

Replace the status-based auto-selection in `src/lib/week.ts` with a
calendar-based one: return the `week_number` whose earliest scheduled
match date is closest to today by absolute time distance.

## Algorithm

1. Group matches by `week_number` and take each week's earliest
   `scheduled_datetime`.
2. Return the `week_number` whose date has the smallest absolute
   distance from `Date.now()`.
3. If no matches have scheduled dates, fall back to the lowest
   `week_number` present (or `1` if there are none).

## Expected behavior

Assuming Tuesday-night play:

- Tuesday of Week 5 → Week 5 (0-day distance).
- Wednesday after Week 5 → Week 5 (1 day back beats 6 days forward).
- Sunday between Week 5 and Week 6 → Week 6 (2 days forward beats 5
  days back).

## Affected callers

Both callers of `getCurrentWeek()` adopt the new behavior:

- `src/app/captain/matches/page.tsx` — captain scoring entry.
- `src/app/commissioner/page.tsx` — commissioner dashboard.

## Non-goals

- No UI changes; only the default week selection changes.
- No new function or config toggle — one shared behavior.
