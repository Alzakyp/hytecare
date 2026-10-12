"use client";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { createUser, updateUser, type UserActionState } from "@/lib/admin/users/actions";
type User={id?:string;display_name?:string;email?:string;role?:string};
export function UserForm({user,create=false}:{user?:User;create?:boolean}){
 const fn=create?createUser:updateUser; const [state,action,pending]=useActionState(fn,{} as UserActionState);
 return <form action={action} className="admin-form card">
  {user?.id&&<input type="hidden" name="user_id" value={user.id}/>}<label>Nama tampilan<input name="display_name" required maxLength={100} defaultValue={user?.display_name}/></label>
  <label>Email<input name="email" type="email" required defaultValue={user?.email}/></label>
  <label>Role<select name="role" defaultValue={user?.role??"patient"}><option value="patient">Patient</option><option value="admin">Admin</option></select></label>
  <label>{create ? "Password sementara" : "Ganti password (opsional)"}<input name="password" type="password" required={create} minLength={8} maxLength={128} placeholder={create ? undefined : "Kosongkan jika tidak diubah"} /><small>{create ? "Password tidak dikirim aplikasi. Sampaikan manual melalui kanal aman." : "Jika diisi, password berubah; sesi lama dapat tetap aktif sampai token kedaluwarsa."}</small></label>
  {state.error&&<p className="form-error" role="alert">{state.error}</p>}<button className="auth-button" disabled={pending}>{pending?<LoaderCircle className="animate-spin"/>:<Save/>}{pending?"Menyimpan…":"Simpan pengguna"}</button>
 </form>;
}
