-- Clear all scoring data while keeping seasons, teams, and match schedule rows.
-- Safe to run multiple times.

begin;

-- Remove captain submissions and commissioner corrections.
delete from match_submissions;
delete from match_corrections;

-- If score_change_log exists (migration 0009), clear it too.
do $$
begin
  if to_regclass('public.score_change_log') is not null then
    execute 'delete from score_change_log';
  end if;
end $$;

-- Remove match-related audit events.
delete from audit_log where entity_type = 'match';

-- Reset all matches back to uns cored scheduled state.
update matches
set
  status = 'scheduled',
  home_games_won = null,
  away_games_won = null,
  home_total_score = null,
  away_total_score = null,
  home_match_points = null,
  away_match_points = null,
  updated_by_role = null,
  updated_by_id = null,
  updated_at = now();

commit;
