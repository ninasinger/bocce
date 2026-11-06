-- Final regular-season standings verified November 5: Boccelism 12.5,
-- Spice Balls 12, Pauline's Polinas 7, Ball Busters 4.5 league points.
do $$
declare
  season uuid;
  slot record;
  existing matches%rowtype;
  home_id uuid;
  away_id uuid;
begin
  select id into strict season from seasons where name = 'Co-ed Fall 2026' and year = 2026;
  if (select count(*) from matches where season_id = season and week_number <= 6
    and status in ('verified', 'corrected')) <> 12 then
    raise exception 'Regular season must be complete before assigning placement games';
  end if;
  for slot in select * from (values
    ('Playoffs: Championship (1st / 2nd) | Seed 1 vs Seed 2 | Court 3', 'Boccelism', 'Spice Balls'),
    ('Playoffs: Third-place game (3rd / 4th) | Seed 3 vs Seed 4 | Court 5', 'Pauline''s Polinas', 'Ball Busters')
  ) as slots(note, home_name, away_name)
  loop
    select id into strict home_id from teams where season_id = season and name = slot.home_name;
    select id into strict away_id from teams where season_id = season and name = slot.away_name;
    select * into strict existing from matches where season_id = season
      and week_number = 7 and notes = slot.note for update;
    if existing.home_team_id = home_id and existing.away_team_id = away_id then continue; end if;
    if existing.status <> 'scheduled' or existing.home_team_id is not null or existing.away_team_id is not null
      or existing.home_total_score is not null or existing.away_total_score is not null
      or exists (select 1 from match_submissions where match_id = existing.id)
      or exists (select 1 from match_corrections where match_id = existing.id)
      or exists (select 1 from match_score_drafts where match_id = existing.id) then
      raise exception 'Placement match already assigned or scored; review first';
    end if;
    insert into audit_log (actor_role, action, entity_type, entity_id, details)
    values ('commissioner', 'placement_teams_assigned', 'match', existing.id,
      jsonb_build_object('previous_match', to_jsonb(existing), 'home_team_id', home_id,
        'away_team_id', away_id, 'reason', 'Final standings after Week 6'));
    update matches set home_team_id = home_id, away_team_id = away_id,
      updated_by_role = 'commissioner', updated_by_id = null where id = existing.id;
  end loop;
end $$;
