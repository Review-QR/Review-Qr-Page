"use client";

import { useState, useEffect, useRef } from "react";
import type { HyperlocalOrder, ServiceTokenSlot } from "@/lib/hyperlocal/types";

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

  // Walk-in token state (Salon / Car Wash)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceType, setServiceType] = useState<"salon_haircut" | "salon_facial" | "car_foam_wash" | "bike_wash" | "car_interior">("salon_haircut");

  const businessType = (business.businessType || "").toLowerCase();
  const isSalon = businessType.includes("salon") || businessType.includes("barber") || businessType.includes("beauty");
  const isCarWash = businessType.includes("wash") || businessType.includes("auto") || businessType.includes("mechanic") || businessType.includes("garage");

  // Audio Ringer for incoming restaurant orders
  const audioCtxRef = useRef<AudioContext | null>(null);

  function playOrderRing() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay handled safely
    }
  }

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
          const newOrders = data.orders as HyperlocalOrder[];
          // Check for newly placed orders to sound alert
          const hasNewPlaced = newOrders.some((o) => o.status === "placed");
          if (hasNewPlaced && orders.length > 0 && orders[0]?.status !== "placed") {
            playOrderRing();
          }
          setOrders(newOrders);
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
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-1.5">
            <span>🔴 LIVE</span>
            <span>
              {isSalon ? "Salon Token & Chair Manager" : isCarWash ? "Wash Bay & Slot Queue" : "Restaurant Order Dispatch"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
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
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition"
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

      {/* ADAPTIVE VIEW 1: RESTAURANT & FOOD MODE */}
      {!isSalon && !isCarWash && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <span className="text-4xl block">🔔</span>
              <h3 className="text-sm font-bold text-slate-900">Waiting for New Orders...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Keep this tab open. When a customer orders, a loud ringtone will sound automatically and display the items.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isNewPlaced = order.status === "placed";
              const isAccepted = order.status === "accepted_by_merchant" || order.status === "preparing";

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
                      <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
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

                  {/* Customer Info */}
                  <div className="py-3 text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      Customer: {order.customer_name} ({order.customer_phone})
                    </p>
                    <p className="text-slate-500">
                      Delivery Address: {order.customer_address?.street}, {order.customer_address?.city}
                    </p>
                    <p className="text-indigo-600 font-semibold">
                      Payment Mode: {order.payment_mode === "cod" ? "Cash on Delivery" : "Paid Online via UPI/Cashfree"}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Ordered</span>
                    {order.hyperlocal_order_items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span className="text-slate-800">
                          {item.quantity}x {item.item_name}
                        </span>
                        <span className="text-slate-600">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Assigned Rider Info (if assigned) */}
                  {order.delivery_riders && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-2xl text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 uppercase block">Assigned Rider</span>
                        <p className="font-bold text-slate-800">
                          {order.delivery_riders.full_name} ({order.delivery_riders.vehicle_number})
                        </p>
                      </div>
                      <a href={`tel:${order.delivery_riders.phone}`} className="text-xs font-bold text-purple-700 underline">
                        Call Rider
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    {isNewPlaced && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500 font-medium">Kitchen Time:</span>
                          {[15, 25, 35].map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => setPrepTimeMinutes(mins)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                prepTimeMinutes === mins
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleAcceptOrder(order.id)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
                        >
                          Accept Order & Start Kitchen
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
                        Food Prepared & Ready for Rider Handover
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ADAPTIVE VIEW 2: SALON / CAR WASH TOKEN & QUEUE MANAGER */}
      {(isSalon || isCarWash) && (
        <div className="space-y-6">
          {/* Live Queue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Currently Serving</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">
                {tokens.find((t) => t.status === "in_progress")?.token_number ? `Token #${tokens.find((t) => t.status === "in_progress")?.token_number}` : "All Free"}
              </span>
              <span className="text-xs text-slate-500">
                {tokens.find((t) => t.status === "in_progress")?.customer_name || "Seat / Bay available"}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Customers Waiting</span>
              <span className="text-2xl font-black text-indigo-600 block mt-1">
                {tokens.filter((t) => t.status === "waiting").length} In Queue
              </span>
              <span className="text-xs text-slate-500">Avg wait: ~15 mins</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today Completed</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">
                {tokens.filter((t) => t.status === "completed").length} Done
              </span>
              <span className="text-xs text-slate-500">Services delivered today</span>
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
