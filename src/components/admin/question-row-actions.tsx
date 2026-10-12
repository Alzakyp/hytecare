"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Archive, Edit, Eye, Power } from "lucide-react";
import { archiveQuestion, toggleQuestionStatus } from "@/lib/quiz/question-actions";

export function QuestionRowActions({ question }: { question: { id: string; prompt: string; is_active: boolean } }) {
  const [pending, start] = useTransition();

  return (
    <div className="admin-actions">
      <Link href={`/admin/questions/${question.id}/edit`}><Edit size={16}/> Edit</Link>
      <Link href={`/admin/questions/${question.id}/preview`}><Eye size={16}/> Preview</Link>
      <button
        disabled={pending}
        onClick={() => start(async () => {
          const res = await toggleQuestionStatus(question.id, !question.is_active);
          if (res.error) alert(res.error);
        })}
      >
        <Power size={16}/> {question.is_active ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <button
        className="danger"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Arsipkan soal "${question.prompt.slice(0, 60)}"?`)) return;
          start(async () => {
            const res = await archiveQuestion(question.id);
            if (res.error) alert(res.error);
          });
        }}
      >
        <Archive size={16}/> Arsipkan
      </button>
    </div>
  );
}
