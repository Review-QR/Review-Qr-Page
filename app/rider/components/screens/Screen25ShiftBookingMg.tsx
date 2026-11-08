"use client";

import React, { useState } from "react";

interface Screen25Props {
  onBack?: () => void;
  onBookSlot?: (slotId: string) => void;
}

export default function Screen25ShiftBookingMg({
  onBack,
  onBookSlot,
}: Screen25Props) {
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow">("today");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const toggleSlot = (id: string) => {
    if (bookedSlots.includes(id)) {
      setBookedSlots(bookedSlots.filter((s) => s !== id));
    } else {
      setBookedSlots([...bookedSlots, id]);
      onBookSlot?.(id);
    }
  };

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
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Fleet Scheduling
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Shift Booking &amp; Min Guarantee</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            MG
          </span>
        </div>

        {/* Day Selector */}
        <div className="mt-4 flex border border-slate-200 rounded-xl p-1 bg-slate-100">
          <button
            type="button"
            onClick={() => setSelectedDay("today")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedDay === "today" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            📅 Today (Bahraich Central)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDay("tomorrow")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedDay === "tomorrow" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            ☀️ Tomorrow (Pre-Book)
          </button>
        </div>

        {/* MG Explanation Banner */}
        <div className="mt-3 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">Minimum Guarantee (MG)</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Active Shift
            </span>
          </div>
          <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed">
            Stay online during your booked slot with ≥85% acceptance rate. Even if demand drops, Trustit guarantees your base pay!
          </p>
        </div>

        {/* Shift Slots List */}
        <div className="mt-4 space-y-3">
          {/* Slot 1: Lunch Rush */}
          <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-4 shadow-xs relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">☀️</span>
                  <h4 className="text-sm font-black text-slate-900">Lunch Peak Rush</h4>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    High Demand
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                  11:30 AM – 03:30 PM (4 Hours)
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-600">₹400 MG</span>
                <span className="block text-[10px] text-slate-400">+₹15/order surge</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Criteria: Min 4 orders &amp; 85% accept</span>
              <button
                type="button"
                onClick={() => toggleSlot("lunch")}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition shadow-xs ${
                  bookedSlots.includes("lunch")
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {bookedSlots.includes("lunch") ? "✓ Slot Booked" : "Book Slot"}
              </button>
            </div>
          </div>

          {/* Slot 2: Dinner Rush */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🌙</span>
                  <h4 className="text-sm font-black text-slate-900">Dinner Super Peak</h4>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    Max Orders
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                  07:00 PM – 11:30 PM (4.5 Hours)
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-600">₹500 MG</span>
                <span className="block text-[10px] text-slate-400">+₹20/order surge</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Criteria: Min 5 orders &amp; 85% accept</span>
              <button
                type="button"
                onClick={() => toggleSlot("dinner")}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition shadow-xs ${
                  bookedSlots.includes("dinner")
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {bookedSlots.includes("dinner") ? "✓ Slot Booked" : "Book Slot"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 text-center">
        <p className="text-[11px] font-bold text-slate-600">
          Booked: <span className="text-[#0D47A1]">{bookedSlots.length} Slots</span> · Guaranteed Earning:{" "}
          <span className="text-emerald-600 font-extrabold">₹{bookedSlots.length * 450}</span>
        </p>
      </div>
    </div>
  );
}
