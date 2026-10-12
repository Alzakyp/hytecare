import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { GameRowActions } from "@/components/admin/game-row-actions";

export default async function AdminGamesPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("quiz_games")
    .select("id,slug,title,game_type,is_active,archived_at")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Game</h1>
          <p className="text-sm text-[var(--ink-muted)]">Katalog permainan edukasi dan kuis pasien.</p>
        </div>
        <Link href="/admin/games/new" className="new-reading-button"><Plus size={18}/> Tambah game</Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Judul</th><th>Slug</th><th>Jenis</th><th>Status</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(games ?? []).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-[var(--ink-muted)]">Belum ada game kuis.</td></tr>
            ) : (
              (games ?? []).map((g) => (
                <tr key={g.id}>
                  <td className="font-bold">{g.title}</td>
                  <td><code>{g.slug}</code></td>
                  <td>{g.game_type}</td>
                  <td><span className="admin-status">{g.is_active ? "Aktif" : "Draf"}</span></td>
                  <td><GameRowActions game={g} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
