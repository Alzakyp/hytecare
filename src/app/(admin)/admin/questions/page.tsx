import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { QuestionRowActions } from "@/components/admin/question-row-actions";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  await requireRole("admin");
  const { game } = await searchParams;
  const supabase = await createClient();

  const { data: games } = await supabase
    .from("quiz_games")
    .select("id,title")
    .is("archived_at", null)
    .order("title");

  let query = supabase
    .from("quiz_questions")
    .select("id,game_id,prompt,sort_order,is_active,quiz_games(title)")
    .is("archived_at", null)
    .order("sort_order", { ascending: true });

  if (game) query = query.eq("game_id", game);
  const { data: questions } = await query;

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1 className="text-2xl font-bold">Bank Soal Kuis</h1>
          <p className="text-sm text-[var(--ink-muted)]">Kelola butir pertanyaan, kunci jawaban, dan penjelasan.</p>
        </div>
        <Link href="/admin/questions/new" className="new-reading-button">
          <Plus size={18} /> Tambah soal
        </Link>
      </div>

      <div className="my-5 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-bold">Filter Game:</span>
        <Link
          href="/admin/questions"
          className={`px-3 py-1.5 rounded-lg text-sm border ${
            !game ? "bg-[var(--teal)] text-white border-[var(--teal)]" : "bg-white text-[var(--ink)]"
          }`}
        >
          Semua
        </Link>
        {(games ?? []).map((g) => (
          <Link
            key={g.id}
            href={`/admin/questions?game=${g.id}`}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              game === g.id ? "bg-[var(--teal)] text-white border-[var(--teal)]" : "bg-white text-[var(--ink)]"
            }`}
          >
            {g.title}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Soal</th>
              <th>Game</th>
              <th>Urutan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(questions ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-[var(--ink-muted)]">
                  Belum ada soal kuis yang tersimpan.
                </td>
              </tr>
            ) : (
              (questions ?? []).map((q) => {
                const gameTitle = Array.isArray(q.quiz_games)
                  ? q.quiz_games[0]?.title
                  : (q.quiz_games as { title?: string } | null)?.title ?? "-";
                return (
                  <tr key={q.id}>
                    <td className="max-w-md font-medium">{q.prompt}</td>
                    <td>{gameTitle}</td>
                    <td>{q.sort_order}</td>
                    <td>
                      <span className="admin-status">{q.is_active ? "Aktif" : "Draf"}</span>
                    </td>
                    <td>
                      <QuestionRowActions question={q} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
