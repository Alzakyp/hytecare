import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { QuestionForm } from "@/components/admin/question-form";

export default async function NewQuestionPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: games } = await supabase.from("quiz_games").select("id,title").is("archived_at", null).order("title");
  return <section>
    <Link href="/admin/questions" className="text-sm text-[var(--teal)]">← Kembali ke bank soal</Link>
    <h1 className="my-5 text-2xl font-bold">Tambah Soal</h1>
    {!games?.length ? <p className="form-error">Buat game terlebih dahulu sebelum menambah soal.</p> : <QuestionForm games={games} />}
  </section>;
}
