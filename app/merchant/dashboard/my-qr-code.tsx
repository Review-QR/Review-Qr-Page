"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { safeReviewLink } from "@/lib/safe-review-link";
import { buildTrustitQrImageUrl, buildTrustitReviewUrl, trustitAppOrigin } from "@/lib/trustit-qr";
import { QrPosterPreview } from "./qr/qr-template-gallery";
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
  businessType?: string | null;
  plan?: string | null;
  layout?: "dashboard" | "standalone";
  designAssets?: QrDesignAssets;
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
  businessType = null,
  plan = null,
  layout = "dashboard",
  designAssets,
  categoryConfig,
}: MyQrCodeProps) {
  const origin = trustitAppOrigin;
  const posterRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [isExporting, setIsExporting] = useState(false);
  const usable = isQrUsable(qrStatus, expiry);
  const safeLink = safeReviewLink(reviewLink);
  const scanUrl = buildTrustitReviewUrl(origin, businessId);
  const imageUrl = buildTrustitQrImageUrl(scanUrl);
  const statusLabel = usable
    ? "Active"
    : expiry && expiry < new Date().toISOString().slice(0, 10)
      ? "Expired"
      : qrStatus?.trim() || "Status unavailable";

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
        title: `${businessName} review QR`,
        text: `Open the Trustit review page for ${businessName}.`,
        url: scanUrl,
      });
      setMessageTone("success");
      setMessage("Trustit QR link shared.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof DOMException && error.name === "AbortError"
        ? "Sharing was cancelled."
        : "Could not share the Trustit QR link.");
    }
  }

  async function downloadFullPoster(format: "png" | "pdf") {
    setMessage("");
    if (!usable || !posterRef.current) {
      setMessageTone("error");
      setMessage("Poster is unavailable while the business QR is inactive.");
      return;
    }
    setIsExporting(true);
    setMessage(`Preparing high-resolution ${format.toUpperCase()} poster…`);
    try {
      const { domToPng } = await import("modern-screenshot");
      await document.fonts.ready;
      const png = await domToPng(posterRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        style: { borderRadius: "0px", boxShadow: "none" },
      });
      const filename = `${safeFilename(businessName || businessId)}-Review-Poster.${format}`;
      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [4, 6], compress: true });
        pdf.addImage(png, "PNG", 0, 0, 4, 6, undefined, "FAST");
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
      setMessage(`Full standee poster (${format.toUpperCase()}) downloaded successfully.`);
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
    if (posterRef.current) {
      try {
        const { domToPng } = await import("modern-screenshot");
        const png = await domToPng(posterRef.current, { scale: 3, backgroundColor: "#ffffff" });
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          setMessageTone("error");
          setMessage("Allow pop-ups to print this QR poster.");
          return;
        }
        printWindow.document.write(`<!doctype html>
          <html><head><title>${escapeHtml(businessName || "Review QR Standee")}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; font-family: sans-serif; text-align: center; }
            img { max-width: 100%; height: auto; max-height: 92vh; object-fit: contain; }
            @media print {
              @page { size: auto; margin: 0; }
              body { padding: 0; }
              img { max-height: 100vh; width: 100%; }
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
        setMessage("Print dialog opened for full standee poster.");
        return;
      } catch {
        // fallback to standard print
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
          <p className="merchant-page-heading__eyebrow">{standalone ? "Your customer sharing kit" : "MY QR CODE"}</p>
          <h2 id="merchant-my-qr-heading">My QR Code & Standee</h2>
          <p>Download the high-resolution standee poster or print directly for your counter.</p>
        </div>
        <span className="merchant-page-heading__badge">● {statusLabel}</span>
      </header>

      <div className={`merchant-qr-layout${standalone ? " merchant-qr-layout--standalone" : ""}`}>
        <div className="merchant-qr-poster-frame">
          {usable ? (
            <div ref={posterRef} className="merchant-qr-poster">
              <QrPosterPreview businessId={businessId} businessName={businessName} businessType={businessType} qrStatus={qrStatus} expiry={expiry} templateId={templateId} designAssets={designAssets} categoryConfig={categoryConfig} screenPreview googleReviewLink={reviewLink} />
            </div>
          ) : (
            <div className="merchant-qr-poster"><div className="merchant-qr-unavailable"><strong>QR code unavailable</strong><span>This QR is {statusLabel.toLowerCase()} and cannot be scanned right now.</span></div></div>
          )}
        </div>

        <div className="merchant-qr-details">
          <dl className="merchant-qr-details__list">
            <div className="merchant-qr-detail">
              <span className="merchant-qr-detail__icon" aria-hidden="true">
                <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              <div className="merchant-qr-detail__copy">
                <small>Business Name</small>
                <strong>{businessName}</strong>
              </div>
            </div>
            <div className="merchant-qr-detail">
              <span className="merchant-qr-detail__icon" aria-hidden="true">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/></svg>
              </span>
              <div className="merchant-qr-detail__copy">
                <small>Business ID</small>
                <strong>{businessId}</strong>
                <button type="button" onClick={() => void copyScanLink("Business QR link copied.")}>Copy QR link</button>
              </div>
            </div>
            <div className="merchant-qr-detail">
              <span className="merchant-qr-detail__icon" aria-hidden="true">
                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </span>
              <div className="merchant-qr-detail__copy">
                <small>Google Review Link</small>
                {safeLink ? <a href={safeLink} target="_blank" rel="noreferrer">{safeLink}</a> : <strong>Unavailable</strong>}
                <button type="button" onClick={() => void copyGoogleReviewLink()} disabled={!safeLink}>Copy review link</button>
              </div>
            </div>
            <div className="merchant-qr-detail">
              <span className="merchant-qr-detail__icon" aria-hidden="true">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <div className="merchant-qr-detail__copy">
                <small>QR Status</small>
                <strong>{statusLabel}</strong>
              </div>
            </div>
            <div className="merchant-qr-detail">
              <span className="merchant-qr-detail__icon" aria-hidden="true">
                <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </span>
              <div className="merchant-qr-detail__copy">
                <small>Plan</small>
                <strong>{plan?.trim() || "No plan"} plan</strong>
              </div>
            </div>
            <div className="merchant-qr-detail">
              <span className="merchant-qr-detail__icon" aria-hidden="true">
                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <div className="merchant-qr-detail__copy">
                <small>Expiry Date</small>
                <strong>{expiry || "—"}</strong>
              </div>
            </div>
          </dl>

          {/* Primary Action: Download Poster */}
          <div className="merchant-qr-poster-actions">
            <button
              type="button"
              className="merchant-btn-poster merchant-btn-poster--png"
              onClick={() => void downloadFullPoster("png")}
              disabled={!usable || isExporting}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              <span>{isExporting ? "Exporting…" : "Download Standee Poster (PNG)"}</span>
            </button>
            <button
              type="button"
              className="merchant-btn-poster merchant-btn-poster--pdf"
              onClick={() => void downloadFullPoster("pdf")}
              disabled={!usable || isExporting}
              title="Download printable PDF (4×6 in)"
            >
              PDF
            </button>
          </div>

          <div className="merchant-qr-actions">
            <button type="button" onClick={() => void downloadQr()} disabled={!usable || !imageUrl}>⇩ Download QR</button>
            <button type="button" onClick={() => void printQr()} disabled={!usable}>▤ Print QR</button>
            <button type="button" onClick={() => void shareQr()} disabled={!usable || !scanUrl}>↗ Share Link</button>
          </div>
          <div className="merchant-qr-actions merchant-qr-actions--secondary">
            <a href={scanUrl || "#"} target="_blank" rel="noreferrer" aria-disabled={!scanUrl} className={!scanUrl ? "is-disabled" : ""}>⌕ Test Scan</a>
            <Link href={standalone ? "#template-gallery" : "/merchant/dashboard/qr"}>✦ Change Template</Link>
          </div>
          <p className={`merchant-qr-message ${messageTone === "error" ? "text-rose-600" : "text-emerald-700"}`} role="status" aria-live="polite">{message}</p>
        </div>
      </div>
    </section>
  );
}
