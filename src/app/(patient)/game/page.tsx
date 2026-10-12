import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
export default async function QuizPage(){await requireRole('patient');const{data}=await(await createClient()).from('quiz_games').select('slug,title,description,game_type').eq('is_active',true).is('archived_at',null).order('title');return <section><p className="dashboard-eyebrow">BELAJAR SAMBIL BERMAIN</p><h1 className="text-3xl font-bold mt-2">Permainan Edukasi</h1><p className="mt-2 text-[var(--ink-muted)]">Tiga permainan seru untuk mengasah pengetahuan.</p><div className="grid gap-4 mt-7 sm:grid-cols-2">{(data??[]).map(g=><Link key={g.slug} href={`/game/${g.slug}`} prefetch={true} className="card shortcut border border-[var(--border)]"><Gamepad2 size={26}/><h2>{g.title}</h2><p>{g.description}</p><span className="dashboard-link w-fit">Mulai</span></Link>)}</div></section>}
