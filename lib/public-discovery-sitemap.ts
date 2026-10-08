import { TRUSTIT_SITE_URL } from "./public-discovery-seo.ts";
import type { PublicSitemapEntry } from "./public-discovery.ts";

export const SITEMAP_PAGE_SIZE = 20000;
export const PUBLIC_SITEMAP_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";
export const TRUSTIT_STATIC_PUBLIC_PATHS = ["/trustit", "/pricing", "/privacy-policy", "/terms", "/refund-policy", "/contact", "/about"] as const;

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
const segment = (value: string) => encodeURIComponent(value);

export function sitemapShardCount(entryCount: number) {
  return Math.max(1, Math.ceil(entryCount / SITEMAP_PAGE_SIZE));
}

export function buildSitemapIndexXml(entryCount: number) {
  const shards = Array.from({ length: sitemapShardCount(entryCount) }, (_, id) =>
    `<sitemap><loc>${escapeXml(`${TRUSTIT_SITE_URL}/sitemaps/${id}.xml`)}</loc></sitemap>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${shards}</sitemapindex>`;
}

export function buildSitemapUrlsetXml(entries: PublicSitemapEntry[], includeTrustitLandingPage = false) {
  const urls = new Set<string>();
  if (includeTrustitLandingPage) {
    for (const path of TRUSTIT_STATIC_PUBLIC_PATHS) urls.add(`${TRUSTIT_SITE_URL}${path}`);
  }
  for (const entry of entries) {
    const categoryPath = `/${segment(entry.citySlug)}/${segment(entry.categorySlug)}`;
    if (entry.categoryFirst) urls.add(`${TRUSTIT_SITE_URL}${categoryPath}`);
    if (entry.categorySlug === entry.primaryCategorySlug) urls.add(`${TRUSTIT_SITE_URL}${categoryPath}/${segment(entry.businessSlug)}`);
  }
  const items = [...urls].map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}
