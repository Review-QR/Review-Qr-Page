import "server-only";

import { createHash } from "node:crypto";

/** Internal, non-deliverable Supabase Auth identity for Business ID sign-in. */
export function merchantAuthEmail(businessId: string): string {
  const idDigest = createHash("sha256").update(businessId).digest("hex");
  return `merchant.${idDigest}@accounts.review-qr.invalid`;
}

