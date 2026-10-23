alter table public.businesses
  add column location_latitude double precision,
  add column location_longitude double precision,
  add column location_captured_at timestamptz,
  add constraint businesses_location_coordinates_range_check
    check (
      (location_latitude is null or location_latitude between -90 and 90)
      and (location_longitude is null or location_longitude between -180 and 180)
      and ((location_latitude is null) = (location_longitude is null))
      and ((location_latitude is null) = (location_captured_at is null))
    );

create or replace function public.update_merchant_business_profile(
  p_name text,
  p_type text,
  p_owner text,
  p_address text,
  p_review_link text
)
returns void
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

  if nullif(btrim(p_name), '') is null or length(btrim(p_name)) > 200
     or nullif(btrim(p_type), '') is null or length(btrim(p_type)) > 120
     or nullif(btrim(p_owner), '') is null or length(btrim(p_owner)) > 200
     or nullif(btrim(p_address), '') is null or length(btrim(p_address)) > 1000
     or (p_review_link is not null and (
       length(p_review_link) > 2048
       or p_review_link !~* '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$'
     )) then
    raise exception 'Invalid merchant business profile';
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
     set name = btrim(p_name),
         type = btrim(p_type),
         owner = btrim(p_owner),
         address = btrim(p_address),
         review_link = nullif(btrim(p_review_link), '')
   where business.id = v_business_id
     and business.merchant_status = 'active'
     and business.deleted_at is null;

  if not found then
    raise exception 'Active merchant business required';
  end if;
end;
$function$;

revoke all on function public.update_merchant_business_profile(text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.update_merchant_business_profile(text, text, text, text, text)
  to authenticated;

create or replace function public.set_merchant_business_location(
  p_latitude double precision,
  p_longitude double precision
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_business_id text;
  v_captured_at timestamptz := now();
begin
  if (select auth.uid()) is null then
    raise exception 'Authenticated merchant required';
  end if;
  if p_latitude is null or p_longitude is null
     or p_latitude not between -90 and 90
     or p_longitude not between -180 and 180 then
    raise exception 'Valid location coordinates are required';
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
     set location_latitude = p_latitude,
         location_longitude = p_longitude,
         location_captured_at = v_captured_at
   where business.id = v_business_id
     and business.merchant_status = 'active'
     and business.deleted_at is null;

  if not found then
    raise exception 'Active merchant business required';
  end if;
  return v_captured_at;
end;
$function$;

revoke all on function public.set_merchant_business_location(double precision, double precision)
  from public, anon, authenticated, service_role;
grant execute on function public.set_merchant_business_location(double precision, double precision)
  to authenticated;
