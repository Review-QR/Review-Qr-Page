-- Merchant list reads businesses only after requireActiveAdmin() succeeds.
-- Keep this limited to SELECT for the server-only admin client.
grant select on table public.businesses to service_role;
