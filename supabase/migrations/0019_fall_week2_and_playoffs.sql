-- Fred's Week 2 results; four teams for five more weeks, ending in playoffs.
-- Weeks 1–6 are a double round robin. Week 7 seeds use Week 6 standings.
do $$
declare
  season uuid;
  polinas uuid;
  spice uuid;
  boccelism uuid;
  ballbusters uuid;
  row record;
begin
  select id into strict season from seasons where name = 'Co-ed Fall 2026' and year = 2026;
  select id into strict polinas from teams where season_id = season and name = 'Pauline''s Polinas';
  select id into strict spice from teams where season_id = season and name = 'Spice Balls';
  select id into strict boccelism from teams where season_id = season and name = 'Boccelism';
  select id into strict ballbusters from teams where season_id = season and name = 'Ball Busters';
  if (select count(*) from teams where season_id = season) <> 4 then
    raise exception 'Expected exactly four Fall teams';
  end if;

  for row in select * from (values
    (2, '2026-10-07 18:30 America/New_York'::timestamptz, polinas, boccelism, 'Court 5', 14, 11, 5, 14),
    (2, '2026-10-07 18:30 America/New_York'::timestamptz, ballbusters, spice, 'Court 3', 14, 9, 1, 14),
    (3, '2026-10-14 18:30 America/New_York'::timestamptz, polinas, spice, 'Court 2', null, null, null, null),
    (3, '2026-10-14 18:30 America/New_York'::timestamptz, boccelism, ballbusters, 'Court 4', null, null, null, null),
    (4, '2026-10-21 18:30 America/New_York'::timestamptz, ballbusters, polinas, 'Court 5', null, null, null, null),
    (4, '2026-10-21 18:30 America/New_York'::timestamptz, boccelism, spice, 'Court 3', null, null, null, null),
    (5, '2026-10-28 18:30 America/New_York'::timestamptz, boccelism, polinas, 'Court 2', null, null, null, null),
    (5, '2026-10-28 18:30 America/New_York'::timestamptz, spice, ballbusters, 'Court 4', null, null, null, null),
    (6, '2026-11-04 18:30 America/New_York'::timestamptz, spice, polinas, 'Court 5', null, null, null, null),
    (6, '2026-11-04 18:30 America/New_York'::timestamptz, ballbusters, boccelism, 'Court 3', null, null, null, null),
    (7, '2026-11-11 18:30 America/New_York'::timestamptz, null, null, 'Playoffs: Semifinal 1 | Seed 1 vs Seed 4 | Court 3', null, null, null, null),
    (7, '2026-11-11 18:30 America/New_York'::timestamptz, null, null, 'Playoffs: Semifinal 2 | Seed 2 vs Seed 3 | Court 5', null, null, null, null),
    (7, '2026-11-11 19:45 America/New_York'::timestamptz, null, null, 'Playoffs: Championship | Winner SF1 vs Winner SF2 | Court 3; 7:45 PM estimated, after both semifinals finish', null, null, null, null),
    (7, '2026-11-11 19:45 America/New_York'::timestamptz, null, null, 'Playoffs: Third-place game | Loser SF1 vs Loser SF2 | Court 5; 7:45 PM estimated, after both semifinals finish', null, null, null, null)
  ) as planned(week, at_time, home, away, note, g1h, g1a, g2h, g2a)
  loop
    -- Re-running is safe; unexpected existing matches require review.
    if exists (select 1 from matches where season_id = season and week_number = row.week
      and notes = row.note and scheduled_datetime = row.at_time
      and home_team_id is not distinct from row.home and away_team_id is not distinct from row.away
      and (row.week <> 2 or (game1_home_score = row.g1h and game1_away_score = row.g1a
        and game2_home_score = row.g2h and game2_away_score = row.g2a))) then
      continue;
    end if;
    if exists (select 1 from matches where season_id = season and week_number = row.week
      and ((row.home is not null and (home_team_id in (row.home, row.away) or away_team_id in (row.home, row.away)))
        or (row.home is null and notes = row.note))) then
      raise exception 'Conflicting existing Fall match in week %', row.week;
    end if;
    insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id,
      status, notes, game1_home_score, game1_away_score, game2_home_score, game2_away_score,
      home_games_won, away_games_won, home_total_score, away_total_score,
      home_match_points, away_match_points, updated_by_role)
    values (season, row.week, row.at_time, row.home, row.away,
      case when row.week = 2 then 'verified'::match_status else 'scheduled'::match_status end,
      row.note, row.g1h, row.g1a, row.g2h, row.g2a,
      case when row.week = 2 then 1 end, case when row.week = 2 then 1 end,
      row.g1h + row.g2h, row.g1a + row.g2a,
      case when row.week = 2 then 1 end, case when row.week = 2 then 2 end, 'commissioner');
  end loop;
  update seasons set end_date = '2026-11-11' where id = season;
end $$;
