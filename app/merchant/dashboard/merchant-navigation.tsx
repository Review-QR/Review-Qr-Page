"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const items = [
  { href: "/merchant/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/merchant/dashboard/business", label: "My Business", icon: "business" },
  { href: "/merchant/dashboard/qr", label: "My QR Code", icon: "qr" },
  { href: "/merchant/dashboard/reviews", label: "Customer Reviews", icon: "reviews" },
  { href: "/merchant/dashboard#scan-analytics", label: "Analytics", icon: "analytics" },
  { href: "/merchant/dashboard/subscription", label: "Subscription", icon: "subscription" },
  { href: "/merchant/dashboard/payments", label: "Payments", icon: "payments" },
  { href: "/merchant/dashboard/profile", label: "Merchant Profile", icon: "profile" },
];

function NavigationIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    dashboard: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    business: <><path d="M3 10h18v10H3zM2 10l2-6h16l2 6" /><path d="M8 20v-6h8v6M6 7h.01M10 7h.01M14 7h.01M18 7h.01" /></>,
    qr: <><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14v2M21 19v2h-4" /><path d="M6 6h1M17 6h1M6 17h1" /></>,
    reviews: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3 2v-5.2A7.5 7.5 0 1 1 20 11.5Z" /><path d="m12.5 6.5 1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3 1-2Z" /></>,
    analytics: <><path d="M4 20V11M10 20V5M16 20v-8M22 20V3" /></>,
    subscription: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h7" /></>,
    payments: <><rect x="2.5" y="5" width="19" height="15" rx="2.5" /><path d="M3 10h18M7 15h4" /></>,
    profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-1.5a7 7 0 0 1 14 0V21z" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="merchant-nav__icon" {...common}>{paths[name]}</svg>;
}

export default function MerchantNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  return (
    <nav aria-label="Merchant navigation" className={mobile ? "merchant-mobile-nav" : "merchant-nav"}>
      {items.map((item) => {
        const active = item.href.endsWith("#scan-analytics")
          ? pathname === "/merchant/dashboard" && hash === "#scan-analytics"
          : item.href === "/merchant/dashboard"
            ? pathname === item.href && hash !== "#scan-analytics"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setHash(item.href.endsWith("#scan-analytics") ? "#scan-analytics" : "")}
            aria-current={active ? "page" : undefined}
            className={`merchant-nav__link${active ? " is-active" : ""}`}
          >
            <NavigationIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
