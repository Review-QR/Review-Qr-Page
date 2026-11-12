/**
 * Helpers for cleaning Google Plus Codes (e.g. "HH5M+PH2, ") and formatting
 * human-readable Indian mohalla / street / landmark strings.
 */

const PLUS_CODE_TOKEN_RE = /\b[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,4}\b/gi;

export function stripGooglePlusCode(raw: string | null | undefined): string {
  if (!raw) return "";
  const cleaned = String(raw)
    .replace(PLUS_CODE_TOKEN_RE, "")
    .replace(/\s*,\s*,+/g, ", ")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .replace(/,\s*India$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned;
}

export function isPlusCodeLike(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return PLUS_CODE_TOKEN_RE.test(String(raw).trim());
}
