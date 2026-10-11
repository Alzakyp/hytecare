import test from 'node:test';
import assert from 'node:assert/strict';
import { registrationEnabled, safeReturnPath } from '../src/lib/auth/helpers.js';

test('external return paths are rejected', () => {
  assert.equal(safeReturnPath('//evil.test'), '/dashboard');
  assert.equal(safeReturnPath('https://evil.test'), '/dashboard');
  assert.equal(safeReturnPath('/tracker'), '/tracker');
  assert.equal(safeReturnPath('/evil-subpath'), '/dashboard');
});
test('registration is disabled by default', () => {
  assert.equal(registrationEnabled({}), false);
  assert.equal(registrationEnabled({ ENABLE_REGISTRATION: 'false' }), false);
  assert.equal(registrationEnabled({ ENABLE_REGISTRATION: 'true' }), true);
});
