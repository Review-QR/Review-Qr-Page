import { headers } from "next/headers";
import { isAdminRecoveryAvailable } from "@/lib/admin-password-recovery";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const requestHeaders = await headers();
  const showRecoveryLink = isAdminRecoveryAvailable(
    {
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
      VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    },
    requestHeaders.get("host")
  );

  return <LoginForm showRecoveryLink={showRecoveryLink} />;
}
