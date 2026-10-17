/** Paths that must perform their own target checks before Supabase access. */
export const CASHFREE_PREVIEW_RUNTIME_DIAGNOSTIC_PATH =
  "/api/admin/cashfree-preview-runtime-check";

/** Skip the global session-refresh proxy only for the exact diagnostic route. */
export function shouldSkipSupabaseSessionRefresh(pathname: string): boolean {
  return pathname === CASHFREE_PREVIEW_RUNTIME_DIAGNOSTIC_PATH;
}
