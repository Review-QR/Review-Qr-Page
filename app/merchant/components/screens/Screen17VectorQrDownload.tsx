"use client";

import React, { useState } from "react";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

interface Screen17Props {
  onBack?: () => void;
  onCustomizeStandee?: () => void;
}

export type StandeeSlideTheme = {
  id: string;
  number: number;
  label: string;
  name: string;
  pillColor: string;
  pillBg: string;
  pillBorder: string;
  primary: string;
  tagline: string;
  cardAura: string;
  footerAura: string;
};

export const SLIDE_THEMES: StandeeSlideTheme[] = [
  {
    id: "template_1",
    number: 1,
    label: "Template 01",
    name: "Sunset Waves",
    pillColor: "#b8330c",
    pillBg: "#fde4cf",
    pillBorder: "#fcd3b3",
    primary: "#EA580C",
    tagline: "Scan to Review on Trustit",
    cardAura: "from-amber-400/40 via-orange-400/25 to-rose-500/40",
    footerAura: "from-emerald-400/45 via-teal-400/35 to-blue-500/45",
  },
  {
    id: "template_2",
    number: 2,
    label: "Template 02",
    name: "Cobalt Blue Frame",
    pillColor: "#12295e",
    pillBg: "#d6e8ff",
    pillBorder: "#b9d8ff",
    primary: "#0D63DE",
    tagline: "Review & Support Local Business",
    cardAura: "from-blue-500/40 via-indigo-500/25 to-cyan-400/40",
    footerAura: "from-indigo-500/45 via-blue-500/35 to-sky-400/45",
  },
  {
    id: "template_3",
    number: 3,
    label: "Template 03",
    name: "Rainbow Prism",
    pillColor: "#13351f",
    pillBg: "#d8f1d8",
    pillBorder: "#bbf0bb",
    primary: "#16A34A",
    tagline: "Scan to Review & Share Feedback",
    cardAura: "from-emerald-400/40 via-lime-400/25 to-teal-400/40",
    footerAura: "from-lime-400/45 via-emerald-400/35 to-teal-500/45",
  },
  {
    id: "template_4",
    number: 4,
    label: "Template 04",
    name: "Luxury Gold",
    pillColor: "#451a03",
    pillBg: "#fef3c7",
    pillBorder: "#fde68a",
    primary: "#D97706",
    tagline: "100% Verified Quality & Taste",
    cardAura: "from-amber-300/50 via-yellow-400/30 to-amber-600/40",
    footerAura: "from-amber-400/45 via-yellow-500/35 to-amber-600/45",
  },
  {
    id: "template_5",
    number: 5,
    label: "Template 05",
    name: "Rose Glamour",
    pillColor: "#831843",
    pillBg: "#fce7f3",
    pillBorder: "#fbcfe8",
    primary: "#DB2777",
    tagline: "Loved Your Experience? Rate Us!",
    cardAura: "from-rose-400/40 via-pink-400/25 to-fuchsia-400/40",
    footerAura: "from-pink-400/45 via-rose-400/35 to-purple-400/45",
  },
];

