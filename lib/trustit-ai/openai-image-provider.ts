import "server-only";

import type { AIImageProvider, AIImageRequest, GeneratedImage } from "./provider-contracts";
import { requestOpenAIImage } from "./openai-image-request";

export class OpenAIImageProvider implements AIImageProvider {
  readonly provider = "openai" as const;
  private readonly fetcher: typeof fetch;

  constructor(fetcher: typeof fetch = fetch) {
    this.fetcher = fetcher;
  }

  async generateImage(request: AIImageRequest): Promise<GeneratedImage> {
    const apiKey = process.env.OPENAI_API_KEY;
    return requestOpenAIImage({
      apiKey,
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
      quality: process.env.OPENAI_IMAGE_QUALITY || "low",
      request,
      fetcher: this.fetcher,
    });
  }
}
