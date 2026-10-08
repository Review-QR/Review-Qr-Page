import { getPublicSitemapEntryCount } from "@/lib/public-discovery";
import { buildSitemapIndexXml, PUBLIC_SITEMAP_CACHE_CONTROL } from "@/lib/public-discovery-sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const count = await getPublicSitemapEntryCount();
  return new Response(buildSitemapIndexXml(count), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": PUBLIC_SITEMAP_CACHE_CONTROL },
  });
}
