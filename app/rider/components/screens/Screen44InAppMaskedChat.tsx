"use client";

import React, { useState } from "react";

interface Screen44Props {
  onBack?: () => void;
  onCallMasked?: () => void;
}

export default function Screen44InAppMaskedChat({
  onBack,
  onCallMasked,
}: Screen44Props) {
  const [messages, setMessages] = useState([
    { id: 1, sender: "customer", text: "Bhaiya, burger me extra oregano and tissue dalwa dena please.", time: "1:12 PM" },
    { id: 2, sender: "rider", text: "Haan ji ma'am, maine counter par bol diya hai.", time: "1:14 PM" },
    { id: 3, sender: "customer", text: "Gate par aakar call kar dijiyega.", time: "1:15 PM" },
  ]);

  const [inputVal, setInputVal] = useState("");

  const quickChips = [
    "🚪 मैं आपके दरवाज़े पर खड़ा हूं",
    "📍 कृपया कोई नज़दीकी लैंडमार्क बताएं",
    "🛍️ ऑर्डर पैक हो रहा है, 5 मिनट में निकलूंगा",
    "📞 फोन उठा लीजिए कृपया, घंटी बज रही है",
  ];

  const handleSendChip = (chipText: string) => {
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "rider", text: chipText, time: "Just now" },
    ]);
  };

  const handleSendCustom = () => {
    if (!inputVal.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "rider", text: inputVal.trim(), time: "Just now" },
    ]);
    setInputVal("");
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3 sm:p-4 text-[#0F172A] font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 leading-tight">Riya Sharma</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Order #TR-4492 · Civil Lines</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCallMasked}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0D47A1] font-bold text-xs border border-blue-200 flex items-center gap-1 hover:bg-blue-100"
          >
            <span>📞 Call</span>
          </button>
        </div>

        {/* Masked Privacy Disclaimer Pill */}
        <div className="mt-2 bg-slate-100 border border-slate-200 rounded-xl p-1.5 text-center text-[10px] text-slate-500">
          🔒 Number Masked · Direct mobile numbers are never shared
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 my-2 overflow-y-auto space-y-2 p-1 max-h-[300px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "rider" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] p-2.5 rounded-2xl text-xs shadow-2xs ${
                m.sender === "rider"
                  ? "bg-[#0D47A1] text-white rounded-br-xs"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">{m.time}</span>
          </div>
        ))}
      </div>

      {/* 1-Tap Quick Hindi Chips */}
      <div className="space-y-2">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block px-1">
            1-Tap Quick Replies (बिना टाइप किए तुरंत भेजें):
          </span>
          <div className="flex flex-wrap gap-1">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendChip(chip)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold hover:bg-slate-50 active:bg-blue-50 active:border-blue-300 transition shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendCustom()}
            placeholder="Type message in Hindi or English..."
            className="flex-1 bg-transparent px-2 text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
          />
          <button
            type="button"
            onClick={handleSendCustom}
            className="w-8 h-8 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center text-xs font-bold hover:bg-blue-800 shadow-xs shrink-0"
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
}
