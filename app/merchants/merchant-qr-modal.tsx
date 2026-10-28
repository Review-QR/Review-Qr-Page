"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/lib/types";

function isQrUsable(business: Business) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    String(business.qr_status ?? "").toLowerCase() === "active" &&
    (!business.expiry || business.expiry >= today)
  );
}

function safeFilename(value: string) {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return cleaned || "trustit-merchant-qr";
}

export function MerchantQrModal({
  business,
  onClose,
}: {
  business: Business;
  onClose: () => void;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const scanUrl = `${origin || "https://trustitreview.com"}/r/${encodeURIComponent(business.id)}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(
    scanUrl
  )}`;
  const usable = isQrUsable(business);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await fetch(qrImgUrl);
      if (!response.ok) throw new Error("Failed to download QR code image.");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${safeFilename(business.name || business.id)}-Trustit-QR.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print this merchant QR code.");
      return;
    }

    const escapeHtml = (val: string) =>
      val.replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
      );

    printWindow.document.write(`<!doctype html>
      <html>
      <head>
        <title>${escapeHtml(business.name || "Merchant QR")} - Trustit Standee</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 40px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; }
          main { max-width: 500px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 24px; padding: 32px; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
          h1 { margin: 8px 0; font-size: 26px; font-weight: 900; color: #0f172a; }
          .stars { font-size: 22px; color: #f59e0b; margin: 8px 0; }
          .qr-box { margin: 24px auto; padding: 12px; background: #0f172a; border-radius: 20px; display: inline-block; }
          .qr-box img { display: block; width: 280px; height: 280px; border-radius: 12px; background: #fff; }
          .prompt { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 16px; margin-bottom: 4px; }
          .sub { color: #64748b; font-size: 13px; margin: 0; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #94a3b8; font-family: monospace; }
          @media print { body { padding: 0; } main { border: none; box-shadow: none; } }
        </style>
      </head>
      <body>
        <main>
          <span class="badge">Official Google Review Partner</span>
          <h1>${escapeHtml(business.name || "Business")}</h1>
          <div class="stars">★ ★ ★ ★ ★</div>
          <div class="qr-box">
            <img src="${escapeHtml(qrImgUrl)}" alt="QR Code for ${escapeHtml(business.name)}">
          </div>
          <p class="prompt">Scan Camera to Rate Our Service</p>
          <p class="sub">100% Verified Customer Experience on Trustit & Google</p>
          ${business.address ? `<p class="sub" style="margin-top: 8px;">📍 ${escapeHtml(business.address)}</p>` : ""}
          <div class="footer">ID: ${escapeHtml(business.id)} | trustitreview.com</div>
        </main>
      </body>
      </html>`);
    printWindow.document.close();

    const img = printWindow.document.querySelector("img");
    const startPrint = () => {
      printWindow.focus();
      printWindow.print();
    };
    if (img?.complete) startPrint();
    else if (img) img.onload = startPrint;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="merchant-qr-title"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <section
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-xs">
              QR
            </span>
            <div>
              <h2 id="merchant-qr-title" className="text-base font-bold text-slate-900">
                Merchant QR Console
              </h2>
              <p className="text-[11px] text-slate-500">{business.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          {/* Status Badge */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                usable
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  usable ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              {usable ? "QR Status: Active" : "QR Status: Inactive / Expired"}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              Plan: {business.plan || "Basic"}
            </span>
          </div>

          {/* QR Display Card */}
          <div className="relative mx-auto my-3 inline-block rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-xl">
            <div className="rounded-xl bg-white p-2.5 shadow-inner">
              <img
                src={qrImgUrl}
                alt={`QR code for ${business.name}`}
                width={240}
                height={240}
                className="h-60 w-60 rounded-lg object-contain"
              />
            </div>
            <p className="mt-2 text-[10px] font-mono text-slate-400">
              Scan to rate {business.name}
            </p>
          </div>

          {/* Scan Link Input & Copy */}
          <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
            <input
              type="text"
              readOnly
              value={scanUrl}
              className="w-full bg-transparent px-2 text-xs font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>

          {downloadError && (
            <p className="mt-2 text-xs text-rose-600">{downloadError}</p>
          )}

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition"
            >
              <span>{downloading ? "Saving..." : "📥 Download HD PNG"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <span>🖨️ Print Standee</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
