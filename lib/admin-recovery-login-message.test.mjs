import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { adminRecoveryLoginMessage } from "./admin-recovery-login-message.ts";

test("recovery redirects show safe fixed messages for known states only", () => {
  assert.match(adminRecoveryLoginMessage("invalid"), /invalid or expired/);
  assert.match(adminRecoveryLoginMessage("unavailable"), /unavailable on this deployment/);
  assert.equal(adminRecoveryLoginMessage("anything else"), null);
  assert.equal(adminRecoveryLoginMessage(null), null);
});

test("login form displays the fixed recovery message for invalid and unavailable callbacks", async () => {
  const form = await readFile(new URL("../app/login/login-form.tsx", import.meta.url), "utf8");
  assert.match(form, /params\.get\("recovery"\)/);
  assert.match(form, /adminRecoveryLoginMessage\(recovery\)/);
});
