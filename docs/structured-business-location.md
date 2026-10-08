# Structured business location foundation

The Phase 1 migration adds nullable `locality`, `city`, `district`, `state`, and `pincode` columns to `public.businesses`. Existing `address` text and the independently captured `location_latitude`, `location_longitude`, and `location_captured_at` remain unchanged.

No address parsing or coordinate geocoding runs during the migration. Existing rows and newly registered/admin-created businesses therefore keep the structured columns null until a merchant provides verified values through **My Business**. The required free-text address, registration form, and existing business type values are unchanged. Pincode is optional; when present it must contain six ASCII digits.

Device coordinates continue to be captured by `app/merchant/dashboard/profile/location-capture.tsx`, submitted by `app/merchant/dashboard/profile/actions.ts`, and stored by `public.set_merchant_business_location` in the existing location migration. A future location-resolution workflow can be added at that capture/action boundary: resolve coordinates on a trusted server, show the proposed locality/city/district/state/pincode to the merchant for confirmation, then save confirmed fields through an authenticated profile RPC. The current coordinate RPC must continue to store only the submitted coordinates and capture time until that later workflow is explicitly designed.

The new profile RPC is authenticated and bound to the active merchant's business mapping. It does not change business-table RLS or grant anonymous table access. The city/type index is partial for rows with a city and no soft-delete timestamp; it is only a query optimization and does not make any business public.
