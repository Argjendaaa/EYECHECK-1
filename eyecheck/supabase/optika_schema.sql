-- Run once from the Supabase SQL Editor for the optika app.
-- User IDs are Supabase Auth UUIDs; this file never accepts IDs from the client.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'customer'
    check (role in ('customer', 'staff', 'owner')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'frames'
    check (category in ('frames', 'sunglasses', 'contact_lenses', 'other')),
  price numeric(10, 2) not null default 0 check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  service text not null,
  requested_at timestamptz not null,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  customer_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  status text not null default 'received'
    check (status in ('received', 'in_preparation', 'ready', 'completed', 'cancelled')),
  customer_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null default 0 check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists appointments_customer_requested_at_idx
  on public.appointments (customer_id, requested_at desc);
create index if not exists orders_customer_created_at_idx
  on public.orders (customer_id, created_at desc);
create index if not exists order_items_order_id_idx
  on public.order_items (order_id);
create index if not exists products_active_category_idx
  on public.products (category, name) where active;
create index if not exists profiles_role_idx
  on public.profiles (role);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.appointments enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.profiles, public.products, public.appointments,
  public.orders, public.order_items from anon, authenticated;

grant select, update (display_name) on public.profiles to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, insert, update on public.appointments to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant usage on schema public to anon, authenticated;

create or replace function private.is_optics_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as p
    where p.id = (select auth.uid())
      and p.role in ('staff', 'owner')
  );
$$;

revoke all on function private.is_optics_staff() from public, anon, authenticated;
grant execute on function private.is_optics_staff() to authenticated;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create or replace function private.snapshot_order_item_product()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select p.name, p.price
  into new.product_name, new.unit_price
  from public.products as p
  where p.id = new.product_id
    and p.active;

  if not found then
    raise exception 'Product is not available';
  end if;

  return new;
end;
$$;

revoke all on function private.snapshot_order_item_product() from public, anon, authenticated;
drop trigger if exists order_items_snapshot_product on public.order_items;
create trigger order_items_snapshot_product
  before insert or update of product_id on public.order_items
  for each row execute function private.snapshot_order_item_product();

-- Backfill a profile for accounts that already exist.
insert into public.profiles (id, email, display_name)
select
  u.id,
  u.email,
  nullif(u.raw_user_meta_data ->> 'full_name', '')
from auth.users as u
on conflict (id) do update set email = excluded.email;

drop policy if exists profiles_select_self_or_staff on public.profiles;
create policy profiles_select_self_or_staff
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_optics_staff()));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists products_read_active on public.products;
create policy products_read_active
  on public.products for select to anon, authenticated
  using (active);

drop policy if exists products_staff_read_all on public.products;
create policy products_staff_read_all
  on public.products for select to authenticated
  using ((select private.is_optics_staff()));

drop policy if exists products_staff_insert on public.products;
create policy products_staff_insert
  on public.products for insert to authenticated
  with check ((select private.is_optics_staff()));

drop policy if exists products_staff_update on public.products;
create policy products_staff_update
  on public.products for update to authenticated
  using ((select private.is_optics_staff()))
  with check ((select private.is_optics_staff()));

drop policy if exists products_staff_delete on public.products;
create policy products_staff_delete
  on public.products for delete to authenticated
  using ((select private.is_optics_staff()));

drop policy if exists appointments_read_customer_or_staff on public.appointments;
create policy appointments_read_customer_or_staff
  on public.appointments for select to authenticated
  using (customer_id = (select auth.uid()) or (select private.is_optics_staff()));

drop policy if exists appointments_insert_self on public.appointments;
create policy appointments_insert_self
  on public.appointments for insert to authenticated
  with check (customer_id = (select auth.uid()));

drop policy if exists appointments_cancel_own_request on public.appointments;
create policy appointments_cancel_own_request
  on public.appointments for update to authenticated
  using (customer_id = (select auth.uid()) and status = 'requested')
  with check (customer_id = (select auth.uid()) and status = 'cancelled');

drop policy if exists appointments_staff_update on public.appointments;
create policy appointments_staff_update
  on public.appointments for update to authenticated
  using ((select private.is_optics_staff()))
  with check ((select private.is_optics_staff()));

drop policy if exists orders_read_customer_or_staff on public.orders;
create policy orders_read_customer_or_staff
  on public.orders for select to authenticated
  using (customer_id = (select auth.uid()) or (select private.is_optics_staff()));

drop policy if exists orders_insert_self on public.orders;
create policy orders_insert_self
  on public.orders for insert to authenticated
  with check (customer_id = (select auth.uid()));

drop policy if exists orders_staff_update on public.orders;
create policy orders_staff_update
  on public.orders for update to authenticated
  using ((select private.is_optics_staff()))
  with check ((select private.is_optics_staff()));

drop policy if exists order_items_read_order_owner_or_staff on public.order_items;
create policy order_items_read_order_owner_or_staff
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders as o
      where o.id = order_id
        and (o.customer_id = (select auth.uid()) or (select private.is_optics_staff()))
    )
  );

drop policy if exists order_items_insert_order_owner_or_staff on public.order_items;
create policy order_items_insert_order_owner_or_staff
  on public.order_items for insert to authenticated
  with check (
    exists (
      select 1 from public.orders as o
      where o.id = order_id
        and (o.customer_id = (select auth.uid()) or (select private.is_optics_staff()))
    )
  );

drop policy if exists order_items_staff_update on public.order_items;
create policy order_items_staff_update
  on public.order_items for update to authenticated
  using ((select private.is_optics_staff()))
  with check ((select private.is_optics_staff()));

drop policy if exists order_items_staff_delete on public.order_items;
create policy order_items_staff_delete
  on public.order_items for delete to authenticated
  using ((select private.is_optics_staff()));

-- After an account is created, an administrator assigns staff access in SQL Editor:
-- update public.profiles set role = 'staff' where id = '<auth user UUID>';
