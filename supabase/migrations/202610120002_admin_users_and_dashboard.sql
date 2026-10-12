-- Status akun, audit log, dan operasional admin
create table if not exists public.account_status (
 user_id uuid primary key references public.profiles(id) on delete restrict,
 is_active boolean not null default true,
 disabled_at timestamptz,
 disabled_by uuid references public.profiles(id) on delete restrict,
 updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid not null references public.profiles(id) on delete restrict,
 target_user_id uuid not null references public.profiles(id) on delete restrict,
 action text not null check (action in ('create','update_profile','change_email','change_role','disable','enable')),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

-- Backfill akun yang belum memiliki status
insert into public.account_status(user_id, is_active)
select p.id, true from public.profiles p
on conflict (user_id) do nothing;

-- Update trigger handle_new_user untuk memasukkan status aktif otomatis
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),100));
 insert into public.user_roles(user_id,role) values(new.id,'patient');
 insert into public.account_status(user_id,is_active) values(new.id,true);
 return new;
end $$;

alter table public.account_status enable row level security;
alter table public.admin_audit_log enable row level security;

revoke all on public.account_status, public.admin_audit_log from anon, authenticated;
grant select on public.account_status to authenticated;
grant select on public.admin_audit_log to authenticated;

create policy account_status_select on public.account_status for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy admin_audit_log_select on public.admin_audit_log for select to authenticated using (public.is_admin());

-- Daftar identitas akun terpage; tidak menyentuh tabel kesehatan.
create or replace function public.admin_list_users(p_query text default '', p_role text default null, p_active boolean default null, p_limit integer default 20, p_offset integer default 0)
returns table(user_id uuid, email text, display_name text, role public.user_role, is_active boolean, created_at timestamptz, total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 return query
 select p.id, u.email::text, p.display_name, r.role, coalesce(s.is_active,true), p.created_at, count(*) over()
 from public.profiles p
 join auth.users u on u.id=p.id
 join public.user_roles r on r.user_id=p.id
 left join public.account_status s on s.user_id=p.id
 where (coalesce(p_query,'')='' or p.display_name ilike '%'||p_query||'%' or u.email ilike '%'||p_query||'%')
   and (p_role is null or r.role::text=p_role)
   and (p_active is null or coalesce(s.is_active,true)=p_active)
 order by p.created_at desc
 limit least(greatest(p_limit,1),100) offset greatest(p_offset,0);
end $$;
revoke all on function public.admin_list_users(text,text,boolean,integer,integer) from public;
grant execute on function public.admin_list_users(text,text,boolean,integer,integer) to authenticated;

-- RPC Dashboard agregat non-medis
create or replace function public.admin_dashboard_counts()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
 v_res jsonb;
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 select jsonb_build_object(
   'active_users', count(*) filter (where s.is_active),
   'disabled_users', count(*) filter (where not s.is_active),
   'patients', count(*) filter (where r.role = 'patient'),
   'admins', count(*) filter (where r.role = 'admin'),
   'active_games', (select count(*) from public.quiz_games where is_active and archived_at is null),
   'active_questions', (select count(*) from public.quiz_questions where is_active and archived_at is null)
 ) into v_res
 from public.profiles p
 left join public.account_status s on s.user_id = p.id
 left join public.user_roles r on r.user_id = p.id;
 return v_res;
end $$;
revoke all on function public.admin_dashboard_counts() from public;
grant execute on function public.admin_dashboard_counts() to authenticated;

-- RPC mutasi role dengan perlindungan self-demotion & last active admin
create or replace function public.admin_update_user_role(p_target_id uuid, p_role text)
returns void language plpgsql security definer set search_path='' as $$
declare
 v_old_role public.user_role;
 v_active_admin_count integer;
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 if p_role not in ('admin','patient') then raise exception 'Role tidak valid'; end if;
 if p_target_id = auth.uid() and p_role <> 'admin' then
   raise exception 'Admin tidak dapat menurunkan perannya sendiri';
 end if;

 -- Serialize pemeriksaan admin terakhir lintas transaksi.
 perform pg_catalog.pg_advisory_xact_lock(746321);
 perform 1 from public.user_roles where role = 'admin' order by user_id for update;

 select role into v_old_role from public.user_roles where user_id = p_target_id;
 if v_old_role = 'admin' and p_role = 'patient' then
   select count(*) into v_active_admin_count
   from public.user_roles r
   join public.account_status s on s.user_id = r.user_id
   where r.role = 'admin' and s.is_active;

   if v_active_admin_count <= 1 then
     raise exception 'Minimal satu admin aktif wajib dipertahankan';
   end if;
 end if;

 update public.user_roles set role = p_role::public.user_role where user_id = p_target_id;

 insert into public.admin_audit_log(actor_id, target_user_id, action, metadata)
 values(auth.uid(), p_target_id, 'change_role', jsonb_build_object('old_role', v_old_role, 'new_role', p_role));
end $$;
revoke all on function public.admin_update_user_role(uuid,text) from public;
grant execute on function public.admin_update_user_role(uuid,text) to authenticated;

-- RPC aktivasi / penonaktifan akun dengan perlindungan self-disable & last admin
create or replace function public.admin_set_user_status(p_target_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path='' as $$
declare
 v_target_role public.user_role;
 v_active_admin_count integer;
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 if p_target_id = auth.uid() and not p_active then
   raise exception 'Admin tidak dapat menonaktifkan akun sendiri';
 end if;

 select role into v_target_role from public.user_roles where user_id = p_target_id;

 if v_target_role = 'admin' and not p_active then
   perform pg_catalog.pg_advisory_xact_lock(746321);
   perform 1 from public.user_roles where role = 'admin' order by user_id for update;
   select count(*) into v_active_admin_count
   from public.user_roles r
   join public.account_status s on s.user_id = r.user_id
   where r.role = 'admin' and s.is_active;

   if v_active_admin_count <= 1 then
     raise exception 'Minimal satu admin aktif wajib dipertahankan';
   end if;
 end if;

 insert into public.account_status(user_id, is_active, disabled_at, disabled_by, updated_at)
 values(p_target_id, p_active, case when p_active then null else now() end, case when p_active then null else auth.uid() end, now())
 on conflict (user_id) do update
   set is_active = excluded.is_active,
       disabled_at = excluded.disabled_at,
       disabled_by = excluded.disabled_by,
       updated_at = now();

 insert into public.admin_audit_log(actor_id, target_user_id, action, metadata)
 values(auth.uid(), p_target_id, case when p_active then 'enable' else 'disable' end, jsonb_build_object('is_active', p_active));
end $$;
revoke all on function public.admin_set_user_status(uuid,boolean) from public;
grant execute on function public.admin_set_user_status(uuid,boolean) to authenticated;
