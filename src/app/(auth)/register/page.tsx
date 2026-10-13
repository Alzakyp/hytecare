import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";
import { registerPatient } from "@/lib/auth/actions";
import { registrationEnabled } from "@/lib/auth/helpers.js";

export default function RegisterPage() {
  const enabled = registrationEnabled({ ENABLE_REGISTRATION: process.env.ENABLE_REGISTRATION });
  if (!enabled) return <AuthCard title="Pendaftaran belum tersedia"><p>Pendaftaran mandiri belum dibuka. Hubungi pengelola untuk informasi akses.</p></AuthCard>;
  return <AuthCard title="Daftar pasien"><p className="mb-7 text-slate-700">Daftar sebagai pasien. Nama, nomor HP, serta riwayat tekanan darah dapat diakses petugas RS untuk tindak lanjut.</p>
    <AuthForm action={registerPatient} submitLabel="Daftar" mode="register" />
    <Link className="mt-6 inline-block text-sm underline" href="/login">Sudah punya akun? Masuk</Link>
  </AuthCard>;
}
