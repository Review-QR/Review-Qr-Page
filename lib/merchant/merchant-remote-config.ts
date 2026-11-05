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
  logoUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80",
  cashierPin: "1234",
  twoFactorEnabled: true,
  loginAlerts: true,
  printerSettings: {
    connectionType: "bluetooth",
    paperSize: "80mm",
    autoCut: true,
  },
  branches: [
    {
      id: "branch_1",
      name: "Shri Balaji Daily Needs (Main Hub)",
      locality: "Civil Lines / KDC Road, Bahraich",
      idCode: "QR-77837892",
      active: true,
      pendingOrders: 3,
      revenueToday: "₹2,840",
    },
    {
      id: "branch_2",
      name: "Shri Balaji Express (Branch 2)",
      locality: "Medical College Road, Bahraich",
      idCode: "QR-90412850",
      active: false,
      pendingOrders: 0,
      revenueToday: "₹1,420",
    },
  ],
  staffList: [
    { name: "Aman Sharma", role: "Owner (Admin)", phone: "+91 91186 43415", access: "Full Master Access", badge: "bg-purple-100 text-purple-900" },
    { name: "Ramesh Kumar", role: "Counter Cashier", phone: "+91 94501 23456", access: "Live Orders & Menu Only", badge: "bg-blue-100 text-blue-900" },
    { name: "Chef Dinesh", role: "Kitchen Master", phone: "+91 87654 32109", access: "KOT Screen Only", badge: "bg-amber-100 text-amber-900" },
  ],
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
