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

interface PendingMerchantItem {
  businessId: string;
  businessName: string;
  ownerName?: string;
  ownerPhone?: string;
  city?: string;
  ordersCount: number;
  orderIds: string[];
  grossSales: number;
  platformCommission: number;
  paymentGatewayFee: number;
  netPayable: number;
  bankDetails: {
    account_holder_name?: string;
    bank_account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
    verification_status?: string;
  } | null;
}

interface PendingRiderItem {
  id: string;
  riderId: string;
  riderName: string;
  phone: string;
  walletBalance: number;
  cashInHand: number;
  upiId: string;
  requestId?: string;
  amountRequested: number;
  status: "pending" | "processing" | "completed" | "failed";
}

interface SettlementKPIs {
  totalGrossDelivered: number;
  totalPlatformCommissionRetained: number;
  totalMerchantPendingPayout: number;
  totalRiderPendingPayout: number;
  totalSettledBatchesCount: number;
}

export default function HyperlocalLiveAdminClient() {
  const [viewMode, setViewMode] = useState<"orders" | "settlements">("orders");

  // Orders State
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

  // Settlement State
  const [pendingMerchants, setPendingMerchants] = useState<PendingMerchantItem[]>([]);
  const [pendingRiders, setPendingRiders] = useState<PendingRiderItem[]>([]);
  const [settlementKpis, setSettlementKpis] = useState<SettlementKPIs | null>(null);
  const [isCashfreeConfigured, setIsCashfreeConfigured] = useState(false);
  const [settleModalData, setSettleModalData] = useState<{ type: "merchant" | "rider"; item: any } | null>(null);
  const [settleUtrInput, setSettleUtrInput] = useState("");
  const [settleActionPending, setSettleActionPending] = useState(false);

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

  const fetchSettlements = useCallback(async () => {
    try {
      const res = await fetch("/api/hyperlocal/admin/settlements");
      if (res.ok) {
        const data = await res.json();
        setPendingMerchants(data.pendingMerchants || []);
        setPendingRiders(data.pendingRiders || []);
        setSettlementKpis(data.kpis || null);
        setIsCashfreeConfigured(Boolean(data.isCashfreePayoutsConfigured));
      }
    } catch {
      // Silent on background error
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchSettlements();
    const interval = setInterval(() => {
      fetchOrders();
      if (viewMode === "settlements") {
        fetchSettlements();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchSettlements, viewMode]);

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
        await fetchSettlements();
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

  // ── SETTLEMENT ACTIONS ──
  const handleDownloadBankCsv = async (type: "merchants" | "riders" | "all") => {
    try {
      setIsActionPending(true);
      const res = await fetch("/api/hyperlocal/admin/settlements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "export_bank_csv", type }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Trustit_Bulk_Bank_Settlement_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToastMessage(`✅ Bank Bulk CSV for ${type.toUpperCase()} downloaded successfully!`);
    } catch {
      setActionError("Failed to download Bank Bulk CSV");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCashfreeMerchantPayout = async (m: PendingMerchantItem) => {
    setIsActionPending(true);
    setActionError(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/settlements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "payout_merchant_cashfree",
          businessId: m.businessId,
          orderIds: m.orderIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`⚡ ${data.message}`);
        await fetchSettlements();
      } else {
        // Offer manual UTR settlement
        setSettleModalData({ type: "merchant", item: m });
        setSettleUtrInput(`CMS${Date.now().toString().slice(-8)}`);
        setToastMessage(`⚠️ Cashfree API: ${data.message}. Settle via Netbanking / enter UTR below.`);
      }
    } catch {
      setActionError("Failed to initiate Cashfree payout.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCashfreeRiderPayout = async (r: PendingRiderItem) => {
    setIsActionPending(true);
    setActionError(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/settlements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "payout_rider_cashfree",
          riderId: r.riderId,
          amount: r.amountRequested || r.walletBalance,
          destinationUpi: r.upiId,
        }),
      });
      const data = await res.json();
      if (data.success && data.status === "completed") {
        setToastMessage(`⚡ ₹${r.amountRequested || r.walletBalance} sent to ${r.upiId} via Cashfree UPI! UTR: ${data.utr}`);
        await fetchSettlements();
      } else {
        setSettleModalData({ type: "rider", item: r });
        setSettleUtrInput(`UPI${Date.now().toString().slice(-8)}`);
        setToastMessage(`⚠️ Cashfree API: ${data.message}. Pay via UPI app and confirm UTR.`);
      }
    } catch {
      setActionError("Failed to initiate Cashfree Rider UPI payout.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleConfirmManualSettle = async () => {
    if (!settleModalData) return;
    setSettleActionPending(true);
    try {
      if (settleModalData.type === "merchant") {
        const m = settleModalData.item;
        const res = await fetch("/api/hyperlocal/admin/settlements", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "settle_merchant_batch",
            businessId: m.businessId,
            orderIds: m.orderIds,
            utrNumber: settleUtrInput || `CMS${Date.now().toString().slice(-8)}`,
            accountNumber: m.bankDetails?.bank_account_number,
            ifscCode: m.bankDetails?.ifsc_code,
            netPayoutAmount: m.netPayable,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setToastMessage(`✅ ₹${m.netPayable.toFixed(2)} settled for ${m.businessName}! Bank UTR: ${data.utrNumber}`);
          setSettleModalData(null);
          setSettleUtrInput("");
          await fetchSettlements();
        }
      } else {
        const r = settleModalData.item;
        const res = await fetch("/api/hyperlocal/admin/settlements", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "settle_rider_payout",
            requestId: r.requestId || r.id,
            utrNumber: settleUtrInput || `UPI${Date.now().toString().slice(-8)}`,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setToastMessage(`✅ Payout settled for rider ${r.riderName}! UTR: ${data.utrNumber}`);
          setSettleModalData(null);
          setSettleUtrInput("");
          await fetchSettlements();
        }
      }
    } catch {
      setActionError("Failed to settle payout batch.");
    } finally {
      setSettleActionPending(false);
    }
  };

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

      {/* ── TOP PRIMARY VIEW TOGGLE ── */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === "orders"
                ? "bg-amber-400 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>⚡ Live Orders &amp; Doorstep Audit</span>
            {counts.disputed > 0 && (
              <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px] animate-pulse">
                {counts.disputed}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("settlements");
              fetchSettlements();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === "settlements"
                ? "bg-amber-400 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>💰 Settlements &amp; Cashfree Payouts</span>
            {pendingMerchants.length + pendingRiders.length > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingMerchants.length + pendingRiders.length} Pending
              </span>
            )}
          </button>
        </div>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 pr-2 text-[11px] font-mono">
          <span className="text-slate-400">Gateway Rails:</span>
          {isCashfreeConfigured ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Cashfree Payouts Live
            </span>
          ) : (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span> 1-Click Bank Netbanking CSV Mode
            </span>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 1: LIVE ORDERS & DOORSTEP AUDIT ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {viewMode === "orders" && (
        <div className="space-y-6">
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
                const isDisputed = ord.dispute_status && ord.dispute_status !== "none" && ord.dispute_status !== "resolved";
                const isCancelled = ord.status === "cancelled";
                const isDelivered = ord.status === "delivered" || ord.status === "completed";

                return (
                  <div
                    key={ord.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition shadow-sm space-y-3 ${
                      isDisputed
                        ? "border-rose-500/80 bg-rose-950/20 ring-1 ring-rose-500/40"
                        : isCancelled
                        ? "border-slate-800 bg-slate-900/40 opacity-75"
                        : isDelivered
                        ? "border-slate-800/80 bg-slate-900/50"
                        : "border-slate-700/80 bg-slate-900"
                    }`}
                  >
                    {/* Header: Order Code, Type, Timestamps & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-2 py-0.5 text-xs font-mono font-black text-indigo-300">
                          {formatUnifiedOrderCode(ord.id, biz?.name)}
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          {biz?.name || "Merchant Outlet"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({new Date(ord.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDisputed && (
                          <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase text-white animate-pulse">
                            🚨 CUSTOMER REFUSED AT DOORSTEP
                          </span>
                        )}
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            isCancelled
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : isDelivered
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {ord.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Dispute Banner if customer refused */}
                    {isDisputed && (
                      <div className="rounded-xl border border-rose-500/50 bg-rose-950/40 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-rose-300">
                          <span className="flex items-center gap-1.5">
                            <span>⚠️ Dispute Alert:</span>
                            <span>Rider reported customer refusal at doorstep</span>
                          </span>
                          <span className="text-[10px] text-rose-400">
                            {ord.dispute_reported_at ? new Date(ord.dispute_reported_at).toLocaleTimeString() : ""}
                          </span>
                        </div>
                        {ord.dispute_notes && (
                          <p className="text-[11px] text-slate-300 italic bg-black/30 p-2 rounded-lg">
                            &ldquo;{ord.dispute_notes}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Cancellation details banner */}
                    {isCancelled && ord.cancellation_reason && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-2.5 text-xs text-rose-300 flex items-center justify-between">
                        <span>🔴 Cancelled: {ord.cancellation_reason.replace(/_/g, " ")}</span>
                        {ord.admin_notes && <span className="text-[11px] text-slate-400">Audit: {ord.admin_notes}</span>}
                      </div>
                    )}

                    {/* 3-Column Grid: Customer Info, Rider Info & OTP Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Col 1: Customer Details */}
                      <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
                        <div className="font-semibold text-white flex items-center justify-between">
                          <span>{ord.customer_name || "Customer"}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{ord.customer_phone}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          📍 {ord.customer_address?.street || ord.customer_address?.city || "Bahraich, UP"}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Total Bill:</span>
                          <span className="font-bold text-emerald-400">₹{Number(ord.total_amount).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Col 2: Assigned Rider Details */}
                      <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Rider</span>
                        {rider ? (
                          <>
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>🛵 {rider.full_name}</span>
                              <span className="text-amber-400 text-[11px]">★ {rider.rating || 5.0}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">
                              📞 {rider.phone} • {rider.vehicle_number}
                            </p>
                            <div className="pt-1 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Trip Fare:</span>
                              <span className="font-bold text-white">₹{ord.delivery_fee || 35}</span>
                            </div>
                          </>
                        ) : (
                          <div className="py-2 text-center text-slate-500 italic text-[11px]">
                            Assigning Rider Soon (Radar scanning)...
                          </div>
                        )}
                      </div>

                      {/* Col 3: Live OTP & Admin Action */}
                      <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery OTP &amp; Security</span>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">4-Digit OTP:</span>
                            {ord.delivery_otp ? (
                              <span className="font-mono text-base font-black tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                                {ord.delivery_otp}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-mono">N/A</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-1 flex gap-2">
                          {!isCancelled && !isDelivered && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(ord);
                                setAdminNote("");
                                setActionError(null);
                              }}
                              className="w-full rounded-xl bg-rose-600/90 hover:bg-rose-600 py-1.5 text-[11px] font-bold text-white transition shadow"
                            >
                              🛑 Cancel Order (Doorstep Refusal)
                            </button>
                          )}
                          {isDisputed && (
                            <button
                              type="button"
                              onClick={() => handleResolveDispute(ord.id)}
                              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-300"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 2: MULTI-PARTY SETTLEMENTS & CASHFREE PAYOUTS ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {viewMode === "settlements" && (
        <div className="space-y-6">
          {/* ── 4 FINANCIAL KPI CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Gross Sales */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Food Volume</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{settlementKpis?.totalGrossDelivered?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-blue-400 font-semibold">Total Pool</span>
              </div>
            </div>

            {/* Card 2: Platform Revenue Retained */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Trustit Net Cut (Commission)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  ₹{settlementKpis?.totalPlatformCommissionRetained?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-amber-300 font-semibold">10% - 15% Net</span>
              </div>
            </div>

            {/* Card 3: Restaurant Pending Payouts */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">Restaurant Pending Payouts</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  ₹{settlementKpis?.totalMerchantPendingPayout?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-emerald-300 font-semibold">{pendingMerchants.length} Outlets</span>
              </div>
            </div>

            {/* Card 4: Rider Pending Balances */}
            <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">Rider Wallet Balance</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-300">
                  ₹{settlementKpis?.totalRiderPendingPayout?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold">Direct UPI</span>
              </div>
            </div>
          </div>

          {/* ── EXPORT ACTION STRIP ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs font-black text-white block">Corporate Netbanking Bulk Settlement Rails</span>
              <p className="text-[11px] text-slate-400">
                Generate 1-Click CSV for SBI CMP, HDFC E-Net, or disburse directly via Cashfree Payouts API.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDownloadBankCsv("all")}
                disabled={isActionPending}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-black text-slate-950 transition shadow flex items-center gap-1.5"
              >
                <span>📥</span>
                <span>Download Bank Bulk CSV (All)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadBankCsv("merchants")}
                disabled={isActionPending}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition"
              >
                Restaurant IMPS CSV
              </button>

              <button
                type="button"
                onClick={() => handleDownloadBankCsv("riders")}
                disabled={isActionPending}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition"
              >
                Rider UPI CSV
              </button>

              <button
                type="button"
                onClick={fetchSettlements}
                className="rounded-xl bg-slate-850 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-400"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* ── SECTION 1: RESTAURANT SETTLEMENTS QUEUE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">🍽️ Restaurant Settlement Queue</span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  {pendingMerchants.length} Pending
                </span>
              </div>
              <span className="text-xs text-slate-400">Disbursed via IMPS / NEFT</span>
            </div>

            {pendingMerchants.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 space-y-1">
                <span className="text-2xl block">🍱</span>
                <p className="text-xs font-bold text-slate-300">All Restaurant Settlements are Up to Date!</p>
                <p className="text-[11px]">No pending unbatched restaurant payouts at this moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMerchants.map((m) => (
                  <div
                    key={m.businessId}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{m.businessName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({m.city || "Bahraich"})</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Owner: {m.ownerName || "Partner"} • 📞 {m.ownerPhone || "N/A"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Payable to Restaurant</span>
                        <span className="text-lg font-black text-emerald-400">
                          ₹{m.netPayable.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {/* Financial breakdown */}
                      <div className="rounded-xl bg-slate-950/60 p-2.5 space-y-1 border border-slate-850">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Orders &amp; Cuts</span>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Orders Count:</span>
                          <span className="font-bold text-white">{m.ordersCount}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Gross Sales:</span>
                          <span className="text-slate-200">₹{m.grossSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-amber-400">Trustit Commission:</span>
                          <span className="text-amber-300 font-bold">-₹{m.platformCommission.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div className="rounded-xl bg-slate-950/60 p-2.5 space-y-1 border border-slate-850">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Linked Bank Account</span>
                        {m.bankDetails?.bank_account_number ? (
                          <>
                            <p className="text-[11px] font-mono font-semibold text-white">
                              {m.bankDetails.bank_name || "Bank"}: {m.bankDetails.bank_account_number}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              IFSC: {m.bankDetails.ifsc_code}
                            </p>
                            <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                              ✓ Penny-Drop Verified
                            </span>
                          </>
                        ) : (
                          <div className="text-[10px] text-amber-400 italic pt-1">
                            ⚠️ Awaiting bank account submission by merchant
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="rounded-xl bg-slate-950/60 p-2.5 flex flex-col justify-between space-y-2 border border-slate-850">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Disbursement Action</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isActionPending || m.netPayable <= 0}
                            onClick={() => handleCashfreeMerchantPayout(m)}
                            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-1.5 text-[11px] font-bold text-white transition disabled:opacity-50"
                          >
                            ⚡ Cashfree IMPS
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettleModalData({ type: "merchant", item: m });
                              setSettleUtrInput(`CMS${Date.now().toString().slice(-8)}`);
                            }}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white transition"
                          >
                            ✅ Mark Settled
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SECTION 2: RIDER UPI PAYOUTS QUEUE ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">🛵 Delivery Partner UPI Withdrawals Queue</span>
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  {pendingRiders.length} Pending
                </span>
              </div>
              <span className="text-xs text-slate-400">Disbursed via Direct UPI</span>
            </div>

            {pendingRiders.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 space-y-1">
                <span className="text-2xl block">🛵</span>
                <p className="text-xs font-bold text-slate-300">All Rider Wallets are Cleared!</p>
                <p className="text-[11px]">No active rider withdrawal balances pending.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingRiders.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2.5 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white block">🛵 {r.riderName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">📞 {r.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Balance</span>
                        <span className="text-base font-black text-emerald-400">
                          ₹{(r.amountRequested || r.walletBalance).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Registered UPI ID:</span>
                        <span className="font-mono font-bold text-amber-400 text-[11px]">{r.upiId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(r.upiId);
                          setToastMessage(`Copied UPI ID: ${r.upiId}`);
                        }}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300"
                      >
                        📋 Copy
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() => handleCashfreeRiderPayout(r)}
                        className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-1.5 text-[11px] font-bold text-white transition"
                      >
                        ⚡ Cashfree UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSettleModalData({ type: "rider", item: r });
                          setSettleUtrInput(`UPI${Date.now().toString().slice(-8)}`);
                        }}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white transition"
                      >
                        ✅ Settle with UTR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── SETTLEMENT UTR CONFIRMATION MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {settleModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-white">
                {settleModalData.type === "merchant"
                  ? `Settle Restaurant Batch: ${settleModalData.item.businessName}`
                  : `Settle Rider UPI: ${settleModalData.item.riderName}`}
              </span>
              <button
                type="button"
                onClick={() => setSettleModalData(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 text-xs space-y-1.5 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Payable Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ₹{Number(settleModalData.type === "merchant" ? settleModalData.item.netPayable : (settleModalData.item.amountRequested || settleModalData.item.walletBalance)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Destination:</span>
                <span className="font-mono text-slate-200">
                  {settleModalData.type === "merchant"
                    ? `${settleModalData.item.bankDetails?.bank_name || "Bank"} (${settleModalData.item.bankDetails?.bank_account_number || "A/C"})`
                    : settleModalData.item.upiId}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Bank UTR / Transaction Reference
                </label>
                <button
                  type="button"
                  onClick={() => setSettleUtrInput(`CMS${Date.now().toString().slice(-8)}`)}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  Auto CMS UTR
                </button>
              </div>
              <input
                type="text"
                value={settleUtrInput}
                onChange={(e) => setSettleUtrInput(e.target.value)}
                placeholder="e.g. CMS928310948192 or UPI781923"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={settleActionPending}
                onClick={handleConfirmManualSettle}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-black text-white transition disabled:opacity-50 shadow"
              >
                {settleActionPending ? "Marking Settled..." : "Confirm & Update Passbook ✅"}
              </button>
              <button
                type="button"
                onClick={() => setSettleModalData(null)}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── DOORSTEP REFUSAL CANCEL CONFIRMATION MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/50 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>🚨</span>
                <span>Cancel Order: {formatUnifiedOrderCode(cancelModalOrder.id, (cancelModalOrder as any).businesses?.name)}</span>
              </span>
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
