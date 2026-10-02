"use client";

import { useState } from "react";
import Link from "next/link";
import { safeReviewLink } from "@/lib/safe-review-link";
import { buildTrustitQrImageUrl, buildTrustitReviewUrl, trustitAppOrigin } from "@/lib/trustit-qr";
import { QrPosterPreview } from "./qr/qr-template-gallery";

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
}: MyQrCodeProps) {
  const origin = trustitAppOrigin;
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
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

  async function downloadQr() {
    setMessage("");
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
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Failed to download QR code.");
    }
  }

  function printQr() {
    setMessage("");
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
        <span className="merchant-template-panel__icon" aria-hidden="true">▦</span>
        <div>
          <p className="merchant-page-heading__eyebrow">{standalone ? "Your customer sharing kit" : "MY QR CODE"}</p>
          <h2 id="merchant-my-qr-heading">My QR Code</h2>
          <p>Share this code so customers can scan to review your business.</p>
        </div>
        <span className="merchant-page-heading__badge">● {statusLabel}</span>
      </header>

      <div className={`merchant-qr-layout${standalone ? " merchant-qr-layout--standalone" : ""}`}>
        <div className="merchant-qr-poster-frame">
          {usable ? (
            <div className="merchant-qr-poster">
              <QrPosterPreview businessId={businessId} businessName={businessName} businessType={businessType} qrStatus={qrStatus} expiry={expiry} templateId={templateId} />
            </div>
          ) : (
            <div className="merchant-qr-poster"><div className="merchant-qr-unavailable"><strong>QR code unavailable</strong><span>This QR is {statusLabel.toLowerCase()} and cannot be scanned right now.</span></div></div>
          )}
        </div>

        <div className="merchant-qr-details">
          <dl className="merchant-qr-details__list">
            <div className="merchant-qr-detail"><span className="merchant-qr-detail__icon" aria-hidden="true">♙</span><div className="merchant-qr-detail__copy"><small>Business Name</small><strong>{businessName}</strong></div></div>
            <div className="merchant-qr-detail"><span className="merchant-qr-detail__icon" aria-hidden="true">▣</span><div className="merchant-qr-detail__copy"><small>Business ID</small><strong>{businessId}</strong><button type="button" onClick={() => void copyScanLink("Business QR link copied.")}>Copy QR link</button></div></div>
            <div className="merchant-qr-detail"><span className="merchant-qr-detail__icon" aria-hidden="true">↗</span><div className="merchant-qr-detail__copy"><small>Google Review Link</small>{safeLink ? <a href={safeLink} target="_blank" rel="noreferrer">{safeLink}</a> : <strong>Unavailable</strong>}<button type="button" onClick={() => void copyGoogleReviewLink()} disabled={!safeLink}>Copy review link</button></div></div>
            <div className="merchant-qr-detail"><span className="merchant-qr-detail__icon" aria-hidden="true">●</span><div className="merchant-qr-detail__copy"><small>QR Status</small><strong>{statusLabel}</strong></div></div>
            <div className="merchant-qr-detail"><span className="merchant-qr-detail__icon" aria-hidden="true">♢</span><div className="merchant-qr-detail__copy"><small>Plan</small><strong>{plan?.trim() || "No plan"} plan</strong></div></div>
            <div className="merchant-qr-detail"><span className="merchant-qr-detail__icon" aria-hidden="true">▤</span><div className="merchant-qr-detail__copy"><small>Expiry Date</small><strong>{expiry || "—"}</strong></div></div>
          </dl>
          <div className="merchant-qr-actions">
            <button type="button" onClick={() => void downloadQr()} disabled={!usable || !imageUrl}>⇩ Download QR</button>
            <button type="button" onClick={printQr} disabled={!usable || !imageUrl}>▤ Print QR</button>
            <button type="button" onClick={() => void shareQr()} disabled={!usable || !scanUrl}>↗ Share Link</button>
          </div>
          <div className="merchant-qr-actions merchant-qr-actions--secondary">
            <a href={scanUrl || "#"} target="_blank" rel="noreferrer" aria-disabled={!scanUrl} className={!scanUrl ? "is-disabled" : ""}>⌕ Test Scan</a>
            <Link href={standalone ? "#template-gallery" : "/merchant/dashboard/qr"}>✦ Change Template</Link>
          </div>
          <p className="merchant-qr-message" role="status" aria-live="polite">{message}</p>
        </div>
      </div>
    </section>
  );
}
