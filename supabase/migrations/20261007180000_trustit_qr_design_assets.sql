create table if not exists public.trustit_qr_design_assets (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  business_type text,
  theme_id text not null,
  template_id text not null,
  prompt_version text not null,
  revision integer not null check (revision >= 0 and revision <= 4),
  provider text not null check (provider in ('mock', 'openai')),
  status text not null check (status in ('ready')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (business_id, template_id, prompt_version, revision, provider)
);

create index if not exists trustit_qr_design_assets_business_revision_idx
  on public.trustit_qr_design_assets (business_id, revision, template_id);

alter table public.trustit_qr_design_assets enable row level security;
revoke all on table public.trustit_qr_design_assets from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('trustit-qr-designs', 'trustit-qr-designs', false)
on conflict (id) do update set public = false;

comment on table public.trustit_qr_design_assets is 'Server-managed Trustit QR artwork metadata. Assets are stored privately and served through short-lived signed URLs.';
