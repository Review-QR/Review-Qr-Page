export function safeReviewLink(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function safeGoogleReviewLink(value: unknown): string | null {
  const safe = safeReviewLink(value);
  if (!safe) return null;
  const url = new URL(safe);
  if (url.port) return null;
  const host = url.hostname.toLowerCase();
  return host === "google.com" || host.endsWith(".google.com") ||
    host === "g.page" || host === "maps.app.goo.gl" ? safe : null;
}
