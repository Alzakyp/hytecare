import { redirect } from "next/navigation";
import { getCurrentRole } from "@/lib/auth/roles";

export default async function Home() {
  const current = await getCurrentRole();
  redirect(current?.role === "admin" ? "/admin/dashboard" : current?.role === "patient" ? "/dashboard" : "/login");
}
