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
  const [currentRuleIndex, setCurrentRuleIndex] = useState<number>(0);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);

  // Strict 2-Option state (Option A = 1, Option B = 2)
  const [answer1, setAnswer1] = useState<1 | 2 | null>(null);
  const [answer2, setAnswer2] = useState<1 | 2 | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const { rider, completeAcademy, isLoading } = useRiderAuth();

  const rules = [
    {
      num: 1,
      icon: "🎒",
      title: "Rule 1: Insulated Thermal Delivery Bag",
      desc: "Place hot items inside the insulated thermal chamber and cold drinks in designated exterior pouches. Always keep the zip securely closed.",
    },
    {
      num: 2,
      icon: "🔒",
      title: "Rule 2: Tamper-Evident Restaurant Seal Policy",
      desc: "Never break or open merchant safety tape or Trustit packaging. If a package is leaking or damaged at pickup, report it immediately before leaving store.",
    },
    {
      num: 3,
      icon: "🤝",
      title: "Rule 3: Mandatory 4-Digit Delivery OTP",
      desc: "Upon reaching customer doorstep, ask for and verify the 4-digit secret OTP shown on their Trustit app. Never release parcels without OTP verification.",
    },
    {
      num: 4,
      icon: "💳",
      title: "Rule 4: Official In-App Cashfree QR Only",
      desc: "Never demand even ₹1 extra cash tip from customer. For Cash on Delivery, always present the official Trustit Cashfree dynamic QR code. Personal QR codes are strictly prohibited.",
    },
  ];

  // Selection handlers with strict Lock (Once selected, choice cannot be changed)
  const handleSelectOption1 = (opt: 1 | 2) => {
    if (answer1 !== null) return; // Locked!
    setAnswer1(opt);
  };

  const handleSelectOption2 = (opt: 1 | 2) => {
    if (answer2 !== null) return; // Locked!
    setAnswer2(opt);
  };

  // Evaluation
  const isQ1Correct = answer1 === 1; // Option A is correct
  const isQ2Correct = answer2 === 2; // Option B is correct
  const isBothAnswered = answer1 !== null && answer2 !== null;
  const isPassed = isQ1Correct && isQ2Correct;

  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    if (isPassed) {
      if (rider?.id) {
        await completeAcademy(rider.id);
      }
      onCompleteAcademy?.();
    } else {
      setFailedMessage(
        "You did not pass the safety quiz. Please review the safety guidelines and retake the test."
      );
    }
  };

  // Reset and return to Rule 1
  const handleResetToRules = () => {
    setAnswer1(null);
    setAnswer2(null);
    setQuizSubmitted(false);
    setFailedMessage(null);
    setIsQuizMode(false);
    setCurrentRuleIndex(0);
  };

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-700 shadow-2xs hover:bg-slate-50 font-bold cursor-pointer"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Training Academy
            </span>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              {isQuizMode ? "Safety & Service Quiz" : "Safety Code & Guidelines"}
            </h2>
          </div>
          <span className="w-8 text-center text-xs">🎓</span>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            VIEW 1: RULES CAROUSEL (Rider must read through all 4 rules)
           ═════════════════════════════════════════════════════════════════════ */}
        {!isQuizMode && (
          <div className="mt-3 space-y-3">
            {/* Rule Progress Indicator */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-500">
                Rule {currentRuleIndex + 1} of 4
              </span>
              <span className="font-black text-[#0D47A1]">
                {Math.round(((currentRuleIndex + 1) / 4) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0D47A1] h-full transition-all duration-300"
                style={{ width: `${((currentRuleIndex + 1) / 4) * 100}%` }}
              ></div>
            </div>

            {/* Rule Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shadow-inner">
                {rules[currentRuleIndex].icon}
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                {rules[currentRuleIndex].title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {rules[currentRuleIndex].desc}
              </p>
            </div>

            {/* Navigation between rules */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={currentRuleIndex === 0}
                onClick={() => setCurrentRuleIndex((c) => Math.max(0, c - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-30 bg-white cursor-pointer"
              >
                ← Previous
              </button>

              {currentRuleIndex < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentRuleIndex((c) => Math.min(3, c + 1))}
                  className="px-5 py-2 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white text-xs font-black shadow transition cursor-pointer"
                >
                  Next Rule ➔
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsQuizMode(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  Start Quiz 📝
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            VIEW 2: MANDATORY QUIZ (Strictly 2 Options: Option A & Option B)
           ═════════════════════════════════════════════════════════════════════ */}
        {isQuizMode && (
          <div className="mt-3 space-y-3.5">
            {/* Failure Alert Banner */}
            {failedMessage && (
              <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 text-center space-y-2 shadow-md">
                <span className="text-2xl block">❌</span>
                <h4 className="text-sm font-black text-rose-950">Test Incomplete</h4>
                <p className="text-xs text-rose-800 leading-snug">{failedMessage}</p>
                <button
                  type="button"
                  onClick={handleResetToRules}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow mt-1 transition cursor-pointer"
                >
                  📖 Re-read Safety Rules &amp; Retake
                </button>
              </div>
            )}

            {!failedMessage && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                <p className="text-xs font-bold text-slate-500 text-center">
                  Note: Choices lock immediately upon selection.
                </p>

                {/* ── QUESTION 1 ── */}
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 leading-tight">
                    Question 1: When must the rider hand over the delivery package to the customer?
                  </h4>

                  <div className="space-y-2 text-xs">
                    {/* Option A */}
                    <button
                      type="button"
                      disabled={answer1 !== null}
                      onClick={() => handleSelectOption1(1)}
                      className={`w-full text-left p-3 rounded-xl border-2 font-bold transition flex items-center justify-between ${
                        answer1 === 1
                          ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      } ${answer1 !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span>
                        <strong>Option A:</strong> After verifying the 4-digit secret OTP shown on customer&apos;s phone
                      </span>
                      <span className="text-sm font-mono shrink-0 ml-2">
                        {answer1 === 1 ? "🔒 [A]" : "(A)"}
                      </span>
                    </button>

                    {/* Option B */}
                    <button
                      type="button"
                      disabled={answer1 !== null}
                      onClick={() => handleSelectOption1(2)}
                      className={`w-full text-left p-3 rounded-xl border-2 font-bold transition flex items-center justify-between ${
                        answer1 === 2
                          ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      } ${answer1 !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span>
                        <strong>Option B:</strong> Hand it over immediately outside door without asking for OTP
                      </span>
                      <span className="text-sm font-mono shrink-0 ml-2">
                        {answer1 === 2 ? "🔒 [B]" : "(B)"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* ── QUESTION 2 ── */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 leading-tight">
                    Question 2: How must the rider collect Cash on Delivery (COD) payment?
                  </h4>

                  <div className="space-y-2 text-xs">
                    {/* Option A */}
                    <button
                      type="button"
                      disabled={answer2 !== null}
                      onClick={() => handleSelectOption2(1)}
                      className={`w-full text-left p-3 rounded-xl border-2 font-bold transition flex items-center justify-between ${
                        answer2 === 1
                          ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      } ${answer2 !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span>
                        <strong>Option A:</strong> Ask customer for extra cash tip over the order bill
                      </span>
                      <span className="text-sm font-mono shrink-0 ml-2">
                        {answer2 === 1 ? "🔒 [A]" : "(A)"}
                      </span>
                    </button>

                    {/* Option B */}
                    <button
                      type="button"
                      disabled={answer2 !== null}
                      onClick={() => handleSelectOption2(2)}
                      className={`w-full text-left p-3 rounded-xl border-2 font-bold transition flex items-center justify-between ${
                        answer2 === 2
                          ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      } ${answer2 !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span>
                        <strong>Option B:</strong> Present only the official Trustit Cashfree dynamic QR code
                      </span>
                      <span className="text-sm font-mono shrink-0 ml-2">
                        {answer2 === 2 ? "🔒 [B]" : "(B)"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Submit Button */}
      {isQuizMode && !failedMessage && (
        <div className="pt-3 border-t border-slate-200 mt-3">
          <button
            type="button"
            disabled={!isBothAnswered || isLoading}
            onClick={handleSubmitQuiz}
            className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] ${
              isBothAnswered
                ? "bg-[#0D47A1] hover:bg-[#082b66] text-white cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>Submit Quiz Answers</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
