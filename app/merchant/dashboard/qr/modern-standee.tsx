"use client";

import React, { useEffect, useState } from "react";
import BusinessCategoryIcon from "@/app/components/business-category-icon";
import type { UnifiedBusinessCategory } from "@/lib/business-category-catalog";
import { getBusinessCategory } from "@/lib/config/business-catalog";

export type StandeeTheme = {
  id: string;
  number: number;
  name: string;
  categoryTitle: string;
  tagline: string;
  primary: string;
  secondary?: string;
  accentLight: string;
  accentMid: string;
  accentDark: string;
  footerBg: string;
  hasLeafWatermark?: boolean;
};

export const STANDEE_THEMES: StandeeTheme[] = [
  {
    id: "standee_1",
    number: 1,
    name: "Electric Blue",
    categoryTitle: "Retail / Shop",
    tagline: "Your Tagline Here",
    primary: "#0284C7",
    accentLight: "#BAE6FD",
    accentMid: "#38BDF8",
    accentDark: "#0369A1",
    footerBg: "#0284C7",
  },
  {
    id: "standee_2",
    number: 2,
    name: "Warm Amber",
    categoryTitle: "Food & Dining",
    tagline: "Delicious Food, Happy People",
    primary: "#EA580C",
    accentLight: "#FFEDD5",
    accentMid: "#FB923C",
    accentDark: "#C2410C",
    footerBg: "#EA580C",
  },
  {
    id: "standee_3",
    number: 3,
    name: "Vibrant Rose",
    categoryTitle: "Fashion & Sweets",
    tagline: "Shop More, Smile More",
    primary: "#DB2777",
    accentLight: "#FCE7F3",
    accentMid: "#F472B6",
    accentDark: "#BE185D",
    footerBg: "#DB2777",
  },
  {
    id: "standee_4",
    number: 4,
    name: "Emerald Mint",
    categoryTitle: "Healthcare & Clinic",
    tagline: "Your Health, Our Priority",
    primary: "#059669",
    accentLight: "#D1FAE5",
    accentMid: "#34D399",
    accentDark: "#047857",
    footerBg: "#059669",
  },
  {
    id: "standee_5",
    number: 5,
    name: "Royal Violet",
    categoryTitle: "Salon & Spa",
    tagline: "Look Good, Feel Great",
    primary: "#7E22CE",
    accentLight: "#F3E8FF",
    accentMid: "#C084FC",
    accentDark: "#581C87",
    footerBg: "#7E22CE",
    hasLeafWatermark: true,
  },
  {
    id: "standee_6",
    number: 6,
    name: "Royal Gold & Navy",
    categoryTitle: "Hospitality & Stay",
    tagline: "Stay With Comfort",
    primary: "#D97706",
    secondary: "#0F172A",
    accentLight: "#FEF3C7",
    accentMid: "#F59E0B",
    accentDark: "#B45309",
    footerBg: "#0F172A",
  },
  {
    id: "standee_7",
    number: 7,
    name: "Ocean Sky Blue",
    categoryTitle: "Education & Growth",
    tagline: "Learn Today, Grow Tomorrow",
    primary: "#0284C7",
    accentLight: "#E0F2FE",
    accentMid: "#38BDF8",
    accentDark: "#0369A1",
    footerBg: "#0284C7",
  },
  {
    id: "standee_8",
    number: 8,
    name: "Obsidian Slate",
    categoryTitle: "Corporate & Universal",
    tagline: "Quality Service, Always",
    primary: "#0F172A",
    accentLight: "#E2E8F0",
    accentMid: "#94A3B8",
    accentDark: "#000000",
    footerBg: "#000000",
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

function TrustitCenterShield({
  color = "#0284c7",
  className = "h-5 w-5",
}: {
  color?: string;
  className?: string;
}) {
  const gradId = `ts-center-grad-${color.replace("#", "")}`;
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* 4-point sparkle on top-right */}
      <path
        d="M80 6 C81 12 83 14 89 15 C83 16 81 18 80 24 C79 18 77 16 71 15 C77 14 79 12 80 6 Z"
        fill={color}
      />
      {/* 3D Shield */}
      <path
        d="M50 14 C68 14 80 20 80 34 C80 62 58 84 50 90 C42 84 20 62 20 34 C20 20 32 14 50 14 Z"
        fill={`url(#${gradId})`}
      />
      {/* Bold White Checkmark */}
      <path
        d="M34 47 L45 58 L66 35"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dynamic Swoosh */}
      <path
        d="M32 60 C40 68 56 68 68 54"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}

function TrustitShieldIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z" />
    </svg>
  );
}

export type ModernStandeeProps = {
  standeeIndex?: number;
  businessName: string;
  businessType: string | null;
  qrUrl: string;
  usable: boolean;
  tagline?: string;
  categoryConfig?: UnifiedBusinessCategory | null;
  compact?: boolean;
};

