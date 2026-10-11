import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";
import { updatePassword } from "@/lib/auth/actions";

export default function ResetPasswordPage() {
  return <AuthCard title="Buat kata sandi baru"><p className="mb-7 text-slate-700">Tentukan kata sandi baru untuk melanjutkan.</p>
    <AuthForm action={updatePassword} submitLabel="Simpan kata sandi" mode="reset" />
  </AuthCard>;
}
