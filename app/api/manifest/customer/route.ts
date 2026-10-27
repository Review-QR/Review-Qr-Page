export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "Trustit Super-App",
    short_name: "Trustit",
    description: "Food Delivery, Salon Queue Tokens, Car Wash Bay & Kirana Parcha in Bahraich",
    start_url: "/order",
    scope: "/order",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [
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
