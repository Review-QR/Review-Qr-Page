"use client";

import React, { useEffect, useState } from "react";

export type StandeeTheme = {
  id: string;
  number: number;
  label: string; // "Template 01", etc.
  name: string;
  pillColor: string;
  pillBg: string;
  pillBorder: string;
  primary: string;
  secondary?: string;
  tagline: string;
  templateType: 1 | 2 | 3 | 4 | 5;
};

export const STANDEE_THEMES: StandeeTheme[] = [
  {
    id: "template_1",
    number: 1,
    label: "Template 01",
    name: "Sunset Waves",
    pillColor: "#9A3412",
    pillBg: "#FFEDD5",
    pillBorder: "#FDBA74",
    primary: "#EA580C",
    tagline: "Scan to Review on Trustit",
    templateType: 1,
  },
  {
    id: "template_2",
    number: 2,
    label: "Template 02",
    name: "Cobalt Blue Frame",
    pillColor: "#0369A1",
    pillBg: "#E0F2FE",
    pillBorder: "#7DD3FC",
    primary: "#0284C7",
    tagline: "Review & Support Local Business",
    templateType: 2,
  },
  {
    id: "template_3",
    number: 3,
    label: "Template 03",
    name: "Rainbow Prism",
    pillColor: "#15803D",
    pillBg: "#DCFCE7",
    pillBorder: "#86EFAC",
    primary: "#16A34A",
    tagline: "Scan to Review on Trustit",
    templateType: 3,
  },
  {
    id: "template_4",
    number: 4,
    label: "Template 04",
    name: "Corner Arcs",
    pillColor: "#6B21A8",
    pillBg: "#F3E8FF",
    pillBorder: "#D8B4FE",
    primary: "#9333EA",
    tagline: "Scan to Review on Trustit",
    templateType: 4,
  },
  {
    id: "template_5",
    number: 5,
    label: "Template 05",
    name: "Warm Amber",
    pillColor: "#C2410C",
    pillBg: "#FFEDD5",
    pillBorder: "#FDBA74",
    primary: "#EA580C",
    tagline: "Delicious Food, Happy People",
    templateType: 5,
  },
];

function GoogleGIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function TrustitShieldIcon({
  className = "h-4 w-4",
  shieldFill = "#EA580C",
  checkStroke = "#ffffff",
}: {
  className?: string;
  shieldFill?: string;
  checkStroke?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M50 14 C68 14 80 20 80 34 C80 62 58 84 50 90 C42 84 20 62 20 34 C20 20 32 14 50 14 Z"
        fill={shieldFill}
      />
      <path
        d="M34 47 L45 58 L66 35"
        stroke={checkStroke}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrustitHeaderLogo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <svg className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <path
          d="M50 14 C68 14 80 20 80 34 C80 62 58 84 50 90 C42 84 20 62 20 34 C20 20 32 14 50 14 Z"
          fill="#EA580C"
        />
        <path
          d="M34 47 L45 58 L66 35"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 leading-none">
        Trustit
      </span>
    </div>
  );
}

export type ModernStandeeProps = {
  standeeIndex?: number;
  businessName: string;
  businessType?: string | null;
  qrUrl: string;
  usable: boolean;
  tagline?: string;
  categoryConfig?: unknown;
  compact?: boolean;
};

