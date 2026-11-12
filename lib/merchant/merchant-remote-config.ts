/**
 * Trustit Merchant Partner - Server-Driven Operational Config & State
 * Manages operational settings for the Merchant Partner App:
 * - Outlet Open/Closed status
 * - Delivery Radius & Geofence
 * - Operating Timings & Shift Pauses
 * - Google Review Gating & Place Link
 * - IMPS Bank KYC Verification
 */

import fs from "fs";
import path from "path";

export interface MerchantRemoteConfig {
  businessId: string;
  storeName: string;
  ownerName: string;
  businessCategory: "kirana" | "restaurant" | "chemist" | "salon" | "carwash";
  phone: string;
  address: string;
  city: string;
  isStoreOnline: boolean;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  openingTime: string;
  closingTime: string;
  isFestivalMode: boolean;
  isLunchPause: boolean;
  googlePlaceId: string;
  reviewShortLink: string;
  smartGatingMinStars: number;
  logoUrl?: string;
  cashierPin?: string;
  twoFactorEnabled?: boolean;
  loginAlerts?: boolean;
  printerSettings?: {
    connectionType: "bluetooth" | "usb";
    paperSize: "58mm" | "80mm";
    autoCut: boolean;
  };
  branches?: Array<{
    id: string;
    name: string;
    locality: string;
    phone?: string;
    idCode: string;
    active: boolean;
    pendingOrders: number;
    revenueToday: string;
  }>;
  staffList?: Array<{
    name: string;
    role: string;
    phone: string;
    access: string;
    badge: string;
  }>;
  bankAccount: {
    accountNumberMask: string;
    ifsc: string;
    holderName: string;
    isVerified: boolean;
    verifiedLive?: boolean;
    utr?: string;
    updatedAt?: string;
  };
  lastUpdatedAt: string;
}

const DEFAULT_CONFIG: MerchantRemoteConfig = {
  businessId: "",
  storeName: "My Store",
  ownerName: "Merchant Partner",
  businessCategory: "kirana",
  phone: "",
  address: "",
  city: "",
  isStoreOnline: true,
  latitude: 0,
  longitude: 0,
  deliveryRadiusKm: 5.0,
  openingTime: "08:00 AM",
  closingTime: "10:30 PM",
  isFestivalMode: false,
  isLunchPause: false,
  googlePlaceId: "",
  reviewShortLink: "",
  smartGatingMinStars: 4,
  logoUrl: "",
  cashierPin: "",
  twoFactorEnabled: false,
  loginAlerts: true,
  printerSettings: {
    connectionType: "bluetooth",
    paperSize: "80mm",
    autoCut: true,
  },
  branches: [],
  staffList: [],
  bankAccount: {
    accountNumberMask: "",
    ifsc: "",
    holderName: "",
    isVerified: false,
  },
  lastUpdatedAt: new Date(0).toISOString(),
};

// State cache with disk persistence fallback
let activeConfig: MerchantRemoteConfig = { ...DEFAULT_CONFIG };
const PERSIST_FILE = path.join(process.cwd(), "scripts", "merchant_runtime_config.json");

// Load existing config if available
try {
  if (fs.existsSync(PERSIST_FILE)) {
    const raw = fs.readFileSync(PERSIST_FILE, "utf8");
    activeConfig = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  }
} catch {}

function saveToDisk() {
  try {
    fs.writeFileSync(PERSIST_FILE, JSON.stringify(activeConfig, null, 2), "utf8");
  } catch {}
}

export function getMerchantRemoteConfig(bizId?: string): MerchantRemoteConfig {
  try {
    if (fs.existsSync(PERSIST_FILE)) {
      const raw = fs.readFileSync(PERSIST_FILE, "utf8");
      activeConfig = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}

  if (bizId && bizId !== activeConfig.businessId) {
    return {
      ...activeConfig,
      businessId: bizId,
      reviewShortLink: `https://trustitreview.com/r/${bizId}`,
    };
  }
  return activeConfig;
}

export function updateMerchantRemoteConfig(
  partial: Partial<MerchantRemoteConfig>
): MerchantRemoteConfig {
  activeConfig = {
    ...activeConfig,
    ...partial,
    lastUpdatedAt: new Date().toISOString(),
  };
  saveToDisk();
  return activeConfig;
}
