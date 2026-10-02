import assert from "node:assert/strict";
import test from "node:test";
import { businessTypes, findBusinessType, getBusinessIconGlyph, getReviewTaxonomyType, searchBusinessTypes } from "./business-types.ts";

test("business catalog has unique stable identifiers and exactly three primary indicators per type", () => {
  assert.equal(businessTypes.length, 159);
  assert.equal(new Set(businessTypes.map((type) => type.id)).size, businessTypes.length);
  assert.equal(new Set(businessTypes.map((type) => type.slug)).size, businessTypes.length);
  for (const type of businessTypes) {
    assert.equal(type.primaryIcons.length, 3, type.name);
    assert.ok(type.primaryIcons.every((icon) => icon.key && icon.label), type.name);
    assert.ok(type.primaryIcons.every((icon) => getBusinessIconGlyph(icon.key) !== "✦"), type.name);
  }
});

test("search supports partial case-insensitive matching, aliases, and starts-with ordering", () => {
  assert.equal(searchBusinessTypes("rest")[0].name, "Restaurant");
  assert.equal(searchBusinessTypes("GEN")[0].name, "General Store");
  assert.ok(searchBusinessTypes("sal").some((type) => type.name === "Salon"));
  assert.ok(searchBusinessTypes("sal").some((type) => type.name === "Beauty Parlour"));
  assert.equal(findBusinessType("coffee house").name, "Café");
  assert.equal(findBusinessType("hotel").primaryIcons.map((icon) => icon.label).join("/"), "Hotel/Bed/Room Key");
  assert.equal(findBusinessType("Restaurant").primaryIcons.map((icon) => icon.label).join("/"), "Restaurant Building/Chef/Food Plate");
  assert.equal(findBusinessType("Salon").primaryIcons.map((icon) => icon.label).join("/"), "Scissors/Hair Dryer/Mirror");
});

test("new business types resolve to existing customer review taxonomies", () => {
  assert.equal(getReviewTaxonomyType("Hotel"), "Shop");
  assert.equal(getReviewTaxonomyType("Restaurant"), "Restaurant");
  assert.equal(getReviewTaxonomyType("Salon"), "Salon");
  assert.equal(getReviewTaxonomyType("Clinic"), "Medical");
});
