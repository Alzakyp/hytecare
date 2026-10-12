import { HyteLoading } from "@/components/hyte-loading";

export default function AdminLoading() {
  return <div className="loading-stack"><HyteLoading label="Menyiapkan konsol HyteCare…"/><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="skeleton h-32"/><div className="skeleton h-32"/><div className="skeleton h-32"/></div></div>;
}
