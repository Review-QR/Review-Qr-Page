/**
 * Shared Delivery Instruction Chip Component
 */

export function DeliveryInstructionChip({
  label,
  icon,
  isSelected,
  onToggle,
}: {
  label: string;
  icon?: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition border ${
        isSelected
          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {isSelected && <span>✓</span>}
    </button>
  );
}
