-- Run once in Supabase SQL Editor after optika_schema.sql.
-- A request contains one catalog product; price and name are copied by the existing trigger.
create or replace function public.create_product_order_request(p_product_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_order_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.products as p
    where p.id = p_product_id and p.active
  ) then
    raise exception 'Product is not available';
  end if;

  insert into public.orders (customer_id, status)
  values ((select auth.uid()), 'received')
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, quantity)
  values (v_order_id, p_product_id, 1);

  return v_order_id;
end;
$$;

revoke all on function public.create_product_order_request(uuid) from public, anon, authenticated;
grant execute on function public.create_product_order_request(uuid) to authenticated;
