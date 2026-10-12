import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGameInput, validateQuestionInput } from '../src/lib/quiz/validation.js';
const game={title:'Tes',slug:'tes-game',description:'',game_type:'quiz'};
const question={game_id:'10000000-0000-4000-8000-000000000001',prompt:'Tes?',explanation:'Alasan',sort_order:0,options:[{label:'Ya',is_correct:true},{label:'Tidak',is_correct:false}]};
test('game validates trust boundary',()=>{
 assert.equal(validateGameInput(game).ok,true);
 for(const patch of [{title:''},{slug:'../x'},{game_type:'invalid'},{description:'x'.repeat(2001)}]) assert.equal(validateGameInput({...game,...patch}).ok,false);
});
test('question enforces options and a single answer',()=>{
 assert.equal(validateQuestionInput(question).ok,true);
 for(const patch of [{prompt:''},{sort_order:1.5},{game_id:'bad'},{options:[]},{options:[{label:'A',is_correct:false},{label:'B',is_correct:false}]},{options:[{label:'A',is_correct:true},{label:'B',is_correct:true}]},{options:[{label:'',is_correct:true},{label:'B',is_correct:false}]}]) assert.equal(validateQuestionInput({...question,...patch}).ok,false);
});
test('duplicate option identities and labels are rejected',()=>{
 assert.equal(validateQuestionInput({...question,options:[{label:'A',is_correct:true},{label:'A',is_correct:false}]}).ok,false);
 assert.equal(validateQuestionInput({...question,options:[{id:question.game_id,label:'A',is_correct:true},{id:question.game_id,label:'B',is_correct:false}]}).ok,false);
});
