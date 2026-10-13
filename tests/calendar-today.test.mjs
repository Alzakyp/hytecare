import test from 'node:test';import assert from 'node:assert/strict';import {calendarDayClass} from '../src/lib/calendar/day.js';
test('today gets its own marker independent of measurement marker',()=>{
 assert.match(calendarDayClass('2026-10-13','2026-10-13',false),/today/);
 assert.match(calendarDayClass('2026-10-12','2026-10-13',true),/measured/);
 assert.doesNotMatch(calendarDayClass('2026-10-12','2026-10-13',false),/today|measured/);
});
