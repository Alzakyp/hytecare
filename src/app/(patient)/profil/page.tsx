import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { ProfileView } from "@/components/profile-view";

export default async function ProfilePage() {
  const { userId } = await requireRole("patient");
  const supabase = await createClient();
  const [{ data: profile, error }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).single(),
    supabase.auth.getUser(),
  ]);
  if (error) return <section><h1 className="text-3xl font-bold">Profil</h1><p role="alert" className="mt-4">Profil belum dapat dimuat. Silakan coba lagi.</p></section>;
  return <section className="page-enter"><p className="dashboard-eyebrow">AKUN ANDA</p><h1 className="text-3xl font-bold mt-2 mb-6">Profil</h1><ProfileView email={user?.email ?? ""} displayName={profile?.display_name ?? ""} /></section>;
}
