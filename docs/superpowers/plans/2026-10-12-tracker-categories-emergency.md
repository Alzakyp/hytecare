# Tracker, Kategori Tekanan Darah, dan Emergency Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasien dapat menyimpan pemeriksaan tekanan darah, melihat kategori berbasis KMK 303/2026, menerima panduan non-diagnostik, dan menghubungi RSUB secara manual pada nilai sangat tinggi.

**Architecture:** Pure classifier dipakai server dan UI; server action menetapkan `user_id` dari sesi, memvalidasi input, lalu insert ke Supabase dengan RLS. Dashboard dan tracker membaca tabel yang sama. Emergency guidance hanya rekomendasi berbasis angka/gejala, tidak diagnosis, tidak auto-call.

**Tech Stack:** Next.js 16 App Router, TypeScript, Server Actions, Supabase SSR, React, Tailwind CSS, Lucide React.

**Spec:** `docs/superpowers/specs/2026-10-11-hytecare-foundation-design.md`, keputusan klinis dari KMK No. HK.01.07/MENKES/303/2026 PDF lokal.

## Global Constraints

- Sumber klinis: KMK No. HK.01.07/MENKES/303/2026; jangan menambah ambang yang tidak ada di sumber.
- Satu pencatatan bukan diagnosis; copy ini wajib muncul di hasil.
- Kategori tertinggi dipilih jika sistolik dan diastolik berbeda.
- `≥180` sistolik atau `≥110` diastolik memunculkan warning; emergensi klinis memerlukan keterlibatan organ target/gejala dan penilaian tenaga kesehatan.
- Nomor RSUB `0341 4372409` dipakai hanya sebagai tombol `tel:03414372409`; jangan menyatakan panggilan berhasil.
- Nilai rendah tidak otomatis memicu emergency call.
- Semua query membatasi `user_id` dari sesi; browser tidak mengirim `user_id` sebagai sumber otorisasi.
- Tidak mengubah PRD; edukasi tetap di PRD, tetapi tidak kembali ke UI pasien pada fase ini.
- Test classifier, validation, authorization, loading/error/empty states.

---

### Task 1: Classifier dan guidance pure functions

**Files:** Create `src/lib/blood-pressure/classifier.ts`, `src/lib/blood-pressure/guidance.ts`, `tests/blood-pressure.test.mjs`.

**Interfaces:**
- `classifyBloodPressure(systolic: number, diastolic: number): { key: string; label: string; tone: 'teal'|'amber'|'orange'|'red'; isVeryHigh: boolean }`
- `getBloodPressureGuidance(input: { systolic: number; diastolic: number; hasSymptoms: boolean }): { title: string; message: string; showEmergencyCall: boolean; symptoms: string[] }`

- [ ] Tulis failing tests untuk batas kategori, kategori tertinggi, warning tinggi, rendah tanpa emergency, dan gejala.
- [ ] Jalankan `npm test`; expected FAIL karena module belum ada.
- [ ] Implementasikan kategori sesuai tabel KMK yang telah dikonfirmasi dari PDF; jika nilai melewati threshold tertinggi, tetap gunakan kategori tertinggi sumber. Validasi classifier menolak non-finite/non-positive input.
- [ ] Implementasikan guidance: nilai sangat tinggi +/− gejala menampilkan `showEmergencyCall: true`; nilai rendah hanya saran ukur ulang/tenaga kesehatan bila tidak enak badan; daftar gejala memakai nyeri dada, sesak napas, gangguan penglihatan, kejang, gangguan kesadaran, dan gejala neurologis.
- [ ] Jalankan test dan commit `feat: add blood pressure classification guidance`.

### Task 2: Server action create reading dan validation

**Files:** Create `src/lib/blood-pressure/validation.ts`, `src/lib/blood-pressure/actions.ts`, `tests/blood-pressure-validation.test.mjs`.

**Interfaces:** `createReading(previous: ActionState, form: FormData): Promise<ActionState>`; `ActionState = { error?: string; reading?: ReadingResult }`.

- [ ] Tulis failing tests untuk angka kosong/non-numerik, batas fisik 50–300 sistolik, 30–200 diastolik, sistolik harus lebih tinggi dari diastolik, heart rate opsional positif, tanggal invalid, dan valid payload.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan validasi server-side dan normalisasi tanggal ISO. `createReading` memanggil `requireRole('patient')`, mengabaikan `user_id` dari form, insert kolom yang diizinkan, lalu mengembalikan row + classifier. Jangan insert kategori sebagai data tersimpan; kategori dihitung dari reading.
- [ ] Jalankan test unit. Cloud integration test diberi `NOT RUN` tanpa staging credentials.
- [ ] Commit `feat: add patient blood pressure server action`.

