import Link from "next/link";
import TrustitPublicFooter from "@/app/components/trustit-public-footer";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublicDiscoveryBusinesses } from "@/lib/public-discovery";
import { canonicalCategorySlug, categoryNameForSlug, categorySlugForBusinessType, isIndexablePublicCategory, rankBusinesses, resolveCategory, slugifyCity } from "@/lib/public-discovery-domain";
import { businessAddressSchema, discoveryMetadata, discoveryTitle, serializeJsonLd } from "@/lib/public-discovery-seo";

type Params = Promise<{ city: string; category: string; businessSlug: string }>;
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Params }) {
  const { city, category, businessSlug } = await params;
  const citySlug = slugifyCity(city);
  const types = resolveCategory(category);
  if (!types.length || !citySlug) notFound();
  const businesses = await getPublicDiscoveryBusinesses(citySlug, types);
  const business = businesses.find((item) => item.slug === businessSlug);
  if (!business) notFound();
  const canonicalCity = business.publicCitySlug;
  const categorySlug = categorySlugForBusinessType(business.type) ?? canonicalCategorySlug(category) ?? category;
  const address = [business.locality, business.city, business.state].filter(Boolean).join(", ");
  return {
    ...discoveryMetadata({
      title: `${business.name} — ${business.type} in ${business.city ?? discoveryTitle(city)} | Trustit`,
      description: `${business.name} is listed as a ${business.type}${address ? ` in ${address}` : ""}. View its location and submitted Trustit review summary.`,
      canonicalPath: `/${canonicalCity}/${categorySlug}/${business.slug}`,
    }),
    robots: { index: isIndexablePublicCategory(categorySlug), follow: true },
  };
}

export default async function PublicBusinessPage({ params }: { params: Params }) {
  const { city, category, businessSlug } = await params;
  const citySlug = slugifyCity(city);
  const types = resolveCategory(category);
  if (!types.length || !citySlug) notFound();
  const businesses = await getPublicDiscoveryBusinesses(citySlug, types);
  const business = businesses.find((item) => item.slug === businessSlug);
  if (!business) notFound();
  const canonicalCity = business.publicCitySlug;
  const canonicalCategory = categorySlugForBusinessType(business.type) ?? canonicalCategorySlug(category);
  if (!canonicalCategory) notFound();
  if (city !== canonicalCity || category !== canonicalCategory) permanentRedirect(`/${canonicalCity}/${canonicalCategory}/${business.slug}`);
  const address = [business.address, business.locality, business.city, business.district, business.state, business.pincode].filter(Boolean).join(", ");
  const maps = business.latitude !== null && business.longitude !== null ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}` : null;
  const jsonLd = businessAddressSchema(business, `/${canonicalCity}/${canonicalCategory}/${business.slug}`);
  const related = rankBusinesses(businesses.filter((candidate) => candidate.slug !== business.slug)).slice(0, 3);
  return <><main className="min-h-screen bg-slate-50 text-slate-900"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} /><div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
    <Link className="rounded-sm text-sm font-bold tracking-wide text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href="/">TRUSTIT</Link>
    <nav className="mt-7 text-sm text-slate-500"><Link className="rounded-sm hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={`/${canonicalCity}/${canonicalCategory}`}>‹ {categoryNameForSlug(canonicalCategory) || discoveryTitle(canonicalCategory)} in {business.city ?? discoveryTitle(city)}</Link></nav>
    <article className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-10 text-white sm:px-10"><p className="text-sm font-semibold text-blue-100">{business.type} · {business.city ?? discoveryTitle(city)}</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{business.name}</h1><div className="mt-4">{business.reviewCount ? <p className="font-semibold">{business.ratingAverage !== null ? `★ ${business.ratingAverage.toFixed(1)} · ` : ""}<span className="font-normal text-blue-100">Trustit · {business.reviewCount} {business.reviewCount === 1 ? "review" : "reviews"}</span></p> : <p className="text-sm text-blue-100">No Trustit reviews yet</p>}</div></div>
    <div className="grid gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-10"><section><h2 className="font-semibold">Location</h2><p className="mt-2 leading-7 text-slate-600">{address || "Address details have not been added yet."}</p>{business.latitude !== null && business.longitude !== null && <p className="mt-2 text-xs text-slate-500">{business.latitude.toFixed(5)}, {business.longitude.toFixed(5)}</p>}</section>
        <div className="grid content-start gap-4">{maps && <a className="w-fit rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={maps} target="_blank" rel="noopener noreferrer">Get directions</a>}{business.googleReviewUrl && <section className="rounded-xl border border-slate-200 p-4" aria-labelledby="google-review-page"><h2 id="google-review-page" className="text-sm font-semibold text-slate-700">Google review page</h2><a className="mt-2 inline-block rounded-sm text-sm font-semibold text-blue-700 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={business.googleReviewUrl} target="_blank" rel="noopener noreferrer">Open on Google ↗</a></section>}</div>
      </div>
      <div className="border-t border-slate-100 px-6 py-5 text-sm text-slate-500 sm:px-10">Trustit ratings summarize submitted customer feedback. Individual review text is not shown publicly.</div>
    </article>
    {related.length > 0 && <section className="mt-10" aria-labelledby="related-businesses"><h2 id="related-businesses" className="text-xl font-bold">More {categoryNameForSlug(canonicalCategory).toLowerCase()} in {business.city}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <Link key={item.slug} href={`/${canonicalCity}/${canonicalCategory}/${item.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"><span className="text-xs font-semibold uppercase tracking-wide text-blue-700">{item.type}</span><span className="mt-1 block font-bold text-slate-900">{item.name}</span>{item.reviewCount > 0 && <span className="mt-2 block text-sm text-slate-600">{item.ratingAverage !== null ? `★ ${item.ratingAverage.toFixed(1)} · ` : ""}{item.reviewCount} Trustit {item.reviewCount === 1 ? "review" : "reviews"}</span>}<span className="mt-2 block text-sm text-blue-700">View profile →</span></Link>)}</div></section>}
  </div></main><TrustitPublicFooter /></>;
}
