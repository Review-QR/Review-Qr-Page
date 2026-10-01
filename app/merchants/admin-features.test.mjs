import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Trustit customer data route requires an active admin before privileged reads", async () => {
  const route = await read("./[businessId]/trustit-customer-data/page.tsx");
  assert.match(route, /await requireActiveAdmin\(\)/);
  assert.match(route, /createSupabaseServerClient\(\)/);
  assert.doesNotMatch(route, /createSupabaseAdminClient/);
  assert.match(route, /\.eq\("business_id", businessId\)/);
  assert.match(route, /\.in\("customer_profile_id", profileIds\)/);
  assert.match(route, /\.in\("family_member_id", familyIds\)/);
  assert.doesNotMatch(route, /"use client"/);
});

test("Trustit admin data reads use the authenticated active-admin session and business-scoped queries", async () => {
  const route = await read("./[businessId]/trustit-customer-data/page.tsx");
  assert.match(route, /createSupabaseServerClient/);
  assert.ok(route.indexOf("await requireActiveAdmin()") < route.indexOf("createSupabaseServerClient()"));
  assert.match(route, /\.from\("businesses"\)[\s\S]*?\.eq\("id", businessId\)/);
  for (const table of ["trustit_reviews", "review_sessions", "review_session_experiences", "review_customer_profiles", "review_family_members", "review_special_occasions"]) {
    assert.match(route, new RegExp(`from\\("${table}"\\)[\\s\\S]*?eq\\("business_id", businessId\\)`));
  }
  assert.doesNotMatch(route, /createSupabaseAdminClient/);
});

