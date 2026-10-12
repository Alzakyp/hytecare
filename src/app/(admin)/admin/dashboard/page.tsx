import { Users, UserCheck, UserX, ShieldCheck, Gamepad2, ListChecks } from "lucide-react";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_counts");
  const metrics = [
    { key: "active_users", label: "Akun aktif", icon: UserCheck },
    { key: "disabled_users", label: "Akun nonaktif", icon: UserX },
    { key: "patients", label: "Pasien", icon: Users },
    { key: "admins", label: "Admin", icon: ShieldCheck },
    { key: "active_games", label: "Game aktif", icon: Gamepad2 },
    { key: "active_questions", label: "Soal aktif", icon: ListChecks },
  ];
  return <section>
    <h1 className="text-2xl font-bold">Ringkasan Operasional</h1>
    <p className="mt-2 text-sm text-[var(--ink-muted)]">Statistik akun dan konten. Tidak memuat rekam kesehatan individual pasien.</p>
    {error ? <p className="form-error mt-6">Ringkasan belum tersedia. Pastikan migration admin telah diterapkan.</p> : <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{metrics.map(({ key, label, icon: Icon }) => <div key={key} className="card border border-[var(--border)]"><span className="icon-tile"><Icon size={22} /></span><h2 className="mt-4 text-sm text-[var(--ink-muted)]">{label}</h2><p className="mt-1 text-4xl font-bold">{Number(data?.[key] ?? 0).toLocaleString("id-ID")}</p></div>)}</div>}
  </section>;
}