export function ModernStandee({
  standeeIndex = 0,
  businessName,
  qrUrl,
  usable,
  tagline,
  compact = false,
}: ModernStandeeProps) {
  const safeIndex = Math.abs(standeeIndex) % STANDEE_THEMES.length;
  const theme = STANDEE_THEMES[safeIndex];
  const [localQr, setLocalQr] = useState<string>("");

  useEffect(() => {
    if (!usable || !qrUrl) return;
    let active = true;
    const target = qrUrl.includes("data=")
      ? decodeURIComponent(qrUrl.split("data=")[1].split("&")[0] || "")
      : qrUrl;

    import("qrcode")
      .then((mod) =>
        mod.default.toDataURL(target || qrUrl, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: compact ? 360 : 960,
          color: { dark: "#000000", light: "#ffffff" },
        })
      )
      .then((dataUrl) => {
        if (active) setLocalQr(dataUrl);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [qrUrl, usable, compact]);

  const displayQr = localQr || qrUrl;

  return (
    <article
      data-standee-theme={theme.id}
      className={`relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-[26px] sm:rounded-[32px] bg-white shadow-2xl select-none ${
        theme.templateType === 2 ? "border-[5px] sm:border-[6px] border-[#0284C7]" : ""
      } ${theme.templateType === 5 ? "bg-[#FFF9F2]" : ""}`}
      style={{
        boxShadow: "0 16px 40px -8px rgba(0,0,0,0.15), 0 6px 16px -4px rgba(0,0,0,0.08)",
      }}
    >
      {/* ========================================================= */}
      {/* 1. BACKGROUND ACCENTS & CURVES (Exact match to designs)    */}
      {/* ========================================================= */}

      {/* TEMPLATE 01: Sunset Waves Top & Multi-Wave Gradient Bottom */}
      {theme.templateType === 1 && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Top Sunset Wave */}
          <svg className="absolute -top-1 inset-x-0 w-full h-28 sm:h-32" viewBox="0 0 300 120" preserveAspectRatio="none" fill="none">
            <path d="M0 0 L300 0 L300 70 C230 120 160 35 90 85 C40 110 0 75 0 75 Z" fill="url(#t1-top-grad)" />
            <defs>
              <linearGradient id="t1-top-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="0.45" stopColor="#EA580C" />
                <stop offset="1" stopColor="#DC2626" />
              </linearGradient>
            </defs>
          </svg>
          {/* Bottom Tropical Wave (Yellow, Cyan, Royal Blue) */}
          <svg className="absolute -bottom-1 inset-x-0 w-full h-28 sm:h-32" viewBox="0 0 300 120" preserveAspectRatio="none" fill="none">
            <path d="M0 65 C80 25 150 100 230 45 C270 25 300 50 300 50 L300 120 L0 120 Z" fill="url(#t1-bot-grad)" />
            <defs>
              <linearGradient id="t1-bot-grad" x1="0" y1="120" x2="300" y2="35" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="0.38" stopColor="#06B6D4" />
                <stop offset="1" stopColor="#2563EB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* TEMPLATE 02: Cobalt Blue Frame with Bottom Wave Accent */}
      {theme.templateType === 2 && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <svg className="absolute -bottom-1 inset-x-0 w-full h-22 sm:h-26" viewBox="0 0 300 90" preserveAspectRatio="none" fill="none">
            <path d="M0 50 C90 18 180 65 300 40 L300 90 L0 90 Z" fill="#E0F2FE" />
          </svg>
        </div>
      )}

      {/* TEMPLATE 03: Rainbow Prism Split Waves */}
      {theme.templateType === 3 && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Top Left Red Wave */}
          <svg className="absolute -top-1 -left-1 w-48 h-26 sm:w-56 sm:h-30" viewBox="0 0 160 95" fill="none">
            <path d="M0 0 L160 0 C110 42 80 85 0 95 Z" fill="#DC2626" />
          </svg>
          {/* Top Right Royal Blue Wave */}
          <svg className="absolute -top-1 -right-1 w-48 h-26 sm:w-56 sm:h-30" viewBox="0 0 160 95" fill="none">
            <path d="M160 0 L20 0 C70 38 110 70 160 90 Z" fill="#2563EB" />
          </svg>
          {/* Bottom Multi-Color Wave (Yellow -> Green -> Blue) */}
          <svg className="absolute -bottom-1 inset-x-0 w-full h-26 sm:h-30" viewBox="0 0 300 105" preserveAspectRatio="none" fill="none">
            <path d="M0 48 C70 12 130 75 200 38 C240 18 280 44 300 44 L300 105 L0 105 Z" fill="url(#t3-bot-grad)" />
            <defs>
              <linearGradient id="t3-bot-grad" x1="0" y1="105" x2="300" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="0.4" stopColor="#16A34A" />
                <stop offset="1" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* TEMPLATE 04: Four Corner Circular Arcs */}
      {theme.templateType === 4 && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Top-Left Yellow Arc */}
          <svg className="absolute -top-1 -left-1 w-26 h-26 sm:w-32 sm:h-32" viewBox="0 0 100 100" fill="none">
            <path d="M0 0 L90 0 C90 55 50 90 0 90 Z" fill="#F59E0B" />
          </svg>
          {/* Top-Right Red Arc */}
          <svg className="absolute -top-1 -right-1 w-26 h-26 sm:w-32 sm:h-32" viewBox="0 0 100 100" fill="none">
            <path d="M100 0 L10 0 C10 55 50 90 100 90 Z" fill="#DC2626" />
          </svg>
          {/* Bottom-Left Green Arc */}
          <svg className="absolute -bottom-1 -left-1 w-26 h-26 sm:w-32 sm:h-32" viewBox="0 0 100 100" fill="none">
            <path d="M0 100 L0 10 C50 10 90 50 90 100 Z" fill="#16A34A" />
          </svg>
          {/* Bottom-Right Blue Arc */}
          <svg className="absolute -bottom-1 -right-1 w-26 h-26 sm:w-32 sm:h-32" viewBox="0 0 100 100" fill="none">
            <path d="M100 100 L100 10 C50 10 10 50 10 100 Z" fill="#2563EB" />
          </svg>
        </div>
      )}

      {/* TEMPLATE 05: Warm Peach Contour Curves & Solid Orange Footer */}
      {theme.templateType === 5 && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Top-Left Peach Arc */}
          <svg className="absolute -top-4 -left-4 w-52 h-44 sm:w-60 sm:h-52" viewBox="0 0 200 180" fill="none">
            <path d="M0 0 L190 0 C130 50 150 110 0 170 Z" fill="#FED7AA" opacity="0.6" />
            <path d="M0 0 L150 0 C90 40 120 90 0 130 Z" fill="#FDBA74" opacity="0.75" />
          </svg>
          {/* Top-Right Peach Arc */}
          <svg className="absolute -top-4 -right-4 w-48 h-40 sm:w-56 sm:h-48" viewBox="0 0 180 160" fill="none">
            <path d="M180 0 L40 0 C90 40 110 80 180 120 Z" fill="#FED7AA" opacity="0.6" />
          </svg>
          {/* Bottom Orange Solid Wave */}
          <svg className="absolute -bottom-1 inset-x-0 w-full h-26 sm:h-30" viewBox="0 0 300 95" preserveAspectRatio="none" fill="none">
            <path d="M0 38 C75 12 165 52 300 22 L300 95 L0 95 Z" fill="#EA580C" />
          </svg>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. INNER CONTENT                                          */}
      {/* ========================================================= */}
      <div className="relative z-10 flex flex-1 min-h-0 w-full flex-col justify-between px-3 pt-3.5 sm:px-5 sm:pt-4 pb-1">
        {/* TOP: LOGO + SUBTITLE + BUSINESS NAME */}
        <div className="flex flex-col items-center text-center">
          <TrustitHeaderLogo />

          {/* Template 02 Subtitle & Accent Line */}
          {theme.templateType === 2 && (
            <div className="flex flex-col items-center mt-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 tracking-wide">
                Review &amp; Support Local Business
              </span>
              <span className="w-12 h-0.5 bg-orange-500 rounded-full mt-1 mb-0.5" />
            </div>
          )}

          {/* Template 05 Thin Accent Line */}
          {theme.templateType === 5 && (
            <div className="w-20 h-0.5 bg-orange-400/80 rounded-full mt-2 mb-1" />
          )}

          {/* Business Name Heading - Bold, Solid, Authoritative */}
          <h2
            className={`font-black text-slate-950 tracking-tight leading-tight max-w-[94%] ${
              theme.templateType === 2 ? "mt-0.5" : "mt-2"
            }`}
            style={{
              fontSize: "clamp(1.15rem, 3vw, 1.55rem)",
              textWrap: "balance",
              overflowWrap: "break-word",
            }}
            title={businessName}
          >
            {businessName}
          </h2>

          {/* Template 05 Tagline */}
          {theme.templateType === 5 && (
            <p
              className="mt-0.5 font-medium text-slate-600 tracking-normal line-clamp-1"
              style={{ fontSize: "clamp(0.72rem, 1.8vw, 0.9rem)" }}
            >
              {tagline || "Delicious Food, Happy People"}
            </p>
          )}
        </div>

        {/* CENTER: CRISP LARGE HIGH-CONTRAST QR CODE */}
        <div className="my-auto flex flex-col items-center justify-center py-1">
          <div className="relative inline-flex items-center justify-center p-3 sm:p-3.5 bg-white rounded-2xl shadow-sm">
            {/* Template 05: 4 Orange Corner Brackets ⌜ ⌝ ⌞ ⌟ */}
            {theme.templateType === 5 && (
              <>
                <span className="pointer-events-none absolute left-0 top-0 h-6 w-6 sm:h-7 sm:w-7 border-l-[3.5px] border-t-[3.5px] border-orange-500 rounded-tl-xl" />
                <span className="pointer-events-none absolute right-0 top-0 h-6 w-6 sm:h-7 sm:w-7 border-r-[3.5px] border-t-[3.5px] border-orange-500 rounded-tr-xl" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 sm:h-7 sm:w-7 border-b-[3.5px] border-l-[3.5px] border-orange-500 rounded-bl-xl" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 sm:h-7 sm:w-7 border-b-[3.5px] border-r-[3.5px] border-orange-500 rounded-br-xl" />
              </>
            )}

            {/* QR Image */}
            {usable && displayQr ? (
              <div className="relative inline-flex items-center justify-center">
                <img
                  src={displayQr}
                  alt={`Trustit QR Code for ${businessName}`}
                  className="h-40 w-40 sm:h-52 sm:w-52 block object-contain"
                />
                {/* Template 05: Central Trustit Shield Badge in Center of QR */}
                {theme.templateType === 5 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-white p-0.5 shadow-sm ring-1 ring-orange-200">
                      <TrustitShieldIcon className="h-full w-full" />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 w-40 sm:h-52 sm:w-52 flex items-center justify-center bg-slate-50 p-2 text-center text-xs font-medium text-slate-500">
                QR unavailable while business is inactive
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM CALL-TO-ACTION BUTTONS */}
        <div className="flex flex-col items-center gap-1.5 py-1 shrink-0">
          {/* Templates 01, 03, 04: "Scan to Review on Trustit" as bold text */}
          {(theme.templateType === 1 || theme.templateType === 3 || theme.templateType === 4) && (
            <span
              className="font-black text-slate-900 tracking-tight"
              style={{ fontSize: "clamp(0.82rem, 2vw, 0.98rem)" }}
            >
              Scan to Review on Trustit
            </span>
          )}

          {/* Templates 02, 05: Solid Orange Pill Button with Trustit Check Shield */}
          {(theme.templateType === 2 || theme.templateType === 5) && (
            <div
              className="inline-flex items-center gap-2 rounded-full bg-[#EA580C] px-5 py-1.5 text-white shadow-xs"
              style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.88rem)" }}
            >
              <TrustitShieldIcon className="h-4 w-4 shrink-0" checkStroke="#EA580C" shieldFill="#ffffff" />
              <span className="font-bold tracking-tight">Scan to Review on Trustit</span>
            </div>
          )}

          {/* All 5 Templates: White Pill Button with Google Multi-Color 'G' */}
          <div
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-5 py-1.5 shadow-2xs text-slate-800"
            style={{ fontSize: "clamp(0.72rem, 1.7vw, 0.85rem)" }}
          >
            <GoogleGIcon className="h-4 w-4 shrink-0" />
            <span className="font-medium text-slate-700">
              Also Review on <span className="font-bold text-slate-950">Google</span>
            </span>
          </div>
        </div>
      </div>

      {/* SOLID FOOTER: "Powered by Trustit" */}
      <div
        className={`relative z-10 flex shrink-0 w-full items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold tracking-wider ${
          theme.templateType === 5 ? "text-white" : "text-slate-900"
        }`}
      >
        <span className={`font-semibold ${theme.templateType === 5 ? "text-white/95" : "text-slate-700"}`}>
          Powered by
        </span>
        <TrustitShieldIcon
          className="h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0"
          shieldFill={theme.templateType === 5 ? "#ffffff" : "#EA580C"}
          checkStroke={theme.templateType === 5 ? "#EA580C" : "#ffffff"}
        />
        <span className={`font-black ${theme.templateType === 5 ? "text-white" : "text-slate-950"}`}>
          Trustit
        </span>
      </div>
    </article>
  );
}
