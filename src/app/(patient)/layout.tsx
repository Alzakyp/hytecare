import { requireRole } from "@/lib/auth/roles";
import { LocaleProvider, LocaleSwitch } from "@/components/locale-provider";
import { PatientNav } from "@/components/patient-nav";

export default async function PatientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireRole("patient");
  return <LocaleProvider><div className="patient-shell"><header className="app-header"><strong>HyteCare</strong><LocaleSwitch /></header><main className="patient-main">{children}</main><PatientNav /></div></LocaleProvider>;
}
