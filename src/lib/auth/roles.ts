export * from "./routing.js";
import { destination } from "./routing.js";
import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export type Role = "patient" | "admin";

export const getCurrentRole = cache(async (): Promise<{ userId: string; role: Role } | null> => {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;
  const { data: row, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleError || !row) return null;
  const { data: statusRow } = await supabase
    .from("account_status")
    .select("is_active")
    .eq("user_id", user.id)
    .single();
  if (statusRow && !statusRow.is_active) return null;
  const role = row.role as Role;
  if (role !== "patient" && role !== "admin") return null;
  return { userId: user.id, role };
});

export async function requireRole(expected: Role): Promise<{ userId: string; role: Role }> {
  const current = await getCurrentRole();
  const target = destination(current?.role ?? null, expected === "admin" ? "/admin/dashboard" : "/dashboard");
  if (target) redirect(target);
  if (!current || current.role !== expected) redirect("/403");
  return current;
}
