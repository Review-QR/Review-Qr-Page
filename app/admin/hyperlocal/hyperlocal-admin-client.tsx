"use client";

import { useState, useEffect, useCallback } from "react";
import type { HyperlocalOrder } from "@/lib/hyperlocal/types";
import { formatUnifiedOrderCode } from "@/lib/hyperlocal/order-id";

interface OrderStats {
  active: number;
  disputed: number;
  deliveredToday: number;
  cancelledToday: number;
  total: number;
}

export default function HyperlocalLiveAdminClient() {
  const [orders, setOrders] = useState<HyperlocalOrder[]>([]);
  const [counts, setCounts] = useState<OrderStats>({
    active: 0,
    disputed: 0,
    deliveredToday: 0,
    cancelledToday: 0,
    total: 0,
  });
  const [activeTab, setActiveTab] = useState<"all" | "disputed" | "active" | "delivered" | "cancelled">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<HyperlocalOrder | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/hyperlocal/admin/orders?filter=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch {
      // Keep silent on background polling error
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function handleConfirmDoorstepCancel() {
    if (!cancelModalOrder) return;
    setIsActionPending(true);
    setActionError(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "cancel_refusal",
          orderId: cancelModalOrder.id,
          adminNotes: adminNote || "Customer refused delivery at doorstep",
          cancelledBy: "admin",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCancelModalOrder(null);
        setAdminNote("");
        setActionError(null);
        setToastMessage(`✅ Order cancelled. Rider credited ₹${data.result?.riderCompensated || 35} trip fee. Active delivery unlocked.`);
        await fetchOrders();
      } else {
        setActionError(data.error || "Failed to cancel order.");
      }
    } catch (err: any) {
      setActionError(err?.message || "Network error processing cancellation.");
    } finally {
      setIsActionPending(false);
    }
  }

  async function handleResolveDispute(orderId: string) {
    setIsActionPending(true);
    try {
      const res = await fetch("/api/hyperlocal/admin/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "resolve_dispute",
          orderId,
          adminNotes: "Dispute resolved by Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage("Dispute marked resolved.");
        fetchOrders();
      }
    } finally {
      setIsActionPending(false);
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const orderCode = formatUnifiedOrderCode(o.id, (o as any).businesses?.name).toLowerCase();
    const custName = (o.customer_name || "").toLowerCase();
    const custPhone = (o.customer_phone || "").toLowerCase();
    const riderName = ((o as any).delivery_riders?.full_name || "").toLowerCase();
    return orderCode.includes(q) || custName.includes(q) || custPhone.includes(q) || riderName.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 4-CARD LIVE KPI DASHBOARD ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Running Orders */}
        <div
          onClick={() => setActiveTab("active")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeTab === "active"
              ? "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30"
              : "border-slate-800 bg-slate-900/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Running Orders</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{counts.active}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">Live on Road / Kitchen</span>
          </div>
        </div>

        {/* Card 2: Disputed / Refusals */}
        <div
          onClick={() => setActiveTab("disputed")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            counts.disputed > 0
              ? "border-rose-500 bg-rose-500/20 ring-2 ring-rose-500/40 animate-pulse"
              : activeTab === "disputed"
              ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20"
              : "border-slate-800 bg-slate-900/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Disputes / Refusals</span>
            <span className="text-sm">🚨</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-400">{counts.disputed}</span>
            <span className="text-[11px] text-rose-300 font-semibold">
              {counts.disputed > 0 ? "Requires Immediate Action!" : "All Clean"}
            </span>
          </div>
        </div>

        {/* Card 3: Delivered Today */}
        <div
          onClick={() => setActiveTab("delivered")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeTab === "delivered"
              ? "border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30"
              : "border-slate-800 bg-slate-900/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered Today</span>
            <span className="text-sm">✅</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{counts.deliveredToday}</span>
            <span className="text-[11px] text-blue-400 font-semibold">OTP Verified</span>
          </div>
        </div>

        {/* Card 4: Cancelled Today */}
        <div
          onClick={() => setActiveTab("cancelled")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeTab === "cancelled"
              ? "border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/30"
              : "border-slate-800 bg-slate-900/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled Today</span>
            <span className="text-sm">🔴</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-300">{counts.cancelledToday}</span>
            <span className="text-[11px] text-rose-400 font-semibold">Doorstep / Reject</span>
          </div>
        </div>
      </div>

      {/* ── FILTER TABS & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "All Orders", count: counts.total },
            { id: "disputed", label: "🚨 Disputes / Refusals", count: counts.disputed },
            { id: "active", label: "🟢 Running Live", count: counts.active },
            { id: "delivered", label: "✅ Delivered", count: counts.deliveredToday },
            { id: "cancelled", label: "🔴 Cancelled", count: counts.cancelledToday },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-md bg-black/20 px-1.5 py-0.2 text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search code (#TR-DEL-3210), phone, rider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* ── ORDERS LIST ── */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <span className="animate-spin inline-block text-lg mb-2">⚡</span>
          <p>Syncing live orders and OTPs from Supabase...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 space-y-1">
          <span className="text-3xl block">📋</span>
          <p className="text-sm font-bold text-slate-300">No Orders in this View</p>
          <p className="text-xs">There are no orders matching the &quot;{activeTab}&quot; filter right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const biz = (ord as any).businesses;
            const rider = (ord as any).delivery_riders;
            const items = (ord as any).hyperlocal_order_items || [];
            const isDisputed = ord.dispute_status && !["none", "resolved"].includes(ord.dispute_status);
            const isRunning = [
              "placed",
              "accepted_by_merchant",
              "preparing",
              "ready_for_pickup",
              "rider_assigned",
              "picked_up",
              "out_for_delivery",
              "arrived_at_doorstep",
            ].includes(ord.status);
            const isCancelled = ord.status === "cancelled";
            const isDelivered = ord.status === "delivered" || ord.status === "completed";

            return (
              <div
                key={ord.id}
                className={`rounded-2xl border p-4 sm:p-5 transition space-y-4 shadow-md ${
                  isDisputed
                    ? "border-rose-500/80 bg-rose-950/20 ring-1 ring-rose-500/50"
                    : isCancelled
                    ? "border-slate-800 bg-slate-900/50 opacity-90"
                    : isDelivered
                    ? "border-slate-800 bg-slate-900/70"
                    : "border-slate-750 bg-slate-900"
                }`}
              >
                {/* ── CARD TOP BAR ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-mono font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-xl">
                      {formatUnifiedOrderCode(ord.id, biz?.name)}
                    </span>

                    {/* Status Badge */}
                    {isCancelled ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        🔴 CANCELLED {ord.cancellation_reason ? `(${ord.cancellation_reason.replace(/_/g, " ").toUpperCase()})` : ""}
                      </span>
                    ) : isDelivered ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✅ DELIVERED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        🟢 {ord.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(ord.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">
                        {ord.payment_mode === "cod" ? "Cash on Delivery" : "Paid Online (Cashfree)"}
                      </span>
                      <span className="text-base font-black text-white">₹{ord.total_amount}</span>
                    </div>
                  </div>
                </div>

                {/* ── DISPUTE BANNER (IF FLAGGED BY RIDER) ── */}
                {isDisputed && (
                  <div className="rounded-xl border border-rose-500 bg-rose-500/20 p-3 space-y-1.5 animate-pulse">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                        <span>🚨</span> DOORSTEP DISPUTE REPORTED: {ord.dispute_status?.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <span className="text-[10px] text-rose-300 font-mono">
                        {ord.dispute_reported_at ? new Date(ord.dispute_reported_at).toLocaleTimeString() : "Just now"}
                      </span>
                    </div>
                    <p className="text-xs text-rose-200">
                      <strong>Rider Note:</strong> &ldquo;{ord.dispute_notes || "Customer refused delivery at doorstep"}&rdquo;
                    </p>
                    <p className="text-[10.5px] text-rose-300/80">
                      💡 <strong>Action Required:</strong> Call the customer below. If the customer refuses delivery or is unreachable, click <strong>&quot;Cancel Order (Doorstep Refusal)&quot;</strong> to cancel from backend and credit rider ₹35.
                    </p>
                  </div>
                )}

                {/* ── 3-COLUMN DETAILS GRID (RESTAURANT | CUSTOMER | RIDER) ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Column 1: Restaurant / Shop */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      🏪 Outlet / Merchant
                    </span>
                    <p className="font-bold text-white text-sm">{biz?.name || "Merchant Partner"}</p>
                    <p className="text-slate-400 text-[11px] truncate">{biz?.address || "Bahraich City"}</p>
                    {biz?.phone && (
                      <a
                        href={`tel:${biz.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 pt-1"
                      >
                        <span>📞</span> {biz.phone}
                      </a>
                    )}
                  </div>

                  {/* Column 2: Customer */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      👤 Customer
                    </span>
                    <p className="font-bold text-white text-sm">{ord.customer_name || "Customer"}</p>
                    <p className="text-slate-400 text-[11px] truncate">
                      {(ord.customer_address as any)?.street || (ord.customer_address as any)?.landmark || "Bahraich"}
                    </p>
                    <a
                      href={`tel:${ord.customer_phone}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/30 transition mt-1"
                    >
                      <span>📞</span> Call Customer ({ord.customer_phone})
                    </a>
                  </div>

                  {/* Column 3: Rider */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      🛵 Assigned Rider
                    </span>
                    {rider ? (
                      <>
                        <p className="font-bold text-white text-sm">{rider.full_name}</p>
                        <p className="text-slate-400 text-[11px] font-mono">
                          {rider.vehicle_type?.toUpperCase()} · {rider.vehicle_number}
                        </p>
                        <a
                          href={`tel:${rider.phone}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold hover:bg-blue-500/30 transition mt-1"
                        >
                          <span>📞</span> Call Rider ({rider.phone})
                        </a>
                      </>
                    ) : (
                      <p className="text-slate-500 italic pt-1">No rider assigned yet</p>
                    )}
                  </div>
                </div>

                {/* ── ITEMS SUMMARY ── */}
                {items.length > 0 && (
                  <div className="rounded-xl border border-slate-850 bg-slate-950/40 p-2.5 text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="font-bold text-slate-400">Items:</span>
                    {items.map((item: any, idx: number) => (
                      <span key={idx} className="font-mono">
                        {item.quantity}x {item.item_name} (₹{item.total_price})
                      </span>
                    ))}
                  </div>
                )}

                {/* ── DELIVERY HANDOVER OTP AUDIT & ADMIN ACTIONS ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-800 gap-3">
                  {/* Delivery Handover OTP Card */}
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-amber-300 block">
                        Delivery Handover OTP (Admin Audit)
                      </span>
                      <span className="text-xs text-slate-400">
                        Never give OTP to rider over phone. Cancel order if refused.
                      </span>
                    </div>
                    <span className="text-lg font-mono font-black text-amber-300 bg-slate-950 px-3 py-1 rounded-lg border border-amber-500/50 tracking-widest">
                      {ord.delivery_otp}
                    </span>
                  </div>

                  {/* Admin One-Click Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isDisputed && (
                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() => handleResolveDispute(ord.id)}
                        className="px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-bold text-emerald-300 transition"
                      >
                        ✓ Mark Dispute Resolved
                      </button>
                    )}

                    {isRunning && (
                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() => {
                          setCancelModalOrder(ord);
                          setAdminNote(ord.dispute_notes || "Customer refused delivery at doorstep");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-xs font-black text-white shadow-md transition"
                      >
                        🚨 Cancel Order (Doorstep Refusal)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DOORSTEP CANCELLATION MODAL ── */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border-2 border-rose-500 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <h3 className="text-sm font-black text-white">
                  Cancel Order: {formatUnifiedOrderCode(cancelModalOrder.id, (cancelModalOrder as any).businesses?.name)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-slate-200 space-y-2">
              <p className="font-bold text-rose-300">
                क्या आपने कस्टमर से बात करके कन्फर्म कर लिया है कि वे ऑर्डर नहीं ले रहे हैं?
              </p>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p>• <strong>राइडर को नुकसान नहीं होगा:</strong> राइडर को ₹35 ट्रिप चार्ज वॉलेट में मिलेगा।</p>
                <p>• <strong>राइडर अनलॉक हो जाएगा:</strong> राइडर तुरंत नए ऑर्डर लेने के लिए फ़्री हो जाएगा।</p>
                <p>• <strong>रेस्टोरेंट को भुगतान होगा:</strong> पके हुए खाने का पैसा रेस्टोरेंट को मिलेगा।</p>
                <p>• <strong>कस्टमर को रिफ़ंड नहीं मिलेगा:</strong> दरवाजे पर मना करने पर कोई रिफंड नहीं।</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Admin Audit Note (कैंसिलेशन कारण)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="जैसे: कस्टमर ने कहा खाना नहीं चाहिए, लेट हो गया।"
                rows={2}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {actionError && (
              <div className="rounded-xl border border-rose-500 bg-rose-500/20 p-2.5 text-xs text-rose-300 font-bold">
                ⚠️ {actionError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleConfirmDoorstepCancel}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-black text-white transition disabled:opacity-50 shadow-md"
              >
                {isActionPending ? "Cancelling & Settling..." : "Confirm Cancel & Settle Payouts"}
              </button>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
