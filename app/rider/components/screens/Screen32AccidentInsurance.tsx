"use client";

import React, { useState } from "react";

interface Screen32Props {
  onBack?: () => void;
  onConsentAccepted?: () => void;
}

export default function Screen32AccidentInsurance({
  onBack,
  onConsentAccepted,
}: Screen32Props) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const rules = [
    {
      icon: "🪖",
      title: "ISI-Mark Helmet Mandatory",
      desc: "Wearing a certified helmet is mandatory on every trip. No delivery may be conducted without a helmet.",
      badge: "Must Follow",
    },
    {
      icon: "⚡",
      title: "Speed Limit: Max 35 km/h",
      desc: "Adhere to a maximum of 35 km/h in Chowk Bazar, Kachehri Road, Dargah Sharif, and busy alleys.",
      badge: "City Speed",
    },
    {
      icon: "📵",
      title: "Zero Phone Distraction",
      desc: "Do not hold your phone while riding. Use audio prompts or pull over safely to inspect routes.",
      badge: "Zero Distraction",
    },
    {
      icon: "🚦",
      title: "Traffic Signals & Pedestrians",
      desc: "Respect red lights, one-way zones, and zebra crossings. Pedestrians always have the right of way.",
      badge: "Law Compliant",
    },
    {
      icon: "🚂",
      title: "Railway Crossing Caution",
      desc: "Never rush or cross under closed railway barriers. Always wait until barriers lift fully.",
      badge: "Critical Alert",
    },
    {
      icon: "🎒",
      title: "Reflective Vest & Clean Bag",
      desc: "Keep delivery bag sanitized. Wear high-visibility reflective clothing for night deliveries after 8 PM.",
      badge: "Night Safety",
    },
  ];

  const handleSaveConsent = () => {
    if (!hasAgreed) return;
    setIsSaved(true);
    setTimeout(() => {
      onConsentAccepted?.();
    }, 600);
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Bahraich Rider Safety Code
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight mt-0.5">
              Safe Driving Rules &amp; Road Code
            </h2>
          </div>
          <span className="w-8 text-center text-sm">
            🦺
          </span>
        </div>

        {/* Hero Advisory Banner */}
        <div className="mt-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
              Zero Accident Mission · UP 40
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Rider First
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Your safety is the highest priority for both your family and Trustit. Arriving safely is always more important than speeding to save two minutes.
          </p>
        </div>

        {/* Safety Rules Scrollable List */}
        <div className="mt-3 space-y-2">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex items-start gap-2.5 hover:border-blue-300 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center text-base shrink-0 mt-0.5">
                {rule.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {rule.title}
                  </h4>
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                    {rule.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consent & Acceptance Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2.5">
        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 accent-[#0D47A1] mt-0.5 shrink-0"
          />
          <span className="text-[11px] text-slate-700 leading-tight">
            <strong>I Give My Safety Consent:</strong> I have read and agree to follow all Trustit safe driving guidelines and local UP 40 road safety rules.
          </span>
        </label>

        <button
          type="button"
          onClick={handleSaveConsent}
          disabled={!hasAgreed || isSaved}
          className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
            isSaved
              ? "bg-emerald-600 text-white"
              : hasAgreed
              ? "bg-[#0D47A1] hover:bg-blue-800 text-white active:scale-98"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>{isSaved ? "✓ Safety Consent Recorded" : "I Accept Safety Code"}</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
