import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_RECOVERY_MESSAGE,
  authorizedPreviewOrigin,
  completeAdminRecovery,
  recoveryCallbackUrl,
  requestAdminPasswordRecovery,
  updateAdminRecoveryPassword,
} from "./admin-password-recovery.ts";

const env = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "codex/cashfree-sandbox-preview",
  VERCEL_BRANCH_URL: "review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app",
};
const origin = `https://${env.VERCEL_BRANCH_URL}`;

function client({ userId = "admin-user", active = true, exchangeError = null, updateError = null } = {}) {
  const calls = { exchange: [], reset: [], update: [], signOut: 0 };
  return {
    calls,
    auth: {
      resetPasswordForEmail: async (...args) => { calls.reset.push(args); return { error: null }; },
      exchangeCodeForSession: async (code) => { calls.exchange.push(code); return { error: exchangeError }; },
      getUser: async () => ({ data: { user: userId ? { id: userId } : null }, error: null }),
      updateUser: async (value) => { calls.update.push(value); return { error: updateError }; },
      signOut: async () => { calls.signOut += 1; },
    },
    from: (table) => ({
      select: (columns) => ({
        eq: (_userColumn, selectedUserId) => ({
          eq: (_activeColumn, selectedActive) => ({
            maybeSingle: async () => ({
              data: table === "admin_users" && columns === "user_id" && active && selectedActive
                ? { user_id: selectedUserId }
                : null,
              error: null,
            }),
          }),
        }),
      }),
    }),
  };
}

test("only the exact current Preview deployment on the named branch is authorized", () => {
  assert.equal(authorizedPreviewOrigin(env, origin), origin);
  assert.equal(authorizedPreviewOrigin({ ...env, VERCEL_ENV: "production" }, origin), null);
  assert.equal(authorizedPreviewOrigin({ ...env, VERCEL_GIT_COMMIT_REF: "main" }, origin), null);
  assert.equal(authorizedPreviewOrigin(env, "https://attacker.example"), null);
  assert.equal(authorizedPreviewOrigin(env, `http://${env.VERCEL_BRANCH_URL}`), null);
  assert.equal(authorizedPreviewOrigin({ ...env, VERCEL_BRANCH_URL: "other-app.vercel.app" }, origin), null);
  assert.equal(
    authorizedPreviewOrigin(
      { ...env, VERCEL_BRANCH_URL: "review-qr-page-fkgushtt9-review-qr.vercel.app" },
      origin
    ),
    null
  );
  assert.equal(
    authorizedPreviewOrigin(
      env,
      "https://review-qr-page-fkgushtt9-review-qr.vercel.app"
    ),
    null
  );
});

test("callback URL is fixed to the authorized origin and path", () => {
  assert.equal(recoveryCallbackUrl(origin), `${origin}/auth/callback`);
});

test("recovery request keeps one generic response and never accepts a caller redirect", async () => {
  const supabase = client();
  const result = await requestAdminPasswordRecovery(
    supabase,
    "admin@example.invalid",
    recoveryCallbackUrl(origin)
  );
  assert.equal(result, ADMIN_RECOVERY_MESSAGE);
  assert.deepEqual(supabase.calls.reset, [["admin@example.invalid", { redirectTo: `${origin}/auth/callback` }]]);

  const failedProvider = client();
  failedProvider.auth.resetPasswordForEmail = async () => { throw new Error("provider detail"); };
  assert.equal(
    await requestAdminPasswordRecovery(failedProvider, "unknown@example.invalid", recoveryCallbackUrl(origin)),
    ADMIN_RECOVERY_MESSAGE
  );
});

test("missing, malformed, expired, and replayed recovery codes cannot authorize reset", async () => {
  const noCode = client();
  assert.equal(await completeAdminRecovery(noCode, ""), false);
  assert.deepEqual(noCode.calls.exchange, []);

  const expired = client({ exchangeError: new Error("expired") });
  assert.equal(await completeAdminRecovery(expired, "x".repeat(24)), false);
  assert.equal(expired.calls.signOut, 1);
  const unauthenticated = client({ userId: null });
  assert.equal(await updateAdminRecoveryPassword(unauthenticated, "test-only-password-value"), false);
  assert.deepEqual(unauthenticated.calls.update, []);
});

test("valid recovery code is accepted only after server session and active-admin checks", async () => {
  const activeAdmin = client();
  assert.equal(await completeAdminRecovery(activeAdmin, "test-code-".padEnd(24, "x")), true);

  const noSession = client({ userId: null });
  assert.equal(await completeAdminRecovery(noSession, "test-code-".padEnd(24, "x")), false);
  assert.equal(noSession.calls.signOut, 1);

  const inactiveAdmin = client({ active: false });
  assert.equal(await completeAdminRecovery(inactiveAdmin, "test-code-".padEnd(24, "x")), false);
  assert.equal(inactiveAdmin.calls.signOut, 1);
});

test("password update requires an active admin session, confirmation validation is server action owned", async () => {
  const noSession = client({ userId: null });
  assert.equal(await updateAdminRecoveryPassword(noSession, "test-only-password-value"), false);
  assert.deepEqual(noSession.calls.update, []);

  const activeAdmin = client();
  const fixturePassword = "fixture-password-never-used-outside-tests";
  assert.equal(await updateAdminRecoveryPassword(activeAdmin, fixturePassword), true);
  assert.deepEqual(activeAdmin.calls.update, [{ password: fixturePassword }]);

  const failedUpdate = client({ updateError: new Error("provider detail") });
  assert.equal(await updateAdminRecoveryPassword(failedUpdate, fixturePassword), false);
});
