import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetStorageProvider, QrDesignAsset } from "./provider-contracts";
import { createScopedQrDesignPath, isScopedQrDesignPath, isSafeDesignBusinessId } from "./supabase-storage-path";

/** Future adapter. It does not create a bucket; pass the authenticated merchant's business ID and a private server-side bucket explicitly. */
export class SupabaseStorageAssetProvider implements AssetStorageProvider {
  constructor(private readonly client: SupabaseClient, private readonly bucket: string, private readonly businessId: string) {
    if (!bucket.trim()) throw new Error("A private Supabase Storage bucket name is required.");
    if (!isSafeDesignBusinessId(businessId)) throw new Error("An authenticated merchant business scope is required.");
  }

  pathFor(input: Parameters<AssetStorageProvider["pathFor"]>[0]) {
    if (input.businessId !== this.businessId) throw new Error("QR design assets are restricted to the authenticated merchant business.");
    return createScopedQrDesignPath(input);
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
    if (!isScopedQrDesignPath(storagePath, this.businessId)) return null;
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUrl(storagePath, 60 * 60);
    return error || !data?.signedUrl ? null : { storagePath, url: data.signedUrl };
  }

  async delete(storagePath: string) {
    if (!isScopedQrDesignPath(storagePath, this.businessId)) throw new Error("Invalid or out-of-scope QR design storage path.");
    const { error } = await this.client.storage.from(this.bucket).remove([storagePath]);
    if (error) throw new Error("Could not delete the QR design asset.");
  }
}
