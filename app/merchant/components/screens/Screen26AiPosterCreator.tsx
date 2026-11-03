"use client";

import React, { useState } from "react";

interface Screen26Props {
  onBack?: () => void;
  onDownloadPoster?: () => void;
}

export default function Screen26AiPosterCreator({
  onBack,
  onDownloadPoster,
}: Screen26Props) {
  const [festival, setFestival] = useState("diwali");
  const [offerText, setOfferText] = useState("Flat 20% Off on All Cold Coffees & Frappes!");
  
  // Coupon Management State (As requested by user)
  const [couponCode, setCouponCode] = useState("DIWALI50");
  const [discountValue, setDiscountValue] = useState("Flat ₹50 OFF");
  const [minOrder, setMinOrder] = useState("₹199");
  const [validityDate, setValidityDate] = useState("Valid till 15 Nov");
  const [showCouponOnPoster, setShowCouponOnPoster] = useState(true);

  const [generating, setGenerating] = useState(false);

  const festivals = [
    { id: "diwali", name: "Diwali Special 🪔", color: "from-amber-900 to-yellow-800" },
    { id: "weekend", name: "Weekend Flash Sale ⚡", color: "from-rose-900 to-purple-900" },
    { id: "newyear", name: "New Year Celebration 🎉", color: "from-blue-900 to-indigo-900" },
  ];

  const couponPresets = [
    { code: "DIWALI50", discount: "Flat ₹50 OFF", min: "₹199" },
    { code: "FESTIVE20", discount: "Flat 20% OFF", min: "₹149" },
    { code: "CHAI10", discount: "Flat ₹10 OFF", min: "₹49" },
    { code: "BUY1GET1", discount: "Buy 1 Get 1 Free", min: "₹249" },
  ];

  const handleGen = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 1000);
  };

  const activeF = festivals.find((f) => f.id === festival) || festivals[0];

  return (
    <div className="w-full h-full bg-[#FAF5FF] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-purple-200">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
              AI CREATIVE STUDIO
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              AI Festival &amp; Social Poster Generator
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
          >
            ← Back
          </button>
        </div>

        {/* Festival Selector Pills */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {festivals.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFestival(f.id)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition text-[11px] ${
                festival === f.id
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* AI Poster Canvas Mockup (Square 1:1) with Dynamic Coupon Box */}
        <div className="mt-2 flex justify-center">
          <div
            className={`w-48 h-48 rounded-2xl bg-gradient-to-br ${activeF.color} p-2.5 text-white flex flex-col justify-between shadow-xl relative overflow-hidden border border-white/20`}
          >
            {/* Top Branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px]">
                  ☕
                </span>
                <span className="text-[8px] font-black tracking-wider uppercase">
                  Golden Blossom
                </span>
              </div>
              <span className="text-[7px] bg-white/20 px-1 rounded font-mono">Civil Lines</span>
            </div>

            {/* Poster Headline */}
            <div className="text-center space-y-0.5">
              <span className="text-[7px] uppercase tracking-widest text-amber-300 font-extrabold block">
                {activeF.name}
              </span>
              <h3 className="text-[11px] font-black leading-tight drop-shadow-sm px-1 line-clamp-2">
                {offerText}
              </h3>
            </div>

            {/* LIVE DYNAMIC COUPON TICKET BADGE ON POSTER (User Feature) */}
            {showCouponOnPoster && (
              <div className="mx-1 my-0.5 bg-black/40 backdrop-blur-2xs border border-dashed border-amber-300/90 rounded-lg p-1 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[8px]">✂️</span>
                  <span className="text-[7px] font-bold text-amber-200 uppercase">USE COUPON:</span>
                  <span className="text-[9px] font-black font-mono bg-amber-400 text-slate-950 px-1 rounded">
                    {couponCode}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[7px] text-white/90 mt-0.5">
                  <span className="font-bold text-emerald-300">{discountValue}</span>
                  <span>•</span>
                  <span>Min {minOrder}</span>
                  <span>•</span>
                  <span>{validityDate}</span>
                </div>
              </div>
            )}

            {/* Bottom Watermark & QR */}
            <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[7px]">
              <span className="font-mono">📞 +91 9118643415</span>
              <span className="bg-white text-slate-900 px-1 rounded font-bold">Scan to Redeem</span>
            </div>
          </div>
        </div>

        {/* Offer Text Editor */}
        <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-2">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Headline Offer Text
            </label>
            <input
              type="text"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              className="w-full px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
            />
          </div>

          {/* ============================================================== */}
          {/* COUPON CODE & PROMO DISCOUNT BOXES (As Requested by User)     */}
          {/* ============================================================== */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider flex items-center gap-1">
                <span>🎟️</span>
                <span>Coupon Code &amp; Promo Discount Settings</span>
              </span>
              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCouponOnPoster}
                  onChange={(e) => setShowCouponOnPoster(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
                <span>Show on Poster</span>
              </label>
            </div>

            {/* Quick Preset Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {couponPresets.map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => {
                    setCouponCode(preset.code);
                    setDiscountValue(preset.discount);
                    setMinOrder(preset.min);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-bold whitespace-nowrap transition border ${
                    couponCode === preset.code
                      ? "bg-purple-100 border-purple-400 text-purple-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {preset.code} ({preset.discount})
                </button>
              ))}
            </div>

            {/* Coupon Code Input & Discount Value */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-0.5">
                  Coupon Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DIWALI50"
                    className="w-full px-2 py-1 rounded-xl border border-purple-300 text-xs font-mono font-black text-purple-900 bg-purple-50/50 uppercase"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px]">🎟️</span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-0.5">
                  Discount Offer
                </label>
                <input
                  type="text"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="e.g. Flat ₹50 OFF"
                  className="w-full px-2 py-1 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            {/* Min Order & Validity Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-0.5">
                  Min Order Value
                </label>
                <input
                  type="text"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="Min Order ₹199"
                  className="w-full px-2 py-1 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-0.5">
                  Validity Text
                </label>
                <input
                  type="text"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  placeholder="Valid till 15 Nov"
                  className="w-full px-2 py-1 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="pt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleGen}
          className="py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          {generating ? "Regenerating..." : "✨ AI Re-Design"}
        </button>
        <button
          type="button"
          onClick={onDownloadPoster}
          className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>📲 WhatsApp Status</span>
        </button>
      </div>
    </div>
  );
}
