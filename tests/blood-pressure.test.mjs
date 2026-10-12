import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyBloodPressure } from '../src/lib/blood-pressure/classifier.js';
import { getBloodPressureGuidance } from '../src/lib/blood-pressure/guidance.js';

test('KMK 303/2026 office classification thresholds', () => {
  assert.equal(classifyBloodPressure(115, 68).key, 'tidak_meningkat');
  assert.equal(classifyBloodPressure(122, 75).key, 'meningkat');
  assert.equal(classifyBloodPressure(135, 82).key, 'meningkat');
  assert.equal(classifyBloodPressure(145, 92).key, 'derajat_1');
  assert.equal(classifyBloodPressure(165, 102).key, 'derajat_2');
  assert.equal(classifyBloodPressure(185, 112).key, 'derajat_3');
});

test('picks highest category when systolic and diastolic differ', () => {
  // systolic normal (125), diastolic derajat 1 (95) -> derajat 1
  assert.equal(classifyBloodPressure(125, 95).key, 'derajat_1');
  // systolic derajat 2 (165), diastolic optimal (65) -> derajat 2
  assert.equal(classifyBloodPressure(165, 65).key, 'derajat_2');
  assert.equal(classifyBloodPressure(185, 55).key, 'derajat_3');
});

test('derajat 3 flags very high and triggers emergency button guidance', () => {
  const result = classifyBloodPressure(182, 95);
  assert.equal(result.isVeryHigh, true);
  const guidance = getBloodPressureGuidance({ systolic: 182, diastolic: 95, hasRedFlags: true });
  assert.equal(guidance.showEmergencyCall, true);
  assert.match(guidance.emergencyNumber, /0341.*4372409/);
});

test('low blood pressure warns to re-measure without emergency call', () => {
  const result = classifyBloodPressure(85, 55);
  assert.equal(result.key, 'rendah');
  const guidance = getBloodPressureGuidance({ systolic: 85, diastolic: 55, hasRedFlags: false });
  assert.equal(guidance.showEmergencyCall, false);
});
