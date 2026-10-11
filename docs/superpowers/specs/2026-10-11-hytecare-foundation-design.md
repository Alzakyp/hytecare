# HyteCare — Spesifikasi Fondasi Fase 1

Status: menunggu review pemilik produk sebelum rencana implementasi.
Tanggal dokumen: 11 Oktober 2026, mengikuti tanggal baseline PRD yang diberikan.
Lokasi: `/Users/alzaky/Applications/hytecare`.

## 1. Tujuan dan keputusan yang disetujui

Inisiasi aplikasi pencatatan dan edukasi hipertensi berdasarkan PRD v2.1. Implementasi bertahap, bukan seluruh MVP sekaligus. Supabase Cloud menjadi backend; aplikasi memakai Next.js App Router, TypeScript, Tailwind CSS dan shadcn/ui. Bahasa Indonesia default, Inggris untuk UI inti. Dua role saja: patient dan admin.

Fase 1 menghasilkan fondasi yang dapat diuji: struktur proyek, database dan RLS, auth, routing dua role, shell responsive, serta seed demo terproteksi. Tidak mengklaim fitur CRUD, scoring kuis atau konten klinis siap produksi sebelum fase berikutnya.

## 2. Pendekatan

Gunakan satu aplikasi Next.js dan satu proyek Supabase Cloud khusus pengembangan/staging. Tidak membuat backend terpisah. Next.js 15 sesuai desain yang disetujui; patch harus masih mendapat perbaikan keamanan. Jika dukungan versi tidak memadai, perubahan major memerlukan konfirmasi sebelum instalasi. Lockfile npm dikomit.

Gunakan `@supabase/ssr` dan `@supabase/supabase-js`. Server components/actions memakai sesi user dan RLS; service-role hanya untuk provisioning/seed server-side, bukan request aplikasi biasa. shadcn/ui ditambahkan hanya untuk komponen yang dipakai. Tidak menambahkan chart library atau framework state pada fondasi.

Alternatif yang tidak dipilih: prototype lokal tanpa backend tidak menguji izin; backend terpisah menambah deployment tanpa kebutuhan fase ini.

## 3. Batas scope

Termasuk:
- Konfigurasi aplikasi, environment example, README setup Cloud.
- Migration SQL 10 tabel aplikasi, constraints, indeks dan RLS.
- Auth login/logout, session refresh, reset password, redirect role dan halaman 403/404.
- Registrasi pasien tersedia hanya saat flag server eksplisit aktif; default nonaktif hingga kebijakan registrasi/verifikasi dikonfirmasi. Tidak ada pilihan role dalam form.
- Shell pasien mobile-first dan shell admin desktop-first, halaman awal empty state yang jujur.
- Spesifikasi `design.md` sinkron dengan PRD; tidak membuat atau mengirim proyek Stitch otomatis.
- Seeder development/demo, artikel demo statis dengan slug stabil, pengujian izin dan auth.

Tidak termasuk:
- CRUD tekanan darah/kontak, grafik produksi, pembacaan artikel lengkap, permainan atau admin editor lengkap.
- Analytics klinis, akses admin ke raw data pasien, status akun admin, export, notifikasi, storage avatar.
- Tabel artikel, preferences, audit logs; landing page; konten medis siap publikasi.

## 4. Data dan otorisasi

Sepuluh tabel: profiles, user_roles, blood_pressure_readings, quiz_games, quiz_questions, quiz_options, quiz_attempts, quiz_answers, emergency_contacts, user_article_progress. `auth.users` dikelola Supabase, tidak dibuat atau diisi manual. Role satu sumber di user_roles.

Trigger signup membuat profile dan role patient, mengabaikan role dari metadata user. Nama tampilan divalidasi; metadata tidak menentukan otorisasi. Provisioning admin dilakukan secara tepercaya lewat script server. User tidak memiliki izin insert/update/delete role.

RLS aktif pada semua tabel. Profiles: user membaca sendiri dan hanya memperbarui display_name/avatar_url; admin membaca metadata minimum, tanpa kemampuan mengubah profil orang lain. User_roles: role sendiri; admin membaca role untuk daftar metadata. Admin predicate memakai fungsi terbatas dengan search_path eksplisit agar tidak menimbulkan rekursi policy.

