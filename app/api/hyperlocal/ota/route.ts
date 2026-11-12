import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import riderManifest from "@/public/bundles/rider-ota-manifest.json";
import partnerManifest from "@/public/bundles/partner-ota-manifest.json";
import customerManifest from "@/public/bundles/customer-ota-manifest.json";
import { buildCorsHeaders, handleCorsPreflight } from "@/lib/auth-cors";

export const dynamic = "force-dynamic";

function isNewerSemver(remoteVersion: string, currentVersion: string): boolean {
  if (!currentVersion) return true;
  const rParts = String(remoteVersion || "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const cParts = String(currentVersion || "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const len = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < len; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

function sanitizeAppKind(rawApp: string): "rider" | "customer" | "partner" {
  const normalized = rawApp.trim().toLowerCase();
  if (normalized === "rider") return "rider";
  if (normalized === "customer") return "customer";
  return "partner";
}

function readLatestManifest(app: "rider" | "customer" | "partner") {
  const fallback =
    app === "rider" ? riderManifest : app === "customer" ? customerManifest : partnerManifest;
  try {
    const diskPath = path.join(process.cwd(), "public", "bundles", `${app}-ota-manifest.json`);
    if (fs.existsSync(diskPath)) {
      return JSON.parse(fs.readFileSync(diskPath, "utf8"));
    }
  } catch {}
  return fallback;
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request, "GET, OPTIONS");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const app = sanitizeAppKind(searchParams.get("app") || "partner");
  const currentClientVersion = (searchParams.get("current") || "").trim();

  const manifest = readLatestManifest(app);
  const hasUpdate = isNewerSemver(manifest.version, currentClientVersion);
  const bundleUrl = `https://trustitreview.com/bundles/${app}-bundle-latest.zip?v=${encodeURIComponent(manifest.version)}_${Date.now()}`;

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
        ...buildCorsHeaders(request.headers.get("origin"), "GET, OPTIONS"),
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    }
  );
}
