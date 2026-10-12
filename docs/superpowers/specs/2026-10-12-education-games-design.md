# HyteCare Education Games Design

## Tujuan
Mengubah tiga materi pada `Permainan_Edukasi_Hipertensi.pdf` menjadi game pasien:

1. **Mitos atau Fakta** — 8 pernyataan, pilihan tunggal.
2. **Pilah Makanan** — 12 item, klasifikasi ke dua kategori.
3. **Word Finding** — pencarian 10 kata pada grid huruf.

Bahasa UI dan konten: Bahasa Indonesia. Tidak menambah tab edukasi; game tetap masuk tab Kuis.

## Format Konten

### Mitos atau Fakta

Tipe `myth_fact`. Tiap item: prompt, dua opsi `Mitos`/`Fakta`, satu kunci, explanation. Konten sumber:
- Hipertensi selalu menimbulkan sakit kepala. — Mitos
- Makanan tinggi garam dapat meningkatkan tekanan darah. — Fakta
- Jika tekanan darah sudah normal, obat boleh dihentikan. — Mitos
- Olahraga teratur membantu menurunkan tekanan darah. — Fakta
- Hipertensi hanya terjadi pada orang lanjut usia. — Mitos
- Stres dapat memengaruhi tekanan darah. — Fakta
- Minum obat hipertensi harus seumur hidup. — Mitos* 
- Hipertensi tidak berbahaya jika tidak ada gejala. — Mitos

`*` Penjelasan wajib: durasi obat ditentukan tenaga kesehatan; jangan menghentikan sendiri.

### Pilah Makanan

Tipe `food_sort`. Tiap item memiliki `label`, `category`: `recommended` atau `limit`, serta optional explanation. Item:
- Recommended: sayur bayam, pisang, brokoli, tomat, ikan rebus, buah apel.
- Limit: sosis, keripik kentang, ikan asin, mie instan, kacang asin, makanan cepat saji.

Pasien menyeret item atau memilih kategori pada perangkat sentuh. Keyboard fallback wajib tersedia: fokus item, tombol kategori. Scoring server-side; client tidak menerima kunci sebelum submit.

### Word Finding

Tipe `word_search`. Daftar kata: `HIPERTENSI`, `GARAM`, `JANTUNG`, `STRES`, `OLAHRAGA`, `TENSIMETER`, `BUAH`, `SAYUR`, `OBESITAS`, `ROKOK`.

Grid dikirim sebagai matriks huruf dan posisi kata hanya disimpan server. UI mendukung tap awal/tap akhir pada mobile, mouse drag desktop, serta keyboard selection fallback. Client mengirim daftar koordinat terpilih; server memvalidasi posisi, kata, grid, dan skor.

## Data dan API

Jangan memaksa tiga tipe ke `quiz_questions` generik. Tambah model:
- `quiz_games.game_type` allowlist: `myth_fact`, `food_sort`, `word_search` (pertahankan tipe lama jika dibutuhkan kompatibilitas).
- `quiz_games.config jsonb not null default '{}'`: grid, daftar item, aturan tampilan tanpa kunci.
- `quiz_games.answer_key jsonb not null default '{}'`: hanya server/RPC; tidak pernah dikembalikan patient RPC.

Admin editor memakai konfigurasi tipe-spesifik minimal; MVP dapat memakai seed/migration untuk konten sumber, tanpa editor grid visual. Admin dapat mengaktifkan/nonaktifkan game yang sudah disediakan.

Patient RPC `patient_game(game_slug)` mengembalikan public payload berdasarkan tipe, tanpa `answer_key`. Server RPC `submit_game(game_id, payload jsonb)` membaca answer key, memvalidasi attempt milik user, menghitung skor, menyimpan snapshot, dan mengembalikan hasil.

## UX

- `/game` menampilkan tiga kartu game: label, estimasi durasi, status.
- `/game/[slug]` memilih renderer sesuai `game_type`.
- Autosave tidak termasuk MVP; submit eksplisit.
- Mobile-first, target sentuh 44px, visible focus, feedback benar/salah setelah submit.
- `prefers-reduced-motion` mematikan animasi drag/celebration.
- Tidak ada timer; tidak ada leaderboard; tidak ada streak.
- Loading memakai brand `HyteLoading`; error menyediakan retry.

## Klinis dan Copy

Game edukasi bukan diagnosis. Semua explanation menggunakan bahasa "umumnya" dan mendorong konsultasi tenaga kesehatan. Pernyataan obat tidak boleh ditafsirkan sebagai instruksi penghentian/penerusan individual.

## Testing

- Unit validator payload tiga tipe.
- Test scoring server-side dengan kunci tidak muncul pada patient response.
- Test invalid koordinat word search ditolak.
- Test item food sort duplikat/missing category ditolak.
- Test RLS/RPC: patient hanya public payload dan attempt sendiri; admin content management tetap terpisah.
- UI keyboard/touch basic, responsive 390px/768px.

## Batas MVP

Seed konten sumber, renderer patient, scoring, dan admin toggle. Skip editor konfigurasi kompleks, upload gambar, multiplayer, leaderboard, timer, analytics detail.
