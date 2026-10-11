import test from 'node:test';
import assert from 'node:assert/strict';
import { assertDemoTarget } from '../scripts/seed-guard.js';

test('assertDemoTarget allows exact allowlisted https hostname when flag is true', () => {
  assert.doesNotThrow(() => {
    assertDemoTarget('https://dev-project.supabase.co', 'dev-project.supabase.co', true);
  });
});

test('assertDemoTarget rejects when seed flag is false or missing', () => {
  assert.throws(() => {
    assertDemoTarget('https://dev-project.supabase.co', 'dev-project.supabase.co', false);
  }, /HYTECARE_ALLOW_SEED/);
});

test('assertDemoTarget rejects mismatched host or non-supabase hostname', () => {
  assert.throws(() => {
    assertDemoTarget('https://prod-project.supabase.co', 'dev-project.supabase.co', true);
  }, /allowlist/);
  assert.throws(() => {
    assertDemoTarget('https://attacker-supabase.co', 'attacker-supabase.co', true);
  }, /supabase\.co/);
});

test('assertDemoTarget rejects insecure http or credentials in url', () => {
  assert.throws(() => {
    assertDemoTarget('http://dev-project.supabase.co', 'dev-project.supabase.co', true);
  }, /https/);
  assert.throws(() => {
    assertDemoTarget('https://user:pass@dev-project.supabase.co', 'dev-project.supabase.co', true);
  }, /credentials/);
});
