import assert from "node:assert/strict";
import test from "node:test";
import { logAdminBusinessActionFailure } from "./admin-business-action-diagnostic.ts";

const previewEnv = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "codex/cashfree-sandbox-preview",
};

test("Preview diagnostic logs only the fixed phase and safe error category", () => {
  const entries = [];
  const error = new TypeError("private provider or user detail");
  error.stack = "TypeError: private provider or user detail\n at private frame";

  logAdminBusinessActionFailure(
    "business_type_catalog",
    error,
    previewEnv,
    (...entry) => entries.push(entry),
  );

  assert.deepEqual(entries, [["admin_business_action_failure", {
    location: "app/businesses/actions.ts#createAdminBusiness",
    stage: "business_type_catalog",
    errorCategory: "TypeError",
  }]]);
  assert.doesNotMatch(JSON.stringify(entries), /private provider or user detail|private frame/);
});

test("diagnostic is silent outside the exact Preview branch", () => {
  for (const env of [
    { ...previewEnv, VERCEL_ENV: "production" },
    { ...previewEnv, VERCEL_GIT_COMMIT_REF: "another-branch" },
    {},
  ]) {
    const entries = [];
    logAdminBusinessActionFailure("authorization", new Error("private detail"), env, (...entry) => entries.push(entry));
    assert.deepEqual(entries, []);
  }
});

test("expected Next redirect control flow is not logged as an application failure", () => {
  const entries = [];
  const redirectError = Object.assign(new Error("private redirect detail"), {
    digest: "NEXT_REDIRECT;replace;/login;307;",
  });

  logAdminBusinessActionFailure("authorization", redirectError, previewEnv, (...entry) => entries.push(entry));

  assert.deepEqual(entries, []);
});

test("a diagnostic logger failure is swallowed so it cannot mask the action error", () => {
  assert.doesNotThrow(() => {
    logAdminBusinessActionFailure(
      "database",
      new TypeError("private detail"),
      previewEnv,
      () => {
        throw new Error("logging unavailable");
      },
    );
  });
});
