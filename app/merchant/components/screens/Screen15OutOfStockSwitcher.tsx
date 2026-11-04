"use client";

import React, { useState } from "react";

interface Screen15Props {
  onBack?: () => void;
  catalogItems?: Array<{ id: string | number; name: string; category?: string; is_available?: boolean }>;
  onToggleItem?: (id: string | number, isAvailable: boolean) => void;
}

export default function Screen15OutOfStockSwitcher({ onBack, catalogItems, onToggleItem }: Screen15Props) {
  const initialList = catalogItems && catalogItems.length > 0
    ? catalogItems.map((c) => ({
        id: c.id,
        name: c.name,
        cat: c.category || "General",
        inStock: c.is_available !== false,
      }))
    : [
        { id: 1, name: "Special Shahi Paneer", cat: "Main Course", inStock: true },
        { id: 2, name: "Butter Naan", cat: "Breads", inStock: true },
        { id: 3, name: "Special Kaju Katli", cat: "Sweets", inStock: true },
        { id: 4, name: "Desi Ghee Gulab Jamun", cat: "Sweets", inStock: true },
        { id: 5, name: "Spongy Rasgulla", cat: "Sweets", inStock: false },
      ];

  const [items, setItems] = useState(initialList);

  const toggleStock = (id: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStock = !item.inStock;
          onToggleItem?.(id, nextStock);
          return { ...item, inStock: nextStock };
        }
        return item;
      })
    );
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
              INVENTORY QUICK SWITCH
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Instant 86-Stock Manager
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-2.5 flex items-start gap-2">
          <span className="text-base">⚡</span>
          <div>
            <h3 className="text-xs font-bold text-amber-950">Kitchen Ingredient Run-Out Protection</h3>
            <p className="text-[10px] text-amber-800 leading-relaxed mt-0.5">
              Toggle items OFF instantly when ingredients exhaust. Items will be hidden from consumer app in real time.
            </p>
          </div>
        </div>

        {/* Quick Toggles List */}
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition shadow-2xs flex items-center justify-between ${
                item.inStock ? "bg-white border-slate-200" : "bg-rose-50/50 border-rose-200"
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                <span className="text-[10px] text-slate-500 font-medium">{item.cat}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black ${item.inStock ? "text-emerald-700" : "text-rose-700"}`}>
                  {item.inStock ? "In Stock" : "Sold Out"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStock(item.id)}
                  className={`w-10 h-6 rounded-full transition relative p-0.5 ${
                    item.inStock ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition shadow-xs ${
                      item.inStock ? "translate-x-4" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto Reset Footer */}
      <div className="pt-2 text-center space-y-2">
        <div className="bg-slate-100 rounded-xl p-2 text-[10px] text-slate-600 flex items-center justify-between">
          <span>Auto-Reset All Items Tomorrow Morning</span>
          <span className="font-bold text-blue-600">Enabled (06:00 AM)</span>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Done &amp; Return to Menu
        </button>
      </div>
    </div>
  );
}
