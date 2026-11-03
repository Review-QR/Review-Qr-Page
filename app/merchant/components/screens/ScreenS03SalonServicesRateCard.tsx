"use client";

import React, { useState } from "react";

interface ScreenS03Props {
  onBack?: () => void;
  onAddService?: () => void;
}

export default function ScreenS03SalonServicesRateCard({
  onBack,
  onAddService,
}: ScreenS03Props) {
  const services = [
    { name: "Executive Fade Haircut", time: "25 Mins", price: 150, gender: "Men", popular: true },
    { name: "Beard Shape & Hot Towel Shave", time: "20 Mins", price: 100, gender: "Men", popular: false },
    { name: "Charcoal Face Clean-up & D-Tan", time: "35 Mins", price: 350, gender: "Unisex", popular: true },
    { name: "L'Oreal Hair Spa & Conditioning", time: "45 Mins", price: 650, gender: "Unisex", popular: false },
    { name: "Bridal HD Makeup & Saree Draping", time: "120 Mins", price: 3500, gender: "Women", popular: true },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
              GROOMING RATE CARD
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Salon Services &amp; Packages
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

        {/* Services List */}
        <div className="mt-3 space-y-2">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900">{s.name}</h4>
                    {s.popular && (
                      <span className="text-[8px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                        HOT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>⏱️ {s.time}</span>
                    <span>•</span>
                    <span>{s.gender}</span>
                  </div>
                </div>

                <span className="font-mono text-xs font-black text-slate-900">₹{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddService}
          className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>+ Add New Grooming Service / Package</span>
        </button>
      </div>
    </div>
  );
}
