import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;

  // 1. If running on local server, try reading from disk
  const localFilePath = path.join(process.cwd(), "public", "downloads", filename);
  if (fs.existsSync(localFilePath)) {
    try {
      const stats = fs.statSync(localFilePath);
      const stream = fs.createReadStream(localFilePath);
      const isApk = filename.endsWith(".apk");
      return new Response(stream as any, {
        headers: {
          "Content-Type": isApk ? "application/vnd.android.package-archive" : "application/pdf",
          "Content-Length": stats.size.toString(),
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {}
  }

  // 2. Fallback to GitHub raw CDN direct download (bypassing GitHub CDN cache)
  const githubUrl = `https://raw.githubusercontent.com/Review-QR/Review-Qr-Page/main/public/downloads/${filename}?v=${Date.now()}`;
  return NextResponse.redirect(githubUrl, 307);
}
