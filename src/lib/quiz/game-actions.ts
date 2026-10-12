"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { validateGameInput } from "./validation.js";

export type QuizActionState = { error?: string; message?: string };

export async function saveGame(_previous: QuizActionState, form: FormData): Promise<QuizActionState> {
  await requireRole("admin");
  const parsed = validateGameInput(Object.fromEntries(form));
  if (!parsed.ok) return { error: parsed.error };
  const id = String(form.get("id") ?? "");
  if (id && !/^[0-9a-f-]{36}$/i.test(id)) return { error: "ID game tidak valid." };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("quiz_games").update(parsed.value).eq("id", id).is("archived_at", null).select("id").single()
    : await supabase.from("quiz_games").insert(parsed.value).select("id").single();
  if (error) return { error: error.code === "23505" ? "Slug sudah digunakan." : "Gagal menyimpan game. Coba lagi." };
  revalidatePath("/admin/games");
  redirect("/admin/games");
}

export async function toggleGameStatus(id: string, makeActive: boolean): Promise<QuizActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.from("quiz_games").update({ is_active: makeActive }).eq("id", id).is("archived_at", null).select("id").single();
  if (error || !data) return { error: makeActive ? "Game harus memiliki minimal satu soal aktif." : "Gagal mengubah status game." };
  revalidatePath("/admin/games");
  return { message: makeActive ? "Game diaktifkan." : "Game dinonaktifkan." };
}

export async function archiveGame(id: string): Promise<QuizActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.from("quiz_games").update({ is_active: false, archived_at: new Date().toISOString() }).eq("id", id).is("archived_at", null).select("id").single();
  if (error || !data) return { error: "Gagal mengarsipkan game." };
  revalidatePath("/admin/games");
  return { message: "Game diarsipkan." };
}
