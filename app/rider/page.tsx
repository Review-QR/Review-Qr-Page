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

  // Incoming Order Modal Simulation (Display Over Other Apps)
  const [incomingOrder, setIncomingOrder] = useState<HyperlocalOrder | null>(null);
  const [countdown, setCountdown] = useState(30);

  // OTP Handover State
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Audio Buzzer using Web Audio API (works without external mp3 assets)
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
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz loud beep
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay may require user interaction
    }
  }

  // Fetch Rider Profile & Orders
  async function fetchRiderData() {
    try {
      const res = await fetch("/api/hyperlocal/rider?riderId=33333333-3333-4333-a333-333333333301");
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
        if (data.availableOrders && data.availableOrders.length > 0 && !incomingOrder) {
          // Trigger incoming order alert popup
          setIncomingOrder(data.availableOrders[0]);
          setCountdown(30);
          playAlertBuzzer();
        }
      }
      setAvailableOrders(data.availableOrders || []);
    } catch {
      // Handle network error
    }
  }

  // Periodic GPS Location updates
  useEffect(() => {
    fetchRiderData();
    const interval = setInterval(fetchRiderData, 4000);

    // Watch position via browser GPS
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCurrentCoords({ lat, lon });
          setLocationStatus(`Live GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);

          // Send GPS ping to server
          fetch("/api/hyperlocal/rider", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              action: "update_gps",
              riderId: "33333333-3333-4333-a333-333333333301",
              latitude: lat,
              longitude: lon,
            }),
          }).catch(() => {});
        },
        () => {
          setLocationStatus("GPS signal simulated (Bahraich Center)");
          setCurrentCoords({ lat: 27.5745, lon: 81.5965 });
        },
        { enableHighAccuracy: true },
      );

      return () => {
        clearInterval(interval);
        navigator.geolocation.clearWatch(watchId);
      };
    }

    return () => clearInterval(interval);
  }, []);

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

  async function handleToggleOnline() {
    const nextState = !isOnline;
    setIsOnline(nextState);
    await fetch("/api/hyperlocal/rider", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "toggle_online",
        riderId: "33333333-3333-4333-a333-333333333301",
        isOnline: nextState,
      }),
    });
    fetchRiderData();
  }

  async function handleAcceptIncomingOrder() {
    if (!incomingOrder) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "accept_order",
          riderId: "33333333-3333-4333-a333-333333333301",
          orderId: incomingOrder.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncomingOrder(null);
        fetchRiderData();
        setSuccessToast("Order Accepted! Head to the restaurant.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePickupOrder() {
    if (!activeOrder) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "pickup_order",
          riderId: "33333333-3333-4333-a333-333333333301",
          orderId: activeOrder.id,
        }),
      });
      fetchRiderData();
      setSuccessToast("Food Picked Up! Delivering to customer address.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteDelivery() {
    if (!activeOrder || enteredOtp.length !== 4) {
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
          riderId: "33333333-3333-4333-a333-333333333301",
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 max-w-md mx-auto flex flex-col justify-between font-sans">
      {/* Top Rider Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white">Trustit Rider Partner</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                ★ 4.9
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{rider?.full_name || "Rahul Verma"} · {rider?.vehicle_number || "UP-40-AB-1234"}</p>
          </div>

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
        </div>

        {/* GPS Location Tracker Strip */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-emerald-400">📍</span>
            <span className="text-slate-300 font-medium">{locationStatus}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Background GPS</span>
        </div>

        {/* Earnings & COD Wallet Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-800 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Today Payout</span>
            <span className="text-xl font-black text-emerald-400 block mt-0.5">₹{rider?.wallet_balance ?? 350}</span>
            <span className="text-[10px] text-slate-500">Auto-transfers tonight</span>
          </div>

          <div className="p-3.5 bg-slate-800 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Cash in Hand (COD)</span>
            <span className="text-xl font-black text-amber-400 block mt-0.5">₹{rider?.cash_in_hand ?? 0}</span>
            <span className="text-[10px] text-slate-500">To deposit with Trustit</span>
          </div>
        </div>

        {successToast && (
          <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>✓ {successToast}</span>
            <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-400 font-bold">✕</button>
          </div>
        )}

        {/* ACTIVE RUNNING ORDER CARD */}
        {activeOrder ? (
          <div className="p-5 bg-indigo-950/60 rounded-3xl border-2 border-indigo-500/60 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500 text-white">
                Active Order ({activeOrder.status.replace(/_/g, " ")})
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                Earning: ₹{activeOrder.delivery_fee || 35}
              </span>
            </div>

            {/* Pickup Location */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase block">1. Pickup Restaurant</span>
              <p className="font-bold text-white text-sm">{activeOrder.business?.name || "Deepak Sweets & Bakers"}</p>
              <p className="text-slate-400 text-[11px]">{activeOrder.business?.address || "Near Peepal Chauraha, Bahraich"}</p>
              {activeOrder.business?.phone && (
                <a href={`tel:${activeOrder.business.phone}`} className="inline-block mt-1 text-indigo-400 text-[11px] font-semibold underline">
                  Call Restaurant: {activeOrder.business.phone}
                </a>
              )}
            </div>

            {/* Delivery Location */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">2. Customer Drop Address</span>
              <p className="font-bold text-white text-sm">{activeOrder.customer_name} ({activeOrder.customer_phone})</p>
              <p className="text-slate-400 text-[11px]">{activeOrder.customer_address?.street}, {activeOrder.customer_address?.city}</p>
              <p className="text-amber-400 text-[11px] font-bold">
                Payment: {activeOrder.payment_mode === "cod" ? `COLLECT CASH ₹${activeOrder.total_amount}` : "PAID ONLINE (Do Not Collect Cash)"}
              </p>
            </div>

            {/* Turn-by-Turn Google Maps Navigation */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeOrder.customer_address?.street || ""}, ${activeOrder.customer_address?.city || "Bahraich"}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>🗺️ Open Turn-by-Turn Navigation</span>
              <span>↗</span>
            </a>

            {/* Actions: Pickup vs OTP Delivery */}
            {activeOrder.status === "rider_assigned" ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePickupOrder}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white rounded-xl shadow transition"
              >
                {isSubmitting ? "Updating..." : "Confirm Food Picked Up from Shop"}
              </button>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-white block">Ask Customer for 4-Digit Delivery OTP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-center text-lg font-mono tracking-widest text-white focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || enteredOtp.length !== 4}
                    onClick={handleCompleteDelivery}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow transition"
                  >
                    {isSubmitting ? "Verifying..." : "Verify & Complete"}
                  </button>
                </div>
                {otpError && <p className="text-xs text-red-400 font-medium">{otpError}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-800/40 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-4xl block">🛵</span>
            <p className="font-bold text-white text-sm">Searching for nearby orders in Bahraich...</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Keep the app open or in background. When a restaurant packs food, you will receive a loud full-screen popup.
            </p>
          </div>
        )}
      </div>

      {/* FULL-SCREEN OVERLAY POPUP ALERT (Display Over Other Apps) */}
      {incomingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-5 border-2 border-amber-500 shadow-2xl">
            {/* Header Alarm */}
            <div className="flex items-center justify-between">
              <span className="animate-bounce px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                🔔 NEW ORDER ALERT
              </span>
              <span className="text-xs font-mono font-bold text-red-400">
                {countdown}s remaining
              </span>
            </div>

            {/* Earnings Highlight */}
            <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/50 text-center">
              <span className="text-xs text-emerald-300 font-bold block">Estimated Earning</span>
              <span className="text-3xl font-black text-emerald-400 block mt-0.5">₹35.00</span>
              <span className="text-[11px] text-emerald-200 block mt-0.5">Distance: ~1.8 km</span>
            </div>

            {/* Pickup & Drop Points */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">🏪</span>
                <div>
                  <span className="text-slate-400 block text-[10px]">PICKUP</span>
                  <span className="font-bold text-white text-sm">{incomingOrder.business?.name || "Deepak Sweets & Bakers"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">📍</span>
                <div>
                  <span className="text-slate-400 block text-[10px]">DROP</span>
                  <span className="font-bold text-white text-sm">{incomingOrder.customer_name}</span>
                  <p className="text-slate-400 text-[11px]">{incomingOrder.customer_address?.street || "Civil Lines, Bahraich"}</p>
                </div>
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>

            {/* Accept / Reject Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIncomingOrder(null)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-xl"
              >
                Pass / Reject
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAcceptIncomingOrder}
                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg"
              >
                {isSubmitting ? "Accepting..." : "ACCEPT ORDER"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-4 text-center border-t border-slate-800 text-[11px] text-slate-500">
        Trustit Hyperlocal Delivery Partner v1.0 · Bahraich Fleet
      </div>
    </div>
  );
}
