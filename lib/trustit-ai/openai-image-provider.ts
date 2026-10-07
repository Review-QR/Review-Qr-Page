import "server-only";

import type { AIImageProvider, AIImageRequest, GeneratedImage } from "./provider-contracts";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

export class OpenAIImageProvider implements AIImageProvider {
  readonly provider = "openai" as const;

  async generateImage(request: AIImageRequest): Promise<GeneratedImage> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required for the OpenAI QR design provider.");

    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: request.prompt.prompt,
        size: "1536x1024",
        quality: process.env.OPENAI_IMAGE_QUALITY || "low",
        output_format: "png",
        n: 1,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`OpenAI image generation failed (${response.status}): ${detail.slice(0, 500)}`);
    }

    const payload = await response.json() as {
      data?: Array<{ b64_json?: string }>;
    };
    const encoded = payload.data?.[0]?.b64_json;
    if (!encoded) throw new Error("OpenAI image generation returned no image data.");

    const bytes = Uint8Array.from(Buffer.from(encoded, "base64"));
    if (!bytes.byteLength) throw new Error("OpenAI image generation returned an empty image.");

    return {
      bytes,
      mimeType: "image/png",
      width: 1536,
      height: 1024,
    };
  }
}
