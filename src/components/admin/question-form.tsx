"use client";

import { useState, useActionState } from "react";
import { LoaderCircle, Plus, Trash2, Save } from "lucide-react";
import { saveQuestion } from "@/lib/quiz/question-actions";
import type { QuizActionState } from "@/lib/quiz/game-actions";

type Option = { id?: string | null; label: string; is_correct: boolean; sort_order?: number };
type Question = { id?: string; game_id?: string; prompt?: string; explanation?: string; sort_order?: number; is_active?: boolean; options?: Option[] };
type Game = { id: string; title: string };

export function QuestionForm({ question = {}, games = [] }: { question?: Question; games?: Game[] }) {
  const [options, setOptions] = useState<Option[]>(
    (question.options && question.options.length >= 2)
      ? question.options
      : [
          { label: "", is_correct: true, sort_order: 0 },
          { label: "", is_correct: false, sort_order: 1 },
        ]
  );
  const [state, action, pending] = useActionState(saveQuestion, {} as QuizActionState);

  const setCorrect = (index: number) => {
    setOptions(options.map((opt, i) => ({ ...opt, is_correct: i === index })));
  };

  const updateLabel = (index: number, label: string) => {
    setOptions(options.map((opt, i) => (i === index ? { ...opt, label } : opt)));
  };

  const addOption = () => {
    setOptions([...options, { label: "", is_correct: false, sort_order: options.length }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== index);
    if (!next.some((o) => o.is_correct) && next.length > 0) next[0].is_correct = true;
    setOptions(next);
  };

  return (
    <form action={action} className="admin-form card">
      {question.id && <input type="hidden" name="id" value={question.id} />}
      <input type="hidden" name="options" value={JSON.stringify(options)} />

      <label>
        Pilih Game
        <select name="game_id" defaultValue={question.game_id ?? games[0]?.id} required>
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
      </label>

      <label>
        Pertanyaan / Soal
        <textarea name="prompt" required maxLength={2000} rows={4} defaultValue={question.prompt} />
      </label>

      <label>
        Penjelasan Jawaban (hanya setelah submit)
        <textarea name="explanation" maxLength={4000} rows={3} defaultValue={question.explanation} />
      </label>

      <label>
        Urutan Tampil
        <input name="sort_order" type="number" min={0} max={10000} defaultValue={question.sort_order ?? 0} />
      </label>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Pilihan Jawaban (minimal 2, tepat satu benar)</span>
          <button type="button" onClick={addOption} className="text-sm font-bold text-[var(--teal)] inline-flex items-center gap-1">
            <Plus size={16} /> Tambah opsi
          </button>
        </div>

        <div className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct_radio"
                checked={opt.is_correct}
                onChange={() => setCorrect(i)}
                className="w-5 h-5 accent-[var(--teal)] cursor-pointer"
                title="Pilih sebagai kunci jawaban benar"
              />
              <input
                type="text"
                required
                maxLength={500}
                value={opt.label}
                onChange={(e) => updateLabel(i, e.target.value)}
                placeholder={`Pilihan ${i + 1}`}
                className="flex-1"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="p-2 text-red-700 hover:bg-red-50 rounded-lg"
                  title="Hapus opsi"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer mt-2">
        <input type="checkbox" name="is_active" defaultChecked={question.is_active} className="w-5 h-5 accent-[var(--teal)]" />
        <span>Aktifkan langsung soal ini</span>
      </label>

      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <button className="auth-button" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Save />}
        {pending ? "Menyimpan…" : "Simpan soal"}
      </button>
    </form>
  );
}
