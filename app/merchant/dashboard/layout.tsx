import Link from "next/link";
import { merchantSignOutAction } from "@/app/merchant/login/actions";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import MerchantNavigation from "./merchant-navigation";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { normalizePlanTier } from "@/lib/plan-rules";
import "./dashboard.css";

export const dynamic = "force-dynamic";

function merchantIcon(businessType: string | null) {
  const value = String(businessType ?? "").toLowerCase();
  if (/(sweet|mithai|bakery|cake|dessert|food|restaurant|cafe)/.test(value)) return "✿";
  if (/(medical|clinic|doctor|health)/.test(value)) return "+";
  if (/(salon|beauty|spa|barber)/.test(value)) return "✦";
  if (/(hotel|stay|resort)/.test(value)) return "⌂";
  return "✦";
}

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();
  const { count: unreadCount } = await supabase
    .from("merchant_notifications")
    .select("id", { count: "exact", head: true })
    .eq("business_id", merchant.businessId)
    .eq("is_read", false);
  const hasUnreadNotifications = (unreadCount ?? 0) > 0;
  const isPremium = normalizePlanTier(merchant.plan) === "premium";

  return (
    <div className={`trustit-merchant-app${isPremium ? " is-premium-vip" : ""} flex flex-col min-h-screen bg-[#faf8ff]`}>
      <div className="flex flex-1 min-h-0">
        {/* 2. Modernized Stitch Sidebar */}
        <aside className="merchant-sidebar">
          <Link href="/merchant/dashboard" className="merchant-brand">
            <img src="/trustit-icon.svg" alt="" width="38" height="38" />
            <span>
              <strong>Trustit</strong>
              <small>Merchant Partner Console</small>
            </span>
          </Link>

          <div className="merchant-identity">
            <div className="h-11 w-11 shrink-0 rounded-full border-2 border-[#b59363] ring-2 ring-amber-200/50 bg-[#1e140a] flex items-center justify-center overflow-hidden shadow-xs">
              {merchant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-amber-300 font-bold text-lg">{merchantIcon(merchant.businessType)}</span>
              )}
            </div>
            <div className="merchant-identity__copy min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <strong className="truncate block font-bold text-slate-900 text-xs sm:text-sm">{merchant.businessName}</strong>
                {isPremium && (
                  <span title="Trustit VIP Merchant" aria-label="VIP Merchant" className="inline-flex items-center text-amber-500 shrink-0">
                    👑
                  </span>
                )}
              </span>
              <small className="font-mono text-[10px] text-slate-500 block truncate">{merchant.businessId}</small>
              <span className="merchant-active-pill">
                <i /> Active Merchant
              </span>
            </div>
          </div>

          <MerchantNavigation
            hasUnreadNotifications={hasUnreadNotifications}
            isPremium={isPremium}
            plan={merchant.plan}
            businessType={merchant.businessType}
          />

          <div className="merchant-sidebar__footer">
            <div className="merchant-help-icon" aria-hidden="true">
              <span className="material-symbols-outlined text-[18px]">headset_mic</span>
            </div>
            <span>
              <strong>Need support?</strong>
              <small>24x7 merchant operations desk</small>
            </span>
            <Link href="/merchant/dashboard/qr" aria-label="Open QR sharing help">
              ›
            </Link>
          </div>

          <form action={merchantSignOutAction} className="merchant-logout-form">
            <button type="submit" className="flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Log out</span>
            </button>
          </form>
        </aside>

        {/* 3. Main Workspace Area */}
        <div className="merchant-main flex flex-col flex-1 min-w-0">
          <div className="merchant-mobile-header">
            <Link href="/merchant/dashboard" className="merchant-brand">
              <img src="/trustit-icon.svg" alt="" width="36" height="36" />
              <span>
                <strong>Trustit</strong>
                <small>Merchant Portal</small>
              </span>
            </Link>
            <form action={merchantSignOutAction}>
              <button type="submit">Log out</button>
            </form>
          </div>
          <MerchantNavigation
            mobile
            hasUnreadNotifications={hasUnreadNotifications}
            isPremium={isPremium}
            plan={merchant.plan}
            businessType={merchant.businessType}
          />
          <main className="merchant-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
