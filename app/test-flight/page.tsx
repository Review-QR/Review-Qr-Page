"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { triggerThermalPrint, PrintableReceiptData } from "@/lib/thermal-printer";
import { riderAudio } from "@/lib/audio/rider-siren";

export type SimulationStage =
  | "1_customer_browse"
  | "2_customer_checkout"
  | "3_merchant_siren"                     // Cashfree paid -> Merchant Siren Rings
  | "4_parallel_prep_and_rider_dispatch"   // Merchant accepted! Kitchen cooking AND Rider radar alerting simultaneously!
  | "5_rider_arrived_waiting"              // Rider accepted run, traveled to store, waiting outside counter for packaging
  | "6_merchant_ready_counter_handover"   // Merchant marked packed! 2nd Push + Ding-Dong bell alert sent to rider: "Go to counter & collect"
  | "7_rider_delivering"                   // Rider collected order, traveling to doorstep with customer OTP (4921)
  | "8_delivered_escrow_split";            // Delivered! Cashfree Escrow Split breakdown

export type OrderType = "food" | "parcha";

export default function TestFlightPage() {
  const [orderType, setOrderType] = useState<OrderType>("food");
  const [stage, setStage] = useState<SimulationStage>("1_customer_browse");
  const [activeTabDevice, setActiveTabDevice] = useState<"all" | "customer" | "merchant" | "rider">("all");
  const [isMerchantSirenMuted, setIsMerchantSirenMuted] = useState<boolean>(false);
  const [isRiderSoundMuted, setIsRiderSoundMuted] = useState<boolean>(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(1200); // 20 mins
  const [kotPrinted, setKotPrinted] = useState<boolean>(false);
  const [deliveryOtpInput, setDeliveryOtpInput] = useState<string>("");
  const [customerRating, setCustomerRating] = useState<number>(5);
  const [riderNotificationModalOpen, setRiderNotificationModalOpen] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // 1. Loud 880Hz -> 1320Hz -> 1760Hz Merchant Kitchen Siren
  const playMerchantSiren = () => {
    if (isMerchantSirenMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc2.type = "square";

      // 880Hz -> 1320Hz -> 1760Hz alternating siren tones
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.36);
      osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.48);

      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.24);
      osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.36);
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.48);

      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);
    } catch {}
  };

  // Trigger Merchant Siren loop at Stage 3
  useEffect(() => {
    if (stage !== "3_merchant_siren" || isMerchantSirenMuted) return;
    playMerchantSiren();
    const interval = setInterval(() => {
      playMerchantSiren();
    }, 1800);
    return () => clearInterval(interval);
  }, [stage, isMerchantSirenMuted]);

  // Trigger Rider Proximity Siren at Stage 4 (Parallel dispatch upon merchant accept)
  useEffect(() => {
    if (stage === "4_parallel_prep_and_rider_dispatch" && !isRiderSoundMuted) {
      riderAudio.unlock();
      riderAudio.playProximitySiren();
      riderAudio.speakHindiAlert(
        orderType === "food"
          ? "नया ऑर्डर! गोल्डन ब्लॉसम कैफ़े, सिविल लाइन्स — राइडर कमाई ₹45"
          : "नया किराना पर्चा आर्डर! गुप्ता किराना स्टोर — राइडर कमाई ₹50"
      );
    } else {
      riderAudio.stopSiren();
    }
  }, [stage, isRiderSoundMuted, orderType]);

  // Trigger Rider 2nd Push Notification & Ding-Dong Bell at Stage 6 (Merchant marks ready)
  useEffect(() => {
    if (stage === "6_merchant_ready_counter_handover") {
      setRiderNotificationModalOpen(true);
      if (!isRiderSoundMuted) {
        riderAudio.unlock();
        riderAudio.playOrderReadyDingDong();
        riderAudio.speakHindiAlert("ऑर्डर तैयार है! काउंटर पर जाकर पार्सल कलेक्ट करें");
      }
    }
  }, [stage, isRiderSoundMuted]);

  // Kitchen countdown timer during Stage 4 and 5
  useEffect(() => {
    if (stage !== "4_parallel_prep_and_rider_dispatch" && stage !== "5_rider_arrived_waiting") return;
    const interval = setInterval(() => {
      setPrepSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  // Order Details based on mode
  const orderDetails =
    orderType === "food"
      ? {
          storeName: "Golden Blossom Cafe",
          category: "Cafe & Restaurant",
          items: [
            { name: "Hazelnut Cold Frappe (Large)", qty: 2, price: 110 },
            { name: "Paneer Grilled Sandwich", qty: 1, price: 100 },
          ],
          subtotal: 220,
          deliveryFee: 45,
          total: 265,
          displayCode: "ORD-7783",
          pickupCode: "7783",
          customerName: "Aman Sharma",
          customerPhone: "+91 98765 43210",
          address: "Civil Lines, Near KDC College, Bahraich",
          riderName: "Vikas Kumar",
          riderVehicle: "Hero Splendor (UP 40 AB 8821)",
          distanceToStore: "1.2 km",
          distanceToDrop: "2.4 km",
        }
      : {
          storeName: "Gupta Kirana & General Store",
          category: "Grocery & Mart",
          items: [
            { name: "Chakki Fresh Shuddh Atta (5 Kg)", qty: 1, price: 190 },
            { name: "Arhar / Toor Dal Premium (1 Kg)", qty: 1, price: 145 },
            { name: "Fortune Kachi Ghani Mustard Oil (1 Ltr)", qty: 1, price: 140 },
          ],
          subtotal: 475,
          deliveryFee: 50,
          total: 525,
          displayCode: "PARCHA-9124",
          pickupCode: "9124",
          customerName: "Sunita Verma",
          customerPhone: "+91 94501 23456",
          address: "Galla Mandi Road, Bahraich",
          riderName: "Rahul Yadav",
          riderVehicle: "Honda Activa (UP 40 XY 3412)",
          distanceToStore: "0.8 km",
          distanceToDrop: "3.1 km",
        };

  const handlePrintReceipt = () => {
    const receiptData: PrintableReceiptData = {
      businessName: orderDetails.storeName,
      orderNumber: orderDetails.displayCode,
      displayCode: orderDetails.displayCode,
      customerName: orderDetails.customerName,
      customerPhone: orderDetails.customerPhone,
      deliveryAddress: orderDetails.address,
      orderType: "delivery",
      items: orderDetails.items.map((i) => ({
        name: i.name,
        quantity: i.qty,
        price: i.price,
      })),
      subtotal: orderDetails.subtotal,
      deliveryFee: orderDetails.deliveryFee,
      total: orderDetails.total,
      paymentMode: "online",
      paymentStatus: "paid",
    };
    triggerThermalPrint(receiptData, "80mm");
    setKotPrinted(true);
  };

  const resetSimulation = () => {
    riderAudio.stopSiren();
    setStage("1_customer_browse");
    setKotPrinted(false);
    setPrepSecondsLeft(1200);
    setDeliveryOtpInput("");
    setRiderNotificationModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-sans p-3 sm:p-6 pb-20 selection:bg-blue-600 selection:text-white">
      {/* Top Mission Control Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-[#1C2541] border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Full Hyperlocal Loop · Synchronized Mission Control
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                ⚡ Parallel Dispatch: Rider Travels During Kitchen Cooking
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
              <span>🚀 3-Sided Hyperlocal "Full Loop" Simulator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time multi-device simulation: Watch merchant accept order, which <strong>instantly alerts rider in parallel</strong> during food packaging. When food is packed, merchant marks ready and rider gets a 2nd push to pick from counter!
            </p>
          </div>

          {/* Quick Actions & Sound Testers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Toggle: Food vs Kirana Parcha */}
            <div className="bg-slate-900/80 p-1 rounded-2xl border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setOrderType("food");
                  resetSimulation();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  orderType === "food"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🍔 Cafe Food Order
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderType("parcha");
                  resetSimulation();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  orderType === "parcha"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🛒 Kirana Parcha Upload
              </button>
            </div>

            {/* Live Audio Testers for Rider */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  riderAudio.unlock();
                  riderAudio.playProximitySiren();
                  setTimeout(() => riderAudio.stopSiren(), 2200);
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1"
                title="Test Rider Pulsing Radar Alert Sound"
              >
                <span>🔊 Test Rider Alert</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  riderAudio.unlock();
                  riderAudio.playOrderReadyDingDong();
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition flex items-center gap-1"
                title="Test Counter Pickup Ding-Dong Bell"
              >
                <span>🛎️ Test Ding-Dong</span>
              </button>
            </div>

            <button
              type="button"
              onClick={resetSimulation}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition flex items-center gap-1"
            >
              <span>↻ Reset Loop</span>
            </button>

            <Link
              href="/apps"
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-md transition flex items-center gap-1"
              title="Install All 3 Apps on Phone (Merchant, Customer, Rider)"
            >
              <span>📲 Install Apps on Phone</span>
              <span>↗</span>
            </Link>

            <Link
              href="/merchant-preview"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/40 transition"
            >
              Merchant Preview →
            </Link>
          </div>
        </div>

        {/* 7-Stage Chronological Stepper Bar */}
        <div className="mt-3 bg-[#1C2541]/90 border border-slate-700/80 rounded-2xl p-3 shadow-lg overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between min-w-[860px] text-xs">
            {/* Step 1 */}
            <div
              className={`flex items-center gap-1.5 ${
                stage === "1_customer_browse" || stage === "2_customer_checkout"
                  ? "text-blue-400 font-black"
                  : "text-emerald-400 font-bold"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                1
              </span>
              <span>1. Customer Orders / Parcha</span>
            </div>
            <span className="text-slate-600">→</span>

            {/* Step 2 */}
            <div
              className={`flex items-center gap-1.5 ${
                stage === "3_merchant_siren"
                  ? "text-rose-400 font-black animate-pulse"
                  : [
                      "4_parallel_prep_and_rider_dispatch",
                      "5_rider_arrived_waiting",
                      "6_merchant_ready_counter_handover",
                      "7_rider_delivering",
                      "8_delivered_escrow_split",
                    ].includes(stage)
                  ? "text-emerald-400 font-bold"
                  : "text-slate-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                2
              </span>
              <span>2. 880Hz Siren Alert</span>
            </div>
            <span className="text-slate-600">→</span>

            {/* Step 3 */}
            <div
              className={`flex items-center gap-1.5 ${
                stage === "4_parallel_prep_and_rider_dispatch"
                  ? "text-amber-400 font-black"
                  : [
                      "5_rider_arrived_waiting",
                      "6_merchant_ready_counter_handover",
                      "7_rider_delivering",
                      "8_delivered_escrow_split",
                    ].includes(stage)
                  ? "text-emerald-400 font-bold"
                  : "text-slate-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                3
              </span>
              <span>3. Parallel Cooking + Rider Radar 🔊</span>
            </div>
            <span className="text-slate-600">→</span>

            {/* Step 4 */}
            <div
              className={`flex items-center gap-1.5 ${
                stage === "5_rider_arrived_waiting"
                  ? "text-cyan-400 font-black"
                  : [
                      "6_merchant_ready_counter_handover",
                      "7_rider_delivering",
                      "8_delivered_escrow_split",
                    ].includes(stage)
                  ? "text-emerald-400 font-bold"
                  : "text-slate-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                4
              </span>
              <span>4. Rider at Counter (Waiting)</span>
            </div>
            <span className="text-slate-600">→</span>

            {/* Step 5 */}
            <div
              className={`flex items-center gap-1.5 ${
                stage === "6_merchant_ready_counter_handover"
                  ? "text-purple-400 font-black animate-pulse"
                  : ["7_rider_delivering", "8_delivered_escrow_split"].includes(stage)
                  ? "text-emerald-400 font-bold"
                  : "text-slate-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                5
              </span>
              <span>5. Food Ready (2nd Ding-Dong 🛎️)</span>
            </div>
            <span className="text-slate-600">→</span>

            {/* Step 6 */}
            <div
              className={`flex items-center gap-1.5 ${
                stage === "7_rider_delivering"
                  ? "text-indigo-400 font-black"
                  : stage === "8_delivered_escrow_split"
                  ? "text-emerald-400 font-bold"
                  : "text-slate-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                6
              </span>
              <span>6. Doorstep OTP (4921)</span>
            </div>
            <span className="text-slate-600">→</span>

            {/* Step 7 */}
            <div
              className={`flex items-center gap-1.5 ${
                stage === "8_delivered_escrow_split"
                  ? "text-emerald-400 font-black"
                  : "text-slate-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                7
              </span>
              <span>7. Cashfree Escrow Split 💰</span>
            </div>
          </div>
        </div>

        {/* Mobile Device Tab Filter (For Small Screens) */}
        <div className="lg:hidden mt-3 flex items-center justify-center gap-1.5 bg-[#1C2541] p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTabDevice("customer")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
              activeTabDevice === "customer" ? "bg-blue-600 text-white" : "text-slate-400"
            }`}
          >
            📱 Customer
          </button>
          <button
            type="button"
            onClick={() => setActiveTabDevice("merchant")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
              activeTabDevice === "merchant" ? "bg-amber-600 text-white" : "text-slate-400"
            }`}
          >
            💻 Merchant
          </button>
          <button
            type="button"
            onClick={() => setActiveTabDevice("rider")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
              activeTabDevice === "rider" ? "bg-emerald-600 text-white" : "text-slate-400"
            }`}
          >
            🛵 Rider Fleet
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* THE 3 SYNCHRONIZED LIVE CONSOLES (SIDE-BY-SIDE 3 COLUMNS)      */}
      {/* ============================================================== */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ============================================================== */}
        {/* COLUMN 1: CONSUMER SUPER-APP (📱 CUSTOMER SIDE)                */}
        {/* ============================================================== */}
        <div
          className={`${
            activeTabDevice !== "all" && activeTabDevice !== "customer" ? "hidden lg:block" : ""
          } bg-white text-slate-900 rounded-[38px] border-4 border-slate-700 shadow-2xl p-4 min-h-[640px] flex flex-col justify-between overflow-hidden relative`}
        >
          {/* Phone Top Notch */}
          <div>
            <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              <div className="w-8 h-1 rounded-full bg-slate-800"></div>
            </div>

            {/* Consumer App Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  T
                </span>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-none">Trustit Super-App</h3>
                  <span className="text-[10px] text-slate-500">Bahraich · Civil Lines</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                GPS Live ✓
              </span>
            </div>

            {/* Stage Content for Customer */}
            {stage === "1_customer_browse" && (
              <div className="mt-3 space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                    Scanned In-Store QR
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">
                    {orderDetails.storeName}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {orderType === "food"
                      ? "Best Cold Coffee, Burgers & Quick Bites in Bahraich."
                      : "Shuddh Chakki Atta, Dal, Oil & Household Mandi Groceries."}
                  </p>
                </div>

                {/* Items in Cart */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    {orderType === "food" ? "Selected Dishes in Cart:" : "Handwritten Parcha Items:"}
                  </span>

                  {orderDetails.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700">{it.qty}x</span>
                        <span className="font-semibold text-slate-800">{it.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">₹{it.price * it.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Total:</span>
                    <span className="font-mono">₹{orderDetails.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee (Rider Pay):</span>
                    <span className="font-mono">₹{orderDetails.deliveryFee}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Total Bill:</span>
                    <span className="font-mono text-sm text-blue-700">₹{orderDetails.total}</span>
                  </div>
                </div>
              </div>
            )}

            {stage === "2_customer_checkout" && (
              <div className="mt-3 text-center space-y-3 py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto animate-bounce">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Cashfree UPI Payment Successful!</h4>
                  <p className="text-xs text-slate-600 mt-1">Paid ₹{orderDetails.total} via Google Pay.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-xs text-emerald-800 font-bold">
                  Order #{orderDetails.displayCode} Sent to Merchant Counter!
                </div>
              </div>
            )}

            {stage === "3_merchant_siren" && (
              <div className="mt-4 space-y-3 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mx-auto animate-pulse">
                  👨‍🍳
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Connecting to Merchant Counter...
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {orderDetails.storeName} is receiving your order alert.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-xs font-mono font-bold text-amber-900">
                  Awaiting Kitchen Confirmation
                </div>
              </div>
            )}

            {["4_parallel_prep_and_rider_dispatch", "5_rider_arrived_waiting"].includes(stage) && (
              <div className="mt-4 space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center space-y-1">
                  <span className="text-2xl">🍳</span>
                  <h4 className="text-xs font-black text-slate-900">
                    Order Confirmed &amp; Being Prepared!
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {orderDetails.storeName} is packaging your order. Estimated time: ~20 mins.
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex items-center gap-2.5">
                  <span className="text-2xl">🛵</span>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">
                      Rider Assigned: {orderDetails.riderName}
                    </h5>
                    <p className="text-[10px] text-slate-600">{orderDetails.riderVehicle}</p>
                    <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">
                      {stage === "5_rider_arrived_waiting"
                        ? "📍 Rider arrived at store, waiting at counter"
                        : "🛵 Heading to store for pickup (ETA 3 mins)"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {stage === "6_merchant_ready_counter_handover" && (
              <div className="mt-4 space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center space-y-1">
                  <span className="text-2xl">🛍️</span>
                  <h4 className="text-xs font-black text-emerald-900">
                    Items Packed &amp; Handover at Counter!
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Merchant is handing over parcel to Rider {orderDetails.riderName}.
                  </p>
                </div>
              </div>
            )}

            {stage === "7_rider_delivering" && (
              <div className="mt-4 space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex items-center gap-3">
                  <span className="text-2xl">🛵</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      Rider {orderDetails.riderName} is On The Way!
                    </h4>
                    <p className="text-[10px] text-slate-600">{orderDetails.riderVehicle}</p>
                    <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">
                      Approaching Civil Lines (3 mins away)
                    </span>
                  </div>
                </div>

                {/* Delivery Security OTP */}
                <div className="bg-slate-900 text-white rounded-2xl p-3 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Your Doorstep Delivery OTP
                  </span>
                  <div className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                    4921
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Share this code with rider upon arrival
                  </span>
                </div>
              </div>
            )}

            {stage === "8_delivered_escrow_split" && (
              <div className="mt-4 text-center space-y-3 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                  🎉
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Order Delivered!</h4>
                  <p className="text-xs text-slate-600">Enjoy your order from {orderDetails.storeName}.</p>
                </div>

                {/* Google Maps Review Booster Gating */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">
                    How was your experience?
                  </span>
                  <div className="flex justify-center gap-1.5 text-2xl text-amber-400 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        onClick={() => setCustomerRating(s)}
                        className={customerRating >= s ? "opacity-100 scale-110" : "opacity-30"}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="block py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Share 5★ Review on Google Maps →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Customer Bottom Action Bar */}
          <div className="pt-3 border-t border-slate-100">
            {stage === "1_customer_browse" && (
              <button
                type="button"
                onClick={() => {
                  riderAudio.unlock();
                  setStage("2_customer_checkout");
                  setTimeout(() => setStage("3_merchant_siren"), 1400);
                }}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚡ Pay ₹{orderDetails.total} via Cashfree UPI</span>
                <span>→</span>
              </button>
            )}

            {stage !== "1_customer_browse" && (
              <div className="text-center text-[10px] text-slate-400 font-mono">
                Order Code: #{orderDetails.displayCode} · Live Socket Synced
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: MERCHANT PARTNER TERMINAL (💻 DUKAAN SIDE)           */}
        {/* ============================================================== */}
        <div
          className={`${
            activeTabDevice !== "all" && activeTabDevice !== "merchant" ? "hidden lg:block" : ""
          } bg-slate-900 text-white rounded-[38px] border-4 border-slate-700 shadow-2xl p-4 min-h-[640px] flex flex-col justify-between overflow-hidden relative`}
        >
          {/* Top Notch / Camera */}
          <div>
            <div className="w-4 h-4 rounded-full bg-slate-800 mx-auto mb-2 border border-slate-700"></div>

            {/* Merchant Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  🏪
                </span>
                <div>
                  <h3 className="text-xs font-black text-white leading-none">
                    {orderDetails.storeName}
                  </h3>
                  <span className="text-[10px] text-slate-400">Merchant Partner Console</span>
                </div>
              </div>

              {/* Siren Audio Toggle */}
              <button
                type="button"
                onClick={() => setIsMerchantSirenMuted(!isMerchantSirenMuted)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                  isMerchantSirenMuted
                    ? "bg-slate-800 border-slate-700 text-slate-400"
                    : "bg-rose-500/20 border-rose-500 text-rose-300"
                }`}
                title="Toggle Emergency Kitchen Siren Audio"
              >
                <span>{isMerchantSirenMuted ? "🔕 Siren Muted" : "🚨 880Hz Siren ON"}</span>
              </button>
            </div>

            {/* STAGE: IDLE WAITING */}
            {["1_customer_browse", "2_customer_checkout"].includes(stage) && (
              <div className="mt-8 text-center space-y-3 py-10">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mx-auto text-slate-400 animate-pulse">
                  📻
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Store Open &amp; Listening...</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
                    Awaiting customer orders. The 880Hz loud siren will sound immediately upon Cashfree payment!
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 3: LOUD 880Hz SIREN POPUP (URGENT INCOMING ORDER) */}
            {stage === "3_merchant_siren" && (
              <div className="mt-3 bg-gradient-to-b from-rose-950/80 to-slate-900 border-2 border-rose-500 rounded-3xl p-3.5 space-y-3 shadow-2xl animate-scaleUp">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white animate-pulse">
                    🚨 URGENT INCOMING ORDER!
                  </span>
                  <span className="text-xs font-mono font-black text-rose-300">02:54 left</span>
                </div>

                <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-700 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">#{orderDetails.displayCode}</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Paid via Cashfree UPI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Customer: {orderDetails.customerName} ({orderDetails.address})
                  </p>
                </div>

                {/* Items preview */}
                <div className="space-y-1 text-xs">
                  {orderDetails.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{it.qty}x {it.name}</span>
                      <span className="font-mono">₹{it.price * it.qty}</span>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-slate-700 flex justify-between font-bold text-white">
                    <span>Order Bill:</span>
                    <span className="text-amber-400">₹{orderDetails.subtotal}</span>
                  </div>
                </div>

                {/* Kitchen Prep Selection */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Select Prep Time:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    <span className="p-1.5 rounded-xl bg-slate-800 border border-slate-600 text-center text-slate-300">
                      15m
                    </span>
                    <span className="p-1.5 rounded-xl bg-amber-500 text-slate-950 border border-amber-400 text-center">
                      20m ✓
                    </span>
                    <span className="p-1.5 rounded-xl bg-slate-800 border border-slate-600 text-center text-slate-300">
                      30m
                    </span>
                  </div>
                </div>

                {/* Accept Button: Instantly triggers Parallel Dispatch to Rider */}
                <button
                  type="button"
                  onClick={() => {
                    riderAudio.unlock();
                    setStage("4_parallel_prep_and_rider_dispatch");
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✓ ACCEPT ORDER (+20 MINS) → DISPATCH RIDER NOW</span>
                </button>
              </div>
            )}

            {/* STAGE 4: PARALLEL COOKING & PACKAGING IN PROGRESS */}
            {stage === "4_parallel_prep_and_rider_dispatch" && (
              <div className="mt-3 space-y-3">
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-400">
                      🍳 Cooking &amp; Packaging Timer
                    </span>
                    <span className="text-sm font-black font-mono text-amber-300">
                      {Math.floor(prepSecondsLeft / 60)}:
                      {(prepSecondsLeft % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-amber-400 animate-pulse"></div>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ⚡ <strong>Parallel Dispatch Triggered:</strong> Proximity radar is alerting nearby rider {orderDetails.riderName} right now!
                  </p>
                </div>

                {/* ESC/POS Thermal Receipt Action Card */}
                <div className="bg-white text-slate-900 rounded-2xl p-3 shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 font-mono">
                      80mm ESC/POS KOT SLIP
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {kotPrinted ? "✓ Printed" : "Ready to Print"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Send order slip directly to Kitchen Bluetooth/USB Thermal Printer.
                  </p>
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🖨️ Print KOT Thermal Receipt (80mm)</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: RIDER ARRIVED AT COUNTER, MERCHANT PACKING */}
            {stage === "5_rider_arrived_waiting" && (
              <div className="mt-3 space-y-3">
                <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-2xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-cyan-300">
                      🛵 Rider at Counter
                    </span>
                    <span className="text-xs font-bold text-cyan-400">Waiting Outside</span>
                  </div>
                  <p className="text-xs text-white font-bold">
                    {orderDetails.riderName} ({orderDetails.riderVehicle}) is waiting at counter.
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Once packaging is ready, click button below to send alert to rider.
                  </p>
                </div>

                {/* MARK READY BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    riderAudio.unlock();
                    setStage("6_merchant_ready_counter_handover");
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🛎️ MARK READY &amp; CALL RIDER TO COUNTER</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* STAGE 6: COUNTER HANDOVER IN PROGRESS */}
            {stage === "6_merchant_ready_counter_handover" && (
              <div className="mt-4 space-y-3">
                <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-300">● Order Ready for Handover</span>
                    <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40">
                      Pickup Code: {orderDetails.pickupCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    2nd Push Notification &amp; Ding-Dong bell sent to Rider phone! Verify Pickup Code: <strong>{orderDetails.pickupCode}</strong> before handing over.
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 7 & 8: OUT FOR DELIVERY & DELIVERED */}
            {["7_rider_delivering", "8_delivered_escrow_split"].includes(stage) && (
              <div className="mt-4 space-y-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-400">
                    {stage === "8_delivered_escrow_split" ? "✓ Trip Delivered" : "Out for Doorstep Delivery"}
                  </span>
                  <p className="text-xs font-bold text-white">
                    Rider {orderDetails.riderName} is delivering to {orderDetails.customerName}.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {stage === "8_delivered_escrow_split"
                      ? "Escrow settlement completed! Net payout ₹" + orderDetails.subtotal + " credited."
                      : "Awaiting customer delivery OTP confirmation."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Merchant Footer Info */}
          <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
            Direct Bank Escrow Payouts Managed via Cashfree (0% Commission)
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: RIDER FLEET APP (🛵 DELIVERY PARTNER SIDE)           */}
        {/* ============================================================== */}
        <div
          className={`${
            activeTabDevice !== "all" && activeTabDevice !== "rider" ? "hidden lg:block" : ""
          } bg-white text-slate-900 rounded-[38px] border-4 border-slate-700 shadow-2xl p-4 min-h-[640px] flex flex-col justify-between overflow-hidden relative`}
        >
          {/* Phone Top Notch */}
          <div>
            <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              <div className="w-8 h-1 rounded-full bg-slate-800"></div>
            </div>

            {/* Rider Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  🛵
                </span>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-none">Trustit Rider Fleet</h3>
                  <span className="text-[10px] text-slate-500">Bahraich Hub · Active Shift</span>
                </div>
              </div>

              {/* Rider Audio Mute/Unmute Switch */}
              <button
                type="button"
                onClick={() => setIsRiderSoundMuted(!isRiderSoundMuted)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                  isRiderSoundMuted
                    ? "bg-slate-100 border-slate-300 text-slate-500"
                    : "bg-emerald-50 border-emerald-300 text-emerald-800"
                }`}
                title="Toggle Rider Sound Alerts (Radar & Ding-Dong)"
              >
                <span>{isRiderSoundMuted ? "🔇 Rider Muted" : "🔊 Sound ON"}</span>
              </button>
            </div>

            {/* STAGE: IDLE RADAR SCANNING */}
            {["1_customer_browse", "2_customer_checkout", "3_merchant_siren"].includes(stage) && (
              <div className="mt-8 text-center space-y-3 py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl mx-auto text-emerald-600 animate-pulse">
                  📡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">30s Proximity Radar Scanning...</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">
                    You are closest to {orderDetails.storeName} ({orderDetails.distanceToStore}). You will receive immediate alert when merchant accepts!
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 4: PARALLEL DISPATCH RADAR POPUP ALERT (LOUD RIDER BUZZER!) */}
            {stage === "4_parallel_prep_and_rider_dispatch" && (
              <div className="mt-3 bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-3xl p-3.5 space-y-3 shadow-lg animate-scaleUp">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white animate-pulse">
                    ⚡ NEW DELIVERY RUN PING! 🔊
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-800">₹{orderDetails.deliveryFee} Earning</span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900">{orderDetails.storeName}</h4>
                  <p className="text-[10px] text-slate-600">Pickup: {orderDetails.storeName} ({orderDetails.distanceToStore})</p>
                  <p className="text-[10px] text-slate-600">Drop: {orderDetails.address} ({orderDetails.distanceToDrop})</p>
                </div>

                <div className="bg-white rounded-xl p-2 border border-emerald-200 flex justify-between text-xs font-bold text-slate-900">
                  <span>Trip Pay:</span>
                  <span className="text-emerald-700">₹35 Base + ₹10 Surge = ₹{orderDetails.deliveryFee}</span>
                </div>

                <div className="text-[10px] text-emerald-800 bg-emerald-100/70 p-2 rounded-xl">
                  ⏱️ <strong>Food is currently being cooked!</strong> Head to store now so it's fresh when packed.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    riderAudio.stopSiren();
                    setStage("5_rider_arrived_waiting");
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🛵 ACCEPT RUN (₹{orderDetails.deliveryFee}) &amp; GO TO STORE</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* STAGE 5: RIDER ARRIVED AT OUTLET, WAITING OUTSIDE COUNTER */}
            {stage === "5_rider_arrived_waiting" && (
              <div className="mt-3 space-y-3">
                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-cyan-800">
                      📍 Arrived at Outlet
                    </span>
                    <span className="text-xs font-bold text-cyan-700">Waiting for Kitchen</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">{orderDetails.storeName}</h4>
                  <p className="text-[11px] text-slate-600">
                    Food is being packed inside. Stand near the counter. As soon as the merchant clicks ready, you will receive a push chime!
                  </p>
                </div>

                <div className="bg-slate-100 rounded-xl p-2.5 text-center text-xs text-slate-600">
                  ⏳ Kitchen Timer remaining: ~{Math.floor(prepSecondsLeft / 60)} mins
                </div>
              </div>
            )}

            {/* STAGE 6: 2nd PUSH NOTIFICATION POP-UP (ORDER READY — GO TO COUNTER!) */}
            {stage === "6_merchant_ready_counter_handover" && (
              <div className="mt-3 space-y-3">
                {/* Visual Pop-up Modal / Card */}
                <div className="bg-gradient-to-b from-purple-50 to-indigo-50 border-2 border-purple-500 rounded-3xl p-3.5 space-y-3 shadow-xl animate-scaleUp">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-700 text-white animate-pulse">
                      🛎️ 2nd PUSH: ORDER READY!
                    </span>
                    <span className="text-xs font-bold text-purple-900">Collect Now</span>
                  </div>

                  <div className="bg-white rounded-2xl p-3 border border-purple-200 space-y-1 text-center">
                    <span className="text-2xl">🛍️</span>
                    <h4 className="text-xs font-black text-slate-900">
                      "Go to Counter &amp; Pick Your Order!"
                    </h4>
                    <p className="text-[10px] text-slate-600">
                      Merchant has packed order #{orderDetails.displayCode}.
                    </p>
                    <div className="mt-2 bg-purple-100 text-purple-900 font-mono font-black text-sm py-1 px-3 rounded-xl inline-block">
                      Pickup Code: {orderDetails.pickupCode}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStage("7_rider_delivering");
                    }}
                    className="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>✓ PARCEL RECEIVED AT COUNTER → START DOORSTEP TRIP</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 7: ROUTE TO DOORSTEP & OTP VERIFICATION */}
            {stage === "7_rider_delivering" && (
              <div className="mt-3 space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Delivering to:</span>
                  <h4 className="text-xs font-black text-slate-900">{orderDetails.customerName}</h4>
                  <p className="text-[11px] text-slate-600">{orderDetails.address}</p>
                </div>

                {/* OTP Input Box */}
                <div className="bg-white border-2 border-indigo-200 rounded-2xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Customer Delivery OTP:</span>
                    <span className="text-[10px] font-mono text-slate-500">(Hint: 4921)</span>
                  </div>

                  <input
                    type="text"
                    maxLength={4}
                    value={deliveryOtpInput}
                    onChange={(e) => setDeliveryOtpInput(e.target.value)}
                    placeholder="Enter 4-digit code"
                    className="w-full text-center font-mono text-xl tracking-widest font-black py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-indigo-600 text-slate-900"
                  />

                  <button
                    type="button"
                    disabled={deliveryOtpInput !== "4921"}
                    onClick={() => {
                      riderAudio.playCashChime();
                      setStage("8_delivered_escrow_split");
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    VERIFY OTP &amp; COMPLETE DELIVERY →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 8: TRIP COMPLETE & EARNING CREDITED */}
            {stage === "8_delivered_escrow_split" && (
              <div className="mt-4 text-center space-y-3 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                  💸
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">+₹{orderDetails.deliveryFee} Credited Instantly!</h4>
                  <p className="text-xs text-slate-600">Settled directly into your UPI account.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-medium">
                  Trip Completed: {orderDetails.distanceToDrop} · 5★ Rating
                </div>
              </div>
            )}
          </div>

          {/* Rider Footer Info */}
          <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
            Zero Platform Commission on Rider Fee
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CASHFREE ESCROW SPLIT LEDGER (Stage 8 Finished State)         */}
      {/* ============================================================== */}
      {stage === "8_delivered_escrow_split" && (
        <div className="max-w-7xl mx-auto mt-8 bg-[#1C2541] border border-slate-700 rounded-3xl p-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-700 gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Cashfree Nodal Escrow Split Complete
              </span>
              <h2 className="text-lg font-black text-white mt-1">
                Real-Time Banking Ledger &amp; Platform Zero-Commission Verification
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              Cashfree UTR: CF-NODAL-20261103-{orderDetails.displayCode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Customer Paid</span>
              <div className="text-xl font-black font-mono text-blue-400 mt-1">₹{orderDetails.total}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">UPI / Cashfree Web Checkout</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/40">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">2. Merchant Net Payout</span>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">₹{orderDetails.subtotal}</div>
              <p className="text-[10px] text-emerald-300 mt-0.5">100% Net (0% Commission Guaranteed)</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">3. Rider Trip Payout</span>
              <div className="text-xl font-black font-mono text-amber-400 mt-1">₹{orderDetails.deliveryFee}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Instant UPI Settlement to Rider</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] text-purple-400 uppercase font-bold block">4. Trustit Platform Take</span>
              <div className="text-xl font-black font-mono text-purple-400 mt-1">₹0</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Pure Merchant Subscription Model</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
