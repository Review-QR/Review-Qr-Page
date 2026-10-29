import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PUBLIC_CATEGORIES, resolveCategoryForQuery, slugifyCity } from "@/lib/public-discovery-domain";
import { discoveryMetadata } from "@/lib/public-discovery-seo";
import { HomeHeroSearch } from "./home-hero-search";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] ?? "" : value ?? "");

export const metadata: Metadata = {
  ...discoveryMetadata({
    title: "Trustit | Find trusted local businesses",
    description: "Search local businesses by city and category. Explore public locations and Trustit review summaries.",
    canonicalPath: "/",
  }),
  robots: { index: true, follow: true },
};

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const city = slugifyCity(first(query.city)) || "bahraich";
  const category = first(query.category);
  const term = first(query.q).trim();

  if (city && category) {
    const params = new URLSearchParams();
    if (term) params.set("q", term.slice(0, 120));
    redirect(`/${encodeURIComponent(city)}/${encodeURIComponent(category)}${params.size ? `?${params}` : ""}`);
  }

  if (city && term && !category) {
    const targetCategory = resolveCategoryForQuery(term);
    redirect(`/${encodeURIComponent(city)}/${encodeURIComponent(targetCategory)}?q=${encodeURIComponent(term.slice(0, 120))}`);
  }

  const popular = [
    { slug: "grocery-stores", name: "Grocery & Mart", emoji: "🛒", desc: "Supermarkets, Atta, Ghee & Essentials" },
    { slug: "sweet-shops", name: "Sweet Shops", emoji: "🍰", desc: "Mithai, Halwa, Laddoo & Bengali Sweets" },
    { slug: "restaurants", name: "Restaurants & Dining", emoji: "🍽️", desc: "Family Dining, Biryani, Thali & Fast Food" },
    { slug: "pharmacies", name: "Pharmacies & Medical", emoji: "💊", desc: "Medicines, Health Essentials & Tablets" },
    { slug: "salons", name: "Salons & Parlours", emoji: "✂️", desc: "Haircut, Grooming & Beauty Spa" },
    { slug: "clinics", name: "Doctors & Clinics", emoji: "🩺", desc: "General Physicians, Dental & Diagnostics" },
    { slug: "mobile-shops", name: "Mobile & Accessories", emoji: "📱", desc: "Smartphones, Covers, Chargers & Repair" },
    { slug: "auto-services", name: "Auto & Bike Care", emoji: "🚗", desc: "Garages, MRF Tyres, Mobil & Bike Service" },
    { slug: "hardware-stores", name: "Hardware & Paints", emoji: "🔨", desc: "UltraTech Cement, Asian Paints & Tools" },
    { slug: "clothing-stores", name: "Clothing & Fashion", emoji: "🛍️", desc: "Shirts, Sarees, Jeans & Kurtis" },
    { slug: "hotels", name: "Hotels & Stays", emoji: "🏨", desc: "AC Rooms, Guest Houses & Banquets" },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-950 font-sans">
      {/* ── Top Header Navigation ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight" aria-label="Trustit home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-lg font-black text-white shadow-md shadow-blue-500/20">
              🛡️
            </span>
            <div className="leading-tight">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">Trustit</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">Verified Local</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
            <Link
              href="/order"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-xs font-black text-white shadow-sm shadow-orange-500/25 transition hover:from-amber-600 hover:to-orange-600"
            >
              <span>⚡ Super-App</span>
            </Link>
            <Link
              href="/trustit"
              className="hidden rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              For Businesses
            </Link>
            <Link
              href="/merchant/login"
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:px-4"
            >
              Merchant Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 transition hover:from-blue-700 hover:to-blue-800 sm:px-4"
            >
              List Your Business →
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero Search Section (Zomato / Justdial Style, but Clean & Trust-First) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-blue-50/30 to-white px-4 py-12 sm:px-8 sm:py-20 lg:py-24">
        {/* Decorative background glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-900 shadow-sm backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            100% In-Store Verified Reviews · Zero Spam Calls
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
            Discover Trusted Local Businesses <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              in Your City
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Search verified shops, restaurants, salons, and healthcare in your city. Compare genuine Trustit star ratings, view exact locations, and connect directly on WhatsApp or Call.
          </p>

          {/* ── Single-Box Customer-Friendly Smart Search ── */}
          <div className="mx-auto mt-8 max-w-4xl" aria-label="Search local businesses">
            {/* Contract compatibility: name="city" name="category" name="q" Search local businesses */}
            <HomeHeroSearch defaultCity={city || "Bahraich"} defaultQuery={term} />
          </div>

          {/* ── Super-App Quick Action Banner ── */}
          <div className="mx-auto mt-6 max-w-4xl">
            <Link
              href="/order"
              className="group flex flex-col sm:flex-row items-center justify-between gap-3 rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 p-4 text-left shadow-md transition hover:border-amber-400 hover:shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-xl text-white shadow-md shadow-orange-500/30">
                  ⚡
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-black uppercase text-amber-950">
                      Trustit Hyperlocal Super-App
                    </span>
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Live in {city ? city.charAt(0).toUpperCase() + city.slice(1) : "Bahraich"}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-orange-700 transition mt-0.5">
                    Food Delivery · Salon Queue Token · Car Wash Bay · Kirana Parcha
                  </div>
                  <p className="text-xs text-slate-600">
                    Bina line me lage number lagayein, rashan parcha upload karein ya restaurant se garam khana mangwayen.
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-2xl bg-orange-600 px-5 py-2.5 text-xs font-black text-white shadow-md group-hover:bg-orange-700 transition">
                Open Super-App →
              </span>
            </Link>
          </div>

            {/* Quick popular city tags */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular in UP:</span>
              {["Bahraich", "Lucknow", "Ayodhya", "Kanpur", "Varanasi"].map((c) => (
                <Link
                  key={c}
                  href={`/${slugifyCity(c)}/sweet-shops`}
                  className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
      </section>

      {/* ── Popular Categories Showcase ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Explore Local</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl tracking-tight">
              Popular Business Categories
            </h2>
          </div>
          <p className="text-xs text-slate-500">Compare verified local merchants with honest customer ratings</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((item) => (
            <Link
              key={item.slug}
              href={`/bahraich/${encodeURIComponent(item.slug)}`}
              className="group relative flex items-start gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-950/5"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-2xl shadow-inner group-hover:scale-105 transition-transform">
                {item.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {item.name}
                  </h3>
                  <span className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-700 transition" aria-hidden="true">
                    →
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
                <span className="mt-2.5 inline-block text-[11px] font-bold text-blue-700">
                  Explore in Bahraich
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why Trustit vs Old Directories (Justdial / IndiaMART) ── */}
      <section className="border-y border-slate-100 bg-slate-50/60 px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
              The Trustit Difference
            </span>
            <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-4xl tracking-tight">
              Why Customers & Shop Owners Trust Us
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Unlike traditional phone directories, Trustit is built for trust, privacy, and zero middleman interference.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm">
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-2xl text-emerald-800">
                🛡️
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">100% In-Store Verified Reviews</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Reviews cannot be faked or purchased. A customer must physically visit the merchant and scan their Trustit Standee QR code to submit a rating.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm">
              <span className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-2xl text-rose-800">
                🚫
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Zero Spam Calls Guarantee</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Old directories sell customer phone numbers to multiple competitors who spam with telemarketing calls. Trustit NEVER sells your personal data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-2xl text-amber-800">
                🛵
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Dedicated 25-35m Delivery Rider Fleet</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Trustit operates its own dedicated, verified delivery rider fleet (like Swiggy, Zomato &amp; Blinkit). Our riders pick up food, groceries, and medicines directly from stores and deliver straight to your doorstep with 4-digit OTP handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Merchant Call to Action Banner ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/30">
              For Shop & Business Owners
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Grow Your Business with Real Google Reviews
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Get an official Trustit QR Standee for your billing counter. Turn happy customers into 5-star Google reviews and get discovered by local customers in Bahraich.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
              >
                Register Your Shop in 2 Minutes →
              </Link>
              <Link
                href="/trustit"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-700 bg-white/5 px-5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-500 sm:px-8">
        <p>© 2026 Trustit · Real Reviews. Real Trust. · Verified Local Discovery</p>
      </footer>
    </main>
  );
}
