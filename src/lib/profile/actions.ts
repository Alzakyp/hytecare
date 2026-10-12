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
  const rawPhone = String(form.get("phone_number") ?? "").trim();
  const phone = rawPhone ? rawPhone.replace(/[\s()-]/g, "") : null;
  if (name.length > 100) return { error: "Nama maksimal 100 karakter." };
  if (phone && !/^\+?[0-9]{9,16}$/.test(phone)) return { error: "Nomor handphone tidak valid (gunakan 9-16 digit angka)." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ display_name: name, phone_number: phone }).eq("id", userId);
  if (error) return { error: "Gagal memperbarui profil. Coba lagi." };
  revalidatePath(role === "admin" ? "/admin/profile" : "/profil");
  revalidatePath(role === "admin" ? "/admin/dashboard" : "/dashboard");
  return { message: "Nama berhasil diperbarui." };
}
