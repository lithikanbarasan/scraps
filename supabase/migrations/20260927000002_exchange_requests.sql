-- Requests are recorded and claims close a listing atomically.
alter table public.share_listings drop constraint if exists share_listings_pantry_item_id_key;
create unique index if not exists share_listings_one_active_item
  on public.share_listings(pantry_item_id) where status = 'active';

create table public.exchange_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.share_listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  ingredient_name text not null,
  ingredient_emoji text not null,
  quantity text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (owner_id <> requester_id),
  unique (listing_id, requester_id)
);
create index exchange_requests_owner_idx on public.exchange_requests(owner_id, created_at desc);
create index exchange_requests_requester_idx on public.exchange_requests(requester_id, created_at desc);
alter table public.exchange_requests enable row level security;
create policy "Request parties can read" on public.exchange_requests for select to authenticated
using ((select auth.uid()) in (owner_id, requester_id));
-- Mutations go through functions to serialize claims and derive item details.
grant select on public.exchange_requests to authenticated;
revoke insert, update, delete on public.exchange_requests from anon, authenticated;

create function public.request_share_listing(target_listing_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  listing public.share_listings%rowtype;
  item public.pantry_items%rowtype;
  request_id uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select * into listing from public.share_listings
    where id = target_listing_id for update;
  if not found or listing.status <> 'active' or listing.owner_id = auth.uid() then
    raise exception 'Listing is unavailable';
  end if;
  if not exists (
    select 1 from public.friendships f where f.status = 'accepted' and
    ((f.requester_id = auth.uid() and f.addressee_id = listing.owner_id) or
     (f.addressee_id = auth.uid() and f.requester_id = listing.owner_id))
  ) then raise exception 'Only friends can request this item'; end if;
  select * into item from public.pantry_items where id = listing.pantry_item_id;
  if not found or item.user_id <> listing.owner_id or item.expires_on < current_date then
    raise exception 'Item is unavailable';
  end if;
  insert into public.exchange_requests
    (listing_id, owner_id, requester_id, ingredient_name, ingredient_emoji, quantity)
  values (listing.id, listing.owner_id, auth.uid(), item.name, item.emoji,
    item.count::text || ' ' || item.unit)
  on conflict (listing_id, requester_id) do update
    set status = 'pending', updated_at = now()
    where exchange_requests.status in ('declined', 'cancelled')
  returning id into request_id;
  if request_id is null then raise exception 'Request already exists'; end if;
  return request_id;
end;
$$;

create function public.resolve_share_request(target_request_id uuid, resolution text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  request_row public.exchange_requests%rowtype;
  listing public.share_listings%rowtype;
begin
  if auth.uid() is null or resolution not in ('accepted', 'declined', 'cancelled') then
    raise exception 'Invalid resolution';
  end if;
  select * into request_row from public.exchange_requests where id = target_request_id;
  if not found then raise exception 'Request not found'; end if;
  -- The listing lock serializes owners accepting competing requests.
  select * into listing from public.share_listings where id = request_row.listing_id for update;
  select * into request_row from public.exchange_requests where id = target_request_id for update;
  if request_row.status <> 'pending' then raise exception 'Request is no longer pending'; end if;
  if resolution = 'cancelled' then
    if auth.uid() <> request_row.requester_id then raise exception 'Not your request'; end if;
  elsif auth.uid() <> request_row.owner_id then
    raise exception 'Not your listing';
  end if;
  if resolution = 'accepted' and listing.status <> 'active' then
    raise exception 'Listing is no longer available';
  end if;
  update public.exchange_requests set status = resolution, updated_at = now()
    where id = target_request_id;
  if resolution = 'accepted' then
    update public.exchange_requests set status = 'declined', updated_at = now()
      where listing_id = listing.id and id <> target_request_id and status = 'pending';
    update public.share_listings set status = 'closed' where id = listing.id;
  end if;
  return true;
end;
$$;

create function public.close_share_listing(target_listing_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare listing public.share_listings%rowtype;
begin
  select * into listing from public.share_listings where id = target_listing_id for update;
  if not found or listing.owner_id <> auth.uid() or listing.status <> 'active' then
    raise exception 'Listing is unavailable';
  end if;
  update public.share_listings set status = 'closed' where id = listing.id;
  update public.exchange_requests set status = 'declined', updated_at = now()
    where listing_id = listing.id and status = 'pending';
  return true;
end;
$$;
revoke all on function public.request_share_listing(uuid) from public;
revoke all on function public.resolve_share_request(uuid, text) from public;
revoke all on function public.close_share_listing(uuid) from public;
grant execute on function public.request_share_listing(uuid) to authenticated;
grant execute on function public.resolve_share_request(uuid, text) to authenticated;
grant execute on function public.close_share_listing(uuid) to authenticated;
