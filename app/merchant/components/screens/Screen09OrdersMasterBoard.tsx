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
  liveOrders = [],
}: Screen09Props) {
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "month" | "all">("all");

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
  const weekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const monthAgoMs = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  const normalizedOrders = (liveOrders || []).map((o) => {
    const rawItems = o.hyperlocal_order_items || o.items || [];
    const parsedItems: Array<{ name: string; qty: number }> = Array.isArray(rawItems)
      ? rawItems.map((i: any) => ({
          name: i.item_name || i.name || "Item",
          qty: Number(i.quantity) || 1,
        }))
      : [];

    const createdMs = o.created_at ? new Date(o.created_at).getTime() : 0;
    const createdDay = o.created_at ? new Date(o.created_at).toISOString().slice(0, 10) : todayStr;
    const shortId = o.id ? `#${String(o.id).slice(-4)}` : "#ORD";
    const timeStr = o.created_at
      ? new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

    return {
      rawId: o.id,
      id: shortId,
      customer: o.customer_name || "Customer",
      status:
        o.status === "accepted" || o.status === "preparing"
          ? "prep"
          : o.status === "ready_for_pickup" || o.status === "food_ready"
          ? "ready"
          : o.status === "delivered"
          ? "delivered"
          : "placed",
      amount: `₹${Number(o.total_amount || 0).toLocaleString("en-IN")}`,
      itemsList: parsedItems,
      time: timeStr ? `${timeStr} • ${createdDay === todayStr ? "Today" : createdDay}` : "Live Order",
      createdDay,
      createdMs,
    };
  });

  const todayCount = normalizedOrders.filter((o) => o.createdDay === todayStr).length;
  const yesterdayCount = normalizedOrders.filter((o) => o.createdDay === yesterdayStr).length;
  const weekCount = normalizedOrders.filter((o) => o.createdMs >= weekAgoMs).length;
  const monthCount = normalizedOrders.filter((o) => o.createdMs >= monthAgoMs).length;

  const filteredOrders = normalizedOrders.filter((o) => {
    if (dateFilter === "today") return o.createdDay === todayStr;
    if (dateFilter === "yesterday") return o.createdDay === yesterdayStr;
    if (dateFilter === "week") return o.createdMs >= weekAgoMs;
    if (dateFilter === "month") return o.createdMs >= monthAgoMs;
    return true;
  });

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        {/* Header & Dynamic Date Filters */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider">
              ORDER QUEUE &amp; DISPATCH
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Live Orders ({filteredOrders.length})
            </h1>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Date Filter Horizontal Pills with Real Counts */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold [scrollbar-width:none]">
          {[
            { id: "all", label: `All (${normalizedOrders.length})` },
            { id: "today", label: `Today (${todayCount})` },
            { id: "yesterday", label: `Yesterday (${yesterdayCount})` },
            { id: "week", label: `This Week (${weekCount})` },
            { id: "month", label: `Month (${monthCount})` },
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

        {/* Clean Empty State or Live Store Order Cards */}
        <div className="mt-2.5 space-y-2">
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-1.5 shadow-2xs mt-4">
              <span className="text-3xl block">📦</span>
              <h3 className="text-xs font-black text-slate-900">No Orders Found</h3>
              <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto leading-snug">
                New customer orders placed for your store will appear here automatically.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.rawId || order.id}
                className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5 relative"
              >
                {/* Card Top Row: ID, Customer & Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                      {order.id}
                    </span>
                    <span className="text-xs font-black text-slate-900 truncate">{order.customer}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900">{order.amount}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">{order.time}</span>
                  </div>
                </div>

                {/* Items Formatted Vertically */}
                {order.itemsList.length > 0 && (
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
                )}

                {/* Action Buttons Row */}
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => onPrintKot?.(order.rawId)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🖨️ KOT Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDispatchRider?.(order.rawId)}
                    className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🛵 Rider</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onInspectOrder?.(order.rawId)}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
                  >
                    Details →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-3 text-center text-[10px] text-slate-400 font-mono">
        Live Supabase Store Sync Active
      </div>
    </div>
  );
}
