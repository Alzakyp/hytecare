# HyteCare — Google Stitch Design Brief

Baseline PRD v2.1. Dokumen ini adalah instruksi desain, bukan bukti otorisasi backend atau penerapan di Stitch.

## Identitas
- Aplikasi responsive pencatatan dan edukasi hipertensi, bukan diagnosis, triase, dispatch darurat, atau pengganti tenaga kesehatan.
- Brand: teal #0F9D96, putih #FFFFFF, coral #FF8A80, mint #F1FAF8, teks #193B3A, secondary #71817F, border #E4EEEB.
- Inter/Plus Jakarta Sans, body 16–18 px. Sesuaikan foreground/warna tombol jika kontras brand tidak memenuhi WCAG AA; target sentuh minimal 44×44 px.
- UI inti ID/EN; konten contoh Indonesia belum review, tidak membuat terjemahan klinis fiktif.

## Auth dan akses
- Tidak ada landing page. `/` redirect ke `/login` tanpa sesi, `/dashboard` patient, `/admin/dashboard` admin.
- Dua role saja: `patient`, `admin`. Tidak ada dokter/caregiver/superadmin.
- Frame login, forgot/reset password, register pasien **hanya jika enabled**, 403, 404, expired session.
- Tidak ada pilihan role pada registrasi. Admin diprovisioning tepercaya.
- Setiap form memiliki label, autocomplete, pending, error inline, success; paste/password manager diizinkan.

## Portal pasien — mobile-first
Viewport utama 390×844; uji 320, 768, 1440 tanpa horizontal overflow. Bottom nav: Beranda, Catatan, Edukasi, Kuis, Lainnya. Active state dan safe-area wajib. Lainnya memuat Kontak Darurat dan Profil.

Frame target MVP:
- `/dashboard`: sapaan, pengukuran terakhir mmHg, tambah pengukuran, tren 7 hari, edukasi/kuis. Empty/error/retry. Angka chart, tabel dan pengukuran terakhir dari dataset yang sama.
- `/tracker`, `/tracker/new`, `/tracker/[id]`, `/tracker/[id]/edit`: form satu kolom, keyboard numerik, tanggal/jam, satuan, filter 7/30 hari, grafik berlegenda dan daftar nilai alternatif. Mobile kartu riwayat; desktop tabel. Hapus dengan konfirmasi.
- `/edukasi`, `/edukasi/[slug]`, `/edukasi/tersimpan`: pencarian, kategori, materi repo statis, sumber, tanggal/status review, related articles; bookmark/status baca jika diimplementasikan. Slug hilang memiliki fallback aman.
- `/game`, `/game/[slug]`, `/game/[slug]/play`, `/game/results/[id]`: instruksi, satu soal per layar, pilihan besar, progres, submit, feedback, hasil. Tidak menampilkan kunci sebelum submit; skor bukan penilaian kesehatan.
- `/kontak-darurat`: kartu kontak, CRUD, konfirmasi hapus. `tel:` hanya nomor valid; nomor placeholder demo tidak bisa ditelepon. Tidak mengklaim panggilan berhasil.
- `/profil`: identitas dasar, email Auth read-only, pilihan bahasa lokal, logout.

## Portal admin — desktop-first responsive
Sidebar desktop, drawer mobile, tabel menjadi kartu pada layar kecil; editor opsi stack satu kolom.
- `/admin/dashboard`: metrik operasional agregat non-medis yang diizinkan; tidak membuat angka tanpa data.
- `/admin/users`, `/admin/users/[id]`: metadata identitas non-medis, search/filter/pagination. Tidak menampilkan tekanan darah, notes kesehatan atau kontak darurat individual.
- `/admin/games`, `/admin/games/new`, `/admin/games/[id]/edit`: CRUD game, status aktif/nonaktif, archive by default.
- `/admin/questions`, `/admin/questions/new`, `/admin/questions/[id]/edit`, `/admin/questions/[id]/preview`: CRUD soal dan opsi, penjelasan, urutan, status, preview sebelum aktivasi. Single-choice minimal 2 opsi dan tepat 1 benar. Histori attempt tidak rusak akibat arsip.
- `/admin/profile`: profil sendiri. Analytics lanjut hanya P1.

## Jangan generate
- Landing page publik.
- Admin article/category CRUD, create/edit/publish artikel; konten artikel berubah melalui code review/deploy.
- Halaman audit log atau tabel `audit_logs`.
- Preferences terpusat atau tabel `user_preferences`.
- Tombol enable/disable akun aktif, akses rekam kesehatan pasien, dokter/caregiver, export/notifikasi sebagai fitur P0.
- AI diagnosis, kategori ambang klinis belum review, hotline darurat belum diverifikasi.

## State dan batas fase
- Semua frame target MVP memiliki loading/empty/error/success, fokus terlihat, label aksesibel, tidak mengandalkan warna saja.
- Prototipe memakai label “Contoh data — bukan hasil pengukuran nyata”; tidak memakai identitas/nomor/rekam asli.
- Fondasi Fase 1 hanya auth, shell dan status pengembangan. Frame target di atas belum berarti semua route/CRUD sudah diimplementasikan.
- Disclaimer terlihat: alat pencatatan dan edukasi, bukan diagnosis; jangan mengubah/menghentikan pengobatan berdasarkan aplikasi.
- Stitch tidak mengimplementasikan RLS atau keamanan server. Review klinis dan review izin backend tetap terpisah sebelum produksi.
