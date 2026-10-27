export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "Trustit Rider Partner",
    short_name: "Trustit Rider",
    description: "Trustit Hyperlocal Delivery Partner Fleet Console",
    start_url: "/rider",
    scope: "/rider",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/rider-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/rider-icon-512.png",
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
