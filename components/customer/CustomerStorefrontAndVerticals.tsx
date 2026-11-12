"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { FolderOpen, Camera, RefreshCw, X, ShoppingCart } from "lucide-react";
import {
  SuperAppBusiness,
  SuperAppCatalogItem,
  CartLineItem,
  AVAILABLE_ADDONS,
  QUICK_COOKING_NOTES,
  CustomerLanguage,
  calcDistanceKm,
  estimateStoreEtaMinutes,
  getStoreRating,
  isStoreCurrentlyOpen,
  getRestaurantThumbnail,
  matchesCatalogQuery,
  t,
} from "./customer-types";

interface StorefrontAndVerticalsProps {
  lang: CustomerLanguage;
  onToggleLanguage: () => void;
  userCoords: { lat: number; lng: number } | null;
  userLiveLocation: string;
  // N-13 Storefront
  activeStore: SuperAppBusiness | null;
  onCloseStore: () => void;
  storeItems: SuperAppCatalogItem[];
  favoriteStoreIds: string[];
  onToggleFavorite: (storeId: string) => void;
  cartItemsList: CartLineItem[];
  cartGrandTotal: number;
  onQuickAddItem: (item: SuperAppCatalogItem) => void;
  onOpenCustomizer: (item: SuperAppCatalogItem) => void;
  onOpenCheckout: () => void;
  // N-14 & N-15 Triggers
  onOpenStandeeScanner: () => void;
  onClaimStandeeReward: (rating: number, feedback: string) => void;
  isStandeeOpen: boolean;
  onCloseStandee: () => void;
  // N-16 Customizer
  customizingItem: SuperAppCatalogItem | null;
  onCloseCustomizer: () => void;
  selectedPortion: "half" | "full";
  setSelectedPortion: (p: "half" | "full") => void;
  selectedAddons: string[];
  setSelectedAddons: React.Dispatch<React.SetStateAction<string[]>>;
  cookingInstruction: string;
  setCookingInstruction: (v: string) => void;
  onConfirmCustomization: () => void;
  // N-17 Kirana Parcha
  kiranaModal: SuperAppBusiness | null;
  onCloseKirana: () => void;
  parchaText: string;
  setParchaText: (v: string) => void;
  parchaImagePreview: string | null;
  setParchaImagePreview: (v: string | null) => void;
  parchaNotes: string;
  setParchaNotes: (v: string) => void;
  onSubmitParcha: (isMedicalRx?: boolean) => void;
  // N-18 Pharmacy Rx Modal
  medicalModal: SuperAppBusiness | null;
  onCloseMedical: () => void;
  // N-19 Salon & Car Wash
  salonModal: SuperAppBusiness | null;
  onCloseSalon: () => void;
  salonService: string;
  setSalonService: (v: string) => void;
  salonStylist: string;
  setSalonStylist: (v: string) => void;
  onBookSalonToken: () => void;
  carWashModal: SuperAppBusiness | null;
  onCloseCarWash: () => void;
  carWashPackage: string;
  setCarWashPackage: (v: string) => void;
  vehicleNumber: string;
  setVehicleNumber: (v: string) => void;
  vehicleModel: string;
  setVehicleModel: (v: string) => void;
  onBookCarWashSlot: () => void;
  isSubmitting: boolean;
  onRegisterSubBack?: (handler: (() => boolean) | null) => void;
}

const SALON_CHAIR_SLOTS = [
  { id: "Chair #01", wait: "Available Now", free: true },
  { id: "Chair #02", wait: "10 mins wait", free: true },
  { id: "Chair #03", wait: "25 mins wait", free: false },
  { id: "Chair #04", wait: "Available Now", free: true },
];

const CAR_WASH_BAYS = [
  { id: "Bay #1 (Foam)", wait: "Free Now", free: true },
  { id: "Bay #2 (Steam)", wait: "15 mins wait", free: true },
  { id: "Bay #3 (Polish)", wait: "30 mins wait", free: false },
];

/**
 * N-13 to N-19:
 * - N-13: Merchant Storefront Menu
 * - N-14: Store Info, English/Hindi Translate & Standee QR Sheet (No Group Order)
 * - N-15: Trustit Verified Reviews & Counter Standee QR Scanner
 * - N-16: Product & Dish Customizer Sheet (+ Often Bought With)
 * - N-17: Kirana Handwritten Smart Parcha
 * - N-18: Pharmacy Prescription (Rx) Hub
 * - N-19: Salon Queue & Car Wash Bay Slots
 */
