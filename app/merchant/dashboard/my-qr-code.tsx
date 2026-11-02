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

export type DashboardStats = {
  total_scans?: number | string;
  this_month_scans?: number | string;
  total_reviews?: number | string;
  average_rating?: number | string | null;
};

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
  stats?: DashboardStats | null;
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
  stats = null,
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
      const targetEl = (posterRef.current.querySelector(".card") as HTMLElement) || posterRef.current;
      const png = await domToPng(targetEl, {
        scale: 3,
        width: 350,
        height: 662,
        style: {
          transform: "none",
          margin: "0",
          boxShadow: "none",
        },
      });
      const filename = `Trustit-${safeFilename(currentStandee.name)}-${safeFilename(businessName || businessId)}-Standee.${format}`;
      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        // Standard 4 x 6 inch acrylic standee format requested by user
        const pdfWidthIn = 4;
        const pdfHeightIn = 6;
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "in",
          format: [pdfWidthIn, pdfHeightIn],
          compress: true,
        });
        // Standee ratio: 350 / 662 = 0.5287
        // Fit cleanly centered inside 4" x 6" with safe margins so 100% of the standee is visible
        const targetHeightIn = 5.7;
        const targetWidthIn = targetHeightIn * (350 / 662);
        const xOffset = (pdfWidthIn - targetWidthIn) / 2;
        const yOffset = (pdfHeightIn - targetHeightIn) / 2;
        pdf.addImage(png, "PNG", xOffset, yOffset, targetWidthIn, targetHeightIn, undefined, "FAST");
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
        const targetEl = (posterRef.current.querySelector(".card") as HTMLElement) || posterRef.current;
        const png = await domToPng(targetEl, {
          scale: 3,
          width: 350,
          height: 662,
          style: {
            transform: "none",
            margin: "0",
            boxShadow: "none",
          },
        });
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          setMessageTone("error");
          setMessage("Allow pop-ups to print this QR standee poster.");
          return;
        }
        printWindow.document.write(`<!doctype html>
          <html><head><title>${escapeHtml(businessName || "Review QR Standee")} · ${escapeHtml(currentStandee.name)}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            @page {
              size: 4in 6in;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-container {
              width: 4in;
              height: 6in;
              max-width: 4in;
              max-height: 6in;
              margin: 0 auto;
              padding: 0.12in 0.18in;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-inside: avoid;
              box-sizing: border-box;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              width: auto;
              height: 5.76in;
              object-fit: contain;
              display: block;
              margin: 0 auto;
              border-radius: 32px;
              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
            }
            @media screen {
              body {
                background: #f8fafc;
                min-height: 100vh;
                padding: 20px;
              }
              .print-container {
                background: #ffffff;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                border-radius: 12px;
              }
            }
            @media print {
              body {
                background: #ffffff;
                padding: 0;
              }
              .print-container {
                box-shadow: none !important;
                border-radius: 0 !important;
                background: transparent !important;
                padding: 0.12in 0.18in !important;
              }
            }
          </style></head><body>
            <div class="print-container">
              <img src="${png}" alt="Standee Poster for ${escapeHtml(businessName)}" />
            </div>
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

          {/* Under-Standee Compact Action Buttons (PNG, PDF, Print, Copy Link) */}
          <div className="w-full max-w-[340px] mt-4 px-1 mx-auto min-w-0 box-border">
            <div className="grid grid-cols-2 gap-2">
              {/* Button 1: Download PNG */}
              <button
                type="button"
                onClick={() => void downloadFullPoster("png")}
                disabled={!usable || isExporting}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                title="Download QR Standee (PNG)"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>{isExporting ? "Exporting…" : "PNG"}</span>
              </button>

              {/* Button 2: Download PDF */}
              <button
                type="button"
                onClick={() => void downloadFullPoster("pdf")}
                disabled={!usable || isExporting}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                title="Download Printable PDF (4 × 6 in)"
              >
                <svg className="w-3.5 h-3.5 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>PDF</span>
              </button>

              {/* Button 3: Print */}
              <button
                type="button"
                onClick={() => void printQr()}
                disabled={!usable}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                title="Print standee directly (4 × 6 in)"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print</span>
              </button>

              {/* Button 4: Copy Link */}
              <button
                type="button"
                onClick={() => void copyScanLink("Business review link copied.")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Copy customer review link"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy Link</span>
              </button>
            </div>

            {/* Test Scan link */}
            <div className="flex items-center justify-center pt-2.5">
              <a
                href={scanUrl ? (scanUrl.includes("?") ? `${scanUrl}&test=1` : `${scanUrl}?test=1`) : "#"}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!scanUrl}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition ${
                  !scanUrl ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                <span>Test Scan in New Tab</span>
              </a>
            </div>

            {/* Feedback notification message */}
            {message && (
              <p
                className={`text-xs text-center font-semibold mt-2.5 px-2 py-1.5 rounded-lg ${
                  messageTone === "error"
                    ? "text-rose-700 bg-rose-50 border border-rose-200"
                    : "text-emerald-800 bg-emerald-50 border border-emerald-200"
                }`}
                role="status"
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Active Standee & Status Header + 4 Stat Cards */}
        <div className="merchant-qr-details flex flex-col justify-start gap-4">
          {/* Top Status & Plan Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {currentStandee.label} · {currentStandee.name}
                </span>
                {isCurrentSaved ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Active on Desk
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(currentIndex)}
                    disabled={isSaving}
                    className="text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-full transition cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isSaving ? "Saving…" : "★ Set as Active"}
                  </button>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500">ID: {businessId}</span>
            </div>

            {/* Status & Plan Metadata Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status: <strong className="text-slate-900 font-semibold">{statusLabel}</strong></span>
              </div>
              <div>
                <span>Plan: <strong className="capitalize text-slate-900 font-semibold">{plan?.trim() || "Standard"}</strong></span>
              </div>
              <div>
                <span>Expiry: <strong className="font-mono text-slate-900 font-semibold">{expiry || "Active"}</strong></span>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards in 2×2 Grid (Total Scans, Month Scans, Total Reviews, Rating) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* Card 1: Total Scans */}
            <article className="merchant-stat merchant-stat--green">
              <span className="merchant-stat__icon">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v2m-3 3h4v2h-2" />
                </svg>
              </span>
              <div className="merchant-stat__copy">
                <p>Total Scans</p>
                <strong>{stats ? (Number(stats.total_scans) || 0).toLocaleString("en-IN") : "—"}</strong>
                <small>All-time QR scans</small>
              </div>
            </article>

            {/* Card 2: This Month's Scans */}
            <article className="merchant-stat merchant-stat--amber">
              <span className="merchant-stat__icon">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="13" width="4" height="8" rx="1" />
                  <rect x="10" y="8" width="4" height="13" rx="1" />
                  <rect x="17" y="3" width="4" height="18" rx="1" />
                </svg>
              </span>
              <div className="merchant-stat__copy">
                <p>This Month’s Scans</p>
                <strong>{stats ? (Number(stats.this_month_scans) || 0).toLocaleString("en-IN") : "—"}</strong>
                <small>Current month activity</small>
              </div>
            </article>

            {/* Card 3: Total Reviews */}
            <article className="merchant-stat merchant-stat--rose">
              <span className="merchant-stat__icon">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6-4.9-4.7 6.7-.9L12 2Z" />
                </svg>
              </span>
              <div className="merchant-stat__copy">
                <p>Total Reviews</p>
                <strong>{stats ? (Number(stats.total_reviews) || 0).toLocaleString("en-IN") : "—"}</strong>
                <small>Customer feedback</small>
              </div>
            </article>

            {/* Card 4: Average Rating */}
            <article className="merchant-stat merchant-stat--violet">
              <span className="merchant-stat__icon">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6-4.9-4.7 6.7-.9L12 2Z" />
                </svg>
              </span>
              <div className="merchant-stat__copy">
                <p>Average Rating</p>
                <strong>{stats?.average_rating != null && Number.isFinite(Number(stats.average_rating)) ? `${Number(stats.average_rating).toFixed(1)} / 5` : "— / 5"}</strong>
                <small>Customer rating</small>
              </div>
            </article>
          </div>

          {/* Placement Tip Card (Fills height cleanly, no empty space) */}
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 text-xs text-slate-600 shadow-2xs">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0 mt-0.5">tips_and_updates</span>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">How to get 3× more Google reviews:</p>
                <p className="leading-relaxed">
                  Print this standee on 4 × 6 inch acrylic sheet and place it at your billing desk, dining tables, or checkout counter. Customers can scan in 5 seconds without typing!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
