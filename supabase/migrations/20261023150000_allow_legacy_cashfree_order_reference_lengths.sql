-- Keep the atomic application RPC aligned with the current and legacy signed order ID formats.
-- This updates the existing validation only; no payment or business data is changed.

create or replace function public.apply_verified_cashfree_payment(
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
  v_current_plan text;
  v_current_expiry date;
  v_today date;
  v_new_expiry date;
  v_current_plan_rank integer;
  v_selected_plan_rank integer;
  v_expected_amount numeric(10, 2);
  v_inserted_count integer;
  v_existing_status text;
  v_existing_business_id text;
  v_existing_plan text;
  v_existing_amount numeric(10, 2);
  v_existing_currency text;
begin
  if p_business_id is null or btrim(p_business_id) = '' then
    raise exception 'Invalid payment application';
  end if;

  if p_cashfree_order_id is null
    or p_cashfree_order_id !~ '^rqr_[a-f0-9]{32,34}$' then
    raise exception 'Invalid payment application';
  end if;

  if p_currency is distinct from 'INR' then
    raise exception 'Invalid payment application';
  end if;

  v_selected_plan_rank := case p_plan
    when 'Basic' then 1
    when 'Standard' then 2
    when 'Premium' then 3
    else null
  end;

  v_expected_amount := case p_plan
    when 'Basic' then 29.00
    when 'Standard' then 49.00
    when 'Premium' then 99.00
    else null
  end;

  if v_selected_plan_rank is null or p_amount is distinct from v_expected_amount then
    raise exception 'Invalid payment application';
  end if;

  select business.plan, business.expiry
    into v_current_plan, v_current_expiry
    from public.businesses as business
    where business.id = p_business_id
    for update;

  if not found then
    raise exception 'Invalid payment application';
  end if;

  v_current_plan_rank := case lower(btrim(coalesce(v_current_plan, '')))
    when 'basic' then 1
    when 'standard' then 2
    when 'premium' then 3
    else null
  end;

  insert into public.payment_records (
    business_id,
    cashfree_order_id,
    plan,
    amount,
    currency,
    payment_status,
    applied_at
  ) values (
    p_business_id,
    p_cashfree_order_id,
    p_plan,
    p_amount,
    p_currency,
    'applied',
    coalesce(p_paid_at, pg_catalog.now())
  ) on conflict (cashfree_order_id) do nothing;

  get diagnostics v_inserted_count = row_count;

  if v_inserted_count = 0 then
    select payment_records.payment_status,
           payment_records.business_id,
           payment_records.plan,
           payment_records.amount,
           payment_records.currency
      into v_existing_status,
           v_existing_business_id,
           v_existing_plan,
           v_existing_amount,
           v_existing_currency
      from public.payment_records
      where payment_records.cashfree_order_id = p_cashfree_order_id;

    if v_existing_status = 'applied'
      and v_existing_business_id = p_business_id
      and v_existing_plan = p_plan
      and v_existing_amount = p_amount
      and v_existing_currency = p_currency then
      return query select 'already_applied'::text, null::date;
      return;
    end if;

    raise exception 'Payment order already exists';
  end if;

  if v_current_plan_rank is null or v_selected_plan_rank < v_current_plan_rank then
    raise exception 'Invalid payment application';
  end if;

  v_today := (pg_catalog.now() at time zone 'UTC')::date;
  if v_current_expiry is null or v_current_expiry < v_today then
    v_new_expiry := v_today + 30;
  else
    v_new_expiry := v_current_expiry + 30;
  end if;

  update public.businesses
    set plan = p_plan,
        expiry = v_new_expiry
    where id = p_business_id;

  return query select 'applied'::text, v_new_expiry;
end;
$$;

revoke all on function public.apply_verified_cashfree_payment(text, text, text, numeric, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.apply_verified_cashfree_payment(text, text, text, numeric, text, timestamptz)
  to service_role;
