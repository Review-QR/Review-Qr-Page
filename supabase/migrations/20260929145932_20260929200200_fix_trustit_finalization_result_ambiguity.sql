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

  select payment_result.result
    into v_applied
    from public.apply_verified_cashfree_payment(
      p_business_id, p_cashfree_order_id, p_plan, p_amount, p_currency, p_paid_at
    ) as payment_result;

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

revoke all on function public.finalize_trustit_one_time_payment(text, text, text, numeric, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.finalize_trustit_one_time_payment(text, text, text, numeric, text, timestamptz)
  to service_role;;
