"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import MerchantNativeAppShell, { MerchantCategory, PrimaryTab } from "../components/MerchantNativeAppShell";

export const dynamic = "force-dynamic";

interface ElementChange {
  id: string;
  tagName: string;
  previewText: string;
  styles: Record<string, string>;
}

interface HistoryItem {
  type: "style" | "text" | "dom" | "insert" | "delete";
  el: HTMLElement;
  styles?: Record<string, string>;
  text?: string;
  parent?: HTMLElement;
  nextSibling?: HTMLElement | null;
}

interface LayerNode {
  el: HTMLElement;
  tagName: string;
  previewText: string;
  icon: string;
  depth: number;
}

export interface StudioScreenDef {
  key: string;
  title: string;
  category: string;
  props: {
    initialAuth: boolean;
    initialAuthStep?: "pitch" | "category" | "kyc" | "login";
    initialCategory?: MerchantCategory;
    initialTab?: PrimaryTab;
    initialSubScreen?: string | null;
  };
}

// Complete Ordered Sequence of All 56 Merchant Screens
export const SCREENS_SEQUENCE: StudioScreenDef[] = [
  // 1. Auth & Sign-in Stack
  {
    key: "auth_01",
    title: "Screen 01: Landing Pitch (\"Become Partner\")",
    category: "1. Onboarding Stack",
    props: { initialAuth: false, initialAuthStep: "pitch", initialSubScreen: null },
  },
  {
    key: "auth_02",
    title: "Screen 02: Category Selection Wizard",
    category: "1. Onboarding Stack",
    props: { initialAuth: false, initialAuthStep: "category", initialSubScreen: null },
  },
  {
    key: "auth_03",
    title: "Screen 03: Mobile KYC Registration (OTP)",
    category: "1. Onboarding Stack",
    props: { initialAuth: false, initialAuthStep: "kyc", initialSubScreen: null },
  },
  {
    key: "auth_04",
    title: "Screen 04: Partner Login & Cashier PIN",
    category: "1. Onboarding Stack",
    props: { initialAuth: false, initialAuthStep: "login", initialSubScreen: null },
  },

  // 2. Industry Cockpits
  {
    key: "cockpit_kirana",
    title: "Screen 05: 🛒 Kirana Mart Cockpit (Balaji Daily Needs)",
    category: "2. Industry Cockpits",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: null },
  },
  {
    key: "cockpit_restaurant",
    title: "Screen 06: ☕ Restaurant & Cafe Cockpit",
    category: "2. Industry Cockpits",
    props: { initialAuth: true, initialCategory: "restaurant", initialTab: "cockpit", initialSubScreen: null },
  },
  {
    key: "cockpit_chemist",
    title: "Screen 07: 💊 Chemist & Pharmacy Cockpit",
    category: "2. Industry Cockpits",
    props: { initialAuth: true, initialCategory: "chemist", initialTab: "cockpit", initialSubScreen: null },
  },
  {
    key: "cockpit_salon",
    title: "Screen 08: ✂️ Salon & Spa Cockpit",
    category: "2. Industry Cockpits",
    props: { initialAuth: true, initialCategory: "salon", initialTab: "cockpit", initialSubScreen: null },
  },
  {
    key: "cockpit_carwash",
    title: "Screen 09: 🚗 Car Wash & Garage Cockpit",
    category: "2. Industry Cockpits",
    props: { initialAuth: true, initialCategory: "carwash", initialTab: "cockpit", initialSubScreen: null },
  },

  // 3. Core Tabs & Dispatch
  {
    key: "tab_orders",
    title: "Screen 10: Screen 09 Live Orders Master Board",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialTab: "orders", initialSubScreen: null },
  },
  {
    key: "s02",
    title: "Screen 11: Screen 02 Incoming Order Siren Alert",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s02" },
  },
  {
    key: "s03",
    title: "Screen 12: Screen 03 Urgent Kitchen Queue Drawer",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s03" },
  },
  {
    key: "s04",
    title: "Screen 13: Screen 04 Occasion Daily Pulse & CRM",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s04" },
  },
  {
    key: "s05",
    title: "Screen 14: Screen 05 Store Brand Profile Settings",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s05" },
  },
  {
    key: "s06",
    title: "Screen 15: Screen 06 GPS Geofence Radar Boundary",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s06" },
  },
  {
    key: "s07",
    title: "Screen 16: Screen 07 Google Review Smart Gating",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s07" },
  },
  {
    key: "s08",
    title: "Screen 17: Screen 08 Store Operating Hours & Shifts",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s08" },
  },
  {
    key: "s10",
    title: "Screen 18: Screen 10 Order Details & Prep Timer",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s10" },
  },
  {
    key: "s11",
    title: "Screen 19: Screen 11 KOT Kitchen Thermal Receipt",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s11" },
  },
  {
    key: "s12",
    title: "Screen 20: Screen 12 Rider Dispatch & Assignment",
    category: "3. Order & Kitchen Dispatch",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s12" },
  },

  // 4. Catalog & Menu Explorer
  {
    key: "tab_menu",
    title: "Screen 21: Screen 13 Menu & Catalog Explorer",
    category: "4. Catalog & Merchandise",
    props: { initialAuth: true, initialTab: "menu", initialSubScreen: null },
  },
  {
    key: "s14",
    title: "Screen 22: Screen 14 Add Product / Dish Modal",
    category: "4. Catalog & Merchandise",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s14" },
  },
  {
    key: "s15",
    title: "Screen 23: Screen 15 Instant Out-of-Stock Switcher",
    category: "4. Catalog & Merchandise",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s15" },
  },
  {
    key: "s16",
    title: "Screen 24: Screen 16 Category Master Presets",
    category: "4. Catalog & Merchandise",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s16" },
  },
  {
    key: "s17",
    title: "Screen 25: Screen 17 Official Vector QR Download",
    category: "4. Catalog & Merchandise",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s17" },
  },

  // 5. Standees & Reviews Feed
  {
    key: "tab_standee",
    title: "Screen 26: Screen 18 Standee Template Gallery",
    category: "5. Standees & Reviews",
    props: { initialAuth: true, initialTab: "standee", initialSubScreen: null },
  },
  {
    key: "s19",
    title: "Screen 27: Screen 19 Customer Reviews Feed",
    category: "5. Standees & Reviews",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s19" },
  },
  {
    key: "s20",
    title: "Screen 28: Screen 20 1-Click AI Review Reply Modal",
    category: "5. Standees & Reviews",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s20" },
  },
  {
    key: "s21",
    title: "Screen 29: Screen 21 Acrylic Standee Merch Catalog",
    category: "5. Standees & Reviews",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s21" },
  },
  {
    key: "s22",
    title: "Screen 30: Screen 22 Branded Standee Mockup Customizer",
    category: "5. Standees & Reviews",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s22" },
  },
  {
    key: "s23",
    title: "Screen 31: Screen 23 Cart & Standee Checkout",
    category: "5. Standees & Reviews",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s23" },
  },
  {
    key: "s24",
    title: "Screen 32: Screen 24 Courier Waybill Tracking",
    category: "5. Standees & Reviews",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s24" },
  },

  // 6. Occasions & WhatsApp Marketing
  {
    key: "s25",
    title: "Screen 33: Screen 25 Customer Occasions CRM Board",
    category: "6. Occasions & Marketing",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s25" },
  },
  {
    key: "s26",
    title: "Screen 34: Screen 26 AI Festival Poster Creator",
    category: "6. Occasions & Marketing",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s26" },
  },
  {
    key: "s27",
    title: "Screen 35: Screen 27 WhatsApp Message Composer",
    category: "6. Occasions & Marketing",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s27" },
  },
  {
    key: "s28",
    title: "Screen 36: Screen 28 Connect Wallet Recharge (Cashfree)",
    category: "6. Occasions & Marketing",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s28" },
  },

  // 7. Analytics & Subscriptions
  {
    key: "s29",
    title: "Screen 37: Screen 29 Scan Footfall Analytics",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s29" },
  },
  {
    key: "s30",
    title: "Screen 38: Screen 30 Hourly Rush Heatmap",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s30" },
  },
  {
    key: "s31",
    title: "Screen 39: Screen 31 Customer Sentiment Tags",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s31" },
  },
  {
    key: "s32",
    title: "Screen 40: Screen 32 Reports & Data Exporter",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s32" },
  },
  {
    key: "s33",
    title: "Screen 41: Screen 33 Subscription Plan Cockpit",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s33" },
  },
  {
    key: "s34",
    title: "Screen 42: Screen 34 3-Tier Upgrade Matrix (₹29/₹49)",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s34" },
  },
  {
    key: "s35",
    title: "Screen 43: Screen 35 Subscription AutoPay Setup",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s35" },
  },
  {
    key: "s36",
    title: "Screen 44: Screen 36 GST Tax Invoices Archive",
    category: "7. Analytics & Plans",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s36" },
  },

  // 8. Settlement, Bank KYC & Security
  {
    key: "tab_more",
    title: "Screen 45: Screen 37 Daily Settlement Ledger & Hub",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialTab: "more", initialSubScreen: null },
  },
  {
    key: "s38",
    title: "Screen 46: Screen 38 Settlement Breakdown Modal",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s38" },
  },
  {
    key: "s39",
    title: "Screen 47: Screen 39 Bank KYC Penny Drop Verification",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s39" },
  },
  {
    key: "s40",
    title: "Screen 48: Screen 40 CA Payout Excel Downloader",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s40" },
  },
  {
    key: "s41",
    title: "Screen 49: Screen 41 2FA & Cashier PIN Security",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s41" },
  },
  {
    key: "s42",
    title: "Screen 50: Screen 42 Multi-Outlet Branch Switcher",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s42" },
  },
  {
    key: "s43",
    title: "Screen 51: Screen 43 Staff Roles & Permissions Matrix",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s43" },
  },
  {
    key: "s44",
    title: "Screen 52: Screen 44 Audit Sessions & Device Log",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s44" },
  },
  {
    key: "s45",
    title: "Screen 53: Screen 45 24x7 Operations Support Hub",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s45" },
  },
  {
    key: "s46",
    title: "Screen 54: Screen 46 Thermal Printer Wizard",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s46" },
  },
  {
    key: "s47",
    title: "Screen 55: Screen 47 Dispute Tickets & Helpdesk",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s47" },
  },
  {
    key: "s48",
    title: "Screen 56: Screen 48 Offline Safe Mode Switch",
    category: "8. Settlement & Bank KYC",
    props: { initialAuth: true, initialCategory: "kirana", initialTab: "cockpit", initialSubScreen: "s48" },
  },
];

export interface ScreenDesignVariant {
  id: string;
  number: number;
  name: string;
  tagline: string;
  icon: string;
  themeStyle: {
    bg: string;
    cardBg: string;
    textPrimary: string;
    accentColor: string;
    accentBg: string;
    borderColor: string;
  };
}