Readings, contacts, article progress: owner-only untuk semua operasi, tanpa policy admin bypass. Constraint angka positif termasuk heart_rate nullable. Tidak menambahkan kategori diagnosis atau batas klinis yang belum ditinjau. Timestamp timestamptz, render Asia/Jakarta default. Foreign key akun tidak otomatis cascade seluruh rekam kesehatan; penghapusan akun memerlukan kebijakan retensi terpisah.

Games dan questions: pasien hanya membaca game/soal aktif yang tidak diarsipkan. Penjelasan soal tidak boleh dibaca pasien sebelum submit; gunakan column grants/projection, bukan RLS baris saja. Options: tidak ada SELECT tabel langsung untuk pasien; endpoint/RPC aman fase kuis mengembalikan hanya id/label/sort_order. Admin dapat mengelola bank soal melalui sesi terotorisasi. Role tidak dapat dinaikkan melalui endpoint bank soal.

Attempts dan answers: owner read-only untuk pasien; tidak ada client INSERT/UPDATE nilai score atau is_correct. Mutasi nanti melalui scoring server terpercaya. UNIQUE(attempt_id, question_id), validasi option berasal dari question yang sama. Aktivasi soal memerlukan minimal dua opsi dan tepat satu benar secara transaksional; game hanya dapat diaktifkan jika memiliki soal valid. Trigger/guard database mencegah aktivasi atau mutasi yang meninggalkan soal aktif invalid.

Game memiliki archived_at sebagai tambahan minimum agar pengarsipan konsisten. History dipertahankan: FK restrict physical deletion bila sudah dirujuk; tidak cascade penghapusan bank soal ke attempts. Attempts memiliki snapshot server-only JSONB berisi versi soal/opsi/kunci; answers menyimpan snapshot prompt dan label jawaban untuk history. Pasien tidak mendapat SELECT snapshot kunci. Saat fase kuis, snapshot dibuat server ketika memulai attempt dan dipakai scoring. Fase 1 belum mengekspos start/submit kuis.

Tidak ada fungsi agregasi kesehatan. Dashboard admin fase ini empty state; definisi pengguna aktif dan suppression cohort harus diputuskan sebelum agregasi operasional diimplementasikan.

## 5. Auth dan route boundary

Route `/` tanpa sesi ke `/login`, patient ke `/dashboard`, admin ke `/admin/dashboard`. Role hilang/tidak valid ditolak, bukan diasumsikan admin. Middleware refresh sesi menggunakan API Supabase yang memvalidasi identitas; layout/action server mengulang pengecekan role. RLS tetap pengaman utama.

Auth routes: login, register gated, forgot-password, reset-password dan callback pertukaran code. Redirect setelah auth dibatasi path internal allowlist; origin callback memakai APP_URL server terkonfigurasi. Reset membutuhkan sesi recovery yang valid; pesan forgot-password tidak mengungkap keberadaan email. Email verification mengikuti konfigurasi Supabase dan didokumentasikan. Rate limiting Auth bawaan Supabase disetel/didokumentasikan; tidak membangun sistem limiter khusus fase ini.

Tidak tersedia service-role pada browser. `.env.local.example` memuat placeholder URL, anon key, APP_URL, registration flag dan server service-role untuk script demo; `.env.local` diabaikan git. Jangan memasukkan secret nyata dalam dokumen atau commit.

## 6. UI dan aksesibilitas

Pasien: viewport utama 390×844, minimum 320, tablet 768, desktop 1440. Bottom nav Beranda/Catatan/Edukasi/Kuis/Lainnya dengan active state dan safe-area. Lainnya menautkan Kontak Darurat dan Profil. Admin memakai sidebar responsive/drawer. Route modul yang belum selesai menampilkan informasi belum tersedia, bukan data palsu atau tombol yang mengklaim operasi berhasil.

Brand: teal #0F9D96, coral #FF8A80, mint #F1FAF8, teks #193B3A, secondary #71817F, border #E4EEEB, putih. Kontras teks/tombol diuji; teal brand tidak otomatis dipakai sebagai latar teks putih jika kontras tidak memenuhi. Body 16–18 px, target sentuh minimal 44×44, label form, fokus terlihat, error inline dan live region seperlunya. Tidak menggunakan warna sebagai satu-satunya informasi.

