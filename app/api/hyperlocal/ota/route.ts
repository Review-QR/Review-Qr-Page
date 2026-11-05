import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
  const currentClientVersion = searchParams.get("current") || "2.2.0";

  const manifestFileName =
    app === "rider"
      ? "rider-ota-manifest.json"
      : app === "customer"
      ? "customer-ota-manifest.json"
      : "partner-ota-manifest.json";

  const manifestPath = path.join(process.cwd(), "public", "bundles", manifestFileName);

  const defaultVersion = app === "rider" ? "3.1.0" : "2.2.0";
  let manifest = {
    version: defaultVersion,
    minAppVersion: defaultVersion,
    bundleUrl: `https://trustitreview.com/bundles/${app}-bundle-latest.zip`,
    updatedAt: new Date().toISOString(),
    notes: `${app} live bundle release`,
  };

  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      manifest = { ...manifest, ...data };
    } catch {}
  }

  const hasUpdate = manifest.version !== currentClientVersion;

  let finalBundleUrl = manifest.bundleUrl;
  const host = request.headers.get("host") || "";
  if (host.includes("192.168.") || host.includes("localhost")) {
    finalBundleUrl = `http://${host}/bundles/${manifestFileName.replace('-manifest.json', '-latest.zip')}?v=${Date.now()}`;
  }

  return NextResponse.json(
    {
      app,
      hasUpdate,
      version: manifest.version,
      bundleUrl: finalBundleUrl,
      notes: manifest.notes,
      updatedAt: manifest.updatedAt,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
