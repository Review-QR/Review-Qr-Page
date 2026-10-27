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
  const [loginOtp, setLoginOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // New Registration form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regVehicleType, setRegVehicleType] = useState<"bike" | "scooter">("bike");
  const [regVehicleNo, setRegVehicleNo] = useState("");

  // Incoming Order Modal Simulation (Display Over Other Apps)
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

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay requires user interaction
    }
  }

  // Load saved rider on mount
  useEffect(() => {
    try {
      const savedId = localStorage.getItem("trustit_rider_id");
      if (savedId) {
        loadRiderById(savedId);
      }
    } catch {}
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
    } catch {
      // Ignore
    }
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
        if (data.availableOrders && data.availableOrders.length > 0 && !incomingOrder && isOnline) {
          setIncomingOrder(data.availableOrders[0]);
          setCountdown(30);
          playAlertBuzzer();
        }
      }
      setAvailableOrders(data.availableOrders || []);
    } catch {
      // Ignore network error
    }
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
          setLocationStatus(`Live GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);

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
          setLocationStatus("GPS Bahraich Fleet Active");
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

  // Countdown timer for incoming order popup
  useEffect(() => {
    if (!incomingOrder) return;
    if (countdown <= 0) {
      setIncomingOrder(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
      if (countdown % 2 === 0) playAlertBuzzer();
    }, 1000);
    return () => clearTimeout(timer);
  }, [incomingOrder, countdown]);

  // Rider Login
  async function handleRiderLogin(targetPhone?: string) {
    const phoneToUse = targetPhone || loginPhone;
    const clean = phoneToUse.replace(/\D/g, "").slice(-10);
    if (clean.length < 10) {
      setLoginError("Please enter a valid 10-digit mobile number.");
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
      setLoginError("Please fill in your Full Name and 10-digit phone number.");
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
      setOtpError("Please enter valid 4-digit customer delivery OTP.");
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
        setSuccessToast(`Delivery Completed! Earned ₹${data.earnedPayout}`);
        fetchRiderData();
      } else {
        setOtpError(data.error || "Invalid OTP code.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── RIDER LOGIN SCREEN (If not logged in) ──
  if (!rider) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-md mx-auto flex flex-col justify-center font-sans">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 text-3xl mx-auto shadow-lg shadow-orange-500/25">
              🛵
            </span>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white">Trustit Rider Partner</h1>
            <p className="mt-1 text-xs text-slate-400">
              Bahraich Hyperlocal Delivery Fleet Console
            </p>
          </div>

          <div className="mt-6 flex rounded-2xl bg-slate-800/80 p-1 text-xs font-bold">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setLoginError(null);
              }}
              className={`flex-1 rounded-xl py-2 text-center transition ${
                !isRegisterMode ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In (Existing Rider)
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setLoginError(null);
              }}
              className={`flex-1 rounded-xl py-2 text-center transition ${
                isRegisterMode ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Join New Partner
            </button>
          </div>

          {loginError && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              {loginError}
            </div>
          )}

          {!isRegisterMode ? (
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex rounded-xl border border-slate-700 bg-slate-800/80 overflow-hidden focus-within:border-amber-500">
                  <span className="px-3 py-2.5 text-xs font-bold text-slate-400 bg-slate-800 border-r border-slate-700">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="e.g. 9415011111"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full bg-transparent px-3 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Quick Select Buttons for Test Fleet */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  ⚡ Quick 1-Tap Fleet Logins (Bahraich Fleet):
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone("9415011111");
                      handleRiderLogin("9415011111");
                    }}
                    className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/60 p-2.5 text-xs hover:border-amber-400 hover:bg-slate-800 transition text-left"
                  >
                    <div>
                      <div className="font-bold text-white">Rahul Verma</div>
                      <div className="text-[10px] text-slate-400">Bike UP-40-AB-1234 · +91 94150 11111</div>
                    </div>
                    <span className="text-amber-400 font-bold text-xs">Tap to Login →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone("9415022222");
                      handleRiderLogin("9415022222");
                    }}
                    className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/60 p-2.5 text-xs hover:border-amber-400 hover:bg-slate-800 transition text-left"
                  >
                    <div>
                      <div className="font-bold text-white">Amit Shukla</div>
                      <div className="text-[10px] text-slate-400">Bike UP-40-XY-5678 · +91 94150 22222</div>
                    </div>
                    <span className="text-amber-400 font-bold text-xs">Tap to Login →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone("9415033333");
                      handleRiderLogin("9415033333");
                    }}
                    className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/60 p-2.5 text-xs hover:border-amber-400 hover:bg-slate-800 transition text-left"
                  >
                    <div>
                      <div className="font-bold text-white">Sonu Qureshi</div>
                      <div className="text-[10px] text-slate-400">Scooter UP-40-CD-9012 · +91 94150 33333</div>
                    </div>
                    <span className="text-amber-400 font-bold text-xs">Tap to Login →</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoginPending || loginPhone.length < 10}
                onClick={() => handleRiderLogin()}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-xs font-black text-slate-950 shadow-lg shadow-orange-500/25 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 transition"
              >
                {isLoginPending ? "Authenticating Rider..." : "Sign In & Go Online →"}
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300">Rider Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mohd Rashid"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Vehicle Type</label>
                  <select
                    value={regVehicleType}
                    onChange={(e) => setRegVehicleType(e.target.value as "bike" | "scooter")}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
                  >
                    <option value="bike">Motorcycle (Bike)</option>
                    <option value="scooter">Scooter / Scooty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="UP-40-XX-0000"
                    value={regVehicleNo}
                    onChange={(e) => setRegVehicleNo(e.target.value.toUpperCase())}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isLoginPending}
                onClick={handleRiderRegister}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-xs font-black text-slate-950 shadow-md hover:from-emerald-400 hover:to-teal-500 transition"
              >
                {isLoginPending ? "Registering..." : "Register As Delivery Partner →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RIDER DASHBOARD (When logged in) ──
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 max-w-md mx-auto flex flex-col justify-between font-sans">
      {/* Top Rider Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white">Trustit Rider Partner</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                ★ {rider.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {rider.full_name} · {rider.vehicle_number}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleOnline}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-md ${
                isOnline
                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 ring-2 ring-emerald-400/50"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {isOnline ? "🟢 ON DUTY" : "🔴 OFF DUTY"}
            </button>
            <button
              type="button"
              onClick={handleRiderLogout}
              title="Logout"
              className="grid h-8 w-8 place-items-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              🚪
            </button>
          </div>
        </div>

        {/* GPS Location Tracker Strip */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono">{locationStatus}</span>
          </div>
          <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-md font-bold text-amber-300">
            Bahraich Fleet
          </span>
        </div>

        {/* Rider Wallet & Cash in Hand Quick Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Today's Earnings
            </span>
            <span className="text-lg font-black text-emerald-400">₹{rider.wallet_balance}</span>
            <span className="text-[10px] text-slate-500 block">Payout (₹35 / delivery)</span>
          </div>
          <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              COD Cash in Hand
            </span>
            <span className="text-lg font-black text-amber-400">₹{rider.cash_in_hand}</span>
            <span className="text-[10px] text-slate-500 block">Weekly deposit balance</span>
          </div>
        </div>

        {/* Active In-Progress Delivery */}
        {activeOrder ? (
          <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-3xl border-2 border-indigo-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-500 text-white">
                CURRENT ORDER #{activeOrder.id.slice(-6)}
              </span>
              <span className="text-xs font-bold text-indigo-300 uppercase">
                {activeOrder.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Restaurant / Store Info */}
            <div className="p-3 bg-slate-800/80 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>🍽️ {activeOrder.business?.name || "Restaurant"}</span>
                <a
                  href={`tel:${activeOrder.business?.phone}`}
                  className="text-amber-400 underline font-bold"
                >
                  Call Store
                </a>
              </div>
              <p className="text-slate-400 line-clamp-1">{activeOrder.business?.address}</p>
            </div>

            {/* Customer Delivery Info */}
            <div className="p-3 bg-slate-800/80 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>📍 Customer: {activeOrder.customer_name}</span>
                <a
                  href={`tel:${activeOrder.customer_phone}`}
                  className="text-amber-400 underline font-bold"
                >
                  Call Customer
                </a>
              </div>
              <p className="text-slate-400">
                {activeOrder.customer_address?.street}, {activeOrder.customer_address?.city}
              </p>
              <div className="pt-2 flex justify-between items-center text-slate-300 border-t border-slate-700/60 mt-1">
                <span>Collect Cash (COD):</span>
                <span className="text-base font-black text-amber-400">₹{activeOrder.total_amount}</span>
              </div>
            </div>

            {/* Delivery Action Controls */}
            {activeOrder.status === "rider_assigned" ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleMarkPickedUp}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl text-sm shadow-lg hover:from-blue-500 hover:to-indigo-500 transition"
              >
                {isSubmitting ? "Updating..." : "1. Confirm Pickup from Store ➔"}
              </button>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-300 block">
                  2. Handover: Ask 4-Digit Delivery OTP from Customer
                </span>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-900 border border-amber-500/60 rounded-xl px-3 py-2 text-center text-lg font-mono font-black text-amber-300 tracking-widest focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || enteredOtp.length !== 4}
                    onClick={handleCompleteWithOtp}
                    className="px-5 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-300 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? "..." : "Verify & Deliver"}
                  </button>
                </div>
                {otpError && <p className="text-xs text-rose-400 font-semibold">{otpError}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
            <span className="text-3xl block">🛵</span>
            <p className="text-sm font-bold text-slate-300">
              {isOnline ? "Waiting for new delivery orders..." : "You are currently OFF DUTY"}
            </p>
            <p className="text-xs text-slate-500">
              {isOnline
                ? "GPS active in Bahraich. When a shop prepares an order, loud buzzer will sound."
                : "Toggle duty ON to start receiving food and kirana orders."}
            </p>
          </div>
        )}
      </div>

      {/* Floating Success Notification */}
      {successToast && (
        <div className="my-2 p-3 bg-emerald-500 text-slate-950 font-bold rounded-2xl text-xs flex justify-between items-center shadow-lg">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="font-black px-2">
            ✕
          </button>
        </div>
      )}

      {/* ── SIMULATED ANDROID POPUP OVERLAY ON INCOMING ORDER ── */}
      {incomingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full animate-pulse">
                ⚡ NEW ORDER REQUEST
              </span>
              <span className="text-base font-black text-rose-400 font-mono">{countdown}s</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pickup From</span>
              <h3 className="text-lg font-black text-white">{incomingOrder.business?.name || "Local Store"}</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{incomingOrder.business?.address}</p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Delivery Payout</span>
                <span className="text-base font-black text-emerald-400">₹35.00</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Order Value</span>
                <span className="text-base font-black text-amber-400">₹{incomingOrder.total_amount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Distance</span>
                <span className="text-base font-black text-indigo-300">~1.4 km</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIncomingOrder(null)}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Pass / Reject
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAcceptIncomingOrder}
                className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg hover:from-emerald-400 hover:to-teal-400 transition"
              >
                {isSubmitting ? "Accepting..." : "ACCEPT ORDER ➔"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
