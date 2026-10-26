import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("raw Trustit data is readable only by active admins through authenticated RLS", async () => {
  const migration = await read("./20261004090000_secure_trustit_pii_and_seed_taxonomy.sql");
  const tables = [
    "review_sessions", "review_session_experiences", "review_generations",
    "trustit_reviews", "review_customer_profiles", "review_family_members",
    "review_special_occasions",
  ];
  for (const table of tables) {
    assert.match(migration, new RegExp(`drop policy if exists \\w+ on public\\.${table}`, "i"));
    assert.match(migration, new RegExp(`create policy \\w+_select_active_admin\\s+on public\\.${table} for select to authenticated`, "i"));
  }
  assert.match(migration, /revoke select on table[\s\S]*?from anon, authenticated/);
  assert.match(migration, /where admin\.user_id = \(select auth\.uid\(\)\) and admin\.is_active = true/);
  assert.doesNotMatch(migration, /to anon\s*;/i);
});

test("merchant review summary omits customer names while retaining authorized review content", async () => {
  const migration = await read("./20261004090000_secure_trustit_pii_and_seed_taxonomy.sql");
  const fn = migration.slice(migration.indexOf("create function public.get_merchant_trustit_reviews"));
  assert.match(fn, /merchant\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(fn, /business\.merchant_status = 'active'/);
  assert.match(fn, /review\.rating/);
  assert.match(fn, /review\.review_text/);
  assert.doesNotMatch(fn, /customer_name|customer_mobile|family_member|occasion/);
});

test("new taxonomy families are seeded idempotently", async () => {
  const migration = await read("./20261004090000_secure_trustit_pii_and_seed_taxonomy.sql");
  for (const group of ["Hotel", "Laundry", "Fitness", "Travel", "Professional Services", "Other"]) {
    assert.ok(migration.includes(`('${group}',`), `Missing taxonomy group ${group}`);
  }
  assert.match(migration, /on conflict \(business_type, category_key\) do update/i);
});
