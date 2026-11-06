"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";

interface Screen27Props {
  onBack?: () => void;
  onSelfieApproved?: () => void;
}

export default function Screen27MorningHelmetSelfie({
  onBack,
  onSelfieApproved,
}: Screen27Props) {
  // Checkboxes must start unchecked so rider manually verifies
  const [hasHelmet, setHasHelmet] = useState<boolean>(false);
  const [hasThermalBag, setHasThermalBag] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAiVerifying, setIsAiVerifying] = useState<boolean>(false);

  const { rider, verifyHelmetSelfie, isLoading } = useRiderAuth();

  // Start front camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsStreaming(true);
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        setIsStreaming(true);
      } catch (err2: unknown) {
        setCameraError(
          err2 instanceof Error ? err2.message : "कैमरा खोलने की अनुमति आवश्यक है।"
        );
        setIsStreaming(false);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const size = Math.min(video.videoWidth || 640, video.videoHeight || 480);
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        const startX = ((video.videoWidth || 640) - size) / 2;
        const startY = ((video.videoHeight || 480) - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, 800, 800);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handlePassGate = async () => {
    if (!capturedImage || !hasHelmet || !hasThermalBag) return;
    setIsAiVerifying(true);
    if (rider?.id) {
      await verifyHelmetSelfie(rider.id);
    }
    setIsAiVerifying(false);
    onSelfieApproved?.();
  };

  const isEligibleToPass = Boolean(capturedImage) && hasHelmet && hasThermalBag;

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
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              दैनिक शिफ्ट गेट (Daily Shift Gate)
            </span>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              मॉर्निंग हेलमेट व बैग ऑडिट
            </h2>
          </div>
          <span className="w-8 text-center text-xs">☀️</span>
        </div>

        {/* Viewfinder Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-3">
          <div className="relative w-44 h-48 mx-auto rounded-3xl border-2 border-dashed border-[#0D47A1] bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white shadow-inner">
            {isStreaming && !capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}

            {isStreaming && !capturedImage && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-32 h-36 rounded-[50%] border-2 border-dashed border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
                <span className="absolute bottom-1 text-[9px] font-bold text-emerald-300 bg-black/70 px-2 py-0.5 rounded-full">
                  हेलमेट पहनकर चेहरा रखें
                </span>
              </div>
            )}

            {capturedImage && (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage} alt="Helmet Selfie" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                  ✓ फोटो कैप्चर हुई
                </div>
              </div>
            )}

            {!isStreaming && !capturedImage && (
              <div className="space-y-2 p-3 text-center z-10">
                <span className="text-3xl block">🪖</span>
                <span className="text-[10px] text-slate-300 block font-semibold">
                  {cameraError || "कैमरा लोड हो रहा है..."}
                </span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-500 active:scale-95"
                >
                  कैमरा खोलें 🤳
                </button>
              </div>
            )}
          </div>

          <div>
            {!capturedImage ? (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isStreaming}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition disabled:opacity-40 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>📸 हेलमेट फोटो खींचें (Capture Helmet Photo)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetake}
                className="w-full py-2 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>🔄 दोबारा फोटो लें (Retake)</span>
              </button>
            )}
          </div>
        </div>

        {/* ── 2 MANDATORY CHECKBOXES ── */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHelmet}
              onChange={(e) => setHasHelmet(e.target.checked)}
              className="w-4 h-4 accent-[#0D47A1] rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 leading-snug">
              मेरे पास ISI प्रमाणित सेफ्टी हेलमेट है (ISI Safety Helmet) *
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={hasThermalBag}
              onChange={(e) => setHasThermalBag(e.target.checked)}
              className="w-4 h-4 accent-[#0D47A1] rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 leading-snug">
              मेरे पास साफ़ Trustit थर्मल डिलीवरी बैग है (Clean Delivery Bag) *
            </span>
          </label>
        </div>

        {/* ── 6 PHOTO AUDIT GUIDES (3 GOOD, 3 BAD) ── */}
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600 text-center">
            हेलमेट फोटो ऑडिट नियम
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 space-y-1">
              <span className="font-black text-emerald-900 block flex items-center gap-1 text-[11px]">
                <span>✅</span> सही (Good)
              </span>
              <ul className="space-y-1 text-emerald-800 font-semibold leading-tight">
                <li>• हेलमेट सिर पर ठीक से लॉक हो</li>
                <li>• चेहरा और आँखें स्पष्ट दिखें</li>
                <li>• Trustit बैग साथ में विजिबल हो</li>
              </ul>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 space-y-1">
              <span className="font-black text-rose-900 block flex items-center gap-1 text-[11px]">
                <span>❌</span> गलत (Bad)
              </span>
              <ul className="space-y-1 text-rose-800 font-semibold leading-tight">
                <li>• बिना हेलमेट या हाथ में पकड़ा हुआ</li>
                <li>• धूप का चश्मा या रुमाल से ढका चेहरा</li>
                <li>• बिना डिलीवरी बैग के फोटो</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Unlock Gate */}
      <div className="pt-3 border-t border-slate-200 mt-3">
        <button
          type="button"
          onClick={handlePassGate}
          disabled={!isEligibleToPass || isAiVerifying}
          className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] ${
            isEligibleToPass
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>
            {isAiVerifying
              ? "सत्यापन हो रहा है..."
              : isEligibleToPass
              ? "दैनिक शिफ्ट अनलॉक करें (Unlock Duty Shift) ➔"
              : "हेलमेट फोटो व दोनों बॉक्स टिक करें"}
          </span>
        </button>
      </div>
    </div>
  );
}
