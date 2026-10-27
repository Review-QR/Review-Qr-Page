import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { normalizePlanTier } from "@/lib/plan-rules";
import MessageDesigner from "./message-designer";
import { getMerchantMessages, getMerchantCatalogItems, getMerchantSocialIntegration } from "./actions";

export const dynamic = "force-dynamic";

export default async function MerchantMessagesPage() {
  const merchant = await requireActiveMerchant();
  const planTier = normalizePlanTier(merchant.plan);

  if (planTier === "basic") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-7 text-center shadow-lg sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 text-4xl shadow-md">
            🔒
          </div>
          <span className="mt-5 inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
            Available on Standard Plan (₹49) & Premium (₹99)
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Upgrade to Unlock Message Designer
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Message Designer feature <strong>Standard (₹49)</strong> aur <strong>Premium (₹99)</strong> plan members ke liye uplabdh hai. Isse aap apne business ke seasonal festival offers, discounts, aur customer announcements bana sakte hain.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-left text-xs leading-5 text-amber-950">
            <strong className="mb-1 block text-sm font-bold text-amber-900">
              Standard Plan me kya-kya milega:
            </strong>
            <ul className="space-y-1 list-disc list-inside">
              <li>Full Message Designer access (Festival & Seasonal templates)</li>
              <li>Menu & Items catalog manager</li>
              <li>5 Standee QR Templates unlocked</li>
              <li>Daily & Weekly Scan Analytics</li>
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/merchant/dashboard/subscription"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 text-sm font-bold text-white shadow-md transition hover:from-amber-700 hover:to-amber-800"
            >
              Upgrade Plan (₹49) →
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

  const [saved, catalogItems, socialIntegration] = await Promise.all([
    getMerchantMessages(),
    getMerchantCatalogItems(),
    getMerchantSocialIntegration(),
  ]);

  return (
    <MessageDesigner
      businessName={merchant.businessName}
      businessType={merchant.businessType}
      city={merchant.city ?? "Bahraich"}
      phone={merchant.registeredMobile ?? ""}
      saved={saved}
      catalogItems={catalogItems}
      socialIntegration={socialIntegration}
    />
  );
}
