import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeReviewLink } from "@/lib/safe-review-link";
import { supabase } from "@/lib/supabase";
import type { CreateReviewSessionResult } from "./review-session-types";

const GENERIC_FAILURE =
  "We couldn't save your rating right now. Please try again.";

export async function createReviewSessionForBusiness(
  businessId: string,
  sessionId: string,
  rating: number,
): Promise<CreateReviewSessionResult> {
  if (
    typeof businessId !== "string" ||
    businessId.length < 1 ||
    businessId.length > 128 ||
    businessId.trim() !== businessId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { ok: false, message: "Choose a rating from 1 to 5." };
  }

  try {
    // Re-resolve the server-bound route business through the restricted QR RPC.
    const { data, error } = await supabase.rpc("get_business_for_qr", {
      p_business_id: businessId,
    });
    const business = Array.isArray(data) ? data[0] : data;

    if (error || !business || business.id !== businessId) {
      return {
        ok: false,
        message: "This QR code could not be verified. Please scan it again.",
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const isActive =
      String(business.qr_status ?? "").toLowerCase() === "active" &&
      (!business.expiry || business.expiry >= today);
    if (!isActive) {
      return {
        ok: false,
        message: "This QR code is currently inactive or has expired.",
      };
    }
    if (!safeReviewLink(business.review_link)) {
      return {
        ok: false,
        message: "This business has not configured a review link yet.",
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
