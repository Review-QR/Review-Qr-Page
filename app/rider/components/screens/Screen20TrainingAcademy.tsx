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

  const trainingCardsHi = [
    {
      icon: "🎒",
      title: "1. इंसुलेटेड थर्मल बैग व तापमान सुरक्षा",
      tagline: "गर्म खाना और ठंडा पेय अलग-अलग रखें",
      desc: "गर्म खाना हमेशा मुख्य इंसुलेटेड चेंबर में रखें और ठंडे पेय पदार्थ बाहरी पॉकेट में। खाना ठंडा न हो, इसके लिए बैग की चेन हमेशा पूरी तरह बंद रखें।",
    },
    {
      icon: "🔒",
      title: "2. रेस्टोरेंट सील व नो-टैम्पर नियम",
      tagline: "मर्चेंट की सुरक्षा टेप कभी न हटाएं",
      desc: "हर रेस्टोरेंट सुरक्षा टेप या Trustit स्टीकर लगाता है। दुकान से निकलने से पहले सील अवश्य जांचें। टूटी सील या लीकेज होने पर तुरंत रिपोर्ट करें।",
    },
    {
      icon: "🤝",
      title: "3. डोरस्टेप विनम्रता व 4-अंकीय OTP",
      tagline: "नमस्ते अभिवादन व अनिवार्य सत्यापन",
      desc: "ग्राहक का विनम्रता से अभिवादन करें। ग्राहक के फोन पर दिखने वाला 4-अंकीय डिलीवरी OTP सत्यापित किए बिना पैकेट कभी हैंडओवर न करें।",
    },
    {
      icon: "🚫",
      title: "4. ₹1,500 कैश सीलिंग व आधिकारिक QR",
      tagline: "निजी QR कोड दिखाना सख्त मना है",
      desc: "बिल से ₹1 भी अधिक न मांगें। भुगतान के लिए केवल Trustit ऐप का डायनामिक Cashfree QR ही दिखाएं ताकि राशि तुरंत कंपनी खाते में दर्ज हो।",
    },
  ];

  const trainingCardsEn = [
    {
      icon: "🎒",
      title: "1. Thermal Bag & Chamber Isolation",
      tagline: "Hot Food & Cold Drinks Never Mix",
      desc: "Always keep hot steaming food in the insulated lower chamber and cold beverages in the outer pocket. Zip the bag completely to avoid food cooling down.",
    },
    {
      icon: "🔒",
      title: "2. Zero Tamper & Merchant Tape Seal",
      tagline: "Never Break the Restaurant Sticker",
      desc: "Every merchant applies a security tape or Trustit sticker. Check the seal before leaving the store. If leaking or torn, report it immediately before dispatch.",
    },
    {
      icon: "🤝",
      title: "3. Doorstep Etiquette & 4-Digit OTP",
      tagline: "Polite Greeting & Strict Verification",
      desc: "Greet the customer politely ('Namaste, your Trustit order is here'). Never hand over package before verifying the 4-digit secret delivery OTP.",
    },
    {
      icon: "🚫",
      title: "4. Zero Cash Overcharge Policy",
      tagline: "Strict Cashfree Dynamic QR Remittance",
      desc: "Never ask for ₹1 extra over the exact COD bill. Ask customer to scan Trustit Dynamic UPI QR so payment settles directly into Trustit escrow.",
    },
  ];

  const activeCards = lang === "hi" ? trainingCardsHi : trainingCardsEn;
  const isQuizUnlocked = currentCard >= 3;
  const isPassed = quizAnswer1 === 1 && quizAnswer2 === 2;

  return (
    <div className="w-full h-full max-h-[580px] bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none">
      {/* Header with Language Switcher */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            ←
          </button>

          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200 block">
              {lang === "hi" ? "ट्रेनिंग गेट" : "Stage 2 Gate"}
            </span>
            <h2 className="text-xs font-black text-slate-900 leading-tight">
              {lang === "hi" ? "राइडर सुरक्षा व सेवा अकादमी" : "Rider Safety & Quality Academy"}
            </h2>
          </div>

          {/* DEDICATED LANGUAGE TOGGLE: [ 🇮🇳 हिंदी | English ] (Requested in Loom) */}
          <div className="flex items-center gap-0.5 bg-slate-200 p-0.5 rounded-lg border border-slate-300 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`px-1.5 py-0.5 rounded text-[10px] transition font-bold ${
                lang === "hi"
                  ? "bg-[#0D47A1] text-white font-black shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🇮🇳 हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-1.5 py-0.5 rounded text-[10px] transition font-bold ${
                lang === "en"
                  ? "bg-[#0D47A1] text-white font-black shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Eng
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0D47A1] h-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / 4) * 100}%` }}
          ></div>
        </div>

        {/* Card Carousel vs Mini Quiz */}
        {!isQuizUnlocked ? (
          <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-2xs">
              {activeCards[currentCard].icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#0D47A1] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-block">
              {activeCards[currentCard].tagline}
            </span>
            <h3 className="text-xs font-black text-slate-900 leading-tight">
              {activeCards[currentCard].title}
            </h3>
            <p className="text-[11px] text-slate-600 leading-snug">
              {activeCards[currentCard].desc}
            </p>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={currentCard === 0}
                onClick={() => setCurrentCard((c) => Math.max(0, c - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 disabled:opacity-30"
              >
                {lang === "hi" ? "पिछला" : "Previous"}
              </button>
              <button
                type="button"
                onClick={() => setCurrentCard((c) => Math.min(3, c + 1))}
                className="px-4 py-1.5 rounded-lg bg-[#0D47A1] text-white text-[11px] font-black shadow-2xs hover:bg-blue-800"
              >
                {lang === "hi" ? "अगला नियम ➔" : "Next Rule ➔"}
              </button>
            </div>
          </div>
        ) : (
          /* Mini Quiz Section (Localized in Hindi / English) */
          <div className="mt-2.5 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span className="text-sm">📝</span>
              <div>
                <h4 className="text-[11px] font-black text-slate-900 leading-tight">
                  {lang === "hi" ? "अनिवार्य 2-प्रश्नीय सुरक्षा क्विज़" : "Mandatory 2-Question Safety Quiz"}
                </h4>
                <p className="text-[9px] text-slate-500">
                  {lang === "hi" ? "ड्यूटी शुरू करने के लिए 100% सही उत्तर दें" : "Score 100% to unlock daily duty shift"}
                </p>
              </div>
            </div>

            {/* Q1 */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-800 leading-tight">
                {lang === "hi"
                  ? "प्रश्न 1: ग्राहक को खाने का पैकेट कब हैंडओवर करना चाहिए?"
                  : "Q1: When do you hand over the food packet to customer?"}
              </p>
              <div className="space-y-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuizAnswer1(1)}
                  className={`w-full text-left p-2 rounded-lg border font-bold flex items-center justify-between transition ${
                    quizAnswer1 === 1
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    {lang === "hi"
                      ? "केवल 4-अंकीय सीक्रेट डिलीवरी OTP सत्यापित करने के बाद"
                      : "Only after verifying the 4-digit secret delivery OTP"}
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ml-2 ${
                    quizAnswer1 === 1 ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                  }`}>
                    {quizAnswer1 === 1 ? "✓" : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuizAnswer1(2)}
                  className={`w-full text-left p-2 rounded-lg border font-medium flex items-center justify-between transition ${
                    quizAnswer1 === 2
                      ? "bg-rose-50 border-rose-400 text-rose-950 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    {lang === "hi"
                      ? "बिना OTP पूछे पैकेट तुरंत पकड़ा देना"
                      : "Hand over packet immediately without asking OTP"}
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ml-2 ${
                    quizAnswer1 === 2 ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300"
                  }`}>
                    {quizAnswer1 === 2 ? "✗" : ""}
                  </span>
                </button>
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-800 leading-tight">
                {lang === "hi"
                  ? "प्रश्न 2: ग्राहक से COD कैश कैसे कलेक्ट करना चाहिए?"
                  : "Q2: How should COD cash be collected from customer?"}
              </p>
              <div className="space-y-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuizAnswer2(1)}
                  className={`w-full text-left p-2 rounded-lg border font-medium flex items-center justify-between transition ${
                    quizAnswer2 === 1
                      ? "bg-rose-50 border-rose-400 text-rose-950 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    {lang === "hi"
                      ? "ग्राहक को अपना व्यक्तिगत PhonePe/Paytm QR दिखाना"
                      : "Ask customer to scan personal PhonePe/Paytm QR"}
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ml-2 ${
                    quizAnswer2 === 1 ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300"
                  }`}>
                    {quizAnswer2 === 1 ? "✗" : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuizAnswer2(2)}
                  className={`w-full text-left p-2 rounded-lg border font-bold flex items-center justify-between transition ${
                    quizAnswer2 === 2
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    {lang === "hi"
                      ? "सटीक कैश लेना या आधिकारिक Trustit डायनामिक QR दिखाना"
                      : "Collect exact cash or show Trustit In-App Dynamic QR"}
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ml-2 ${
                    quizAnswer2 === 2 ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                  }`}>
                    {quizAnswer2 === 2 ? "✓" : ""}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-2 border-t border-slate-200 space-y-1">
        <button
          type="button"
          disabled={!isPassed || isLoading}
          onClick={handlePassQuiz}
          className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-2xs hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5"
        >
          <span>
            {isLoading
              ? "Saving Approval..."
              : isPassed
              ? lang === "hi"
                ? "🎉 क्विज़ पास! शिफ्ट अनलॉक करें"
                : "🎉 Pass & Unlock Shift"
              : lang === "hi"
              ? "क्विज़ पूरा करें"
              : "Complete Quiz to Unlock Shift"}
          </span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