UI inti memakai kamus ID/EN ringan, pilihan bahasa lokal tanpa tabel preferences. Artikel demo berbahasa Indonesia tidak diterjemahkan fiktif. Disclaimer alat pencatatan/edukasi, bukan diagnosis, terlihat pada auth/shell yang relevan. Data demo diberi label “Contoh data — bukan hasil pengukuran nyata”.

## 7. Seeder Cloud terproteksi

Seeder terpisah dari produksi. Membutuhkan flag demo eksplisit dan exact project ref/host allowlist staging yang disediakan operator. URL arbitrary atau flag tunggal tidak cukup membuktikan environment aman; allowlist menjadi pagar operasional, bukan deteksi otomatis status deployment Cloud. Operator dilarang memasukkan project produksi dalam allowlist.

Auth Admin API membuat pasien demo, pasien kosong, admin demo dengan password dari environment terlindungi. Lookup akun demo memakai pagination; email fiktif `.test`. Jika email sudah ada tanpa penanda demo yang cocok, script berhenti, tidak mengambil alih akun. Tidak reset password atau menimpa data akun existing yang tidak terbukti demo.

Seed memakai UUID deterministik untuk record demo dan upsert scoped hanya record demo yang cocok. Tidak truncate/delete massal. Akun kosong tetap tanpa readings/kontak/progress. Pasien demo mendapat 21 pengukuran di beberapa hari, 3 kontak fiktif dengan placeholder non-dialable, 3–5 progress untuk slug statis yang benar, 3 attempts lengkap dengan jawaban/skor konsisten. Empat game demo: quiz, myth_fact, challenge, daily; tipe challenge/daily hanya katalog demo, bukan fitur challenge baru.

`supabase/seed.sql` memuat data non-Auth dan dijalankan hanya setelah provisioning dan migration, dengan guard identitas/environment. Artikel tetap file TS repo, bukan tabel database. Soal/artikel demo diberi status belum review klinis; tidak diklaim materi final. Placeholder kontak tidak pernah menghasilkan tel: link.

## 8. Pengujian dan bukti

Minimal test executable untuk validasi redirect/role dan konfigurasi seed; integrasi SQL/API terhadap Cloud staging dengan dua patient dan satu admin. Pengujian harus meliputi:
- Signup metadata admin tetap patient; role tidak dapat ditulis user.
- Pasien A tidak dapat mengakses readings/contact/progress/attempt pasien B.
- Admin biasa tidak membaca raw readings/contact pasien.
- Pasien tidak SELECT opsi/kunci/explanation tersembunyi atau snapshot answer key.
- Pasien tidak menulis skor/kebenaran jawaban.
- Aktivasi soal invalid ditolak; foreign key dan uniqueness menjaga history.
- Redirect internal aman, reset flow, role missing, register off, logout.
- Seed ulang tidak duplikat; target tidak diizinkan ditolak; akun non-demo tidak disentuh.
- Shell pada 320/390/768/1440 tanpa overflow, keyboard/focus navigation, safe-area, label dan bahasa.

Verification lokal: lint, TypeScript dan production build. Test Cloud hanya dinyatakan lulus setelah benar-benar dijalankan; tanpa kredensial hasil diberi status belum terverifikasi. Jangan mencatat password, tokens, notes kesehatan atau payload pasien dalam log.

## 9. Deliverables dan handoff

Repository fondasi dengan README, environment example, design.md tersinkron, migration SQL dan test izin, auth+shell, artikel/seed demo dan provisioning script. ERD tekstual/diagram berasal dari migration final. Tidak deploy Cloud atau menerapkan migration ke proyek remote tanpa target dan izin operator.

Fase berikutnya: CRUD tracker/kontak/profil; edukasi dan progress; bank soal admin; scoring snapshot dan hasil; dashboard agregat aman. Masing-masing memiliki acceptance test sebelum diklaim selesai.

Keputusan produksi yang tetap di luar fase ini: aktivasi registrasi/verifikasi, provisioning owner, retensi, clinical reviewer/thresholds, definisi active users dan statistik cohort. Default konservatif di atas membuat fondasi tidak bergantung pada keputusan tersebut.
