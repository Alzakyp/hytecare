import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('role query does not assume a nonexistent FK to account_status', () => {
  const source = readFileSync('src/lib/auth/roles.ts', 'utf8');
  assert.doesNotMatch(source, /account_status!inner/);
  assert.match(source, /from\("user_roles"\)/);
  assert.match(source, /from\("account_status"\)/);
  assert.match(source, /Promise\.all/);
});
