import Link from "next/link";

export default function DiscoveryNotFound() {
  return <main className="min-h-[50vh] bg-slate-50 px-4 py-16 text-center text-slate-900">
    <h1 className="text-2xl font-bold">This Trustit discovery page is unavailable</h1>
    <p className="mt-2 text-slate-600">The location, category, or business may not be listed.</p>
    <Link className="mt-5 inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold" href="/">Return to Trustit</Link>
  </main>;
}
