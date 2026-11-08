"use client";

import React, { useState } from "react";

interface Screen44Props {
  onBack?: () => void;
  onCallMasked?: () => void;
  customerName?: string;
  orderCode?: string;
}

export default function Screen44InAppMaskedChat({
  onBack,
  onCallMasked,
  customerName = "Customer",
  orderCode = "Active Trip",
}: Screen44Props) {
  const [messages, setMessages] = useState<Array<{ id: number; sender: "customer" | "rider" | "system"; text: string; time: string }>>([
    {
      id: 1,
      sender: "system",
      text: "Masked private chat connected for this order. Phone numbers are hidden to protect privacy.",
      time: "Now",
    },
  ]);

  const [inputVal, setInputVal] = useState("");

  const quickChips = [
    "🚪 मैं आपके दरवाज़े पर पहुंच गया हूं",
    "📍 कृपया कोई नज़दीकी लैंडमार्क बताएं",
    "🛍️ ऑर्डर पिकअप हो गया है, रास्ते में हूं",
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
                <h3 className="text-sm font-black text-slate-900 leading-tight">{customerName}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Order #{orderCode}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCallMasked}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0D47A1] font-bold text-xs border border-blue-200 flex items-center gap-1 hover:bg-blue-100"
          >
            <span>📞</span>
            <span>Masked Call</span>
          </button>
        </div>

        {/* Chat History Box */}
        <div className="mt-3 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "system"
                  ? "items-center text-center my-2"
                  : m.sender === "rider"
                  ? "items-end"
                  : "items-start"
              }`}
            >
              {m.sender === "system" ? (
                <div className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] px-3 py-1 rounded-full max-w-xs">
                  🔒 {m.text}
                </div>
              ) : (
                <div
                  className={`max-w-[78%] p-3 rounded-2xl text-xs shadow-xs ${
                    m.sender === "rider"
                      ? "bg-[#0D47A1] text-white rounded-br-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                  }`}
                >
                  <p className="leading-snug">{m.text}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 font-mono ${
                      m.sender === "rider" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input & Quick Chips */}
      <div className="pt-2 border-t border-slate-200 space-y-2">
        {/* Quick One-Tap Hindi Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickChips.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendChip(c)}
              className="text-[10px] font-bold bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-2.5 py-1.5 rounded-full whitespace-nowrap shadow-2xs transition active:scale-95"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendCustom()}
            placeholder="Type your message..."
            className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0D47A1] bg-white"
          />
          <button
            type="button"
            onClick={handleSendCustom}
            disabled={!inputVal.trim()}
            className="w-10 h-10 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center font-bold text-sm shadow-xs disabled:opacity-50"
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
}
