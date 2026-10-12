"use client";

import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { saveGame, type QuizActionState } from "@/lib/quiz/game-actions";

type Game = { id?: string; title?: string; slug?: string; description?: string; game_type?: string };
export function GameForm({ game = {} }: { game?: Game }) {
 const [state, action, pending] = useActionState(saveGame, {} as QuizActionState);
 return <form action={action} className="admin-form card">
  {game.id && <input type="hidden" name="id" value={game.id}/>} 
  <label>Judul<input name="title" required maxLength={200} defaultValue={game.title}/></label>
  <label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={game.slug}/><small>Contoh: kuis-hipertensi</small></label>
  <label>Jenis<select name="game_type" defaultValue={game.game_type ?? "quiz"}><option value="quiz">Kuis</option><option value="myth_fact">Mitos / Fakta</option><option value="challenge">Tantangan</option><option value="daily">Harian</option></select></label>
  <label>Deskripsi<textarea name="description" maxLength={2000} rows={5} defaultValue={game.description}/></label>
  {state.error && <p className="form-error" role="alert">{state.error}</p>}
  <button className="auth-button" disabled={pending}>{pending?<LoaderCircle className="animate-spin"/>:<Save/>}{pending?"Menyimpan…":"Simpan game"}</button>
 </form>;
}
