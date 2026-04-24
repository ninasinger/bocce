-- Generated from Bocce_Schedule_2026.txt
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
  delete from teams where season_id = v_season_id;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Bocce Babes', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Bocce Bellas', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Bocce Mammas', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Roll Models', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Cannoli Hope', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'D''Bocceri', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Dolls With Balls', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Donne Dolci', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Donne Vere', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'La Bocce Vita', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Let''s Roll', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Limoncello Sorellas', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Movin Balls', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Bocce Stars', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Quattro Amici', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Viva La Bocce', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into teams (season_id, name, team_code_hash, captain_name, members)
  values (v_season_id, 'Wonder Women', '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.', null, '[]'::jsonb)
  on conflict (season_id, name) do update set team_code_hash = excluded.team_code_hash;

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    ((date '2026-05-07' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    ((date '2026-05-07' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    ((date '2026-05-07' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    ((date '2026-05-07' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    ((date '2026-05-07' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    1,
    ((date '2026-05-07' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-12' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-12' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-12' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-12' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-12' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-12' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-14' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-14' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-14' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-14' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-14' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    2,
    ((date '2026-05-14' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    ((date '2026-05-21' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    ((date '2026-05-21' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    ((date '2026-05-21' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    ((date '2026-05-21' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    ((date '2026-05-21' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    3,
    ((date '2026-05-21' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-26' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-26' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-26' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-26' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-26' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-26' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    4,
    ((date '2026-05-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    ((date '2026-06-04' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    ((date '2026-06-04' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    ((date '2026-06-04' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    ((date '2026-06-04' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    ((date '2026-06-04' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    5,
    ((date '2026-06-04' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    6,
    ((date '2026-06-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    ((date '2026-06-18' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    ((date '2026-06-18' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    ((date '2026-06-18' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    ((date '2026-06-18' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    ((date '2026-06-18' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    7,
    ((date '2026-06-18' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    8,
    ((date '2026-06-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-06-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-06-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-06-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-06-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-06-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-06-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-07-02' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-07-02' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-07-02' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-07-02' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-07-02' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    9,
    ((date '2026-07-02' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    ((date '2026-07-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    ((date '2026-07-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    ((date '2026-07-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    ((date '2026-07-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    ((date '2026-07-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    10,
    ((date '2026-07-09' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    ((date '2026-07-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    ((date '2026-07-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    ((date '2026-07-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    ((date '2026-07-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    ((date '2026-07-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    11,
    ((date '2026-07-23' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-28' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    12,
    ((date '2026-07-30' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    ((date '2026-08-06' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    ((date '2026-08-06' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    ((date '2026-08-06' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    ((date '2026-08-06' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    ((date '2026-08-06' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    13,
    ((date '2026-08-06' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-11' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Stars'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-13' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-13' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-13' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    14,
    ((date '2026-08-13' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    15,
    ((date '2026-08-20' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    15,
    ((date '2026-08-20' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Mammas'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    15,
    ((date '2026-08-20' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'Limoncello Sorellas'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    15,
    ((date '2026-08-20' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    (select id from teams where season_id = v_season_id and name = 'Dolls With Balls'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    15,
    ((date '2026-08-20' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Movin Balls'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    15,
    ((date '2026-08-20' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 6'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    16,
    ((date '2026-08-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'D''Bocceri'),
    (select id from teams where season_id = v_season_id and name = 'Donne Vere'),
    'scheduled',
    'Court 1'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    16,
    ((date '2026-08-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Babes'),
    (select id from teams where season_id = v_season_id and name = 'La Bocce Vita'),
    'scheduled',
    'Court 2'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    16,
    ((date '2026-08-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Wonder Women'),
    (select id from teams where season_id = v_season_id and name = 'Cannoli Hope'),
    'scheduled',
    'Court 3'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    16,
    ((date '2026-08-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Roll Models'),
    (select id from teams where season_id = v_season_id and name = 'Bocce Bellas'),
    'scheduled',
    'Court 4'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    16,
    ((date '2026-08-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Viva La Bocce'),
    (select id from teams where season_id = v_season_id and name = 'Let''s Roll'),
    'scheduled',
    'Court 5'
  );

  insert into matches (season_id, week_number, scheduled_datetime, home_team_id, away_team_id, status, notes)
  values (
    v_season_id,
    16,
    ((date '2026-08-25' + time '18:30') at time zone 'America/New_York'),
    (select id from teams where season_id = v_season_id and name = 'Quattro Amici'),
    (select id from teams where season_id = v_season_id and name = 'Donne Dolci'),
    'scheduled',
    'Court 6'
  );

end $$;