export default function Screen17VectorQrDownload({
  onBack,
  onCustomizeStandee,
}: Screen17Props) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [savedActiveTemplateId, setSavedActiveTemplateId] = useState<string>("template_1");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);

  const currentTheme = SLIDE_THEMES[currentIndex] || SLIDE_THEMES[0];
  const isCurrentActive = savedActiveTemplateId === currentTheme.id;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : SLIDE_THEMES.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < SLIDE_THEMES.length - 1 ? prev + 1 : 0));
  };

  const handleExport = (type: "png" | "pdf" | "print") => {
    setIsExporting(true);
    setStatusMessage(`${type.toUpperCase()} file ready for download!`);

    try {
      if (type === "print") {
        window.print();
      } else {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
          <rect width="400" height="600" rx="32" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
          <text x="200" y="70" font-family="sans-serif" font-size="22" font-weight="900" fill="#0f172a" text-anchor="middle">TRUSTIT SMART STANDEE</text>
          <text x="200" y="100" font-family="sans-serif" font-size="14" font-weight="700" fill="${currentTheme.primary}" text-anchor="middle">${currentTheme.tagline}</text>
          <rect x="75" y="140" width="250" height="250" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
          <text x="200" y="270" font-family="sans-serif" font-size="14" font-weight="bold" fill="#64748b" text-anchor="middle">[ Official NPCI + Google QR ]</text>
          <text x="200" y="440" font-family="sans-serif" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">Scan with Any UPI App</text>
          <text x="200" y="470" font-family="sans-serif" font-size="13" font-weight="700" fill="#475569" text-anchor="middle">Google Pay • PhonePe • Paytm</text>
          <text x="200" y="550" font-family="sans-serif" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">TRUSTIT HYPERLOCAL COMMERCE</text>
        </svg>`;

        const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Trustit_Standee_${currentTheme.id}.${type === "pdf" ? "svg" : "svg"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsExporting(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }, 1200);
  };

  const handleSetActive = () => {
    setSavedActiveTemplateId(currentTheme.id);
    setStatusMessage(`★ Set as your active counter standee!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="w-full h-[660px] max-h-[660px] bg-[#F1F5F9] relative flex flex-col justify-between font-sans overflow-hidden select-none">
      {/* 1. Ultra-Clean Top Bar (Height ~38px) */}
      <div className="w-full h-10 px-3 pt-2 flex items-center justify-between shrink-0 z-20">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
          Store Review Standee
        </span>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-slate-700 hover:text-slate-950 px-2.5 py-1 rounded-xl bg-white/95 hover:bg-white backdrop-blur-xs border border-slate-200 shadow-2xs transition cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. THE EXPANDED DOMINANT QR STANDEE (Fills Entire User Red Box) */}
      {/* ============================================================== */}
      <div className="flex-1 w-full px-2.5 pt-1 pb-1 flex items-center justify-center relative min-h-0">
        {/* Floating Left Slide Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-1 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-lg border border-slate-300 flex items-center justify-center font-black text-lg transition hover:scale-110 active:scale-95 cursor-pointer"
          title="Previous Standee (Slide Left)"
        >
          ‹
        </button>

        {/* Floating Right Slide Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-1 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-lg border border-slate-300 flex items-center justify-center font-black text-lg transition hover:scale-110 active:scale-95 cursor-pointer"
          title="Next Standee (Slide Right)"
        >
          ›
        </button>

        {/* ============================================================== */}
        {/* FULL-HEIGHT DOMINANT STANDEE CARD (Matching Red Box in Photo)  */}
        {/* ============================================================== */}
        <div className="w-full max-w-[342px] h-[555px] bg-white rounded-[32px] p-4 shadow-2xl border-2 border-slate-200 relative overflow-hidden transition-all duration-300 flex flex-col justify-between">
          {/* Top Glowing Wave Aura */}
          <div
            className={`absolute top-0 left-0 right-0 h-36 bg-gradient-to-b ${currentTheme.cardAura} blur-2xl pointer-events-none`}
          ></div>

          {/* Standee Top Header */}
          <div className="relative z-10 text-center pt-1">
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-slate-100 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                ✓
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tight">Trustit</span>
              <span className="text-amber-500 text-xs">✨</span>
            </div>

            {/* Business Name on Standee Card */}
            <h2 className="text-base font-black text-slate-950 mt-2 tracking-tight leading-tight px-1 line-clamp-1">
              Golden Blossom Cafe
            </h2>
            <div className="w-10 h-0.5 bg-slate-200 mx-auto mt-1 rounded-full"></div>
          </div>

          {/* LARGE DOMINANT SCANNABLE QR CODE (Expanded Size) */}
          <div className="relative z-10 my-auto text-center py-1">
            <div className="inline-block p-3 bg-white rounded-3xl shadow-sm border border-slate-200">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white p-1 rounded-2xl flex items-center justify-center">
                {/* SVG-based Crisp QR Pattern */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-slate-950"
                  fill="currentColor"
                >
                  {/* Corner Square 1 (Top-Left) */}
                  <rect x="0" y="0" width="28" height="28" rx="4" />
                  <rect x="4" y="4" width="20" height="20" fill="white" rx="2" />
                  <rect x="8" y="8" width="12" height="12" fill="currentColor" rx="1" />

                  {/* Corner Square 2 (Top-Right) */}
                  <rect x="72" y="0" width="28" height="28" rx="4" />
                  <rect x="76" y="4" width="20" height="20" fill="white" rx="2" />
                  <rect x="80" y="8" width="12" height="12" fill="currentColor" rx="1" />

                  {/* Corner Square 3 (Bottom-Left) */}
                  <rect x="0" y="72" width="28" height="28" rx="4" />
                  <rect x="4" y="76" width="20" height="20" fill="white" rx="2" />
                  <rect x="8" y="80" width="12" height="12" fill="currentColor" rx="1" />

                  {/* Data Dots Pattern */}
                  <rect x="34" y="6" width="6" height="6" />
                  <rect x="44" y="6" width="6" height="6" />
                  <rect x="54" y="6" width="6" height="6" />
                  <rect x="34" y="16" width="6" height="6" />
                  <rect x="44" y="24" width="6" height="6" />
                  <rect x="54" y="18" width="6" height="6" />

                  <rect x="6" y="34" width="6" height="6" />
                  <rect x="18" y="34" width="6" height="6" />
                  <rect x="24" y="44" width="6" height="6" />
                  <rect x="6" y="54" width="6" height="6" />

                  <rect x="72" y="34" width="6" height="6" />
                  <rect x="84" y="34" width="6" height="6" />
                  <rect x="72" y="46" width="6" height="6" />
                  <rect x="84" y="56" width="6" height="6" />

                  <rect x="34" y="72" width="6" height="6" />
                  <rect x="46" y="72" width="6" height="6" />
                  <rect x="56" y="82" width="6" height="6" />
                  <rect x="38" y="88" width="6" height="6" />
                  <rect x="48" y="88" width="6" height="6" />

                  <rect x="72" y="72" width="6" height="6" />
                  <rect x="84" y="72" width="6" height="6" />
                  <rect x="76" y="84" width="6" height="6" />
                  <rect x="88" y="84" width="6" height="6" />
                </svg>

                {/* Central Trustit Shield Emblem Watermark */}
                <div className="absolute inset-0 m-auto w-11 h-11 rounded-2xl bg-white border-2 border-slate-900 shadow-md flex items-center justify-center p-0.5">
                  <div className="w-full h-full rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black">
                    ✓
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline Below QR */}
            <p className="text-xs font-black text-slate-800 mt-2.5">
              {currentTheme.tagline}
            </p>

            {/* Also Review on Google Official Pill Button */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-[11px] font-bold text-slate-800">
                Also Review on <strong className="font-black text-slate-950">Google</strong>
              </span>
            </div>
          </div>

          {/* Standee Footer */}
          <div className="relative z-10 mt-1 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <span className="text-[10px] font-bold text-slate-500">Powered by</span>
            <div className="flex items-center gap-1 font-black text-slate-900 text-xs">
              <span className="w-3.5 h-3.5 rounded-sm bg-orange-500 text-white flex items-center justify-center text-[9px]">
                ✓
              </span>
              <span>Trustit</span>
            </div>
          </div>

          {/* Bottom Floating Wave Aura */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t ${currentTheme.footerAura} blur-xl pointer-events-none`}
          ></div>
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {statusMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 text-center text-xs font-bold text-emerald-900 bg-emerald-100/95 border border-emerald-300 py-1.5 px-3.5 rounded-xl shadow-lg backdrop-blur-xs animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SLIDE-UP BOTTOM SHEET (Exactly at bottom where line is drawn) */}
      {/* Sits right at the base, collapsed to only 38px single line bar   */}
      {/* ============================================================== */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[28px] border-t border-slate-200/90 shadow-[0_-15px_35px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out ${
          isSheetOpen ? "translate-y-0" : "translate-y-[calc(100%-38px)]"
        }`}
      >
        {/* The Exact Single Line Pull-Bar User Highlighted */}
        <button
          type="button"
          onClick={() => setIsSheetOpen(!isSheetOpen)}
          className="w-full h-[38px] px-3 flex items-center justify-center gap-1.5 text-slate-700 hover:text-slate-950 transition cursor-pointer select-none"
        >
          <span className="text-[11px] font-extrabold text-slate-800">
            {isSheetOpen ? "▼ Slide Down to Hide" : "▲ Slide Up for Download & Print Options"}
          </span>
          {!isSheetOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          )}
        </button>

        {/* Action Controls Revealed When Slid Up */}
        <div className="p-4 pt-1 space-y-2.5">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport("png")}
              className="py-2.5 px-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span className="text-sm">🖼️</span>
              <span>PNG Image</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport("pdf")}
              className="py-2.5 px-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition shadow-2xs flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span className="text-sm text-rose-600">📄</span>
              <span>PDF (4×6 in)</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport("print")}
              className="py-2.5 px-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition shadow-2xs flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <span className="text-sm">🖨️</span>
              <span>Direct Print</span>
            </button>
          </div>

          {/* Desk Standee & Link Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetActive}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                isCurrentActive
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold"
                  : "bg-blue-600 hover:bg-blue-700 text-white font-black"
              }`}
            >
              <span>{isCurrentActive ? "✓ Active on Counter Desk" : "★ Set as Counter Standee"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText("https://trustitreview.com/r/golden-blossom");
                setStatusMessage("Customer Review Link Copied!");
                setTimeout(() => setStatusMessage(null), 2500);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer"
              title="Copy customer review link"
            >
              📋 Link
            </button>
          </div>
        </div>
      </div>

      {/* Universal Upgrade Modal */}
      <UniversalUpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        reason="standees"
      />
    </div>
  );
}
