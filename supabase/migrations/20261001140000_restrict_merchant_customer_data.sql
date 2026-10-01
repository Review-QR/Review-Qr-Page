-- Protect Trustit customer PII from merchant accounts.
-- Merchants may only retrieve the non-sensitive review summary through
-- get_merchant_trustit_reviews().

drop policy if exists review_customer_profiles_select_own_business on public.review_customer_profiles;
drop policy if exists review_family_members_select_own_business on public.review_family_members;
drop policy if exists review_special_occasions_select_own_business on public.review_special_occasions;
drop policy if exists review_generations_select_own_business on public.review_generations;
drop policy if exists review_session_experiences_select_own_business on public.review_session_experiences;
drop policy if exists review_sessions_select_own_business on public.review_sessions;
drop policy if exists trustit_reviews_select_own_business on public.trustit_reviews;

revoke all on table
  public.review_customer_profiles,
  public.review_family_members,
  public.review_special_occasions,
  public.review_generations,
  public.review_session_experiences,
  public.review_sessions,
  public.trustit_reviews
from anon, authenticated;

grant select on table
  public.review_customer_profiles,
  public.review_family_members,
  public.review_special_occasions,
  public.review_generations,
  public.review_session_experiences,
  public.review_sessions,
  public.trustit_reviews
to authenticated;

create policy review_customer_profiles_select_active_admin
on public.review_customer_profiles
for select to authenticated
using (
  exists (
    select 1 from public.admin_users admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
  )
);

create policy review_family_members_select_active_admin
on public.review_family_members
for select to authenticated
using (
  exists (
    select 1 from public.admin_users admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
  )
);

create policy review_special_occasions_select_active_admin
on public.review_special_occasions
for select to authenticated
using (
  exists (
    select 1 from public.admin_users admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
  )
);

create policy review_generations_select_active_admin
on public.review_generations
for select to authenticated
using (
  exists (
    select 1 from public.admin_users admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
  )
);

create policy review_session_experiences_select_active_admin
on public.review_session_experiences
for select to authenticated
using (
  exists (
    select 1 from public.admin_users admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
  )
);

create policy review_sessions_select_active_admin
on public.review_sessions
for select to authenticated
using (
  exists (
    select 1 from public.admin_users admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
  )
);

create policy trustit_reviews_select_active_admin
on public.trustit_reviews
for select to authenticated
using (
  exists (
    select 1 from public.admin_users admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
  )
);

create or replace function public.get_merchant_trustit_reviews(p_business_id text)
returns table (
  review_id uuid,
  customer_name text,
  rating smallint,
  review_text text,
  selected_experiences text[],
  submitted_at timestamptz
)
language sql
security definer
set search_path = ''
as $function$
  select
    review.id,
    review.customer_name,
    review.rating,
    review.review_text,
    coalesce(
      array_agg(experience.category_label_snapshot order by experience.category_label_snapshot)
        filter (where experience.category_label_snapshot is not null),
      array[]::text[]
    ),
    review.submitted_at
  from public.trustit_reviews review
  left join public.review_session_experiences experience
    on experience.review_session_id = review.review_session_id
   and experience.business_id = review.business_id
  where review.business_id = p_business_id
    and review.status = 'submitted'
    and exists (
      select 1
      from public.merchant_accounts merchant
      join public.businesses business on business.id = merchant.business_id
      where merchant.business_id = p_business_id
        and merchant.user_id = (select auth.uid())
        and business.merchant_status = 'active'
    )
  group by review.id, review.customer_name, review.rating, review.review_text, review.submitted_at
  order by review.submitted_at desc;
$function$;

revoke all on function public.get_merchant_trustit_reviews(text) from public, anon;
grant execute on function public.get_merchant_trustit_reviews(text) to authenticated;
