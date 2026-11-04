"use client";

import React, { useState } from "react";

interface Screen39Props {
  onBack?: () => void;
  onSavePreferences?: () => void;
}

export default function Screen39CategoryToggles({
  onBack,
  onSavePreferences,
}: Screen39Props) {
  const [categories, setCategories] = useState({
    food: true,
    grocery: true,
    pharmacy: true,
    genie: true,
    cake: false,
  });

  const toggleCategory = (cat: keyof typeof categories) => {
    setCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Fleet Preferences
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Delivery Category Opt-In</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            ⚙️
          </span>
        </div>

        {/* Rider Vehicle Info Banner */}
        <div className="mt-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-200 uppercase">Registered Vehicle</span>
            <h3 className="text-sm font-black">Two-Wheeler Partner (UP 40 Verified)</h3>
            <p className="text-[11px] text-blue-200 mt-0.5">Equipped with front footboard for heavy loads</p>
          </div>
          <span className="text-2xl">🛵</span>
        </div>

        {/* Categories Toggles List */}
        <div className="mt-4 space-y-2.5">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Choose What You Want to Deliver:
          </h4>

          {/* 1. Food */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🍔</span>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-900">Food &amp; Restaurants</h5>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700">Core</span>
                </div>
                <p className="text-[10px] text-slate-500">Fast 25-min delivery from local cafes</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleCategory("food")}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                categories.food ? "bg-[#0D47A1] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
            </button>
          </div>

          {/* 2. Heavy Grocery */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🛒</span>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-900">Heavy Grocery &amp; Kirana</h5>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800">
                    +₹20 Bonus
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Atta, oil &amp; staples up to 10 kg</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleCategory("grocery")}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                categories.grocery ? "bg-[#0D47A1] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
            </button>
          </div>

          {/* 3. Pharmacy */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💊</span>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-900">Pharmacy &amp; Medicines</h5>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-50 text-teal-800">
                    High Payout
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Doctor Rx sealed pouches from chemists</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleCategory("pharmacy")}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                categories.pharmacy ? "bg-[#0D47A1] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
            </button>
          </div>

          {/* 4. Genie P2P Courier */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📦</span>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-900">Trustit Genie (P2P Courier)</h5>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-800">
                    ₹65 Avg
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Keys, documents, tiffin pickup &amp; drop</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleCategory("genie")}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                categories.genie ? "bg-[#0D47A1] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
            </button>
          </div>

          {/* 5. Fragile Cakes */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎂</span>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-900">Fragile Cakes &amp; Bakery</h5>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-50 text-pink-800">
                    Smooth Ride
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Birthday cakes requiring flat bag placement</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleCategory("cake")}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                categories.cake ? "bg-[#0D47A1] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onSavePreferences}
          className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
        >
          <span>Save Preferences &amp; Update Dispatch Radar</span>
          <span>✓</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Enabling more categories increases daily earning potential by 45%.
        </p>
      </div>
    </div>
  );
}
