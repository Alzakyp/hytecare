import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { ProfileView } from "@/components/profile-view";

export default async function AdminProfilePage() {
  const { userId } = await requireRole("admin");
  const supabase = await createClient();
  const [{ data: profile, error }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("display_name,phone_number").eq("id", userId).single(),
    supabase.auth.getUser(),
  ]);
  if (error) return <section><h1 className="text-2xl font-bold">Profil Admin</h1><p className="form-error mt-4">Profil belum dapat dimuat.</p></section>;
  return <section className="max-w-2xl">
    <h1 className="text-2xl font-bold mb-6">Profil Admin</h1>
    <ProfileView email={user?.email ?? ""} displayName={profile?.display_name ?? ""} phoneNumber={profile?.phone_number} role="Admin" />
  </section>;
}
