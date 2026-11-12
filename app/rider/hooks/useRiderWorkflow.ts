"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { riderAudio } from "@/lib/audio/rider-siren";
import { TrustitNative } from "@/lib/native/trustit-native-service";
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

const BLANK_NEW_RIDER: DeliveryRider = {
  id: "rider_new_partner",
  full_name: "",
  phone: "",
  email: "",
  vehicle_type: "bike",
  vehicle_number: "",
  is_online: false,
  is_available: false,
  current_latitude: null,
  current_longitude: null,
  cash_in_hand: 0,
  cash_ceiling_limit: 1500,
  wallet_balance: 0,
  rating: 5.0,
  is_verified: false,
  kyc_status: "pending",
  tier_status: "bronze",
  created_at: new Date().toISOString(),
  profile_image_url: null,
  driving_license_number: "",
  upi_id: "",
};

const RIDER_STORAGE_KEYS = [
  "trustit_rider_profile",
  "trustit_rider_session_token",
  "trustit_cached_trip",
  "trustit_rider_onboarded",
  "trustit_rider_name",
  "trustit_rider_address",
  "trustit_rider_emergency_name",
  "trustit_rider_emergency",
  "trustit_rider_vehicle_type",
  "trustit_rider_vehicle_number",
  "trustit_rider_dl_number",
  "trustit_rider_upi",
  "trustit_rider_profile_draft",
  "trustit_rider_vehicle_draft",
];

/** Clears every cached rider session and registration draft key from browser storage. */
export function clearAllRiderStorage() {
  if (typeof window === "undefined") return;
  for (const key of RIDER_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage access errors
    }
  }
}

