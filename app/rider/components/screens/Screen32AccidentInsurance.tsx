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
      title: "ISI-Mark Helmet Mandatory (हेलमेट अनिवार्य)",
      desc: "हर राइड पर हेलमेट पहनना अनिवार्य है। कोई भी डिलीवरी बिना हेलमेट नहीं की जाएगी।",
      badge: "Must Follow",
    },
    {
      icon: "⚡",
      title: "Speed Limit: Max 35 km/h (गति सीमा)",
      desc: "चौक बाजार, कचहरी रोड, दरगाह शरीफ और तंग गलियों में गति सीमा 35 किमी/घंटा है।",
      badge: "City Speed",
    },
    {
      icon: "📵",
      title: "No Phone While Driving (राइडिंग में फोन मना)",
      desc: "गाड़ी चलाते समय हाथ में फोन न लें। केवल वॉयस नेविगेशन सुनें या गाड़ी रोक कर देखें।",
      badge: "Zero Distraction",
    },
    {
      icon: "🚦",
      title: "Traffic Signals & One-Way (ट्रैफिक नियम)",
      desc: "रेड लाइट, वन-वे और जेब्रा क्रॉसिंग का आदर करें। पैदल यात्रियों को प्राथमिकता दें।",
      badge: "Law Compliant",
    },
    {
      icon: "🚂",
      title: "Railway Crossing Caution (रेलवे फाटक सुरक्षा)",
      desc: "बहराइच रेलवे क्रॉसिंग बंद होने पर जल्दबाजी न करें। कभी भी बंद बैरियर के नीचे से न निकलें।",
      badge: "Critical Alert",
    },
    {
      icon: "🎒",
      title: "Clean Bag & Reflective Night Vest (बैग व नाइट स्ट्रिप)",
      desc: "डिलीवरी बैग हमेशा साफ रखें। रात 8 बजे के बाद रिफ्लेक्टिव स्ट्रिप वाली जैकेट पहनें।",
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
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Bahraich Rider Safety Code
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight mt-0.5">
              Safe Driving Rules (सड़क सुरक्षा नियम)
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
            आपकी जान आपके परिवार और ट्रस्टिट दोनों के लिए सबसे कीमती है। डिलीवरी में 2 मिनट लेट होना सुरक्षित पहुंचने से ज्यादा जरूरी कभी नहीं हो सकता।
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
            <strong>I Give My Consent (सहमति):</strong> मैंने ट्रस्टिट के सभी सुरक्षित ड्राइविंग नियम पढ़ लिए हैं। मैं बहराइच की सड़कों पर सुरक्षित गति और ट्रैफिक नियमों का पूरी तरह पालन करूंगा।
          </span>
        </label>

        <button
          type="button"
          onClick={handleSaveConsent}
          disabled={!hasAgreed || isSaved}
          className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition ${
            isSaved
              ? "bg-emerald-600 text-white"
              : hasAgreed
              ? "bg-[#0D47A1] hover:bg-blue-800 text-white active:scale-98"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>{isSaved ? "✓ Safety Consent Recorded" : "I Give My Consent & Accept Safety Code"}</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
