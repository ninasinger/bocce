# Fall Co-ed 2026 League Tab

## Goal

Bring the site back from the off-season banner with a new Fall Co-ed
2026 league as the default view. The finished Women's Summer 2026
league stays available as a second tab. Fall Co-ed has a schedule and
standings but no score entry: results come in by email and are loaded
directly into the database.

## Data (`supabase/migrations/0017_fall_coed_2026.sql`)

- Add nullable per-game score columns to `matches`:
  `game1_home_score`, `game1_away_score`, `game2_home_score`,
  `game2_away_score`. Totals, games won and match points stay where
  they are; the game columns record how those totals were reached.
- Rename the existing season `Bocce League 2026` to
  `Women's Summer 2026`.
- Create season `Fall Co-ed 2026` (year 2026, starts 2026-09-30,
  America/New_York, 2 games per match, same commissioner code as
  summer).
- Teams: Pauline's Polinas, Spice Balls, Boccelism, Ball Busters.
  A fifth team exists but has not played; it is added once named.
  Team codes are set to a non-bcrypt value so no captain can log in
  and submit Fall scores.
- Week 1, Wednesday 2026-09-30 6:30 PM ET, both matches `verified`:

  | Court | Home              | Away         | Game 1 | Game 2 | Total | Games | Points |
  |-------|-------------------|--------------|--------|--------|-------|-------|--------|
  | 2     | Pauline's Polinas | Ball Busters | 14-6   | 15-6   | 29-12 | 2-0   | 3-0    |
  | 4     | Spice Balls       | Boccelism    | 10-14  | 10-14  | 20-28 | 0-2   | 0-3    |

  Points follow the existing rule: 1 per game won plus 1 for the
  higher total.
- The migration looks seasons up by name, never by `year = 2026`,
  because two 2026 seasons now exist.

## League tabs

- `src/lib/seasonSelection.ts`: pure `pickSeasonId(seasonIds,
  requested, remembered)` — the requested id if valid, else the
  remembered id if valid, else the first season (newest, so Fall).
- `src/lib/useSelectedSeason.ts`: client hook that loads
  `/api/seasons`, picks the season from the `?season=` URL param or
  the session-remembered choice, and on change updates both.
- `src/components/LeagueTabs.tsx`: two-tab segmented control that
  replaces the season dropdown on Schedule and Standings.
- Switching leagues on Schedule clears the `?week=` param so the new
  league opens on its own current week.

## Schedule card

`/api/seasons/[id]/schedule-page` returns the game columns. Finished
matches that have them show `Game 1: 14-6 · Game 2: 15-6` under the
existing Final line. Summer matches have no game columns and are
unchanged.

## Nav and banner

- `OFF_SEASON = false` in `src/app/layout.tsx`.
- Remove Score Entry and Commissioner from `DesktopNav` and
  `BottomNav`. The routes still work by URL.
- Bump the service worker cache name.
- Documents is unchanged (summer PDFs).

## Testing

- Unit tests for `pickSeasonId` (TDD).
- `npm test` and `npm run build`.
- Browser check of both tabs at phone and desktop widths, after the
  migration is pushed with `supabase db push`.
