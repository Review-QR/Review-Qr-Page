import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("registration is a single continuous four-step page with the bilingual headline rotation", async () => {
  const page = await read("./page.tsx");
  const flow = await read("./registration-flow.tsx");
  for (const step of ["Account", "Business", "Plan", "Payment"]) assert.ok(flow.includes(`"${step}"`));
  assert.match(page, /<RegistrationFlow/);
  assert.match(flow, /aria-label="Registration progress"/);
  assert.match(flow, /position|sticky/);
  assert.match(flow, /scrollIntoView\(\{ behavior: "smooth"/);
  for (const phrase of [
    "Know What Your Customers Think About Your Business",
    "आपके ग्राहक आपके Business के बारे में क्या सोचते हैं",
    "Know What Your Customers Love About Your Business",
    "Turn Customer Feedback Into Business Insights",
    "Discover What Your Customers Really Think",
  ]) assert.ok(flow.includes(phrase), `headline ${phrase}`);
});

test("registration category is selected from the centralized searchable business catalog", async () => {
  const account = await read("./register-account.tsx");
  const picker = await read("./business-type-picker.tsx");
  const catalog = await read("../../lib/config/business-types.ts");
  assert.match(account, /<BusinessTypePicker/);
  assert.match(picker, /searchBusinessTypes\(query\)/);
  assert.match(catalog, /export function searchBusinessTypes/);
  assert.match(account, /businessType/);
  assert.doesNotMatch(picker, /const\s+BUSINESS_TYPES\s*=/);
});

test("business step asks only address and optional Google Review link", async () => {
  const form = await read("./business-form.tsx");
  assert.match(form, /Business Address/);
  assert.match(form, /Google Review Link[\s\S]*optional/);
  assert.doesNotMatch(form, /Business Type|Business Name/);
  const actions = await read("./actions.ts");
  assert.match(actions, /rawReviewLink \? safeReviewLink\(rawReviewLink\) : null/);
});

test("premium plan examples are clearly identified as unsupported concepts", async () => {
  const plans = await read("./plan/plan-picker.tsx");
  assert.match(plans, /Make Every Customer Interaction More Personal/);
  for (const example of ["Festival wishes", "Birthday wishes", "Thank-you messages", "Special offers"]) assert.ok(plans.includes(example));
  assert.match(plans, /Trustit does not currently send or schedule these messages/);
  assert.match(plans, /Basic.*29|\{id:"basic",name:"Basic",price:29\}/s);
  assert.match(plans, /Standard.*49|\{id:"standard",name:"Standard",price:49\}/s);
  assert.match(plans, /Premium.*99|\{id:"premium",name:"Premium",price:99\}/s);
});

test("business onboarding migration preserves ownership guards and supports catalog types and no review URL", async () => {
  const migration = await read("../../supabase/migrations/20261002120000_allow_catalog_types_and_optional_review_link.sql");
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(migration, /status = 'in_progress'[\s\S]*current_step = 'business'[\s\S]*expires_at > pg_catalog\.now\(\)/);
  assert.match(migration, /select \* into v_profile from public\.merchant_profiles where user_id = p_user_id/);
  assert.match(migration, /length\(btrim\(p_type\)\) not between 1 and 120/);
  assert.match(migration, /p_review_link is not null/);
  assert.match(migration, /nullif\(btrim\(p_review_link\), ''\)/);
  assert.doesNotMatch(migration, /\b(drop|truncate|delete from)\b/i);
});

test("review page has five real stages, smooth transitions, optional personal fields, and configured Google handoff", async () => {
  const experience = await read("../r/[id]/review-experience.tsx");
  const action = await read("../r/[id]/review-session.ts");
  const route = await read("../r/[id]/page.tsx");
  for (const stage of ["Rating", "Experience", "Review", "Details", "Thank You"]) assert.ok(experience.includes(`"${stage}"`));
  assert.match(experience, /aria-label="Review progress"/);
  assert.match(experience, /scrollIntoView\(\{ behavior: "smooth"/);
  assert.match(experience, /Your Name[\s\S]*optional/);
  assert.match(experience, /Mobile Number[\s\S]*optional/);
  assert.match(experience, /Thank you for sharing your review!/);
  assert.match(experience, /googleReviewHandoff\(draft\)/);
  assert.match(action, /p_customer_name: customerName\.trim\(\) \|\| "Guest"/);
  assert.match(route, /handoffGoogleReviewForBusiness\(qrBusinessId, reviewSessionId, editedText\)/);
});

test("optional review mobile migration keeps the private submission function and existing grant scope", async () => {
  const migration = await read("../../supabase/migrations/20261002130000_allow_optional_review_mobile.sql");
  assert.match(migration, /create or replace function public\.submit_trustit_review/);
  assert.doesNotMatch(migration, /p_share_details and p_customer_mobile is null/);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(migration, /grant execute on function public\.submit_trustit_review[\s\S]*to service_role/);
  assert.doesNotMatch(migration, /grant\s+(?:all|select|insert|update|delete)[\s\S]{0,100}on table/i);
});

test("merchant list retains active-admin authorization before privileged production queries", async () => {
  const page = await read("../merchants/page.tsx");
  const grant = await read("../../supabase/migrations/20261002110000_grant_business_select_to_service_role.sql");
  assert.ok(page.indexOf("await requireActiveAdmin()") < page.indexOf("createSupabaseAdminClient()"));
  assert.match(page, /adminClient[\s\S]*from\("businesses"\)/);
  assert.match(grant, /grant select on table public\.businesses to service_role/i);
  assert.doesNotMatch(grant, /\b(drop|truncate|delete|insert|update)\b/i);
});
