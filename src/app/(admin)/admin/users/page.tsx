import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { normalizeUserQuery } from "@/lib/admin/users/validation.js";
import { UserRowActions } from "@/components/admin/user-row-actions";

type UserRow={user_id:string;email:string;display_name:string;role:string;is_active:boolean;created_at:string;total_count:number};
export default async function AdminUsersPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 await requireRole("admin");
 const query=normalizeUserQuery(await searchParams),supabase=await createClient();
 const {data,error}=await supabase.rpc("admin_list_users",{p_query:query.q,p_role:query.role==='all'?null:query.role,p_active:query.status==='all'?null:query.status==='active',p_limit:20,p_offset:(query.page-1)*20});
 const rows=(data??[]) as UserRow[], count=Number(rows[0]?.total_count??0), pages=Math.ceil(count/20);
 const url=(page:number)=>`/admin/users?${new URLSearchParams({q:query.q,role:query.role,status:query.status,page:String(page)})}`;
 return <section>
  <div className="page-title-row"><div><h1 className="text-2xl font-bold">Pengelolaan Pengguna</h1><p className="text-sm text-[var(--ink-muted)]">Identitas akun; tanpa data kesehatan pasien.</p></div><Link href="/admin/users/new" className="new-reading-button"><Plus size={18}/> Tambah pengguna</Link></div>
  <form method="get" className="my-5 flex flex-wrap gap-2 items-end">
   <label className="text-sm">Cari nama/email<input className="auth-input mt-1" name="q" defaultValue={query.q}/></label>
   <label className="text-sm">Role<select className="auth-input mt-1" name="role" defaultValue={query.role}><option value="all">Semua</option><option value="patient">Pasien</option><option value="admin">Admin</option></select></label>
   <label className="text-sm">Status<select className="auth-input mt-1" name="status" defaultValue={query.status}><option value="all">Semua</option><option value="active">Aktif</option><option value="disabled">Nonaktif</option></select></label>
   <button className="auth-button" type="submit">Terapkan</button>
  </form>
  {error?<p role="alert" className="form-error">Daftar pengguna belum tersedia. Pastikan migration admin diterapkan.</p>:<><div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Bergabung</th><th>Aksi</th></tr></thead><tbody>{rows.length?rows.map(u=><tr key={u.user_id}><td className="font-bold">{u.display_name||"-"}</td><td>{u.email}</td><td>{u.role}</td><td><span className="admin-status">{u.is_active?"Aktif":"Nonaktif"}</span></td><td>{new Date(u.created_at).toLocaleDateString("id-ID")}</td><td><UserRowActions user={{id:u.user_id,name:u.display_name||u.email,is_active:u.is_active}}/></td></tr>):<tr><td colSpan={6} className="text-center py-8">Tidak ada pengguna pada halaman ini.</td></tr>}</tbody></table></div><nav aria-label="Halaman pengguna" className="admin-actions mt-5">{query.page>1&&<Link href={url(query.page-1)}>Sebelumnya</Link>}<span>Halaman {query.page}{pages?` dari ${pages}`:""}</span>{query.page<pages&&<Link href={url(query.page+1)}>Berikutnya</Link>}</nav></>}
 </section>;
}
