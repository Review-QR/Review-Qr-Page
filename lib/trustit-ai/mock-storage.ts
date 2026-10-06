import type { AssetStorageProvider, QrDesignAsset } from "./provider-contracts";

const localAssets = new Map<string, QrDesignAsset>();

function safeSegment(value: string) {
  const normalized = value.normalize("NFKC").replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!normalized || normalized === "." || normalized === "..") throw new Error("Invalid mock asset path segment.");
  return normalized;
}

export class MockAssetStorageProvider implements AssetStorageProvider {
  pathFor({ businessId, themeId, templateId, revision, promptVersion }: Parameters<AssetStorageProvider["pathFor"]>[0]) {
    return `mock-assets/${safeSegment(businessId)}/${safeSegment(themeId)}/${templateId}/${safeSegment(promptVersion)}-r${revision}.svg`;
  }

  async save(input: Parameters<AssetStorageProvider["save"]>[0]): Promise<QrDesignAsset> {
    const storagePath = this.pathFor(input);
    const svg = new TextDecoder().decode(input.image.bytes);
    const asset: QrDesignAsset = {
      businessType: input.businessType,
      themeId: input.themeId,
      templateId: input.templateId,
      promptVersion: input.promptVersion,
      provider: "mock",
      status: "ready",
      createdAt: new Date().toISOString(),
      storagePath,
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    };
    localAssets.set(storagePath, asset);
    return asset;
  }

  async get(storagePath: string) {
    return localAssets.get(storagePath) ?? null;
  }

  async delete(storagePath: string) {
    localAssets.delete(storagePath);
  }
}
