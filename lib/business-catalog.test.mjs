import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import * as lucideReact from "lucide-react";

const require = createRequire(import.meta.url);
const file = fileURLToPath(new URL("./config/business-catalog.ts", import.meta.url));
const outDir = mkdtempSync(join(tmpdir(), "trustit-business-catalog-"));
execFileSync(process.execPath, [
  join(process.cwd(), "node_modules", "typescript", "bin", "tsc"),
  file,
  "--target", "ES2022",
  "--module", "CommonJS",
  "--rootDir", dirname(file),
  "--outDir", outDir,
  "--skipLibCheck",
  "--ignoreConfig",
], { cwd: process.cwd() });
const { BUSINESS_TYPES, BUSINESS_CATALOG, QR_DESIGN_THEMES, getBusinessCategory, searchBusinessCategories, validateBusinessCatalog } =
  require(join(outDir, "business-catalog.js"));
const iconComponent = readFileSync(new URL("../app/components/business-category-icon.tsx", import.meta.url), "utf8");
const iconMap = iconComponent.split("const icons:")[1]?.split("const familyIcons:")[0] ?? "";
const searchableSelector = readFileSync(new URL("../app/components/searchable-business-type.tsx", import.meta.url), "utf8");
after(() => rmSync(outDir, { recursive: true, force: true }));

const legacyTypes = ["Restaurant","Shop","Cafe","Cafe/Restaurant","Coffee Shop","Fast Food","Bakery","Cake Shop","Sweet Shop","Food Truck","Dhaba","Catering Service","Grocery Store","Supermarket","Retail Shop","Retail","Clothing Store","Footwear Store","Electronics Store","Furniture Store","Jewelry Store","Mobile & Accessories","Hardware Store","Pharmacy","Clinic","Medical","Medical Store","Diagnostic Centre","Dental Clinic","Optical Store","Salon","Beauty Parlour","Spa","Barber Shop","Gym & Fitness","Yoga Studio","Hotel","Hotel / Stay","Resort","Guest House","Travel Agency","Laundry","Dry Cleaning","Automobile Garage","Garage","Car Wash","Bike Service","Library","Book Store","Stationery Store","School","Coaching Centre","Computer Institute","Professional Services","Real Estate","Financial Services","Insurance","Pet Care","Photography Studio","Event Services","Repair Services","Other"];

test("catalog preserves all existing canonical values and adds a broad, unique catalog", () => {
  assert.equal(BUSINESS_TYPES.length, 256);
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
  assert.deepEqual(QR_DESIGN_THEMES.map((theme) => theme.footer), [
    "YOUR FEEDBACK MAKES US BETTER",
    "YOUR FEEDBACK HELPS US GROW",
    "YOUR EXPERIENCE MATTERS TO US",
    "YOUR REVIEW INSPIRES US TO IMPROVE",
    "YOUR FEEDBACK HELPS US SERVE YOU BETTER",
  ]);
  assert.match(iconComponent, /from "lucide-react"/);
  for (const category of BUSINESS_CATALOG) {
    assert.ok(category.id && category.slug && category.primaryIcon);
    assert.ok(lucideReact[category.primaryIcon], `${category.name} primary icon is not exported by lucide-react`);
    assert.match(iconMap, new RegExp(`\\b${category.primaryIcon}\\s*,`), `${category.name} primary icon is not mapped to a Lucide component`);
    assert.ok(category.aliases.length > 0);
    assert.equal(category.experiences.length, 15, category.name);
    assert.ok(category.experiences.every((item) => item.label && item.icon), category.name);
    for (const experience of category.experiences) {
      assert.ok(lucideReact[experience.icon], `${category.name} experience icon ${experience.icon} is not exported by lucide-react`);
      assert.match(iconMap, new RegExp(`\\b${experience.icon}\\s*,`), `${category.name} experience icon ${experience.icon} is not mapped to a Lucide component`);
    }
    assert.equal(category.themes.length, 5, category.name);
    for (const theme of category.themes) {
      assert.equal(theme.experiences.length, 3, category.name);
      assert.ok(theme.experiences.every((item) => item.icon), category.name);
      assert.equal(theme.palette.length, 3, category.name);
      assert.ok(theme.backgroundArtDirection && theme.footer, category.name);
      assert.ok(theme.safeAreas.qr && theme.safeAreas.businessName && theme.safeAreas.cta, category.name);
    }
  }
});

test("search ranks canonical names and supports local aliases and partial terms", () => {
  const has = (query, name) => assert.ok(searchBusinessCategories(query).some((category) => category.name === name), `${query} did not return ${name}`);
  has("rest","Restaurant");
  has("lib","Library");
  has("sal","Salon");
  has("saloon","Salon");
  assert.equal(searchBusinessCategories("saloon")[0].name,"Salon");
  has("stud","Study Centre");
  has("stud","Coaching Centre");
  has("tea","Tea Point");
  has("tea","Cafe");
  has("chai","Tea Point");
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
  assert.equal(getBusinessCategory("restro").name,"Restaurant");
  assert.equal(getBusinessCategory("saloon").name,"Saloon", "saved canonical values remain unchanged even when also useful as a search alias");
  assert.equal(getBusinessCategory("Tea Stall").name,"Tea Stall / Tapri");
  assert.equal(getBusinessCategory("Chai Point").name,"Tea Point");
  assert.equal(getBusinessCategory("Study Center").name,"Study Centre");
  assert.equal(getBusinessCategory("Fuel Station").name,"Petrol Pump");
});

test("arbitrary free text is never resolved as a canonical category", () => {
  assert.equal(getBusinessCategory("my brand-new invented category"), undefined);
  assert.deepEqual(searchBusinessCategories("qzxwv nonsense"), []);
});

test("registration selector is an accessible keyboard-friendly scrollable search that submits canonical values", () => {
  assert.match(searchableSelector, /role="combobox"/);
  assert.match(searchableSelector, /aria-autocomplete="list"/);
  assert.match(searchableSelector, /role="listbox"[^>]+max-h-64[^>]+overflow-y-auto/);
  assert.match(searchableSelector, /event\.key === "ArrowDown"/);
  assert.match(searchableSelector, /event\.key === "ArrowUp"/);
  assert.match(searchableSelector, /event\.key === "Enter"[\s\S]*?choose\(options\[activeIndex\]\.name\)/);
  assert.match(searchableSelector, /<input type="hidden" name=\{name\} value=\{value\} \/>/);
  assert.doesNotMatch(searchableSelector, /value=\{query\}[^\n]*name=\{name\}/);
});

test("catalog ids and slugs remain unique", () => {
  assert.equal(new Set(BUSINESS_CATALOG.map((category) => category.id)).size, BUSINESS_CATALOG.length);
  assert.equal(new Set(BUSINESS_CATALOG.map((category) => category.slug)).size, BUSINESS_CATALOG.length);
});
