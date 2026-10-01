-- Durable scan timestamps are required for calendar-month and range analytics.
-- The existing business counter remains the source for lifetime total scans.
create table public.business_scan_events (
  id bigint generated always as identity primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  scanned_at timestamptz not null default pg_catalog.now()
);

create index business_scan_events_business_time_idx
  on public.business_scan_events (business_id, scanned_at desc);

alter table public.business_scan_events enable row level security;
revoke all on table public.business_scan_events from public, anon, authenticated, service_role;

create or replace function public.increment_business_scan(p_business_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_business_id text;
begin
  update public.businesses as business
  set scans = coalesce(business.scans, 0) + 1
  where business.id = p_business_id
    and business.deleted_at is null
    and pg_catalog.lower(coalesce(business.qr_status, 'disabled')) = 'active'
    and (business.expiry is null or business.expiry >= current_date)
  returning business.id into v_business_id;

  if found then
    insert into public.business_scan_events (business_id) values (v_business_id);
  end if;
end;
$function$;

create or replace function public.get_merchant_dashboard_stats(p_business_id text)
returns table (
  total_scans bigint,
  this_month_scans bigint,
  total_reviews bigint,
  average_rating numeric,
  rating_5_count bigint,
  rating_4_count bigint,
  rating_3_count bigint,
  rating_2_count bigint,
  rating_1_count bigint,
  experience_counts jsonb
)
language sql
security definer
set search_path = ''
as $function$
  select
    coalesce(business.scans, 0)::bigint,
    (select pg_catalog.count(*)
       from public.business_scan_events as event
      where event.business_id = business.id
        and event.scanned_at >= (
          pg_catalog.date_trunc('month', pg_catalog.timezone('Asia/Kolkata', pg_catalog.now()))
          at time zone 'Asia/Kolkata'
        )
        and event.scanned_at <= pg_catalog.now()),
    review_stats.total_reviews,
    review_stats.average_rating,
    review_stats.rating_5_count,
    review_stats.rating_4_count,
    review_stats.rating_3_count,
    review_stats.rating_2_count,
    review_stats.rating_1_count,
    experience_stats.experience_counts
  from public.businesses as business
  cross join lateral (
    select
      pg_catalog.count(*)::bigint as total_reviews,
      pg_catalog.avg(review.rating)::numeric as average_rating,
      pg_catalog.count(*) filter (where review.rating = 5)::bigint as rating_5_count,
      pg_catalog.count(*) filter (where review.rating = 4)::bigint as rating_4_count,
      pg_catalog.count(*) filter (where review.rating = 3)::bigint as rating_3_count,
      pg_catalog.count(*) filter (where review.rating = 2)::bigint as rating_2_count,
      pg_catalog.count(*) filter (where review.rating = 1)::bigint as rating_1_count
    from public.trustit_reviews as review
    where review.business_id = business.id and review.status = 'submitted'
  ) as review_stats
  cross join lateral (
    select coalesce(
      pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object('label', counts.label, 'count', counts.selection_count)
        order by counts.selection_count desc, counts.label
      ), '[]'::jsonb
    ) as experience_counts
    from (
      select experience.category_label_snapshot as label,
             pg_catalog.count(*)::bigint as selection_count
      from public.review_session_experiences as experience
      join public.trustit_reviews as review
        on review.review_session_id = experience.review_session_id
       and review.business_id = experience.business_id
       and review.status = 'submitted'
      where experience.business_id = business.id
        and experience.category_label_snapshot is not null
      group by experience.category_label_snapshot
    ) as counts
  ) as experience_stats
  where business.id = p_business_id
    and business.merchant_status = 'active'
    and business.deleted_at is null
    and exists (
      select 1 from public.merchant_accounts as merchant
      where merchant.business_id = business.id
        and merchant.user_id = (select auth.uid())
    );
$function$;

revoke all on function public.get_merchant_dashboard_stats(text)
  from public, anon, service_role;
grant execute on function public.get_merchant_dashboard_stats(text) to authenticated;

create or replace function public.get_merchant_scan_activity(
  p_business_id text,
  p_days integer
)
returns table (scan_date date, scans bigint)
language sql
security definer
set search_path = ''
as $function$
  select pg_catalog.timezone('Asia/Kolkata', event.scanned_at)::date,
         pg_catalog.count(*)::bigint
  from public.business_scan_events as event
  join public.businesses as business on business.id = event.business_id
  where p_days in (7, 30, 90)
    and business.id = p_business_id
    and business.merchant_status = 'active'
    and business.deleted_at is null
    and exists (
      select 1 from public.merchant_accounts as merchant
      where merchant.business_id = business.id
        and merchant.user_id = (select auth.uid())
    )
    and event.scanned_at >= (
      ((pg_catalog.timezone('Asia/Kolkata', pg_catalog.now()))::date - (p_days - 1))::timestamp
      at time zone 'Asia/Kolkata'
    )
    and event.scanned_at <= pg_catalog.now()
  group by pg_catalog.timezone('Asia/Kolkata', event.scanned_at)::date
  order by pg_catalog.timezone('Asia/Kolkata', event.scanned_at)::date;
$function$;

revoke all on function public.get_merchant_scan_activity(text, integer)
  from public, anon, service_role;
grant execute on function public.get_merchant_scan_activity(text, integer) to authenticated;
