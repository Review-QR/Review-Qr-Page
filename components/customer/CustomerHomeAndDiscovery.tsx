"use client";

import React, { useState, useMemo, useEffect } from "react";
import { calculatePointsInrValue } from "@/lib/customer-points";
import {
  SuperAppBusiness,
  SuperAppCatalogItem,
  BAHRAICH_12_CATEGORIES,
  BottomNavTab,
  CustomerLanguage,
  VerticalTabId,
  calcDistanceKm,
  estimateStoreEtaMinutes,
  getRestaurantThumbnail,
  getStoreRating,
  isStoreCurrentlyOpen,
  matchesCatalogQuery,
  t,
} from "./customer-types";

const POPULAR_SEARCH_SUGGESTIONS = [
  "Kaju Katli",
  "Mustard Oil",
  "Biryani",
  "Atta 5kg",
  "Dolo 650",
];

interface HomeAndDiscoveryProps {
  lang: CustomerLanguage;
  bottomTab: BottomNavTab;
  setBottomTab: (tab: BottomNavTab) => void;
  activeTab: VerticalTabId;
  setActiveTab: (tab: VerticalTabId) => void;
  userLiveLocation: string;
  districtName?: string;
  rewardPoints?: number;
  isAuthenticated?: boolean;
  onRequestLogin?: () => void;
  userCoords: { lat: number; lng: number } | null;
  customerName: string;
  totalActiveCount: number;
  unreadNotifCount: number;
  onOpenLocationLock: () => void;
  onOpenNotifications: () => void;
  onOpenActiveOrders: () => void;
  onOpenProfile: () => void;
  onOpenStandeeScanner: () => void;
  onOpenSmartParcha: () => void;
  onOpenMedicalRx: () => void;
  // Search & Navigation
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  businesses: SuperAppBusiness[];
  filteredBusinesses: SuperAppBusiness[];
  catalogItems: SuperAppCatalogItem[];
  favoriteStoreIds: string[];
  onSelectStore: (store: SuperAppBusiness) => void;
  onQuickAddItem: (item: SuperAppCatalogItem) => void;
  // Cart strip
  cartCount: number;
  cartGrandTotal: number;
  cartStoreName: string;
  onOpenCheckout: () => void;
  onRegisterSubBack?: (handler: (() => boolean) | null) => void;
}

/**
 * N-07 to N-12:
 * - N-07: Super-App Home Hub (Bahraich GPS header, SpeedPass, Quick Reorder, Verticals)
 * - N-08: Categories Grid / List Directory (12 Bahraich Categories, zero Alcohol)
 * - N-09: Vertical Store Browser
 * - N-10: Cross-Store Product Search (+ Direct Add with ₹ Price)
 * - N-11: Multi-Facet Filter Bottom Sheet
 * - N-12: Bahraich Store Pin Map View
 */
