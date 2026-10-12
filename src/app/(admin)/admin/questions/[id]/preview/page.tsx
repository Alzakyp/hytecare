import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";

export default async function PreviewQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();
  const { data: question } = await supabase.rpc("admin_get_question", { p_question_id: id });
  if (!question || question.archived_at) notFound();
  return <section className="max-w-2xl">
    <Link href={`/admin/questions/${id}/edit`} className="text-sm text-[var(--teal)]">← Kembali edit soal</Link>
    <div className="card mt-5">
      <p className="dashboard-eyebrow flex items-center gap-2"><Eye size={15} /> PREVIEW ADMIN</p>
      <h1 className="mt-3 text-2xl font-bold">{question.prompt}</h1>
      <div className="mt-6 grid gap-3">
        {question.options.map((option: { id: string; label: string; is_correct: boolean }, index: number) => (
          <div key={option.id} className="rounded-xl border border-[var(--border)] p-4 flex justify-between gap-3">
            <span>{String.fromCharCode(65 + index)}. {option.label}</span>
            {option.is_correct && <strong className="text-[var(--teal)]">Jawaban benar</strong>}
          </div>
        ))}
      </div>
      {question.explanation && <div className="dashboard-note mt-6"><strong>Penjelasan:</strong> {question.explanation}</div>}
      <p className="mt-5 text-sm text-[var(--ink-muted)]">Kunci dan penjelasan ini hanya terlihat oleh admin; pasien menerimanya setelah jawaban diproses.</p>
    </div>
  </section>;
}
