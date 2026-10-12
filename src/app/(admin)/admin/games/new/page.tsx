import Link from "next/link";
import { GameForm } from "@/components/admin/game-form";

export default function NewGamePage() {
  return <section><Link href="/admin/games" className="text-sm text-[var(--teal)]">← Kembali ke daftar game</Link><h1 className="my-5 text-2xl font-bold">Tambah Game</h1><GameForm /></section>;
}
