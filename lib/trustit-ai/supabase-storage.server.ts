import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetStorageProvider, QrDesignAsset } from "./provider-contracts";

/** Future adapter. It does not create a bucket; supply a private bucket and server-side client explicitly. */
export class SupabaseStorageAssetProvider implements AssetStorageProvider {
  constructor(private readonly client: SupabaseClient, private readonly bucket: string) {
    if (!bucket.trim()) throw new Error("A private Supabase Storage bucket name is required.");
  }

  pathFor({ businessId, themeId, templateId, revision, promptVersion }: Parameters<AssetStorageProvider["pathFor"]>[0]) {
    const safeBusinessId = businessId.replace(/[^a-zA-Z0-9_-]/g, "-");
    return `businesses/${safeBusinessId}/qr-designs/${themeId}/${templateId}/${promptVersion}-r${revision}.svg`;
  }

  async save(input: Parameters<AssetStorageProvider["save"]>[0]): Promise<QrDesignAsset> {
    const storagePath = this.pathFor(input);
    const { error } = await this.client.storage.from(this.bucket).upload(storagePath, input.image.bytes, {
      contentType: input.image.mimeType,
      upsert: true,
    });
    if (error) throw new Error("Could not save the QR design asset.");
    const { data, error: urlError } = await this.client.storage.from(this.bucket).createSignedUrl(storagePath, 60 * 60);
    if (urlError || !data?.signedUrl) throw new Error("Could not create a temporary QR design asset URL.");
    return {
      businessType: input.businessType,
      themeId: input.themeId,
      templateId: input.templateId,
      promptVersion: input.promptVersion,
      provider: "openai",
      status: "ready",
      createdAt: new Date().toISOString(),
      storagePath,
      url: data.signedUrl,
    };
  }

  async get(storagePath: string): Promise<{ storagePath: string; url: string } | null> {
    if (!storagePath.startsWith("businesses/") || storagePath.includes("..")) return null;
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUrl(storagePath, 60 * 60);
    return error || !data?.signedUrl ? null : { storagePath, url: data.signedUrl };
  }

  async delete(storagePath: string) {
    if (!storagePath.startsWith("businesses/") || storagePath.includes("..")) throw new Error("Invalid asset storage path.");
    const { error } = await this.client.storage.from(this.bucket).remove([storagePath]);
    if (error) throw new Error("Could not delete the QR design asset.");
  }
}
