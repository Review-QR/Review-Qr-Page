"use client";

import React, { useState } from "react";

interface Screen22Props {
  onBack?: () => void;
  onAddToCart?: () => void;
}

export default function Screen22MockupCustomizer({ onBack, onAddToCart }: Screen22Props) {
  const [size, setSize] = useState<"A5" | "A4">("A5");
  const [qty, setQty] = useState<number>(1);
  const [accent, setAccent] = useState<"gold" | "slate" | "royal">("gold");

  const basePrice = size === "A5" ? 299 : 449;
  const totalPrice = basePrice * qty;

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              HARDWARE CUSTOMIZER
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Acrylic Standee Mockup Studio
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

        {/* 3D Acrylic Standee Preview Simulation */}
        <div className="mt-3 bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300 rounded-3xl p-5 flex flex-col items-center justify-center shadow-inner relative">
          <span className="absolute top-2.5 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Live 3D Print Mockup
          </span>

          {/* Standee Body Mockup */}
          <div
            className={`w-36 h-48 rounded-xl border-4 p-2 shadow-2xl flex flex-col items-center justify-between text-center transition-all ${
              accent === "gold"
                ? "bg-amber-950 border-amber-600 text-amber-100"
                : accent === "royal"
                ? "bg-blue-950 border-blue-500 text-blue-100"
                : "bg-slate-950 border-slate-400 text-white"
            }`}
          >
            <div>
              <div className="w-6 h-6 mx-auto rounded-lg bg-white/20 flex items-center justify-center text-xs">
                ☕
              </div>
              <h4 className="text-[10px] font-black tracking-wider uppercase mt-1 leading-tight">
                Golden Blossom
              </h4>
              <p className="text-[7px] text-white/70">Civil Lines • Bahraich</p>
            </div>

            {/* QR Pattern on Standee */}
            <div className="w-16 h-16 bg-white rounded p-1 shadow">
              <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center text-[7px] text-white font-mono">
                [ QR CODE ]
              </div>
            </div>

            <div className="text-[7px] font-bold tracking-tight">
              <span>SCAN TO ORDER &amp; REVIEW</span>
              <p className="text-[6px] text-amber-400 font-mono mt-0.5">ID: QR-77837892</p>
            </div>
          </div>

          {/* Acrylic Standee Base Plate */}
          <div className="w-44 h-3.5 bg-slate-400/80 rounded-full border border-slate-500 shadow-md -mt-1.5 backdrop-blur-xs"></div>
        </div>

        {/* Configuration Options */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          {/* Accent Color */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Select Theme Accent
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAccent("gold")}
                className={`py-1 rounded-xl border ${accent === "gold" ? "bg-amber-100 border-amber-500 text-amber-950" : "bg-slate-50 border-slate-200"}`}
              >
                Cafe Gold
              </button>
              <button
                type="button"
                onClick={() => setAccent("royal")}
                className={`py-1 rounded-xl border ${accent === "royal" ? "bg-blue-100 border-blue-500 text-blue-950" : "bg-slate-50 border-slate-200"}`}
              >
                Royal Blue
              </button>
              <button
                type="button"
                onClick={() => setAccent("slate")}
                className={`py-1 rounded-xl border ${accent === "slate" ? "bg-slate-200 border-slate-500 text-slate-900" : "bg-slate-50 border-slate-200"}`}
              >
                Onyx Dark
              </button>
            </div>
          </div>

          {/* Size & Quantity Row */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Size
              </label>
              <div className="flex gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSize("A5")}
                  className={`flex-1 py-1 rounded-xl border ${size === "A5" ? "bg-slate-900 text-white" : "bg-slate-50 border-slate-200"}`}
                >
                  A5 Counter
                </button>
                <button
                  type="button"
                  onClick={() => setSize("A4")}
                  className={`flex-1 py-1 rounded-xl border ${size === "A4" ? "bg-slate-900 text-white" : "bg-slate-50 border-slate-200"}`}
                >
                  A4 Large
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Quantity
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 font-black text-xs"
                >
                  -
                </button>
                <span className="flex-1 text-center font-mono font-bold text-xs">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 font-black text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Checkout */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddToCart}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-between px-4"
        >
          <span>Add to Cart &amp; Order</span>
          <span className="font-mono font-black text-sm">₹{totalPrice} →</span>
        </button>
      </div>
    </div>
  );
}
