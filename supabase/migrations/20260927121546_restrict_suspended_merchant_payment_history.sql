drop policy if exists payment_records_select_own_business
  on public.payment_records;

create policy payment_records_select_own_business
  on public.payment_records for select to authenticated
  using (
    exists (
      select 1
      from public.merchant_accounts as merchant
      join public.businesses as business
        on business.id = merchant.business_id
      where merchant.business_id = payment_records.business_id
        and merchant.user_id = (select auth.uid())
        and business.merchant_status = 'active'
    )
  );;
