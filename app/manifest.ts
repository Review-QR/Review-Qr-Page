import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trustit",
    short_name: "Trustit",
    description: "Manage your business review QR with Trustit.",
    start_url: "/trustit",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1d4ed8",
    icons: [{ src: "/trustit-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