test("admin Trustit customer data is presented as one horizontally scrollable spreadsheet row per submission", async () => {
  const route = await read("./[businessId]/trustit-customer-data/page.tsx");
  for (const column of ["Customer", "Mobile Number", "Rating", "Review", "Selected Experience Points", "Date of Birth", "Anniversary", "Family Members", "Family Member Mobile", "Family Member DOB", "Family Member Anniversary", "Submitted"]) {
    assert.match(route, new RegExp(`<th[^>]*>${column}</th>`));
  }
  assert.match(route, /overflow-auto/);
  assert.match(route, /reviews\.map\(\(review\) =>/);
  assert.match(route, /font-bold text-slate-900">\{experiences\.length \?/);
  assert.doesNotMatch(route, /What stood out in your experience\?/i);
});

test("merchant profile exposes the Trustit Customer Data route", async () => {
  const ui = await read("./merchant-management.tsx");
  assert.match(ui, /Trustit Customer Data/);
  assert.match(ui, /trustit-customer-data/);
});

test("merchant Trustit reviews use the scoped summary RPC rather than direct PII table access", async () => {
  const page = await read("../merchant/dashboard/reviews/page.tsx");
  assert.match(page, /await requireActiveMerchant\(\)/);
  assert.match(page, /rpc\("get_merchant_trustit_reviews", \{ p_business_id: merchant\.businessId \}\)/);
  assert.doesNotMatch(page, /\.from\("trustit_reviews"\)/);
  assert.doesNotMatch(page, /customer_mobile|family_members|occasion/i);
  assert.match(page, /Customer: \{review\.customer_name/);
  assert.match(page, /Review:<\/span> \{review\.review_text\}/);
  assert.match(page, /selected_experiences\.map\(\(point\) => `• \$\{point\}`\)\.join\(" "\)/);
  assert.match(page, /<strong className="ml-2 text-slate-900">/);
  assert.doesNotMatch(page, /What stood out|Selected experiences:|\[.*selected_experiences/i);
});

test("delete action validates identity and active admin server-side", async () => {
  const action = await read("./actions.ts");
  assert.ok(action.indexOf("BUSINESS_ID_PATTERN.test(businessIdInput)") < action.indexOf("createSupabaseActionClient()"));
  assert.match(action, /auth\.getClaims\(\)/);
  assert.match(action, /\.eq\("is_active", true\)/);
  assert.match(action, /BUSINESS_ID_PATTERN\.test\(businessIdInput\)/);
  assert.match(action, /admin_delete_merchant/);
  assert.ok(action.indexOf("if (adminError || !admin)") < action.indexOf("adminClient.rpc("));
});

test("delete UI requires explicit confirmation and prevents duplicate submission", async () => {
  const ui = await read("./merchant-management.tsx");
  assert.match(ui, /role="alertdialog"/);
  assert.match(ui, />Cancel<\/button>/);
  assert.match(ui, />\{pending \? "Deleting…" : "Delete Permanently"\}<\/button>/);
  assert.match(ui, /if \(submitting\.current\) return/);
  assert.match(ui, /disabled=\{pending/);
  assert.ok(ui.indexOf("submitting.current = true") < ui.indexOf("deleteMerchantAction(business.id)"));
  assert.match(ui, /setMessageIsError\(!result\.success\)/);
  assert.match(ui, /role=\{messageIsError \? "alert" : "status"\}/);
});

test("successful merchant deletion refreshes the list without waiting for a manual reload", async () => {
  const action = await read("./actions.ts");
  const ui = await read("./merchant-management.tsx");
  assert.match(action, /revalidatePath\("\/merchants"\)/);
  assert.match(ui, /setRows\(\(current\) => current\.filter\(\(business\) => business\.id !== deleteTarget\.id\)\)/);
  assert.match(ui, /router\.refresh\(\)/);
  assert.match(ui, /if \(result\.businessDeleted\) setDeleteTarget\(null\)/);
});

test("failed deletion stays visible and presents an actionable error", async () => {
  const action = await read("./actions.ts");
  const ui = await read("./merchant-management.tsx");
  assert.match(action, /if \(deletionError\)\s*\{[\s\S]*?success: false/);
  assert.match(ui, /The deletion request could not be completed/);
  assert.match(ui, /if \(result\.businessDeleted\) onDeleted\(result\)/);
});

test("database deletion is active-admin checked, scoped, and service-role only", async () => {
  const sql = await read("../../supabase/migrations/20261001130000_admin_delete_merchant.sql");
  assert.match(sql, /admin\.is_active = true/);
  assert.match(sql, /delete from public\.payment_records where business_id = p_business_id/);
  assert.match(sql, /delete from public\.onboarding_sessions where business_id = p_business_id/);
  assert.match(sql, /delete from public\.subscriptions where business_id = p_business_id/);
  assert.match(sql, /delete from public\.businesses where id = p_business_id/);
  assert.match(sql, /grant execute on function public\.admin_delete_merchant\(text, uuid\) to service_role/);
  assert.doesNotMatch(sql, /delete from public\.(admin_users|plan_features|review_experience_categories|review_special_occasion_types)\b/i);
});

test("business cascades clean Trustit descendants while shared reference data remains untouched", async () => {
  const schema = await read("../../supabase/migrations/20260930100000_trustit_review_data_architecture.sql");
  for (const table of ["review_sessions", "trustit_reviews", "review_customer_profiles", "review_family_members", "review_special_occasions", "review_session_experiences", "review_generations"]) {
    assert.match(schema, new RegExp(`create table public\\.${table}\\b`));
  }
  assert.match(schema, /references public\.businesses \(id\) on delete cascade/i);
  assert.match(schema, /references public\.review_sessions \(id, business_id\) on delete cascade/i);
  assert.match(schema, /references public\.review_special_occasion_types \(occasion_key\) on delete restrict/i);
});

test("all direct deletes are scoped to the selected business or its unique merchant user", async () => {
  const sql = await read("../../supabase/migrations/20261001130000_admin_delete_merchant.sql");
  const directDeletes = sql.match(/delete from public\.[a-z_]+[^;]*;/gi) ?? [];
  assert.equal(directDeletes.length, 5);
  assert.ok(directDeletes.every((statement) => /where (business_id = p_business_id|id = p_business_id|user_id = v_merchant_user_id)/i.test(statement)));
  assert.match(sql, /where business\.id = p_business_id\s+for update/);
  assert.match(sql, /where merchant\.business_id = p_business_id\s+for update/);
});

test("Auth cleanup requires an exclusive mapping and no other business or onboarding records", async () => {
  const sql = await read("../../supabase/migrations/20261001130000_admin_delete_merchant.sql");
  const mapping = await read("../../supabase/migrations/20260925142648_add_merchant_accounts_and_rls.sql");
  assert.match(mapping, /user_id uuid not null unique references auth\.users/);
  assert.match(sql, /merchant\.user_id = v_merchant_user_id and merchant\.business_id <> p_business_id/);
  assert.match(sql, /session\.user_id = v_merchant_user_id\s+and session\.business_id is distinct from p_business_id/);
  assert.match(sql, /subscription\.user_id = v_merchant_user_id\s+and subscription\.business_id <> p_business_id/);
});

test("admin identities are rejected before any merchant-owned row is deleted", async () => {
  const sql = await read("../../supabase/migrations/20261001130000_admin_delete_merchant.sql");
  assert.match(sql, /where admin\.user_id = p_actor_user_id and admin\.is_active = true/);
  assert.match(sql, /where admin\.user_id = v_merchant_user_id\s*\) then\s+raise exception 'An administrator identity cannot be deleted/);
  assert.ok(sql.indexOf("An administrator identity cannot be deleted") < sql.indexOf("delete from public.payment_records"));
});

test("pending Auth cleanup blocks new account and onboarding writes, and supports retry", async () => {
  const sql = await read("../../supabase/migrations/20261001130000_admin_delete_merchant.sql");
  assert.match(sql, /admin_merchant_deletion_locks/);
  for (const table of ["merchant_accounts", "admin_users", "merchant_profiles", "onboarding_sessions", "subscriptions"]) {
    assert.match(sql, new RegExp(`create trigger ${table}_pending_identity_guard[\\s\\S]*?on public\\.${table}`));
  }
  assert.match(sql, /where pending\.business_id = p_business_id\s+for update;\s+if found then return v_merchant_user_id/);
});

test("database errors stop before Auth API deletion and the SQL function fails transactionally", async () => {
  const action = await read("./actions.ts");
  const sql = await read("../../supabase/migrations/20261001130000_admin_delete_merchant.sql");
  assert.ok(action.indexOf("if (deletionError)") < action.indexOf("auth.admin.deleteUser"));
  assert.match(sql, /raise exception 'Merchant does not exist'/);
  assert.match(sql, /raise exception 'Merchant deletion did not complete'/);
  assert.match(action, /The database did not confirm merchant deletion/);
});

test("Auth API failure is reported as partial completion with a retry path", async () => {
  const action = await read("./actions.ts");
  const ui = await read("./merchant-management.tsx");
  assert.match(action, /businessDeleted: true,\s+identityCleanupPending: true/);
  assert.match(action, /sign-in identity could not be removed|sign-in identity remains/);
  assert.match(action, /return \{ success: true, businessDeleted: true, message: "Merchant deleted successfully\." \}/);
  assert.match(ui, /if \(result\.businessDeleted\) setDeleteTarget\(null\)/);
  assert.match(ui, /Retry identity cleanup/);
});

test("migration has no DROP, RLS-policy, or broad business data statements", async () => {
  const sql = await read("../../supabase/migrations/20261001130000_admin_delete_merchant.sql");
  assert.doesNotMatch(sql, /\bdrop\s+(table|policy|function|trigger)\b/i);
  assert.doesNotMatch(sql, /create policy|drop policy|alter policy/i);
  assert.match(sql, /revoke all on function public\.admin_delete_merchant/);
  assert.match(sql, /grant execute on function public\.admin_delete_merchant\(text, uuid\) to service_role/);
});
