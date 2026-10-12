# Admin Patient Medical Access and Phone Specification

Status: Disetujui secara konseptual.

## Tujuan
Memungkinkan admin/petugas RS untuk melihat nomor HP dan riwayat tekanan darah dari pasien tertentu yang dipilih secara manual, guna melakukan tindak lanjut klinis atau panggilan telepon langsung dari konsol admin.

## Scope
- Skema DB:
  - Tambah `phone_number text check (phone_number is null or char_length(phone_number) between 8 and 20)` pada `public.profiles`.
  - Update RLS pada `public.blood_pressure_readings`: izinkan `select` bagi role `admin` (`public.is_admin()`). Pasien tetap hanya `select/insert/update/delete` data miliknya.
- Pasien:
  - Form `/profil` mendukung penambahan dan perubahan nomor HP (validasi format nomor Indonesia/E.164, min 9 - max 16 digit).
- Admin:
  - Daftar `/admin/users` menampilkan nomor HP pasien.
  - Tombol tindakan pada baris pasien: "Lihat Rekam Medis" menuju `/admin/users/[id]/health`.
  - Halaman `/admin/users/[id]/health`:
    - Header info pasien: Nama, Email, Nomor HP aktif dengan link panggil langsung (`tel:...`).
    - Tabel & kartu riwayat pembacaan tekanan darah: Waktu, Sistolik/Diastolik, Denyut, Gejala, Klasifikasi KMK 303/2026.
    - Audit log pencatatan akses medis: Setiap pembacaan halaman medis oleh admin dicatat di `public.admin_audit_log` (`action = 'view_patient_health'`).
    - Tidak ada antrean global otomatis; data dibuka sesuai pasien yang dipilih admin.

## Keamanan & Invariant
- Role `patient` dilarang mengakses data pasien lain maupun halaman admin.
- Nomor HP disanitasi sebelum disimpan (hanya angka dan prefix +).
- Audit log mencatat `actor_id` (admin yang membuka) dan `target_user_id` (pasien yang dibuka datanya).
