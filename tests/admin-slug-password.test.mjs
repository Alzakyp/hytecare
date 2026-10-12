import test from 'node:test';
import assert from 'node:assert/strict';
import { slugifyGameTitle } from '../src/lib/quiz/validation.js';
import { validateUpdateUser } from '../src/lib/admin/users/validation.js';

test('game slug is generated safely from Indonesian title',()=>{
 assert.equal(slugifyGameTitle('  Kuis Hipertensi: Dasar & Lanjut! '),'kuis-hipertensi-dasar-lanjut');
 assert.equal(slugifyGameTitle('Tekanan Dáráh'),'tekanan-darah');
 assert.equal(slugifyGameTitle('---'),'game');
});
test('optional managed password must be 8-128 characters',()=>{
 const base={user_id:'10000000-0000-4000-8000-000000000001',display_name:'Zaky',email:'zaky@example.com',role:'patient'};
 assert.equal(validateUpdateUser(base).ok,true);
 assert.equal(validateUpdateUser({...base,password:''}).ok,true);
 assert.equal(validateUpdateUser({...base,password:'pendek'}).ok,false);
 assert.equal(validateUpdateUser({...base,password:'password-baru'}).value.password,'password-baru');
});
