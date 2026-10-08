import { BUSINESS_CATALOG, BUSINESS_TYPES, QR_DESIGN_THEMES, getBusinessCategory, type DesignFamily } from "./config/business-catalog.ts";

export type ExperienceMapping = { label: string; icons: string[] };
export type AdminCategoryRecord = {
  id: string;
  name: string;
  source: "admin" | "built-in-override";
  aliases: string[];
  primary_icon: string;
  qr_icons: string[];
  experience_mappings: ExperienceMapping[];
  palette: string[];
  background_art_directions: string[];
  design_family: string;
  is_active: boolean;
  created_at: string;
};

type StaticCategory = (typeof BUSINESS_CATALOG)[number];
export type UnifiedCategoryTheme = {
  id: string; name: string; footer: string; palette: readonly string[];
  experiences: Array<{ label: string; icon: string }>;
  backgroundArtDirection: string;
  safeAreas: { qr: string; businessName: string; cta: string };
};
export type UnifiedBusinessCategory = Omit<StaticCategory, "id" | "name" | "slug" | "aliases" | "searchTerms" | "primaryIcon" | "designFamily" | "experiences" | "themes"> & {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  searchTerms: string[];
  primaryIcon: string;
  designFamily: DesignFamily;
  experiences: Array<{ label: string; icon: string }>;
  themes: UnifiedCategoryTheme[];
  source: "Built-in" | "Admin-created";
  active: boolean;
  qrIcons: string[];
};

const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

function safeFamily(value: string): DesignFamily {
  const allowed: DesignFamily[] = ["food", "retail", "healthcare", "education", "beauty", "hospitality", "automotive", "home", "professional", "finance", "technology", "entertainment", "travel", "events", "agriculture", "community", "manufacturing", "general"];
  return allowed.includes(value as DesignFamily) ? value as DesignFamily : "general";
}

export function mergeBusinessCategoryCatalog(records: AdminCategoryRecord[] = [], includeInactive = false): UnifiedBusinessCategory[] {
  const byName = new Map(records.map((record) => [normalize(record.name), record]));
  const builtins: UnifiedBusinessCategory[] = BUSINESS_CATALOG.map((category): UnifiedBusinessCategory => {
    const override = byName.get(normalize(category.name));
    if (!override) return { ...category, source: "Built-in", active: true, qrIcons: [category.primaryIcon, category.experiences[0]?.icon ?? category.primaryIcon, category.experiences[1]?.icon ?? category.primaryIcon] };
    const mapped = override.experience_mappings?.length === 5 ? override.experience_mappings : null;
    return {
      ...category,
      aliases: [...new Set([...category.aliases, ...(override.aliases ?? [])])],
      searchTerms: [...new Set([...category.searchTerms, ...(override.aliases ?? [])])],
      primaryIcon: override.primary_icon || category.primaryIcon,
      designFamily: safeFamily(override.design_family),
      experiences: mapped ? mapped.flatMap((entry) => entry.icons.slice(0, 3).map((icon) => ({ label: entry.label, icon }))) : category.experiences,
      themes: category.themes.map((theme, index) => ({
        ...theme,
        palette: override.palette?.length === 3 ? override.palette : theme.palette,
        backgroundArtDirection: override.background_art_directions?.[index] || theme.backgroundArtDirection,
        experiences: mapped?.[index]?.icons?.slice(0, 3).map((icon) => ({ label: mapped[index].label, icon })) ?? theme.experiences,
      })),
      source: "Built-in",
      active: override.is_active,
      qrIcons: override.qr_icons?.length === 3 ? override.qr_icons : [override.primary_icon, category.experiences[0]?.icon ?? override.primary_icon, category.experiences[1]?.icon ?? override.primary_icon],
    };
  });
  const names = new Set(BUSINESS_TYPES.map(normalize));
  const created = records.filter((record) => record.source === "admin" && !names.has(normalize(record.name))).map((record): UnifiedBusinessCategory => {
    const fallback = getBusinessCategory("Other")!;
    const mapped = record.experience_mappings?.length === 5 ? record.experience_mappings : Array.from({ length: 5 }, (_, index) => ({ label: ["Quality", "Service", "Staff", "Cleanliness", "Overall Experience"][index], icons: ["Star", "Heart", "Sparkles"] }));
    const themes = QR_DESIGN_THEMES.map((theme, index) => ({
      ...theme,
      palette: record.palette?.length === 3 ? record.palette : fallback.themes[index].palette,
      experiences: mapped[index].icons.slice(0, 3).map((icon) => ({ label: mapped[index].label, icon })),
      backgroundArtDirection: record.background_art_directions?.[index] || `Premium ${record.design_family} business atmosphere; preserve the QR, name, and CTA safe areas.`,
      safeAreas: fallback.themes[index].safeAreas,
    }));
    return {
      ...fallback,
      id: normalize(record.name).replace(/\s+/g, "-"), name: record.name, slug: normalize(record.name).replace(/\s+/g, "-"),
      aliases: [...new Set([record.name, ...(record.aliases ?? [])])], searchTerms: [...new Set([record.name, ...(record.aliases ?? [])])],
      primaryIcon: record.primary_icon || "Store", designFamily: safeFamily(record.design_family), experiences: themes.flatMap((theme) => theme.experiences), themes,
      source: "Admin-created", active: record.is_active, qrIcons: record.qr_icons?.length === 3 ? record.qr_icons : [record.primary_icon, "Star", "Sparkles"],
    };
  });
  return [...builtins, ...created].filter((category) => includeInactive || category.active);
}

export function searchUnifiedBusinessCategories(query: string, catalog: readonly UnifiedBusinessCategory[], limit = 12) {
  const needle = normalize(query);
  if (!needle) return catalog.slice(0, Math.max(1, Math.min(limit, 20)));
  return catalog.map((category) => {
    const names = [category.name, ...category.aliases, ...category.searchTerms].map(normalize);
    const score = names.some((name) => name === needle) ? 0 : names.some((name) => name.startsWith(needle)) ? 1 : names.some((name) => name.includes(needle)) ? 2 : 99;
    return { category, score };
  }).filter((item) => item.score < 99).sort((a, b) => a.score - b.score || a.category.name.localeCompare(b.category.name)).slice(0, Math.max(1, Math.min(limit, 20))).map((item) => item.category);
}

export function normalizeBusinessCategoryTerm(value: string) { return normalize(value); }
