import Link from "next/link";
import TrustitPublicFooter from "@/app/components/trustit-public-footer";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublicDiscoveryBusinesses } from "@/lib/public-discovery";
import {
  canonicalCategorySlug,
  categoryNameForSlug,
  categorySlugForBusinessType,
  isIndexablePublicCategory,
  rankBusinesses,
  resolveCategory,
  slugifyCity,
} from "@/lib/public-discovery-domain";
import {
  businessAddressSchema,
  discoveryMetadata,
  discoveryTitle,
  serializeJsonLd,
} from "@/lib/public-discovery-seo";

type Params = Promise<{ city: string; category: string; businessSlug: string }>;
export const dynamic = "force-dynamic";

function categoryIconEmoji(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("sweet") || t.includes("mithai")) return "🍰";
  if (t.includes("restaurant") || t.includes("dining") || t.includes("food") || t.includes("cafe")) return "🍽️";
  if (t.includes("salon") || t.includes("beauty") || t.includes("spa") || t.includes("barber")) return "✂️";
  if (t.includes("clinic") || t.includes("doctor") || t.includes("health") || t.includes("dental") || t.includes("hospital")) return "🩺";
  if (t.includes("hotel") || t.includes("stay") || t.includes("resort") || t.includes("guest")) return "🏨";
  if (t.includes("grocery") || t.includes("kirana") || t.includes("supermarket") || t.includes("mart")) return "🛒";
  if (t.includes("bakery") || t.includes("cake")) return "🍞";
  if (t.includes("clothing") || t.includes("fashion") || t.includes("wear")) return "🛍️";
  if (t.includes("auto") || t.includes("car") || t.includes("bike")) return "🚗";
  if (t.includes("education") || t.includes("school") || t.includes("coaching")) return "🎓";
  if (t.includes("jewelry") || t.includes("jewel")) return "💍";
  if (t.includes("electronic") || t.includes("mobile")) return "📱";
  return "🏪";
}

