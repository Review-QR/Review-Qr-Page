"use client";

import React, { useEffect, useState } from "react";
import MerchantNativeAppShell, { MerchantCategory } from "@/app/merchant/components/MerchantNativeAppShell";

export const dynamic = "force-dynamic";

interface StoredSession {
  ready: boolean;
  isAuthenticated: boolean;
  category: MerchantCategory;
  storeName: string;
  ownerName: string;
}

export default function PartnerPage() {
  const [session, setSession] = useState<StoredSession>({
    ready: false,
    isAuthenticated: false,
    category: "kirana",
    storeName: "Gupta Kirana & General Store",
    ownerName: "Merchant Partner",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("trustit_merchant_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.isAuthenticated) {
            setSession({
              ready: true,
              isAuthenticated: true,
              category: (parsed.category as MerchantCategory) || "kirana",
              storeName: parsed.storeName || "My Store",
              ownerName: parsed.ownerName || "Merchant Partner",
            });
            return;
          }
        }
      } catch (err) {
        console.error("Failed to parse merchant session:", err);
      }

      // No active session: Start at fresh onboarding pitch
      setSession({
        ready: true,
        isAuthenticated: false,
        category: "kirana",
        storeName: "Gupta Kirana & General Store",
        ownerName: "Merchant Partner",
      });
    }
  }, []);

  // Fast loading state before hydration/localStorage inspection
  if (!session.ready) {
    return (
      <div className="w-full h-screen bg-[#FAF9F6] flex flex-col items-center justify-center font-sans select-none">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-xl animate-pulse mb-3">
          T
        </div>
        <span className="text-xs font-black text-slate-800 tracking-tight">TRUSTIT PARTNER</span>
        <span className="text-[10px] text-slate-500 mt-1 font-medium">Starting Merchant Suite...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Floating Shortcut to Studio & Screen Designer */}
      <div className="fixed top-2.5 right-2.5 z-50">
        <a
          href="/merchant/studio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 text-white border border-amber-400 text-[11px] font-black shadow-xl backdrop-blur-md hover:bg-slate-800 transition active:scale-95"
        >
          <span>🎨</span>
          <span>Screen Designer &amp; Planner →</span>
        </a>
      </div>

      <MerchantNativeAppShell
        initialAuth={session.isAuthenticated}
        initialAuthStep="pitch"
        initialCategory={session.category}
        initialStoreName={session.storeName}
        initialOwnerName={session.ownerName}
        forceStandalone={true}
      />
    </div>
  );
}
