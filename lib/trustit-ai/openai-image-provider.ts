import "server-only";

import type { AIImageProvider, AIImageRequest, GeneratedImage } from "./provider-contracts";
import { decodeOpenAIPng } from "./openai-image-response";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

export class OpenAIImageProvider implements AIImageProvider {
  readonly provider = "openai" as const;
  private readonly fetcher: typeof fetch;

  constructor(fetcher: typeof fetch = fetch) {
    this.fetcher = fetcher;
  }

  async generateImage(request: AIImageRequest): Promise<GeneratedImage> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required for the OpenAI QR design provider.");

    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
    const response = await this.fetcher(OPENAI_IMAGES_URL, {
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
      throw new Error(`OpenAI image generation failed (${response.status}).`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("OpenAI image generation returned an invalid response.");
    }
    if (!payload || typeof payload !== "object") throw new Error("OpenAI image generation returned an invalid response.");
    const data = (payload as { data?: Array<{ b64_json?: unknown }> }).data;
    return decodeOpenAIPng(Array.isArray(data) ? data[0]?.b64_json : undefined);
  }
}
