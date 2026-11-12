import test from "node:test";
import assert from "node:assert/strict";
import { checkForbiddenPath, scanTextForViolations } from "../scripts/git-guard.mjs";

test("git-guard blocks sensitive env, keystore, and scratch/temp paths", () => {
  assert.ok(checkForbiddenPath(".env.local"));
  assert.ok(checkForbiddenPath(".env"));
  assert.ok(checkForbiddenPath("android/keystore.properties"));
  assert.ok(checkForbiddenPath("android/trustit-production.keystore"));
  assert.ok(checkForbiddenPath("scratch/loom_video.mp4"));
  assert.ok(checkForbiddenPath("loom_notes.txt"));
  assert.ok(checkForbiddenPath("temp_splash_customer.png"));
  assert.ok(checkForbiddenPath("android-customer-bundle/index.html"));

  assert.equal(checkForbiddenPath(".env.example"), null);
  assert.equal(checkForbiddenPath("app/page.tsx"), null);
  assert.equal(checkForbiddenPath("public/downloads/Trustit-Customer.apk"), null);
});

test("git-guard detects hardcoded secrets and merge conflict markers", () => {
  const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aaaaaaaaaaaaaaaaaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbbbbbbbb";
  assert.ok(scanTextForViolations("app/foo.ts", `const k = "${jwt}";`).some((v) => v.includes("JWT")));
  assert.ok(
    scanTextForViolations("lib/foo.ts", 'SUPABASE_SERVICE_ROLE_KEY="secretvalue123456"').some((v) =>
      v.includes("Hardcoded secret"),
    ),
  );
  assert.ok(
    scanTextForViolations("android/app/build.gradle", 'storePassword "mysecret123"').some((v) =>
      v.includes("keystore password"),
    ),
  );
  assert.ok(
    scanTextForViolations("app/foo.ts", "<<<<<<< HEAD\nconst a = 1;\n=======\nconst a = 2;\n>>>>>>> main").some(
      (v) => v.includes("conflict marker"),
    ),
  );

  assert.deepEqual(scanTextForViolations("app/foo.ts", "export const ok = 123;\n"), []);
  assert.deepEqual(scanTextForViolations("lib/foo.test.mjs", `const sample = "${jwt}";\n`), []);
});
