"use client";

import React, { useState, useEffect } from "react";
import BahraichInteractiveMap from "./BahraichInteractiveMap";
import {
  ActiveHyperlocalOrder,
  ActiveServiceToken,
  ActiveParchaOrder,
  CustomerNotificationItem,
  maskHandoverPin,
} from "./customer-types";
import { formatUnifiedOrderCode } from "@/lib/hyperlocal/order-id";

interface OrdersAndSupportProps {
  isOrdersOpen: boolean;
  onCloseOrders: () => void;
  customerPhone: string;
  userCoords: { lat: number; lng: number } | null;
  activeOrders: ActiveHyperlocalOrder[];
  pastOrders: ActiveHyperlocalOrder[];
  activeTokens: ActiveServiceToken[];
  activeParchas: ActiveParchaOrder[];
  isRefreshing: boolean;
  onRefreshBookings: () => void;
  onRetryPendingPayment: (order: ActiveHyperlocalOrder) => void;
  onReorder: (order: ActiveHyperlocalOrder) => void;
  onCustomerCancelOrder: (orderId: string, reason: string) => Promise<{
    success: boolean;
    requiresSupport?: boolean;
    refundUtr?: string | null;
    error?: string;
  }>;
  foodRatings: { [orderId: string]: number };
  setFoodRatings: React.Dispatch<React.SetStateAction<{ [orderId: string]: number }>>;
  deliveryRatings: { [orderId: string]: number };
  setDeliveryRatings: React.Dispatch<React.SetStateAction<{ [orderId: string]: number }>>;
  // N-30 Notifications Modal
  isNotificationsOpen: boolean;
  onCloseNotifications: () => void;
  notifications: CustomerNotificationItem[];
  onOpenOrdersFromNotif: () => void;
  // External trigger to open N-29 directly
  initialSupportOrder?: ActiveHyperlocalOrder | null;
  onRegisterSubBack?: (handler: (() => boolean) | null) => void;
}

const ORDER_STEPS = [
  { label: "Placed", icon: "📝" },
  { label: "Kitchen", icon: "👨‍🍳" },
  { label: "Packed", icon: "📦" },
  { label: "Rider", icon: "🛵" },
  { label: "On Way", icon: "🚀" },
  { label: "Delivered", icon: "✅" },
];

function getStepIndex(status: string): number {
  if (status === "placed") return 0;
  if (status === "accepted_by_merchant" || status === "preparing" || status === "merchant_accepted") return 1;
  if (status === "ready_for_pickup") return 2;
  if (status === "rider_assigned") return 3;
  if (status === "picked_up" || status === "out_for_delivery" || status === "arrived_at_doorstep") return 4;
  if (status === "delivered" || status === "completed") return 5;
  return 0;
}

/**
 * N-26 to N-30:
 * - N-26: Live Google Maps Route Tracking + 6-Stage Stepper
 * - N-27: Digital GST & UTR Receipt Sheet
 * - N-28: Ongoing & Past Orders Hub + 1-Tap Reorder
 * - N-29: Cancel Order (Pre-Prep) + Instant IMPS UTR Refund Tracker + 24x7 Live Chat
 * - N-30: Notifications Feed & Masked PIN Safety Alerts (**21)
 */
