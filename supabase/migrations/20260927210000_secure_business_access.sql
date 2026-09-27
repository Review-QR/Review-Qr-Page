alter table public.businesses enable row level security;

revoke all on table public.businesses from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.businesses from authenticated;
grant select on table public.businesses to authenticated;

drop policy if exists businesses_select_active_admin on public.businesses;
create policy businesses_select_active_admin
  on public.businesses for select to authenticated
  using (
    exists (
      select 1
      from public.admin_users as admin
      where admin.user_id = (select auth.uid())
        and admin.is_active = true
    )
  );
