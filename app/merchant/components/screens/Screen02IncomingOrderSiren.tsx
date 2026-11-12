"use client";

import React, { useState, useEffect } from "react";
import { TrustitNative } from "@/lib/native/trustit-native-service";

interface IncomingOrderItem {
  id?: string;
  name?: string;
  item_name?: string;
  product_name?: string;
  quantity?: number;
  qty?: number;
  unit_price?: number;
  total_price?: number;
  price?: number;
}

export interface IncomingOrderData {
  id: string;
  customer_name?: string | null;
  customer_address?: string | null;
  delivery_address?: string | null;
  payment_mode?: string | null;
  payment_status?: string | null;
  total_amount?: number | null;
  customer_notes?: string | null;
  notes?: string | null;
  hyperlocal_order_items?: IncomingOrderItem[];
  items?: IncomingOrderItem[];
}

interface Screen02Props {
  order?: IncomingOrderData | null;
  onAccept?: (prepMins: number) => void;
  onDecline?: () => void;
  onMute?: () => void;
  onBack?: () => void;
}

export default function Screen02IncomingOrderSiren({
  order,
  onAccept,
  onDecline,
  onMute,
  onBack,
}: Screen02Props) {
  const [selectedPrep, setSelectedPrep] = useState<number>(20);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const orderId = order?.id || null;

  useEffect(() => {
    setIsMuted(false);
  }, [orderId]);

  useEffect(() => {
    if (!orderId || isMuted) {
      TrustitNative.stopOrderSiren();
      return () => {
        TrustitNative.stopOrderSiren();
      };
    }

    TrustitNative.playOrderSiren();
    const maxPlaybackTimer = setTimeout(() => {
      TrustitNative.stopOrderSiren();
      setIsMuted(true);
    }, 20000);

    return () => {
      clearTimeout(maxPlaybackTimer);
      TrustitNative.stopOrderSiren();
    };
  }, [orderId, isMuted]);

  if (!order) {
    return (
      <div className="w-full h-full bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl mb-3">
          🔕
        </div>
        <h2 className="text-sm font-black text-slate-900">No new incoming orders right now</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
          New customer orders requiring store acceptance will appear here automatically.
        </p>
        <button
          type="button"
          onClick={() => {
            TrustitNative.stopOrderSiren();
            onBack?.();
          }}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
        >
          Close
        </button>
      </div>
    );
  }

  const orderItems: IncomingOrderItem[] =
    Array.isArray(order.hyperlocal_order_items) && order.hyperlocal_order_items.length > 0
      ? order.hyperlocal_order_items
      : Array.isArray(order.items)
        ? order.items
        : [];
  const totalItemUnits = orderItems.reduce(
    (sum, item) => sum + Number(item.quantity ?? item.qty ?? 1),
    0
  );
  const totalAmount = Number(order.total_amount ?? 0);
  const paymentBadge =
    order.payment_mode === "cod"
      ? "💵 Cash on Delivery"
      : order.payment_status === "paid"
        ? "✅ Paid Online"
        : "💳 Online Payment";
  const customerNotes = order.customer_notes || order.notes || "";

  return (
    <div className="w-full h-full bg-gradient-to-b from-rose-50 via-red-50/60 to-amber-50/40 text-slate-900 flex flex-col justify-between p-3.5 sm:p-4 font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative">
      {/* High Attention Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping"></span>
            <span className="text-xs font-black tracking-wider uppercase text-rose-800">
              URGENT INCOMING ORDER
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted) {
                TrustitNative.stopOrderSiren();
                onMute?.();
              }
            }}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs transition"
          >
            {isMuted ? "🔇 Muted" : "🔊 Mute Siren"}
          </button>
        </div>

        {/* Attentive High-Contrast Alert Card */}
        <div className="mt-2.5 bg-white border-2 border-rose-500 rounded-3xl p-3.5 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
            🔔 Live Order
          </div>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center text-2xl shadow-xs animate-bounce">
            🔔
          </div>
          <h1 className="text-base font-black mt-2 text-slate-950">New Confirmed Order!</h1>
          <p className="text-xs text-rose-700 font-mono font-bold mt-0.5 truncate px-2">
            Order #{order.id}
          </p>

          <div className="mt-2.5 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-bold">
            <span>{paymentBadge}</span>
            <span>•</span>
            <span className="font-extrabold text-slate-950 text-xs">
              ₹{Number.isFinite(totalAmount) ? totalAmount.toFixed(2) : "0.00"}
            </span>
          </div>
        </div>

        {/* Customer & Items Brief */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 gap-2">
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 truncate">
                {order.customer_name || "Customer"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {order.customer_address || order.delivery_address || "Delivery address confirmed"}
              </p>
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-bold border border-rose-200 shrink-0">
              {totalItemUnits || orderItems.length} {(totalItemUnits || orderItems.length) === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* Item details */}
          <div className="space-y-1.5 text-xs">
            {orderItems.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Order item summary syncing...</p>
            ) : (
              orderItems.map((item, idx) => {
                const qty = Number(item.quantity ?? item.qty ?? 1);
                const itemName = item.item_name || item.product_name || item.name || `Item #${idx + 1}`;
                const lineAmount =
                  item.total_price != null
                    ? Number(item.total_price)
                    : Number(item.unit_price ?? item.price ?? 0) * qty;
                return (
                  <div key={item.id || `${itemName}-${idx}`} className="flex justify-between items-center text-slate-800 gap-2">
                    <span className="font-bold truncate">
                      {qty} × {itemName}
                    </span>
                    <span className="font-mono text-slate-700 shrink-0">
                      ₹{Number.isFinite(lineAmount) ? lineAmount.toFixed(0) : "0"}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {customerNotes && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-2 text-[10px] text-amber-900 flex items-center gap-1.5 font-medium">
              <span>📝</span>
              <span>{customerNotes}</span>
            </div>
          )}
        </div>

        {/* Kitchen Preparation Time Selector */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <label className="text-[11px] font-bold text-slate-700 block mb-1.5 text-center">
            Select Kitchen Prep Duration:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 25, 40].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setSelectedPrep(mins)}
                className={`py-1.5 rounded-xl text-xs font-black transition border ${
                  selectedPrep === mins
                    ? "bg-rose-600 text-white border-rose-700 shadow-md scale-102"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                +{mins} Mins
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision CTAs */}
      <div className="pt-2 space-y-1.5">
        <button
          type="button"
          onClick={() => {
            TrustitNative.stopOrderSiren();
            onAccept?.(selectedPrep);
          }}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition"
        >
          <span>✓ ACCEPT ORDER (+{selectedPrep} MINS)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              TrustitNative.stopOrderSiren();
              onDecline?.();
            }}
            className="py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold transition"
          >
            Decline Order ✕
          </button>
          <button
            type="button"
            onClick={() => {
              TrustitNative.stopOrderSiren();
              onBack?.();
            }}
            className="py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition"
          >
            Close Siren
          </button>
        </div>
      </div>
    </div>
  );
}
