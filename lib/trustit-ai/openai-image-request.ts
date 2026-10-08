import type { AIImageRequest, GeneratedImage } from "./provider-contracts";
import { decodeOpenAIPng } from "./openai-image-response.ts";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

export async function requestOpenAIImage(input: {
  apiKey: string | undefined;
  model: string;
  quality: string;
  request: AIImageRequest;
  fetcher?: typeof fetch;
}): Promise<GeneratedImage> {
  if (!input.apiKey) throw new Error("OPENAI_API_KEY is required for the OpenAI QR design provider.");
  const fetcher = input.fetcher ?? fetch;
  const response = await fetcher(OPENAI_IMAGES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      prompt: input.request.prompt.prompt,
      size: "1536x1024",
      quality: input.quality,
      output_format: "png",
      n: 1,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`OpenAI image generation failed (${response.status}).`);

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
