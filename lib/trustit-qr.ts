export const trustitAppOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "")
  || "https://review-qr-page.vercel.app";

export function buildTrustitReviewUrl(origin: string, businessId: string) {
  if (!origin || !businessId) return "";
  return new URL(`/r/${encodeURIComponent(businessId)}`, origin).toString();
}

export function buildTrustitQrImageUrl(reviewRoute: string) {
  if (!reviewRoute) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&data=${encodeURIComponent(reviewRoute)}`;
}
