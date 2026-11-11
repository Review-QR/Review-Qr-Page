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
  phone: string;
  businessId: string;
}

export default function PartnerPage() {
  const [session, setSession] = useState<StoredSession>({
    ready: false,
    isAuthenticated: false,
    category: "kirana",
    storeName: "My Store",
    ownerName: "Merchant Partner",
    phone: "",
    businessId: "",
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
              phone: parsed.phone || "",
              businessId: parsed.businessId || "",
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
        storeName: "My Store",
        ownerName: "Merchant Partner",
        phone: "",
        businessId: "",
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
      <MerchantNativeAppShell
        initialAuth={session.isAuthenticated}
        initialAuthStep="pitch"
        initialCategory={session.category}
        initialStoreName={session.storeName}
        initialOwnerName={session.ownerName}
        initialPhone={session.phone}
        initialBusinessId={session.businessId}
        forceStandalone={true}
      />
    </div>
  );
}
