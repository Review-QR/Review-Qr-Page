import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { decodeOpenAIPng } from "./openai-image-response.ts";

const providerSource = await readFile(new URL("./openai-image-provider.ts", import.meta.url), "utf8");

function makePngBase64(width = 1536, height = 1024) {
  const pngHeader = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(pngHeader, 0);
  pngHeader.writeUInt32BE(13, 8);
  pngHeader.write("IHDR", 12, "ascii");
  pngHeader.writeUInt32BE(width, 16);
  pngHeader.writeUInt32BE(height, 20);
  return pngHeader.toString("base64");
}

test("OpenAI image response accepts the expected PNG and dimensions", () => {
  const image = decodeOpenAIPng(makePngBase64());
  assert.equal(image.mimeType, "image/png");
  assert.equal(image.width, 1536);
  assert.equal(image.height, 1024);
  assert.equal(image.bytes.length, 24);
});

test("OpenAI image response rejects malformed base64, PNG data, and dimensions", () => {
  assert.throws(() => decodeOpenAIPng("%%%"), /invalid image data/);
  assert.throws(() => decodeOpenAIPng(Buffer.alloc(24, 1).toString("base64")), /invalid PNG image/);
  assert.throws(() => decodeOpenAIPng(makePngBase64(1024, 1024)), /unexpected image dimensions/);
  assert.throws(() => decodeOpenAIPng(null), /invalid image data/);
});

test("OpenAI Images request is server-only, configurable, and does not log provider response bodies", () => {
  assert.match(providerSource, /^import "server-only"/);
  assert.match(providerSource, /process\.env\.OPENAI_API_KEY/);
  assert.match(providerSource, /https:\/\/api\.openai\.com\/v1\/images\/generations/);
  assert.match(providerSource, /model,/);
  assert.match(providerSource, /size: "1536x1024"/);
  assert.match(providerSource, /quality: process\.env\.OPENAI_IMAGE_QUALITY \|\| "low"/);
  assert.match(providerSource, /output_format: "png"/);
  assert.match(providerSource, /n: 1/);
  assert.match(providerSource, /OpenAI image generation failed \(\$\{response\.status\}\)\./);
  assert.doesNotMatch(providerSource, /response\.text\(\)|detail\.slice|console\.(log|error)/);
  assert.doesNotMatch(providerSource, /NEXT_PUBLIC_OPENAI_API_KEY/);
});
