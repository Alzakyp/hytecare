import {normalizePhone} from '../profile/phone.js';
/** @param {any} input @returns {{ok:true,value:{display_name:string,email:string,phone_number:string,password:string}}|{ok:false,error:string}} */
export function validateRegistrationInput(input){
 const display_name=String(input?.display_name??'').trim(),email=String(input?.email??'').trim().toLowerCase(),phone_number=normalizePhone(input?.phone_number),password=String(input?.password??'');
 if(!display_name||display_name.length>100)return{ok:false,error:'Nama wajib diisi, maksimal 100 karakter.'};
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return{ok:false,error:'Email tidak valid.'};
 if(!phone_number)return{ok:false,error:'Nomor handphone wajib diisi (9–16 digit).'};
 if(password.length<12||password.length>128)return{ok:false,error:'Kata sandi harus 12–128 karakter.'};
 return{ok:true,value:{display_name,email,phone_number,password}};
}
