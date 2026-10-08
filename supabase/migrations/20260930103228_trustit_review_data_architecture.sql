-- Trustit customer review data model.
-- Customer/session writes are server-side only. Authenticated reads are
-- restricted to the owning active merchant; anonymous users receive no table
-- privileges or policies.

create table public.review_sessions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  business_id text not null
    references public.businesses (id) on delete cascade,
  selected_rating smallint,
  current_review_text text,
  review_status text not null default 'in_progress'
    check (review_status in ('in_progress', 'draft_ready', 'submitted', 'abandoned', 'expired')),
  google_status text not null default 'not_started'
    check (google_status in ('not_started', 'ready', 'redirected', 'completed', 'failed')),
  trustit_status text not null default 'not_started'
    check (trustit_status in ('not_started', 'submitted')),
  current_generation_number integer not null default 0
    check (current_generation_number >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint review_sessions_rating_check
    check (selected_rating is null or selected_rating between 1 and 5),
  constraint review_sessions_current_text_check
    check (current_review_text is null or length(current_review_text) <= 10000),
  constraint review_sessions_id_business_id_key unique (id, business_id),
  constraint review_sessions_id_business_rating_key unique (id, business_id, selected_rating)
);

create index review_sessions_business_created_idx
  on public.review_sessions (business_id, created_at desc);
create index review_sessions_expiration_idx
  on public.review_sessions (expires_at)
  where expires_at is not null;

create table public.review_experience_categories (
  business_type text not null
    check (length(btrim(business_type)) between 1 and 80),
  category_key text not null
    check (category_key ~ '^[a-z][a-z0-9_]{0,63}$'),
  display_label text not null
    check (length(btrim(display_label)) between 1 and 100),
  display_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (business_type, category_key)
);

create table public.review_session_experiences (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  review_session_id uuid not null,
  business_id text not null,
  category_key text not null
    check (category_key ~ '^[a-z][a-z0-9_]{0,63}$'),
  category_label_snapshot text not null
    check (length(btrim(category_label_snapshot)) between 1 and 100),
  selected_at timestamptz not null default pg_catalog.now(),
  constraint review_session_experiences_session_business_fkey
    foreign key (review_session_id, business_id)
    references public.review_sessions (id, business_id) on delete cascade,
  constraint review_session_experiences_once_per_category_key
    unique (review_session_id, category_key)
);

create index review_session_experiences_business_idx
  on public.review_session_experiences (business_id, review_session_id);

create table public.review_generations (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  review_session_id uuid not null,
  business_id text not null,
  generation_number integer not null check (generation_number > 0),
  rating_context smallint not null check (rating_context between 1 and 5),
  experience_context jsonb not null default '[]'::jsonb
    check (jsonb_typeof(experience_context) = 'array'),
  generated_text text not null check (length(btrim(generated_text)) between 1 and 10000),
  created_at timestamptz not null default pg_catalog.now(),
  constraint review_generations_session_business_fkey
    foreign key (review_session_id, business_id)
    references public.review_sessions (id, business_id) on delete cascade,
  constraint review_generations_rating_matches_session_fkey
    foreign key (review_session_id, business_id, rating_context)
    references public.review_sessions (id, business_id, selected_rating)
    on delete cascade,
  constraint review_generations_session_number_key
    unique (review_session_id, generation_number)
);

create index review_generations_business_created_idx
  on public.review_generations (business_id, created_at desc);

create table public.trustit_reviews (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  review_session_id uuid not null unique,
  business_id text not null,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (length(btrim(review_text)) between 1 and 10000),
  customer_name text check (customer_name is null or length(btrim(customer_name)) between 1 and 160),
  customer_mobile text check (customer_mobile is null or length(btrim(customer_mobile)) between 1 and 32),
  submitted_at timestamptz not null default pg_catalog.now(),
  status text not null default 'submitted'
    check (status in ('submitted', 'removed')),
  constraint trustit_reviews_session_business_fkey
    foreign key (review_session_id, business_id)
    references public.review_sessions (id, business_id) on delete cascade,
  constraint trustit_reviews_rating_matches_session_fkey
    foreign key (review_session_id, business_id, rating)
    references public.review_sessions (id, business_id, selected_rating)
    on delete cascade
);

