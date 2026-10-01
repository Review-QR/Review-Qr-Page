export type ReviewGenerationClaim = {
  claimed: boolean;
  generation_status: "generated" | "requested" | "failed";
  generated_text: string | null;
  claim_token: string | null;
};

export type ReviewGenerationExecution =
  | { ok: true; draft: string }
  | { ok: false; reason: "pending" | "failed" };

export async function executeClaimedReviewGeneration(
  claim: ReviewGenerationClaim,
  generate: () => Promise<string>,
  finish: (claimToken: string, generatedText: string | null) => Promise<string | null>,
): Promise<ReviewGenerationExecution> {
  if (claim.generation_status === "generated" && claim.generated_text) {
    return { ok: true, draft: claim.generated_text };
  }

  if (!claim.claimed) return { ok: false, reason: "pending" };
  if (claim.generation_status !== "requested" || !claim.claim_token) {
    return { ok: false, reason: "failed" };
  }

  let draft: string | null = null;
  try {
    draft = await generate();
  } catch {
    // The finalizer records a failed attempt only if this token still owns it.
  }

  try {
    const finalStatus = await finish(claim.claim_token, draft);
    if (finalStatus !== "generated" || !draft) {
      return { ok: false, reason: "failed" };
    }
    return { ok: true, draft };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
