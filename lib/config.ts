export const appConfig = {
  name: "Review-QR",
  description: "QR Review Management Platform",

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  },

  plans: {
    basic: {
      name: "Basic",
      price: 29,
      durationDays: 30,
    },
    standard: {
      name: "Standard",
      price: 49,
      durationDays: 30,
    },
    premium: {
      name: "Premium",
      price: 99,
      durationDays: 30,
    },
  },

  subscription: {
    gracePeriodDays: 3,
    expiryWarningDays: 7,
  },
} as const;

export type PlanId = keyof typeof appConfig.plans;
