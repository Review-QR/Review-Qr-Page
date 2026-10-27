"use client";

import { useState } from "react";
import type { ProductOrder, ProductOrderStatus } from "@/lib/product-orders/types";
import {
  updateAdminOrderStatusAction,
  recordAdminQualityCheckAction,
  dispatchAdminShipmentAction,
} from "./actions";

interface Props {
  initialOrders: ProductOrder[];
}

export default function OrdersAdminClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState<ProductOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [modalType, setModalType] = useState<"vendor" | "qc" | "ship" | "details" | null>(null);

  // Vendor Assignment Modal state
  const [vendorName, setVendorName] = useState("");
  const [vendorCost, setVendorCost] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // QC Checklist Modal state
  const [inspectorName, setInspectorName] = useState("Admin Lead");
  const [qrScannable, setQrScannable] = useState(true);
  const [correctDestinationUrl, setCorrectDestinationUrl] = useState(true);
  const [printQualityGrade, setPrintQualityGrade] = useState<"pass" | "marginal" | "fail">("pass");
  const [materialCheck, setMaterialCheck] = useState(true);
  const [packagingCheck, setPackagingCheck] = useState(true);
  const [qcNotes, setQcNotes] = useState("");

  // Courier Dispatch Modal state
  const [carrierCode, setCarrierCode] = useState<"delhivery" | "bluedart" | "dtdc" | "indiapost" | "shadowfax" | "other">("delhivery");
  const [carrierName, setCarrierName] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const biz = (order as unknown as { businesses?: { name?: string; city?: string; phone?: string } }).businesses;
      const matchBiz = biz?.name?.toLowerCase().includes(q) || biz?.city?.toLowerCase().includes(q) || biz?.phone?.includes(q);
      const matchAwb = order.shipment?.tracking_number.toLowerCase().includes(q);
      return matchId || matchBiz || matchAwb;
    }
    return true;
  });

  // Calculate statistics
  const totalOrdersCount = orders.length;
  const inProductionCount = orders.filter((o) => o.status === "in_production" || o.status === "paid" || o.status === "confirmed").length;
  const readyToShipCount = orders.filter((o) => o.status === "ready_to_ship" || o.status === "quality_check").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total_amount : 0), 0);

  function handleOpenVendorModal(order: ProductOrder) {
    setSelectedOrder(order);
    setVendorName(order.vendor_name || "");
    setVendorCost(order.vendor_cost ? String(order.vendor_cost) : "");
    setInternalNotes(order.internal_notes || "");
    setModalType("vendor");
  }

  function handleOpenQcModal(order: ProductOrder) {
    setSelectedOrder(order);
    setInspectorName("Operations Admin");
    setQrScannable(true);
    setCorrectDestinationUrl(true);
    setPrintQualityGrade("pass");
    setMaterialCheck(true);
    setPackagingCheck(true);
    setQcNotes("");
    setModalType("qc");
  }

  function handleOpenShipModal(order: ProductOrder) {
    setSelectedOrder(order);
    setCarrierCode("delhivery");
    setCarrierName("Delhivery");
    setTrackingNumber("");
    setModalType("ship");
  }

  async function handleSaveVendor() {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const costNum = vendorCost ? parseFloat(vendorCost) : undefined;
      const res = await updateAdminOrderStatusAction({
        orderId: selectedOrder.id,
        status: selectedOrder.status === "paid" ? "in_production" : selectedOrder.status,
        vendorName: vendorName.trim(),
        vendorCost: costNum,
        internalNotes: internalNotes.trim(),
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  status: o.status === "paid" ? "in_production" : o.status,
                  vendor_name: vendorName.trim(),
                  vendor_cost: costNum,
                  internal_notes: internalNotes.trim(),
                }
              : o,
          ),
        );
        setActionMessage(`Vendor details saved for ${selectedOrder.id}`);
        setModalType(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveQc() {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const res = await recordAdminQualityCheckAction({
        orderId: selectedOrder.id,
        inspectorName,
        qrScannable,
        correctDestinationUrl,
        printQualityGrade,
        materialCheck,
        packagingCheck,
        notes: qcNotes,
      });
      if (res.success) {
        const newStatus = res.passed ? "ready_to_ship" : selectedOrder.status;
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o)),
        );
        setActionMessage(
          res.passed
            ? `QC Passed! Order ${selectedOrder.id} is now Ready to Ship.`
            : `QC Failed notes recorded for ${selectedOrder.id}.`,
        );
        setModalType(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveShipment() {
    if (!selectedOrder || !trackingNumber.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await dispatchAdminShipmentAction({
        orderId: selectedOrder.id,
        carrierCode,
        carrierName,
        trackingNumber: trackingNumber.trim(),
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  status: "shipped",
                  shipment: {
                    id: "temp",
                    order_id: o.id,
                    carrier_code: carrierCode,
                    carrier_name: carrierName,
                    tracking_number: trackingNumber.trim(),
                    tracking_url: res.trackingUrl,
                    shipment_status: "in_transit",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                }
              : o,
          ),
        );
        setActionMessage(`Order ${selectedOrder.id} dispatched via ${carrierName} (AWB: ${trackingNumber})`);
        setModalType(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function downloadPrintSvg(order: ProductOrder) {
    const biz = (order as unknown as { businesses?: { name?: string; city?: string } }).businesses;
    const businessName = biz?.name || order.shipping_address?.fullName || "Trustit Merchant";
    const qrUrl = `https://trustitreview.com/r/${order.business_id}`;

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" width="1200" height="1600">
  <rect width="100%" height="100%" fill="#ffffff" />
  <rect x="60" y="60" width="1080" height="1480" rx="30" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4" />
  
  <!-- Header Bar -->
  <rect x="60" y="60" width="1080" height="260" rx="30" fill="#4f46e5" />
  <text x="600" y="160" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">TRUSTIT REVIEW</text>
  <text x="600" y="230" font-family="Arial, sans-serif" font-size="28" fill="#e0e7ff" text-anchor="middle">OFFICIAL VERIFIED BADGE</text>

  <!-- Business Name -->
  <text x="600" y="420" font-family="Arial, sans-serif" font-size="58" font-weight="bold" fill="#0f172a" text-anchor="middle">${businessName}</text>
  <text x="600" y="480" font-family="Arial, sans-serif" font-size="26" fill="#64748b" text-anchor="middle">Scan camera to leave your 5-star review</text>

  <!-- Stars -->
  <text x="600" y="550" font-family="Arial, sans-serif" font-size="44" fill="#f59e0b" text-anchor="middle">★ ★ ★ ★ ★</text>

  <!-- QR Frame -->
  <rect x="350" y="620" width="500" height="500" rx="24" fill="#0f172a" />
  <rect x="380" y="650" width="440" height="440" rx="16" fill="#ffffff" />
  <text x="600" y="880" font-family="monospace" font-size="34" font-weight="bold" fill="#0f172a" text-anchor="middle">[ QR CODE ]</text>
  <text x="600" y="930" font-family="monospace" font-size="18" fill="#475569" text-anchor="middle">${qrUrl}</text>

  <!-- Footer Instructions -->
  <text x="600" y="1220" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#1e293b" text-anchor="middle">Rate our service on Trustit &amp; Google</text>
  <text x="600" y="1270" font-family="Arial, sans-serif" font-size="22" fill="#64748b" text-anchor="middle">100% Genuine Customer Reviews</text>

  <!-- Production Watermark -->
  <text x="600" y="1480" font-family="monospace" font-size="16" fill="#94a3b8" text-anchor="middle">Print SKU: ${order.items?.[0]?.sku || "TRUSTIT-A5"} · Order Ref: ${order.id}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Trustit-Print-${order.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-1.5">
            <span>⚙️</span> Operations & Fulfillment
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Physical QR Orders Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage standee production, vendor assignments, quality checks, and courier tracking.</p>
        </div>

        {actionMessage && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{actionMessage}</span>
            <button type="button" onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900 ml-2 font-bold">✕</button>
          </div>
        )}
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Total Orders</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{totalOrdersCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Physical kits placed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-500 block uppercase tracking-wider">In Printing</span>
          <span className="text-2xl font-black text-blue-700 block mt-1">{inProductionCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Assigned to vendor</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-500 block uppercase tracking-wider">QC & Pack</span>
          <span className="text-2xl font-black text-indigo-700 block mt-1">{readyToShipCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Ready for dispatch</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-500 block uppercase tracking-wider">Total Revenue</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">₹{totalRevenue}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Net order receipts</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Orders" },
            { id: "awaiting_payment", label: "Awaiting Payment" },
            { id: "paid", label: "Paid" },
            { id: "in_production", label: "In Printing" },
            { id: "quality_check", label: "QC Pending" },
            { id: "ready_to_ship", label: "Ready to Ship" },
            { id: "shipped", label: "Shipped" },
            { id: "delivered", label: "Delivered" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, merchant, AWB..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Order ID & Date</th>
                <th className="px-4 py-4">Merchant Business</th>
                <th className="px-4 py-4">Items</th>
                <th className="px-4 py-4">Total Amount</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Vendor & Cost (Internal)</th>
                <th className="px-4 py-4">Courier / AWB</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No orders found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const biz = (order as unknown as { businesses?: { name?: string; city?: string; phone?: string } }).businesses;
                  const bizName = biz?.name || order.shipping_address?.fullName || "Merchant";
                  const bizCity = biz?.city || order.shipping_address?.city || "—";

                  const statusColors: Record<string, string> = {
                    awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
                    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    in_production: "bg-blue-50 text-blue-700 border-blue-200",
                    quality_check: "bg-indigo-50 text-indigo-700 border-indigo-200",
                    ready_to_ship: "bg-purple-50 text-purple-700 border-purple-200",
                    shipped: "bg-purple-100 text-purple-800 border-purple-300",
                    delivered: "bg-green-100 text-green-800 border-green-300",
                    cancelled: "bg-red-50 text-red-700 border-red-200",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-slate-900 block truncate max-w-[130px]">{order.id}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      {/* Business */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900 block">{bizName}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{bizCity} · PIN: {order.shipping_address?.pinCode}</span>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-800 block">
                          {order.items?.[0]?.product_title || "Standee"}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Qty: {order.items?.[0]?.quantity || 1} ({order.items?.[0]?.variant_title || "Standard"})
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <span className="font-extrabold text-slate-900 block">₹{order.total_amount}</span>
                        <span className="text-[10px] text-slate-400 block">Subtotal: ₹{order.subtotal_amount}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusColors[order.status] || "bg-slate-100 text-slate-700"}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Vendor (Internal) */}
                      <td className="px-4 py-4">
                        {order.vendor_name ? (
                          <div>
                            <span className="font-bold text-slate-800 block">{order.vendor_name}</span>
                            <span className="text-[11px] text-slate-500 block">Cost: ₹{order.vendor_cost || "0"}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Courier */}
                      <td className="px-4 py-4">
                        {order.shipment ? (
                          <div>
                            <span className="font-bold text-slate-800 block">{order.shipment.carrier_name}</span>
                            <span className="font-mono text-[10px] text-indigo-600 block">{order.shipment.tracking_number}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not dispatched</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => downloadPrintSvg(order)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold shadow-2xs"
                          title="Download High-Res SVG for Printing"
                        >
                          Print File
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenVendorModal(order)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold shadow-2xs"
                        >
                          Vendor
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenQcModal(order)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold shadow-2xs"
                        >
                          QC
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenShipModal(order)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-bold shadow-2xs"
                        >
                          Courier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VENDOR ASSIGNMENT MODAL */}
      {modalType === "vendor" && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assign Vendor & Production Cost</h3>
                <span className="font-mono text-[11px] text-slate-400">{selectedOrder.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
              🔒 Internal only: Vendor name, cost, and notes are strictly hidden from merchants via database RLS.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Printing Press / Vendor Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Apex Signage Works, Kanpur"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Production / Printing Cost (₹)</label>
                <input
                  type="number"
                  value={vendorCost}
                  onChange={(e) => setVendorCost(e.target.value)}
                  placeholder="e.g. 140"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notes for production / cutting team..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveVendor}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition"
              >
                {isSubmitting ? "Saving..." : "Save Vendor & Move to In-Production"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QC CHECKLIST MODAL */}
      {modalType === "qc" && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pre-Dispatch Quality Inspection</h3>
                <span className="font-mono text-[11px] text-slate-400">{selectedOrder.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qrScannable}
                    onChange={(e) => setQrScannable(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-800">1. QR Scanned with Phone Camera</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={correctDestinationUrl}
                    onChange={(e) => setCorrectDestinationUrl(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-800">2. Destination Matches Merchant Review Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={materialCheck}
                    onChange={(e) => setMaterialCheck(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-800">3. Acrylic / Standee Free from Scratches or Chips</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={packagingCheck}
                    onChange={(e) => setPackagingCheck(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-800">4. Double Bubble Wrap Protective Packing Completed</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Print Quality Grade</label>
                  <select
                    value={printQualityGrade}
                    onChange={(e) => setPrintQualityGrade(e.target.value as typeof printQualityGrade)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  >
                    <option value="pass">Pass (Sharp, Vivid)</option>
                    <option value="marginal">Marginal</option>
                    <option value="fail">Fail (Blurry / Smudged)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Inspector Name</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">QC Observations / Notes</label>
                <textarea
                  rows={2}
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  placeholder="Optional observations..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveQc}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition"
              >
                {isSubmitting ? "Submitting..." : "Submit Inspection (Mark Ready to Ship)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURIER DISPATCH MODAL */}
      {modalType === "ship" && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dispatch Package via Courier</h3>
                <span className="font-mono text-[11px] text-slate-400">{selectedOrder.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Courier Carrier</label>
                <select
                  value={carrierCode}
                  onChange={(e) => {
                    const code = e.target.value as typeof carrierCode;
                    setCarrierCode(code);
                    const names: Record<string, string> = {
                      delhivery: "Delhivery",
                      bluedart: "Blue Dart",
                      dtdc: "DTDC",
                      indiapost: "India Post Speed Post",
                      shadowfax: "Shadowfax",
                      other: "Local Courier",
                    };
                    setCarrierName(names[code] || "Courier");
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                >
                  <option value="delhivery">Delhivery Express</option>
                  <option value="bluedart">Blue Dart</option>
                  <option value="dtdc">DTDC</option>
                  <option value="indiapost">India Post (Speed Post)</option>
                  <option value="shadowfax">Shadowfax</option>
                  <option value="other">Other / Local Hand Delivery</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">AWB / Consignment Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 143892019482"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 block">Delivery Address:</span>
                <p>
                  {selectedOrder.shipping_address?.fullName} ({selectedOrder.shipping_address?.phone})<br />
                  {selectedOrder.shipping_address?.addressLine1}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pinCode}
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting || !trackingNumber.trim()}
                onClick={handleSaveShipment}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition"
              >
                {isSubmitting ? "Dispatching..." : "Confirm Dispatch & Notify Merchant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
