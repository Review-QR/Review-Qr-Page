"use client";

import { useEffect, useState, useRef } from "react";
import type { DeliveryRider, HyperlocalOrder } from "@/lib/hyperlocal/types";

export default function RiderAppPage() {
  const [rider, setRider] = useState<DeliveryRider | null>(null);
  const [activeOrder, setActiveOrder] = useState<HyperlocalOrder | null>(null);
  const [availableOrders, setAvailableOrders] = useState<HyperlocalOrder[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [locationStatus, setLocationStatus] = useState("Acquiring GPS...");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Login & Registration State
  const [loginPhone, setLoginPhone] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // New Registration form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regVehicleType, setRegVehicleType] = useState<"bike" | "scooter">("bike");
  const [regVehicleNo, setRegVehicleNo] = useState("");

  // Incoming Order Modal Simulation
  const [incomingOrder, setIncomingOrder] = useState<HyperlocalOrder | null>(null);
  const [countdown, setCountdown] = useState(30);

  // OTP Handover State
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  // Load saved rider on mount & prime audio context on first touch/click
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

  async function loadRiderById(id: string) {
    try {
      const res = await fetch(`/api/hyperlocal/rider?riderId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.rider) {
        setRider(data.rider);
        setIsOnline(data.rider.is_online);
        localStorage.setItem("trustit_rider_id", data.rider.id);
      } else {
        localStorage.removeItem("trustit_rider_id");
        setRider(null);
      }
    } catch {}
  }

  // Fetch Rider Profile & Orders
  async function fetchRiderData() {
    if (!rider) return;
    try {
      const res = await fetch(`/api/hyperlocal/rider?riderId=${encodeURIComponent(rider.id)}`);
      const data = await res.json();
      if (data.rider) {
        setRider(data.rider);
        setIsOnline(data.rider.is_online);
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
    } catch {
      // Non-blocking catch
    }
  }

  // Rider Login
  async function handleRiderLogin(targetPhone?: string) {
    const phoneToUse = targetPhone || loginPhone;
    const clean = phoneToUse.replace(/\D/g, "").slice(-10);
    if (clean.length < 10) {
      setLoginError("Please enter valid 10-digit mobile number.");
      return;
    }
    setIsLoginPending(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "login", phone: clean }),
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRider(data.rider);
        setIsOnline(data.rider.is_online);
        localStorage.setItem("trustit_rider_id", data.rider.id);
        setLoginError(null);
      } else {
        setLoginError(data.error || "Rider not found.");
      }
    } catch {
      setLoginError("Failed to connect to server.");
    } finally {
      setIsLoginPending(false);
    }
  }

  // Rider Registration
  async function handleRiderRegister() {
    const clean = regPhone.replace(/\D/g, "").slice(-10);
    if (!regName.trim() || clean.length < 10) {
      setLoginError("Please enter Name and 10-digit phone number.");
      return;
    }
    setIsLoginPending(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "register",
          fullName: regName,
          phone: clean,
          vehicleType: regVehicleType,
          vehicleNumber: regVehicleNo || "UP-40-TEMP",
        }),
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRider(data.rider);
        setIsOnline(true);
        localStorage.setItem("trustit_rider_id", data.rider.id);
      } else {
        setLoginError(data.error || "Registration failed.");
      }
    } catch {
      setLoginError("Failed to register rider.");
    } finally {
      setIsLoginPending(false);
    }
  }

  function handleRiderLogout() {
    localStorage.removeItem("trustit_rider_id");
    setRider(null);
    setActiveOrder(null);
    setIncomingOrder(null);
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
        setSuccessToast("Order Accepted! Proceed to Restaurant.");
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
      setSuccessToast("Food Picked Up! Navigate to Customer.");
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
        setSuccessToast(`Delivered! Earned ₹${data.earnedPayout}`);
        fetchRiderData();
      } else {
        setOtpError(data.error || "Invalid OTP code.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── RIDER LOGIN SCREEN (Clean, native 11-13px scale) ──
  if (!rider) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 px-3.5 py-6 max-w-sm mx-auto flex flex-col justify-center font-sans">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
          <div className="text-center">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-lg mx-auto shadow-md">
              🛵
            </span>
            <h1 className="mt-2 text-sm font-bold text-white tracking-tight">Trustit Rider Partner</h1>
            <p className="text-[10px] text-slate-400">Bahraich Hyperlocal Delivery Fleet</p>
          </div>

          <div className="mt-4 flex rounded-xl bg-slate-800 p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setLoginError(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-center transition ${
                !isRegisterMode ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setLoginError(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-center transition ${
                isRegisterMode ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"
              }`}
            >
              New Partner
            </button>
          </div>

          {loginError && (
            <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300">
              {loginError}
            </div>
          )}

          {!isRegisterMode ? (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mobile Number</label>
                <div className="flex rounded-xl border border-slate-700 bg-slate-800/90 overflow-hidden text-xs">
                  <span className="px-2.5 py-2 text-slate-400 bg-slate-850 font-mono">+91</span>
                  <input
                    type="tel"
                    placeholder="e.g. 9415011111"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full bg-transparent px-2.5 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Quick Select Buttons for Test Fleet */}
              <div>
                <span className="block text-[10px] font-medium text-slate-400 mb-1">
                  Quick 1-Tap Login (Bahraich Fleet):
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone("9415011111");
                      handleRiderLogin("9415011111");
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-750 bg-slate-800/70 px-2.5 py-1.5 text-[11px] hover:border-amber-400 transition"
                  >
                    <span className="font-semibold text-white">Rahul Verma</span>
                    <span className="text-[10px] text-amber-400">UP-40-AB-1234 · Login →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone("9415022222");
                      handleRiderLogin("9415022222");
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-750 bg-slate-800/70 px-2.5 py-1.5 text-[11px] hover:border-amber-400 transition"
                  >
                    <span className="font-semibold text-white">Amit Shukla</span>
                    <span className="text-[10px] text-amber-400">UP-40-XY-5678 · Login →</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoginPending || loginPhone.length < 10}
                onClick={() => handleRiderLogin()}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 transition"
              >
                {isLoginPending ? "Signing in..." : "Sign In & Go Online"}
              </button>
            </div>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mohd Rashid"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Vehicle</label>
                  <select
                    value={regVehicleType}
                    onChange={(e) => setRegVehicleType(e.target.value as "bike" | "scooter")}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white"
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Vehicle No.</label>
                  <input
                    type="text"
                    placeholder="UP-40-XX-0000"
                    value={regVehicleNo}
                    onChange={(e) => setRegVehicleNo(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isLoginPending}
                onClick={handleRiderRegister}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950 shadow-md transition"
              >
                {isLoginPending ? "Registering..." : "Register As Partner"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RIDER DASHBOARD (Refined Native Scale: 11-13px fonts, slim controls) ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-3.5 py-3 max-w-sm mx-auto flex flex-col justify-between font-sans">
      <div className="space-y-3">
        {/* Top Header: Slim 44px with compact iOS-style toggle */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-800 text-sm">
              🛵
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{rider.full_name}</span>
                <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                  ★ {rider.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{rider.vehicle_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Slim iOS-style Duty Toggle (Height 26px, Width 54px) */}
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

        {/* GPS Live Status Bar (Slim 26px) */}
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-2.5 py-1.5 border border-slate-800 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono">GPS: {locationStatus}</span>
          </div>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
            Bahraich Fleet
          </span>
        </div>

        {/* Compact 3-Column Metrics Row (Height 42px) */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-xl bg-slate-900 border border-slate-800/80 py-2 text-center">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Orders</span>
            <span className="text-xs font-black text-white">{availableOrders.length}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Earned</span>
            <span className="text-xs font-black text-emerald-400">₹{rider.wallet_balance}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">COD Cash</span>
            <span className="text-xs font-black text-amber-400">₹{rider.cash_in_hand}</span>
          </div>
        </div>

        {/* Active Order Card or Clean Radar Waiting */}
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

            {/* Action State: 1. Pickup from Shop vs 2. OTP Delivery Handover */}
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
                    Shown in customer's Trustit app under "My Bookings"
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
          /* Clean Radar Waiting Box */
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 text-center space-y-1.5">
            <div className="relative mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-800">
              <span className="text-base">🛵</span>
              {isOnline && (
                <span className="absolute -inset-1 rounded-full border border-emerald-500/40 animate-ping" />
              )}
            </div>
            <p className="text-xs font-bold text-slate-200">
              {isOnline ? "Awaiting new orders..." : "You are currently OFF DUTY"}
            </p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              {isOnline
                ? "Radar active in Bahraich. When a restaurant prepares an order, loud buzzer will ring."
                : "Toggle switch to ON to start receiving food and grocery orders."}
            </p>
          </div>
        )}
      </div>

      {/* Floating Success Toast */}
      {successToast && (
        <div className="my-2 rounded-xl bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-slate-950 flex justify-between items-center shadow-lg">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="font-bold px-1 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ── SIMULATED INCOMING ORDER SLIDE-UP SHEET ── */}
      {incomingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-xs sm:max-w-sm rounded-2xl border border-amber-400 bg-slate-900 p-3.5 shadow-2xl space-y-2.5 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-slate-950 animate-pulse">
                ⚡ NEW ORDER REQUEST
              </span>
              <span className="font-mono text-[11px] font-bold text-rose-400">{countdown}s</span>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Pickup Store</span>
              <h3 className="text-xs font-bold text-white">{incomingOrder.business?.name || "Local Store"}</h3>
              <p className="text-[9px] text-slate-400 line-clamp-1">{incomingOrder.business?.address}</p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-xl bg-slate-800/80 py-1 text-center text-xs">
              <div>
                <span className="text-[9px] text-slate-400 block">Payout</span>
                <span className="font-bold text-emerald-400 text-[11px]">₹35.00</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Bill</span>
                <span className="font-bold text-amber-400 text-[11px]">₹{incomingOrder.total_amount}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Distance</span>
                <span className="font-bold text-indigo-300 text-[11px]">~1.2 km</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleDeclineIncomingOrder}
                className="rounded-xl bg-slate-800 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white"
              >
                Pass / Reject
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAcceptIncomingOrder}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-1.5 text-[10px] font-black text-slate-950 shadow-md transition"
              >
                {isSubmitting ? "Accepting..." : "ACCEPT ORDER →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
