"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ScreenMeta {
  index: number;
  slug: string;
  title: string;
  moduleId: string;
  moduleName: string;
  prevSlug: string | null;
  nextSlug: string | null;
  htmlPath: string;
  pngPath: string;
}

interface Props {
  currentScreen: ScreenMeta;
  allScreens: ScreenMeta[];
}

export default function FlowControllerClient({ currentScreen, allScreens }: Props) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<"code" | "compare" | "png">("code");
  const [isBarCollapsed, setIsBarCollapsed] = useState(false);

  // Keyboard navigation: Left/Right arrows, 'c' for compare
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowLeft" && currentScreen.prevSlug) {
        router.push(`/merchant/flow/${currentScreen.prevSlug}`);
      } else if (e.key === "ArrowRight" && currentScreen.nextSlug) {
        router.push(`/merchant/flow/${currentScreen.nextSlug}`);
      } else if (e.key.toLowerCase() === "c") {
        setViewMode((m) => (m === "code" ? "compare" : "code"));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen, router]);

  // Wire buttons inside the iframe so they navigate to the logical next screen
  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;

      const clickableElements = doc.querySelectorAll("button, a, input[type='submit']");
      clickableElements.forEach((el) => {
        el.addEventListener("click", (evt) => {
          const href = (el as HTMLAnchorElement).getAttribute("href");
          const text = (el.textContent || "").toLowerCase().trim();

          if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
            return;
          }

          const isNextButton =
            text.includes("continue") ||
            text.includes("next") ||
            text.includes("proceed") ||
            text.includes("submit") ||
            text.includes("verify") ||
            text.includes("save") ||
            text.includes("add") ||
            text.includes("confirm");

          const isBackButton = text.includes("back") || text.includes("previous");

          if (isNextButton && currentScreen.nextSlug) {
            evt.preventDefault();
            router.push(`/merchant/flow/${currentScreen.nextSlug}`);
          } else if (isBackButton && currentScreen.prevSlug) {
            evt.preventDefault();
            router.push(`/merchant/flow/${currentScreen.prevSlug}`);
          }
        });
      });
    } catch {
      // Ignore cross-origin issues
    }
  };

  const moduleGroups = allScreens.reduce<Record<string, ScreenMeta[]>>((acc, s) => {
    const key = `${s.moduleId}: ${s.moduleName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf8ff] text-[#131b2e]">
      {/* Top Floating Flow Controller Bar */}
      <header
        className={`bg-white/95 backdrop-blur-md border-b border-[#eaedff] px-4 py-2.5 transition-all duration-300 z-50 shadow-sm shrink-0 ${
          isBarCollapsed ? "hidden" : "flex flex-col md:flex-row items-center justify-between gap-3"
        }`}
      >
        {/* Left: Branding & Module Label */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/merchant/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#003178] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-[#0d47a1] transition-colors">
              TIT
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#131b2e] leading-tight flex items-center gap-1.5">
                <span>TRUSTIT Stitch Journey</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#eaedff] text-[#003178] text-[9px] font-black uppercase">
                  Live Flow
                </span>
              </span>
              <span className="text-[10px] text-[#434652] font-semibold">{currentScreen.moduleName}</span>
            </div>
          </Link>

          <div className="h-4 w-px bg-[#eaedff] hidden md:block"></div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f3ff] text-[#003178] text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#005739] animate-pulse"></span>
            <span>
              Screen {currentScreen.index} of {allScreens.length}
            </span>
          </div>
        </div>

        {/* Center: Fast Screen Selector Dropdown */}
        <div className="flex items-center gap-2 max-w-md w-full">
          <select
            value={currentScreen.slug}
            onChange={(e) => router.push(`/merchant/flow/${e.target.value}`)}
            className="w-full bg-[#f2f3ff] border border-[#eaedff] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#003178] cursor-pointer"
          >
            {Object.entries(moduleGroups).map(([groupName, screens]) => (
              <optgroup key={groupName} label={groupName}>
                {screens.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.index}. {s.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Right: Step Controls & Compare Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="inline-flex items-center bg-[#f2f3ff] rounded-lg p-0.5 border border-[#eaedff] text-xs">
            <button
              onClick={() => setViewMode("code")}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                viewMode === "code" ? "bg-white text-[#003178] shadow-xs" : "text-[#434652] hover:text-[#131b2e]"
              }`}
              title="View Live Interactive HTML/Tailwind Screen"
            >
              Interactive HTML
            </button>
            <button
              onClick={() => setViewMode("compare")}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                viewMode === "compare" ? "bg-white text-[#003178] shadow-xs" : "text-[#434652] hover:text-[#131b2e]"
              }`}
              title="Side-by-side comparison with original Stitch PNG (Hotkey: C)"
            >
              Split Compare
            </button>
            <button
              onClick={() => setViewMode("png")}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                viewMode === "png" ? "bg-white text-[#003178] shadow-xs" : "text-[#434652] hover:text-[#131b2e]"
              }`}
              title="View original high-res design screenshot"
            >
              Design PNG
            </button>
          </div>

          {/* Prev Button */}
          {currentScreen.prevSlug ? (
            <Link
              href={`/merchant/flow/${currentScreen.prevSlug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#003178] text-xs font-bold transition-colors"
              title="Previous screen (Left Arrow)"
            >
              <span>← Prev</span>
            </Link>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed">
              Start
            </span>
          )}

          {/* Next Button */}
          {currentScreen.nextSlug ? (
            <Link
              href={`/merchant/flow/${currentScreen.nextSlug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#003178] hover:bg-[#0d47a1] text-white text-xs font-bold transition-colors shadow-xs"
              title="Next screen (Right Arrow)"
            >
              <span>Next →</span>
            </Link>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed">
              End
            </span>
          )}

          {/* Open Fullscreen link */}
          <a
            href={currentScreen.htmlPath}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-[#434652] hover:bg-[#f2f3ff] hover:text-[#003178] transition-colors"
            title="Open pure code.html in new tab without controller bar"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </a>

          {/* Collapse bar button */}
          <button
            onClick={() => setIsBarCollapsed(true)}
            className="p-1.5 rounded-lg text-[#434652] hover:bg-[#f2f3ff] transition-colors"
            title="Hide top controller bar"
          >
            <span className="material-symbols-outlined text-[18px]">expand_less</span>
          </button>
        </div>
      </header>

      {/* Floating Restore Button when collapsed */}
      {isBarCollapsed && (
        <button
          onClick={() => setIsBarCollapsed(false)}
          className="fixed top-2 right-4 z-50 bg-[#003178] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md hover:bg-[#0d47a1] flex items-center gap-1.5 transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
          <span>Show Stitch Flow Bar ({currentScreen.index}/70)</span>
        </button>
      )}

      {/* Main Screen Canvas */}
      <main className="flex-1 w-full h-full overflow-hidden relative">
        {viewMode === "code" && (
          <iframe
            ref={iframeRef}
            src={currentScreen.htmlPath}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0"
            title={currentScreen.title}
          />
        )}

        {viewMode === "png" && (
          <div className="w-full h-full overflow-auto bg-slate-900 p-4 flex justify-center">
            <img
              src={currentScreen.pngPath}
              alt={currentScreen.title}
              className="max-w-full h-auto object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}

        {viewMode === "compare" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full overflow-hidden">
            <div className="h-full border-r border-[#eaedff] flex flex-col">
              <div className="bg-[#eaedff] px-3 py-1 text-[11px] font-bold text-[#003178] flex items-center justify-between">
                <span>LIVE INTERACTIVE CODE.HTML</span>
                <span className="text-[10px] text-[#434652]">Real buttons, forms &amp; links</span>
              </div>
              <iframe
                ref={iframeRef}
                src={currentScreen.htmlPath}
                onLoad={handleIframeLoad}
                className="w-full flex-1 border-0"
                title={`${currentScreen.title} Interactive`}
              />
            </div>
            <div className="h-full flex flex-col bg-slate-900">
              <div className="bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-200 flex items-center justify-between">
                <span>ORIGINAL GOOGLE STITCH DESIGN (SCREEN.PNG)</span>
                <span className="text-[10px] text-slate-400">100% Visual Benchmark</span>
              </div>
              <div className="flex-1 overflow-auto p-3 flex justify-center">
                <img
                  src={currentScreen.pngPath}
                  alt={currentScreen.title}
                  className="max-w-full h-auto object-contain rounded-lg shadow-xl self-start"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
