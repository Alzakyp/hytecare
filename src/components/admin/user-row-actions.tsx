"use client";
import { useTransition } from "react";
import Link from "next/link";
import { Edit, Power } from "lucide-react";
import { toggleUserStatus } from "@/lib/admin/users/actions";
export function UserRowActions({user}:{user:{id:string;name:string;is_active:boolean;role?:string}}){
 const [pending,start]=useTransition();
 return <div className="admin-actions">
  <Link href={`/admin/users/${user.id}/edit`}><Edit size={16}/> Edit</Link>
  {user.role === 'patient' && <Link href={`/admin/users/${user.id}/health`} prefetch={false}>Rekam Medis</Link>}
  <button disabled={pending} onClick={()=>{
    if(!confirm(`${user.is_active?"Nonaktifkan":"Aktifkan"} akun ${user.name}?`))return;
    start(async()=>{ const r=await toggleUserStatus(user.id,!user.is_active); if(r.error)alert(r.error); });
  }}><Power size={16}/> {user.is_active?"Nonaktifkan":"Aktifkan"}</button>
 </div>;
}