create index trustit_reviews_business_submitted_idx
  on public.trustit_reviews (business_id, submitted_at desc);

create table public.review_customer_profiles (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  business_id text not null
    references public.businesses (id) on delete cascade,
  review_session_id uuid not null unique,
  created_at timestamptz not null default pg_catalog.now(),
  constraint review_customer_profiles_session_business_key unique (id, business_id),
  constraint review_customer_profiles_session_fkey
    foreign key (review_session_id, business_id)
    references public.review_sessions (id, business_id) on delete cascade
);

create table public.review_family_members (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  business_id text not null,
  customer_profile_id uuid not null,
  relationship text not null check (relationship in (
    'son', 'daughter', 'wife', 'husband', 'father', 'mother', 'brother', 'sister'
  )),
  name text check (name is null or length(btrim(name)) between 1 and 160),
  created_at timestamptz not null default pg_catalog.now(),
  constraint review_family_members_id_business_id_key unique (id, business_id),
  constraint review_family_members_profile_business_fkey
    foreign key (customer_profile_id, business_id)
    references public.review_customer_profiles (id, business_id) on delete cascade
);

create index review_family_members_profile_idx
  on public.review_family_members (customer_profile_id);

create table public.review_special_occasion_types (
  occasion_key text primary key
    check (occasion_key ~ '^[a-z][a-z0-9_]{0,63}$'),
  display_label text not null
    check (length(btrim(display_label)) between 1 and 100),
  is_enabled boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

insert into public.review_special_occasion_types (occasion_key, display_label)
values ('birthday', 'Birthday'), ('anniversary', 'Anniversary')
on conflict (occasion_key) do nothing;

create table public.review_special_occasions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  business_id text not null,
  customer_profile_id uuid,
  family_member_id uuid,
  occasion_key text not null
    references public.review_special_occasion_types (occasion_key) on delete restrict,
  day smallint not null check (day between 1 and 31),
  month smallint not null check (month between 1 and 12),
  created_at timestamptz not null default pg_catalog.now(),
  constraint review_special_occasions_owner_check
    check ((customer_profile_id is not null) <> (family_member_id is not null)),
  constraint review_special_occasions_calendar_day_check
    check (day <= case month
      when 2 then 29
      when 4 then 30
      when 6 then 30
      when 9 then 30
      when 11 then 30
      else 31
    end),
  constraint review_special_occasions_profile_business_fkey
    foreign key (customer_profile_id, business_id)
    references public.review_customer_profiles (id, business_id) on delete cascade,
  constraint review_special_occasions_family_business_fkey
    foreign key (family_member_id, business_id)
    references public.review_family_members (id, business_id) on delete cascade,
  constraint review_special_occasions_profile_key unique (customer_profile_id, occasion_key),
  constraint review_special_occasions_family_key unique (family_member_id, occasion_key)
);

create index review_special_occasions_business_idx
  on public.review_special_occasions (business_id);

create table public.plan_features (
  plan text not null check (plan in ('Basic', 'Standard', 'Premium')),
  feature_key text not null
    check (feature_key ~ '^[a-z][a-z0-9_]{0,63}$'),
  enabled boolean not null default false,
  feature_value jsonb,
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (plan, feature_key),
  constraint plan_features_value_type_check
    check (feature_value is null or jsonb_typeof(feature_value) in ('boolean', 'number', 'string', 'object', 'array'))
);

-- Lock a session's first selected rating. Regenerations can update drafts but
-- cannot alter or clear the rating once selected.
create or replace function public.lock_review_session_rating()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.selected_rating is not null
    and new.selected_rating is distinct from old.selected_rating then
    raise exception 'Review session rating is locked';
  end if;
  return new;
end;
$$;

revoke all on function public.lock_review_session_rating() from public, anon, authenticated, service_role;

create trigger review_sessions_lock_rating
before update of selected_rating on public.review_sessions
for each row execute function public.lock_review_session_rating();

