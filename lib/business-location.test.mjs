import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BUSINESS_TYPES } from "./business-types.ts";
import { hasUsableCoordinates, isPublicDiscoveryLocationComplete, isValidStructuredBusinessLocation, parsePublicDiscoveryLocation, parseStructuredBusinessLocation } from "./business-location.ts";

const blankLocation = { locality: "", city: "", district: "", state: "", pincode: "" };
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("structured location values are trimmed and valid Indian location fields are preserved", () => {
  assert.deepEqual(parseStructuredBusinessLocation({
    locality: "  Civil Lines ", city: " Bahraich ", district: "Bahraich", state: "Uttar Pradesh", pincode: "271801",
  }), {
    locality: "Civil Lines", city: "Bahraich", district: "Bahraich", state: "Uttar Pradesh", pincode: "271801",
  });
});

test("all structured location fields remain nullable during migration and for partial profiles", async () => {
  assert.deepEqual(parseStructuredBusinessLocation(blankLocation), {
    locality: null, city: null, district: null, state: null, pincode: null,
  });
  assert.deepEqual(parseStructuredBusinessLocation({ ...blankLocation, city: "Bahraich" }), {
    locality: null, city: "Bahraich", district: null, state: null, pincode: null,
  });
  const migration = await read("../supabase/migrations/20261006130000_structured_business_location.sql");
  const schemaChanges = migration.split("create or replace function")[0];
  for (const field of ["locality", "city", "district", "state", "pincode"]) {
    assert.match(schemaChanges, new RegExp(`add column ${field} text(?:,|\\s)`));
    assert.doesNotMatch(schemaChanges, new RegExp(`add column ${field} text not null`, "i"));
  }
  assert.match(schemaChanges, /create index businesses_city_type_discovery_idx\s+on public\.businesses \(lower\(city\), type\)\s+where city is not null and deleted_at is null/i);
  assert.doesNotMatch(schemaChanges, /update public\.businesses|set address\s*=|set location_latitude\s*=/i);
});

test("pincode accepts blank or six digits and rejects unsafe or malformed values", () => {
  assert.equal(isValidStructuredBusinessLocation({ ...blankLocation, pincode: "" }), true);
  assert.equal(isValidStructuredBusinessLocation({ ...blankLocation, pincode: "271801" }), true);
  for (const pincode of ["27180", "2718010", "27A801", "271 01", "+91271801"]) {
    assert.equal(isValidStructuredBusinessLocation({ ...blankLocation, pincode }), false);
  }
});

test("location text limits are bounded without requiring city or state", () => {
  assert.equal(isValidStructuredBusinessLocation({ ...blankLocation, city: "a".repeat(160), state: "b".repeat(100) }), true);
  assert.equal(isValidStructuredBusinessLocation({ ...blankLocation, city: "a".repeat(161) }), false);
  assert.equal(isValidStructuredBusinessLocation({ ...blankLocation, locality: " " }), true);
});

test("public discovery location requires city and state, validates optional pincode, and does not infer values", () => {
  assert.equal(parsePublicDiscoveryLocation({ ...blankLocation, city: "Bahraich" }), null);
  assert.equal(parsePublicDiscoveryLocation({ ...blankLocation, state: "Uttar Pradesh" }), null);
  assert.deepEqual(parsePublicDiscoveryLocation({ ...blankLocation, city: " Bahraich ", state: " Uttar Pradesh " }), {
    locality: null, city: "Bahraich", district: null, state: "Uttar Pradesh", pincode: null,
  });
  assert.deepEqual(parsePublicDiscoveryLocation({ ...blankLocation, city: "Bahraich", state: "Uttar Pradesh", pincode: "271801" })?.pincode, "271801");
  assert.equal(parsePublicDiscoveryLocation({ ...blankLocation, city: "Bahraich", state: "Uttar Pradesh", pincode: "27180" }), null);
});

test("public location completeness requires a canonical category, city, state, six-digit pincode, and confirmation", () => {
  const complete = { type: "Sweet Shop", city: "Bahraich", state: "Uttar Pradesh", pincode: "271801", verifiedAt: "2026-10-07T00:00:00Z" };
  assert.equal(isPublicDiscoveryLocationComplete(complete), true);
  for (const incomplete of [
    { ...complete, city: null }, { ...complete, state: " " }, { ...complete, pincode: null },
    { ...complete, pincode: "27180" }, { ...complete, type: "Unlisted category" }, { ...complete, verifiedAt: null },
  ]) assert.equal(isPublicDiscoveryLocationComplete(incomplete), false);
  assert.equal(hasUsableCoordinates({ latitude: 27.57, longitude: 81.6 }), true);
  assert.equal(hasUsableCoordinates({ latitude: null, longitude: null }), false);
  assert.equal(hasUsableCoordinates({ latitude: 91, longitude: 81 }), false);
});

