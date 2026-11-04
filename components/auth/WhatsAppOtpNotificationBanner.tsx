"use client";

import React, { useState, useEffect } from "react";

export interface WhatsAppOtpNotificationBannerProps {
  otpCode: string | null;
  phone: string;
  onAutoFill: (code: string) => void;
  onDismiss: () => void;
}

export default function WhatsAppOtpNotificationBanner({
  otpCode,
  phone,
  onAutoFill,
  onDismiss,
}: WhatsAppOtpNotificationBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (otpCode) {
      setVisible(true);
      // Play a soft incoming notification pop sound if audioContext is available
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch {}
    } else {
      setVisible(false);
    }
  }, [otpCode]);

  if (!visible || !otpCode) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#0B141B] text-slate-100 rounded-2xl p-3.5 shadow-2xl border border-emerald-500/40 font-sans flex items-start justify-between gap-3 backdrop-blur-md">
        <div className="flex items-start gap-3">
          {/* WhatsApp Icon */}
          <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center text-lg shrink-0 shadow-md">
            💬
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#25D366]">
                WhatsApp • Trustit Security
              </span>
              <span className="text-[9px] text-slate-400">now</span>
            </div>
            <p className="text-xs text-slate-200 leading-tight">
              Your Trustit 6-digit login verification code is{" "}
              <strong className="text-white font-mono font-black text-sm bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                {otpCode}
              </strong>
              . Valid for 5 minutes.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onAutoFill(otpCode);
                  setVisible(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-[11px] transition shadow-xs flex items-center gap-1"
              >
                <span>⚡ Auto-fill {otpCode}</span>
              </button>
              <span className="text-[10px] text-slate-400">
                sent to +91 {phone}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
