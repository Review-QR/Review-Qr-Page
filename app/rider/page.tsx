"use client";

import { useEffect, useState, useRef } from "react";
import type { DeliveryRider, HyperlocalOrder } from "@/lib/hyperlocal/types";

interface RiderScorecard {
  todayEarnings: number;
  todayTripsCount: number;
  monthEarnings: number;
  monthTripsCount: number;
  totalDeliveries: number;
  walletBalance: number;
  cashInHand: number;
  codLimit: number;
  rating: number;
  recentTrips: Array<{
    id: string;
    shopName: string;
    amount: number;
    billAmount: number;
    paymentMode: string;
    deliveredAt: string;
  }>;
}

export default function RiderAppPage() {
  const [rider, setRider] = useState<DeliveryRider | null>(null);
  const [scorecard, setScorecard] = useState<RiderScorecard | null>(null);
  const [activeOrder, setActiveOrder] = useState<HyperlocalOrder | null>(null);
  const [availableOrders, setAvailableOrders] = useState<HyperlocalOrder[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [locationStatus, setLocationStatus] = useState("Acquiring GPS...");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [shiftSeconds, setShiftSeconds] = useState(0);

  // Auth & Email OTP State
  const [authEmail, setAuthEmail] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isAuthPending, setIsAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // KYC Onboarding Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycEmail, setKycEmail] = useState("");
  const [kycFullName, setKycFullName] = useState("");
  const [kycPhone, setKycPhone] = useState("");
  const [kycProfileImage, setKycProfileImage] = useState("");
  const [kycAddress, setKycAddress] = useState("");
  const [kycVehicleType, setKycVehicleType] = useState<"bike" | "scooter" | "electric_bike">("bike");
  const [kycVehicleNo, setKycVehicleNo] = useState("");
  const [kycDlNo, setKycDlNo] = useState("");
  const [kycBankHolder, setKycBankHolder] = useState("");
  const [kycBankAcc, setKycBankAcc] = useState("");
  const [kycIfsc, setKycIfsc] = useState("");
  const [kycBankName, setKycBankName] = useState("");
  const [kycUpi, setKycUpi] = useState("");
  const [kycPan, setKycPan] = useState("");
  const [isKycSubmitting, setIsKycSubmitting] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  // Profile Settings Modal & Payout Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutResult, setPayoutResult] = useState<{ success: boolean; message: string } | null>(null);

  // Incoming Order Modal & Radar Buzzer
  const [incomingOrder, setIncomingOrder] = useState<HyperlocalOrder | null>(null);
  const [countdown, setCountdown] = useState(30);

  // Doorstep Delivery OTP
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Buzzer using Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);

  function playAlertBuzzer() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  }

  // Load saved rider on mount
  useEffect(() => {
    function primeRiderAudio() {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
      } catch {}
    }
    window.addEventListener("click", primeRiderAudio, { once: true });
    window.addEventListener("touchstart", primeRiderAudio, { once: true });

    try {
      const savedId = localStorage.getItem("trustit_rider_id");
      if (savedId) {
        loadRiderById(savedId);
      }
    } catch {}

    return () => {
      window.removeEventListener("click", primeRiderAudio);
      window.removeEventListener("touchstart", primeRiderAudio);
    };
  }, []);

  // Duty shift seconds timer
  useEffect(() => {
    if (!rider || !isOnline) return;
    const shiftInterval = setInterval(() => {
      setShiftSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(shiftInterval);
  }, [rider, isOnline]);

  // Resend OTP Countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  async function loadRiderById(id: string) {
    try {
      const res = await fetch(`/api/hyperlocal/rider?riderId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.rider) {
        setRider(data.rider);
        setScorecard(data.scorecard || null);
        setIsOnline(data.rider.is_online);
        localStorage.setItem("trustit_rider_id", data.rider.id);
      } else {
        localStorage.removeItem("trustit_rider_id");
        setRider(null);
      }
    } catch {}
  }

  // Fetch Rider Profile & Orders Polling
  async function fetchRiderData() {
    if (!rider) return;
    try {
      const res = await fetch(`/api/hyperlocal/rider?riderId=${encodeURIComponent(rider.id)}`);
      const data = await res.json();
      if (data.rider) {
        setRider(data.rider);
        setIsOnline(data.rider.is_online);
      }
      if (data.scorecard) {
        setScorecard(data.scorecard);
      }
      if (data.activeOrder) {
        setActiveOrder(data.activeOrder);
        setIncomingOrder(null);
      } else {
        setActiveOrder(null);
        if (data.incomingOrder && !incomingOrder && isOnline) {
          setIncomingOrder(data.incomingOrder);
          setCountdown(data.incomingOrder.secondsRemaining || 30);
          playAlertBuzzer();
          try { navigator.vibrate?.([300, 150, 300, 150, 600]); } catch {}
        } else if (!data.incomingOrder && incomingOrder) {
          setIncomingOrder(null);
        }
      }
      setAvailableOrders(data.availableOrders || []);
    } catch {}
  }

  // Periodic GPS & Data Sync
  useEffect(() => {
    if (!rider) return;
    fetchRiderData();
    const interval = setInterval(fetchRiderData, 4000);

    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCurrentCoords({ lat, lon });
          setLocationStatus(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);

          fetch("/api/hyperlocal/rider", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              action: "update_gps",
              riderId: rider.id,
              latitude: lat,
              longitude: lon,
            }),
          }).catch(() => {});
        },
        () => {
          setLocationStatus("27.5745, 81.5965");
          setCurrentCoords({ lat: 27.5745, lon: 81.5965 });
        },
        { enableHighAccuracy: true },
      );
    }

    return () => {
      clearInterval(interval);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [rider?.id, isOnline]);

  // Countdown timer for incoming order popup with 30s waterfall escalation
  useEffect(() => {
    if (!incomingOrder) return;
    if (countdown <= 0) {
      handleDeclineIncomingOrder();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
      if (countdown % 2 === 0) {
        playAlertBuzzer();
        try { navigator.vibrate?.([200, 100, 200]); } catch {}
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [incomingOrder, countdown]);

  async function handleDeclineIncomingOrder() {
    if (!incomingOrder || !rider) {
      setIncomingOrder(null);
      return;
    }
    const orderToDecline = incomingOrder;
    setIncomingOrder(null);
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "decline_order",
          riderId: rider.id,
          orderId: orderToDecline.id,
        }),
      });
      fetchRiderData();
    } catch {}
  }

  // ── SEND EMAIL OTP ──
  async function handleSendEmailOtp() {
    const clean = authEmail.trim().toLowerCase();
    if (!clean.includes("@") || !clean.includes(".")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setIsAuthPending(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "send_otp", email: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setResendCountdown(30);
        setAuthSuccessMsg(data.message || `Verification code sent to ${clean}`);
      } else {
        setAuthError(data.message || "Failed to send verification code.");
      }
    } catch {
      setAuthError("Network error. Please check your connection.");
    } finally {
      setIsAuthPending(false);
    }
  }

  // ── VERIFY EMAIL OTP ──
  async function handleVerifyEmailOtp() {
    const cleanOtp = authOtp.trim();
    if (cleanOtp.length !== 6) {
      setAuthError("Please enter the 6-digit verification code sent to your email.");
      return;
    }
    setIsAuthPending(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "verify_otp",
          email: authEmail.trim().toLowerCase(),
          otp: cleanOtp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.isNewRider) {
          // Open KYC Onboarding modal with prefilled email
          setKycEmail(authEmail.trim().toLowerCase());
          setIsKycModalOpen(true);
        } else if (data.rider) {
          setRider(data.rider);
          setIsOnline(data.rider.is_online);
          localStorage.setItem("trustit_rider_id", data.rider.id);
          setToastMessage(`Welcome back, ${data.rider.full_name}!`);
        }
      } else {
        setAuthError(data.message || "Invalid or expired verification code.");
      }
    } catch {
      setAuthError("Failed to verify code.");
    } finally {
      setIsAuthPending(false);
    }
  }

  // ── SUBMIT KYC REGISTRATION ──
  async function handleSubmitKyc() {
    if (!kycFullName.trim()) {
      setKycError("Full Name is required.");
      return;
    }
    const cleanPhone = kycPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      setKycError("A valid 10-digit mobile number is required.");
      return;
    }
    if (!kycAddress.trim()) {
      setKycError("Local residential address is required.");
      return;
    }
    if (!kycVehicleNo.trim()) {
      setKycError("Vehicle registration number is required.");
      return;
    }

    setIsKycSubmitting(true);
    setKycError(null);

    try {
      const emailToSend = (kycEmail || authEmail || "").trim().toLowerCase();
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "register_kyc",
          email: emailToSend,
          fullName: kycFullName.trim(),
          phone: cleanPhone,
          profileImageUrl: kycProfileImage || null,
          residentialAddress: kycAddress.trim(),
          city: "Bahraich",
          pincode: "271801",
          vehicleType: kycVehicleType,
          vehicleNumber: kycVehicleNo.toUpperCase().trim(),
          drivingLicenseNumber: kycDlNo.trim() || null,
          bankAccountHolderName: kycBankHolder.trim() || kycFullName.trim(),
          bankAccountNumber: kycBankAcc.trim() || null,
          bankIfscCode: kycIfsc.toUpperCase().trim() || null,
          bankName: kycBankName.trim() || null,
          upiId: kycUpi.trim() || null,
          panNumber: kycPan.toUpperCase().trim() || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.rider) {
        setRider(data.rider);
        setIsOnline(true);
        localStorage.setItem("trustit_rider_id", data.rider.id);
        setIsKycModalOpen(false);
        setToastMessage("Partner Profile & KYC Verified! You are now ONLINE.");
      } else {
        setKycError(data?.error || `Submission error (HTTP ${res.status}). Please check all details.`);
      }
    } catch (err) {
      setKycError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setIsKycSubmitting(false);
    }
  }

  // ── QUICK FLEET SWITCHER (FOR INSTANT TESTING) ──
  async function handleQuickLogin(phone: string) {
    setIsAuthPending(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "login", phone }),
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRider(data.rider);
        setIsOnline(data.rider.is_online);
        localStorage.setItem("trustit_rider_id", data.rider.id);
        setToastMessage(`Switched to ${data.rider.full_name}`);
      }
    } catch {
      setAuthError("Quick login failed.");
    } finally {
      setIsAuthPending(false);
    }
  }

  // ── INSTANT UPI PAYOUT REQUEST ──
  async function handleInstantPayout() {
    if (!rider) return;
    setPayoutLoading(true);
    setPayoutResult(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "request_payout",
          riderId: rider.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPayoutResult({
          success: true,
          message: data.message || `₹${data.withdrawnAmount} transferred to ${data.destination}!`,
        });
        fetchRiderData();
      } else {
        setPayoutResult({
          success: false,
          message: data.error || "Payout request failed.",
        });
      }
    } catch {
      setPayoutResult({ success: false, message: "Network error processing payout." });
    } finally {
      setPayoutLoading(false);
    }
  }

  // Profile image upload handler with client-side canvas compression (max 480px, ~40KB)
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          setKycProfileImage(compressed);
        } else {
          setKycProfileImage(reader.result as string);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function handleRiderLogout() {
    localStorage.removeItem("trustit_rider_id");
    setRider(null);
    setActiveOrder(null);
    setIncomingOrder(null);
    setScorecard(null);
    setOtpSent(false);
    setAuthOtp("");
  }

  async function handleToggleOnline() {
    if (!rider) return;
    const nextState = !isOnline;
    setIsOnline(nextState);
    await fetch("/api/hyperlocal/rider", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "toggle_online",
        riderId: rider.id,
        isOnline: nextState,
      }),
    });
    fetchRiderData();
  }

  async function handleAcceptIncomingOrder() {
    if (!incomingOrder || !rider) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "accept_order",
          riderId: rider.id,
          orderId: incomingOrder.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(incomingOrder);
        setIncomingOrder(null);
        setToastMessage("Order Accepted! Proceed to Restaurant.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMarkPickedUp() {
    if (!activeOrder || !rider) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "pickup_order",
          riderId: rider.id,
          orderId: activeOrder.id,
        }),
      });
      setActiveOrder((prev) => (prev ? { ...prev, status: "picked_up" } : null));
      setToastMessage("Food Picked Up! Navigate to Customer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteWithOtp() {
    if (!activeOrder || !rider) return;
    if (enteredOtp.length !== 4) {
      setOtpError("Enter 4-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "deliver_with_otp",
          riderId: rider.id,
          orderId: activeOrder.id,
          otp: enteredOtp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnteredOtp("");
        setActiveOrder(null);
        setToastMessage(`Delivered! Earned ₹${data.earnedPayout}`);
        fetchRiderData();
      } else {
        setOtpError(data.error || "Invalid OTP code.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format duty seconds into HH:MM:SS
  function formatShiftTime(secs: number) {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // ═════════════════════════════════════════════════════════════════
  // ── SCREEN 1: RIDER EMAIL OTP AUTH & FLEET LOGIN ──
  // ═════════════════════════════════════════════════════════════════
  if (!rider) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 px-3.5 py-6 max-w-sm mx-auto flex flex-col justify-center font-sans">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-4">
          {/* Header Branding */}
          <div className="text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-2xl mx-auto shadow-lg shadow-orange-500/20">
              🛵
            </span>
            <h1 className="mt-2 text-base font-black text-white tracking-tight">Trustit Delivery Partner</h1>
            <p className="text-[11px] text-slate-400">Bahraich Hyperlocal Pro Fleet Network</p>
          </div>

          {/* Email OTP Auth Box */}
          <div className="rounded-xl bg-slate-850 p-3.5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                {!otpSent ? "Step 1: Enter Partner Email" : "Step 2: Enter 6-Digit Code"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Gmail SMTP Live</span>
            </div>

            {!otpSent ? (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Registered Email ID
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul.rider@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                {authError && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300">
                    {authError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={isAuthPending || !authEmail.includes("@")}
                  onClick={handleSendEmailOtp}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 transition"
                >
                  {isAuthPending ? "Sending OTP Code..." : "Send Verification Code →"}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-[10px] text-emerald-300">
                  {authSuccessMsg || `Code delivered to ${authEmail}`}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-amber-500/60 bg-slate-900 py-2 text-center text-lg font-black tracking-widest text-amber-300 focus:outline-none font-mono"
                  />
                </div>

                {authError && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300">
                    {authError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={isAuthPending || authOtp.length !== 6}
                  onClick={handleVerifyEmailOtp}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition"
                >
                  {isAuthPending ? "Verifying..." : "Verify & Access Dashboard →"}
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setAuthOtp("");
                      setAuthError(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    ← Change Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCountdown > 0 || isAuthPending}
                    onClick={handleSendEmailOtp}
                    className="text-amber-400 hover:underline disabled:text-slate-500"
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick 1-Tap Fleet Switcher for Testing */}
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">
              Quick 1-Tap Test Fleet (Bahraich Fleet):
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("9118643415")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-2 text-[11px] hover:border-orange-400 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-orange-500/20 text-orange-300 grid place-items-center text-xs">
                    🏍️
                  </span>
                  <div className="text-left">
                    <span className="font-bold text-white block">Lucky Shukla</span>
                    <span className="text-[10px] text-slate-400 font-mono">Bahraich Fleet · Star: 5.0</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-orange-400">1-Tap Login →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("9415011111")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-2 text-[11px] hover:border-amber-400 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 grid place-items-center text-xs">
                    🏍️
                  </span>
                  <div className="text-left">
                    <span className="font-bold text-white block">Rahul Verma</span>
                    <span className="text-[10px] text-slate-400 font-mono">UP-40-AB-1234 · Star: 4.9</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400">1-Tap Login →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("9415022222")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-2 text-[11px] hover:border-emerald-400 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-300 grid place-items-center text-xs">
                    🛵
                  </span>
                  <div className="text-left">
                    <span className="font-bold text-white block">Amit Shukla</span>
                    <span className="text-[10px] text-slate-400 font-mono">UP-40-XY-5678 · Star: 4.8</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">1-Tap Login →</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setKycEmail(authEmail || "luckyshuklar@gmail.com");
                  setKycPhone(authEmail ? "" : "9118643415");
                  setIsKycModalOpen(true);
                }}
                className="text-[11px] font-semibold text-amber-400 hover:underline"
              >
                + Register New Rider Partner (KYC Form)
              </button>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ── KYC ONBOARDING MODAL (FOR NEW RIDERS) ── */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {isKycModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
            <div className="w-full max-w-sm rounded-2xl border border-amber-400/60 bg-slate-900 p-4 shadow-2xl space-y-3.5 my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-black text-white">Rider KYC Registration</h2>
                  <p className="text-[10px] text-amber-400">Bahraich Delivery Partner Fleet</p>
                </div>
                <button
                  onClick={() => setIsKycModalOpen(false)}
                  className="h-6 w-6 rounded-full bg-slate-800 grid place-items-center text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {kycError && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300">
                  {kycError}
                </div>
              )}

              {/* Profile Photo Upload */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {kycProfileImage ? (
                    <img src={kycProfileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl">📸</span>
                  )}
                </div>
                <div className="text-left text-[11px] flex-1">
                  <span className="font-bold text-white block">Profile Selfie / Photo</span>
                  <label className="mt-1 inline-block cursor-pointer rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-slate-950 hover:bg-amber-400">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  1. Personal & Contact Info
                </span>
                <input
                  type="text"
                  placeholder="Full Legal Name *"
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="email"
                  placeholder="Partner Email Address"
                  value={kycEmail}
                  onChange={(e) => setKycEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <input
                  type="tel"
                  placeholder="10-Digit Mobile Number *"
                  value={kycPhone}
                  onChange={(e) => setKycPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Residential Address (e.g. Digahia, Bahraich) *"
                  value={kycAddress}
                  onChange={(e) => setKycAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              {/* Vehicle & Driving Details */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  2. Vehicle & License
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={kycVehicleType}
                    onChange={(e) => setKycVehicleType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2 py-1.5 text-xs text-white"
                  >
                    <option value="bike">Motorcycle / Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="electric_bike">EV Bike / Scooter</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Vehicle No. (UP-40-XX-0000) *"
                    value={kycVehicleNo}
                    onChange={(e) => setKycVehicleNo(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Driving License Number (DL)"
                  value={kycDlNo}
                  onChange={(e) => setKycDlNo(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              {/* Bank & Settlement Details */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  3. Bank & Daily UPI Payouts
                </span>
                <input
                  type="text"
                  placeholder="Bank Account Holder Name"
                  value={kycBankHolder}
                  onChange={(e) => setKycBankHolder(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={kycBankAcc}
                    onChange={(e) => setKycBankAcc(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2 py-1.5 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code (e.g. SBIN0001234)"
                    value={kycIfsc}
                    onChange={(e) => setKycIfsc(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Bank Name (e.g. State Bank of India)"
                  value={kycBankName}
                  onChange={(e) => setKycBankName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Instant UPI ID (e.g. 9415011111@paytm)"
                  value={kycUpi}
                  onChange={(e) => setKycUpi(e.target.value.toLowerCase())}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-emerald-400 font-mono"
                />
                <input
                  type="text"
                  placeholder="PAN Card (Optional for TDS)"
                  value={kycPan}
                  onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <button
                type="button"
                disabled={isKycSubmitting}
                onClick={handleSubmitKyc}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 transition"
              >
                {isKycSubmitting ? "Submitting KYC..." : "Submit KYC & Go Online 🟢"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── SCREEN 2: RIDER PRO DASHBOARD (COMPLETE ECOSYSTEM) ──
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-3.5 py-3 max-w-sm mx-auto flex flex-col justify-between font-sans">
      <div className="space-y-3">
        {/* Top Header: Rider Profile Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden grid place-items-center">
                {rider.profile_image_url ? (
                  <img src={rider.profile_image_url} alt={rider.full_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-base">🛵</span>
                )}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                  isOnline ? "bg-emerald-500" : "bg-slate-500"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{rider.full_name}</span>
                <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                  ★ {Number(rider.rating || 5.0).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                <span>{rider.vehicle_number}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">KYC Verified ✓</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Duty Online/Offline Toggle */}
            <button
              type="button"
              onClick={handleToggleOnline}
              className={`relative inline-flex h-6 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOnline ? "bg-emerald-500" : "bg-slate-750"
              }`}
              aria-label="Toggle Online Duty"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isOnline ? "translate-x-8" : "translate-x-0"
                }`}
              />
              <span
                className={`absolute inset-0 flex items-center text-[9px] font-black uppercase px-1.5 pointer-events-none ${
                  isOnline ? "text-slate-950 justify-start" : "text-slate-400 justify-end"
                }`}
              >
                {isOnline ? "ON" : "OFF"}
              </span>
            </button>

            {/* Profile / Bank Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              title="Profile & Bank Settings"
              className="grid h-6 w-6 place-items-center rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
            >
              ⚙️
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleRiderLogout}
              title="Logout"
              className="grid h-6 w-6 place-items-center rounded-lg bg-slate-800 text-[10px] text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live GPS & Shift Timer Bar */}
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-2.5 py-1.5 border border-slate-800 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono">GPS: {locationStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Duty: {formatShiftTime(shiftSeconds)}</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
              Bahraich Zone
            </span>
          </div>
        </div>

        {/* ── 4-CARD FINANCIAL SCORECARD ── */}
        <div className="grid grid-cols-2 gap-2">
          {/* Card 1: Today's Earnings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase text-slate-400">Today's Earned</span>
              <span className="text-xs">💰</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-black text-emerald-400">
                ₹{scorecard?.todayEarnings ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">
                ({scorecard?.todayTripsCount ?? 0} trips)
              </span>
            </div>
          </div>

          {/* Card 2: This Month's Earnings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase text-slate-400">This Month</span>
              <span className="text-xs">📈</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-black text-amber-400">
                ₹{scorecard?.monthEarnings ?? Number(rider.total_earnings || 0)}
              </span>
              <span className="text-[10px] text-slate-400">
                ({scorecard?.monthTripsCount ?? Number(rider.total_deliveries_count || 0)} orders)
              </span>
            </div>
          </div>

          {/* Card 3: COD Cash in Hand (With Limit Alert) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase text-slate-400">COD Cash in Hand</span>
              <span className="text-xs">💵</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-base font-black text-white">
                ₹{scorecard?.cashInHand ?? Number(rider.cash_in_hand || 0)}
              </span>
              <span className="text-[9px] text-slate-400">Limit: ₹2,000</span>
            </div>
            <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full ${
                  (scorecard?.cashInHand ?? Number(rider.cash_in_hand || 0)) > 1500
                    ? "bg-rose-500"
                    : "bg-amber-400"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (((scorecard?.cashInHand ?? Number(rider.cash_in_hand || 0)) / 2000) * 100),
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Card 4: Total Deliveries Count */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase text-slate-400">All-Time Deliveries</span>
              <span className="text-xs">📦</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-black text-indigo-400">
                {scorecard?.totalDeliveries ?? Number(rider.total_deliveries_count || 0)}
              </span>
              <span className="text-[10px] text-slate-400">completed</span>
            </div>
          </div>
        </div>

        {/* ── WALLET & INSTANT UPI PAYOUT STRIP ── */}
        <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-850 p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Available Wallet Balance</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-emerald-400">
                ₹{scorecard?.walletBalance ?? Number(rider.wallet_balance || 0)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {rider.upi_id || "Direct UPI"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPayoutModalOpen(true)}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-slate-950 hover:bg-emerald-400 shadow-md transition"
          >
            ⚡ Instant UPI Payout
          </button>
        </div>

        {/* ── ACTIVE ORDER OR RADAR SCANNER ── */}
        {activeOrder ? (
          <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-slate-900 to-indigo-950/60 p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                ACTIVE #{activeOrder.id.slice(-6)}
              </span>
              <span className="text-[10px] font-bold uppercase text-indigo-300">
                {activeOrder.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Leg 1: Restaurant Pickup Information */}
            <div className="rounded-xl bg-slate-850 p-2.5 text-xs space-y-1.5 border border-slate-800">
              <div className="flex justify-between items-center font-bold text-white">
                <span>🍽️ {activeOrder.business?.name || "Restaurant"}</span>
                {activeOrder.business?.phone && (
                  <a href={`tel:${activeOrder.business.phone}`} className="text-amber-400 text-[11px] underline">
                    📞 Call Shop
                  </a>
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{activeOrder.business?.address}</p>

              {/* Navigation Leg 1 */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  (activeOrder.business?.address || activeOrder.business?.name || "Bahraich") + ", UP",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 pt-0.5"
              >
                <span>📍 Google Maps to Restaurant</span>
                <span>↗</span>
              </a>
            </div>

            {/* Leg 2: Customer Doorstep Information */}
            <div className="rounded-xl bg-slate-850 p-2.5 text-xs space-y-1.5 border border-slate-800">
              <div className="flex justify-between items-center font-bold text-white">
                <span>👤 {activeOrder.customer_name}</span>
                <a href={`tel:${activeOrder.customer_phone}`} className="text-amber-400 text-[11px] underline">
                  📞 Call Customer
                </a>
              </div>
              <p className="text-[10px] text-slate-400">
                {activeOrder.customer_address?.street}, {activeOrder.customer_address?.city}
              </p>

              {/* Navigation Leg 2 */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  activeOrder.customer_address?.street + ", " + activeOrder.customer_address?.city,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 pt-0.5"
              >
                <span>📍 Google Maps to Customer Doorstep</span>
                <span>↗</span>
              </a>

              {/* Cash Collection Alert */}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-300">
                  {activeOrder.payment_mode === "cod" ? "💵 Collect Cash on Delivery:" : "⚡ Paid Online:"}
                </span>
                <span className="font-black text-amber-400 text-xs">₹{activeOrder.total_amount}</span>
              </div>
            </div>

            {/* Order Items Preview */}
            {activeOrder.hyperlocal_order_items && activeOrder.hyperlocal_order_items.length > 0 && (
              <div className="p-2 bg-slate-850 rounded-xl text-[11px] space-y-1 text-slate-300">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Items to Pickup</span>
                {activeOrder.hyperlocal_order_items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.quantity}x {i.item_name}</span>
                    <span>₹{i.total_price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action State: 1. Pickup vs 2. Customer OTP Delivery */}
            {activeOrder.status === "rider_assigned" ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-2 text-center text-[11px] text-blue-300 font-medium">
                  Step 1: Go to restaurant & collect food parcel.
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleMarkPickedUp}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition"
                >
                  {isSubmitting ? "Updating..." : "1. Confirm Pickup from Shop →"}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 space-y-2">
                {activeOrder.payment_mode === "cod" && (
                  <div className="rounded-lg bg-amber-400/20 border border-amber-400/40 p-1.5 text-center text-[11px] font-bold text-amber-300">
                    💵 Collect ₹{activeOrder.total_amount} Cash from customer before submitting OTP!
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-amber-300 block">
                    Step 2: Ask customer for 4-Digit Delivery OTP
                  </span>
                  <p className="text-[9px] text-slate-400">
                    Shown in customer's Trustit app under "My Orders"
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    maxLength={4}
                    placeholder="4-digit OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-lg border border-amber-500/60 bg-slate-900 py-1.5 text-center font-mono text-xs font-bold tracking-widest text-amber-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || enteredOtp.length !== 4}
                    onClick={handleCompleteWithOtp}
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50 transition shrink-0"
                  >
                    {isSubmitting ? "..." : "Verify & Complete"}
                  </button>
                </div>
                {otpError && <p className="text-[9px] text-rose-400">{otpError}</p>}
              </div>
            )}
          </div>
        ) : (
          /* Radar Waiting Card */
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-center space-y-1.5">
            <div className="relative mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-800">
              <span className="text-base">📡</span>
              {isOnline && (
                <span className="absolute -inset-1 rounded-full border border-emerald-500/40 animate-ping" />
              )}
            </div>
            <p className="text-xs font-bold text-slate-200">
              {isOnline ? "Proximity Radar Active (Ring 1 → Ring 3)" : "You are currently OFF DUTY"}
            </p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              {isOnline
                ? "Listening for orders nearest to your GPS position. Loud siren buzzer will ring when assigned."
                : "Toggle duty switch to ON to start receiving food and grocery orders in Bahraich."}
            </p>
          </div>
        )}

        {/* ── RECENT TRIP HISTORY ── */}
        {scorecard?.recentTrips && scorecard.recentTrips.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
              Recent Completed Deliveries
            </span>
            <div className="space-y-1.5">
              {scorecard.recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between rounded-lg bg-slate-850 p-2 text-[11px]"
                >
                  <div>
                    <span className="font-bold text-white block">{trip.shopName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      Bill: ₹{trip.billAmount} · {trip.paymentMode.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-400 block">+₹{trip.amount}.00</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(trip.deliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency SOS & Support Button */}
        <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🚨</span>
            <div>
              <span className="text-xs font-bold text-rose-300 block">Emergency & Safety SOS</span>
              <span className="text-[9px] text-slate-400">24x7 Direct Police & Support Helpline</span>
            </div>
          </div>
          <a
            href="tel:112"
            className="rounded-lg bg-rose-500 px-3 py-1 text-[10px] font-bold text-white hover:bg-rose-600 transition"
          >
            Call 112
          </a>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="my-2 rounded-xl bg-emerald-500 px-3 py-2 text-[10px] font-bold text-slate-950 flex justify-between items-center shadow-lg">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold px-1 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── CASCADING PROXIMITY DISPATCH POPUP (30-SECOND SIREN RING) ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {incomingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-xs sm:max-w-sm rounded-2xl border-2 border-amber-400 bg-slate-900 p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-slate-950 animate-pulse">
                ⚡ INCOMING DISPATCH (RING 1)
              </span>
              <span className="font-mono text-sm font-black text-rose-400">{countdown}s</span>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Pickup Merchant</span>
              <h3 className="text-sm font-bold text-white">{incomingOrder.business?.name || "Local Merchant"}</h3>
              <p className="text-[10px] text-slate-400 line-clamp-1">{incomingOrder.business?.address}</p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-xl bg-slate-800/80 py-2 text-center text-xs">
              <div>
                <span className="text-[9px] text-slate-400 block">Your Payout</span>
                <span className="font-black text-emerald-400 text-xs">₹35.00</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Order Value</span>
                <span className="font-black text-amber-400 text-xs">₹{incomingOrder.total_amount}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Distance</span>
                <span className="font-black text-indigo-300 text-xs">~1.1 km</span>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 text-center">
              If ignored or declined, radar will automatically escalate to the next closest rider.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleDeclineIncomingOrder}
                className="rounded-xl bg-slate-850 py-2 text-[11px] font-bold text-slate-400 hover:text-white border border-slate-700"
              >
                Pass / Decline
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAcceptIncomingOrder}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-[11px] font-black text-slate-950 shadow-md transition"
              >
                {isSubmitting ? "Accepting..." : "ACCEPT ORDER →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── INSTANT UPI PAYOUT MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-xs rounded-2xl border border-emerald-500/50 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-white">Instant UPI Settlement</span>
              <button
                onClick={() => {
                  setIsPayoutModalOpen(false);
                  setPayoutResult(null);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Balance</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{scorecard?.walletBalance ?? Number(rider.wallet_balance || 0)}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                Withdrawal Destination:{" "}
                <span className="text-white font-mono font-semibold">
                  {rider.upi_id || rider.bank_account_number || "Linked Bank Account"}
                </span>
              </p>
            </div>

            {payoutResult && (
              <div
                className={`rounded-lg p-2 text-[11px] ${
                  payoutResult.success
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                }`}
              >
                {payoutResult.message}
              </div>
            )}

            {!payoutResult?.success && (
              <button
                type="button"
                disabled={payoutLoading || (scorecard?.walletBalance ?? Number(rider.wallet_balance || 0)) <= 0}
                onClick={handleInstantPayout}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition"
              >
                {payoutLoading ? "Processing Transfer..." : "Confirm & Transfer Now ⚡"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── SETTINGS & PROFILE DETAILS MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-white">Partner Profile & Bank Info</span>
              <button onClick={() => setIsSettingsOpen(false)} className="text-xs text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-white">{rider.full_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-white">{rider.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-mono text-amber-400">{rider.vehicle_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Bank Name:</span>
                <span className="text-white">{rider.bank_name || "State Bank of India"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Account No:</span>
                <span className="font-mono text-white">
                  {rider.bank_account_number ? `•••• ${rider.bank_account_number.slice(-4)}` : "Registered"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">UPI ID:</span>
                <span className="font-mono text-emerald-400">{rider.upi_id || "Not Linked"}</span>
              </div>
              <div className="flex justify-between pb-1.5">
                <span className="text-slate-400">KYC Status:</span>
                <span className="text-emerald-400 font-bold">Approved ✓</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="w-full rounded-xl bg-slate-800 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
