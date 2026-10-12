const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const types=new Set(['quiz','myth_fact','challenge','daily']);
/** @param {any} i @returns {{ok:true,value:{title:string,slug:string,description:string,game_type:string}}|{ok:false,error:string}} */
export function validateGameInput(i){
 const title=String(i?.title??'').trim(),slug=String(i?.slug??'').trim().toLowerCase(),description=String(i?.description??'').trim(),game_type=String(i?.game_type??'');
 if(!title||title.length>200)return{ok:false,error:'Judul harus 1–200 karakter.'};
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return{ok:false,error:'Slug hanya huruf kecil, angka, dan tanda hubung.'};
 if(description.length>2000)return{ok:false,error:'Deskripsi maksimal 2000 karakter.'};
 if(!types.has(game_type))return{ok:false,error:'Jenis game tidak valid.'};
 return{ok:true,value:{title,slug,description,game_type}};
}
/** @param {any} i @returns {{ok:true,value:{game_id:string,prompt:string,explanation:string,sort_order:number,options:Array<{id:string|null,label:string,is_correct:boolean,sort_order:number}>}}|{ok:false,error:string}} */
export function validateQuestionInput(i){
 const game_id=String(i?.game_id??''),prompt=String(i?.prompt??'').trim(),explanation=String(i?.explanation??'').trim(),sort_order=Number(i?.sort_order),options=Array.isArray(i?.options)?i.options:[];
 if(!uuid.test(game_id))return{ok:false,error:'Game tidak valid.'};
 if(!prompt||prompt.length>2000)return{ok:false,error:'Soal harus 1–2000 karakter.'};
 if(explanation.length>4000)return{ok:false,error:'Penjelasan maksimal 4000 karakter.'};
 if(!Number.isInteger(sort_order)||sort_order<0||sort_order>10000)return{ok:false,error:'Urutan harus 0–10000.'};
 if(options.length<2)return{ok:false,error:'Minimal dua opsi.'};
 const ids=new Set(),labels=new Set();let correct=0;
 const normalized=[];
 for(const [index,o] of options.entries()){
  const id=o.id?String(o.id):null,label=String(o.label??'').trim(),is_correct=o.is_correct===true,order=Number.isInteger(Number(o.sort_order))?Number(o.sort_order):index;
  if(id&&!uuid.test(id))return{ok:false,error:'ID opsi tidak valid.'};
  if(id&&ids.has(id))return{ok:false,error:'ID opsi duplikat.'};if(id)ids.add(id);
  const key=label.toLocaleLowerCase('id');if(!label||label.length>500||labels.has(key))return{ok:false,error:'Label opsi kosong, terlalu panjang, atau duplikat.'};labels.add(key);
  if(is_correct)correct++;normalized.push({id,label,is_correct,sort_order:order});
 }
 if(correct!==1)return{ok:false,error:'Pilih tepat satu jawaban benar.'};
 if(i.game_type==='myth_fact'&&options.length!==2)return{ok:false,error:'Mitos/Fakta harus memiliki dua opsi.'};
 return{ok:true,value:{game_id,prompt,explanation,sort_order,options:normalized}};
}
