import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getReviewTaxonomyType } from "@/lib/config/business-types";
import { safeReviewLink } from "@/lib/safe-review-link";
import {
  localReviewDraftProvider,
  requestReviewDraft,
} from "@/lib/review-draft-provider";
import {
  areValidReviewExperiences,
  isUsableReviewSession,
  nextReviewGenerationNumber,
} from "@/lib/review-generation-guards";
import {
  executeClaimedReviewGeneration,
  type ReviewGenerationClaim,
} from "@/lib/review-generation-execution";
import type {
  CreateReviewSessionResult,
  GenerateReviewDraftResult,
  ReviewExperienceCategory,
  SaveReviewExperiencesResult,
  RestoredReviewSession,
  SubmitTrustitReviewResult,
  TrustitReviewSubmission,
} from "./review-session-types";
import { validateGoogleReviewHandoff } from "@/lib/google-review-handoff";
import { isValidOptionalMobile } from "@/lib/trustit-review-validation";

const GENERIC_FAILURE =
  "We couldn't save your rating right now. Please try again.";
const EXPERIENCE_SAVE_FAILURE =
  "We couldn't save your experience details right now. Please try again.";
const DRAFT_FAILURE =
  "We couldn't prepare your review draft right now. Please try again.";
const HANDOFF_FAILURE =
  "We couldn't open this business's review page. Please scan the QR code again.";
const TRUSTIT_SUBMIT_FAILURE =
  "We couldn't share your review right now. Please check the details and try again.";

const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORY_KEY_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

function reviewSessionCookieName(businessId: string) {
  const suffix = createHash("sha256").update(businessId).digest("hex").slice(0, 20);
  return `trustit_review_session_${suffix}`;
}

export async function getReviewSessionCookie(businessId: string) {
  if (!isValidBusinessId(businessId)) return null;
  try {
    const value = (await cookies()).get(reviewSessionCookieName(businessId))?.value;
    return isValidSessionId(value) ? value : null;
  } catch {
    return null;
  }
}

export async function setReviewSessionCookie(businessId: string, sessionId: string) {
  if (!isValidBusinessId(businessId) || !isValidSessionId(sessionId)) return;
  const cookieStore = await cookies();
  cookieStore.set(reviewSessionCookieName(businessId), sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60,
  });
}

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
    String(business.status ?? "").toLowerCase() === "active" &&
    String(business.merchant_status ?? "").toLowerCase() === "active" &&
    String(business.qr_status ?? "").toLowerCase() === "active" &&
    (!business.expiry || String(business.expiry) >= today) &&
    Boolean(safeReviewLink(business.review_link))
  );
}

