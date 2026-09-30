import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeReviewLink } from "@/lib/safe-review-link";
import { supabase } from "@/lib/supabase";
import type {
  CreateReviewSessionResult,
  ReviewExperienceCategory,
  SaveReviewExperiencesResult,
} from "./review-session-types";

const GENERIC_FAILURE =
  "We couldn't save your rating right now. Please try again.";
const EXPERIENCE_SAVE_FAILURE =
  "We couldn't save your experience details right now. Please try again.";

const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORY_KEY_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

function isValidBusinessId(businessId: unknown): businessId is string {
  return (
    typeof businessId === "string" &&
    businessId.length >= 1 &&
    businessId.length <= 128 &&
    businessId.trim() === businessId
  );
}

function isValidSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === "string" && SESSION_ID_PATTERN.test(sessionId);
}

function isEligibleQrBusiness(business: Record<string, unknown> | null) {
  if (!business) return false;
  const today = new Date().toISOString().slice(0, 10);
  return (
    String(business.qr_status ?? "").toLowerCase() === "active" &&
    (!business.expiry || String(business.expiry) >= today) &&
    Boolean(safeReviewLink(business.review_link))
  );
}

async function resolveQrBusiness(businessId: string) {
  const { data, error } = await supabase.rpc("get_business_for_qr", {
    p_business_id: businessId,
  });
  const business = (Array.isArray(data) ? data[0] : data) as
    | Record<string, unknown>
    | null;

  if (error || !business || business.id !== businessId) return null;
  return isEligibleQrBusiness(business) ? business : null;
}

export async function getReviewExperienceCategoriesForBusiness(
  businessId: string,
): Promise<ReviewExperienceCategory[]> {
  if (!isValidBusinessId(businessId)) return [];

  try {
    const admin = createSupabaseAdminClient();
    const { data: business, error: businessError } = await admin
      .from("businesses")
      .select("type")
      .eq("id", businessId)
      .maybeSingle();

    if (businessError || !business?.type) return [];

    // The registration flow stores clinics as "Clinic"; the configured
    // customer experience taxonomy names that category family "Medical".
    const businessType = business.type === "Clinic" ? "Medical" : business.type;
    const { data: categories, error: categoriesError } = await admin
      .from("review_experience_categories")
      .select("category_key, display_label")
      .eq("business_type", businessType)
      .eq("is_enabled", true)
      .order("display_order", { ascending: true });

    if (categoriesError || !categories?.length) return [];
    return categories.map((category) => ({
      key: category.category_key,
      label: category.display_label,
    }));
  } catch {
    return [];
  }
}

