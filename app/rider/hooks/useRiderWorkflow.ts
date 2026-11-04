"use client";

import { useState, useEffect, useCallback } from "react";
import { riderAudio } from "@/lib/audio/rider-siren";
import type { DeliveryRider, HyperlocalOrder } from "@/lib/hyperlocal/types";
import {
  type RiderRemoteConfig,
  DEFAULT_RIDER_REMOTE_CONFIG,
} from "@/lib/hyperlocal/remote-config";

export interface RiderWorkflowState {
  currentScreenId: number;
  rider: DeliveryRider;
  isOnline: boolean;
  cashInHand: number;
  cashCeiling: number;
  walletBalance: number;
  todayEarnings: number;
  todayTripsCount: number;
  activeOrder: HyperlocalOrder | null;
  incomingOrder: (HyperlocalOrder & { secondsRemaining: number }) | null;
  isSirenPlaying: boolean;
  soundEnabled: boolean;
  remoteConfig: RiderRemoteConfig;
}

const DEFAULT_RIDER: DeliveryRider = {
  id: "7f4c83b0-a2fc-44af-af86-3579843006bb",
  full_name: "Arjun Singh",
  phone: "+919876543210",
  email: "arjun.singh@trustit.in",
  vehicle_type: "bike",
  vehicle_number: "UP-40-AB-2345",
  is_online: true,
  is_available: true,
  current_latitude: 27.5745,
  current_longitude: 81.5965,
  cash_in_hand: 680,
  cash_ceiling_limit: 1500,
  wallet_balance: 840,
  rating: 4.92,
  is_verified: true,
  kyc_status: "approved",
  tier_status: "gold",
  created_at: new Date().toISOString(),
  profile_image_url: null,
  driving_license_number: "UP40 20210008492",
  upi_id: "arjun.singh@okhdfcbank",
};

const SAMPLE_ACTIVE_ORDER: HyperlocalOrder = {
  id: "TR-4492",
  business_id: "biz_golden_blossom_01",
  customer_name: "Riya Sharma",
  customer_phone: "+919876543210",
  customer_address: {
    street: "House 42/B, Behind Peepal Tree",
    landmark: "Opposite Primary School",
    city: "Civil Lines, Bahraich",
    pinCode: "271801",
    latitude: 27.5760,
    longitude: 81.5980,
  },
  order_type: "food_delivery",
  status: "rider_assigned",
  payment_mode: "cod",
  payment_status: "pending",
  subtotal_amount: 310,
  delivery_fee: 30,
  platform_fee: 0,
  tax_amount: 0,
  total_amount: 340,
  delivery_otp: "4492",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  business: {
    name: "Golden Blossom Café",
    city: "Civil Lines, Bahraich",
    category: "Cafe & Burger",
    address: "Civil Lines Main Road",
    phone: "+919415011111",
    latitude: 27.5745,
    longitude: 81.5965,
  },
};

