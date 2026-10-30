import Link from "next/link";
import LogoutButton from "../logout-button";
import {
  createSupabaseServerClient,
  requireActiveAdmin,
} from "../../lib/supabase-server";
import type { Business } from "../../lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getStatusClass(status: Business["status"]) {
  const normalizedStatus = String(status ?? "").toLowerCase();
  if (normalizedStatus === "active") return "status-pill--active";
  if (normalizedStatus === "expired") return "status-pill--expired";
  return "status-pill--pending";
}

function getPlanClass(plan: Business["plan"]) {
  const normalizedPlan = String(plan ?? "").toLowerCase();
  if (normalizedPlan === "basic") return "plan-tag--basic";
  if (normalizedPlan === "standard") return "plan-tag--standard";
  if (normalizedPlan === "premium") return "plan-tag--premium";
  return "plan-tag--default";
}

export default async function HomePage() {
  await requireActiveAdmin();

  let businesses: Business[] = [];
  let errorMessage = "";

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    businesses = data ?? [];
  } catch {
    errorMessage = "Unable to load business data. Please try again later.";
  }

  let activeHyperlocalCount = 0;
  let disputedHyperlocalCount = 0;

  try {
    const supabase = await createSupabaseServerClient();
    const { count: activeCount } = await supabase
      .from("hyperlocal_orders")
      .select("*", { count: "exact", head: true })
      .in("status", [
        "placed",
        "accepted_by_merchant",
        "preparing",
        "ready_for_pickup",
        "rider_assigned",
        "picked_up",
        "out_for_delivery",
        "arrived_at_doorstep",
      ]);
    activeHyperlocalCount = activeCount || 0;

    const { count: dispCount } = await supabase
      .from("hyperlocal_orders")
      .select("*", { count: "exact", head: true })
      .not("dispute_status", "in", '("none","resolved")');
    disputedHyperlocalCount = dispCount || 0;
  } catch {
    // Graceful fallback
  }

  const today = new Date().toISOString().slice(0, 10);

  const totalBusinesses = businesses.length;

  const activeBusinesses = businesses.filter(
    (business) =>
      ["active", "expiring soon"].includes(
        String(business.status ?? "").trim().toLowerCase()
      ) &&
      (!business.expiry || business.expiry >= today)
  ).length;

  const expiredBusinesses = businesses.filter(
    (business) => {
      const status = String(business.status ?? "").trim().toLowerCase();
      return status === "expired" || (status !== "suspended" && Boolean(business.expiry && business.expiry < today));
    }
  ).length;

  const suspendedBusinesses = businesses.filter(
    (business) =>
      String(business.status ?? "").trim().toLowerCase() === "suspended"
  ).length;

  const activeQrCodes = businesses.filter(
    (business) =>
      String(business.qr_status ?? "").toLowerCase() === "active" &&
      (!business.expiry || business.expiry >= today)
  ).length;

  const totalScans = businesses.reduce(
    (total, business) => total + (business.scans ?? 0),
    0
  );

  const basicCount = businesses.filter(
    (business) => String(business.plan ?? "").toLowerCase() === "basic"
  ).length;

  const standardCount = businesses.filter(
    (business) => String(business.plan ?? "").toLowerCase() === "standard"
  ).length;

  const premiumCount = businesses.filter(
    (business) => String(business.plan ?? "").toLowerCase() === "premium"
  ).length;

  const recentBusinesses = [...businesses]
    .sort((a, b) => {
      const dateA = a.created_at ?? a.created ?? "";
      const dateB = b.created_at ?? b.created ?? "";

      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  const stats = [
    {
      label: "Total Businesses",
      value: totalBusinesses,
      tone: "blue",
      icon: "▦",
    },
    {
      label: "Active Businesses",
      value: activeBusinesses,
      tone: "green",
      icon: "✓",
    },
    {
      label: "Expired Businesses",
      value: expiredBusinesses,
      tone: "red",
      icon: "◷",
    },
    {
      label: "Suspended Businesses",
      value: suspendedBusinesses,
      tone: "red",
      icon: "⊘",
    },
    {
      label: "Active QR Codes",
      value: activeQrCodes,
      tone: "purple",
      icon: "⌗",
    },
    {
      label: "Total QR Scans",
      value: totalScans.toLocaleString("en-IN"),
      tone: "orange",
      icon: "↗",
    },
    {
      label: "Hyperlocal Running Orders",
      value: activeHyperlocalCount,
      tone: "orange",
      icon: "🛵",
    },
  ];

  const plans = [
    { name: "Basic", count: basicCount, tone: "basic" },
    { name: "Standard", count: standardCount, tone: "standard" },
    { name: "Premium", count: premiumCount, tone: "premium" },
  ];

  const actions = [
    {
      href: "/admin/hyperlocal",
      title: "⚡ Live Delivery Command Center",
      description: "Running orders, OTP audit, disputes & doorstep refusal cancellation",
      tone: "orange",
      icon: "🛵",
    },
    {
      href: "/businesses",
      title: "Add / Manage Business",
      description: "Manage business profiles and plans",
      tone: "blue",
      icon: "＋",
    },
    {
      href: "/qr-codes",
      title: "QR Codes",
      description: "View and manage QR codes",
      tone: "purple",
      icon: "⌗",
    },
    {
      href: "/admin/orders",
      title: "Physical QR Orders",
      description: "Manage standees, printing, QC, and shipments",
      tone: "purple",
      icon: "📦",
    },
    {
      href: "/merchants",
      title: "Merchants",
      description: "Manage merchant accounts and access",
      tone: "blue",
      icon: "♙",
    },
    {
      href: "/payments",
      title: "Payments",
      description: "Review payment activity",
      tone: "green",
      icon: "$",
    },
    {
      href: "/analytics",
      title: "Analytics",
      description: "Explore scans and performance",
      tone: "orange",
      icon: "↗",
    },
  ];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark" aria-hidden="true">QR</div>
          <div>
            <p className="brand-kicker">Review-QR · ADMIN</p>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">QR review management platform</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          <span className="workspace-badge"><span />Admin workspace</span>
          <div className="logout-control"><LogoutButton /></div>
        </div>
      </header>

      {errorMessage && (
        <div className="dashboard-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">!</span>
          <div>
            <strong>Supabase data load failed</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <section className="stats-grid" aria-label="Business statistics">
        {stats.map((stat) => (
          <article className={`stat-card stat-card--${stat.tone}`} key={stat.label}>
            <div className="stat-card-top">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
            </div>
            <strong className="stat-value">{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-panel actions-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">SHORTCUTS</p>
            <h2>Quick actions</h2>
          </div>
          <span className="section-caption">Jump to a workspace</span>
        </div>
        <div className="actions-grid">
          {actions.map((action) => (
            <Link
              href={action.href}
              className={`action-card action-card--${action.tone}`}
              key={action.href}
            >
              <span className="action-icon" aria-hidden="true">{action.icon}</span>
              <span className="action-copy">
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </span>
              <span className="action-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-panel plans-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">SUBSCRIPTIONS</p>
            <h2>Plan-wise businesses</h2>
          </div>
          <span className="section-caption">Business distribution by plan</span>
        </div>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div className={`plan-card plan-card--${plan.tone}`} key={plan.name}>
              <span className="plan-dot" />
              <div>
                <p>{plan.name}</p>
                <strong>{plan.count}</strong>
              </div>
              <span className="plan-card-caption">businesses</span>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-lower-grid">
        <section className="dashboard-panel recent-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">LATEST ACTIVITY</p>
              <h2>Recent businesses</h2>
            </div>
            <span className="count-badge">{recentBusinesses.length} recent</span>
          </div>

          {recentBusinesses.length === 0 ? (
            <p className="empty-state">
              {errorMessage
                ? "Business data could not be loaded."
                : "No businesses found in Supabase."}
            </p>
          ) : (
            <div className="business-list">
              {recentBusinesses.map((business) => (
                <article className="business-row" key={business.id}>
                  <div className="business-identity">
                    <span className="business-avatar" aria-hidden="true">
                      {getInitials(business.name || "Business")}
                    </span>
                    <div className="business-copy">
                      <strong>{business.name}</strong>
                      <span>{business.type || "Business"}</span>
                    </div>
                  </div>
                  <div className="business-meta">
                    {business.plan && (
                      <span className={`plan-tag ${getPlanClass(business.plan)}`}>
                        {business.plan}
                      </span>
                    )}
                    <span className={`status-pill ${getStatusClass(business.status)}`}>
                      <span />{business.status || "pending"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          {/* ── HYPERLOCAL SUPER-APP & DELIVERY COMMAND CENTER CARD ── */}
          <section className="dashboard-panel hyperlocal-panel border-2 border-amber-400/50 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-5 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">LIVE OPERATIONS</p>
                <h2 className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                  <span>🛵</span> Hyperlocal Command Center
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Live Control
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Food delivery, kirana parcha orders, doorstep refusal disputes, 4-digit OTP audit &amp; rider instant payouts in Bahraich.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Running Orders</span>
                <span className="text-xl font-black text-emerald-400">{activeHyperlocalCount}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Disputes / Refusals</span>
                <span className={`text-xl font-black ${disputedHyperlocalCount > 0 ? "text-rose-400 animate-pulse" : "text-slate-300"}`}>
                  {disputedHyperlocalCount}
                </span>
              </div>
            </div>

            <Link
              href="/admin/hyperlocal"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 py-3 text-xs font-black text-slate-950 shadow-md hover:from-amber-300 hover:to-amber-300 transition"
            >
              <span>⚡ Open Live Delivery Command Center</span>
              <span>→</span>
            </Link>
          </section>

          {/* System Status Panel */}
          <section className="dashboard-panel system-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">HEALTH</p>
                <h2>System status</h2>
              </div>
              <span className="system-live"><span />Live</span>
            </div>
            <div className="system-list">
              <div className="system-row"><span className="system-indicator system-indicator--green" /><span>Next.js Foundation</span><strong>Ready</strong></div>
              <div className="system-row"><span className={`system-indicator ${errorMessage ? "system-indicator--red" : "system-indicator--green"}`} /><span>Supabase Database</span><strong>{errorMessage ? "Error" : "Connected"}</strong></div>
              <div className="system-row"><span className="system-indicator system-indicator--green" /><span>Authentication</span><strong>Connected</strong></div>
              <div className="system-row"><span className="system-indicator system-indicator--green" /><span>QR Engine</span><strong>Connected</strong></div>
              <div className="system-row"><span className="system-indicator system-indicator--yellow" /><span>Cashfree Payments</span><strong>Next stage</strong></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
