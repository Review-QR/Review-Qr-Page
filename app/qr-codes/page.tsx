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