export const UNIVERSAL_VARIANTS: ScreenDesignVariant[] = [
  {
    id: "opt1_bharatpe",
    number: 1,
    name: "BharatPe Retail Trust",
    tagline: "Navy & warm gold, high contrast physical retail QR trust, Hindi/English clarity",
    icon: "👑",
    themeStyle: {
      bg: "#FAF9F6",
      cardBg: "#FFFFFF",
      textPrimary: "#0F172A",
      accentColor: "#D97706",
      accentBg: "#FEF3C7",
      borderColor: "#FDE68A",
    },
  },
  {
    id: "opt2_swiggy",
    number: 2,
    name: "Swiggy Modern Stack",
    tagline: "Midnight dark/vibrant, electric orange & emerald, high density cards",
    icon: "⚡",
    themeStyle: {
      bg: "#0B0F19",
      cardBg: "#1E293B",
      textPrimary: "#F8FAFC",
      accentColor: "#FC8019",
      accentBg: "rgba(252, 128, 25, 0.15)",
      borderColor: "#334155",
    },
  },
  {
    id: "opt3_minimal",
    number: 3,
    name: "Apple / Stripe Minimal Clean",
    tagline: "Pure snow white, hairline dividers, airy padding, subtle slate borders",
    icon: "🌿",
    themeStyle: {
      bg: "#FFFFFF",
      cardBg: "#F8FAFC",
      textPrimary: "#020617",
      accentColor: "#2563EB",
      accentBg: "#EFF6FF",
      borderColor: "#E2E8F0",
    },
  },
  {
    id: "opt4_analytics",
    number: 4,
    name: "Zomato Business Analytics",
    tagline: "Data-driven cockpit, revenue KPIs, growth % chips, performance metrics",
    icon: "📊",
    themeStyle: {
      bg: "#0F172A",
      cardBg: "#1E293B",
      textPrimary: "#F1F5F9",
      accentColor: "#10B981",
      accentBg: "rgba(16, 185, 129, 0.15)",
      borderColor: "#334155",
    },
  },
  {
    id: "opt5_compact",
    number: 5,
    name: "Compact Cashier Power-POS",
    tagline: "High-speed counter mode, dense 1-tap checkout, high contrast action buttons",
    icon: "🛒",
    themeStyle: {
      bg: "#F1F5F9",
      cardBg: "#FFFFFF",
      textPrimary: "#0F172A",
      accentColor: "#E11D48",
      accentBg: "#FFE4E6",
      borderColor: "#CBD5E1",
    },
  },
  {
    id: "opt6_glass",
    number: 6,
    name: "Luxury Frosted Glass VIP",
    tagline: "Dark glassmorphism, neon purple-indigo glow, VIP gold badges",
    icon: "✨",
    themeStyle: {
      bg: "#090D16",
      cardBg: "rgba(30, 41, 59, 0.7)",
      textPrimary: "#FFFFFF",
      accentColor: "#A855F7",
      accentBg: "rgba(168, 85, 247, 0.2)",
      borderColor: "rgba(168, 85, 247, 0.3)",
    },
  },
];

export const getVariantCSS = (variantId: string) => {
  switch (variantId) {
    case "opt1_bharatpe":
      return `
        .phone-theme-wrapper {
          background-color: #FAF9F6 !important;
          color: #0F172A !important;
        }
        .phone-theme-wrapper button.bg-blue-600,
        .phone-theme-wrapper button.bg-emerald-600 {
          background-color: #D97706 !important;
          color: #FFFFFF !important;
          border-radius: 14px !important;
        }
        .phone-theme-wrapper .border-slate-200 {
          border-color: #FDE68A !important;
        }
      `;
    case "opt2_swiggy":
      return `
        .phone-theme-wrapper {
          background-color: #0B0F19 !important;
          color: #F8FAFC !important;
        }
        .phone-theme-wrapper button.bg-blue-600,
        .phone-theme-wrapper button.bg-emerald-600 {
          background-color: #FC8019 !important;
          color: #FFFFFF !important;
          border-radius: 16px !important;
        }
        .phone-theme-wrapper .bg-white {
          background-color: #1E293B !important;
          color: #F8FAFC !important;
          border-color: #334155 !important;
        }
        .phone-theme-wrapper .text-slate-900 {
          color: #F8FAFC !important;
        }
      `;
    case "opt3_minimal":
      return `
        .phone-theme-wrapper {
          background-color: #FFFFFF !important;
          color: #020617 !important;
        }
        .phone-theme-wrapper button.bg-blue-600,
        .phone-theme-wrapper button.bg-emerald-600 {
          background-color: #0F172A !important;
          color: #FFFFFF !important;
          border-radius: 12px !important;
        }
        .phone-theme-wrapper .bg-white {
          background-color: #FFFFFF !important;
          border-color: #F1F5F9 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
        }
      `;
    case "opt4_analytics":
      return `
        .phone-theme-wrapper {
          background-color: #0F172A !important;
          color: #F1F5F9 !important;
        }
        .phone-theme-wrapper button.bg-blue-600,
        .phone-theme-wrapper button.bg-emerald-600 {
          background-color: #10B981 !important;
          color: #0F172A !important;
          font-weight: 900 !important;
        }
        .phone-theme-wrapper .bg-white {
          background-color: #1E293B !important;
          color: #F1F5F9 !important;
          border-color: #334155 !important;
        }
        .phone-theme-wrapper .text-slate-900 {
          color: #F1F5F9 !important;
        }
      `;
    case "opt5_compact":
      return `
        .phone-theme-wrapper {
          background-color: #F1F5F9 !important;
          color: #0F172A !important;
        }
        .phone-theme-wrapper button.bg-blue-600,
        .phone-theme-wrapper button.bg-emerald-600 {
          background-color: #E11D48 !important;
          color: #FFFFFF !important;
          border-radius: 8px !important;
          font-weight: 900 !important;
        }
        .phone-theme-wrapper .bg-white {
          background-color: #FFFFFF !important;
          border-color: #CBD5E1 !important;
          border-width: 2px !important;
        }
      `;
    case "opt6_glass":
      return `
        .phone-theme-wrapper {
          background: linear-gradient(135deg, #090D16 0%, #1E1B4B 100%) !important;
          color: #FFFFFF !important;
        }
        .phone-theme-wrapper button.bg-blue-600,
        .phone-theme-wrapper button.bg-emerald-600 {
          background: linear-gradient(135deg, #9333EA 0%, #4F46E5 100%) !important;
          color: #FFFFFF !important;
          border-radius: 18px !important;
          box-shadow: 0 4px 20px rgba(147, 51, 234, 0.4) !important;
        }
        .phone-theme-wrapper .bg-white {
          background: rgba(30, 41, 59, 0.75) !important;
          backdrop-filter: blur(16px) !important;
          border-color: rgba(168, 85, 247, 0.3) !important;
          color: #FFFFFF !important;
        }
        .phone-theme-wrapper .text-slate-900 {
          color: #FFFFFF !important;
        }
      `;
    default:
      return "";
  }
};

