import { NextResponse } from "next/server";
import riderManifest from "@/public/bundles/rider-ota-manifest.json";
import partnerManifest from "@/public/bundles/partner-ota-manifest.json";
import customerManifest from "@/public/bundles/customer-ota-manifest.json";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const app = (searchParams.get("app") || "partner").toLowerCase();
  const currentClientVersion = searchParams.get("current") || "";

  let manifest = partnerManifest;
  if (app === "rider") {
    manifest = riderManifest;
  } else if (app === "customer") {
    manifest = customerManifest;
  }

  // Always force hasUpdate = true if client is on an older version or no version passed
  const hasUpdate = !currentClientVersion || manifest.version !== currentClientVersion;

  const bundleUrl = `https://trustitreview.com/bundles/${app}-bundle-latest.zip?v=${Date.now()}`;

  return NextResponse.json(
    {
      app,
      hasUpdate,
      version: manifest.version,
      bundleUrl,
      notes: manifest.notes,
      updatedAt: manifest.updatedAt,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    }
  );
}
