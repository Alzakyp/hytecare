"use client";

import { useActionState } from "react";
import { type FormState } from "@/lib/auth/actions";

type Props = {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  submitLabel: string;
  mode: "login" | "register" | "forgot" | "reset";
};

export function AuthForm({ action, submitLabel, mode }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5">
      {mode !== "reset" && (
        <div>
          <label htmlFor="email" className="block font-medium mb-2">Email</label>
          <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className="auth-input" />
        </div>
      )}
      {mode !== "forgot" && (
        <div>
          <label htmlFor="password" className="block font-medium mb-2">Kata sandi</label>
          <input id="password" name="password" type="password" required minLength={mode === "login" ? 1 : 12} maxLength={128}
            autoComplete={mode === "login" ? "current-password" : "new-password"} className="auth-input" />
          {mode !== "login" && <p className="mt-2 text-sm">Minimal 12 karakter. Pengelola kata sandi dapat digunakan.</p>}
        </div>
      )}
      {state.error && <p role="alert" className="text-red-800">{state.error}</p>}
      {state.message && <p role="status" className="text-teal-900">{state.message}</p>}
      <button type="submit" disabled={pending} className="auth-button w-full" aria-busy={pending}>
        {pending ? "Memproses…" : submitLabel}
      </button>
    </form>
  );
}
