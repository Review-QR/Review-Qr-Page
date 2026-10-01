"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { buildTrustitQrImageUrl, buildTrustitReviewUrl } from "@/lib/trustit-qr";
import { saveQrTemplateAction } from "./actions";
import { qrTemplates, type QrTemplateId } from "./templates";

type Props = {
  businessId: string;
  businessName: string;
  qrStatus: string | null;
  expiry: string | null;
  initialTemplate: string;
};

function TrustitMark({ templateId }: { templateId: QrTemplateId }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 shrink-0">
      {templateId === "template_1" && <><circle cx="20" cy="20" r="17" fill="currentColor" opacity=".13" /><path {...common} d="m11 20 6 6 12-13" /></>}
      {templateId === "template_2" && <><path d="M20 36C8 29 7 16 20 5c13 11 12 24 0 31Z" fill="currentColor" opacity=".16" /><path {...common} d="M13 27c6-2 10-7 13-14M17 21l-1-7m5 3 7 1" /></>}
      {templateId === "template_3" && <><path d="M20 2 24 13 36 9 31 20 39 28 27 29 24 39 18 30 7 35 11 24 2 17 14 16Z" fill="currentColor" opacity=".18" /><path {...common} d="m14 20 4 4 8-9" /></>}
      {templateId === "template_4" && <><path d="M20 2 36 11v18L20 38 4 29V11Z" fill="currentColor" opacity=".16" /><path {...common} d="m11 20 6 6 12-13M8 11l4-2m16 22 4-2" /></>}
      {templateId === "template_5" && <><path d="M20 2 38 20 20 38 2 20Z" fill="currentColor" opacity=".13" /><path {...common} d="M13 21c1-6 13-6 14 0M14 24c2 8 10 8 12 0m-6-10v19" /></>}
    </svg>
  );
}

function merchantInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "B";
}

