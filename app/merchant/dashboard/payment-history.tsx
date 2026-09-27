import "server-only";

import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

type PaymentRecord = {
  cashfree_order_id: string;
  plan: string;
  amount: number | string;
  currency: string;
  payment_status: string;
  created_at: string;
  applied_at: string | null;
};

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

function formatAmount(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
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

export default async function PaymentHistory({
  businessId,
}: {
  businessId: string;
}) {
  let records: PaymentRecord[] = [];
  let failed = false;

  try {
    const supabase = await createMerchantServerClient();
    const { data, error } = await supabase
      .from("payment_records")
      .select(
        "cashfree_order_id, plan, amount, currency, payment_status, created_at, applied_at",
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    records = (data ?? []) as PaymentRecord[];
  } catch {
    failed = true;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          PAYMENTS
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">Payment History</h2>
        <p className="mt-1 text-sm text-slate-500">
          Payments recorded for your authenticated business.
        </p>
      </div>

      {failed ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="status">
          Payment history is temporarily unavailable. Please try again later.
        </p>
      ) : records.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No payments yet. Completed payments will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3 font-semibold">Payment date</th>
                <th className="px-3 py-3 font-semibold">Order ID</th>
                <th className="px-3 py-3 font-semibold">Plan</th>
                <th className="px-3 py-3 font-semibold">Amount</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Applied date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  className="border-b border-slate-100 last:border-0"
                  key={record.cashfree_order_id}
                >
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                    {formatDate(record.created_at)}
                  </td>
                  <td className="px-3 py-4 font-mono text-xs text-slate-600">
                    <span className="break-all">{record.cashfree_order_id}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                    {record.plan}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                    {formatAmount(record.amount)} <span className="text-xs text-slate-500">{record.currency}</span>
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatusClass(record.payment_status)}`}>
                      {record.payment_status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                    {formatDate(record.applied_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
