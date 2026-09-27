import { createSupabaseServerClient, requireActiveAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type BusinessRecord = {
  id: string;
  name: string | null;
  type: string | null;
  plan: string | null;
  status: string | null;
  qr_status: string | null;
  expiry: string | null;
  scans: number | null;
};

type PaymentRecord = {
  business_id: string;
  cashfree_order_id: string;
  plan: string;
  amount: number | string;
  currency: string;
  payment_status: string;
  created_at: string;
  applied_at: string | null;
};

const PLANS = ["Basic", "Standard", "Premium"] as const;

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function numericValue(value: number | string | null | undefined) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function indiaMonth(value: Date) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return `${year}-${month}`;
}

function isCurrentIndiaMonth(value: string | null, currentMonth: string) {
  if (!value) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && indiaMonth(date) === currentMonth;
}

function paymentStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "applied":
      return "bg-emerald-100 text-emerald-700";
    case "failed":
    case "verification_error":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "green" | "red" | "purple" | "orange";
}) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon" aria-hidden="true">
          {tone === "green" ? "✓" : tone === "red" ? "◷" : tone === "purple" ? "⌗" : tone === "orange" ? "₹" : "▦"}
        </span>
      </div>
      <strong className="stat-value">{value}</strong>
    </article>
  );
}

