"use client";

import React, { useState } from "react";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

interface Screen18Props {
  onBack?: () => void;
  onSelectTemplate?: (template: string) => void;
}

export default function Screen18StandeeTemplateGallery({
  onBack,
  onSelectTemplate,
}: Screen18Props) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [selected, setSelected] = useState("minimal_white");
  const [tagline, setTagline] = useState("Scan to View Menu, Order & Leave Review");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const templates = [
    {
      id: "minimal_white",
      name: "Modern Minimal White",
      desc: "Clean slate border with blue Trustit seal",
      accent: "bg-white border-blue-600 text-slate-900",
      free: true,
    },
    {
      id: "gold_cafe",
      name: "Gold Luxury Cafe",
      desc: "Warm amber & deep charcoal contrast",
      accent: "bg-amber-900 border-amber-600 text-amber-200",
      free: false,
    },
    {
      id: "neon_dark",
      name: "Cyber Neon Nightlife",
      desc: "High contrast glowing border for pubs & lounges",
      accent: "bg-slate-950 border-purple-500 text-purple-300",
      free: false,
    },
    {
      id: "salon_elegance",
      name: "Salon & Spa Elegance",
      desc: "Rose gold soft tones for beauty parlours",
      accent: "bg-rose-950 border-rose-400 text-rose-200",
      free: false,
    },
    {
      id: "kirana_acrylic",
      name: "Kirana Shuddh Samagri Standee",
      desc: "Electronic weighing scale counter placement",
      accent: "bg-emerald-950 border-emerald-500 text-emerald-200",
      free: false,
    },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                CREATIVE STUDIO
              </span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full border ${
                  isSubscribed
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-amber-50 text-amber-900 border-amber-300"
                }`}
              >
                {isSubscribed ? "VIP Unlocked" : "1 Free Template"}
              </span>
            </div>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Standee Template Designer
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Demo Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsSubscribed(!isSubscribed)}
              className="text-[9px] font-bold px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs"
            >
              {isSubscribed ? "Test Free" : "Test VIP"}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Tagline Editor */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
            Standee Heading &amp; Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
          />
        </div>

        {/* Templates Selector */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
              Choose Standee Design ({templates.length} Templates)
            </span>
            {!isSubscribed && (
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                1 Free · 4 Locked
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((t) => {
              const isLocked = !isSubscribed && !t.free;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (isLocked) {
                      setIsUpgradeModalOpen(true);
                    } else {
                      setSelected(t.id);
                    }
                  }}
                  className={`p-2.5 rounded-2xl border-2 cursor-pointer transition relative overflow-hidden ${
                    selected === t.id && !isLocked
                      ? "border-blue-600 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{t.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                    </div>

                    {isLocked ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <span>🔒</span>
                        <span>₹29</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {t.free ? "Free" : "Unlocked"}
                      </span>
                    )}
                  </div>

                  {/* Micro Visual Card Mockup */}
                  <div className={`mt-2 p-2 rounded-xl border text-[9px] font-bold ${t.accent}`}>
                    <div className="flex justify-between items-center">
                      <span>{t.name}</span>
                      <span className="opacity-80">QR</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            const chosen = templates.find((t) => t.id === selected);
            if (!isSubscribed && chosen && !chosen.free) {
              setIsUpgradeModalOpen(true);
            } else {
              onSelectTemplate?.(selected);
            }
          }}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
        >
          <span>Use This Standee Template</span>
          <span>→</span>
        </button>
      </div>

      {/* Universal Upgrade Modal */}
      <UniversalUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="standees"
        onSuccessPay={() => {
          setIsSubscribed(true);
        }}
      />
    </div>
  );
}
