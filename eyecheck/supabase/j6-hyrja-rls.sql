-- A: mbylle derën
revoke all on public.screening from anon;
-- fshi policy-t e vjetra të javës 5 (ndërro emrat):
drop policy if exists "zhvillim" on public.screening;

-- C: pronari
alter table public.screening
  add column if not exists pronari_id uuid
  default auth.uid() references auth.users(id);

alter table public.screening enable row level security;

create policy "lexim" on public.screening
  for select to authenticated using (pronari_id = auth.uid());

create policy "shtim" on public.screening
  for insert to authenticated with check (pronari_id = auth.uid());

create policy "ndryshim" on public.screening
  for update to authenticated
  using (pronari_id = auth.uid()) with check (pronari_id = auth.uid());