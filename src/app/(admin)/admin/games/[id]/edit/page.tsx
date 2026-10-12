import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { GameForm } from "@/components/admin/game-form";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();
  const { data: game } = await supabase.from("quiz_games").select("id,title,slug,description,game_type").eq("id", id).is("archived_at", null).single();
  if (!game) notFound();
  return <section><Link href="/admin/games" className="text-sm text-[var(--teal)]">← Kembali ke daftar game</Link><h1 className="my-5 text-2xl font-bold">Edit Game</h1><GameForm game={game} /></section>;
}
