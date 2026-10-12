import Link from "next/link";
import { PhoneCall, UserRound, ArrowRight } from "lucide-react";

export default function MorePage() {
  return <section className="page-enter">
    <p className="dashboard-eyebrow">MENU</p>
    <h1 className="text-3xl font-bold mt-2">Lainnya</h1>
    <div className="mt-6 space-y-3">
      <Link className="card flex items-center justify-between min-h-16" href="/kontak-darurat">
        <div className="flex items-center gap-3"><PhoneCall size={22} className="text-red-600" aria-hidden="true" /><div><h2 className="font-bold">Emergency Call</h2><p className="text-xs text-slate-500">Panggilan cepat RSUB Malang</p></div></div>
        <ArrowRight size={18} className="text-slate-400" aria-hidden="true" />
      </Link>
      <Link className="card flex items-center justify-between min-h-16" href="/profil">
        <div className="flex items-center gap-3"><UserRound size={22} className="text-teal-700" aria-hidden="true" /><div><h2 className="font-bold">Profil</h2><p className="text-xs text-slate-500">Informasi akun dan preferensi</p></div></div>
        <ArrowRight size={18} className="text-slate-400" aria-hidden="true" />
      </Link>
    </div>
  </section>;
}
