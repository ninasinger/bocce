create table if not exists commissioner_integrations (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid not null references seasons(id) on delete cascade,
  provider text not null,
  commissioner_email text,
  refresh_token text,
  access_token text,
  token_expiry timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, provider)
);

create trigger set_updated_at_commissioner_integrations before update on commissioner_integrations
for each row execute function set_updated_at();
