import { qrTemplates, type QrTemplateId } from "../app/merchant/dashboard/qr/templates.ts";

export type PlanTier = "basic" | "standard" | "premium";

export function normalizePlanTier(plan: string | null | undefined): PlanTier {
  const normalized = String(plan ?? "").trim().toLowerCase();
  if (normalized.includes("premium")) return "premium";
  if (normalized.includes("standard")) return "standard";
  return "basic";
}

export const PLAN_ALLOWED_TEMPLATES_COUNT: Record<PlanTier, number> = {
  basic: 2,
  standard: 5,
  premium: 8,
};

export const RESTRICTED_ROUTES_FOR_BASIC = [
  "/merchant/dashboard/menu",
  "/merchant/dashboard/messages",
  "/merchant/dashboard/orders",
] as const;

export const BASIC_PLAN_NAV_ITEMS = [
  "/merchant/dashboard",
  "/merchant/dashboard/business",
  "/merchant/dashboard/qr",
  "/merchant/dashboard/products",
  "/merchant/dashboard/reviews",
  "/merchant/dashboard/subscription",
  "/merchant/dashboard/payments",
  "/merchant/dashboard/profile",
] as const;

export function getAllowedTemplatesCount(plan: string | null | undefined): number {
  const tier = normalizePlanTier(plan);
  return PLAN_ALLOWED_TEMPLATES_COUNT[tier];
}

export function getTemplatesForPlan<T>(templates: T[], plan: string | null | undefined): T[] {
  const count = getAllowedTemplatesCount(plan);
  return templates.slice(0, count);
}

export function isRouteAllowedForPlan(path: string, plan: string | null | undefined): boolean {
  const tier = normalizePlanTier(plan);
  if (tier === "basic") {
    return !RESTRICTED_ROUTES_FOR_BASIC.some(
      (restricted) => path === restricted || path.startsWith(`${restricted}/`),
    );
  }
  return true;
}

/**
 * Renewal strictly sets validity to 30 days from the renewal date,
 * without carrying over any remaining days from a previous expiry.
 */
export function calculateRenewalExpiry(todayDate: string | Date = new Date()): string {
  const d = typeof todayDate === "string" ? new Date(`${todayDate}T00:00:00Z`) : new Date(todayDate);
  d.setUTCDate(d.getUTCDate() + 30);
  return d.toISOString().slice(0, 10);
}
