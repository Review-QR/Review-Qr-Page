import Link from "next/link";
import TrustitPublicFooter from "@/app/components/trustit-public-footer";
import { notFound, permanentRedirect } from "next/navigation";
import { DiscoveryControls } from "../discovery-controls";
import { getPublicDiscoveryBusinesses } from "@/lib/public-discovery";
import {
  canonicalCategorySlug,
  categoryNameForSlug,
  isIndexablePublicCategory,
  paginate,
  rankBusinesses,
  resolveCategory,
  slugifyCity,
} from "@/lib/public-discovery-domain";
import { discoveryMetadata, discoveryTitle } from "@/lib/public-discovery-seo";

type Params = Promise<{ city: string; category: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

const value = (input: string | string[] | undefined) =>
  Array.isArray(input) ? input[0] ?? "" : input ?? "";

function categoryIconEmoji(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("sweet") || t.includes("mithai")) return "🍰";
  if (t.includes("restaurant") || t.includes("dining") || t.includes("food") || t.includes("cafe")) return "🍽️";
  if (t.includes("salon") || t.includes("beauty") || t.includes("spa") || t.includes("barber")) return "✂️";
  if (t.includes("clinic") || t.includes("doctor") || t.includes("health") || t.includes("dental") || t.includes("hospital")) return "🩺";
  if (t.includes("hotel") || t.includes("stay") || t.includes("resort") || t.includes("guest")) return "🏨";
  if (t.includes("grocery") || t.includes("kirana") || t.includes("supermarket") || t.includes("mart")) return "🛒";
  if (t.includes("bakery") || t.includes("cake")) return "🍞";
  if (t.includes("fashion") || t.includes("cloth") || t.includes("boutique") || t.includes("wear")) return "🛍️";
  if (t.includes("auto") || t.includes("car") || t.includes("bike") || t.includes("repair")) return "🚗";
  if (t.includes("education") || t.includes("school") || t.includes("coach") || t.includes("class")) return "🎓";
  if (t.includes("jewel") || t.includes("gold")) return "💍";
  if (t.includes("electronics") || t.includes("mobile")) return "📱";
  return "🏪";
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { city, category } = await params;
  const query = await searchParams;
  const citySlug = slugifyCity(city);
  const types = resolveCategory(category);
  const canonicalCategory = canonicalCategorySlug(category);
  if (!types.length || !canonicalCategory || !citySlug) notFound();
  const businesses = await getPublicDiscoveryBusinesses(citySlug, types);
  const canonicalCity = businesses[0]?.publicCitySlug ?? citySlug;
  if (city !== canonicalCity || category !== canonicalCategory)
    permanentRedirect(`/${canonicalCity}/${canonicalCategory}`);
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
      index:
        businesses.length > 0 &&
        isIndexablePublicCategory(canonicalCategory) &&
        Object.keys(query).length === 0,
      follow: true,
    },
  };
}

