/**
 * Shared Indian Currency Price Formatter (Pure TypeScript)
 * Formats standard Indian Rupees (e.g. ₹24,580 or ₹180)
 */

export function formatIndianCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}
