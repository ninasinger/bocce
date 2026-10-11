-- Keep six regular-season weeks (each opponent twice), then one placement
-- matchup per team on November 11. Balance regular-season use of Courts 2–5.
do $$
declare
  season uuid;
  before_matches jsonb;
begin
  select id into strict season from seasons where name = 'Co-ed Fall 2026' and year = 2026;

  -- Already applied: do not change later scores or assigned finalists.
  if (select count(*) from matches where season_id = season and week_number = 7) = 2
    and exists (select 1 from matches where season_id = season and week_number = 7
      and notes = 'Playoffs: Championship (1st / 2nd) | Seed 1 vs Seed 2 | Court 3')
    and exists (select 1 from matches where season_id = season and week_number = 7
      and notes = 'Playoffs: Third-place game (3rd / 4th) | Seed 3 vs Seed 4 | Court 5') then
    return;
  end if;

  if (select count(*) from matches where season_id = season and week_number in (4,5)) <> 4
    or (select count(*) from matches where season_id = season and week_number = 7
      and notes like 'Playoffs:%') <> 4 then
    raise exception 'Unexpected Fall schedule; review before changing';
  end if;
  if exists (select 1 from matches m where m.season_id = season and m.week_number in (4,5,7)
    and (m.status <> 'scheduled' or m.home_total_score is not null or m.away_total_score is not null
      or m.game1_home_score is not null or m.game1_away_score is not null
      or m.game2_home_score is not null or m.game2_away_score is not null
      or exists (select 1 from match_submissions where match_id = m.id)
      or exists (select 1 from match_score_drafts where match_id = m.id)
      or exists (select 1 from match_corrections where match_id = m.id))) then
    raise exception 'A match has scores or submissions; review before changing';
  end if;

  select jsonb_agg(to_jsonb(m)) into before_matches
    from matches m where season_id = season and week_number in (4,5,7);
  insert into audit_log (actor_role, action, entity_type, entity_id, details)
    values ('commissioner', 'schedule_restructured', 'season', season,
      jsonb_build_object('reason', 'One placement matchup per team on November 11; balance courts; preserve double round robin',
        'previous_matches', before_matches));

  update matches m set notes = case
    when week_number = 4 and exists (select 1 from teams t where t.id = m.home_team_id and t.name = 'Ball Busters') then 'Court 4'
    when week_number = 4 then 'Court 2'
    when week_number = 5 and exists (select 1 from teams t where t.id = m.home_team_id and t.name = 'Boccelism') then 'Court 3'
    when week_number = 5 then 'Court 5'
  end, updated_by_role = 'commissioner'
  where season_id = season and week_number in (4,5);

  delete from matches where season_id = season and week_number = 7 and notes like 'Playoffs: Semifinal%';
  update matches set
    notes = case when notes like 'Playoffs: Championship%'
      then 'Playoffs: Championship (1st / 2nd) | Seed 1 vs Seed 2 | Court 3'
      else 'Playoffs: Third-place game (3rd / 4th) | Seed 3 vs Seed 4 | Court 5' end,
    scheduled_datetime = '2026-11-11 18:30 America/New_York',
    updated_by_role = 'commissioner'
  where season_id = season and week_number = 7;
end $$;
