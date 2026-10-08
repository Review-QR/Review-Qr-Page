import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const file = fileURLToPath(new URL("./config/business-catalog.ts", import.meta.url));
const tsSource = readFileSync(file, "utf8");
const js = ts.transpileModule(tsSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loaded = { exports: {} };
new Function("module", "exports", js)(loaded, loaded.exports);
const { BUSINESS_TYPES, BUSINESS_CATALOG, QR_DESIGN_THEMES, getBusinessCategory, searchBusinessCategories, validateBusinessCatalog } = loaded.exports;

const legacyTypes = ["Restaurant","Shop","Cafe","Cafe/Restaurant","Coffee Shop","Fast Food","Bakery","Cake Shop","Sweet Shop","Food Truck","Dhaba","Catering Service","Grocery Store","Supermarket","Retail Shop","Retail","Clothing Store","Footwear Store","Electronics Store","Furniture Store","Jewelry Store","Mobile & Accessories","Hardware Store","Pharmacy","Clinic","Medical","Medical Store","Diagnostic Centre","Dental Clinic","Optical Store","Salon","Beauty Parlour","Spa","Barber Shop","Gym & Fitness","Yoga Studio","Hotel","Hotel / Stay","Resort","Guest House","Travel Agency","Laundry","Dry Cleaning","Automobile Garage","Garage","Car Wash","Bike Service","Library","Book Store","Stationery Store","School","Coaching Centre","Computer Institute","Professional Services","Real Estate","Financial Services","Insurance","Pet Care","Photography Studio","Event Services","Repair Services","Other"];

test("catalog preserves all existing canonical values and adds a broad, unique catalog", () => {
  assert.ok(BUSINESS_TYPES.length >= 200);
  assert.equal(new Set(BUSINESS_TYPES).size, BUSINESS_TYPES.length);
  for (const legacy of legacyTypes) assert.ok(BUSINESS_TYPES.includes(legacy), `missing legacy value: ${legacy}`);
  assert.equal(validateBusinessCatalog(), true);
});

test("mandatory local-business categories are present", () => {
  for (const name of [
    "Library","Study Centre","Study Room / Reading Room","Coaching Centre","Tea Point",
    "Tea Stall / Tapri","Petrol Pump","EV Charging Station","Shopping Mall","Supermarket",
    "General Store","Namkeen Shop","Restaurant","Cafe","Bakery","Hotel","Salon",
    "Beauty Parlour","Gym","Pharmacy","Clinic","Hospital","Diagnostic Centre",
    "Mobile Store","Mobile Repair","Computer Store","Cyber Cafe","Book Store",
    "Stationery Store","Clothing Store","Saree Shop","Jewellery Store","Furniture Store",
    "Hardware Store","Electrical Store","Sanitary Store","Building Material Store",
    "Car Dealer","Bike Dealer","Car Service","Bike Service","Tyre Shop","Auto Parts",
    "Car Wash","Travel Agency","Courier Service","Printing Press","Photo Studio","Tailor",
    "Laundry","Dry Cleaner","Florist","Event Planner","Banquet Hall","Real Estate Agency",
    "Insurance Agency","Bank","ATM","CA Office","Lawyer","Digital Marketing Agency",
    "IT Services","Veterinary Clinic","Pet Shop","Sports Store","Sports Academy",
    "Dance Academy","Music School","Art Classes","Gaming Zone","Cinema",
  ]) assert.ok(BUSINESS_TYPES.includes(name), `missing required category: ${name}`);
});

test("every category has complete themes, palette, icon, background and experience icon mappings", () => {
  assert.deepEqual(QR_DESIGN_THEMES.map((theme) => theme.name), ["Luxury","Modern","Nature","Heritage","Minimal"]);
  for (const category of BUSINESS_CATALOG) {
    assert.ok(category.id && category.slug && category.primaryIcon);
    assert.ok(category.aliases.length > 0);
    assert.equal(category.experiences.length, 15, category.name);
    assert.ok(category.experiences.every((item) => item.label && item.icon), category.name);
    assert.equal(category.themes.length, 5, category.name);
    for (const theme of category.themes) {
      assert.equal(theme.experiences.length, 3, category.name);
      assert.ok(theme.experiences.every((item) => item.icon), category.name);
      assert.equal(theme.palette.length, 3, category.name);
      assert.ok(theme.backgroundArtDirection && theme.footer, category.name);
    }
  }
});

test("search ranks canonical names and supports local aliases and partial terms", () => {
  const has = (query, name) => assert.ok(searchBusinessCategories(query).some((category) => category.name === name), `${query} did not return ${name}`);
  has("rest","Restaurant");
  has("lib","Library");
  has("sal","Salon");
  has("saloon","Salon");
  has("stud","Study Centre");
  has("stud","Coaching Centre");
  has("tea","Tea Point");
  has("tea","Cafe");
  has("chai","Tea Stall / Tapri");
  has("pet","Petrol Pump");
  has("mall","Shopping Mall");
  has("sweet","Sweet Shop");
  has("bak","Bakery");
  has("phar","Pharmacy");
  has("mob","Mobile Store");
  has("mob","Mobile Repair");
  has("car","Car Dealer");
  assert.equal(searchBusinessCategories("restaurant")[0].name,"Restaurant");
  assert.equal(getBusinessCategory("restro"),undefined);
});

test("arbitrary free text is never resolved as a canonical category", () => {
  assert.equal(getBusinessCategory("my brand-new invented category"), undefined);
  assert.deepEqual(searchBusinessCategories("qzxwv nonsense"), []);
});

test("catalog ids and slugs remain unique", () => {
  assert.equal(new Set(BUSINESS_CATALOG.map((category) => category.id)).size, BUSINESS_CATALOG.length);
  assert.equal(new Set(BUSINESS_CATALOG.map((category) => category.slug)).size, BUSINESS_CATALOG.length);
});
