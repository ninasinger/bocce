-- Generated from Bocce_Schedule_2026.csv
-- Team code for every team is 1234

do $$
declare
  v_season_id uuid;
begin
  insert into seasons (name, year, start_date, end_date, timezone, game_target_points, games_per_match, commissioner_code_hash, commissioner_email)
  values ('Bocce League 2026', 2026, '2026-05-07', '2026-10-29', 'America/New_York', 16, 2, '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null)
  on conflict do nothing;

  select id into v_season_id from seasons where year = 2026 order by created_at desc limit 1;

  delete from matches where season_id = v_season_id;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Bocce babes', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Bocce Bella''s', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Bocce mamas', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Cannoli hope', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'D''Bocceri', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Dolls with balls', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Donne Dolci', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Donne Vera', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'LA BOCCE VITA', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Let''s Roll', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Limoncello sorellas', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Movin balls', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'New team', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Quattro amici', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Viva la bocce', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Wonder women', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    0,
    '2026-05-07 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    0,
    '2026-05-07 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    0,
    '2026-05-07 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    0,
    '2026-05-07 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    0,
    '2026-05-07 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    0,
    '2026-05-07 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-12 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-12 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-12 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-12 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-12 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-14 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-14 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-14 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-14 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-14 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    '2026-05-14 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    '2026-05-21 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    '2026-05-21 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    '2026-05-21 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    '2026-05-21 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    '2026-05-21 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    '2026-05-21 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-26 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-26 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-26 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-26 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-26 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'New team'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    '2026-05-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    '2026-06-04 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    '2026-06-04 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    '2026-06-04 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    '2026-06-04 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    '2026-06-04 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    '2026-06-04 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    '2026-06-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    '2026-06-18 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    '2026-06-18 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    '2026-06-18 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    '2026-06-18 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    '2026-06-18 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    '2026-06-18 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-25 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-25 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-25 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-25 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-25 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    '2026-06-25 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-06-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-06-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-06-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-06-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-06-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-07-02 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-07-02 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-07-02 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-07-02 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-07-02 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    '2026-07-02 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    '2026-07-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    '2026-07-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    '2026-07-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    '2026-07-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    '2026-07-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    '2026-07-09 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    '2026-07-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    '2026-07-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    '2026-07-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    '2026-07-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    '2026-07-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    '2026-07-23 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-28 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    '2026-07-30 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    '2026-08-06 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    '2026-08-06 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    '2026-08-06 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    '2026-08-06 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    '2026-08-06 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    '2026-08-06 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli hope'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Viva la bocce'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce babes'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Vera'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-11 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'New team'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-13 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Limoncello sorellas'),
    (select id from teams where season_id = v_season_id and name = 'LA BOCCE VITA'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-13 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce Bella''s'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-13 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Bocce mamas'),
    (select id from teams where season_id = v_season_id and name = 'Wonder women'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-13 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Dolls with balls'),
    (select id from teams where season_id = v_season_id and name = 'Movin balls'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    '2026-08-13 18:30:00',
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Quattro amici'),
    'scheduled',
    'Court 5'
  );

  -- Weeks should start at 1.
  update matches
  set week_number = week_number + 1
  where season_id = v_season_id;

  -- Normalize team name casing, e.g. "bocce bellas" -> "Bocce Bellas".
  update teams
  set name = initcap(lower(name))
  where season_id = v_season_id;

end $$;
