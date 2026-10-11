import { requireRole } from "@/lib/auth/roles";
import { LocaleProvider, LocaleSwitch } from "@/components/locale-provider";
import { AdminNav } from "@/components/admin-nav";
import { signOut } from "@/lib/auth/actions";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireRole("admin");
  return <LocaleProvider><div className="admin-shell"><aside className="admin-sidebar"><div className="p-4 border-b"><strong>HyteCare Admin</strong></div><AdminNav /><form action={signOut} className="p-4 mt-auto"><button type="submit" className="text-sm underline">Keluar</button></form></aside><div className="admin-body"><header className="app-header"><span>Konsol Admin</span><LocaleSwitch /></header><main className="admin-main">{children}</main></div></div></LocaleProvider>;
}
