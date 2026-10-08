import "server-only";
import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeReviewLink } from "@/lib/safe-review-link";
import { categorySlugForBusinessType, hasUsablePublicDiscoveryLocation, PUBLIC_CATEGORIES, slugifyCity, type DiscoveryBusiness } from "@/lib/public-discovery-domain";

function publicGoogleLink(value: unknown) {
  const safe = safeReviewLink(value);
  if (!safe) return null;
  try {
    const host = new URL(safe).hostname.toLowerCase();
    return host === "g.page" || host === "maps.app.goo.gl" || host === "google.com" || host.endsWith(".google.com") ? safe : null;
  } catch { return null; }
}

const getBusinessesCached = cache(async (citySlug: string, typesKey: string): Promise<DiscoveryBusiness[]> => {
  const types = typesKey ? typesKey.split("\u001f") : [];
  if (!types.length) return [];
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("get_public_trustit_discovery_businesses", {
    p_city_slug: citySlug,
    p_business_types: types,
  });
  if (error) throw new Error("Public business discovery is temporarily unavailable");
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const seen = new Set<string>();
  return rows.flatMap((row): DiscoveryBusiness[] => {
    const id = typeof row.business_id === "string" ? row.business_id : "";
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const nullable = (key: string) => typeof row[key] === "string" && row[key] ? row[key] as string : null;
    const numeric = (key: string) => typeof row[key] === "number" && Number.isFinite(row[key]) ? row[key] as number : null;
    return [{
      businessId: id, name: String(row.name ?? ""), type: String(row.type ?? ""), slug: String(row.slug ?? ""),
      address: nullable("address"), locality: nullable("locality"), city: nullable("city"), district: nullable("district"),
      state: nullable("state"), pincode: nullable("pincode"), latitude: numeric("location_latitude"), longitude: numeric("location_longitude"),
      googleReviewUrl: publicGoogleLink(row.review_link), reviewCount: Number(row.review_count) || 0,
      ratingAverage: numeric("rating_average"), latestReviewAt: nullable("latest_submitted_at"),
      publicCitySlug: nullable("public_city_slug") ?? "",
    }];
  }).filter((business) => hasUsablePublicDiscoveryLocation(business, citySlug));
});

export function getPublicDiscoveryBusinesses(citySlug: string, types: string[]): Promise<DiscoveryBusiness[]> {
  return getBusinessesCached(slugifyCity(citySlug), [...new Set(types)].join("\u001f"));
}

const cityExistsCached = cache(async (citySlug: string) => {
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("get_public_trustit_city_exists", { p_city_slug: citySlug });
  if (error) throw new Error("Public city discovery is temporarily unavailable");
  return data === true;
});

export function publicDiscoveryCityExists(citySlug: string) {
  return cityExistsCached(slugifyCity(citySlug));
}

export type PublicSitemapEntry = { citySlug: string; categorySlug: string; businessSlug: string; primaryCategorySlug: string; categoryFirst: boolean };

const sitemapPairs = PUBLIC_CATEGORIES.flatMap((category) => category.businessTypes.map((type) => ({
  type,
  category: category.slug,
  primary: categorySlugForBusinessType(type) ?? category.slug,
})));
const sitemapRpcArgs = {
  p_business_types: sitemapPairs.map(({ type }) => type),
  p_category_slugs: sitemapPairs.map(({ category }) => category),
  p_primary_category_slugs: sitemapPairs.map(({ primary }) => primary),
};

export async function getPublicSitemapEntryCount(): Promise<number> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("get_public_trustit_sitemap_entry_count", sitemapRpcArgs);
  if (error) throw new Error("Public discovery sitemap is temporarily unavailable");
  const count = Number(data ?? 0);
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Public discovery sitemap count is invalid");
  return count;
}

export async function getPublicSitemapEntries(offset: number, limit = 20000): Promise<PublicSitemapEntry[]> {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 20000) {
    throw new Error("Invalid public sitemap page");
  }
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("get_public_trustit_sitemap_entries_page", {
    ...sitemapRpcArgs,
    p_offset: offset,
    p_limit: limit,
  });
  if (error) throw new Error("Public discovery sitemap is temporarily unavailable");
  return ((data ?? []) as Array<Record<string, unknown>>).flatMap((row) => {
    if (typeof row.city_slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.city_slug)
      || typeof row.category_slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.category_slug)
      || typeof row.business_slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.business_slug)
      || typeof row.primary_category_slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.primary_category_slug)) return [];
    return [{
      citySlug: row.city_slug,
      categorySlug: row.category_slug,
      businessSlug: row.business_slug,
      primaryCategorySlug: row.primary_category_slug,
      categoryFirst: row.category_first === true,
    }];
  });
}
