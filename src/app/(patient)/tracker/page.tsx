import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { classifyBloodPressure } from "@/lib/blood-pressure/classifier.js";

export default async function TrackerPage() {
  const { userId } = await requireRole("patient"); const client = await createClient();
  const { data: readings, error } = await client.from("blood_pressure_readings").select("id,systolic,diastolic,heart_rate,measured_at,notes").eq("user_id", userId).order("measured_at", { ascending: false });
  return <section className="page-enter"><div className="page-title-row"><div><p className="dashboard-eyebrow">RIWAYAT PRIBADI</p><h1 className="text-3xl font-bold mt-2">Catatan</h1></div><Link href="/tracker/new" className="new-reading-button"><Plus size={20} aria-hidden="true" />Catat</Link></div>
    {error ? <div className="card mt-6" role="alert"><p>Catatan belum dapat dimuat.</p><Link className="inline-block mt-3 underline" href="/tracker">Coba lagi</Link></div>
      : !readings?.length ? <div className="tracker-empty mt-7"><span><Plus size={28} aria-hidden="true" /></span><h2>Belum ada catatan</h2><p>Tambahkan pengukuran pertama Anda untuk melihat riwayat di sini.</p><Link href="/tracker/new" className="dashboard-link">Catat tekanan darah</Link></div>
      : <div className="history-list mt-6">{readings.map((r) => { const category=classifyBloodPressure(r.systolic,r.diastolic); return <article className="history-card" key={r.id}><div><p className="history-reading">{r.systolic}<span>/</span>{r.diastolic} <small>mmHg</small></p><p className={`category-badge category-${category.tone}`}>{category.label}</p></div><div className="history-time"><time>{new Intl.DateTimeFormat("id-ID", { dateStyle:"medium", timeStyle:"short", timeZone:"Asia/Jakarta" }).format(new Date(r.measured_at))}</time>{r.heart_rate && <span>{r.heart_rate} bpm</span>}{r.notes?.includes("Contoh data") && <span>Data demo</span>}</div></article>; })}</div>}
  </section>;
}
