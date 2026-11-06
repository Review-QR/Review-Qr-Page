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
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [currentRuleIndex, setCurrentRuleIndex] = useState<number>(0);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);

  // Strict 2-Option state (Option A = 1, Option B = 2)
  const [answer1, setAnswer1] = useState<1 | 2 | null>(null);
  const [answer2, setAnswer2] = useState<1 | 2 | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const { rider, completeAcademy, isLoading } = useRiderAuth();

  const rulesHi = [
    {
      num: 1,
      icon: "🎒",
      title: "नियम 1: इंसुलेटेड थर्मल डिलीवरी बैग का उपयोग",
      desc: "गर्म खाना मुख्य इंसुलेटेड चेंबर में रखें और ठंडे पेय पदार्थ बाहरी पॉकेट में। खाना ठंडा न हो, इसके लिए बैग की चेन हमेशा पूरी तरह बंद रखें।",
    },
    {
      num: 2,
      icon: "🔒",
      title: "नियम 2: रेस्टोरेंट सुरक्षा टेप व नो-टैम्पर पॉलिसी",
      desc: "रेस्टोरेंट की सुरक्षा सील या Trustit टेप को कभी न खोलें। यदि दुकान से लेते समय पैकेट लीक या फटा हो, तो वहीं दुकानदार को सूचित करें।",
    },
    {
      num: 3,
      icon: "🤝",
      title: "नियम 3: 4-अंकीय डिलीवरी OTP का अनिवार्य सत्यापन",
      desc: "ग्राहक के घर पहुँचने पर पहले 4-अंकीय OTP पूछकर ऐप में दर्ज करें। बिना OTP दर्ज किए ग्राहक को कभी भी सामान न सौंपें।",
    },
    {
      num: 4,
      icon: "💳",
      title: "नियम 4: केवल ऐप का आधिकारिक Cashfree QR ही दिखाएं",
      desc: "कैश ऑन डिलीवरी (COD) ऑर्डर में बिल से ₹1 भी अधिक न मांगें। भुगतान के लिए केवल ऐप का आधिकारिक Cashfree QR दिखाएं; निजी QR दिखाना सख्त मना है।",
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
        "आप परीक्षा में अनुत्तीर्ण (Failed) हो गए हैं। सुरक्षा नियमों को पुनः ध्यान से पढ़ें और फिर से टेस्ट दें।"
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
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-700 shadow-2xs hover:bg-slate-50 font-bold"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              ट्रेनिंग अकादमी (Training Academy)
            </span>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              {isQuizMode ? "सुरक्षा एवं सेवा क्विज़" : "सुरक्षा नियमावली"}
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
                नियम {currentRuleIndex + 1} / 4
              </span>
              <span className="font-black text-[#0D47A1]">
                {Math.round(((currentRuleIndex + 1) / 4) * 100)}% पूर्ण
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
                {rulesHi[currentRuleIndex].icon}
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                {rulesHi[currentRuleIndex].title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {rulesHi[currentRuleIndex].desc}
              </p>
            </div>

            {/* Navigation between rules */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={currentRuleIndex === 0}
                onClick={() => setCurrentRuleIndex((c) => Math.max(0, c - 1))}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-30 bg-white"
              >
                ← पिछला नियम
              </button>

              {currentRuleIndex < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentRuleIndex((c) => Math.min(3, c + 1))}
                  className="px-5 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white text-xs font-black shadow transition"
                >
                  अगला नियम ➔
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsQuizMode(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition"
                >
                  क्विज़ शुरू करें (Start Quiz) 📝
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
                <h4 className="text-sm font-black text-rose-950">अनुत्तीर्ण (Failed)</h4>
                <p className="text-xs text-rose-800 leading-snug">{failedMessage}</p>
                <button
                  type="button"
                  onClick={handleResetToRules}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow mt-1 transition"
                >
                  📖 नियमावली के मुख्य पेज पर वापस जाएं (Re-read Rules)
                </button>
              </div>
            )}

            {!failedMessage && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                <p className="text-xs font-bold text-slate-500 text-center">
                  नोट: विकल्प चुनते ही वह लॉक हो जाएगा (Once selected, choice locks).
                </p>

                {/* ── QUESTION 1 ── */}
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 leading-tight">
                    प्रश्न 1: ग्राहक को डिलीवरी पैकेट कब हैंडओवर करना चाहिए?
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
                        <strong>विकल्प A:</strong> ग्राहक के फ़ोन पर आया 4-अंकीय OTP सत्यापित करने के बाद
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
                        <strong>विकल्प B:</strong> घर के बाहर पहुँचते ही बिना OTP पैकेट ग्राहक को दे दें
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
                    प्रश्न 2: कैश ऑन डिलीवरी (COD) के समय राइडर को क्या करना चाहिए?
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
                        <strong>विकल्प A:</strong> ग्राहक से ₹20 अतिरिक्त डिलीवरी टिप नकद मांगें
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
                        <strong>विकल्प B:</strong> केवल Trustit ऐप का आधिकारिक Cashfree QR ही दिखाएं
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
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] ${
              isBothAnswered
                ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>क्विज़ सबमिट करें (Submit Answers)</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
