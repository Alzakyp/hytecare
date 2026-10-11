# HyteCare Foundation Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inisiasi fondasi HyteCare yang dapat dijalankan, menjaga pemisahan role/data pasien di Supabase Cloud, dan menyediakan shell responsive serta data demonstrasi terproteksi.

**Architecture:** Satu Next.js App Router; sesi Supabase SSR untuk server dan browser. Database RLS/column grants menjadi boundary otorisasi; browser tidak memakai service-role. Seed hanya berjalan dengan persetujuan operator serta allowlist proyek Cloud staging.

**Tech Stack:** Next.js 15 (patch keamanan terbaru di major tersebut), React 19, TypeScript, Tailwind, shadcn/ui hanya saat dibutuhkan, `@supabase/ssr`, `@supabase/supabase-js`, Node test runner (`node --test`) atau Vitest bila TypeScript import memerlukan runner.

**Spec:** `docs/superpowers/specs/2026-10-11-hytecare-foundation-design.md`

## Global Constraints

- Lokasi `/Users/alzaky/Applications/hytecare`; tidak mengubah project tetangga.
- Sepuluh tabel aplikasi; tidak ada tabel artikel, preferences atau audit log.
- Bahasa ID default/EN UI inti; konten edukasi tidak boleh diklaim hasil review klinis.
- Pasien mobile-first 320/390/768/1440 px; admin desktop-first responsive.
- Registrasi default **nonaktif**; admin hanya diprovisioning tepercaya.
- Tidak ada service-role di runtime request/browser; hanya proses seed offline/server.
- Fase ini belum mencakup CRUD klinis maupun UI/scoring kuis lengkap. Route belum selesai menampilkan status pengembangan, bukan data fiktif tanpa label.
- Jangan jalankan migration/seed Cloud atau klaim lulus integrasi tanpa project staging dan izin operator.

## Peta file dan batas

`src/lib/supabase/{browser,server,proxy}.ts` membuat client berdasarkan konteks; `src/lib/auth/{roles,actions}.ts` memeriksa sesi/role dan menjalankan auth actions; `src/middleware.ts` hanya refresh sesi/redirect kasar. `src/app/(auth)` halaman auth/callback; `(patient)` dan `(admin)` layout dengan guard server, masing-masing komponen navigasi di `src/components/`. `supabase/migrations/*.sql` mengunci tabel, grants, RLS, trigger; `tests/db/*.sql` menguji permission dengan identitas impersonasi di database staging. `scripts/provision-demo-users.ts` hanya untuk provisioning Auth offline; `supabase/seed.sql` hanya seed non-Auth. `src/data/articles.ts` memuat slug demonstrasi. `design.md` hanya instruksi desain yang konsisten dengan PRD.

---

### Task 1: Bootstrap app yang bisa dibangun

**Files:** Create `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/{layout,page,globals.css}`, `.gitignore`, `.env.local.example`, `README.md`, `tests/bootstrap.test.mjs`.

