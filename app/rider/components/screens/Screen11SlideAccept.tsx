"use client";

import React, { useState, useRef, useEffect } from "react";

interface Screen11Props {
  orderCode?: string;
  merchantName?: string;
  payoutAmount?: number;
  onAccepted?: () => void;
  onBack?: () => void;
}

export default function Screen11SlideAccept({
  orderCode = "TR-4492",
  merchantName = "Golden Blossom Café",
  payoutAmount = 45,
  onAccepted,
  onBack,
}: Screen11Props) {
  const [sliderX, setSliderX] = useState(0);
  const [completed, setCompleted] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const maxDrag = 190;

  const handleStart = (clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return;
    const delta = Math.max(0, Math.min(maxDrag, clientX - startX.current));
    setSliderX(delta);

    if (delta >= maxDrag - 10) {
      isDragging.current = false;
      setCompleted(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(120);
      }
      setTimeout(() => {
        onAccepted?.();
      }, 800);
    }
  };

  const handleEnd = () => {
    if (isDragging.current) {
      isDragging.current = false;
      if (sliderX < maxDrag - 10) {
        setSliderX(0); // Spring back
      }
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [sliderX]);

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3 text-[#0F172A] font-sans select-none overflow-hidden">
      <div>
        {/* Compact Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-[11px] font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Radar</span>
          </button>
          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            Accident-Proof Swipe
          </span>
        </div>

        <div className="mt-2 space-y-0.5">
          <h2 className="text-sm font-black text-slate-900 leading-tight">Confirm Order Acceptance</h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            Slide the handle all the way right to lock the assignment and stop the radar siren.
          </p>
        </div>

        {/* Order Summary Card (Compact) */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div>
              <strong className="text-xs font-black text-slate-900 block leading-tight">{merchantName}</strong>
              <span className="text-[10px] text-slate-500">Civil Lines, Bahraich · Order #{orderCode}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block uppercase">Guaranteed</span>
              <strong className="text-xs font-black text-emerald-600">₹{payoutAmount}.00</strong>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-900 leading-tight">
            🛡️ <strong>Safety Rule:</strong> Accidental touch prevention active.
          </div>
        </div>

        {/* The Working Swipe Slider Widget */}
        <div className="mt-4 space-y-1.5">
          <div
            className="relative w-full h-12 bg-slate-100 border-2 border-amber-400 rounded-xl flex items-center px-1 overflow-hidden select-none"
            onMouseDown={(e) => handleStart(e.clientX)}
            onTouchStart={(e) => {
              if (e.touches.length > 0) handleStart(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) handleMove(e.touches[0].clientX);
            }}
            onTouchEnd={handleEnd}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-amber-700 pointer-events-none uppercase tracking-wider">
              {completed ? "🎉 ACCEPTED! STOPPING SIREN" : "Slide to Accept Order >>>"}
            </span>

            <div
              style={{ transform: `translateX(${sliderX}px)` }}
              className="w-10 h-10 rounded-lg bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md cursor-grab active:cursor-grabbing z-10 transition-transform"
            >
              ➔
            </div>
          </div>

          <span className="block text-center text-[9px] font-semibold text-slate-400">
            {completed ? "Transitioning to store pickup..." : "(Drag the yellow arrow across the track)"}
          </span>
        </div>
      </div>

      {/* Backup Footer */}
      <div className="pt-2 border-t border-slate-200 text-center">
        <span className="text-[9px] text-slate-400">Dash mount auto-accepts upon 80% swipe</span>
      </div>
    </div>
  );
}
