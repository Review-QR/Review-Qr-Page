import Link from "next/link";
import LogoutButton from "@/app/logout-button";
import { createSupabaseServerClient, requireActiveAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

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

type BusinessRecord = { id: string; name: string | null };

const PLAN_NAMES = ["Basic", "Standard", "Premium"] as const;

function numericAmount(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
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

function isInCurrentUtcMonth(value: string | null, now: Date) {
  if (!value) return false;
  const date = new Date(value);
  return (
    Number.isFinite(date.getTime()) &&
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth()
  );
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

export default async function PaymentsPage() {
  await requireActiveAdmin();

  let records: PaymentRecord[] = [];
  let businessNames = new Map<string, string>();
  let recordsFailed = false;
  let businessesFailed = false;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("payment_records")
      .select(
        "business_id, cashfree_order_id, plan, amount, currency, payment_status, created_at, applied_at",
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    records = (data ?? []) as PaymentRecord[];

    const businessIds = [...new Set(records.map((record) => record.business_id))];
    if (businessIds.length > 0) {
      const { data: businesses, error: businessError } = await supabase
        .from("businesses")
        .select("id, name")
        .in("id", businessIds);

      if (businessError) {
        businessesFailed = true;
      } else {
        businessNames = new Map(
          ((businesses ?? []) as BusinessRecord[]).map((business) => [
            business.id,
            business.name?.trim() || business.id,
          ]),
        );
      }
    }
  } catch {
    recordsFailed = true;
  }

  const appliedRecords = records.filter(
    (record) => record.payment_status === "applied",
  );
  const totalRevenue = appliedRecords.reduce(
    (total, record) => total + numericAmount(record.amount),
    0,
  );
  const now = new Date();
  const currentMonthRevenue = appliedRecords
    .filter((record) => isInCurrentUtcMonth(record.applied_at, now))
    .reduce((total, record) => total + numericAmount(record.amount), 0);

  const planSummaries = PLAN_NAMES.map((plan) => {
    const planPayments = appliedRecords.filter((record) => record.plan === plan);
    return {
      plan,
      count: planPayments.length,
      revenue: planPayments.reduce(
        (total, record) => total + numericAmount(record.amount),
        0,
      ),
    };
  });

  const summaryCards = [
    { label: "Total payment records", value: recordsFailed ? "—" : records.length.toLocaleString("en-IN"), tone: "blue" },
    { label: "Applied payments", value: recordsFailed ? "—" : appliedRecords.length.toLocaleString("en-IN"), tone: "green" },
    { label: "Applied revenue", value: recordsFailed ? "—" : formatInr(totalRevenue), tone: "purple" },
    { label: "Applied revenue this month", value: recordsFailed ? "—" : formatInr(currentMonthRevenue), tone: "orange" },
  ];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark" aria-hidden="true">₹</div>
          <div>
            <p className="brand-kicker">Review-QR · ADMIN</p>
            <h1>Payments</h1>
            <p className="dashboard-subtitle">Payment records and applied revenue</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/admin">
            Dashboard
          </Link>
          <div className="logout-control"><LogoutButton /></div>
        </div>
      </header>

      {recordsFailed && (
        <div className="dashboard-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">!</span>
          <div>
            <strong>Payment data is unavailable</strong>
            <p>Please refresh the page or try again later.</p>
          </div>
        </div>
      )}
      {!recordsFailed && businessesFailed && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          Business names are temporarily unavailable. Business IDs are shown instead.
        </p>
      )}

      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Payment summary">
        {summaryCards.map((card) => (
          <article className={`stat-card stat-card--${card.tone}`} key={card.label}>
            <div className="stat-card-top">
              <span className="stat-label">{card.label}</span>
              <span className="stat-icon" aria-hidden="true">₹</span>
            </div>
            <strong className="stat-value">{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-panel mb-5">
        <div className="section-heading">
          <div>
            <p className="section-kicker">APPLIED PAYMENTS</p>
            <h2>Plan-wise summary</h2>
          </div>
          <span className="section-caption">Revenue includes applied payments only</span>
        </div>
        {recordsFailed ? (
          <p className="empty-state">Plan summaries are temporarily unavailable.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {planSummaries.map((summary) => (
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={summary.plan}>
                <p className="text-sm font-semibold text-slate-700">{summary.plan}</p>
                <p className="mt-2 text-xs text-slate-500">{summary.count.toLocaleString("en-IN")} applied payment{summary.count === 1 ? "" : "s"}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{formatInr(summary.revenue)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">PAYMENT ACTIVITY</p>
            <h2>All payment records</h2>
          </div>
          <span className="count-badge">{recordsFailed ? "—" : records.length.toLocaleString("en-IN")} records</span>
        </div>

        {recordsFailed ? (
          <p className="empty-state">Payment records could not be loaded.</p>
        ) : records.length === 0 ? (
          <p className="empty-state">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3 font-semibold">Business</th>
                  <th className="px-3 py-3 font-semibold">Business ID</th>
                  <th className="px-3 py-3 font-semibold">Plan</th>
                  <th className="px-3 py-3 font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Cashfree order ID</th>
                  <th className="px-3 py-3 font-semibold">Created</th>
                  <th className="px-3 py-3 font-semibold">Applied</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr className="border-b border-slate-100 last:border-0" key={record.cashfree_order_id}>
                    <td className="px-3 py-4 font-medium text-slate-800">
                      {businessNames.get(record.business_id) ?? record.business_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 font-mono text-xs text-slate-600">{record.business_id}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-700">{record.plan}</td>
                    <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                      {formatInr(numericAmount(record.amount))} <span className="text-xs text-slate-500">{record.currency}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatusClass(record.payment_status)}`}>
                        {record.payment_status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-4 font-mono text-xs text-slate-600"><span className="break-all">{record.cashfree_order_id}</span></td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-600">{formatDate(record.created_at)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-600">{formatDate(record.applied_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
