-- Verifikasi izin RPC admin di Supabase staging
begin;

-- Pasien tidak diizinkan memanggil save_question
set local role authenticated;
set local request.jwt.claims to '{"sub":"20000000-0000-4000-8000-000000000002"}';
select public.is_admin(); -- false

-- Panggilan pasien harus melempar exception 42501
do $$
begin
  perform public.admin_save_question('10000000-0000-4000-8000-000000000001','T','E',0,false,'[{"label":"A","is_correct":true},{"label":"B","is_correct":false}]'::jsonb);
  raise exception 'Pasien seharusnya ditolak memanggil admin_save_question';
exception when sqlstate '42501' then
  -- Expected PASS
end $$;

rollback;
