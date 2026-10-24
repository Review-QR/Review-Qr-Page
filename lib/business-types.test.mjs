import test from "node:test";
import assert from "node:assert/strict";
import {
  BUSINESS_TYPES,
  normalizeBusinessType,
  reviewExperienceGroup,
  searchBusinessTypes,
} from "./business-types.ts";

test("business type aliases resolve to canonical stored values", () => {
  assert.equal(normalizeBusinessType(" lib "), "Library");
  assert.equal(normalizeBusinessType("REST"), "Restaurant");
  assert.equal(normalizeBusinessType("sal"), "Salon");
  assert.equal(normalizeBusinessType("Saloon"), "Salon");
  assert.equal(normalizeBusinessType("  CAFÉ  "), "Cafe");
  assert.equal(normalizeBusinessType("Hotel / Stay"), "Hotel / Stay");
  assert.equal(normalizeBusinessType("unknown type"), null);
});

test("search is normalized, canonical, ranked, and deduplicated", () => {
  assert.equal(searchBusinessTypes("lib")[0], "Library");
  assert.equal(searchBusinessTypes("rest")[0], "Restaurant");
  assert.equal(searchBusinessTypes(" sal ")[0], "Salon");
  assert.equal(searchBusinessTypes("CAFÉ")[0], "Cafe");
  assert.equal(new Set(searchBusinessTypes("sal")).size, searchBusinessTypes("sal").length);
  assert.deepEqual(searchBusinessTypes("not-a-real-business-type"), []);
});

test("every supported and legacy catalog entry maps to an experience group", () => {
  assert.equal(reviewExperienceGroup("library"), "Library");
  assert.equal(reviewExperienceGroup("Cafe/Restaurant"), "Restaurant");
  assert.equal(reviewExperienceGroup("Medical Store"), "Medical");
  assert.equal(reviewExperienceGroup("Hotel"), "Hotel");
  assert.equal(reviewExperienceGroup("Dry Cleaning"), "Laundry");
  assert.equal(reviewExperienceGroup("Gym & Fitness"), "Fitness");
  assert.equal(reviewExperienceGroup("Travel Agency"), "Travel");
  assert.equal(reviewExperienceGroup("Manufacturer"), "Other");
  assert.ok(BUSINESS_TYPES.every((type) => reviewExperienceGroup(type) !== null));
  assert.equal(reviewExperienceGroup("unsupported"), null);
});
