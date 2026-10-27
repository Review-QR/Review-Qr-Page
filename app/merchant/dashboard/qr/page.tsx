import { requireActiveMerchant } from "@/lib/merchant-auth";
import MyQrCode from "../my-qr-code";
import QrTemplateGallery from "./qr-template-gallery";
import { qrTemplates } from "./templates";
import { getLatestBusinessQrDesignRevision, getPersistedBusinessQrDesignAssets } from "@/lib/trustit-ai/qr-design-assets.server";
import type { QrDesignAssets } from "@/lib/trustit-ai/provider-contracts";
import { getQrBusinessCategoryConfig } from "@/lib/business-category-admin.server";

export const dynamic = "force-dynamic";

export default async function MerchantQrPage() {
  const merchant = await requireActiveMerchant();
  const categoryConfig = await getQrBusinessCategoryConfig(merchant.businessType ?? "");
  let designAssets: QrDesignAssets = {};
  let designRevision = 0;
  let designError: string | undefined;
  try {
    designRevision = await getLatestBusinessQrDesignRevision(merchant.businessId, merchant.businessType);
    designAssets = await getPersistedBusinessQrDesignAssets(merchant.businessId, merchant.businessType, designRevision);
  } catch (error) {
    console.error("Trustit QR artwork could not be loaded", error instanceof Error ? error.name : "UnknownError");
    designError = "Saved custom artwork is temporarily unavailable. Your QR code and premium built-in templates are still ready.";
  }
  const currentTemplate = qrTemplates.find((template) => template.id === merchant.qrTemplate) ?? qrTemplates[0];

  return (
    <div className="merchant-qr-page">
      <header className="merchant-page-heading">
        <div>
          <p className="merchant-page-heading__eyebrow">Customer sharing kit</p>
          <h1>My QR Code & Standees</h1>
          <p>{merchant.businessName} <span aria-hidden="true">·</span> <span className="font-mono">{merchant.businessId}</span></p>
        </div>
        <span className="merchant-page-heading__badge">● Active Merchant</span>
      </header>

      <div className="merchant-workspace">
        <MyQrCode businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} reviewLink={merchant.reviewLink} templateName={currentTemplate.name} templateId={currentTemplate.id} plan={merchant.plan} layout="standalone" designAssets={designAssets} categoryConfig={categoryConfig} initialTemplate={merchant.qrTemplate} />
      </div>

      <section className="merchant-lower-panel merchant-template-gallery-panel mt-6 hidden" id="template-gallery" aria-labelledby="template-gallery-title">
        <div className="merchant-section-heading">
          <span className="merchant-section-heading__icon" aria-hidden="true">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
          <div><h2 id="template-gallery-title">All Standee Templates (Export & Customize)</h2><p>High-resolution print-ready templates with category-matched artwork.</p></div>
        </div>
        <QrTemplateGallery businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} initialTemplate={merchant.qrTemplate} display="carousel" initialDesignAssets={designAssets} initialDesignRevision={designRevision} initialDesignError={designError} googleReviewLink={merchant.reviewLink} categoryConfig={categoryConfig} plan={merchant.plan} />
      </section>

      <section className="merchant-lower-panel merchant-qr-help mt-4">
        <div className="merchant-section-heading"><span className="merchant-section-heading__icon" aria-hidden="true">✦</span><div><h2>Share your QR everywhere customers visit</h2><p>Download the active poster, add it to your counter, or copy your link to send directly.</p></div></div>
      </section>
    </div>
  );
}
