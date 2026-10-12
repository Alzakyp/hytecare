import test from 'node:test';import assert from 'node:assert/strict';import {isMedicationName,jakartaDateKey} from '../src/lib/medications/validation.js';
test('only specified medicine names are accepted',()=>{assert.equal(isMedicationName('Amlodipine'),true);assert.equal(isMedicationName('Captopril'),true);assert.equal(isMedicationName('Losartan'),false)});
test('Jakarta date uses Asia/Jakarta',()=>{assert.equal(jakartaDateKey(new Date('2026-10-11T18:00:00Z')),'2026-10-12')});