test("merchant location RPC preserves auth boundary and coordinate data remains independently captured", async () => {
  const migration = await read("../supabase/migrations/20261006130000_structured_business_location.sql");
  const coordinateMigration = await read("../supabase/migrations/20261006081614_merchant_profile_location.sql");
  assert.match(migration, /security definer[\s\S]*?set search_path = ''/i);
  assert.match(migration, /account\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(migration, /business\.merchant_status = 'active'/i);
  assert.match(migration, /business\.deleted_at is null/i);
  assert.match(migration, /revoke all on function public\.update_merchant_business_profile_with_location[\s\S]*?from public, anon, authenticated, service_role/i);
  assert.match(migration, /grant execute on function public\.update_merchant_business_profile_with_location[\s\S]*?to authenticated/i);
  assert.doesNotMatch(migration, /grant select on public\.businesses to anon/i);
  assert.doesNotMatch(migration, /create policy|enable row level security|grant .*public\.businesses/i);
  assert.match(await read("../supabase/migrations/20261006081614_merchant_profile_location.sql"), /create or replace function public\.update_merchant_business_profile\(/);
  assert.match(coordinateMigration, /location_latitude = p_latitude[\s\S]*?location_longitude = p_longitude[\s\S]*?location_captured_at = v_captured_at/);
  assert.match(coordinateMigration, /grant execute on function public\.set_merchant_business_location\(double precision, double precision\)\s+to authenticated/i);
});

test("profile edit and dedicated location completion remain additive, and registration types stay unchanged", async () => {
  const [action, form, auth, registration, coordinateAction, adminBusinessActions, registrationForm, publicLocationForm] = await Promise.all([
    read("../app/merchant/dashboard/business/actions.ts"),
    read("../app/merchant/dashboard/business/business-profile-form.tsx"),
    read("./merchant-auth.ts"),
    read("../app/register/actions.ts"),
    read("../app/merchant/dashboard/profile/actions.ts"),
    read("../app/businesses/actions.ts"),
    read("../app/register/business-form.tsx"),
    read("../app/merchant/dashboard/business/public-location-form.tsx"),
  ]);
  assert.match(action, /rpc\("update_merchant_business_profile"/);
  assert.doesNotMatch(form, /name="(?:locality|city|district|state|pincode)"/);
  const locationAction = await read("../app/merchant/dashboard/business/location-actions.ts");
  assert.match(locationAction, /rpc\("save_merchant_discovery_location"/);
  for (const field of ["locality", "city", "district", "state", "pincode"]) {
    assert.match(publicLocationForm, new RegExp(`name="${field}"`));
    assert.match(auth, new RegExp(`${field}: business\\.${field}`));
  }
  assert.match(action, /getActiveMerchant\(\)/);
  assert.match(action, /rpc\("update_merchant_business_profile"/);
  assert.match(action, /p_address: address/);
  assert.doesNotMatch(action, /p_city|locality|pincode/);
  assert.match(locationAction, /BUSINESS_TYPES\.includes/);
  assert.match(coordinateAction, /rpc\("set_merchant_business_location"/);
  assert.match(coordinateAction, /p_latitude: latitude[\s\S]*?p_longitude: longitude/);
  assert.match(registration, /BUSINESS_TYPES\.includes\(input\.type/);
  assert.match(registration, /rpc\("create_trustit_business_for_onboarding"/);
  assert.match(adminBusinessActions, /\.from\("businesses"\)[\s\S]*?\.insert\(\{/);
  assert.doesNotMatch(adminBusinessActions, /saveAdminBusinessDiscoveryLocation/);
  assert.match(adminBusinessActions, /createAdminBusiness[\s\S]*?business/);
  assert.match(registrationForm, /saveTrustitBusiness/);
  assert.doesNotMatch(registrationForm, /name="(?:locality|city|district|state|pincode)"/);
  assert.equal(BUSINESS_TYPES.length, 256);
  assert.equal(BUSINESS_TYPES.every((type) => typeof type === "string" && type.length > 0), true);
  assert.ok(BUSINESS_TYPES.includes("Sweet Shop"));
  assert.ok(BUSINESS_TYPES.includes("Restaurant"));
  assert.ok(BUSINESS_TYPES.includes("Furniture Store"));
  assert.ok(BUSINESS_TYPES.includes("Jewelry Store"));
});
