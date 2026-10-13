# Public Patient Registration and Contact Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aktifkan registrasi pasien dengan nomor HP wajib dan lengkapi akses admin ke daftar pasien serta rekam medis per pasien.

**Architecture:** Auth form mengirim display name/phone ke Supabase signup; server action memvalidasi ulang dan fallback-update profile. Admin users page memakai data phone dari `admin_list_users`; detail health existing tetap menjadi satu-satunya akses rekam medis dan mencatat audit.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase Auth/RLS, TypeScript, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-12-public-registration-and-patient-contact.md`

## Global Constraints

- Role signup selalu `patient`; client tidak mengirim role.
- Nomor HP wajib saat signup: 9–16 digit, optional `+`.
- Password signup minimal 12 karakter.
- Pendaftaran default `ENABLE_REGISTRATION=false`; operator mengaktifkan deployment.
- Admin melihat daftar pasien dan membuka rekam medis per pasien; tidak ada global feed.
- Akses medis memakai existing `admin_record_health_view`; audit tidak menyimpan nilai medis.

---

### Task 1: Registration Validation Contract
**Files:** Create `tests/registration-phone.test.mjs`; Modify `src/lib/profile/phone.js`, `src/lib/auth/helpers.js` only if needed.

- [ ] Tulis failing tests untuk required phone, normalization, invalid phone, password <12, dan registration flag.
- [ ] Jalankan `node --test tests/registration-phone.test.mjs`; expected FAIL for missing registration parser.
- [ ] Tambahkan pure `validateRegistrationInput(input)` returning normalized `{display_name,email,phone,password}` or safe error.
- [ ] Jalankan test PASS; commit `feat: validate public patient registration contact data`.

### Task 2: Registration Form and Server Action
**Files:** Modify `src/components/auth-form.tsx`, `src/app/(auth)/register/page.tsx`, `src/lib/auth/actions.ts`, `supabase/migrations/202610120004_admin_patient_health.sql`.

- [ ] Tulis failing test contract yang memastikan signup metadata memiliki `display_name` dan `phone_number`, serta tidak memiliki `role`.
- [ ] Tambahkan field Nama Tampilan + Nomor HP hanya pada `mode=register`; password register min 12.
- [ ] Action `registerPatient` validasi pure helper, cek flag, panggil `signUp` dengan metadata nama/phone, lalu tidak mengubah role client-side.
- [ ] Update trigger `handle_new_user` agar menyimpan `new.raw_user_meta_data->>'phone_number'`, length/normalisasi sudah dilakukan server action.
- [ ] Tambahkan pesan akses data RS dan status verifikasi email.
- [ ] Jalankan test/lint/typecheck; commit `feat: enable patient registration with required phone`.

### Task 3: Admin Patient Directory and Existing Medical Detail
**Files:** Modify `src/app/(admin)/admin/users/page.tsx`, `src/components/admin/user-row-actions.tsx`, `src/app/(admin)/admin/users/[id]/health/page.tsx`; test `tests/admin-patient-directory.test.mjs`.

- [ ] Tulis failing contract test untuk filter role `patient`, output nomor kosong `Belum diisi`, dan link `/admin/users/[id]/health`.
- [ ] Pastikan UI menampilkan hanya pasien pada view patient directory; admin management tetap tersedia melalui filter/route yang sudah ada bila diperlukan.
- [ ] Pertahankan tombol `Rekam Medis` hanya untuk patient dan nomor `tel:` hanya bila nomor valid.
- [ ] Pastikan detail memakai limit 100, klasifikasi existing KMK, disclaimer, dan audit RPC.
- [ ] Jalankan full test/lint/typecheck/build; commit `feat: complete admin patient directory and health drilldown`.

### Task 4: Documentation and Verification
**Files:** Modify `README.md`, `.env.local.example` if wording needs update.

- [ ] Dokumentasikan `ENABLE_REGISTRATION=true` hanya setelah migration phone diterapkan.
- [ ] Jalankan `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- [ ] Commit `docs: document public registration and patient health access`.
- [ ] Push after all verification; do not claim Cloud active until operator applies migration and redeploys.
