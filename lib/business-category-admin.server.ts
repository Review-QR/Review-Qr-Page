import "server-only";

import { BUSINESS_CATALOG, BUSINESS_TYPES } from "@/lib/config/business-catalog";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireActiveAdmin } from "@/lib/supabase-server";
import { mergeBusinessCategoryCatalog, normalizeBusinessCategoryTerm, type AdminCategoryRecord } from "@/lib/business-category-catalog";

export type CategoryBusinessRow = {
  id: string; name: string | null; type: string | null; city: string | null; status: string | null;
  merchant_status: string | null; qr_status: string | null; registration_date: string | null; expiry: string | null;
};

export async function loadAdminCategoryData() {
  await requireActiveAdmin();
  const admin = createSupabaseAdminClient();
  const [categoryResult, businessResult] = await Promise.all([
    admin.from("admin_business_categories").select("id,name,source,aliases,primary_icon,qr_icons,experience_mappings,palette,background_art_directions,design_family,is_active,created_at").order("name"),
    admin.from("businesses").select("id,name,type,city,status,merchant_status,qr_status,registration_date,expiry,deleted_at").is("deleted_at", null),
  ]);
  if (categoryResult.error) throw new Error("Business category configuration is unavailable. Apply the category catalog migration before opening this page.");
  if (businessResult.error) throw new Error("Business category counts could not be loaded.");
  const records = (categoryResult.data ?? []) as unknown as AdminCategoryRecord[];
  const categories = mergeBusinessCategoryCatalog(records, true);
  const businesses = (businessResult.data ?? []) as Array<CategoryBusinessRow & { deleted_at?: string | null }>;
  const today = new Date().toISOString().slice(0, 10);
  const counts = Object.fromEntries(categories.map((category) => {
    const matched = businesses.filter((business) => normalizeBusinessCategoryTerm(business.type ?? "") === normalizeBusinessCategoryTerm(category.name));
    const active = matched.filter((business) => business.merchant_status === "active" && business.qr_status === "active" && ["active", "expiring soon"].includes(String(business.status ?? "").toLowerCase()) && (!business.expiry || business.expiry >= today));
    return [category.name, { registered: matched.length, active: active.length, inactive: matched.length - active.length }];
  }));
  return { categories, counts, records };
}

export async function loadCategoryBusinesses(name: string) {
  await requireActiveAdmin();
  const admin = createSupabaseAdminClient();
  const { data: categories, error: categoryError } = await admin.from("admin_business_categories").select("id,name,source,aliases,primary_icon,qr_icons,experience_mappings,palette,background_art_directions,design_family,is_active,created_at");
  if (categoryError) throw new Error("Business category configuration is unavailable.");
  const catalog = mergeBusinessCategoryCatalog((categories ?? []) as unknown as AdminCategoryRecord[], true);
  const category = catalog.find((item) => normalizeBusinessCategoryTerm(item.name) === normalizeBusinessCategoryTerm(name));
  if (!category) return null;
  const { data, error } = await admin.from("businesses").select("id,name,type,city,status,merchant_status,qr_status,registration_date,expiry").eq("type", category.name).is("deleted_at", null).order("registration_date", { ascending: false });
  if (error) throw new Error("Category businesses could not be loaded.");
  return { category, businesses: (data ?? []) as CategoryBusinessRow[] };
}

export async function getSelectableBusinessCategoryData() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("admin_business_categories").select("id,name,source,aliases,primary_icon,qr_icons,experience_mappings,palette,background_art_directions,design_family,is_active,created_at");
  if (error && error.code !== "42P01") throw new Error("Business type catalog could not be loaded.");
  const records = (data ?? []) as unknown as AdminCategoryRecord[];
  return mergeBusinessCategoryCatalog(records);
}

export async function isAvailableBusinessType(value: string, allowInactiveExisting = false) {
  if ((BUSINESS_TYPES as readonly string[]).includes(value)) {
    if (allowInactiveExisting) return true;
    const { data, error } = await createSupabaseAdminClient().from("admin_business_categories").select("is_active").eq("name", value).maybeSingle();
    return !error || error.code === "42P01" ? !data || data.is_active === true : false;
  }
  let query = createSupabaseAdminClient().from("admin_business_categories").select("name,is_active,source").eq("name", value).eq("source", "admin");
  if (!allowInactiveExisting) query = query.eq("is_active", true);
  const { data, error } = await query.maybeSingle();
  return !error && Boolean(data);
}

export async function readCategoryRecords(): Promise<AdminCategoryRecord[]> {
  const { data, error } = await createSupabaseAdminClient().from("admin_business_categories").select("id,name,source,aliases,primary_icon,qr_icons,experience_mappings,palette,background_art_directions,design_family,is_active,created_at");
  if (error) throw new Error("Business category configuration is unavailable.");
  return (data ?? []) as unknown as AdminCategoryRecord[];
}

export async function getQrBusinessCategoryConfig(name: string) {
  const records = await readCategoryRecords().catch(() => []);
  return mergeBusinessCategoryCatalog(records, true).find((category) => normalizeBusinessCategoryTerm(category.name) === normalizeBusinessCategoryTerm(name)) ?? null;
}

export function isBuiltInCategory(name: string) { return (BUSINESS_CATALOG as readonly { name: string }[]).some((item) => item.name === name); }
