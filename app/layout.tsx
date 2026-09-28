import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import AdminNavigation from "@/app/admin-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review-QR",
  description: "QR Review Management Platform",
  manifest: "/manifest.webmanifest",
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
