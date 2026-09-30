import { requireActiveMerchant } from "@/lib/merchant-auth";
import PaymentHistory from "../payment-history";

export const dynamic = "force-dynamic";

export default async function MerchantPaymentsPage() {
  const merchant = await requireActiveMerchant();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Billing history</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Payments</h1>
      </header>
      <PaymentHistory businessId={merchant.businessId} />
    </div>
  );
}
