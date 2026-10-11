import Link from "next/link";

export default function Forbidden() {
  return <main className="auth-page"><section className="auth-card"><h1 className="text-3xl font-bold">Akses ditolak</h1><p className="mt-4">Akun ini tidak memiliki izin untuk membuka halaman tersebut.</p><Link href="/" className="mt-6 inline-block underline">Kembali</Link></section></main>;
}
