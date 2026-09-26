import type { ReactNode } from "react";
import { requireActiveAdmin } from "@/lib/supabase-server";

export default async function QrCodesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireActiveAdmin();
  return children;
}
