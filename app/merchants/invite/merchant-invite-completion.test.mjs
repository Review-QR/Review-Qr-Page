import assert from "node:assert/strict";
import test from "node:test";
import { reconcileMerchantInviteCompletion } from "../../../lib/merchant-invite-completion.mjs";

const userId = "user-preview-1";
const mapping = (id = userId) => ({ data: { user_id: id }, error: null });
const cleanupNotCalled = async () => {
  assert.fail("Auth user must be preserved");
};

test("RPC success is accepted only when the expected user mapping is verified", async () => {
  const result = await reconcileMerchantInviteCompletion({
    complete: async () => ({ data: "business-1", error: null, status: 200, expectedUserId: userId }),
    readMapping: async () => mapping(),
    cleanup: cleanupNotCalled,
  });
  assert.deepEqual(result, { status: "success" });
});

test("RPC error after a simulated committed mapping is reconciled as success", async () => {
  let committedMapping = null;
  let cleanupCalls = 0;
  const result = await reconcileMerchantInviteCompletion({
    complete: async () => {
      committedMapping = { user_id: userId };
      return { data: null, error: { code: "57014" }, status: 500, expectedUserId: userId };
    },
    readMapping: async () => ({ data: committedMapping, error: null }),
    cleanup: async () => { cleanupCalls += 1; return { error: null }; },
  });
  assert.deepEqual(result, { status: "success" });
  assert.equal(cleanupCalls, 0);
});

test("denied or unavailable mapping verification preserves the Auth user", async () => {
  let cleanupCalls = 0;
  const result = await reconcileMerchantInviteCompletion({
    complete: async () => ({ data: null, error: { code: "PGRST000" }, status: 503, expectedUserId: userId }),
    readMapping: async () => ({ data: null, error: { code: "42501" } }),
    cleanup: async () => { cleanupCalls += 1; return { error: null }; },
  });
  assert.deepEqual(result, { status: "unconfirmed" });
  assert.equal(cleanupCalls, 0);

  const thrownRead = await reconcileMerchantInviteCompletion({
    complete: async () => { throw new Error("network unavailable"); },
    readMapping: async () => { throw new Error("network unavailable"); },
    cleanup: async () => { cleanupCalls += 1; return { error: null }; },
  });
  assert.deepEqual(thrownRead, { status: "unconfirmed" });
  assert.equal(cleanupCalls, 0);
});

test("definitive pre-commit database failure plus verified absence allows cleanup", async () => {
  let cleanupCalls = 0;
  const result = await reconcileMerchantInviteCompletion({
    complete: async () => ({ data: null, error: { code: "P0001" }, status: 400, expectedUserId: userId }),
    readMapping: async () => ({ data: null, error: null }),
    cleanup: async () => { cleanupCalls += 1; return { error: null }; },
  });
  assert.deepEqual(result, { status: "failed_safely" });
  assert.equal(cleanupCalls, 1);
});

test("malformed no-row verification results never trigger cleanup", async () => {
  const malformedResponses = [
    undefined,
    null,
    {},
    { data: null },
    { error: null },
    { data: undefined, error: null },
    { data: false, error: null },
    { data: null, error: undefined },
  ];

  for (const response of malformedResponses) {
    let cleanupCalls = 0;
    const result = await reconcileMerchantInviteCompletion({
      complete: async () => ({ data: null, error: { code: "P0001" }, status: 400, expectedUserId: userId }),
      readMapping: async () => response,
      cleanup: async () => { cleanupCalls += 1; return { error: null }; },
    });
    assert.deepEqual(result, { status: "unconfirmed" });
    assert.equal(cleanupCalls, 0);
  }
});

test("transport failures and unexpected RPC results never trigger cleanup", async () => {
  let cleanupCalls = 0;
  const result = await reconcileMerchantInviteCompletion({
    complete: async () => { throw new Error("connection reset"); },
    readMapping: async () => ({ data: null, error: null }),
    cleanup: async () => { cleanupCalls += 1; return { error: null }; },
  });
  assert.deepEqual(result, { status: "unconfirmed" });
  assert.equal(cleanupCalls, 0);
});
