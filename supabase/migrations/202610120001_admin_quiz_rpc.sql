create or replace function public.admin_save_question(
 p_game_id uuid, p_prompt text, p_explanation text, p_sort_order integer,
 p_is_active boolean, p_options jsonb, p_question_id uuid default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_qid uuid := coalesce(p_question_id, public.gen_random_uuid());
 v_opt jsonb; v_correct integer := 0; v_opt_id uuid;
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 if not exists(select 1 from public.quiz_games where id=p_game_id and archived_at is null) then
   raise exception 'Game tidak valid atau diarsipkan';
 end if;
 if p_prompt is null or length(btrim(p_prompt)) not between 1 and 2000
    or length(coalesce(p_explanation,'')) > 4000 or p_sort_order not between 0 and 10000
    or p_is_active is null or jsonb_typeof(p_options) is distinct from 'array'
    or jsonb_array_length(p_options) < 2 then raise exception 'Data soal tidak valid'; end if;
 if (select game_type from public.quiz_games where id=p_game_id) = 'myth_fact' and jsonb_array_length(p_options) <> 2 then
   raise exception 'Mitos/Fakta membutuhkan dua opsi';
 end if;
 if exists(select 1 from public.quiz_attempts a where a.game_id=p_game_id and a.status='in_progress') then
   raise exception 'Game memiliki attempt yang masih berjalan';
 end if;
 for v_opt in select * from jsonb_array_elements(p_options) loop
   if jsonb_typeof(v_opt) <> 'object' or length(btrim(coalesce(v_opt->>'label',''))) not between 1 and 500
      or jsonb_typeof(v_opt->'is_correct') <> 'boolean' then raise exception 'Opsi tidak valid'; end if;
   if (v_opt->>'is_correct')::boolean then v_correct := v_correct + 1; end if;
 end loop;
 if v_correct <> 1 then raise exception 'Tepat satu opsi benar'; end if;
 if (select count(distinct lower(btrim(elem->>'label'))) from jsonb_array_elements(p_options) elem) <> jsonb_array_length(p_options) then
   raise exception 'Opsi duplikat';
 end if;

 if p_question_id is null then
   insert into public.quiz_questions(id, game_id, prompt, explanation, sort_order, is_active)
   values(v_qid, p_game_id, p_prompt, coalesce(p_explanation,''), coalesce(p_sort_order,0), false);
 else
   if exists(select 1 from public.quiz_questions where id=v_qid and game_id <> p_game_id) then
     raise exception 'Game soal tidak dapat dipindahkan';
   end if;
   update public.quiz_questions
   set game_id=p_game_id, prompt=p_prompt, explanation=coalesce(p_explanation,''),
       sort_order=coalesce(p_sort_order,0), is_active=false, updated_at=now()
   where id=v_qid and archived_at is null;
   if not found then raise exception 'Soal tidak ditemukan'; end if;
 end if;

 -- Hapus opsi lama yang tidak dikirim dan BELUM dipakai jawaban attempt
 delete from public.quiz_options o
 where o.question_id=v_qid
   and not exists (
     select 1 from jsonb_array_elements(p_options) elem
     where (elem->>'id') is not null and (elem->>'id')::uuid = o.id
   )
   and not exists (select 1 from public.quiz_answers a where a.selected_option_id=o.id);

 -- Bila ada opsi lama yang dirujuk attempt tetapi hendak dihapus, batalkan
 if exists (
   select 1 from public.quiz_options o
   where o.question_id=v_qid
     and not exists (
       select 1 from jsonb_array_elements(p_options) elem
       where (elem->>'id') is not null and (elem->>'id')::uuid = o.id
     )
 ) then
   raise exception 'Opsi berelasi dengan riwayat tidak boleh dihapus';
 end if;

 for v_opt in select * from jsonb_array_elements(p_options) loop
   v_opt_id := case when (v_opt->>'id') is null or (v_opt->>'id')='' then public.gen_random_uuid() else (v_opt->>'id')::uuid end;
   if exists(select 1 from public.quiz_options where id=v_opt_id and question_id<>v_qid) then
     raise exception 'Opsi bukan milik soal ini';
   end if;
   insert into public.quiz_options(id, question_id, label, is_correct, sort_order)
   values(v_opt_id, v_qid, btrim(v_opt->>'label'), (v_opt->>'is_correct')::boolean, coalesce((v_opt->>'sort_order')::integer,0))
   on conflict (question_id, id) do update
     set label=excluded.label, is_correct=excluded.is_correct, sort_order=excluded.sort_order, updated_at=now();
 end loop;

 if p_is_active then
   update public.quiz_questions set is_active=true where id=v_qid;
 end if;

 return v_qid;
end $$;
revoke all on function public.admin_save_question(uuid,text,text,integer,boolean,jsonb,uuid) from public;
grant execute on function public.admin_save_question(uuid,text,text,integer,boolean,jsonb,uuid) to authenticated;

create or replace function public.admin_get_question(p_question_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 select jsonb_build_object('id',q.id,'game_id',q.game_id,'prompt',q.prompt,'explanation',q.explanation,'sort_order',q.sort_order,'is_active',q.is_active,'archived_at',q.archived_at,'options',coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'label',o.label,'is_correct',o.is_correct,'sort_order',o.sort_order) order by o.sort_order) from public.quiz_options o where o.question_id=q.id),'[]'::jsonb)) into result
 from public.quiz_questions q where q.id=p_question_id;
 return result;
end $$;
revoke all on function public.admin_get_question(uuid) from public;
grant execute on function public.admin_get_question(uuid) to authenticated;
