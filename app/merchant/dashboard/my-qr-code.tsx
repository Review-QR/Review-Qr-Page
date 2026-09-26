"use client";

import { useEffect, useState } from "react";

type MyQrCodeProps = {
  businessId: string;
  businessName: string;
  qrStatus: string | null;
  expiry: string | null;
  reviewLink: string | null;
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
}: MyQrCodeProps) {
  const [origin, setOrigin] = useState("");
  const [message, setMessage] = useState("");
  const usable = isQrUsable(qrStatus, expiry);
  const scanUrl = origin
    ? `${origin}/r/${encodeURIComponent(businessId)}`
    : "";
  const imageUrl = scanUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&data=${encodeURIComponent(scanUrl)}`
    : "";
  const statusLabel = usable
    ? "Active"
    : expiry && expiry < new Date().toISOString().slice(0, 10)
      ? "Expired"
      : qrStatus?.trim() || "Status unavailable";

  useEffect(() => setOrigin(window.location.origin), []);

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
      setMessage(error instanceof Error ? error.message : "Failed to download QR code.");
    }
  }

  function printQr() {
    setMessage("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
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
        <p class="prompt">Scan to leave us a review</p>
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

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          MY QR CODE
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">My QR Code</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your QR opens the public Review-QR page for this business.
        </p>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(280px,400px)_1fr] md:items-center">
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:min-h-[420px]">
          {usable && imageUrl ? (
            <img
              src={imageUrl}
              alt={`QR code for ${businessName}`}
              width={400}
              height={400}
              className="h-auto w-full max-w-[360px] rounded-xl bg-white p-2"
            />
          ) : (
            <div className="max-w-xs text-center">
              <p className="font-semibold text-slate-800">QR code unavailable</p>
              <p className="mt-2 text-sm text-slate-600">
                This QR is {statusLabel.toLowerCase()} and cannot be scanned right now.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <dl className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Business Name</dt>
              <dd className="mt-1 break-words font-semibold text-slate-900">{businessName}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Business ID</dt>
              <dd className="mt-1 break-all font-mono font-semibold text-slate-900">{businessId}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2 md:col-span-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">QR Status</dt>
              <dd className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${usable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                  {statusLabel}
                </span>
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void downloadQr()}
              disabled={!usable || !imageUrl}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download QR
            </button>
            <button
              type="button"
              onClick={printQr}
              disabled={!usable || !imageUrl}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Print QR
            </button>
          </div>

          {reviewLink?.trim() ? (
            <a
              href={reviewLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open Google Review
            </a>
          ) : (
            <p className="text-sm text-slate-500">Google Review link is unavailable.</p>
          )}
          {message && <p role="status" className="text-sm text-rose-700">{message}</p>}
        </div>
      </div>
    </section>
  );
}
