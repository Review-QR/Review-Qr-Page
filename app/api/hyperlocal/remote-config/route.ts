import { NextResponse } from "next/server";
import {
  getRiderRemoteConfig,
  updateRiderRemoteConfig,
  resetRiderRemoteConfig,
} from "@/lib/hyperlocal/remote-config";
import { requireAdminApi } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getRiderRemoteConfig();
  return NextResponse.json({ success: true, config });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    if (body.action === "reset") {
      const resetConfig = resetRiderRemoteConfig();
      return NextResponse.json({ success: true, message: "Remote config reset to defaults", config: resetConfig });
    }

    const updated = updateRiderRemoteConfig(body.updates || body);
    return NextResponse.json({ success: true, message: "Remote config updated successfully", config: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update remote config" },
      { status: 400 }
    );
  }
}
