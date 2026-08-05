-- Scraps vertical slice: authenticated personal pantry.
-- Pantry rows are owned directly by auth.users through user_id; there is no
-- household or sharing model in this migration.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  quantity numeric(12, 3) not null default 1 check (quantity > 0),
  unit text not null default 'count' check (char_length(btrim(unit)) > 0),
  count integer not null default 1 check (count > 0),
  expires_on date not null,
  estimated_value numeric(10, 2) not null default 0 check (estimated_value >= 0),
  emoji text not null default '🛒',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pantry_items_user_expires_on_idx
  on public.pantry_items (user_id, expires_on);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists pantry_items_set_updated_at on public.pantry_items;
create trigger pantry_items_set_updated_at
  before update on public.pantry_items
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.pantry_items enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their own pantry items"
  on public.pantry_items for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own pantry items"
  on public.pantry_items for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own pantry items"
  on public.pantry_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own pantry items"
  on public.pantry_items for delete to authenticated
  using ((select auth.uid()) = user_id);