export default function CustomerHomeAndDiscovery({
  lang,
  bottomTab,
  setBottomTab,
  activeTab,
  setActiveTab,
  userLiveLocation,
  districtName = "Bahraich",
  rewardPoints = 0,
  isAuthenticated = false,
  onRequestLogin,
  userCoords,
  customerName,
  totalActiveCount,
  unreadNotifCount,
  onOpenLocationLock,
  onOpenNotifications,
  onOpenActiveOrders,
  onOpenProfile,
  onOpenStandeeScanner,
  onOpenSmartParcha,
  onOpenMedicalRx,
  searchQuery,
  setSearchQuery,
  businesses,
  filteredBusinesses,
  catalogItems,
  favoriteStoreIds,
  onSelectStore,
  onQuickAddItem,
  cartCount,
  cartGrandTotal,
  cartStoreName,
  onOpenCheckout,
  onRegisterSubBack,
}: HomeAndDiscoveryProps) {
  const [catDisplayMode, setCatDisplayMode] = useState<"grid" | "list">("grid"); // N-08 toggle
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % POPULAR_SEARCH_SUGGESTIONS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!onRegisterSubBack) return;
    onRegisterSubBack(null);
    return () => onRegisterSubBack(null);
  }, [onRegisterSubBack]);

  // N-10 Cross-Store Product Matches
  const matchingCatalogProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return catalogItems
      .filter((i) => i.is_available && matchesCatalogQuery(i, q))
      .slice(0, 8)
      .map((item) => ({
        item,
        store: businesses.find((b) => b.id === item.business_id),
      }));
  }, [searchQuery, catalogItems, businesses]);

  const pointsInrValue = calculatePointsInrValue(rewardPoints);
  const displayDistrict = districtName || "Bahraich";

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-28">
      {/* ── Sticky Kinetic Trust Top Header (N-07) ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#eaedff] shadow-2xs">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenLocationLock}
            className="flex items-center gap-2 min-w-0 text-left group"
          >
            <span className="h-8 w-8 rounded-xl bg-[#003178] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              T
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-xs font-black text-[#003178] truncate">
                <span>📍 {userLiveLocation}</span>
                <span className="text-[10px]">▾</span>
              </div>
              <div className="text-[10px] font-semibold text-[#737783] truncate">
                {lang === "hi"
                  ? `${displayDistrict} वेरीफाइड लोकल डिलीवरी`
                  : `${displayDistrict} Verified Hyperlocal Hub`}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative h-8 w-8 rounded-xl bg-[#f2f3ff] border border-[#dae2fd] flex items-center justify-center text-sm"
              aria-label="Notifications"
            >
              <span>🔔</span>
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center px-1">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Account Menu"
              className="h-8 px-2.5 rounded-xl bg-[#003178] text-white text-[11px] font-black flex items-center justify-center gap-1.5"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 stroke-current shrink-0"
                fill="none"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6.5" x2="20" y2="6.5" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17.5" x2="20" y2="17.5" />
              </svg>
              {customerName ? (
                <span className="hidden sm:inline truncate max-w-[90px]">
                  {customerName.split(" ")[0]}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Clean Single Search Bar with Rotating Suggestions in Placeholder */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-2.5">
          <div className="flex-1 flex items-center rounded-2xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 focus-within:border-[#003178]">
            <span className="text-xs mr-2">🔍</span>
            <input
              type="text"
              placeholder={
                lang === "hi"
                  ? `"${POPULAR_SEARCH_SUGGESTIONS[placeholderIdx]}" या दुकानें खोजें...`
                  : `Search "${POPULAR_SEARCH_SUGGESTIONS[placeholderIdx]}" or local stores...`
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#131b2e] outline-none placeholder:text-[#737783]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[11px] font-bold text-[#737783] pl-1.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
        {/* ── N-10 Cross-Store Product Search Results ── */}
        {searchQuery.trim().length >= 2 && matchingCatalogProducts.length > 0 && (
          <section className="rounded-3xl bg-white border border-[#dae2fd] p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#003178]">
                Matching Items Across {displayDistrict} ({matchingCatalogProducts.length})
              </h3>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[10.5px] font-bold text-[#006875]"
              >
                Clear Search
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchingCatalogProducts.map(({ item, store }) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#eaedff] bg-[#faf8ff] p-2.5 flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#131b2e] truncate">
                      {item.name}
                    </div>
                    <div className="text-[10.5px] text-[#434652] truncate">
                      {store?.name || `${displayDistrict} Store`} • ₹{item.price}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onQuickAddItem(item)}
                    className="shrink-0 rounded-xl bg-[#003178] hover:bg-[#0d47a1] text-white px-2.5 py-1.5 text-[10.5px] font-black"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── N-08 Categories Directory Tab ── */}
        {bottomTab === "categories" ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#006875]">
                  {displayDistrict} Categories
                </div>
                <h2 className="text-sm font-black text-[#131b2e]">
                  {t(lang, "Explore Local Services", "स्थानीय सेवाएँ चुनें")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCatDisplayMode((m) => (m === "grid" ? "list" : "grid"))}
                className="rounded-xl border border-[#c3c6d4] bg-white px-2.5 py-1 text-[11px] font-bold text-[#003178]"
              >
                {catDisplayMode === "grid" ? "☰ List" : "⊞ Grid"}
              </button>
            </div>

            <div
              className={
                catDisplayMode === "grid"
                  ? "grid grid-cols-3 gap-2"
                  : "flex flex-col gap-2"
              }
            >
              {BAHRAICH_12_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (cat.id === "smart_parcha") {
                      onOpenSmartParcha();
                      return;
                    }
                    setActiveTab(cat.vertical);
                    setSearchQuery(cat.searchTag);
                    setBottomTab("home");
                  }}
                  className={`rounded-2xl border transition ${
                    catDisplayMode === "grid"
                      ? "p-2.5 text-center flex flex-col items-center justify-center gap-1.5 min-h-[84px]"
                      : "px-3 py-2.5 text-left flex items-center justify-between"
                  } ${cat.accent} hover:shadow-xs`}
                >
                  <div className={catDisplayMode === "grid" ? "flex flex-col items-center gap-1" : "flex items-center gap-2.5"}>
                    <span className={catDisplayMode === "grid" ? "text-xl leading-none" : "text-xl"}>{cat.emoji}</span>
                    <div>
                      <div className="text-[11px] font-black leading-tight">
                        {lang === "hi" ? cat.titleHi : cat.title}
                      </div>
                      {catDisplayMode === "list" && (
                        <div className="text-[10px] opacity-75">{displayDistrict} Local</div>
                      )}
                    </div>
                  </div>
                  {catDisplayMode === "list" && (
                    <span className="text-[11px] font-bold">Explore →</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        ) : (
          /* ── N-07 Home Hub + N-09 Vertical Browser + N-12 Map ── */
          <>
            {/* Slim Hero SpeedPass + Trustit Reward Points Card */}
            <section className="rounded-2xl bg-gradient-to-r from-[#003178] via-[#0d47a1] to-[#006875] text-white px-3.5 py-2.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#9cf0ff] truncate">
                    ⚡ Trustit • {displayDistrict}
                  </div>
                  <h2 className="text-xs sm:text-sm font-black leading-tight truncate">
                    {t(
                      lang,
                      "Verified Local Shops • 25-Min Delivery",
                      `${displayDistrict} की भरोसेमंद दुकानें • 25 मिनट डिलीवरी`,
                    )}
                  </h2>
                </div>
                <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[9.5px] font-black text-[#8df7c1]">
                  SpeedPass
                </span>
              </div>

              <div className="rounded-xl bg-white/12 border border-white/15 px-3 py-1.5 flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#9cf0ff]">★ Points:</span>
                  <span className="text-sm font-black text-white">
                    {rewardPoints.toLocaleString("en-IN")} pts
                  </span>
                </div>

                <span className="text-[9.5px] font-bold text-[#d9e2ff] bg-white/10 rounded-lg px-2 py-0.5">
                  350 pts = ₹100
                </span>

                <div className="flex items-baseline gap-1">
                  <span className="text-[9.5px] font-bold text-[#8df7c1]">Value:</span>
                  <span className="text-sm font-black text-[#8df7c1]">
                    ₹{Number.isInteger(pointsInrValue) ? pointsInrValue : pointsInrValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={onRequestLogin || onOpenProfile}
                  className="w-full rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-2.5 py-1 text-[10.5px] font-bold text-[#9cf0ff] text-center transition"
                >
                  {t(
                    lang,
                    "Sign in with Mobile OTP to earn & redeem points →",
                    "पॉइंट्स कमाने व इस्तेमाल करने के लिए लॉगिन करें →",
                  )}
                </button>
              )}
            </section>

            {/* Quick Category Strip */}
            <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {BAHRAICH_12_CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (cat.id === "smart_parcha") {
                      onOpenSmartParcha();
                      return;
                    }
                    setActiveTab(cat.vertical);
                    setSearchQuery(cat.searchTag);
                  }}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#eaedff] bg-white hover:border-[#003178]/40 px-2.5 py-1.5 text-[11px] font-extrabold text-[#131b2e] shadow-2xs transition"
                >
                  <span className="text-sm">{cat.emoji}</span>
                  <span>{lang === "hi" ? cat.titleHi : cat.title}</span>
                </button>
              ))}
            </section>

            {/* N-09 Store Cards Grid */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#434652]">
                  {filteredBusinesses.length} Partner Stores in {displayDistrict}
                </h3>
                <div className="flex items-center gap-2">
                  {activeTab !== "food" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("food")}
                      className="rounded-full bg-[#f2f3ff] border border-[#dae2fd] px-2.5 py-0.5 text-[10px] font-black text-[#003178]"
                    >
                      All Stores ✕
                    </button>
                  )}
                  {activeTab === "medical" && (
                    <button
                      type="button"
                      onClick={onOpenMedicalRx}
                      className="text-[11px] font-extrabold text-[#003d27] hover:underline"
                    >
                      💊 Upload Doctor Rx →
                    </button>
                  )}
                </div>
              </div>

                {filteredBusinesses.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#c3c6d4] bg-white p-8 text-center space-y-2">
                    <div className="text-2xl">🏪</div>
                    <div className="text-xs font-extrabold text-[#131b2e]">
                      No stores match your active filters.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveTab("food");
                      }}
                      className="rounded-xl bg-[#003178] text-white px-4 py-2 text-xs font-bold"
                    >
                      Show All Stores
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBusinesses.map((store) => {
                      const eta = estimateStoreEtaMinutes(store, userCoords);
                      const dist = calcDistanceKm(
                        userCoords?.lat,
                        userCoords?.lng,
                        store.location_latitude,
                        store.location_longitude,
                      );
                      const openStatus = isStoreCurrentlyOpen();
                      const sampleDish = catalogItems.find((i) => i.business_id === store.id);
                      const isFav = favoriteStoreIds.includes(store.id);

                      return (
                        <button
                          key={store.id}
                          type="button"
                          onClick={() => onSelectStore(store)}
                          className="rounded-3xl border border-[#eaedff] bg-white p-3 text-left flex gap-3 hover:border-[#003178]/40 hover:shadow-sm transition group"
                        >
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-[#f2f3ff]">
                            <img
                              src={getRestaurantThumbnail(store.name)}
                              alt={store.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                {Boolean(store.is_verified) && (
                  <span className="absolute top-1.5 left-1.5 rounded-md bg-[#003178]/90 text-white px-1.5 py-0.5 text-[9px] font-black">
                    ✓ Verified
                  </span>
                )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="text-xs sm:text-sm font-black text-[#131b2e] leading-snug line-clamp-1">
                                  {store.name}
                                </h4>
                                <span className="shrink-0 rounded-lg bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                                  ★ {getStoreRating(store.id)}
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-[#006875] mt-0.5">
                                {eta} mins • {dist} km • {openStatus.label} {isFav ? "❤️" : ""}
                              </div>
                              <p className="text-[11px] text-[#434652] truncate mt-1">
                                {sampleDish
                                  ? `${sampleDish.name} — ₹${sampleDish.price}`
                                  : store.type}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-[#f2f3ff] text-[10.5px]">
                              <span className="text-[#737783] truncate max-w-[140px]">
                                {store.address || displayDistrict}
                              </span>
                              <span className="font-black text-[#003178] shrink-0">Open →</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

            {/* Quick Smart Parcha Action Banner */}
            <section>
              <button
                type="button"
                onClick={onOpenSmartParcha}
                className="w-full rounded-2xl border border-[#dae2fd] bg-gradient-to-r from-[#f2f3ff] to-white px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:border-[#003178]/40 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="h-9 w-9 rounded-xl bg-[#003178] text-white text-base flex items-center justify-center shrink-0">
                    📝
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#003178] truncate">
                      {t(lang, "Kirana Smart Parcha (5-Min Quote)", "किराना स्मार्ट पर्चा (5 मिनट में रेट)")}
                    </div>
                    <div className="text-[10.5px] text-[#434652] truncate">
                      {t(lang, "Upload handwritten list or click live photo", "हाथ से लिखी लिस्ट या लाइव फोटो भेजें")}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-[#003178] text-white px-2.5 py-1.5 text-[10.5px] font-black">
                  Send →
                </span>
              </button>
            </section>

            {/* Popular Local Picks */}
            {catalogItems.filter((i) => i.is_available).length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#434652]">
                    {t(lang, `Popular in ${displayDistrict}`, `${displayDistrict} के पसंदीदा आइटम`)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setBottomTab("categories")}
                    className="text-[11px] font-extrabold text-[#003178] hover:underline"
                  >
                    See Categories →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {catalogItems
                    .filter((i) => i.is_available)
                    .slice(0, 4)
                    .map((item) => {
                      const store = businesses.find((b) => b.id === item.business_id);
                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-[#eaedff] bg-white p-2.5 flex flex-col justify-between gap-2 shadow-2xs"
                        >
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-black text-[#131b2e] line-clamp-1">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-[#737783] truncate">
                              {store?.name || displayDistrict}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-[#003178]">₹{item.price}</span>
                            <button
                              type="button"
                              onClick={() => onQuickAddItem(item)}
                              className="rounded-lg bg-[#f2f3ff] hover:bg-[#003178] hover:text-white border border-[#dae2fd] px-2.5 py-1 text-[10px] font-black text-[#003178] transition"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ── Sticky Single-Store Cart Strip ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-3">
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={onOpenCheckout}
              className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] text-white px-4 py-2.5 shadow-xl flex items-center justify-between text-xs font-black border border-white/20"
            >
              <span className="truncate">
                🛒 {cartCount} Item(s) • {cartStoreName}
              </span>
              <span className="shrink-0 ml-2">Checkout ₹{cartGrandTotal} →</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 5-Tab Bottom Navigation Bar (Option B: Home, Categories, Orders [Center Raised Live], Scan QR, Account) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#eaedff] px-2 py-1.5 shadow-lg">
        <div className="max-w-lg mx-auto grid grid-cols-5 items-center text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setBottomTab("home")}
            className={`flex flex-col items-center py-1 ${
              bottomTab === "home" ? "text-[#003178] font-black" : "text-[#737783]"
            }`}
          >
            <span className="text-base">🏠</span>
            <span>{t(lang, "Home", "होम")}</span>
          </button>

          <button
            type="button"
            onClick={() => setBottomTab("categories")}
            className={`flex flex-col items-center py-1 ${
              bottomTab === "categories" ? "text-[#003178] font-black" : "text-[#737783]"
            }`}
          >
            <span className="text-base">⊞</span>
            <span>{t(lang, "Categories", "श्रेणियाँ")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenActiveOrders}
            className="relative flex flex-col items-center -mt-4"
            title="View Active & Past Orders"
          >
            <span
              className={`relative h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 border-white transition ${
                totalActiveCount > 0
                  ? "bg-gradient-to-br from-[#059669] to-[#006875] text-white"
                  : "bg-gradient-to-br from-[#003178] to-[#0d47a1] text-white"
              }`}
            >
              <span>📦</span>
              {totalActiveCount > 0 && (
                <>
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] rounded-full bg-rose-600 border-2 border-white text-white text-[10px] font-black flex items-center justify-center px-1 shadow">
                    {totalActiveCount}
                  </span>
                  <span className="absolute top-0.5 left-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
                  </span>
                </>
              )}
            </span>
            <span className="text-[#003178] font-black mt-0.5">
              {totalActiveCount > 0
                ? `${t(lang, "Orders", "ऑर्डर")} (${totalActiveCount})`
                : t(lang, "Orders", "ऑर्डर")}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenStandeeScanner}
            className="flex flex-col items-center py-1 text-[#737783] hover:text-[#003178]"
            title="Scan Counter Standee QR"
          >
            <span className="text-base">📷</span>
            <span>{t(lang, "Scan QR", "स्कैन QR")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex flex-col items-center py-1 text-[#737783] hover:text-[#003178]"
          >
            <span className="text-base">👤</span>
            <span>{t(lang, "Account", "अकाउंट")}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
