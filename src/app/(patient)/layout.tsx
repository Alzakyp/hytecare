import { requireRole } from "@/lib/auth/roles";
import { PatientNav } from "@/components/patient-nav";

export default async function PatientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireRole("patient");
  return <div className="patient-shell"><header className="app-header"><strong>HyteCare</strong></header><main className="patient-main">{children}</main><PatientNav /></div>;
}
