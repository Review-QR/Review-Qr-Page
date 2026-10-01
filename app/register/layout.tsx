import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your business account | Trustit",
  description: "Set up your Trustit business profile, choose a 30-day plan, and activate your QR after payment verification.",
};

export default function RegisterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
