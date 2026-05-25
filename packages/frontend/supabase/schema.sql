-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Searches saved by user
create table if not exists searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  polygon     jsonb not null,
  sectors     text[] not null default '{}',
  result      jsonb,
  created_at  timestamptz not null default now()
);

-- Row-level security: users can only access their own searches
alter table searches enable row level security;

create policy "Users see own searches"
  on searches for select
  using (auth.uid() = user_id);

create policy "Users insert own searches"
  on searches for insert
  with check (auth.uid() = user_id);

create policy "Users delete own searches"
  on searches for delete
  using (auth.uid() = user_id);

create policy "Users update own searches"
  on searches for update
  using (auth.uid() = user_id);

-- Index for fast user lookups
create index if not exists searches_user_id_idx on searches(user_id, created_at desc);
