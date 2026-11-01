"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface PageCorrection {
  id: string;
  page: string;
  text: string;
  imageUrl?: string | null;
  imageName?: string | null;
  createdAt: string;
}

const STORAGE_KEY = "trustit_page_corrections_v1";

export default function PageCorrectionWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dockMode, setDockMode] = useState<"bottom" | "side">("bottom");
  const [showSavedList, setShowSavedList] = useState(false);

  const [corrections, setCorrections] = useState<PageCorrection[]>([]);
  const [text, setText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Audio / Speech-to-Text State
  const [micStatus, setMicStatus] = useState<"idle" | "starting" | "listening" | "error">("idle");
  const [micError, setMicError] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-IN">("hi-IN");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load saved corrections on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCorrections(JSON.parse(saved));
      }
    } catch {
      // ignore JSON errors
    }
  }, []);

  // Stop speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Save to localStorage when corrections list changes
  const saveCorrectionsList = (updated: PageCorrection[]) => {
    setCorrections(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // LocalStorage full or private mode fallback
    }
  };

  // Convert File to base64 Data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Kewal photo ya screenshot (PNG/JPG) hi attach kar sakte hain.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAttachedImage(result);
      setAttachedImageName(file.name || "screenshot.png");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  // Robust Speech-to-Text with explicit mic permission check
  const toggleListening = async () => {
    if (micStatus === "listening" || micStatus === "starting") {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setMicStatus("idle");
      return;
    }

    setMicError(null);
    setMicStatus("starting");

    const win = typeof window !== "undefined" ? (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setMicStatus("error");
      setMicError("Browser me speech recognition support nahi mila. Google Chrome ya Edge browser use kijiye.");
      return;
    }

    // Explicitly prompt for mic permission via getUserMedia
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr: any) {
      console.warn("getUserMedia permission error:", permErr);
      setMicStatus("error");
      setMicError("Microphone permission blocked hai! Browser ke URL bar me lock (🔒) ya tune icon par click karke Mic ko 'Allow' kijiye.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      const baseText = text ? text.trim() + " " : "";

      recognition.onstart = () => {
        setMicStatus("listening");
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(baseText + transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech error:", event);
        const errType = event.error;
        if (errType === "not-allowed" || errType === "service-not-allowed") {
          setMicError("Microphone block hai! URL bar me lock icon se mic Allow kijiye.");
        } else if (errType === "no-speech") {
          return;
        } else if (errType === "network") {
          setMicError("Speech network connect nahi ho paya. Internet connection check kijiye.");
        } else {
          setMicError(`Mic notice: ${errType || "Please try speaking again"}`);
        }
        setMicStatus("error");
      };

      recognition.onend = () => {
        setMicStatus("idle");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Speech recognition start failed:", err);
      setMicStatus("error");
      setMicError("Speech start failed: " + (err?.message || "Please retry"));
    }
  };

  const handleAddCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachedImage) {
      alert("Kripya kuch likhiye ya screenshot attach kijiye.");
      return;
    }

    if (micStatus === "listening" && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setMicStatus("idle");
    }

    const newCorrection: PageCorrection = {
      id: "corr_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      page: pathname || "/merchant/dashboard",
      text: text.trim(),
      imageUrl: attachedImage,
      imageName: attachedImageName,
      createdAt: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      }),
    };

    const updated = [newCorrection, ...corrections];
    saveCorrectionsList(updated);
    setText("");
    setAttachedImage(null);
    setAttachedImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    const updated = corrections.filter((c) => c.id !== id);
    saveCorrectionsList(updated);
  };

  const handleClearAll = () => {
    if (window.confirm("Kya aap saare corrections notes clear karna chahte hain?")) {
      saveCorrectionsList([]);
    }
  };

  const handleCopyAll = () => {
    if (corrections.length === 0) {
      alert("Abhi koi correction add nahi kiya gaya hai.");
      return;
    }

    const grouped: { [page: string]: PageCorrection[] } = {};
    corrections.forEach((c) => {
      if (!grouped[c.page]) grouped[c.page] = [];
      grouped[c.page].push(c);
    });

    let output = "📋 TRUSTIT PAGE CORRECTIONS LIST:\n";
    output += "========================================\n\n";

    Object.entries(grouped).forEach(([page, items]) => {
      output += `📍 PAGE: ${page}\n`;
      items.forEach((item, index) => {
        output += `  ${index + 1}. ${item.text || "(Image Attached)"}`;
        if (item.imageUrl) {
          output += ` [📷 Screenshot attached: ${item.imageName || "image"}]`;
        }
        output += ` (Added: ${item.createdAt})\n`;
      });
      output += "\n";
    });

    output += "========================================\n";
    output += "Agent bhai, upar diye gaye sabhi pages par ye corrections apply kar do.";

    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleDownload = () => {
    if (corrections.length === 0) return;
    const blob = new Blob([JSON.stringify(corrections, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trustit-corrections-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating Trigger Button (When Widget is Closed or Minimized) */}
      {(!isOpen || isMinimized) && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-slate-900 to-[#1e293b] hover:from-slate-800 hover:to-indigo-950 text-white rounded-full shadow-2xl border-2 border-indigo-400/50 transition-all hover:scale-105 active:scale-95"
            title="Open Live Page Corrections Tool"
          >
            <span className="material-symbols-outlined text-[19px] text-amber-400 group-hover:rotate-12 transition-transform">
              edit_note
            </span>
            <span className="text-xs font-bold tracking-wide">
              {isMinimized && text ? `Draft: "${text.slice(0, 15)}..."` : "Page Corrections"}
            </span>
            {corrections.length > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black shadow-xs">
                {corrections.length}
              </span>
            )}
            <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
              Open ↗
            </span>
          </button>
        </div>
      )}

      {/* Main Widget: Renders either as Bottom Dock Bar OR Side Panel (Zero background blur!) */}
      {isOpen && !isMinimized && (
        <div
          className={
            dockMode === "bottom"
              ? "fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-indigo-600 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] flex flex-col max-h-[300px] transition-all"
              : "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col border-l border-slate-300 transition-all"
          }
        >
          {/* Top Control Bar */}
          <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-amber-400 text-lg shrink-0">rate_review</span>
              <span className="text-xs font-bold tracking-tight shrink-0">Page Corrections</span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] text-indigo-300 font-mono font-bold truncate max-w-[200px] sm:max-w-[320px]">
                {pathname}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Language Selector */}
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value as "hi-IN" | "en-IN")}
                className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
                title="Voice language"
              >
                <option value="hi-IN">🇮🇳 Hindi</option>
                <option value="en-IN">🇬🇧 English</option>
              </select>

              {/* Dock Position Switcher: Bottom vs Side */}
              <button
                type="button"
                onClick={() => setDockMode(dockMode === "bottom" ? "side" : "bottom")}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
                title={dockMode === "bottom" ? "Switch to Side Drawer" : "Switch to Bottom Bar (Keeps page full width visible)"}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {dockMode === "bottom" ? "dock_to_right" : "dock_to_bottom"}
                </span>
                <span className="hidden sm:inline">
                  {dockMode === "bottom" ? "Side View" : "Bottom View (Open Screen)"}
                </span>
              </button>

              {/* View Saved Corrections List Toggle */}
              <button
                type="button"
                onClick={() => setShowSavedList(!showSavedList)}
                className="px-2.5 py-1 rounded bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 text-[11px] font-bold flex items-center gap-1 transition"
                title="View all saved notes"
              >
                <span>Saved ({corrections.length})</span>
              </button>

              {/* Minimize Button */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-0.5 transition"
                title="Minimize bar to see entire page"
              >
                <span className="material-symbols-outlined text-[15px]">unfold_less</span>
                <span className="hidden sm:inline">Minimize</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-red-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Close"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Error Notice if Mic fails or permission denied */}
          {micError && (
            <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
                <span>{micError}</span>
              </span>
              <button
                type="button"
                onClick={() => setMicError(null)}
                className="text-[10px] font-bold text-amber-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Form & Actions Area */}
          <form
            onSubmit={handleAddCorrection}
            onPaste={handlePaste}
            className={`p-3 bg-slate-50/80 flex flex-col ${dockMode === "bottom" ? "sm:flex-row sm:items-center gap-3" : "gap-3 flex-1 overflow-y-auto"}`}
          >
            {/* Input & Voice Controls */}
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                {/* Audio Type Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    micStatus === "listening"
                      ? "bg-red-600 text-white animate-pulse ring-2 ring-red-400"
                      : micStatus === "starting"
                        ? "bg-amber-400 text-slate-950 animate-bounce"
                        : "bg-amber-200/90 hover:bg-amber-300 text-slate-950 border border-amber-400 hover:scale-[1.02] active:scale-95"
                  }`}
                  title="Click to speak in Hindi or English"
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      micStatus === "listening" ? "animate-bounce text-white" : "text-amber-900"
                    }`}
                  >
                    {micStatus === "listening" ? "mic" : "mic_none"}
                  </span>
                  <span>
                    {micStatus === "listening"
                      ? "🔴 Sun raha hoon... (Bolte jaiye)"
                      : micStatus === "starting"
                        ? "⏳ Mic Connecting..."
                        : "🎙️ Bol Kar Likhein (Audio Type)"}
                  </span>
                </button>

                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  💡 Paste (Ctrl+V) se screenshot lagta hai
                </span>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  micStatus === "listening"
                    ? "🎙️ Bolte jaiye, automatically live type ho raha hai..."
                    : "Yaha kya change karna hai likhiye ya mic button daba kar boliye..."
                }
                rows={dockMode === "bottom" ? 2 : 4}
                className={`w-full text-xs p-2.5 rounded-xl border transition-all ${
                  micStatus === "listening"
                    ? "border-amber-500 ring-2 ring-amber-200 bg-amber-50/50 text-slate-900"
                    : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                } placeholder:text-slate-400 resize-none shadow-2xs`}
              />
            </div>

            {/* Attachments & Save Button */}
            <div className={`flex items-center gap-2 shrink-0 ${dockMode === "bottom" ? "sm:flex-col sm:items-end sm:justify-center" : "justify-between pt-1"}`}>
              {/* Attached Image Thumbnail */}
              {attachedImage ? (
                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachedImage}
                    alt="Preview"
                    onClick={() => setViewingImage(attachedImage)}
                    className="w-8 h-8 object-cover rounded cursor-pointer border border-slate-200"
                    title="Click to enlarge"
                  />
                  <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[90px]">
                    {attachedImageName || "Photo"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedImage(null);
                      setAttachedImageName(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-red-600 hover:text-red-800 text-[10px] font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    id="correction-file-upload"
                  />
                  <label
                    htmlFor="correction-file-upload"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition"
                  >
                    <span className="material-symbols-outlined text-[15px] text-indigo-600">
                      add_photo_alternate
                    </span>
                    <span>Attach Photo</span>
                  </label>
                </>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* Bottom Dock Footer: One-click Copy for Chat */}
          <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Saved Notes: <strong className="text-slate-900">{corrections.length}</strong>
            </span>

            {copied && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                Copied! Ab chat me paste kar dijiye.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                disabled={corrections.length === 0}
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>📋 Copy All for Agent (Chat)</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={corrections.length === 0}
                title="Download JSON backup"
                className="p-1.5 border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-lg transition"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Notes Modal (Opens when user clicks 'Saved (N)' so it doesn't clutter the bottom bar) */}
      {showSavedList && (
        <div
          onClick={() => setShowSavedList(false)}
          className="fixed inset-0 bg-slate-950/40 z-[55] flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-lg">checklist</span>
                <h3 className="text-sm font-bold">Saved Corrections ({corrections.length})</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedList(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {corrections.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500 font-medium">
                  Abhi koi note save nahi hua hai.
                </p>
              ) : (
                corrections.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {corrections.length - index}
                        </span>
                        <code className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded truncate max-w-[240px]">
                          {item.page}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.createdAt}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-red-600 transition"
                          title="Delete note"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {item.text && (
                      <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap pl-6">
                        {item.text}
                      </p>
                    )}

                    {item.imageUrl && (
                      <div className="pl-6 pt-1 flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt="Thumbnail"
                          onClick={() => setViewingImage(item.imageUrl || null)}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-300 cursor-pointer hover:opacity-85 shadow-2xs"
                          title="Click to zoom screenshot"
                        />
                        <span className="text-[10px] text-slate-500 font-medium">
                          Click to enlarge
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {corrections.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear All Notes
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyAll}
                disabled={corrections.length === 0}
                className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>Copy All Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-size Image Zoom Modal */}
      {viewingImage && (
        <div
          onClick={() => setViewingImage(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              type="button"
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full flex items-center justify-center z-10 transition"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewingImage}
              alt="Enlarged preview"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
