create table if not exists public.medication_logs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 medication_name text not null check (medication_name in ('Amlodipine', 'Captopril')),
 intake_date date not null,
 taken_at timestamptz not null default now(),
 unique (user_id, medication_name, intake_date)
);

alter table public.medication_logs enable row level security;
revoke all on public.medication_logs from anon, authenticated;
grant select, insert, delete on public.medication_logs to authenticated;

create policy medication_logs_owner on public.medication_logs for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
