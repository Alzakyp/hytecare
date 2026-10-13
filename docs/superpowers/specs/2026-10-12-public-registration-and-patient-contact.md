# Public Patient Registration and Contact Completion

## Scope
- Pendaftaran publik pasien: nama tampilan, email, nomor HP wajib, password 12–128 karakter.
- Role pendaftar selalu `patient`; tidak ada field role atau pendaftaran admin.
- Nomor HP dinormalisasi dan divalidasi 9–16 digit, optional prefix `+`.
- Copy registrasi menjelaskan nomor HP dan riwayat tekanan darah dapat diakses petugas RS.
- Profil pasien menandai nomor kosong sebagai `Belum diisi` dan menyediakan form perbaikan.
- Admin daftar seluruh pasien, menampilkan nomor HP atau `Belum diisi`, lalu membuka rekam medis per pasien melalui tombol existing `Rekam Medis`.
- Akses halaman rekam medis dicatat `view_patient_health`.

## Security
- Registrasi publik dikendalikan hanya oleh `ENABLE_REGISTRATION=true`; default tetap false di template.
- Supabase signup metadata berisi display name dan phone number; trigger DB menyimpan keduanya pada profil.
- Action registrasi memperbarui profile sebagai fallback bila trigger belum memakai metadata phone.
- Tidak membuka data lintas pasien untuk patient role; admin-only policy/reported audit tidak berubah.
- Tidak pernah mengirim role dari browser ke action signup.

## Deployment
- Terapkan `202610120004_admin_patient_health.sql` terlebih dahulu karena menyediakan `profiles.phone_number`.
- Atur Vercel `ENABLE_REGISTRATION=true` setelah policy RS menyetujui pendaftaran publik.
- Supabase Auth email confirmation mengikuti setting project; aplikasi tidak menganggap signup otomatis memberi sesi aktif.
