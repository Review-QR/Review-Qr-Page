"use client";

import React, { useState } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";

interface Screen20Props {
  onBack?: () => void;
  onCompleteAcademy?: () => void;
}

export default function Screen20TrainingAcademy({
  onBack,
  onCompleteAcademy,
}: Screen20Props) {
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [quizAnswer1, setQuizAnswer1] = useState<number | null>(null);
  const [quizAnswer2, setQuizAnswer2] = useState<number | null>(null);
  const { rider, completeAcademy, isLoading } = useRiderAuth();

  const handlePassQuiz = async () => {
    if (rider?.id) {
      await completeAcademy(rider.id);
    }
    onCompleteAcademy?.();
  };

  const trainingCards = [
    {
      icon: "🎒",
      title: "1. Thermal Bag & Chamber Isolation",
      tagline: "Hot Food & Cold Drinks Never Mix",
      desc: "Always keep hot steaming biryani/curries in the insulated lower chamber and cold beverages in the outer insulated pocket. Always zip the bag completely to avoid food cooling down.",
    },
    {
      icon: "🔒",
      title: "2. Zero Tamper & Merchant Tape Seal",
      tagline: "Never Break the Restaurant Sticker",
      desc: "Every merchant applies a security tape or Trustit sticker. Check the seal before leaving the store. If the seal is broken or leaking, report it immediately before dispatch.",
    },
    {
      icon: "🤝",
      title: "3. Doorstep Etiquette & 4-Digit OTP",
      tagline: "Polite Greeting & Strict Verification",
      desc: "Greet the customer politely ('Namaste, your Trustit order is here'). Never hand over the package before verifying the 4-digit secret delivery OTP shown on customer's phone.",
    },
    {
      icon: "🚫",
      title: "4. Zero Cash Overcharge Policy",
      tagline: "Strict Cashfree Dynamic QR Remittance",
      desc: "Never ask for ₹1 extra over the exact COD bill amount. Ask the customer to scan the Trustit Dynamic UPI QR on your screen so the payment settles directly into Trustit escrow.",
    },
  ];

  const isQuizUnlocked = currentCard >= 3;
  const isPassed = quizAnswer1 === 1 && quizAnswer2 === 2;

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
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Stage 2 Training Gate
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Rider Safety &amp; Quality Academy</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            {currentCard + 1}/4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0D47A1] h-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / 4) * 100}%` }}
          ></div>
        </div>

        {/* Card Content Carousel */}
        {!isQuizUnlocked ? (
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shadow-xs mb-3">
              {trainingCards[currentCard].icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0D47A1] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {trainingCards[currentCard].tagline}
            </span>
            <h3 className="text-base font-black text-slate-900 mt-2">
              {trainingCards[currentCard].title}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {trainingCards[currentCard].desc}
            </p>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentCard === 0}
                onClick={() => setCurrentCard((c) => Math.max(0, c - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentCard((c) => Math.min(3, c + 1))}
                className="px-5 py-2 rounded-xl bg-[#0D47A1] text-white text-xs font-extrabold shadow-sm hover:bg-blue-800"
              >
                Next Rule →
              </button>
            </div>
          </div>
        ) : (
          /* Mini Quiz Section */
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-base">📝</span>
              <div>
                <h4 className="text-xs font-black text-slate-900">Mandatory 2-Question Safety Quiz</h4>
                <p className="text-[10px] text-slate-500">Score 100% to unlock your daily duty shift</p>
              </div>
            </div>

            {/* Q1 */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold text-slate-800">
                Q1: When do you hand over the food packet to the customer?
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setQuizAnswer1(1)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-bold border transition ${
                    quizAnswer1 === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  ✓ Only after customer verifies the 4-digit secret OTP
                </button>
                <button
                  type="button"
                  onClick={() => setQuizAnswer1(2)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-bold border transition ${
                    quizAnswer1 === 2 ? "bg-red-50 border-red-400 text-red-900" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  ✗ Hand over packet immediately without asking OTP
                </button>
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold text-slate-800">
                Q2: How should COD cash be collected from the customer?
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setQuizAnswer2(1)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-bold border transition ${
                    quizAnswer2 === 1 ? "bg-red-50 border-red-400 text-red-900" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  ✗ Ask customer to scan your personal PhonePe/Paytm QR
                </button>
                <button
                  type="button"
                  onClick={() => setQuizAnswer2(2)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-bold border transition ${
                    quizAnswer2 === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  ✓ Collect exact cash or show Trustit In-App Dynamic QR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={!isPassed || isLoading}
          onClick={handlePassQuiz}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-md hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <span>{isLoading ? "Saving Approval..." : isPassed ? "🎉 Pass & Unlock First Shift" : "Complete Quiz to Unlock Shift"}</span>
          <span>→</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Trustit Fleet Standard · Zero Tolerance on Policy Violations
        </p>
      </div>
    </div>
  );
}
