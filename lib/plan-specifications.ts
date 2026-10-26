import { appConfig, type PlanId } from "./config";

export interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanSpecification {
  id: PlanId;
  name: string;
  price: number;
  durationDays: number;
  tagline: string;
  badge?: string;
  features: PlanFeature[];
}

export const TRUSTIT_PLAN_SPECIFICATIONS: Record<PlanId, PlanSpecification> = {
  basic: {
    id: "basic",
    name: "Basic",
    price: appConfig.plans.basic.price,
    durationDays: appConfig.plans.basic.durationDays,
    tagline: "For small local businesses",
    features: [
      { name: "Dynamic Google Review QR", included: true },
      { name: "Instant 5-Star Review Redirect", included: true },
      { name: "1 Basic Printable Poster Template", included: true },
      { name: "Basic Scan Count Tracking", included: true },
      { name: "Customer CRM & Occasions (Birthday/Anniversary)", included: false },
      { name: "Negative Review Feedback Filter", included: false },
      { name: "Standard Email Support", included: true },
    ],
  },
  standard: {
    id: "standard",
    name: "Standard",
    price: appConfig.plans.standard.price,
    durationDays: appConfig.plans.standard.durationDays,
    tagline: "Best for growing businesses",
    badge: "Most Popular",
    features: [
      { name: "Dynamic Google Review QR", included: true },
      { name: "Instant 5-Star Review Redirect", included: true },
      { name: "5+ Premium Posters & Templates", included: true },
      { name: "Daily & Weekly Scan Analytics", included: true },
      { name: "Customer CRM & Occasions (Upto 100 Customers)", included: true, highlight: true },
      { name: "Negative Review Feedback Alert", included: true, highlight: true },
      { name: "Priority WhatsApp Support", included: true },
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: appConfig.plans.premium.price,
    durationDays: appConfig.plans.premium.durationDays,
    tagline: "For established businesses & brands",
    badge: "Best Value",
    features: [
      { name: "Dynamic Google Review QR", included: true },
      { name: "Instant 5-Star Review Redirect", included: true },
      { name: "All Posters + Standee Designs", included: true },
      { name: "Advanced Analytics & Peak Hours", included: true },
      { name: "Unlimited Customer CRM & Occasions", included: true, highlight: true },
      { name: "Priority Negative Review Alert + Instant SMS", included: true, highlight: true },
      { name: "24/7 Dedicated Priority Support", included: true },
    ],
  },
};

export function getPlanSpecification(planId: string): PlanSpecification | undefined {
  const normalized = planId.toLowerCase() as PlanId;
  return TRUSTIT_PLAN_SPECIFICATIONS[normalized];
}
