create table score_change_log (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  match_id uuid references matches(id) on delete cascade,
  actor_role text not null,
  actor_id uuid,
  action text not null,
  before_values jsonb,
  after_values jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index score_change_log_match_created_idx
  on score_change_log (match_id, created_at desc);

create or replace function log_match_score_change()
returns trigger as $$
begin
  if row(
    old.status,
    old.home_games_won,
    old.away_games_won,
    old.home_total_score,
    old.away_total_score,
    old.home_match_points,
    old.away_match_points,
    old.notes
  ) is distinct from row(
    new.status,
    new.home_games_won,
    new.away_games_won,
    new.home_total_score,
    new.away_total_score,
    new.home_match_points,
    new.away_match_points,
    new.notes
  ) then
    insert into score_change_log (
      season_id,
      match_id,
      actor_role,
      actor_id,
      action,
      before_values,
      after_values,
      metadata
    )
    values (
      new.season_id,
      new.id,
      coalesce(new.updated_by_role, 'system'),
      new.updated_by_id,
      'match_scores_updated',
      jsonb_build_object(
        'status', old.status,
        'home_games_won', old.home_games_won,
        'away_games_won', old.away_games_won,
        'home_total_score', old.home_total_score,
        'away_total_score', old.away_total_score,
        'home_match_points', old.home_match_points,
        'away_match_points', old.away_match_points,
        'notes', old.notes
      ),
      jsonb_build_object(
        'status', new.status,
        'home_games_won', new.home_games_won,
        'away_games_won', new.away_games_won,
        'home_total_score', new.home_total_score,
        'away_total_score', new.away_total_score,
        'home_match_points', new.home_match_points,
        'away_match_points', new.away_match_points,
        'notes', new.notes
      ),
      jsonb_build_object('source', 'matches_update_trigger')
    );
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists log_match_score_change_trigger on matches;

create trigger log_match_score_change_trigger
after update on matches
for each row execute function log_match_score_change();

create or replace function log_submission_score_change()
returns trigger as $$
begin
  insert into score_change_log (
    season_id,
    match_id,
    actor_role,
    actor_id,
    action,
    before_values,
    after_values,
    metadata
  )
  values (
    new.season_id,
    new.match_id,
    'captain',
    new.submitted_by_team_id,
    'submission_recorded',
    null,
    jsonb_build_object(
      'game1_home_score', new.game1_home_score,
      'game1_away_score', new.game1_away_score,
      'game2_home_score', new.game2_home_score,
      'game2_away_score', new.game2_away_score,
      'home_total_score', new.home_total_score,
      'away_total_score', new.away_total_score,
      'home_games_won', new.home_games_won,
      'away_games_won', new.away_games_won,
      'notes', new.notes,
      'status', new.status
    ),
    jsonb_build_object('submission_id', new.id)
  );

  return new;
end;
$$ language plpgsql;

drop trigger if exists log_submission_score_change_trigger on match_submissions;

create trigger log_submission_score_change_trigger
after insert on match_submissions
for each row execute function log_submission_score_change();
