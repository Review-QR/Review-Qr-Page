"use client";

import React, { useState } from "react";

interface Screen07Props {
  onBack?: () => void;
  onSave?: () => void;
  onSaveGating?: (gating: { googlePlaceId: string; reviewLink: string; minStars: number }) => void;
  initialPlaceId?: string;
  initialReviewLink?: string;
  initialMinStars?: number;
}

export default function Screen07GoogleReviewGating({
  onBack,
  onSave,
  onSaveGating,
  initialPlaceId = "ChIJ_TrustitShriBalajiBahraich",
  initialReviewLink = "https://trustitreview.com/r/m_9118643415_0601",
  initialMinStars = 4,
}: Screen07Props) {
  const [googlePlaceId, setGooglePlaceId] = useState(initialPlaceId);
  const [reviewLink, setReviewLink] = useState(initialReviewLink);
  const [minStars, setMinStars] = useState(initialMinStars);
  const [smartGating, setSmartGating] = useState<boolean>(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    if (onSaveGating) {
      onSaveGating({ googlePlaceId, reviewLink, minStars });
    }
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
              <span className="text-xs font-bold text-slate-900 block">Smart Reputation Gating</span>
              <p className="text-[10px] text-slate-500">Filters 1-3 star reviews to private feedback desk</p>
            </div>
            <button
              type="button"
              onClick={() => setSmartGating(!smartGating)}
              className={`w-9 h-5 rounded-full transition relative p-0.5 ${
                smartGating ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition ${
                  smartGating ? "translate-x-4" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span>★ 4-5 Stars:</span>
              <span>Redirects directly to public Google Maps</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-800 font-bold">
              <span>★ 1-3 Stars:</span>
              <span>Kept internal in Trustit private dispute inbox</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3">
        {saved ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Review Gating Rules Saved!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Save Review Gating Settings
          </button>
        )}
      </div>
    </div>
  );
}
