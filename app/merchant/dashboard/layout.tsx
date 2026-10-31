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

function initials(value: string | null) {
  return (
    (value ?? "Merchant")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M"
  );
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
      {/* 1. Top Institutional Sub-Bar (Stitch Kinetic Trust Standard) */}
      <div className="w-full bg-[#faf8ff] border-b border-[#eaedff] px-4 sm:px-8 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Left: DPIIT & Startup India Recognition */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#003178] font-bold tracking-wider text-[11px] uppercase shadow-xs">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span>DPIIT RECOGNIZED • STARTUP INDIA</span>
            </div>
            <div className="h-4 w-px bg-[#dae2fd] hidden sm:block"></div>
            <span className="text-[#434652] text-[11px] font-medium hidden md:inline">
              TRUSTIT Merchant Partner Network • Kinetic Rail v2.0
            </span>
          </div>

          {/* Right: Direct Toll-Free Helpline & Gateway Health */}
          <div className="flex items-center gap-3 text-[#434652] text-[11px] flex-wrap">
            <a
              href="tel:18004198787"
              className="inline-flex items-center gap-1.5 text-[#131b2e] hover:text-[#003178] transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[15px] text-[#006875]">support_agent</span>
              <span>Merchant Desk: <strong>1800-419-8787</strong></span>
            </a>
            <div className="flex items-center gap-1.5 text-[#005739] font-bold bg-[#eaedff] px-2.5 py-0.5 rounded-full">
              <span className="inline-block w-2 h-2 rounded-full bg-[#005739] animate-pulse"></span>
              <span>Gateways Nominal</span>
            </div>
          </div>
        </div>
      </div>

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
            <span className="merchant-identity__avatar" aria-hidden="true">
              {merchantIcon(merchant.businessType)}
            </span>
            <span className="merchant-identity__copy">
              <span className="flex items-center gap-1.5">
                <strong>{merchant.businessName}</strong>
                {isPremium && (
                  <span title="Trustit VIP Merchant" aria-label="VIP Merchant" className="inline-flex items-center text-amber-500">
                    👑
                  </span>
                )}
              </span>
              <small className="font-mono text-[10px] text-[#737783]">{merchant.businessId}</small>
              <span className="merchant-active-pill">
                <i /> Active Merchant
              </span>
            </span>
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
          {/* Top Sticky Status Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#eaedff] px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eaedff] text-[#003178] rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#005739] animate-pulse"></span>
                <span>Open &amp; Taking Orders</span>
              </div>
              <span className="text-xs text-[#737783] hidden md:inline">Live Hyperlocal Mesh • Auto-Sync 4s</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/merchant/dashboard/orders"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#003178] hover:bg-[#0d47a1] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>Live Orders</span>
              </Link>
              <div className="h-5 w-px bg-[#eaedff] hidden sm:block"></div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0d47a1] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {initials(merchant.businessName)}
                </div>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#131b2e] leading-tight truncate max-w-[160px]">
                    {merchant.businessName}
                  </span>
                  <span className="text-[10px] text-[#005739] font-semibold uppercase">
                    {isPremium ? "VIP Partner" : "Verified Partner"}
                  </span>
                </div>
              </div>
            </div>
          </header>

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
