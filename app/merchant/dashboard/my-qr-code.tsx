"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeReviewLink } from "@/lib/safe-review-link";
import { buildTrustitQrImageUrl, buildTrustitReviewUrl, trustitAppOrigin } from "@/lib/trustit-qr";
import { QrPosterPreview } from "./qr/qr-template-gallery";
import { ModernStandee, STANDEE_THEMES } from "./qr/modern-standee";
import { qrTemplates, type QrTemplateId, getQrTemplatePrintDimensions } from "./qr/templates";
import { getAllowedTemplatesCount, getTemplatesForPlan } from "@/lib/plan-rules";
import { saveQrTemplateAction } from "./qr/actions";
import type { QrDesignAssets } from "@/lib/trustit-ai/provider-contracts";
import type { UnifiedBusinessCategory } from "@/lib/business-category-catalog";

type MyQrCodeProps = {
  businessId: string;
  businessName: string;
  qrStatus: string | null;
  expiry: string | null;
  reviewLink: string | null;
  totalScans?: number;
  templateName?: string;
  templateId?: string | null;
  initialTemplate?: string | null;
  businessType?: string | null;
  plan?: string | null;
  layout?: "dashboard" | "standalone";
  designAssets?: QrDesignAssets;
  initialDesignError?: string | null;
  categoryConfig?: UnifiedBusinessCategory | null;
};

function isQrUsable(qrStatus: string | null, expiry: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    String(qrStatus ?? "").trim().toLowerCase() === "active" &&
    (!expiry || expiry >= today)
  );
}

function safeFilename(value: string) {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return cleaned || "review-qr";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
      character
    ]!
  );
}

