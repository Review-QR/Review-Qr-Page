import { getPublicSitemapEntries, getPublicSitemapEntryCount } from "@/lib/public-discovery";
import { buildSitemapUrlsetXml, PUBLIC_SITEMAP_CACHE_CONTROL, SITEMAP_PAGE_SIZE, sitemapShardCount } from "@/lib/public-discovery-sitemap";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ shard: string }> }) {
  const { shard } = await context.params;
  const match = /^(0|[1-9]\d*)\.xml$/.exec(shard);
  if (!match) return new Response("Not Found", { status: 404 });
  const shardId = Number(match[1]);
  if (!Number.isSafeInteger(shardId)) return new Response("Not Found", { status: 404 });

  try {
    const entryCount = await getPublicSitemapEntryCount();
    if (shardId >= sitemapShardCount(entryCount)) return new Response("Not Found", { status: 404 });
    const entries = await getPublicSitemapEntries(shardId * SITEMAP_PAGE_SIZE, SITEMAP_PAGE_SIZE);
    return new Response(buildSitemapUrlsetXml(entries, shardId === 0), {
      headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": PUBLIC_SITEMAP_CACHE_CONTROL },
    });
  } catch {
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60" },
    });
  }
}
