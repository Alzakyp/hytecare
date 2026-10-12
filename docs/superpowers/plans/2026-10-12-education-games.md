# Three Education Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasien dapat memainkan tiga format game dari `Permainan_Edukasi_Hipertensi.pdf` (Mitos atau Fakta, Pilah Makanan, Word Finding) dengan scoring server-side tanpa membocorkan kunci jawaban ke client.

**Architecture:** Tabel `quiz_games` menyimpan tipe `myth_fact`, `food_sort`, `word_search` beserta konfigurasi public dan kunci server; RPC `patient_game` mengembalikan hanya data tampilan publik; RPC `submit_game` memvalidasi dan mencatat skor; UI `/game/[slug]` memilih renderer interaktif yang aksesibel dan mobile-first.

**Tech Stack:** Next.js 16 App Router, TypeScript, PostgreSQL (Supabase Cloud), Tailwind CSS, Lucide React, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-12-education-games-design.md`

## Global Constraints

- Konten wajib merujuk dokumen `Permainan_Edukasi_Hipertensi.pdf`.
- Kunci jawaban dan penjelasan tidak boleh bocor ke client sebelum submit.
- Semua game dapat dimainkan dengan sentuhan (target ≥44 px) maupun keyboard.
- RLS dan RPC menjaga privasi: attempt hanya milik pengguna yang bersangkutan.
- Jangan terapkan migration SQL ke Cloud staging tanpa persetujuan operator.

---

### Task 1: Migration Schema dan RPC untuk Format Game Fleksibel

**Files:** Create `supabase/migrations/202610120003_education_games.sql`, `tests/education-games-schema.test.mjs`.

- [ ] Tulis failing test di `tests/education-games-schema.test.mjs` untuk memverifikasi kolom `config` dan `answer_key` pada `quiz_games`, serta RPC `patient_game` dan `submit_game`.
- [ ] Implementasikan `supabase/migrations/202610120003_education_games.sql` berisi kolom baru, seed data 3 game, RPC patient tanpa kunci, dan RPC submit ber-scoring server.
- [ ] Jalankan test dan commit `feat(db): add flexible game config and secure patient game RPCs`.

### Task 2: Pure Helpers Validasi dan Scoring 3 Game

**Files:** Create `src/lib/games/types.ts`, `src/lib/games/engine.js`, `tests/games-engine.test.mjs`.

- [ ] Tulis failing test: scoring `myth_fact`, validasi item/kategori `food_sort`, dan validasi koordinat kata `word_search`.
- [ ] Implementasikan fungsi scoring dan verifikasi murni di `src/lib/games/engine.js`.
- [ ] Jalankan test hingga PASS dan commit `feat: add game engine scoring and coordinate helpers`.

### Task 3: Server Actions untuk Alur Game Pasien

**Files:** Create `src/lib/games/actions.ts`, `tests/games-actions-contract.test.mjs`.

- [ ] Tulis failing contract test untuk penolakan submit tanpa sesi, submit data tidak lengkap, dan pemetaan hasil.
- [ ] Implementasikan Server Actions memanggil RPC `submit_game` dan mengembalikan skor serta ulasan.
- [ ] Jalankan test dan commit `feat: add patient game submission server actions`.

### Task 4: Halaman Katalog Game Pasien (`/game`)

**Files:** Modify `src/app/(patient)/game/page.tsx`, Create `src/components/games/game-card.tsx`.

- [ ] Bangun daftar kartu 3 game edukasi dengan indikator tipe, deskripsi, dan tombol mulai.
- [ ] Hubungkan dengan Supabase untuk membaca game aktif.
- [ ] Verifikasi tampilan mobile (single column) dan desktop (grid).
- [ ] Jalankan build dan commit `feat(ui): implement patient game hub page`.

### Task 5: Renderer Interaktif untuk Tiap Game (`/game/[slug]`)

**Files:** Create `src/app/(patient)/game/[slug]/page.tsx`, `src/components/games/myth-fact-board.tsx`, `src/components/games/food-sort-board.tsx`, `src/components/games/word-search-board.tsx`, `src/components/games/game-result-modal.tsx`.

- [ ] Bangun renderer Mitos atau Fakta: kartu pernyataan berganti atau daftar pilihan cepat dengan radio/toggle.
- [ ] Bangun renderer Pilah Makanan: dua kolom kategori dengan tombol pindah item dan drag-fallback yang aksesibel.
- [ ] Bangun renderer Word Finding: grid 10x10 interaktif, daftar kata yang dicari, dan penanda kata yang ditemukan.
- [ ] Bangun dialog/tampilan hasil skor, ulasan edukasi, dan tombol main lagi/kembali.
- [ ] Jalankan build dan commit `feat(ui): implement interactive boards for all three games`.

### Task 6: Verifikasi Menyeluruh, Lint, dan Typecheck

- [ ] Jalankan `npm test`: semua unit tests PASS.
- [ ] Jalankan `npm run lint` dan `npx tsc --noEmit`.
- [ ] Jalankan `npm run build`: semua rute terkompilasi bersih.
- [ ] Commit `chore: verify education games foundation`.
