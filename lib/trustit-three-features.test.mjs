import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildReviewDraft, detectReviewWritingSignals, removeCustomerPii, validateReviewDraftQuality } from "./review-draft-provider.ts";
import { syntheticReviewExamples } from "./synthetic-review-evaluation.mjs";
import { templatesForBusiness, suggestMessage } from "./merchant-message-templates.ts";
import { isReviewIncentiveCopy } from "./merchant-message-safety.ts";

const migration = await readFile(new URL("../supabase/migrations/20261006110004_trustit_notifications_ai_context_messages.sql", import.meta.url), "utf8");
const notificationActions = await readFile(new URL("../app/merchant/dashboard/notifications/actions.ts", import.meta.url), "utf8");
const notificationPanel = await readFile(new URL("../app/merchant/dashboard/notifications/notification-panel.tsx", import.meta.url), "utf8");
const messageActions = await readFile(new URL("../app/merchant/dashboard/messages/actions.ts", import.meta.url), "utf8");
const reviewFlow = await readFile(new URL("../app/r/[id]/review-session.ts", import.meta.url), "utf8");

test("notification is created once only after a submitted review insert and remains business scoped", () => {
  assert.match(migration, /after insert on public\.trustit_reviews/);
  assert.match(migration, /when \(new\.status = 'submitted'\)/);
  assert.match(migration, /on conflict \(review_id\) do nothing/);
  assert.match(migration, /unique \(review_id, business_id\)/);
  assert.match(migration, /merchant_notifications_select_own[\s\S]*auth\.uid\(\)/);
  assert.match(migration, /revoke all on function public\.create_merchant_review_notification\(\) from public, anon, authenticated/);
  assert.doesNotMatch(migration, /grant\s+(?:insert|all)[\s\S]{0,80}merchant_notifications to authenticated/i);
  assert.match(notificationActions, /requireActiveMerchant\(\)/);
  assert.match(notificationActions, /\.eq\("business_id", merchant\.businessId\)/);
  assert.match(notificationActions, /\.update\(\{ is_read: true \}\)/);
  assert.match(notificationPanel, /\/merchant\/dashboard\/reviews#review-/);
  assert.doesNotMatch(notificationPanel, /bell icon|notification bell/i);
});

test("optional input influences natural draft, language signals and selected rating remains authoritative", () => {
  const input = "food mast tha bhai service bhi fast";
  const draft = buildReviewDraft({ businessName: "Cafe", businessType: "Restaurant", rating: 5, experienceLabels: ["Taste", "Service"], customerInput: input });
  assert.match(draft, /mast tha bhai/);
  assert.match(draft, /fast/);
  assert.doesNotMatch(draft, /exceptional dining experience/i);
  assert.deepEqual(detectReviewWritingSignals(input), { language: "Hinglish", style: "casual", script: "Latin", punctuation: "none", emojiTendency: false, fragmented: true });
  assert.equal(detectReviewWritingSignals("Great service!! 😊").emojiTendency, true);
  assert.equal(detectReviewWritingSignals("Great service!! 😊").punctuation, "expressive");
  assert.equal(detectReviewWritingSignals("good service little wait").language, "English");
  assert.equal(detectReviewWritingSignals("खाना अच्छा था").language, "Hindi");
  assert.equal(detectReviewWritingSignals("khana mast tha").language, "Roman Hindi");
  assert.match(buildReviewDraft({ businessName:"Shop", rating:1, experienceLabels:["Service"], customerInput:"service thodi slow thi" }), /slow thi/);
  assert.match(buildReviewDraft({ businessName:"Shop", rating:5, experienceLabels:["Service"], variation:1 }), /good experience|enjoyed|went well/i);
  assert.equal(removeCustomerPii("nice visit mail me at person@example.com or +91 98765 43210"), "nice visit mail me at or");
  assert.equal(validateReviewDraftQuality({rating:4,experienceLabels:["Service"],customerInput:"good service little wait"}, "Good service, little wait."), true);
  assert.equal(validateReviewDraftQuality({rating:4,experienceLabels:["Service"],customerInput:"good service"}, "Exceptional food and friendly staff."), false);
});

test("synthetic evaluation set has broad ratings, language, scripts, styles and business coverage with no PII", () => {
  assert.ok(syntheticReviewExamples.length >= 24);
  assert.deepEqual(new Set(syntheticReviewExamples.map((item) => item.rating)), new Set([1,2,3,4,5]));
  for (const field of ["businessType","customerInput","language","script","style","selectedExperiences","expectedNaturalDraft"]) assert.ok(syntheticReviewExamples.every((item) => field in item));
  assert.ok(syntheticReviewExamples.some((item) => item.script === "Devanagari"));
  assert.ok(syntheticReviewExamples.some((item) => /emoji|😋|😊|✨/.test(item.style + item.customerInput)));
  assert.ok(syntheticReviewExamples.some((item) => item.style === "formal"));
  assert.ok(syntheticReviewExamples.every((item) => !/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|\+?\d[\d(). -]{7,}\d/.test(item.customerInput)));
  for (const example of syntheticReviewExamples) {
    const draft = buildReviewDraft({businessName:"Synthetic Example",rating:example.rating,businessType:example.businessType,experienceLabels:example.selectedExperiences,customerInput:example.customerInput});
    assert.equal(validateReviewDraftQuality({rating:example.rating,experienceLabels:example.selectedExperiences,customerInput:example.customerInput}, draft), true);
  }
});

test("input-draft-final relationship is retained through the existing review session, generation and Trustit submission", () => {
  assert.match(migration, /add column customer_input text/);
  assert.match(reviewFlow, /customer_input: safeCustomerInput/);
  assert.match(reviewFlow, /p_review_text: submission\.reviewText/);
  assert.match(migration, /review_id uuid not null unique/);
});

test("message catalog uses relevant plus universal templates and offers all requested categories", () => {
  for (const type of ["Restaurant","Hotel","Salon","Sweet Shop","Retail","Medical","Other"]) {
    const list = templatesForBusiness(type);
    assert.ok(list.length > 0);
    assert.ok(list.every((item) => item.relevance === type || item.relevance === "Every business"));
  }
  assert.deepEqual(new Set(templatesForBusiness("Other").map((item)=>item.category)), new Set(["Festival","Offer","Announcement","New Product","Customer Appreciation","Seasonal"]));
  assert.match(suggestMessage("Diwali ke liye sweets", "Festive").message, /Diwali ke liye sweets/i);
  for (const category of ["Festival","Offer","Announcement","New Product","Customer Appreciation","Seasonal"]) assert.match(migration, new RegExp(category));
});

test("message save is authenticated and rejects review-rating incentives and invalid validity ranges", () => {
  assert.match(messageActions, /requireActiveMerchant\(\)/);
  assert.match(messageActions, /business_id: merchant\.businessId/);
  assert.match(messageActions, /isReviewIncentiveCopy/);
  assert.equal(isReviewIncentiveCopy("Give 5 stars and get 10% off"), true);
  assert.equal(isReviewIncentiveCopy("Leave a Google review to get a free item"), true);
  assert.equal(isReviewIncentiveCopy("Preview this seasonal offer"), false);
  assert.equal(isReviewIncentiveCopy("Enjoy our limited-time offer"), false);
  assert.match(messageActions, /endsAt <= startsAt/);
  assert.match(migration, /merchant_messages_insert_own[\s\S]*auth\.uid\(\)/);
  assert.match(migration, /merchant_messages_update_own[\s\S]*auth\.uid\(\)/);
  assert.match(migration, /check \(starts_at is null or ends_at is null or ends_at > starts_at\)/);
});

test("notification panel and message designer expose the requested interactions", async () => {
  const designer = await readFile(new URL("../app/merchant/dashboard/messages/message-designer.tsx", import.meta.url), "utf8");
  assert.match(notificationPanel, /unread &&/);
  assert.match(notificationPanel, /role="dialog"/);
  assert.match(notificationPanel, /Notifications/);
  assert.match(designer, /aria-pressed=\{templateId===item\.id\}/);
  assert.match(designer, /Preview/);
  assert.match(designer, /type="datetime-local"/);
  assert.match(designer, /Date\.parse\(endsAt\)<=Date\.parse\(startsAt\)/);
  assert.match(designer, /saveMerchantMessage/);
  assert.match(designer, /navigator\.share/);
  assert.match(designer, /Edit plan/);
});
