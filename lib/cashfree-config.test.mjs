import assert from "node:assert/strict";
import test from "node:test";
import { resolveCashfreeApiBaseUrl } from "./cashfree-config.ts";

test("Cashfree selects only matching sandbox and production API endpoints", () => {
  assert.deepEqual(resolveCashfreeApiBaseUrl("sandbox", "https://sandbox.cashfree.com/pg"), {
    environment: "sandbox", apiBaseUrl: "https://sandbox.cashfree.com/pg",
  });
  assert.deepEqual(resolveCashfreeApiBaseUrl("production", "https://api.cashfree.com/pg/"), {
    environment: "production", apiBaseUrl: "https://api.cashfree.com/pg",
  });
});

test("Cashfree rejects a mode/base URL mismatch and unsafe API origins", () => {
  assert.equal(resolveCashfreeApiBaseUrl("production", "https://sandbox.cashfree.com/pg"), null);
  assert.equal(resolveCashfreeApiBaseUrl("sandbox", "https://example.com/pg"), null);
  assert.equal(resolveCashfreeApiBaseUrl("production", "https://api.cashfree.com.evil/pg"), null);
  assert.equal(resolveCashfreeApiBaseUrl("production", "http://api.cashfree.com/pg"), null);
  assert.equal(resolveCashfreeApiBaseUrl("test", "https://api.cashfree.com/pg"), null);
  assert.equal(resolveCashfreeApiBaseUrl("production", "https://user:pass@api.cashfree.com/pg"), null);
  assert.equal(resolveCashfreeApiBaseUrl("production", "https://api.cashfree.com/pg?redirect=x"), null);
});
