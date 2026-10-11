import test from 'node:test';
import assert from 'node:assert/strict';
import { destination } from '../src/lib/auth/routing.js';

test('unauthenticated patient route redirects to login', () => {
  assert.equal(destination(null, '/dashboard'), '/login');
});
test('patient cannot enter admin route', () => {
  assert.equal(destination('patient', '/admin/dashboard'), '/403');
});
test('admin root resolves to admin dashboard', () => {
  assert.equal(destination('admin', '/'), '/admin/dashboard');
});
test('patient tracker is allowed', () => {
  assert.equal(destination('patient', '/tracker'), null);
});
test('admin cannot enter patient routes', () => {
  assert.equal(destination('admin', '/kontak-darurat'), '/403');
});
test('missing role never defaults to patient or admin', () => {
  assert.equal(destination('invalid', '/admin/dashboard'), '/403');
});
