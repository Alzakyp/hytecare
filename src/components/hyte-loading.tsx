export function HyteLoading({ label = "Memuat HyteCare…", compact = false }: { label?: string; compact?: boolean }) {
  return <div className={compact ? "hyte-loading hyte-loading-compact" : "hyte-loading"} role="status" aria-live="polite">
    <span className="hyte-loading-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" className="hyte-loading-ring"/><path d="M32 14c-4.4 0-8 3.6-8 8 0 8 8 13.5 8 13.5S40 30 40 22c0-4.4-3.6-8-8-8z"/><circle cx="32" cy="22" r="3.5" className="hyte-loading-center"/><path d="M19 43.5c3.2-1.8 7-3.5 13-3.5 6 0 9.8 1.7 13 3.5" className="hyte-loading-wave"/></svg></span>
    <span>{label}</span>
  </div>;
}
