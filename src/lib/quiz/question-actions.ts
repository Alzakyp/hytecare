"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { validateQuestionInput } from "./validation.js";
import type { QuizActionState } from "./game-actions";

export async function saveQuestion(_previous: QuizActionState, form: FormData): Promise<QuizActionState> {
  await requireRole("admin");
  let options: unknown;
  try { options = JSON.parse(String(form.get("options") ?? "[]")); } catch { return { error: "Opsi tidak valid." }; }
  const input = { ...Object.fromEntries(form), options };
  const parsed = validateQuestionInput(input);
  if (!parsed.ok) return { error: parsed.error };
  const id = String(form.get("id") ?? "") || null;
  if (id && !/^[0-9a-f-]{36}$/i.test(id)) return { error: "ID soal tidak valid." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_save_question", {
    p_question_id: id, p_game_id: parsed.value.game_id, p_prompt: parsed.value.prompt,
    p_explanation: parsed.value.explanation, p_sort_order: parsed.value.sort_order,
    p_is_active: form.get("is_active") === "on", p_options: parsed.value.options,
  });
  if (error || !data) return { error: error?.message.includes("tepat satu") ? "Pilih tepat satu jawaban benar." : "Gagal menyimpan soal. Periksa status game dan riwayat attempt." };
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${data}/edit`);
  redirect("/admin/questions");
}

export async function toggleQuestionStatus(id: string, makeActive: boolean): Promise<QuizActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.from("quiz_questions").update({ is_active: makeActive }).eq("id", id).is("archived_at", null).select("id").single();
  if (error || !data) return { error: makeActive ? "Soal harus memiliki minimal dua opsi dengan satu jawaban benar." : "Gagal mengubah status soal." };
  revalidatePath("/admin/questions");
  return { message: makeActive ? "Soal diaktifkan." : "Soal dinonaktifkan." };
}

export async function archiveQuestion(id: string): Promise<QuizActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.from("quiz_questions").update({ is_active: false, archived_at: new Date().toISOString() }).eq("id", id).is("archived_at", null).select("id").single();
  if (error || !data) return { error: "Gagal mengarsipkan soal." };
  revalidatePath("/admin/questions");
  return { message: "Soal diarsipkan." };
}