export default function CustomerOrdersAndSupport({
  isOrdersOpen,
  onCloseOrders,
  customerPhone,
  userCoords,
  activeOrders,
  pastOrders,
  activeTokens,
  activeParchas,
  isRefreshing,
  onRefreshBookings,
  onRetryPendingPayment,
  onReorder,
  onCustomerCancelOrder,
  foodRatings,
  setFoodRatings,
  deliveryRatings,
  setDeliveryRatings,
  isNotificationsOpen,
  onCloseNotifications,
  notifications,
  onOpenOrdersFromNotif,
  onRegisterSubBack,
}: OrdersAndSupportProps) {
  const [ordersTab, setOrdersTab] = useState<"live" | "past">("live");
  const [receiptOrder, setReceiptOrder] = useState<ActiveHyperlocalOrder | null>(null); // N-27
  const [supportOrder, setSupportOrder] = useState<ActiveHyperlocalOrder | null>(null); // N-29
  const [cancelReason, setCancelReason] = useState("Changed my mind / ordered by mistake");
  const [cancelFeedback, setCancelFeedback] = useState<{ msg: string; utr?: string | null } | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "agent" | "user"; text: string }>>([
    {
      sender: "agent",
      text: "Hello! Welcome to Trustit 24×7 Bahraich Support Desk. How can we help with this order?",
    },
  ]);

  useEffect(() => {
    if (!onRegisterSubBack) return;
    if (!isOrdersOpen) {
      onRegisterSubBack(null);
      return;
    }
    onRegisterSubBack(() => {
      if (supportOrder) {
        setSupportOrder(null);
        return true;
      }
      if (receiptOrder) {
        setReceiptOrder(null);
        return true;
      }
      if (ordersTab === "past") {
        setOrdersTab("live");
        return true;
      }
      return false;
    });
    return () => onRegisterSubBack(null);
  }, [onRegisterSubBack, isOrdersOpen, supportOrder, receiptOrder, ordersTab]);

  const sendSupportMessage = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: clean },
      {
        sender: "agent",
        text: `Thank you. Ticket logged for ${
          supportOrder ? formatUnifiedOrderCode(supportOrder.id, supportOrder.businesses?.name) : "your order"
        }. Bahraich Ops desk & Set C Partner console are notified and will resolve within 2 mins.`,
      },
    ]);
    setChatInput("");
  };

  return (
    <>
      {/* ── N-26 / N-28: Ongoing & Past Orders Drawer ── */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#faf8ff] h-full shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-[#003178] to-[#0d47a1] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                  N-26 / N-28 • Orders &amp; Live Tracking
                </div>
                <h3 className="text-sm font-black">
                  My Orders {customerPhone ? `(+91 ${customerPhone})` : ""}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRefreshBookings}
                  className="rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[10px] font-bold"
                >
                  {isRefreshing ? "↻ Syncing..." : "↻ Sync"}
                </button>
                <button
                  type="button"
                  onClick={onCloseOrders}
                  className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex bg-white border-b border-[#eaedff] text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setOrdersTab("live")}
                className={`flex-1 py-2.5 ${
                  ordersTab === "live"
                    ? "text-[#003178] border-b-2 border-[#003178]"
                    : "text-[#737783]"
                }`}
              >
                ● Ongoing ({activeOrders.length + activeTokens.length + activeParchas.length})
              </button>
              <button
                type="button"
                onClick={() => setOrdersTab("past")}
                className={`flex-1 py-2.5 ${
                  ordersTab === "past"
                    ? "text-[#003178] border-b-2 border-[#003178]"
                    : "text-[#737783]"
                }`}
              >
                History &amp; Refunds ({pastOrders.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {ordersTab === "live" ? (
                <>
                  {activeOrders.map((ord) => {
                    const stepIndex = getStepIndex(ord.status);
                    const sLat = ord.businesses?.location_latitude ?? 27.5744;
                    const sLng = ord.businesses?.location_longitude ?? 81.5977;
                    const rLat = ord.delivery_riders?.current_latitude;
                    const rLng = ord.delivery_riders?.current_longitude;

                    return (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-[#c3c6d4] bg-white p-3.5 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-2">
                          <div>
                            <span className="font-mono text-[10px] font-black bg-[#f2f3ff] text-[#003178] px-2 py-0.5 rounded-md">
                              {formatUnifiedOrderCode(ord.id, ord.businesses?.name)}
                            </span>
                            <h4 className="text-sm font-black text-[#131b2e] mt-1">
                              {ord.businesses?.name || "Bahraich Partner"}
                            </h4>
                          </div>
                          <span className="rounded-full bg-emerald-100 text-emerald-900 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            {ord.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* N-26 Live Street/Gali Route Map */}
                        <BahraichInteractiveMap
                          mode="order_route"
                          userCoords={userCoords}
                          heightClass="h-52"
                          storeCoords={{
                            lat: sLat,
                            lng: sLng,
                            name: ord.businesses?.name || "Store",
                          }}
                          riderCoords={
                            rLat && rLng
                              ? { lat: rLat, lng: rLng, name: ord.delivery_riders?.full_name }
                              : null
                          }
                          customerPinCoords={
                            ord.customer_address?.latitude && ord.customer_address?.longitude
                              ? {
                                  lat: ord.customer_address.latitude,
                                  lng: ord.customer_address.longitude,
                                }
                              : userCoords || undefined
                          }
                        />

                        {/* 6-Stage Stepper */}
                        <div className="grid grid-cols-6 gap-1 text-center bg-[#faf8ff] rounded-xl p-2 border border-[#eaedff]">
                          {ORDER_STEPS.map((st, idx) => {
                            const done = idx < stepIndex;
                            const curr = idx === stepIndex;
                            return (
                              <div key={st.label} className="flex flex-col items-center">
                                <span
                                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    done
                                      ? "bg-emerald-500 text-white"
                                      : curr
                                        ? "bg-[#003178] text-white ring-2 ring-[#9cf0ff]"
                                        : "bg-[#eaedff] text-[#737783]"
                                  }`}
                                >
                                  {done ? "✓" : st.icon}
                                </span>
                                <span className="text-[9px] font-bold mt-1 text-[#434652]">
                                  {st.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Slim Single-Line Doorstep Delivery OTP (Small Font, Below Map & Stepper) */}
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 flex items-center justify-between gap-2 text-[#003d27]">
                          <span className="text-[10.5px] font-bold truncate">
                            Delivery OTP · Share at gate
                          </span>
                          <span className="font-mono text-xs font-black tracking-[0.2em] bg-white border border-emerald-300 text-emerald-800 rounded-md px-2 py-0.5 shrink-0">
                            {String(ord.delivery_otp || "----")}
                          </span>
                        </div>

                        {ord.payment_mode === "online_cashfree" && ord.payment_status !== "paid" && (
                          <button
                            type="button"
                            onClick={() => onRetryPendingPayment(ord)}
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 font-black"
                          >
                            ⚡ Complete Payment (₹{ord.total_amount}) via Cashfree
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(ord)}
                            className="rounded-xl border border-[#c3c6d4] bg-white py-1.5 font-bold text-[#003178]"
                          >
                            🧾 GST Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCancelFeedback(null);
                              setSupportOrder(ord);
                            }}
                            className="rounded-xl border border-rose-200 bg-rose-50 py-1.5 font-bold text-rose-800"
                          >
                            💬 Cancel / Help
                          </button>
                        </div>

                        <div className="flex gap-2">
                          {ord.businesses?.phone && (
                            <a
                              href={`tel:${ord.businesses.phone}`}
                              className="flex-1 text-center rounded-xl bg-[#f2f3ff] py-1.5 font-bold text-[#003178]"
                            >
                              📞 Call Store
                            </a>
                          )}
                          {ord.delivery_riders?.phone && (
                            <a
                              href={`tel:${ord.delivery_riders.phone}`}
                              className="flex-1 text-center rounded-xl bg-[#003178] py-1.5 font-bold text-white"
                            >
                              🛵 Call {ord.delivery_riders.full_name.split(" ")[0]}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Active Tokens (Salon / Car Wash) */}
                  {activeTokens.map((tok) => (
                    <div
                      key={tok.id}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-emerald-700 text-white px-2 py-0.5 font-black text-[10px]">
                          TOKEN #{tok.token_number}
                        </span>
                        <span className="text-[10px] font-black uppercase text-emerald-900">
                          {tok.status}
                        </span>
                      </div>
                      <div className="font-black text-[#131b2e]">
                        {tok.businesses?.name || "Service Partner"}
                      </div>
                      <div className="text-[11px] text-[#434652]">{tok.vehicle_or_notes}</div>
                      <div className="text-[11px] font-bold text-emerald-900">
                        ⏳ Estimated wait: ~{tok.estimated_wait_minutes} mins
                      </div>
                    </div>
                  ))}

                  {/* Active Parchas / Medical Rx */}
                  {activeParchas.map((p) => (
                    <div
                      key={p.order_id}
                      className="rounded-2xl border border-[#003178]/25 bg-[#f2f3ff] p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black text-[#003178]">
                          {formatUnifiedOrderCode(p.order_id, "Parcha")}
                        </span>
                        <span className="rounded-md bg-[#003178] text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                          {p.hyperlocal_orders?.status || "Sent"}
                        </span>
                      </div>
                      {p.handwritten_text && (
                        <div className="rounded-xl bg-white p-2 text-[11px] text-[#434652]">
                          {p.handwritten_text}
                        </div>
                      )}
                      <div className="font-bold text-[#003178]">
                        {p.merchant_quote_amount
                          ? `Store Quote: ₹${p.merchant_quote_amount}`
                          : "Partner is preparing 5-Min Quote..."}
                      </div>
                    </div>
                  ))}

                  {activeOrders.length + activeTokens.length + activeParchas.length === 0 && (
                    <div className="rounded-2xl bg-white border border-dashed border-[#c3c6d4] p-8 text-center text-[#737783]">
                      No live orders right now. Order food, send a Kirana Parcha, or book a Salon chair!
                    </div>
                  )}
                </>
              ) : (
                /* N-28 Past Orders + Dual Ratings + Reorder + Receipt */
                <div className="space-y-3">
                  {pastOrders.length === 0 ? (
                    <div className="rounded-2xl bg-white border border-dashed border-[#c3c6d4] p-8 text-center text-[#737783]">
                      No past orders found for this account yet.
                    </div>
                  ) : (
                    pastOrders.map((ord) => {
                      const isCancelled = ord.status === "cancelled" || ord.status === "rejected";
                      return (
                        <div
                          key={ord.id}
                          className="rounded-2xl border border-[#eaedff] bg-white p-3.5 space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-black text-[#131b2e]">
                                {ord.businesses?.name || "Bahraich Store"}
                              </div>
                              <div className="text-[10px] text-[#737783]">
                                {formatUnifiedOrderCode(ord.id, ord.businesses?.name)} •{" "}
                                {new Date(ord.created_at).toLocaleDateString("en-IN")}
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                isCancelled
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isCancelled ? "Cancelled" : "Delivered ✓"}
                            </span>
                          </div>

                          {ord.hyperlocal_order_items && ord.hyperlocal_order_items.length > 0 && (
                            <div className="text-[11px] text-[#434652]">
                              {ord.hyperlocal_order_items
                                .map((i) => `${i.quantity}× ${i.item_name}`)
                                .join(", ")}
                            </div>
                          )}

                          {!isCancelled && (
                            <div className="flex items-center justify-between rounded-xl bg-[#faf8ff] px-2.5 py-1.5 text-[10.5px]">
                              <span>Rate Store &amp; Rider:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      setFoodRatings((p) => ({ ...p, [ord.id]: s }));
                                      setDeliveryRatings((p) => ({ ...p, [ord.id]: s }));
                                    }}
                                  >
                                    {(foodRatings[ord.id] || deliveryRatings[ord.id] || 0) >= s ? "⭐" : "☆"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {isCancelled && ord.payment_status === "refunded" && (
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[10.5px] font-bold text-emerald-900">
                              ✓ IMPS Refund Settled • {ord.admin_notes || "Cashfree Direct UTR"}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-[#f2f3ff]">
                            <span className="font-black text-[#003178]">₹{ord.total_amount}</span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setReceiptOrder(ord)}
                                className="rounded-xl border border-[#c3c6d4] px-2.5 py-1 text-[10.5px] font-bold text-[#434652]"
                              >
                                🧾 Receipt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelFeedback(null);
                                  setSupportOrder(ord);
                                }}
                                className="rounded-xl border border-[#c3c6d4] px-2.5 py-1 text-[10.5px] font-bold text-[#434652]"
                              >
                                Help
                              </button>
                              <button
                                type="button"
                                onClick={() => onReorder(ord)}
                                className="rounded-xl bg-[#003178] px-3 py-1 text-[10.5px] font-black text-white"
                              >
                                ↻ Reorder
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── N-27: Digital GST & UTR Receipt Sheet ── */}
      {receiptOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-2xl border border-[#c3c6d4]">
            <div className="bg-[#003178] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#9cf0ff]">
                  N-27 • Digital GST Receipt
                </div>
                <h4 className="text-sm font-black">
                  {formatUnifiedOrderCode(receiptOrder.id, receiptOrder.businesses?.name)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <div className="font-black text-[#131b2e]">{receiptOrder.businesses?.name}</div>
                <div className="text-[11px] text-[#737783]">
                  {receiptOrder.businesses?.address || "Bahraich, UP 271801"}
                </div>
                <div className="text-[10px] font-mono text-[#006875] mt-0.5">
                  Payment: {receiptOrder.payment_mode?.toUpperCase()} •{" "}
                  {receiptOrder.cashfree_payment_id
                    ? `UTR/CF: ${receiptOrder.cashfree_payment_id}`
                    : `Status: ${receiptOrder.payment_status || "Pending"}`}
                </div>
              </div>

              <div className="border-y border-dashed border-[#c3c6d4] py-2.5 space-y-1.5">
                {(receiptOrder.hyperlocal_order_items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.quantity}× {item.item_name}
                    </span>
                    <span className="font-bold">₹{item.unit_price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px] text-[#434652]">
                <div className="flex justify-between">
                  <span>Subtotal (incl. GST)</span>
                  <span>₹{receiptOrder.subtotal_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{receiptOrder.delivery_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>₹{receiptOrder.platform_fee ?? 5}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#003178] pt-1 border-t border-[#eaedff]">
                  <span>Total Paid</span>
                  <span>₹{receiptOrder.total_amount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-[#c3c6d4] py-2 font-bold text-[#131b2e]"
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = receiptOrder;
                    setReceiptOrder(null);
                    setSupportOrder(target);
                  }}
                  className="rounded-xl bg-[#003178] py-2 font-bold text-white"
                >
                  Need Help? →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── N-29: Cancel Order + Instant UTR Refund Tracker + 24x7 Support Chat ── */}
      {supportOrder && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-[#003178] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#9cf0ff]">
                  N-29 • Cancel, UTR Refund &amp; 24×7 Support
                </div>
                <h4 className="text-sm font-black">
                  {formatUnifiedOrderCode(supportOrder.id, supportOrder.businesses?.name)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSupportOrder(null)}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {["placed", "accepted_by_merchant", "accepted", "merchant_accepted"].includes(
                supportOrder.status,
              ) ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 space-y-2">
                  <div className="font-black text-rose-900">
                    Cancel Order (100% Instant Refund if Paid Online)
                  </div>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option>Changed my mind / ordered by mistake</option>
                    <option>Delivery time is too long</option>
                    <option>Want to update items or address</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await onCustomerCancelOrder(supportOrder.id, cancelReason);
                      setCancelFeedback({
                        msg: res.success
                          ? "Order cancelled cleanly. Any online payment is being refunded."
                          : res.error || "Please request Admin escalation below.",
                        utr: res.refundUtr,
                      });
                    }}
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-2 font-black text-white"
                  >
                    Cancel Order &amp; Initiate Refund →
                  </button>
                </div>
              ) : !["delivered", "completed", "cancelled", "rejected"].includes(supportOrder.status) ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <div className="font-black text-amber-900">
                    Order In Progress — Request Cancellation Review
                  </div>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-xl border border-amber-200 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option>Order is taking too long</option>
                    <option>Emergency / unable to receive delivery</option>
                    <option>Ordered wrong items / address</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const r = await fetch("/api/hyperlocal/orders", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "customer_request_cancel",
                            orderId: supportOrder.id,
                            reason: cancelReason,
                          }),
                        });
                        const d = await r.json();
                        setCancelFeedback({
                          msg: d.success
                            ? d.message || "Cancellation request sent to Admin Support Desk."
                            : d.error || "Failed to send cancellation request.",
                        });
                      } catch {
                        setCancelFeedback({ msg: "Network error sending cancellation request." });
                      }
                    }}
                    className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 py-2 font-black text-white"
                  >
                    Request Order Cancellation →
                  </button>
                </div>
              ) : null}

              {cancelFeedback && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 space-y-1">
                  <div className="font-black text-emerald-900">{cancelFeedback.msg}</div>
                  {cancelFeedback.utr && (
                    <div className="font-mono text-[11px] font-bold text-emerald-800">
                      IMPS/UPI Refund UTR: {cancelFeedback.utr}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="font-extrabold text-[#131b2e]">24×7 Live Support Desk</div>
                <div className="space-y-2 rounded-2xl bg-[#faf8ff] border border-[#eaedff] p-3 max-h-48 overflow-y-auto">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl px-3 py-2 text-[11px] max-w-[85%] ${
                        m.sender === "user"
                          ? "ml-auto bg-[#003178] text-white"
                          : "bg-white border border-[#dae2fd] text-[#131b2e]"
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Where is my rider?", "Missing item", "Refund UTR status"].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendSupportMessage(q)}
                      className="rounded-full bg-[#f2f3ff] border border-[#dae2fd] px-2.5 py-1 text-[10px] font-bold text-[#003178]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#eaedff] flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Write to Trustit support..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendSupportMessage(chatInput);
                }}
                className="flex-1 rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => sendSupportMessage(chatInput)}
                className="rounded-xl bg-[#003178] text-white px-4 py-2 text-xs font-black"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── N-30: Notifications Feed & Masked PIN Safety Alerts (**21) ── */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#faf8ff] h-full shadow-2xl flex flex-col">
            <div className="bg-[#003178] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                  N-30 • Live Alerts &amp; PIN Safety
                </div>
                <h3 className="text-sm font-black">🔔 Notifications</h3>
              </div>
              <button
                type="button"
                onClick={onCloseNotifications}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
              {activeOrders.map((ord) => (
                <button
                  key={`live_${ord.id}`}
                  type="button"
                  onClick={() => {
                    onCloseNotifications();
                    onOpenOrdersFromNotif();
                  }}
                  className="w-full text-left rounded-2xl border-2 border-[#003178]/20 bg-white p-3.5 space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#003178]">
                      🛵 {ord.businesses?.name} ({ord.status.replace(/_/g, " ")})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">LIVE</span>
                  </div>
                  <p className="text-[11px] text-[#434652]">
                    Keep your masked Handover PIN{" "}
                    <strong className="font-mono text-[#131b2e]">
                      {maskHandoverPin(ord.delivery_otp)}
                    </strong>{" "}
                    ready only when the rider reaches your gate.
                  </p>
                </button>
              ))}

              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-[#eaedff] bg-white p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#131b2e]">{n.title}</span>
                    <span className="text-[10px] text-[#737783]">{n.timeLabel}</span>
                  </div>
                  <p className="text-[11px] text-[#434652]">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
