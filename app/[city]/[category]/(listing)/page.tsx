import Link from "next/link";
import TrustitPublicFooter from "@/app/components/trustit-public-footer";
import { notFound, permanentRedirect } from "next/navigation";
import { DiscoveryControls } from "../discovery-controls";
import { getPublicDiscoveryBusinesses, publicDiscoveryCityExists } from "@/lib/public-discovery";
import { canonicalCategorySlug, categoryNameForSlug, isIndexablePublicCategory, paginate, rankBusinesses, resolveCategory, slugifyCity } from "@/lib/public-discovery-domain";
import { discoveryMetadata, discoveryTitle } from "@/lib/public-discovery-seo";

type Params = Promise<{ city: string; category: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;
export const dynamic = "force-dynamic";
const value = (input: string | string[] | undefined) => Array.isArray(input) ? input[0] ?? "" : input ?? "";
export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { city, category } = await params;
  const query = await searchParams;
  const citySlug = slugifyCity(city);
  const types = resolveCategory(category);
  const canonicalCategory = canonicalCategorySlug(category);
  if (!types.length || !canonicalCategory || !citySlug) notFound();
  const businesses = await getPublicDiscoveryBusinesses(citySlug, types);
  if (!businesses.length && !(await publicDiscoveryCityExists(citySlug))) notFound();
  const canonicalCity = businesses[0]?.publicCitySlug ?? citySlug;
  if (city !== canonicalCity || category !== canonicalCategory) permanentRedirect(`/${canonicalCity}/${canonicalCategory}`);
  const cityName = businesses[0]?.city ?? discoveryTitle(citySlug);
  const categoryName = categoryNameForSlug(canonicalCategory) || discoveryTitle(canonicalCategory);
  const countText = businesses.length
    ? `${businesses.length} eligible ${businesses.length === 1 ? "business" : "businesses"} in ${cityName}, listed under ${categoryName}`
    : `registered ${categoryName} businesses in ${cityName}`;
  return {
    ...discoveryMetadata({
    title: `${categoryName} in ${cityName} | Trustit`,
    description: `Explore ${countText} in ${cityName} with publicly verified locations and Trustit review information.`,
      canonicalPath: `/${canonicalCity}/${canonicalCategory}`,
    }),
    robots: {
      index: businesses.length > 0 && isIndexablePublicCategory(canonicalCategory) && Object.keys(query).length === 0,
      follow: true,
    },
  };
}

export default async function DiscoveryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { city, category } = await params;
  const query = await searchParams;
  const types = resolveCategory(category);
  const canonicalCategory = canonicalCategorySlug(category);
  const citySlug = slugifyCity(city);
  if (!types.length || !canonicalCategory || !citySlug) notFound();
  const businesses = await getPublicDiscoveryBusinesses(citySlug, types);
  if (!businesses.length && !(await publicDiscoveryCityExists(citySlug))) notFound();
  const canonicalCity = businesses[0]?.publicCitySlug ?? citySlug;
  if (city !== canonicalCity || category !== canonicalCategory) permanentRedirect(`/${canonicalCity}/${canonicalCategory}`);
  const latValue = Number(value(query.lat)), lngValue = Number(value(query.lng));
  const coords = Number.isFinite(latValue) && Math.abs(latValue) <= 90 && Number.isFinite(lngValue) && Math.abs(lngValue) <= 180 && value(query.lat) && value(query.lng);
  const minimum = Number(value(query.minRating));
  const ranked = rankBusinesses(businesses, { sort: value(query.sort), q: value(query.q), minRating: [3, 4, 4.5].includes(minimum) ? minimum : undefined, lat: coords ? latValue : undefined, lng: coords ? lngValue : undefined });
  const page = paginate(ranked, Number(value(query.page)) || 1);
  const cityName = businesses[0]?.city ?? discoveryTitle(citySlug);
  const categoryName = categoryNameForSlug(canonicalCategory) || discoveryTitle(canonicalCategory);
  function pageHref(next: number) {
    const params = new URLSearchParams();
    for (const key of ["q", "sort", "minRating", "lat", "lng"]) if (value(query[key])) params.set(key, value(query[key]));
    params.set("page", String(next));
    return `/${canonicalCity}/${canonicalCategory}?${params.toString()}`;
  }
  return <><main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
    <header className="mb-7"><Link href="/" className="rounded-sm text-sm font-bold tracking-wide text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">TRUSTIT</Link><p className="mt-7 text-sm font-semibold text-blue-700">LOCAL DISCOVERY · {cityName}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{categoryName} in {cityName}</h1><p className="mt-2 max-w-3xl text-slate-600">Compare local {categoryName.toLowerCase()} using public location details and Trustit submissions. When Recommended is selected, results combine rating confidence, review recency, profile completeness and search relevance; distance is considered only when coordinates are supplied.</p></header>
    <DiscoveryControls city={canonicalCity} category={canonicalCategory} search={value(query.q)} sort={value(query.sort) || "recommended"} minRating={value(query.minRating)} lat={coords ? String(latValue) : ""} lng={coords ? String(lngValue) : ""}/>
    <div className="my-6 flex items-center justify-between"><h2 className="font-semibold">{page.total} {page.total === 1 ? "business" : "businesses"}</h2><span className="text-sm text-slate-500">Page {page.currentPage} of {page.totalPages}</span></div>
    {page.items.length ? <div className="grid gap-4 md:grid-cols-2">{page.items.map((business) => {
      const address = [business.address, business.locality, business.city, business.state, business.pincode].filter(Boolean).join(", ");
      const maps = business.latitude !== null && business.longitude !== null ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}` : null;
      return <article key={business.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{business.type}</p><h3 className="mt-1 text-xl font-bold">{business.name}</h3></div>{business.reviewCount > 0 ? <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-800">{business.ratingAverage !== null ? `★ ${business.ratingAverage.toFixed(1)} · ` : ""}<span className="font-normal">Trustit · {business.reviewCount} {business.reviewCount === 1 ? "review" : "reviews"}</span></span> : <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">No Trustit reviews yet</span>}</div>
        {address && <p className="mt-4 text-sm leading-6 text-slate-600">{address}</p>}
        {business.distanceKm !== null && <p className="mt-2 text-xs text-slate-500">{business.distanceKm.toFixed(1)} km away</p>}
        <div className="mt-5 flex flex-wrap gap-3"><Link className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={`/${canonicalCity}/${canonicalCategory}/${business.slug}`}>View {business.type} profile</Link>{maps && <a className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={maps} target="_blank" rel="noreferrer">Get directions</a>}</div>
      </article>;
    })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-xl font-bold">No businesses are currently listed in this location.</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">There are no {categoryName.toLowerCase()} to show in {cityName}{value(query.q) || minimum ? " with these filters" : " yet"}. Try adjusting your search or check again later.</p></div>}
    {page.totalPages > 1 && <nav className="mt-8 flex justify-center gap-3" aria-label="Pagination">{page.currentPage > 1 && <Link className="rounded-lg border bg-white px-4 py-2" href={pageHref(page.currentPage - 1)}>Previous</Link>}{page.currentPage < page.totalPages && <Link className="rounded-lg border bg-white px-4 py-2" href={pageHref(page.currentPage + 1)}>Next</Link>}</nav>}
    <footer className="mt-12 border-t border-slate-200 pt-5 text-xs text-slate-500">Trustit displays submitted Trustit ratings only. Individual customer reviews are private.</footer>
  </div></main><TrustitPublicFooter /></>;
}
