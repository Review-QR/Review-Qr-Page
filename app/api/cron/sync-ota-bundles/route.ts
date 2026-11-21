import { NextResponse } from "next/server";
import { constantTimeEqual } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = (process.env.CRON_SECRET || "").trim();

  if (!cronSecret || !constantTimeEqual(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ success: false, message: "Unauthorized cron execution." }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // OTA bundles are served from the public/bundles/ directory
    // This cron verifies the manifest files are consistent with actual bundle files
    const apps = ["customer", "merchant", "rider"] as const;
    const results: Record<string, { manifest: { version: string; updatedAt: string } | null; ok: boolean }> = {};

    for (const app of apps) {
      try {
        // Read the OTA manifest file from public/bundles/
        const fs = await import("node:fs");
        const path = await import("node:path");
        const manifestPath = path.join(process.cwd(), "public", "bundles", `${app}-ota-manifest.json`);

        if (!fs.existsSync(manifestPath)) {
          results[app] = { manifest: null, ok: false };
          continue;
        }

        const manifestContent = fs.readFileSync(manifestPath, "utf8");
        const manifest = JSON.parse(manifestContent) as {
          version: string;
          updatedAt: string;
          bundleUrl: string;
          notes?: string;
        };

        // Verify the bundle URL is accessible
        const bundleExists = fs.existsSync(
          path.join(process.cwd(), "public", "bundles", `${app}-bundle-latest.zip`)
        );

        results[app] = {
          manifest: {
            version: manifest.version,
            updatedAt: manifest.updatedAt,
          },
          ok: bundleExists,
        };
      } catch (err) {
        console.error(`[cron:ota] error checking ${app}:`, err);
        results[app] = { manifest: null, ok: false };
      }
    }

    const allOk = Object.values(results).every((r) => r.ok);

    return NextResponse.json({
      success: true,
      message: allOk ? "All OTA bundles verified" : "Some OTA bundles have issues",
      apps: results,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[cron:ota] unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Cron execution failed",
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
