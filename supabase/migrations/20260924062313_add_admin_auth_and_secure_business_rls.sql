
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin','staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon;
grant select on table public.admin_users to authenticated;

drop policy if exists "Admins can view own admin record" on public.admin_users;
create policy "Admins can view own admin record"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id and is_active = true);

alter table public.businesses enable row level security;

drop policy if exists "Allow public read businesses" on public.businesses;
drop policy if exists "Allow public insert businesses" on public.businesses;
drop policy if exists "Allow public update businesses" on public.businesses;
drop policy if exists "Allow public delete businesses" on public.businesses;

revoke all on table public.businesses from anon;
revoke all on table public.businesses from authenticated;
grant select on table public.businesses to anon;
grant select, insert, update, delete on table public.businesses to authenticated;

create policy "Public can read businesses for QR lookup"
on public.businesses
for select
to anon
using (true);

create policy "Active admins can read businesses"
on public.businesses
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.is_active = true
  )
);

create policy "Active admins can insert businesses"
on public.businesses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.is_active = true
  )
);

create policy "Active admins can update businesses"
on public.businesses
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.is_active = true
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.is_active = true
  )
);

create policy "Active admins can delete businesses"
on public.businesses
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.is_active = true
  )
);

create or replace function public.get_business_for_qr(p_business_id text)
returns table (
  id text,
  name text,
  qr_status text,
  expiry date,
  review_link text
)
language sql
security definer
set search_path = public
as $$
  select b.id, b.name, b.qr_status, b.expiry, b.review_link
  from public.businesses b
  where b.id = p_business_id;
$$;

revoke all on function public.get_business_for_qr(text) from public;
grant execute on function public.get_business_for_qr(text) to anon, authenticated;
;
