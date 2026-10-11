import Link from "next/link";

export default function NotFound() {
  return <main className="auth-page"><section className="auth-card"><h1 className="text-3xl font-bold">Halaman tidak ditemukan</h1><p className="mt-4">Alamat yang Anda buka tidak tersedia.</p><Link href="/" className="mt-6 inline-block underline">Kembali</Link></section></main>;
}
