-- Run as postgres on a disposable Supabase staging database after migrations.
-- All fixtures and changes are rolled back. Never run on production.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id, email, raw_user_meta_data) values
 ('10000000-0000-4000-8000-000000000001', 'rls-a@hytecare.test', '{"role":"admin"}'),
 ('10000000-0000-4000-8000-000000000002', 'rls-b@hytecare.test', '{}'),
 ('10000000-0000-4000-8000-000000000003', 'rls-admin@hytecare.test', '{}');
DO $$ BEGIN
 if (select role from public.user_roles where user_id = '10000000-0000-4000-8000-000000000001') <> 'patient' then
   raise exception 'Signup metadata escalated role';
 end if;
 if (select count(*) from pg_tables where schemaname='public' and rowsecurity and tablename in
 ('profiles','user_roles','blood_pressure_readings','quiz_games','quiz_questions','quiz_options','quiz_attempts','quiz_answers','emergency_contacts','user_article_progress')) <> 10 then
   raise exception 'RLS missing';
 end if;
END $$;
update public.user_roles set role='admin' where user_id='10000000-0000-4000-8000-000000000003';
insert into public.blood_pressure_readings(user_id,systolic,diastolic,measured_at) values
 ('10000000-0000-4000-8000-000000000002',120,80,now());
insert into public.emergency_contacts(user_id,name,phone_number,contact_type) values
 ('10000000-0000-4000-8000-000000000002','Test','DEMO-NOT-DIALABLE','personal');
insert into public.user_article_progress(user_id,article_slug) values
 ('10000000-0000-4000-8000-000000000002','test');
insert into public.quiz_games(id,slug,title,game_type) values
 ('20000000-0000-4000-8000-000000000001','rls-test','Test','quiz');
insert into public.quiz_questions(id,game_id,prompt,explanation) values
 ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Test prompt','Secret explanation');
insert into public.quiz_options(id,question_id,label,is_correct) values
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','A',true),
 ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','B',false);
update public.quiz_questions set is_active=true where id='30000000-0000-4000-8000-000000000001';
update public.quiz_games set is_active=true where id='20000000-0000-4000-8000-000000000001';
insert into public.quiz_attempts(id,user_id,game_id,total_questions,status) values
 ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',1,'completed');

-- Test helpers live only in this transaction and carry no elevated privileges.
create function pg_temp.denied(command text) returns void language plpgsql as $$
begin
 begin execute command;
 exception when insufficient_privilege or check_violation then return;
 end;
 raise exception 'Expected denial: %', command;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
DO $$ BEGIN
 if exists(select 1 from public.blood_pressure_readings) or exists(select 1 from public.emergency_contacts)
 or exists(select 1 from public.quiz_attempts) or exists(select 1 from public.user_article_progress) then
   raise exception 'Cross-patient leak';
 end if;
 if exists(select 1 from public.quiz_options) or exists(select 1 from public.quiz_questions) then
   raise exception 'Answer key or explanation leak';
 end if;
 if (select count(*) from public.patient_quiz('rls-test')) <> 1 then raise exception 'Safe projection missing'; end if;
 if public.patient_quiz('rls-test')::text like '%is_correct%' then raise exception 'Key in payload'; end if;
END $$;
select pg_temp.denied($q$insert into public.user_roles(user_id,role) values('10000000-0000-4000-8000-000000000001','admin')$q$);
select pg_temp.denied($q$update public.profiles set id='10000000-0000-4000-8000-000000000002'$q$);
select pg_temp.denied($q$insert into public.blood_pressure_readings(user_id,systolic,diastolic,measured_at) values('10000000-0000-4000-8000-000000000002',120,80,now())$q$);
select pg_temp.denied($q$insert into public.quiz_attempts(user_id,game_id,total_questions,score) values('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',1,100)$q$);
select pg_temp.denied('select question_snapshot from public.quiz_attempts');
insert into public.blood_pressure_readings(user_id,systolic,diastolic,measured_at) values
 ('10000000-0000-4000-8000-000000000001',110,75,now());
update public.blood_pressure_readings set notes='owner update';
DO $$ BEGIN
 if (select count(*) from public.blood_pressure_readings) <> 1 then raise exception 'Owner CRUD failed'; end if;
END $$;
delete from public.blood_pressure_readings;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
DO $$ BEGIN
 if exists(select 1 from public.blood_pressure_readings) or exists(select 1 from public.emergency_contacts)
 or exists(select 1 from public.quiz_attempts) then raise exception 'Admin private data leak'; end if;
 if (select count(*) from public.profiles) < 3 then raise exception 'Admin metadata unavailable'; end if;
END $$;
select pg_temp.denied($q$update public.quiz_options set is_correct=false where id='40000000-0000-4000-8000-000000000001'$q$);
select pg_temp.denied($q$insert into public.quiz_questions(game_id,prompt,is_active) values('20000000-0000-4000-8000-000000000001','Invalid',true)$q$);
reset role;
-- History restricts physical deletion even with an elevated database role.
DO $$ BEGIN
 begin
   delete from public.quiz_games where id='20000000-0000-4000-8000-000000000001';
   raise exception 'History deletion unexpectedly succeeded';
 exception when foreign_key_violation then null;
 end;
END $$;
rollback;
