"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MerchantNativeAppShell, { MerchantCategory } from "@/app/merchant/components/MerchantNativeAppShell";

export const dynamic = "force-dynamic";

function MerchantAppContent() {
  const searchParams = useSearchParams();
  const authParam = searchParams.get("auth");
  const stepParam = searchParams.get("step") as "pitch" | "category" | "kyc" | "login" | null;
  const catParam = searchParams.get("cat") as MerchantCategory | null;
  const storeParam = searchParams.get("store");
  const ownerParam = searchParams.get("owner");
  const standaloneParam = searchParams.get("standalone");
  const subParam = searchParams.get("sub");

  return (
    <MerchantNativeAppShell
      initialAuth={authParam === "true"}
      initialAuthStep={stepParam || "pitch"}
      initialCategory={catParam || "kirana"}
      initialStoreName={storeParam || "Ankit Shukla General Store"}
      initialOwnerName={ownerParam || "Ankit Shukla"}
      initialSubScreen={subParam || null}
      forceStandalone={standaloneParam === "true"}
    />
  );
}

export default function MerchantAppStandalonePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-slate-500 font-sans">Loading Merchant Suite...</div>}>
      <MerchantAppContent />
    </Suspense>
  );
}
