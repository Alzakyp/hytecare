alter table public.profiles add column if not exists phone_number text check (phone_number is null or char_length(phone_number) between 8 and 20);
grant update(phone_number) on public.profiles to authenticated;
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
