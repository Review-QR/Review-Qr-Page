import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Edit Business Details contains public location fields and the existing GPS capture flow", async () => {
  const [profilePage, businessPage, locationForm, capture] = await Promise.all([
    read("../merchant/dashboard/profile/page.tsx"),
    read("../merchant/dashboard/business/page.tsx"),
    read("../merchant/dashboard/business/public-location-form.tsx"),
    read("../merchant/dashboard/profile/location-capture.tsx"),
  ]);
  assert.match(profilePage, /Edit Business Details/);
  assert.match(profilePage, /Public Discovery Location/);
  assert.match(profilePage, /Needs completion/);
  assert.match(profilePage, /href="\/merchant\/dashboard\/business#public-discovery-location"/);
  assert.doesNotMatch(profilePage, /#live-location/);
  assert.match(businessPage, /<BusinessProfileForm/);
  assert.match(businessPage, /<PublicLocationForm/);
  assert.match(businessPage, /isPublicDiscoveryLocationComplete/);
  assert.match(businessPage, /href="#public-discovery-location"/);
  for (const field of ["locality", "city", "district", "state", "pincode"]) {
    assert.match(locationForm, new RegExp(`name="${field}"`));
  }
  assert.match(locationForm, /name="city"[\s\S]*?required/);
  assert.match(locationForm, /name="state"[\s\S]*?required/);
  assert.match(locationForm, /pattern="\[0-9\]\{6\}"/);
  assert.match(locationForm, /Confirm Location/);
  assert.match(locationForm, /Save Location/);
  assert.match(locationForm, /registered address and GPS coordinates stay unchanged/i);
  assert.match(locationForm, /<LocationCapture/);
  assert.match(locationForm, /id="public-discovery-location"/);
  assert.doesNotMatch(locationForm, /\/merchant\/dashboard\/profile#business-location/);
  assert.match(capture, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(capture, /Update Current Location/);
});

test("merchant confirmation is authenticated, validates fields, and saves through the existing merchant RPC", async () => {
  const [action, locationAction, migration, auth] = await Promise.all([
    read("../merchant/dashboard/business/actions.ts"),
    read("../merchant/dashboard/business/location-actions.ts"),
    read("../../supabase/migrations/20261007120000_verified_public_discovery_location.sql"),
    read("../../lib/merchant-auth.ts"),
  ]);
  assert.match(action, /rpc\("update_merchant_business_profile"/);
  assert.match(locationAction, /parsePublicDiscoveryLocation/);
  assert.match(locationAction, /const merchant = await getActiveMerchant\(\)/);
  assert.match(locationAction, /rpc\("save_merchant_discovery_location"/);
  assert.match(locationAction, /marked as merchant confirmed/);
  assert.match(locationAction, /p_city: location\.city/);
  assert.doesNotMatch(locationAction, /admin_save_business_discovery_location/);
  assert.match(migration, /discovery_location_verification_source = 'merchant_attested'/);
  assert.match(migration, /discovery_location_verified_at = v_verified_at/);
  assert.match(migration, /account\.user_id = v_user_id/);
  assert.match(migration, /grant execute on function public\.save_merchant_discovery_location[\s\S]*?to authenticated/i);
  assert.match(auth, /locality: business\.locality[\s\S]*?city: business\.city[\s\S]*?district: business\.district[\s\S]*?state: business\.state[\s\S]*?pincode: business\.pincode/);
});

test("merchant location writes preserve address and GPS values and keep confirmation invalidation", async () => {
  const migration = await read("../../supabase/migrations/20261007120000_verified_public_discovery_location.sql");
  const merchantRpc = migration.slice(
    migration.indexOf("create or replace function public.save_merchant_discovery_location"),
    migration.indexOf("create or replace function public.admin_save_business_discovery_location"),
  );
  assert.doesNotMatch(merchantRpc, /set[\s\S]*?address\s*=|location_latitude\s*=|location_longitude\s*=|location_captured_at\s*=/i);
  assert.match(migration, /new\.discovery_location_verification_source := null/);
  assert.match(migration, /before update of locality, city, district, state, pincode on public\.businesses/i);
});

test("public listing requires the confirmed structured location and valid category and city", async () => {
  const [location, listingMigration] = await Promise.all([
    read("../../lib/business-location.ts"),
    read("../../supabase/migrations/20261007120000_verified_public_discovery_location.sql"),
  ]);
  assert.match(location, /record\.verifiedAt/);
  assert.match(location, /record\.city\?\.trim\(\)/);
  assert.match(location, /record\.state\?\.trim\(\)/);
  assert.match(location, /record\.pincode && \/\^\\d\{6\}\$\//);
  assert.match(listingMigration, /b\.discovery_location_verified_at is not null/i);
  assert.match(listingMigration, /btrim\(coalesce\(b\.city, ''\)\) <> ''/i);
  assert.match(listingMigration, /b\.pincode ~ '\^\[0-9\]\{6\}\$'/i);
});

test("admin Business Management retains Review Edit Delete and has no separate location action", async () => {
  const [page, actions] = await Promise.all([read("./page.tsx"), read("./actions.ts")]);
  assert.match(page, />\s*Review\s*</);
  assert.match(page, />\s*Edit\s*</);
  assert.match(page, />\s*Delete\s*</);
  assert.doesNotMatch(page, /BusinessLocationAction|Review location|Set location/);
  assert.doesNotMatch(actions, /saveAdminBusinessDiscoveryLocation/);
});
