import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { GameBoard } from "@/components/games/game-board";

export default async function GameDetailPage({params}:{params:Promise<{slug:string}>}){
 await requireRole('patient');const {slug}=await params;
 const {data:game}=await(await createClient()).rpc('patient_game',{p_slug:slug});
 if(!game)notFound();
 return <section><Link href="/game" className="text-sm text-[var(--teal)]">← Daftar kuis</Link><h1 className="text-2xl font-bold mt-3">{game.title}</h1><p className="text-sm text-[var(--ink-muted)] mb-6">{game.description}</p><GameBoard game={game}/></section>;
}
