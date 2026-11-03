"use client";

import React, { useState, useEffect } from "react";

interface Screen24Props {
  onBack?: () => void;
  onCallIvr?: () => void;
  onUploadGatePhoto?: () => void;
  onCompleteCancellation?: () => void;
}

export default function Screen24CustomerUnreachable({
  onBack,
  onCallIvr,
  onUploadGatePhoto,
  onCompleteCancellation,
}: Screen24Props) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(298); // ~5 mins
  const [photoCaptured, setPhotoCaptured] = useState<boolean>(false);
  const [ivrTriggered, setIvrTriggered] = useState<boolean>(false);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => setSecondsRemaining((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isTimerExpired = secondsRemaining <= 0;

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
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              Doorstep Exception Desk
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Customer Unreachable</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            5:00
          </span>
        </div>

        {/* 5-Minute Countdown Clock */}
        <div className="mt-4 bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-5 text-center shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-200">
            DOORSTEP RESCUE COUNTDOWN
          </span>
          <div className="mt-1 text-4xl font-black font-mono tracking-tight">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <p className="text-xs text-red-100 mt-1">
            Server IVR call and automated SMS are actively waking customer.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white">
            <span>🛡️ Full Payout (₹45.00) 100% Protected</span>
          </div>
        </div>

        {/* Protocol Steps Checklist */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Mandatory Doorstep Protocol
          </h4>

          {/* Step 1: IVR Robo-Call */}
          <div className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Step 1: Automated Server Call</p>
              <p className="text-[10px] text-slate-500">Triggers priority loud IVR to customer</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIvrTriggered(true);
                onCallIvr?.();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                ivrTriggered
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : "bg-[#0D47A1] text-white hover:bg-blue-800"
              }`}
            >
              {ivrTriggered ? "✓ IVR Triggered" : "📞 Trigger IVR"}
            </button>
          </div>

          {/* Step 2: Gate / Door Photo */}
          <div className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Step 2: Gate / Door Photo</p>
              <p className="text-[10px] text-slate-500">Proof of arrival at exact coordinates</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhotoCaptured(true);
                onUploadGatePhoto?.();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                photoCaptured
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              {photoCaptured ? "✓ Photo Saved" : "📸 Capture Gate"}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 space-y-1">
            <p>• If customer does not answer before timer ends, order is safely cancelled.</p>
            <p>• You keep 100% full trip earning. Return parcel to nearest hub if requested.</p>
          </div>
        </div>
      </div>

      {/* Footer Complete Action */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={!photoCaptured && !isTimerExpired}
          onClick={onCompleteCancellation}
          className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black text-sm shadow-md hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <span>End Doorstep Wait &amp; Claim ₹45 Earning</span>
          <span>✓</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Zero Penalty Guarantee · Anti-Fraud Telemetry Logged
        </p>
      </div>
    </div>
  );
}