**Interfaces:** `npm test`, `npm run lint`, `npm run build`; environment `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `APP_URL`, `ENABLE_REGISTRATION=false`. Script seed punya environment terpisah; jangan masukkan service-role di example variabel `NEXT_PUBLIC_*`.

- [ ] Tulis failing test `tests/bootstrap.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('environment tidak membocorkan service-role', () => {
  const env = readFileSync('.env.local.example', 'utf8');
  assert.match(env, /ENABLE_REGISTRATION=false/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_.*SERVICE_ROLE/i);
});
```

- [ ] Jalankan `node --test tests/bootstrap.test.mjs`; harus gagal karena file belum ada.
- [ ] Jalankan `npx create-next-app@15 . --ts --tailwind --eslint --app --src-dir --use-npm --no-turbopack` dalam direktori root; jika CLI menolak folder berisi docs, scaffold ke direktori sementara **di dalam root**, pindahkan hanya file app/config tanpa menimpa docs atau `.git`. Pin Next 15 patch terbaru yang tersedia; pasang `@supabase/ssr @supabase/supabase-js lucide-react` tanpa shadcn component belum dipakai. Lengkapi env example dan gitignore; scripts `test: node --test tests/*.test.mjs`, `lint: next lint` hanya jika tersedia di versi terpasang, bila tidak `eslint .`. Root `/` sementara menampilkan tautan login, diganti Task 4. README memuat perintah start, belum mengklaim fitur jadi.
- [ ] Jalankan `npm test && npm run lint && npm run build`; semuanya sukses; commit `chore: bootstrap HyteCare app`.

### Task 2: Schema dan policy keamanan database

**Files:** Create `supabase/migrations/202610110001_schema.sql`, `supabase/migrations/202610110002_security.sql`, `tests/db/permissions.sql`, `docs/erd.md`.

**Interfaces:** `public.is_admin()` mengembalikan boolean berdasarkan `auth.uid()`; user_roles satu-satunya sumber role; auth trigger menambah profile/role patient tanpa mempercayai metadata role. Tabel mengikuti tepat 10 nama di spec. Migration file diterapkan berurutan via Supabase CLI pada staging setelah persetujuan operator; `tests/db/permissions.sql` dapat dijalankan dalam transaksi lalu `ROLLBACK`.

- [ ] Buat `tests/db/permissions.sql` terlebih dahulu; minimal pernyataan executable:

```sql
begin;
-- Eksekusi di database staging dengan pgTAP bila tersedia; tanpa pgTAP,
-- DO blocks yang RAISE EXCEPTION saat pengujian izin gagal.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM pg_tables
  WHERE schemaname = 'public' AND tablename IN
  ('profiles','user_roles','blood_pressure_readings','quiz_games','quiz_questions',
   'quiz_options','quiz_attempts','quiz_answers','emergency_contacts','user_article_progress')
  AND rowsecurity;
  IF n <> 10 THEN RAISE EXCEPTION 'RLS missing: %/10', n; END IF;
END $$;
rollback;
```

- [ ] Jalankan SQL di database staging kosong **hanya jika tersedia**; ekspektasi gagal sebelum migration. Tanpa akses Cloud, tandai DB integration `NOT RUN`, bukan mengklaim PASS.
- [ ] Implementasi schema: PK UUID (`gen_random_uuid()`), FK auth/profiles, timestamp UTC `timestamptz`, checks angka positif, indeks `(user_id,measured_at DESC)`, `(user_id,started_at DESC)`, `(game_id,is_active,sort_order)`, `(question_id,sort_order)`, unique progress dan answers. Quiz games/questions archived_at; relasi history RESTRICT agar tidak rusak. Snapshot attempt dan answer server-only; tidak ada client grant atas snapshot/kunci. Trigger signup `SECURITY DEFINER SET search_path = ''`, insert profile/role patient; trigger profile update dibatasi kolom agar ID/avatar metadata sensitif tidak berubah.
- [ ] Implementasi policy tiap tabel dan uji manual lewat role `authenticated` + `request.jwt.claim.sub` dari dua UUID akun test: patient A dapat CRUD data A dan tidak data B; admin tidak dapat raw readings/contact; client tidak dapat INSERT attempts/answers/score; options.is_correct dan question.explanation serta snapshot tidak dapat dibaca patient meski SELECT eksplisit. Gunakan REVOKE column grants atau private schema/server RPC; **jangan grant SELECT tabel quiz_options lalu filter di frontend**. Admin management lewat policy admin khusus di konten quiz; check helper nonrekursif. Trigger validasi aktivasi soal minimal dua opsi dan satu correct, serta menolak mutasi opsi yang melanggar soal aktif. Guard pengarsipan game/soal saat attempt masih berjalan; frozen snapshot jawaban mencegah perubahan skor historis.
- [ ] `docs/erd.md`: diagram Mermaid 10 tabel + `auth.users`, FK dan batas privasi. Jalankan SQL tests dari `tests/db/permissions.sql` setelah migration di staging; tambah SQL assertion negatif menggunakan `SET LOCAL ROLE authenticated` dan JWT test claims. `ROLLBACK` wajib menjaga staging. Commit `feat(db): schema and enforced role privacy`.

### Task 3: Supabase SSR client dan otorisasi server

**Files:** Create `src/lib/supabase/{browser,server,proxy}.ts`, `src/lib/auth/roles.ts`, `src/middleware.ts`, `tests/roles.test.mjs`.

**Interfaces:** `destination(role: 'patient'|'admin'|null, pathname: string): string|null`; `requireRole(role)` memanggil Supabase `auth.getUser()` lalu baca user_roles.id via authenticated client, `redirect('/login')` tanpa sesi, `redirect('/403')` bila role salah. Jangan menerima role dari localStorage, user_metadata atau argumen request.

- [ ] Tulis test Node untuk fungsi pure `destination` (letakkan JS/TS import sesuai runner terpilih):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { destination } from '../src/lib/auth/roles.js';
test('role path', () => {
  assert.equal(destination(null, '/dashboard'), '/login');
  assert.equal(destination('patient', '/admin/dashboard'), '/403');
  assert.equal(destination('admin', '/'), '/admin/dashboard');
  assert.equal(destination('patient', '/tracker'), null);
});
```

- [ ] Jalankan `npm test`; gagal karena module belum ada.
- [ ] Buat fungsi pure dalam `src/lib/auth/roles.ts` dan pilih runner TS (`tsx --test tests/*.test.ts`) **atau** isolasi pure JS dan JSDoc agar test Node di atas executable; konsisten untuk task berikutnya. Supabase SSR server dengan cookies `getAll/setAll`, proxy middleware refresh via `auth.getUser()` dan `NextResponse` cookie propagation; role lookup untuk redirect hanya dari DB. Middleware bukan boundary final, layout/action memanggil `requireRole()` ulang. Jika role kosong/error DB, tolak akses; jangan fallback admin/patient.
- [ ] Jalankan `npm test && npm run build`; commit `feat(auth): verified server role guards`.

### Task 4: Login, logout, recovery, registrasi gated

**Files:** Create `src/lib/auth/actions.ts`, `src/app/(auth)/{login,register,forgot-password,reset-password}/page.tsx`, `src/app/auth/callback/route.ts`, `src/app/{403/page,not-found}.tsx`; Modify `src/app/page.tsx`, `src/app/layout.tsx`; Test `tests/auth-routes.test.mjs` (atau TS sesuai Task 3).

**Interfaces:** server actions `signIn`, `signOut`, `registerPatient`, `requestPasswordReset`, `updatePassword`; root redirect via server-confirmed role. `APP_URL` fixed origin untuk auth callback/recovery, no arbitrary `next` open redirect.

- [ ] Tulis test untuk reject return URL eksternal dan registrasi default disabled; ekspor helper `safeReturnPath(value: string|null): string` dan `registrationEnabled(env: Record<string,string|undefined>): boolean`. Assert `safeReturnPath('//evil.test') === '/dashboard'`, `safeReturnPath('https://evil.test') === '/dashboard'`, `registrationEnabled({}) === false`.
- [ ] Jalankan `npm test`; gagal. Implementasi helper dan semua routes. Sign-in `auth.signInWithPassword`, forgot `auth.resetPasswordForEmail` dengan response generik, reset `auth.updateUser` hanya dari recovery session valid, logout `auth.signOut`. Registrasi gated server dengan `ENABLE_REGISTRATION === 'true'`, role selalu dibuat oleh DB trigger patient. Login form ID, `type=email`, required/password, fokus, errors, pending state; callback `exchangeCodeForSession` hanya URL internal allowlisted. Root `auth.getUser()` + role check; `/403` dan not-found tidak membuka detail sensitif.
- [ ] Jalankan `npm test && npm run lint && npm run build`. Manual Auth Cloud staging hanya setelah env/permission diberikan; uji expired session, missing role, reset token invalid dan redirect aman. Commit `feat(auth): login recovery and guarded registration`.

### Task 5: Shell pasien/admin, bilingual UI inti

**Files:** Create `src/lib/i18n.ts`, `src/components/{patient-nav,admin-nav,locale-switch}.tsx`, `src/app/(patient)/layout.tsx`, `src/app/(patient)/{dashboard,tracker,edukasi,game,lainnya,kontak-darurat,profil}/page.tsx`, `src/app/(admin)/layout.tsx`, `src/app/(admin)/admin/{dashboard,users,games,questions,profile}/page.tsx`; Modify `src/app/globals.css`; Test `tests/navigation.test.mjs` (atau TS).

**Interfaces:** `patientItems` berisi `['/dashboard','/tracker','/edukasi','/game','/lainnya']`; `adminItems` hanya dashboard/users/games/questions/profile. Layout memanggil `requireRole`. Pilihan ID/EN di localStorage untuk UI saja; default ID; tidak menyimpan data kesehatan.

- [ ] Test array navigasi pure: tepat lima item pasien; admin tanpa route articles/audit-logs; semua href internal. Jalankan `npm test` (gagal sebelum export).
- [ ] Implementasi CSS variables brand, kontras teruji, ukuran target 44 px, safe-area bottom `env(safe-area-inset-bottom)`, responsive nav, focus-visible; menu Lainnya ke Kontak Darurat/Profil. Halaman fungsi belum jadi menampilkan empty/unavailable state jujur, bukan pengukuran palsu. Footer/disclaimer non-diagnostik. Admin shell sidebar desktop dan drawer mobile, tidak ada akses data kesehatan. `requireRole('patient')` dan `requireRole('admin')` di masing-masing layout.
- [ ] Jalankan tests/lint/build. Review manual browser 320, 390×844, 768, 1440; cek no horizontal overflow, keyboard focus, active state, safe-area, ID/EN. Tanpa browser siap, tandai `NOT RUN`, bukan klaim lolos. Commit `feat(ui): patient and admin role shells`.

### Task 6: Artikel statis, desain Stitch sinkron

**Files:** Create `src/data/articles.ts`, `design.md`, `tests/articles.test.mjs` (atau TS); Modify `src/app/(patient)/edukasi/page.tsx` hanya bila berguna menampilkan listing demo yang diberi label.

**Interfaces:** `articles` dengan slug unik, locale, source, reviewedAt (null bila belum direview), title/summary/body, kategori. `getArticle(slug)` returns article atau undefined. Tidak ada table artikel/admin CRUD.

- [ ] Test slug unik, sumber terisi, `reviewedAt === null` untuk materi demo belum disetujui; slug bookmark demo diketahui. Jalankan gagal.
- [ ] Minimal 3 artikel contoh umum, jelas label belum review dan **tidak memuat instruksi klinis spesifik**. `design.md`: login-first, dua role, bottom nav lima item, admin quiz CRUD/preview, tidak ada article/category CRUD, preference table, audit log, angka kesehatan admin, atau tombol status akun. Jangan kirim ke Stitch tanpa permintaan.
- [ ] Jalankan test/lint/build; commit `docs: align Stitch design and static demo education`.

### Task 7: Seed staging aman dan idempotent

**Files:** Create `scripts/provision-demo-users.ts`, `scripts/seed-guard.ts`, `supabase/seed.sql`, `tests/seed-guard.test.mjs` (atau TS); Modify `.env.local.example`, `README.md`.

**Interfaces:** `assertDemoTarget(url, allowedHost, enabled): void` memeriksa HTTPS exact hostname `.supabase.co`, enabled `true`, exact allowlisted project host. SQL seed di satu transaction dengan guard PostgreSQL `current_setting('hytecare.seed_allowed', true) = 'true'` dan `current_setting('hytecare.project_ref', true)` exact expected project ref; **operator harus set dua setting ini sendiri pada koneksi staging yang cocok**. Tidak ada deteksi otomatis 'non-production' yang bisa dipercaya.

- [ ] Tulis test: flag false, host prod, lookalike hostname, URL HTTP dan URL dengan userinfo harus throw; exact allowlisted HTTPS host harus lolos. Jalankan gagal.
- [ ] Implementasi guard memakai `new URL()`, perbandingan `hostname === allowedHost`, protocol HTTPS, port/path kosong atau `/`, username/password kosong. Provision via Admin API `createUser` untuk tiga email `.test`: patient populated, patient empty, admin. Password dari env; paginated `listUsers` lalu berhenti bila existing akun tidak bertanda demo pada app_metadata tepercaya; jangan reset password existing atau assign admin ke akun non-demo. Admin role hanya disetel melalui koneksi provisioning tepercaya setelah akun terbukti demo; bukan browser.
- [ ] SQL deterministic UUID/upsert terbatasi marker demo: empat game + questions/options (satu kunci), 21 readings lintas hari, tiga kontak nomor non-dialable, 3–5 progress slug valid, dua/tiga attempts + answer/score konsisten, patient empty tanpa data. Gunakan UUID dari auth users hasil provisioning sebagai input SQL; tidak INSERT manual `auth.users`; transaction+guard+FK. Seed rerun tidak duplicate; jangan DELETE existing rows. Mark demo secara eksplisit, dan pastikan kontak placeholder bukan `tel:`.
- [ ] Jalankan tests/lint/build. Seed Cloud **hanya jika** operator telah memberi host staging, consent, dan env; jalankan dua kali dalam transaksi/preview staging, cek counts tetap sama dan data lain tidak berubah. Jika tidak ada env, dokumentasikan `NOT RUN` di README, bukan mengklaim seed berhasil. Commit `feat(seed): guarded demo provisioning and idempotent data`.

### Task 8: Integrasi final dan serah-terima

**Files:** Modify `README.md`, `docs/erd.md` bila perilaku nyata berbeda; no new feature.

- [ ] Jalankan `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`; catat output/failures. Jalankan SQL tests/role scenarios staging **hanya bila** project dan izin tersedia; jika tidak, cantumkan belum diverifikasi.
- [ ] Review `git diff` untuk secrets dan file generated; `rg -n 'service_role|password|PRIVATE_KEY' src .env.local.example` lalu inspeksi hit (nama variabel boleh, nilai tidak). Pastikan `git status --short` bersih setelah dokumentasi/commit.
- [ ] Cek route matrix: `/` unauth/login, patient dashboard, admin dashboard; cross-role 403; tanpa akun staging, cek lewat unit tests saja dan laporkan batasnya.
- [ ] Commit hanya perubahan nyata yang belum dikomit; jangan tag release bila migration/RLS Cloud belum teruji. Serah-terima fase berikutnya: CRUD tracker/kontak, edukasi/progress, quiz admin/server scoring, dashboard agregat aman.
