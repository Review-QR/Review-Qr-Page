"use client";

import { useState, useEffect, useRef } from "react";
import type { HyperlocalOrder, ServiceTokenSlot } from "@/lib/hyperlocal/types";
import { formatDisplayOrderNumber } from "@/lib/hyperlocal/order-id";

interface Props {
  business: {
    id: string;
    name: string;
    city?: string | null;
    businessType?: string | null;
  };
}

export default function UniversalOrdersConsoleClient({ business }: Props) {
  const [orders, setOrders] = useState<HyperlocalOrder[]>([]);
  const [tokens, setTokens] = useState<ServiceTokenSlot[]>([]);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Siren alert & KOT state
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [kotOrderModal, setKotOrderModal] = useState<HyperlocalOrder | null>(null);
  const [incomingOrderModal, setIncomingOrderModal] = useState<HyperlocalOrder | null>(null);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Filter confirmed orders ONLY:
  // Paid Online (payment_status === "paid") OR Cash on Delivery (payment_mode === "cod")
  // Unpaid online orders must NEVER appear on the merchant's screen until Cashfree confirms!
  const confirmedOrders = orders.filter(
    (o) => o.payment_status === "paid" || o.payment_mode === "cod"
  );

  // Walk-in token state (Salon / Car Wash)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceType, setServiceType] = useState<"salon_haircut" | "salon_facial" | "car_foam_wash" | "bike_wash" | "car_interior">("salon_haircut");

  const businessType = (business.businessType || "").toLowerCase();
  const isSalon = businessType.includes("salon") || businessType.includes("barber") || businessType.includes("beauty");
  const isCarWash = businessType.includes("wash") || businessType.includes("auto") || businessType.includes("mechanic") || businessType.includes("garage");

  // Web Audio Continuous High-Ringing Siren for incoming confirmed orders (Swiggy / Zomato Kitchen Standard)
  const audioCtxRef = useRef<AudioContext | null>(null);

  function playHighRingAlert() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      // Loud alternating high-frequency alarm: A5 (880Hz) -> E6 (1320Hz) -> A6 (1760Hz)
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.36);
      osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.48);

      gain.gain.setValueAtTime(0.42, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.7);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([300, 150, 300, 150, 300]);
      }
    } catch {
      // Audio autoplay handled safely
    }
  }

  // Timer loop for 180s countdown ticks
  useEffect(() => {
    function primeAudio() {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
      } catch {}
    }
    window.addEventListener("click", primeAudio, { once: true });
    window.addEventListener("touchstart", primeAudio, { once: true });

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => {
      window.removeEventListener("click", primeAudio);
      window.removeEventListener("touchstart", primeAudio);
      clearInterval(timer);
    };
  }, []);

  // Auto-open Pop-Up Notification Modal whenever a confirmed unaccepted order is present
  useEffect(() => {
    if (isSalon || isCarWash) return;
    const unaccepted = confirmedOrders.find(
      (o) => o.status === "placed" && !dismissedOrderIds.includes(o.id)
    );
    if (unaccepted) {
      setIncomingOrderModal(unaccepted);
    } else if (incomingOrderModal && !confirmedOrders.some((o) => o.id === incomingOrderModal.id && o.status === "placed")) {
      setIncomingOrderModal(null);
    }
  }, [confirmedOrders, dismissedOrderIds, isSalon, isCarWash]);

  // Continuous High-Ringing Siren loop when placed unaccepted confirmed orders exist
  useEffect(() => {
    if (isSalon || isCarWash || isSirenMuted) return;
    const hasUnaccepted = confirmedOrders.some(
      (o) => o.status === "placed" && (o.payment_mode === "cod" || o.payment_status === "paid"),
    );
    if (!hasUnaccepted) return;

    // Immediately play once, then repeat every 1.8 seconds with high volume
    playHighRingAlert();
    const sirenInterval = setInterval(() => {
      playHighRingAlert();
    }, 1800);

    return () => clearInterval(sirenInterval);
  }, [confirmedOrders, isSirenMuted, isSalon, isCarWash]);

  async function refreshData() {
    try {
      if (isSalon || isCarWash) {
        const res = await fetch(`/api/hyperlocal/tokens?businessId=${encodeURIComponent(business.id)}`);
        const data = await res.json();
        if (data.tokens) setTokens(data.tokens);
      } else {
        const res = await fetch(`/api/hyperlocal/orders?businessId=${encodeURIComponent(business.id)}`);
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders as HyperlocalOrder[]);
        }
      }
    } catch {
      // Network polling handled safely
    }
  }

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [business.id]);

  async function handleAcceptOrder(orderId: string) {
    setIsSubmitting(true);
    try {
      await fetch(`/api/hyperlocal/orders`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "accept", orderId, prepTimeMinutes }),
      }).catch(() => {});

      setActionSuccess(`Order accepted! Kitchen prep timer set to ${prepTimeMinutes} mins.`);
      refreshData();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMarkFoodReady(orderId: string) {
    setIsSubmitting(true);
    try {
      await fetch(`/api/hyperlocal/orders`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "ready", orderId }),
      }).catch(() => {});

      setActionSuccess("Order marked Ready for Pickup! Nearest Rider alerted.");
      refreshData();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBookWalkinToken() {
    if (!customerName.trim() || !customerPhone.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/hyperlocal/tokens`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          serviceType,
          customerName,
          customerPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomerName("");
        setCustomerPhone("");
        setActionSuccess(`Token #${data.tokenNumber} issued successfully!`);
        refreshData();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Universal Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 mb-1">
            <span>🔴 LIVE</span>
            <span>
              {isSalon ? "Salon Token & Chair Manager" : isCarWash ? "Wash Bay & Slot Queue" : "Restaurant Order Dispatch"}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900">{business.name}</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isSalon
              ? "Live waiting list and digital token appointments."
              : isCarWash
                ? "Manage washing slots and vehicle readiness."
                : "Continuous loud sound alert when customers place food/sweet orders."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition"
          >
            ↻ Refresh Queue
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Sticky Siren Alert Banner when unaccepted confirmed food orders exist */}
      {!isSalon && !isCarWash && confirmedOrders.some((o) => o.status === "placed") && (
        <div className="sticky top-4 z-30 p-3.5 bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚨</span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">
                {confirmedOrders.filter((o) => o.status === "placed").length} New Confirmed Order Received!
              </span>
              <p className="text-[10px] text-amber-100 font-medium">
                Continuous Kitchen Siren Active. Accept within 3 minutes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {incomingOrderModal === null && confirmedOrders.some((o) => o.status === "placed") && (
              <button
                type="button"
                onClick={() => {
                  const unaccepted = confirmedOrders.find((o) => o.status === "placed");
                  if (unaccepted) setIncomingOrderModal(unaccepted);
                }}
                className="px-2.5 py-1.5 bg-white text-rose-700 rounded-xl text-xs font-black shadow-xs hover:bg-amber-50 transition"
              >
                Open Order Pop-up 🔔
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSirenMuted(!isSirenMuted)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <span>{isSirenMuted ? "🔔 Unmute Siren" : "🔕 Mute Buzzer"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ADAPTIVE VIEW 1: RESTAURANT & FOOD MODE */}
      {!isSalon && !isCarWash && (
        <div className="space-y-4">
          {confirmedOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <span className="text-4xl block">🔔</span>
              <h3 className="text-sm font-bold text-slate-900">Waiting for Confirmed Orders...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Keep this tab open. When Cashfree webhook confirms payment (or a COD order is placed), a high-ringing kitchen siren &amp; pop-up notification modal will sound automatically.
              </p>
            </div>
          ) : (
            confirmedOrders.map((order) => {
              const isNewPlaced = order.status === "placed";
              const isAccepted = order.status === "accepted_by_merchant" || order.status === "preparing";

              // 180s countdown timer calculation
              const elapsedSec = Math.floor((currentTime - new Date(order.created_at).getTime()) / 1000);
              const remainingSec = Math.max(0, 180 - elapsedSec);
              const timerMins = Math.floor(remainingSec / 60);
              const timerSecs = remainingSec % 60;

              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isNewPlaced
                      ? "bg-amber-50/60 border-amber-300 shadow-lg ring-2 ring-amber-400"
                      : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-950 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-300">
                        {formatDisplayOrderNumber(order.id)}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isNewPlaced ? "bg-amber-500 text-white animate-pulse" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Customer Bill</span>
                      <span className="text-base font-extrabold text-slate-900">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* 180s Auto-Reject Countdown Bar */}
                  {isNewPlaced && (
                    <div className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⏳</span>
                        <span className="font-bold text-amber-950">
                          Auto-rejects in {timerMins}:{String(timerSecs).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="w-28 bg-amber-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            remainingSec < 45 ? "bg-rose-500" : remainingSec < 90 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${(remainingSec / 180) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="py-2.5 text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      Customer: {order.customer_name} ({order.customer_phone})
                    </p>
                    <p className="text-slate-500">
                      Delivery Address: {order.customer_address?.street}, {order.customer_address?.city}
                    </p>
                    <div className="pt-0.5">
                      {order.payment_status === "paid" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          ✅ Payment Confirmed via Cashfree Webhook
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                          💵 Cash on Delivery
                        </span>
                      )}
                    </div>
                    {order.customer_notes && (
                      <p className="text-amber-800 bg-amber-50 p-1.5 rounded-lg font-medium border border-amber-200">
                        📝 Customer Note: {order.customer_notes}
                      </p>
                    )}
                  </div>

                  {/* Order Items with Variants & Cooking Notes */}
                  <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Ordered</span>
                    {order.hyperlocal_order_items?.map((item, idx) => (
                      <div key={idx} className="border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{item.quantity}x {item.item_name}</span>
                          <span className="text-slate-600">₹{item.total_price}</span>
                        </div>
                        {item.notes && (
                          <p className="text-[10px] text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded mt-0.5 font-bold inline-block">
                            ⚠️ {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Assigned Rider Info (if assigned) */}
                  {order.delivery_riders && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-2xl text-xs flex items-center justify-between border border-purple-200">
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 uppercase block">Assigned Rider</span>
                        <p className="font-bold text-slate-800">
                          {order.delivery_riders.full_name} ({order.delivery_riders.vehicle_number})
                        </p>
                      </div>
                      <a href={`tel:${order.delivery_riders.phone}`} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition shadow-2xs">
                        📞 Call Rider
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setKotOrderModal(order)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        📄 Print / View KOT Slip
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isNewPlaced && (
                        <>
                          <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <span className="text-slate-600 font-semibold text-[11px]">
                              {order.order_type === "grocery_parcha" ? "📦 Packing Time:" : "🍳 Kitchen Cooking:"}
                            </span>
                            {(order.order_type === "grocery_parcha" ? [20, 30, 40, 60] : [15, 20, 25, 35]).map((mins) => (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => setPrepTimeMinutes(mins)}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                                  prepTimeMinutes === mins
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                                }`}
                              >
                                {mins}m
                              </button>
                            ))}
                            <div className="flex items-center gap-0.5 ml-1">
                              <input
                                type="number"
                                min={5}
                                max={120}
                                value={prepTimeMinutes}
                                onChange={(e) => setPrepTimeMinutes(Math.max(5, Math.min(120, Number(e.target.value) || 20)))}
                                className="w-12 px-1.5 py-0.5 text-xs text-center font-bold bg-white border border-slate-300 rounded-md outline-none focus:border-slate-800"
                              />
                              <span className="text-[10px] text-slate-400 font-mono">min</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleAcceptOrder(order.id)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                          >
                            <span>✓</span>
                            <span>
                              {order.order_type === "grocery_parcha"
                                ? `Accept & Start Packing (~${prepTimeMinutes}m) →`
                                : `Accept & Dispatch Rider (~${prepTimeMinutes}m) →`}
                            </span>
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleMarkFoodReady(order.id)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
                        >
                          📦 Mark Food Prepared & Ready (Summon Rider) →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── High-Ringing Incoming Confirmed Order Pop-up Modal (Swiggy / Zomato KOT Live Alert) ── */}
      {incomingOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border-2 border-rose-500 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header: High Ringing Siren Alert Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-2xl animate-bounce">
                    🚨
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-200 block">
                      Kitchen Alert · Incoming Confirmed Order
                    </span>
                    <h3 className="text-base sm:text-lg font-black leading-tight">
                      New Order {formatDisplayOrderNumber(incomingOrderModal.id)} Received!
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSirenMuted(!isSirenMuted)}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>{isSirenMuted ? "🔔 Unmute" : "🔕 Mute Buzzer"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDismissedOrderIds((prev) => [...prev, incomingOrderModal.id]);
                      setIncomingOrderModal(null);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Siren Visual Audio Wave & Countdown */}
              <div className="mt-3 flex items-center justify-between bg-black/20 rounded-xl p-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-100 font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span>{isSirenMuted ? "Siren Muted" : "🔊 High Buzzer Ringing... Order Waiting"}</span>
                </div>
                <div className="font-mono font-bold text-amber-200">
                  Auto-reject: {Math.max(0, Math.floor((180 - Math.floor((currentTime - new Date(incomingOrderModal.created_at).getTime()) / 1000)) / 60))}:
                  {String(Math.max(0, (180 - Math.floor((currentTime - new Date(incomingOrderModal.created_at).getTime()) / 1000)) % 60)).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
              {/* Payment Confirmation Status */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                incomingOrderModal.payment_status === "paid"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-amber-50 border-amber-300 text-amber-950"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {incomingOrderModal.payment_status === "paid" ? "✅" : "💵"}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      {incomingOrderModal.payment_status === "paid"
                        ? "Payment Confirmed via Cashfree Webhook"
                        : "Cash on Delivery Order"}
                    </span>
                    <span className="text-xs font-black">
                      {incomingOrderModal.payment_status === "paid"
                        ? "Online Payment Settled · Safe to Cook"
                        : "Collect Cash at Delivery Doorstep"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase">Order Value</span>
                  <span className="text-base font-black text-slate-900">
                    ₹{incomingOrderModal.total_amount}
                  </span>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">
                    👤 {incomingOrderModal.customer_name}
                  </span>
                  <a
                    href={`tel:${incomingOrderModal.customer_phone}`}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-[11px] hover:bg-blue-200 transition"
                  >
                    📞 {incomingOrderModal.customer_phone}
                  </a>
                </div>
                <p className="text-slate-600">
                  📍 <strong>Delivery Address:</strong> {incomingOrderModal.customer_address?.street}, {incomingOrderModal.customer_address?.city}
                </p>
                {incomingOrderModal.customer_notes && (
                  <p className="text-amber-900 bg-amber-100/70 p-1.5 rounded-lg font-bold border border-amber-200 mt-1">
                    📝 Special Instruction: {incomingOrderModal.customer_notes}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Items to Prepare ({incomingOrderModal.hyperlocal_order_items?.length || 0})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50 p-2.5">
                  {incomingOrderModal.hyperlocal_order_items?.map((item, idx) => (
                    <div key={idx} className="py-1.5 first:pt-0 last:pb-0">
                      <div className="flex justify-between font-bold text-slate-900 text-xs">
                        <span>{item.quantity}x {item.item_name}</span>
                        <span className="font-mono">₹{item.total_price}</span>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-amber-900 font-semibold bg-amber-100/60 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          ⚠️ {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation / Packing Time Selector */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {incomingOrderModal.order_type === "grocery_parcha" ? "📦 Estimated Packing Time:" : "🍳 Kitchen Cooking Time:"}
                  </span>
                  <span className="text-xs font-black text-indigo-700 font-mono">
                    ~{prepTimeMinutes} mins
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(incomingOrderModal.order_type === "grocery_parcha" ? [20, 30, 40, 60] : [15, 20, 25, 35]).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setPrepTimeMinutes(mins)}
                      className={`flex-1 min-w-[50px] py-1.5 rounded-lg text-xs font-bold transition ${
                        prepTimeMinutes === mins
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={prepTimeMinutes}
                      onChange={(e) => setPrepTimeMinutes(Math.max(5, Math.min(120, Number(e.target.value) || 20)))}
                      className="w-10 text-xs text-center font-bold outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  const targetId = incomingOrderModal.id;
                  setIncomingOrderModal(null);
                  await handleAcceptOrder(targetId);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>
                  {incomingOrderModal.order_type === "grocery_parcha"
                    ? `Accept & Start Packing (~${prepTimeMinutes}m) →`
                    : `Accept Order & Dispatch Rider (~${prepTimeMinutes}m) →`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDismissedOrderIds((prev) => [...prev, incomingOrderModal.id]);
                  setIncomingOrderModal(null);
                }}
                className="py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
              >
                View in Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kitchen Order Ticket (KOT) Thermal Slip Modal ── */}
      {kotOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs sm:max-w-sm rounded-2xl bg-white p-4 sm:p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="text-center border-b-2 border-dashed border-slate-300 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">{business.name}</h3>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">KITCHEN ORDER TICKET (KOT)</p>
              <div className="mt-1.5 flex justify-between text-[9px] text-slate-600">
                <span className="font-bold text-slate-900 text-xs">Order: {formatDisplayOrderNumber(kotOrderModal.id)}</span>
                <span>{new Date(kotOrderModal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Items with Variants & Notes */}
            <div className="space-y-2 border-b-2 border-dashed border-slate-300 pb-2.5">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                <span>Qty · Item</span>
                <span>Price</span>
              </div>
              {kotOrderModal.hyperlocal_order_items?.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                    <span>{item.quantity}x {item.item_name}</span>
                    <span>₹{item.total_price}</span>
                  </div>
                  {item.notes && (
                    <div className="bg-amber-100 text-amber-950 text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ⚠️ {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Customer Special Notes */}
            {kotOrderModal.customer_notes && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-[9px] text-amber-900">
                <span className="font-bold block uppercase">Customer Note:</span>
                <p>{kotOrderModal.customer_notes}</p>
              </div>
            )}

            {/* Bill Summary */}
            <div className="flex justify-between items-center text-[11px] font-bold pt-0.5">
              <span>Customer: {kotOrderModal.customer_name}</span>
              <span className="text-slate-900">Total: ₹{kotOrderModal.total_amount}</span>
            </div>

            <div className="pt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                🖨️ Print KOT Slip
              </button>
              <button
                type="button"
                onClick={() => setKotOrderModal(null)}
                className="py-2 px-3.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADAPTIVE VIEW 2: SALON / CAR WASH TOKEN & QUEUE MANAGER */}
      {(isSalon || isCarWash) && (
        <div className="space-y-6">
          {/* Live Queue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Currently Serving</span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 block mt-0.5">
                {tokens.find((t) => t.status === "in_progress")?.token_number ? `Token #${tokens.find((t) => t.status === "in_progress")?.token_number}` : "All Free"}
              </span>
              <span className="text-[11px] text-slate-500">
                {tokens.find((t) => t.status === "in_progress")?.customer_name || "Seat / Bay available"}
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customers Waiting</span>
              <span className="text-lg sm:text-xl font-black text-indigo-600 block mt-0.5">
                {tokens.filter((t) => t.status === "waiting").length} In Queue
              </span>
              <span className="text-[11px] text-slate-500">Avg wait: ~15 mins</span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today Completed</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
                {tokens.filter((t) => t.status === "completed").length} Done
              </span>
              <span className="text-[11px] text-slate-500">Services delivered today</span>
            </div>
          </div>

          {/* Quick Issue Walk-in Token Box */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Issue Walk-in Token / Advance Slot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as typeof serviceType)}
                className="p-2.5 rounded-xl border border-slate-200 font-medium"
              >
                {isSalon ? (
                  <>
                    <option value="salon_haircut">Haircut & Styling</option>
                    <option value="salon_facial">Facial / Grooming</option>
                  </>
                ) : (
                  <>
                    <option value="car_foam_wash">Car Foam Wash & Dry</option>
                    <option value="bike_wash">Bike Pressure Wash</option>
                    <option value="car_interior">Car Interior Vacuum</option>
                  </>
                )}
              </select>
              <button
                type="button"
                disabled={isSubmitting || !customerName.trim()}
                onClick={handleBookWalkinToken}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition"
              >
                Issue Next Token
              </button>
            </div>
          </div>

          {/* Token List Queue */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Token Queue Today</h3>
              <span className="text-xs text-slate-400">{tokens.length} total tokens</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {tokens.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No tokens issued today yet.</div>
              ) : (
                tokens.map((token) => (
                  <div key={token.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center">
                        #{token.token_number}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{token.customer_name}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Phone: {token.customer_phone} · Service: {token.service_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        token.status === "in_progress"
                          ? "bg-emerald-100 text-emerald-800"
                          : token.status === "waiting"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {token.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
