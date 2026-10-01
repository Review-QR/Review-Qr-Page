import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildReviewDraft,
  localReviewDraftProvider,
  requestReviewDraft,
} from "./review-draft-provider.ts";
import {
  areValidReviewExperiences,
  isReusableGeneratedDraft,
  isUsableReviewSession,
  nextReviewGenerationNumber,
} from "./review-generation-guards.ts";
import { executeClaimedReviewGeneration } from "./review-generation-execution.ts";
import { validateGoogleReviewHandoff } from "./google-review-handoff.ts";
import { isValidMonthDay, validDaysForMonth, validateTrustitReviewInput } from "./trustit-review-validation.ts";

const generationClaimMigration = readFileSync(
  new URL("../supabase/migrations/20261001090000_atomic_review_generation_claim.sql", import.meta.url),
  "utf8",
);
const reviewBusinessMigration = readFileSync(
  new URL("../supabase/migrations/20261001091500_trustit_review_business_rpc.sql", import.meta.url),
  "utf8",
);
const reviewSessionSource = readFileSync(
  new URL("../app/r/[id]/review-session.ts", import.meta.url),
  "utf8",
);
const trustitSubmitMigration = readFileSync(
  new URL("../supabase/migrations/20261001100000_submit_trustit_review.sql", import.meta.url),
  "utf8",
);

const now = Date.parse("2026-09-30T12:00:00.000Z");
const validSession = {
  id: "00000000-0000-4000-8000-000000000001",
  business_id: "business-1",
  selected_rating: 4,
  expires_at: "2026-09-30T12:30:00.000Z",
};
const validExperience = {
  review_session_id: validSession.id,
  business_id: validSession.business_id,
  category_key: "food_quality",
  category_label_snapshot: "Food Quality",
};

test("draft reflects the customer's rating and selected experiences", async () => {
  const draft = await localReviewDraftProvider.generate({
    businessName: "North Street Cafe",
    rating: 5,
    experienceLabels: ["Food Quality", "Staff Behavior", "Ambience"],
  });

  assert.match(draft, /North Street Cafe/);
  assert.match(draft, /excellent/);
  assert.match(draft, /Food Quality, Staff Behavior, and Ambience/);
});

test("regeneration supplies a distinct draft variation while preserving first draft wording", () => {
  const input = { businessName: "North Street Cafe", rating: 4, experienceLabels: ["Food Quality"] };
  assert.notEqual(buildReviewDraft(input), buildReviewDraft({ ...input, variation: 2 }));
});

test("generation retries reuse the next server-owned slot and reject invalid counters", () => {
  assert.equal(nextReviewGenerationNumber(0), 1);
  assert.equal(nextReviewGenerationNumber(3), 4);
  assert.equal(nextReviewGenerationNumber(-1), null);
  assert.equal(nextReviewGenerationNumber(Number.MAX_SAFE_INTEGER), null);
});

test("occasion day lists honor month lengths and permit February 29", () => {
  assert.equal(validDaysForMonth(1).length, 29);
  assert.equal(validDaysForMonth(3).length, 30);
  assert.equal(validDaysForMonth(0).length, 31);
  assert.equal(isValidMonthDay(1, 29), true);
  assert.equal(isValidMonthDay(1, 30), false);
  assert.equal(isValidMonthDay(3, 31), false);
});

test("Trustit submission permits no personal details but validates shared profile and family fields", () => {
  const base = { customerName: "A Customer", customerMobile: "", shareDetails: false, familyMembers: [], occasions: [] };
  assert.deepEqual(validateTrustitReviewInput(base), []);
  assert.ok(validateTrustitReviewInput({ ...base, customerName: " " }).length > 0);
  assert.ok(validateTrustitReviewInput({ ...base, shareDetails: true }).length > 0);
  const withDetails = {
    ...base,
    shareDetails: true,
    customerMobile: "9876543210",
    familyMembers: [{ name: "Parent", relation: "mother", mobile: "" }],
    occasions: [
      { owner: "customer", occasion: "birthday", month: 2, day: 29 },
      { owner: "family", familyIndex: 0, occasion: "anniversary", month: 4, day: 30 },
    ],
  };
  assert.deepEqual(validateTrustitReviewInput(withDetails), []);
  assert.ok(validateTrustitReviewInput({ ...withDetails, occasions: [{ ...withDetails.occasions[0], day: 30 }] }).length > 0);
  assert.ok(validateTrustitReviewInput({ ...withDetails, familyMembers: [{ name: "", relation: "uncle", mobile: "" }] }).length > 0);
});

