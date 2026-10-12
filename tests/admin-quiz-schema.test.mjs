import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync('supabase/migrations/202610120001_admin_quiz_rpc.sql', 'utf8');

test('migration mendefinisikan RPC admin quiz atomik', () => {
  assert.match(sql, /create or replace function public\.admin_save_question/);
  assert.match(sql, /create or replace function public\.admin_get_question/);
  assert.match(sql, /security definer set search_path=''/);
  assert.match(sql, /public\.is_admin\(\)/);
  assert.match(sql, /v_correct <> 1/);
  assert.match(sql, /revoke all on function public\.admin_save_question/);
  assert.match(sql, /revoke all on function public\.admin_get_question/);
});
