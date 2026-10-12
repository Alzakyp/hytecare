import Link from "next/link";
import { Activity, ArrowRight, HeartPulse, PhoneCall, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { ReadingState } from "@/lib/blood-pressure/actions";

type Result = NonNullable<ReadingState["result"]>;

export function BloodPressureResultCard({ result }: { result: Result }) {
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(result.measured_at));
  return <section className="result-card" aria-labelledby="result-title" aria-live="polite">
    <div className="result-head"><span className="result-head-icon"><CheckCircle2 size={20} aria-hidden="true" /></span><span>Pengukuran tersimpan</span></div>
    <div className="result-body">
      <p className="result-overline">RINGKASAN HASIL</p>
      <h2 id="result-title" className="result-reading">{result.systolic}<span>/</span>{result.diastolic}<small> mmHg</small></h2>
      <p className={`category-badge category-${result.category.tone}`}><Activity size={16} aria-hidden="true" />{result.category.label}</p>
      <div className="result-meta"><span>{date}</span>{result.heart_rate && <span><HeartPulse size={16} aria-hidden="true" />{result.heart_rate} bpm</span>}</div>
    </div>
    <div className="result-guidance"><h3><ShieldAlert size={20} aria-hidden="true" />{result.guidance.title}</h3><p>{result.guidance.message}</p>
      {result.guidance.showEmergencyCall && <a className="emergency-call" href="tel:03414372409"><PhoneCall size={20} aria-hidden="true" />Hubungi RSUB — 0341 4372409</a>}
    </div>
    <p className="result-disclaimer">Kategori ini hanya ringkasan satu pengukuran berdasarkan KMK 303/2026 untuk pengukuran klinik; bukan diagnosis. Konsultasikan hasil dengan tenaga kesehatan.</p>
    <Link className="result-back" href="/tracker">Lihat riwayat <ArrowRight size={18} aria-hidden="true" /></Link>
  </section>;
}
