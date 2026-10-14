export const ADMIN_RECOVERY_BRANCH = "codex/cashfree-sandbox-preview";
export const ADMIN_RECOVERY_PREVIEW_HOST =
  "review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app";
export const ADMIN_RECOVERY_MESSAGE =
  "If an eligible account exists, password recovery instructions will be sent.";
export const ADMIN_RECOVERY_CALLBACK_PATH = "/auth/callback";

type RecoveryEnvironment = {
  VERCEL_ENV?: string;
  VERCEL_GIT_COMMIT_REF?: string;
  VERCEL_BRANCH_URL?: string;
};

type AuthResult = { error: unknown | null };
type AuthUser = { id: string };

export type RecoveryClient = {
  auth: {
    resetPasswordForEmail(
      email: string,
      options: { redirectTo: string }
    ): Promise<AuthResult>;
    exchangeCodeForSession(code: string): Promise<AuthResult>;
    getUser(): Promise<{
      data: { user: AuthUser | null };
      error: unknown | null;
    }>;
    updateUser(attributes: { password: string }): Promise<AuthResult>;
    signOut(): Promise<unknown>;
  };
  from(table: "admin_users"): {
    select(columns: "user_id"): {
      eq(column: "user_id", value: string): {
        eq(column: "is_active", value: true): {
          maybeSingle(): PromiseLike<{
            data: { user_id: string } | null;
            error: unknown | null;
          }>;
        };
      };
    };
  };
};

/**
 * Trust only the stable Vercel branch URL, and only on the named Preview
 * branch. The host must match the explicitly authorized Preview domain; it is
 * never taken from a query parameter or caller-supplied redirect target.
 */
export function authorizedPreviewOrigin(
  env: RecoveryEnvironment,
  requestOrigin: string | null | undefined
): string | null {
  if (
    env.VERCEL_ENV !== "preview" ||
    env.VERCEL_GIT_COMMIT_REF !== ADMIN_RECOVERY_BRANCH ||
    env.VERCEL_BRANCH_URL !== ADMIN_RECOVERY_PREVIEW_HOST
  ) {
    return null;
  }

  try {
    const allowedOrigin = `https://${ADMIN_RECOVERY_PREVIEW_HOST}`;
    const candidate = new URL(requestOrigin ?? "");
    if (
      candidate.protocol !== "https:" ||
      candidate.origin !== allowedOrigin ||
      requestOrigin !== allowedOrigin ||
      candidate.username ||
      candidate.password
    ) {
      return null;
    }
    return allowedOrigin;
  } catch {
    return null;
  }
}

export function recoveryCallbackUrl(origin: string): string {
  return new URL(ADMIN_RECOVERY_CALLBACK_PATH, origin).toString();
}

/** Always return the same public response, including for provider errors. */
export async function requestAdminPasswordRecovery(
  client: RecoveryClient,
  email: string,
  redirectTo: string
): Promise<string> {
  try {
    await client.auth.resetPasswordForEmail(email, { redirectTo });
  } catch {
    // Do not log provider errors or reveal whether the address is registered.
  }
  return ADMIN_RECOVERY_MESSAGE;
}

export async function hasActiveAdminSession(
  client: RecoveryClient
): Promise<boolean> {
  try {
    const { data, error } = await client.auth.getUser();
    const userId = data.user?.id;
    if (error || !userId) return false;

    const { data: admin, error: adminError } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    return !adminError && admin?.user_id === userId;
  } catch {
    return false;
  }
}

/** PKCE exchange validates the one-time recovery code and creates SSR cookies. */
export async function completeAdminRecovery(
  client: RecoveryClient,
  code: string | null | undefined
): Promise<boolean> {
  if (!code || code.length < 16 || code.length > 4096) return false;

  try {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      await client.auth.signOut();
      return false;
    }
    if (await hasActiveAdminSession(client)) return true;
  } catch {
    // Treat invalid, expired, replayed, or unavailable recovery as the same case.
  }

  try {
    await client.auth.signOut();
  } catch {
    // The browser is redirected to login regardless; no auth detail is exposed.
  }
  return false;
}

export async function updateAdminRecoveryPassword(
  client: RecoveryClient,
  password: string
): Promise<boolean> {
  if (password.length < 12 || !(await hasActiveAdminSession(client))) {
    return false;
  }
  try {
    const { error } = await client.auth.updateUser({ password });
    return !error;
  } catch {
    return false;
  }
}
