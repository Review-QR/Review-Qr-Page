"use client";

import React from "react";

interface Screen16Props {
  onBack?: () => void;
}

export default function Screen16Milestones({ onBack }: Screen16Props) {
  const currentTripsToday = 14;
  const targetTripsToday = 17;
  const remaining = targetTripsToday - currentTripsToday;

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Cockpit</span>
          </button>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            Incentive Engine
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Daily &amp; Weekly Milestones</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hit delivery volume targets to unlock automatic cash bonuses added to your wallet.
          </p>
        </div>

        {/* Daily Hero Target Card */}
        <div className="mt-4 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950/80 block">
                Today&apos;s Lunch &amp; Dinner Goal
              </span>
              <h3 className="text-base font-black text-slate-950 mt-0.5">
                Complete {remaining} more orders today to earn:
              </h3>
            </div>
            <span className="text-3xl">🏆</span>
          </div>

          <div className="bg-slate-950/10 rounded-xl p-2.5 flex items-baseline justify-between border border-slate-950/10">
            <span className="text-xs font-black text-slate-950">₹100 Extra Cash Bonus</span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {currentTripsToday} / {targetTripsToday} Trips
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-950/20 rounded-full overflow-hidden">
            <div
              style={{ width: `${(currentTripsToday / targetTripsToday) * 100}%` }}
              className="h-full bg-slate-950 rounded-full"
            ></div>
          </div>
        </div>

        {/* Incentive Tier List */}
        <div className="mt-4 space-y-2">
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">
            Active Bonus Tiers in Bahraich
          </span>

          <div className="space-y-2 text-xs">
            {/* Tier 1 */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-bold block">Lunch Rush Bonus (12 PM – 3 PM)</strong>
                <span className="text-[10px] text-slate-500">Every order delivered within 30 mins</span>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                +₹10 / trip
              </span>
            </div>

            {/* Tier 2 */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-bold block">Rain &amp; Extreme Weather Surge</strong>
                <span className="text-[10px] text-slate-500">Auto-triggered during heavy rain</span>
              </div>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                +₹25 / trip
              </span>
            </div>

            {/* Tier 3 */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-bold block">Weekly Star Target (50 Trips)</strong>
                <span className="text-[10px] text-slate-500">Maintain &gt; 95% acceptance rate</span>
              </div>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                +₹500 / week
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200 text-center">
        <span className="text-[10px] text-slate-400">
          Bonuses credit directly to your Net Balance at shift end
        </span>
      </div>
    </div>
  );
}
