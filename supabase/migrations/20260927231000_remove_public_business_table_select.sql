-- Remove direct anonymous access to the businesses table.
-- Public QR access is provided through the restricted QR helper functions.

drop policy if exists "Public can read businesses for QR lookup"
  on public.businesses;
