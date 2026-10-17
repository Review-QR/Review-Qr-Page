import assert from "node:assert/strict";
import test from "node:test";
import { resolveCashfreePreviewIngressDecision } from "./cashfree-preview-ingress.ts";

const base = {
  vercelEnvironment: "preview",
  vercelGitCommitRef: "codex/cashfree-sandbox-preview",
  cashfreeEnvironment: "sandbox",
  cashfreeApiBaseUrl: "https://sandbox.cashfree.com/pg",
  requestHost: "sandbox-webhook.trustitreview.com",
  requestPath: "/api/cashfree/webhook",
  requestMethod: "POST",
  webhookUrl: "https://sandbox-webhook.trustitreview.com/api/cashfree/webhook",
  ingressEnabled: "true",
  vercelUrl: "review-qr-page-preview-123.vercel.app",
  vercelBranchUrl: "review-qr-page-git-codex-cashfree-sandbox-preview.vercel.app",
};

test("Preview ingress allows only the enabled Sandbox webhook on its dedicated branch", () => {
  assert.equal(resolveCashfreePreviewIngressDecision(base), "allow");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, requestPath: "/merchant" }), "reject");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, requestPath: "/api/cashfree/webhook/extra" }), "reject");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, requestMethod: "GET" }), "reject");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, ingressEnabled: "false" }), "reject");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, requestHost: "other-preview.example.com" }), "reject");
});

test("Preview ingress fails closed outside the dedicated Sandbox branch and endpoint", () => {
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, vercelGitCommitRef: "feature/other" }), "reject");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, cashfreeEnvironment: "production" }), "reject");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, cashfreeApiBaseUrl: "https://api.cashfree.com/pg" }), "reject");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, webhookUrl: "http://sandbox-webhook.trustitreview.com/api/cashfree/webhook" }), "reject");
});

test("Preview ingress leaves protected Vercel hosts and non-Preview deployments unchanged", () => {
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, requestHost: "review-qr-page-preview-123.vercel.app" }), "continue");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, requestHost: "review-qr-page-git-codex-cashfree-sandbox-preview.vercel.app" }), "continue");
  assert.equal(resolveCashfreePreviewIngressDecision({ ...base, vercelEnvironment: "production" }), "continue");
});
