"use client";

import React, { useState } from "react";

interface Screen08Props {
  onBack?: () => void;
  onSave?: () => void;
  onSaveOperatingHours?: (hours: {
    openingTime: string;
    closingTime: string;
    festivalMode: boolean;
    lunchPause: boolean;
  }) => void;
  initialOpening?: string;
  initialClosing?: string;
  initialFestival?: boolean;
  initialLunchPause?: boolean;
}

export default function Screen08OperatingHours({
  onBack,
  onSave,
  onSaveOperatingHours,
  initialOpening = "08:00 AM",
  initialClosing = "10:30 PM",
  initialFestival = false,
  initialLunchPause = false,
}: Screen08Props) {
  const [festivalMode, setFestivalMode] = useState<boolean>(initialFestival);
  const [lunchPause, setLunchPause] = useState<boolean>(initialLunchPause);
  const [openingTime] = useState<string>(initialOpening);
  const [closingTime] = useState<string>(initialClosing);
  const [saved, setSaved] = useState(false);

  const days = [
    { name: "Monday", open: "08:00 AM", close: "10:30 PM", active: true },
    { name: "Tuesday", open: "08:00 AM", close: "10:30 PM", active: true },
    { name: "Wednesday", open: "08:00 AM", close: "10:30 PM", active: true },
    { name: "Thursday", open: "08:00 AM", close: "10:30 PM", active: true },
    { name: "Friday", open: "08:00 AM", close: "10:30 PM", active: true },
    { name: "Saturday", open: "08:00 AM", close: "11:00 PM", active: true },
    { name: "Sunday", open: "08:00 AM", close: "11:00 PM", active: true },
  ];

  const handleSave = () => {
    setSaved(true);
    if (onSaveOperatingHours) {
      onSaveOperatingHours({ openingTime, closingTime, festivalMode, lunchPause });
    }
    setTimeout(() => {
      setSaved(false);
      onSave?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              MY BUSINESS • SCHEDULE
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Operating Hours &amp; Split Shifts
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Festival / Holiday Fast Toggle */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Festival / Holiday Closure</span>
              <p className="text-[10px] text-slate-500">Temporarily marks store closed on consumer app</p>
            </div>
            <button
              type="button"
              onClick={() => setFestivalMode(!festivalMode)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
                festivalMode
                  ? "bg-rose-600 text-white border-rose-500 shadow-xs"
                  : "bg-slate-100 text-slate-600 border-slate-300"
              }`}
            >
              {festivalMode ? "Store Closed 🛑" : "Normal Duty ✓"}
            </button>
          </div>
          {festivalMode && (
            <p className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
              ⚠️ Store will reopen automatically tomorrow at 08:00 AM.
            </p>
          )}
        </div>

        {/* Afternoon Lunch Kitchen Pause */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Afternoon Rest / Prayer Pause</span>
            <span className="text-[10px] text-slate-500">02:00 PM to 03:30 PM Daily Pause</span>
          </div>
          <button
            type="button"
            onClick={() => setLunchPause(!lunchPause)}
            className={`w-9 h-5 rounded-full transition relative p-0.5 cursor-pointer ${
              lunchPause ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition ${
                lunchPause ? "translate-x-4" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>

        {/* Weekly Hours Matrix */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
            Standard Weekly Schedule
          </h3>
          <div className="space-y-1.5 text-xs">
            {days.map((day) => (
              <div
                key={day.name}
                className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0"
              >
                <span className="font-bold text-slate-800 w-24">{day.name}</span>
                <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {day.open} – {day.close}
                </span>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Open
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3">
        {saved ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Operating Timings Saved!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Save Operating Timings
          </button>
        )}
      </div>
    </div>
  );
}