async function resolveQrBusiness(businessId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("get_trustit_review_business", {
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
    const business = await resolveQrBusiness(businessId);

    if (!business || typeof business.type !== "string") return [];

    const businessType = getReviewTaxonomyType(business.type);
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

export async function restoreReviewSessionForBusiness(
  businessId: string,
  sessionId: string,
): Promise<RestoredReviewSession> {
  if (!isValidBusinessId(businessId) || !isValidSessionId(sessionId)) return null;
  try {
    const business = await resolveQrBusiness(businessId);
    if (!business) return null;
    const admin = createSupabaseAdminClient();
    const { data: session, error: sessionError } = await admin
      .from("review_sessions")
      .select("id, business_id, selected_rating, current_review_text, review_status, current_generation_number, expires_at")
      .eq("id", sessionId)
      .eq("business_id", businessId)
      .maybeSingle();
    if (sessionError || !session || !Number.isInteger(session.selected_rating) ||
      session.selected_rating < 1 || session.selected_rating > 5 ||
      (session.review_status !== "submitted" && (!session.expires_at || session.expires_at <= new Date().toISOString())) ||
      !["in_progress", "draft_ready", "submitted"].includes(session.review_status)) return null;

    const { data: experiences, error: experiencesError } = await admin
      .from("review_session_experiences")
      .select("review_session_id, business_id, category_key, category_label_snapshot, selected_at")
      .eq("review_session_id", sessionId)
      .eq("business_id", businessId)
      .order("selected_at", { ascending: true });
    if (experiencesError || (experiences?.length ?? 0) > 10) return null;
    const selectedExperiences = (experiences ?? []).map((item) => ({
      key: item.category_key,
      label: item.category_label_snapshot,
    }));
    if (experiences?.some((item) => item.review_session_id !== sessionId || item.business_id !== businessId ||
      !CATEGORY_KEY_PATTERN.test(item.category_key) || !item.category_label_snapshot?.trim())) return null;

    let draft: string | null = null;
    if (session.current_generation_number > 0) {
      const { data: generation, error: generationError } = await admin
        .from("review_generations")
        .select("generation_status, generated_text")
        .eq("review_session_id", sessionId)
        .eq("business_id", businessId)
        .eq("generation_number", session.current_generation_number)
        .maybeSingle();
      if (generationError || generation?.generation_status !== "generated" || !generation.generated_text) return null;
      draft = typeof session.current_review_text === "string" && session.current_review_text.trim()
        ? session.current_review_text
        : generation.generated_text;
    }
    if (session.review_status === "draft_ready" && !draft) return null;
    return {
      rating: session.selected_rating,
      selectedExperiences,
      draft,
      submitted: session.review_status === "submitted",
    };
  } catch {
    return null;
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
      .select("id, business_id, selected_rating, expires_at, current_generation_number")
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
      .select("id, business_id, selected_rating, expires_at, current_generation_number")
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

export async function generateReviewDraftForBusiness(
  businessId: string,
  sessionId: string,
): Promise<GenerateReviewDraftResult> {
  if (!isValidBusinessId(businessId) || !isValidSessionId(sessionId)) {
    return { ok: false, message: DRAFT_FAILURE };
  }

  try {
    const business = await resolveQrBusiness(businessId);
    if (!business) {
      return {
        ok: false,
        message: "This QR code is currently unavailable. Please scan it again.",
      };
    }

    const admin = createSupabaseAdminClient();
    const { data: session, error: sessionError } = await admin
      .from("review_sessions")
      .select("id, business_id, selected_rating, expires_at, current_generation_number")
      .eq("id", sessionId)
      .eq("business_id", businessId)
      .maybeSingle();
    if (sessionError || !isUsableReviewSession(session, businessId, sessionId)) {
      return {
        ok: false,
        message: "Your review session has expired. Please scan the QR code again.",
      };
    }

    const { data: experiences, error: experiencesError } = await admin
      .from("review_session_experiences")
      .select("review_session_id, business_id, category_key, category_label_snapshot")
      .eq("review_session_id", sessionId)
      .eq("business_id", businessId)
      .order("category_key", { ascending: true });
    if (experiencesError || !experiences?.length || experiences.length > 10) {
      return {
        ok: false,
        message: "Your saved experiences could not be verified. Please start again.",
      };
    }

    const businessRecord = await resolveQrBusiness(businessId);
    if (
      !businessRecord ||
      businessRecord.id !== businessId ||
      typeof businessRecord.name !== "string" ||
      typeof businessRecord.type !== "string"
    ) {
      return { ok: false, message: DRAFT_FAILURE };
    }
    const businessName = businessRecord.name;

    const businessType = getReviewTaxonomyType(businessRecord.type);
    const experienceKeys = experiences.map((experience) => experience.category_key);
    const { data: enabledCategories, error: categoriesError } = await admin
      .from("review_experience_categories")
      .select("category_key")
      .eq("business_type", businessType)
      .eq("is_enabled", true)
      .in("category_key", experienceKeys);
    if (
      categoriesError ||
      !areValidReviewExperiences(
        experiences,
        businessId,
        sessionId,
        enabledCategories?.map((category) => category.category_key) ?? [],
      )
    ) {
      return {
        ok: false,
        message: "Some saved experiences are no longer available. Please scan the QR code again.",
      };
    }

    const generationNumber = nextReviewGenerationNumber(session.current_generation_number);
    if (generationNumber === null) return { ok: false, message: DRAFT_FAILURE };
    const experienceContext = experiences.map((experience) => ({
      key: experience.category_key,
      label: experience.category_label_snapshot,
    }));
    const { data: claimData, error: claimError } = await admin.rpc(
      "claim_review_generation",
      {
        p_business_id: businessId,
        p_review_session_id: sessionId,
        p_generation_number: generationNumber,
        p_rating_context: session.selected_rating,
        p_experience_context: experienceContext,
      },
    );
    const claim = (Array.isArray(claimData) ? claimData[0] : claimData) as
      | ReviewGenerationClaim
      | null;
    if (claimError || !claim) return { ok: false, message: DRAFT_FAILURE };

    const execution = await executeClaimedReviewGeneration(
      claim,
      async () => {
        const generated = await requestReviewDraft(localReviewDraftProvider, {
          businessName,
          rating: session.selected_rating,
          variation: generationNumber,
          experienceLabels: experiences.map(
            (experience) => experience.category_label_snapshot,
          ),
        });
        if (!generated.ok) throw new Error("Review draft generation failed");
        return generated.draft;
      },
      async (claimToken, generatedText) => {
        const { data, error } = await admin.rpc("finish_review_generation", {
          p_business_id: businessId,
          p_review_session_id: sessionId,
          p_generation_number: generationNumber,
          p_claim_token: claimToken,
          p_generated_text: generatedText,
        });
        return error ? null : (data as "generated" | "failed" | null);
      },
    );

    if (!execution.ok) {
      return {
        ok: false,
        message:
          execution.reason === "pending"
            ? "Your review draft is already being prepared. Please try again shortly."
            : DRAFT_FAILURE,
      };
    }

    const draft = execution.draft;
    const { error: sessionUpdateError } = await admin
      .from("review_sessions")
      .update({
        current_review_text: draft,
        current_generation_number: generationNumber,
        review_status: "draft_ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("business_id", businessId);
    if (sessionUpdateError) return { ok: false, message: DRAFT_FAILURE };
    return { ok: true, draft };
  } catch {
    return { ok: false, message: DRAFT_FAILURE };
  }
}

export async function saveReviewDraftEditForBusiness(
  businessId: string,
  sessionId: string,
  editedText: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isValidBusinessId(businessId) || !isValidSessionId(sessionId) ||
    typeof editedText !== "string" || !editedText.trim() || editedText.length > 10000) {
    return { ok: false, message: "Enter a valid review before continuing." };
  }
  try {
    const business = await resolveQrBusiness(businessId);
    if (!business) return { ok: false, message: "This QR code is currently unavailable. Please scan it again." };
    const admin = createSupabaseAdminClient();
    const { data: session, error: sessionError } = await admin
      .from("review_sessions")
      .select("id, business_id, review_status, current_generation_number, expires_at")
      .eq("id", sessionId)
      .eq("business_id", businessId)
      .maybeSingle();
    if (sessionError || !session || session.review_status !== "draft_ready" ||
      !session.expires_at || session.expires_at <= new Date().toISOString() ||
      !Number.isInteger(session.current_generation_number) || session.current_generation_number < 1) {
      return { ok: false, message: "Your review session has expired. Please scan the QR code again." };
    }
    const { data: generation, error: generationError } = await admin
      .from("review_generations")
      .select("generation_status, generated_text")
      .eq("review_session_id", sessionId)
      .eq("business_id", businessId)
      .eq("generation_number", session.current_generation_number)
      .maybeSingle();
    if (generationError || generation?.generation_status !== "generated" || !generation.generated_text) {
      return { ok: false, message: "Your review draft could not be verified. Please try again." };
    }
    const updatedAt = new Date().toISOString();
    const { data: updated, error: updateError } = await admin
      .from("review_sessions")
      .update({ current_review_text: editedText, updated_at: updatedAt })
      .eq("id", sessionId)
      .eq("business_id", businessId)
      .eq("review_status", "draft_ready")
      .eq("current_generation_number", session.current_generation_number)
      .gt("expires_at", updatedAt)
      .select("id")
      .maybeSingle();
    if (updateError || !updated) return { ok: false, message: "Your draft could not be saved. Please try again." };
    return { ok: true };
  } catch {
    return { ok: false, message: "Your draft could not be saved. Please try again." };
  }
}

const VALID_RELATIONS = new Set([
  "mother", "father", "husband", "wife", "brother", "sister", "son", "daughter",
]);

function validOccasionList(value: unknown, familyCount: number): value is TrustitReviewSubmission["occasions"] {
  if (!Array.isArray(value) || value.length > 2 * (familyCount + 1)) return false;
  const seen = new Set<string>();
  return value.every((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item) ||
      (item.owner !== "customer" && item.owner !== "family") ||
      (item.occasion !== "birthday" && item.occasion !== "anniversary") ||
      !Number.isInteger(item.month) || item.month < 1 || item.month > 12 ||
      !Number.isInteger(item.day) || item.day < 1 || item.day > [31,29,31,30,31,30,31,31,30,31,30,31][item.month - 1]) return false;
    const familyIndex = item.owner === "family" ? item.familyIndex : -1;
    if (item.owner === "family" && (!Number.isInteger(familyIndex) || familyIndex < 0 || familyIndex >= familyCount)) return false;
    if (item.owner === "customer" && item.familyIndex !== undefined) return false;
    const key = `${item.owner}:${familyIndex}:${item.occasion}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function submitTrustitReviewForBusiness(
  businessId: string,
  sessionId: string,
  submission: TrustitReviewSubmission,
): Promise<SubmitTrustitReviewResult> {
  if (!isValidBusinessId(businessId) || !isValidSessionId(sessionId) || !submission || typeof submission !== "object") {
    return { ok: false, message: TRUSTIT_SUBMIT_FAILURE };
  }
  const family = submission.familyMembers;
  const customerName = submission.customerName;
  const customerMobile = submission.customerMobile;
  if (typeof submission.reviewText !== "string" || !submission.reviewText.trim() || submission.reviewText.length > 10000 ||
    typeof customerName !== "string" || customerName.length > 160 ||
    typeof customerMobile !== "string" || !isValidOptionalMobile(customerMobile) ||
    typeof submission.shareDetails !== "boolean" || !Array.isArray(family) || family.length > 8 ||
    (!submission.shareDetails && (customerMobile.trim() || family.length || submission.occasions?.length)) ||
    family.some((member) => !member || typeof member.name !== "string" || !member.name.trim() || member.name.length > 160 ||
      typeof member.relation !== "string" || !VALID_RELATIONS.has(member.relation) ||
      typeof member.mobile !== "string" || !isValidOptionalMobile(member.mobile)) ||
    !validOccasionList(submission.occasions, family.length)) {
    return { ok: false, message: TRUSTIT_SUBMIT_FAILURE };
  }
  try {
    const business = await resolveQrBusiness(businessId);
    if (!business || typeof business.type !== "string") return { ok: false, message: "This QR code is unavailable. Please scan it again." };
    const admin = createSupabaseAdminClient();
    const { data: session, error: sessionError } = await admin
      .from("review_sessions")
      .select("id, business_id, selected_rating, expires_at, review_status, current_generation_number")
      .eq("id", sessionId)
      .eq("business_id", businessId)
      .maybeSingle();
    if (sessionError || !isUsableReviewSession(session, businessId, sessionId) ||
      !["draft_ready", "submitted"].includes(session.review_status) ||
      !Number.isInteger(session.current_generation_number) || session.current_generation_number < 1) {
      return { ok: false, message: TRUSTIT_SUBMIT_FAILURE };
    }
    const { data: experiences, error: experiencesError } = await admin
      .from("review_session_experiences")
      .select("review_session_id, business_id, category_key, category_label_snapshot")
      .eq("review_session_id", sessionId)
      .eq("business_id", businessId);
    const businessType = getReviewTaxonomyType(business.type);
    const { data: enabledCategories, error: categoriesError } = await admin
      .from("review_experience_categories")
      .select("category_key")
      .eq("business_type", businessType)
      .eq("is_enabled", true)
      .in("category_key", (experiences ?? []).map((item) => item.category_key));
    if (experiencesError || categoriesError || !areValidReviewExperiences(
      experiences,
      businessId,
      sessionId,
      enabledCategories?.map((item) => item.category_key) ?? [],
    )) return { ok: false, message: TRUSTIT_SUBMIT_FAILURE };
    const { data: generation, error: generationError } = await admin
      .from("review_generations")
      .select("generation_status, generated_text")
      .eq("review_session_id", sessionId)
      .eq("business_id", businessId)
      .eq("generation_number", session.current_generation_number)
      .maybeSingle();
    if (generationError || generation?.generation_status !== "generated" || !generation.generated_text) {
      return { ok: false, message: TRUSTIT_SUBMIT_FAILURE };
    }
    const { data, error } = await admin.rpc("submit_trustit_review", {
      p_business_id: businessId,
      p_review_session_id: sessionId,
      p_review_text: submission.reviewText,
      p_customer_name: customerName.trim() || "Guest",
      p_customer_mobile: submission.shareDetails ? customerMobile.trim() : null,
      p_share_details: submission.shareDetails,
      p_family_members: submission.shareDetails ? family : [],
      p_occasions: submission.shareDetails ? submission.occasions : [],
    });
    if (error || typeof data !== "string") return { ok: false, message: TRUSTIT_SUBMIT_FAILURE };
    return { ok: true };
  } catch {
    return { ok: false, message: TRUSTIT_SUBMIT_FAILURE };
  }
}

export async function handoffGoogleReviewForBusiness(
  businessId: string,
  sessionId: string,
  editedText: string,
): Promise<{ ok: true; reviewUrl: string } | { ok: false; message: string }> {
  if (!isValidBusinessId(businessId) || !isValidSessionId(sessionId)) {
    return { ok: false, message: HANDOFF_FAILURE };
  }

  try {
    const admin = createSupabaseAdminClient();
    const [{ data: businessData, error: businessError }, { data: session, error: sessionError }] =
      await Promise.all([
        admin.rpc("get_trustit_review_business", { p_business_id: businessId }),
        admin
          .from("review_sessions")
          .select("id, business_id, selected_rating, expires_at, review_status, current_generation_number")
          .eq("id", sessionId)
          .eq("business_id", businessId)
          .maybeSingle(),
      ]);

    const business = (Array.isArray(businessData) ? businessData[0] : businessData) as
      | Record<string, unknown>
      | null;

    if (businessError || sessionError || !business || !session) {
      return { ok: false, message: HANDOFF_FAILURE };
    }

    const { data: generation, error: generationError } = await admin
      .from("review_generations")
      .select("generation_status, generated_text")
      .eq("review_session_id", sessionId)
      .eq("business_id", businessId)
      .eq("generation_number", session.current_generation_number)
      .maybeSingle();

    if (generationError) return { ok: false, message: HANDOFF_FAILURE };

    const validated = validateGoogleReviewHandoff({
      business: business as Parameters<typeof validateGoogleReviewHandoff>[0]["business"],
      session,
      generation,
      businessId,
      sessionId,
      editedText,
    });
    if (!validated.ok) return { ok: false, message: HANDOFF_FAILURE };

    const updatedAt = new Date().toISOString();
    const { data: updatedSession, error: updateError } = await admin
      .from("review_sessions")
      .update({
        current_review_text: validated.reviewText,
        google_status: "redirected",
        updated_at: updatedAt,
      })
      .eq("id", sessionId)
      .eq("business_id", businessId)
      .eq("review_status", "draft_ready")
      .gt("expires_at", updatedAt)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedSession) {
      return { ok: false, message: HANDOFF_FAILURE };
    }

    return { ok: true, reviewUrl: validated.reviewUrl };
  } catch {
    return { ok: false, message: HANDOFF_FAILURE };
  }
}
