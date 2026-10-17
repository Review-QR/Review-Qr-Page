type BusinessActionStage = "authorization" | "business_type_catalog" | "database";

const DIAGNOSTIC_BRANCH = "codex/cashfree-sandbox-preview";
const SAFE_ERROR_CATEGORIES = new Set([
  "TypeError",
  "ReferenceError",
  "RangeError",
  "SyntaxError",
]);

/**
 * Emit only fixed phase/category metadata for the isolated Preview branch.
 * Error messages and stacks can contain user data or provider details, so they
 * are deliberately never sent to logs or returned to the browser.
 */
export function logAdminBusinessActionFailure(
  stage: BusinessActionStage,
  error: unknown,
  env: NodeJS.ProcessEnv = process.env,
  log: (...args: unknown[]) => void = console.error,
) {
  try {
    if (
      env.VERCEL_ENV !== "preview" ||
      env.VERCEL_GIT_COMMIT_REF !== DIAGNOSTIC_BRANCH
    ) {
      return;
    }

    const errorName = error instanceof Error ? error.name : "";
    const digest = error instanceof Error
      ? (error as Error & { digest?: unknown }).digest
      : undefined;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      return;
    }

    const errorCategory = SAFE_ERROR_CATEGORIES.has(errorName)
      ? errorName
      : "Error";

    log("admin_business_action_failure", {
      location: "app/businesses/actions.ts#createAdminBusiness",
      stage,
      errorCategory,
    });
  } catch {
    // Diagnostics must never alter the action result or mask its exception.
  }
}
