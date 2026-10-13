import test from 'node:test';import assert from 'node:assert/strict';import {validateRegistrationInput} from '../src/lib/auth/registration.js';
const valid={display_name:'Nur Azizah',email:'nur@example.com',phone_number:'0812 3456-7890',password:'rahasia-panjang-123'};
test('patient registration requires name, email, phone and password',()=>{
 assert.deepEqual(validateRegistrationInput(valid).value,{display_name:'Nur Azizah',email:'nur@example.com',phone_number:'081234567890',password:'rahasia-panjang-123'});
 for(const patch of [{display_name:''},{email:'invalid'},{phone_number:''},{phone_number:'1234'},{password:'pendek'}]) assert.equal(validateRegistrationInput({...valid,...patch}).ok,false);
});
