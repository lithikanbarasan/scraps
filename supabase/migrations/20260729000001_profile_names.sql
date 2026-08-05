-- Add real names without invalidating profiles created by the first migration.
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

alter table public.profiles
  drop constraint if exists profiles_first_name_not_blank,
  add constraint profiles_first_name_not_blank
    check (first_name is null or char_length(btrim(first_name)) > 0),
  drop constraint if exists profiles_last_name_not_blank,
  add constraint profiles_last_name_not_blank
    check (last_name is null or char_length(btrim(last_name)) > 0);

-- Allow authenticated users to create their own profile row (needed for upsert
-- when completing a profile that was never inserted by the auth trigger).
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

-- Replace the original trigger function so future signups copy name metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'last_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
