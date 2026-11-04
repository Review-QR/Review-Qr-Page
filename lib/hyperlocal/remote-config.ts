/**
 * Trustit Rider Fleet - Server-Driven OTA Remote Config
 * Enables real-time over-the-air updates for Rider Partner App
 * without requiring Google Play Store APK re-compilation or app updates.
 */

export interface RiderRemoteConfig {
  version: string;
  lastUpdatedAt: string;
  // Financial Limits
  cashCeilingLimit: number; // e.g. 1500 INR
  minPayoutAmount: number; // e.g. 50 INR
  baseDeliveryPay: number; // e.g. 30 INR
  surgeBonusAmount: number; // e.g. 15 INR
  isSurgeActive: boolean;
  surgeReason: string;
  // Auth & Communication Channel Toggles
  isSmsAuthEnabled: boolean; // false until DLT approval
  isWhatsappAuthEnabled: boolean; // true
  isGoogleAuthEnabled: boolean; // true
  // Safety & Operational Gates
  isHelmetSelfieMandatory: boolean; // true
  isSpeedingAlertEnabled: boolean; // true (35 km/h cap in town)
  speedLimitKmh: number; // 35
  // Live Broadcast Ticker
  adminBroadcastTicker: {
    enabled: boolean;
    type: "info" | "warning" | "surge" | "emergency";
    message: string;
    actionLabel?: string;
    targetScreenId?: number;
  };
  // Dynamic Promo / Support Action Button
  dynamicActionBanner?: {
    enabled: boolean;
    title: string;
    subtitle: string;
    ctaLabel: string;
    targetScreenId: number;
    badgeText?: string;
  };
  // Emergency Helpline Numbers
  helplinePhone: string;
  policeEmergencyNumber: string;
}

export const DEFAULT_RIDER_REMOTE_CONFIG: RiderRemoteConfig = {
  version: "2.4.0-ota",
  lastUpdatedAt: new Date().toISOString(),
  cashCeilingLimit: 1500,
  minPayoutAmount: 50,
  baseDeliveryPay: 30,
  surgeBonusAmount: 15,
  isSurgeActive: true,
  surgeReason: "Evening Rush Hour in Civil Lines",
  isSmsAuthEnabled: false, // TRAI DLT registration pending
  isWhatsappAuthEnabled: true,
  isGoogleAuthEnabled: true,
  isHelmetSelfieMandatory: true,
  isSpeedingAlertEnabled: true,
  speedLimitKmh: 35,
  adminBroadcastTicker: {
    enabled: true,
    type: "surge",
    message: "🌧️ Bahraich Weather Advisory: Light rain in Civil Lines. Extra +₹15 surge applied per order!",
    actionLabel: "View Heatmap",
    targetScreenId: 33,
  },
  dynamicActionBanner: {
    enabled: true,
    title: "Diwali Bonus Challenge 🪔",
    subtitle: "Complete 18 orders today and get ₹350 instant cash voucher",
    ctaLabel: "Check Target",
    targetScreenId: 16,
    badgeText: "HOT",
  },
  helplinePhone: "+919415012345",
  policeEmergencyNumber: "112",
};

// In-memory runtime cache for server-driven config
let activeRemoteConfig: RiderRemoteConfig = { ...DEFAULT_RIDER_REMOTE_CONFIG };

export function getRiderRemoteConfig(): RiderRemoteConfig {
  return activeRemoteConfig;
}

export function updateRiderRemoteConfig(partial: Partial<RiderRemoteConfig>): RiderRemoteConfig {
  activeRemoteConfig = {
    ...activeRemoteConfig,
    ...partial,
    lastUpdatedAt: new Date().toISOString(),
  };
  return activeRemoteConfig;
}

export function resetRiderRemoteConfig(): RiderRemoteConfig {
  activeRemoteConfig = { ...DEFAULT_RIDER_REMOTE_CONFIG, lastUpdatedAt: new Date().toISOString() };
  return activeRemoteConfig;
}
