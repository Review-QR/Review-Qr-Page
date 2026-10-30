import { formatIndianCurrency } from "./currency-format.ts";

export { formatIndianCurrency };

export function IndianCurrencyPrice({
  amount,
  className = "",
}: {
  amount: number | string;
  className?: string;
}) {
  return <span className={`font-black tracking-tight ${className}`}>{formatIndianCurrency(amount)}</span>;
}
