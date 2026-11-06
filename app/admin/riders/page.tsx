import { redirect } from "next/navigation";

export default function AdminRidersRedirect() {
  redirect("/admin/hyperlocal?tab=riders");
}
