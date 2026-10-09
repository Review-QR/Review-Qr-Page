import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expectedTokens = [
  "3cr4sgr9Sb9KUXCZw-XkxgFRA4ogFDear6fbfMFsAGk",
  "KeQuu8AC8YzT9yIZv_scLYEMSYA4TL8YEnuwUlm4Fq4",
  "8HE1HSedt2c2hDcf3pOeEhXHMH-NSSEoWZA0KpTORwU",
  "htfrLk5x_t2-mSK8ZRiNfstB_zy3IWJs634PiS_TGLA",
];

test("root metadata emits exactly the four approved Google verification tokens", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const verificationBlock = layout.match(/verification:\s*\{\s*google:\s*\[([\s\S]*?)\]\s*,?\s*\}/);

  assert.ok(verificationBlock, "metadata.verification.google must be an array");
  const configuredTokens = [...verificationBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(configuredTokens, expectedTokens);
  for (const token of expectedTokens) {
    assert.equal(layout.split(token).length - 1, 1, `token must appear exactly once: ${token}`);
  }
});
