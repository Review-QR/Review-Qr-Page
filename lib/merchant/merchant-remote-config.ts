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
  bankAccount: {
    accountNumberMask: string;
    ifsc: string;
    holderName: string;
    isVerified: boolean;
  };
  lastUpdatedAt: string;
}

const DEFAULT_CONFIG: MerchantRemoteConfig = {
  businessId: "m_9118643415_0601",
  storeName: "Shri Balaji Daily Needs & General Store",
  ownerName: "Aman Sharma",
  businessCategory: "kirana",
  phone: "+919118643415",
  address: "Civil Lines, Near Indira Gandhi Stadium, Bahraich",
  city: "Bahraich",
  isStoreOnline: true,
  latitude: 27.5744,
  longitude: 81.5977,
  deliveryRadiusKm: 5.0,
  openingTime: "08:00 AM",
  closingTime: "10:30 PM",
  isFestivalMode: false,
  isLunchPause: false,
  googlePlaceId: "ChIJ_TrustitShriBalajiBahraich",
  reviewShortLink: "https://trustitreview.com/r/m_9118643415_0601",
  smartGatingMinStars: 4,
  bankAccount: {
    accountNumberMask: "•••• •••• 4512",
    ifsc: "SBIN0000024",
    holderName: "Shri Balaji Daily Needs",
    isVerified: true,
  },
  lastUpdatedAt: new Date().toISOString(),
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
