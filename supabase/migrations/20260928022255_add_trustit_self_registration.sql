create table public.merchant_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mobile text not null unique
    check (mobile ~ '^\+[1-9][0-9]{7,14}$'),
  full_name text not null
    check (length(btrim(full_name)) between 1 and 160),
  email text,
  mobile_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_profiles_email_check
    check (email is null or (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))
);

create table public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mobile text not null check (mobile ~ '^\+[1-9][0-9]{7,14}$'),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'payment_pending', 'completed', 'cancelled', 'expired')),
  current_step text not null default 'business'
    check (current_step in ('business', 'plan', 'payment', 'complete')),
  business_id text references public.businesses (id) on delete restrict,
  selected_plan text check (selected_plan in ('Basic', 'Standard', 'Premium')),
  payment_mode text check (payment_mode = 'one_time'),
  payment_reference text unique,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_payment_reference_check
    check (payment_reference is null or length(payment_reference) between 1 and 250)
);

create unique index onboarding_sessions_one_open_per_user
  on public.onboarding_sessions (user_id)
  where status in ('in_progress', 'payment_pending');
create index onboarding_sessions_business_id_idx
  on public.onboarding_sessions (business_id)
  where business_id is not null;
create index onboarding_sessions_expiry_idx
  on public.onboarding_sessions (expires_at)
  where status <> 'completed';

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  plan text not null check (plan in ('Basic', 'Standard', 'Premium')),
  amount numeric(10, 2) not null,
  billing_cycle text not null default 'monthly' check (billing_cycle = 'monthly'),
  payment_mode text not null check (payment_mode = 'one_time'),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'expired', 'cancelled', 'payment_failed')),
  cashfree_subscription_id text unique,
  cashfree_subscription_session_id text,
  payment_reference text unique,
  last_payment_id text unique,
  mandate_status text not null default 'not_requested' check (mandate_status = 'not_requested'),
  starts_at timestamptz,
  expires_at timestamptz,
  auto_renew boolean not null default false check (auto_renew = false),
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_plan_amount_check check (
    (plan = 'Basic' and amount = 29.00)
    or (plan = 'Standard' and amount = 49.00)
    or (plan = 'Premium' and amount = 99.00)
  ),
  constraint subscriptions_recurring_unavailable_check check (
    cashfree_subscription_id is null
    and cashfree_subscription_session_id is null
    and last_payment_id is null
  )
);

create index subscriptions_business_id_idx on public.subscriptions (business_id, created_at desc);
create index subscriptions_user_id_idx on public.subscriptions (user_id, created_at desc);
create index subscriptions_reminder_due_idx
  on public.subscriptions (expires_at)
  where status = 'active' and reminder_sent_at is null;

alter table public.merchant_profiles enable row level security;
alter table public.onboarding_sessions enable row level security;
alter table public.subscriptions enable row level security;

revoke all on table public.merchant_profiles, public.onboarding_sessions, public.subscriptions
  from public, anon, authenticated;
grant select on table public.merchant_profiles, public.onboarding_sessions, public.subscriptions
  to authenticated;
grant all on table public.merchant_profiles, public.onboarding_sessions, public.subscriptions
  to service_role;

create policy merchant_profiles_select_own
  on public.merchant_profiles for select to authenticated
  using (user_id = (select auth.uid()));

create policy onboarding_sessions_select_own
  on public.onboarding_sessions for select to authenticated
  using (user_id = (select auth.uid()));

