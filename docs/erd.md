# HyteCare Entity-Relationship Diagram

Sepuluh tabel aplikasi di schema `public` ditambah tabel `auth.users` bawaan Supabase.

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "1:1 id"
    PROFILES ||--|| USER_ROLES : "user_id PK/FK"
    PROFILES ||--o{ BLOOD_PRESSURE_READINGS : "user_id (owner only)"
    PROFILES ||--o{ EMERGENCY_CONTACTS : "user_id (owner only)"
    PROFILES ||--o{ USER_ARTICLE_PROGRESS : "user_id (owner only)"
    PROFILES ||--o{ QUIZ_ATTEMPTS : "user_id"
    QUIZ_GAMES ||--o{ QUIZ_QUESTIONS : "game_id"
    QUIZ_QUESTIONS ||--o{ QUIZ_OPTIONS : "question_id"
    QUIZ_GAMES ||--o{ QUIZ_ATTEMPTS : "game_id"
    QUIZ_ATTEMPTS ||--o{ QUIZ_ANSWERS : "attempt_id"
    QUIZ_QUESTIONS ||--o{ QUIZ_ANSWERS : "question_id"
    QUIZ_OPTIONS ||--o{ QUIZ_ANSWERS : "selected_option_id"
```

## Kebijakan Akses

- `blood_pressure_readings`, `emergency_contacts`, `user_article_progress`: hanya pemilik (`user_id = auth.uid()`). Admin tidak memiliki policy bypass raw.
- `quiz_options`: SELECT dicabut dari public/authenticated. Pasien hanya membaca opsi tanpa `is_correct` melalui `public.patient_quiz(slug)`.
- `user_roles`: hanya dapat dibaca; modifikasi hanya melalui server provisioning.
- `quiz_attempts`, `quiz_answers`: SELECT hanya pemilik; mutasi client dinonaktifkan.
