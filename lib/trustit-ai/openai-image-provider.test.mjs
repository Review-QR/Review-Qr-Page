import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { decodeOpenAIPng } from "./openai-image-response.ts";
import { requestOpenAIImage } from "./openai-image-request.ts";
import { getThemeVisualPrompts } from "./qr-design-theme.ts";

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
  assert.match(providerSource, /process\.env\.OPENAI_IMAGE_MODEL \|\| "gpt-image-2"/);
  assert.match(providerSource, /process\.env\.OPENAI_IMAGE_QUALITY \|\| "low"/);
  assert.doesNotMatch(providerSource, /NEXT_PUBLIC_OPENAI_API_KEY/);
});

test("OpenAI image request uses configured server credentials and image settings", async () => {
  let captured;
  const request = { prompt: getThemeVisualPrompts("Library")[0], width: 1200, height: 620, revision: 0 };
  const image = await requestOpenAIImage({
    apiKey: "test-key-never-logged",
    model: "configured-image-model",
    quality: "medium",
    request,
    fetcher: async (url, init) => {
      captured = { url, init };
      return Response.json({ data: [{ b64_json: makePngBase64() }] });
    },
  });
  assert.equal(captured.url, "https://api.openai.com/v1/images/generations");
  assert.equal(captured.init.method, "POST");
  assert.equal(captured.init.headers.Authorization, "Bearer test-key-never-logged");
  assert.equal(captured.init.cache, "no-store");
  assert.deepEqual(JSON.parse(captured.init.body), {
    model: "configured-image-model",
    prompt: request.prompt.prompt,
    size: "1536x1024",
    quality: "medium",
    output_format: "png",
    n: 1,
  });
  assert.equal(image.width, 1536);
  assert.equal(image.height, 1024);
});

test("OpenAI provider failures and malformed responses return safe errors", async () => {
  const request = { prompt: getThemeVisualPrompts("Library")[0], width: 1200, height: 620, revision: 0 };
  await assert.rejects(requestOpenAIImage({ apiKey: undefined, model: "model", quality: "low", request, fetcher: async () => { throw new Error("must not fetch"); } }), /OPENAI_API_KEY is required/);
  await assert.rejects(requestOpenAIImage({
    apiKey: "private-test-key",
    model: "model",
    quality: "low",
    request,
    fetcher: async () => new Response("private provider error detail", { status: 503 }),
  }), (error) => error.message === "OpenAI image generation failed (503)." && !error.message.includes("private provider error detail"));
  await assert.rejects(requestOpenAIImage({ apiKey: "key", model: "model", quality: "low", request, fetcher: async () => new Response("not-json", { status: 200 }) }), /invalid response/);
  await assert.rejects(requestOpenAIImage({
    apiKey: "key",
    model: "model",
    quality: "low",
    request,
    fetcher: async () => Response.json({ data: [{ b64_json: Buffer.alloc(24, 0).toString("base64") }] }),
  }), /invalid PNG image/);
});
