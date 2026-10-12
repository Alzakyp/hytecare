import Link from "next/link";
import { ArrowRight, Gamepad2, ListChecks, ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_counts");
  const count=(key:string)=>Number(data?.[key]??0).toLocaleString("id-ID");
  return <section className="admin-dashboard">
    <div className="admin-hero"><div><p className="dashboard-eyebrow">HYTECARE · KONSOL OPERASIONAL</p><h1>Selamat datang, Pengelola.</h1><p>Kelola akses akun dan konten edukasi dari satu tempat. Data kesehatan individual tetap terlindungi.</p></div><div className="admin-hero-orb"><ShieldCheck size={38} aria-hidden="true"/></div></div>
    {error?<p className="form-error mt-6">Ringkasan belum tersedia. Pastikan migration admin telah diterapkan.</p>:<>
      <div className="admin-metric-grid mt-6"><article className="admin-metric-card admin-metric-primary"><span className="icon-tile"><UserCheck size={21}/></span><p>Akun aktif</p><strong>{count("active_users")}</strong><small>Pengguna dapat masuk aplikasi</small></article><article className="admin-metric-card"><span className="icon-tile"><Users size={21}/></span><p>Pasien</p><strong>{count("patients")}</strong><small>Akun role patient</small></article><article className="admin-metric-card"><span className="icon-tile"><ShieldCheck size={21}/></span><p>Admin</p><strong>{count("admins")}</strong><small>Pengelola aktif</small></article><article className="admin-metric-card"><span className="icon-tile"><Gamepad2 size={21}/></span><p>Game aktif</p><strong>{count("active_games")}</strong><small>Siap dimainkan pasien</small></article><article className="admin-metric-card"><span className="icon-tile"><ListChecks size={21}/></span><p>Soal aktif</p><strong>{count("active_questions")}</strong><small>Butir siap tayang</small></article></div>
      <div className="admin-dashboard-lower mt-6"><article className="admin-quick-card"><div><p className="dashboard-eyebrow">AKSES CEPAT</p><h2>Kelola pengguna</h2><p>Tambah, perbarui email atau password, dan atur status akses akun.</p></div><Link href="/admin/users" prefetch className="dashboard-link">Buka pengguna <ArrowRight size={17}/></Link></article><article className="admin-quick-card"><div><p className="dashboard-eyebrow">KONTEN KUIS</p><h2>Siapkan materi</h2><p>Buat game dan bank soal sebelum diaktifkan untuk pasien.</p></div><div className="admin-actions"><Link href="/admin/games" prefetch>Game</Link><Link href="/admin/questions" prefetch>Bank soal</Link></div></article></div>
    </>}
    <p className="admin-privacy-note">Ringkasan ini hanya memuat data akun dan konten. Tidak ada rekam tekanan darah, kontak darurat, atau jawaban pribadi pasien.</p>
  </section>;
}
