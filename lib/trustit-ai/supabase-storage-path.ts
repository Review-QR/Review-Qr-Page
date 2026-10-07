import { isQrTemplateId } from "../../app/merchant/dashboard/qr/templates.ts";
import { businessThemes, type BusinessThemeId } from "./qr-design-theme.ts";
import type { QrTemplateId } from "../../app/merchant/dashboard/qr/templates";

const businessIdPattern = /^[a-zA-Z0-9_-]{1,120}$/;
const promptVersionPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeDesignBusinessId(value: string) {
  return businessIdPattern.test(value);
}

export function createScopedQrDesignPath(input: {
  businessId: string;
  themeId: BusinessThemeId;
  templateId: QrTemplateId;
  revision: number;
  promptVersion: string;
}) {
  if (!isSafeDesignBusinessId(input.businessId)) throw new Error("Invalid QR design business scope.");
  if (!businessThemes.some((theme) => theme.id === input.themeId)) throw new Error("Invalid QR design theme.");
  if (!isQrTemplateId(input.templateId)) throw new Error("Invalid QR design template.");
  if (!Number.isInteger(input.revision) || input.revision < 0 || input.revision > 4) throw new Error("Invalid QR design revision.");
  if (!promptVersionPattern.test(input.promptVersion)) throw new Error("Invalid QR design prompt version.");
  return `businesses/${input.businessId}/qr-designs/${input.themeId}/${input.templateId}/${input.promptVersion}-r${input.revision}.svg`;
}

export function isScopedQrDesignPath(storagePath: string, businessId: string) {
  if (!isSafeDesignBusinessId(businessId)) return false;
  const escapedBusinessId = businessId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^businesses/${escapedBusinessId}/qr-designs/([a-z0-9-]+)/template_[1-5]/[a-z0-9]+(?:-[a-z0-9]+)*-r[0-4]\\.svg$`).exec(storagePath);
  return Boolean(match && businessThemes.some((theme) => theme.id === match[1]));
}

export function createPrivateQrDesignAssetPath(input: {
  businessId: string;
  themeId: BusinessThemeId;
  templateId: QrTemplateId;
  revision: number;
  promptVersion: string;
}) {
  if (!isSafeDesignBusinessId(input.businessId)) throw new Error("Invalid QR design business scope.");
  if (!businessThemes.some((theme) => theme.id === input.themeId)) throw new Error("Invalid QR design theme.");
  if (!isQrTemplateId(input.templateId)) throw new Error("Invalid QR design template.");
  if (!Number.isInteger(input.revision) || input.revision < 0 || input.revision > 4) throw new Error("Invalid QR design revision.");
  if (!promptVersionPattern.test(input.promptVersion)) throw new Error("Invalid QR design prompt version.");
  return `businesses/${input.businessId}/${input.themeId}/${input.templateId}/${input.promptVersion}-r${input.revision}.png`;
}

export function isPrivateQrDesignAssetPath(storagePath: string, businessId: string) {
  if (!isSafeDesignBusinessId(businessId)) return false;
  const match = new RegExp(`^businesses/${businessId}/([a-z0-9-]+)/template_[1-5]/[a-z0-9]+(?:-[a-z0-9]+)*-r[0-4]\\.png$`).exec(storagePath);
  return Boolean(match && businessThemes.some((theme) => theme.id === match[1]));
}
