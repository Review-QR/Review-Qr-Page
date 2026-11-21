import test from "node:test";
import assert from "node:assert/strict";
import { verifyCashfreeWebhookReplayWindow, verifyCashfreeSignature } from "./cashfree-signature.ts";
import { createHmac } from "node:crypto";

// Fixed reference "now" so the window math is deterministic.
const NOW = 1_700_000_000_000; // ms
const NOW_S = String(Math.floor(NOW / 1000));

function tsSecondsAgo(secAgo) {
  return String(Math.floor((NOW - secAgo * 1000) / 1000));
}
function tsMillisAgo(msAgo) {
  return String(NOW - msAgo);
}

test("replay window: fresh event (now) is accepted", () => {
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: NOW_S, nowMs: NOW }), true);
});

test("replay window: 10-minute-old event is accepted (within default 900s)", () => {
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: tsSecondsAgo(600), nowMs: NOW }), true);
});

test("replay window: event just at the 900s boundary is accepted", () => {
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: tsSecondsAgo(900), nowMs: NOW }), true);
});

test("replay window: 30-minute-old event is rejected", () => {
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: tsSecondsAgo(1800), nowMs: NOW }), false);
});

test("replay window: supports millisecond-unit timestamps (13 digits)", () => {
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: tsMillisAgo(0), nowMs: NOW }), true);
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: tsMillisAgo(1_800_000), nowMs: NOW }), false);
});

test("replay window: a slightly-future timestamp within clock skew is accepted", () => {
  // 30s in the future; default clockSkewMs is 60s.
  const future = String(Math.floor((NOW + 30_000) / 1000));
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: future, nowMs: NOW }), true);
});

test("replay window: a far-future timestamp is rejected", () => {
  const farFuture = String(Math.floor((NOW + 3_600_000) / 1000)); // +1h
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: farFuture, nowMs: NOW }), false);
});

test("replay window: maxAgeMs=0 disables the window (signature-only mode)", () => {
  // Even a very old timestamp passes when the window is disabled.
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: "1", maxAgeMs: 0, nowMs: NOW }), true);
});

test("replay window: missing / malformed timestamp is rejected", () => {
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: null, nowMs: NOW }), false);
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: "not-a-number", nowMs: NOW }), false);
});

test("signature check is independent of and still required alongside the window", () => {
  const secret = "s3cret";
  const ts = tsSecondsAgo(10);
  const rawBody = JSON.stringify({ hello: "world" });
  const sig = createHmac("sha256", secret).update(`${ts}${rawBody}`).digest("base64");
  // Valid signature + fresh timestamp => both pass.
  assert.equal(verifyCashfreeSignature({ secret, rawBody, timestamp: ts, signature: sig }), true);
  assert.equal(verifyCashfreeWebhookReplayWindow({ timestamp: ts, nowMs: NOW }), true);
  // Tampered signature => fails even if timestamp is fresh.
  assert.equal(verifyCashfreeSignature({ secret, rawBody, timestamp: ts, signature: "AAAA" }), false);
});
