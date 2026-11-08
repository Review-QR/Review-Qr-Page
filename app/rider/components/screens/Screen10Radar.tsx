"use client";

import React, { useState, useEffect } from "react";

export interface HyperlocalRadarOrder {
  id: string;
  businesses?: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
  } | null;
  customer_name?: string;
  customer_address?: any;
  total_amount?: number;
  delivery_fee?: number;
  payment_mode?: string;
  hyperlocal_order_items?: any[];
}

interface Screen10Props {
  onAccept?: () => void;
  onDecline?: () => void;
  order?: HyperlocalRadarOrder | null;
}

export default function Screen10Radar({ onAccept, onDecline, order }: Screen10Props) {
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onDecline?.();
      return;
    }
    const timer = setInterval(() => setSecondsRemaining((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, onDecline]);

  const merchantName = order?.businesses?.name || "Verified Merchant Partner";
  const merchantAddress = order?.businesses?.address || "Bahraich Commercial Center";
  const orderTag = order?.id ? `#${order.id.slice(-6).toUpperCase()}` : "#TR-LIVE";

  let dropAddress = "Customer Destination, Bahraich";
  if (order?.customer_address) {
    if (typeof order.customer_address === "string") {
      dropAddress = order.customer_address;
    } else if (typeof order.customer_address === "object") {
      dropAddress =
        order.customer_address.address_line ||
        order.customer_address.formatted_address ||
        order.customer_address.area ||
        "Bahraich City Delivery Address";
    }
  }

  const payout = Number(order?.delivery_fee || 40);
  const totalAmount = Number(order?.total_amount || 0);
  const isCod = order?.payment_mode?.toLowerCase() === "cod";
  const itemsCount = order?.hyperlocal_order_items?.length || 1;

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans overflow-y-auto">
      <div>
        {/* Top Siren Warning Header */}
        <div className="bg-amber-500 text-slate-950 px-3.5 py-2.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-bounce">🚨</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block">30s PROXIMITY RADAR</span>
              <strong className="text-xs font-black block">Incoming Order Assigned!</strong>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-black font-mono text-sm border-2 border-amber-300 animate-pulse">
            {secondsRemaining}s
          </div>
        </div>

        {/* Order Card Container */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          {/* Merchant Info */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Store / Restaurant</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">{merchantName}</h3>
              <p className="text-[11px] text-slate-500">{merchantAddress}</p>
            </div>
            <span className="px-2 py-1 rounded-lg bg-blue-50 text-[#0D47A1] font-mono font-bold text-xs">
              {orderTag}
            </span>
          </div>

          {/* Delivery Destination */}
          <div className="flex items-start gap-2.5">
            <span className="text-blue-700 text-sm mt-0.5">📍</span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drop Location</span>
              <strong className="text-xs font-bold text-slate-900 block">{dropAddress}</strong>
              <span className="text-[10px] text-slate-500">Fast Hyperlocal Dispatch corridor</span>
            </div>
          </div>

          {/* Earnings & COD Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Trip Payout</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-emerald-700">₹{payout.toFixed(2)}</span>
                <span className="text-[9px] font-bold text-emerald-600 font-mono">Guaranteed</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                {isCod ? "Collect Cash (COD)" : "Payment Mode"}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-amber-900">
                  {isCod ? `₹${totalAmount.toFixed(2)}` : "Prepaid Online"}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {isCod ? `${itemsCount} item(s)` : "Paid"}
                </span>
              </div>
            </div>
          </div>

          {/* Dispatch Audio Alert Status */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span>🔊</span> Loud Dispatch Alert Active
            </span>
            <span className="text-[10px] font-bold text-slate-400">Vibrating</span>
          </div>
        </div>
      </div>

      {/* Action Footer: Decline vs Accept Button */}
      <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onDecline}
          className="col-span-1 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
        >
          ✕ Pass
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="col-span-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>Accept Order Now</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