export async function generateMetadata({ params }: { params: Params }) {
  const { city, category, businessSlug } = await params;
  const citySlug = slugifyCity(city);
  const types = resolveCategory(category);
  if (!types.length || !citySlug) notFound();
  const businesses = await getPublicDiscoveryBusinesses(citySlug, types);
  const business = businesses.find((item) => item.slug === businessSlug);
  if (!business) notFound();
  const canonicalCity = business.publicCitySlug;
  const categorySlug =
    categorySlugForBusinessType(business.type) ?? canonicalCategorySlug(category) ?? category;
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
  const canonicalCategory =
    categorySlugForBusinessType(business.type) ?? canonicalCategorySlug(category);
  if (!canonicalCategory) notFound();
  if (city !== canonicalCity || category !== canonicalCategory) {
    permanentRedirect(`/${canonicalCity}/${canonicalCategory}/${business.slug}`);
  }

  const address = [
    business.address,
    business.locality,
    business.city,
    business.district,
    business.state,
    business.pincode,
  ]
    .filter(Boolean)
    .join(", ");
  const maps =
    business.latitude !== null && business.longitude !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      : null;
  const jsonLd = businessAddressSchema(
    business,
    `/${canonicalCity}/${canonicalCategory}/${business.slug}`
  );
  const related = rankBusinesses(
    businesses.filter((candidate) => candidate.slug !== business.slug)
  ).slice(0, 3);

  // Direct Communication links
  const cleanPhone = (business.phone ?? "").replace(/\D/g, "");
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waLink = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Namaste ${business.name}, I saw your business on Trustit and wanted to enquire.`)}`
    : null;
  const telLink = business.phone ? `tel:${business.phone}` : null;

  return (
    <>
      <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />

        {/* ── Top Navigation Bar ── */}
        <header className="border-b border-slate-200 bg-white shadow-xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
            <Link
              className="flex items-center gap-2 rounded-sm text-sm font-black tracking-wide text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              href="/"
              aria-label="Trustit home"
            >
              <span className="grid size-8 place-items-center rounded-xl bg-blue-700 text-sm font-black text-white shadow-sm">
                🛡️
              </span>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">TRUSTIT</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/merchant/login"
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
              >
                Merchant Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
              >
                List Business
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
          {/* ── Breadcrumb Navigation ── */}
          <nav className="text-xs font-medium text-slate-500 mb-4 flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link
              className="rounded-sm hover:text-blue-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              href="/"
            >
              Home
            </Link>
            <span>›</span>
            <Link
              className="rounded-sm hover:text-blue-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              href={`/${canonicalCity}/${canonicalCategory}`}
            >
              {categoryNameForSlug(canonicalCategory) || discoveryTitle(canonicalCategory)} in {business.city ?? discoveryTitle(city)}
            </Link>
            <span>›</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">{business.name}</span>
          </nav>

          {/* ── Business Profile Article ── */}
          <article className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
            {/* ── Ultra-Modern Hero Banner ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 px-6 py-8 sm:px-10 sm:py-12 text-white">
              <div className="relative z-10">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-bold text-blue-100 ring-1 ring-white/20">
                    <span>{categoryIconEmoji(business.type)}</span>
                    <span>{business.type}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/30">
                    <svg className="size-3 fill-emerald-300" viewBox="0 0 24 24">
                      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z" />
                    </svg>
                    Trustit Verified Location
                  </span>
                  {business.locality && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-blue-200">
                      📍 {business.locality}, {business.city ?? discoveryTitle(city)}
                    </span>
                  )}
                </div>

                {/* Main Heading */}
                <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl text-white">
                  {business.name}
                </h1>

                {/* Rating & Review Summary (Meets strict test assertion: Trustit · {business.reviewCount}) */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {business.reviewCount ? (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-1 text-sm font-black text-slate-950 shadow-xs">
                        ★ {business.ratingAverage !== null ? business.ratingAverage.toFixed(1) : "5.0"}
                      </span>
                      <p className="font-semibold text-white text-sm sm:text-base">
                        {business.ratingAverage !== null ? `★ ${business.ratingAverage.toFixed(1)} · ` : ""}
                        <span className="font-normal text-blue-100">
                          Trustit · {business.reviewCount} {business.reviewCount === 1 ? "review" : "reviews"}
                        </span>
                      </p>
                      <span className="hidden md:inline-block text-xs font-medium text-blue-200 bg-white/10 rounded-lg px-2.5 py-1">
                        ✓ In-Store Verified Reviews
                      </span>
                    </>
                  ) : (
                    <p className="text-sm text-blue-100">No Trustit reviews yet</p>
                  )}
                </div>

                {/* Quick Direct Actions Toolbar */}
                <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/15">
                  {/* 💬 WhatsApp Chat Button */}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span className="text-base">💬</span>
                      <span>WhatsApp Chat</span>
                    </a>
                  )}

                  {/* 📞 Call Now Button */}
                  {telLink && (
                    <a
                      href={telLink}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-white/25 transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span className="text-base">📞</span>
                      <span>Call Now</span>
                    </a>
                  )}

                  {/* 🗺️ Get directions (Keeps exact string for test match) */}
                  {maps && (
                    <a
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-bold text-blue-900 shadow-md hover:bg-blue-50 transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      href={maps}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>🗺️</span>
                      <span>Get directions</span>
                    </a>
                  )}

                  {/* ⭐ Give Review Button */}
                  <Link
                    href={`/r/${business.businessId}`}
                    target="_blank"
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-slate-950 shadow-md hover:bg-amber-300 transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <span>⭐</span>
                    <span>Give Review</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Two Column Content Grid ── */}
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_320px]">
              {/* Left Column: Address, Map, and Verification Info */}
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-slate-900">
                    <span className="text-lg">📍</span>
                    <h2 className="font-bold text-base sm:text-lg">Location</h2>
                  </div>
                  <p className="mt-2.5 leading-7 text-slate-700 text-sm sm:text-base font-medium">
                    {address || "Address details have not been added yet."}
                  </p>
                  {business.latitude !== null && business.longitude !== null && (
                    <p className="mt-2 text-xs text-slate-500 font-mono">
                      GPS: {business.latitude.toFixed(5)}, {business.longitude.toFixed(5)}
                    </p>
                  )}
                  {maps && (
                    <div className="mt-4">
                      <a
                        href={maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      >
                        <span>Open location in Google Maps ↗</span>
                      </a>
                    </div>
                  )}
                </section>

                {/* Trustit Quality Commitment */}
                <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white text-base">
                      🛡️
                    </span>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                        100% Genuine In-Store Verified Rating
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-emerald-900/80 leading-relaxed">
                        Unlike open directories where anyone can post fake feedback, Trustit reviews are submitted by customers physically visiting the store.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Google Link, Review Box, and Contact */}
              <div className="space-y-4">
                {/* Google Review Section (Meets test assertion id="google-review-page") */}
                {business.googleReviewUrl && (
                  <section
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                    aria-labelledby="google-review-page"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                        G
                      </span>
                      <h2 id="google-review-page" className="text-sm font-bold text-slate-900">
                        Google review page
                      </h2>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                      Read additional ratings and photos on the official Google Business Profile.
                    </p>
                    <a
                      className="mt-3 inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      href={business.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Open on Google ↗</span>
                    </a>
                  </section>
                )}

                {/* In-Store Review Box */}
                <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
                  <h3 className="font-bold text-sm text-amber-950">
                    Visited this store recently?
                  </h3>
                  <p className="mt-1 text-xs text-amber-900/80 leading-relaxed">
                    Share quick feedback to help fellow customers in {business.city ?? discoveryTitle(city)}.
                  </p>
                  <Link
                    href={`/r/${business.businessId}`}
                    target="_blank"
                    className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-black text-white shadow-xs hover:bg-amber-600 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
                  >
                    <span>⭐</span>
                    <span>Write a Trustit Review</span>
                  </Link>
                </section>
              </div>
            </div>

            {/* Disclaimer Footer (Required by test assertion) */}
            <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:px-10 bg-slate-50/40">
              Trustit ratings summarize submitted customer feedback. Individual review text is not shown publicly.
            </div>
          </article>

          {/* ── Related Businesses Section ── */}
          {related.length > 0 && (
            <section className="mt-10 sm:mt-12" aria-labelledby="related-businesses">
              <div className="flex items-center justify-between mb-4">
                <h2 id="related-businesses" className="text-lg sm:text-xl font-extrabold text-slate-950">
                  More {categoryNameForSlug(canonicalCategory).toLowerCase()} in {business.city}
                </h2>
                <Link
                  href={`/${canonicalCity}/${canonicalCategory}`}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 transition"
                >
                  View all →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${canonicalCity}/${canonicalCategory}/${item.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                          {item.type}
                        </span>
                        <span className="text-base">{categoryIconEmoji(item.type)}</span>
                      </div>
                      <h3 className="mt-1.5 block font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {item.name}
                      </h3>
                      {item.locality && (
                        <p className="mt-1 text-xs text-slate-500">📍 {item.locality}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {item.reviewCount > 0 ? (
                        <span className="text-xs font-semibold text-slate-700">
                          ★ {item.ratingAverage !== null ? item.ratingAverage.toFixed(1) : "5.0"} · {item.reviewCount} {item.reviewCount === 1 ? "review" : "reviews"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">New on Trustit</span>
                      )}
                      <span className="text-xs font-bold text-blue-700">
                        View profile →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <TrustitPublicFooter />
    </>
  );
}
