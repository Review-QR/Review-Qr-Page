"use client";

import React, { useState } from "react";

interface Screen09Props {
  onInspectOrder?: (orderId: string) => void;
  onPrintKot?: (orderId: string) => void;
  onDispatchRider?: (orderId: string) => void;
  onBack?: () => void;
  liveOrders?: any[];
}

export default function Screen09OrdersMasterBoard({
  onInspectOrder,
  onPrintKot,
  onDispatchRider,
  onBack,
  liveOrders,
}: Screen09Props) {
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "month" | "all">("today");
  const [statusTab, setStatusTab] = useState<"all" | "placed" | "prep" | "ready" | "delivered">("placed");

  const defaultOrders = [
    {
      id: "#108",
      customer: "Aman Sharma",
      status: "placed",
      amount: "₹340",
      itemsList: [
        { name: "Special Shahi Paneer", qty: 1 },
        { name: "Butter Naan", qty: 2 },
      ],
      time: "12:45 PM • Today",
      prepCountdown: "14:20 mins",
    },
    {
      id: "#107",
      customer: "Kavita Rastogi",
      status: "prep",
      amount: "₹520",
      itemsList: [
        { name: "Dal Makhani Handi", qty: 1 },
        { name: "Tandoori Roti (Butter)", qty: 4 },
        { name: "Jeera Rice", qty: 1 },
      ],
      time: "12:32 PM • Today",
      prepCountdown: "06:45 mins",
    },
    {
      id: "#106",
      customer: "Mohit Agarwal",
      status: "ready",
      amount: "₹180",
      itemsList: [
        { name: "Paneer Tikka Roll", qty: 2 },
      ],
      time: "12:15 PM • Today",
      prepCountdown: "Ready",
    },
  ];

  const orders = liveOrders && liveOrders.length > 0
    ? liveOrders.map((o, idx) => {
        let parsedItems: Array<{ name: string; qty: number }> = [];
        if (Array.isArray(o.items) && o.items.length > 0) {
          parsedItems = o.items.map((i: any) => ({
            name: i.name || i.item_name || "Special Item",
            qty: Number(i.quantity) || 1,
          }));
        } else {
          parsedItems = [
            { name: "Special Shahi Paneer", qty: 1 },
            { name: "Butter Naan", qty: 2 },
          ];
        }

        const shortId = o.id ? `#${String(o.id).slice(-3)}` : `#${108 - idx}`;
        const dateStr = o.created_at
          ? new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • Today"
          : "Just now • Today";

        return {
          id: shortId,
          customer: o.customer_name || "Aman Sharma",
          status: o.status === "accepted" || o.status === "preparing" ? "prep" : o.status === "ready_for_pickup" || o.status === "food_ready" ? "ready" : o.status === "delivered" ? "delivered" : "placed",
          amount: `₹${o.total_amount || 340}`,
          itemsList: parsedItems,
          time: dateStr,
          prepCountdown: o.prep_time_minutes ? `${o.prep_time_minutes} mins` : "15 mins",
        };
      })
    : defaultOrders;

  const filteredOrders = orders;

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header & Date Filters */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider">
              ORDER QUEUE &amp; DISPATCH
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Live Orders Master ({filteredOrders.length})
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
          >
            ← Cockpit
          </button>
        </div>

        {/* 5-Date Filter Horizontal Pills */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold [scrollbar-width:none]">
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
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                dateFilter === f.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Order Cards List */}
        <div className="mt-2.5 space-y-2">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5 relative"
            >
              {/* Card Top Row: ID, Time, Customer & Amount (No Paid Online badge) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {order.id}
                  </span>
                  <span className="text-xs font-black text-slate-900">{order.customer}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">{order.amount}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">{order.time}</span>
                </div>
              </div>

              {/* Items Formatted Vertically with Quantities In Front */}
              <div className="space-y-1 py-1.5 border-y border-slate-100">
                {order.itemsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span className="w-5 h-4 rounded bg-slate-100 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0 border border-slate-200">
                        {item.qty}x
                      </span>
                      <span>{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons Row */}
              <div className="pt-1 flex items-center gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => onPrintKot?.(order.id)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🖨️ KOT Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDispatchRider?.(order.id)}
                  className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🛵 Rider</span>
                </button>
                <button
                  type="button"
                  onClick={() => onInspectOrder?.(order.id)}
                  className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
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
