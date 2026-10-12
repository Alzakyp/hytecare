# Admin Quiz CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin dapat mengelola katalog game kuis, bank soal, pilihan jawaban dengan tepat satu kunci benar, dan preview dari konsol responsive yang aman bagi privasi pasien.

**Architecture:** Database RPC `admin_save_question` dan `admin_get_question` menjamin transaksi atomik question+options dengan otorisasi admin; server actions memvalidasi input sebelum memanggil Supabase; antarmuka memakai Next.js App Router, Tailwind, dan Lucide icons dengan fallback tampilan mobile.

**Tech Stack:** Next.js 16 App Router, TypeScript, PostgreSQL (Supabase Cloud migrations), React, Tailwind CSS, Lucide React, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-12-admin-quiz-crud-design.md`

## Global Constraints

- Sesi admin dan role `admin` wajib; tidak ada akses pasien ke RPC admin atau kunci jawaban.
- Soal aktif wajib memiliki minimal 2 opsi dan tepat 1 opsi benar; mutasi tidak boleh meninggalkan status aktif yang tidak valid.
- Tidak menghapus history: archive memakai `archived_at`; physical delete dicegah jika berelasi.
- Form responsive: tabel desktop, kartu mobile, editor opsi stack satu kolom, target sentuh ≥44 px.
- Validasi server-side lengkap; tidak ada service-role key di client bundle.
- Setiap task memiliki automated test yang diverifikasi sebelum commit.
- Jangan terapkan migration SQL ke Cloud staging tanpa persetujuan operator.

---

### Task 1: Migration SQL untuk Transactional Question RPC dan Admin Access

**Files:** Create `supabase/migrations/202610120001_admin_quiz_rpc.sql`, `tests/db/admin_quiz_permissions.sql`, `tests/admin-quiz-schema.test.mjs`.

**Interfaces:**
- RPC `public.admin_save_question(p_game_id uuid, p_prompt text, p_explanation text, p_sort_order integer, p_is_active boolean, p_options jsonb, p_question_id uuid default null): uuid`
- RPC `public.admin_get_question(p_question_id uuid): jsonb`

- [ ] Tulis failing test di `tests/admin-quiz-schema.test.mjs` untuk memverifikasi file SQL mendefinisikan RPC `admin_save_question`, pemeriksaan `is_admin()`, validasi satu jawaban benar, dan pencabutan hak akses publik.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan `supabase/migrations/202610120001_admin_quiz_rpc.sql` dengan `SECURITY DEFINER`, `search_path=''`, pemeriksaan hak akses admin, validasi transaksional options, insert/update question, replace options lama secara atomik, dan return UUID question.
- [ ] Siapkan `tests/db/admin_quiz_permissions.sql` untuk pengujian SQL staging (penolakan pasien, penerimaan admin, rollback kegagalan).
- [ ] Jalankan test dan commit `feat(db): add atomic admin quiz RPC and permission test`.

### Task 2: Validasi Data Game dan Question (Pure Functions)

**Files:** Create `src/lib/quiz/validation.ts`, `tests/quiz-validation.test.mjs`.

**Interfaces:**
- `validateGameInput(input: unknown): { ok: true; value: ValidGame } | { ok: false; error: string }`
- `validateQuestionInput(input: unknown): { ok: true; value: ValidQuestion } | { ok: false; error: string }`

- [ ] Tulis failing test: slug invalid, title kosong, description terlalu panjang, game type di luar daftar, prompt kosong, opsi kurang dari 2, opsi tanpa kunci benar, opsi dengan >1 kunci benar, label opsi kosong.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan fungsi validasi murni tanpa efek samping di `src/lib/quiz/validation.ts`.
- [ ] Jalankan test hingga PASS dan commit `feat: add quiz game and question validation pure helpers`.

### Task 3: Server Actions untuk Manajemen Game

**Files:** Create `src/lib/quiz/game-actions.ts`, `tests/game-actions-contract.test.mjs`.

**Interfaces:**
- `saveGame(previous: ActionState, form: FormData): Promise<ActionState>`
- `toggleGameStatus(gameId: string, makeActive: boolean): Promise<ActionState>`
- `archiveGame(gameId: string): Promise<ActionState>`

- [ ] Tulis failing test untuk kontrak input dan pemetaan error server action game.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan server actions dengan pemanggilan `requireRole('admin')`, query database ber-RLS, revalidate path `/admin/games`, dan penanganan error yang aman.
- [ ] Jalankan test dan commit `feat: add admin game server actions`.

### Task 4: Server Actions untuk Manajemen Soal dan Opsi

**Files:** Create `src/lib/quiz/question-actions.ts`, `tests/question-actions-contract.test.mjs`.

**Interfaces:**
- `saveQuestion(previous: ActionState, form: FormData): Promise<ActionState>`
- `toggleQuestionStatus(questionId: string, makeActive: boolean): Promise<ActionState>`
- `archiveQuestion(questionId: string): Promise<ActionState>`

- [ ] Tulis failing test untuk pemrosesan form JSON options dan pemetaan error RPC.
- [ ] Jalankan `npm test`; expected FAIL.
- [ ] Implementasikan server actions memanggil RPC `admin_save_question`, revalidate path `/admin/questions`, dan penanganan konfirmasi arsip.
- [ ] Jalankan test dan commit `feat: add admin question and options server actions`.

### Task 5: Halaman Katalog Game Admin (`/admin/games`, `/new`, `/[id]/edit`)

**Files:** Create `src/components/admin/game-form.tsx`, `src/components/admin/game-list.tsx`, Modify `src/app/(admin)/admin/games/page.tsx`, Create `src/app/(admin)/admin/games/new/page.tsx`, `src/app/(admin)/admin/games/[id]/edit/page.tsx`.

- [ ] Buat komponen form dan tabel responsif game (desktop table, mobile cards, status badges, konfirmasi arsip).
- [ ] Hubungkan form dengan server action dan data game aktif/draft/arsip.
- [ ] Verifikasi accessibility: label, target sentuh ≥44 px, keyboard focus, error message.
- [ ] Jalankan build dan commit `feat(ui): implement admin game management pages`.

### Task 6: Editor Soal, Opsi, dan Preview (`/admin/questions`, `/new`, `/[id]/edit`, `/[id]/preview`)

**Files:** Create `src/components/admin/question-form.tsx`, `src/components/admin/question-preview.tsx`, `src/components/admin/question-list.tsx`, Modify `src/app/(admin)/admin/questions/page.tsx`, Create `src/app/(admin)/admin/questions/new/page.tsx`, `src/app/(admin)/admin/questions/[id]/edit/page.tsx`, `src/app/(admin)/admin/questions/[id]/preview/page.tsx`.

- [ ] Buat editor soal responsif: input prompt, penjelasan, radio button satu kunci jawaban, tambah/hapus opsi dinamis minimal 2.
- [ ] Buat halaman preview yang memperlihatkan kartu simulasi tanpa membocorkan kunci jawaban sebagai penanda benar ke pasien.
- [ ] Buat daftar bank soal dengan filter game dan status.
- [ ] Jalankan build dan commit `feat(ui): implement admin question editor and preview pages`.

### Task 7: Verifikasi Menyeluruh, Lint, Typecheck, dan Dokumentasi

**Files:** Modify `README.md`, `docs/clinical-sources.md`.

- [ ] Jalankan test runner: pastikan seluruh unit test PASS.
- [ ] Jalankan `npm run lint` dan `npx tsc --noEmit`.
- [ ] Jalankan `npm run build` dan pastikan semua routes terkompilasi bersih.
- [ ] Dokumentasikan petunjuk eksekusi migration RPC baru di README.md untuk staging.
- [ ] Commit `chore: verify admin quiz CRUD foundation and documentation`.
