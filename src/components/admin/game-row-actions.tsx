"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Archive, Edit, Power } from "lucide-react";
import { archiveGame, toggleGameStatus } from "@/lib/quiz/game-actions";

export function GameRowActions({ game }: { game: { id: string; title: string; is_active: boolean } }) {
  const [pending, start] = useTransition();

  return (
    <div className="admin-actions">
      <Link href={`/admin/games/${game.id}/edit`}><Edit size={16}/> Edit</Link>
      <button
        disabled={pending}
        onClick={() => start(async () => {
          const res = await toggleGameStatus(game.id, !game.is_active);
          if (res.error) alert(res.error);
        })}
      >
        <Power size={16}/> {game.is_active ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <button
        className="danger"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Arsipkan game "${game.title}"?`)) return;
          start(async () => {
            const res = await archiveGame(game.id);
            if (res.error) alert(res.error);
          });
        }}
      >
        <Archive size={16}/> Arsipkan
      </button>
    </div>
  );
}
