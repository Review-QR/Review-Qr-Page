/**
 * Shared Reward Points conversion helpers.
 * Business rule: Every 350 points equals INR 100.
 */
export const POINTS_UNIT = 350;
export const INR_PER_POINTS_UNIT = 100;

export function calculatePointsInrValue(points: number | null | undefined): number {
  const safePoints = Number.isFinite(Number(points)) ? Math.max(0, Number(points)) : 0;
  return Number(((safePoints * INR_PER_POINTS_UNIT) / POINTS_UNIT).toFixed(2));
}

export function formatPointsInr(points: number | null | undefined): string {
  const value = calculatePointsInrValue(points);
  return Number.isInteger(value) ? `₹${value}` : `₹${value.toFixed(2)}`;
}
