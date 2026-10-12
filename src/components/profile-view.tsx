"use client";

import { useActionState } from "react";
import { updateDisplayName, type ProfileState } from "@/lib/profile/actions";
import { signOut } from "@/lib/auth/actions";
import { LogOut, Save, User } from "lucide-react";

type Props = {
  email: string;
  displayName: string;
  phoneNumber?: string | null;
  role?: "Pasien" | "Admin";
};

export function ProfileView({ email, displayName, phoneNumber, role = "Pasien" }: Props) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateDisplayName, {});
  return <div className="space-y-6">
    <div className="card">
      <div className="flex items-center gap-3 pb-4 border-b">
        <span className="icon-tile"><User size={24} aria-hidden="true" /></span>
        <div><h2 className="font-bold text-lg">Informasi Akun</h2><p className="text-sm text-slate-500">Peran: {role}</p></div>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
          <input type="text" readOnly value={email} className="auth-input bg-slate-50 cursor-not-allowed" />
          <p className="text-xs text-slate-500 mt-1">Email dikelola oleh penyedia autentikasi.</p>
        </div>
        <form action={action} className="space-y-3">
          <label htmlFor="display_name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Tampilan</label>
          <input id="display_name" name="display_name" type="text" maxLength={100} defaultValue={displayName} placeholder="Masukkan nama" className="auth-input" />
          {role === "Pasien" && <><label htmlFor="phone_number" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3">Nomor handphone</label><input id="phone_number" name="phone_number" type="tel" defaultValue={phoneNumber ?? ""} placeholder="081234567890" className="auth-input mt-1"/><p className="text-xs text-slate-500 mt-1">Nomor dan riwayat tekanan darah Anda dapat dilihat petugas RS untuk menghubungi Anda.</p></>}
          {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
          {state.message && <p role="status" className="text-sm text-teal-800 font-semibold">{state.message}</p>}
          <button type="submit" disabled={pending} className="dashboard-link w-full justify-center">
            <Save size={18} aria-hidden="true" />{pending ? "Menyimpan…" : "Simpan Nama"}
          </button>
        </form>
      </div>
    </div>
    <div className="card">
      <h2 className="font-bold text-lg mb-2">Sesi</h2>
      <p className="text-sm text-slate-500 mb-4">Keluar dari akun Anda pada perangkat ini.</p>
      <form action={signOut}>
        <button type="submit" className="w-full min-h-12 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2">
          <LogOut size={18} aria-hidden="true" />Keluar dari HyteCare
        </button>
      </form>
    </div>
  </div>;
}
