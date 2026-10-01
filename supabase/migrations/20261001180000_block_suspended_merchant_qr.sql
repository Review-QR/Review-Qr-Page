-- A suspended merchant must not keep serving an active QR or accumulating scans.
-- Preserve the existing public QR response shape for all other business states.
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
    and business.deleted_at is null
    and business.merchant_status is distinct from 'suspended';
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
    and business.merchant_status is distinct from 'suspended'
    and pg_catalog.lower(coalesce(business.qr_status, 'disabled')) = 'active'
    and (business.expiry is null or business.expiry >= current_date);
$function$;

revoke all on function public.get_business_for_qr(text)
  from public, authenticated, service_role;
grant execute on function public.get_business_for_qr(text) to anon;

revoke all on function public.increment_business_scan(text)
  from public, authenticated, service_role;
grant execute on function public.increment_business_scan(text) to anon;
