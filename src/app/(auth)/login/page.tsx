import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "@/lib/auth/actions";
import { registrationEnabled } from "@/lib/auth/helpers.js";

export default function LoginPage() {
  return <AuthCard title="Masuk ke akun"><p className="mb-7 text-slate-700">Kelola catatan dan materi edukasi Anda.</p>
    <AuthForm action={signIn} submitLabel="Masuk" mode="login" />
    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm"><Link className="underline" href="/forgot-password">Lupa kata sandi?</Link>{registrationEnabled({ ENABLE_REGISTRATION: process.env.ENABLE_REGISTRATION }) && <Link className="underline" href="/register">Daftar pasien</Link>}</div>
  </AuthCard>;
}
