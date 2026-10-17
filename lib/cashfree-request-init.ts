/** Attach Cashfree credentials and refuse all redirects on credentialed calls. */
export function createCashfreeRequestInit(
  init: RequestInit,
  input: { clientId: string; clientSecret: string; apiVersion: string }
): RequestInit {
  const headers = new Headers(init.headers);
  headers.set("x-client-id", input.clientId);
  headers.set("x-client-secret", input.clientSecret);
  headers.set("x-api-version", input.apiVersion);

  return { ...init, redirect: "manual", headers };
}
