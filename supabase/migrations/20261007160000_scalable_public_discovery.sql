-- Shared canonical city keys for public discovery and sharded sitemap queries.
-- Only eligible, verified locations participate in collision detection.
create or replace function public.trustit_public_eligible_city_keys()
returns table (
  base_city_slug text,
  state_slug text,
  district_slug text,
  city_slug text
)
language sql
stable
security definer
set search_path = ''
as $$
  with eligible_locations as (
    select distinct
      public.trustit_public_slug(b.city) as base_city_slug,
      public.trustit_public_slug(b.state) as state_slug,
      coalesce(nullif(public.trustit_public_slug(b.district), 'business'), '') as district_slug
    from public.businesses b
    where b.deleted_at is null
      and b.status in ('active', 'expiring soon')
      and b.merchant_status = 'active'
      and b.qr_status = 'active'
      and (b.expiry is null or b.expiry >= current_date)
      and b.discovery_location_verified_at is not null
      and btrim(coalesce(b.city, '')) <> ''
      and btrim(coalesce(b.state, '')) <> ''
      and b.pincode ~ '^[0-9]{6}$'
      and public.trustit_public_slug(b.city) <> 'business'
  ), city_groups as (
    select base_city_slug,
           count(distinct state_slug) as state_count,
           count(distinct (state_slug, district_slug)) as location_count
    from eligible_locations
    group by base_city_slug
  )
  select location.base_city_slug,
         location.state_slug,
         location.district_slug,
         case
           when group_counts.location_count = 1 then location.base_city_slug
           when group_counts.state_count > 1 then location.base_city_slug || '-' || location.state_slug
           else location.base_city_slug || '-' || location.state_slug || '-' || coalesce(nullif(location.district_slug, ''), 'location')
         end as city_slug
  from eligible_locations location
  join city_groups group_counts using (base_city_slug)
$$;
revoke all on function public.trustit_public_eligible_city_keys() from public, anon, authenticated, service_role;

