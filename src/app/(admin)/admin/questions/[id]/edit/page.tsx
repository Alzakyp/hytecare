import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { QuestionForm } from "@/components/admin/question-form";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: question }, { data: games }] = await Promise.all([
    supabase.rpc("admin_get_question", { p_question_id: id }),
    supabase.from("quiz_games").select("id,title").is("archived_at", null).order("title"),
  ]);
  if (!question || question.archived_at) notFound();
  return <section>
    <Link href="/admin/questions" className="text-sm text-[var(--teal)]">← Kembali ke bank soal</Link>
    <h1 className="my-5 text-2xl font-bold">Edit Soal</h1>
    <QuestionForm question={question} games={games ?? []} />
  </section>;
}
