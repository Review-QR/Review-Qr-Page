"use client";

import React, { useState } from "react";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

interface Screen13Props {
  onAddProduct?: () => void;
  onStockToggle?: () => void;
  onBack?: () => void;
}

export default function Screen13MenuExplorer({
  onAddProduct,
  onStockToggle,
  onBack,
}: Screen13Props) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non_veg">("all");
  const [search, setSearch] = useState("");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const categories = ["All", "Beverages", "Snacks", "Sandwiches", "Combos"];

  const items = [
    { id: 1, name: "Hazelnut Cold Frappe", cat: "Beverages", price: 120, type: "veg", inStock: true, orders: 48 },
    { id: 2, name: "Paneer Grilled Sandwich", cat: "Sandwiches", price: 100, type: "veg", inStock: true, orders: 36 },
    { id: 3, name: "Peri-Peri Masala Fries", cat: "Snacks", price: 90, type: "veg", inStock: true, orders: 52 },
    { id: 4, name: "Dark Chocolate Brownie", cat: "Snacks", price: 80, type: "veg", inStock: false, orders: 19 },
    { id: 5, name: "Classic Chicken Burger", cat: "Snacks", price: 140, type: "non_veg", inStock: true, orders: 27 },
  ];

  const filteredItems = items.filter((item) => {
    if (activeCategory !== "All" && item.cat !== activeCategory) return false;
    if (dietFilter !== "all" && item.type !== dietFilter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                CATALOG &amp; PRICING MASTER
              </span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full border ${
                  isSubscribed
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-amber-50 text-amber-900 border-amber-300"
                }`}
              >
                {isSubscribed ? "VIP Unlimited" : "Free Tier: 5 of 5 Items"}
              </span>
            </div>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Menu &amp; Items Manager
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Demo Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsSubscribed(!isSubscribed)}
              className="text-[9px] font-bold px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs"
            >
              {isSubscribed ? "Test Free" : "Test VIP"}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Add */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search dishes or items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-hidden focus:border-blue-600 shadow-2xs"
            />
            <span className="absolute left-2.5 top-2 text-xs text-slate-400">🔍</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isSubscribed) {
                setIsUpgradeModalOpen(true);
              } else {
                onAddProduct?.();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs whitespace-nowrap transition flex items-center gap-1"
          >
            <span>+ Add Item</span>
            {!isSubscribed && <span className="text-[10px] opacity-90">🔒</span>}
          </button>
        </div>

        {/* Free Plan Limit Notice */}
        {!isSubscribed && (
          <div className="mt-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <p className="text-[10px] text-amber-900 font-bold">
                Free Plan: 5/5 Items Used · Mandi Master Rates locked
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="text-[10px] font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded-lg transition"
            >
              Unlock 50+ Items (₹49) →
            </button>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
                activeCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Veg / Non-Veg Quick Chips */}
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setDietFilter("all")}
              className={`px-2 py-0.5 rounded ${dietFilter === "all" ? "bg-slate-200 text-slate-900" : "text-slate-500"}`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setDietFilter("veg")}
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${dietFilter === "veg" ? "bg-emerald-100 text-emerald-900" : "text-slate-500"}`}
            >
              <span>🟢</span> Veg
            </button>
            <button
              type="button"
              onClick={() => setDietFilter("non_veg")}
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${dietFilter === "non_veg" ? "bg-rose-100 text-rose-900" : "text-slate-500"}`}
            >
              <span>🔴</span> Non-Veg
            </button>
          </div>
          <button
            type="button"
            onClick={onStockToggle}
            className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold hover:bg-amber-100"
          >
            ⚡ Bulk 86-Stock
          </button>
        </div>

        {/* Items List */}
        <div className="mt-2.5 space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-2xl border transition shadow-2xs flex items-center justify-between ${
                item.inStock ? "bg-white border-slate-200" : "bg-slate-50/80 border-slate-200 opacity-70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{item.type === "veg" ? "🟢" : "🔴"}</span>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-800 font-mono">₹{item.price}</span>
                    <span>•</span>
                    <span>{item.cat}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{item.orders} sold</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    item.inStock
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {item.inStock ? "In Stock" : "Out of Stock"}
                </span>
                <button
                  type="button"
                  onClick={onAddProduct}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
        5 Dishes Active • Synchronized with Consumer Hyperlocal Ordering App
      </div>

      {/* Universal Upgrade Modal */}
      <UniversalUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="menu"
        onSuccessPay={() => {
          setIsSubscribed(true);
        }}
      />
    </div>
  );
}
