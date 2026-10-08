"use server";

import { revalidatePath } from "next/cache";
import { iconNames } from "lucide-react/dynamic";
import { BUSINESS_CATALOG } from "@/lib/config/business-catalog";
import { mergeBusinessCategoryCatalog, normalizeBusinessCategoryTerm, type ExperienceMapping } from "@/lib/business-category-catalog";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireActiveAdmin } from "@/lib/supabase-server";
import { readCategoryRecords, isBuiltInCategory } from "@/lib/business-category-admin.server";
import { getSelectableBusinessCategoryData } from "@/lib/business-category-admin.server";
import type { UnifiedBusinessCategory } from "@/lib/business-category-catalog";

const FAMILY_SET = new Set(["food", "retail", "healthcare", "education", "beauty", "hospitality", "automotive", "home", "professional", "finance", "technology", "entertainment", "travel", "events", "agriculture", "community", "manufacturing", "general"]);
const ICONS = new Set<string>(iconNames);
const DEFAULT_EXPERIENCES = ["Quality", "Service", "Staff", "Cleanliness", "Overall Experience"];

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function cleanText(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function isSafeLabel(value: string) { return /^[\p{L}\p{N}\s&().'’'/-]+$/u.test(value); }
function normalizeIcon(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (ICONS.has(value)) return value;
  const kebab = value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLocaleLowerCase();
  return ICONS.has(kebab) ? kebab : null;
}

function parsePayload(value: unknown) {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const rawAliases = Array.isArray(value.aliases) ? value.aliases.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
  const aliases = [...new Set(rawAliases)];
  const primaryIcon = normalizeIcon(value.primaryIcon);
  const qrIcons = value.qrIcons;
  const rawExperiences = value.experiences;
  const palette = value.palette;
  const directions = value.backgroundArtDirections;
  const designFamily = value.designFamily;
  const normalizedQrIcons = Array.isArray(qrIcons) ? qrIcons.map(normalizeIcon) : [];
  if (name.length < 2 || name.length > 80 || !isSafeLabel(name) || aliases.length > 30 || aliases.some((alias) => alias.length > 80 || !isSafeLabel(alias)) || !primaryIcon || normalizedQrIcons.length !== 3 || normalizedQrIcons.some((icon) => !icon) ||
      !Array.isArray(rawExperiences) || rawExperiences.length !== 5 || !Array.isArray(palette) || palette.length !== 3 ||
      !palette.every((color) => typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)) ||
      !Array.isArray(directions) || directions.length !== 5 || !directions.every((entry) => typeof entry === "string" && entry.trim().length <= 280) ||
      typeof designFamily !== "string" || !FAMILY_SET.has(designFamily)) return null;
  const experiences: ExperienceMapping[] = [];
  for (const entry of rawExperiences) {
    if (!isRecord(entry)) return null;
    const label = typeof entry.label === "string" ? entry.label.trim() : "";
    if (!label || label.length > 60 || !isSafeLabel(label) || !Array.isArray(entry.icons) || entry.icons.length !== 3) return null;
    const normalizedIcons = entry.icons.map(normalizeIcon);
    if (normalizedIcons.some((icon) => !icon)) return null;
    experiences.push({ label, icons: normalizedIcons as string[] });
  }
  return { name, aliases, primaryIcon, qrIcons: normalizedQrIcons as string[], experiences, palette: palette as string[], backgroundArtDirections: directions.map((entry) => String(entry).trim()), designFamily };
}

async function checkConflicts(name: string, aliases: string[], excludeId?: string) {
  const records = await readCategoryRecords();
  const existing = mergeBusinessCategoryCatalog(records, true);
  const own = existing.find((entry) => records.some((record) => record.id === excludeId && normalizeBusinessCategoryTerm(record.name) === normalizeBusinessCategoryTerm(entry.name)));
  const proposed = [name, ...aliases].map(normalizeBusinessCategoryTerm).filter(Boolean);
  for (const term of proposed) {
    for (const category of existing) {
      if (own?.id === category.id || (normalizeBusinessCategoryTerm(name) === term && normalizeBusinessCategoryTerm(category.name) === term)) continue;
      if (normalizeBusinessCategoryTerm(category.name) === normalizeBusinessCategoryTerm(name)) continue;
      if ([category.name, ...category.aliases].some((entry) => normalizeBusinessCategoryTerm(entry) === term)) return `“${name}” or one of its aliases is already used by ${category.name}.`;
    }
  }
  return null;
}

