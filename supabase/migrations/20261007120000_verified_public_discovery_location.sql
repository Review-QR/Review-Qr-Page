-- Record that structured public-location fields were reviewed by the merchant
-- or administrator. Existing businesses remain unverified until reviewed.
alter table public.businesses
  add column discovery_location_verified_at timestamptz,
  add column discovery_location_verified_by uuid references auth.users(id) on delete set null,
  add column discovery_location_verification_source text
    check (discovery_location_verification_source in ('merchant_attested', 'admin_reviewed'));

create index businesses_verified_discovery_city_type_idx
  on public.businesses (lower(city), type)
  where discovery_location_verified_at is not null and deleted_at is null;

create or replace function public.invalidate_discovery_location_verification_on_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.locality, new.city, new.district, new.state, new.pincode)
      is distinct from (old.locality, old.city, old.district, old.state, old.pincode)
    and new.discovery_location_verified_at is not distinct from old.discovery_location_verified_at then
    new.discovery_location_verified_at := null;
    new.discovery_location_verified_by := null;
    new.discovery_location_verification_source := null;
  end if;
  return new;
end;
$$;
revoke all on function public.invalidate_discovery_location_verification_on_change() from public, anon, authenticated, service_role;
create trigger businesses_invalidate_discovery_location_verification
before update of locality, city, district, state, pincode on public.businesses
for each row execute function public.invalidate_discovery_location_verification_on_change();

create or replace function public.save_merchant_discovery_location(
  p_locality text,
  p_city text,
  p_district text,
  p_state text,
  p_pincode text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_business_id text;
  v_verified_at timestamptz := pg_catalog.now();
begin
  if v_user_id is null then raise exception 'Authenticated merchant required'; end if;
  if nullif(btrim(p_city), '') is null or length(btrim(p_city)) > 160
    or nullif(btrim(p_state), '') is null or length(btrim(p_state)) > 100
    or (p_locality is not null and length(btrim(p_locality)) not between 1 and 160)
    or (p_district is not null and length(btrim(p_district)) not between 1 and 160)
    or (p_pincode is not null and p_pincode !~ '^[0-9]{6}$') then
    raise exception 'Invalid public discovery location';
  end if;

  select business.id into v_business_id
    from public.merchant_accounts account
    join public.businesses business on business.id = account.business_id
   where account.user_id = v_user_id
     and business.merchant_status = 'active'
     and business.deleted_at is null
   for update of business;
  if v_business_id is null then raise exception 'Active merchant business required'; end if;

  update public.businesses business
     set locality = nullif(btrim(p_locality), ''),
         city = btrim(p_city),
         district = nullif(btrim(p_district), ''),
         state = btrim(p_state),
         pincode = nullif(btrim(p_pincode), ''),
         discovery_location_verified_at = v_verified_at,
         discovery_location_verified_by = v_user_id,
         discovery_location_verification_source = 'merchant_attested'
   where business.id = v_business_id
     and business.merchant_status = 'active'
     and business.deleted_at is null;
  if not found then raise exception 'Active merchant business required'; end if;
  return v_verified_at;
end;
$$;
revoke all on function public.save_merchant_discovery_location(text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.save_merchant_discovery_location(text, text, text, text, text)
  to authenticated;

create or replace function public.admin_save_business_discovery_location(
  p_business_id text,
  p_locality text,
  p_city text,
  p_district text,
  p_state text,
  p_pincode text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_verified_at timestamptz := pg_catalog.now();
begin
  if v_user_id is null or not exists (
    select 1 from public.admin_users admin
    where admin.user_id = v_user_id and admin.is_active = true
  ) then raise exception 'Active administrator required'; end if;
  if p_business_id is null or length(p_business_id) not between 1 and 128
    or nullif(btrim(p_city), '') is null or length(btrim(p_city)) > 160
    or nullif(btrim(p_state), '') is null or length(btrim(p_state)) > 100
    or (p_locality is not null and length(btrim(p_locality)) not between 1 and 160)
    or (p_district is not null and length(btrim(p_district)) not between 1 and 160)
    or (p_pincode is not null and p_pincode !~ '^[0-9]{6}$') then
    raise exception 'Invalid public discovery location';
  end if;

  update public.businesses business
     set locality = nullif(btrim(p_locality), ''),
         city = btrim(p_city),
         district = nullif(btrim(p_district), ''),
         state = btrim(p_state),
         pincode = nullif(btrim(p_pincode), ''),
         discovery_location_verified_at = v_verified_at,
         discovery_location_verified_by = v_user_id,
         discovery_location_verification_source = 'admin_reviewed'
   where business.id = p_business_id
     and business.deleted_at is null;
  if not found then raise exception 'Business not available'; end if;
  return v_verified_at;
end;
$$;
revoke all on function public.admin_save_business_discovery_location(text, text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_save_business_discovery_location(text, text, text, text, text, text)
  to authenticated;

-- City listing requires a reviewed usable location. The category is separately
-- restricted by the server to canonical BUSINESS_TYPES values.
create or replace function public.get_public_trustit_businesses(p_city_slug text, p_business_type text)
returns table (
  business_id text, name text, type text, slug text, address text,
  locality text, city text, district text, state text, pincode text,
  location_latitude double precision, location_longitude double precision,
  review_link text, review_count bigint, rating_average numeric,
  latest_submitted_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select b.id, b.name, b.type, s.slug, b.address, b.locality, b.city,
         b.district, b.state, b.pincode, b.location_latitude,
         b.location_longitude, b.review_link,
         coalesce(rv.review_count, 0)::bigint,
         rv.rating_average,
         rv.latest_submitted_at
  from public.businesses b
  join public.business_public_slugs s on s.business_id = b.id
  left join lateral (
    select count(*)::bigint review_count, round(avg(r.rating)::numeric, 3) rating_average,
           max(r.submitted_at) latest_submitted_at
    from public.trustit_reviews r
    join public.review_sessions rs on rs.id = r.review_session_id and rs.business_id = r.business_id
    where r.business_id = b.id and r.status = 'submitted'
      and rs.review_status = 'submitted' and rs.trustit_status = 'submitted'
  ) rv on true
  where b.deleted_at is null
    and b.status in ('active', 'expiring soon')
    and b.merchant_status = 'active'
    and b.qr_status = 'active'
    and (b.expiry is null or b.expiry >= current_date)
    and b.discovery_location_verified_at is not null
    and btrim(coalesce(b.city, '')) <> ''
    and btrim(coalesce(b.state, '')) <> ''
    and b.pincode ~ '^[0-9]{6}$'
    and lower(b.type) = lower(p_business_type)
    and public.trustit_public_slug(b.city) = p_city_slug
  order by b.id;
$$;
revoke all on function public.get_public_trustit_businesses(text, text) from public, anon, authenticated;
grant execute on function public.get_public_trustit_businesses(text, text) to service_role;
