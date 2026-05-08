create table if not exists match_score_drafts (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  match_id uuid references matches(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  game1_home_score int,
  game1_away_score int,
  game2_home_score int,
  game2_away_score int,
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(match_id, team_id)
);

