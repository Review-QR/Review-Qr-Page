import "server-only";

import { handlePreviewCashfreeRuntimeDiagnostic } from "@/lib/cashfree-preview-runtime-diagnostic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request): Promise<Response> {
  return handlePreviewCashfreeRuntimeDiagnostic(request, process.env, async () => {
    try {
      // Import only after the handler has established the Vercel and Supabase
      // target, so a misconfigured URL cannot trigger an auth request elsewhere.
      const { requireActiveAdmin } = await import("@/lib/supabase-server");
      await requireActiveAdmin();
      return true;
    } catch {
      // requireActiveAdmin redirects for unauthenticated and inactive users;
      // keep the endpoint's denial response generic and secret-free.
      return false;
    }
  });
}