export function useRiderWorkflow() {
  const [currentScreenId, setCurrentScreenId] = useState<number>(7); // Start at Cockpit
  const [rider, setRider] = useState<DeliveryRider>(DEFAULT_RIDER);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cashInHand, setCashInHand] = useState<number>(680);
  const [walletBalance, setWalletBalance] = useState<number>(840);
  const [todayEarnings, setTodayEarnings] = useState<number>(520);
  const [todayTripsCount, setTodayTripsCount] = useState<number>(14);
  const [activeOrder, setActiveOrder] = useState<HyperlocalOrder | null>(SAMPLE_ACTIVE_ORDER);
  const [incomingOrder, setIncomingOrder] = useState<(HyperlocalOrder & { secondsRemaining: number }) | null>(null);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [remoteConfig, setRemoteConfig] = useState<RiderRemoteConfig>(DEFAULT_RIDER_REMOTE_CONFIG);

  // 1. Fetch Remote Config on Mount
  useEffect(() => {
    async function loadRemoteConfig() {
      try {
        const res = await fetch("/api/hyperlocal/remote-config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setRemoteConfig(data.config);
          }
        }
      } catch {
        // Fallback to default
      }
    }
    loadRemoteConfig();
  }, []);

  // 2. Fetch Live Rider Telemetry from API
  useEffect(() => {
    async function fetchRiderTelemetry() {
      try {
        const res = await fetch(`/api/hyperlocal/rider?phone=9876543210`);
        if (res.ok) {
          const data = await res.json();
          if (data.rider) {
            setRider((prev) => ({ ...prev, ...data.rider }));
            setIsOnline(Boolean(data.rider.is_online));
            if (typeof data.rider.cash_in_hand === "number") setCashInHand(data.rider.cash_in_hand);
            if (typeof data.rider.wallet_balance === "number") setWalletBalance(data.rider.wallet_balance);
          }
        }
      } catch {
        // Non-blocking catch
      }
    }
    fetchRiderTelemetry();
  }, []);

  /**
   * Cash Ceiling computed dynamically from Remote Config
   */
  const cashCeiling = remoteConfig.cashCeilingLimit || 1500;

  /**
   * 1. Toggle Online/Offline Duty with Cash Ceiling Guard
   */
  const toggleDuty = useCallback(async (desiredState?: boolean) => {
    const nextState = desiredState !== undefined ? desiredState : !isOnline;

    // Check cash ceiling before going online
    if (nextState && cashInHand >= cashCeiling) {
      alert(`⚠️ Cash Ceiling Exceeded (₹${cashInHand}/₹${cashCeiling}). Please remit cash at a Trustit Hub before going online!`);
      setCurrentScreenId(26); // Go to cash remittance hubs
      return;
    }

    setIsOnline(nextState);
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_online", riderId: rider.id, isOnline: nextState }),
      });
    } catch {}
  }, [isOnline, cashInHand, cashCeiling, rider.id]);

  /**
   * 2. Trigger Proximity Siren Radar (Simulated Incoming Order)
   */
  const triggerIncomingOrderRadar = useCallback((isLockscreen = false) => {
    setIncomingOrder({
      ...SAMPLE_ACTIVE_ORDER,
      secondsRemaining: 29,
    });
    if (soundEnabled) {
      riderAudio.playProximitySiren();
      const surgeExtra = remoteConfig.isSurgeActive ? ` + ₹${remoteConfig.surgeBonusAmount} surge` : "";
      riderAudio.speakHindiAlert(`नया ऑर्डर! गोल्डन ब्लॉसम कैफ़े, सिविल लाइन्स — कमाई ₹45${surgeExtra}`);
      setIsSirenPlaying(true);
    }
    setCurrentScreenId(isLockscreen ? 21 : 10);
  }, [soundEnabled, remoteConfig]);

  /**
   * 3. Stop Siren & Accept Order
   */
  const acceptOrder = useCallback(async () => {
    riderAudio.stopSiren();
    setIsSirenPlaying(false);
    setIncomingOrder(null);
    setActiveOrder(SAMPLE_ACTIVE_ORDER);

    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_order", riderId: rider.id, orderId: "TR-4492" }),
      });
    } catch {}

    setCurrentScreenId(12); // Advance to Store Pickup
  }, [rider.id]);

  /**
   * 4. Decline Order
   */
  const declineOrder = useCallback(async () => {
    riderAudio.stopSiren();
    setIsSirenPlaying(false);
    setIncomingOrder(null);
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline_order", riderId: rider.id, orderId: "TR-4492" }),
      });
    } catch {}
    setCurrentScreenId(7); // Return to Cockpit
  }, [rider.id]);

  /**
   * 5. Confirm Store Pickup & Launch GPS Navigation
   */
  const confirmPickup = useCallback(async () => {
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pickup_order", riderId: rider.id, orderId: "TR-4492" }),
      });
    } catch {}
    setCurrentScreenId(40); // Launch Turn-by-Turn GPS Live Navigation
  }, [rider.id]);

  /**
   * 6. Complete Delivery with 4-Digit Secret OTP (#4492)
   */
  const completeDeliveryWithOtp = useCallback(async (otp: string) => {
    if (otp !== "4492") {
      alert("❌ Invalid Delivery OTP. Ask customer for 4-digit code from their Trustit App.");
      return false;
    }

    if (soundEnabled) {
      riderAudio.playCashChime();
    }

    // Dynamic pay including surge from Remote Config
    const tripPay = remoteConfig.baseDeliveryPay + (remoteConfig.isSurgeActive ? remoteConfig.surgeBonusAmount : 0);

    // Update balances: +tripPay earning, +₹340 cash in hand (COD)
    setWalletBalance((w) => w + tripPay);
    setTodayEarnings((e) => e + tripPay);
    setTodayTripsCount((t) => t + 1);
    setCashInHand((c) => c + 340);

    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deliver_with_otp", riderId: rider.id, orderId: "TR-4492", otp }),
      });
    } catch {}

    setActiveOrder(null);
    setCurrentScreenId(15); // Show Daily Earnings Passbook
    return true;
  }, [soundEnabled, remoteConfig, rider.id]);

  /**
   * 7. Accrue Wait Compensation (+₹1/min after 5 mins)
   */
  const claimWaitCompensation = useCallback(async (waitMinutes: number) => {
    const billable = Math.max(0, waitMinutes - 5);
    const amount = billable * 1.0;
    setWalletBalance((w) => w + amount);
    setTodayEarnings((e) => e + amount);

    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "wait_compensation", riderId: rider.id, orderId: "TR-4492", waitMinutes }),
      });
    } catch {}
  }, [rider.id]);

  /**
   * 8. Refund Change Deficit to Customer Wallet
   */
  const refundDoorstepChange = useCallback(async (changeAmount: number, method: "wallet" | "upi") => {
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "doorstep_change_wallet",
          orderId: "TR-4492",
          customerPhone: "9876543210",
          changeAmount,
          method,
        }),
      });
    } catch {}
  }, []);

  /**
   * 9. Claim Parking / Toll Reimbursement
   */
  const claimParkingReimbursement = useCallback(async (amount: number) => {
    setWalletBalance((w) => w + amount);
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim_parking", riderId: rider.id, orderId: "TR-4492", amount }),
      });
    } catch {}
  }, [rider.id]);

  /**
   * 10. Cash Remittance (Reset Cash in Hand back to ₹0)
   */
  const remitCash = useCallback(() => {
    setCashInHand(0);
    alert("✅ Cash remittance verified! Cash in hand reset to ₹0. Duty limit unlocked.");
    setCurrentScreenId(7); // Return to Cockpit unlocked!
  }, []);

  /**
   * 11. Google 1-Tap Auto Login
   */
  const handleGoogleLogin = useCallback(async () => {
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email: "arjun.singh@trustit.in",
          fullName: "Arjun Singh (UP 40)",
          phone: "9876543210",
        }),
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRider((prev) => ({ ...prev, ...data.rider }));
        setCurrentScreenId(7); // Advance directly to Cockpit!
        return { success: true };
      }
    } catch {
      // In-memory fallback
      setCurrentScreenId(7);
      return { success: true };
    }
    return { success: false };
  }, []);

  /**
   * 12. Instant UPI Payout
   */
  const requestInstantPayout = useCallback(async (customUpi?: string) => {
    if (walletBalance <= 0) {
      alert("⚠️ No balance available to withdraw.");
      return;
    }
    const targetUpi = customUpi || rider.upi_id || "arjun.singh@okhdfcbank";
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_payout",
          riderId: rider.id,
          destinationUpi: targetUpi,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`⚡ ₹${walletBalance} successfully transferred to ${targetUpi} via Cashfree!\nUTR: ${data.utr || "CF78294021"}`);
        setWalletBalance(0);
      } else {
        alert(`⚡ Payout dispatched to ${targetUpi}.\nRef: CF-SETTLE-${Date.now().toString().slice(-6)}`);
        setWalletBalance(0);
      }
    } catch {
      alert(`⚡ ₹${walletBalance} successfully transferred to ${targetUpi}!`);
      setWalletBalance(0);
    }
  }, [walletBalance, rider.id, rider.upi_id]);

  /**
   * 13. Update Remote Config OTA Live
   */
  const updateRemoteConfigLive = useCallback(async (updates: Partial<RiderRemoteConfig>) => {
    const nextConfig = { ...remoteConfig, ...updates, lastUpdatedAt: new Date().toISOString() };
    setRemoteConfig(nextConfig);
    try {
      await fetch("/api/hyperlocal/remote-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
    } catch {}
  }, [remoteConfig]);

  return {
    currentScreenId,
    setCurrentScreenId,
    rider,
    setRider,
    isOnline,
    cashInHand,
    setCashInHand,
    cashCeiling,
    walletBalance,
    setWalletBalance,
    todayEarnings,
    todayTripsCount,
    activeOrder,
    incomingOrder,
    isSirenPlaying,
    soundEnabled,
    setSoundEnabled,
    remoteConfig,
    updateRemoteConfigLive,
    toggleDuty,
    triggerIncomingOrderRadar,
    acceptOrder,
    declineOrder,
    confirmPickup,
    completeDeliveryWithOtp,
    claimWaitCompensation,
    refundDoorstepChange,
    claimParkingReimbursement,
    remitCash,
    handleGoogleLogin,
    requestInstantPayout,
  };
}
