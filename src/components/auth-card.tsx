import Link from "next/link";
import { HeartPulse } from "lucide-react";

export function AuthCard({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return <main className="auth-page"><section className="auth-card" aria-labelledby="page-title">
    <div className="flex items-center gap-3 text-teal-900"><HeartPulse aria-hidden="true" size={32}/><span className="font-bold text-xl">HyteCare</span></div>
    <h1 id="page-title" className="text-3xl font-bold mt-8 mb-2">{title}</h1>
    {children}
    <p className="mt-8 text-sm leading-6">HyteCare adalah alat pencatatan dan edukasi, bukan diagnosis atau pengganti konsultasi tenaga kesehatan.</p>
    <Link className="mt-5 inline-block text-teal-900 underline" href="/login">Kembali ke masuk</Link>
  </section></main>;
}
