create table public.merchant_invites (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  token_hash text not null unique,
  status text not null default 'pending'
    check (status in ('pending','used','expired','revoked')),
  expires_at timestamptz not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  revoked_at timestamptz
);

create index merchant_invites_business_status_idx
  on public.merchant_invites (business_id, status);

create index merchant_invites_expiry_idx
  on public.merchant_invites (expires_at)
  where status = 'pending';

alter table public.merchant_invites enable row level security;
revoke all on table public.merchant_invites
  from public, anon, authenticated, service_role;

create or replace function public.admin_create_merchant_invite(
  p_business_id text,
  p_actor_user_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_business_id is null
    or p_actor_user_id is null
    or p_token_hash is null
    or p_token_hash !~ '^[a-f0-9]{64}$'
    or p_expires_at is null
    or p_expires_at <= pg_catalog.now()
    or not exists (
      select 1 from public.admin_users
      where user_id = p_actor_user_id and is_active = true
    )
    or not exists (
      select 1 from public.businesses
      where id = p_business_id
        and deleted_at is null
        and merchant_status = 'pending'
    )
    or exists (
      select 1 from public.merchant_accounts
      where business_id = p_business_id
    ) then
    raise exception 'Invalid merchant invite request';
  end if;

  update public.merchant_invites
  set status = 'revoked',
      revoked_at = pg_catalog.now()
  where business_id = p_business_id
    and status = 'pending';

  insert into public.merchant_invites (
    business_id, token_hash, status, expires_at, created_by
  )
  values (
    p_business_id, p_token_hash, 'pending', p_expires_at, p_actor_user_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.admin_create_merchant_invite(text, uuid, text, timestamptz)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_create_merchant_invite(text, uuid, text, timestamptz)
  to service_role;

create or replace function public.admin_revoke_merchant_invite(
  p_invite_id uuid,
  p_actor_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_invite_id is null
    or p_actor_user_id is null
    or not exists (
      select 1 from public.admin_users
      where user_id = p_actor_user_id and is_active = true
    ) then
    raise exception 'Invalid merchant invite revoke request';
  end if;

  update public.merchant_invites
  set status = 'revoked',
      revoked_at = pg_catalog.now()
  where id = p_invite_id
    and status = 'pending'
    and expires_at > pg_catalog.now();

  return found;
end;
$$;

revoke all on function public.admin_revoke_merchant_invite(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_revoke_merchant_invite(uuid, uuid)
  to service_role;

create or replace function public.complete_merchant_invite(
  p_token_hash text,
  p_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id text;
begin
  if p_token_hash is null
    or p_token_hash !~ '^[a-f0-9]{64}$'
    or p_user_id is null then
    raise exception 'Invalid merchant registration request';
  end if;

  update public.merchant_invites
  set status = 'expired'
  where token_hash = p_token_hash
    and status = 'pending'
    and expires_at <= pg_catalog.now();

  select business_id
    into v_business_id
  from public.merchant_invites
  where token_hash = p_token_hash
    and status = 'pending'
    and expires_at > pg_catalog.now()
  for update;

  if not found then
    raise exception 'This merchant invitation is invalid, expired, used, or revoked';
  end if;

  if exists (
    select 1 from public.merchant_accounts
    where business_id = v_business_id
  ) then
    raise exception 'This merchant account is already registered';
  end if;

  if not exists (
    select 1 from public.businesses
    where id = v_business_id
      and deleted_at is null
      and merchant_status = 'pending'
  ) then
    raise exception 'This merchant business is no longer available for registration';
  end if;

  insert into public.merchant_accounts (business_id, user_id)
  values (v_business_id, p_user_id);

  update public.businesses
  set merchant_status = 'active'
  where id = v_business_id
    and merchant_status = 'pending';

  if not found then
    raise exception 'Merchant activation could not be completed';
  end if;

  update public.merchant_invites
  set status = 'used',
      used_at = pg_catalog.now()
  where token_hash = p_token_hash
    and status = 'pending';

  if not found then
    raise exception 'Merchant invitation could not be consumed';
  end if;

  return v_business_id;
end;
$$;

revoke all on function public.complete_merchant_invite(text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.complete_merchant_invite(text, uuid)
  to service_role;

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
