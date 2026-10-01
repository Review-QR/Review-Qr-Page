-- Preserve merchant-owned rows when an administrator moves a merchant to
-- Deleted Merchants. Only the existing admin_delete_merchant RPC hard-deletes.
alter table public.businesses
  add column deleted_at timestamptz,
  add column deleted_by uuid references public.admin_users(user_id) on delete set null;

create index businesses_deleted_at_idx
  on public.businesses (deleted_at desc)
  where deleted_at is not null;

-- Keep merchant-side business access limited to active, non-deleted accounts.
drop policy if exists businesses_select_linked_active_merchant on public.businesses;
create policy businesses_select_linked_active_merchant
  on public.businesses for select to authenticated
  using (
    merchant_status = 'active'
    and deleted_at is null
    and exists (
      select 1 from public.merchant_accounts as merchant
      where merchant.business_id = businesses.id
        and merchant.user_id = (select auth.uid())
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
set search_path = ''
as $function$
  select business.id, business.name, business.qr_status, business.expiry, business.review_link
  from public.businesses as business
  where business.id = p_business_id
    and business.deleted_at is null;
$function$;

create or replace function public.increment_business_scan(p_business_id text)
returns void
language sql
security definer
set search_path = ''
as $function$
  update public.businesses as business
  set scans = coalesce(business.scans, 0) + 1
  where business.id = p_business_id
    and business.deleted_at is null
    and pg_catalog.lower(coalesce(business.qr_status, 'disabled')) = 'active'
    and (business.expiry is null or business.expiry >= current_date);
$function$;

create or replace function public.get_trustit_review_business(p_business_id text)
returns table (
  id text,
  name text,
  type text,
  status text,
  merchant_status text,
  qr_status text,
  expiry date,
  review_link text
)
language sql
security definer
set search_path = ''
as $function$
  select business.id, business.name, business.type, business.status,
         business.merchant_status, business.qr_status, business.expiry,
         business.review_link
  from public.businesses as business
  where business.id = p_business_id
    and business.deleted_at is null
    and business.status = 'active'
    and business.merchant_status = 'active'
    and business.qr_status = 'active'
    and (business.expiry is null or business.expiry >= current_date);
$function$;

create or replace function public.get_merchant_trustit_reviews(p_business_id text)
returns table (
  review_id uuid,
  customer_name text,
  rating smallint,
  review_text text,
  selected_experiences text[],
  submitted_at timestamptz
)
language sql
security definer
set search_path = ''
as $function$
  select review.id, review.customer_name, review.rating, review.review_text,
    coalesce(
      pg_catalog.array_agg(experience.category_label_snapshot order by experience.category_label_snapshot)
        filter (where experience.category_label_snapshot is not null),
      array[]::text[]
    ),
    review.submitted_at
  from public.trustit_reviews as review
  left join public.review_session_experiences as experience
    on experience.review_session_id = review.review_session_id
   and experience.business_id = review.business_id
  where review.business_id = p_business_id
    and review.status = 'submitted'
    and exists (
      select 1 from public.merchant_accounts as merchant
      join public.businesses as business on business.id = merchant.business_id
      where merchant.business_id = p_business_id
        and merchant.user_id = (select auth.uid())
        and business.merchant_status = 'active'
        and business.deleted_at is null
    )
  group by review.id, review.customer_name, review.rating, review.review_text, review.submitted_at
  order by review.submitted_at desc;
$function$;

create or replace function public.admin_soft_delete_merchant(
  p_business_id text,
  p_actor_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
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

  update public.businesses
  set deleted_at = pg_catalog.now(), deleted_by = p_actor_user_id
  where id = p_business_id and deleted_at is null;
  return found;
end;
$function$;

revoke all on function public.admin_soft_delete_merchant(text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_soft_delete_merchant(text, uuid) to service_role;

create or replace function public.admin_restore_merchant(
  p_business_id text,
  p_actor_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_business_id is null
    or pg_catalog.length(p_business_id) not between 1 and 128
    or p_business_id !~ '^[A-Za-z0-9_-]{1,128}$'
    or p_actor_user_id is null
    or not exists (
      select 1 from public.admin_users as admin
      where admin.user_id = p_actor_user_id and admin.is_active = true
    ) then
    raise exception 'Invalid merchant restore request';
  end if;

  update public.businesses
  set deleted_at = null, deleted_by = null
  where id = p_business_id and deleted_at is not null;
  return found;
end;
$function$;

revoke all on function public.admin_restore_merchant(text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_restore_merchant(text, uuid) to service_role;

-- Retain the production-reviewed permanent-delete implementation and make the
-- row lock reject active merchants. Existing pending Auth-cleanup retry logic
-- remains first so an already-deleted business can safely finish that cleanup.
create or replace function public.admin_delete_merchant(
  p_business_id text,
  p_actor_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
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

  select pending.user_id into v_merchant_user_id
  from public.admin_merchant_deletion_locks as pending
  where pending.business_id = p_business_id
  for update;
  if found then return v_merchant_user_id; end if;

  perform 1 from public.businesses as business
  where business.id = p_business_id
    and business.deleted_at is not null
  for update;
  if not found then
    raise exception 'Merchant must be moved to Deleted Merchants before permanent deletion';
  end if;

  select merchant.user_id into v_merchant_user_id
  from public.merchant_accounts as merchant
  where merchant.business_id = p_business_id
  for update;

  if v_merchant_user_id is not null then
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

  delete from public.payment_records where business_id = p_business_id;
  delete from public.onboarding_sessions where business_id = p_business_id;
  delete from public.subscriptions where business_id = p_business_id;

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

  delete from public.businesses where id = p_business_id and deleted_at is not null;
  if not found then raise exception 'Merchant deletion did not complete'; end if;

  if v_delete_auth_user then return v_merchant_user_id; end if;
  return null;
end;
$function$;

revoke all on function public.admin_delete_merchant(text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_delete_merchant(text, uuid) to service_role;
