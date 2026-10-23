-- Correct paired array handling for PostgreSQL's set-returning functions.
create or replace function public.get_public_trustit_sitemap_entries(
  p_business_types text[],
  p_category_slugs text[],
  p_limit integer default 24000
)
returns table (
  city_slug text,
  category_slug text,
  business_slug text,
  category_first boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_business_types is null or p_category_slugs is null
    or pg_catalog.cardinality(p_business_types) <> pg_catalog.cardinality(p_category_slugs)
    or pg_catalog.cardinality(p_business_types) > 100
    or p_limit is null or p_limit < 1 or p_limit > 24000 then
    raise exception 'Invalid public sitemap request';
  end if;

  return query
  with requested_types as (
    select distinct p_business_types[array_index] as business_type,
                    p_category_slugs[array_index] as category
      from pg_catalog.generate_subscripts(p_business_types, 1) as indexes(array_index)
  ), eligible as (
    select public.trustit_public_slug(b.city) as city_slug,
           requested.category as category_slug,
           slug.slug as business_slug,
           row_number() over (
             partition by public.trustit_public_slug(b.city), requested.category
             order by slug.slug
           ) = 1 as category_first
      from public.businesses b
      join public.business_public_slugs slug on slug.business_id = b.id
      join requested_types requested on lower(requested.business_type) = lower(b.type)
     where b.deleted_at is null
       and b.status in ('active', 'expiring soon')
       and b.merchant_status = 'active'
       and b.qr_status = 'active'
       and (b.expiry is null or b.expiry >= current_date)
       and b.discovery_location_verified_at is not null
       and btrim(coalesce(b.city, '')) <> ''
       and btrim(coalesce(b.state, '')) <> ''
       and b.pincode ~ '^[0-9]{6}$'
  )
  select eligible.city_slug, eligible.category_slug, eligible.business_slug, eligible.category_first
    from eligible
   order by eligible.city_slug, eligible.category_slug, eligible.business_slug
   limit p_limit;
end;
$$;

revoke all on function public.get_public_trustit_sitemap_entries(text[], text[], integer)
  from public, anon, authenticated;
grant execute on function public.get_public_trustit_sitemap_entries(text[], text[], integer)
  to service_role;
