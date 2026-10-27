-- Migration: 20261027120000_merchant_social_studio.sql
-- Merchant Social Accounts & AI Creative Studio schema

create table if not exists public.merchant_social_integrations (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  provider text not null default 'postiz' check (provider in ('postiz', 'meta', 'buffer', 'custom')),
  postiz_api_url text check (postiz_api_url is null or postiz_api_url ~* '^https?://'),
  postiz_api_key text,
  facebook_page_name text,
  instagram_username text,
  auto_publish_enabled boolean not null default true,
  default_schedule_time time default '18:30:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_social_integrations_business_unique unique (business_id)
);

create index if not exists merchant_social_integrations_business_idx
  on public.merchant_social_integrations (business_id);

alter table public.merchant_social_integrations enable row level security;
revoke all on public.merchant_social_integrations from public, anon, authenticated;
grant select, insert, update, delete on public.merchant_social_integrations to authenticated;
grant select, insert, update, delete on public.merchant_social_integrations to service_role;

create policy merchant_social_integrations_select_own on public.merchant_social_integrations
  for select to authenticated using (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_social_integrations.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

create policy merchant_social_integrations_insert_own on public.merchant_social_integrations
  for insert to authenticated with check (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_social_integrations.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

create policy merchant_social_integrations_update_own on public.merchant_social_integrations
  for update to authenticated using (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_social_integrations.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  )) with check (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_social_integrations.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

create policy merchant_social_integrations_delete_own on public.merchant_social_integrations
  for delete to authenticated using (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_social_integrations.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

-- Enhance merchant_messages table with creative photo and social columns
alter table public.merchant_messages
  add column if not exists image_url text,
  add column if not exists creative_style text default 'foodie_craving',
  add column if not exists dish_name text,
  add column if not exists dish_price text,
  add column if not exists social_channels text[] default array['instagram', 'facebook', 'whatsapp'],
  add column if not exists publish_status text default 'draft' check (publish_status in ('draft', 'scheduled', 'published', 'failed')),
  add column if not exists postiz_post_id text;