alter table public.review_sessions enable row level security;
alter table public.review_experience_categories enable row level security;
alter table public.review_session_experiences enable row level security;
alter table public.review_generations enable row level security;
alter table public.trustit_reviews enable row level security;
alter table public.review_customer_profiles enable row level security;
alter table public.review_family_members enable row level security;
alter table public.review_special_occasion_types enable row level security;
alter table public.review_special_occasions enable row level security;
alter table public.plan_features enable row level security;

revoke all on table
  public.review_sessions,
  public.review_experience_categories,
  public.review_session_experiences,
  public.review_generations,
  public.trustit_reviews,
  public.review_customer_profiles,
  public.review_family_members,
  public.review_special_occasion_types,
  public.review_special_occasions,
  public.plan_features
from public, anon, authenticated, service_role;

grant all on table
  public.review_sessions,
  public.review_experience_categories,
  public.review_session_experiences,
  public.review_generations,
  public.trustit_reviews,
  public.review_customer_profiles,
  public.review_family_members,
  public.review_special_occasion_types,
  public.review_special_occasions,
  public.plan_features
to service_role;

-- Merchants can read their own active business's review data. No direct
-- browser-side writes are granted; future customer writes must use a
-- server-side flow with a server-validated QR business association.
grant select on table
  public.review_sessions,
  public.review_session_experiences,
  public.review_generations,
  public.trustit_reviews,
  public.review_customer_profiles,
  public.review_family_members,
  public.review_special_occasions
to authenticated;

create policy review_sessions_select_own_business
  on public.review_sessions for select to authenticated
  using (exists (
    select 1 from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.business_id = review_sessions.business_id
      and merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
  ));

create policy review_session_experiences_select_own_business
  on public.review_session_experiences for select to authenticated
  using (exists (
    select 1 from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.business_id = review_session_experiences.business_id
      and merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
  ));

create policy review_generations_select_own_business
  on public.review_generations for select to authenticated
  using (exists (
    select 1 from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.business_id = review_generations.business_id
      and merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
  ));

create policy trustit_reviews_select_own_business
  on public.trustit_reviews for select to authenticated
  using (exists (
    select 1 from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.business_id = trustit_reviews.business_id
      and merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
  ));

create policy review_customer_profiles_select_own_business
  on public.review_customer_profiles for select to authenticated
  using (exists (
    select 1 from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.business_id = review_customer_profiles.business_id
      and merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
  ));

create policy review_family_members_select_own_business
  on public.review_family_members for select to authenticated
  using (exists (
    select 1 from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.business_id = review_family_members.business_id
      and merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
  ));

create policy review_special_occasions_select_own_business
  on public.review_special_occasions for select to authenticated
  using (exists (
    select 1 from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.business_id = review_special_occasions.business_id
      and merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
  ));

-- Configuration is readable by signed-in users where appropriate and
-- manageable only by active admins. No anonymous access is granted.
grant select, insert, update, delete on table
  public.review_experience_categories,
  public.review_special_occasion_types,
  public.plan_features
to authenticated;

create policy review_experience_categories_read_enabled
  on public.review_experience_categories for select to authenticated
  using (is_enabled or exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_experience_categories_admin_manage
  on public.review_experience_categories for all to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ))
  with check (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_special_occasion_types_read_enabled
  on public.review_special_occasion_types for select to authenticated
  using (is_enabled or exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy review_special_occasion_types_admin_manage
  on public.review_special_occasion_types for all to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ))
  with check (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));

create policy plan_features_read_own_plan
  on public.plan_features for select to authenticated
  using (exists (
    select 1
    from public.merchant_accounts as merchant
    join public.businesses as business on business.id = merchant.business_id
    where merchant.user_id = (select auth.uid())
      and business.merchant_status = 'active'
      and business.plan = plan_features.plan
  ));

create policy plan_features_admin_manage
  on public.plan_features for all to authenticated
  using (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ))
  with check (exists (
    select 1 from public.admin_users as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  ));
;
