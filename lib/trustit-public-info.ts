import type { Metadata } from "next";
import { appConfig } from "@/lib/config";
import { publicUrl } from "@/lib/public-discovery-seo";

/** Public business details are supplied by deployment configuration, never guessed. */
export const trustitPublicInfo = {
  brand: "Trustit",
  legalName: process.env.NEXT_PUBLIC_TRUSTIT_LEGAL_NAME?.trim() || null,
  supportEmail: process.env.NEXT_PUBLIC_TRUSTIT_SUPPORT_EMAIL?.trim() || null,
  supportPhone: process.env.NEXT_PUBLIC_TRUSTIT_SUPPORT_PHONE?.trim() || null,
  businessAddress: process.env.NEXT_PUBLIC_TRUSTIT_BUSINESS_ADDRESS?.trim() || null,
  taxDisclosure: process.env.NEXT_PUBLIC_TRUSTIT_TAX_DISCLOSURE?.trim() || null,
} as const;

export const trustitPublicPlans = Object.values(appConfig.plans).map((plan) => ({
  name: plan.name,
  price: plan.price,
  durationDays: plan.durationDays,
}));

export const trustitPolicyLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms and Conditions" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About Trustit" },
] as const;

export function trustitInformationMetadata(input: { title: string; description: string; path: string }): Metadata {
  const canonical = publicUrl(input.path);
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title: input.title, description: input.description, siteName: "Trustit" },
    twitter: { card: "summary", title: input.title, description: input.description },
    robots: { index: true, follow: true },
  };
}
