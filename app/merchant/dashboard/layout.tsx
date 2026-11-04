import Link from "next/link";
import { merchantSignOutAction } from "@/app/merchant/login/actions";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import MerchantNavigation from "./merchant-navigation";
import MerchantProfileDropdown from "./merchant-profile-dropdown";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { normalizePlanTier } from "@/lib/plan-rules";
import "./dashboard.css";

export const dynamic = "force-dynamic";

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

  const vipCrown = isPremium && (
    <span title="Trustit VIP Merchant" aria-label="VIP Merchant" className="inline-flex items-center text-amber-500 shrink-0">
      👑
    </span>
  );

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

          {/* Interactive Merchant Profile & Action Dropdown (Sidebar) */}
          <MerchantProfileDropdown
            businessName={merchant.businessName}
            businessId={merchant.businessId}
            businessType={merchant.businessType}
            logoUrl={merchant.logoUrl}
            isPremium={isPremium}
            crown={vipCrown}
            variant="sidebar"
          />

          <MerchantNavigation
            hasUnreadNotifications={hasUnreadNotifications}
            isPremium={isPremium}
            plan={merchant.plan}
            businessType={merchant.businessType}
          />

          <Link
            href="/merchant/dashboard/support"
            className="merchant-sidebar__footer hover:opacity-90 transition block"
            aria-label="Open support - 24x7 merchant operations desk"
          >
            <div className="merchant-help-icon" aria-hidden="true">
              <span className="material-symbols-outlined text-[18px]">headset_mic</span>
            </div>
            <span>
              <strong>Need support?</strong>
              <small>24x7 merchant operations desk</small>
            </span>
            <span className="ml-auto text-slate-500 text-lg leading-none" aria-hidden="true">
              ›
            </span>
          </Link>

          <form action={merchantSignOutAction} className="merchant-logout-form">
            <button type="submit" className="flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Log out</span>
            </button>
          </form>
        </aside>

        {/* 3. Main Workspace Area */}
        <div className="merchant-main flex flex-col flex-1 min-w-0">
          {/* Mobile Header with Profile Dropdown */}
          <div className="merchant-mobile-header">
            <Link href="/merchant/dashboard" className="merchant-brand">
              <img src="/trustit-icon.svg" alt="" width="36" height="36" />
              <span>
                <strong>Trustit</strong>
                <small>Merchant Portal</small>
              </span>
            </Link>
            <MerchantProfileDropdown
              businessName={merchant.businessName}
              businessId={merchant.businessId}
              businessType={merchant.businessType}
              logoUrl={merchant.logoUrl}
              isPremium={isPremium}
              crown={vipCrown}
              variant="compact"
            />
          </div>

          {/* Desktop Top Header Bar with Context & Quick Profile Dropdown */}
          <header className="hidden lg:flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-8 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">Merchant Portal</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">Business Control Center</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/merchant/dashboard/support"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                <span>🎧</span>
                <span>24x7 Support</span>
              </Link>
              <MerchantProfileDropdown
                businessName={merchant.businessName}
                businessId={merchant.businessId}
                businessType={merchant.businessType}
                logoUrl={merchant.logoUrl}
                isPremium={isPremium}
                crown={vipCrown}
                variant="header"
              />
            </div>
          </header>

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
