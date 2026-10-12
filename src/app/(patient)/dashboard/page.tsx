import Link from "next/link";
import { Activity, ArrowUpRight, HeartPulse, Puzzle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";

export default async function PatientDashboard() {
  const { userId } = await requireRole("patient");
  const client = await createClient();
  const { data: readings, error } = await client.from("blood_pressure_readings")
    .select("systolic,diastolic,measured_at,notes").eq("user_id", userId)
    .order("measured_at", { ascending: false }).limit(1);
  const latest = readings?.[0];
  return <div className="page-enter">
    <p className="dashboard-eyebrow">RUANG KESEHATAN ANDA</p>
    <h1 className="text-3xl font-bold mt-2">Selamat datang</h1>
    <p className="mt-2 text-slate-600">Pantau catatan Anda, satu langkah setiap hari.</p>
    <section className="measurement-card mt-7" aria-labelledby="measurement-title">
      <div className="flex items-center gap-3"><span className="icon-tile"><HeartPulse aria-hidden="true" size={24}/></span><h2 id="measurement-title" className="font-semibold">Pengukuran terakhir</h2></div>
      {error ? <div className="mt-5"><p role="alert">Catatan belum dapat dimuat.</p><Link href="/dashboard" className="inline-flex min-h-11 items-center underline">Coba lagi</Link></div>
        : latest ? <div className="mt-6"><p className="reading-value">{latest.systolic}<span>/</span>{latest.diastolic}<small> mmHg</small></p><p className="mt-3 text-sm">{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(latest.measured_at))}</p>{latest.notes?.includes("Contoh data") && <p className="mt-3 text-sm font-semibold">Contoh data — bukan hasil pengukuran nyata</p>}</div>
        : <div className="mt-6"><h3 className="text-xl font-bold">Belum ada catatan tekanan darah</h3><p className="mt-2 text-slate-600">Pengukuran Anda akan tampil di sini setelah tersimpan.</p></div>}
      <Link href="/tracker" className="dashboard-link mt-6">Lihat catatan <ArrowUpRight aria-hidden="true" size={20}/></Link>
    </section>
    <div className="dashboard-shortcuts mt-5">
      <Link href="/tracker" className="card shortcut"><Activity aria-hidden="true" size={24}/><h2>Catatan Anda</h2><p>Riwayat pengukuran</p><ArrowUpRight aria-hidden="true" size={18}/></Link>
      <Link href="/game" className="card shortcut"><Puzzle aria-hidden="true" size={24}/><h2>Kuis</h2><p>Jelajahi permainan</p><ArrowUpRight aria-hidden="true" size={18}/></Link>
    </div>
    <p className="dashboard-note mt-6"><ShieldCheck aria-hidden="true" size={20}/><span>Catatan hanya untuk Anda. Angka bukan diagnosis; konsultasikan hasil dengan tenaga kesehatan.</span></p>
  </div>;
}
