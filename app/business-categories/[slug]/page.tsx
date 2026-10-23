import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAdminCategoryData, loadCategoryBusinesses } from "@/lib/business-category-admin.server";
import BusinessCategoryIcon from "@/app/components/business-category-icon";
import CategoryBusinessesTable from "../category-businesses-table";

export const dynamic = "force-dynamic";

export default async function BusinessCategoryBusinessesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { categories } = await loadAdminCategoryData();
  const category = categories.find((entry) => entry.slug === decodeURIComponent(slug));
  if (!category) notFound();
  const result = await loadCategoryBusinesses(category.name);
  if (!result) notFound();
  return <main className="mx-auto min-h-screen max-w-[1480px] space-y-5 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <Link href="/business-categories" className="text-sm font-semibold text-blue-700 hover:underline">← Business Categories</Link>
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700"><BusinessCategoryIcon name={category.primaryIcon} family={category.designFamily} className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">{category.source}</p><h1 className="text-2xl font-black text-slate-950">{category.name}</h1></div></div><Link href="/businesses" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">Open Business Management</Link></header>
    <CategoryBusinessesTable businesses={result.businesses} />
    <p className="text-xs text-slate-500">Deleted businesses are excluded. Status, merchant status, QR status, and expiry are shown separately.</p>
  </main>;
}
