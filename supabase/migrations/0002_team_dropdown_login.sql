alter table teams drop constraint if exists teams_season_id_team_code_lookup_key;
alter table teams drop column if exists team_code_lookup;
alter table teams drop constraint if exists teams_season_id_name_key;
alter table teams add constraint teams_season_id_name_key unique (season_id, name);
