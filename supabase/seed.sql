-- Demo/staging only. Execute after migrations and provisioning, never production.
-- Required per-connection settings, set by the operator:
--   hytecare.seed_allowed = 'true'
--   hytecare.project_ref = exact staging project ref
--   hytecare.expected_project_ref = exact staging project ref
--   hytecare.demo_patient_id = UUID printed by provision-demo-users.ts
--   hytecare.demo_empty_patient_id = UUID printed by provision-demo-users.ts
-- This file never inserts auth.users, truncates tables, or deletes existing data.
begin;
DO $$
DECLARE patient_id uuid := current_setting('hytecare.demo_patient_id', true)::uuid;
DECLARE empty_id uuid := current_setting('hytecare.demo_empty_patient_id', true)::uuid;
BEGIN
 IF current_setting('hytecare.seed_allowed', true) IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Seed requires hytecare.seed_allowed=true'; END IF;
 IF coalesce(current_setting('hytecare.project_ref', true),'') !~ '^[a-z]{20}$'
 OR current_setting('hytecare.project_ref', true) IS DISTINCT FROM current_setting('hytecare.expected_project_ref', true) THEN RAISE EXCEPTION 'Project reference guard failed'; END IF;
 IF patient_id IS NULL OR empty_id IS NULL THEN RAISE EXCEPTION 'Demo patient IDs required'; END IF;
 IF patient_id = empty_id THEN RAISE EXCEPTION 'Demo patients must differ'; END IF;
 IF NOT exists(select 1 from auth.users u join public.user_roles r on r.user_id=u.id where u.id=patient_id and u.email='pasien.demo@hytecare.test' and u.raw_app_meta_data->>'hytecare_demo'='v1' and r.role='patient')
 OR NOT exists(select 1 from auth.users u join public.user_roles r on r.user_id=u.id where u.id=empty_id and u.email='pasien.baru@hytecare.test' and u.raw_app_meta_data->>'hytecare_demo'='v1' and r.role='patient') THEN RAISE EXCEPTION 'Verified demo Auth users required'; END IF;
 IF exists(select 1 from public.blood_pressure_readings where user_id=empty_id) OR exists(select 1 from public.emergency_contacts where user_id=empty_id)
 OR exists(select 1 from public.quiz_attempts where user_id=empty_id) OR exists(select 1 from public.user_article_progress where user_id=empty_id) THEN RAISE EXCEPTION 'Empty demo patient already has data; refusing to delete it'; END IF;
 -- Reserved IDs must not take over unrelated rows; abort transaction before upserts.
 IF exists(select 1 from public.quiz_games where (id::text like 'a0000000-%' or slug in ('dasar-tekanan-darah','mitos-fakta','tantangan-belajar','belajar-harian')) and description not like 'Contoh data%')
 OR exists(select 1 from public.quiz_questions where id::text like 'b0000000-%' and prompt not like 'Contoh:%')
 OR exists(select 1 from public.emergency_contacts where id::text like 'd0000000-%' and (user_id<>patient_id or notes is distinct from 'Contoh data — jangan ditelepon.'))
 OR exists(select 1 from public.quiz_attempts where id::text like 'e0000000-%' and (user_id<>patient_id or question_snapshot->0->>'demo' is distinct from 'true')) THEN RAISE EXCEPTION 'Reserved ID collision with non-demo data'; END IF;
END $$;

insert into public.quiz_games(id,slug,title,description,game_type,is_active) values
 ('a0000000-0000-4000-8000-000000000001','dasar-tekanan-darah','Kuis Dasar','Contoh data — bukan materi klinis final.','quiz',false),
 ('a0000000-0000-4000-8000-000000000002','mitos-fakta','Mitos atau Fakta','Contoh data — bukan materi klinis final.','myth_fact',false),
 ('a0000000-0000-4000-8000-000000000003','tantangan-belajar','Tantangan Belajar','Contoh data — katalog demonstrasi.','challenge',false),
 ('a0000000-0000-4000-8000-000000000004','belajar-harian','Belajar Harian','Contoh data — katalog demonstrasi.','daily',false)
