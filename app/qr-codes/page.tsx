"use client";

import { useEffect, useMemo, useState } from "react";
import { getBusinesses } from "@/lib/data";
import type { Business } from "@/lib/types";

function isQrUsable(business: Business) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    String(business.qr_status ?? "").toLowerCase() === "active" &&
    (!business.expiry || business.expiry >= today)
  );
}

function qrImageUrl(scanUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    scanUrl
  )}`;
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

async function downloadQr(imageUrl: string, business: Business) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("Unable to download this QR code.");

  const image = await response.blob();
  const objectUrl = URL.createObjectURL(image);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${safeFilename(business.name || business.id)}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function printQr(imageUrl: string, business: Business) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) throw new Error("Allow pop-ups to print this QR code.");

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!
    );

  printWindow.document.write(`<!doctype html>
    <html><head><title>${escapeHtml(business.name || "Review QR")}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 32px; color: #0f172a; font-family: Arial, sans-serif; text-align: center; }
      main { max-width: 520px; margin: 0 auto; }
      img { display: block; width: 280px; height: 280px; margin: 24px auto; }
      h1 { margin: 0 0 8px; font-size: 26px; }
      p { margin: 6px 0; color: #475569; }
      .prompt { margin-top: 24px; font-size: 18px; font-weight: 600; color: #0f172a; }
      @media print { body { padding: 0; } }
    </style></head><body><main>
      <h1>${escapeHtml(business.name || "Business")}</h1>
      <p>${escapeHtml(business.id)}</p>
      <img src="${escapeHtml(imageUrl)}" alt="QR code for ${escapeHtml(business.name)}">
      <p class="prompt">Scan to leave us a review</p>
      ${business.address ? `<p>${escapeHtml(business.address)}</p>` : ""}
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

export default function QrCodesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState("");

  async function loadBusinesses() {
    setLoading(true);
    setMessage("");

    try {
      const data = await getBusinesses();
      setBusinesses(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load QR codes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setOrigin(window.location.origin);
    void loadBusinesses();
  }, []);

  const activeCount = useMemo(
    () => businesses.filter(isQrUsable).length,
    [businesses]
  );

  function scanUrl(business: Business) {
    return `${origin}/r/${encodeURIComponent(business.id)}`;
  }

  async function handleDownload(imageUrl: string, business: Business) {
    try {
      await downloadQr(imageUrl, business);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to download QR code.");
    }
  }

  function handlePrint(imageUrl: string, business: Business) {
    try {
      printQr(imageUrl, business);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to print QR code.");
    }
  }

  const totalScans = businesses.reduce(
    (sum, business) => sum + (business.scans ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Review-QR
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              QR Codes
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Generate, preview and test each business QR redirect.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadBusinesses()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total QR Codes
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {businesses.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active & Usable
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Scans
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalScans.toLocaleString()}
            </p>
          </div>

        </div>

        {/* Error */}
        {message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading QR codes...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {businesses.map((business) => {
              const usable = isQrUsable(business);
              const url = origin ? scanUrl(business) : "";

              return (
                <article
                  key={business.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 p-5">

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {business.name}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {business.id}
                      </p>
                    </div>

                    <span
                      className={
                        usable
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {usable ? "Active" : "Disabled"}
                    </span>

                  </div>

                  {/* QR */}
                  <div className="flex justify-center bg-slate-50 p-6">

                    {url ? (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">

                        <img
                          src={qrImageUrl(url)}
                          alt={`QR code for ${business.name}`}
                          width={240}
                          height={240}
                          className="h-60 w-60"
                        />

                      </div>
                    ) : (
                      <div className="flex h-60 w-60 items-center justify-center rounded-xl bg-white text-sm text-slate-400">
                        Preparing QR...
                      </div>
                    )}

                  </div>

                  {/* Details */}
                  <div className="space-y-3 p-5">

                    <div className="grid grid-cols-2 gap-3 text-sm">

                      <div>
                        <p className="text-slate-400">
                          Plan
                        </p>

                        <p className="font-medium text-slate-800">
                          {business.plan ?? "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Scans
                        </p>

                        <p className="font-medium text-slate-800">
                          {business.scans ?? 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Expiry
                        </p>

                        <p className="font-medium text-slate-800">
                          {business.expiry ?? "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          QR Type
                        </p>

                        <p className="font-medium text-slate-800">
                          {business.qr_type ?? "Review"}
                        </p>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">

                      <a
                        href={url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={
                          usable
                            ? "rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            : "pointer-events-none rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-500"
                        }
                      >
                        Test Scan
                      </a>

                      <a
                        href={business.review_link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Review Link
                      </a>

                      <button
                        type="button"
                        disabled={!url}
                        onClick={() => void handleDownload(qrImageUrl(url), business)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Download QR
                      </button>

                      <button
                        type="button"
                        disabled={!url}
                        onClick={() => handlePrint(qrImageUrl(url), business)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Print QR
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}
