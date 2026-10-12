import test from 'node:test';import assert from 'node:assert/strict';import {cellsBetween,wordAtCells} from '../src/lib/games/word-search.js';
test('marks every cell between selected endpoints',()=>{assert.deepEqual(cellsBetween([0,0],[0,2]),[[0,0],[0,1],[0,2]]);assert.equal(wordAtCells([['T','E','N'],['X','X','X']],[[0,0],[0,1],[0,2]]),'TEN')});
test('supports vertical and diagonal words',()=>{assert.deepEqual(cellsBetween([0,1],[2,1]),[[0,1],[1,1],[2,1]]);assert.deepEqual(cellsBetween([0,0],[2,2]),[[0,0],[1,1],[2,2]])});