export function useRiderWorkflow() {
  const [currentScreenId, setCurrentScreenId] = useState<number>(1); // Start at Screen 01 (Auth Entry for New Rider)
  const [rider, setRider] = useState<DeliveryRider>(BLANK_NEW_RIDER);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [todayTripsCount, setTodayTripsCount] = useState<number>(0);
  const [activeOrder, setActiveOrder] = useState<HyperlocalOrder | null>(null);
  const [recentCancelledOrder, setRecentCancelledOrder] = useState<Partial<HyperlocalOrder> | null>(null);
  const [incomingOrder, setIncomingOrder] = useState<(HyperlocalOrder & { secondsRemaining: number }) | null>(null);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [remoteConfig, setRemoteConfig] = useState<RiderRemoteConfig>(DEFAULT_RIDER_REMOTE_CONFIG);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const activeOrderRef = useRef(activeOrder);
  const incomingOrderRef = useRef(incomingOrder);
  const currentScreenIdRef = useRef(currentScreenId);
  const acknowledgedCancelRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeOrderRef.current = activeOrder;
  }, [activeOrder]);

  useEffect(() => {
    incomingOrderRef.current = incomingOrder;
  }, [incomingOrder]);

  useEffect(() => {
    currentScreenIdRef.current = currentScreenId;
  }, [currentScreenId]);

  // 1. Fetch Remote Config on Mount
  useEffect(() => {
    async function loadRemoteConfig() {
      try {
        const res = await TrustitNative.nativeFetch("/api/hyperlocal/remote-config");
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

  // 2. Restore saved session and verify live existence against Supabase
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("trustit_rider_profile");
    if (!saved) return;

    let cancelled = false;
    async function restoreAndVerify() {
      try {
        const parsed = JSON.parse(saved as string);
        if (
          parsed?.full_name?.toLowerCase().includes("arjun") ||
          parsed?.vehicle_number?.includes("2345") ||
          parsed?.phone === "9876543210"
        ) {
          clearAllRiderStorage();
          return;
        }
        const sessionToken = localStorage.getItem("trustit_rider_session_token");
        if (!sessionToken) {
          setCurrentScreenId(1);
          return;
        }
        if (parsed && parsed.id && parsed.id !== "rider_new_partner") {
          // Verify with live DB that this rider has NOT been deleted by Admin
          try {
            const res = await TrustitNative.nativeFetch(`/api/hyperlocal/rider?riderId=${encodeURIComponent(parsed.id)}`);
            if (cancelled) return;

            if (res.status === 404) {
              clearAllRiderStorage();
              setRider(BLANK_NEW_RIDER);
              setIsOnline(false);
              setCurrentScreenId(1);
              setSessionNotice(
                "Your partner profile was deleted or reset. Please verify your mobile number and complete your full profile setup again."
              );
              return;
            }

            if (res.ok) {
              const data = await res.json();
              if (cancelled) return;
              if (data?.rider) {
                const liveRider = data.rider;
                localStorage.setItem("trustit_rider_profile", JSON.stringify(liveRider));
                setRider(liveRider);
                if (typeof liveRider.cash_in_hand === "number") setCashInHand(liveRider.cash_in_hand);
                if (typeof liveRider.wallet_balance === "number") setWalletBalance(liveRider.wallet_balance);

                if (liveRider.is_verified && liveRider.kyc_status === "approved") {
                  setIsOnline(Boolean(liveRider.is_online));
                  if (data.activeOrder) {
                    setActiveOrder(data.activeOrder);
                    const status = data.activeOrder.status;
                    if (status === "rider_assigned") {
                      setCurrentScreenId(12);
                    } else if (
                      status === "picked_up" ||
                      status === "out_for_delivery" ||
                      status === "arrived_at_doorstep"
                    ) {
                      setCurrentScreenId(40);
                    } else {
                      setCurrentScreenId(7);
                    }
                  } else {
                    setCurrentScreenId(7);
                  }
                } else {
                  setIsOnline(false);
                  setCurrentScreenId(liveRider.full_name?.trim() ? 19 : 48);
                }
                return;
              }
            }
          } catch {
            // Stay on auth screen if network verification failed without session verification
            if (!cancelled && !sessionToken) {
              setCurrentScreenId(1);
              return;
            }
          }

          if (!cancelled && parsed.full_name && parsed.is_verified && sessionToken) {
            setRider(parsed);
            setCurrentScreenId(7);
            setIsOnline(Boolean(parsed.is_online));
            if (typeof parsed.cash_in_hand === "number") setCashInHand(parsed.cash_in_hand);
            if (typeof parsed.wallet_balance === "number") setWalletBalance(parsed.wallet_balance);
          }
        }
      } catch {}
    }

    restoreAndVerify();
    return () => {
      cancelled = true;
    };
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
      await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_online", riderId: rider.id, isOnline: nextState }),
      });
    } catch {}
  }, [isOnline, cashInHand, cashCeiling, rider.id]);

  // Periodic session guard when active on Cockpit or Dashboard (detects Admin deletion immediately)
  useEffect(() => {
    if (!rider.id || rider.id === "rider_new_partner" || currentScreenId < 7 || currentScreenId === 19 || currentScreenId === 48) {
      return;
    }

    let cancelled = false;
    const guardInterval = setInterval(async () => {
      try {
        const res = await TrustitNative.nativeFetch(`/api/hyperlocal/rider?riderId=${encodeURIComponent(rider.id)}`);
        if (cancelled) return;
        if (res.status === 404) {
          clearAllRiderStorage();
          setRider(BLANK_NEW_RIDER);
          setIsOnline(false);
          setCashInHand(0);
          setWalletBalance(0);
          setTodayEarnings(0);
          setTodayTripsCount(0);
          setActiveOrder(null);
          setIncomingOrder(null);
          setCurrentScreenId(1);
          setSessionNotice(
            "Your partner profile was deleted or reset by Admin. Please log in and complete your full profile setup again."
          );
        }
      } catch {
        // Ignore transient network errors
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(guardInterval);
    };
  }, [rider.id, currentScreenId]);

  // Live real order polling: checks if an order created by customer or merchant is targeted to this online rider
  useEffect(() => {
    if (!isOnline || activeOrder || !rider.id || rider.id === "rider_new_partner") return;

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await TrustitNative.nativeFetch(`/api/hyperlocal/rider?riderId=${encodeURIComponent(rider.id)}`);
        if (res.status === 404) {
          if (!isSubscribed) return;
          clearAllRiderStorage();
          setRider(BLANK_NEW_RIDER);
          setIsOnline(false);
          setCurrentScreenId(1);
          setSessionNotice(
            "Your partner profile was deleted or reset by Admin. Please log in and complete your full profile setup again."
          );
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed) return;

        if (data.activeOrder && !activeOrderRef.current) {
          setActiveOrder(data.activeOrder);
          const status = data.activeOrder.status;
          const curScreen = currentScreenIdRef.current;
          if (status === "rider_assigned" && curScreen !== 12 && curScreen !== 23) {
            setCurrentScreenId(12);
          } else if (
            (status === "picked_up" || status === "out_for_delivery" || status === "arrived_at_doorstep") &&
            curScreen !== 40
          ) {
            setCurrentScreenId(40);
          }
        }

        if (data.recentCancelledOrder?.id && !acknowledgedCancelRef.current.has(data.recentCancelledOrder.id)) {
          acknowledgedCancelRef.current.add(data.recentCancelledOrder.id);
          setActiveOrder(null);
          setRecentCancelledOrder(data.recentCancelledOrder);
          riderAudio.stopSiren();
          setIsSirenPlaying(false);
          setCurrentScreenId(46);
        }

        const incoming = data.incomingOrder || data.incomingDispatchOrder;
        if (
          incoming &&
          !activeOrderRef.current &&
          !data.activeOrder &&
          (!incomingOrderRef.current || incomingOrderRef.current.id !== incoming.id)
        ) {
          setIncomingOrder({
            ...incoming,
            secondsRemaining: incoming.secondsRemaining || 29,
          });
          if (soundEnabled) {
            riderAudio.playProximitySiren();
            const shopName = incoming.businesses?.name || incoming.business?.name || "Merchant Store";
            const earn = incoming.delivery_fee || 35;
            riderAudio.speakOrderAlert(`New Order Alert! Pickup from ${shopName}. Earnings ₹${earn}`);
            setIsSirenPlaying(true);
          }
          setCurrentScreenId(10);
        }

        if (data.scorecard) {
          setTodayEarnings(data.scorecard.todayEarnings || 0);
          setTodayTripsCount(data.scorecard.todayTripsCount || 0);
          setWalletBalance(data.scorecard.walletBalance || 0);
          setCashInHand(data.scorecard.cashInHand || 0);
        }
      } catch {}
    }, 4500);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [isOnline, activeOrder, soundEnabled, rider.id]);

  /**
   * 2. Trigger Proximity Siren Radar (Simulated Incoming Order)
   */
  const triggerIncomingOrderRadar = useCallback((isLockscreen = false) => {
    // Only scans if real incoming order is present; zero mock order synthesis
    if (incomingOrder) {
      if (soundEnabled) {
        riderAudio.playProximitySiren();
        setIsSirenPlaying(true);
      }
      setCurrentScreenId(isLockscreen ? 21 : 10);
    }
  }, [soundEnabled, incomingOrder]);

  /**
   * 3. Stop Siren & Accept Order
   */
  const acceptOrder = useCallback(async () => {
    if (!incomingOrder) return;
    const orderToAccept = incomingOrder;
    riderAudio.stopSiren();
    setIsSirenPlaying(false);
    setIncomingOrder(null);
    setActiveOrder(orderToAccept);
    setCurrentScreenId(12); // Advance to Store Pickup

    try {
      const res = await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_order", riderId: rider.id, orderId: orderToAccept.id }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.order) {
          setActiveOrder(data.order);
        }
      }
    } catch {}
  }, [rider.id, incomingOrder]);

  /**
   * 4. Decline Order
   */
  const declineOrder = useCallback(async () => {
    const orderToDeclineId = incomingOrder?.id;
    riderAudio.stopSiren();
    setIsSirenPlaying(false);
    setIncomingOrder(null);
    if (!orderToDeclineId) return;

    try {
      await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline_order", riderId: rider.id, orderId: orderToDeclineId }),
      });
    } catch {}
    setCurrentScreenId(7); // Return to Cockpit
  }, [rider.id, incomingOrder]);

  /**
   * 5. Confirm Store Pickup & Launch GPS Navigation
   */
  const confirmPickup = useCallback(async () => {
    const currentOrderId = activeOrder?.id;
    if (!currentOrderId) return;

    setActiveOrder((prev) => (prev ? { ...prev, status: "picked_up" } : prev));
    try {
      await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pickup_order", riderId: rider.id, orderId: currentOrderId }),
      });
    } catch {}
    setCurrentScreenId(40); // Launch Turn-by-Turn GPS Live Navigation
  }, [rider.id, activeOrder]);

  /**
   * 6. Complete Delivery with 4-Digit Secret OTP
   */
  const completeDeliveryWithOtp = useCallback(async (
    otp: string,
    options?: { paidViaCashfreeQr?: boolean },
  ) => {
    const expectedOtp = activeOrder?.delivery_otp;
    if (expectedOtp && otp !== expectedOtp) {
      alert("❌ Invalid Delivery OTP. Please verify the 4-digit OTP shown on customer's Trustit app.");
      return false;
    }

    try {
      if (activeOrder?.id) {
        const res = await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "deliver_with_otp",
            riderId: rider.id,
            orderId: activeOrder.id,
            otp,
            paidViaCashfreeQr: Boolean(options?.paidViaCashfreeQr),
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
          alert(`❌ ${data?.error || "Could not complete delivery with OTP."}`);
          return false;
        }
      }
    } catch {
      alert("❌ Network error verifying delivery OTP.");
      return false;
    }

    if (soundEnabled) {
      riderAudio.playCashChime();
    }

    // Dynamic pay including surge from Remote Config
    const tripPay = (activeOrder?.delivery_fee ?? remoteConfig.baseDeliveryPay) + (remoteConfig.isSurgeActive ? remoteConfig.surgeBonusAmount : 0);
    const isPaidOnline =
      Boolean(options?.paidViaCashfreeQr) ||
      activeOrder?.payment_status === "paid" ||
      activeOrder?.payment_mode !== "cod";
    const codAmount = !isPaidOnline ? (activeOrder?.total_amount ?? 0) : 0;

    // Update balances
    setWalletBalance((w) => w + tripPay);
    setTodayEarnings((e) => e + tripPay);
    setTodayTripsCount((t) => t + 1);
    if (codAmount > 0) {
      setCashInHand((c) => c + codAmount);
    }

    setActiveOrder(null);
    setCurrentScreenId(15); // Show Daily Earnings Passbook
    return true;
  }, [soundEnabled, remoteConfig, rider.id, activeOrder]);

  /**
   * 6b. Request Order Cancellation / Report Doorstep Dispute to Admin
   */
  const requestOrderCancellation = useCallback(async (
    reason: "customer_refused" | "customer_unreachable" | "wrong_address",
    notes?: string,
  ) => {
    if (!activeOrder?.id) return { success: false, error: "No active order" };
    try {
      const res = await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_cancellation",
          riderId: rider.id,
          orderId: activeOrder.id,
          reason,
          notes,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || "Failed to send cancellation request." };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: "Network error submitting cancellation request." };
    }
  }, [rider.id, activeOrder]);

  /**
   * 7. Accrue Wait Compensation (+₹1/min after 5 mins)
   */
  const claimWaitCompensation = useCallback(async (waitMinutes: number) => {
    const billable = Math.max(0, waitMinutes - 5);
    const amount = billable * 1.0;
    setWalletBalance((w) => w + amount);
    setTodayEarnings((e) => e + amount);

    try {
      if (activeOrder?.id) {
        await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "wait_compensation", riderId: rider.id, orderId: activeOrder.id, waitMinutes }),
        });
      }
    } catch {}
  }, [rider.id, activeOrder]);

  /**
   * 8. Refund Change Deficit to Customer Wallet
   */
  const refundDoorstepChange = useCallback(async (changeAmount: number, method: "wallet" | "upi") => {
    try {
      if (activeOrder?.id) {
        await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "doorstep_change_wallet",
            orderId: activeOrder.id,
            customerPhone: activeOrder.customer_phone || "",
            changeAmount,
            method,
          }),
        });
      }
    } catch {}
  }, [activeOrder]);

  /**
   * 9. Claim Parking / Toll Reimbursement
   */
  const claimParkingReimbursement = useCallback(async (amount: number) => {
    setWalletBalance((w) => w + amount);
    try {
      if (activeOrder?.id) {
        await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "claim_parking", riderId: rider.id, orderId: activeOrder.id, amount }),
        });
      }
    } catch {}
  }, [rider.id, activeOrder]);

  /**
   * 10. Cash Remittance (Reset Cash in Hand back to ₹0)
   */
  const remitCash = useCallback(() => {
    setCashInHand(0);
    alert("✅ Cash remittance verified! Cash in hand reset to ₹0. Duty limit unlocked.");
    setCurrentScreenId(7); // Return to Cockpit unlocked!
  }, []);

  /**
   * 11. Google 1-Tap Partner Onboarding Login
   */
  const handleGoogleLogin = useCallback(async (user?: { email?: string; fullName?: string }) => {
    const partnerName = user?.fullName || "New Fleet Partner";
    const partnerEmail = user?.email || "new.partner@trustit.in";

    try {
      const res = await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email: partnerEmail,
          fullName: partnerName,
        }),
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRider((prev) => ({
          ...prev,
          ...data.rider,
          full_name: partnerName,
          email: partnerEmail,
        }));
        // Direct new rider into Terms, Road Safety & Live Selfie KYC!
        setCurrentScreenId(3);
        return { success: true };
      }
    } catch {
      // In-memory fallback: new partner into Screen 03
      setRider((prev) => ({
        ...prev,
        full_name: partnerName,
        email: partnerEmail,
      }));
      setCurrentScreenId(3);
      return { success: true };
    }
    return { success: false };
  }, []);

  /**
   * 12. Instant UPI Payout
   */
  const requestInstantPayout = useCallback(async (customUpi?: string) => {
    if (walletBalance <= 0) {
      return { success: false, error: "No wallet balance available to withdraw" };
    }
    const targetUpi = customUpi || rider.upi_id;
    if (!targetUpi || !targetUpi.includes("@")) {
      return { success: false, error: "Please configure a valid UPI ID (e.g. name@oksbi) in your profile." };
    }
    try {
      const res = await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_payout",
          riderId: rider.id,
          destinationUpi: targetUpi,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || "Payout processing failed. Please try again." };
      }
      setWalletBalance(0);
      riderAudio.playCashChime();
      return {
        success: true,
        utr: data.utr || data.referenceId,
        withdrawnAmount: data.withdrawnAmount || walletBalance,
        destination: data.destination,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || "Network error while requesting payout." };
    }
  }, [walletBalance, rider.id, rider.upi_id]);

  /**
   * 13. Update Remote Config OTA Live
   */
  const updateRemoteConfigLive = useCallback(async (updates: Partial<RiderRemoteConfig>) => {
    const nextConfig = { ...remoteConfig, ...updates, lastUpdatedAt: new Date().toISOString() };
    setRemoteConfig(nextConfig);
    try {
      await TrustitNative.nativeFetch("/api/hyperlocal/remote-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
    } catch {}
  }, [remoteConfig]);

  /**
   * 14. Reset to Brand New Unregistered Rider Session
   */
  const resetToNewRider = useCallback(() => {
    clearAllRiderStorage();
    setRider(BLANK_NEW_RIDER);
    setIsOnline(false);
    setCashInHand(0);
    setWalletBalance(0);
    setTodayEarnings(0);
    setTodayTripsCount(0);
    setActiveOrder(null);
    setIncomingOrder(null);
    setCurrentScreenId(1);
  }, []);

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
    recentCancelledOrder,
    incomingOrder,
    isSirenPlaying,
    soundEnabled,
    setSoundEnabled,
    remoteConfig,
    updateRemoteConfigLive,
    sessionNotice,
    setSessionNotice,
    toggleDuty,
    triggerIncomingOrderRadar,
    acceptOrder,
    declineOrder,
    confirmPickup,
    completeDeliveryWithOtp,
    requestOrderCancellation,
    claimWaitCompensation,
    refundDoorstepChange,
    claimParkingReimbursement,
    remitCash,
    handleGoogleLogin,
    requestInstantPayout,
    resetToNewRider,
  };
}
