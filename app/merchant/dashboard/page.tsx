import Link from "next/link";
import { isPublicDiscoveryLocationComplete } from "@/lib/business-location";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { normalizePlanTier } from "@/lib/plan-rules";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import OccasionDashboardCard from "./occasion-dashboard-card";
import { getMerchantOccasionSummary, getMerchantConnectWallet } from "@/lib/customer-crm-service";

export const dynamic = "force-dynamic";

type DashboardStats = {
  total_scans: number | string;
  this_month_scans: number | string;
  total_reviews: number | string;
  average_rating: number | string | null;
};

function count(value: number | string | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function getCategoryLauncher(type: string | null | undefined) {
  const norm = (type || "").toLowerCase();
  if (norm.includes("restaurant") || norm.includes("cafe") || norm.includes("food") || norm.includes("sweet")) {
    return {
      emoji: "🍔",
      badge: "KITCHEN KOT & FOOD MENU",
      title: "Manage Restaurant Menu & Kitchen KOT",
      subtitle: "Add dishes, update cooking prep times, and receive loud audio alerts on new orders.",
      cta: "Open Menu & KOT Console →",
      href: "/merchant/dashboard/menu",
      gradient: "from-orange-500/10 via-amber-500/5 to-white",
      borderColor: "border-orange-200",
      btnClass: "bg-orange-600 hover:bg-orange-700 text-white",
    };
  }
  if (norm.includes("grocery") || norm.includes("kirana") || norm.includes("supermarket")) {
    return {
      emoji: "🛒",
      badge: "KIRANA MASTER RATES & PARCHA",
      title: "Master Rates Editor & Smart Parcha Hub",
      subtitle: "50+ daily essentials loaded. Enter your rates to set items live, and quote customer grocery parchis in 1 click.",
      cta: "Open Kirana Rates Editor →",
      href: "/merchant/dashboard/menu",
      gradient: "from-emerald-500/10 via-teal-500/5 to-white",
      borderColor: "border-emerald-200",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    };
  }
  if (norm.includes("dairy") || norm.includes("milk")) {
    return {
      emoji: "🥛",
      badge: "DAIRY PRODUCTS & SLOTS",
      title: "Manage Pure Milk, Paneer & Delivery Slots",
      subtitle: "Update daily fresh milk and paneer rates, and check morning and evening dispatch schedules.",
      cta: "Open Dairy Pricing & Slots →",
      href: "/merchant/dashboard/menu",
      gradient: "from-sky-500/10 via-blue-500/5 to-white",
      borderColor: "border-sky-200",
      btnClass: "bg-sky-600 hover:bg-sky-700 text-white",
    };
  }
  if (norm.includes("salon") || norm.includes("barber") || norm.includes("beauty") || norm.includes("spa")) {
    return {
      emoji: "✂️",
      badge: "SALON QUEUE & TOKEN PASS",
      title: "Manage Salon Services, Rates & Live Queue",
      subtitle: "Set haircut and grooming charges, manage stylist chairs, and monitor live customer queue passes.",
      cta: "Open Salon Console →",
      href: "/merchant/dashboard/menu",
      gradient: "from-purple-500/10 via-indigo-500/5 to-white",
      borderColor: "border-purple-200",
      btnClass: "bg-purple-600 hover:bg-purple-700 text-white",
    };
  }
  if (norm.includes("car") || norm.includes("wash") || norm.includes("auto")) {
    return {
      emoji: "🚗",
      badge: "WASH PACKAGES & BAY QUEUE",
      title: "Manage Wash Packages, Detailing & Bays",
      subtitle: "Update foam wash and detailing rates, and control live bay availability.",
      cta: "Open Wash Packages →",
      href: "/merchant/dashboard/menu",
      gradient: "from-indigo-500/10 via-blue-500/5 to-white",
      borderColor: "border-indigo-200",
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
    };
  }
  return {
    emoji: "⚡",
    badge: "HYPERLOCAL WORKSPACE",
    title: "Category Catalog & Live Operations",
    subtitle: "Manage your rates, live availability, and hyperlocal customer requests.",
    cta: "Manage Catalog & Rates →",
    href: "/merchant/dashboard/menu",
    gradient: "from-blue-500/10 via-indigo-500/5 to-white",
    borderColor: "border-blue-200",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
  };
}

function StatIcon({ kind }: { kind: "qr" | "bars" | "star" }) {
  if (kind === "qr")
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v2m-3 3h4v2h-2" />
      </svg>
    );
  if (kind === "bars")
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="13" width="4" height="8" rx="1" />
        <rect x="10" y="8" width="4" height="13" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    );
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6-4.9-4.7 6.7-.9L12 2Z" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: "qr" | "bars" | "star";
}) {
  return (
    <article className={`merchant-stat merchant-stat--${tone}`}>
      <span className="merchant-stat__icon">
        <StatIcon kind={icon} />
      </span>
      <div className="merchant-stat__copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

export default async function MerchantDashboardPage() {
  const merchant = await requireActiveMerchant();
  const isPremium = normalizePlanTier(merchant.plan) === "premium";
  const launcher = getCategoryLauncher(merchant.businessType);

  const supabase = await createMerchantServerClient();
  const [statsResult, ordersResult, occasionSummary, walletState] = await Promise.all([
    supabase.rpc("get_merchant_dashboard_stats", { p_business_id: merchant.businessId }),
    supabase
      .from("hyperlocal_orders")
      .select("id, status, customer_name, customer_phone, total_amount, items, created_at, accepted_at")
      .eq("business_id", merchant.businessId)
      .order("created_at", { ascending: false })
      .limit(10),
    getMerchantOccasionSummary(merchant.businessId),
    getMerchantConnectWallet(merchant.businessId),
  ]);

  const stats = (statsResult.data?.[0] ?? null) as DashboardStats | null;
  const realOrders = (ordersResult.data ?? []) as Array<{
    id: string;
    status: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number | string;
    items?: unknown;
    created_at: string;
    accepted_at?: string | null;
  }>;

  const pendingOrders = realOrders.filter((o) => o.status === "placed");
  const prepOrders = realOrders.filter((o) => o.status === "accepted" || o.status === "preparing");
  const outForDeliveryOrders = realOrders.filter((o) => o.status === "out_for_delivery" || o.status === "ready_for_pickup");
  const deliveredOrders = realOrders.filter((o) => o.status === "delivered");

  const totalReviews = count(stats?.total_reviews);
  const average = stats?.average_rating == null ? null : Number(stats.average_rating);
  const businessType = merchant.businessType || "Business";
  const sweetsBusiness = /(sweet|mithai|bakery|cake|dessert)/i.test(businessType);
  const categoryEmoji = sweetsBusiness
    ? "🍬"
    : /(food|restaurant|cafe|dhaba|dining)/i.test(businessType)
    ? "🍽️"
    : /(medical|clinic|doctor|health|pharmacy)/i.test(businessType)
    ? "🩺"
    : /(salon|beauty|spa|barber)/i.test(businessType)
    ? "✂️"
    : /(hotel|stay|resort)/i.test(businessType)
    ? "🏨"
    : "🏬";

  const publicLocationComplete = isPublicDiscoveryLocationComplete({
    type: merchant.businessType,
    locality: merchant.locality,
    city: merchant.city,
    district: merchant.district,
    state: merchant.state,
    pincode: merchant.pincode,
    verifiedAt: merchant.discoveryLocationVerifiedAt,
  });

  return (
    <div className="merchant-dashboard-page space-y-6">
      {/* Stitch Executive Storefront Hero Bar */}
      <section className={`merchant-hero${isPremium ? " merchant-hero--premium" : ""} rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs mb-6 transition hover:shadow-sm`}>
        {/* Top Row: Store Identity, Greeting & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
          {/* Left: Circular Medallion Logo + Store Identity */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-[#1e140a] border-2 border-[#b59363] ring-4 ring-amber-100/70 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-sm shrink-0 overflow-hidden">
              {merchant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#0d47a1] flex items-center justify-center text-2xl sm:text-3xl">
                  {categoryEmoji}
                </div>
              )}
            </div>

            <div>
              {/* Clean Location & Store Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Outlet: {merchant.isOutletOpen ? "Open" : "Closed"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <span>📍</span>
                  {merchant.locality || merchant.city || "Bahraich Hub"} • 3.5 km radius
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-mono font-semibold">
                  ID: {merchant.businessId}
                </span>
                {isPremium && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900"
                    title="Trustit VIP Merchant"
                  >
                    <span>👑</span>
                    <span>VIP Merchant</span>
                  </span>
                )}
              </div>

              {/* Greeting Headline */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Namaste, {(merchant.ownerName || merchant.businessName || "Merchant").trim().split(/\s+/)[0]} ji! 🙏
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                Welcome back to <strong className="text-slate-800">{merchant.businessName}</strong> console. Have a profitable day!
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons (Matching Rates & Menu styling) */}
          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <Link
              href="/merchant/dashboard/orders"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition"
            >
              <span className="material-symbols-outlined text-[17px]">receipt_long</span>
              <span>View Orders ({pendingOrders.length})</span>
            </Link>
            <Link
              href={launcher.href}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition"
            >
              <span className="material-symbols-outlined text-[17px]">restaurant_menu</span>
              <span>Rates &amp; Menu</span>
            </Link>
          </div>
        </div>

        {/* Bottom Row: Clean 4-Stage Order Pipeline KPI Flow */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700 text-[18px]">view_timeline</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Today&apos;s Live Order Pipeline</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold font-mono">
                Auto-sync 4s
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Realtime Database Synchronized</span>
            </div>
          </div>

          {/* 4 Clean Pipeline Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {/* Stage 1: New Orders Pending */}
            <Link
              href="/merchant/dashboard/orders"
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition shadow-2xs group"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">New Pending</span>
                <span className="text-xl font-black text-rose-600 mt-0.5 block">{pendingOrders.length}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                ⏳
              </div>
            </Link>

            {/* Stage 2: In Kitchen / Prep */}
            <Link
              href="/merchant/dashboard/orders"
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition shadow-2xs group"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">In Prep / Packing</span>
                <span className="text-xl font-black text-blue-600 mt-0.5 block">{prepOrders.length}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                🍲
              </div>
            </Link>

            {/* Stage 3: Out for Delivery */}
            <Link
              href="/merchant/dashboard/fleet"
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition shadow-2xs group"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Out for Delivery</span>
                <span className="text-xl font-black text-teal-600 mt-0.5 block">{outForDeliveryOrders.length}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                🛵
              </div>
            </Link>

            {/* Stage 4: Delivered Today */}
            <Link
              href="/merchant/dashboard/orders"
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition shadow-2xs group"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Delivered Today</span>
                <span className="text-xl font-black text-emerald-600 mt-0.5 block">{deliveredOrders.length}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                ✅
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* OCCASION INTELLIGENCE & CONNECT CREDITS ENGINE (PLACED DIRECTLY BELOW HERO) */}
      <OccasionDashboardCard
        summary={occasionSummary}
        wallet={walletState}
        businessName={merchant.businessName}
        logoUrl={merchant.logoUrl}
      />

      {/* Urgent Incoming Orders Real Queue */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 border border-[#eaedff] shadow-xs mb-6">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${pendingOrders.length > 0 ? "bg-[#ba1a1a] animate-pulse" : "bg-slate-300"}`}
            ></span>
            <h2 className="text-base font-extrabold text-[#131b2e]">Urgent Incoming Orders Queue</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#003178] font-mono text-[11px] font-bold">
              {pendingOrders.length} Needing Acceptance
            </span>
          </div>
          <Link
            href="/merchant/dashboard/orders"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-xl bg-[#faf8ff] border border-dashed border-[#eaedff]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center mb-2.5">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <h3 className="text-sm font-bold text-[#131b2e]">Order Queue is Clear</h3>
            <p className="text-xs text-[#737783] max-w-md mx-auto mt-1">
              New customer orders from the TRUSTIT Super App and in-store QR scans will ring here with real-time sound notifications.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Link
                href="/merchant/dashboard/orders"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition"
              >
                <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                <span>Open Full KOT Console</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-[#faf8ff] p-4 border border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#003178]">#{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase">
                      Needs Prep
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#131b2e] mt-1">{order.customer_name}</h4>
                  <p className="text-xs text-[#737783]">{order.customer_phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-[#131b2e]">₹{order.total_amount}</span>
                  <Link
                    href="/merchant/dashboard/orders"
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition"
                  >
                    Accept in KOT →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {!publicLocationComplete ? (
        <section
          aria-labelledby="complete-public-location-title"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 mb-4"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Get discovered locally</p>
            <h2 id="complete-public-location-title" className="mt-1 text-lg font-bold text-slate-950">
              Complete Public Profile
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Complete your public location to appear in Trustit local search. This does not affect your QR or review features.
            </p>
          </div>
          <Link
            href="/merchant/dashboard/business#public-discovery-location"
            className="inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
          >
            Complete Location
          </Link>
        </section>
      ) : null}

      {/* Category-Adaptive Operational Launch Banner */}
      <section
        className={`relative overflow-hidden rounded-3xl border ${launcher.borderColor} bg-gradient-to-r ${launcher.gradient} p-5 sm:p-6 mb-4 shadow-sm`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-xs border border-slate-100">
              {launcher.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                  {launcher.badge}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Operational Console
                </span>
              </div>
              <h2 className="mt-1 text-base font-extrabold text-slate-900 sm:text-lg">{launcher.title}</h2>
              <p className="mt-0.5 max-w-xl text-xs text-slate-600 sm:text-sm">{launcher.subtitle}</p>
            </div>
          </div>
          <Link
            href={launcher.href}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold shadow-sm transition hover:shadow-md ${launcher.btnClass}`}
          >
            <span>{launcher.cta}</span>
          </Link>
        </div>
      </section>

      {/* 4 Stat Cards - Dashboard clean terminus */}
      <section aria-label="Merchant statistics" className="merchant-stats">
        <StatCard
          tone="green"
          icon="qr"
          label="Total Scans"
          value={stats ? count(stats.total_scans).toLocaleString("en-IN") : "—"}
          detail="All-time QR scans"
        />
        <StatCard
          tone="amber"
          icon="bars"
          label="This Month’s Scans"
          value={stats ? count(stats.this_month_scans).toLocaleString("en-IN") : "—"}
          detail="Current month activity"
        />
        <StatCard
          tone="rose"
          icon="star"
          label="Total Reviews"
          value={stats ? totalReviews.toLocaleString("en-IN") : "—"}
          detail={totalReviews === 0 ? "No reviews yet" : "Customer feedback"}
        />
        <StatCard
          tone="violet"
          icon="star"
          label="Average Rating"
          value={average !== null && Number.isFinite(average) ? `${average.toFixed(1)} / 5` : "— / 5"}
          detail={totalReviews === 0 ? "Waiting for first review" : "Customer rating"}
        />
      </section>
    </div>
  );
}
