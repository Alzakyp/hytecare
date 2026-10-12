import test from 'node:test';import assert from 'node:assert/strict';import {normalizePhone,phoneHref} from '../src/lib/profile/phone.js';
test('normalizes Indonesian phones',()=>{
 assert.equal(normalizePhone('0812 3456-7890'),'081234567890');
 assert.equal(normalizePhone('+62 812-3456-7890'),'+6281234567890');
 assert.equal(normalizePhone('12345'),null);
 assert.equal(normalizePhone('0812345678901234567'),null);
});
test('builds phone href',()=>{assert.equal(phoneHref('081234567890'),'tel:081234567890')});
