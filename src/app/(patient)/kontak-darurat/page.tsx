import Link from "next/link";
import { ArrowLeft, PhoneCall, ShieldAlert } from "lucide-react";

export default function EmergencyCallPage() {
  return <section className="page-enter">
    <div className="flex items-center gap-3 mb-6"><Link href="/lainnya" className="inline-flex min-h-11 items-center gap-1 font-bold"><ArrowLeft size={20} aria-hidden="true" />Kembali</Link></div>
    <div className="emergency-hero"><span className="emergency-icon"><ShieldAlert size={36} aria-hidden="true" /></span><h1 className="text-3xl font-bold mt-3">Emergency Call</h1><p className="mt-2 text-slate-600">Panggilan darurat rumah sakit untuk situasi mendesak.</p></div>
    <div className="card mt-6">
      <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Rumah Sakit Rujukan</p>
      <h2 className="text-xl font-bold mt-1">Rumah Sakit Universitas Brawijaya (RSUB)</h2>
      <p className="mt-2 text-slate-600 text-sm">Nomor darurat: (0341) 4372409</p>
      <a className="emergency-call mt-5" href="tel:03414372409"><PhoneCall size={20} aria-hidden="true" />Panggil RSUB — (0341) 4372409</a>
    </div>
    <div className="card mt-4"><h3 className="font-bold">Kapan harus menghubungi?</h3><ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc list-inside"><li>Tekanan darah sangat tinggi (≥180/110 mmHg) disertai gejala</li><li>Nyeri dada hebat, sesak napas, atau kelemahan satu sisi tubuh</li><li>Penurunan kesadaran atau gangguan penglihatan mendadak</li></ul></div>
    <p className="mt-6 text-xs text-slate-500">Tombol membuka menu panggilan telepon di perangkat Anda. Aplikasi tidak melakukan panggilan otomatis dan bukan pengganti layanan ambulans.</p>
  </section>;
}
