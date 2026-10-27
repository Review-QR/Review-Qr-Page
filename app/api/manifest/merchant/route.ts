export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "Trustit Merchant Partner",
    short_name: "Trustit Partner",
    description: "Trustit Live Orders, Kitchen Queue & Digital Token Board",
    start_url: "/merchant/dashboard/orders",
    scope: "/merchant",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f59e0b",
    icons: [
      {
        src: "/merchant-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/merchant-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/trustit-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
