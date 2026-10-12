import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUserQuery, validateCreateUser, validateUpdateUser } from '../src/lib/admin/users/validation.js';

test('validates user create trust boundary',()=>{
 assert.equal(validateCreateUser({display_name:'Zaky',email:'zaky@example.com',role:'admin',password:'sekur3-password'}).ok,true);
 for(const patch of [{display_name:''},{email:'x'},{role:'doctor'},{password:'pendek'}]) assert.equal(validateCreateUser({display_name:'Zaky',email:'zaky@example.com',role:'admin',password:'sekur3-password',...patch}).ok,false);
});
test('validates user update without password',()=>{
 assert.equal(validateUpdateUser({user_id:'10000000-0000-4000-8000-000000000001',display_name:'Zaky',email:'zaky@example.com',role:'patient'}).ok,true);
 assert.equal(validateUpdateUser({user_id:'bad',display_name:'Zaky',email:'zaky@example.com',role:'patient'}).ok,false);
});
test('normalizes user list query',()=>{
 assert.deepEqual(normalizeUserQuery({q:'  ZakY ',role:'admin',status:'disabled',page:'-3'}),{q:'zak y'.replace(' ',''),role:'admin',status:'disabled',page:1});
 assert.deepEqual(normalizeUserQuery({page:'100000'}),{q:'',role:'all',status:'all',page:1000});
});