function Poster({
  templateId,
  businessName,
  businessId,
  qrUrl,
  qrUsable,
  compact = false,
}: {
  templateId: QrTemplateId;
  businessName: string;
  businessId: string;
  qrUrl: string;
  qrUsable: boolean;
  compact?: boolean;
}) {
  const template = qrTemplates.find((item) => item.id === templateId)!;
  const qrSize = compact ? "h-32 w-32" : "h-64 w-64 sm:h-72 sm:w-72";
  return (
    <article className={`relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-[1.6rem] border ${template.border} ${template.surface} p-5 text-center shadow-inner ${compact ? "min-h-[340px] p-4" : "min-h-[570px] p-7 sm:p-9"}`}>
      {templateId === "template_2" && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#8b6541_0_18px,#a77d53_18px_36px)] opacity-60" />}
      {templateId === "template_4" && <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[1.2rem] border border-dashed border-slate-500/60" />}
      {templateId === "template_5" && <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[1.2rem] border border-[#dbc58e]/70" />}
      <header className={`relative z-10 flex items-center justify-center gap-2 ${compact ? "mb-3" : "mb-6"} ${template.accent}`}>
        <TrustitMark templateId={templateId} />
        <span className={`${compact ? "text-lg" : "text-2xl"} font-black tracking-[0.12em]`}>TRUSTIT</span>
      </header>
      <div className="relative z-10 flex flex-1 flex-col items-center">
        <div className={`mb-2 flex items-center justify-center rounded-full ${template.badge} ${compact ? "h-9 w-9 text-sm" : "h-12 w-12 text-lg"}`} aria-label={`${businessName} logo placeholder`}>
          <span className="font-bold">{merchantInitials(businessName)}</span>
        </div>
        <p className={`${compact ? "text-[10px]" : "text-xs"} font-semibold uppercase tracking-[0.16em] ${template.body}`}>A note for {businessName}</p>
        <h3 className={`mt-1 line-clamp-2 max-w-full break-words font-bold leading-tight ${template.heading} ${compact ? "text-lg" : "text-2xl sm:text-3xl"}`}>{businessName}</h3>
        <div className={`mt-2 font-bold tracking-[0.12em] text-amber-500 ${compact ? "text-sm" : "text-xl"}`} aria-label="Five stars">★★★★★</div>
        <p className={`mt-1 max-w-[24rem] ${template.body} ${compact ? "text-xs" : "text-base"}`}>Enjoyed your visit? Share your honest experience.</p>
        <div className={`my-4 flex items-center justify-center rounded-2xl p-2 shadow-sm ring-1 ring-black/5 ${template.qrPlate} ${compact ? "my-3" : "my-5"}`}>
          {qrUsable && qrUrl ? (
            <img src={qrUrl} alt={`Trustit review QR for ${businessName}`} className={`${qrSize} max-w-full object-contain`} />
          ) : (
            <div className={`${qrSize} flex items-center justify-center bg-slate-100 p-4 text-center text-xs font-medium text-slate-600`}>QR unavailable while this business is inactive or expired</div>
          )}
        </div>
        <p className={`mt-auto rounded-full px-4 py-2 font-bold ${template.button} ${compact ? "text-xs" : "text-sm"}`}>SCAN TO SHARE YOUR REVIEW</p>
        <p className={`mt-3 max-w-[25rem] ${template.body} ${compact ? "text-[9px]" : "text-xs"}`}>You can also share your feedback on Google after your Trustit review.</p>
        <p className={`mt-2 font-mono ${template.body} ${compact ? "text-[9px]" : "text-[11px]"}`}>{businessId}</p>
      </div>
    </article>
  );
}

function isQrUsable(status: string | null, expiry: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return status?.trim().toLowerCase() === "active" && (!expiry || expiry >= today);
}

export default function QrTemplateGallery({
  businessId,
  businessName,
  qrStatus,
  expiry,
  initialTemplate,
}: Props) {
  const [origin, setOrigin] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<QrTemplateId>(
    qrTemplates.some((template) => template.id === initialTemplate)
      ? initialTemplate as QrTemplateId
      : "template_1",
  );
  const [previewTemplate, setPreviewTemplate] = useState<QrTemplateId | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const galleryRef = useRef<HTMLDivElement>(null);
  const reviewRoute = buildTrustitReviewUrl(origin, businessId);
  const qrUrl = buildTrustitQrImageUrl(reviewRoute);
  const qrUsable = isQrUsable(qrStatus, expiry);

  useEffect(() => setOrigin(window.location.origin), []);

  function chooseTemplate(templateId: QrTemplateId) {
    setStatusMessage("");
    startTransition(async () => {
      const result = await saveQrTemplateAction(templateId);
      if (!result.ok) {
        setStatusMessage(result.error);
        return;
      }
      setSelectedTemplate(templateId);
      setStatusMessage("QR design saved for this business.");
    });
  }

  function scrollGallery(direction: -1 | 1) {
    galleryRef.current?.scrollBy({ left: direction * Math.max(260, galleryRef.current.clientWidth * 0.75), behavior: "smooth" });
  }

  return (
    <section aria-labelledby="qr-template-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Make it yours</p>
          <h2 id="qr-template-heading" className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Choose Your QR Template</h2>
          <p className="mt-1 text-sm text-slate-600">Every design uses the same QR and opens this business’s Trustit review page.</p>
        </div>
        <div className="hidden gap-2 sm:flex" aria-label="Template gallery controls">
          <button type="button" onClick={() => scrollGallery(-1)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" aria-label="Scroll templates left">←</button>
          <button type="button" onClick={() => scrollGallery(1)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" aria-label="Scroll templates right">→</button>
        </div>
      </div>

      <div ref={galleryRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]" aria-label="Trustit QR template gallery">
        {qrTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          return (
            <article key={template.id} className={`w-[min(84vw,290px)] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-4rem)/5)] ${isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}>
              <div className="relative">
                <Poster templateId={template.id} businessName={businessName} businessId={businessId} qrUrl={qrUrl} qrUsable={qrUsable} compact />
                {isSelected && <span className="absolute right-2 top-2 rounded-full bg-blue-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">Current</span>}
              </div>
              <div className="px-1 pb-1 pt-3">
                <h3 className="font-semibold text-slate-900">{template.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{template.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPreviewTemplate(template.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Preview</button>
                  <button type="button" onClick={() => chooseTemplate(template.id)} disabled={isPending || isSelected} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-default disabled:opacity-60">{isSelected ? "Selected" : isPending ? "Saving…" : "Select"}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${statusMessage.includes("could not") || statusMessage.startsWith("Sign in") || statusMessage.startsWith("Choose") ? "text-rose-700" : "text-emerald-700"}`}>{statusMessage}</p>

      {previewTemplate && (
        <div role="presentation" onClick={() => setPreviewTemplate(null)} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
          <section role="dialog" aria-modal="true" aria-labelledby="qr-preview-title" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape") setPreviewTemplate(null); }} tabIndex={-1} className="my-auto w-full max-w-xl rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Merchant-specific preview</p><h2 id="qr-preview-title" className="mt-1 text-lg font-bold text-slate-950">{qrTemplates.find((template) => template.id === previewTemplate)?.name}</h2></div>
              <button type="button" onClick={() => setPreviewTemplate(null)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" aria-label="Close template preview">Close</button>
            </div>
            <div className="mx-auto max-w-md"><Poster templateId={previewTemplate} businessName={businessName} businessId={businessId} qrUrl={qrUrl} qrUsable={qrUsable} /></div>
            <button type="button" onClick={() => { chooseTemplate(previewTemplate); setPreviewTemplate(null); }} disabled={isPending || selectedTemplate === previewTemplate} className="mt-4 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{selectedTemplate === previewTemplate ? "This is your selected design" : isPending ? "Saving…" : "Select this design"}</button>
          </section>
        </div>
      )}
    </section>
  );
}
