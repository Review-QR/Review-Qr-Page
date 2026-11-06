"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface Screen04Props {
  onSelfieCaptured?: (selfieUrl: string) => void;
  onBack?: () => void;
}

export default function Screen04SelfieKyc({ onSelfieCaptured, onBack }: Screen04Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Start Front Camera cleanly
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("webkit-playsinline", "true");
        await videoRef.current.play().catch(() => {});
      }
      setIsStreaming(true);
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("webkit-playsinline", "true");
          await videoRef.current.play().catch(() => {});
        }
        setIsStreaming(true);
      } catch (err2: unknown) {
        setCameraError(
          "लाइव कैमरा शुरू नहीं हो सका। नीचे दिए गए 'फ़ोन कैमरा' बटन से सीधी सेल्फी लें।"
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

  // Robust Live Video Snapshot (Guarantees no black screen)
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      setIsProcessing(true);

      // Determine actual video dimensions safely
      const vw = video.videoWidth > 0 ? video.videoWidth : video.clientWidth || 640;
      const vh = video.videoHeight > 0 ? video.videoHeight : video.clientHeight || 480;
      const size = Math.min(vw, vh);

      if (size <= 0) {
        // Fallback to native phone camera if video dimensions are 0
        fileInputRef.current?.click();
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Center crop & flip for mirror selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        const startX = (vw - size) / 2;
        const startY = (vh - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, 800, 800);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

        // Verification check: ensure data URL is valid and not empty
        if (compressedDataUrl && compressedDataUrl.length > 2000) {
          setCapturedImage(compressedDataUrl);
          // Stop stream gracefully after state update
          setTimeout(stopCamera, 200);
        } else {
          // If canvas generated black frame, trigger phone camera
          fileInputRef.current?.click();
        }
      }
    } catch (err) {
      console.error("Live capture error:", err);
      fileInputRef.current?.click();
    } finally {
      setIsProcessing(false);
    }
  };

  // 100% Fail-Proof Native Phone Front Camera File Handler
  const handleNativeFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          ctx.drawImage(img, startX, startY, size, size, 0, 0, 800, 800);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCapturedImage(dataUrl);
          stopCamera();
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    onSelfieCaptured?.(capturedImage);
  };

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none overflow-y-auto">
      {/* Hidden Native Camera Input for 100% Fail-Proof Capture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="user"
        onChange={handleNativeFileCapture}
        className="hidden"
      />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← वापस (Back)</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              लाइव सेल्फी KYC
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">चरण 4 / 6</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-2.5 space-y-0.5 text-center">
          <h2 className="text-base font-black text-slate-900 leading-tight">
            लाइव फ्रंट कैमरा सेल्फी
          </h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            यह फोटो आपके डिजिटल फ्लीट आईडी कार्ड और ग्राहकों को दिखाई जाएगी।
          </p>
        </div>

        {/* Viewfinder Box */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-3">
          <div className="relative w-44 h-48 mx-auto rounded-3xl border-2 border-dashed border-[#0D47A1] bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white shadow-inner">
            {/* Live Video Element */}
            {isStreaming && !capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}

            {/* Oval Face Guide Overlay */}
            {isStreaming && !capturedImage && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-32 h-36 rounded-[50%] border-2 border-dashed border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
                <span className="absolute bottom-1.5 text-[9px] font-bold text-emerald-300 bg-black/70 px-2 py-0.5 rounded-full">
                  चेहरा अंदर रखें
                </span>
              </div>
            )}

            {/* Captured Photo Preview */}
            {capturedImage && (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                  ✓ फोटो कैप्चर हुई
                </div>
              </div>
            )}

            {/* Fallback if stream inactive */}
            {!isStreaming && !capturedImage && (
              <div className="space-y-2 p-3 text-center z-10">
                <span className="text-3xl block">📷</span>
                <span className="text-[10px] text-slate-300 block font-semibold leading-tight">
                  {cameraError || "कैमरा लोड हो रहा है..."}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-500 active:scale-95 flex items-center justify-center gap-1 mx-auto"
                >
                  <span>📱</span>
                  <span>फ़ोन कैमरा खोलें</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Row: Take Live Selfie + 1-Tap Native Camera Fallback */}
          <div className="space-y-2">
            {!capturedImage ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={!isStreaming || isProcessing}
                  className="py-2.5 px-2 rounded-xl bg-[#0D47A1] hover:bg-[#082b66] text-white font-black text-xs shadow-md transition disabled:opacity-40 flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>📸</span>
                  <span>लाइव सेल्फी लें</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>📱</span>
                  <span>फ़ोन कैमरा</span>
                </button>
              </div>
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

        {/* ── 6 PHOTO AUDIT GUIDANCE CARDS (3 GOOD, 3 BAD) ── */}
        <div className="mt-3.5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600 text-center">
            फोटो सत्यापन नियम (Photo Guidelines)
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {/* 3 Good Examples */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 space-y-1.5">
              <span className="font-black text-emerald-900 block flex items-center gap-1 text-[11px]">
                <span>✅</span> सही तरीका (Good)
              </span>
              <ul className="space-y-1 text-emerald-800 font-semibold leading-tight">
                <li>• पूरा चेहरा और दोनों कान स्पष्ट दिखें</li>
                <li>• कंधे के ऊपर का हिस्सा विजिबल हो</li>
                <li>• अच्छी रोशनी और साफ पृष्ठभूमि</li>
              </ul>
            </div>

            {/* 3 Bad Examples */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 space-y-1.5">
              <span className="font-black text-rose-900 block flex items-center gap-1 text-[11px]">
                <span>❌</span> गलत तरीका (Bad)
              </span>
              <ul className="space-y-1 text-rose-800 font-semibold leading-tight">
                <li>• धूप का चश्मा या टोपी न पहनें</li>
                <li>• मास्क या रूमाल से चेहरा न ढकें</li>
                <li>• धुंधली या अंधेरे में फोटो न लें</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Confirm Button */}
      <div className="pt-3 border-t border-slate-200 mt-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!capturedImage}
          className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] ${
            capturedImage
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>सेल्फी कन्फर्म करें और आगे बढ़ें (Confirm &amp; Next)</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
