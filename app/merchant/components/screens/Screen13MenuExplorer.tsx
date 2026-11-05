"use client";

import React, { useState } from "react";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

interface Screen13Props {
  onAddProduct?: () => void;
  onStockToggle?: () => void;
  onBack?: () => void;
  liveCatalog?: any[];
  onToggleItemStock?: (itemId: string, isAvailable: boolean) => void;
  onDeleteItem?: (itemId: string) => void;
}

export default function Screen13MenuExplorer({
  onAddProduct,
  onStockToggle,
  onBack,
  liveCatalog,
  onToggleItemStock,
  onDeleteItem,
}: Screen13Props) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non_veg">("all");
  const [search, setSearch] = useState("");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const defaultItems = [
    { id: "1", name: "Madhur Pure Sugar (5kg Pack)", cat: "Kirana Mandi", price: 215, type: "veg", inStock: true, orders: 48 },
    { id: "2", name: "Aashirvaad Shudh Chakki Atta (10kg)", cat: "Flour & Grains", price: 410, type: "veg", inStock: true, orders: 36 },
    { id: "3", name: "Fortune Sunlite Sunflower Oil (1L)", cat: "Oils & Ghee", price: 135, type: "veg", inStock: true, orders: 52 },
    { id: "4", name: "Tata Salt Vacuum Evaporated (1kg)", cat: "Spices & Salt", price: 28, type: "veg", inStock: true, orders: 19 },
    { id: "5", name: "Surf Excel Quick Wash Detergent (1kg)", cat: "Cleaning", price: 140, type: "veg", inStock: false, orders: 27 },
  ];

  const items = liveCatalog && liveCatalog.length > 0
    ? liveCatalog.map((item) => ({
        id: item.id,
        name: item.name,
        cat: item.category || "General",
        price: Number(item.price) || 0,
        type: item.item_type === "non_veg" ? "non_veg" : "veg",
        inStock: Boolean(item.is_available),
        orders: 24,
      }))
    : defaultItems;

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.cat)))];

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
              <span className="text-[9px] font-extrabold px-2 py-0.2 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-300">
                Live Supabase Synchronized ({items.length} Items)
              </span>
            </div>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Menu &amp; Items Manager
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onAddProduct}
              className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
            >
              + Add Item
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items or grocery products..."
              className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
          </div>

          <button
            type="button"
            onClick={onStockToggle}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] shadow-2xs whitespace-nowrap cursor-pointer"
          >
            ⚡ Out-of-Stock Switch
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold [scrollbar-width:none]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
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
              className={`px-2 py-0.5 rounded cursor-pointer ${dietFilter === "all" ? "bg-slate-200 text-slate-900" : "text-slate-500"}`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setDietFilter("veg")}
              className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${dietFilter === "veg" ? "bg-emerald-100 text-emerald-900" : "text-slate-500"}`}
            >
              <span>🟢</span> Veg
            </button>
            <button
              type="button"
              onClick={() => setDietFilter("non_veg")}
              className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${dietFilter === "non_veg" ? "bg-rose-100 text-rose-900" : "text-slate-500"}`}
            >
              <span>🔴</span> Non-Veg
            </button>
          </div>
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
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleItemStock?.(item.id, !item.inStock)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition ${
                    item.inStock
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  {item.inStock ? "In Stock" : "Out of Stock"}
                </button>
                {onDeleteItem && (
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                    title="Delete item"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
        {items.length} Products Synchronized with Hyperlocal Consumer Super-App
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
