# Patient Dashboard Calendar and Medication Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beranda pasien menampilkan kalender pengukuran dan dua catatan obat aman tanpa dosis/jadwal tetap.

**Architecture:** Migration menambah `medication_logs` dengan unique per user/obat/tanggal. Server action menentukan tanggal Asia/Jakarta dan toggle log pasien. Dashboard mengambil latest reading, tanggal ukur dalam bulan berjalan, dan log hari ini secara paralel.

**Tech Stack:** Next.js 16, React Server/Client Components, Supabase RLS, Tailwind, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-12-patient-dashboard-calendar-meds-design.md`

## Global Constraints

- Obat hanya `Amlodipine` dan `Captopril`; tanpa dosis/jam/rekomendasi tetap.
- Pasien menekan “Sudah minum” hanya bila obat diresepkan dan benar-benar diminum.
- Tanggal dihitung server `Asia/Jakarta`; browser tidak dipercaya.
- RLS owner-only; admin tidak memanipulasi medication logs.
- Kalender mengambil rentang bulan saja, bukan seluruh riwayat.

---

### Task 1: Medication Schema and RLS
**Files:** Create `supabase/migrations/202610120005_medication_logs.sql`, `tests/medication-schema.test.mjs`.

- [ ] Tulis failing contract test untuk allowlist obat, unique key, RLS owner policies, dan revoke anon.
- [ ] Jalankan test; pastikan gagal.
- [ ] Implementasikan migration tabel, grants, policies, dan updated timestamp tidak diperlukan karena log immutable/toggle delete.
- [ ] Jalankan test; commit `feat(db): add patient medication intake logs`.

### Task 2: Medication Validation and Server Action
**Files:** Create `src/lib/medications/validation.js`, `src/lib/medications/actions.ts`, `tests/medication-actions.test.mjs`.

- [ ] Tulis failing tests untuk nama obat invalid ditolak dan output tanggal lokal format `YYYY-MM-DD`.
- [ ] Implementasikan `MEDICATIONS`, `isMedicationName`, `jakartaDateKey`, `toggleMedicationIntake`.
- [ ] Action wajib `requireRole('patient')`, insert/delete berdasarkan unique key, revalidate `/dashboard`, dan return error aman.
- [ ] Jalankan full test; commit `feat: add safe medication intake toggle`.

### Task 3: Dashboard Calendar and Medicine Cards
**Files:** Modify `src/app/(patient)/dashboard/page.tsx`, `src/app/globals.css`; Create `src/components/medication-cards.tsx`, `src/components/measurement-calendar.tsx`.

- [ ] Ambil queries latest reading, month range, and today medication logs dengan `Promise.all`.
- [ ] Render kalender grid Senin–Minggu, dot pada tanggal readings, accessible labels.
- [ ] Render Amlodipine/Captopril cards, status, action pending, and safety copy.
- [ ] Preserve existing shortcuts and no education UI.
- [ ] Jalankan lint/typecheck/build; commit `feat(ui): add patient measurement calendar and medication log cards`.
