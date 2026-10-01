type HandoffBusiness = {
  id: string;
  status: string | null;
  merchant_status: string | null;
  qr_status: string | null;
  expiry: string | null;
  review_link: unknown;
};

type HandoffSession = {
  id: string;
  business_id: string;
  selected_rating: number | null;
  expires_at: string | null;
  review_status: string;
  current_generation_number: number;
};

type HandoffGeneration = {
  generation_status: string;
  generated_text: string | null;
};

export type GoogleHandoffValidation =
  | { ok: true; reviewUrl: string; reviewText: string }
  | { ok: false };

function resolveSafeReviewLink(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function validateGoogleReviewHandoff(input: {
  business: HandoffBusiness | null;
  session: HandoffSession | null;
  generation: HandoffGeneration | null;
  businessId: string;
  sessionId: string;
  editedText: unknown;
  now?: number;
}): GoogleHandoffValidation {
  const { business, session, generation, businessId, sessionId, editedText } = input;
  const now = input.now ?? Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  const reviewUrl = business ? resolveSafeReviewLink(business.review_link) : null;
  const reviewHost = reviewUrl ? new URL(reviewUrl).hostname.toLowerCase() : "";
  const isGoogleReviewHost =
    reviewHost === "google.com" ||
    reviewHost.endsWith(".google.com") ||
    reviewHost === "g.page" ||
    reviewHost === "maps.app.goo.gl";

  if (
    !business ||
    business.id !== businessId ||
    business.status !== "active" ||
    business.merchant_status !== "active" ||
    business.qr_status !== "active" ||
    (business.expiry != null && business.expiry < today) ||
    !reviewUrl ||
    !isGoogleReviewHost ||
    !session ||
    session.id !== sessionId ||
    session.business_id !== businessId ||
    !Number.isInteger(session.selected_rating) ||
    (session.selected_rating ?? 0) < 1 ||
    (session.selected_rating ?? 0) > 5 ||
    !session.expires_at ||
    Date.parse(session.expires_at) <= now ||
    session.review_status !== "draft_ready" ||
    !Number.isInteger(session.current_generation_number) ||
    session.current_generation_number < 1 ||
    generation?.generation_status !== "generated" ||
    typeof generation.generated_text !== "string" ||
    generation.generated_text.trim().length < 1 ||
    generation.generated_text.length > 10000 ||
    typeof editedText !== "string" ||
    editedText.trim().length < 1 ||
    editedText.length > 10000
  ) {
    return { ok: false };
  }

  return { ok: true, reviewUrl, reviewText: editedText };
}
