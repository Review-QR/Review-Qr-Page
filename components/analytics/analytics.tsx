"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (typeof window === "undefined" || !window.plausible) return;

    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    window.plausible("pageview", { props: { path: url } });
  }, [pathname, searchParams]);

  // Load Plausible script (only in production, only if analytics ID is set)
  if (typeof document === "undefined") return null;

  return null;
}

export function AnalyticsScript() {
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

  if (!analyticsId || typeof document === "undefined") return null;

  return (
    <script
      defer
      data-domain={process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "localhost"}
      src={`https://plausible.io/js/script.js`}
    />
  );
}
