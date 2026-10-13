create or replace function public.owns_pantry_item(item_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.pantry_items p
    where p.id = item_id and p.user_id = (select auth.uid())
  );
$$;

revoke all on function public.owns_pantry_item(uuid) from public;
grant execute on function public.owns_pantry_item(uuid) to authenticated;

drop policy if exists "Owners can list their pantry items" on public.share_listings;
create policy "Owners can list their pantry items"
on public.share_listings for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and status = 'active'
  and (select public.owns_pantry_item(pantry_item_id))
);