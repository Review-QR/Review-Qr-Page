import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PUBLIC_CATEGORIES, slugifyCity } from "@/lib/public-discovery-domain";
import { discoveryMetadata } from "@/lib/public-discovery-seo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

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
  const city = slugifyCity(first(query.city));
  const category = first(query.category);
  const selectedCategory = PUBLIC_CATEGORIES.some((item) => item.slug === category) ? category : "";
  const term = first(query.q).trim();
  if (city && category) {
    const params = new URLSearchParams();
    if (term) params.set("q", term.slice(0, 120));
    redirect(`/${encodeURIComponent(city)}/${encodeURIComponent(category)}${params.size ? `?${params}` : ""}`);
  }

  const popular = ["restaurants", "sweet-shops", "cafes", "salons", "hotels", "clinics"]
    .map((slug) => PUBLIC_CATEGORIES.find((categoryItem) => categoryItem.slug === slug))
    .filter((categoryItem): categoryItem is (typeof PUBLIC_CATEGORIES)[number] => Boolean(categoryItem));

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 font-bold tracking-tight" aria-label="Trustit home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-700 text-lg text-white">T</span>
            <span className="text-xl">Trustit</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main navigation">
            <Link href="/trustit" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:inline-flex">For businesses</Link>
            <Link href="/merchant/login" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:px-4">Business login</Link>
            <Link href="/register" className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 sm:px-4">List your business</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-sky-50 to-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-800"><span className="h-2 w-2 rounded-full bg-blue-600" />Local discovery, made clear</p>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Find a local business that feels right.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Explore local businesses by city and category, see public location details, and browse Trustit review summaries.</p>

            <form action="/" method="get" className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-blue-950/5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:p-4" aria-label="Search local businesses">
              <label className="min-w-0 px-2 py-1.5"><span className="block text-xs font-bold uppercase tracking-wide text-slate-500">City or town</span><input name="city" autoComplete="address-level2" required maxLength={100} placeholder="e.g. Bahraich" className="mt-1 w-full border-0 p-0 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:ring-0" /></label>
              <label className="min-w-0 border-t border-slate-100 px-2 py-2 sm:border-l sm:border-t-0 sm:py-1.5 sm:pl-4"><span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Category</span><select name="category" required defaultValue={selectedCategory} className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-700 outline-none focus:ring-0"><option value="" disabled>Choose a category</option>{PUBLIC_CATEGORIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
              <label className="min-w-0 border-t border-slate-100 px-2 py-2 sm:border-l sm:border-t-0 sm:py-1.5 sm:pl-4"><span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Business name (optional)</span><input name="q" maxLength={120} placeholder="Search by name" className="mt-1 w-full border-0 p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0" /></label>
              <button type="submit" className="min-h-12 rounded-xl bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Search businesses <span aria-hidden="true">→</span></button>
            </form>
            <p className="mt-3 text-xs text-slate-500">Only eligible businesses with merchant-confirmed public locations appear in local search.</p>
          </div>

          <aside className="rounded-[2rem] border border-blue-100 bg-white/85 p-6 shadow-[0_30px_90px_-45px_rgba(30,64,175,0.35)] sm:p-8" aria-label="How Trustit discovery works">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Explore nearby</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Start with a category</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Choose a city and category above to see currently listed businesses.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">{popular.map((item) => <Link key={item.slug} href={`/?category=${encodeURIComponent(item.slug)}#search`} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">{item.name}<span className="ml-2 text-blue-700" aria-hidden="true">↗</span></Link>)}</div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-lg text-emerald-800" aria-hidden="true">✓</span><div><p className="text-sm font-bold">Public, useful details</p><p className="mt-1 text-xs leading-5 text-slate-600">Business location and submitted Trustit rating summaries.</p></div></div></div>
          </aside>
        </div>
      </section>

      <section id="search" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[["01", "Choose a place", "Search a city or town to see its available local listings."], ["02", "Browse a category", "Compare public business profiles and location information."], ["03", "Explore with context", "Review Trustit rating summaries; private customer review details stay private."]].map(([number, title, text]) => <article key={number} className="rounded-2xl border border-slate-200 p-6"><span className="text-sm font-bold text-blue-700">{number}</span><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-5 rounded-3xl bg-slate-950 px-6 py-8 text-white sm:flex-row sm:items-center sm:px-9"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">For local businesses</p><h2 className="mt-2 text-2xl font-bold">Help customers find your business.</h2></div><div className="flex flex-wrap gap-3"><Link href="/trustit" className="rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Explore Trustit for business</Link><Link href="/register" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500">Register your business</Link></div></div>
      </section>
      <footer className="border-t border-slate-200 px-5 py-7 text-center text-xs text-slate-500">Trustit · Local business discovery</footer>
    </main>
  );
}
