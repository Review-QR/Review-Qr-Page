import type { ReactNode } from "react";
import { requireActiveAdmin } from "@/lib/supabase-server";

export default async function BusinessesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireActiveAdmin();
  return children;
}
