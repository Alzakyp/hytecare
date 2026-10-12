export default function PatientLoading() {
  return <div className="loading-stack" role="status" aria-live="polite"><span className="sr-only">Memuat halaman…</span><div className="skeleton h-5 w-32"/><div className="skeleton h-10 w-60"/><div className="skeleton h-52 w-full"/><div className="grid grid-cols-2 gap-3"><div className="skeleton h-32"/><div className="skeleton h-32"/></div></div>;
}
