import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('migration files mendefinisikan 10 tabel aplikasi dan RLS', () => {
  const schema = readFileSync('supabase/migrations/202610110001_schema.sql', 'utf8');
  const security = readFileSync('supabase/migrations/202610110002_security.sql', 'utf8');
  const tables = [
    'profiles', 'user_roles', 'blood_pressure_readings', 'quiz_games',
    'quiz_questions', 'quiz_options', 'quiz_attempts', 'quiz_answers',
    'emergency_contacts', 'user_article_progress'
  ];
  for (const t of tables) {
    assert.match(schema, new RegExp(`create table public\\.${t}`, 'i'));
    assert.match(security, new RegExp(`alter table public\\.${t} enable row level security`, 'i'));
  }
  assert.doesNotMatch(schema, /create table.*articles\b/i);
  assert.doesNotMatch(schema, /create table.*user_preferences\b/i);
  assert.doesNotMatch(schema, /create table.*audit_logs\b/i);
});
