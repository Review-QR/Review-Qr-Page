import test from "node:test";
import assert from "node:assert/strict";
import { adminRecoveryLoginMessage } from "./admin-recovery-login-message.ts";

test("recovery redirects show safe fixed messages for known states only", () => {
  assert.match(adminRecoveryLoginMessage("invalid"), /invalid or expired/);
  assert.match(adminRecoveryLoginMessage("unavailable"), /unavailable on this deployment/);
  assert.equal(adminRecoveryLoginMessage("anything else"), null);
  assert.equal(adminRecoveryLoginMessage(null), null);
});
