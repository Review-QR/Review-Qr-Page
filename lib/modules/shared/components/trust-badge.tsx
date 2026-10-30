/**
 * Shared Trust Badge Component
 */

export function TrustBadge({
  variant = "verified",
  text,
}: {
  variant?: "verified" | "vip" | "guarantee";
  text?: string;
}) {
  if (variant === "vip") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800 shadow-2xs">
        <span>👑</span>
        <span>{text || "VIP Merchant"}</span>
      </span>
    );
  }

  if (variant === "guarantee") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black text-blue-700 shadow-2xs">
        <span>🛡️</span>
        <span>{text || "Trustit Guarantee"}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 shadow-2xs">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>{text || "Verified Local"}</span>
    </span>
  );
}
