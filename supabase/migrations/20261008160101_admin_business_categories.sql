create table if not exists public.admin_business_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text not null default 'admin' check (source in ('admin', 'built-in-override')),
  aliases text[] not null default '{}',
  primary_icon text not null default 'Store',
  qr_icons text[] not null default array['Store', 'Sparkles', 'Star'],
  experience_mappings jsonb not null default '[]'::jsonb,
  palette text[] not null default array['#315b63', '#64a59e', '#ebd59b'],
  background_art_directions text[] not null default array[]::text[],
  design_family text not null default 'general',
  is_active boolean not null default true,
  created_by uuid references public.admin_users(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_business_categories_name_length check (char_length(btrim(name)) between 2 and 80),
  constraint admin_business_categories_aliases_limit check (cardinality(aliases) <= 30),
  constraint admin_business_categories_qr_icons_count check (cardinality(qr_icons) = 3),
  constraint admin_business_categories_palette_count check (cardinality(palette) = 3),
  constraint admin_business_categories_backgrounds_count check (cardinality(background_art_directions) in (0, 5)),
  constraint admin_business_categories_experiences_array check (jsonb_typeof(experience_mappings) = 'array' and jsonb_array_length(experience_mappings) in (0, 5))
);

create unique index if not exists admin_business_categories_name_unique_idx
  on public.admin_business_categories (lower(btrim(name)));
create index if not exists admin_business_categories_active_name_idx
  on public.admin_business_categories (is_active, lower(name));

alter table public.admin_business_categories enable row level security;
revoke all on table public.admin_business_categories from public, anon, authenticated;
grant select, insert, update, delete on table public.admin_business_categories to service_role;

create or replace function public.admin_business_categories_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.admin_business_categories_set_updated_at() from public, anon, authenticated;
drop trigger if exists admin_business_categories_updated_at on public.admin_business_categories;
create trigger admin_business_categories_updated_at
before update on public.admin_business_categories
for each row execute function public.admin_business_categories_set_updated_at();

