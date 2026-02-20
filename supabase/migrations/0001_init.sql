create extension if not exists "uuid-ossp";

create type match_status as enum (
  'scheduled',
  'awaiting_submission',
  'pending_verification',
  'verified',
  'disputed',
  'corrected'
);

create type submission_status as enum ('active', 'superseded');

create table seasons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  year int not null,
  start_date date,
  end_date date,
  timezone text not null default 'America/New_York',
  game_target_points int not null default 16,
  games_per_match int not null default 2,
  commissioner_code_hash text not null,
  commissioner_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  name text not null,
  team_code_hash text not null,
  captain_name text,
  members jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(season_id, name)
);

create table matches (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  week_number int not null,
  scheduled_datetime timestamptz,
  home_team_id uuid references teams(id) on delete set null,
  away_team_id uuid references teams(id) on delete set null,
  status match_status not null default 'scheduled',
  home_games_won int,
  away_games_won int,
  home_total_score int,
  away_total_score int,
  home_match_points int,
  away_match_points int,
  notes text,
  updated_by_role text,
  updated_by_id uuid,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table match_submissions (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  match_id uuid references matches(id) on delete cascade,
  submitted_by_team_id uuid references teams(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  game1_home_score int not null,
  game1_away_score int not null,
  game2_home_score int not null,
  game2_away_score int not null,
  notes text,
  home_total_score int,
  away_total_score int,
  home_games_won int,
  away_games_won int,
  status submission_status not null default 'active'
);

create unique index match_submissions_unique on match_submissions (match_id, submitted_by_team_id)
where status = 'active';

create table match_corrections (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  match_id uuid references matches(id) on delete cascade,
  corrected_by uuid,
  corrected_at timestamptz not null default now(),
  reason text not null,
  previous_values jsonb not null,
  new_values jsonb not null
);

create table weeks (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  week_number int not null,
  closed_at timestamptz,
  closed_by uuid,
  unique(season_id, week_number)
);

create table standings_snapshots (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  week_number int not null,
  computed_at timestamptz not null default now(),
  table_data jsonb not null,
  rank_movement jsonb
);

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_role text not null,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_seasons before update on seasons
for each row execute function set_updated_at();

create trigger set_updated_at_teams before update on teams
for each row execute function set_updated_at();

create trigger set_updated_at_matches before update on matches
for each row execute function set_updated_at();

alter table seasons enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;

create policy "public read matches" on matches
for select using (true);

create policy "public read teams" on teams
for select using (true);

create policy "public read seasons" on seasons
for select using (true);
