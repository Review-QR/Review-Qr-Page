"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationPanel from "./notifications/notification-panel";
import { normalizePlanTier } from "@/lib/plan-rules";

const items = [
  { href: "/merchant/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/merchant/dashboard/business", label: "My Business", icon: "business" },
  { href: "/merchant/dashboard/orders", label: "Live Orders & Queue", icon: "orders" },
  { href: "/merchant/dashboard/menu", label: "Menu & Items", icon: "menu" },
  { href: "/merchant/dashboard/fleet", label: "Delivery & Fleet", icon: "fleet" },
  { href: "/merchant/dashboard/qr", label: "My QR Code", icon: "qr" },
  { href: "/merchant/dashboard/products", label: "QR Standees & Kits", icon: "products" },
  { href: "/merchant/dashboard/reviews", label: "Customer Reviews", icon: "reviews" },
  { href: "/merchant/dashboard/messages", label: "Message Designer", icon: "business" },
  { href: "/merchant/dashboard#scan-analytics", label: "Analytics", icon: "analytics" },
  { href: "/merchant/dashboard/subscription", label: "Subscription", icon: "subscription" },
  { href: "/merchant/dashboard/payments", label: "Payments", icon: "payments" },
  { href: "/merchant/dashboard/profile", label: "Merchant Profile", icon: "profile" },
  { href: "/merchant/dashboard/support", label: "Support & Help", icon: "support" },
];

function NavigationIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    dashboard: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    business: <><path d="M3 10h18v10H3zM2 10l2-6h16l2 6" /><path d="M8 20v-6h8v6M6 7h.01M10 7h.01M14 7h.01M18 7h.01" /></>,
    orders: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
    menu: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10M6 10h10M6 14h6" /></>,
    fleet: <><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
    qr: <><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14v2M21 19v2h-4" /><path d="M6 6h1M17 6h1M6 17h1" /></>,
    products: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    reviews: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3 2v-5.2A7.5 7.5 0 1 1 20 11.5Z" /><path d="m12.5 6.5 1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3 1-2Z" /></>,
    analytics: <><path d="M4 20V11M10 20V5M16 20v-8M22 20V3" /></>,
    subscription: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h7" /></>,
    payments: <><rect x="2.5" y="5" width="19" height="15" rx="2.5" /><path d="M3 10h18M7 15h4" /></>,
    profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-1.5a7 7 0 0 1 14 0V21z" /></>,
    support: <><circle cx="12" cy="12" r="9" /><path d="M12 17v.01M12 14a2 2 0 1 0-2-2" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="merchant-nav__icon" {...common}>{paths[name]}</svg>;
}

function getCategoryLabels(businessType: string | null) {
  const norm = String(businessType || "").toLowerCase();
  if (/(salon|barber|parlour|grooming|hair|spa)/.test(norm)) {
    return { menu: "Services & Rates", orders: "Salon Queue & Tokens" };
  }
  if (/(car|wash|automobile|auto|garage|detailing|bike)/.test(norm)) {
    return { menu: "Wash Packages & Bays", orders: "Bay Booking Queue" };
  }
  if (/(kirana|grocery|supermarket|mart|ration|provision)/.test(norm)) {
    return { menu: "Kirana Master Rates", orders: "Parchas & Grocery Orders" };
  }
  if (/(dairy|milk|paneer|dudh)/.test(norm)) {
    return { menu: "Dairy Products & Rates", orders: "Live Dairy Orders" };
  }
  if (/(medical|pharmacy|chemist|medicine)/.test(norm)) {
    return { menu: "Chemist Store Info", orders: "Prescription (Rx) Orders" };
  }
  return { menu: "Menu & Items", orders: "Live Orders & KOT" };
}

export default function MerchantNavigation({
  mobile = false,
  hasUnreadNotifications = false,
  isPremium = false,
  plan = null,
  businessType = null,
}: {
  mobile?: boolean;
  hasUnreadNotifications?: boolean;
  isPremium?: boolean;
  plan?: string | null;
  businessType?: string | null;
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const categoryLabels = getCategoryLabels(businessType);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isBasic = !plan || normalizePlanTier(plan) === "basic";
  const visibleItems = (isBasic
    ? items.filter(
        (item) =>
          item.href !== "/merchant/dashboard/orders" &&
          item.href !== "/merchant/dashboard/menu" &&
          item.href !== "/merchant/dashboard/messages" &&
          !item.href.includes("#scan-analytics"),
      )
    : items
  ).map((item) => {
    if (item.href === "/merchant/dashboard/menu") {
      return { ...item, label: categoryLabels.menu };
    }
    if (item.href === "/merchant/dashboard/orders") {
      return { ...item, label: categoryLabels.orders };
    }
    return item;
  });

  return (
    <nav aria-label="Merchant navigation" className={mobile ? "merchant-mobile-nav" : "merchant-nav"}>
      {visibleItems.map((item) => {
        const active = item.href.endsWith("#scan-analytics")
          ? pathname === "/merchant/dashboard" && hash === "#scan-analytics"
          : item.href === "/merchant/dashboard"
            ? pathname === item.href && hash !== "#scan-analytics"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const link = (
          <Link
            href={item.href}
            onClick={() => setHash(item.href.endsWith("#scan-analytics") ? "#scan-analytics" : "")}
            aria-current={active ? "page" : undefined}
            className={`merchant-nav__link${active ? " is-active" : ""}`}
          >
            <span className="relative inline-flex"><NavigationIcon name={item.icon} /></span>
            <span>{item.label}</span>
          </Link>
        );
        return item.icon === "reviews" ? (
          <div key={item.href} className="merchant-nav-item relative flex items-center">
            {link}
            <NotificationPanel unread={hasUnreadNotifications} />
          </div>
        ) : (
          <div key={item.href} className="merchant-nav-item">
            {link}
          </div>
        );
      })}
    </nav>
  );
}
