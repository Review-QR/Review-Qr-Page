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
set search_path = pg_catalog, public
as $function$
  select
    business.id,
    business.name,
    business.type,
    business.status,
    business.merchant_status,
    business.qr_status,
    business.expiry,
    business.review_link
  from public.businesses as business
  where business.id = p_business_id
    and business.status = 'active'
    and business.merchant_status = 'active'
    and business.qr_status = 'active'
    and (business.expiry is null or business.expiry >= current_date);
$function$;

revoke all on function public.get_trustit_review_business(text)
  from public, anon, authenticated, service_role;
grant execute on function public.get_trustit_review_business(text) to service_role;
