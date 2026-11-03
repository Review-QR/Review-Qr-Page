"use client";

import React, { useState } from "react";

interface Screen21Props {
  onBack?: () => void;
  onCustomizeProduct?: (productId: string) => void;
  onViewCart?: () => void;
}

export default function Screen21MerchandiseCatalog({
  onBack,
  onCustomizeProduct,
  onViewCart,
}: Screen21Props) {
  const products = [
    {
      id: "acrylic_a5",
      name: "Premium Acrylic A5 Standee",
      price: 299,
      mrp: 499,
      rating: 4.9,
      reviews: 320,
      icon: "🏆",
      tag: "Best Seller",
      desc: "Scratch-resistant crystal clear acrylic with laser engraved QR and Google Reviews badge.",
    },
    {
      id: "wood_tent",
      name: "Tabletop Teak Wood Block (Pack of 5)",
      price: 549,
      mrp: 899,
      rating: 4.8,
      reviews: 140,
      icon: "🪵",
      tag: "Dine-In Favorite",
      desc: "Natural teak wood finish perfect for cafe dining tables and restaurant counters.",
    },
    {
      id: "nfc_puck",
      name: "NFC One-Tap Review Puck",
      price: 399,
      mrp: 699,
      rating: 5.0,
      reviews: 85,
      icon: "⚡",
      tag: "Smart Tech",
      desc: "Customers simply tap their iPhone or Android phone to instantly open your Google Review page.",
    },
    {
      id: "vinyl_kit",
      name: "All-Weather Vinyl Sticker Pack (10 pcs)",
      price: 199,
      mrp: 349,
      rating: 4.7,
      reviews: 210,
      icon: "🏷️",
      tag: "Waterproof",
      desc: "Heavy-duty UV laminated door and counter stickers that never fade under sunlight.",
    },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              MERCHANDISE &amp; HARDWARE
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              QR Standees &amp; Store Kits
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

        {/* Free Shipping Banner */}
        <div className="mt-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black">Doorstep Delivery Across UP</span>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              Free Shipping &gt; ₹499
            </span>
          </div>
          <p className="text-[10px] text-blue-100 mt-0.5">
            Pre-configured with your exact Golden Blossom Cafe QR code &amp; brand colors.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-3 space-y-2.5">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shadow-2xs">
                    {p.icon}
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {p.tag}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 mt-0.5 leading-tight">{p.name}</h3>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed">{p.desc}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                  <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onCustomizeProduct?.(p.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
                >
                  Customize &amp; Order →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Float */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onViewCart}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>🛒 View Cart &amp; Checkout (1 Item)</span>
        </button>
      </div>
    </div>
  );
}
