import type { QrTemplateId } from "../../app/merchant/dashboard/qr/templates";
import type { BusinessThemeId, QrVisualPrompt } from "./qr-design-theme";

export type AITextRequest = { task: "review" | "message"; prompt: string; language?: string };
export type AITextProvider = { generateText(request: AITextRequest): Promise<string> };

export type AIImageRequest = {
  prompt: QrVisualPrompt;
  width: number;
  height: number;
  revision: number;
};

export type GeneratedImage = {
  bytes: Uint8Array;
  mimeType: "image/svg+xml";
  width: number;
  height: number;
};

export type AIImageProvider = {
  readonly provider: "mock" | "openai";
  generateImage(request: AIImageRequest): Promise<GeneratedImage>;
};

export type QrDesignAsset = {
  businessType: string | null;
  themeId: BusinessThemeId;
  templateId: QrTemplateId;
  promptVersion: string;
  provider: "mock" | "openai";
  status: "ready";
  createdAt: string;
  storagePath: string;
  url: string;
};

export type QrDesignAssets = Partial<Record<QrTemplateId, QrDesignAsset>>;

export type AssetStorageProvider = {
  pathFor(input: { businessId: string; themeId: BusinessThemeId; templateId: QrTemplateId; revision: number; promptVersion: string }): string;
  save(input: {
    image: GeneratedImage;
    businessType: string | null;
    businessId: string;
    themeId: BusinessThemeId;
    templateId: QrTemplateId;
    promptVersion: string;
    revision: number;
  }): Promise<QrDesignAsset>;
  get(storagePath: string): Promise<{ storagePath: string; url: string } | null>;
  delete(storagePath: string): Promise<void>;
};

export type ThemeGenerator = {
  promptsFor(businessType: string | null | undefined): QrVisualPrompt[];
};

export type TrustitAI = {
  text: { review?: AITextProvider; message?: AITextProvider };
  image: AIImageProvider;
};
