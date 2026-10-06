import type { AIImageProvider } from "./provider-contracts";
import { MockAIImageProvider } from "./mock-image-provider.ts";

export type AIImageProviderMode = "mock" | "openai";

export function resolveAIImageProviderMode(value: string | undefined): AIImageProviderMode {
  if (!value || value === "mock") return "mock";
  if (value === "openai") return "openai";
  throw new Error("TRUSTIT_AI_IMAGE_PROVIDER must be either mock or openai.");
}

export function createAIImageProvider(value: string | undefined, openAIProvider?: AIImageProvider): AIImageProvider {
  const mode = resolveAIImageProviderMode(value);
  if (mode === "mock") return new MockAIImageProvider();
  if (openAIProvider?.provider === "openai") return openAIProvider;
  throw new Error("The OpenAI image adapter is not installed. Mock mode remains the only available provider.");
}
