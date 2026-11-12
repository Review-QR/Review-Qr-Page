"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { HyperlocalOrder } from "@/lib/hyperlocal/types";
import { formatUnifiedOrderCode } from "@/lib/hyperlocal/order-id";
import RiderApprovalsPanel from "./rider-approvals-panel";
import AdminCustomerPointsPanel from "@/components/admin/AdminCustomerPointsPanel";

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
  const [viewMode, setViewMode] = useState<"orders" | "settlements" | "riders" | "points">("orders");
  const [pendingRidersCount, setPendingRidersCount] = useState<number>(0);

  // Check URL tab param on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "riders") {
        setViewMode("riders");
      } else if (tab === "points") {
        setViewMode("points");
      }
    }
  }, []);

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

  async function handleConfirmDoorstepCancel(mode: "admin_cancel_refund" | "cancel_refusal" = "admin_cancel_refund") {
    if (!cancelModalOrder) return;
    setIsActionPending(true);
    setActionError(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: mode,
          orderId: cancelModalOrder.id,
          adminNotes:
            adminNote ||
            (mode === "cancel_refusal"
              ? "Customer refused delivery at doorstep"
              : "Cancelled & refunded by Admin"),
          issueRefund: mode === "admin_cancel_refund",
          cancelledBy: "admin",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCancelModalOrder(null);
        setAdminNote("");
        setActionError(null);
        const refundNote = data.result?.refundId ? ` Cashfree Refund ID: ${data.result.refundId}.` : "";
        const riderNote =
          mode === "cancel_refusal"
            ? ` Rider credited ₹${data.result?.riderCompensated || 35} trip fee.`
            : " Assigned rider unlocked.";
        setToastMessage(`✅ Order cancelled.${refundNote}${riderNote}`);
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
    <div className="space-y-3.5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[11px] font-bold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── TOP PRIMARY VIEW TOGGLE ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("orders")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
              viewMode === "orders"
                ? "bg-slate-900 text-white shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>⚡ Live Orders &amp; Doorstep Audit</span>
            {counts.disputed > 0 && (
              <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[9px] animate-pulse">
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
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
              viewMode === "settlements"
                ? "bg-slate-900 text-white shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>💰 Settlements &amp; Cashfree Payouts</span>
            {pendingMerchants.length + pendingRiders.length > 0 && (
              <span className="bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-full text-[9px]">
                {pendingMerchants.length + pendingRiders.length} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode("riders")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
              viewMode === "riders"
                ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>🛵 Rider Approvals</span>
            {pendingRidersCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[9px] animate-pulse">
                {pendingRidersCount} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode("points")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
              viewMode === "points"
                ? "bg-[#003178] text-white shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>🎁 Customer Points</span>
          </button>

          <Link
            href="/merchants"
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
            title="Manage Merchant taking-orders access & permissions"
          >
            <span>🏪 Merchant Order Access</span>
          </Link>
        </div>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 pr-2 text-[10px] font-mono">
          <span className="text-slate-500">Gateway Rails:</span>
          {isCashfreeConfigured ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Cashfree Payouts Live
            </span>
          ) : (
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> 1-Click Bank Netbanking CSV Mode
            </span>
          )}
        </div>
      </div>

      {viewMode === "points" && <AdminCustomerPointsPanel />}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 1: LIVE ORDERS & DOORSTEP AUDIT ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {viewMode === "orders" && (
        <div className="space-y-3.5">
          {/* ── 4-CARD COMPACT LIVE KPI DASHBOARD ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Card 1: Active Running Orders */}
            <div
              onClick={() => setActiveTab("active")}
              className={`cursor-pointer rounded-xl border px-3 py-2 transition shadow-2xs ${
                activeTab === "active"
                  ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Running Orders</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-slate-900">{counts.active}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Live on Road / Kitchen</span>
              </div>
            </div>

            {/* Card 2: Disputed / Refusals */}
            <div
              onClick={() => setActiveTab("disputed")}
              className={`cursor-pointer rounded-xl border px-3 py-2 transition shadow-2xs ${
                counts.disputed > 0
                  ? "border-rose-400 bg-rose-50 ring-1 ring-rose-400 animate-pulse"
                  : activeTab === "disputed"
                  ? "border-rose-300 bg-rose-50/50 ring-1 ring-rose-400"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Disputes / Refusals</span>
                <span className="text-xs">🚨</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-rose-600">{counts.disputed}</span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  {counts.disputed > 0 ? "Action Needed!" : "All Clean"}
                </span>
              </div>
            </div>

            {/* Card 3: Delivered Today */}
            <div
              onClick={() => setActiveTab("delivered")}
              className={`cursor-pointer rounded-xl border px-3 py-2 transition shadow-2xs ${
                activeTab === "delivered"
                  ? "border-blue-400 bg-blue-50 ring-1 ring-blue-400"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivered Today</span>
                <span className="text-xs">✅</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-slate-900">{counts.deliveredToday}</span>
                <span className="text-[10px] text-blue-700 font-semibold">OTP Verified</span>
              </div>
            </div>

            {/* Card 4: Cancelled Today */}
            <div
              onClick={() => setActiveTab("cancelled")}
              className={`cursor-pointer rounded-xl border px-3 py-2 transition shadow-2xs ${
                activeTab === "cancelled"
                  ? "border-rose-400 bg-rose-50 ring-1 ring-rose-400"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancelled Today</span>
                <span className="text-xs">🔴</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-slate-700">{counts.cancelledToday}</span>
                <span className="text-[10px] text-rose-600 font-semibold">Doorstep / Reject</span>
              </div>
            </div>
          </div>

          {/* ── FILTER TABS & SEARCH BAR ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-700 border border-slate-200"
                  }`}>
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
                className="w-full sm:w-60 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
          {/* ── ORDERS LIST ── */}
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <span className="animate-spin inline-block text-lg mb-2">⚡</span>
              <p>Syncing live orders and OTPs from Supabase...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white text-slate-500 space-y-1 shadow-2xs">
              <span className="text-3xl block">📋</span>
              <p className="text-sm font-bold text-slate-800">No Orders in this View</p>
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
                    className={`rounded-2xl border p-4 sm:p-5 transition shadow-2xs space-y-3 ${
                      isDisputed
                        ? "border-rose-300 bg-rose-50/60 ring-1 ring-rose-200"
                        : isCancelled
                        ? "border-slate-200 bg-slate-50/70 opacity-75"
                        : isDelivered
                        ? "border-slate-200 bg-white"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {/* Header: Order Code, Type, Timestamps & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-mono font-black text-indigo-700">
                          {formatUnifiedOrderCode(ord.id, biz?.name)}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {biz?.name || "Merchant Outlet"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({new Date(ord.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDisputed && (
                          <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase text-white animate-pulse">
                            🚨 CUSTOMER REFUSED AT DOORSTEP
                          </span>
                        )}
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            isCancelled
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isDelivered
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {ord.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Dispute Banner if customer refused */}
                    {isDisputed && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-rose-800">
                          <span className="flex items-center gap-1.5">
                            <span>⚠️ Dispute Alert:</span>
                            <span>Rider reported customer refusal at doorstep</span>
                          </span>
                          <span className="text-[10px] text-rose-600">
                            {ord.dispute_reported_at ? new Date(ord.dispute_reported_at).toLocaleTimeString() : ""}
                          </span>
                        </div>
                        {ord.dispute_notes && (
                          <p className="text-[11px] text-slate-800 italic bg-white/80 border border-rose-100 p-2 rounded-lg">
                            &ldquo;{ord.dispute_notes}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Cancellation details banner */}
                    {isCancelled && ord.cancellation_reason && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center justify-between">
                        <span>🔴 Cancelled: {ord.cancellation_reason.replace(/_/g, " ")}</span>
                        {ord.admin_notes && <span className="text-[11px] text-slate-600">Audit: {ord.admin_notes}</span>}
                      </div>
                    )}

                    {/* 3-Column Grid: Customer Info, Rider Info & OTP Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Col 1: Customer Details */}
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Customer Details</span>
                        <div className="font-semibold text-slate-900 flex items-center justify-between">
                          <span>{ord.customer_name || "Customer"}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{ord.customer_phone}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          📍 {ord.customer_address?.street || ord.customer_address?.city || "Bahraich, UP"}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Total Bill:</span>
                          <span className="font-bold text-emerald-700">₹{Number(ord.total_amount).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Col 2: Assigned Rider Details */}
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Delivery Rider</span>
                        {rider ? (
                          <>
                            <div className="font-semibold text-slate-900 flex items-center justify-between">
                              <span>🛵 {rider.full_name}</span>
                              <span className="text-amber-600 text-[11px]">★ {rider.rating || 5.0}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono">
                              📞 {rider.phone} • {rider.vehicle_number}
                            </p>
                            <div className="pt-1 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Trip Fare:</span>
                              <span className="font-bold text-slate-900">₹{ord.delivery_fee || 35}</span>
                            </div>
                          </>
                        ) : (
                          <div className="py-2 text-center text-slate-400 italic text-[11px]">
                            Assigning Rider Soon (Radar scanning)...
                          </div>
                        )}
                      </div>

                      {/* Col 3: Live OTP & Admin Action */}
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Delivery OTP &amp; Security</span>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-slate-500 text-[11px]">4-Digit OTP:</span>
                            {ord.delivery_otp ? (
                              <span className="font-mono text-base font-black tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                {ord.delivery_otp}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">N/A</span>
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
                              className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-1.5 text-[11px] font-bold text-white transition shadow-xs"
                            >
                              🛑 Cancel Order / Approve Refund
                            </button>
                          )}
                          {isDisputed && (
                            <button
                              type="button"
                              onClick={() => handleResolveDispute(ord.id)}
                              className="rounded-xl bg-slate-200 hover:bg-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-700"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gross Food Volume</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{settlementKpis?.totalGrossDelivered?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">Total Pool</span>
              </div>
            </div>

            {/* Card 2: Platform Revenue Retained */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Trustit Net Cut (Commission)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-700">
                  ₹{settlementKpis?.totalPlatformCommissionRetained?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">10% - 15% Net</span>
              </div>
            </div>

            {/* Card 3: Restaurant Pending Payouts */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Restaurant Pending Payouts</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  ₹{settlementKpis?.totalMerchantPendingPayout?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">{pendingMerchants.length} Outlets</span>
              </div>
            </div>

            {/* Card 4: Rider Pending Balances */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-2xs">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">Rider Wallet Balance</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                  ₹{settlementKpis?.totalRiderPendingPayout?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold">Direct UPI</span>
              </div>
            </div>
          </div>

          {/* ── EXPORT ACTION STRIP ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <span className="text-xs font-black text-slate-900 block">Corporate Netbanking Bulk Settlement Rails</span>
              <p className="text-[11px] text-slate-500">
                Generate 1-Click CSV for SBI CMP, HDFC E-Net, or disburse directly via Cashfree Payouts API.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDownloadBankCsv("all")}
                disabled={isActionPending}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-black text-white transition shadow-xs flex items-center gap-1.5"
              >
                <span>📥</span>
                <span>Download Bank Bulk CSV (All)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadBankCsv("merchants")}
                disabled={isActionPending}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 transition"
              >
                Restaurant IMPS CSV
              </button>

              <button
                type="button"
                onClick={() => handleDownloadBankCsv("riders")}
                disabled={isActionPending}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 transition"
              >
                Rider UPI CSV
              </button>

              <button
                type="button"
                onClick={fetchSettlements}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* ── SECTION 1: RESTAURANT SETTLEMENTS QUEUE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">🍽️ Restaurant Settlement Queue</span>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {pendingMerchants.length} Pending
                </span>
              </div>
              <span className="text-xs text-slate-500">Disbursed via IMPS / NEFT</span>
            </div>

            {pendingMerchants.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 space-y-1 shadow-2xs">
                <span className="text-2xl block">🍱</span>
                <p className="text-xs font-bold text-slate-800">All Restaurant Settlements are Up to Date!</p>
                <p className="text-[11px]">No pending unbatched restaurant payouts at this moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMerchants.map((m) => (
                  <div
                    key={m.businessId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 hover:border-slate-300 shadow-2xs transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{m.businessName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({m.city || "Bahraich"})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Owner: {m.ownerName || "Partner"} • 📞 {m.ownerPhone || "N/A"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Payable to Restaurant</span>
                        <span className="text-lg font-black text-emerald-600">
                          ₹{m.netPayable.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {/* Financial breakdown */}
                      <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Orders &amp; Cuts</span>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Orders Count:</span>
                          <span className="font-bold text-slate-900">{m.ordersCount}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Gross Sales:</span>
                          <span className="text-slate-700">₹{m.grossSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-amber-700">Trustit Commission:</span>
                          <span className="text-amber-800 font-bold">-₹{m.platformCommission.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Linked Bank Account</span>
                        {m.bankDetails?.bank_account_number ? (
                          <>
                            <p className="text-[11px] font-mono font-semibold text-slate-900">
                              {m.bankDetails.bank_name || "Bank"}: {m.bankDetails.bank_account_number}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              IFSC: {m.bankDetails.ifsc_code}
                            </p>
                            <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              ✓ Penny-Drop Verified
                            </span>
                          </>
                        ) : (
                          <div className="text-[10px] text-amber-700 italic pt-1">
                            ⚠️ Awaiting bank account submission by merchant
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="rounded-xl bg-slate-50 p-2.5 flex flex-col justify-between space-y-2 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Disbursement Action</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isActionPending || m.netPayable <= 0}
                            onClick={() => handleCashfreeMerchantPayout(m)}
                            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-1.5 text-[11px] font-bold text-white transition disabled:opacity-50"
                          >
                            ⚡ Cashfree IMPS
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettleModalData({ type: "merchant", item: m });
                              setSettleUtrInput(`CMS${Date.now().toString().slice(-8)}`);
                            }}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition"
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
                <span className="text-sm font-black text-slate-900">🛵 Delivery Partner UPI Withdrawals Queue</span>
                <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {pendingRiders.length} Pending
                </span>
              </div>
              <span className="text-xs text-slate-500">Disbursed via Direct UPI</span>
            </div>

            {pendingRiders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 space-y-1 shadow-2xs">
                <span className="text-2xl block">🛵</span>
                <p className="text-xs font-bold text-slate-800">All Rider Wallets are Cleared!</p>
                <p className="text-[11px]">No active rider withdrawal balances pending.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingRiders.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 hover:border-slate-300 shadow-2xs transition"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">🛵 {r.riderName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">📞 {r.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Available Balance</span>
                        <span className="text-base font-black text-emerald-600">
                          ₹{(r.amountRequested || r.walletBalance).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Registered UPI ID:</span>
                        <span className="font-mono font-bold text-amber-700 text-[11px]">{r.upiId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(r.upiId);
                          setToastMessage(`Copied UPI ID: ${r.upiId}`);
                        }}
                        className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-slate-700 font-medium"
                      >
                        📋 Copy
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() => handleCashfreeRiderPayout(r)}
                        className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-1.5 text-[11px] font-bold text-white transition"
                      >
                        ⚡ Cashfree UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSettleModalData({ type: "rider", item: r });
                          setSettleUtrInput(`UPI${Date.now().toString().slice(-8)}`);
                        }}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition"
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
      {/* ── VIEW 3: RIDER ONBOARDING & APPROVALS ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {viewMode === "riders" && (
        <RiderApprovalsPanel
          onToast={(msg) => setToastMessage(msg)}
          onPendingCountChange={(c) => setPendingRidersCount(c)}
        />
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── SETTLEMENT UTR CONFIRMATION MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {settleModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900">
                {settleModalData.type === "merchant"
                  ? `Settle Restaurant Batch: ${settleModalData.item.businessName}`
                  : `Settle Rider UPI: ${settleModalData.item.riderName}`}
              </span>
              <button
                type="button"
                onClick={() => setSettleModalData(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Payable Amount:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  ₹{Number(settleModalData.type === "merchant" ? settleModalData.item.netPayable : (settleModalData.item.amountRequested || settleModalData.item.walletBalance)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Destination:</span>
                <span className="font-mono text-slate-800">
                  {settleModalData.type === "merchant"
                    ? `${settleModalData.item.bankDetails?.bank_name || "Bank"} (${settleModalData.item.bankDetails?.bank_account_number || "A/C"})`
                    : settleModalData.item.upiId}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Bank UTR / Transaction Reference
                </label>
                <button
                  type="button"
                  onClick={() => setSettleUtrInput(`CMS${Date.now().toString().slice(-8)}`)}
                  className="text-[10px] text-amber-600 font-semibold hover:underline"
                >
                  Auto CMS UTR
                </button>
              </div>
              <input
                type="text"
                value={settleUtrInput}
                onChange={(e) => setSettleUtrInput(e.target.value)}
                placeholder="e.g. CMS928310948192 or UPI781923"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={settleActionPending}
                onClick={handleConfirmManualSettle}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-black text-white transition disabled:opacity-50 shadow-xs"
              >
                {settleActionPending ? "Marking Settled..." : "Confirm & Update Passbook ✅"}
              </button>
              <button
                type="button"
                onClick={() => setSettleModalData(null)}
                className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>🚨</span>
                <span>Cancel Order: {formatUnifiedOrderCode(cancelModalOrder.id, (cancelModalOrder as any).businesses?.name)}</span>
              </span>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-slate-800 space-y-2">
              <p className="font-bold text-rose-800">
                Have you confirmed with the customer that they are refusing the order at their doorstep?
              </p>
              <div className="space-y-1 text-[11px] text-slate-700">
                <p>• <strong>Rider Protected:</strong> Rider receives ₹35 trip fare credit in their wallet.</p>
                <p>• <strong>Fleet Unlocked:</strong> Rider becomes immediately available for new orders.</p>
                <p>• <strong>Restaurant Paid:</strong> Food preparation amount is fully credited to the restaurant.</p>
                <p>• <strong>Customer Policy:</strong> No refund applicable for doorstep refusal upon arrival.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Admin Audit Note (Cancellation Reason)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Customer refused delivery at doorstep due to delay or changed mind."
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            {actionError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-bold">
                ⚠️ {actionError}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isActionPending}
                  onClick={() => handleConfirmDoorstepCancel("admin_cancel_refund")}
                  className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-black text-white transition disabled:opacity-50 shadow-xs"
                >
                  {isActionPending ? "Processing..." : "Approve Cancel + Cashfree Refund"}
                </button>
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Back
                </button>
              </div>
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => handleConfirmDoorstepCancel("cancel_refusal")}
                className="w-full rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 py-2 text-[11px] font-black text-rose-800 transition disabled:opacity-50"
              >
                Doorstep Refusal (Credit ₹35 Rider Fee, No Refund)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
