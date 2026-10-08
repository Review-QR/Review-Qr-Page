import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BUSINESS_CATALOG, BUSINESS_TYPES } from "../../lib/config/business-catalog.ts";
import { mergeBusinessCategoryCatalog, searchUnifiedBusinessCategories } from "../../lib/business-category-catalog.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("admin category storage is additive, private, and service-role-only", async () => {
  const sql = await read("../../supabase/migrations/20261008150000_admin_business_categories.sql");
  assert.match(sql, /create table if not exists public\.admin_business_categories/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on table public\.admin_business_categories from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table public\.admin_business_categories to service_role/i);
  assert.match(sql, /references public\.admin_users\(user_id\) on delete set null/i);
  assert.match(sql, /cardinality\(qr_icons\) = 3/i);
  assert.match(sql, /jsonb_array_length\(experience_mappings\) in \(0, 5\)/i);
  assert.doesNotMatch(sql, /drop table|truncate|delete from public\.(businesses|admin_business_categories)/i);
});

test("unified resolver keeps all 256 built-ins, merges admin categories, and preserves configured icon sets", () => {
  const experiences = ["Stay", "Dining", "Service", "Cleanliness", "Overall"].map((label, index) => ({ label, icons: [`star-${index + 1}`, "heart", "sparkles"] }));
  const hotel = BUSINESS_CATALOG.find((category) => category.name === "Hotel");
  const merged = mergeBusinessCategoryCatalog([{ id: "hotel-override", name: "Hotel", source: "built-in-override", aliases: ["hotel stay"], primary_icon: "hotel", qr_icons: ["hotel", "star", "bed-double"], experience_mappings: experiences, palette: ["#123456", "#abcdef", "#fedcba"], background_art_directions: ["stay theme", "modern stay", "nature stay", "heritage stay", "minimal stay"], design_family: "hospitality", is_active: true, created_at: "" }, { id: "admin-book-cafe", name: "Book Cafe", source: "admin", aliases: ["book café", "reading cafe"], primary_icon: "book-open", qr_icons: ["book-open", "coffee", "star"], experience_mappings: experiences, palette: ["#123456", "#abcdef", "#fedcba"], background_art_directions: ["one", "two", "three", "four", "five"], design_family: "education", is_active: true, created_at: "" }]);
  assert.equal(BUSINESS_TYPES.length, 256);
  assert.equal(merged.filter((category) => category.source === "Built-in").length, 256);
  const resolvedHotel = merged.find((category) => category.name === "Hotel");
  assert.ok(hotel);
  assert.ok(resolvedHotel?.aliases.includes("hotel stay"));
  for (const alias of hotel.aliases) assert.ok(resolvedHotel?.aliases.includes(alias), `built-in Hotel alias lost: ${alias}`);
  assert.equal(resolvedHotel?.experiences.length, 15);
  assert.equal(resolvedHotel?.themes.length, 5);
  assert.ok(searchUnifiedBusinessCategories("hotel stay", merged).some((category) => category.name === "Hotel"));
  assert.ok(searchUnifiedBusinessCategories("read", merged).some((category) => category.name === "Book Cafe"));
  assert.ok(searchUnifiedBusinessCategories("lib", merged).some((category) => category.name === "Library"));
  assert.equal(mergeBusinessCategoryCatalog([{ id: "disabled", name: "Book Cafe", source: "admin", aliases: [], primary_icon: "store", qr_icons: ["store", "star", "heart"], experience_mappings: [], palette: [], background_art_directions: [], design_family: "general", is_active: false, created_at: "" }]).some((category) => category.name === "Book Cafe"), false);
});

test("admin category actions recheck active-admin access and prevent canonical or alias conflicts", async () => {
  const actions = await read("./actions.ts");
  assert.match(actions, /await requireActiveAdmin\(\)/);
  assert.match(actions, /checkConflicts\(payload\.name, renamedAliases, id\)/);
  assert.match(actions, /normalizeBusinessCategoryTerm\(entry\.name\) === normalizeBusinessCategoryTerm\(payload\.name\)/);
  assert.match(actions, /already used by/);
  assert.match(actions, /Built-in canonical category names cannot be changed/);
  assert.match(actions, /registered businesses, so its canonical name cannot be changed/);
  assert.match(actions, /is_active: active/);
  assert.doesNotMatch(actions, /\.delete\(/);
});

test("category counts and category-specific businesses use real, non-deleted business records", async () => {
  const data = await read("../../lib/business-category-admin.server.ts");
  assert.match(data, /from\("businesses"\)[\s\S]*?select\("id,name,type,city,status,merchant_status,qr_status,registration_date,expiry,deleted_at"\)[\s\S]*?\.is\("deleted_at", null\)/);
  assert.match(data, /business\.merchant_status === "active"/);
  assert.match(data, /business\.qr_status === "active"/);
  assert.match(data, /business\.status[\s\S]*?business\.expiry/);
  assert.match(data, /registered: matched\.length, active: active\.length, inactive: matched\.length - active\.length/);
  assert.doesNotMatch(data, /review_sessions|review_customer_profiles|customer_reviews/);
});

test("admin catalog includes list/search/actions and category business details", async () => {
  const page = await read("./page.tsx");
  const manager = await read("./business-category-manager.tsx");
  const detail = await read("./[slug]/page.tsx");
  const table = await read("./category-businesses-table.tsx");
  assert.match(page, /loadAdminCategoryData/);
  for (const field of ["Registered", "Active", "Inactive / Expired", "View Businesses", "Deactivate", "Activate"]) assert.ok(manager.includes(field), `missing ${field}`);
  assert.match(manager, /searchUnifiedBusinessCategories/);
  for (const field of ["business.id", "business.city", "business.status", "business.merchant_status", "business.qr_status", "business.registration_date", "business.expiry"]) assert.ok(table.includes(field), `missing category detail field ${field}`);
  assert.match(detail, /await loadCategoryBusinesses/);
});

test("merchant registration and QR rendering consume the unified category resolver", async () => {
  const catalog = await read("../../lib/business-category-catalog.ts");
  const register = await read("../register/business/page.tsx");
  const form = await read("../register/business-form.tsx");
  const qr = await read("../merchant/dashboard/qr/page.tsx");
  const gallery = await read("../merchant/dashboard/qr/qr-template-gallery.tsx");
  assert.match(catalog, /mergeBusinessCategoryCatalog/);
  assert.match(catalog, /searchUnifiedBusinessCategories/);
  assert.match(register, /getSelectableBusinessCategoryData/);
  assert.match(form, /categories=\{categories\}/);
  assert.match(qr, /getQrBusinessCategoryConfig/);
  assert.match(gallery, /categoryConfig\?\.qrIcons/);
  assert.match(gallery, /data-background-direction=\{posterCategory\.backgroundArtDirection\}/);
  assert.match(gallery, /ReviewQr url=\{qrUrl\}/);
});

test("all selectable admin icon names are validated against Lucide exports", async () => {
  const actions = await read("./actions.ts");
  const manager = await read("./business-category-manager.tsx");
  assert.match(actions, /import \{ iconNames \} from "lucide-react\/dynamic"/);
  assert.match(actions, /ICONS\.has\(kebab\)/);
  assert.match(manager, /iconNames\.map/);
  assert.match(manager, /Search Lucide icons/);
});
