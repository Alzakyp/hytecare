import test from 'node:test';import assert from 'node:assert/strict';
import {scoreMythFact,scoreFoodSort,scoreWordSearch} from '../src/lib/games/engine.js';
test('scores myth or fact exactly',()=>{
 const key={'q1':true,'q2':false};
 assert.deepEqual(scoreMythFact(key,{'q1':true,'q2':false}),{score:2,total:2});
 assert.deepEqual(scoreMythFact(key,{'q1':false,'q2':false}),{score:1,total:2});
});
test('scores food sort by recommended vs limit',()=>{
 const key={'bayam':'recommended','sosis':'limit'};
 assert.deepEqual(scoreFoodSort(key,{'bayam':'recommended','sosis':'limit'}),{score:2,total:2});
});
test('scores word search from found word list',()=>{
 const words=['HIPERTENSI','GARAM','JANTUNG'];
 assert.deepEqual(scoreWordSearch(words,['HIPERTENSI','garam','SALAH']),{score:2,total:3,found:['HIPERTENSI','GARAM']});
});
