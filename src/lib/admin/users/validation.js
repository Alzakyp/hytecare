const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const roles=new Set(['admin','patient']);
const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text=(v)=>String(v??'').trim();
/** @param {any} i @returns {{ok:true,value:{display_name:string,email:string,role:string,password:string}}|{ok:false,error:string}} */
export function validateCreateUser(i){
 const display_name=text(i?.display_name), normalizedEmail=text(i?.email).toLowerCase(),role=text(i?.role),password=String(i?.password??'');
 if(!display_name||display_name.length>100)return{ok:false,error:'Nama harus 1–100 karakter.'};
 if(!email.test(normalizedEmail)||normalizedEmail.length>320)return{ok:false,error:'Email tidak valid.'};
 if(!roles.has(role))return{ok:false,error:'Role tidak valid.'};
 if(password.length<8||password.length>128)return{ok:false,error:'Password sementara harus 8–128 karakter.'};
 return{ok:true,value:{display_name,email:normalizedEmail,role,password}};
}
/** @param {any} i @returns {{ok:true,value:{user_id:string,display_name:string,email:string,role:string,password?:string}}|{ok:false,error:string}} */
export function validateUpdateUser(i){
 const user_id=text(i?.user_id),display_name=text(i?.display_name),normalizedEmail=text(i?.email).toLowerCase(),role=text(i?.role),password=String(i?.password??'');
 if(!uuid.test(user_id))return{ok:false,error:'ID pengguna tidak valid.'};
 if(!display_name||display_name.length>100)return{ok:false,error:'Nama harus 1–100 karakter.'};
 if(!email.test(normalizedEmail)||normalizedEmail.length>320)return{ok:false,error:'Email tidak valid.'};
 if(!roles.has(role))return{ok:false,error:'Role tidak valid.'};
 if(password&& (password.length<8||password.length>128))return{ok:false,error:'Password baru harus 8–128 karakter.'};
 const value={user_id,display_name,email:normalizedEmail,role};
 if(password)value.password=password;
 return{ok:true,value};
}
/** @param {any} i @returns {{q:string,role:string,status:string,page:number}} */
export function normalizeUserQuery(i){
 const q=text(i?.q).toLowerCase().replace(/\s+/g,''),role=roles.has(text(i?.role))?text(i.role):'all',status=['active','disabled'].includes(text(i?.status))?text(i.status):'all';
 const page=Math.min(1000,Math.max(1,Number.parseInt(text(i?.page)||'1',10)||1));
 return{q,role,status,page};
}
