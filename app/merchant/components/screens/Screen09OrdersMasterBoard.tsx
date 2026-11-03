"use client";

import React, { useState } from "react";

interface Screen09Props {
  onInspectOrder?: (orderId: string) => void;
  onPrintKot?: (orderId: string) => void;
  onDispatchRider?: (orderId: string) => void;
  onBack?: () => void;
}

export default function Screen09OrdersMasterBoard({
  onInspectOrder,
  onPrintKot,
  onDispatchRider,
  onBack,
}: Screen09Props) {
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "month" | "all">("today");
  const [statusTab, setStatusTab] = useState<"all" | "placed" | "prep" | "ready" | "delivered">("placed");

  const orders = [
    {
      id: "ORD-7783-09",
      customer: "Aman Sharma",
      status: "placed",
      amount: "₹340",
      itemsCount: 3,
      items: "2x Hazelnut Frappe, 1x Paneer Sandwich",
      time: "12:45 PM",
      payment: "Online Paid",
      isPaid: true,
      prepCountdown: "14:20 mins",
    },
    {
      id: "ORD-7783-08",
      customer: "Kavita Rastogi",
      status: "prep",
      amount: "₹520",
      itemsCount: 4,
      items: "2x Cappuccino, 2x Choco Muffin",
      time: "12:32 PM",
      payment: "Cash on Delivery",
      isPaid: false,
      prepCountdown: "06:45 mins",
    },
    {
      id: "ORD-7783-07",
      customer: "Mohit Agarwal",
      status: "ready",
      amount: "₹180",
      itemsCount: 2,
      items: "1x Americano, 1x Croissant",
      time: "12:15 PM",
      payment: "Online Paid",
      isPaid: true,
      prepCountdown: "Ready",
    },
  ];

  const filteredOrders = statusTab === "all" ? orders : orders.filter((o) => o.status === statusTab);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header & Date Filters */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              KITCHEN &amp; QUEUE DISPATCH
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Live Orders &amp; KOT Master
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Cockpit
          </button>
        </div>

        {/* 5-Date Filter Horizontal Pills */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
          {[
            { id: "today", label: "Today (8)" },
            { id: "yesterday", label: "Yesterday (14)" },
            { id: "week", label: "This Week (62)" },
            { id: "month", label: "Month" },
            { id: "all", label: "All" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setDateFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
                dateFilter === f.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status Pipeline Tabs */}
        <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] font-bold">
          {[
            { id: "placed", label: "⏳ New (1)" },
            { id: "prep", label: "🍳 Prep (1)" },
            { id: "ready", label: "📦 Ready (1)" },
            { id: "all", label: "📋 All (3)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusTab(tab.id as any)}
              className={`py-1.5 rounded-lg text-center transition ${
                statusTab === tab.id
                  ? "bg-blue-600 text-white shadow-2xs font-extrabold"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order Cards List */}
        <div className="mt-3 space-y-2.5">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 relative"
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black text-slate-900">{order.id}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    order.isPaid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {order.payment}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{order.time}</span>
              </div>

              {/* Customer & Amount */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900">{order.customer}</h3>
                  <p className="text-[10px] text-slate-500">{order.itemsCount} Items • {order.items}</p>
                </div>
                <span className="text-sm font-black text-slate-900">{order.amount}</span>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => onPrintKot?.(order.id)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-1"
                >
                  <span>🖨️ KOT Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDispatchRider?.(order.id)}
                  className="flex-1 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-1"
                >
                  <span>🛵 Rider</span>
                </button>
                <button
                  type="button"
                  onClick={() => onInspectOrder?.(order.id)}
                  className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                >
                  Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
        Auto-Sync active • Database synchronized with Bahraich Kitchen KDS
      </div>
    </div>
  );
}
