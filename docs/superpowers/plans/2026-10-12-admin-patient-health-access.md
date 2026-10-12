# Admin Patient Health Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin dapat memilih pasien, melihat nomor HP dan riwayat tekanan darahnya, lalu menelepon manual; setiap akses medis tercatat.

**Architecture:** Migration menambah nomor HP profil, policy SELECT admin terpisah, action audit akses, dan projection identitas pasien. Halaman detail admin memakai guard role, mencatat audit sekali per pembukaan halaman, lalu membaca riwayat pasien terpilih.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase PostgreSQL/RLS, Tailwind CSS, Lucide React, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-12-admin-patient-health-access.md`

## Global Constraints

- Semua admin boleh melihat data pasien yang dipilih; pasien hanya datanya sendiri.
- Tidak ada antrean, notifikasi klinis, diagnosis, atau panggilan otomatis.
- Nomor telepon divalidasi; audit tidak menyimpan nilai tekanan darah.
- Jangan terapkan migration Cloud tanpa konfirmasi operator.

---

### Task 1: Migration Phone, Medical SELECT, Audit Action
**Files:** Create `supabase/migrations/202610120004_admin_patient_health.sql`, `tests/admin-patient-health-schema.test.mjs`.

- [ ] Tulis failing contract test yang menuntut kolom `profiles.phone_number`, policy admin SELECT pada readings, allowlist audit `view_patient_health`, dan RPC `admin_record_health_view(uuid)`.
- [ ] Jalankan test; pastikan gagal karena migration belum ada.
- [ ] Implementasikan migration: kolom nullable, grant update phone untuk profile sendiri, policy SELECT admin tanpa membuka INSERT/UPDATE/DELETE, RPC audit `SECURITY DEFINER` dengan target wajib role patient.
- [ ] Jalankan test hingga PASS; commit `feat(db): add audited admin patient health access`.

### Task 2: Phone Validation and Patient Profile
**Files:** Create `src/lib/profile/phone.js`, `tests/profile-phone.test.mjs`; Modify `src/lib/profile/actions.ts`, `src/components/profile-view.tsx`, `src/app/(patient)/profil/page.tsx`.

- [ ] Tulis failing tests: `0812 3456-7890` dinormalisasi ke `081234567890`; `+6281234567890` valid; huruf/kurang dari 9/lebih dari 16 digit ditolak.
- [ ] Implementasikan `normalizePhone(value)` dan `phoneHref(value)`.
- [ ] Perluas action profil agar nama + telepon disimpan atomik untuk user sendiri.
- [ ] Tambahkan field berlabel dan pemberitahuan: nomor serta hasil dapat diakses petugas RS.
- [ ] Jalankan test/lint/typecheck; commit `feat: add patient phone contact to profile`.

### Task 3: Admin User List and Health Detail
**Files:** Modify `supabase/migrations/202610120004_admin_patient_health.sql`, `src/app/(admin)/admin/users/page.tsx`; Create `src/app/(admin)/admin/users/[id]/health/page.tsx`, `src/components/admin/patient-health-history.tsx`.

- [ ] Perluas `admin_list_users` return `phone_number` tanpa mengubah data kesehatan.
- [ ] Tambahkan tombol `Lihat Rekam Medis` hanya pada role patient.
- [ ] Halaman health memanggil audit RPC, membaca profil target dan readings terurut terbaru dengan batas 100 row, mengklasifikasi memakai helper KMK existing.
- [ ] Tampilkan tombol `tel:` hanya bila nomor valid; empty/error state jelas; disclaimer bukan pemantauan darurat.
- [ ] Jalankan full verification; commit `feat(ui): add audited patient health detail for admins`.