function HorizontalBarChart({
  title,
  description,
  items,
  formatValue,
}: {
  title: string;
  description: string;
  items: { label: string; value: number }[];
  formatValue: (value: number) => string;
}) {
  const maximum = Math.max(0, ...items.map((item) => item.value));

  return (
    <section className="dashboard-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">BREAKDOWN</p>
          <h2>{title}</h2>
        </div>
      </div>
      <p className="mb-5 -mt-3 text-xs text-slate-500">{description}</p>
      {maximum === 0 ? (
        <p className="empty-state">No data available for this chart.</p>
      ) : (
        <div className="space-y-4" role="list" aria-label={title}>
          {items.map((item) => {
            const width = maximum > 0 ? (item.value / maximum) * 100 : 0;
            return (
              <div key={item.label} role="listitem">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-500">
                    {formatValue(item.value)}
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={item.label}
                  aria-valuemin={0}
                  aria-valuemax={maximum}
                  aria-valuenow={item.value}
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PaymentDataUnavailable() {
  return (
    <div className="dashboard-alert" role="alert">
      <span className="alert-icon" aria-hidden="true">!</span>
      <div>
        <strong>Payment analytics unavailable</strong>
        <p>Payment records could not be loaded. Please refresh and try again.</p>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  await requireActiveAdmin();

  let businesses: BusinessRecord[] = [];
  let payments: PaymentRecord[] = [];
  let businessesFailed = false;
  let paymentsFailed = false;

  try {
    const supabase = await createSupabaseServerClient();
    const [businessResult, paymentResult] = await Promise.all([
      supabase
        .from("businesses")
        .select("id, name, type, plan, status, qr_status, expiry, scans")
        .order("name", { ascending: true }),
      supabase
        .from("payment_records")
        .select(
          "business_id, cashfree_order_id, plan, amount, currency, payment_status, created_at, applied_at",
        )
        .order("created_at", { ascending: false }),
    ]);

    if (businessResult.error) businessesFailed = true;
    else businesses = (businessResult.data ?? []) as BusinessRecord[];

    if (paymentResult.error) paymentsFailed = true;
    else payments = (paymentResult.data ?? []) as PaymentRecord[];
  } catch {
    businessesFailed = true;
    paymentsFailed = true;
  }

  const today = new Date().toISOString().slice(0, 10);
  const isSuspended = (business: BusinessRecord) =>
    normalized(business.status) === "suspended";
  const isExpired = (business: BusinessRecord) =>
    normalized(business.status) === "expired" ||
    (!isSuspended(business) && Boolean(business.expiry && business.expiry < today));
  const isActive = (business: BusinessRecord) =>
    ["active", "expiring soon"].includes(normalized(business.status)) &&
    (!business.expiry || business.expiry >= today);
  const isQrActive = (business: BusinessRecord) =>
    normalized(business.qr_status) === "active" &&
    (!business.expiry || business.expiry >= today);

  const activeBusinesses = businesses.filter(isActive).length;
  const expiredBusinesses = businesses.filter(isExpired).length;
  const suspendedBusinesses = businesses.filter(isSuspended).length;
  const activeQrCodes = businesses.filter(isQrActive).length;
  const totalScans = businesses.reduce(
    (total, business) => total + numericValue(business.scans),
    0,
  );

  const appliedPayments = payments.filter(
    (payment) => payment.payment_status === "applied",
  );
  const appliedRevenue = appliedPayments.reduce(
    (total, payment) => total + numericValue(payment.amount),
    0,
  );
  const currentMonth = indiaMonth(new Date());
  const appliedRevenueThisMonth = appliedPayments
    .filter((payment) => isCurrentIndiaMonth(payment.applied_at, currentMonth))
    .reduce((total, payment) => total + numericValue(payment.amount), 0);

  const planCounts = PLANS.map((plan) => ({
    label: plan,
    value: businesses.filter((business) => normalized(business.plan) === plan.toLowerCase()).length,
  }));
  const statusCounts = [
    { label: "Active", value: activeBusinesses },
    { label: "Expired", value: expiredBusinesses },
    { label: "Suspended", value: suspendedBusinesses },
    {
      label: "Other",
      value: Math.max(
        0,
        businesses.length - activeBusinesses - expiredBusinesses - suspendedBusinesses,
      ),
    },
  ];
  const businessTypeCounts = [...businesses.reduce((counts, business) => {
    const label = business.type?.trim() || "Unspecified";
    counts.set(label, (counts.get(label) ?? 0) + 1);
    return counts;
  }, new Map<string, number>())]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  const planPaymentStats = PLANS.map((plan) => {
    const matchingPayments = appliedPayments.filter((payment) => payment.plan === plan);
    return {
      label: plan,
      count: matchingPayments.length,
      revenue: matchingPayments.reduce(
        (total, payment) => total + numericValue(payment.amount),
        0,
      ),
    };
  });
  const appliedPaymentsByPlan = planPaymentStats.map(({ label, revenue }) => ({
    label,
    value: revenue,
  }));

  const businessNames = new Map(
    businesses.map((business) => [business.id, business.name?.trim() || business.id]),
  );
  const recentPayments = [...payments]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10);

  const summaryCards = [
    { label: "Total Businesses", value: businesses.length.toLocaleString("en-IN"), tone: "blue" as const, failed: businessesFailed },
    { label: "Active Businesses", value: activeBusinesses.toLocaleString("en-IN"), tone: "green" as const, failed: businessesFailed },
    { label: "Expired Businesses", value: expiredBusinesses.toLocaleString("en-IN"), tone: "red" as const, failed: businessesFailed },
    { label: "Suspended Businesses", value: suspendedBusinesses.toLocaleString("en-IN"), tone: "red" as const, failed: businessesFailed },
    { label: "Active QR Codes", value: activeQrCodes.toLocaleString("en-IN"), tone: "purple" as const, failed: businessesFailed },
    { label: "Total QR Scans", value: totalScans.toLocaleString("en-IN"), tone: "orange" as const, failed: businessesFailed },
    { label: "Total Applied Revenue", value: formatInr(appliedRevenue), tone: "green" as const, failed: paymentsFailed },
    { label: "Applied Revenue This Month", value: formatInr(appliedRevenueThisMonth), tone: "blue" as const, failed: paymentsFailed },
  ];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark" aria-hidden="true">↗</div>
          <div>
            <p className="brand-kicker">Review-QR · ADMIN</p>
            <h1>Analytics</h1>
            <p className="dashboard-subtitle">Business performance and applied payment reporting</p>
          </div>
        </div>
        <span className="count-badge">Live database records</span>
      </header>

      {(businessesFailed || paymentsFailed) && (
        <div className="dashboard-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">!</span>
          <div>
            <strong>Some analytics data is unavailable</strong>
            <p>Unavailable values are shown as dashes. Refresh the page to try again.</p>
          </div>
        </div>
      )}

      <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Business and revenue summary">
        {summaryCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.failed ? "—" : card.value}
            tone={card.tone}
          />
        ))}
      </section>

      <div className="mb-5 flex flex-col gap-1">
        <p className="section-kicker">BUSINESS ANALYTICS</p>
        <h2 className="text-lg font-bold text-slate-900">Business distribution</h2>
      </div>
      {businessesFailed ? (
        <div className="dashboard-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">!</span>
          <div>
            <strong>Business analytics unavailable</strong>
            <p>Business records could not be loaded. Please refresh and try again.</p>
          </div>
        </div>
      ) : (
        <section className="mb-7 grid gap-5 xl:grid-cols-2" aria-label="Business charts">
          <HorizontalBarChart
            title="Plan distribution"
            description="Businesses by current subscription plan."
            items={planCounts}
            formatValue={(value) => value.toLocaleString("en-IN")}
          />
          <HorizontalBarChart
            title="Business status"
            description="Active includes expiring-soon businesses that have not expired."
            items={statusCounts}
            formatValue={(value) => value.toLocaleString("en-IN")}
          />
          <HorizontalBarChart
            title="Business types"
            description="Distribution by the type recorded on each business profile."
            items={businessTypeCounts}
            formatValue={(value) => value.toLocaleString("en-IN")}
          />
        </section>
      )}

      <div className="mb-5 flex flex-col gap-1">
        <p className="section-kicker">PAYMENT ANALYTICS</p>
        <h2 className="text-lg font-bold text-slate-900">Applied payment performance</h2>
      </div>
      {paymentsFailed ? (
        <PaymentDataUnavailable />
      ) : (
        <section className="mb-7 grid gap-5 xl:grid-cols-2" aria-label="Payment charts">
          <section className="dashboard-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">APPLIED PAYMENTS</p>
                <h2>Payment totals</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Total applied payments</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{appliedPayments.length.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Applied revenue</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{formatInr(appliedRevenue)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">This month</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{formatInr(appliedRevenueThisMonth)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Current month is calculated in India Standard Time.</p>
          </section>
          <HorizontalBarChart
            title="Revenue by plan"
            description="Applied payment revenue only."
            items={appliedPaymentsByPlan}
            formatValue={formatInr}
          />
          <section className="dashboard-panel xl:col-span-2">
            <div className="section-heading">
              <div>
                <p className="section-kicker">PLAN PERFORMANCE</p>
                <h2>Applied payments by plan</h2>
              </div>
            </div>
            {appliedPayments.length === 0 ? (
              <p className="empty-state">No applied payments are available yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {planPaymentStats.map((plan) => (
                  <article className="rounded-xl border border-slate-200 bg-white p-4" key={plan.label}>
                    <p className="text-sm font-semibold text-slate-700">{plan.label}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {plan.count.toLocaleString("en-IN")} applied payment{plan.count === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{formatInr(plan.revenue)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      <section className="dashboard-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">RECENT ACTIVITY</p>
            <h2>Recent payments</h2>
          </div>
          <span className="count-badge">{paymentsFailed ? "—" : `${recentPayments.length} shown`}</span>
        </div>
        {paymentsFailed ? (
          <p className="empty-state">Payment records could not be loaded.</p>
        ) : recentPayments.length === 0 ? (
          <p className="empty-state">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3 font-semibold">Business</th>
                  <th className="px-3 py-3 font-semibold">Plan</th>
                  <th className="px-3 py-3 font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Cashfree Order ID</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr className="border-b border-slate-100 last:border-0" key={payment.cashfree_order_id}>
                    <td className="px-3 py-4 font-medium text-slate-800">
                      {businessNames.get(payment.business_id) ?? payment.business_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-700">{payment.plan}</td>
                    <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                      {formatInr(numericValue(payment.amount))} <span className="text-xs text-slate-500">{payment.currency}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatusClass(payment.payment_status)}`}>
                        {payment.payment_status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-600">{formatDate(payment.created_at)}</td>
                    <td className="px-3 py-4 font-mono text-xs text-slate-600">
                      <span className="break-all">{payment.cashfree_order_id}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-4 text-xs text-slate-500">
        Total QR scans are cumulative counters. Historical daily or monthly scan trends are not available from the current data.
      </p>
    </main>
  );
}