export default function CustomerStorefrontAndVerticals({
  lang,
  onToggleLanguage,
  userCoords,
  userLiveLocation,
  activeStore,
  onCloseStore,
  storeItems,
  favoriteStoreIds,
  onToggleFavorite,
  cartItemsList,
  cartGrandTotal,
  onQuickAddItem,
  onOpenCustomizer,
  onOpenCheckout,
  onOpenStandeeScanner,
  onClaimStandeeReward,
  isStandeeOpen,
  onCloseStandee,
  customizingItem,
  onCloseCustomizer,
  selectedPortion,
  setSelectedPortion,
  selectedAddons,
  setSelectedAddons,
  cookingInstruction,
  setCookingInstruction,
  onConfirmCustomization,
  kiranaModal,
  onCloseKirana,
  parchaText,
  setParchaText,
  parchaImagePreview,
  setParchaImagePreview,
  parchaNotes,
  setParchaNotes,
  onSubmitParcha,
  medicalModal,
  onCloseMedical,
  salonModal,
  onCloseSalon,
  salonService,
  setSalonService,
  salonStylist,
  setSalonStylist,
  onBookSalonToken,
  carWashModal,
  onCloseCarWash,
  carWashPackage,
  setCarWashPackage,
  vehicleNumber,
  setVehicleNumber,
  vehicleModel,
  setVehicleModel,
  onBookCarWashSlot,
  isSubmitting,
  onRegisterSubBack,
}: StorefrontAndVerticalsProps) {
  const [inStoreSearch, setInStoreSearch] = useState("");
  const [inStoreVegOnly, setInStoreVegOnly] = useState(false);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false); // N-14
  const [isReviewsOpen, setIsReviewsOpen] = useState(false); // N-15
  const [standeeRating, setStandeeRating] = useState(5);
  const [standeeFeedback, setStandeeFeedback] = useState("");
  const [standeeSubmitted, setStandeeSubmitted] = useState(false);
  const [qrStatus, setQrStatus] = useState<"idle" | "starting" | "active" | "detected" | "error">("idle");
  const [qrErrorMsg, setQrErrorMsg] = useState("");
  const [scannedQrValue, setScannedQrValue] = useState("");
  const qrVideoRef = useRef<HTMLVideoElement | null>(null);
  const qrStreamRef = useRef<MediaStream | null>(null);
  const parchaFileInputRef = useRef<HTMLInputElement | null>(null);
  const parchaCameraInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedSlotChip, setSelectedSlotChip] = useState<string>("Chair #01");
  const [selectedBayChip, setSelectedBayChip] = useState<string>("Bay #1 (Foam)");

  const stopQrCamera = useCallback(() => {
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      qrStreamRef.current = null;
    }
    if (qrVideoRef.current) {
      qrVideoRef.current.srcObject = null;
    }
  }, []);

  const startQrCamera = useCallback(async () => {
    stopQrCamera();
    setQrErrorMsg("");
    setScannedQrValue("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setQrStatus("error");
      setQrErrorMsg("Live camera preview is unavailable on this device. Use Capture QR Photo below.");
      return;
    }
    setQrStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      qrStreamRef.current = stream;
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream;
        await qrVideoRef.current.play().catch(() => {});
      }
      setQrStatus("active");
    } catch (err) {
      setQrStatus("error");
      setQrErrorMsg(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera permission denied. Allow camera access or use Capture QR Photo below."
          : "Could not start camera. Please allow camera permission or upload QR photo.",
      );
    }
  }, [stopQrCamera]);

  useEffect(() => {
    if (!isStandeeOpen || standeeSubmitted) {
      stopQrCamera();
      if (!isStandeeOpen) {
        setQrStatus("idle");
        setScannedQrValue("");
        setQrErrorMsg("");
      }
      return;
    }
    startQrCamera();
    return () => {
      stopQrCamera();
    };
  }, [isStandeeOpen, standeeSubmitted, startQrCamera, stopQrCamera]);

  useEffect(() => {
    if (qrStatus !== "active" || !qrVideoRef.current) return;
    const BarcodeDetectorCtor = (window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
    if (!BarcodeDetectorCtor) return;

    let cancelled = false;
    let detector: { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } | null = null;
    try {
      detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
    } catch {
      return;
    }

    const timer = setInterval(async () => {
      if (cancelled || !qrVideoRef.current || qrVideoRef.current.readyState < 2 || !detector) return;
      try {
        const codes = await detector.detect(qrVideoRef.current);
        const raw = codes?.[0]?.rawValue?.trim();
        if (raw) {
          setScannedQrValue(raw);
          setQrStatus("detected");
          stopQrCamera();
        }
      } catch {}
    }, 350);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [qrStatus, stopQrCamera]);

  useEffect(() => {
    if (!onRegisterSubBack) return;
    if (!activeStore) {
      onRegisterSubBack(null);
      return;
    }
    onRegisterSubBack(() => {
      if (isReviewsOpen) {
        setIsReviewsOpen(false);
        return true;
      }
      if (isOverflowOpen) {
        setIsOverflowOpen(false);
        return true;
      }
      return false;
    });
    return () => onRegisterSubBack(null);
  }, [onRegisterSubBack, activeStore, isReviewsOpen, isOverflowOpen]);

  const filteredStoreItems = useMemo(() => {
    const q = inStoreSearch.trim().toLowerCase();
    return storeItems.filter((item) => {
      if (inStoreVegOnly && item.item_type === "non_veg") return false;
      if (!q) return true;
      return matchesCatalogQuery(item, q);
    });
  }, [storeItems, inStoreSearch, inStoreVegOnly]);

  const upsellItems = useMemo(() => {
    if (!customizingItem) return [];
    return storeItems
      .filter((i) => i.id !== customizingItem.id && i.is_available)
      .slice(0, 3);
  }, [customizingItem, storeItems]);

  const handleFileToDataUrl = (file: File | undefined, cb: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") cb(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* ── N-13: Merchant Storefront Menu ── */}
      {activeStore && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#faf8ff] shadow-2xl border border-[#c3c6d4]/60 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Hero Cover */}
            <div className="relative h-36 bg-[#003178] shrink-0">
              <img
                src={getRestaurantThumbnail(activeStore.name)}
                alt={activeStore.name}
                className="w-full h-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001945] via-[#003178]/50 to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onCloseStore}
                  className="h-8 w-8 rounded-full bg-white/95 text-[#003178] font-black text-xs flex items-center justify-center shadow"
                  aria-label="Back"
                >
                  ←
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(activeStore.id)}
                    className="h-8 w-8 rounded-full bg-white/95 text-xs flex items-center justify-center shadow"
                    aria-label="Favorite store"
                  >
                    {favoriteStoreIds.includes(activeStore.id) ? "❤️" : "🤍"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOverflowOpen(true)}
                    className="h-8 px-2.5 rounded-full bg-white/95 text-[#003178] font-black text-xs flex items-center justify-center shadow"
                    aria-label="Store options"
                  >
                    ⋯
                  </button>
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8df7c1]">
                  <span>🛡️ Trustit Verified Partner</span>
                  <span>•</span>
                  <span>{isStoreCurrentlyOpen().label}</span>
                </div>
                <h2 className="text-base sm:text-lg font-black leading-tight truncate">
                  {activeStore.name}
                </h2>
                <p className="text-[11px] text-[#d9e2ff] truncate">
                  {activeStore.address || "Bahraich"} •{" "}
                  {calcDistanceKm(
                    userCoords?.lat,
                    userCoords?.lng,
                    activeStore.location_latitude,
                    activeStore.location_longitude,
                  )}{" "}
                  km • {estimateStoreEtaMinutes(activeStore, userCoords)} mins
                </p>
              </div>
            </div>

            {/* Store Info Strip & Verified Reviews Trigger (N-15) */}
            <div className="bg-white px-4 py-2.5 border-b border-[#eaedff] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewsOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-extrabold text-emerald-900"
              >
                <span>★ {getStoreRating(activeStore.id)}</span>
                <span className="text-[10px] font-semibold text-emerald-700 underline">
                  840+ Verified Reviews ›
                </span>
              </button>

              <div className="rounded-xl bg-[#f2f3ff] border border-[#dae2fd] px-2.5 py-1 text-[10.5px] font-bold text-[#003178]">
                🎁 ₹50 OFF above ₹299
              </div>
            </div>

            {/* In-Store Search & Veg Filter */}
            <div className="bg-white px-4 py-2.5 border-b border-[#eaedff] flex items-center gap-2 shrink-0">
              <div className="flex-1 flex items-center rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-2.5 py-1.5">
                <span className="text-xs mr-1.5">🔍</span>
                <input
                  type="text"
                  placeholder={t(lang, "Search inside store menu...", "इस दुकान के मेन्यू में खोजें...")}
                  value={inStoreSearch}
                  onChange={(e) => setInStoreSearch(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-[#131b2e] outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setInStoreVegOnly((v) => !v)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition ${
                  inStoreVegOnly
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-[#434652] border-[#c3c6d4]"
                }`}
              >
                🟢 Veg
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
              {filteredStoreItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#c3c6d4] bg-white p-6 text-center space-y-2 text-xs text-[#434652]">
                  <div className="text-xl">🍽️</div>
                  <div className="font-extrabold text-[#131b2e]">
                    {storeItems.length === 0
                      ? `${activeStore.name} is updating their live menu card.`
                      : `No menu items matched “${inStoreSearch}”.`}
                  </div>
                  {(inStoreSearch || inStoreVegOnly) && (
                    <button
                      type="button"
                      onClick={() => {
                        setInStoreSearch("");
                        setInStoreVegOnly(false);
                      }}
                      className="rounded-xl bg-[#f2f3ff] border border-[#dae2fd] px-3 py-1.5 text-[11px] font-bold text-[#003178]"
                    >
                      Clear Menu Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredStoreItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#eaedff] bg-white p-3 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-xs border ${
                            item.item_type === "non_veg"
                              ? "border-rose-600 bg-rose-500"
                              : "border-emerald-600 bg-emerald-500"
                          }`}
                        />
                        <span className="text-[10px] font-bold uppercase text-[#737783]">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#131b2e] leading-snug">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] text-[#434652] line-clamp-2">{item.description}</p>
                      )}
                      <div className="text-xs font-black text-[#003178]">₹{item.price}</div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-[#eaedff]"
                        />
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onQuickAddItem(item)}
                          className="rounded-xl bg-[#003178] hover:bg-[#0d47a1] text-white px-3 py-1.5 text-[11px] font-black shadow-xs transition"
                        >
                          + Add
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCustomizer(item)}
                          className="rounded-xl border border-[#c3c6d4] bg-[#f2f3ff] text-[#003178] px-2 py-1.5 text-[10px] font-bold"
                          title="Customize portion & add-ons"
                        >
                          ⚙️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Compact Floating Cart Icon with Notification Badge */}
            {cartItemsList.length > 0 && (
              <button
                type="button"
                onClick={onOpenCheckout}
                aria-label="Open Cart Checkout"
                className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-2xl bg-[#003178] hover:bg-[#0d47a1] text-white pl-3 pr-3.5 py-2.5 shadow-2xl border border-white/25 transition active:scale-95"
              >
                <span className="relative flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5" strokeWidth={2.3} />
                  <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center px-1 shadow-sm ring-2 ring-[#003178]">
                    {cartItemsList.reduce((s, l) => s + l.quantity, 0)}
                  </span>
                </span>
                <span className="text-xs font-black pl-1">₹{cartGrandTotal}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── N-14: Store Overflow Menu, Translate & Standee QR Sheet (Zero Group Order) ── */}
      {isOverflowOpen && activeStore && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 space-y-3 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-2.5">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#006875]">N-14 • Store Options</div>
                <h4 className="text-sm font-black text-[#131b2e]">{activeStore.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOverflowOpen(false)}
                className="h-7 w-7 rounded-full bg-[#f2f3ff] text-xs font-bold text-[#003178]"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-[#f2f3ff] p-3 text-xs space-y-1 text-[#131b2e]">
              <div className="font-bold">ℹ️ Store Info, Timings &amp; FSSAI</div>
              <div className="text-[11px] text-[#434652]">
                Hours: {isStoreCurrentlyOpen().hours} • {activeStore.address || "Bahraich"}
              </div>
              <div className="text-[10.5px] font-semibold text-[#003d27]">
                ✓ FSSAI &amp; Trustit Counter Standee Verified • Single-Order Checkout Only
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onToggleLanguage();
                setIsOverflowOpen(false);
              }}
              className="w-full rounded-2xl border border-[#c3c6d4] bg-white hover:bg-[#faf8ff] p-3 text-left text-xs font-bold text-[#131b2e] flex items-center justify-between"
            >
              <span>🌐 Translate Interface (English ↔ हिन्दी)</span>
              <span className="rounded-lg bg-[#003178] text-white px-2 py-0.5 text-[10px]">
                {lang === "hi" ? "हिन्दी" : "EN"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOverflowOpen(false);
                onOpenStandeeScanner();
              }}
              className="w-full rounded-2xl border border-[#003178]/30 bg-[#f2f3ff] p-3 text-left text-xs font-bold text-[#003178] flex items-center justify-between"
            >
              <span>📷 Scan Shop Standee QR (Earn ₹10)</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── N-15: Verified Reviews Breakdown Modal ── */}
      {isReviewsOpen && activeStore && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-2.5">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#006875]">
                  N-15 • Trustit Verified Reviews
                </div>
                <h4 className="text-sm font-black text-[#131b2e]">{activeStore.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewsOpen(false)}
                className="h-7 w-7 rounded-full bg-[#f2f3ff] text-xs font-bold text-[#003178]"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-emerald-900">
                  ★ {getStoreRating(activeStore.id)} / 5.0
                </div>
                <div className="text-[11px] font-semibold text-emerald-800">
                  840+ Verified Purchase &amp; Standee QR Reviews
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReviewsOpen(false);
                  onOpenStandeeScanner();
                }}
                className="rounded-xl bg-emerald-700 text-white px-2.5 py-1.5 text-[10px] font-black"
              >
                Scan QR +₹10
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto text-xs">
              {[
                { name: "Rohan Srivastava", tag: "Verified Order • Civil Lines", text: "Packaging was piping hot and the rider reached our gate in 22 minutes." },
                { name: "Priya Verma", tag: "Standee QR Verified • Chowk", text: "Great hygiene, generous portions, and super fresh taste." },
                { name: "Imran Khan", tag: "Verified Order • Station Road", text: "Instant UPI payment via Cashfree and smooth 4-digit OTP handover at gate." },
              ].map((rev) => (
                <div key={rev.name} className="rounded-xl border border-[#eaedff] bg-[#faf8ff] p-2.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#131b2e]">{rev.name}</span>
                    <span className="text-[10px] font-bold text-emerald-700">✓ Verified</span>
                  </div>
                  <div className="text-[10px] text-[#737783]">{rev.tag}</div>
                  <p className="text-[11px] text-[#434652]">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── N-15 (Part 2): Counter Standee QR Scanner Modal ── */}
      {isStandeeOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-2xl border border-[#c3c6d4]">
            <div className="bg-[#003178] text-white px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                  N-15 • Trustit Standee QR
                </div>
                <h4 className="text-sm font-black">Scan Shop Counter QR</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopQrCamera();
                  setStandeeSubmitted(false);
                  onCloseStandee();
                }}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              {!standeeSubmitted ? (
                <>
                  <div className="relative rounded-2xl bg-[#001945] text-white overflow-hidden border-2 border-[#00e3fd]/50">
                    {qrStatus === "detected" && scannedQrValue ? (
                      <div className="p-4 text-center space-y-2 bg-emerald-950/90">
                        <div className="text-2xl">✅</div>
                        <div className="text-xs font-black text-emerald-300">QR Code Scanned</div>
                        <div className="text-[11px] font-mono text-white/90 break-all bg-black/30 rounded-xl p-2">
                          {scannedQrValue}
                        </div>
                        <div className="flex gap-2 justify-center pt-1">
                          {scannedQrValue.toLowerCase().startsWith("upi://") && (
                            <a
                              href={scannedQrValue}
                              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white"
                            >
                              Pay via UPI →
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={startQrCamera}
                            className="rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-[11px] font-bold text-white"
                          >
                            Scan Again
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-48 w-full bg-slate-950 flex items-center justify-center">
                        <video
                          ref={qrVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`h-full w-full object-cover ${qrStatus === "active" ? "opacity-100" : "opacity-0"}`}
                        />
                        {qrStatus === "active" && (
                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <div className="h-32 w-32 rounded-2xl border-2 border-[#00e3fd] shadow-[0_0_0_999px_rgba(0,25,69,0.45)]" />
                            <span className="mt-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-[#9cf0ff]">
                              Align Shop / UPI QR inside frame
                            </span>
                          </div>
                        )}
                        {qrStatus !== "active" && (
                          <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center space-y-2">
                            <Camera className="h-7 w-7 text-[#00e3fd]" />
                            <div className="text-xs font-extrabold">
                              {qrStatus === "starting" ? "Opening Camera..." : "Camera Unavailable"}
                            </div>
                            {qrErrorMsg && (
                              <p className="text-[10.5px] text-[#b0c6ff] leading-snug max-w-xs">
                                {qrErrorMsg}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={startQrCamera}
                                className="inline-flex items-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-[11px] font-bold text-white"
                              >
                                <RefreshCw className="h-3 w-3" /> Retry Camera
                              </button>
                              <label className="inline-flex items-center gap-1 rounded-xl bg-[#00e3fd] text-[#001945] px-3 py-1.5 text-[11px] font-black cursor-pointer">
                                <Camera className="h-3 w-3" /> Capture QR
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setScannedQrValue(`Captured QR Image: ${file.name}`);
                                      setQrStatus("detected");
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStandeeRating(star)}
                        className="text-2xl transition hover:scale-110"
                      >
                        {star <= standeeRating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Share your offline shop experience (Optional)..."
                    value={standeeFeedback}
                    onChange={(e) => setStandeeFeedback(e.target.value)}
                    className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] p-2.5 text-xs outline-none focus:border-[#003178]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setStandeeSubmitted(true);
                      onClaimStandeeReward(standeeRating, standeeFeedback);
                    }}
                    className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-2.5 text-xs font-black text-white"
                  >
                    Submit Verified Rating ({standeeRating}★) &amp; Claim ₹10 →
                  </button>
                </>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <div className="text-3xl">🎉</div>
                  <h5 className="text-sm font-black text-[#003d27]">
                    Verified Review Saved! +₹10 Cashback Added
                  </h5>
                  <p className="text-xs text-[#434652]">
                    Credited to your Trustit Money wallet (N-31).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStandeeSubmitted(false);
                      onCloseStandee();
                    }}
                    className="w-full rounded-xl bg-[#003178] text-white py-2 text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── N-16: Product & Dish Customizer Sheet (+ Often Bought With) ── */}
      {customizingItem && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/65 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#003178] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#9cf0ff]">
                  N-16 • Customize Item
                </div>
                <h4 className="text-sm font-black truncate max-w-[260px]">{customizingItem.name}</h4>
              </div>
              <button
                type="button"
                onClick={onCloseCustomizer}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <div className="font-extrabold text-[#131b2e] mb-2">1. Select Portion / Pack Size</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "half" as const,
                      label: "Half / Regular",
                      price: Math.max(20, Math.round((customizingItem.price * 0.6) / 5) * 5),
                    },
                    { id: "full" as const, label: "Full / Family", price: customizingItem.price },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedPortion(opt.id)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        selectedPortion === opt.id
                          ? "border-[#003178] bg-[#f2f3ff] ring-1 ring-[#003178]"
                          : "border-[#c3c6d4] bg-white"
                      }`}
                    >
                      <div className="font-bold text-[#131b2e]">{opt.label}</div>
                      <div className="font-black text-[#003178] mt-0.5">₹{opt.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-extrabold text-[#131b2e] mb-2">2. Add-ons &amp; Extras</div>
                <div className="space-y-1.5">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const checked = selectedAddons.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between rounded-xl border border-[#eaedff] bg-[#faf8ff] px-3 py-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedAddons((prev) =>
                                checked ? prev.filter((id) => id !== addon.id) : [...prev, addon.id],
                              )
                            }
                          />
                          <span className="font-semibold text-[#131b2e]">{addon.name}</span>
                        </div>
                        <span className="font-bold text-[#003178]">+₹{addon.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="font-extrabold text-[#131b2e] mb-1.5">3. Cooking / Packing Notes</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_COOKING_NOTES.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setCookingInstruction(note)}
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                        cookingInstruction === note
                          ? "bg-[#003178] text-white border-[#003178]"
                          : "bg-white text-[#434652] border-[#c3c6d4]"
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Optional instructions for chef..."
                  value={cookingInstruction}
                  onChange={(e) => setCookingInstruction(e.target.value)}
                  className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs outline-none focus:border-[#003178]"
                />
              </div>

              {upsellItems.length > 0 && (
                <div>
                  <div className="font-extrabold text-[#131b2e] mb-1.5">Often Bought Together</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {upsellItems.map((up) => (
                      <div
                        key={up.id}
                        className="flex items-center justify-between rounded-xl border border-[#eaedff] bg-[#f2f3ff]/60 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[#131b2e] truncate">{up.name}</div>
                          <div className="text-[10px] font-bold text-[#003178]">₹{up.price}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onQuickAddItem(up)}
                          className="rounded-lg bg-white border border-[#003178] px-2.5 py-1 text-[10px] font-black text-[#003178]"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#eaedff] bg-white shrink-0">
              <button
                type="button"
                onClick={onConfirmCustomization}
                className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 text-xs font-black text-white shadow-md transition"
              >
                Add to Single-Store Order →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── N-17: Kirana Handwritten Smart Parcha Modal ── */}
      {kiranaModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#003178] to-[#0d47a1] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                  N-17 • Smart Parcha (5-Min Quote)
                </div>
                <h4 className="text-sm font-black">{kiranaModal.name}</h4>
              </div>
              <button
                type="button"
                onClick={onCloseKirana}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs">
              <div className="rounded-xl bg-[#f2f3ff] border border-[#dae2fd] px-3 py-2 text-[11px] font-semibold text-[#003178]">
                📍 Delivering to: {userLiveLocation} • Direct sync with Merchant Screen K02
              </div>

              <div>
                <label className="block font-bold text-[#434652] mb-1.5">
                  Upload Photo of Handwritten Grocery List (Optional)
                </label>

                <input
                  ref={parchaFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileToDataUrl(e.target.files?.[0], setParchaImagePreview)}
                />
                <input
                  ref={parchaCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileToDataUrl(e.target.files?.[0], setParchaImagePreview)}
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => parchaFileInputRef.current?.click()}
                    className="rounded-2xl border border-[#dae2fd] bg-[#f2f3ff] hover:bg-[#eaedff] py-3 px-3 flex flex-col items-center justify-center gap-1.5 text-[#003178] transition"
                  >
                    <FolderOpen className="h-5 w-5" />
                    <span className="text-[11px] font-black">Upload from Files</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => parchaCameraInputRef.current?.click()}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 py-3 px-3 flex flex-col items-center justify-center gap-1.5 text-[#003d27] transition"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="text-[11px] font-black">Live Camera</span>
                  </button>
                </div>

                {parchaImagePreview && (
                  <div className="relative mt-2.5">
                    <img
                      src={parchaImagePreview}
                      alt="Parcha preview"
                      className="h-32 w-full object-cover rounded-xl border border-[#c3c6d4]"
                    />
                    <button
                      type="button"
                      onClick={() => setParchaImagePreview(null)}
                      aria-label="Remove uploaded list photo"
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-900/75 text-white flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="font-bold text-[#434652] mb-1">Quick Add Bahraich Essentials:</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {["5kg Chakki Atta", "1L Mustard Oil", "1kg Arhar Dal", "1kg Sugar", "Amul Milk 1L"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setParchaText(parchaText ? `${parchaText}\n${preset}` : preset)}
                      className="rounded-full bg-[#f2f3ff] border border-[#dae2fd] px-2.5 py-1 text-[10.5px] font-bold text-[#003178]"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={4}
                  placeholder="Write your ration list here (e.g. 5kg Atta, 2kg Rice, 500g Besan)..."
                  value={parchaText}
                  onChange={(e) => setParchaText(e.target.value)}
                  className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] p-2.5 text-xs outline-none focus:border-[#003178]"
                />
              </div>

              <input
                type="text"
                placeholder="Notes for Kirana store (e.g. Call me before packing)..."
                value={parchaNotes}
                onChange={(e) => setParchaNotes(e.target.value)}
                className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs outline-none"
              />

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSubmitParcha(false)}
                className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 text-xs font-black text-white shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Sending Parcha..." : "Send Parcha to Kirana Store →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── N-18: Pharmacy Prescription (Rx) Hub ── */}
      {medicalModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#003d27] to-[#005739] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8df7c1]">
                  N-18 • Pharmacy Prescription (Rx) Hub
                </div>
                <h4 className="text-sm font-black">{medicalModal.name}</h4>
              </div>
              <button
                type="button"
                onClick={onCloseMedical}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] font-semibold text-emerald-900">
                🩺 CDSCO Schedule-H Verified Chemist • Signed Rx syncs live to Partner Screen M02
              </div>

              <div>
                <label className="block font-bold text-[#434652] mb-1">
                  Upload Doctor Prescription (Rx Photo) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileToDataUrl(e.target.files?.[0], setParchaImagePreview)}
                  className="w-full rounded-xl border border-dashed border-emerald-500 bg-emerald-50/40 p-2.5 text-[11px]"
                />
                {parchaImagePreview && (
                  <img
                    src={parchaImagePreview}
                    alt="Prescription preview"
                    className="mt-2 h-32 w-full object-cover rounded-xl border border-emerald-200"
                  />
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Type medicine names / dosage if needed (e.g. Dolo 650, Azithromycin 500)..."
                value={parchaText}
                onChange={(e) => setParchaText(e.target.value)}
                className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] p-2.5 text-xs outline-none focus:border-[#003d27]"
              />

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSubmitParcha(true)}
                className="w-full rounded-2xl bg-[#003d27] hover:bg-[#005739] py-3 text-xs font-black text-white shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Rx..." : "Submit Doctor Rx to Pharmacist →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── N-19 (Part 1): Salon Queue Token & Live Chair Slots ── */}
      {salonModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl">
            <div className="bg-[#003178] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#9cf0ff]">
                  N-19 • Salon Live Chair Token
                </div>
                <h4 className="text-sm font-black">{salonModal.name}</h4>
              </div>
              <button
                type="button"
                onClick={onCloseSalon}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <div className="font-bold text-[#434652] mb-1.5">Live Chair Availability (Set C Screen S02 Sync)</div>
                <div className="grid grid-cols-2 gap-2">
                  {SALON_CHAIR_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotChip(slot.id)}
                      className={`rounded-xl border p-2.5 text-left ${
                        selectedSlotChip === slot.id
                          ? "border-[#003178] bg-[#f2f3ff] ring-1 ring-[#003178]"
                          : "border-[#eaedff] bg-white"
                      }`}
                    >
                      <div className="font-black text-[#131b2e]">{slot.id}</div>
                      <div className={`text-[10px] font-bold ${slot.free ? "text-emerald-700" : "text-amber-700"}`}>
                        {slot.wait}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <select
                value={salonService}
                onChange={(e) => setSalonService(e.target.value)}
                className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs font-bold"
              >
                <option>Executive Haircut &amp; Styling (₹150)</option>
                <option>Beard Trim &amp; Hot Towel Shave (₹100)</option>
                <option>Charcoal Detox Facial &amp; Cleanup (₹450)</option>
              </select>

              <input
                type="text"
                value={salonStylist}
                onChange={(e) => setSalonStylist(e.target.value)}
                placeholder="Stylist preference (Optional)"
                className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs"
              />

              <button
                type="button"
                disabled={isSubmitting}
                onClick={onBookSalonToken}
                className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 text-xs font-black text-white shadow-md"
              >
                {isSubmitting ? "Generating Token..." : `Book Live Token (${selectedSlotChip}) →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── N-19 (Part 2): Car Wash Bay Slots ── */}
      {carWashModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl">
            <div className="bg-[#006875] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase text-[#9cf0ff]">
                  N-19 • Car &amp; Bike Wash Bay Slot
                </div>
                <h4 className="text-sm font-black">{carWashModal.name}</h4>
              </div>
              <button
                type="button"
                onClick={onCloseCarWash}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-1.5">
                {CAR_WASH_BAYS.map((bay) => (
                  <button
                    key={bay.id}
                    type="button"
                    onClick={() => setSelectedBayChip(bay.id)}
                    className={`rounded-xl border p-2 text-left ${
                      selectedBayChip === bay.id
                        ? "border-[#006875] bg-[#f2f3ff] ring-1 ring-[#006875]"
                        : "border-[#eaedff] bg-white"
                    }`}
                  >
                    <div className="font-black text-[#131b2e] text-[10.5px]">{bay.id}</div>
                    <div className="text-[9.5px] font-bold text-emerald-700">{bay.wait}</div>
                  </button>
                ))}
              </div>

              <select
                value={carWashPackage}
                onChange={(e) => setCarWashPackage(e.target.value)}
                className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs font-bold"
              >
                <option>Full Foam Car Wash &amp; Vacuuming (₹350)</option>
                <option>Bike Pressure Wash &amp; Chain Lube (₹120)</option>
                <option>SUV Interior Deep Spa &amp; Polish (₹650)</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Vehicle No (UP 40 AB 1234)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. Swift / Bullet)"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={onBookCarWashSlot}
                className="w-full rounded-2xl bg-[#006875] hover:bg-[#003178] py-3 text-xs font-black text-white shadow-md"
              >
                {isSubmitting ? "Booking Bay..." : `Book Wash Bay (${selectedBayChip}) →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
