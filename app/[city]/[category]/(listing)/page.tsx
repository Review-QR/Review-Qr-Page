import Link from "next/link";
import TrustitPublicFooter from "@/app/components/trustit-public-footer";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { DiscoveryControls } from "../discovery-controls";
import { getPublicDiscoveryBusinesses } from "@/lib/public-discovery";
import {
  canonicalCategorySlug,
  categoryNameForSlug,
  categorySlugForBusinessType,
  isIndexablePublicCategory,
  paginate,
  PUBLIC_CATEGORIES,
  rankBusinesses,
  resolveCategory,
  slugifyCity,
} from "@/lib/public-discovery-domain";
import { discoveryMetadata, discoveryTitle, categoryListingSchema, serializeJsonLd, BAHRAICH_SEO_KEYWORDS } from "@/lib/public-discovery-seo";

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
  if (t.includes("pharmacy") || t.includes("medical") || t.includes("chemist")) return "💊";
  if (t.includes("hotel") || t.includes("stay") || t.includes("resort") || t.includes("guest")) return "🏨";
  if (t.includes("grocery") || t.includes("kirana") || t.includes("supermarket") || t.includes("mart")) return "🛒";
  if (t.includes("bakery") || t.includes("cake")) return "🍞";
  if (t.includes("fashion") || t.includes("cloth") || t.includes("boutique") || t.includes("wear")) return "🛍️";
  if (t.includes("auto") || t.includes("car") || t.includes("bike") || t.includes("garage") || t.includes("repair")) return "🚗";
  if (t.includes("hardware") || t.includes("paint") || t.includes("cement") || t.includes("pipe")) return "🔨";
  if (t.includes("electronics") || t.includes("mobile")) return "📱";
  if (t.includes("education") || t.includes("school") || t.includes("coach") || t.includes("class")) return "🎓";
  if (t.includes("jewel") || t.includes("gold")) return "💍";
  return "🏪";
}

const ALL_DISCOVERY_CATEGORIES = [
  { slug: "grocery-stores", name: "Grocery & Mart", icon: "🛒" },
  { slug: "sweet-shops", name: "Sweet Shops", icon: "🍰" },
  { slug: "restaurants", name: "Restaurants", icon: "🍽️" },
  { slug: "pharmacies", name: "Pharmacies", icon: "💊" },
  { slug: "salons", name: "Salons & Spa", icon: "✂️" },
  { slug: "clinics", name: "Clinics & Doctors", icon: "🩺" },
  { slug: "mobile-shops", name: "Mobile & Tech", icon: "📱" },
  { slug: "auto-services", name: "Auto & Garage", icon: "🚗" },
  { slug: "hardware-stores", name: "Hardware & Paints", icon: "🔨" },
  { slug: "clothing-stores", name: "Clothing & Fashion", icon: "🛍️" },
  { slug: "hotels", name: "Hotels & Stays", icon: "🏨" },
];

