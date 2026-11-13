import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import AdminNavigation from "@/app/admin-navigation";
import { OtaUpdateBanner } from "@/app/components/ota-update-banner";
import { TRUSTIT_SITE_URL } from "@/lib/public-discovery-seo";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Trustit | Hyperlocal Super-App & Delivery Network", template: "%s | Trustit" },
  description: "Bahraich's verified hyperlocal super-app and home delivery network. Order trusted food, sweets, groceries, and healthcare delivered by our dedicated rider fleet.",
  metadataBase: new URL(TRUSTIT_SITE_URL),
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  verification: {
    google: [
      "3cr4sgr9Sb9KUXCZw-XkxgFRA4ogFDear6fbfMFsAGk",
      "KeQuu8AC8YzT9yIZv_scLYEMSYA4TL8YEnuwUlm4Fq4",
      "8HE1HSedt2c2hDcf3pOeEhXHMH-NSSEoWZA0KpTORwU",
      "htfrLk5x_t2-mSK8ZRiNfstB_zy3IWJs634PiS_TGLA"
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://sdk.cashfree.com" />
        <link rel="dns-prefetch" href="https://sdk.cashfree.com" />
        <link rel="preload" href="https://sdk.cashfree.com/js/v3/cashfree.js" as="script" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = window.location.pathname;
                  if (p.indexOf('/rider') === 0 || p.indexOf('/partner') === 0 || p.indexOf('/share') === 0 || p.indexOf('/merchant') === 0) {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(function(regs) {
                        for (var i = 0; i < regs.length; i++) {
                          regs[i].unregister().catch(function() {});
                        }
                      }).catch(function() {});
                    }
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        for (var j = 0; j < names.length; j++) {
                          caches.delete(names[j]).catch(function() {});
                        }
                      }).catch(function() {});
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <AdminNavigation />
        </Suspense>
        <OtaUpdateBanner />
        {children}
      </body>
    </html>
  );
}
