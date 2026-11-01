-- Create public storage bucket for merchant assets (logos, branding)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'merchant-assets',
  'merchant-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Allow public read access to merchant-assets
drop policy if exists "merchant_assets_public_read" on storage.objects;
create policy "merchant_assets_public_read"
  on storage.objects for select
  using ( bucket_id = 'merchant-assets' );

-- Allow insert/update/delete for authenticated and service role
drop policy if exists "merchant_assets_write_policy" on storage.objects;
create policy "merchant_assets_write_policy"
  on storage.objects for all
  using ( bucket_id = 'merchant-assets' )
  with check ( bucket_id = 'merchant-assets' );
