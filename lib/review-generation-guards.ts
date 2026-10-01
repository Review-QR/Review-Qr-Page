type SessionRecord = {
  id: string;
  business_id: string;
  selected_rating: number | null;
  expires_at: string | null;
};

type UsableSession = Omit<SessionRecord, "selected_rating" | "expires_at"> & {
  selected_rating: number;
  expires_at: string;
};

type ExperienceRecord = {
  review_session_id: string;
  business_id: string;
  category_key: string;
  category_label_snapshot: string;
};

export function isUsableReviewSession(
  session: SessionRecord | null,
  businessId: string,
  sessionId: string,
  now = Date.now(),
): session is UsableSession {
  return Boolean(
    session &&
      session.id === sessionId &&
      session.business_id === businessId &&
      typeof session.selected_rating === "number" &&
      Number.isInteger(session.selected_rating) &&
      session.selected_rating >= 1 &&
      session.selected_rating <= 5 &&
      session.expires_at &&
      Date.parse(session.expires_at) > now,
  );
}

export function areValidReviewExperiences(
  experiences: ExperienceRecord[] | null,
  businessId: string,
  sessionId: string,
  enabledKeys: string[],
) {
  if (!experiences?.length || experiences.length > 10) return false;
  const enabled = new Set(enabledKeys);
  return experiences.every(
    (experience) =>
      experience.review_session_id === sessionId &&
      experience.business_id === businessId &&
      /^[a-z][a-z0-9_]{0,63}$/.test(experience.category_key) &&
      Boolean(experience.category_label_snapshot?.trim()) &&
      enabled.has(experience.category_key),
  );
}

export function isReusableGeneratedDraft(
  generation: { generation_status: string; generated_text: string | null } | null,
): generation is { generation_status: "generated"; generated_text: string } {
  return Boolean(
    generation?.generation_status === "generated" && generation.generated_text,
  );
}

export function nextReviewGenerationNumber(current: unknown): number | null {
  if (!Number.isSafeInteger(current) || (current as number) < 0 || current === Number.MAX_SAFE_INTEGER) return null;
  return (current as number) + 1;
}
