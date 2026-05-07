create extension if not exists "pgcrypto";

create table if not exists public.chess_games (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  played_at date not null,
  white_player text not null,
  black_player text not null,
  result text not null check (result in ('1-0', '0-1', '1/2-1/2', '*')),
  event text,
  site text,
  round text,
  pgn text not null,
  added_by_user_id uuid references auth.users (id) on delete set null,
  added_by_email text
);

create index if not exists chess_games_played_at_idx on public.chess_games (played_at desc);
create index if not exists chess_games_white_player_idx on public.chess_games (lower(white_player));
create index if not exists chess_games_black_player_idx on public.chess_games (lower(black_player));
create index if not exists chess_games_added_by_email_idx on public.chess_games (lower(added_by_email));

alter table public.chess_games enable row level security;

drop policy if exists "Public read access" on public.chess_games;
create policy "Public read access"
on public.chess_games
for select
using (true);

drop policy if exists "Authenticated insert" on public.chess_games;
create policy "Authenticated insert"
on public.chess_games
for insert
to authenticated
with check (auth.uid() = added_by_user_id);

drop policy if exists "Anon insert with nickname" on public.chess_games;
create policy "Anon insert with nickname"
on public.chess_games
for insert
to anon
with check (added_by_user_id is null and added_by_email is not null);

drop policy if exists "Authenticated update own" on public.chess_games;
create policy "Authenticated update own"
on public.chess_games
for update
to authenticated
using (auth.uid() = added_by_user_id)
with check (auth.uid() = added_by_user_id);
