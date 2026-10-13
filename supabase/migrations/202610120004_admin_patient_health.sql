alter table public.profiles add column if not exists phone_number text check (phone_number is null or char_length(phone_number) between 8 and 20);
grant update(phone_number) on public.profiles to authenticated;

-- Store contact supplied during verified patient signup; role still defaults to patient.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name,phone_number) values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),100),nullif(new.raw_user_meta_data->>'phone_number',''));
 insert into public.user_roles(user_id,role) values(new.id,'patient');
 insert into public.account_status(user_id,is_active) values(new.id,true);
 return new;
end $$;

drop policy if exists readings_admin_select on public.blood_pressure_readings;
create policy readings_admin_select on public.blood_pressure_readings for select to authenticated using (public.is_admin());

alter table public.admin_audit_log drop constraint if exists admin_audit_log_action_check;
alter table public.admin_audit_log add constraint admin_audit_log_action_check check (action in ('create','update_profile','change_email','change_role','disable','enable','view_patient_health'));

create or replace function public.admin_record_health_view(p_target_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 if not exists(select 1 from public.user_roles where user_id=p_target_id and role='patient') then raise exception 'Target harus pasien'; end if;
 insert into public.admin_audit_log(actor_id,target_user_id,action) values(auth.uid(),p_target_id,'view_patient_health');
end $$;
revoke all on function public.admin_record_health_view(uuid) from public;
grant execute on function public.admin_record_health_view(uuid) to authenticated;

-- PostgreSQL cannot replace a RETURNS TABLE function with a new return shape; drop then recreate.
drop function public.admin_list_users(text,text,boolean,integer,integer);
create function public.admin_list_users(p_query text default '', p_role text default null, p_active boolean default null, p_limit integer default 20, p_offset integer default 0)
returns table(user_id uuid, email text, display_name text, phone_number text, role public.user_role, is_active boolean, created_at timestamptz, total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 return query
 select p.id, u.email::text, p.display_name, p.phone_number, r.role, coalesce(s.is_active,true), p.created_at, count(*) over()
 from public.profiles p
 join auth.users u on u.id=p.id
 join public.user_roles r on r.user_id=p.id
 left join public.account_status s on s.user_id=p.id
 where (coalesce(p_query,'')='' or p.display_name ilike '%'||p_query||'%' or u.email ilike '%'||p_query||'%' or coalesce(p.phone_number,'') ilike '%'||p_query||'%')
   and (p_role is null or r.role::text=p_role)
   and (p_active is null or coalesce(s.is_active,true)=p_active)
 order by p.created_at desc
 limit least(greatest(p_limit,1),100) offset greatest(p_offset,0);
end $$;
revoke all on function public.admin_list_users(text,text,boolean,integer,integer) from public;
grant execute on function public.admin_list_users(text,text,boolean,integer,integer) to authenticated;
