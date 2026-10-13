import Link from "next/link";
import { Activity, ArrowUpRight, HeartPulse, Plus, Puzzle, ShieldCheck } from "lucide-react";
import { classifyBloodPressure } from "@/lib/blood-pressure/classifier.js";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { jakartaDateKey } from "@/lib/medications/validation.js";
import { MedicationCards } from "@/components/medication-cards";
import { MeasurementCalendar } from "@/components/measurement-calendar";

export default async function PatientDashboard() {
 const {userId}=await requireRole("patient"),client=await createClient(),now=new Date(),month=jakartaDateKey(now).slice(0,7),start=`${month}-01T00:00:00+07:00`,end=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),1)-7*60*60*1000).toISOString();
 const [{data:readings,error},{data:monthReadings},{data:logs}]=await Promise.all([
  client.from("blood_pressure_readings").select("systolic,diastolic,measured_at,notes").eq("user_id",userId).order("measured_at",{ascending:false}).limit(1),
  client.from("blood_pressure_readings").select("measured_at").eq("user_id",userId).gte("measured_at",start).lt("measured_at",end),
  client.from("medication_logs").select("medication_name").eq("user_id",userId).eq("intake_date",jakartaDateKey()),
 ]);
 const latest=readings?.[0],dates=(monthReadings??[]).map(r=>jakartaDateKey(new Date(r.measured_at))),taken=(logs??[]).map(l=>l.medication_name);
 return <div className="page-enter dashboard-redesign"><p className="dashboard-eyebrow dashboard-stagger dashboard-stagger-1">RUANG KESEHATAN ANDA</p><h1 className="text-3xl font-bold mt-2 dashboard-stagger dashboard-stagger-1">Selamat datang</h1><p className="mt-2 text-slate-600">Pantau catatan Anda, satu langkah setiap hari.</p>
 <section className="measurement-card mt-7 dashboard-stagger dashboard-stagger-2" aria-labelledby="measurement-title"><div className="flex items-center gap-3"><span className="icon-tile"><HeartPulse aria-hidden="true" size={24}/></span><h2 id="measurement-title" className="font-semibold">Pengukuran terakhir</h2></div>{error?<div className="mt-5"><p role="alert">Catatan belum dapat dimuat.</p><Link href="/dashboard" className="inline-flex min-h-11 items-center underline">Coba lagi</Link></div>:latest?<div className="mt-6"><p className="reading-value">{latest.systolic}<span>/</span>{latest.diastolic}<small> mmHg</small></p><p className={`category-badge category-${classifyBloodPressure(latest.systolic,latest.diastolic).tone}`}>{classifyBloodPressure(latest.systolic,latest.diastolic).label}</p><p className="mt-3 text-sm">{new Intl.DateTimeFormat("id-ID",{dateStyle:"long",timeStyle:"short",timeZone:"Asia/Jakarta"}).format(new Date(latest.measured_at))}</p></div>:<div className="mt-6"><h3 className="text-xl font-bold">Belum ada catatan tekanan darah</h3><p className="mt-2 text-slate-600">Pengukuran Anda akan tampil di sini setelah tersimpan.</p></div>}<div className="flex flex-wrap gap-3 mt-6"><Link href="/tracker/new" className="dashboard-link"><Plus size={20}/>Catat tekanan darah</Link><Link href="/tracker" className="secondary-link">Riwayat <ArrowUpRight size={20}/></Link></div></section>
 <div className="dashboard-stagger dashboard-stagger-3"><MeasurementCalendar month={month} dates={dates} today={jakartaDateKey(now)}/></div><div className="dashboard-stagger dashboard-stagger-4"><MedicationCards taken={taken}/></div><div className="dashboard-shortcuts mt-5 dashboard-stagger dashboard-stagger-4"><Link href="/tracker" className="card shortcut"><Activity size={24}/><h2>Catatan Anda</h2><p>Riwayat pengukuran</p><ArrowUpRight size={18}/></Link><Link href="/game" className="card shortcut"><Puzzle size={24}/><h2>Kuis</h2><p>Jelajahi permainan</p><ArrowUpRight size={18}/></Link></div><p className="dashboard-note mt-6"><ShieldCheck size={20}/><span>Petugas RS dapat melihat catatan Anda untuk tindak lanjut. Angka bukan diagnosis; konsultasikan hasil dengan tenaga kesehatan.</span></p></div>;
}
