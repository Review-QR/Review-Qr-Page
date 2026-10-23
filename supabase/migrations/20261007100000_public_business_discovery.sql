-- Public discovery uses a curated service-role-only RPC. It does not grant
-- anonymous access to businesses, reviews, or review sessions.
create or replace function public.trustit_public_slug(p_value text)
returns text
language sql immutable
set search_path = ''
as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(lower(coalesce(p_value, '')), '[^a-z0-9]+', '-', 'g')), ''), 'business');
$$;
revoke all on function public.trustit_public_slug(text) from public, anon, authenticated;

create table public.business_public_slugs (
  business_id text primary key references public.businesses(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default pg_catalog.now()
);
alter table public.business_public_slugs enable row level security;
revoke all on table public.business_public_slugs from public, anon, authenticated, service_role;

create or replace function public.assign_business_public_slug()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_base text := public.trustit_public_slug(new.name);
  v_slug text := v_base;
  v_suffix integer := 2;
begin
  perform pg_catalog.pg_advisory_xact_lock(741202610);
  while exists (select 1 from public.business_public_slugs s where s.slug = v_slug) loop
    v_slug := v_base || '-' || v_suffix::text;
    v_suffix := v_suffix + 1;
  end loop;
  insert into public.business_public_slugs(business_id, slug) values (new.id, v_slug)
  on conflict (business_id) do nothing;
  return new;
end;
$$;
revoke all on function public.assign_business_public_slug() from public, anon, authenticated, service_role;

-- Deterministic backfill: IDs order duplicate-name suffixes consistently.
do $$
declare r record; v_base text; v_slug text; v_suffix integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(741202610);
  for r in select id, name from public.businesses order by id loop
    if not exists(select 1 from public.business_public_slugs where business_id = r.id) then
      v_base := public.trustit_public_slug(r.name); v_slug := v_base; v_suffix := 2;
      while exists(select 1 from public.business_public_slugs where slug = v_slug) loop
        v_slug := v_base || '-' || v_suffix::text; v_suffix := v_suffix + 1;
      end loop;
      insert into public.business_public_slugs(business_id, slug) values(r.id, v_slug);
    end if;
  end loop;
end;
$$;
create trigger businesses_assign_public_slug
after insert on public.businesses
for each row execute function public.assign_business_public_slug();

create index if not exists trustit_reviews_public_aggregate_idx
  on public.trustit_reviews(business_id, submitted_at desc)
  where status = 'submitted';

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
    and lower(b.type) = lower(p_business_type)
    and b.city is not null
    and public.trustit_public_slug(b.city) = p_city_slug
  order by b.id;
$$;
revoke all on function public.get_public_trustit_businesses(text, text) from public, anon, authenticated;
grant execute on function public.get_public_trustit_businesses(text, text) to service_role;