on conflict (id) do nothing;
insert into public.quiz_questions(id,game_id,prompt,explanation,sort_order,is_active) values
 ('b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','Contoh: apakah catatan pengukuran dapat dibawa saat konsultasi?','Ya, catatan dapat membantu percakapan dengan tenaga kesehatan.',1,false),
 ('b0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','Contoh: apakah kuis aplikasi merupakan diagnosis?','Tidak. Kuis hanya edukasi umum.',1,false)
on conflict (id) do update set prompt=excluded.prompt,explanation=excluded.explanation,sort_order=excluded.sort_order;
insert into public.quiz_options(id,question_id,label,is_correct,sort_order) values
 ('c0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','Ya',true,1),
 ('c0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001','Tidak',false,2),
 ('c0000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000002','Mitos',true,1),
 ('c0000000-0000-4000-8000-000000000004','b0000000-0000-4000-8000-000000000002','Fakta',false,2)
on conflict (id) do update set label=excluded.label,is_correct=excluded.is_correct,sort_order=excluded.sort_order;

insert into public.blood_pressure_readings(id,user_id,systolic,diastolic,heart_rate,measured_at,notes)
select md5('hytecare-demo-v1-reading-' || n)::uuid, current_setting('hytecare.demo_patient_id')::uuid, 110 + (n % 9), 70 + (n % 7), case when n % 3 = 0 then null else 66 + (n % 12) end,
 timestamptz '2026-10-11 00:00:00+00' - n * interval '1 day', 'Contoh data — bukan hasil pengukuran nyata'
from generate_series(1,21) n
on conflict (id) do nothing;
insert into public.emergency_contacts(id,user_id,name,relationship,phone_number,contact_type,notes) values
 ('d0000000-0000-4000-8000-000000000001',current_setting('hytecare.demo_patient_id')::uuid,'Kontak Demo Satu','Keluarga','DEMO-NOT-DIALABLE-001','personal','Contoh data — jangan ditelepon.'),
 ('d0000000-0000-4000-8000-000000000002',current_setting('hytecare.demo_patient_id')::uuid,'Kontak Demo Dua','Teman','DEMO-NOT-DIALABLE-002','personal','Contoh data — jangan ditelepon.'),
 ('d0000000-0000-4000-8000-000000000003',current_setting('hytecare.demo_patient_id')::uuid,'Kontak Demo Tiga','Lainnya','DEMO-NOT-DIALABLE-003','personal','Contoh data — jangan ditelepon.')
on conflict (id) do update set name=excluded.name,relationship=excluded.relationship,phone_number=excluded.phone_number,notes=excluded.notes;
insert into public.quiz_attempts(id,user_id,game_id,score,total_questions,started_at,completed_at,status,question_snapshot) values
 ('e0000000-0000-4000-8000-000000000001',current_setting('hytecare.demo_patient_id')::uuid,'a0000000-0000-4000-8000-000000000001',1,1,timestamptz '2026-10-06 00:00:00+00',timestamptz '2026-10-06 00:05:00+00','completed','[{"demo":true,"prompt":"Contoh soal edukasi","correct_option":"Ya"}]'),
 ('e0000000-0000-4000-8000-000000000002',current_setting('hytecare.demo_patient_id')::uuid,'a0000000-0000-4000-8000-000000000002',1,1,timestamptz '2026-10-09 00:00:00+00',timestamptz '2026-10-09 00:04:00+00','completed','[{"demo":true,"prompt":"Contoh soal mitos/fakta","correct_option":"Mitos"}]')
on conflict (id) do update set score=excluded.score,total_questions=excluded.total_questions,status=excluded.status,question_snapshot=excluded.question_snapshot;
insert into public.quiz_answers(id,attempt_id,question_id,selected_option_id,is_correct,prompt_snapshot,option_label_snapshot) values
 ('f0000000-0000-4000-8000-000000000001','e0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001',true,'Contoh soal edukasi','Ya'),
 ('f0000000-0000-4000-8000-000000000002','e0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000003',true,'Contoh soal mitos/fakta','Mitos')
on conflict (attempt_id,question_id) do update set selected_option_id=excluded.selected_option_id,is_correct=excluded.is_correct,option_label_snapshot=excluded.option_label_snapshot;
commit;
