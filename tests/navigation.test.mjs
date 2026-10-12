import test from 'node:test';
import assert from 'node:assert/strict';
import { patientNavItems, adminNavItems } from '../src/lib/navigation.js';

test('patient navigation defines four requested tabs without education', () => {
  const hrefs = patientNavItems.map(item => item.href);
  assert.deepEqual(hrefs, ['/dashboard', '/tracker', '/game', '/lainnya']);
  for (const item of patientNavItems) {
    assert.ok(item.labelId, 'Indonesian label is required');
    assert.ok(item.labelEn, 'English label is required');
    assert.match(item.href, /^\//, 'Paths must be root-relative');
  }
});

test('admin navigation includes permitted sections and excludes forbidden', () => {
  const hrefs = adminNavItems.map(item => item.href);
  assert.deepEqual(hrefs, ['/admin/dashboard', '/admin/users', '/admin/games', '/admin/questions', '/admin/profile']);
  assert.equal(hrefs.includes('/admin/articles'), false, 'No admin articles page');
  assert.equal(hrefs.includes('/admin/audit-logs'), false, 'No admin audit-logs page');
  assert.equal(hrefs.includes('/admin/preferences'), false, 'No admin preferences page');
});
