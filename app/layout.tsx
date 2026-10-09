import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import AdminNavigation from "@/app/admin-navigation";
import { TRUSTIT_SITE_URL } from "@/lib/public-discovery-seo";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Trustit | Discover local businesses", template: "%s | Trustit" },
  description: "Find local businesses and explore public Trustit review summaries.",
  metadataBase: new URL(TRUSTIT_SITE_URL),
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  verification: {
    google: [
      "3cr4sgr9Sb9KUXCZw-XkxgFRA4ogFDear6fbfMFsAGk",
      "KeQuu8AC8YzT9yIZv_scLYEMSYA4TL8YEnuwUlm4Fq4",
      "8HE1HSedt2c2hDcf3pOeEhXHMH-NSSEoWZA0KpTORwU",
    ],
  },
};

export const viewport: Viewport = { themeColor: "#1d4ed8" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <AdminNavigation />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
