# Admin Users, Dashboard, and Profile Design

Status: desain disetujui; menunggu review spesifikasi sebelum implementation plan.

## Tujuan

Melengkapi konsol admin dengan pengelolaan akun, ringkasan operasional non-medis, dan profil admin. Admin dapat membuat serta mengelola akses akun tanpa membaca rekam kesehatan pasien.

## Scope

Termasuk:
- Daftar pengguna dengan pencarian, filter role/status, dan pagination.
- Membuat akun patient/admin.
- Mengubah nama, email, dan role.
- Menonaktifkan/mengaktifkan akun secara reversible.
- Dashboard: jumlah akun aktif/nonaktif, patient/admin, game aktif, soal aktif.
- Profil admin: melihat email, mengubah nama, logout.
- Audit perubahan akun oleh admin.

Tidak termasuk:
- Reset/kirim password.
- Ubah password admin.
- Hapus permanen akun.
- Melihat raw/agregat data kesehatan, tekanan darah, kontak darurat, attempt individual, atau jawaban individual.
- Bulk import/export dan impersonation.

## Model Data

Migration baru menambah:

### `public.account_status`
- `user_id uuid primary key references public.profiles(id) on delete restrict`
- `is_active boolean not null default true`
- `disabled_at timestamptz null`
- `disabled_by uuid null references public.profiles(id) on delete restrict`
- `updated_at timestamptz not null default now()`

Trigger signup membuat row status aktif. Backfill membuat status aktif untuk akun existing. RLS: user dapat membaca status sendiri; admin dapat membaca semua. Tidak ada mutasi langsung dari browser.

