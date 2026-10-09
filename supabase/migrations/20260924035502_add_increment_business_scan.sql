create or replace function public.increment_business_scan(p_business_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.businesses
  set scans = coalesce(scans, 0) + 1
  where id = p_business_id
    and lower(coalesce(qr_status, 'disabled')) = 'active'
    and (expiry is null or expiry >= current_date);
$$;

revoke all on function public.increment_business_scan(text) from public;
grant execute on function public.increment_business_scan(text) to anon, authenticated;;
