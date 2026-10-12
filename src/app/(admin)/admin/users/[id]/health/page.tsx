import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, HeartPulse } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { classifyBloodPressure } from "@/lib/blood-pressure/classifier.js";
import { phoneHref } from "@/lib/profile/phone.js";

export default async function PatientHealthPage({params}:{params:Promise<{id:string}>}){
 await requireRole("admin");const {id}=await params,client=await createClient();
 const [{data:profile},{data:role},{error}]=await Promise.all([client.from("profiles").select("display_name,phone_number").eq("id",id).single(),client.from("user_roles").select("role").eq("user_id",id).single(),client.rpc("admin_record_health_view",{p_target_id:id})]);
 if(error||!profile||role?.role!=="patient")notFound();
 const {data:readings}=await client.from("blood_pressure_readings").select("systolic,diastolic,heart_rate,measured_at,notes").eq("user_id",id).order("measured_at",{ascending:false}).limit(100);
 const tel=phoneHref(profile.phone_number);
 return <section><Link href="/admin/users" className="text-sm text-[var(--teal)]">← Daftar pengguna</Link><div className="card mt-5"><div className="flex items-start justify-between gap-4"><div><p className="dashboard-eyebrow">REKAM MEDIS PASIEN</p><h1 className="text-2xl font-bold mt-1">{profile.display_name||"Pasien"}</h1><p className="text-[var(--ink-muted)]">{profile.phone_number||"Nomor HP belum diisi"}</p></div>{tel&&<a href={tel} className="dashboard-link"><Phone size={18}/>Hubungi pasien</a>}</div><p className="dashboard-note mt-5">Akses ini dicatat. Informasi untuk tindak lanjut petugas RS; bukan pemantauan darurat 24 jam.</p></div><div className="mt-5 grid gap-3">{readings?.length?readings.map(r=>{const c=classifyBloodPressure(r.systolic,r.diastolic);return <article key={r.measured_at} className="history-card"><div><p className="history-reading">{r.systolic}<span>/</span>{r.diastolic}<small> mmHg</small></p><span className={`category-badge category-${c.tone}`}>{c.label}</span>{r.notes&&<p className="text-sm mt-2">Catatan: {r.notes}</p>}</div><div className="history-time"><HeartPulse size={16}/><span>{new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Jakarta"}).format(new Date(r.measured_at))}</span>{r.heart_rate&&<span>Nadi {r.heart_rate} bpm</span>}</div></article>}):<div className="card text-[var(--ink-muted)]">Belum ada riwayat pengukuran.</div>}</div></section>;
}
