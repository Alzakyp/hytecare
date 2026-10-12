# HyteCare Admin Quiz CRUD Design

Status: disetujui secara konseptual; menunggu review dokumen sebelum implementation plan.

## Tujuan

Admin dapat mengelola game, soal, dan opsi kuis dari konsol responsive. Pasien tidak pernah menerima kunci jawaban sebelum submit. Riwayat attempt tidak rusak ketika konten diubah atau diarsipkan.

## Scope

Termasuk:
- List/search/filter game dan soal.
- Create/edit game: title, slug, description, game_type, status.
- Create/edit question: game, prompt, explanation, sort order, active status, minimal dua opsi, tepat satu opsi benar.
- Preview soal sebelum aktivasi.
- Archive game/question; physical delete hanya untuk row tanpa history dan tidak menjadi default UI.
- Loading, empty, validation, confirm, success/error feedback; desktop table dan mobile cards.

Tidak termasuk:
- Scoring/alur permainan pasien.
- Dashboard agregat/admin users.
- Bulk import/export, AI generation, rich text editor, media upload.

## Boundary Data dan Security

Semua halaman memanggil `requireRole('admin')`. Browser memakai sesi admin biasa dan RLS, tidak service-role.

Mutation question + options memakai RPC PostgreSQL `admin_save_question` dengan `SECURITY DEFINER`, `search_path=''`, lalu melakukan pemeriksaan `public.is_admin()`. RPC memvalidasi UUID game, prompt, explanation, sort order, array opsi, minimal dua label non-kosong, exactly one correct, dan UUID opsi. Transaction function menyimpan question/options atomik; error menggagalkan seluruh perubahan.

RPC `admin_question_editor` mengembalikan question, explanation dan options termasuk `is_correct` hanya jika caller admin. Patient tetap memakai projection `patient_quiz`, tanpa explanation/key. RPC admin tidak diberikan kepada anon.

Mutasi game dapat memakai server action dengan RLS karena satu row. Slug lowercase kebab-case, unik, stabil. Aktivasi game ditolak jika tidak memiliki minimal satu active question valid. Aktivasi question dilakukan dalam RPC setelah opsi valid tersimpan.

Archive (`archived_at`) menjadi operasi default. Row yang dirujuk attempt/answer tetap ada karena FK RESTRICT. Mengedit konten tidak mengubah snapshot attempt existing. Question/options yang sedang dipakai attempt in-progress tidak dapat diubah/arsipkan hingga selesai/abandoned; database guard menolak.

## Routes dan Komponen

- `/admin/games`: list/search/status, CTA tambah, toggle active, archive.
- `/admin/games/new`: create game.
- `/admin/games/[id]/edit`: edit game.
- `/admin/questions`: filter game/status, list, CTA tambah.
- `/admin/questions/new`: question editor.
- `/admin/questions/[id]/edit`: question editor existing.
- `/admin/questions/[id]/preview`: preview tanpa menyimpan/mengekspos ke patient.

Komponen minimal:
- `AdminPageHeader`
- `GameForm`
- `QuestionForm`
- `OptionEditor`
- `StatusBadge`
- native `<dialog>` atau inline confirmation untuk archive; no modal dependency baru.

Server actions menjadi trust boundary UI: validasi input lagi, cek admin lagi, panggil Supabase RPC/table mutations, `revalidatePath`, redirect atau state error. Jangan menerima `user_id`/role dari form.

## UX

Pertahankan teal–mint, rounded card, Lucide icons. Admin desktop-first, sidebar; list berubah menjadi kartu pada `<640px`; editor opsi satu kolom pada mobile. Target sentuh ≥44 px. Active/correct state tidak hanya warna—gunakan label/icon/text. Submit menunjukkan spinner dan disabled state. Error database dipetakan ke pesan aman; detail internal tidak dipaparkan.

Archive memerlukan konfirmasi dengan nama item. Preview menjelaskan bahwa soal belum terlihat pasien bila inactive. Status memiliki label Draft, Aktif, Diarsipkan.

## Validasi

Game:
- title 1–200 karakter.
- slug regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- description max 2000 karakter.
- game_type: `quiz`, `myth_fact`, `challenge`, `daily`.

Question:
- prompt 1–2000 karakter.
- explanation max 4000 karakter.
- sort_order 0–10000.
- ≥2 opsi, tiap label 1–500 karakter.
- Exactly one `is_correct`.
- Myth/fact tetap dua opsi dan satu benar.

## Testing

Unit:
- Game/question parser boundaries.
- Opsi duplicate/empty/zero-or-multiple correct rejected.
- Form status/action helper.

SQL staging:
- Patient/anon RPC admin ditolak.
- Admin create/edit atomik.
- Invalid active question rollback tanpa partial options.
- Patient projection tidak berisi `is_correct`/explanation.
- Archive/history guard.

UI/build:
- Empty/error/loading.
- Keyboard option editor, visible labels/focus.
- 390/768/1440 responsive.
- lint, TypeScript, production build.

## Deployment

Buat migration baru; jangan mengubah migration yang sudah diterapkan. Terapkan migration Cloud hanya setelah backup/target dikonfirmasi. Jalankan dry-run/SQL test di staging jika tersedia. Vercel deploy setelah schema Cloud siap agar UI tidak memanggil RPC yang belum ada.
