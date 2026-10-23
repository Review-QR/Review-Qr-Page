import Link from "next/link";
import { merchantSignOutAction } from "@/app/merchant/login/actions";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import MerchantNavigation from "./merchant-navigation";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
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
  return (value ?? "Merchant")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";
}

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();
  const { count: unreadCount } = await supabase.from("merchant_notifications")
    .select("id", { count: "exact", head: true }).eq("business_id", merchant.businessId).eq("is_read", false);
  const hasUnreadNotifications = (unreadCount ?? 0) > 0;

  return (
    <div className="trustit-merchant-app">
      <aside className="merchant-sidebar">
        <Link href="/merchant/dashboard" className="merchant-brand">
          <img src="/trustit-icon.svg" alt="" width="42" height="42" />
          <span><strong>Trustit</strong><small>Merchant Portal</small></span>
        </Link>

        <div className="merchant-identity">
          <span className="merchant-identity__avatar" aria-hidden="true">{merchantIcon(merchant.businessType)}</span>
          <span className="merchant-identity__copy">
            <strong>{merchant.businessName}</strong>
            <small>{merchant.businessId}</small>
            <span className="merchant-active-pill"><i /> Active Merchant</span>
          </span>
        </div>

        <MerchantNavigation hasUnreadNotifications={hasUnreadNotifications} />

        <div className="merchant-sidebar__footer">
          <div className="merchant-help-icon" aria-hidden="true">?</div>
          <span><strong>Need help?</strong><small>Visit your QR page for sharing help.</small></span>
          <Link href="/merchant/dashboard/qr" aria-label="Open QR sharing help">›</Link>
        </div>
        <form action={merchantSignOutAction} className="merchant-logout-form">
          <button type="submit">Log out</button>
        </form>
      </aside>

      <div className="merchant-main">
        <div className="merchant-mobile-header">
          <Link href="/merchant/dashboard" className="merchant-brand">
            <img src="/trustit-icon.svg" alt="" width="36" height="36" />
            <span><strong>Trustit</strong><small>Merchant Portal</small></span>
          </Link>
          <form action={merchantSignOutAction}><button type="submit">Log out</button></form>
        </div>
        <MerchantNavigation mobile hasUnreadNotifications={hasUnreadNotifications} />
        <main className="merchant-content">{children}</main>
      </div>
    </div>
  );
}
