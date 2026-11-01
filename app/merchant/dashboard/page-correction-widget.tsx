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
  const [corrections, setCorrections] = useState<PageCorrection[]>([]);
  const [text, setText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

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

  // Toggle speech-to-text audio typing
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const win = typeof window !== "undefined" ? (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Aapke browser me speech recognition support nahi mila. Kripya Google Chrome ya Microsoft Edge browser use kijiye jisme mic feature chalta hai.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      const baseText = text ? text.trim() + " " : "";

      recognition.onstart = () => {
        setIsListening(true);
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
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

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

  // Handle direct file input upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle Ctrl+V paste from clipboard (e.g. Snipping tool / Win+Shift+S)
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

  const handleAddCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachedImage) {
      alert("Kripya kuch likhiye ya screenshot attach kijiye.");
      return;
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

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

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

  // Copy formatted notes for the Agent
  const handleCopyAll = () => {
    if (corrections.length === 0) {
      alert("Abhi koi correction add nahi kiya gaya hai.");
      return;
    }

    // Group by page for clean layout
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

  // Export as downloaded text file
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
      {/* Floating Trigger Button (or Minimized Bar) */}
      <div className="fixed bottom-5 right-5 z-40">
        {isOpen && isMinimized ? (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-2 bg-slate-900 text-white rounded-full shadow-2xl border-2 border-amber-400 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 animate-pulse"
            title="Click to expand correction tool"
          >
            <span className="material-symbols-outlined text-amber-400 text-base">unfold_more</span>
            <span className="text-xs font-bold text-amber-300">
              {text ? `Draft: "${text.slice(0, 15)}..."` : "Draft Open"}
            </span>
            <span className="text-[11px] bg-amber-400 text-slate-900 font-black px-1.5 py-0.5 rounded-full">
              Expand ↗
            </span>
          </button>
        ) : !isOpen ? (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-slate-900 to-[#1e293b] hover:from-slate-800 hover:to-indigo-950 text-white rounded-full shadow-xl shadow-slate-900/30 border border-slate-700/60 transition-all hover:scale-105 active:scale-95"
            title="Open Page Corrections Tool"
          >
            <span className="material-symbols-outlined text-[19px] text-amber-400 group-hover:rotate-12 transition-transform">
              edit_note
            </span>
            <span className="text-xs font-bold tracking-wide">Page Corrections</span>
            {corrections.length > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black shadow-xs">
                {corrections.length}
              </span>
            )}
            {corrections.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </button>
        ) : null}
      </div>

      {/* Slide-over Drawer (No backdrop blur - background stays 100% clear & interactive) */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-300 ${
          isOpen && !isMinimized ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">rate_review</span>
            <div>
              <h2 className="text-xs font-bold tracking-tight">Live Page Corrections</h2>
              <p className="text-[10px] text-slate-400">
                Screen dekh kar note likho ya photo attach karo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize to see full screen"
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition"
            >
              <span className="material-symbols-outlined text-[15px]">unfold_less</span>
              <span className="text-[10px]">Minimize</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close panel"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Current Active Page Badge */}
        <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-indigo-900 font-semibold truncate">
            <span className="material-symbols-outlined text-[16px] text-indigo-600">navigation</span>
            <span>Current Page:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700 font-mono text-[11px] font-bold">
              {pathname}
            </code>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Auto-detected</span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Form to Add Correction */}
          <form
            onSubmit={handleAddCorrection}
            onPaste={handlePaste}
            className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-slate-500">add_comment</span>
                <span>Is Page Par Kya Badalna Hai?</span>
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value as "hi-IN" | "en-IN")}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 cursor-pointer shadow-2xs"
                  title="Audio typing language"
                >
                  <option value="hi-IN">🇮🇳 Hindi (हिंदी)</option>
                  <option value="en-IN">🇬🇧 English</option>
                </select>
              </div>
            </div>

            {/* Smooth Voice Typing / Audio Dictation Button */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={toggleListening}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse ring-2 ring-red-300"
                    : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 hover:scale-[1.02] active:scale-95"
                }`}
                title={isListening ? "Listening... Click to stop" : "Click to speak in Hindi or English"}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isListening ? "animate-bounce text-white" : "text-amber-800"
                  }`}
                >
                  {isListening ? "mic" : "mic_none"}
                </span>
                <span>
                  {isListening
                    ? "🔴 Sun raha hoon... (Bolte jaiye)"
                    : "🎙️ Bol Kar Likhein (Audio Type)"}
                </span>
              </button>

              <span className="text-[10px] text-slate-400 font-medium">
                💡 Paste (Ctrl+V) se photo
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isListening
                  ? "🎙️ Bolte jaiye, live voice text automatically likh raha hai..."
                  : "e.g. Yaha button ka rang change karo, namaste me kewal first name dikhao (ya mic button daba kar boliye)..."
              }
              rows={3}
              className={`w-full text-xs p-3 rounded-xl border transition-all ${
                isListening
                  ? "border-amber-500 ring-2 ring-amber-200 bg-amber-50/40 text-slate-900"
                  : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
              } placeholder:text-slate-400 resize-none shadow-2xs`}
            />

            {/* Attached Image Preview */}
            {attachedImage ? (
              <div className="relative rounded-xl border border-slate-200 bg-white p-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachedImage}
                  alt="Attached preview"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
                  onClick={() => setViewingImage(attachedImage)}
                  title="Click to view full image"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {attachedImageName || "Attached Screenshot"}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Photo Attached (Click thumbnail to enlarge)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedImage(null);
                    setAttachedImageName(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Remove
                </button>
              </div>
            ) : null}

            {/* Actions: Attach file button + Submit button */}
            <div className="flex items-center gap-2 pt-1">
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition"
              >
                <span className="material-symbols-outlined text-[16px] text-indigo-600">add_photo_alternate</span>
                <span>Attach Screenshot / Image</span>
              </label>

              <button
                type="submit"
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* List of Saved Corrections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase">
                Saved Corrections ({corrections.length})
              </h3>
              {corrections.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-slate-500 hover:text-red-600 font-semibold transition"
                >
                  Clear All
                </button>
              )}
            </div>

            {corrections.length === 0 ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
                  playlist_add_check
                </span>
                <p className="text-xs font-bold text-slate-600">Abhi koi correction save nahi hai</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] mx-auto">
                  Aap alag-alag pages ghumte rahiye, aur jo bhi change chahiye upar likhkar ya screenshot attach karke save karte jaiye!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {corrections.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-200 shadow-2xs space-y-2 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {corrections.length - index}
                        </span>
                        <code className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded truncate max-w-[220px]">
                          {item.page}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {item.createdAt}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-red-600 transition"
                          title="Delete this note"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {item.text && (
                      <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap pl-6">
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
                          className="w-16 h-16 object-cover rounded-lg border border-slate-300 cursor-pointer hover:opacity-85 shadow-2xs transition"
                          title="Click to zoom in"
                        />
                        <span className="text-[10px] text-slate-500 font-medium">
                          Click to zoom screenshot
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          {copied && (
            <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 animate-bounce">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Sabhi Corrections Copy Ho Gaye! Ab Chat Me Paste Kar Do.</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={corrections.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">content_copy</span>
              <span>📋 Copy All for Agent (Chat)</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={corrections.length === 0}
              title="Download corrections as JSON file"
              className="px-3 py-2.5 border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-size Image Zoom Modal */}
      {viewingImage && (
        <div
          onClick={() => setViewingImage(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 cursor-zoom-out"
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
