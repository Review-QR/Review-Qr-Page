"use client";

import React, { useState, useEffect, useRef } from "react";
import BahraichInteractiveMap from "./BahraichInteractiveMap";
import { stripGooglePlusCode } from "@/lib/hyperlocal/address-format";
import { TrustitNative } from "@/lib/native/trustit-native-service";
import {
  CartLineItem,
  CustomerSavedAddress,
  DetectedGpsLocation,
  OutOfStockRule,
  SCHEDULE_TIME_SLOTS,
  SuperAppBusiness,
  CustomerLanguage,
  t,
} from "./customer-types";

interface CheckoutAndAddressesProps {
  lang: CustomerLanguage;
  // Single-store conflict guard
  cartConflictPrompt: { pendingStoreName: string; currentStoreName: string } | null;
  onConfirmReplaceCart: () => void;
  onCancelReplaceCart: () => void;
  // N-20 & N-23 Checkout Sheet
  isCheckoutOpen: boolean;
  onCloseCheckout: () => void;
  cartStore: SuperAppBusiness | null;
  cartItemsList: CartLineItem[];
  onUpdateCartQty: (cartKey: string, delta: number) => void;
  onClearCart: () => void;
  outOfStockRule: OutOfStockRule;
  setOutOfStockRule: (r: OutOfStockRule) => void;
  storeNote: string;
  setStoreNote: (v: string) => void;
  deliveryScheduleSlot: string;
  setDeliveryScheduleSlot: (v: string) => void;
  riderTip: number;
  setRiderTip: (n: number) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  grandTotal: number;
  paymentMethodChoice: "online_cashfree" | "cod";
  setPaymentMethodChoice: (m: "online_cashfree" | "cod") => void;
  customerAddress: string;
  savedAddresses: CustomerSavedAddress[];
  selectedAddressId: string;
  onSelectAddress: (addr: CustomerSavedAddress) => void;
  onOpenAddressManager: () => void;
  onPlaceOrder: (selectedUpiAppId?: string) => void;
  isSubmitting: boolean;
  isPaymentLaunching: boolean;
  // N-21 & N-22 Saved Addresses & Dropoff Pin Modal
  isAddressModalOpen: boolean;
  onCloseAddressModal: () => void;
  customerId: string;
  userCoords: { lat: number; lng: number } | null;
  onSaveAddressRecord: (payload: {
    tag: "Home" | "Work" | "Other";
    houseNo: string;
    mohalla: string;
    road: string;
    pincode: string;
    district: string;
    lat?: number;
    lng?: number;
  }) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onUseGpsForPin: () => Promise<DetectedGpsLocation | null>;
  onRegisterSubBack?: (handler: (() => boolean) | null) => void;
  // N-24 Payment Retry (08:42 Stock Hold)
  paymentRetryState: {
    orderId: string;
    amount: number;
    storeName: string;
    reason: string;
    hostedPayUrl?: string;
  } | null;
  onRetryCashfree: (orderId: string) => void;
  onSwitchOrderToCod: (orderId: string) => void;
  onDismissPaymentRetry: () => void;
  // N-25 Order Placed Confirmation + 4-Digit Handover PIN
  confirmedOrderOverlay: {
    orderId: string;
    displayCode: string;
    storeName: string;
    deliveryOtp: string;
    paymentLabel: string;
  } | null;
  onTrackConfirmedOrder: () => void;
  onCloseConfirmedOverlay: () => void;
}

/**
 * N-20 to N-25:
 * - Single-Store Cart Replacement Guard
 * - N-20: Single-Order Cart + Out-of-Stock Rules + Store Notes
 * - N-21: Saved Bahraich Addresses Book + Mohalla Search
 * - N-22: Adjust Dropoff Gate Pin on Map
 * - N-23: Checkout (Meet at Gate + Schedule + Tip + Cashfree 1-Tap UPI / COD)
 * - N-24: Payment Failed & 08:42 Stock Hold Retry
 * - N-25: Order Placed Confirmation Ring + 4-Digit Handover PIN
 */