export default function MyQrCode({
  businessId,
  businessName,
  qrStatus,
  expiry,
  reviewLink,
  totalScans,
  templateName,
  templateId = "template_1",
  initialTemplate,
  businessType = null,
  plan = null,
  layout = "dashboard",
  designAssets,
  initialDesignError,
  categoryConfig,
}: MyQrCodeProps) {
  const origin = trustitAppOrigin;
  const router = useRouter();
  const posterRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, startTransition] = useTransition();

  const usable = isQrUsable(qrStatus, expiry);
  const safeLink = safeReviewLink(reviewLink);
  const scanUrl = buildTrustitReviewUrl(origin, businessId);
  const imageUrl = buildTrustitQrImageUrl(scanUrl);

  // Template active / saved state
  const effectiveInitialTemplate = initialTemplate || templateId || "template_1";
  const [savedTemplate, setSavedTemplate] = useState<QrTemplateId>(() => {
    return qrTemplates.some((t) => t.id === effectiveInitialTemplate)
      ? (effectiveInitialTemplate as QrTemplateId)
      : "template_1";
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("trustit_active_standee_index");
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= 0 && val < STANDEE_THEMES.length) return val;
      }
    }
    const idx = qrTemplates.findIndex((t) => t.id === savedTemplate);
    return idx >= 0 ? idx : 0;
  });

  const [savedStandeeIndex, setSavedStandeeIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("trustit_active_standee_index");
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= 0 && val < STANDEE_THEMES.length) return val;
      }
    }
    const idx = qrTemplates.findIndex((t) => t.id === savedTemplate);
    return idx >= 0 ? idx : 0;
  });

  const currentStandee = STANDEE_THEMES[currentIndex] || STANDEE_THEMES[0];
  const currentTemplate = qrTemplates[currentIndex % qrTemplates.length] || qrTemplates[0];
  const currentTemplateId = currentTemplate.id;

  // Plan gating logic: Basic (2), Standard (5), Premium (8)
  const allowedTemplatesCount = getAllowedTemplatesCount(plan);

  function isTemplateUnlocked(index: number): boolean {
    return index < allowedTemplatesCount;
  }

  const isCurrentUnlocked = isTemplateUnlocked(currentIndex);
  const isCurrentSaved = currentIndex === savedStandeeIndex;

  const statusLabel = usable
    ? "Active"
    : expiry && expiry < new Date().toISOString().slice(0, 10)
      ? "Expired"
      : qrStatus?.trim() || "Status unavailable";

  function nextSlide() {
    setCurrentIndex((prev) => (prev < allowedTemplatesCount - 1 ? prev + 1 : 0));
    setMessage("");
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allowedTemplatesCount - 1));
    setMessage("");
  }

  function handleSelectTemplate(targetIdx: number) {
    setMessage("");
    startTransition(async () => {
      const dbTargetId = (qrTemplates[targetIdx % qrTemplates.length]?.id ?? "template_1") as QrTemplateId;
      const result = await saveQrTemplateAction(dbTargetId);
      if (!result.ok) {
        setMessageTone("error");
        setMessage(result.error);
        return;
      }
      setSavedTemplate(dbTargetId);
      setSavedStandeeIndex(targetIdx);
      if (typeof window !== "undefined") {
        localStorage.setItem("trustit_active_standee_index", String(targetIdx));
      }
      setMessageTone("success");
      setMessage(`${currentStandee.name} is now your active standee template.`);
    });
  }

  async function copyScanLink(successMessage = "Trustit QR link copied.") {
    setMessage("");
    if (!scanUrl) {
      setMessageTone("error");
      setMessage("The Trustit QR link is not ready yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(scanUrl);
      setMessageTone("success");
      setMessage(successMessage);
    } catch {
      setMessageTone("error");
      setMessage("Could not copy the Trustit QR link. Check your browser permissions and try again.");
    }
  }

  async function copyGoogleReviewLink() {
    setMessage("");
    if (!safeLink) {
      setMessageTone("error");
      setMessage("The Google Review link is unavailable.");
      return;
    }
    try {
      await navigator.clipboard.writeText(safeLink);
      setMessageTone("success");
      setMessage("Google Review link copied.");
    } catch {
      setMessageTone("error");
      setMessage("Could not copy the Google Review link.");
    }
  }

  async function shareQr() {
    setMessage("");
    if (!usable || !scanUrl) {
      setMessageTone("error");
      setMessage("The Trustit QR link is unavailable.");
      return;
    }
    if (typeof navigator.share !== "function") {
      await copyScanLink("Native sharing is unavailable, so the Trustit QR link was copied.");
      return;
    }
    try {
      await navigator.share({
        title: `${businessName} Review Standee`,
        text: `Open the review page for ${businessName} on Google & Trustit:`,
        url: scanUrl,
      });
      setMessageTone("success");
      setMessage("Review standee link shared.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof DOMException && error.name === "AbortError"
        ? "Sharing was cancelled."
        : "Could not share the Trustit QR link.");
    }
  }

  async function downloadFullPoster(format: "png" | "pdf") {
    setMessage("");
    if (!isCurrentUnlocked) {
      router.push("/merchant/dashboard/subscription");
      return;
    }
    if (!usable || !posterRef.current) {
      setMessageTone("error");
      setMessage("Poster is unavailable while the business QR is inactive.");
      return;
    }
    setIsExporting(true);
    setMessage(`Preparing high-resolution ${format.toUpperCase()} standee poster…`);
    try {
      const { domToPng } = await import("modern-screenshot");
      await document.fonts.ready;
      const png = await domToPng(posterRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        style: { borderRadius: "0px", boxShadow: "none" },
      });
      const dimensions = { widthIn: 4, heightIn: 6, orientation: "portrait" as const };
      const filename = `Trustit-${safeFilename(currentStandee.name)}-${safeFilename(businessName || businessId)}-Standee.${format}`;
      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: dimensions.orientation,
          unit: "in",
          format: [dimensions.widthIn, dimensions.heightIn],
          compress: true,
        });
        pdf.addImage(png, "PNG", 0, 0, dimensions.widthIn, dimensions.heightIn, undefined, "FAST");
        pdf.save(filename);
      } else {
        const link = document.createElement("a");
        link.href = png;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      setMessageTone("success");
      setMessage(`Full ${currentStandee.name} standee poster (${format.toUpperCase()}) downloaded successfully.`);
    } catch (err) {
      setMessageTone("error");
      setMessage(err instanceof Error ? err.message : "Failed to export poster.");
    } finally {
      setIsExporting(false);
    }
  }

  async function downloadQr() {
    setMessage("");
    try {
      const qrCodeModule = await import("qrcode");
      const dataUrl = await qrCodeModule.default.toDataURL(scanUrl || imageUrl, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 1000,
        color: { dark: "#000000", light: "#ffffff" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${safeFilename(businessName || businessId)}-QR-Sticker.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessageTone("success");
      setMessage("Plain QR code sticker downloaded.");
    } catch {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Unable to download this QR code.");
        const image = await response.blob();
        const objectUrl = URL.createObjectURL(image);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${safeFilename(businessName || businessId)}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        setMessageTone("success");
        setMessage("QR code downloaded.");
      } catch (error) {
        setMessageTone("error");
        setMessage(error instanceof Error ? error.message : "Failed to download QR code.");
      }
    }
  }

  async function printQr() {
    setMessage("");
    if (!usable) {
      setMessageTone("error");
      setMessage("Printing is available when this business QR is active.");
      return;
    }
    if (!isCurrentUnlocked) {
      router.push("/merchant/dashboard/subscription");
      return;
    }
    if (posterRef.current) {
      try {
        const { domToPng } = await import("modern-screenshot");
        const png = await domToPng(posterRef.current, { scale: 3, backgroundColor: "#ffffff" });
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          setMessageTone("error");
          setMessage("Allow pop-ups to print this QR standee poster.");
          return;
        }
        printWindow.document.write(`<!doctype html>
          <html><head><title>${escapeHtml(businessName || "Review QR Standee")} · ${escapeHtml(currentTemplate.name)}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; font-family: sans-serif; text-align: center; }
            img { max-width: 100%; height: auto; max-height: 94vh; object-fit: contain; }
            @media print {
              @page { size: 4in 6in; margin: 0; }
              body { padding: 0; margin: 0; }
              img { width: 100%; height: 100%; object-fit: contain; }
            }
          </style></head><body>
            <img src="${png}" alt="Standee Poster for ${escapeHtml(businessName)}" />
          </body></html>`);
        printWindow.document.close();
        const image = printWindow.document.querySelector("img");
        const startPrint = () => {
          printWindow.focus();
          printWindow.print();
        };
        if (image?.complete) setTimeout(startPrint, 350);
        else if (image) image.onload = () => setTimeout(startPrint, 350);
        setMessageTone("success");
        setMessage(`Print dialog opened for ${currentTemplate.name}.`);
        return;
      } catch {
        // fallback
      }
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setMessageTone("error");
      setMessage("Allow pop-ups to print this QR code.");
      return;
    }
    printWindow.document.write(`<!doctype html>
      <html><head><title>${escapeHtml(businessName || "Review QR")}</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 32px; color: #0f172a; font-family: Arial, sans-serif; text-align: center; }
        main { max-width: 520px; margin: 0 auto; }
        img { display: block; width: 360px; height: 360px; margin: 24px auto; }
        h1 { margin: 0 0 8px; font-size: 26px; }
        p { margin: 6px 0; color: #475569; }
        .prompt { margin-top: 24px; font-size: 18px; font-weight: 600; color: #0f172a; }
        @media print { body { padding: 0; } }
      </style></head><body><main>
        <h1>${escapeHtml(businessName || "Business")}</h1>
        <img src="${escapeHtml(imageUrl)}" alt="QR code for ${escapeHtml(businessName)}">
        <p>${escapeHtml(businessId)}</p>
        <p class="prompt">Scan to Review</p>
      </main></body></html>`);
    printWindow.document.close();
    const image = printWindow.document.querySelector("img");
    const startPrint = () => {
      printWindow.focus();
      printWindow.print();
    };
    if (image?.complete) startPrint();
    else if (image) image.onload = startPrint;
  }

  const standalone = layout === "standalone";

  return (
    <section className={`merchant-dashboard-qr${standalone ? " merchant-qr-card--standalone" : ""}`} aria-labelledby="merchant-my-qr-heading">
      <header className="merchant-qr-card__header">
        <span className="merchant-template-panel__icon" aria-hidden="true">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v2m-3 3h4v2h-2"/></svg>
        </span>
        <div>
          <p className="merchant-page-heading__eyebrow">{standalone ? "Your customer sharing kit" : "MY QR CODE & STANDEE"}</p>
          <h2 id="merchant-my-qr-heading">My QR Code &amp; Standee Posters</h2>
          <p>Slide left or right to preview all 5 standee templates. Select, download, or print your standee.</p>
        </div>
        <span className="merchant-page-heading__badge">● {statusLabel}</span>
      </header>

      {/* Template Selector Slider Strip */}
      <div className="merchant-template-slider-bar" role="tablist" aria-label="Standee templates slider">
        <div className="merchant-template-slider-track flex items-center gap-2 overflow-x-auto pb-1">
          {STANDEE_THEMES.map((theme, idx) => {
            const isSelected = idx === currentIndex;
            const isSaved = idx === savedStandeeIndex;
            return (
              <button
                key={theme.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setCurrentIndex(idx);
                  setMessage("");
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{theme.label}</span>
                <span className="text-[11px] opacity-75">({theme.name})</span>
                {isSaved && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400" title="Active Standee" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`merchant-qr-layout${standalone ? " merchant-qr-layout--standalone" : ""}`}>
        {/* Left Column: Standee Preview with Left/Right Nav Arrows & Lock Overlay */}
        <div className="merchant-qr-poster-frame">
          <div className="merchant-qr-slider-viewport">
            {/* Prev Slide Arrow */}
            <button
              type="button"
              className="merchant-slider-arrow merchant-slider-arrow--prev"
              onClick={prevSlide}
              aria-label="Previous standee template"
              title="Previous template (Slide left)"
            >
              ‹
            </button>

            {/* Poster Stage */}
            <div className="merchant-qr-poster-stage">
              {usable ? (
                <div ref={posterRef} className={`merchant-qr-poster ${!isCurrentUnlocked ? "is-poster-locked" : ""}`}>
                  <ModernStandee
                    standeeIndex={currentIndex}
                    businessName={businessName}
                    businessType={businessType}
                    qrUrl={scanUrl}
                    usable={usable}
                    compact={!standalone}
                  />

                  {/* Plan Lock Overlay */}
                  {!isCurrentUnlocked && (
                    <div className="merchant-lock-overlay" role="region" aria-label="Template locked">
                      <div className="merchant-lock-card">
                        <span className="merchant-lock-icon" aria-hidden="true">🔒</span>
                        <h3>Template Locked</h3>
                        <p>This premium standee is included in <strong>Standard &amp; Premium</strong> plans.</p>
                        <Link href="/merchant/dashboard/subscription" className="merchant-lock-cta">
                          Upgrade to Unlock (₹49)
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="merchant-qr-poster">
                  <div className="merchant-qr-unavailable">
                    <strong>QR code unavailable</strong>
                    <span>This QR is {statusLabel.toLowerCase()} and cannot be scanned right now.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Next Slide Arrow */}
            <button
              type="button"
              className="merchant-slider-arrow merchant-slider-arrow--next"
              onClick={nextSlide}
              aria-label="Next standee template"
              title="Next template (Slide right)"
            >
              ›
            </button>
          </div>

          {/* Under-poster Matching Template Pill */}
          <div className="flex justify-center mt-3">
            <span
              className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold border shadow-xs"
              style={{
                backgroundColor: currentStandee.pillBg,
                color: currentStandee.pillColor,
                borderColor: currentStandee.pillBorder,
              }}
            >
              {currentStandee.label}
            </span>
          </div>
        </div>

        {/* Right Column: Analytical Metric Box & Action Controls */}
        <div className="merchant-qr-details space-y-3.5">
          {/* 1. Analytical Metric Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800 text-[20px]">badge</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Standee Identity &amp; Status</h3>
                  <p className="text-[11px] text-slate-500">Live verified merchant parameters</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                ● {statusLabel}
              </span>
            </div>

            {/* 5 Column / Row Metric Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Business Name */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Business Name</span>
                <p className="mt-0.5 text-sm font-bold text-slate-900 truncate" title={businessName}>
                  {businessName}
                </p>
              </div>

              {/* Business ID */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Business ID</span>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-900">{businessId}</span>
                  <button
                    type="button"
                    onClick={() => void copyScanLink("Business QR link copied.")}
                    className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* QR Status */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">QR Status</span>
                <p className="mt-0.5 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{statusLabel}</span>
                </p>
              </div>

              {/* Current Plan */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Plan</span>
                <p className="mt-0.5 text-xs font-bold text-slate-900 capitalize">
                  {plan?.trim() || "Standard"} Plan
                </p>
              </div>

              {/* Expiry Date */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Expiry Date</span>
                <p className="mt-0.5 text-xs font-mono font-bold text-slate-900">
                  {expiry || "Active"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Active Standee Selector Pill Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {currentStandee.label} · {currentStandee.name}
              </span>
              <span className="text-[11px] text-slate-500">
                Active template shown to customers at your counter desk
              </span>
            </div>
            {isCurrentSaved ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl shrink-0">
                ✓ Active Standee
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSelectTemplate(currentIndex)}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
              >
                {isSaving ? "Saving…" : "★ Set as Active"}
              </button>
            )}
          </div>

          {/* 3. Primary Export Actions (Download PNG, PDF, Print) */}
          <div className="merchant-qr-poster-actions">
            <button
              type="button"
              className="merchant-btn-poster merchant-btn-poster--png cursor-pointer"
              onClick={() => void downloadFullPoster("png")}
              disabled={!usable || isExporting}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              <span>{isExporting ? "Exporting…" : "Download QR Standee (PNG)"}</span>
            </button>
            <button
              type="button"
              className="merchant-btn-poster merchant-btn-poster--pdf cursor-pointer"
              onClick={() => void downloadFullPoster("pdf")}
              disabled={!usable || isExporting}
              title="Download printable PDF (4 × 6 in)"
            >
              Download PDF
            </button>
          </div>

          {/* 4. Secondary Action Buttons */}
          <div className="merchant-qr-actions">
            <button type="button" onClick={() => void downloadFullPoster("png")} disabled={!usable || isExporting} className="cursor-pointer">⇩ Download QR (Full Poster)</button>
            <button type="button" onClick={() => void printQr()} disabled={!usable} className="cursor-pointer">🖨️ Print Full Standee</button>
            <button type="button" onClick={() => void shareQr()} disabled={!usable || !scanUrl} className="cursor-pointer">↗ Share Link</button>
            <button type="button" onClick={() => void copyScanLink("Business QR link copied.")} className="cursor-pointer">📋 Copy QR Link</button>
          </div>
          <div className="merchant-qr-actions merchant-qr-actions--secondary">
            <a href={scanUrl || "#"} target="_blank" rel="noreferrer" aria-disabled={!scanUrl} className={!scanUrl ? "is-disabled" : ""}>⌕ Test Scan</a>
            <Link href={standalone ? "#customer-reviews" : "/merchant/dashboard/qr"}>✦ Customer Reviews</Link>
          </div>
          <p className={`merchant-qr-message ${messageTone === "error" ? "text-rose-600" : "text-emerald-700"}`} role="status" aria-live="polite">{message}</p>
        </div>
      </div>
    </section>
  );
}
