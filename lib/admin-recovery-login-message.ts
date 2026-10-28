/** Map recovery redirects to fixed copy; query parameters never supply text. */
export function adminRecoveryLoginMessage(value: string | null): string | null {
  if (value === "invalid") {
    return "This recovery link is invalid or expired, or the account is not authorized. Request a new link or sign in.";
  }
  if (value === "unavailable") {
    return "Password recovery is unavailable on this deployment.";
  }
  return null;
}
