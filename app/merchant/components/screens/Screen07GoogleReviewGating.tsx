"use client";

import React, { useState } from "react";

interface Screen07Props {
  onBack?: () => void;
  onSave?: () => void;
}

export default function Screen07GoogleReviewGating({ onBack, onSave }: Screen07Props) {
  const [googlePlaceId, setGooglePlaceId] = useState("ChIJrTLr-GoldenBlossomCafe");
  const [reviewLink, setReviewLink] = useState("https://g.page/r/golden-blossom-cafe/review");
  const [smartGating, setSmartGating] = useState<boolean>(true);
  const [testRating, setTestRating] = useState<number | null>(5);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              MY BUSINESS • REPUTATION
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Google Profile &amp; Smart Review Gating
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

        {/* Google Place Connection Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Google Business Profile</h3>
                <p className="text-[10px] text-slate-500">Connected to Google Maps Bahraich</p>
              </div>
            </div>
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Map Link
            </span>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Google Place ID
            </label>
            <input
              type="text"
              value={googlePlaceId}
              onChange={(e) => setGooglePlaceId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 bg-slate-50 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Direct Review Shortlink
            </label>
            <input
              type="text"
              value={reviewLink}
              onChange={(e) => setReviewLink(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 bg-slate-50 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Smart Gating Engine */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Trustit Smart-Gating Shield</span>
              <p className="text-[10px] text-slate-500">Protects your public 5-star Google rating</p>
            </div>
            <button
              type="button"
              onClick={() => setSmartGating(!smartGating)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                smartGating
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-slate-200 text-slate-600 border-slate-300"
              }`}
            >
              {smartGating ? "Enabled 🛡️" : "Disabled"}
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
              <span className="text-sm">🌟</span>
              <span><strong>4★ or 5★ Ratings:</strong> Redirects customer directly to Google Maps review form to post public review.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <span className="text-sm">💬</span>
              <span><strong>1★ to 3★ Ratings:</strong> Kept in private merchant inbox so you can resolve customer issue before public posting.</span>
            </div>
          </div>

          {/* Interactive Test Simulator */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
              Simulate Customer Scan Flow:
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setTestRating(star)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    testRating === star
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {star} ★
                </button>
              ))}
            </div>
            <div className="mt-2 text-[10px] font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
              {testRating && testRating >= 4 ? (
                <span className="text-emerald-700">➡️ Routed to Google Maps (Public Boost)!</span>
              ) : (
                <span className="text-amber-800">➡️ Routed to Private Merchant Resolution Inbox!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onSave}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          Save Smart Gating Rules
        </button>
      </div>
    </div>
  );
}
