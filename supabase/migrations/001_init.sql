-- Game Night — initial schema
-- Run in the Supabase SQL editor, or via: supabase db push / psql

-- ──────────────────────────────────────────────
-- game_registry: one row per game section
-- ──────────────────────────────────────────────
create table if not exists public.game_registry (
  id         text primary key,
  emoji      text        not null,
  name       text        not null,
  type       text        not null check (type in ('simple','trivia','avoid','wavelength','fivesec','rules')),
  is_custom  boolean     not null default false,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- game_content: one row per question / prompt / pair
-- ──────────────────────────────────────────────
create table if not exists public.game_content (
  id         uuid        primary key default gen_random_uuid(),
  game_id    text        not null,
  content    text        not null,
  content_b  text,
  category   text,
  answer     text,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists game_content_game_id_idx on public.game_content (game_id, sort_order);

-- ──────────────────────────────────────────────
-- Row Level Security
-- This app has no user auth — the admin panel is gated by a single
-- ADMIN_PASSWORD env var at the app layer. The anon key is used for both
-- reads and writes, so we allow full public access at the DB layer.
-- ──────────────────────────────────────────────
alter table public.game_registry enable row level security;
alter table public.game_content  enable row level security;

drop policy if exists "public access" on public.game_registry;
create policy "public access" on public.game_registry
  for all using (true) with check (true);

drop policy if exists "public access" on public.game_content;
create policy "public access" on public.game_content
  for all using (true) with check (true);

-- Table-level grants for the anon (and authenticated) roles. Supabase does not
-- always auto-grant these for tables created in the SQL editor, and RLS policies
-- only apply once the role has the underlying privilege.
grant select, insert, update, delete on public.game_registry to anon, authenticated;
grant select, insert, update, delete on public.game_content  to anon, authenticated;
