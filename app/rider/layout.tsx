import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trustit Rider Partner",
  description: "Bahraich Fleet Hyperlocal Delivery Console",
  manifest: "/api/manifest/rider",
  appleWebApp: {
    capable: true,
    title: "Trustit Rider",
    statusBarStyle: "black-translucent",
  },
};

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
