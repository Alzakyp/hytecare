import Link from "next/link";
import { UserForm } from "@/components/admin/user-form";
export default function NewUserPage(){return <section><Link href="/admin/users" className="text-sm text-[var(--teal)]">← Kembali ke daftar pengguna</Link><h1 className="my-5 text-2xl font-bold">Tambah Pengguna</h1><UserForm create/></section>}