export default function MerchantStudioPage() {
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [appliedChanges, setAppliedChanges] = useState<ElementChange[]>([]);
  const [currentText, setCurrentText] = useState<string>("");
  const [showChangesModal, setShowChangesModal] = useState<boolean>(false);
  const [showGridLines, setShowGridLines] = useState<boolean>(false);
  
  // Active Screen Index (0 to 55)
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<"up" | "down" | null>(null);

  // Inspector Tabs
  const [activeTab, setActiveInspectorTab] = useState<
    "basics" | "elements" | "size" | "typography" | "colors" | "fancy" | "layers" | "device"
  >("basics");
  const [stepSize, setStepSize] = useState<number>(20); // 2, 5, 10, 20, 50, 100px
  const [canvasZoom, setCanvasZoom] = useState<number>(80); // 75%, 80%, 85%, 100%, 115%
  const [deviceFrame, setDeviceFrame] = useState<"standard" | "compact" | "tall">("standard");
  const [pageBgColor, setPageBgColor] = useState<string>("#FAF9F6");
  const [landingVariant, setLandingVariant] = useState<string>("opt1_bharatpe");

  // Per-Screen Variant Blueprint Selection (ScreenKey -> VariantId)
  const [savedScreenVariants, setSavedScreenVariants] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("trustit_saved_screen_variants");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return { auth_01: "opt1_bharatpe" };
  });

  // Locked/Finalized Screens (ScreenKey -> boolean)
  const [lockedScreens, setLockedScreens] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("trustit_locked_screens");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {};
  });

  const [isNavMinimized, setIsNavMinimized] = useState<boolean>(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);
  const [isSavingBlueprints, setIsSavingBlueprints] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [blueprintCategoryFilter, setBlueprintCategoryFilter] = useState<string>("all");

  // Layers Tree State
  const [layersList, setLayersList] = useState<LayerNode[]>([]);

  // Undo / Redo History Stack
  const [undoStack, setUndoStack] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);

  const appContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementStartTransform = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastWheelTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Current active screen definition
  const currentScreen = SCREENS_SEQUENCE[activeScreenIndex] || SCREENS_SEQUENCE[0];

  // Helper to extract translate(X, Y)
  const getTranslateXY = (el: HTMLElement) => {
    const style = window.getComputedStyle(el);
    const matrix = new WebKitCSSMatrix(style.transform);
    return { x: matrix.m41 || 0, y: matrix.m42 || 0 };
  };

  // ==========================================
  // SLIDE UP / DOWN SCREEN TRANSITION
  // ==========================================
  const goToNextScreen = useCallback(() => {
    if (activeScreenIndex < SCREENS_SEQUENCE.length - 1) {
      setSlideDirection("up");
      if (selectedEl) {
        selectedEl.style.outline = "";
        selectedEl.contentEditable = "false";
      }
      setSelectedEl(null);
      setActiveScreenIndex((prev) => prev + 1);
      setTimeout(() => setSlideDirection(null), 350);
    }
  }, [activeScreenIndex, selectedEl]);

  const goToPrevScreen = useCallback(() => {
    if (activeScreenIndex > 0) {
      setSlideDirection("down");
      if (selectedEl) {
        selectedEl.style.outline = "";
        selectedEl.contentEditable = "false";
      }
      setSelectedEl(null);
      setActiveScreenIndex((prev) => prev - 1);
      setTimeout(() => setSlideDirection(null), 350);
    }
  }, [activeScreenIndex, selectedEl]);

  const jumpToScreen = useCallback((idx: number) => {
    const targetIdx = Math.max(0, Math.min(SCREENS_SEQUENCE.length - 1, idx));
    setSlideDirection(targetIdx > activeScreenIndex ? "up" : "down");
    if (selectedEl) {
      selectedEl.style.outline = "";
      selectedEl.contentEditable = "false";
    }
    setSelectedEl(null);
    setActiveScreenIndex(targetIdx);
    setTimeout(() => setSlideDirection(null), 350);
  }, [activeScreenIndex, selectedEl]);

  // Canvas Mouse Wheel listener to slide up/down effortlessly
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const now = Date.now();
    if (now - lastWheelTime.current < 450) return; // 450ms debounce guard

    if (e.deltaY > 35) {
      lastWheelTime.current = now;
      goToNextScreen();
    } else if (e.deltaY < -35) {
      lastWheelTime.current = now;
      goToPrevScreen();
    }
  }, [goToNextScreen, goToPrevScreen]);

  // Touch Swipe on Canvas
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const delta = touchStartY.current - touchEndY;
    if (delta > 50) {
      goToNextScreen(); // Swiped up -> Next screen
    } else if (delta < -50) {
      goToPrevScreen(); // Swiped down -> Prev screen
    }
  };

  // Keyboard Navigation: Alt+Down / PageDown to Slide Up, Alt+Up / PageUp to Slide Down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "PageDown" || (e.altKey && e.key === "ArrowDown")) {
        e.preventDefault();
        goToNextScreen();
      } else if (e.key === "PageUp" || (e.altKey && e.key === "ArrowUp")) {
        e.preventDefault();
        goToPrevScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextScreen, goToPrevScreen]);

  // Sync saved screen blueprints with backend API on mount
  useEffect(() => {
    fetch("/api/merchant/save-blueprints")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.blueprints && Object.keys(data.blueprints).length > 0) {
          setSavedScreenVariants((prev) => ({ ...data.blueprints, ...prev }));
        }
      })
      .catch((err) => console.error("Error loading blueprints:", err));
  }, []);

  // Save to localStorage
  const persistBlueprints = useCallback((variants: Record<string, string>, locked: Record<string, boolean>) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("trustit_saved_screen_variants", JSON.stringify(variants));
        localStorage.setItem("trustit_locked_screens", JSON.stringify(locked));
      } catch (e) {}
    }
  }, []);

  const activeVariantId = savedScreenVariants[currentScreen.key] || "opt1_bharatpe";
  const isCurrentScreenLocked = !!lockedScreens[currentScreen.key];
  const finalizedCount = Object.keys(lockedScreens).filter((k) => lockedScreens[k]).length;

  const handleSelectVariant = (screenKey: string, variantId: string) => {
    const updated = { ...savedScreenVariants, [screenKey]: variantId };
    setSavedScreenVariants(updated);
    if (screenKey === "auth_01") {
      setLandingVariant(variantId);
    }
    const variantObj = UNIVERSAL_VARIANTS.find((v) => v.id === variantId);
    if (variantObj) {
      setPageBgColor(variantObj.themeStyle.bg);
    }
    persistBlueprints(updated, lockedScreens);
  };

  const handleToggleLock = (screenKey: string) => {
    const nextLocked = { ...lockedScreens, [screenKey]: !lockedScreens[screenKey] };
    setLockedScreens(nextLocked);
    persistBlueprints(savedScreenVariants, nextLocked);
  };

  const handleLockAndSlideNext = async (screenKey: string) => {
    const nextLocked = { ...lockedScreens, [screenKey]: true };
    setLockedScreens(nextLocked);
    persistBlueprints(savedScreenVariants, nextLocked);

    // Save to server API in background
    try {
      await fetch("/api/merchant/save-blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprints: savedScreenVariants,
          finalizedCount: Object.keys(nextLocked).filter((k) => nextLocked[k]).length,
        }),
      });
    } catch (e) {}

    setSaveToast(`✓ ${currentScreen.title.split(":")[0]} Finalized & Saved!`);
    setTimeout(() => setSaveToast(null), 2500);

    goToNextScreen();
  };

  const saveAllBlueprintsToProject = async () => {
    setIsSavingBlueprints(true);
    try {
      const res = await fetch("/api/merchant/save-blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprints: savedScreenVariants,
          finalizedCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveToast("🎉 All 56 Screen Blueprints saved to scripts/merchant_selected_screen_blueprints.json!");
        setTimeout(() => setSaveToast(null), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingBlueprints(false);
    }
  };

  // Record style modification with Undo snapshot
  const applyStyle = useCallback((property: string, value: string) => {
    if (!selectedEl) return;

    // Save previous state to undo stack
    const previousSnapshot: HistoryItem = {
      type: "style",
      el: selectedEl,
      styles: { [property]: (selectedEl.style as any)[property] || "" },
      text: selectedEl.innerText || "",
    };
    setUndoStack((prev) => [...prev.slice(-40), previousSnapshot]);
    setRedoStack([]); // Clear redo on new action

    (selectedEl.style as any)[property] = value;

    const textPreview = (selectedEl.innerText || "").trim().slice(0, 25) || selectedEl.tagName.toLowerCase();
    setAppliedChanges((prev) => {
      const existingIdx = prev.findIndex((c) => c.previewText === textPreview);
      const newStyles = existingIdx >= 0 ? { ...prev[existingIdx].styles, [property]: value } : { [property]: value };
      const changeItem: ElementChange = {
        id: `change_${Date.now()}`,
        tagName: selectedEl.tagName.toLowerCase(),
        previewText: textPreview,
        styles: newStyles,
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = changeItem;
        return copy;
      }
      return [...prev, changeItem];
    });
  }, [selectedEl]);

  // Comprehensive Undo Functionality
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    if (!lastAction) return;

    if (lastAction.type === "insert") {
      const parent = lastAction.el.parentElement;
      if (parent) {
        parent.removeChild(lastAction.el);
        setRedoStack((prev) => [...prev, lastAction]);
        setSelectedEl(null);
      }
    } else if (lastAction.type === "delete") {
      if (lastAction.parent) {
        if (lastAction.nextSibling && lastAction.parent.contains(lastAction.nextSibling)) {
          lastAction.parent.insertBefore(lastAction.el, lastAction.nextSibling);
        } else {
          lastAction.parent.appendChild(lastAction.el);
        }
        setRedoStack((prev) => [...prev, lastAction]);
        setSelectedEl(lastAction.el);
      }
    } else if (lastAction.type === "dom") {
      if (lastAction.parent && lastAction.el) {
        const currentSibling = lastAction.el.nextElementSibling as HTMLElement | null;
        const redoItem: HistoryItem = {
          type: "dom",
          el: lastAction.el,
          parent: lastAction.parent,
          nextSibling: currentSibling,
        };
        setRedoStack((prev) => [...prev, redoItem]);
        if (lastAction.nextSibling && lastAction.parent.contains(lastAction.nextSibling)) {
          lastAction.parent.insertBefore(lastAction.el, lastAction.nextSibling);
        } else {
          lastAction.parent.appendChild(lastAction.el);
        }
      }
    } else {
      const currentSnapshot: HistoryItem = {
        type: "style",
        el: lastAction.el,
        styles: {},
        text: lastAction.el.innerText || "",
      };
      if (lastAction.styles) {
        Object.keys(lastAction.styles).forEach((prop) => {
          currentSnapshot.styles![prop] = (lastAction.el.style as any)[prop] || "";
        });
      }
      setRedoStack((prev) => [...prev, currentSnapshot]);

      if (lastAction.styles) {
        Object.entries(lastAction.styles).forEach(([prop, val]) => {
          (lastAction.el.style as any)[prop] = val;
        });
      }
      if (lastAction.text && lastAction.text !== lastAction.el.innerText) {
        lastAction.el.innerText = lastAction.text;
        setCurrentText(lastAction.text);
      }
    }
  }, [undoStack]);

  // Comprehensive Redo Functionality
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextAction = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    if (!nextAction) return;

    if (nextAction.type === "insert") {
      if (nextAction.parent) {
        nextAction.parent.appendChild(nextAction.el);
        setUndoStack((prev) => [...prev, nextAction]);
        setSelectedEl(nextAction.el);
      }
    } else if (nextAction.type === "delete") {
      const parent = nextAction.el.parentElement;
      if (parent) {
        parent.removeChild(nextAction.el);
        setUndoStack((prev) => [...prev, nextAction]);
        setSelectedEl(null);
      }
    } else if (nextAction.type === "dom") {
      if (nextAction.parent && nextAction.el) {
        const currentSibling = nextAction.el.nextElementSibling as HTMLElement | null;
        const undoItem: HistoryItem = {
          type: "dom",
          el: nextAction.el,
          parent: nextAction.parent,
          nextSibling: currentSibling,
        };
        setUndoStack((prev) => [...prev, undoItem]);
        if (nextAction.nextSibling && nextAction.parent.contains(nextAction.nextSibling)) {
          nextAction.parent.insertBefore(nextAction.el, nextAction.nextSibling);
        } else {
          nextAction.parent.appendChild(nextAction.el);
        }
      }
    } else {
      const currentSnapshot: HistoryItem = {
        type: "style",
        el: nextAction.el,
        styles: {},
        text: nextAction.el.innerText || "",
      };
      if (nextAction.styles) {
        Object.keys(nextAction.styles).forEach((prop) => {
          currentSnapshot.styles![prop] = (nextAction.el.style as any)[prop] || "";
        });
      }
      setUndoStack((prev) => [...prev, currentSnapshot]);

      if (nextAction.styles) {
        Object.entries(nextAction.styles).forEach(([prop, val]) => {
          (nextAction.el.style as any)[prop] = val;
        });
      }
      if (nextAction.text && nextAction.text !== nextAction.el.innerText) {
        nextAction.el.innerText = nextAction.text;
        setCurrentText(nextAction.text);
      }
    }
  }, [redoStack]);

  // Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Scan & Build Layers Tree when entering layers tab
  const scanLayers = useCallback(() => {
    const phoneContainer = appContainerRef.current;
    if (!phoneContainer) return;

    const nodes: LayerNode[] = [];
    const walk = (el: HTMLElement, depth: number) => {
      if (depth > 4) return;
      const tag = el.tagName.toLowerCase();
      if (tag === "svg" || tag === "path" || tag === "script" || tag === "style") return;

      const rawText = (el.innerText || "").trim().split("\n")[0] || "";
      const text = rawText.slice(0, 24) || tag;

      let icon = "📄";
      if (tag === "button") icon = "🔘";
      else if (tag === "input") icon = "⌨️";
      else if (tag.startsWith("h")) icon = "✍️";
      else if (tag === "span") icon = "🏷️";
      else if (tag === "header") icon = "🔝";
      else if (tag === "footer") icon = "⚓";
      else if (el.classList.contains("rounded-2xl") || el.classList.contains("rounded-3xl")) icon = "📦";

      nodes.push({
        el,
        tagName: tag,
        previewText: text,
        icon,
        depth,
      });

      Array.from(el.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          walk(child, depth + 1);
        }
      });
    };

    const mainArea = phoneContainer.querySelector("main") || phoneContainer;
    Array.from(mainArea.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        walk(child, 0);
      }
    });

    setLayersList(nodes.slice(0, 50));
  }, []);

  useEffect(() => {
    if (activeTab === "layers") {
      scanLayers();
    }
  }, [activeTab, scanLayers, activeScreenIndex]);

  // Select an element programmatically
  const selectElement = useCallback((target: HTMLElement) => {
    if (selectedEl && selectedEl !== target) {
      selectedEl.style.outline = "";
      selectedEl.contentEditable = "false";
    }
    setSelectedEl(target);
    setCurrentText(target.innerText || "");
    target.contentEditable = "true";
    target.style.outline = "3px solid #3B82F6";
    target.style.outlineOffset = "2px";
    target.style.cursor = "grab";
  }, [selectedEl]);

  // Setup click & hover interception in Edit Mode
  useEffect(() => {
    const container = appContainerRef.current;
    if (!container) return;

    if (!isEditMode) {
      if (selectedEl) {
        selectedEl.style.outline = "";
        selectedEl.contentEditable = "false";
      }
      setSelectedEl(null);
      setHoveredEl(null);
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && container.contains(target) && !target.closest(".studio-docked-sidebar")) {
        // Don't show edit outline on interactive switchers
        if (target.closest(".ai-design-switcher") || target.closest("[data-studio-interactive]")) {
          return;
        }
        setHoveredEl(target);
      }
    };

    const handleMouseOut = () => {
      setHoveredEl(null);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && container.contains(target) && !target.closest(".studio-docked-sidebar")) {
        // If clicking on AI Design Switcher, DO NOT intercept! Let it change variant!
        if (target.closest(".ai-design-switcher") || target.closest("[data-studio-interactive]")) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        selectElement(target);
      }
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    container.addEventListener("click", handleClick, true);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      container.removeEventListener("click", handleClick, true);
    };
  }, [isEditMode, selectElement, selectedEl, activeScreenIndex]);

  // ==========================================
  // 1. FREE 2D TRANSFORM MOVER
  // ==========================================
  const shiftTranslate = (dx: number, dy: number) => {
    if (!selectedEl) return;
    selectedEl.style.position = "relative";
    if (!selectedEl.style.zIndex || selectedEl.style.zIndex === "auto") {
      selectedEl.style.zIndex = "50";
    }
    const { x, y } = getTranslateXY(selectedEl);
    const newX = x + dx;
    const newY = y + dy;
    applyStyle("transform", `translate(${newX}px, ${newY}px)`);
  };

  const centerElement = () => {
    if (!selectedEl) return;
    applyStyle("marginRight", "auto");
    applyStyle("marginLeft", "auto");
    applyStyle("display", "block");
  };

  const alignLeft = () => {
    if (!selectedEl) return;
    applyStyle("marginLeft", "0px");
    applyStyle("marginRight", "auto");
  };

  const alignRight = () => {
    if (!selectedEl) return;
    applyStyle("marginLeft", "auto");
    applyStyle("marginRight", "0px");
  };

  const setRotation = (deg: number) => {
    if (!selectedEl) return;
    const { x, y } = getTranslateXY(selectedEl);
    applyStyle("transform", `translate(${x}px, ${y}px) rotate(${deg}deg)`);
  };

  const setElementScale = (scaleFactor: number) => {
    if (!selectedEl) return;
    const { x, y } = getTranslateXY(selectedEl);
    applyStyle("transform", `translate(${x}px, ${y}px) scale(${scaleFactor})`);
  };

  const selectParent = () => {
    if (!selectedEl) return;
    const parent = selectedEl.parentElement;
    if (parent && parent !== appContainerRef.current) {
      selectElement(parent);
    }
  };

  const selectFirstChild = () => {
    if (!selectedEl) return;
    const firstChild = selectedEl.firstElementChild;
    if (firstChild instanceof HTMLElement) {
      selectElement(firstChild);
    }
  };

  // ==========================================
  // 2. STRUCTURAL DOM REORDER
  // ==========================================
  const recordDomState = () => {
    if (!selectedEl || !selectedEl.parentElement) return;
    const item: HistoryItem = {
      type: "dom",
      el: selectedEl,
      parent: selectedEl.parentElement,
      nextSibling: selectedEl.nextElementSibling as HTMLElement | null,
    };
    setUndoStack((prev) => [...prev.slice(-40), item]);
    setRedoStack([]);
  };

  const moveDomUp = () => {
    if (!selectedEl) return;
    recordDomState();
    const prev = selectedEl.previousElementSibling as HTMLElement;
    if (prev) {
      selectedEl.parentNode?.insertBefore(selectedEl, prev);
    } else if (selectedEl.parentElement && selectedEl.parentElement.parentElement) {
      selectedEl.parentElement.parentElement.insertBefore(selectedEl, selectedEl.parentElement);
    }
  };

  const moveDomDown = () => {
    if (!selectedEl) return;
    recordDomState();
    const next = selectedEl.nextElementSibling as HTMLElement;
    if (next) {
      selectedEl.parentNode?.insertBefore(next, selectedEl);
    } else if (selectedEl.parentElement && selectedEl.parentElement.parentElement) {
      selectedEl.parentElement.parentElement.appendChild(selectedEl);
    }
  };

  const moveDomTop = () => {
    if (!selectedEl) return;
    const phoneContainer = appContainerRef.current;
    if (!phoneContainer) return;
    recordDomState();
    const targetParent = phoneContainer.querySelector(".flex-col") || phoneContainer.querySelector("main") || phoneContainer;
    targetParent.insertBefore(selectedEl, targetParent.firstElementChild);
  };

  const moveDomBottom = () => {
    if (!selectedEl) return;
    const phoneContainer = appContainerRef.current;
    if (!phoneContainer) return;
    recordDomState();
    const targetParent = phoneContainer.querySelector(".flex-col") || phoneContainer.querySelector("main") || phoneContainer;
    targetParent.appendChild(selectedEl);
  };

  // ==========================================
  // 3. OVER LAYER / UNDER LAYER (Z-Index)
  // ==========================================
  const setLayer = (action: "front" | "back" | "up" | "down") => {
    if (!selectedEl) return;
    selectedEl.style.position = "relative";
    const currentZ = parseInt(selectedEl.style.zIndex || "1", 10) || 1;
    if (action === "front") {
      applyStyle("zIndex", "100");
    } else if (action === "back") {
      applyStyle("zIndex", "0");
    } else if (action === "up") {
      applyStyle("zIndex", `${currentZ + 10}`);
    } else if (action === "down") {
      applyStyle("zIndex", `${Math.max(0, currentZ - 10)}`);
    }
  };

  // ==========================================
  // 4. DIRECT MOUSE DRAG & DROP
  // ==========================================
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditMode || !selectedEl) return;
    const target = e.target as HTMLElement;
    if (target === selectedEl || selectedEl.contains(target)) {
      isDraggingRef.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      elementStartTransform.current = getTranslateXY(selectedEl);
      selectedEl.style.position = "relative";
      if (!selectedEl.style.zIndex || selectedEl.style.zIndex === "auto") {
        selectedEl.style.zIndex = "80";
      }
      selectedEl.style.cursor = "grabbing";
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !selectedEl) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const newX = elementStartTransform.current.x + dx;
    const newY = elementStartTransform.current.y + dy;
    selectedEl.style.transform = `translate(${newX}px, ${newY}px)`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current && selectedEl) {
      isDraggingRef.current = false;
      selectedEl.style.cursor = "grab";
      applyStyle("transform", selectedEl.style.transform);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const toggleVisibility = () => {
    if (!selectedEl) return;
    const isHidden = selectedEl.style.display === "none";
    applyStyle("display", isHidden ? "" : "none");
  };

  const adjustPadding = (delta: number) => {
    if (!selectedEl) return;
    const computedTop = parseFloat(window.getComputedStyle(selectedEl).paddingTop) || 6;
    const computedLeft = parseFloat(window.getComputedStyle(selectedEl).paddingLeft) || 12;
    applyStyle("paddingTop", `${Math.max(2, computedTop + delta)}px`);
    applyStyle("paddingBottom", `${Math.max(2, computedTop + delta)}px`);
    applyStyle("paddingLeft", `${Math.max(4, computedLeft + delta * 1.5)}px`);
    applyStyle("paddingRight", `${Math.max(4, computedLeft + delta * 1.5)}px`);
  };

  const adjustMarginTop = (delta: number) => {
    if (!selectedEl) return;
    const computed = parseFloat(window.getComputedStyle(selectedEl).marginTop) || 0;
    applyStyle("marginTop", `${computed + delta}px`);
  };

  const adjustFontSize = (delta: number) => {
    if (!selectedEl) return;
    const computed = parseFloat(window.getComputedStyle(selectedEl).fontSize) || 12;
    applyStyle("fontSize", `${Math.max(8, computed + delta)}px`);
  };

  const setFontWeightDirect = (weight: string) => {
    applyStyle("fontWeight", weight);
  };

  const toggleBold = () => {
    if (!selectedEl) return;
    const computed = window.getComputedStyle(selectedEl).fontWeight;
    const isCurrentlyBold = parseInt(computed, 10) >= 700 || computed === "bold";
    applyStyle("fontWeight", isCurrentlyBold ? "400" : "900");
  };

  const toggleItalic = () => {
    if (!selectedEl) return;
    const isItalic = window.getComputedStyle(selectedEl).fontStyle === "italic";
    applyStyle("fontStyle", isItalic ? "normal" : "italic");
  };

  const toggleUppercase = () => {
    if (!selectedEl) return;
    const isUpper = window.getComputedStyle(selectedEl).textTransform === "uppercase";
    applyStyle("textTransform", isUpper ? "none" : "uppercase");
  };

  const toggleUnderline = () => {
    if (!selectedEl) return;
    const isUnder = window.getComputedStyle(selectedEl).textDecorationLine.includes("underline");
    applyStyle("textDecoration", isUnder ? "none" : "underline");
  };

  const handleTextChange = (newVal: string) => {
    if (!selectedEl) return;
    setCurrentText(newVal);
    selectedEl.innerText = newVal;
    applyStyle("customText", newVal);
  };

  const setBorderRadius = (radius: string) => {
    applyStyle("borderRadius", radius);
  };

  const setAnimationEffect = (fx: "none" | "pulse" | "bounce" | "glow") => {
    if (!selectedEl) return;
    selectedEl.classList.remove("animate-pulse", "animate-bounce");
    if (fx === "pulse") {
      selectedEl.classList.add("animate-pulse");
    } else if (fx === "bounce") {
      selectedEl.classList.add("animate-bounce");
    } else if (fx === "glow") {
      applyStyle("boxShadow", "0 0 25px 4px rgba(245, 158, 11, 0.65)");
    } else {
      applyStyle("boxShadow", "none");
    }
  };

  const applyShadow = (type: string) => {
    switch (type) {
      case "none":
        applyStyle("boxShadow", "none");
        break;
      case "soft":
        applyStyle("boxShadow", "0 2px 8px -1px rgba(0,0,0,0.1), 0 1px 3px -1px rgba(0,0,0,0.06)");
        break;
      case "3d":
        applyStyle("boxShadow", "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)");
        break;
      case "glow-amber":
        applyStyle("boxShadow", "0 0 20px 2px rgba(245, 158, 11, 0.55)");
        break;
      case "glow-emerald":
        applyStyle("boxShadow", "0 0 20px 2px rgba(16, 185, 129, 0.55)");
        break;
      case "glow-blue":
        applyStyle("boxShadow", "0 0 20px 2px rgba(59, 130, 246, 0.55)");
        break;
      case "glow-purple":
        applyStyle("boxShadow", "0 0 20px 2px rgba(168, 85, 247, 0.55)");
        break;
    }
  };

  const applyFancyPreset = (preset: string) => {
    if (!selectedEl) return;
    if (preset === "gold-vip") {
      applyStyle("background", "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)");
      applyStyle("color", "#FFFFFF");
      applyStyle("boxShadow", "0 4px 15px rgba(217, 119, 6, 0.45)");
      applyStyle("fontWeight", "900");
      applyStyle("borderRadius", "16px");
    } else if (preset === "emerald-pro") {
      applyStyle("background", "linear-gradient(135deg, #10B981 0%, #059669 100%)");
      applyStyle("color", "#FFFFFF");
      applyStyle("boxShadow", "0 4px 15px rgba(5, 150, 105, 0.45)");
      applyStyle("fontWeight", "800");
      applyStyle("borderRadius", "14px");
    } else if (preset === "cyber-blue") {
      applyStyle("background", "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)");
      applyStyle("color", "#FFFFFF");
      applyStyle("boxShadow", "0 4px 18px rgba(37, 99, 235, 0.5)");
      applyStyle("fontWeight", "800");
      applyStyle("borderRadius", "9999px");
    } else if (preset === "stealth-dark") {
      applyStyle("background", "#0F172A");
      applyStyle("color", "#F8FAFC");
      applyStyle("border", "1px solid #334155");
      applyStyle("boxShadow", "0 4px 12px rgba(0, 0, 0, 0.3)");
      applyStyle("fontWeight", "800");
    } else if (preset === "glassmorphism") {
      applyStyle("background", "rgba(255, 255, 255, 0.2)");
      applyStyle("backdropFilter", "blur(12px)");
      applyStyle("border", "1px solid rgba(255, 255, 255, 0.4)");
      applyStyle("color", "#0F172A");
      applyStyle("boxShadow", "0 8px 32px 0 rgba(31, 38, 135, 0.15)");
      applyStyle("borderRadius", "16px");
    }
  };

  const insertNewWidget = (
    type: "card" | "button" | "badge" | "heading" | "stat" | "banner" | "verified_seal" | "whatsapp_cta" | "rating_stars" | "delivery_pill"
  ) => {
    const phoneContainer = appContainerRef.current;
    if (!phoneContainer) return;

    let parent: HTMLElement | null = selectedEl;
    if (!parent || parent.tagName === "BUTTON" || parent.tagName === "INPUT" || parent.tagName === "SPAN") {
      parent = phoneContainer.querySelector(".flex-col") || phoneContainer.querySelector("main") || phoneContainer;
    }

    let newEl: HTMLElement;
    if (type === "card") {
      newEl = document.createElement("div");
      newEl.innerText = "📦 New Feature Card Box\nDrag with mouse or customize via sidebar!";
      newEl.style.background = "#FFFFFF";
      newEl.style.color = "#0F172A";
      newEl.style.padding = "14px";
      newEl.style.borderRadius = "18px";
      newEl.style.border = "1px solid #E2E8F0";
      newEl.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
      newEl.style.margin = "8px 0";
      newEl.style.fontWeight = "bold";
      newEl.style.fontSize = "12px";
    } else if (type === "button") {
      newEl = document.createElement("button");
      newEl.innerText = "⚡ Action Button";
      newEl.style.background = "#2563EB";
      newEl.style.color = "#FFFFFF";
      newEl.style.padding = "10px 18px";
      newEl.style.borderRadius = "14px";
      newEl.style.fontWeight = "900";
      newEl.style.fontSize = "12px";
      newEl.style.margin = "6px 0";
      newEl.style.boxShadow = "0 2px 6px rgba(37,99,235,0.3)";
    } else if (type === "badge") {
      newEl = document.createElement("span");
      newEl.innerText = "🔥 20% DISCOUNT OFFER";
      newEl.style.background = "#FEF3C7";
      newEl.style.color = "#92400E";
      newEl.style.border = "1px solid #FCD34D";
      newEl.style.padding = "4px 10px";
      newEl.style.borderRadius = "9999px";
      newEl.style.fontWeight = "900";
      newEl.style.fontSize = "10px";
      newEl.style.display = "inline-block";
      newEl.style.margin = "4px 0";
    } else if (type === "heading") {
      newEl = document.createElement("h3");
      newEl.innerText = "Custom Section Title";
      newEl.style.color = "#0F172A";
      newEl.style.fontSize = "15px";
      newEl.style.fontWeight = "900";
      newEl.style.margin = "8px 0 4px 0";
    } else if (type === "stat") {
      newEl = document.createElement("div");
      newEl.innerHTML = "<span style='font-size:10px;text-transform:uppercase;color:#64748B;font-weight:bold;display:block;'>Total Sales</span><span style='font-size:18px;font-weight:900;color:#059669;'>₹14,250.00</span>";
      newEl.style.background = "#F0FDF4";
      newEl.style.border = "1px solid #BBF7D0";
      newEl.style.padding = "10px 14px";
      newEl.style.borderRadius = "16px";
      newEl.style.margin = "6px 0";
    } else if (type === "verified_seal") {
      newEl = document.createElement("div");
      newEl.innerHTML = "<span style='margin-right:6px;'>🛡️</span> 100% TRUSTIT VERIFIED PARTNER STORE";
      newEl.style.background = "#EFF6FF";
      newEl.style.color = "#1D4ED8";
      newEl.style.border = "1px solid #BFDBFE";
      newEl.style.padding = "6px 12px";
      newEl.style.borderRadius = "9999px";
      newEl.style.fontWeight = "900";
      newEl.style.fontSize = "10px";
      newEl.style.textAlign = "center";
      newEl.style.margin = "6px 0";
    } else if (type === "whatsapp_cta") {
      newEl = document.createElement("button");
      newEl.innerHTML = "<span style='margin-right:6px;'>💬</span> WhatsApp Order Helpdesk";
      newEl.style.background = "#15803D";
      newEl.style.color = "#FFFFFF";
      newEl.style.padding = "10px 16px";
      newEl.style.borderRadius = "14px";
      newEl.style.fontWeight = "900";
      newEl.style.fontSize = "12px";
      newEl.style.margin = "6px 0";
      newEl.style.boxShadow = "0 3px 10px rgba(21,128,61,0.3)";
    } else if (type === "rating_stars") {
      newEl = document.createElement("div");
      newEl.innerHTML = "<span style='color:#F59E0B;'>★★★★★</span> <strong style='color:#0F172A;'>4.9</strong> <span style='color:#64748B;'>(1,840 Google Reviews)</span>";
      newEl.style.background = "#FFFBEB";
      newEl.style.border = "1px solid #FDE68A";
      newEl.style.padding = "6px 12px";
      newEl.style.borderRadius = "12px";
      newEl.style.fontSize = "11px";
      newEl.style.fontWeight = "700";
      newEl.style.margin = "6px 0";
    } else if (type === "delivery_pill") {
      newEl = document.createElement("div");
      newEl.innerHTML = "⚡ <strong>EXPRESS 10 MIN</strong> • FREE DELIVERY";
      newEl.style.background = "#FEF2F2";
      newEl.style.color = "#DC2626";
      newEl.style.border = "1px solid #FECACA";
      newEl.style.padding = "4px 10px";
      newEl.style.borderRadius = "9999px";
      newEl.style.fontSize = "10px";
      newEl.style.fontWeight = "900";
      newEl.style.textAlign = "center";
      newEl.style.margin = "4px 0";
    } else {
      newEl = document.createElement("div");
      newEl.innerText = "🎉 FESTIVAL MEGA SALE LIVE TODAY! • FREE DELIVERY";
      newEl.style.background = "linear-gradient(135deg, #EA580C 0%, #D97706 100%)";
      newEl.style.color = "#FFFFFF";
      newEl.style.padding = "12px 16px";
      newEl.style.borderRadius = "16px";
      newEl.style.fontWeight = "900";
      newEl.style.fontSize = "11px";
      newEl.style.textAlign = "center";
      newEl.style.margin = "8px 0";
      newEl.style.boxShadow = "0 4px 14px rgba(234,88,12,0.3)";
    }

    parent.appendChild(newEl);

    const insertAction: HistoryItem = {
      type: "insert",
      el: newEl,
      parent: parent,
    };
    setUndoStack((prev) => [...prev.slice(-40), insertAction]);
    setRedoStack([]);

    selectElement(newEl);
    setActiveInspectorTab("basics");
  };

  const duplicateElement = () => {
    if (!selectedEl || !selectedEl.parentNode) return;
    const clone = selectedEl.cloneNode(true) as HTMLElement;
    selectedEl.parentNode.insertBefore(clone, selectedEl.nextSibling);

    const insertAction: HistoryItem = {
      type: "insert",
      el: clone,
      parent: selectedEl.parentElement as HTMLElement,
    };
    setUndoStack((prev) => [...prev.slice(-40), insertAction]);
    setRedoStack([]);

    selectElement(clone);
  };

  const deleteElement = () => {
    if (!selectedEl || !selectedEl.parentNode) return;
    const parent = selectedEl.parentElement as HTMLElement;
    const nextSibling = selectedEl.nextElementSibling as HTMLElement | null;

    const deleteAction: HistoryItem = {
      type: "delete",
      el: selectedEl,
      parent: parent,
      nextSibling: nextSibling,
    };
    setUndoStack((prev) => [...prev.slice(-40), deleteAction]);
    setRedoStack([]);

    selectedEl.remove();
    setSelectedEl(null);
  };

  const handleResetElement = () => {
    if (!selectedEl) return;
    selectedEl.style.marginTop = "";
    selectedEl.style.marginBottom = "";
    selectedEl.style.marginLeft = "";
    selectedEl.style.marginRight = "";
    selectedEl.style.fontSize = "";
    selectedEl.style.fontWeight = "";
    selectedEl.style.fontStyle = "";
    selectedEl.style.textTransform = "";
    selectedEl.style.paddingTop = "";
    selectedEl.style.paddingBottom = "";
    selectedEl.style.paddingLeft = "";
    selectedEl.style.paddingRight = "";
    selectedEl.style.borderRadius = "";
    selectedEl.style.background = "";
    selectedEl.style.backgroundColor = "";
    selectedEl.style.color = "";
    selectedEl.style.boxShadow = "";
    selectedEl.style.border = "";
    selectedEl.style.backdropFilter = "";
    selectedEl.style.opacity = "";
    selectedEl.style.transform = "";
    selectedEl.style.position = "";
    selectedEl.style.zIndex = "";
    selectedEl.classList.remove("animate-pulse", "animate-bounce");
  };

  const colorPalettes = [
    { name: "Amber Gold", bg: "#F59E0B", fg: "#FFFFFF" },
    { name: "Deep Orange", bg: "#EA580C", fg: "#FFFFFF" },
    { name: "Warm Rust", bg: "#C2410C", fg: "#FFFFFF" },
    { name: "Emerald Pro", bg: "#10B981", fg: "#FFFFFF" },
    { name: "Teal Green", bg: "#0D9488", fg: "#FFFFFF" },
    { name: "Mint Lime", bg: "#84CC16", fg: "#0F172A" },
    { name: "Cyber Blue", bg: "#2563EB", fg: "#FFFFFF" },
    { name: "Sky Bright", bg: "#0284C7", fg: "#FFFFFF" },
    { name: "Indigo Hub", bg: "#4F46E5", fg: "#FFFFFF" },
    { name: "Purple Neon", bg: "#9333EA", fg: "#FFFFFF" },
    { name: "Electric Violet", bg: "#7C3AED", fg: "#FFFFFF" },
    { name: "Hot Pink", bg: "#EC4899", fg: "#FFFFFF" },
    { name: "Crimson Rose", bg: "#E11D48", fg: "#FFFFFF" },
    { name: "Coral Flame", bg: "#F43F5E", fg: "#FFFFFF" },
    { name: "Pure Red", bg: "#DC2626", fg: "#FFFFFF" },
    { name: "Midnight Black", bg: "#020617", fg: "#FFFFFF" },
    { name: "Slate Dark", bg: "#0F172A", fg: "#FFFFFF" },
    { name: "Gunmetal Gray", bg: "#334155", fg: "#FFFFFF" },
    { name: "Silver Soft", bg: "#E2E8F0", fg: "#0F172A" },
    { name: "Pristine White", bg: "#FFFFFF", fg: "#0F172A" },
    { name: "Golden Glow Gradient", gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", fg: "#FFFFFF" },
    { name: "Emerald Glow Gradient", gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)", fg: "#FFFFFF" },
    { name: "Royal Purple Gradient", gradient: "linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)", fg: "#FFFFFF" },
    { name: "Sunset Crimson Gradient", gradient: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)", fg: "#FFFFFF" },
    { name: "Ocean Breeze Gradient", gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)", fg: "#FFFFFF" },
    { name: "Cyber Neon Gradient", gradient: "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)", fg: "#FFFFFF" },
    { name: "Dark Velvet Gradient", gradient: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", fg: "#FFFFFF" },
    { name: "Luxe Gold Foil", gradient: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)", fg: "#78350F" },
  ];

  const getDeviceDimensions = () => {
    if (deviceFrame === "compact") return { width: "360px", height: "740px" };
    if (deviceFrame === "tall") return { width: "412px", height: "915px" };
    return { width: "412px", height: "850px" };
  };
  const { width: deviceWidth, height: deviceHeight } = getDeviceDimensions();

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 shadow-lg z-20 gap-2">
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/"
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 text-white flex items-center justify-center font-black text-base shadow-md shrink-0 hover:opacity-90 transition cursor-pointer"
            title="Go to Home"
          >
            🎨
          </a>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black text-white tracking-wider uppercase">
                Trustit Studio v4.0
              </h1>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                SCREEN DESIGNER &amp; PLANNER
              </span>
            </div>
            {/* Quick App Switcher Pills */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">
                🏪 Merchant (56)
              </span>
              <a
                href="/customer-preview"
                className="text-[10px] font-bold text-slate-400 hover:text-blue-300 hover:bg-blue-900/30 px-1.5 py-0.2 rounded transition"
                title="Open Customer 48-Screen Showroom"
              >
                🛍️ Customer (48) ↗
              </a>
              <a
                href="/rider-preview"
                className="text-[10px] font-bold text-slate-400 hover:text-emerald-300 hover:bg-emerald-900/30 px-1.5 py-0.2 rounded transition"
                title="Open Rider 48-Screen Cockpit"
              >
                🛵 Rider (48) ↗
              </a>
            </div>
          </div>
        </div>

        {/* Center: Undo / Redo & Slide Jumper Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PROMINENT UNDO & REDO BUTTONS */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 gap-1 shadow-inner">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs ${
                undoStack.length > 0
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30 cursor-pointer active:scale-95"
                  : "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800/60"
              }`}
              title="Undo (Ctrl + Z)"
            >
              <span className="text-sm">↩️</span>
              <span>Undo</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${undoStack.length > 0 ? "bg-amber-800 text-amber-200" : "bg-slate-800 text-slate-600"}`}>
                {undoStack.length}
              </span>
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs ${
                redoStack.length > 0
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 cursor-pointer active:scale-95"
                  : "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800/60"
              }`}
              title="Redo (Ctrl + Y)"
            >
              <span className="text-sm">↪️</span>
              <span>Redo</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${redoStack.length > 0 ? "bg-blue-800 text-blue-200" : "bg-slate-800 text-slate-600"}`}>
                {redoStack.length}
              </span>
            </button>
          </div>

          {/* Mode Switch */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isEditMode ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>✏️</span>
              <span>Edit Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                !isEditMode ? "bg-emerald-600 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>👁️</span>
              <span>Preview</span>
            </button>
          </div>

          {/* Canvas Zoom Controls */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setCanvasZoom(75)}
              className={`px-2 py-0.5 rounded-lg ${canvasZoom === 75 ? "bg-slate-800 text-amber-300 font-black" : "text-slate-400 hover:text-white"}`}
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => setCanvasZoom(80)}
              className={`px-2 py-0.5 rounded-lg ${canvasZoom === 80 ? "bg-slate-800 text-amber-300 font-black" : "text-slate-400 hover:text-white"}`}
            >
              80%
            </button>
            <button
              type="button"
              onClick={() => setCanvasZoom(85)}
              className={`px-2 py-0.5 rounded-lg ${canvasZoom === 85 ? "bg-slate-800 text-amber-300 font-black" : "text-slate-400 hover:text-white"}`}
            >
              85%
            </button>
            <button
              type="button"
              onClick={() => setCanvasZoom(100)}
              className={`px-2 py-0.5 rounded-lg ${canvasZoom === 100 ? "bg-slate-800 text-amber-300 font-black" : "text-slate-400 hover:text-white"}`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setCanvasZoom(115)}
              className={`px-2 py-0.5 rounded-lg ${canvasZoom === 115 ? "bg-slate-800 text-amber-300 font-black" : "text-slate-400 hover:text-white"}`}
            >
              115%
            </button>
          </div>

          {/* Alignment Grid Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowGridLines(!showGridLines)}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition flex items-center gap-1 ${
              showGridLines ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="Toggle Alignment Grid Guides"
          >
            <span>📐</span>
            <span className="hidden md:inline">Grid</span>
          </button>
        </div>

        {/* MASTER SCREEN SELECTOR & CHANGES */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Screen:</span>
            <select
              value={activeScreenIndex}
              onChange={(e) => jumpToScreen(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 text-xs text-amber-300 rounded-lg px-2 py-1.5 font-bold focus:outline-hidden max-w-[210px] truncate"
            >
              {SCREENS_SEQUENCE.map((s, idx) => (
                <option key={s.key} value={idx}>
                  {idx + 1}. {s.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowChangesModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <span>💾</span>
            <span>Changes ({appliedChanges.length})</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Split: Center Canvas (Phone) + Right Docked Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* CENTER VIEWPORT CANVAS: Mouse Wheel & Swipe to Slide Up/Down */}
        <div
          onWheel={handleCanvasWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-1 bg-[#090D16] flex flex-col items-center justify-start p-4 pt-6 pb-36 overflow-y-auto relative select-none"
        >
          {/* Quick Floating Top Bar */}
          {isEditMode && selectedEl && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-2xl z-30 flex items-center gap-3 border border-slate-700">
              <span className="flex items-center gap-1 text-blue-400 font-mono">
                <span>Selected:</span>
                <span className="font-black">&lt;{selectedEl.tagName.toLowerCase()}&gt;</span>
              </span>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={selectParent}
                className="hover:text-amber-300 text-slate-300 transition flex items-center gap-0.5"
                title="Select Parent Container"
              >
                <span>⬆️ Parent Box</span>
              </button>
              <button
                type="button"
                onClick={selectFirstChild}
                className="hover:text-amber-300 text-slate-300 transition flex items-center gap-0.5"
                title="Select Inner Element"
              >
                <span>⬇️ Inside</span>
              </button>
              <span className="text-slate-600">|</span>
              <span className="text-amber-300 flex items-center gap-1 font-normal">
                <span>🖱️</span>
                <span>Drag with mouse freely!</span>
              </span>
            </div>
          )}

          {/* Scaled Phone Frame Container with Smooth Slide Animation */}
          <div
            style={{
              transform: `scale(${canvasZoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="shrink-0 relative my-auto"
          >
            {/* Optional Alignment Grid Lines */}
            {showGridLines && (
              <div
                className="absolute inset-0 pointer-events-none z-40 rounded-[38px] opacity-25"
                style={{
                  backgroundImage: "radial-gradient(#3B82F6 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
            )}

            {/* Phone Container with Dynamic Scoped Theme and Zero Overlap */}
            <div
              key={`${currentScreen.key}_${activeVariantId}`}
              ref={appContainerRef}
              style={{
                width: deviceWidth,
                height: deviceHeight,
                backgroundColor: pageBgColor,
              }}
              className={`phone-theme-wrapper rounded-[38px] border-[5px] ${
                isEditMode ? "border-blue-500 ring-8 ring-blue-500/10 shadow-2xl shadow-blue-900/40" : "border-slate-800"
              } overflow-hidden flex flex-col relative transition-all duration-300 ease-out select-none ${
                slideDirection === "up"
                  ? "translate-y-8 opacity-70 scale-95"
                  : slideDirection === "down"
                  ? "-translate-y-8 opacity-70 scale-95"
                  : "translate-y-0 opacity-100 scale-100"
              }`}
            >
              <style dangerouslySetInnerHTML={{ __html: getVariantCSS(activeVariantId) }} />
              <MerchantNativeAppShell
                initialAuth={currentScreen.props.initialAuth}
                initialAuthStep={currentScreen.props.initialAuthStep}
                initialCategory={currentScreen.props.initialCategory}
                initialTab={currentScreen.props.initialTab}
                initialSubScreen={currentScreen.props.initialSubScreen}
                initialLandingVariant={activeVariantId}
                activeVariant={activeVariantId}
                initialStoreName="Shri Balaji Daily Needs"
                initialOwnerName="Aman Sharma"
                forceStandalone={true}
              />
            </div>
          </div>

          {/* ========================================== */}
          {/* BOTTOM SLIDE-UP & NAVIGATION CONTROLLER (Zero Overlap) */}
          {/* ========================================== */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            {!isNavMinimized ? (
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl shadow-black/80 flex items-center gap-2">
                {/* Previous Screen Button */}
                <button
                  type="button"
                  onClick={goToPrevScreen}
                  disabled={activeScreenIndex === 0}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    activeScreenIndex > 0
                      ? "bg-slate-800 hover:bg-slate-700 text-white active:scale-95 shadow-md cursor-pointer"
                      : "bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800"
                  }`}
                  title="Pichli Screen (Alt + Up / Wheel Up)"
                >
                  <span>⬆️</span>
                  <span className="hidden sm:inline">Pichli</span>
                </button>

                {/* Screen Counter & Title Indicator */}
                <div className="flex items-center gap-2 px-2 border-x border-slate-700/80">
                  <span className="text-[10px] font-black text-amber-400 font-mono bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40 shrink-0">
                    {activeScreenIndex + 1} / {SCREENS_SEQUENCE.length}
                  </span>
                  <span className="text-xs font-black text-white max-w-[190px] truncate" title={currentScreen.title}>
                    {currentScreen.title}
                  </span>
                </div>

                {/* SLIDE UP (AGLI SCREEN) BUTTON */}
                <button
                  type="button"
                  onClick={goToNextScreen}
                  disabled={activeScreenIndex === SCREENS_SEQUENCE.length - 1}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                    activeScreenIndex < SCREENS_SEQUENCE.length - 1
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/50 active:scale-95 cursor-pointer ring-2 ring-blue-400/30"
                      : "bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800"
                  }`}
                  title="Agli Screen par Slide Karein (Alt + Down / Wheel Down)"
                >
                  <span>Slide Up</span>
                  <span className="text-sm">⬇️</span>
                </button>

                {/* Hide / Minimize Button */}
                <button
                  type="button"
                  onClick={() => setIsNavMinimized(true)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                  title="Minimize bar for 100% full phone visibility"
                >
                  👁️ Hide
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsNavMinimized(false)}
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-black px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-2xl flex items-center gap-2 cursor-pointer backdrop-blur-xl transition active:scale-95 ring-1 ring-amber-500/30"
                title="Click to show navigation bar"
              >
                <span>⬆️ Screen {activeScreenIndex + 1}/56 ⬇️</span>
                <span className="text-[10px] text-amber-400 font-mono">👁️ Show Nav</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT DOCKED SIDEBAR: Comprehensive Inspector Panel */}
        <aside className="studio-docked-sidebar w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 shadow-2xl z-30 overflow-hidden">
          {/* Sidebar Header with UNDO & REDO directly in panel */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <h2 className="text-xs font-black text-white uppercase tracking-wider truncate">
                {selectedEl ? (
                  <span>
                    &lt;<span className="text-blue-400 font-mono">{selectedEl.tagName.toLowerCase()}</span>&gt;
                  </span>
                ) : (
                  <span>Inspector Controls</span>
                )}
              </h2>
            </div>

            {/* Quick Panel Undo / Redo & Action Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className={`text-[10px] font-black px-2 py-1 rounded-md transition flex items-center gap-0.5 ${
                  undoStack.length > 0 ? "bg-amber-600 hover:bg-amber-500 text-white cursor-pointer" : "bg-slate-800/60 text-slate-600 cursor-not-allowed"
                }`}
                title="Undo (Ctrl + Z)"
              >
                <span>↩️</span>
                <span>Undo</span>
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className={`text-[10px] font-black px-2 py-1 rounded-md transition flex items-center gap-0.5 ${
                  redoStack.length > 0 ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer" : "bg-slate-800/60 text-slate-600 cursor-not-allowed"
                }`}
                title="Redo (Ctrl + Y)"
              >
                <span>↪️</span>
                <span>Redo</span>
              </button>

              {selectedEl && (
                <>
                  <button
                    type="button"
                    onClick={duplicateElement}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold px-2 py-1 rounded-md transition"
                    title="Duplicate Element"
                  >
                    📑
                  </button>
                  <button
                    type="button"
                    onClick={deleteElement}
                    className="text-[10px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold px-2 py-1 rounded-md border border-rose-800/60 transition"
                    title="Delete Element"
                  >
                    🗑️
                  </button>
                  <button
                    type="button"
                    onClick={handleResetElement}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded-md transition"
                    title="Reset Styles"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* ✨ AI DESIGN STUDIO: 6 MULTI-STYLE SCREEN VARIATIONS */}
          {/* ========================================================= */}
          <div className="p-3 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-sm">✨</span>
                <div>
                  <h3 className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                    <span>AI Design Recommendations</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-mono">
                      6 Options
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Screen {activeScreenIndex + 1}/56: {currentScreen.title.split(":")[0]}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowBlueprintModal(true)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                title="View Blueprint Matrix for all 56 screens"
              >
                <span>📋</span>
                <span>Matrix ({finalizedCount}/56)</span>
              </button>
            </div>

            {/* 6 Variant Cards Grid (2 cols x 3 rows) */}
            <div className="grid grid-cols-2 gap-1.5">
              {UNIVERSAL_VARIANTS.map((v) => {
                const isSelected = activeVariantId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVariant(currentScreen.key, v.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-800 border-amber-400 shadow-lg shadow-amber-950/40 ring-2 ring-amber-400/40"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{v.icon}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${
                          isSelected ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold" : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}>
                          Option {v.number}
                        </span>
                      </div>
                      <div className="text-[11px] font-black text-white leading-tight">
                        {v.name}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400 leading-tight mt-1 line-clamp-2">
                      {v.tagline}
                    </div>
                    {isSelected && (
                      <div className="mt-1.5 pt-1 border-t border-slate-700/80 flex items-center justify-between text-[9px] font-bold text-amber-300">
                        <span>✓ Active</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lock & Slide Next Action Row */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleLockAndSlideNext(currentScreen.key)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition cursor-pointer active:scale-98 ring-1 ring-emerald-400/40"
                title="Save this design option and slide up to next screen"
              >
                <span>💾</span>
                <span>Save &amp; Slide Next</span>
                <span className="text-sm">⬇️</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleLock(currentScreen.key)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                  isCurrentScreenLocked
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
                title={isCurrentScreenLocked ? "Design is finalized & locked" : "Mark as Finalized"}
              >
                <span>{isCurrentScreenLocked ? "🔒 Locked" : "🔓 Lock"}</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Finalized Screens:</span>
                <span className="font-bold text-amber-300">{finalizedCount} / {SCREENS_SEQUENCE.length} Finalized</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${(finalizedCount / SCREENS_SEQUENCE.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 8 TABS NAVIGATION */}
          <div className="grid grid-cols-4 border-b border-slate-800 text-[10px] font-bold text-center bg-slate-950">
            <button
              type="button"
              onClick={() => setActiveInspectorTab("basics")}
              className={`py-2 transition border-b-2 ${
                activeTab === "basics" ? "border-blue-500 text-blue-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🎯 Move &amp; Layer
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("elements")}
              className={`py-2 transition border-b-2 ${
                activeTab === "elements" ? "border-amber-500 text-amber-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              ➕ Boxes &amp; UI
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("size")}
              className={`py-2 transition border-b-2 ${
                activeTab === "size" ? "border-blue-500 text-blue-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🔲 Size &amp; Margin
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("typography")}
              className={`py-2 transition border-b-2 ${
                activeTab === "typography" ? "border-blue-500 text-blue-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🔤 Font &amp; Text
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("colors")}
              className={`py-2 transition border-b-2 ${
                activeTab === "colors" ? "border-blue-500 text-blue-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🎨 28+ Colors
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("fancy")}
              className={`py-2 transition border-b-2 ${
                activeTab === "fancy" ? "border-amber-500 text-amber-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              ✨ 3D &amp; FX
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("layers")}
              className={`py-2 transition border-b-2 ${
                activeTab === "layers" ? "border-emerald-500 text-emerald-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🌳 Layers
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("device")}
              className={`py-2 transition border-b-2 ${
                activeTab === "device" ? "border-purple-500 text-purple-400 bg-slate-900" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              📱 Page &amp; Bg
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs [scrollbar-width:none]">
            {/* TAB 1: 🎯 FREE MOVE, JUMP, ALIGN & OVER-LAYER */}
            {activeTab === "basics" && (
              <>
                {!selectedEl ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <span className="text-2xl block">👆</span>
                    <p className="font-bold text-white">Kisi bhi Button, Card ya Text par tap karein!</p>
                    <p className="text-[11px] text-slate-500">
                      Jaise hi aap tap karenge, use kisi bhi box ke upar khiskane, structural jump aur over-layer karne ke saare controls yahan khul jayenge.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* A. STRUCTURAL DOM JUMP */}
                    <div className="bg-gradient-to-br from-blue-950/60 to-slate-950 border border-blue-500/40 rounded-2xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                          🚀 Structural Move (Boxes ke Upar/Niche):
                        </span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                          Zero-Overlap
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Button ko charon box ke upar leke jana hai? Yeh buttons use layout me physically upar shift kar denge:
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={moveDomTop}
                          className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                        >
                          <span>🚀</span> <span>Sabse Upar (Top)</span>
                        </button>
                        <button
                          type="button"
                          onClick={moveDomBottom}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                        >
                          <span>⚓</span> <span>Sabse Niche (Bottom)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={moveDomUp}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>⏫</span> <span>Ek Box Upar</span>
                        </button>
                        <button
                          type="button"
                          onClick={moveDomDown}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>⏬</span> <span>Ek Box Niche</span>
                        </button>
                      </div>
                    </div>

                    {/* B. QUICK ALIGNMENT & ROTATION TILT */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        📐 Alignment &amp; Tilt:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 font-bold text-[11px]">
                        <button
                          type="button"
                          onClick={alignLeft}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          ⇤ Left
                        </button>
                        <button
                          type="button"
                          onClick={centerElement}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black"
                        >
                          🎯 Center
                        </button>
                        <button
                          type="button"
                          onClick={alignRight}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Right ⇥
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 font-bold text-[10px] pt-1">
                        <button
                          type="button"
                          onClick={() => setRotation(-5)}
                          className="py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-300"
                        >
                          Tilt -5°
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotation(0)}
                          className="py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
                        >
                          Straight 0°
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotation(5)}
                          className="py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-300"
                        >
                          Tilt +5°
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotation(15)}
                          className="py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-300"
                        >
                          Tilt +15°
                        </button>
                      </div>
                    </div>

                    {/* C. OVER LAYER & UNDER LAYER */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        🪟 Over Layer &amp; Under Layer (Z-Index):
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLayer("front")}
                          className="py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition"
                        >
                          <span>🔝</span> <span>Over Layer (Sabse Upar)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLayer("back")}
                          className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                        >
                          <span>🔽</span> <span>Under Layer (Peeche)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setLayer("up")}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1"
                        >
                          <span>⬆️</span> <span>+1 Layer Upar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLayer("down")}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1"
                        >
                          <span>⬇️</span> <span>-1 Layer Niche</span>
                        </button>
                      </div>
                    </div>

                    {/* D. 2D TRANSFORM D-PAD */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          🎯 Free Floating D-Pad:
                        </span>
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[9px] font-bold">
                          {[2, 5, 10, 20, 50, 100].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setStepSize(s)}
                              className={`px-1.5 py-0.5 rounded ${stepSize === s ? "bg-blue-600 text-white font-black" : "text-slate-400 hover:text-white"}`}
                            >
                              {s}px
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => shiftTranslate(0, -stepSize)}
                          className="w-32 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 active:scale-95 text-white font-bold flex items-center justify-center gap-1 transition shadow-md"
                        >
                          <span>⬆️</span> <span>Upar (-{stepSize}px)</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => shiftTranslate(-stepSize, 0)}
                            className="w-24 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 active:scale-95 text-white font-bold flex items-center justify-center gap-1 transition shadow-md"
                          >
                            <span>⬅️ Left</span>
                          </button>
                          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] text-amber-400 font-mono font-bold">
                            {stepSize}px
                          </div>
                          <button
                            type="button"
                            onClick={() => shiftTranslate(stepSize, 0)}
                            className="w-24 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 active:scale-95 text-white font-bold flex items-center justify-center gap-1 transition shadow-md"
                          >
                            <span>Right ➡️</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => shiftTranslate(0, stepSize)}
                          className="w-32 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 active:scale-95 text-white font-bold flex items-center justify-center gap-1 transition shadow-md"
                        >
                          <span>⬇️</span> <span>Niche (+{stepSize}px)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 2: ➕ ADD NEW BOXES & WIDGETS */}
            {activeTab === "elements" && (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    📦 Add UI Components &amp; Blocks:
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Neeche diye gaye kisi bhi widget par tap karein, wo turant phone screen par insert ho jayega:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => insertNewWidget("card")}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 text-left transition"
                    >
                      <span className="text-base">📦</span>
                      <div>
                        <span className="block font-black text-white">White Card Box</span>
                        <span className="text-[9px] text-slate-400 block">Rounded Container</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("button")}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 text-left transition shadow-md shadow-blue-900/30"
                    >
                      <span className="text-base">🔘</span>
                      <div>
                        <span className="block font-black text-white">Action Button</span>
                        <span className="text-[9px] text-blue-200 block">Clickable CTA</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("verified_seal")}
                      className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 text-blue-300 font-bold text-xs flex items-center gap-2 border border-blue-500/30 text-left transition"
                    >
                      <span className="text-base">🛡️</span>
                      <div>
                        <span className="block font-black text-blue-300">Trustit Verified</span>
                        <span className="text-[9px] text-blue-400/80 block">Official Trust Seal</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("whatsapp_cta")}
                      className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 active:scale-95 text-emerald-300 font-bold text-xs flex items-center gap-2 border border-emerald-500/40 text-left transition"
                    >
                      <span className="text-base">💬</span>
                      <div>
                        <span className="block font-black text-emerald-300">WhatsApp Help</span>
                        <span className="text-[9px] text-emerald-400/80 block">Direct Chat Pill</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("rating_stars")}
                      className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 font-bold text-xs flex items-center gap-2 border border-amber-500/30 text-left transition"
                    >
                      <span className="text-base">⭐</span>
                      <div>
                        <span className="block font-black text-amber-300">Star Rating Bar</span>
                        <span className="text-[9px] text-amber-400/80 block">4.9 (1.8k Reviews)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("delivery_pill")}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-300 font-bold text-xs flex items-center gap-2 border border-rose-500/30 text-left transition"
                    >
                      <span className="text-base">⚡</span>
                      <div>
                        <span className="block font-black text-rose-300">10-Min Delivery</span>
                        <span className="text-[9px] text-rose-400/80 block">Express Pill</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("badge")}
                      className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-bold text-xs flex items-center gap-2 border border-amber-500/40 text-left transition"
                    >
                      <span className="text-base">🏷️</span>
                      <div>
                        <span className="block font-black text-amber-300">Offer Badge</span>
                        <span className="text-[9px] text-amber-400/80 block">20% Discount Tag</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("heading")}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 text-left transition"
                    >
                      <span className="text-base">✍️</span>
                      <div>
                        <span className="block font-black text-white">Heading Title</span>
                        <span className="text-[9px] text-slate-400 block">Section Header</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("stat")}
                      className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 font-bold text-xs flex items-center gap-2 border border-emerald-500/40 text-left transition"
                    >
                      <span className="text-base">📊</span>
                      <div>
                        <span className="block font-black text-emerald-300">Revenue Stat Box</span>
                        <span className="text-[9px] text-emerald-400/80 block">Metric Counter</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertNewWidget("banner")}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 text-left transition shadow-md"
                    >
                      <span className="text-base">🎉</span>
                      <div>
                        <span className="block font-black text-white">Promo Banner</span>
                        <span className="text-[9px] text-orange-200 block">Offer Strip</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SIZE & MARGINS */}
            {activeTab === "size" && (
              <>
                {!selectedEl ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Pehle phone screen par kisi bhi text ya button par tap karein!
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        🔍 Quick Scale / Size Ratio:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 font-bold text-[10px]">
                        <button
                          type="button"
                          onClick={() => setElementScale(0.75)}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          0.75x
                        </button>
                        <button
                          type="button"
                          onClick={() => setElementScale(0.9)}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          0.9x
                        </button>
                        <button
                          type="button"
                          onClick={() => setElementScale(1.0)}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black"
                        >
                          1.0x (Normal)
                        </button>
                        <button
                          type="button"
                          onClick={() => setElementScale(1.25)}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          1.25x (Bada)
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        🔲 Button Size (Padding):
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => adjustPadding(-3)}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold flex items-center justify-center gap-1.5"
                        >
                          <span>➖</span> <span>Chhota Size (-3px)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustPadding(3)}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold flex items-center justify-center gap-1.5"
                        >
                          <span>➕</span> <span>Bada Size (+3px)</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        ↕️ Margins (Spacing Upar / Niche):
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => adjustMarginTop(-10)}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                        >
                          Pull Up (-10px)
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustMarginTop(10)}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                        >
                          Push Down (+10px)
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        ↔️ Button Width:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 font-bold text-[10px]">
                        <button
                          type="button"
                          onClick={() => applyStyle("width", "auto")}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Fit Text
                        </button>
                        <button
                          type="button"
                          onClick={() => applyStyle("width", "50%")}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Half (50%)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyStyle("width", "100%")}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Full (100%)
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        🔘 Roundness &amp; Shape:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[10px]">
                        <button
                          type="button"
                          onClick={() => setBorderRadius("0px")}
                          className="py-2 rounded-none bg-slate-800 hover:bg-blue-600 text-white"
                        >
                          Square
                        </button>
                        <button
                          type="button"
                          onClick={() => setBorderRadius("8px")}
                          className="py-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-white"
                        >
                          Soft (8px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBorderRadius("18px")}
                          className="py-2 rounded-2xl bg-slate-800 hover:bg-blue-600 text-white"
                        >
                          Round (18px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBorderRadius("9999px")}
                          className="py-2 rounded-full bg-slate-800 hover:bg-blue-600 text-white"
                        >
                          Full Pill
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 4: TYPOGRAPHY */}
            {activeTab === "typography" && (
              <>
                {!selectedEl ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Pehle phone screen par kisi bhi text ya button par tap karein!
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        ✏️ Edit Text Label:
                      </label>
                      <input
                        type="text"
                        value={currentText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Type new label text..."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        🔤 Font Size:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => adjustFontSize(-2)}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold flex items-center justify-center gap-1.5"
                        >
                          <span>A-</span> <span>Chhota Font (-2px)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustFontSize(2)}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold flex items-center justify-center gap-1.5"
                        >
                          <span>A+</span> <span>Bada Font (+2px)</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        💪 Font Weight (Thickness):
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[10px]">
                        <button
                          type="button"
                          onClick={() => setFontWeightDirect("400")}
                          className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-normal"
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontWeightDirect("600")}
                          className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                        >
                          Medium
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontWeightDirect("800")}
                          className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontWeightDirect("900")}
                          className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-black"
                        >
                          Black
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        🖋️ Font Styling:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[10px]">
                        <button
                          type="button"
                          onClick={toggleBold}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black"
                        >
                          B Bold
                        </button>
                        <button
                          type="button"
                          onClick={toggleItalic}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 italic font-serif"
                        >
                          I Italic
                        </button>
                        <button
                          type="button"
                          onClick={toggleUppercase}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 uppercase"
                        >
                          CAPS
                        </button>
                        <button
                          type="button"
                          onClick={toggleUnderline}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 underline"
                        >
                          Line
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        🔀 Text Alignment:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 font-bold text-[10px]">
                        <button
                          type="button"
                          onClick={() => applyStyle("textAlign", "left")}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                        >
                          Left ⇤
                        </button>
                        <button
                          type="button"
                          onClick={() => applyStyle("textAlign", "center")}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                        >
                          Center ⇥⇤
                        </button>
                        <button
                          type="button"
                          onClick={() => applyStyle("textAlign", "right")}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                        >
                          Right ⇥
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 5: COLORS & OPACITY */}
            {activeTab === "colors" && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  🎨 Choose from 28+ Colors &amp; Gradients:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {colorPalettes.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (c.gradient) {
                          applyStyle("background", c.gradient);
                        } else if (c.bg) {
                          applyStyle("background", "");
                          applyStyle("backgroundColor", c.bg);
                        }
                        if (c.fg) applyStyle("color", c.fg);
                      }}
                      style={{
                        background: c.gradient || c.bg,
                      }}
                      className="h-11 rounded-xl border border-slate-700/80 shadow-md hover:scale-105 active:scale-95 transition flex items-center justify-center p-1 text-[9px] font-black text-center leading-tight select-none"
                      title={c.name}
                    >
                      <span style={{ color: c.fg || "#FFFFFF" }} className="drop-shadow-xs">
                        {c.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Custom Background Color:</span>
                  <input
                    type="color"
                    onChange={(e) => {
                      applyStyle("background", "");
                      applyStyle("backgroundColor", e.target.value);
                    }}
                    className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Custom Text Color:</span>
                  <input
                    type="color"
                    onChange={(e) => {
                      applyStyle("color", e.target.value);
                    }}
                    className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    🌫️ Opacity (Transparency):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[10px]">
                    <button
                      type="button"
                      onClick={() => applyStyle("opacity", "0.4")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      40%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStyle("opacity", "0.7")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      70%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStyle("opacity", "0.9")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      90%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStyle("opacity", "1.0")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black"
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: FANCY 3D, GLOW & BORDERS */}
            {activeTab === "fancy" && (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    ✨ 1-Click Fancy Preset Styles:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyFancyPreset("gold-vip")}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-black text-xs shadow-lg active:scale-95 transition text-left"
                    >
                      👑 Gold VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFancyPreset("emerald-pro")}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-black text-xs shadow-lg active:scale-95 transition text-left"
                    >
                      🌿 Emerald Pro
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFancyPreset("cyber-blue")}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs shadow-lg active:scale-95 transition text-left"
                    >
                      ⚡ Cyber Blue
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFancyPreset("glassmorphism")}
                      className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white font-black text-xs shadow-lg active:scale-95 transition text-left"
                    >
                      🪟 Glass Blur
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                    ⚡ Live Animation FX:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAnimationEffect("pulse")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-white"
                    >
                      💓 Pulse
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnimationEffect("bounce")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-white"
                    >
                      🦘 Bounce
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnimationEffect("none")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
                    >
                      Stop FX
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    🌟 3D Elevation &amp; Neon Glow:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => applyShadow("soft")}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                    >
                      Soft Elevation
                    </button>
                    <button
                      type="button"
                      onClick={() => applyShadow("3d")}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-xl"
                    >
                      Heavy 3D Lift
                    </button>
                    <button
                      type="button"
                      onClick={() => applyShadow("glow-amber")}
                      className="py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300"
                    >
                      Amber Neon Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => applyShadow("glow-emerald")}
                      className="py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                    >
                      Green Neon Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => applyShadow("glow-blue")}
                      className="py-2 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-300"
                    >
                      Blue Neon Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => applyShadow("none")}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
                    >
                      Remove Glow
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    📏 Border Stroke Style:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => applyStyle("border", "none")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStyle("border", "2px solid #3B82F6")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400"
                    >
                      Solid Blue
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStyle("border", "2px dashed #F59E0B")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400"
                    >
                      Dashed Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStyle("border", "2px solid #10B981")}
                      className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    >
                      Emerald
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: 🌳 LAYERS TREE */}
            {activeTab === "layers" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    🌳 Page Elements Tree ({layersList.length}):
                  </span>
                  <button
                    type="button"
                    onClick={scanLayers}
                    className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Kisi bhi element ko direct select karne ke liye list me tap karein:
                </p>
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {layersList.map((item, idx) => {
                    const isSelected = selectedEl === item.el;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectElement(item.el)}
                        style={{ paddingLeft: `${8 + item.depth * 12}px` }}
                        className={`w-full text-left py-1.5 pr-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          isSelected ? "bg-blue-600 text-white font-black" : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="text-[10px] font-mono text-blue-400">&lt;{item.tagName}&gt;</span>
                        <span className="truncate text-slate-200">{item.previewText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 8: 📱 PAGE & DEVICE SETTINGS */}
            {activeTab === "device" && (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                    📱 Device Frame Simulator:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 font-bold text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDeviceFrame("compact")}
                      className={`py-1.5 rounded-xl ${deviceFrame === "compact" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300"}`}
                    >
                      Compact (360px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceFrame("standard")}
                      className={`py-1.5 rounded-xl ${deviceFrame === "standard" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300"}`}
                    >
                      Standard (412px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceFrame("tall")}
                      className={`py-1.5 rounded-xl ${deviceFrame === "tall" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300"}`}
                    >
                      Tall (915px)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    🎨 Page Background Color:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPageBgColor("#FFFFFF")}
                      className="py-1.5 rounded-xl bg-white text-slate-900 border"
                    >
                      Pure White
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageBgColor("#F8FAFC")}
                      className="py-1.5 rounded-xl bg-slate-100 text-slate-800 border"
                    >
                      Soft Gray
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageBgColor("#FFFBEB")}
                      className="py-1.5 rounded-xl bg-amber-50 text-amber-900 border"
                    >
                      Warm Cream
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageBgColor("#0F172A")}
                      className="py-1.5 rounded-xl bg-slate-900 text-white border border-slate-700"
                    >
                      Dark Mode
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Changes Modal */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-base font-black text-white">Your Visual Customizations</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangesModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Aapne jo bhi buttons chhota/bada, upar/niche ya fancy banaye hain, unki summary:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-xs">
              {appliedChanges.length === 0 ? (
                <div className="text-slate-500 text-center py-4">Abhi tak koi change nahi kiya gaya. Screen par kisi button par click karke edit karein!</div>
              ) : (
                appliedChanges.map((change, idx) => (
                  <div key={idx} className="pb-2 border-b border-slate-800/80">
                    <span className="text-blue-400 font-bold">&lt;{change.tagName}&gt;</span>{" "}
                    <span className="text-slate-300">"{change.previewText}"</span>:
                    <div className="pl-4 text-emerald-400 text-[11px] mt-0.5">
                      {Object.entries(change.styles).map(([prop, val]) => (
                        <div key={prop}>
                          {prop}: {val};
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(appliedChanges, null, 2));
                  alert("Copied changes to clipboard!");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Copy to Clipboard
              </button>

              <button
                type="button"
                onClick={() => setShowChangesModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-black px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-3">
          <span>✨</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* 56-SCREEN MASTER BLUEPRINT MATRIX MODAL */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center text-white text-xl shadow-lg shrink-0">
                  📋
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>56-Screen Merchant Partner Blueprints</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                      {finalizedCount} / 56 Finalized
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review and finalize selected design variants across all 56 native screens
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveAllBlueprintsToProject}
                  disabled={isSavingBlueprints}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                >
                  <span>💾</span>
                  <span>{isSavingBlueprints ? "Saving..." : "Save Blueprints to Project"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBlueprintModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto shrink-0 [scrollbar-width:none]">
              {[
                "all",
                "1. Onboarding Stack",
                "2. Industry Cockpits",
                "3. Order Processing & Hardware",
                "4. Live Inventory & Catalog",
                "5. Standee Merchandise & Print",
                "6. Hyperlocal Marketing & AI",
                "7. Analytics & Plans",
                "8. Settlement & Bank KYC",
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBlueprintCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    blueprintCategoryFilter === cat
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {cat === "all" ? "🌟 All 56 Screens" : cat}
                </button>
              ))}
            </div>

            {/* Screens List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 [scrollbar-width:thin]">
              {SCREENS_SEQUENCE.filter(
                (s) => blueprintCategoryFilter === "all" || s.category === blueprintCategoryFilter
              ).map((screenDef, idx) => {
                const screenRealIndex = SCREENS_SEQUENCE.findIndex((s) => s.key === screenDef.key);
                const selectedVarId = savedScreenVariants[screenDef.key] || "opt1_bharatpe";
                const isLocked = !!lockedScreens[screenDef.key];
                const variantObj = UNIVERSAL_VARIANTS.find((v) => v.id === selectedVarId) || UNIVERSAL_VARIANTS[0];

                return (
                  <div
                    key={screenDef.key}
                    className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      screenRealIndex === activeScreenIndex
                        ? "bg-blue-950/40 border-blue-500/60 ring-2 ring-blue-500/30"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {screenRealIndex + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white truncate">
                            {screenDef.title}
                          </h4>
                          {isLocked && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ✓ Locked
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {screenDef.category}
                        </span>
                      </div>
                    </div>

                    {/* Option Selector Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        {UNIVERSAL_VARIANTS.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleSelectVariant(screenDef.key, v.id)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                              selectedVarId === v.id
                                ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                                : "text-slate-400 hover:text-white"
                            }`}
                            title={v.name}
                          >
                            <span>{v.icon}</span>
                            <span className="hidden md:inline">Opt {v.number}</span>
                          </button>
                        ))}
                      </div>

                      {/* Jump to Screen Button */}
                      <button
                        type="button"
                        onClick={() => {
                          jumpToScreen(screenRealIndex);
                          setShowBlueprintModal(false);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                        title="Jump to edit this screen in canvas"
                      >
                        <span>👁️ View</span>
                      </button>

                      {/* Lock Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleLock(screenDef.key)}
                        className={`p-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isLocked
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                        title={isLocked ? "Screen design finalized & locked" : "Mark as Finalized"}
                      >
                        {isLocked ? "🔒" : "🔓"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span>Total: 56 Screens</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{finalizedCount} Finalized</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{56 - finalizedCount} Pending</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allLocked: Record<string, boolean> = {};
                    SCREENS_SEQUENCE.forEach((s) => (allLocked[s.key] = true));
                    setLockedScreens(allLocked);
                    persistBlueprints(savedScreenVariants, allLocked);
                    saveAllBlueprintsToProject();
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition cursor-pointer"
                >
                  ⚡ Mark All 56 as Finalized
                </button>

                <button
                  type="button"
                  onClick={() => setShowBlueprintModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
