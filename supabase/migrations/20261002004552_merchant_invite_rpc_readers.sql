create or replace function public.admin_list_merchant_invites(
  p_actor_user_id uuid
)
returns table (
  id uuid,
  business_id text,
  status text,
  expires_at timestamptz,
  created_at timestamptz,
  used_at timestamptz,
  revoked_at timestamptz,
  business_name text,
  business_owner text,
  business_phone text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_user_id is null or not exists (
    select 1 from public.admin_users
    where user_id = p_actor_user_id and is_active = true
  ) then
    raise exception 'Active administrator required';
  end if;

  update public.merchant_invites as invite
  set status = 'expired'
  where invite.status = 'pending'
    and invite.expires_at <= pg_catalog.now();

  return query
  select invite.id, invite.business_id, invite.status, invite.expires_at,
         invite.created_at, invite.used_at, invite.revoked_at,
         business.name, business.owner, business.phone
  from public.merchant_invites as invite
  join public.businesses as business on business.id = invite.business_id
  order by invite.created_at desc
  limit 100;
end;
$$;

revoke all on function public.admin_list_merchant_invites(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_list_merchant_invites(uuid)
  to service_role;

create or replace function public.get_merchant_invite_registration(
  p_token_hash text
)
returns table (
  business_id text,
  status text,
  expires_at timestamptz,
  business_name text,
  merchant_name text,
  merchant_phone text,
  merchant_status text,
  business_deleted boolean,
  has_account boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    return;
  end if;

  update public.merchant_invites as invite
  set status = 'expired'
  where invite.token_hash = p_token_hash
    and invite.status = 'pending'
    and invite.expires_at <= pg_catalog.now();

  return query
  select invite.business_id, invite.status, invite.expires_at,
         business.name, business.owner, business.phone,
         business.merchant_status, (business.deleted_at is not null),
         exists (
           select 1 from public.merchant_accounts as account
           where account.business_id = invite.business_id
         )
  from public.merchant_invites as invite
  join public.businesses as business on business.id = invite.business_id
  where invite.token_hash = p_token_hash
  limit 1;
end;
$$;

revoke all on function public.get_merchant_invite_registration(text)
  from public, anon, authenticated, service_role;
grant execute on function public.get_merchant_invite_registration(text)
  to service_role;
