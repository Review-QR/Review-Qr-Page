import { TRUSTIT_SITE_URL } from "./public-discovery-seo.ts";

export const trustitAppOrigin = TRUSTIT_SITE_URL;

export function buildTrustitReviewUrl(origin: string, businessId: string) {
  if (!origin || !businessId) return "";
  return new URL(`/r/${encodeURIComponent(businessId)}`, origin).toString();
}

export function buildTrustitQrImageUrl(reviewRoute: string) {
  if (!reviewRoute) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&data=${encodeURIComponent(reviewRoute)}`;
}
