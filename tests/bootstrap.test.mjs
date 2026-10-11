import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('environment tidak membocorkan service-role', () => {
  const env = readFileSync('.env.local.example', 'utf8');
  assert.match(env, /ENABLE_REGISTRATION=false/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_.*SERVICE_ROLE/i);
});
