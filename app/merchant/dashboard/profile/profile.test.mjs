import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getMerchantProfileCompletion, isValidMerchantLocation } from "../../../../lib/merchant-profile-completion.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const completeProfile = {
  businessName: "Deepak Sweets Bahraich",
  businessType: "Sweets",
  ownerName: "Deepak Kumar",
  registeredMobile: "+919876543210",
  address: "Bahraich, Uttar Pradesh",
  locationLatitude: 27.5743,
  locationLongitude: 81.5947,
  locationCapturedAt: "2026-10-06T12:00:00.000Z",
};

test("profile completion is based on the six stored core fields and reports exact missing items", () => {
  const missingLocation = getMerchantProfileCompletion({ ...completeProfile, locationLatitude: null, locationLongitude: null, locationCapturedAt: null });
  assert.equal(missingLocation.score, 83);
  assert.equal(missingLocation.completedCount, 5);
  assert.deepEqual(missingLocation.items.filter((item) => !item.complete).map((item) => item.label), ["Live Location"]);
  assert.equal(getMerchantProfileCompletion(completeProfile).score, 100);
});

test("location validation rejects non-finite and out-of-range coordinates", () => {
  assert.equal(isValidMerchantLocation(27.5743, 81.5947), true);
  for (const [latitude, longitude] of [[91, 0], [-91, 0], [0, 181], [0, -181], [Number.NaN, 0], [0, Number.POSITIVE_INFINITY]]) {
    assert.equal(isValidMerchantLocation(latitude, longitude), false);
  }
});

test("profile and location updates require the active signed-in merchant and server-owned business mapping", async () => {
  const [page, actions, migration] = await Promise.all([
    read("./page.tsx"),
    read("./actions.ts"),
    read("../../../../supabase/migrations/20261006081614_merchant_profile_location.sql"),
  ]);
  assert.match(page, /requireActiveMerchant\(\)/);
  assert.match(actions, /getActiveMerchant\(\)/);
  assert.match(actions, /rpc\("set_merchant_business_location"/);
  assert.doesNotMatch(actions, /businessId\s*:/);
  assert.match(migration, /account\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(migration, /business\.merchant_status = 'active'/i);
  assert.match(migration, /business\.deleted_at is null/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(migration, /grant execute on function public\.set_merchant_business_location\(double precision, double precision\)\s+to authenticated/i);
  assert.match(migration, /location_latitude between -90 and 90/);
  assert.match(migration, /location_longitude between -180 and 180/);
  assert.match(page, /\.eq\("id", merchant\.businessId\)[\s\S]*?\.eq\("merchant_status", "active"\)[\s\S]*?\.is\("deleted_at", null\)/);
  assert.doesNotMatch(await read("../../../../lib/merchant-auth.ts"), /location_latitude/);
});

test("My Business edits only supported fields through the authenticated merchant profile RPC", async () => {
  const [businessAction, form, migration] = await Promise.all([
    read("../business/actions.ts"),
    read("../business/business-profile-form.tsx"),
    read("../../../../supabase/migrations/20261006081614_merchant_profile_location.sql"),
  ]);
  assert.match(businessAction, /getActiveMerchant\(\)/);
  assert.match(businessAction, /rpc\("update_merchant_business_profile"/);
  assert.doesNotMatch(businessAction, /businessId\s*:/);
  for (const name of ["name", "type", "owner", "address", "reviewLink"]) assert.match(form, new RegExp(`name="${name}"`));
  assert.match(form, /name="address"/);
  assert.match(form, /readOnly/);
  assert.match(migration, /account\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(migration, /set name = btrim\(p_name\)[\s\S]*?type = btrim\(p_type\)[\s\S]*?owner = btrim\(p_owner\)[\s\S]*?address = btrim\(p_address\)/);
  assert.doesNotMatch(migration, /set[\s\S]*?phone\s*=/i);
  assert.match(migration, /grant execute on function public\.update_merchant_business_profile\(text, text, text, text, text\)\s+to authenticated/i);
});

test("location capture requests real device coordinates and keeps typed address separate", async () => {
  const [capture, profile, businessForm] = await Promise.all([
    read("./location-capture.tsx"),
    read("./page.tsx"),
    read("../business/business-profile-form.tsx"),
  ]);
  assert.match(capture, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(capture, /position\.coords\.latitude/);
  assert.match(capture, /position\.coords\.longitude/);
  assert.match(capture, /PERMISSION_DENIED/);
  assert.match(capture, /Update Current Location/);
  assert.match(profile, /Business Address/);
  assert.match(profile, /GPS location/);
  assert.match(businessForm, /name="address"/);
  assert.match(capture, /No reverse-geocoding service is configured/);
});

test("Google Review Link is optional and does not enter the completion denominator", async () => {
  const profilePage = await read("./page.tsx");
  const completion = await read("../../../../lib/merchant-profile-completion.ts");
  assert.match(profilePage, /Google Review Link/);
  assert.match(profilePage, /No score impact/);
  assert.doesNotMatch(completion, /reviewLink/);
  const withNoReviewUrl = getMerchantProfileCompletion(completeProfile);
  assert.equal(withNoReviewUrl.score, 100);
});

test("merchant dashboard navigation keeps profile under the authenticated dashboard routes", async () => {
  const [navigation, layout, css] = await Promise.all([
    read("../merchant-navigation.tsx"),
    read("../layout.tsx"),
    read("../dashboard.css"),
  ]);
  assert.match(navigation, /href: "\/merchant\/dashboard\/profile", label: "Merchant Profile"/);
  assert.match(layout, /await requireActiveMerchant\(\)/);
  assert.match(css, /@media \(max-width: 860px\)/);
  assert.doesNotMatch(css, /merchant-qr-poster-frame\s*\{[^}]*max-height/s);
});
