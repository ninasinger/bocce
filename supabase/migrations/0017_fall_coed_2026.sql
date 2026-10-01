-- Fall Co-ed 2026: store game-by-game scores on matches, rename the summer
-- league, and add the Fall Co-ed season with its Week 1 results (Sep 30).
-- Seasons are looked up by name, not year: 2026 now has two leagues.

alter table matches
  add column if not exists game1_home_score int,
  add column if not exists game1_away_score int,
  add column if not exists game2_home_score int,
  add column if not exists game2_away_score int;

-- Two duplicate summer rows exist; rename both so the season list still
-- collapses them into one entry.
update seasons
set name = 'Women''s Summer 2026'
where name = 'Bocce League 2026' and year = 2026;

do $$
declare
  -- Not a bcrypt hash, so no team code can match: Fall Co-ed has no score entry.
  v_no_login constant text := 'no-score-entry';
  v_commissioner_hash text;
  v_season_id uuid;
  v_polinas uuid;
  v_spice_balls uuid;
  v_boccelism uuid;
  v_ball_busters uuid;
begin
  if exists (select 1 from seasons where name = 'Fall Co-ed 2026' and year = 2026) then
    raise notice 'Fall Co-ed 2026 already exists; skipping.';
    return;
  end if;

  select commissioner_code_hash into v_commissioner_hash
  from seasons
  where name = 'Women''s Summer 2026' and year = 2026
  order by created_at desc
  limit 1;

  if v_commissioner_hash is null then
    raise exception 'Women''s Summer 2026 season not found';
  end if;

  insert into seasons (name, year, start_date, timezone, game_target_points, games_per_match, commissioner_code_hash)
  values ('Fall Co-ed 2026', 2026, '2026-09-30', 'America/New_York', 16, 2, v_commissioner_hash)
  returning id into v_season_id;

  insert into teams (season_id, name, team_code_hash)
  values (v_season_id, 'Pauline''s Polinas', v_no_login)
  returning id into v_polinas;

  insert into teams (season_id, name, team_code_hash)
  values (v_season_id, 'Spice Balls', v_no_login)
  returning id into v_spice_balls;

  insert into teams (season_id, name, team_code_hash)
  values (v_season_id, 'Boccelism', v_no_login)
  returning id into v_boccelism;

  insert into teams (season_id, name, team_code_hash)
  values (v_season_id, 'Ball Busters', v_no_login)
  returning id into v_ball_busters;

  -- Week 1. Points: 1 per game won plus 1 for the higher total.
  insert into matches (
    season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status,
    game1_home_score, game1_away_score, game2_home_score, game2_away_score,
    home_games_won, away_games_won, home_total_score, away_total_score,
    home_match_points, away_match_points, notes, updated_by_role
  )
  values
    (
      v_season_id, 1, '2026-09-30 18:30 America/New_York', v_polinas, v_ball_busters, 'verified',
      14, 6, 15, 6,
      2, 0, 29, 12,
      3, 0, 'Court 2', 'commissioner'
    ),
    (
      v_season_id, 1, '2026-09-30 18:30 America/New_York', v_spice_balls, v_boccelism, 'verified',
      10, 14, 10, 14,
      0, 2, 20, 28,
      0, 3, 'Court 4', 'commissioner'
    );
end $$;
