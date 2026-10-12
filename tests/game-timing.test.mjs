import test from 'node:test';
import assert from 'node:assert/strict';
import { gameDuration, remainingFraction } from '../src/lib/games/timing.js';
test('durations and elapsed time are bounded',()=>{
 assert.equal(gameDuration('word_search'),300000);
 assert.equal(gameDuration('myth_fact'),15000);
 assert.equal(remainingFraction(1000,8500,15000),0.5);
 assert.equal(remainingFraction(1000,999999,15000),0);
 assert.equal(remainingFraction(1000,0,15000),1);
});
