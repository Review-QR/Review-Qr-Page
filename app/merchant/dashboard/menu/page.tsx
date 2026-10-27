import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { normalizePlanTier } from "@/lib/plan-rules";
import MenuManager, { type MenuItem } from "./menu-manager";

export const dynamic = "force-dynamic";

export default async function MerchantMenuPage() {
  const merchant = await requireActiveMerchant();
  const planTier = normalizePlanTier(merchant.plan);

  if (planTier === "basic") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-blue-200 bg-white p-7 text-center shadow-lg sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-200 text-4xl shadow-md">
            🍽️
          </div>
          <span className="mt-5 inline-block rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-900">
            Available on Standard Plan (₹49)
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Upgrade to Standard Plan
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <strong>Menu & Items</strong> feature Standard (₹49) aur Premium (₹99) plans me available hai. Isse aap apne business ke catalog items, prices, aur availability manage kar sakte hain.
          </p>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-left text-xs leading-5 text-blue-950">
            <strong className="mb-1 block text-sm font-bold text-blue-900">
              Standard Plan me kya-kya milega:
            </strong>
            <ul className="space-y-1 list-disc list-inside">
              <li>Menu & Items catalog manager</li>
              <li>Message Designer access (Festival & Seasonal templates)</li>
              <li>5 Standee QR Templates unlocked</li>
              <li>Daily & Weekly Scan Analytics</li>
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/merchant/dashboard/subscription"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-800"
            >
              Upgrade to Standard Plan (₹49) →
            </Link>
            <Link
              href="/merchant/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const client = createSupabaseAdminClient();

  const { data, error } = await client
    .from("business_catalog_items")
    .select("id, business_id, name, category, price, unit, item_type, image_url, description, is_available")
    .eq("business_id", merchant.businessId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load catalog items for merchant:", error);
  }

  const items: MenuItem[] = (data ?? []).map((row) => ({
    id: String(row.id),
    businessId: String(row.business_id),
    name: String(row.name ?? ""),
    category: String(row.category ?? "General"),
    price: Number(row.price) || 0,
    unit: row.unit ? String(row.unit) : null,
    itemType: (row.item_type as MenuItem["itemType"]) ?? "veg",
    imageUrl: row.image_url ? String(row.image_url) : null,
    description: row.description ? String(row.description) : null,
    isAvailable: row.is_available === true,
  }));

  return (
    <div className="space-y-6">
      <MenuManager initialItems={items} businessName={merchant.businessName} />
    </div>
  );
}
