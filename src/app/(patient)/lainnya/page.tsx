import Link from "next/link";
export default function MorePage() { return <section><h1 className="text-2xl font-bold">Lainnya</h1><div className="mt-5 space-y-3"><Link className="card block font-semibold" href="/kontak-darurat">Kontak Darurat</Link><Link className="card block font-semibold" href="/profil">Profil</Link></div></section>; }
