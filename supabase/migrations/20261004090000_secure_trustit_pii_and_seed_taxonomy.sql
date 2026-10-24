-- Restrict all raw Trustit session/review/profile data to active administrators.
-- Merchants continue to receive aggregate and review-card data through the
-- business-scoped SECURITY DEFINER RPCs already used by their dashboard.
drop policy if exists review_sessions_select_own_business on public.review_sessions;
drop policy if exists review_session_experiences_select_own_business on public.review_session_experiences;
drop policy if exists review_generations_select_own_business on public.review_generations;
drop policy if exists trustit_reviews_select_own_business on public.trustit_reviews;
drop policy if exists review_customer_profiles_select_own_business on public.review_customer_profiles;
drop policy if exists review_family_members_select_own_business on public.review_family_members;
drop policy if exists review_special_occasions_select_own_business on public.review_special_occasions;

revoke select on table
  public.review_sessions,
  public.review_session_experiences,
  public.review_generations,
  public.trustit_reviews,
  public.review_customer_profiles,
  public.review_family_members,
  public.review_special_occasions
from anon, authenticated;

grant select on table
  public.review_sessions,
  public.review_session_experiences,
  public.review_generations,
  public.trustit_reviews,
  public.review_customer_profiles,
  public.review_family_members,
  public.review_special_occasions
to authenticated;

create policy review_sessions_select_active_admin
  on public.review_sessions for select to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_session_experiences_select_active_admin
  on public.review_session_experiences for select to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_generations_select_active_admin
  on public.review_generations for select to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy trustit_reviews_select_active_admin
  on public.trustit_reviews for select to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_customer_profiles_select_active_admin
  on public.review_customer_profiles for select to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_family_members_select_active_admin
  on public.review_family_members for select to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_special_occasions_select_active_admin
  on public.review_special_occasions for select to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

-- Merchant review cards remain available without exposing customer names.
-- Drop/recreate is required because Postgres does not permit changing a
-- RETURNS TABLE row shape with CREATE OR REPLACE.
drop function if exists public.get_merchant_trustit_reviews(text);
create function public.get_merchant_trustit_reviews(p_business_id text)
returns table (
  review_id uuid,
  rating smallint,
  review_text text,
  selected_experiences text[],
  submitted_at timestamptz
)
language sql
security definer
set search_path = ''
as $function$
  select review.id, review.rating, review.review_text,
    coalesce(
      pg_catalog.array_agg(experience.category_label_snapshot order by experience.category_label_snapshot)
        filter (where experience.category_label_snapshot is not null),
      array[]::text[]
    ),
    review.submitted_at
  from public.trustit_reviews as review
  left join public.review_session_experiences as experience
    on experience.review_session_id = review.review_session_id
   and experience.business_id = review.business_id
  where review.business_id = p_business_id
    and review.status = 'submitted'
    and exists (
      select 1 from public.merchant_accounts as merchant
      join public.businesses as business on business.id = merchant.business_id
      where merchant.business_id = p_business_id
        and merchant.user_id = (select auth.uid())
        and business.merchant_status = 'active'
        and business.deleted_at is null
    )
  group by review.id, review.rating, review.review_text, review.submitted_at
  order by review.submitted_at desc;
$function$;

revoke all on function public.get_merchant_trustit_reviews(text)
  from public, anon, service_role;
grant execute on function public.get_merchant_trustit_reviews(text)
  to authenticated;

-- Add reusable category families for supported types without an existing
-- exact taxonomy. Business-type normalization maps every catalog entry to one
-- of these canonical values before querying this table.
insert into public.review_experience_categories (
  business_type, category_key, display_label, display_order, is_enabled
)
values
  ('Hotel', 'room_quality', 'Room Quality', 1, true),
  ('Hotel', 'cleanliness', 'Cleanliness', 2, true),
  ('Hotel', 'staff_service', 'Staff Service', 3, true),
  ('Hotel', 'check_in', 'Check-in Experience', 4, true),
  ('Hotel', 'amenities', 'Amenities', 5, true),
  ('Hotel', 'value', 'Value for Money', 6, true),
  ('Laundry', 'cleaning_quality', 'Cleaning Quality', 1, true),
  ('Laundry', 'care_handling', 'Care and Handling', 2, true),
  ('Laundry', 'turnaround_time', 'Turnaround Time', 3, true),
  ('Laundry', 'staff_service', 'Staff Service', 4, true),
  ('Laundry', 'packaging', 'Packaging', 5, true),
  ('Laundry', 'value', 'Value for Money', 6, true),
  ('Fitness', 'equipment_quality', 'Equipment Quality', 1, true),
  ('Fitness', 'trainer_support', 'Trainer Support', 2, true),
  ('Fitness', 'cleanliness', 'Cleanliness', 3, true),
  ('Fitness', 'class_variety', 'Class Variety', 4, true),
  ('Fitness', 'facilities', 'Facilities', 5, true),
  ('Fitness', 'value', 'Value for Money', 6, true),
  ('Travel', 'itinerary_quality', 'Trip Experience', 1, true),
  ('Travel', 'booking_support', 'Booking Support', 2, true),
  ('Travel', 'staff_service', 'Staff Service', 3, true),
  ('Travel', 'punctuality', 'Punctuality', 4, true),
  ('Travel', 'communication', 'Communication', 5, true),
  ('Travel', 'value', 'Value for Money', 6, true),
  ('Professional Services', 'service_quality', 'Service Quality', 1, true),
  ('Professional Services', 'staff_behavior', 'Staff Behavior', 2, true),
  ('Professional Services', 'communication', 'Communication', 3, true),
  ('Professional Services', 'response_time', 'Response Time', 4, true),
  ('Professional Services', 'reliability', 'Reliability', 5, true),
  ('Professional Services', 'value', 'Value for Money', 6, true),
  ('Other', 'service_quality', 'Service Quality', 1, true),
  ('Other', 'staff_behavior', 'Staff Behavior', 2, true),
  ('Other', 'quality', 'Quality', 3, true),
  ('Other', 'communication', 'Communication', 4, true),
  ('Other', 'cleanliness', 'Cleanliness', 5, true),
  ('Other', 'value', 'Value for Money', 6, true)
on conflict (business_type, category_key) do update
set display_label = excluded.display_label,
    display_order = excluded.display_order,
    is_enabled = excluded.is_enabled;
