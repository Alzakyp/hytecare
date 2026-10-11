# HyteCare

Fondasi aplikasi pencatatan dan edukasi hipertensi. **Belum siap produksi**; bukan alat diagnosis.

## Lokal

```bash
cp .env.local.example .env.local
# Isi URL dan anon key dari project Supabase Cloud staging; jangan commit file ini.
npm ci
npm run dev
```

Registrasi publik nonaktif secara default. Jangan jalankan migration atau seed pada project produksi. Instruksi Cloud dan pengujian izin akan ditambahkan ketika migration selesai.
