"use client";

import React, { useEffect, useState } from "react";
import MerchantNativeAppShell from "@/app/merchant/components/MerchantNativeAppShell";

export const dynamic = "force-dynamic";

export default function MerchantRootPage() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <MerchantNativeAppShell
      initialAuth={true}
      forceStandalone={isMobile}
    />
  );
}
