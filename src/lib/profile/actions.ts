"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth/roles";

export type ProfileState = { error?: string; message?: string };

export async function updateDisplayName(_previous: ProfileState, form: FormData): Promise<ProfileState> {
  const current = await getCurrentRole();
  if (!current) return { error: "Sesi tidak valid. Silakan masuk kembali." };
  const { userId, role } = current;
  const name = String(form.get("display_name") ?? "").trim();
  if (name.length > 100) return { error: "Nama maksimal 100 karakter." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", userId);
  if (error) return { error: "Gagal memperbarui profil. Coba lagi." };
  revalidatePath(role === "admin" ? "/admin/profile" : "/profil");
  revalidatePath(role === "admin" ? "/admin/dashboard" : "/dashboard");
  return { message: "Nama berhasil diperbarui." };
}
