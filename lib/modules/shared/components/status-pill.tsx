/**
 * Shared Status Pill Component
 */

export function StatusPill({
  status,
  label,
}: {
  status: "active" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "disputed" | "cancelled";
  label?: string;
}) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-800 border-emerald-300",
    preparing: "bg-amber-50 text-amber-800 border-amber-300",
    ready: "bg-blue-50 text-blue-800 border-blue-300",
    out_for_delivery: "bg-purple-50 text-purple-800 border-purple-300",
    delivered: "bg-emerald-100 text-emerald-900 border-emerald-400",
    disputed: "bg-rose-50 text-rose-800 border-rose-300",
    cancelled: "bg-slate-100 text-slate-700 border-slate-300",
  };

  const currentStyle = styles[status] || styles.active;
  const displayLabel = label || status.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${currentStyle}`}>
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
}
