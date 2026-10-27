import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { normalizePlanTier } from "@/lib/plan-rules";
import UniversalOrdersConsoleClient from "./orders-console-client";

export const dynamic = "force-dynamic";

export default async function MerchantLiveOrdersPage() {
  const merchant = await requireActiveMerchant();
  const planTier = normalizePlanTier(merchant.plan);

  if (planTier === "basic") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-blue-200 bg-white p-7 text-center shadow-lg sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-200 text-4xl shadow-md">
            ⚡
          </div>
          <span className="mt-5 inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
            Available on Standard (₹49) & Premium (₹99)
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Live Orders & Queue Console
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <strong>Live Orders & Queue Console</strong> Standard (₹49) aur Premium (₹99) merchants ke liye hai. Isse restaurant food orders receive kar sakte hain, salon digital tokens manage kar sakte hain, aur car wash bays operate kar sakte hain.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-left text-xs leading-5 text-amber-950">
            <strong className="mb-1 block text-sm font-bold text-amber-900">
              Is feature me kya milta hai:
            </strong>
            <ul className="space-y-1 list-disc list-inside">
              <li>Real-time incoming orders with loud alarm buzzer</li>
              <li>Kitchen preparation timers & rider dispatch</li>
              <li>Salon digital queue token board & bay slot manager</li>
              <li>Kirana handwritten parcha bill generator</li>
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

  return (
    <div className="merchant-orders-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <UniversalOrdersConsoleClient
        business={{
          id: merchant.businessId,
          name: merchant.businessName,
          city: merchant.city,
          businessType: merchant.businessType,
        }}
      />
    </div>
  );
}