export default async function DiscoveryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { city, category } = await params;
  const query = await searchParams;
  const types = resolveCategory(category);
  const canonicalCategory = canonicalCategorySlug(category);
  const citySlug = slugifyCity(city);
  if (!types.length || !canonicalCategory || !citySlug) notFound();
  const businesses = await getPublicDiscoveryBusinesses(citySlug, types);
  const canonicalCity = businesses[0]?.publicCitySlug ?? citySlug;
  if (city !== canonicalCity || category !== canonicalCategory)
    permanentRedirect(`/${canonicalCity}/${canonicalCategory}`);

  const latValue = Number(value(query.lat));
  const lngValue = Number(value(query.lng));
  const coords =
    Number.isFinite(latValue) &&
    Math.abs(latValue) <= 90 &&
    Number.isFinite(lngValue) &&
    Math.abs(lngValue) <= 180 &&
    value(query.lat) &&
    value(query.lng);
  const minimum = Number(value(query.minRating));
  const ranked = rankBusinesses(businesses, {
    sort: value(query.sort),
    q: value(query.q),
    minRating: [3, 4, 4.5].includes(minimum) ? minimum : undefined,
    lat: coords ? latValue : undefined,
    lng: coords ? lngValue : undefined,
  });
  const page = paginate(ranked, Number(value(query.page)) || 1);
  const cityName = businesses[0]?.city ?? discoveryTitle(citySlug);
  const categoryName = categoryNameForSlug(canonicalCategory) || discoveryTitle(canonicalCategory);

  function pageHref(next: number) {
    const p = new URLSearchParams();
    for (const key of ["q", "sort", "minRating", "lat", "lng"]) {
      if (value(query[key])) p.set(key, value(query[key]));
    }
    p.set("page", String(next));
    return `/${canonicalCity}/${canonicalCategory}?${p.toString()}`;
  }

  return (
    <>
      <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
        {/* ── Top Header Navigation ── */}
        <header className="border-b border-slate-200 bg-white shadow-xs">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-black tracking-tight"
              aria-label="Trustit home"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-blue-700 text-base font-black text-white shadow-sm">
                🛡️
              </span>
              <span className="text-xl font-extrabold text-slate-900">Trustit</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/merchant/login"
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Merchant Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition"
              >
                List Business
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          {/* ── Breadcrumb & Eyebrow ── */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-700 transition">Home</Link>
            <span>›</span>
            <span>{cityName}</span>
            <span>›</span>
            <span className="text-slate-900 font-bold">{categoryName}</span>
          </nav>

          {/* ── Page Heading ── */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                LOCAL DISCOVERY · {cityName}
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {categoryName} in {cityName}
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                Compare verified local {categoryName.toLowerCase()} using public location details and real in-store customer reviews.
              </p>
            </div>

            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/20">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>{page.total} Verified {page.total === 1 ? "Shop" : "Shops"}</span>
            </div>
          </div>

          {/* ── Discovery Search & Filter Controls ── */}
          <div className="mb-6">
            <DiscoveryControls
              city={canonicalCity}
              category={canonicalCategory}
              search={value(query.q)}
              sort={value(query.sort) || "recommended"}
              minRating={value(query.minRating)}
              lat={coords ? String(latValue) : ""}
              lng={coords ? String(lngValue) : ""}
            />
          </div>

          {/* ── Businesses Grid ── */}
          {page.items.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {page.items.map((business) => {
                const address = [business.address, business.locality, business.city, business.state, business.pincode]
                  .filter(Boolean)
                  .join(", ");
                const maps =
                  business.latitude !== null && business.longitude !== null
                    ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
                    : null;
                const cleanPhone = (business.phone ?? "").replace(/\D/g, "");
                const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const waLink = waPhone
                  ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Namaste ${business.name}, I found your business on Trustit.`)}`
                  : null;
                const telLink = business.phone ? `tel:${business.phone}` : null;

                return (
                  <article
                    key={business.slug}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md sm:p-6"
                  >
                    <div>
                      {/* Top Header Row: Icon + Name + Rating */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Visual Avatar */}
                          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-sky-500/15 to-indigo-500/20 text-xl text-blue-700 shadow-inner">
                            {categoryIconEmoji(business.type)}
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                                {business.type}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
                                <svg className="size-2.5 fill-emerald-600" viewBox="0 0 24 24">
                                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z" />
                                </svg>
                                Verified
                              </span>
                            </div>

                            <h3 className="mt-1 text-lg font-extrabold text-slate-900 tracking-tight leading-snug break-words group-hover:text-blue-700 transition">
                              <Link href={`/${canonicalCity}/${canonicalCategory}/${business.slug}`}>
                                {business.name}
                              </Link>
                            </h3>
                          </div>
                        </div>

                        {/* Rating Pill */}
                        <div className="shrink-0 text-right">
                          {business.reviewCount > 0 ? (
                            <div className="inline-flex flex-col items-end">
                              <span className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1 text-xs font-black text-white shadow-xs shadow-amber-500/20">
                                ★ {business.ratingAverage !== null ? business.ratingAverage.toFixed(1) : "5.0"}
                              </span>
                              <span className="mt-1 text-[11px] font-medium text-slate-500">
                                {business.reviewCount} {business.reviewCount === 1 ? "review" : "reviews"}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                              No Trustit reviews yet
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location & Distance */}
                      <div className="mt-4 flex flex-col gap-1 text-xs text-slate-600">
                        {address && (
                          <p className="flex items-start gap-1.5 leading-5">
                            <span className="shrink-0 text-slate-400">📍</span>
                            <span className="line-clamp-2">{address}</span>
                          </p>
                        )}
                        {business.distanceKm !== null && (
                          <p className="flex items-center gap-1.5 font-semibold text-emerald-700">
                            <span className="shrink-0">⚡</span>
                            <span>{business.distanceKm.toFixed(1)} km from your location</span>
                          </p>
                        )}
                      </div>

                      {/* Direct Contact Bar */}
                      {(waLink || telLink) && (
                        <div className="mt-3.5 flex flex-wrap items-center gap-2">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                            >
                              <span>💬</span>
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {telLink && (
                            <a
                              href={telLink}
                              className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                            >
                              <span>📞</span>
                              <span>Call Now</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action CTAs */}
                    <div className="mt-5 border-t border-slate-100 pt-3.5">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Link
                          href={`/${canonicalCity}/${canonicalCategory}/${business.slug}`}
                          className="inline-flex min-h-9 items-center justify-center rounded-xl bg-blue-700 px-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
                        >
                          View Profile
                        </Link>

                        {maps ? (
                          <a
                            href={maps}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                          >
                            <span>🗺️</span>
                            <span>Get directions</span>
                          </a>
                        ) : null}

                        <Link
                          href={`/r/${business.businessId}`}
                          target="_blank"
                          className="inline-flex min-h-9 items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50/70 px-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                        >
                          <span>⭐</span>
                          <span>Give Review</span>
                        </Link>

                        {business.googleReviewUrl ? (
                          <a
                            href={business.googleReviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <span>G</span>
                            <span>Google</span>
                          </a>
                        ) : (
                          <Link
                            href={`/${canonicalCity}/${canonicalCategory}/${business.slug}`}
                            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
              <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-slate-100 text-3xl">
                🏪
              </span>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                No businesses are currently listed in this location.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                There are no {categoryName.toLowerCase()} to show in {cityName}
                {value(query.q) || minimum ? " with these filters" : " yet"}. Try adjusting your search or check again later.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Explore Other Cities
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                >
                  Register a Shop Here →
                </Link>
              </div>
            </div>
          )}

          {/* ── Pagination ── */}
          {page.totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-3" aria-label="Pagination">
              {page.currentPage > 1 && (
                <Link
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  href={pageHref(page.currentPage - 1)}
                >
                  ← Previous
                </Link>
              )}
              <span className="inline-flex items-center px-3 text-xs font-bold text-slate-500">
                Page {page.currentPage} of {page.totalPages}
              </span>
              {page.currentPage < page.totalPages && (
                <Link
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  href={pageHref(page.currentPage + 1)}
                >
                  Next →
                </Link>
              )}
            </nav>
          )}

          {/* ── Local SEO Information Section (For Google Search Ranking) ── */}
          <section className="mt-14 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-black text-slate-900 sm:text-xl tracking-tight">
              About {categoryName} in {cityName} on Trustit
            </h2>
            <div className="mt-4 grid gap-5 text-xs text-slate-600 sm:grid-cols-3 leading-relaxed">
              <div>
                <strong className="block text-sm font-bold text-slate-900 mb-1">
                  100% Genuine In-Store Ratings
                </strong>
                Every review displayed on Trustit comes from real customers who physically visit the business and scan its counter QR standee.
              </div>
              <div>
                <strong className="block text-sm font-bold text-slate-900 mb-1">
                  Direct Contact & Directions
                </strong>
                Get instant turn-by-turn driving directions on Google Maps or connect with the shop owner without any third-party fees.
              </div>
              <div>
                <strong className="block text-sm font-bold text-slate-900 mb-1">
                  Are you a shop owner in {cityName}?
                </strong>
                Join Trustit to display your business on this public page and collect 5-star customer reviews on Google.
              </div>
            </div>
          </section>

          <footer className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-500">
            Trustit displays submitted Trustit ratings only. Individual customer reviews are private.
          </footer>
        </div>
      </main>
      <TrustitPublicFooter />
    </>
  );
}
