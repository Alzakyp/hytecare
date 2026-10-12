# HyteCare

Fondasi aplikasi pencatatan dan edukasi hipertensi. **Belum siap produksi**; bukan alat diagnosis.

## Lokal

```bash
cp .env.local.example .env.local
# Isi URL dan anon key dari project Supabase Cloud staging; jangan commit file ini.
npm ci
npm run dev
```

Registrasi publik nonaktif secara default. Jangan jalankan migration atau seed pada project produksi.

## Supabase Cloud staging

1. Buat `.env.local` dari `.env.local.example`; isi URL dan publishable key.
2. Terapkan migration dari `supabase/migrations/` pada project staging melalui Supabase CLI/dashboard SQL.
3. Provision akun demo hanya dari mesin tepercaya: isi `SUPABASE_SERVICE_ROLE_KEY`, `HYTECARE_DEMO_PASSWORD` (12+ karakter), `HYTECARE_ALLOW_SEED=true`, serta host staging exact di `HYTECARE_ALLOWED_SUPABASE_HOSTS`; jalankan `npx tsx scripts/provision-demo-users.ts`.
4. Jalankan `supabase/seed.sql` hanya pada koneksi staging dengan setting `hytecare.seed_allowed=true`, `hytecare.project_ref` sama persis dengan `hytecare.expected_project_ref`, dan UUID pasien hasil provisioning. Script tidak membuat `auth.users`, tidak truncate, tidak delete.

Seeder menolak HTTP, hostname bukan `*.supabase.co`, host tidak allowlisted, flag tidak aktif, dan collision akun non-demo. Ulang seed hanya menyentuh row marker/UUID demo. Akun password dan service-role tidak boleh masuk repository, browser, atau log.

## Migration Admin Staging

Jalankan migration berurutan pada Supabase SQL Editor:
1. `supabase/migrations/202610120001_admin_quiz_rpc.sql` (CRUD kuis/soal/opsi transaksional)
2. `supabase/migrations/202610120002_admin_users_and_dashboard.sql` (Status akun, audit log, daftar pengguna, ringkasan agregat)

Untuk manajemen pengguna (`/admin/users`), tambahkan `SUPABASE_SERVICE_ROLE_KEY` pada Environment Variables Vercel (server-only).

