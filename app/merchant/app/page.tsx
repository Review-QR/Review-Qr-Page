"use client";

import React from "react";
import MerchantNativeAppShell from "@/app/merchant/components/MerchantNativeAppShell";

export const dynamic = "force-dynamic";

export default function MerchantAppStandalonePage() {
  return <MerchantNativeAppShell initialAuth={false} forceStandalone={false} />;
}
