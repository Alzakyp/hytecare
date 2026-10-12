"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateCreateUser, validateUpdateUser } from "./validation.js";

export type UserActionState = { error?: string; message?: string };
const safeError = (message?: string) => message?.toLowerCase().includes("already") || message?.toLowerCase().includes("exists") ? "Email sudah digunakan." : "Operasi pengguna gagal. Coba lagi.";

export async function createUser(_previous: UserActionState, form: FormData): Promise<UserActionState> {
  const actor = await requireRole("admin");
  const parsed = validateCreateUser(Object.fromEntries(form));
  if (!parsed.ok) return { error: parsed.error };
  let admin;
  try { admin = createAdminClient(); } catch { return { error: "Layanan pengelolaan akun belum dikonfigurasi." }; }
  const { value } = parsed;
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: value.email, password: value.password, email_confirm: true, user_metadata: { display_name: value.display_name },
  });
  if (authError || !created.user) return { error: safeError(authError?.message) };
  const { error: profileError } = await admin.from("profiles").update({ display_name: value.display_name }).eq("id", created.user.id);
  const { error: roleError } = profileError ? { error: profileError } : await admin.from("user_roles").update({ role: value.role }).eq("user_id", created.user.id);
  const { error: auditError } = roleError ? { error: roleError } : await admin.from("admin_audit_log").insert({ actor_id: actor.userId, target_user_id: created.user.id, action: "create", metadata: { role: value.role } });
  if (auditError) {
    const { error: cleanupError } = await admin.auth.admin.deleteUser(created.user.id);
    if (cleanupError) {
      await admin.auth.admin.updateUserById(created.user.id, { ban_duration: "876000h" });
      return { error: "Pembuatan tidak selesai. Akun diblokir; rekonsiliasi operator diperlukan." };
    }
    return { error: "Akun tidak dapat diselesaikan dan telah dibatalkan." };
  }
  revalidatePath("/admin/users"); revalidatePath("/admin/dashboard"); redirect("/admin/users");
}

export async function updateUser(_previous: UserActionState, form: FormData): Promise<UserActionState> {
  const started = performance.now();
  const actor = await requireRole("admin");
  const parsed = validateUpdateUser(Object.fromEntries(form));
  if (!parsed.ok) return { error: parsed.error };
  let admin;
  try { admin = createAdminClient(); } catch { return { error: "Layanan pengelolaan akun belum dikonfigurasi." }; }
  const { value } = parsed;
  const authUpdates: { email: string; email_confirm: boolean; password?: string } = { email: value.email, email_confirm: true };
  if (value.password) authUpdates.password = value.password;
  const [{ error: profileError }, { error: authError }] = await Promise.all([
    admin.from("profiles").update({ display_name: value.display_name }).eq("id", value.user_id),
    admin.auth.admin.updateUserById(value.user_id, authUpdates),
  ]);
  if (profileError) return { error: "Gagal memperbarui nama pengguna." };
  if (authError) return { error: safeError(authError.message) };
  const supabase = await createClient();
  const { error: roleError } = await supabase.rpc("admin_update_user_role", { p_target_id: value.user_id, p_role: value.role });
  if (roleError) return { error: roleError.message.includes("admin") ? roleError.message : "Gagal memperbarui role pengguna." };
  await admin.from("admin_audit_log").insert({ actor_id: actor.userId, target_user_id: value.user_id, action: "update_profile", metadata: { password_changed: Boolean(value.password) } });
  console.info("admin.user.update", { ms: Math.round(performance.now() - started), password_changed: Boolean(value.password) });
  revalidatePath("/admin/users"); revalidatePath("/admin/dashboard"); redirect("/admin/users");
}

export async function toggleUserStatus(userId: string, makeActive: boolean): Promise<UserActionState> {
  const actor = await requireRole("admin");
  if (userId === actor.userId && !makeActive) return { error: "Admin tidak dapat menonaktifkan akun sendiri." };
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return { error: "ID pengguna tidak valid." };
  let admin;
  try { admin = createAdminClient(); } catch { return { error: "Layanan pengelolaan akun belum dikonfigurasi." }; }
  const supabase = await createClient();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, { ban_duration: makeActive ? "none" : "876000h" });
  if (authError) return { error: "Gagal mengubah akses login pengguna." };
  const { error } = await supabase.rpc("admin_set_user_status", { p_target_id: userId, p_active: makeActive });
  if (error) {
    await admin.auth.admin.updateUserById(userId, { ban_duration: makeActive ? "876000h" : "none" });
    return { error: error.message.includes("admin") ? error.message : "Gagal mengubah status pengguna." };
  }
  revalidatePath("/admin/users"); revalidatePath("/admin/dashboard");
  return { message: makeActive ? "Akun diaktifkan." : "Akun dinonaktifkan." };
}
