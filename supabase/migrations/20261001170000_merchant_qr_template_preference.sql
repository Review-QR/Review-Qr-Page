alter table public.businesses
  add column qr_template text not null default 'template_1'
  check (qr_template in ('template_1', 'template_2', 'template_3', 'template_4', 'template_5'));

create or replace function public.set_merchant_qr_template(p_template_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_business_id text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authenticated merchant required';
  end if;

  if p_template_id is null or p_template_id not in (
    'template_1', 'template_2', 'template_3', 'template_4', 'template_5'
  ) then
    raise exception 'Invalid QR template';
  end if;

  select business.id
    into v_business_id
    from public.merchant_accounts as account
    join public.businesses as business on business.id = account.business_id
   where account.user_id = (select auth.uid())
     and business.merchant_status = 'active'
     and business.deleted_at is null
   for update of business;

  if v_business_id is null then
    raise exception 'Active merchant business required';
  end if;

  update public.businesses as business
     set qr_template = p_template_id
   where business.id = v_business_id
     and business.merchant_status = 'active'
     and business.deleted_at is null;

  if not found then
    raise exception 'Active merchant business required';
  end if;

  return p_template_id;
end;
$function$;

revoke all on function public.set_merchant_qr_template(text)
  from public, anon, authenticated, service_role;
grant execute on function public.set_merchant_qr_template(text) to authenticated;
