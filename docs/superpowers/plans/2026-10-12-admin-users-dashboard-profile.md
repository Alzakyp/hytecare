# Admin Users, Dashboard, and Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Konsol admin memiliki pengelolaan akun pengguna (CRUD non-medis tanpa reset password), ringkasan operasional agregat, dan profil admin fungsional, dengan jaminan privasi data pasien tetap terlindungi.

**Architecture:** Database schema menambah status akun dan audit log; RPC mengelola mutasi role/status dengan locking untuk menjaga invariant minimal 1 admin aktif; Supabase Auth Admin API digunakan di server-side untuk pembuatan/perubahan akun Auth; UI responsive Next.js App Router menghubungkan Server Actions ke halaman admin.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase Cloud (PostgreSQL + Auth Admin API), Tailwind CSS, Lucide React, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-12-admin-users-dashboard-profile-design.md`

## Global Constraints

- Wajib guard `requireRole('admin')` di seluruh route dan actions admin.
- Dilarang membaca, memproyeksikan, atau mengekspos tabel kesehatan individual (`blood_pressure_readings`, `emergency_contacts`).
- Invariant: admin tidak dapat menonaktifkan atau menurunkan role dirinya sendiri; minimal satu admin aktif wajib selalu tersisa.
- Kredensial service-role tidak boleh bocor ke client bundle, public repo, atau log.
- Jangan terapkan migration SQL ke Cloud staging tanpa persetujuan operator.

---

### Task 1: Migration SQL untuk Status Akun, Audit, dan RPC Guard

**Files:** Create `supabase/migrations/202610120002_admin_users_and_dashboard.sql`, `tests/admin-users-schema.test.mjs`, `tests/db/admin_users_permissions.sql`.

**Interfaces:**
- Table `public.account_status`, `public.admin_audit_log`
- RPC `public.admin_dashboard_counts(): jsonb`
- RPC `public.admin_update_user_role(p_target_id uuid, p_role text): void`
- RPC `public.admin_set_user_status(p_target_id uuid, p_active boolean): void`

- [ ] Tulis failing test di `tests/admin-users-schema.test.mjs` untuk memverifikasi definisi tabel status akun, audit log, RLS, dan RPC dengan security definer.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Tulis `supabase/migrations/202610120002_admin_users_and_dashboard.sql` dengan trigger pembuatan status akun otomatis, RLS policies, pencegahan self-demotion/self-disable, dan locking untuk last active admin.
- [ ] Buat SQL permission test di `tests/db/admin_users_permissions.sql`.
- [ ] Jalankan test dan commit `feat(db): add account status, audit log, and admin operational RPCs`.

### Task 2: Pure Helper Validasi dan Normalisasi Akun Pengguna

**Files:** Create `src/lib/admin/users/validation.ts`, `tests/admin-users-validation.test.mjs`.

**Interfaces:**
- `validateCreateUser(input: unknown): { ok: true; value: CreateUserInput } | { ok: false; error: string }`
- `validateUpdateUser(input: unknown): { ok: true; value: UpdateUserInput } | { ok: false; error: string }`
- `normalizeUserQuery(searchParams: Record<string, string | string[] | undefined>): ParsedUserQuery`

- [ ] Tulis failing test untuk email invalid, nama kosong/panjang, password kurang dari 8 karakter, role di luar 'admin'|'patient', dan normalisasi filter pagination.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan fungsi validasi murni di `src/lib/admin/users/validation.ts`.
- [ ] Jalankan test hingga PASS dan commit `feat: add admin users pure validation helpers`.

### Task 3: Modul Server-Only Supabase Auth Admin

**Files:** Create `src/lib/supabase/admin.ts`, `tests/admin-client-boundary.test.mjs`.

**Interfaces:**
- `createAdminClient(): SupabaseClient`
- Menolak eksekusi pada client side atau ketika `SUPABASE_SERVICE_ROLE_KEY` kosong.

- [ ] Tulis failing test untuk memverifikasi pemanggilan helper melempar error aman bila env service role tidak tersedia dan tidak mengekspos raw token.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan `createAdminClient()` di `src/lib/supabase/admin.ts` dengan impor `server-only`.
- [ ] Jalankan test hingga PASS dan commit `feat: add server-only supabase auth admin client`.

### Task 4: Server Actions untuk CRUD Pengguna Admin

**Files:** Create `src/lib/admin/users/actions.ts`, `tests/admin-users-actions-contract.test.mjs`.

**Interfaces:**
- `createUser(previous: ActionState, form: FormData): Promise<ActionState>`
- `updateUser(previous: ActionState, form: FormData): Promise<ActionState>`
- `toggleUserStatus(userId: string, makeActive: boolean): Promise<ActionState>`

- [ ] Tulis failing contract test untuk error mapping (email duplikat, self-disable, last-admin reject).
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan Server Actions dengan kompensasi penghapusan akun Auth bila integrasi DB gagal saat create, pemanggilan RPC untuk update role/status, dan penulisan audit log.
- [ ] Jalankan test dan commit `feat: add admin users server actions with audit and guards`.

### Task 5: UI Pengelolaan Pengguna (`/admin/users`, `/new`, `/[id]/edit`)

**Files:** Create `src/components/admin/user-form.tsx`, `src/components/admin/user-list.tsx`, Modify `src/app/(admin)/admin/users/page.tsx`, Create `src/app/(admin)/admin/users/new/page.tsx`, `src/app/(admin)/admin/users/[id]/edit/page.tsx`.

- [ ] Bangun komponen form tambah pengguna (nama, email, role, password sementara tanpa opsi reset password) dan form edit pengguna.
- [ ] Bangun tabel dan kartu pengguna responsif dengan filter role, status, pencarian nama/email, dan pagination 20 item.
- [ ] Tambahkan modal konfirmasi untuk pengaktifan/penonaktifan akun dengan nama target.
- [ ] Jalankan lint, typecheck, dan commit `feat(ui): implement admin users management pages`.

### Task 6: Ringkasan Operasional Dashboard (`/admin/dashboard`)

**Files:** Modify `src/app/(admin)/admin/dashboard/page.tsx`, Create `src/components/admin/dashboard-cards.tsx`.

- [ ] Hubungkan dashboard dengan RPC `admin_dashboard_counts()`: akun aktif/nonaktif, total patient, total admin, game aktif, soal aktif.
- [ ] Desain kartu metrik operasional bersih mengikuti tema HyteCare tanpa menyentuh data klinis.
- [ ] Jalankan build dan commit `feat(ui): implement aggregate operational dashboard`.

### Task 7: Halaman Profil Admin (`/admin/profile`)

**Files:** Modify `src/app/(admin)/admin/profile/page.tsx`, Modify `src/lib/profile/actions.ts`.

- [ ] Generalisasikan `updateDisplayName` di `src/lib/profile/actions.ts` agar mendukung sesi admin dan redirect revalidasi yang sesuai.
- [ ] Hubungkan `AdminProfilePage` dengan informasi akun admin (email readonly, edit display name, tombol logout).
- [ ] Jalankan build dan commit `feat(ui): implement admin profile management`.

### Task 8: Verifikasi Menyeluruh dan Dokumentasi

**Files:** Modify `README.md`.

- [ ] Jalankan seluruh unit test suite: pastikan semua PASS.
- [ ] Jalankan `npm run lint` dan `npx tsc --noEmit`.
- [ ] Jalankan `npm run build` dan verifikasi semua rute admin terkompilasi bersih.
- [ ] Dokumentasikan migration dan kebutuhan `SUPABASE_SERVICE_ROLE_KEY` pada server environment di `README.md`.
- [ ] Commit `chore: verify admin completion and document service key setup`.
