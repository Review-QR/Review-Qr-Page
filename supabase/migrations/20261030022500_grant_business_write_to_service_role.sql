-- Grant full administrative privileges on businesses and catalog to service_role
grant select, insert, update, delete on table public.businesses to service_role;
grant select, insert, update, delete on table public.business_catalog_items to service_role;
