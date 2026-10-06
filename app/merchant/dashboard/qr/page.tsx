import { requireActiveMerchant } from "@/lib/merchant-auth";
import MyQrCode from "../my-qr-code";
import QrTemplateGallery from "./qr-template-gallery";
import { qrTemplates } from "./templates";
import { getBusinessQrDesignAssets } from "@/lib/trustit-ai/qr-design-assets.server";

export const dynamic = "force-dynamic";

export default async function MerchantQrPage() {
  const merchant = await requireActiveMerchant();
  const designAssets = await getBusinessQrDesignAssets(merchant.businessId, merchant.businessType);
  const currentTemplate = qrTemplates.find((template) => template.id === merchant.qrTemplate) ?? qrTemplates[0];
  return (
    <div className="merchant-qr-page">
      <header className="merchant-page-heading">
        <div>
          <p className="merchant-page-heading__eyebrow">Customer sharing</p>
          <h1>My QR Code</h1>
          <p>{merchant.businessName} <span aria-hidden="true">·</span> <span className="font-mono">{merchant.businessId}</span></p>
        </div>
        <span className="merchant-page-heading__badge">● Active Merchant</span>
      </header>

      <div className="merchant-workspace">
        <MyQrCode businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} reviewLink={merchant.reviewLink} templateName={currentTemplate.name} templateId={currentTemplate.id} plan={merchant.plan} layout="standalone" designAssets={designAssets} />
        <section className="merchant-template-panel merchant-template-panel--compact" id="template-gallery" aria-labelledby="merchant-template-title">
          <header><span className="merchant-template-panel__icon" aria-hidden="true">✿</span><div><h2 id="merchant-template-title">Choose a QR Template</h2><p>Pick a design that matches your business style.</p></div></header>
          <QrTemplateGallery businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} initialTemplate={merchant.qrTemplate} display="dashboard" initialDesignAssets={designAssets} />
        </section>
      </div>

      <section className="merchant-lower-panel merchant-qr-help">
        <div className="merchant-section-heading"><span className="merchant-section-heading__icon" aria-hidden="true">✦</span><div><h2>Share your QR everywhere customers visit</h2><p>Download the active poster, add it to your counter, or copy your link to send directly.</p></div></div>
      </section>
    </div>
  );
}
