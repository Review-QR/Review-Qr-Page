"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { safeReviewLink } from "@/lib/safe-review-link";
import { buildTrustitQrImageUrl, buildTrustitReviewUrl } from "@/lib/trustit-qr";

type MyQrCodeProps = {
  businessId: string;
  businessName: string;
  qrStatus: string | null;
  expiry: string | null;
  reviewLink: string | null;
  totalScans?: number;
  templateName?: string;
};

function isQrUsable(qrStatus: string | null, expiry: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  const templateCards = [
    { name: "Sweets", className: "border-amber-400 bg-amber-50", ring: "ring-2 ring-amber-400" },
    { name: "Classic", className: "border-emerald-200 bg-emerald-50", ring: "" },
    { name: "Minimal", className: "border-slate-200 bg-slate-50", ring: "" },
    { name: "Modern", className: "border-violet-300 bg-slate-950", ring: "" },
    { name: "Premium", className: "border-orange-200 bg-orange-50", ring: "" },
  ];

  return (
    <section className="overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_14px_40px_rgba(120,78,20,0.08)]">
      <div className="border-b border-amber-100 bg-[linear-gradient(135deg,#fffaf0_0%,#fff7e8_55%,#f5fbf6_100%)] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">MY QR CODE</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">My QR Code</h2>
            <p className="mt-1 text-sm text-slate-600">Share this code so customers can scan and review your business.</p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${usable ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
            <span className={`h-2 w-2 rounded-full ${usable ? "bg-emerald-500" : "bg-slate-400"}`} />
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 p-5 sm:p-7 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="rounded-[24px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_30%),linear-gradient(145deg,#fff8ec,#fffdf8)] p-4 sm:p-5">
          <div className="mx-auto max-w-[470px] overflow-hidden rounded-[22px] border border-amber-200 bg-white p-3 shadow-[0_12px_35px_rgba(120,78,20,0.12)]">
            {usable && imageUrl ? (
              <div className="rounded-[18px] bg-[linear-gradient(145deg,#fff4d8,#fff,#f6ead7)] p-4 sm:p-5">
                <div className="rounded-2xl border border-amber-100 bg-white p-4 text-center">
                  <div className="mb-3 text-sm font-extrabold text-amber-900">{businessName}</div>
                  <img src={imageUrl} alt={`QR code for ${businessName}`} width={400} height={400} className="mx-auto h-auto w-full max-w-[360px] rounded-xl bg-white p-2" />
                  <p className="mt-3 text-base font-bold text-slate-800">Review us on <span className="text-[#4285F4]">Google</span></p>
                  <p className="mt-1 text-amber-500 tracking-[0.22em]">★★★★★</p>
                  <p className="mt-3 rounded-xl bg-amber-800 px-3 py-2 text-sm font-semibold text-white">Your feedback matters ♥</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center text-center"><div><p className="font-bold text-slate-800">QR code unavailable</p><p className="mt-2 text-sm text-slate-600">This QR is {statusLabel.toLowerCase()} and cannot be scanned right now.</p></div></div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-orange-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Business Name</p><p className="mt-1 break-words text-sm font-bold text-slate-900">{businessName}</p></div>
              <div className="rounded-2xl bg-violet-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Business ID</p><p className="mt-1 break-all font-mono text-sm font-bold text-slate-900">{businessId}</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">QR Status</p><p className="mt-2"><span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{statusLabel}</span></p></div>
              {totalScans !== undefined && <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Total Scans</p><p className="mt-1 text-xl font-extrabold text-slate-950">{Number.isFinite(totalScans) ? totalScans.toLocaleString("en-IN") : "0"}</p></div>}
            </div>
          </div>

          {templateName && <div className="rounded-[22px] border border-amber-100 bg-amber-50/60 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Selected Template</p><p className="mt-1 text-sm font-bold text-slate-900">{templateName}</p></div><Link href="/merchant/dashboard/qr" className="rounded-xl bg-amber-600 px-3 py-2 text-sm font-bold text-white hover:bg-amber-700">Change Template</Link></div></div>}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {templateCards.map((template) => <Link key={template.name} href="/merchant/dashboard/qr" className={`group rounded-2xl border p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md ${template.className} ${template.name === templateName ? template.ring : ""}`}>
              <div className="mx-auto flex h-20 w-full max-w-[90px] items-center justify-center rounded-xl border border-white/80 bg-white p-2 shadow-sm">
                {imageUrl && usable ? <img src={imageUrl} alt="" className="h-full w-full object-contain" /> : <span className="text-2xl">▦</span>}
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">{template.name}</p>
            </Link>)}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {scanUrl && usable && <a href={scanUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-3 py-3 text-center text-xs font-bold text-white hover:bg-emerald-700">Test Scan</a>}
            <button type="button" onClick={() => void downloadQr()} disabled={!usable || !imageUrl} className="rounded-xl bg-amber-600 px-3 py-3 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">Download PNG</button>
            <button type="button" onClick={printQr} disabled={!usable || !imageUrl} className="rounded-xl bg-slate-900 px-3 py-3 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">Print QR</button>
            <button type="button" onClick={() => void shareQr()} disabled={!usable || !scanUrl} className="rounded-xl bg-violet-600 px-3 py-3 text-xs font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">Share Link</button>
          </div>

          {safeLink ? <a href={safeLink} target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-100">Open Google Review</a> : <p className="text-sm text-slate-500">Google Review link is unavailable.</p>}
          {message && <p role="status" aria-live="polite" className={`text-sm ${messageTone === "error" ? "text-rose-700" : "text-emerald-700"}`}>{message}</p>}
        </div>
      </div>
    </section>
  );
}
