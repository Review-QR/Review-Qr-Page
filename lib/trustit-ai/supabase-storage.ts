import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createPrivateQrDesignAssetPath, isPrivateQrDesignAssetPath } from "./supabase-storage-path";
import type { AssetStorageProvider, QrDesignAsset } from "./provider-contracts";

const BUCKET = "trustit-qr-designs";

export class SupabaseQrDesignStorageProvider implements AssetStorageProvider {
  private readonly supabase = createSupabaseAdminClient();

  pathFor({ businessId, themeId, templateId, revision, promptVersion }: Parameters<AssetStorageProvider["pathFor"]>[0]) {
    return createPrivateQrDesignAssetPath({ businessId, themeId, templateId, revision, promptVersion });
  }

  async save(input: Parameters<AssetStorageProvider["save"]>[0]): Promise<QrDesignAsset> {
    const storagePath = this.pathFor(input);
    const { error } = await this.supabase.storage.from(BUCKET).upload(storagePath, input.image.bytes, {
      contentType: input.image.mimeType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(`QR design storage upload failed: ${error.message}`);

    const { data: signed, error: signedError } = await this.supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
    if (signedError || !signed?.signedUrl) throw new Error(`QR design signed URL failed: ${signedError?.message ?? "unknown error"}`);

    return {
      businessType: input.businessType,
      themeId: input.themeId,
      templateId: input.templateId,
      promptVersion: input.promptVersion,
      provider: "openai",
      status: "ready",
      createdAt: new Date().toISOString(),
      storagePath,
      url: signed.signedUrl,
    };
  }

  async get(storagePath: string) {
    if (!isPrivateQrDesignAssetPath(storagePath, storagePath.split("/")[1] ?? "")) return null;
    const { data, error } = await this.supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) return null;
    return { storagePath, url: data.signedUrl };
  }

  async delete(storagePath: string) {
    await this.supabase.storage.from(BUCKET).remove([storagePath]);
  }
}