-- One service-role call returns a full category batch and its canonical city slug.
create or replace function public.get_public_trustit_discovery_businesses(
  p_city_slug text,
  p_business_types text[]
)
returns table (
  business_id text, name text, type text, slug text, address text,
  locality text, city text, district text, state text, pincode text,
  location_latitude double precision, location_longitude double precision,
  review_link text, review_count bigint, rating_average numeric,
  latest_submitted_at timestamptz, public_city_slug text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_city_slug is null or p_city_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or p_business_types is null or pg_catalog.cardinality(p_business_types) < 1
    or pg_catalog.cardinality(p_business_types) > 100 then
    raise exception 'Invalid public discovery request';
  end if;

  return query
  with requested_types as (
    select distinct requested.business_type
    from pg_catalog.unnest(p_business_types) as requested(business_type)
  )
  select b.id, b.name, b.type, slug.slug, b.address,
         b.locality, b.city, b.district, b.state, b.pincode,
         b.location_latitude, b.location_longitude, b.review_link,
         coalesce(reviews.review_count, 0)::bigint,
         reviews.rating_average,
         reviews.latest_submitted_at,
         city_keys.city_slug
  from public.businesses b
  join public.business_public_slugs slug on slug.business_id = b.id
  join requested_types requested on lower(requested.business_type) = lower(b.type)
  join public.trustit_public_eligible_city_keys() city_keys
    on city_keys.base_city_slug = public.trustit_public_slug(b.city)
   and city_keys.state_slug = public.trustit_public_slug(b.state)
   and city_keys.district_slug = coalesce(nullif(public.trustit_public_slug(b.district), 'business'), '')
  left join lateral (
    select count(*)::bigint as review_count,
           round(avg(r.rating)::numeric, 3) as rating_average,
           max(r.submitted_at) as latest_submitted_at
    from public.trustit_reviews r
    join public.review_sessions rs on rs.id = r.review_session_id and rs.business_id = r.business_id
    where r.business_id = b.id and r.status = 'submitted'
      and rs.review_status = 'submitted' and rs.trustit_status = 'submitted'
  ) reviews on true
  where b.deleted_at is null
    and b.status in ('active', 'expiring soon')
    and b.merchant_status = 'active'
    and b.qr_status = 'active'
    and (b.expiry is null or b.expiry >= current_date)
    and b.discovery_location_verified_at is not null
    and btrim(coalesce(b.city, '')) <> ''
    and btrim(coalesce(b.state, '')) <> ''
    and b.pincode ~ '^[0-9]{6}$'
    and slug.slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and city_keys.city_slug = p_city_slug
  order by b.name, slug.slug;
end;
$$;
revoke all on function public.get_public_trustit_discovery_businesses(text, text[]) from public, anon, authenticated;
grant execute on function public.get_public_trustit_discovery_businesses(text, text[]) to service_role;

create or replace function public.get_public_trustit_city_exists(p_city_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_city_slug is not null
     and p_city_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     and exists (select 1 from public.trustit_public_eligible_city_keys() city where city.city_slug = p_city_slug)
$$;
revoke all on function public.get_public_trustit_city_exists(text) from public, anon, authenticated;
grant execute on function public.get_public_trustit_city_exists(text) to service_role;

-- Sitemap RPCs are paginated at 20,000 business/category rows per shard. Each
-- row can produce at most one profile and one listing URL (40,000 URLs/shard).
create or replace function public.get_public_trustit_sitemap_entry_count(
  p_business_types text[],
  p_category_slugs text[],
  p_primary_category_slugs text[]
)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_business_types is null or p_category_slugs is null or p_primary_category_slugs is null
    or pg_catalog.cardinality(p_business_types) <> pg_catalog.cardinality(p_category_slugs)
    or pg_catalog.cardinality(p_business_types) <> pg_catalog.cardinality(p_primary_category_slugs)
    or pg_catalog.cardinality(p_business_types) > 100 then
    raise exception 'Invalid public sitemap request';
  end if;

  return (
    with requested_categories as (
      select distinct p_business_types[array_index] as business_type,
                      p_category_slugs[array_index] as category_slug,
                      p_primary_category_slugs[array_index] as primary_category_slug
      from pg_catalog.generate_subscripts(p_business_types, 1) as indexes(array_index)
    )
    select count(*)::bigint
    from (
      select distinct b.id, requested.category_slug
      from public.businesses b
      join public.business_public_slugs slug on slug.business_id = b.id
      join requested_categories requested on lower(requested.business_type) = lower(b.type)
      join public.trustit_public_eligible_city_keys() city_keys
        on city_keys.base_city_slug = public.trustit_public_slug(b.city)
       and city_keys.state_slug = public.trustit_public_slug(b.state)
       and city_keys.district_slug = coalesce(nullif(public.trustit_public_slug(b.district), 'business'), '')
      where b.deleted_at is null
        and b.status in ('active', 'expiring soon')
        and b.merchant_status = 'active'
        and b.qr_status = 'active'
        and (b.expiry is null or b.expiry >= current_date)
        and b.discovery_location_verified_at is not null
        and btrim(coalesce(b.city, '')) <> ''
        and btrim(coalesce(b.state, '')) <> ''
        and b.pincode ~ '^[0-9]{6}$'
        and slug.slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ) eligible
  );
end;
$$;
revoke all on function public.get_public_trustit_sitemap_entry_count(text[], text[], text[]) from public, anon, authenticated;
grant execute on function public.get_public_trustit_sitemap_entry_count(text[], text[], text[]) to service_role;

create or replace function public.get_public_trustit_sitemap_entries_page(
  p_business_types text[],
  p_category_slugs text[],
  p_primary_category_slugs text[],
  p_offset bigint,
  p_limit integer
)
returns table (
  city_slug text,
  category_slug text,
  business_slug text,
  primary_category_slug text,
  category_first boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_business_types is null or p_category_slugs is null or p_primary_category_slugs is null
    or pg_catalog.cardinality(p_business_types) <> pg_catalog.cardinality(p_category_slugs)
    or pg_catalog.cardinality(p_business_types) <> pg_catalog.cardinality(p_primary_category_slugs)
    or pg_catalog.cardinality(p_business_types) > 100
    or p_offset is null or p_offset < 0 or p_offset > 100000000
    or p_limit is null or p_limit < 1 or p_limit > 20000 then
    raise exception 'Invalid public sitemap page request';
  end if;

  return query
  with requested_categories as (
    select distinct p_business_types[array_index] as business_type,
                    p_category_slugs[array_index] as category_slug,
                    p_primary_category_slugs[array_index] as primary_category_slug
    from pg_catalog.generate_subscripts(p_business_types, 1) as indexes(array_index)
  ), eligible as (
    select city_keys.city_slug,
           requested.category_slug,
           slug.slug as business_slug,
           requested.primary_category_slug,
           row_number() over (partition by city_keys.city_slug, requested.category_slug order by slug.slug) = 1 as category_first
    from public.businesses b
    join public.business_public_slugs slug on slug.business_id = b.id
    join requested_categories requested on lower(requested.business_type) = lower(b.type)
    join public.trustit_public_eligible_city_keys() city_keys
      on city_keys.base_city_slug = public.trustit_public_slug(b.city)
     and city_keys.state_slug = public.trustit_public_slug(b.state)
     and city_keys.district_slug = coalesce(nullif(public.trustit_public_slug(b.district), 'business'), '')
    where b.deleted_at is null
      and b.status in ('active', 'expiring soon')
      and b.merchant_status = 'active'
      and b.qr_status = 'active'
      and (b.expiry is null or b.expiry >= current_date)
      and b.discovery_location_verified_at is not null
      and btrim(coalesce(b.city, '')) <> ''
      and btrim(coalesce(b.state, '')) <> ''
      and b.pincode ~ '^[0-9]{6}$'
      and slug.slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  )
  select eligible.city_slug, eligible.category_slug, eligible.business_slug,
         eligible.primary_category_slug, eligible.category_first
  from eligible
  order by eligible.city_slug, eligible.category_slug, eligible.business_slug
  offset p_offset limit p_limit;
end;
$$;
revoke all on function public.get_public_trustit_sitemap_entries_page(text[], text[], text[], bigint, integer) from public, anon, authenticated;
grant execute on function public.get_public_trustit_sitemap_entries_page(text[], text[], text[], bigint, integer) to service_role;
