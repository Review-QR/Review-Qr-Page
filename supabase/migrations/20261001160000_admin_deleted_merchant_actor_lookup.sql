-- Return only the requested admin identities to an active administrator.
-- This keeps the admin_users table policy unchanged and does not expose Auth data.
create or replace function public.get_deleted_merchant_actors(p_user_ids uuid[])
returns table (user_id uuid, email text)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not exists (
    select 1 from public.admin_users as actor
    where actor.user_id = (select auth.uid())
      and actor.is_active = true
  ) then
    raise exception 'Active administrator required';
  end if;

  if p_user_ids is null or pg_catalog.cardinality(p_user_ids) > 1000 then
    raise exception 'Invalid administrator identity request';
  end if;

  return query
    select admin.user_id, admin.email
    from public.admin_users as admin
    where admin.user_id = any(p_user_ids);
end;
$function$;

revoke all on function public.get_deleted_merchant_actors(uuid[])
  from public, anon, authenticated, service_role;
grant execute on function public.get_deleted_merchant_actors(uuid[]) to authenticated;
