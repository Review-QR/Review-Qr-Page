"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CategoryBusinessRow } from "@/lib/business-category-admin.server";

export default function CategoryBusinessesTable({ businesses }: { businesses: CategoryBusinessRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => businesses.filter((business) => {
    const searchable = [business.name, business.id, business.city, business.status, business.merchant_status, business.qr_status].join(" ").toLocaleLowerCase();
    return searchable.includes(query.trim().toLocaleLowerCase()) && (status === "all" || String(business.status ?? "").toLocaleLowerCase() === status);
  }), [businesses, query, status]);
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4"><label className="min-w-[240px] flex-1 text-xs font-semibold text-slate-700">Search businesses<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, ID, city, or status" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label><label className="w-full sm:w-48 text-xs font-semibold text-slate-700">Business status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"><option value="all">All statuses</option>{["active", "expiring soon", "expired", "suspended"].map((item) => <option key={item} value={item}>{item}</option>)}</select></label><p className="self-end pb-2 text-xs text-slate-500">{filtered.length} of {businesses.length} businesses</p></div>
    <div className="max-h-[70vh] overflow-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr>{["Business Name", "Business ID", "City", "Status", "Merchant", "QR", "Registration Date", "Expiry", "Action"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((business) => <tr key={business.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-900">{business.name || "—"}</td><td className="px-4 py-3 font-mono text-xs">{business.id}</td><td className="px-4 py-3">{business.city || "—"}</td><td className="px-4 py-3 capitalize">{business.status || "—"}</td><td className="px-4 py-3 capitalize">{business.merchant_status || "—"}</td><td className="px-4 py-3 capitalize">{business.qr_status || "—"}</td><td className="px-4 py-3">{business.registration_date || "—"}</td><td className="px-4 py-3">{business.expiry || "—"}</td><td className="px-4 py-3"><Link href="/businesses" className="font-semibold text-blue-700 hover:underline">Manage</Link></td></tr>)}{filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">No businesses match these filters.</td></tr>}</tbody></table></div>
  </section>;
}
