-- Explicit, friends-only sharing. Apply after the profile/pantry migrations.
alter table public.profiles add column if not exists handle text;
create unique index if not exists profiles_handle_unique on public.profiles (lower(handle)) where handle is not null;
alter table public.profiles add constraint profiles_handle_format check (handle is null or handle ~ '^[a-z0-9_]{3,24}$');

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);
create unique index friendships_pair_unique on public.friendships
  (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index friendships_addressee_idx on public.friendships(addressee_id);

create table public.share_listings (
  id uuid primary key default gen_random_uuid(),
  pantry_item_id uuid not null references public.pantry_items(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  unique (pantry_item_id)
);
create index share_listings_owner_idx on public.share_listings(owner_id);

-- A profile is visible to connected friends and parties to a pending invitation.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read connected profiles" on public.profiles for select to authenticated
using (public.profiles.id = (select auth.uid()) or exists (
  select 1 from public.friendships f where
  ((f.requester_id = public.profiles.id and f.addressee_id = (select auth.uid())) or
 (f.addressee_id = public.profiles.id and f.requester_id = (select auth.uid())))
));

-- Exact handle lookup returns only the identity needed to invite someone.
create function public.find_profile_by_handle(lookup_handle text)
returns table (id uuid, handle text, first_name text, last_name text)
language sql security definer set search_path = '' as $$
  select p.id, p.handle, p.first_name, p.last_name from public.profiles p
  where lower(p.handle) = lower(btrim(lookup_handle)) and auth.uid() is not null
    and p.id <> auth.uid() limit 1;
$$;
revoke all on function public.find_profile_by_handle(text) from public;
grant execute on function public.find_profile_by_handle(text) to authenticated;

alter table public.friendships enable row level security;
create policy "Parties can read friendships" on public.friendships for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));
create policy "Requesters can invite" on public.friendships for insert to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending');
create policy "Addressees can respond" on public.friendships for update to authenticated
  using (addressee_id = (select auth.uid()) and status = 'pending')
  with check (addressee_id = (select auth.uid()) and status in ('accepted', 'declined'));
create policy "Participants can remove friendships" on public.friendships for delete to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

alter table public.share_listings enable row level security;
create policy "Friends can see active listings" on public.share_listings for select to authenticated
using (owner_id = (select auth.uid()) or (status = 'active' and exists (
  select 1 from public.friendships f where f.status = 'accepted' and
    ((f.requester_id = owner_id and f.addressee_id = (select auth.uid())) or
     (f.addressee_id = owner_id and f.requester_id = (select auth.uid())))
)));
create policy "Owners can list their pantry items" on public.share_listings for insert to authenticated
with check (owner_id = (select auth.uid()) and status = 'active' and exists (
  select 1 from public.pantry_items p where p.id = pantry_item_id and p.user_id = (select auth.uid())
));
create policy "Owners can close listings" on public.share_listings for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners can remove listings" on public.share_listings for delete to authenticated
using (owner_id = (select auth.uid()));

-- Friends may see ONLY the pantry row currently offered, never the rest of the pantry.
drop policy if exists "Users can read their own pantry items" on public.pantry_items;
create policy "Owners and friends can read listed pantry items" on public.pantry_items for select to authenticated
using (user_id = (select auth.uid()) or exists (
  select 1 from public.share_listings l join public.friendships f on f.status = 'accepted'
  where l.pantry_item_id = public.pantry_items.id and l.status = 'active' and l.owner_id = user_id
    and ((f.requester_id = user_id and f.addressee_id = (select auth.uid())) or
         (f.addressee_id = user_id and f.requester_id = (select auth.uid())))
));

-- Prevent clients from rewriting relationship endpoints or listing ownership after creation.
revoke update on public.friendships from authenticated;
grant update (status) on public.friendships to authenticated;
revoke update on public.share_listings from authenticated;
grant update (status) on public.share_listings to authenticated;

-- Supabase normally provides these grants through default privileges; state them
-- explicitly so fresh projects can access the RLS-protected tables.
grant select, insert, delete on public.friendships to authenticated;
grant select, insert, delete on public.share_listings to authenticated;
