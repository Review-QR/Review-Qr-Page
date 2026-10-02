"use client";

import { useState } from "react";
import MyQrCode from "./my-qr-code";
import QrTemplateGallery from "./qr/qr-template-gallery";
import { isQrTemplateId, qrTemplates, type QrTemplateId } from "./qr/templates";

export default function MerchantDashboardQr({
  businessId,
  businessName,
  businessType,
  qrStatus,
  expiry,
  reviewLink,
  plan,
  totalScans,
  initialTemplate,
}: {
  businessId: string;
  businessName: string;
  businessType: string | null;
  qrStatus: string | null;
  expiry: string | null;
  reviewLink: string | null;
  plan: string | null;
  totalScans: number;
  initialTemplate: string;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<QrTemplateId>(
    isQrTemplateId(initialTemplate) ? initialTemplate : "template_1",
  );
  const template = qrTemplates.find((item) => item.id === selectedTemplate)!;

  return (
    <>
      <MyQrCode
        businessId={businessId}
        businessName={businessName}
        businessType={businessType}
        plan={plan}
        qrStatus={qrStatus}
        expiry={expiry}
        reviewLink={reviewLink}
        totalScans={totalScans}
        templateName={template.name}
        templateId={template.id}
      />
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.055)] sm:p-7" aria-label="QR template selector">
        <QrTemplateGallery
          businessId={businessId}
          businessName={businessName}
          businessType={businessType}
          qrStatus={qrStatus}
          expiry={expiry}
          initialTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
        />
      </section>
    </>
  );
}
