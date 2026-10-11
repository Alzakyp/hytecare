import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";
import { requestPasswordReset } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  return <AuthCard title="Atur ulang kata sandi"><p className="mb-7 text-slate-700">Tautan pemulihan akan dikirim jika email terdaftar.</p>
    <AuthForm action={requestPasswordReset} submitLabel="Kirim tautan" mode="forgot" />
    <Link className="mt-6 inline-block text-sm underline" href="/login">Batal dan kembali</Link>
  </AuthCard>;
}
