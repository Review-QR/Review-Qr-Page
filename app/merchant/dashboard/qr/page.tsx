import { requireActiveMerchant } from "@/lib/merchant-auth";
import MyQrCode from "../my-qr-code";

export const dynamic = "force-dynamic";

export default async function MerchantQrPage() {
  const merchant = await requireActiveMerchant();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Customer sharing</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">My QR Code</h1>
      </header>
      <MyQrCode
        businessId={merchant.businessId}
        businessName={merchant.businessName}
        qrStatus={merchant.qrStatus}
        expiry={merchant.expiry}
        reviewLink={merchant.reviewLink}
      />
    </div>
  );
}
