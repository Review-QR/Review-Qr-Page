-- Admin-only, transactionally remove one merchant's owned database records.
-- The Auth identity is returned for deletion through Supabase's Admin API;
-- that external Auth operation cannot participate in this SQL transaction.
-- A scoped cleanup lock fences off new merchant/onboarding writes until Auth
-- deletion succeeds; Auth deletion cascades away the lock. If the Admin API
-- fails, an admin can retry this RPC with the same business ID.
create table public.admin_merchant_deletion_locks (
  business_id text primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now()
);

alter table public.admin_merchant_deletion_locks enable row level security;
revoke all on table public.admin_merchant_deletion_locks
  from public, anon, authenticated, service_role;

create or replace function public.block_pending_merchant_identity_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serialize with the deletion transaction. New registration/account writes
  -- wait for its auth.users lock, then observe the committed cleanup lock.
  perform 1 from auth.users as auth_user
  where auth_user.id = new.user_id
  for key share;

  if exists (
    select 1 from public.admin_merchant_deletion_locks as pending
    where pending.user_id = new.user_id
  ) then
    raise exception 'Merchant identity cleanup is pending';
  end if;
  return new;
end;
$$;

revoke all on function public.block_pending_merchant_identity_write()
  from public, anon, authenticated, service_role;

create trigger merchant_accounts_pending_identity_guard
before insert or update of user_id on public.merchant_accounts
for each row execute function public.block_pending_merchant_identity_write();

create trigger admin_users_pending_identity_guard
before insert or update of user_id on public.admin_users
for each row execute function public.block_pending_merchant_identity_write();

create trigger merchant_profiles_pending_identity_guard
before insert or update of user_id on public.merchant_profiles
for each row execute function public.block_pending_merchant_identity_write();

create trigger onboarding_sessions_pending_identity_guard
before insert or update of user_id on public.onboarding_sessions
for each row execute function public.block_pending_merchant_identity_write();

create trigger subscriptions_pending_identity_guard
before insert or update of user_id on public.subscriptions
for each row execute function public.block_pending_merchant_identity_write();

create or replace function public.admin_delete_merchant(
  p_business_id text,
  p_actor_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_merchant_user_id uuid;
  v_delete_auth_user boolean := false;
begin
  if p_business_id is null
    or pg_catalog.length(p_business_id) not between 1 and 128
    or p_business_id !~ '^[A-Za-z0-9_-]{1,128}$'
    or p_actor_user_id is null
    or not exists (
      select 1 from public.admin_users as admin
      where admin.user_id = p_actor_user_id and admin.is_active = true
    ) then
    raise exception 'Invalid merchant deletion request';
  end if;

  -- A previous call may have committed the business deletion but failed while
  -- deleting Auth. Return its locked identity so the server action can retry.
  select pending.user_id into v_merchant_user_id
  from public.admin_merchant_deletion_locks as pending
  where pending.business_id = p_business_id
  for update;
  if found then return v_merchant_user_id; end if;

  perform 1 from public.businesses as business
  where business.id = p_business_id
  for update;
  if not found then raise exception 'Merchant does not exist'; end if;

  select merchant.user_id into v_merchant_user_id
  from public.merchant_accounts as merchant
  where merchant.business_id = p_business_id
  for update;

  if v_merchant_user_id is not null then
    -- Registration/account writers take KEY SHARE via the guards above. This
    -- lock makes the no-other-activity check stable through this transaction.
    perform 1 from auth.users as auth_user
    where auth_user.id = v_merchant_user_id
    for update;
    if not found then raise exception 'Merchant Auth identity does not exist'; end if;
  end if;

  if v_merchant_user_id is not null and exists (
    select 1 from public.admin_users as admin where admin.user_id = v_merchant_user_id
  ) then
    raise exception 'An administrator identity cannot be deleted as a merchant';
  end if;

  -- Remove only rows explicitly scoped to this business. Other businesses,
  -- global reference tables, and unrelated users are not touched.
  delete from public.payment_records where business_id = p_business_id;
  delete from public.onboarding_sessions where business_id = p_business_id;
  delete from public.subscriptions where business_id = p_business_id;

  -- auth.users deletion cascades to merchant_accounts and merchant_profiles,
  -- but is safe only when no other business-scoped identity data would be
  -- affected by that external operation.
  if v_merchant_user_id is not null
    and not exists (
      select 1 from public.merchant_accounts as merchant
      where merchant.user_id = v_merchant_user_id and merchant.business_id <> p_business_id
    )
    and not exists (
      select 1 from public.onboarding_sessions as session
      where session.user_id = v_merchant_user_id
        and session.business_id is distinct from p_business_id
    )
    and not exists (
      select 1 from public.subscriptions as subscription
      where subscription.user_id = v_merchant_user_id
        and subscription.business_id <> p_business_id
    ) then
    v_delete_auth_user := true;
  end if;

  if v_delete_auth_user then
    insert into public.admin_merchant_deletion_locks (business_id, user_id)
    values (p_business_id, v_merchant_user_id);
    delete from public.merchant_profiles where user_id = v_merchant_user_id;
  end if;

  -- The business cascades to merchant_accounts, Trustit sessions, submitted
  -- reviews, session experiences/generations, customer profiles, family
  -- members, and per-customer occasions. Shared category/type tables are not
  -- referenced by a cascading ownership edge and are never deleted here.
  delete from public.businesses where id = p_business_id;
  if not found then raise exception 'Merchant deletion did not complete'; end if;

  if v_delete_auth_user then return v_merchant_user_id; end if;
  return null;
end;
$$;

revoke all on function public.admin_delete_merchant(text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_delete_merchant(text, uuid) to service_role;
