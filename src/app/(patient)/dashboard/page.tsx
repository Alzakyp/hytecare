import Link from "next/link";
export default function PatientDashboard() {
  return <div><h1 className="text-2xl font-bold">Beranda Pasien</h1>
    <p className="mt-3">Fondasi Fase 1 siap. Modul pencatatan, grafik, dan evaluasi hipertensi akan disambungkan pada fase berikutnya.</p>
    <div className="card mt-6"><p className="font-semibold">Status Data</p><p className="text-sm mt-1">Data demonstrasi berlabel disediakan melalui seeder terproteksi. Belum ada rekam kesehatan nyata.</p><Link className="mt-4 inline-block underline font-medium" href="/tracker">Buka catatan tekanan darah</Link></div>
  </div>;
}