test("submission RPC migration stays server-only and does not grant browser table writes", () => {
  assert.match(trustitSubmitMigration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(trustitSubmitMigration, /revoke all on function public\.submit_trustit_review[\s\S]*from public, anon, authenticated, service_role/i);
  assert.match(trustitSubmitMigration, /grant execute on function public\.submit_trustit_review[\s\S]*to service_role/i);
  assert.doesNotMatch(trustitSubmitMigration, /grant\s+(?:all|select|insert|update|delete)[\s\S]{0,100}on table/i);
  assert.match(trustitSubmitMigration, /for update/i);
  assert.match(reviewSessionSource, /admin\.rpc\("submit_trustit_review"/);
});

test("draft generation rejects invalid or incomplete input", () => {
  assert.throws(() =>
    buildReviewDraft({ businessName: "Cafe", rating: 6, experienceLabels: ["Food"] }),
  );
  assert.throws(() =>
    buildReviewDraft({ businessName: "Cafe", rating: 4, experienceLabels: [] }),
  );
});

test("provider failures are returned for persistence as failed generations", async () => {
  const result = await requestReviewDraft(
    { async generate() { throw new Error("provider unavailable"); } },
    { businessName: "Cafe", rating: 4, experienceLabels: ["Service"] },
  );
  assert.deepEqual(result, { ok: false });
});

test("generation guard accepts only the correct live business session and rating", () => {
  assert.equal(isUsableReviewSession(validSession, "business-1", validSession.id, now), true);
  assert.equal(isUsableReviewSession({ ...validSession, expires_at: "2026-09-30T11:59:00Z" }, "business-1", validSession.id, now), false);
  assert.equal(isUsableReviewSession({ ...validSession, business_id: "business-2" }, "business-1", validSession.id, now), false);
  assert.equal(isUsableReviewSession({ ...validSession, id: "other-session" }, "business-1", validSession.id, now), false);
  assert.equal(isUsableReviewSession({ ...validSession, selected_rating: 6 }, "business-1", validSession.id, now), false);
});

test("generation guard requires saved experiences from the bound session and enabled taxonomy", () => {
  assert.equal(areValidReviewExperiences([validExperience], "business-1", validSession.id, ["food_quality"]), true);
  assert.equal(areValidReviewExperiences([{ ...validExperience, business_id: "business-2" }], "business-1", validSession.id, ["food_quality"]), false);
  assert.equal(areValidReviewExperiences([validExperience], "business-1", validSession.id, []), false);
  assert.equal(areValidReviewExperiences([], "business-1", validSession.id, ["food_quality"]), false);
});

test("a repeated request can reuse the persisted generation instead of creating another", () => {
  assert.equal(isReusableGeneratedDraft({ generation_status: "generated", generated_text: "Saved draft" }), true);
  assert.equal(isReusableGeneratedDraft({ generation_status: "failed", generated_text: null }), false);
});

test("only the atomic claim winner invokes the provider for a generation slot", async () => {
  let status = "empty";
  let claimToken = null;
  let providerCalls = 0;
  let releaseGeneration;
  const pendingGeneration = new Promise((resolve) => {
    releaseGeneration = resolve;
  });

  async function claimSlot() {
    if (status === "empty" || status === "failed") {
      status = "requested";
      claimToken = `claim-${providerCalls + 1}`;
      return {
        claimed: true,
        generation_status: "requested",
        generated_text: null,
        claim_token: claimToken,
      };
    }
    return {
      claimed: false,
      generation_status: status,
      generated_text: status === "generated" ? "Saved draft" : null,
      claim_token: null,
    };
  }

  async function finish(token, text) {
    if (status !== "requested" || token !== claimToken) return null;
    status = text ? "generated" : "failed";
    return status;
  }

  const [firstClaim, duplicateClaim] = await Promise.all([
    claimSlot(),
    claimSlot(),
  ]);
  const first = executeClaimedReviewGeneration(
    firstClaim,
    async () => {
      providerCalls += 1;
      return pendingGeneration;
    },
    finish,
  );
  const duplicate = await executeClaimedReviewGeneration(
    duplicateClaim,
    async () => {
      providerCalls += 1;
      return "duplicate draft";
    },
    finish,
  );

  assert.deepEqual(duplicate, { ok: false, reason: "pending" });
  assert.equal(providerCalls, 1);
  releaseGeneration("Saved draft");
  assert.deepEqual(await first, { ok: true, draft: "Saved draft" });
  assert.equal(status, "generated");
});

test("claim token fences off a stale generation attempt", async () => {
  let status = "requested";
  let activeToken = "first-attempt";
  async function finish(token, text) {
    if (status !== "requested" || token !== activeToken) return null;
    status = text ? "generated" : "failed";
    return status;
  }

  assert.equal(await finish("first-attempt", null), "failed");
  status = "requested";
  activeToken = "retry-attempt";
  assert.equal(await finish("first-attempt", "stale draft"), null);
  assert.equal(status, "requested");
  assert.equal(await finish("retry-attempt", "current draft"), "generated");
});

test("failed generation is finalized and a later retry can claim the slot", async () => {
  let status = "failed";
  let token = null;
  async function claim() {
    if (status === "failed") {
      status = "requested";
      token = "retry-token";
      return {
        claimed: true,
        generation_status: "requested",
        generated_text: null,
        claim_token: token,
      };
    }
    return {
      claimed: false,
      generation_status: status,
      generated_text: null,
      claim_token: null,
    };
  }
  async function finish(claimToken, text) {
    if (claimToken !== token || status !== "requested") return null;
    status = text ? "generated" : "failed";
    return status;
  }

  const retry = await executeClaimedReviewGeneration(
    await claim(),
    async () => "retry draft",
    finish,
  );

  assert.deepEqual(retry, { ok: true, draft: "retry draft" });
  assert.equal(status, "generated");
});

test("database claim serializes on the session and finalization is token-fenced", () => {
  assert.match(generationClaimMigration, /from public\.review_sessions[\s\S]*?for update;/i);
  assert.match(generationClaimMigration, /generation_claim_token = p_claim_token/i);
  assert.match(generationClaimMigration, /revoke all on function public\.claim_review_generation[\s\S]*?from public, anon, authenticated, service_role/i);
  assert.match(generationClaimMigration, /grant execute on function public\.claim_review_generation[\s\S]*?to service_role/i);
  assert.match(generationClaimMigration, /revoke all on function public\.finish_review_generation[\s\S]*?from public, anon, authenticated, service_role/i);
});

test("review business RPC returns a minimal active business row to service_role only", () => {
  assert.match(reviewBusinessMigration, /returns table\s*\(\s*id text,\s*name text,\s*type text,\s*status text,\s*merchant_status text,\s*qr_status text,\s*expiry date,\s*review_link text\s*\)/i);
  assert.match(reviewBusinessMigration, /business\.status = 'active'/i);
  assert.match(reviewBusinessMigration, /business\.merchant_status = 'active'/i);
  assert.match(reviewBusinessMigration, /business\.qr_status = 'active'/i);
  assert.match(reviewBusinessMigration, /business\.expiry is null or business\.expiry >= current_date/i);
  assert.match(reviewBusinessMigration, /revoke all on function public\.get_trustit_review_business\(text\)\s+from public, anon, authenticated, service_role/i);
  assert.match(reviewBusinessMigration, /grant execute on function public\.get_trustit_review_business\(text\) to service_role/i);
  assert.match(reviewSessionSource, /rpc\("get_trustit_review_business"/i);
  assert.doesNotMatch(reviewSessionSource, /\.from\("businesses"\)/i);
});

const handoffBusiness = {
  id: "business-1",
  status: "active",
  merchant_status: "active",
  qr_status: "active",
  expiry: "2026-10-01",
  review_link: "https://g.page/r/example/review",
};
const handoffSession = {
  ...validSession,
  review_status: "draft_ready",
  current_generation_number: 1,
};
const handoffGeneration = {
  generation_status: "generated",
  generated_text: "Original generated Trustit draft",
};

function validateHandoff(overrides = {}) {
  return validateGoogleReviewHandoff({
    business: handoffBusiness,
    session: handoffSession,
    generation: handoffGeneration,
    businessId: "business-1",
    sessionId: validSession.id,
    editedText: "Customer-edited review text",
    now,
    ...overrides,
  });
}

test("valid Google handoff keeps the customer edit and uses the stored review link", () => {
  assert.deepEqual(validateHandoff(), {
    ok: true,
    reviewUrl: "https://g.page/r/example/review",
    reviewText: "Customer-edited review text",
  });
});

test("handoff rejects unsafe and non-Google review links", () => {
  for (const review_link of [
    "javascript:alert(1)",
    "http://google.com/review",
    "https://user:pass@google.com/review",
    "https://attacker.example/review",
  ]) {
    assert.deepEqual(
      validateHandoff({ business: { ...handoffBusiness, review_link } }),
      { ok: false },
    );
  }
});

test("handoff rejects expired sessions, expired QR businesses, and suspended merchants", () => {
  assert.deepEqual(
    validateHandoff({
      session: { ...handoffSession, expires_at: "2026-09-30T11:59:00.000Z" },
    }),
    { ok: false },
  );
  assert.deepEqual(
    validateHandoff({ business: { ...handoffBusiness, expiry: "2026-09-29" } }),
    { ok: false },
  );
  assert.deepEqual(
    validateHandoff({ business: { ...handoffBusiness, merchant_status: "suspended" } }),
    { ok: false },
  );
  assert.deepEqual(
    validateHandoff({ business: { ...handoffBusiness, status: "cancelled" } }),
    { ok: false },
  );
});

test("handoff rejects mismatched business/session and a client-substituted review URL", () => {
  assert.deepEqual(validateHandoff({ businessId: "business-2" }), { ok: false });
  assert.deepEqual(
    validateHandoff({ session: { ...handoffSession, business_id: "business-2" } }),
    { ok: false },
  );
  const withUntrustedUrl = validateHandoff({ clientReviewUrl: "https://attacker.example" });
  assert.equal(withUntrustedUrl.ok, true);
  if (withUntrustedUrl.ok) {
    assert.equal(withUntrustedUrl.reviewUrl, handoffBusiness.review_link);
  }
});

test("revisiting handoff remains idempotent and reuses the stored URL", () => {
  const first = validateHandoff();
  const revisit = validateHandoff({ editedText: "Updated customer edit" });
  assert.equal(first.ok, true);
  assert.equal(revisit.ok, true);
  if (first.ok && revisit.ok) {
    assert.equal(revisit.reviewUrl, first.reviewUrl);
    assert.equal(revisit.reviewText, "Updated customer edit");
  }
});