create policy subscriptions_select_own
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.complete_trustit_profile(
  p_user_id uuid,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mobile text;
  v_verified_at timestamptz;
  v_session_id uuid;
begin
  if p_user_id is null or p_full_name is null or length(btrim(p_full_name)) not between 1 and 160 then
    raise exception 'Invalid registration profile';
  end if;

  select auth_user.phone, auth_user.phone_confirmed_at
    into v_mobile, v_verified_at
    from auth.users as auth_user
    where auth_user.id = p_user_id;

  if v_mobile is null or v_verified_at is null or v_mobile !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'Verified phone required';
  end if;
  if exists (
    select 1 from public.merchant_accounts as merchant
    where merchant.user_id = p_user_id
  ) then
    raise exception 'Merchant account already exists';
  end if;

  insert into public.merchant_profiles (user_id, mobile, full_name, mobile_verified_at)
  values (p_user_id, v_mobile, btrim(p_full_name), v_verified_at)
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        updated_at = pg_catalog.now()
    where public.merchant_profiles.mobile = excluded.mobile;

  if not found then
    raise exception 'Mobile is already registered';
  end if;

  select session.id into v_session_id
    from public.onboarding_sessions as session
    where session.user_id = p_user_id
      and session.status in ('in_progress', 'payment_pending')
      and (session.expires_at > pg_catalog.now()
        or (session.status = 'payment_pending' and session.payment_reference is not null))
    order by session.created_at desc
    limit 1
    for update;

  if v_session_id is null then
    update public.onboarding_sessions
      set status = 'expired', updated_at = pg_catalog.now()
      where user_id = p_user_id
        and status = 'in_progress'
        and expires_at <= pg_catalog.now();
    insert into public.onboarding_sessions (user_id, mobile)
    values (p_user_id, v_mobile)
    returning id into v_session_id;
  end if;

  return v_session_id;
end;
$$;

create or replace function public.create_trustit_business_for_onboarding(
  p_user_id uuid,
  p_name text,
  p_type text,
  p_address text,
  p_review_link text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.merchant_profiles%rowtype;
  v_session public.onboarding_sessions%rowtype;
  v_business_id text;
  v_attempt integer;
begin
  if p_user_id is null
    or p_name is null or length(btrim(p_name)) not between 1 and 160
    or p_type is null or p_type not in ('Shop', 'Cafe/Restaurant', 'Salon', 'Clinic', 'Library', 'Hotel', 'Other')
    or p_address is null or length(btrim(p_address)) > 1000
    or p_review_link is null or length(p_review_link) > 2048
    or lower(p_review_link) not like 'https://%'
    or p_review_link ~* '^https://[^/]*@' then
    raise exception 'Invalid business details';
  end if;

  select * into v_profile from public.merchant_profiles where user_id = p_user_id;
  if not found then raise exception 'Verified profile required'; end if;

  select * into v_session
    from public.onboarding_sessions
    where user_id = p_user_id
      and status = 'in_progress'
      and current_step = 'business'
      and expires_at > pg_catalog.now()
    order by created_at desc
    limit 1
    for update;
  if not found then raise exception 'Registration session expired'; end if;
  if v_session.business_id is not null then return v_session.business_id; end if;

  for v_attempt in 1..8 loop
    v_business_id := 'QR-' || (10000000 + floor(pg_catalog.random() * 90000000)::bigint)::text;
    if not exists (select 1 from public.businesses where id = v_business_id) then
      insert into public.businesses (
        id, name, owner, phone, type, address, review_link,
        plan, status, expiry, scans, qr_status, qr_type,
        registration_date, merchant_status
      ) values (
        v_business_id, btrim(p_name), v_profile.full_name, v_profile.mobile,
        p_type, btrim(p_address), btrim(p_review_link),
        'Basic', 'pending', null, 0, 'disabled', 'review',
        (pg_catalog.now() at time zone 'UTC')::date, 'pending'
      );

      update public.onboarding_sessions
        set business_id = v_business_id,
            current_step = 'plan',
            updated_at = pg_catalog.now()
        where id = v_session.id;
      return v_business_id;
    end if;
  end loop;

  raise exception 'Unable to allocate business identifier';
end;
$$;

create or replace function public.select_trustit_plan(
  p_user_id uuid,
  p_plan text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.onboarding_sessions%rowtype;
begin
  if p_plan not in ('Basic', 'Standard', 'Premium') then raise exception 'Invalid plan'; end if;
  select * into v_session from public.onboarding_sessions
    where user_id = p_user_id and status = 'in_progress'
      and current_step = 'plan' and expires_at > pg_catalog.now()
    order by created_at desc limit 1 for update;
  if not found or v_session.business_id is null then raise exception 'Registration session expired'; end if;

  update public.businesses set plan = p_plan
    where id = v_session.business_id and merchant_status = 'pending';
  if not found then raise exception 'Business is not available'; end if;

  update public.onboarding_sessions
    set selected_plan = p_plan, current_step = 'payment', updated_at = pg_catalog.now()
    where id = v_session.id;
end;
$$;

create or replace function public.prepare_trustit_payment(
  p_user_id uuid,
  p_payment_mode text
)
returns table (business_id text, plan text, mobile text, full_name text, email text, payment_reference text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.onboarding_sessions%rowtype;
  v_profile public.merchant_profiles%rowtype;
begin
  -- Recurring billing is intentionally unavailable. Only one-time checkout can
  -- create a payment-pending onboarding state.
  if p_payment_mode is distinct from 'one_time' then raise exception 'Invalid payment mode'; end if;
  select * into v_session from public.onboarding_sessions
    where user_id = p_user_id and status in ('in_progress', 'payment_pending')
      and current_step = 'payment' and expires_at > pg_catalog.now()
    order by created_at desc limit 1 for update;
  if not found or v_session.business_id is null or v_session.selected_plan is null then
    raise exception 'Registration session expired';
  end if;

  select * into v_profile from public.merchant_profiles where user_id = p_user_id;
  if not found then raise exception 'Verified profile required'; end if;

  if v_session.payment_reference is not null and v_session.payment_mode is distinct from p_payment_mode then
    raise exception 'Existing payment must be checked first';
  end if;
  update public.onboarding_sessions
    set payment_mode = p_payment_mode,
        status = 'payment_pending',
        updated_at = pg_catalog.now()
    where id = v_session.id;

  return query select v_session.business_id, v_session.selected_plan,
    v_profile.mobile, v_profile.full_name, v_profile.email, v_session.payment_reference;
end;
$$;

create or replace function public.record_trustit_payment_session(
  p_user_id uuid,
  p_payment_reference text,
  p_payment_session_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.onboarding_sessions%rowtype;
  v_amount numeric(10, 2);
begin
  if p_payment_reference is null or length(p_payment_reference) not between 1 and 250
    or p_payment_session_id is null or length(p_payment_session_id) not between 1 and 2048 then
    raise exception 'Invalid payment session';
  end if;
  select * into v_session from public.onboarding_sessions
    where user_id = p_user_id and status = 'payment_pending'
      and current_step = 'payment' and expires_at > pg_catalog.now()
    order by created_at desc limit 1 for update;
  if not found or v_session.business_id is null or v_session.selected_plan is null then
    raise exception 'Registration session expired';
  end if;
  if v_session.payment_reference is not null and v_session.payment_reference <> p_payment_reference then
    raise exception 'Another payment is already pending';
  end if;
  v_amount := case v_session.selected_plan when 'Basic' then 29 when 'Standard' then 49 when 'Premium' then 99 else null end;
  if v_amount is null then raise exception 'Invalid plan'; end if;

  update public.onboarding_sessions set payment_reference = p_payment_reference, updated_at = pg_catalog.now()
    where id = v_session.id;

  if v_session.payment_mode is distinct from 'one_time' then
    raise exception 'Recurring payments are unavailable';
  end if;
  insert into public.subscriptions (
    business_id, user_id, plan, amount, billing_cycle, payment_mode,
    status, payment_reference, mandate_status, auto_renew
  ) values (
    v_session.business_id, p_user_id, v_session.selected_plan, v_amount, 'monthly', 'one_time',
    'pending', p_payment_reference, 'not_requested', false
  ) on conflict (payment_reference) do nothing;
end;
$$;

create or replace function public.reserve_trustit_one_time_order(
  p_user_id uuid,
  p_order_id text
)
returns table (payment_reference text, is_new boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.onboarding_sessions%rowtype;
begin
  if p_order_id is null or p_order_id !~ '^rqr_[a-f0-9]{32}$' then
    raise exception 'Invalid payment reference';
  end if;
  select * into v_session from public.onboarding_sessions
    where user_id = p_user_id and payment_mode = 'one_time'
      and status = 'payment_pending' and current_step = 'payment'
      and expires_at > pg_catalog.now()
    order by created_at desc limit 1 for update;
  if not found or v_session.business_id is null or v_session.selected_plan is null then
    raise exception 'Registration session expired';
  end if;
  if v_session.payment_reference is not null then
    return query select v_session.payment_reference, false;
    return;
  end if;
  update public.onboarding_sessions
    set payment_reference = p_order_id, updated_at = pg_catalog.now()
    where id = v_session.id;
  return query select p_order_id, true;
end;
$$;

create or replace function public.finalize_trustit_one_time_payment(
  p_business_id text,
  p_cashfree_order_id text,
  p_plan text,
  p_amount numeric,
  p_currency text,
  p_paid_at timestamptz
)
returns table (result text, new_expiry date)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.onboarding_sessions%rowtype;
  v_applied text;
  v_expiry date;
  v_mapping_user_id uuid;
begin
  if p_business_id is null or p_cashfree_order_id !~ '^rqr_[a-f0-9]{32}$' then raise exception 'Invalid payment application'; end if;
  select * into v_session from public.onboarding_sessions
    where business_id = p_business_id and payment_mode = 'one_time'
      and payment_reference = p_cashfree_order_id
    for update;
  if not found or v_session.selected_plan is distinct from p_plan then raise exception 'Invalid payment application'; end if;

  -- Return/callback and webhook can arrive more than once or concurrently. Once
  -- completed, acknowledge the same verified order without touching expiry.
  if v_session.status = 'completed' and v_session.current_step = 'complete' then
    if not exists (
      select 1 from public.payment_records as payment
      where payment.cashfree_order_id = p_cashfree_order_id
        and payment.business_id = p_business_id and payment.plan = p_plan
        and payment.amount = p_amount and payment.currency = p_currency
        and payment.payment_status = 'applied'
    ) then raise exception 'Invalid completed payment'; end if;
    select business.expiry into v_expiry from public.businesses as business
      where business.id = p_business_id and business.status = 'active'
        and business.qr_status = 'active' and business.merchant_status = 'active';
    if v_expiry is null then raise exception 'Invalid completed business'; end if;
    return query select 'already_applied'::text, v_expiry;
    return;
  end if;
  if v_session.status is distinct from 'payment_pending'
    or v_session.current_step is distinct from 'payment' then
    raise exception 'Invalid payment application';
  end if;

  select result into v_applied from public.apply_verified_cashfree_payment(
    p_business_id, p_cashfree_order_id, p_plan, p_amount, p_currency, p_paid_at
  );

  select merchant.user_id into v_mapping_user_id from public.merchant_accounts as merchant
    where merchant.business_id = p_business_id;
  if v_mapping_user_id is null then
    perform public.provision_merchant_account(p_business_id, v_session.user_id);
  elsif v_mapping_user_id <> v_session.user_id then
    raise exception 'Invalid merchant mapping';
  end if;

  select business.expiry into v_expiry from public.businesses as business where business.id = p_business_id for update;
  update public.businesses set status = 'active', qr_status = 'active'
    where id = p_business_id and merchant_status = 'active';
  if not found then raise exception 'Unable to activate business'; end if;

  update public.subscriptions set status = 'active', starts_at = coalesce(starts_at, p_paid_at, pg_catalog.now()),
    expires_at = v_expiry::timestamptz, updated_at = pg_catalog.now()
    where payment_reference = p_cashfree_order_id and user_id = v_session.user_id
      and business_id = p_business_id and plan = p_plan and amount = p_amount;
  if not found then raise exception 'Unable to activate subscription'; end if;

  update public.onboarding_sessions set status = 'completed', current_step = 'complete', updated_at = pg_catalog.now()
    where id = v_session.id;
  return query select v_applied, v_expiry;
end;
$$;

revoke all on function public.complete_trustit_profile(uuid, text) from public, anon, authenticated;
revoke all on function public.create_trustit_business_for_onboarding(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.select_trustit_plan(uuid, text) from public, anon, authenticated;
revoke all on function public.prepare_trustit_payment(uuid, text) from public, anon, authenticated;
revoke all on function public.record_trustit_payment_session(uuid, text, text) from public, anon, authenticated;
revoke all on function public.reserve_trustit_one_time_order(uuid, text) from public, anon, authenticated;
revoke all on function public.finalize_trustit_one_time_payment(text, text, text, numeric, text, timestamptz) from public, anon, authenticated;

grant execute on function public.complete_trustit_profile(uuid, text) to service_role;
grant execute on function public.create_trustit_business_for_onboarding(uuid, text, text, text, text) to service_role;
grant execute on function public.select_trustit_plan(uuid, text) to service_role;
grant execute on function public.prepare_trustit_payment(uuid, text) to service_role;
grant execute on function public.record_trustit_payment_session(uuid, text, text) to service_role;
grant execute on function public.reserve_trustit_one_time_order(uuid, text) to service_role;
grant execute on function public.finalize_trustit_one_time_payment(text, text, text, numeric, text, timestamptz) to service_role;