export async function saveBusinessCategoryAction(value: unknown) {
  await requireActiveAdmin();
  const payload = parsePayload(value);
  if (!payload) return { success: false as const, message: "Check the category name, Lucide icons, five experience rows, and colors." };
  const id = isRecord(value) && typeof value.id === "string" ? value.id : undefined;
  const builtinEdit = isRecord(value) && value.builtinEdit === true;
  const canonicalBuiltin = BUSINESS_CATALOG.find((entry) => normalizeBusinessCategoryTerm(entry.name) === normalizeBusinessCategoryTerm(payload.name));
  const currentRecords = await readCategoryRecords();
  const current = currentRecords.find((record) => record.id === id);
  if (id && !current) return { success: false as const, message: "This category could not be found. Refresh and try again." };
  if (current?.source === "built-in-override" && current.name !== payload.name) return { success: false as const, message: "Built-in canonical category names cannot be changed." };
  if (!id && canonicalBuiltin && !builtinEdit) return { success: false as const, message: `${canonicalBuiltin.name} is already a built-in category.` };
  if (builtinEdit && canonicalBuiltin?.name !== payload.name) return { success: false as const, message: "A built-in category name cannot be changed." };
  const renamedAliases = current && current.name !== payload.name ? [...new Set([...payload.aliases, current.name])] : payload.aliases;
  if (current && current.source === "admin" && current.name !== payload.name) {
    const { count, error } = await createSupabaseAdminClient().from("businesses").select("id", { count: "exact", head: true }).eq("type", current.name);
    if (error) return { success: false as const, message: "Existing category use could not be checked. Please try again." };
    if ((count ?? 0) > 0) return { success: false as const, message: "This category has registered businesses, so its canonical name cannot be changed." };
  }
  const conflict = await checkConflicts(payload.name, renamedAliases, id);
  if (conflict) return { success: false as const, message: conflict };
  const admin = createSupabaseAdminClient();
  const row = {
    name: payload.name,
    source: current?.source ?? (isBuiltInCategory(payload.name) ? "built-in-override" : "admin"),
    aliases: renamedAliases,
    primary_icon: payload.primaryIcon,
    qr_icons: payload.qrIcons,
    experience_mappings: payload.experiences,
    palette: payload.palette,
    background_art_directions: payload.backgroundArtDirections,
    design_family: payload.designFamily,
    is_active: isRecord(value) && typeof value.isActive === "boolean" ? value.isActive : current?.is_active ?? true,
  };
  const result = id
    ? await admin.from("admin_business_categories").update(row).eq("id", id).select("id").maybeSingle()
    : await admin.from("admin_business_categories").insert(row).select("id").single();
  if (result.error || !result.data) return { success: false as const, message: "The category could not be saved. Please try again." };
  revalidatePath("/business-categories");
  revalidatePath("/register/business");
  revalidatePath("/businesses");
  return { success: true as const, message: "Business category saved." };
}

export async function setBusinessCategoryActiveAction(nameInput: unknown, active: boolean) {
  await requireActiveAdmin();
  if (typeof nameInput !== "string" || typeof active !== "boolean") return { success: false as const, message: "Choose a valid category and status." };
  const name = cleanText(nameInput, 80);
  const records = await readCategoryRecords();
  const current = records.find((record) => normalizeBusinessCategoryTerm(record.name) === normalizeBusinessCategoryTerm(name));
  const admin = createSupabaseAdminClient();
  const builtIn = BUSINESS_CATALOG.find((entry) => entry.name === name);
  const result = current
    ? await admin.from("admin_business_categories").update({ is_active: active }).eq("id", current.id).select("id").maybeSingle()
    : builtIn
      ? await admin.from("admin_business_categories").insert({
          name, source: "built-in-override", is_active: active, aliases: [], primary_icon: builtIn.primaryIcon,
          qr_icons: [builtIn.primaryIcon, builtIn.experiences[0]?.icon ?? "Star", builtIn.experiences[1]?.icon ?? "Sparkles"],
          experience_mappings: Array.from({ length: 5 }, (_, index) => ({ label: builtIn.themes[index].experiences[0]?.label ?? DEFAULT_EXPERIENCES[index], icons: builtIn.themes[index].experiences.map((entry) => entry.icon).slice(0, 3) })),
          palette: [...builtIn.themes[0].palette], background_art_directions: builtIn.themes.map((theme) => theme.backgroundArtDirection), design_family: builtIn.designFamily,
        }).select("id").single()
      : { data: null, error: new Error("Category not found") };
  if (result.error || !result.data) return { success: false as const, message: "Category status could not be updated." };
  revalidatePath("/business-categories");
  revalidatePath("/register/business");
  return { success: true as const, message: active ? "Category activated." : "Category deactivated. Existing businesses and QR codes remain unchanged." };
}

export async function getAdminSelectableBusinessCategoriesAction(): Promise<UnifiedBusinessCategory[]> {
  await requireActiveAdmin();
  return getSelectableBusinessCategoryData();
}
