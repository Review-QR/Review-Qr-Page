import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trustit Merchant Partner",
  description: "Trustit Merchant Live Orders & Queue Console",
  manifest: "/api/manifest/merchant",
  appleWebApp: {
    capable: true,
    title: "Trustit Partner",
    statusBarStyle: "default",
  },
};

export default function MerchantRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
