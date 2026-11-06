"use client";

import React, { useState } from "react";

interface Screen34Props {
  onBack?: () => void;
  onShareWhatsapp?: () => void;
}

export default function Screen34ReferAndBadges({
  onBack,
  onShareWhatsapp,
}: Screen34Props) {
  const [activeTab, setActiveTab] = useState<"tiers" | "refer">("tiers");

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Fleet Rewards
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Tier Badges &amp; Referrals</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-amber-500">
            🥇
          </span>
        </div>

        {/* Tab Selector */}
        <div className="mt-3 flex border border-slate-200 rounded-xl p-1 bg-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("tiers")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "tiers" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            🏆 Gold Tier Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("refer")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "refer" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            🎁 Refer &amp; Earn ₹500
          </button>
        </div>

        {activeTab === "tiers" ? (
          /* Tier Status Showcase */
          <div className="mt-4 space-y-3">
            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-900 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">Trustit Gold Rider</h3>
                    <p className="text-[10px] font-bold text-amber-900">Top 5% of Bahraich Fleet</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/40 text-slate-900">
                  Active
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white/30 backdrop-blur-xs">
                  <span className="text-[10px] text-amber-950 font-bold block">Acceptance Rate</span>
                  <span className="text-base font-black">98.2%</span>
                </div>
                <div className="p-2 rounded-xl bg-white/30 backdrop-blur-xs">
                  <span className="text-[10px] text-amber-950 font-bold block">Fleet Rating</span>
                  <span className="text-base font-black">4.92 ★</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Gold Tier Exclusive Perks:
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                <p className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Zero Withdrawal Fees</strong> on instant daily UPI payouts.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Priority Radar Dispatch</strong> for high-value orders (&gt;₹500).</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Free annual Trustit rain gear &amp; premium helmet voucher.</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Refer and Earn */
          <div className="mt-4 space-y-3">
            <div className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white rounded-2xl p-4 shadow-md text-center">
              <span className="text-3xl">🤝</span>
              <h3 className="text-base font-black mt-1">Earn ₹500 Per Friend</h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
                Invite friends in Bahraich to join the Trustit Fleet. Earn ₹500 cash when they complete their first 25 trips!
              </p>
              <div className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-xl text-xs font-mono font-bold">
                Your Referral Code: <span className="text-amber-300 font-black">TRUSTIT40</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2 text-xs">
              <h4 className="font-black text-slate-900 uppercase text-[11px]">How it works:</h4>
              <p className="text-slate-600">1. Share your link with friends having bike &amp; DL.</p>
              <p className="text-slate-600">2. Friend gets fast-track KYC approval in 2 hours.</p>
              <p className="text-slate-600">3. Both you and friend receive bonus in bank via UPI!</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onShareWhatsapp}
          className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-black text-sm shadow-md hover:bg-emerald-600 transition flex items-center justify-center gap-2"
        >
          <span>Share Referral Link on WhatsApp</span>
          <span>📲</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Over ₹42,000 paid to Bahraich riders in referral bonuses this month!
        </p>
      </div>
    </div>
  );
}
