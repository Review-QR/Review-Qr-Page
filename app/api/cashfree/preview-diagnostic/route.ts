import { requireActiveAdmin } from "@/lib/supabase-server";
import { createCashfreePreviewDiagnosticHandler } from "@/lib/cashfree-preview-diagnostic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createCashfreePreviewDiagnosticHandler({
  getEnvironment: () => process.env,
  async isActiveAdmin() {
    try {
      await requireActiveAdmin();
      return true;
    } catch {
      return false;
    }
  },
});
