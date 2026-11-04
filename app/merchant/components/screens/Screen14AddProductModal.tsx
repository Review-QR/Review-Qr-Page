"use client";

import React, { useState } from "react";

interface Screen14Props {
  onBack?: () => void;
  onSave?: () => void;
  onSaveProduct?: (product: { name: string; price: number; category: string; itemType: string; prepTime: string }) => void;
}

export default function Screen14AddProductModal({ onBack, onSave, onSaveProduct }: Screen14Props) {
  const [title, setTitle] = useState("Special Paneer Tikka");
  const [price, setPrice] = useState("220");
  const [mrp, setMrp] = useState("260");
  const [category, setCategory] = useState("Starters");
  const [prepTime, setPrepTime] = useState("15");
  const [itemType, setItemType] = useState<"veg" | "non_veg" | "egg">("veg");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !price) return;
    setIsSaving(true);
    const itemData = {
      name: title.trim(),
      price: Number(price),
      category: category.trim(),
      itemType,
      prepTime,
    };
    if (onSaveProduct) {
      onSaveProduct(itemData);
    } else if (onSave) {
      onSave();
    }
    setIsSaving(false);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              CATALOG ITEM EDITOR
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Add / Edit Product Details
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ✕ Close
          </button>
        </div>

        {/* Photo Uploader Box */}
        <div className="mt-2.5 bg-white border border-dashed border-slate-300 rounded-2xl p-3 text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-xl shadow-2xs">
            📸
          </div>
          <p className="text-xs font-bold text-slate-800">Upload Food Photograph</p>
          <span className="text-[10px] text-slate-500 block">PNG, JPG up to 5MB (Square 1:1 recommended)</span>
          <button
            type="button"
            className="mt-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200"
          >
            Choose Image File
          </button>
        </div>

        {/* Form Inputs */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Dish / Product Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Selling Price (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                MRP Strike (₹)
              </label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-400 bg-slate-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category & Diet Type */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-hidden"
              >
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="Sandwiches">Sandwiches</option>
                <option value="Combos">Combos</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Kitchen Prep Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-slate-50"
                />
                <span className="text-[10px] text-slate-500 font-bold">Mins</span>
              </div>
            </div>
          </div>

          {/* Diet Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Food Type Tag
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setItemType("veg")}
                className={`py-1.5 rounded-xl border transition ${
                  itemType === "veg" ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                🟢 Pure Veg
              </button>
              <button
                type="button"
                onClick={() => setItemType("non_veg")}
                className={`py-1.5 rounded-xl border transition ${
                  itemType === "non_veg" ? "bg-rose-50 border-rose-500 text-rose-900" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                🔴 Non-Veg
              </button>
              <button
                type="button"
                onClick={() => setItemType("egg")}
                className={`py-1.5 rounded-xl border transition ${
                  itemType === "egg" ? "bg-amber-50 border-amber-500 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                🟡 Contains Egg
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
        >
          {isSaving ? "Saving to Database..." : "Save & Publish Item to Consumer App"}
        </button>
      </div>
    </div>
  );
}
