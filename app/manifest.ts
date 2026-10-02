import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trustit",
    short_name: "Trustit",
    description: "Manage your business review QR with Trustit.",
    start_url: "/merchant/dashboard",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#173b48",
    icons: [
      { src: "/trustit-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/trustit-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
