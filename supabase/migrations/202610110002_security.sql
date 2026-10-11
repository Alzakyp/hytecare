create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin'::public.user_role)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.blood_pressure_readings enable row level security;
alter table public.quiz_games enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.user_article_progress enable row level security;

revoke all on public.user_roles, public.quiz_options, public.quiz_attempts, public.quiz_answers from anon, authenticated;
grant select on public.user_roles to authenticated;
grant select on public.quiz_attempts, public.quiz_answers to authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,avatar_url) on public.profiles to authenticated;
grant select,insert,update,delete on public.blood_pressure_readings, public.emergency_contacts, public.user_article_progress to authenticated;
grant select,insert,update,delete on public.quiz_games to authenticated;
grant select(id,game_id,prompt,sort_order,is_active,archived_at,created_at,updated_at) on public.quiz_questions to authenticated;
grant insert(game_id,prompt,explanation,sort_order,is_active,archived_at) on public.quiz_questions to authenticated;
grant update(game_id,prompt,explanation,sort_order,is_active,archived_at) on public.quiz_questions to authenticated;
grant delete on public.quiz_questions to authenticated;

create policy profiles_select on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy roles_select_self_or_admin on public.user_roles for select to authenticated using (user_id=auth.uid() or public.is_admin());

create policy readings_owner on public.blood_pressure_readings for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy contacts_owner on public.emergency_contacts for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy progress_owner on public.user_article_progress for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy attempts_owner_select on public.quiz_attempts for select to authenticated using (user_id=auth.uid());
create policy answers_owner_select on public.quiz_answers for select to authenticated using (exists(select 1 from public.quiz_attempts a where a.id=attempt_id and a.user_id=auth.uid()));

create policy games_active_select on public.quiz_games for select to authenticated using (is_active and archived_at is null or public.is_admin());
create policy questions_active_select on public.quiz_questions for select to authenticated using ((is_active and archived_at is null and exists(select 1 from public.quiz_games g where g.id=game_id and g.is_active and g.archived_at is null)) or public.is_admin());
create policy games_admin_write on public.quiz_games for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy questions_admin_write on public.quiz_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy options_admin_write on public.quiz_options for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Admin accesses keys through an explicit privileged RPC; patients never get table SELECT.
create or replace function public.admin_question_options(p_question_id uuid)
returns table(id uuid,label text,is_correct boolean,sort_order integer)
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 return query select o.id,o.label,o.is_correct,o.sort_order from public.quiz_options o where o.question_id=p_question_id order by o.sort_order;
end $$;
revoke all on function public.admin_question_options(uuid) from public;
grant execute on function public.admin_question_options(uuid) to authenticated;
create or replace function public.admin_question_explanation(p_question_id uuid) returns text
language plpgsql stable security definer set search_path='' as $$
declare result text;
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 select explanation into result from public.quiz_questions where id=p_question_id;
 return result;
end $$;
revoke all on function public.admin_question_explanation(uuid) from public;
grant execute on function public.admin_question_explanation(uuid) to authenticated;

create or replace function public.patient_quiz(game_slug text)
returns table(question_id uuid, prompt text, option_id uuid, label text, sort_order integer)
language sql stable security definer set search_path=public as $$
 select q.id,q.prompt,o.id,o.label,o.sort_order from public.quiz_games g
 join public.quiz_questions q on q.game_id=g.id join public.quiz_options o on o.question_id=q.id
 where auth.uid() is not null and not public.is_admin() and g.slug=game_slug and g.is_active and g.archived_at is null and q.is_active and q.archived_at is null
 order by q.sort_order,o.sort_order
$$;
revoke all on function public.patient_quiz(text) from public;
grant execute on function public.patient_quiz(text) to authenticated;

create or replace function public.validate_active_question() returns trigger language plpgsql set search_path=public as $$
declare option_count integer; correct_count integer;
begin
 if new.is_active then
  select count(*),count(*) filter(where is_correct) into option_count,correct_count from public.quiz_options where question_id=new.id;
  if option_count < 2 or correct_count <> 1 then raise exception 'Active question requires at least 2 options and exactly 1 correct option'; end if;
 end if; return new;
end $$;
create constraint trigger active_question_valid after insert or update on public.quiz_questions deferrable initially deferred for each row execute function public.validate_active_question();

create or replace function public.validate_option_change() returns trigger language plpgsql set search_path='' as $$
declare target uuid;
begin
 target=coalesce(new.question_id,old.question_id);
 if exists(select 1 from public.quiz_questions q where q.id=target and q.is_active) then
  if (select count(*) from public.quiz_options where question_id=target) < 2 or
     (select count(*) from public.quiz_options where question_id=target and is_correct) <> 1 then
   raise exception 'Active question requires at least 2 options and exactly 1 correct option';
  end if;
 end if;
 return null;
end $$;
create constraint trigger options_valid after insert or update or delete on public.quiz_options
 deferrable initially deferred for each row execute function public.validate_option_change();

create or replace function public.validate_active_game() returns trigger language plpgsql set search_path='' as $$
begin
 if new.is_active and not exists(select 1 from public.quiz_questions q where q.game_id=new.id and q.is_active and q.archived_at is null) then
  raise exception 'Active game requires an active question';
 end if;
 return new;
end $$;
create constraint trigger active_game_valid after insert or update on public.quiz_games
 deferrable initially deferred for each row execute function public.validate_active_game();
