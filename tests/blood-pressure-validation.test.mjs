import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReading } from '../src/lib/blood-pressure/validation.js';

const valid = { systolic: '120', diastolic: '80', heartRate: '72', measuredAt: '2026-10-12T09:00', notes: 'Pagi' };
test('validates and normalizes a reading', () => { const r=validateReading(valid); assert.equal(r.ok,true); assert.equal(r.value.systolic,120); });
test('rejects physical sanity boundaries', () => {
  assert.equal(validateReading({...valid,systolic:'49'}).ok,false);
  assert.equal(validateReading({...valid,systolic:'301'}).ok,false);
  assert.equal(validateReading({...valid,diastolic:'29'}).ok,false);
  assert.equal(validateReading({...valid,diastolic:'201'}).ok,false);
  assert.equal(validateReading({...valid,systolic:'80',diastolic:'90'}).ok,false);
  assert.equal(validateReading({...valid,systolic:'120abc'}).ok,false);
  assert.equal(validateReading({...valid,heartRate:'72.5'}).ok,false);
});
test('allows empty heart rate and rejects invalid date', () => {
 const r=validateReading({...valid,heartRate:''}); assert.equal(r.ok,true); assert.equal(r.value.heart_rate,null);
 assert.equal(validateReading({...valid,measuredAt:'bad'}).ok,false);
});
