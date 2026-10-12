export default function AdminLoading() {
  return <div className="loading-stack" role="status" aria-live="polite"><span className="sr-only">Memuat konsol admin…</span><div className="skeleton h-8 w-52"/><div className="skeleton h-32 w-full"/><div className="skeleton h-64 w-full"/></div>;
}
