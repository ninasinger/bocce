-- Results confirmed November 5, 2026 as Weeks 5 and 6.
-- Week 6 Ball Busters / Boccelism totals are tied 18–18: split the bonus.
do $$
declare
  season uuid;
  result record;
  existing matches%rowtype;
begin
  select id into strict season from seasons where name = 'Co-ed Fall 2026' and year = 2026;

  for result in select * from (values
    (5, 'Boccelism', 'Pauline''s Polinas', 15, 12, 15, 4),
    (5, 'Spice Balls', 'Ball Busters', 14, 11, 14, 4),
    (6, 'Ball Busters', 'Boccelism', 16, 4, 2, 14),
    (6, 'Spice Balls', 'Pauline''s Polinas', 14, 9, 3, 15)
  ) as scores(week, home_name, away_name, g1h, g1a, g2h, g2a)
  loop
    select m.* into strict existing from matches m
      join teams h on h.id = m.home_team_id
      join teams a on a.id = m.away_team_id
      where m.season_id = season and m.week_number = result.week
        and h.name = result.home_name and a.name = result.away_name
      for update of m;

    if existing.status = 'verified'
      and row(existing.game1_home_score, existing.game1_away_score, existing.game2_home_score, existing.game2_away_score)
        = row(result.g1h, result.g1a, result.g2h, result.g2a) then
      continue;
    end if;
    if existing.status <> 'scheduled'
      or existing.game1_home_score is not null or existing.game1_away_score is not null
      or existing.game2_home_score is not null or existing.game2_away_score is not null
      or existing.home_total_score is not null or existing.away_total_score is not null
      or exists (select 1 from match_submissions where match_id = existing.id)
      or exists (select 1 from match_corrections where match_id = existing.id)
      or exists (select 1 from match_score_drafts where match_id = existing.id) then
      raise exception 'Existing scores or submissions for Week % match %; review first', result.week, existing.id;
    end if;

    update matches set
      game1_home_score = result.g1h, game1_away_score = result.g1a,
      game2_home_score = result.g2h, game2_away_score = result.g2a,
      home_games_won = (result.g1h > result.g1a)::int + (result.g2h > result.g2a)::int,
      away_games_won = (result.g1a > result.g1h)::int + (result.g2a > result.g2h)::int,
      home_total_score = result.g1h + result.g2h,
      away_total_score = result.g1a + result.g2a,
      home_match_points = (result.g1h > result.g1a)::int + (result.g2h > result.g2a)::int
        + (result.g1h + result.g2h > result.g1a + result.g2a)::int
        + case when result.g1h + result.g2h = result.g1a + result.g2a
          and (result.g1h > result.g1a) <> (result.g2h > result.g2a) then 0.5 else 0 end,
      away_match_points = (result.g1a > result.g1h)::int + (result.g2a > result.g2h)::int
        + (result.g1a + result.g2a > result.g1h + result.g2h)::int
        + case when result.g1h + result.g2h = result.g1a + result.g2a
          and (result.g1h > result.g1a) <> (result.g2h > result.g2a) then 0.5 else 0 end,
      status = 'verified', updated_by_role = 'commissioner', updated_by_id = null
      where id = existing.id;
  end loop;
end $$;
