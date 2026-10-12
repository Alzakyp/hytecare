# Patient Dashboard Redesign: Calendar & Medication Tracker Design

Status: Disetujui secara konseptual.

## Tujuan
Memperbarui antarmuka beranda pasien (`/dashboard`) sesuai referensi visual:
1. Ringkasan pengukuran terakhir dengan indikator klinis KMK 303/2026.
2. Kalender bulanan interaktif dengan penanda tanggal pengukuran aktif.
3. Kartu pencatatan konsumsi harian untuk **Amlodipine** dan **Captopril**, tanpa jadwal, dosis, atau instruksi minum. Pasien hanya menandai obat yang benar-benar diresepkan dan diminum.
4. Navigasi pintasan cepat (Catatan & Kuis, tanpa modul edukasi).

## Model Data & Keamanan

### Tabel Baru: `public.medication_logs`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references public.profiles(id) on delete cascade`
- `medication_name text not null check (medication_name in ('Amlodipine', 'Captopril'))`
- `intake_date date not null` (tanggal lokal Asia/Jakarta dihitung pada server saat aksi; jangan pakai `current_date at time zone` karena `current_date` bukan timestamp)
- `taken_at timestamptz not null default now()`
- `unique (user_id, medication_name, intake_date)`

### Keamanan & RLS
- RLS aktif: `user_id = auth.uid()` untuk `select`, `insert`, dan `delete` (bila membatalkan tanda sudah minum).
- Anonim dilarang.
- Admin tidak memanipulasi rekam konsumsi obat pasien secara langsung.

## Komponen & Alur UI

1. **Header Beranda:**
   - Sapaan nama pasien (`profiles.display_name` atau email).
   - Subjudul motivasi kesehatan.

2. **Kartu Pengukuran Terakhir:**
   - Menampilkan angka sistolik/diastolik terbesar, tanggal & jam ukur.
   - Badge kategori KMK 303/2026.
   - Tombol "+ Catat tekanan darah" menuju `/tracker/new`.
   - Link "Lihat detail >" menuju `/tracker`.

3. **Kalender Pengukuran:**
   - Menampilkan bulan berjalan (grid Minggu–Sabtu) dalam zona `Asia/Jakarta`.
   - Tanggal yang memiliki minimal 1 rekaman tekanan darah ditandai dengan dot indikator (`• Ada pengukuran`).
   - Ambil hanya `measured_at` dalam rentang bulan lokal memakai batas UTC pada query; kelompokkan tanggal lokal pada server. Hindari membaca seluruh riwayat.

4. **Catatan Obat Hari Ini (bukan jadwal atau pengingat dosis):**
   - Dua kartu obat:
     - **Amlodipine** (catatan: hanya tandai jika diresepkan dan telah diminum; dosis & waktu sesuai petunjuk dokter).
     - **Captopril** (catatan sama).
   - Tidak tampilkan jam/dosis tetap dan tidak menyiratkan kedua obat wajib diminum setiap hari.
   - Status hari ini:
     - Jika ada row di `medication_logs` untuk tanggal hari ini: status "Sudah diminum" (warna hijau/teal, tombol nonaktif atau batalkan).
     - Jika belum: status "Belum diminum", tombol aksi "Tandai Sudah Minum".
   - Server Action `toggleMedicationIntake(medicationName)` menentukan tanggal hari ini di server (Asia/Jakarta), memvalidasi sesi pasien, dan `revalidatePath('/dashboard')`. Jangan percayai tanggal dari browser.

5. **Pintasan Cepat:**
   - Kartu "Riwayat Pengukuran" (`/tracker`).
   - Kartu "Permainan & Kuis" (`/game`).

## Testing & Verifikasi
- Unit test parser & validasi nama obat allowlist (`Amlodipine`, `Captopril`).
- Test Server Action contract untuk toggle log obat.
- RLS migration contract test.
- Visual & responsive check (390px mobile hingga desktop).
