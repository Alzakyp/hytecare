import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/roles";
import { UserForm } from "@/components/admin/user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  let admin;
  try { admin = createAdminClient(); } catch { return <p className="form-error">Layanan pengelolaan akun belum dikonfigurasi.</p>; }
  const supabase = await createClient();
  const [{ data: auth }, { data: profile }, { data: role }] = await Promise.all([
    admin.auth.admin.getUserById(id),
    supabase.from("profiles").select("display_name").eq("id", id).single(),
    supabase.from("user_roles").select("role").eq("user_id", id).single(),
  ]);
  if (!auth?.user || !profile || !role) notFound();
  return <section><Link href="/admin/users" className="text-sm text-[var(--teal)]">← Kembali ke daftar pengguna</Link><h1 className="my-5 text-2xl font-bold">Edit Pengguna</h1><UserForm user={{ id, display_name: profile.display_name, email: auth.user.email ?? "", role: role.role }} /></section>;
}
