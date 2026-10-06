import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("invite tokens are cryptographically random and only their SHA-256 hashes are stored", async () => {
  const utils = await read("./invite-utils.ts");
  const migration = await read("../../../supabase/migrations/20261001175208_merchant_invites.sql");
  assert.match(utils, /randomBytes\(32\)/);
  assert.match(utils, /createHash\("sha256"\)/);
  assert.match(utils, /isValidMerchantInviteToken/);
  assert.match(migration, /token_hash text not null unique/);
  assert.doesNotMatch(migration, /token text not null/i);
});

test("invite data remains private behind active-admin and capability-token RPC checks", async () => {
  const inviteMigration = await read("../../../supabase/migrations/20261001175208_merchant_invites.sql");
  const readersMigration = await read("../../../supabase/migrations/20261002004552_merchant_invite_rpc_readers.sql");
  const migration = `${inviteMigration}\n${readersMigration}`;
  const actions = await read("./actions.ts");
  assert.match(migration, /alter table public\.merchant_invites enable row level security/);
  assert.match(migration, /revoke all on table public\.merchant_invites\s+from public, anon, authenticated, service_role/);
  assert.match(migration, /function public\.admin_list_merchant_invites\(\s*p_actor_user_id uuid\s*\)[\s\S]*?admin_users[\s\S]*?is_active = true/);
  assert.match(migration, /function public\.get_merchant_invite_registration\(\s*p_token_hash text\s*\)/);
  assert.match(migration, /grant execute on function public\.admin_list_merchant_invites\(uuid\)\s+to service_role/);
  assert.match(migration, /grant execute on function public\.get_merchant_invite_registration\(text\)\s+to service_role/);
  assert.doesNotMatch(actions, /\.from\("merchant_invites"\)/);
});

test("admin create and revoke actions recheck an active admin and use the protected RPCs", async () => {
  const actions = await read("./actions.ts");
  assert.match(actions, /async function getActiveAdmin\(\)/);
  assert.match(actions, /\.eq\("is_active", true\)/);
  assert.match(actions, /admin_create_merchant_invite/);
  assert.match(actions, /admin_revoke_merchant_invite/);
  assert.match(actions, /admin_list_merchant_invites/);
  assert.match(actions, /p_actor_user_id: actorUserId/);
  assert.match(actions, /tokenHash/);
});

test("invite registration checks token, expiry, pending status and existing mapping before creating the bound merchant", async () => {
  const page = await read("../../merchant/register/[token]/page.tsx");
  const action = await read("../../merchant/register/[token]/actions.ts");
  const migration = await read("../../../supabase/migrations/20261001175208_merchant_invites.sql");
  assert.match(page, /isValidMerchantInviteToken\(token\)/);
  assert.match(page, /get_merchant_invite_registration/);
  assert.match(action, /invite\.status !== "pending"/);
  assert.match(action, /get_merchant_invite_registration/);
  assert.match(action, /invite\.merchant_status !== "pending"/);
  assert.match(action, /invite\.has_account/);
  assert.match(action, /merchantAuthEmail\(businessId\)/);
  assert.match(action, /deleteUser\(created\.user\.id\)/);
  assert.match(action, /complete_merchant_invite/);
  assert.match(migration, /merchant_status = 'pending'/);
  assert.match(migration, /insert into public\.merchant_accounts \(business_id, user_id\)/);
  assert.match(migration, /set status = 'used'[\s\S]*?used_at = pg_catalog\.now\(\)/);
  assert.doesNotMatch(action, /\.from\("merchant_invites"\)|\.from\("businesses"\)/);
});
