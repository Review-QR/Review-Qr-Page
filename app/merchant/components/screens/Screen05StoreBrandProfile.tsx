"use client";

import React, { useState } from "react";

interface Screen05Props {
  onBack?: () => void;
  onSave?: () => void;
}

export default function Screen05StoreBrandProfile({ onBack, onSave }: Screen05Props) {
  const [storeName, setStoreName] = useState("Golden Blossom Cafe");
  const [ownerName, setOwnerName] = useState("Supriya Verma");
  const [businessType, setBusinessType] = useState("Cafe & Quick Service Restaurant");
  const [phone, setPhone] = useState("9118643415");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSave?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              MY BUSINESS • IDENTITY
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Store Branding &amp; Credentials
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

        {/* Logo Uploader & Emblem Preview */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-950 border-2 border-amber-800 text-amber-300 flex items-center justify-center font-black text-2xl shadow-sm">
              ☕
            </div>
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 text-[9px] shadow">
              ✏️
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-900">Official Store Logo</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Appears on consumer app, digital bills, KOT tickets, and WhatsApp greeting cards.
            </p>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300"
              >
                Upload New Image
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Store Name (As shown to customers)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Business Category
            </label>
            <input
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Owner / Proprietor Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">
                Registered Contact Mobile
              </label>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ OTP Verified
              </span>
            </div>
            <input
              type="text"
              value={phone}
              disabled
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-100 cursor-not-allowed font-mono"
            />
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3">
        {saved ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Store Profile Updated Successfully!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
          >
            Save Profile Changes
          </button>
        )}
      </div>
    </div>
  );
}
