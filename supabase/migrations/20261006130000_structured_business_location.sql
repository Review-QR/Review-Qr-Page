alter table public.businesses
  add column locality text,
  add column city text,
  add column district text,
  add column state text,
  add column pincode text,
  add constraint businesses_locality_length_check
    check (locality is null or (length(btrim(locality)) between 1 and 160)),
  add constraint businesses_city_length_check
    check (city is null or (length(btrim(city)) between 1 and 160)),
  add constraint businesses_district_length_check
    check (district is null or (length(btrim(district)) between 1 and 160)),
  add constraint businesses_state_length_check
    check (state is null or (length(btrim(state)) between 1 and 100)),
  add constraint businesses_pincode_format_check
    check (pincode is null or pincode ~ '^[0-9]{6}$');

create index businesses_city_type_discovery_idx
  on public.businesses (lower(city), type)
  where city is not null and deleted_at is null;

create or replace function public.update_merchant_business_profile_with_location(
  p_name text,
  p_type text,
  p_owner text,
  p_address text,
  p_review_link text,
  p_locality text,
  p_city text,
  p_district text,
  p_state text,
  p_pincode text
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
     ))
     or (p_locality is not null and (length(btrim(p_locality)) not between 1 and 160))
     or (p_city is not null and (length(btrim(p_city)) not between 1 and 160))
     or (p_district is not null and (length(btrim(p_district)) not between 1 and 160))
     or (p_state is not null and (length(btrim(p_state)) not between 1 and 100))
     or (p_pincode is not null and p_pincode !~ '^[0-9]{6}$') then
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
         review_link = nullif(btrim(p_review_link), ''),
         locality = nullif(btrim(p_locality), ''),
         city = nullif(btrim(p_city), ''),
         district = nullif(btrim(p_district), ''),
         state = nullif(btrim(p_state), ''),
         pincode = nullif(btrim(p_pincode), '')
   where business.id = v_business_id
     and business.merchant_status = 'active'
     and business.deleted_at is null;

  if not found then
    raise exception 'Active merchant business required';
  end if;
end;
$function$;

revoke all on function public.update_merchant_business_profile_with_location(text, text, text, text, text, text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.update_merchant_business_profile_with_location(text, text, text, text, text, text, text, text, text, text)
  to authenticated;