export default function CustomerCheckoutAndAddresses({
  lang,
  cartConflictPrompt,
  onConfirmReplaceCart,
  onCancelReplaceCart,
  isCheckoutOpen,
  onCloseCheckout,
  cartStore,
  cartItemsList,
  onUpdateCartQty,
  onClearCart,
  outOfStockRule,
  setOutOfStockRule,
  storeNote,
  setStoreNote,
  deliveryScheduleSlot,
  setDeliveryScheduleSlot,
  riderTip,
  setRiderTip,
  promoCode,
  setPromoCode,
  subtotal,
  deliveryFee,
  platformFee,
  grandTotal,
  paymentMethodChoice,
  setPaymentMethodChoice,
  customerAddress,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onOpenAddressManager,
  onPlaceOrder,
  isSubmitting,
  isPaymentLaunching,
  isAddressModalOpen,
  onCloseAddressModal,
  userCoords,
  onSaveAddressRecord,
  onDeleteAddress,
  onUseGpsForPin,
  onRegisterSubBack,
  paymentRetryState,
  onRetryCashfree,
  onSwitchOrderToCod,
  onDismissPaymentRetry,
  confirmedOrderOverlay,
  onTrackConfirmedOrder,
  onCloseConfirmedOverlay,
}: CheckoutAndAddressesProps) {
  const [addressTab, setAddressTab] = useState<"saved" | "add_form" | "pin_map">("saved");
  const [newTag, setNewTag] = useState<"Home" | "Work" | "Other">("Home");
  const [houseNo, setHouseNo] = useState("");
  const [mohalla, setMohalla] = useState("");
  const [road, setRoad] = useState("");
  const [pincode, setPincode] = useState("271801");
  const [district, setDistrict] = useState("Bahraich");
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | undefined>(userCoords || undefined);
  const [mohallaSuggestions, setMohallaSuggestions] = useState<
    Array<{ name: string; area: string; lat: number; lng: number; pincode: string }>
  >([]);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [holdSeconds, setHoldSeconds] = useState(522); // 08:42 stock hold timer for N-24
  const [isAutoDetectingAddr, setIsAutoDetectingAddr] = useState(false);
  const [isLocalSubmitLocked, setIsLocalSubmitLocked] = useState(false);
  const [installedUpiApps, setInstalledUpiApps] = useState<
    Array<{ appId: string; displayName: string; icon?: string }>
  >([]);
  const [selectedUpiAppId, setSelectedUpiAppId] = useState<string>("");
  const submitGuardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    TrustitNative.getInstalledUpiApps()
      .then((apps) => {
        if (apps && apps.length > 0) {
          setInstalledUpiApps(apps);
          const phonepe = apps.find((a) => a.appId.includes("phonepe"));
          const gpay = apps.find(
            (a) => a.appId.includes("paisa") || a.appId.includes("gpay")
          );
          if (phonepe) {
            setSelectedUpiAppId(phonepe.appId);
          } else if (gpay) {
            setSelectedUpiAppId(gpay.appId);
          } else {
            setSelectedUpiAppId(apps[0].appId);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSubmitting && !isPaymentLaunching) {
      setIsLocalSubmitLocked(false);
    }
  }, [isSubmitting, isPaymentLaunching]);

  useEffect(() => {
    return () => {
      if (submitGuardTimerRef.current) clearTimeout(submitGuardTimerRef.current);
    };
  }, []);

  const handleCheckoutButtonClick = () => {
    if (isSubmitting || isPaymentLaunching || isLocalSubmitLocked) return;
    setIsLocalSubmitLocked(true);
    if (submitGuardTimerRef.current) clearTimeout(submitGuardTimerRef.current);
    submitGuardTimerRef.current = setTimeout(() => {
      setIsLocalSubmitLocked(false);
    }, 1500);
    onPlaceOrder(paymentMethodChoice === "online_cashfree" ? selectedUpiAppId || undefined : undefined);
  };

  const handleOpenHostedPaymentUrl = async (rawUrl: string) => {
    let targetUrl = rawUrl;
    const isCapacitorOrLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        Boolean((window as any).Capacitor?.isNativePlatform?.()));
    if (isCapacitorOrLocalhost && !targetUrl.includes("fromApp=1")) {
      targetUrl += `${targetUrl.includes("?") ? "&" : "?"}fromApp=1`;
    }
    try {
      const res = await TrustitNative.openInAppCheckout(targetUrl);
      if (res?.opened) return;
    } catch {}
    if (!isCapacitorOrLocalhost) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (!onRegisterSubBack) return;
    if (!isAddressModalOpen) {
      onRegisterSubBack(null);
      return;
    }
    onRegisterSubBack(() => {
      if (addressTab !== "saved") {
        setAddressTab("saved");
        return true;
      }
      return false;
    });
    return () => onRegisterSubBack(null);
  }, [onRegisterSubBack, isAddressModalOpen, addressTab]);

  const handleAutoFillAddForm = async () => {
    setIsAutoDetectingAddr(true);
    try {
      const gps = await onUseGpsForPin();
      if (gps) {
        setPinCoords({ lat: gps.lat, lng: gps.lng });
        const cleanMohalla = stripGooglePlusCode(gps.mohalla || gps.locationName || gps.street);
        const cleanFormatted = stripGooglePlusCode(gps.formattedAddress);
        const cleanLandmark = stripGooglePlusCode(gps.landmark);
        if (cleanMohalla) {
          setMohalla(cleanMohalla);
        } else if (cleanFormatted) {
          setMohalla(cleanFormatted);
        }
        const landmarkVal =
          cleanLandmark && cleanLandmark.toLowerCase() !== cleanMohalla.toLowerCase()
            ? cleanLandmark
            : cleanFormatted && cleanFormatted.toLowerCase() !== cleanMohalla.toLowerCase()
              ? cleanFormatted
              : "";
        setRoad(landmarkVal);
        if (gps.pincode) setPincode(gps.pincode);
        if (gps.city) setDistrict(gps.city);
      }
    } finally {
      setIsAutoDetectingAddr(false);
    }
  };

  useEffect(() => {
    if (!paymentRetryState) {
      setHoldSeconds(522);
      return;
    }
    const timer = setInterval(() => {
      setHoldSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentRetryState]);

  const holdMins = String(Math.floor(holdSeconds / 60)).padStart(2, "0");
  const holdSecs = String(holdSeconds % 60).padStart(2, "0");

  const handleMohallaSearch = async (val: string) => {
    setMohalla(val);
    if (val.trim().length < 2) {
      setMohallaSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/hyperlocal/directions?query=${encodeURIComponent(val.trim())}`);
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d.suggestions)) setMohallaSuggestions(d.suggestions);
      }
    } catch {}
  };

  return (
    <>
      {/* ── Single-Store Cart Replacement Guard Modal ── */}
      {cartConflictPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 space-y-3.5 shadow-2xl border border-[#c3c6d4]">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#006875]">
              Single-Store Order Rule
            </div>
            <h4 className="text-base font-black text-[#131b2e]">Replace current cart?</h4>
            <p className="text-xs text-[#434652] leading-relaxed">
              Your cart currently contains items from <strong>{cartConflictPrompt.currentStoreName}</strong>.
              Trustit uses clean Single-Store orders for faster 25-min delivery. Clear it and add from{" "}
              <strong>{cartConflictPrompt.pendingStoreName}</strong>?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onCancelReplaceCart}
                className="rounded-2xl border border-[#c3c6d4] py-2.5 text-xs font-bold text-[#434652]"
              >
                Keep Current
              </button>
              <button
                type="button"
                onClick={onConfirmReplaceCart}
                className="rounded-2xl bg-[#003178] text-white py-2.5 text-xs font-black"
              >
                Replace Cart →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── N-20 & N-23: Single-Order Cart + Checkout Summary ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#faf8ff] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#c3c6d4]/60">
            <div className="bg-gradient-to-r from-[#003178] to-[#0d47a1] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                  N-20 / N-23 • Single-Store Checkout
                </div>
                <h3 className="text-sm font-black truncate max-w-[260px]">
                  {cartStore?.name || "Your Trustit Order"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {cartItemsList.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="rounded-lg bg-white/15 hover:bg-rose-500/80 px-2 py-1 text-[10px] font-bold"
                  >
                    🗑️ Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCloseCheckout}
                  className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {cartItemsList.length === 0 ? (
                <div className="rounded-2xl bg-white border border-[#eaedff] p-6 text-center space-y-2">
                  <div className="text-3xl">🛒</div>
                  <div className="font-black text-[#131b2e]">Your Single-Store Cart is Empty</div>
                  <button
                    type="button"
                    onClick={onCloseCheckout}
                    className="rounded-xl bg-[#003178] text-white px-4 py-2 text-xs font-bold"
                  >
                    Browse Bahraich Stores
                  </button>
                </div>
              ) : (
                <>
                  {/* N-20 Cart Items */}
                  <div className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#131b2e]">
                        Order Items ({cartItemsList.reduce((s, l) => s + l.quantity, 0)})
                      </span>
                      <span className="rounded-full bg-[#f2f3ff] px-2 py-0.5 text-[10px] font-bold text-[#003178]">
                        1-Shop Single Order
                      </span>
                    </div>

                    {cartItemsList.map((line) => (
                      <div
                        key={line.cartKey}
                        className="flex items-center justify-between gap-2 pt-2 border-t border-[#f2f3ff]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[#131b2e] truncate">{line.item.name}</div>
                          {line.customization && (
                            <div className="text-[10px] text-[#737783] truncate">
                              {line.customization.portion === "half" ? "Half" : "Full"}
                              {line.customization.addons.length > 0
                                ? ` + ${line.customization.addons.map((a) => a.name).join(", ")}`
                                : ""}
                            </div>
                          )}
                          <div className="text-[11px] font-extrabold text-[#003178]">
                            ₹{line.itemUnitPrice * line.quantity}
                          </div>
                        </div>

                        <div className="flex items-center rounded-xl border border-[#003178]/30 bg-[#f2f3ff]">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(line.cartKey, -1)}
                            className="px-2.5 py-1 font-black text-[#003178]"
                          >
                            −
                          </button>
                          <span className="px-2 font-black text-[#131b2e]">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(line.cartKey, 1)}
                            className="px-2.5 py-1 font-black text-[#003178]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* N-20 Out-of-Stock Substitution & Store Note */}
                  <div className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-2.5">
                    <div className="font-extrabold text-[#131b2e]">If an item is out of stock:</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "call_me" as const, label: "📞 Call me" },
                        { id: "replace_similar" as const, label: "🔄 Replace" },
                        { id: "refund_item" as const, label: "💸 Refund" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setOutOfStockRule(opt.id)}
                          className={`rounded-xl border py-1.5 px-2 text-[10.5px] font-bold ${
                            outOfStockRule === opt.id
                              ? "bg-[#003178] text-white border-[#003178]"
                              : "bg-[#faf8ff] text-[#434652] border-[#c3c6d4]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add store / kitchen note (e.g. Less spicy, extra raita)..."
                      value={storeNote}
                      onChange={(e) => setStoreNote(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs outline-none focus:border-[#003178]"
                    />
                  </div>

                  {/* N-21 / N-23 Delivery Address & Gate Handover Rule (NO Leave at Door!) */}
                  <div className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#131b2e]">📍 Meet at Gate Delivery</span>
                      <button
                        type="button"
                        onClick={onOpenAddressManager}
                        className="text-[11px] font-bold text-[#003178] hover:underline"
                      >
                        Change / Pin Map ›
                      </button>
                    </div>

                    {savedAddresses.length > 0 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => onSelectAddress(addr)}
                            className={`shrink-0 rounded-xl border px-2.5 py-1 text-[10.5px] font-bold ${
                              selectedAddressId === addr.id
                                ? "bg-[#f2f3ff] border-[#003178] text-[#003178]"
                                : "bg-white border-[#c3c6d4] text-[#434652]"
                            }`}
                          >
                            {addr.tag || addr.label || "Home"}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="rounded-xl bg-[#f2f3ff] px-3 py-2 text-[11px] font-semibold text-[#131b2e]">
                      {stripGooglePlusCode(customerAddress) || "Tap 'Change / Pin Map' to verify your delivery address"}
                    </div>

                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[10.5px] font-bold text-emerald-900">
                      📞 Call on Arrival &amp; 4-Digit Handover PIN Required (No unattended door drops)
                    </div>
                  </div>

                  {/* N-23 Standard vs Schedule Delivery Time Sheet */}
                  <div className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#131b2e]">🕒 Delivery Timing</span>
                      <button
                        type="button"
                        onClick={() => setShowSchedulePicker((v) => !v)}
                        className="text-[11px] font-bold text-[#006875] hover:underline"
                      >
                        {showSchedulePicker ? "Hide Slots" : "Schedule Later ▾"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryScheduleSlot("standard_25m");
                          setShowSchedulePicker(false);
                        }}
                        className={`rounded-xl border p-2 text-left ${
                          deliveryScheduleSlot === "standard_25m"
                            ? "border-[#003178] bg-[#f2f3ff]"
                            : "border-[#c3c6d4]"
                        }`}
                      >
                        <div className="font-black text-[#131b2e]">⚡ Standard</div>
                        <div className="text-[10px] text-[#006875] font-bold">20 – 35 mins</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSchedulePicker(true)}
                        className={`rounded-xl border p-2 text-left ${
                          deliveryScheduleSlot !== "standard_25m"
                            ? "border-[#003178] bg-[#f2f3ff]"
                            : "border-[#c3c6d4]"
                        }`}
                      >
                        <div className="font-black text-[#131b2e]">📅 Scheduled</div>
                        <div className="text-[10px] text-[#434652] truncate">
                          {deliveryScheduleSlot === "standard_25m"
                            ? "Pick Today / Tomorrow"
                            : SCHEDULE_TIME_SLOTS.find((s) => s.id === deliveryScheduleSlot)?.label ||
                              deliveryScheduleSlot}
                        </div>
                      </button>
                    </div>

                    {showSchedulePicker && (
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {SCHEDULE_TIME_SLOTS.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => {
                              setDeliveryScheduleSlot(slot.id);
                              setShowSchedulePicker(false);
                            }}
                            className={`rounded-xl border px-3 py-2 text-left text-[11px] font-bold ${
                              deliveryScheduleSlot === slot.id
                                ? "bg-[#003178] text-white border-[#003178]"
                                : "bg-[#faf8ff] text-[#131b2e] border-[#eaedff]"
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rider Tip & Promo */}
                  <div className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#131b2e]">🛵 Thank Your Bahraich Rider</span>
                      <span className="text-[10px] font-bold text-emerald-700">100% goes to rider</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 10, 20, 50].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRiderTip(amt)}
                          className={`rounded-xl border py-1.5 font-extrabold text-xs ${
                            riderTip === amt
                              ? "bg-[#003178] text-white border-[#003178]"
                              : "bg-[#faf8ff] text-[#131b2e] border-[#c3c6d4]"
                          }`}
                        >
                          {amt === 0 ? "No Tip" : `₹${amt}`}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Promo code (e.g. TRUSTIT50)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1 rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[10px] font-bold text-emerald-800">
                        {promoCode === "TRUSTIT50" ? "✓ Applied" : "Try TRUSTIT50"}
                      </span>
                    </div>
                  </div>

                  {/* Bill Breakdown & Payment Method */}
                  <div className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-2">
                    <div className="font-extrabold text-[#131b2e]">Bill Summary</div>
                    <div className="flex justify-between text-[#434652]">
                      <span>Item Subtotal</span>
                      <span className="font-bold text-[#131b2e]">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#434652]">
                      <span>Delivery Fee (Free ≥ ₹499)</span>
                      <span className="font-bold text-[#131b2e]">
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#434652]">
                      <span>Platform Fee</span>
                      <span className="font-bold text-[#131b2e]">₹{platformFee}</span>
                    </div>
                    {riderTip > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Rider Tip Note (Doorstep Appreciation)</span>
                        <span>+₹{riderTip}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[#eaedff] pt-2 text-sm font-black text-[#003178]">
                      <span>Payable Order Total</span>
                      <span>₹{grandTotal}</span>
                    </div>

                    {/* Blinkit-Style Payment Mode Selection */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold text-[#434652] uppercase tracking-wider">
                        Select Payment Option
                      </div>

                      {/* Online UPI Apps Section */}
                      <div className="rounded-2xl border border-[#eaedff] bg-slate-50/70 p-2.5 space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-black text-[#131b2e] flex items-center gap-1.5">
                            ⚡ Pay using UPI
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Direct Bank Handoff
                          </span>
                        </div>

                        {installedUpiApps.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {installedUpiApps.slice(0, 4).map((app) => {
                              const isSelected =
                                paymentMethodChoice === "online_cashfree" &&
                                selectedUpiAppId === app.appId;
                              return (
                                <button
                                  key={app.appId}
                                  type="button"
                                  onClick={() => {
                                    setPaymentMethodChoice("online_cashfree");
                                    setSelectedUpiAppId(app.appId);
                                  }}
                                  className={`flex items-center justify-between rounded-xl p-2.5 text-left transition border ${
                                    isSelected
                                      ? "border-[#003178] bg-[#f2f3ff] ring-2 ring-[#003178]/30 shadow-xs"
                                      : "border-[#c3c6d4]/50 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {app.icon ? (
                                      <img
                                        src={`data:image/png;base64,${app.icon}`}
                                        alt={app.displayName}
                                        className="h-6 w-6 rounded-md object-contain shrink-0"
                                      />
                                    ) : (
                                      <div className="h-6 w-6 rounded-md bg-[#003178] text-white flex items-center justify-center text-[10px] font-bold">
                                        UPI
                                      </div>
                                    )}
                                    <div className="font-bold text-[#131b2e] text-xs">
                                      {app.displayName} UPI
                                    </div>
                                  </div>
                                  <div
                                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                      isSelected
                                        ? "border-[#003178] bg-[#003178]"
                                        : "border-[#737783]"
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethodChoice("online_cashfree");
                              setSelectedUpiAppId("");
                            }}
                            className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left transition border ${
                              paymentMethodChoice === "online_cashfree"
                                ? "border-[#003178] bg-[#f2f3ff] ring-2 ring-[#003178]/30 shadow-xs"
                                : "border-[#c3c6d4]/50 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">⚡</span>
                              <div>
                                <div className="font-bold text-[#003178] text-xs">
                                  UPI Intent (Google Pay, PhonePe, Paytm)
                                </div>
                                <div className="text-[10px] text-[#434652]">
                                  Direct app-to-app UPI payment
                                </div>
                              </div>
                            </div>
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                paymentMethodChoice === "online_cashfree"
                                  ? "border-[#003178] bg-[#003178]"
                                  : "border-[#737783]"
                              }`}
                            >
                              {paymentMethodChoice === "online_cashfree" && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Cash on Delivery Option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethodChoice("cod")}
                        className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left transition border ${
                          paymentMethodChoice === "cod"
                            ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-500/30 shadow-xs"
                            : "border-[#c3c6d4]/50 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">💵</span>
                          <div>
                            <div className="font-bold text-[#131b2e] text-xs">
                              Cash on Delivery (COD)
                            </div>
                            <div className="text-[10px] text-[#434652]">
                              Pay rider at doorstep with cash or QR
                            </div>
                          </div>
                        </div>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            paymentMethodChoice === "cod"
                              ? "border-emerald-700 bg-emerald-700"
                              : "border-[#737783]"
                          }`}
                        >
                          {paymentMethodChoice === "cod" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cartItemsList.length > 0 && (
              <div className="bg-white border-t border-[#c3c6d4]/60 p-4 shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting || isPaymentLaunching || isLocalSubmitLocked}
                  onClick={handleCheckoutButtonClick}
                  className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3.5 px-4 text-xs font-black text-white shadow-lg disabled:opacity-50 transition flex items-center justify-between"
                >
                  <div className="text-left">
                    <div className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                      {paymentMethodChoice === "online_cashfree"
                        ? `PAY USING: ${
                            installedUpiApps.find((a) => a.appId === selectedUpiAppId)
                              ?.displayName || "UPI Apps"
                          } UPI`
                        : "PAY USING: Cash on Delivery"}
                    </div>
                    <div className="text-sm font-black">₹{grandTotal} TOTAL</div>
                  </div>
                  <div className="flex items-center gap-1 font-black text-sm">
                    {isSubmitting || isPaymentLaunching || isLocalSubmitLocked ? (
                      <span>Opening Securely...</span>
                    ) : (
                      <span>Place Order ▶</span>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── N-21 & N-22: Saved Bahraich Addresses & Dropoff Pin Modal ── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/65 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl min-h-[72vh] sm:min-h-[520px] max-h-[92vh] flex flex-col">
            <div className="bg-[#003178] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                  {addressTab === "pin_map"
                    ? "N-22 • Adjust Dropoff Gate Pin"
                    : "N-21 • Bahraich Saved Addresses"}
                </div>
                <h4 className="text-sm font-black">
                  {addressTab === "pin_map"
                    ? "Pin Exact Home / Gali Gate"
                    : t(lang, "Select or Add Delivery Address", "डिलीवरी पता चुनें या जोड़ें")}
                </h4>
              </div>
              <button
                type="button"
                onClick={onCloseAddressModal}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-[#eaedff] bg-[#faf8ff] text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setAddressTab("saved")}
                className={`flex-1 py-2.5 ${
                  addressTab === "saved" ? "text-[#003178] border-b-2 border-[#003178] bg-white" : "text-[#737783]"
                }`}
              >
                Saved ({savedAddresses.length})
              </button>
              <button
                type="button"
                onClick={() => setAddressTab("add_form")}
                className={`flex-1 py-2.5 ${
                  addressTab === "add_form" ? "text-[#003178] border-b-2 border-[#003178] bg-white" : "text-[#737783]"
                }`}
              >
                + New Address
              </button>
              <button
                type="button"
                onClick={() => setAddressTab("pin_map")}
                className={`flex-1 py-2.5 ${
                  addressTab === "pin_map" ? "text-[#003178] border-b-2 border-[#003178] bg-white" : "text-[#737783]"
                }`}
              >
                📌 Adjust Map Pin
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {addressTab === "saved" && (
                <>
                  {savedAddresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#c3c6d4] p-5 text-center space-y-2">
                      <div className="text-[#434652]">No saved addresses yet.</div>
                      <button
                        type="button"
                        onClick={() => setAddressTab("pin_map")}
                        className="rounded-xl bg-[#003178] text-white px-4 py-2 font-bold"
                      >
                        📌 Pin Gate on Bahraich Map
                      </button>
                    </div>
                  ) : (
                    savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`rounded-2xl border p-3 flex items-start justify-between gap-2 ${
                          selectedAddressId === addr.id
                            ? "border-[#003178] bg-[#f2f3ff]"
                            : "border-[#eaedff] bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectAddress(addr);
                            onCloseAddressModal();
                          }}
                          className="text-left flex-1"
                        >
                          <div className="font-black text-[#003178]">
                            {addr.tag || addr.label || "Home"}
                            {addr.isDefault ? " • Default" : ""}
                          </div>
                          <div className="text-[11px] text-[#131b2e] mt-0.5 leading-relaxed">
                            {stripGooglePlusCode(addr.street) || addr.street}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAddress(addr.id)}
                          className="text-[11px] font-bold text-rose-600 px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}

              {addressTab === "add_form" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#434652]">Detailed Address</span>
                    <button
                      type="button"
                      disabled={isAutoDetectingAddr}
                      onClick={handleAutoFillAddForm}
                      className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] font-extrabold text-[#059669] hover:bg-emerald-100 disabled:opacity-60"
                    >
                      {isAutoDetectingAddr ? "Detecting GPS..." : "📍 Auto-Detect Location"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Home", "Work", "Other"] as const).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setNewTag(tag)}
                        className={`rounded-xl border py-1.5 font-bold ${
                          newTag === tag
                            ? "bg-[#003178] text-white border-[#003178]"
                            : "bg-white border-[#c3c6d4]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                      House / Flat / Floor No. *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. House 42, 1st Floor"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                      Street / Mohalla / Colony *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Civil Lines, Peepal Chauraha"
                      value={mohalla}
                      onChange={(e) => handleMohallaSearch(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2"
                    />
                    {mohallaSuggestions.length > 0 && (
                      <div className="mt-1 rounded-xl border border-[#dae2fd] bg-white shadow-md max-h-32 overflow-y-auto">
                        {mohallaSuggestions.map((s) => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => {
                              setMohalla(s.area);
                              setPincode(s.pincode);
                              setPinCoords({ lat: s.lat, lng: s.lng });
                              setMohallaSuggestions([]);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#f2f3ff] border-b border-[#f2f3ff]"
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                      Nearest Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near District Hospital / SBI Bank"
                      value={road}
                      onChange={(e) => setRoad(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 271801"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bahraich"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await onSaveAddressRecord({
                        tag: newTag,
                        houseNo,
                        mohalla,
                        road,
                        pincode,
                        district,
                        lat: pinCoords?.lat,
                        lng: pinCoords?.lng,
                      });
                      setAddressTab("saved");
                    }}
                    className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 font-black text-white"
                  >
                    Save Delivery Address →
                  </button>
                </div>
              )}

              {addressTab === "pin_map" && (
                <BahraichInteractiveMap
                  mode="pin_adjust"
                  userCoords={userCoords}
                  initialPin={pinCoords || userCoords || { lat: 27.5744, lng: 81.5977 }}
                  onUseGps={onUseGpsForPin}
                  heightClass="h-64"
                  onPinConfirmed={async (pin) => {
                    setPinCoords({ lat: pin.lat, lng: pin.lng });
                    await onSaveAddressRecord({
                      tag: newTag,
                      houseNo: houseNo || "Gate Pin",
                      mohalla: stripGooglePlusCode(pin.mohalla) || pin.mohalla,
                      road: stripGooglePlusCode(pin.addressText),
                      pincode: pin.pincode,
                      district: "Bahraich",
                      lat: pin.lat,
                      lng: pin.lng,
                    });
                    onCloseAddressModal();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Native Payment Incomplete Sheet (Zero Web Redirects) ── */}
      {paymentRetryState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-2xl border border-amber-300">
            <div className="bg-amber-500 text-slate-950 px-5 py-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black">Payment Incomplete</h4>
                <div className="text-[10px] font-semibold text-slate-950/80">
                  No money deducted from your bank
                </div>
              </div>
              <button
                type="button"
                onClick={onDismissPaymentRetry}
                className="h-7 w-7 rounded-full bg-black/10 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-amber-950 leading-relaxed">
                Payment process complete nahi hua. <strong>Koi paise deduct nahi hue hain.</strong> Aap dobara UPI app se payment kar sakte hain ya 1-tap mein Cash on Delivery par switch kar sakte hain.
              </div>
              <button
                type="button"
                disabled={isSubmitting || isPaymentLaunching || isLocalSubmitLocked}
                onClick={() => onRetryCashfree(paymentRetryState.orderId)}
                className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3.5 font-black text-white disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>🔄 Retry UPI App Payment (₹{paymentRetryState.amount})</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting || isPaymentLaunching || isLocalSubmitLocked}
                onClick={() => onSwitchOrderToCod(paymentRetryState.orderId)}
                className="w-full rounded-2xl border border-[#003d27] bg-emerald-50 hover:bg-emerald-100 py-3.5 font-black text-[#003d27] disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                <span>💵 Pay on Delivery instead (COD)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── N-25: Order Placed Confirmation Ring & 4-Digit Handover PIN ── */}
      {confirmedOrderOverlay && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center space-y-4 shadow-2xl border border-emerald-200 animate-in zoom-in-95">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 border-4 border-emerald-500 text-3xl flex items-center justify-center text-emerald-700 shadow-lg">
              ✓
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#003d27]">
                N-25 • Order Confirmed ({confirmedOrderOverlay.paymentLabel})
              </div>
              <h4 className="text-lg font-black text-[#131b2e] mt-0.5">
                {confirmedOrderOverlay.storeName}
              </h4>
              <div className="text-xs font-mono font-bold text-[#003178]">
                {confirmedOrderOverlay.displayCode}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                🔐 4-Digit Doorstep Handover PIN
              </div>
              <div className="font-mono text-2xl font-black tracking-[0.4em] text-slate-950">
                {confirmedOrderOverlay.deliveryOtp}
              </div>
              <div className="text-[10.5px] text-amber-900 font-semibold">
                Share ONLY when rider meets you at your gate
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onTrackConfirmedOrder}
                className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 text-xs font-black text-white shadow-md"
              >
                📍 Track Live Order Map →
              </button>
              <button
                type="button"
                onClick={onCloseConfirmedOverlay}
                className="w-full py-2 text-xs font-bold text-[#737783]"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