### Task 3: Form input dan premium result card

**Files:** Create `src/components/blood-pressure-form.tsx`, `src/components/blood-pressure-result-card.tsx`, `src/app/(patient)/tracker/new/page.tsx`, `src/app/(patient)/tracker/new/loading.tsx`; Modify `src/app/(patient)/tracker/page.tsx`.

**Interfaces:** Form memakai `createReading`; result card menerima `ReadingResult`; tombol emergency memakai `href="tel:03414372409"` dan accessible label.

- [ ] Tulis test rendering/contract untuk field label, numeric input, submit pending, disclaimer, dan tombol `tel:03414372409` hanya ketika `showEmergencyCall` true.
- [ ] Jalankan test; expected FAIL.
- [ ] Implementasikan form mobile-first: label visible, `inputMode="numeric"`, tanggal/jam, notes, inline errors, disabled submit + spinner, focus retained. Result card bukan card polos: header status, angka besar `systolic/diastolic`, badge tone, date/time, optional heart rate, guidance panel, symptom checkbox group, emergency CTA.
- [ ] Tambahkan motion 160–220ms, no layout shift, `prefers-reduced-motion`; Lucide icons only; target controls ≥44px; tidak memakai warna sebagai satu-satunya status.
- [ ] Jalankan `npm test`, lint, typecheck; commit `feat: add mobile blood pressure form and result card`.

### Task 4: Tracker history dan dashboard integration

**Files:** Modify `src/app/(patient)/tracker/page.tsx`, `src/app/(patient)/dashboard/page.tsx`; Create `src/components/blood-pressure-history-card.tsx`, `src/app/(patient)/tracker/[id]/page.tsx`, `src/app/(patient)/tracker/loading.tsx`.

**Interfaces:** Semua read query `.eq('user_id', userId)` setelah `requireRole('patient')`; history card menerima reading row dan classifier.

- [ ] Tulis test untuk empty, error/retry, sorted history, and latest card category.
- [ ] Jalankan test; expected FAIL.
- [ ] Implementasikan list user-only, newest first, card responsive, category badge, heart rate, Jakarta timestamp, demo marker. Dashboard CTA `+ Catat Tekanan Darah`, latest reading category and result guidance summary. Jangan menampilkan nilai fixture jika query kosong.
- [ ] Tambahkan delete hanya pada fase ini jika action sudah memiliki confirmation; jika belum, tampilkan detail tanpa tombol yang mengklaim delete. No raw data admin.
- [ ] Jalankan full tests/lint/typecheck/build; commit `feat: connect readings to patient tracker and dashboard`.

### Task 5: Clinical copy, emergency call, verification

**Files:** Create `docs/clinical-sources.md`; Modify `README.md`, `src/components/blood-pressure-result-card.tsx`, `src/lib/blood-pressure/guidance.ts`.

- [ ] Dokumentasikan PDF filename, halaman 9, 24–29, 47–49, tanggal review internal, dan batas bahwa aplikasi tidak mendiagnosis.
- [ ] Tampilkan copy gaya hidup ringkas: kurangi natrium, pola makan seimbang, aktivitas sesuai kondisi, berat badan sehat, hindari rokok; jangan menampilkan resep/obat atau target individu.
- [ ] Emergency card menyebut: “Nilai tinggi ini memerlukan perhatian. Jika ada nyeri dada, sesak napas, gangguan penglihatan, kejang, penurunan kesadaran, atau gejala neurologis, cari pertolongan medis segera.” Tombol `Hubungi RSUB` membuka dialer manual dan tidak menjanjikan koneksi.
- [ ] Run `npm test && npm run lint && npx tsc --noEmit && npm run build`; manual test 320/390/768/1440, keyboard, reduced motion, tel link, no overflow.
- [ ] Commit `docs: document hypertension guidance source and emergency boundaries`.

### Task 6: Cloud staging verification

**Files:** No source changes unless verification exposes a defect; update `README.md` with result.

- [ ] Apply migrations to staging exactly once; verify trigger creates patient profile/role.
- [ ] Create two patients/admin; verify patient isolation and admin raw-data denial using `tests/db/permissions.sql`.
- [ ] Create one reading through UI; verify dashboard/tracker show same row and category; verify invalid input rejected server-side.
- [ ] Confirm Supabase Auth redirect URLs include local/Vercel callback URLs; never place service-role in Vercel client environment.
- [ ] If staging credentials/consent absent, mark Cloud integration `NOT RUN`; do not claim pass. Commit documentation only if changed.