export async function createReviewSessionForBusiness(
  businessId: string,
  sessionId: string,
  rating: number,
): Promise<CreateReviewSessionResult> {
  if (
    !isValidBusinessId(businessId) ||
    !isValidSessionId(sessionId) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { ok: false, message: "Choose a rating from 1 to 5." };
  }

  try {
    // Re-resolve the server-bound route business through the restricted QR RPC.
    const business = await resolveQrBusiness(businessId);
    if (!business) {
      return {
        ok: false,
        message: "This QR code could not be verified. Please scan it again.",
      };
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const admin = createSupabaseAdminClient();
    const { data: session, error: insertError } = await admin
      .from("review_sessions")
      .insert({
        id: sessionId,
        business_id: business.id,
        selected_rating: rating,
        review_status: "in_progress",
        google_status: "not_started",
        trustit_status: "not_started",
        current_generation_number: 0,
        expires_at: expiresAt,
      })
      .select("id, business_id, selected_rating, expires_at")
      .single();

    if (insertError || !session) {
      // Replayed requests for this rendered QR visit reuse the same session ID.
      // A different rating or business cannot replace the saved session state.
      const { data: existingSession } = await admin
        .from("review_sessions")
        .select("id, business_id, selected_rating, expires_at")
        .eq("id", sessionId)
        .maybeSingle();

      if (
        !existingSession ||
        existingSession.business_id !== business.id ||
        existingSession.selected_rating === null ||
        !existingSession.expires_at ||
        existingSession.expires_at <= new Date().toISOString()
      ) {
        return { ok: false, message: GENERIC_FAILURE };
      }

      return {
        ok: true,
        sessionId: existingSession.id,
        rating: existingSession.selected_rating,
      };
    }

    if (
      session.business_id !== business.id ||
      session.selected_rating !== rating ||
      session.id !== sessionId
    ) {
      return { ok: false, message: GENERIC_FAILURE };
    }

    return {
      ok: true,
      sessionId: session.id,
      rating: session.selected_rating,
    };
  } catch {
    // Keep server errors and database responses out of client-facing output/logs.
    return { ok: false, message: GENERIC_FAILURE };
  }
}

export async function saveReviewSessionExperiencesForBusiness(
  businessId: string,
  sessionId: string,
  categoryKeys: string[],
): Promise<SaveReviewExperiencesResult> {
  if (
    !isValidBusinessId(businessId) ||
    !isValidSessionId(sessionId) ||
    !Array.isArray(categoryKeys) ||
    categoryKeys.length > 100 ||
    categoryKeys.some(
      (key) => typeof key !== "string" || !CATEGORY_KEY_PATTERN.test(key),
    )
  ) {
    return { ok: false, message: "Choose one or more valid experiences." };
  }

  const normalizedKeys = [...new Set(categoryKeys)].sort();
  if (normalizedKeys.length < 1 || normalizedKeys.length > 10) {
    return { ok: false, message: "Choose between 1 and 10 experiences." };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: session, error: sessionError } = await admin
      .from("review_sessions")
      .select("id, business_id, selected_rating, expires_at")
      .eq("id", sessionId)
      .eq("business_id", businessId)
      .maybeSingle();

    if (
      sessionError ||
      !session ||
      session.id !== sessionId ||
      session.business_id !== businessId ||
      session.selected_rating === null ||
      !session.expires_at ||
      session.expires_at <= new Date().toISOString()
    ) {
      return {
        ok: false,
        message: "Your review session has expired. Please scan the QR code again.",
      };
    }

    const business = await resolveQrBusiness(businessId);
    if (!business) {
      return {
        ok: false,
        message: "This QR code is currently unavailable. Please scan it again.",
      };
    }

    const { data: existingExperiences, error: existingError } = await admin
      .from("review_session_experiences")
      .select("category_key")
      .eq("review_session_id", sessionId)
      .eq("business_id", businessId);

    if (existingError) {
      return { ok: false, message: EXPERIENCE_SAVE_FAILURE };
    }
    if (existingExperiences?.length) {
      const savedKeys = existingExperiences
        .map((experience) => experience.category_key)
        .sort();
      if (
        savedKeys.length === normalizedKeys.length &&
        savedKeys.every((key, index) => key === normalizedKeys[index])
      ) {
        return { ok: true, categoryKeys: normalizedKeys };
      }
      return {
        ok: false,
        message: "Experience details have already been saved for this session.",
      };
    }

    const categories = await getReviewExperienceCategoriesForBusiness(businessId);
    const categoryByKey = new Map(categories.map((category) => [category.key, category]));
    if (normalizedKeys.some((key) => !categoryByKey.has(key))) {
      return {
        ok: false,
        message: "Some selected experiences are no longer available. Please choose again.",
      };
    }

    // The database function serializes retries per session and snapshots the
    // currently enabled labels, so concurrent requests cannot merge selections.
    const { data: savedKeys, error: saveError } = await admin.rpc(
      "save_review_session_experiences",
      {
        p_business_id: businessId,
        p_review_session_id: sessionId,
        p_category_keys: normalizedKeys,
      },
    );

    if (
      saveError ||
      !Array.isArray(savedKeys) ||
      savedKeys.length !== normalizedKeys.length ||
      [...savedKeys].sort().some((key, index) => key !== normalizedKeys[index])
    ) {
      return { ok: false, message: EXPERIENCE_SAVE_FAILURE };
    }

    return { ok: true, categoryKeys: normalizedKeys };
  } catch {
    return { ok: false, message: EXPERIENCE_SAVE_FAILURE };
  }
}
