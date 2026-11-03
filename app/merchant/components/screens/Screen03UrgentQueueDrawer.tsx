"use client";

import React, { useState } from "react";

interface Screen03Props {
  onAcceptOrder?: (orderId: string) => void;
  onOpenSiren?: () => void;
  onBack?: () => void;
}

export default function Screen03UrgentQueueDrawer({
  onAcceptOrder,
  onOpenSiren,
  onBack,
}: Screen03Props) {
  const [orders, setOrders] = useState([
    {
      id: "ORD-7783-09",
      customer: "Aman Sharma",
      address: "Civil Lines Near Stadium",
      items: "2x Hazelnut Frappe, 1x Paneer Sandwich",
      amount: "₹340",
      payment: "Online Paid",
      timeLeft: "01:42",
    },
    {
      id: "ORD-7783-10",
      customer: "Dr. Priya Verma",
      address: "District Hospital Colony",
      items: "1x Cappuccino, 1x Veg Grilled Burger",
      amount: "₹220",
      payment: "Cash on Delivery",
      timeLeft: "02:15",
    },
  ]);

  return (
    <div className="w-full h-full bg-gradient-to-b from-rose-50/80 via-white to-amber-50/50 text-slate-900 flex flex-col justify-between p-3.5 sm:p-4 font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-xs font-black uppercase text-rose-800 tracking-wider">
              Incoming Queue Drawer
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-300 font-semibold"
          >
            ✕ Minimize
          </button>
        </div>

        {/* Attention Callout */}
        <div className="mt-2.5 bg-rose-100/70 border border-rose-300 rounded-2xl p-3 flex items-start gap-2.5">
          <span className="text-lg">⏱️</span>
          <div>
            <h3 className="text-xs font-black text-rose-950">
              Orders Requiring Instant Acceptance
            </h3>
            <p className="text-[10px] text-rose-800 leading-relaxed mt-0.5">
              Unaccepted orders auto-cancel after 3 minutes to maintain customer trust score.
            </p>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="mt-3 space-y-2.5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border-2 border-rose-200 rounded-2xl p-3 shadow-xs space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-900 font-mono">
                  {order.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold animate-pulse">
                  ⏳ {order.timeLeft} left
                </span>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{order.customer}</span>
                  <span className="font-black text-emerald-700 text-sm">{order.amount}</span>
                </div>
                <p className="text-[10px] text-slate-500">{order.address}</p>
                <p className="text-[11px] text-slate-700 font-medium bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  {order.items}
                </p>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAcceptOrder?.(order.id)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition"
                >
                  ✓ Accept (20 min)
                </button>
                <button
                  type="button"
                  onClick={onOpenSiren}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-500">
          Trustit Realtime Dispatch Service • Active Listening WebSocket
        </p>
      </div>
    </div>
  );
}
