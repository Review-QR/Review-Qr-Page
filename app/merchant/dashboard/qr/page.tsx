import { requireActiveMerchant } from "@/lib/merchant-auth";
import MyQrCode from "../my-qr-code";
import QrTemplateGallery from "./qr-template-gallery";

export const dynamic = "force-dynamic";

export default async function MerchantQrPage() {
  const merchant = await requireActiveMerchant();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Customer sharing</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">My QR Code</h1>
        <p className="mt-2 text-sm text-slate-600">{merchant.businessName} <span className="mx-1 text-slate-400">·</span> <span className="font-mono">{merchant.businessId}</span></p>
      </header>
      <MyQrCode
        businessId={merchant.businessId}
        businessName={merchant.businessName}
        businessType={merchant.businessType}
        qrStatus={merchant.qrStatus}
        expiry={merchant.expiry}
        reviewLink={merchant.reviewLink}
      />
      <QrTemplateGallery
        businessId={merchant.businessId}
        businessName={merchant.businessName}
        businessType={merchant.businessType}
        qrStatus={merchant.qrStatus}
        expiry={merchant.expiry}
        initialTemplate={merchant.qrTemplate}
      />
    </div>
  );
}