### `public.admin_audit_log`
- `id uuid primary key`
- `actor_id uuid not null references public.profiles(id) on delete restrict`
- `target_user_id uuid not null references public.profiles(id) on delete restrict`
- `action text not null` dengan allowlist: `create`, `update_profile`, `change_email`, `change_role`, `disable`, `enable`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`

Audit metadata hanya menyimpan field berubah dan nilai role/status; tidak password, token, data kesehatan, atau secret. Admin dapat membaca audit bila nanti dibutuhkan, tetapi UI audit tidak termasuk scope ini.

## Supabase Auth Admin Boundary

Pembuatan akun, pengubahan email, dan ban/unban memerlukan Supabase Auth Admin API. Client service-role dibuat dalam modul server-only terpisah dan hanya dipanggil Server Actions setelah `requireRole('admin')`.

Secret `SUPABASE_SERVICE_ROLE_KEY` hanya berada di environment deployment/server lokal yang di-ignore. Nilainya tidak masuk repository, browser bundle, error response, atau log. Contoh environment hanya mendokumentasikan nama variabel dengan nilai kosong bila dibutuhkan operator.

Pembuatan user memakai password sementara yang dimasukkan admin dan `email_confirm: true`. Password minimal 8 karakter, tidak dicatat di audit, dan tidak ditampilkan ulang. Karena reset password dikeluarkan dari scope, admin harus menyampaikan password sementara lewat kanal yang disepakati di luar aplikasi. Risiko ini ditampilkan jelas pada form.

## Operasi Pengguna

### Create
1. Validasi nama, email, role, password sementara.
2. Buat Auth user dengan Admin API.
3. Trigger membuat profile, role patient default, account status active.
4. Update role yang dipilih dan display name.
5. Tulis audit.
6. Bila langkah DB setelah Auth gagal, hapus Auth user yang baru dibuat sebagai kompensasi agar tidak ada akun setengah jadi.

### Update
- Nama: update `profiles`.
- Email: Admin API `updateUserById`; email dianggap terkonfirmasi karena dilakukan admin.
- Role: update `user_roles` melalui RPC terotorisasi.
- Semua perubahan dicatat audit.

### Disable/Enable
Gunakan Admin API ban/unban serta sinkronkan `account_status`. Proxy/server guard memeriksa status setelah auth dan menolak akun nonaktif menuju halaman aplikasi. Disable mencabut sesi aktif melalui Admin API sign-out user bila dukungan API tersedia; minimal ban membuat refresh/login berikutnya ditolak.

Tidak ada delete permanen di UI/API aplikasi.

## Invariant Keamanan

- Admin tidak dapat menonaktifkan diri sendiri.
- Admin tidak dapat menurunkan role dirinya sendiri.
- Admin terakhir tidak dapat diturunkan atau dinonaktifkan.
- Semua invariant ditegakkan server/database, bukan hanya tombol UI.
- Mutasi role/status menggunakan RPC `SECURITY DEFINER`, `search_path=''`, pemeriksaan `public.is_admin()`, dan locking yang mencegah race pada pemeriksaan admin terakhir.
- RPC Auth-dependent tetap dipanggil dari Server Action; service-role tidak menggantikan pemeriksaan sesi actor.
- Input ID target selalu divalidasi UUID; server tidak mempercayai role/status dari UI.
- Daftar user tidak join tabel kesehatan.

## Routes dan UI

### `/admin/users`
- Header dan CTA `Tambah Pengguna`.
- Query `q`, `role`, `status`, `page`; pagination server-side, 20 row per halaman.
- Kolom desktop: nama, email, role, status, bergabung, aksi.
- Kartu mobile dengan data sama.
- Empty, loading, query-error state.
- Tombol edit dan enable/disable; destructive action meminta konfirmasi nama/email target.

Email berasal dari Auth Admin list/get endpoint, digabung server-side dengan profile/role/status. Hanya field yang dibutuhkan dikirim ke Client Component.

### `/admin/users/new`
Form nama, email, role, password sementara. Penjelasan bahwa aplikasi tidak mengirim reset password.

### `/admin/users/[id]/edit`
Form nama, email, role. Tidak menampilkan atau mengubah password. Guard self/last-admin terlihat sebagai pesan dan disabled control, tetapi server tetap sumber kebenaran.

### `/admin/dashboard`
Cards:
- Total akun aktif.
- Total akun nonaktif.
- Total patient/admin.
- Game aktif.
- Soal aktif.

Tidak ada chart atau tren karena belum ada kebutuhan. Query memakai RPC agregat `admin_dashboard_counts()` agar payload kecil dan boundary eksplisit.

### `/admin/profile`
Pakai pola profil pasien dengan label role Admin: email readonly, edit nama, logout. Action profile digeneralisasi agar role patient/admin dapat memperbarui profil sendiri tanpa duplikasi.

## Error Handling

- Secret server hilang: tampilkan error konfigurasi generik ke UI; detail hanya log server tanpa secret.
- Email duplikat/invalid: pesan spesifik aman.
- Race admin terakhir: database menolak; UI menampilkan pesan bahwa minimal satu admin aktif wajib tersisa.
- Auth mutation berhasil tetapi DB gagal: kompensasi ketika aman; untuk update, tampilkan failure dan catat server error untuk rekonsiliasi. Tidak membuat audit sukses bila operasi belum konsisten.
- Pagination di luar batas kembali ke halaman terakhir/empty secara aman.

## Testing

Unit:
- Parser create/update user.
- Password sementara minimal 8 karakter.
- Search/filter/page normalization.
- Error mapping Auth Admin API.

SQL contract:
- Patient ditolak dari RPC admin.
- Self-demotion/self-disable ditolak.
- Last active admin tidak dapat diturunkan/dinonaktifkan.
- Audit dibuat untuk mutasi sukses; tidak dibuat pada rollback.
- Dashboard RPC tidak mengakses tabel kesehatan.

Application:
- Server-only module tidak masuk client graph.
- List pagination/filter.
- Create compensation pada DB failure dengan mocked boundary.
- Profile admin update nama.
- Lint, TypeScript, production build.

## Deployment

1. Backup dan konfirmasi project Supabase target.
2. Terapkan migration DB baru.
3. Set `SUPABASE_SERVICE_ROLE_KEY` pada environment Vercel server-side.
4. Deploy aplikasi.
5. Smoke test dengan dua admin agar invariant last-admin dapat diuji tanpa mengunci operator.
6. Jangan menampilkan fitur pengguna sebelum migration dan secret tersedia.