const CATEGORY_QUICK_FILTERS: Record<string, Array<{ label: string; q: string; icon: string }>> = {
  "grocery-stores": [
    { label: "All Essentials", q: "", icon: "🛒" },
    { label: "Detergent & Surf", q: "detergent", icon: "🧼" },
    { label: "Atta & Rice", q: "atta", icon: "🌾" },
    { label: "Oil & Ghee", q: "ghee", icon: "🫒" },
    { label: "Dals & Pulses", q: "dal", icon: "🥣" },
    { label: "Tea & Spices", q: "tea", icon: "☕" },
    { label: "Bathing Soap", q: "soap", icon: "🫧" },
    { label: "Biscuits & Snacks", q: "biscuit", icon: "🍪" },
  ],
  "sweet-shops": [
    { label: "All Sweets", q: "", icon: "🍰" },
    { label: "Kaju Katli", q: "kaju", icon: "💎" },
    { label: "Gulab Jamun", q: "jamun", icon: "🟤" },
    { label: "Rasgulla", q: "rasgulla", icon: "⚪" },
    { label: "Rasmalai", q: "rasmalai", icon: "🥛" },
    { label: "Laddoo & Peda", q: "laddoo", icon: "🟡" },
    { label: "Samosa & Snacks", q: "samosa", icon: "🥟" },
    { label: "Kachori", q: "kachori", icon: "🫓" },
  ],
  "restaurants": [
    { label: "All Food", q: "", icon: "🍽️" },
    { label: "Biryani Special", q: "biryani", icon: "🍗" },
    { label: "Paneer & Dal", q: "paneer", icon: "🧀" },
    { label: "Kebab & Tandoor", q: "kebab", icon: "🍢" },
    { label: "Fast Food & Rolls", q: "burger", icon: "🍔" },
    { label: "Chinese & Noodles", q: "noodles", icon: "🍜" },
    { label: "Special Thali", q: "thali", icon: "🍱" },
    { label: "Dosa & South Indian", q: "dosa", icon: "🥞" },
  ],
  "salons": [
    { label: "All Services", q: "", icon: "✂️" },
    { label: "Hair Cut & Styling", q: "haircut", icon: "💇" },
    { label: "Beard & Grooming", q: "beard", icon: "🧔" },
    { label: "Facial & D-Tan", q: "facial", icon: "✨" },
    { label: "Hair Spa & Keratin", q: "keratin", icon: "💆" },
    { label: "Bridal Makeup", q: "bridal", icon: "💄" },
  ],
  "clinics": [
    { label: "All Clinics", q: "", icon: "🩺" },
    { label: "Dental & Teeth", q: "dental", icon: "🦷" },
    { label: "Eye Care", q: "eye", icon: "👁️" },
    { label: "Child Specialist", q: "child", icon: "👶" },
    { label: "Physiotherapy", q: "physio", icon: "🦴" },
    { label: "Diagnostics & Labs", q: "pathology", icon: "🔬" },
  ],
  "pharmacies": [
    { label: "All Medicines", q: "", icon: "💊" },
    { label: "Paracetamol & Pain", q: "paracetamol", icon: "💊" },
    { label: "Cough Syrup", q: "cough", icon: "🍯" },
    { label: "First Aid & Bandage", q: "bandage", icon: "🩹" },
    { label: "Digene & Gas", q: "digene", icon: "🥛" },
    { label: "Vitamins & Calcium", q: "vitamin", icon: "⚡" },
    { label: "ORS & Glucose", q: "ors", icon: "💧" },
  ],
  "mobile-shops": [
    { label: "All Tech & Accessories", q: "", icon: "📱" },
    { label: "Screen Guard Glass", q: "screen", icon: "🛡️" },
    { label: "Fast Charger & Cable", q: "charger", icon: "⚡" },
    { label: "Back Covers", q: "cover", icon: "📱" },
    { label: "Earbuds & TWS", q: "earbuds", icon: "🎧" },
    { label: "Power Bank", q: "power bank", icon: "🔋" },
    { label: "Phone Repairing", q: "repair", icon: "🔧" },
  ],
  "auto-services": [
    { label: "All Auto Services", q: "", icon: "🚗" },
    { label: "MRF & Bike Tyres", q: "tyre", icon: "🛞" },
    { label: "Mobil & Engine Oil", q: "engine oil", icon: "🛢️" },
    { label: "Water Wash & Polish", q: "wash", icon: "🚿" },
    { label: "Bike General Service", q: "bike", icon: "🏍️" },
    { label: "Brake Pads & Service", q: "brake", icon: "⚙️" },
    { label: "Tubeless Puncture", q: "puncture", icon: "🔧" },
  ],
  "hardware-stores": [
    { label: "All Hardware", q: "", icon: "🔨" },
    { label: "UltraTech Cement", q: "cement", icon: "🧱" },
    { label: "Asian Paints & Primer", q: "paint", icon: "🎨" },
    { label: "PVC Pipes & Fitting", q: "pipe", icon: "🚰" },
    { label: "TMT Saria Steel", q: "saria", icon: "🏗️" },
    { label: "Door Locks & Handles", q: "lock", icon: "🔒" },
  ],
  "clothing-stores": [
    { label: "All Clothing", q: "", icon: "🛍️" },
    { label: "Cotton Shirts", q: "shirt", icon: "👔" },
    { label: "Denim Jeans", q: "jeans", icon: "👖" },
    { label: "Banarasi Saree", q: "saree", icon: "🥻" },
    { label: "Kurti & Suits", q: "kurti", icon: "👗" },
    { label: "Kids Wear", q: "kids", icon: "🧒" },
  ],
  "hotels": [
    { label: "All Stays", q: "", icon: "🏨" },
    { label: "AC Deluxe Rooms", q: "deluxe", icon: "🛏️" },
    { label: "Banquet & Events", q: "banquet", icon: "🎉" },
    { label: "Suite Rooms", q: "suite", icon: "👑" },
  ],
};

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
  const isBahraich = cityName.toLowerCase().includes("bahraich");
  const targetedTitle = isBahraich
    ? `${categoryName} in Bahraich | Trustit Review & Local Service`
    : `${categoryName} in ${cityName} | Trustit`;

  const targetedDesc = isBahraich
    ? `Trustit Bahraich: Verified ${categoryName} in Bahraich. 100% genuine Google reviews, official QR standees, and hyperlocal ordering.`
    : `Explore ${countText} in ${cityName} with publicly verified locations and Trustit review information.`;

  return {
    ...discoveryMetadata({
      title: targetedTitle,
      description: targetedDesc,
      canonicalPath: `/${canonicalCity}/${canonicalCategory}`,
      keywords: [
        `Trustit ${cityName}`,
        `Trustit ${categoryName}`,
        `Trustit Review ${cityName}`,
        `Best ${categoryName} in ${cityName}`,
        ...BAHRAICH_SEO_KEYWORDS,
      ],
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
  const searchQuery = value(query.q);
  const ranked = rankBusinesses(businesses, {
    sort: value(query.sort),
    q: searchQuery,
    minRating: [3, 4, 4.5].includes(minimum) ? minimum : undefined,
    lat: coords ? latValue : undefined,
    lng: coords ? lngValue : undefined,
  });

  // Smart Cross-Category Intent Detection:
  // If user searched for something with 0 results in the current category (e.g. "hair cutting" or "dental" in sweet-shops),
  // check if another category in this city matches their query, and seamlessly redirect them to that category!
  if (searchQuery && ranked.length === 0) {
    const otherCategories = PUBLIC_CATEGORIES.filter((c) => c.slug !== canonicalCategory);
    const otherTypes = otherCategories.flatMap((c) => c.businessTypes);
    const otherBusinesses = await getPublicDiscoveryBusinesses(citySlug, otherTypes);
    const crossMatches = rankBusinesses(otherBusinesses, {
      sort: value(query.sort),
      q: searchQuery,
      minRating: [3, 4, 4.5].includes(minimum) ? minimum : undefined,
      lat: coords ? latValue : undefined,
      lng: coords ? lngValue : undefined,
    });

    if (crossMatches.length > 0) {
      const targetCategorySlug = categorySlugForBusinessType(crossMatches[0].type);
      if (targetCategorySlug && targetCategorySlug !== canonicalCategory) {
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined) {
            if (Array.isArray(v)) for (const item of v) p.append(k, item);
            else p.set(k, v);
          }
        }
        const s = p.toString();
        redirect(`/${canonicalCity}/${targetCategorySlug}${s ? `?${s}` : ""}`);
      }
    }
  }

  const page = paginate(ranked, Number(value(query.page)) || 1);
  const cityName = businesses[0]?.city ?? discoveryTitle(citySlug);
  const categoryName = categoryNameForSlug(canonicalCategory) || discoveryTitle(canonicalCategory);
  const quickFilters = CATEGORY_QUICK_FILTERS[canonicalCategory] ?? [];

  // Multi-store brand discovery: collect matched catalog items across ranked businesses
  const allMatchedItems = searchQuery
    ? ranked.flatMap((b) =>
        (b.matchedItems ?? []).map((item) => ({
          ...item,
          businessName: b.name,
          businessSlug: b.slug,
        }))
      )
    : [];

  const brandSummaries = (() => {
    if (!allMatchedItems.length) return [];
    const map = new Map<
      string,
      { name: string; minPrice: number; maxPrice: number; storeCount: number; stores: string[] }
    >();
    for (const item of allMatchedItems) {
      const existing = map.get(item.name);
      if (existing) {
        existing.minPrice = Math.min(existing.minPrice, item.price);
        existing.maxPrice = Math.max(existing.maxPrice, item.price);
        if (!existing.stores.includes(item.businessName)) {
          existing.stores.push(item.businessName);
          existing.storeCount += 1;
        }
      } else {
        map.set(item.name, {
          name: item.name,
          minPrice: item.price,
          maxPrice: item.price,
          storeCount: 1,
          stores: [item.businessName],
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.storeCount - a.storeCount || a.minPrice - b.minPrice
    );
  })();

  const storesWithItemCount = ranked.filter((b) => (b.matchedItems?.length ?? 0) > 0).length;

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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              categoryListingSchema({
                cityName,
                categoryName,
                canonicalPath: `/${canonicalCity}/${canonicalCategory}`,
                businesses,
              })
            ),
          }}
        />

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

          {/* ── Justdial Style Category Grid / Switcher Bar ── */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Explore Categories in {cityName}
              </span>
              <span className="text-[10px] font-bold text-blue-700">{ALL_DISCOVERY_CATEGORIES.length} Categories</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {ALL_DISCOVERY_CATEGORIES.map((cat) => {
                const isActive = cat.slug === canonicalCategory;
                return (
                  <Link
                    key={cat.slug}
                    href={`/${canonicalCity}/${cat.slug}`}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/30"
                        : "border border-slate-200/80 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Discovery Search & Filter Controls ── */}
          <div className="mb-4">
            <DiscoveryControls
              city={canonicalCity}
              category={canonicalCategory}
              search={searchQuery}
              sort={value(query.sort) || "recommended"}
              minRating={value(query.minRating)}
              lat={coords ? String(latValue) : ""}
              lng={coords ? String(lngValue) : ""}
            />
          </div>

          {/* ── Swiggy / Zomato Style Quick Food & Item Pills ── */}
          {quickFilters.length > 0 && (
            <div className="mb-6 -mt-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                  Quick Find:
                </span>
                {quickFilters.map((pill) => {
                  const currentQ = searchQuery.toLowerCase().trim();
                  const isSelected = (!pill.q && !currentQ) || (pill.q && currentQ.includes(pill.q));
                  const p = new URLSearchParams();
                  if (pill.q) p.set("q", pill.q);
                  if (value(query.sort)) p.set("sort", value(query.sort));
                  if (value(query.minRating)) p.set("minRating", value(query.minRating));
                  if (coords) {
                    p.set("lat", String(latValue));
                    p.set("lng", String(lngValue));
                  }
                  const href = `/${canonicalCity}/${canonicalCategory}${p.toString() ? `?${p.toString()}` : ""}`;
                  return (
                    <Link
                      key={pill.label}
                      href={href}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-bold transition shadow-2xs ${
                        isSelected
                          ? "bg-blue-700 text-white shadow-blue-700/20 ring-2 ring-blue-700/30"
                          : "bg-white border border-slate-200/90 text-slate-700 hover:border-blue-400 hover:text-blue-700"
                      }`}
                    >
                      <span>{pill.icon}</span>
                      <span>{pill.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Multi-Store Brand & Item Availability Summary Banner ── */}
          {searchQuery && brandSummaries.length > 0 && (
            <div className="mb-6 rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-100/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
                    ✓
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Available across {storesWithItemCount} {storesWithItemCount === 1 ? "store" : "stores"} in {cityName}
                    </h2>
                    <p className="text-xs text-slate-600">
                      Found verified brands &amp; real in-store pricing matching <span className="font-bold text-slate-950">&ldquo;{searchQuery}&rdquo;</span>
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/20">
                  Multi-Store Find
                </span>
              </div>

              {/* Brand Pills */}
              <div className="mt-3 flex flex-wrap gap-2">
                {brandSummaries.map((brand) => (
                  <div
                    key={brand.name}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200/90 bg-white px-3 py-1.5 text-xs shadow-2xs"
                  >
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-900">{brand.name}</span>
                    <span className="rounded-lg bg-emerald-50 px-1.5 py-0.5 font-black text-emerald-700">
                      From ₹{brand.minPrice}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      ({brand.storeCount} {brand.storeCount === 1 ? "shop" : "shops"})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                      <div className="mt-3.5 flex flex-col gap-1 text-xs text-slate-600">
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

                      {/* In-Stock Brand Highlights (When search query matched items in this shop) */}
                      {business.matchedItems && business.matchedItems.length > 0 ? (
                        <div className="mt-3.5 rounded-2xl bg-emerald-50/80 p-3 border border-emerald-200/80">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950 mb-2">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                              <span>IN-STOCK MATCHING &ldquo;{searchQuery}&rdquo;</span>
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full ring-1 ring-emerald-600/20">
                              {business.matchedItems.length} {business.matchedItems.length === 1 ? "Brand" : "Brands"} Available
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {business.matchedItems.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-emerald-200/90 px-2.5 py-1 text-xs text-slate-800 shadow-2xs"
                              >
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                <span className="font-bold text-slate-900">{item.name}</span>
                                <span className="font-black text-emerald-700">₹{item.price}</span>
                                {item.unit && <span className="text-[10px] text-slate-500 font-normal">({item.unit})</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : business.catalogItems && business.catalogItems.length > 0 ? (
                        <div className="mt-3.5 rounded-2xl bg-slate-50/90 p-3 border border-slate-200/70">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                            <span className="flex items-center gap-1">
                              <span>🍽️</span>
                              <span>POPULAR ITEMS &amp; MENU</span>
                            </span>
                            {business.catalogItems.some((i) => i.itemType === "veg") && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ring-1 ring-emerald-600/20">
                                <span className="size-1.5 rounded-full bg-emerald-600" /> Pure Veg
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {business.catalogItems.slice(0, 4).map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-800 shadow-2xs"
                              >
                                <span className="font-semibold text-slate-900">{item.name}</span>
                                <span className="font-black text-emerald-700">₹{item.price}</span>
                                {item.unit && <span className="text-[10px] text-slate-400 font-normal">({item.unit})</span>}
                              </span>
                            ))}
                            {business.catalogItems.length > 4 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-bold text-blue-700">
                                +{business.catalogItems.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null}

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
                {searchQuery || minimum ? " with these filters" : " yet"}. Try adjusting your search or check again later.
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

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Or explore popular categories in {cityName}:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {ALL_DISCOVERY_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/${canonicalCity}/${cat.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Pagination ── */}
          {page.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {page.currentPage > 1 && (
                <Link
                  href={pageHref(page.currentPage - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-xs font-semibold text-slate-500">
                Page {page.currentPage} of {page.totalPages}
              </span>
              {page.currentPage < page.totalPages && (
                <Link
                  href={pageHref(page.currentPage + 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <TrustitPublicFooter />
    </>
  );
}
