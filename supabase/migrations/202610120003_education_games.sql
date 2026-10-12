alter table public.quiz_games add column if not exists config jsonb not null default '{}'::jsonb;
alter table public.quiz_games add column if not exists answer_key jsonb not null default '{}'::jsonb;
-- Replace broad legacy SELECT: answer_key must never be selectable by browser roles.
revoke select on public.quiz_games from authenticated;
grant select(id,slug,title,description,game_type,is_active,archived_at,created_at,updated_at,config) on public.quiz_games to authenticated;

-- Legacy games require active quiz_questions. Config-driven education games use secure RPC scoring instead.
create or replace function public.validate_active_game() returns trigger language plpgsql set search_path=public as $$
begin
 if new.is_active and new.game_type not in ('myth_fact','food_sort','word_search')
    and not exists(select 1 from public.quiz_questions q where q.game_id=new.id and q.is_active and q.archived_at is null) then
   raise exception 'Active game requires an active question';
 end if;
 return new;
end $$;

insert into public.quiz_games(slug,title,description,game_type,is_active,config,answer_key) values
('mitos-atau-fakta','Mitos atau Fakta','Uji pemahaman tentang hipertensi.','myth_fact',true,
 '{"items":[{"id":"q1","text":"Hipertensi selalu menimbulkan sakit kepala."},{"id":"q2","text":"Makanan tinggi garam dapat meningkatkan tekanan darah."},{"id":"q3","text":"Jika tekanan darah sudah normal, obat boleh dihentikan."},{"id":"q4","text":"Olahraga teratur membantu menurunkan tekanan darah."},{"id":"q5","text":"Hipertensi hanya terjadi pada orang lanjut usia."},{"id":"q6","text":"Stres dapat memengaruhi tekanan darah."},{"id":"q7","text":"Minum obat hipertensi harus seumur hidup."},{"id":"q8","text":"Hipertensi tidak berbahaya jika tidak ada gejala."}]}',
 '{"q1":false,"q2":true,"q3":false,"q4":true,"q5":false,"q6":true,"q7":false,"q8":false}'),
('pilah-makanan','Pilah Makanan','Pilih makanan yang lebih sehat dan yang perlu dibatasi.','food_sort',true,
 '{"items":[{"id":"bayam","label":"Sayur bayam"},{"id":"sosis","label":"Sosis"},{"id":"keripik","label":"Keripik kentang"},{"id":"ikan-asin","label":"Ikan asin"},{"id":"pisang","label":"Pisang"},{"id":"mie-instan","label":"Mie instan"},{"id":"brokoli","label":"Brokoli"},{"id":"kacang-asin","label":"Kacang asin"},{"id":"tomat","label":"Tomat"},{"id":"ikan-rebus","label":"Ikan rebus"},{"id":"apel","label":"Buah apel"},{"id":"cepat-saji","label":"Makanan cepat saji"}]}',
 '{"bayam":"recommended","sosis":"limit","keripik":"limit","ikan-asin":"limit","pisang":"recommended","mie-instan":"limit","brokoli":"recommended","kacang-asin":"limit","tomat":"recommended","ikan-rebus":"recommended","apel":"recommended","cepat-saji":"limit"}'),
('word-finding','Word Finding','Temukan kata yang berhubungan dengan hipertensi.','word_search',true,
 '{"words":["HIPERTENSI","GARAM","JANTUNG","STRES","OLAHRAGA","TENSIMETER","BUAH","SAYUR","OBESITAS","ROKOK"],"grid":[["T","E","N","S","I","M","E","T","E","R","L","K"],["C","X","K","E","X","C","B","U","A","H","Z","R"],["J","O","B","E","S","I","T","A","S","J","Y","O"],["F","X","X","W","N","L","S","A","Y","U","R","K"],["F","A","G","R","V","P","R","F","B","X","V","O"],["K","P","H","K","D","H","A","L","L","I","G","K"],["H","I","P","E","R","T","E","N","S","I","Y","N"],["J","H","S","E","S","T","R","E","S","S","Y","K"],["F","O","L","A","H","R","A","G","A","S","P","M"],["V","G","A","R","A","M","S","Y","H","P","P","B"],["H","N","T","Y","M","S","X","P","X","B","D","T"],["U","X","J","J","A","N","T","U","N","G","L","Z"]]}',
 '{"words":["HIPERTENSI","GARAM","JANTUNG","STRES","OLAHRAGA","TENSIMETER","BUAH","SAYUR","OBESITAS","ROKOK"],"positions":{"HIPERTENSI":[6,0,6,9],"TENSIMETER":[0,0,0,9],"OLAHRAGA":[8,1,8,8],"OBESITAS":[2,1,2,8],"JANTUNG":[11,3,11,9],"GARAM":[9,1,9,5],"STRES":[7,4,7,8],"SAYUR":[3,6,3,10],"ROKOK":[1,11,5,11],"BUAH":[1,6,1,9]}}')
on conflict(slug) do update set title=excluded.title,description=excluded.description,game_type=excluded.game_type,config=excluded.config,answer_key=excluded.answer_key;

create or replace function public.submit_game(p_game_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare g record; v_score integer:=0; v_total integer:=0; pair record; v_answers jsonb:=coalesce(p_answers,'{}'::jsonb);
begin
 if auth.uid() is null or public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
 select id,game_type,answer_key into g from public.quiz_games where id=p_game_id and is_active and archived_at is null;
 if not found then raise exception 'Game tidak ditemukan'; end if;
 if g.game_type in ('myth_fact','food_sort') then
  for pair in select key,value from jsonb_each(g.answer_key) loop
   v_total:=v_total+1;
   if v_answers->pair.key = pair.value then v_score:=v_score+1; end if;
  end loop;
 elsif g.game_type='word_search' then
  v_total:=jsonb_array_length(g.answer_key->'words');
  select count(distinct a.value) into v_score from jsonb_array_elements_text(coalesce(v_answers->'found','[]'::jsonb)) a
  where a.value in (select jsonb_array_elements_text(g.answer_key->'words'));
 else raise exception 'Jenis game tidak didukung'; end if;
 insert into public.quiz_attempts(user_id,game_id,score,total_questions,completed_at,status,question_snapshot)
 values(auth.uid(),g.id,v_score,v_total,now(),'completed',v_answers);
 return jsonb_build_object('score',v_score,'total',v_total);
end $$;
revoke all on function public.submit_game(uuid,jsonb) from public;
grant execute on function public.submit_game(uuid,jsonb) to authenticated;

create or replace function public.patient_game(p_slug text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select jsonb_build_object('id',id,'slug',slug,'title',title,'description',description,'game_type',game_type,'config',config) into result from public.quiz_games where slug=p_slug and is_active and archived_at is null;
 return result;
end $$;
revoke all on function public.patient_game(text) from public;
grant execute on function public.patient_game(text) to authenticated;
