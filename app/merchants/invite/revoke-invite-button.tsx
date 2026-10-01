"use client";

import { useState } from "react";
import { revokeMerchantInviteAction } from "./actions";

export default function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const [pending, setPending] = useState(false);

  async function revoke() {
    if (!window.confirm("Revoke this merchant registration link?")) return;
    setPending(true);
    try {
      const result = await revokeMerchantInviteAction(inviteId);
      if (!result.success) window.alert(result.message);
      else window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return <button type="button" disabled={pending} onClick={revoke} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{pending ? "Revoking…" : "Revoke"}</button>;
}
