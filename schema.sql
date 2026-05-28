-- Flashcards: user progress sync schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run)

-- 1. Table to store user progress per deck (state as JSONB)
create table if not exists public.user_deck_state (
  user_id    uuid not null references auth.users(id) on delete cascade,
  deck       text not null,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, deck)
);

-- 2. Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_user_deck_state_updated_at on public.user_deck_state;
create trigger trg_user_deck_state_updated_at
  before update on public.user_deck_state
  for each row execute function public.set_updated_at();

-- 3. Enable Row Level Security — each user only sees own data
alter table public.user_deck_state enable row level security;

drop policy if exists "Users read own state"   on public.user_deck_state;
drop policy if exists "Users insert own state" on public.user_deck_state;
drop policy if exists "Users update own state" on public.user_deck_state;
drop policy if exists "Users delete own state" on public.user_deck_state;

create policy "Users read own state"
  on public.user_deck_state for select
  using (auth.uid() = user_id);

create policy "Users insert own state"
  on public.user_deck_state for insert
  with check (auth.uid() = user_id);

create policy "Users update own state"
  on public.user_deck_state for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users delete own state"
  on public.user_deck_state for delete
  using (auth.uid() = user_id);