export function ModernStandee({
  standeeIndex = 0,
  businessName,
  businessType,
  qrUrl,
  usable,
  tagline,
  categoryConfig,
  compact = false,
}: ModernStandeeProps) {
  const theme = STANDEE_THEMES[Math.abs(standeeIndex) % STANDEE_THEMES.length];
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
          width: compact ? 300 : 900,
          color: { dark: "#0f172a", light: "#ffffff" },
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

  const category = categoryConfig ?? getBusinessCategory(businessType);
  const iconName = category?.primaryIcon ?? "Store";
  const designFamily = category?.designFamily ?? "general";
  const activeTagline = tagline || theme.tagline;

  const displayQr = localQr || qrUrl;

  return (
    <article
      data-standee-theme={theme.id}
      className="relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-900/10"
      style={{
        boxShadow: "0 10px 30px -5px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Background Curved Waves (Exact Match to Image) ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Top-Left Waves */}
        <svg
          className="absolute -left-2 -top-2 h-36 w-48 sm:h-44 sm:w-56"
          viewBox="0 0 220 180"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0 L180 0 C130 50 160 110 0 160 Z"
            fill={theme.accentLight}
            opacity="0.8"
          />
          <path
            d="M0 0 L150 0 C100 40 120 90 0 130 Z"
            fill={theme.accentMid}
            opacity="0.9"
          />
          <path
            d="M0 0 L110 0 C70 30 80 70 0 95 Z"
            fill={theme.primary}
            opacity="0.95"
          />
        </svg>

        {/* Top-Right Soft Wave */}
        <svg
          className="absolute -right-2 -top-2 h-28 w-36 sm:h-36 sm:w-44"
          viewBox="0 0 160 140"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M160 0 L40 0 C80 40 100 80 160 110 Z"
            fill={theme.accentLight}
            opacity="0.65"
          />
          <path
            d="M160 0 L80 0 C110 30 125 60 160 80 Z"
            fill={theme.secondary || theme.accentMid}
            opacity="0.85"
          />
        </svg>

        {/* Bottom-Right Sweeping Dynamic Waves */}
        <svg
          className="absolute -bottom-2 -right-2 h-56 w-64 sm:h-64 sm:w-72"
          viewBox="0 0 260 230"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M260 230 L40 230 C120 170 140 90 260 40 Z"
            fill={theme.accentLight}
            opacity="0.75"
          />
          <path
            d="M260 230 L80 230 C150 180 180 110 260 80 Z"
            fill={theme.accentMid}
            opacity="0.9"
          />
          <path
            d="M260 230 L120 230 C180 190 210 140 260 120 Z"
            fill={theme.secondary || theme.accentDark}
            opacity="0.95"
          />
        </svg>

        {/* Bottom-Left Soft Accent Curve */}
        <svg
          className="absolute -bottom-2 -left-2 h-28 w-36 sm:h-36 sm:w-44"
          viewBox="0 0 150 130"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 130 L110 130 C70 90 40 70 0 50 Z"
            fill={theme.accentLight}
            opacity="0.6"
          />
        </svg>

        {/* Leaf Watermark Motif for Theme 5 (Salon / Purple) */}
        {theme.hasLeafWatermark && (
          <svg
            className="absolute -right-4 bottom-24 h-48 w-32 opacity-25"
            viewBox="0 0 120 200"
            fill="none"
            stroke={theme.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M100 190 C60 130 70 60 110 10" />
            <path d="M85 140 C60 130 50 110 60 95 C75 95 85 110 85 140 Z" fill={theme.accentLight} />
            <path d="M92 105 C115 95 125 75 115 60 C100 60 90 75 92 105 Z" fill={theme.accentLight} />
            <path d="M78 70 C55 65 45 45 55 30 C70 30 80 45 78 70 Z" fill={theme.accentLight} />
            <path d="M100 40 C118 35 122 18 112 8 C100 8 92 20 100 40 Z" fill={theme.accentLight} />
          </svg>
        )}
      </div>

      {/* ── Content Container ── */}
      <div className="relative z-10 flex flex-1 min-h-0 w-full flex-col justify-between px-3 pt-2.5 sm:px-4 sm:pt-3 pb-0.5">
        {/* Header: Circle Icon + Business Name + Tagline */}
        <div className="flex flex-col items-center text-center">
          {/* Top Category Icon Circle */}
          <div
            className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-white shadow-md ring-2 ring-white/80"
            style={{ color: theme.primary }}
          >
            <BusinessCategoryIcon
              name={iconName}
              family={designFamily}
              className="h-5 w-5 sm:h-6 sm:w-6"
            />
          </div>

          {/* Business Name */}
          <h2
            className="mt-1.5 max-w-[94%] font-black text-slate-900 tracking-tight leading-tight"
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.35rem)",
              textWrap: "balance",
              overflowWrap: "break-word",
            }}
            title={businessName}
          >
            {businessName}
          </h2>

          {/* Subtitle / Tagline */}
          <p
            className="mt-0.5 max-w-[90%] font-medium text-slate-500 tracking-normal line-clamp-1"
            style={{ fontSize: "clamp(0.68rem, 1.6vw, 0.85rem)" }}
          >
            {activeTagline}
          </p>
        </div>

        {/* Center: QR Code with Rounded Corner Brackets */}
        <div className="my-auto flex flex-col items-center justify-center py-1">
          <div className="relative inline-flex items-center justify-center p-2.5 sm:p-3 bg-white/95 rounded-2xl shadow-sm">
            {/* 4 Corner Brackets ⌜ ⌝ ⌞ ⌟ */}
            <span
              className="pointer-events-none absolute left-0 top-0 h-5 w-5 sm:h-6 sm:w-6 border-l-[3.5px] border-t-[3.5px] rounded-tl-xl"
              style={{ borderColor: theme.primary }}
            />
            <span
              className="pointer-events-none absolute right-0 top-0 h-5 w-5 sm:h-6 sm:w-6 border-r-[3.5px] border-t-[3.5px] rounded-tr-xl"
              style={{ borderColor: theme.primary }}
            />
            <span
              className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 sm:h-6 sm:w-6 border-b-[3.5px] border-l-[3.5px] rounded-bl-xl"
              style={{ borderColor: theme.primary }}
            />
            <span
              className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 sm:h-6 sm:w-6 border-b-[3.5px] border-r-[3.5px] rounded-br-xl"
              style={{ borderColor: theme.primary }}
            />

            {/* Live QR Image */}
            {usable && displayQr ? (
              <div className="relative inline-flex items-center justify-center">
                <img
                  src={displayQr}
                  alt={`Trustit review QR for ${businessName}`}
                  className="h-32 w-32 sm:h-44 sm:w-44 block object-contain"
                />
                {/* Central Trustit Micro-Shield Badge */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-6 w-6 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-md bg-white p-0.5 shadow-sm ring-1 ring-slate-200/80">
                    <TrustitCenterShield color={theme.primary} className="h-full w-full" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-32 w-32 sm:h-44 sm:w-44 flex items-center justify-center bg-slate-50 p-2 text-center text-[10px] font-medium text-slate-500">
                QR unavailable while business is inactive
              </div>
            )}
          </div>
        </div>

        {/* Dual Social Proof Badges: Review on Trustit + Review on Google */}
        <div className="flex flex-col items-center gap-1 py-0.5 shrink-0">
          {/* Badge 1: Review on Trustit (Colored Pill with Shield Icon) */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-white shadow-sm"
            style={{
              backgroundColor: theme.primary,
              fontSize: "clamp(0.68rem, 1.6vw, 0.8rem)",
            }}
          >
            <TrustitShieldIcon className="h-3.5 w-3.5 shrink-0 fill-white" />
            <span className="font-semibold tracking-wide">
              Review on <span className="font-black">Trustit</span>
            </span>
          </div>

          {/* Badge 2: Review on Google (Clean White Pill with Google G) */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-0.5 shadow-sm text-slate-800"
            style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.78rem)" }}
          >
            <GoogleGIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              Review on <span className="font-bold">Google</span>
            </span>
          </div>
        </div>

        {/* 3-Step Circular Customer Guidance */}
        <div className="mx-auto grid w-full max-w-[270px] grid-cols-3 gap-1.5 px-1 py-1 text-center shrink-0">
          {/* Step 1: Open Camera */}
          <div className="flex flex-col items-center">
            <span
              className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </span>
            <span className="mt-1 text-[8px] sm:text-[9px] font-bold text-slate-700 uppercase tracking-tight">
              Open Camera
            </span>
          </div>

          {/* Step 2: Scan QR */}
          <div className="flex flex-col items-center">
            <span
              className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </span>
            <span className="mt-1 text-[8px] sm:text-[9px] font-bold text-slate-700 uppercase tracking-tight">
              Scan QR
            </span>
          </div>

          {/* Step 3: Give Your Review */}
          <div className="flex flex-col items-center">
            <span
              className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            <span className="mt-1 text-[8px] sm:text-[9px] font-bold text-slate-700 uppercase tracking-tight">
              Give Your Review
            </span>
          </div>
        </div>
      </div>

      {/* ── Solid Bottom Footer Bar ── */}
      <div
        className="relative z-10 flex shrink-0 w-full items-center justify-center gap-1.5 py-1.5 text-white font-bold tracking-wider"
        style={{
          backgroundColor: theme.footerBg,
          fontSize: "clamp(0.62rem, 1.4vw, 0.75rem)",
        }}
      >
        <span className="font-normal opacity-90">Powered by</span>
        <TrustitShieldIcon className="h-3 w-3 shrink-0 fill-white" />
        <span className="font-black tracking-widest">TRUSTIT</span>
      </div>
    </article>
  );
}
