"use client";
import {useState,useTransition} from "react";
import {submitGameAction} from "@/lib/games/actions";

type Item={id:string;text?:string;label?:string};
type Game={slug:string;title:string;game_type:string;config:{items?:Item[];words?:string[];grid?:string[][]}};
export function GameBoard({game}:{game:Game}){
 const [answers,setAnswers]=useState<Record<string,boolean|string>>({}),[found,setFound]=useState<string[]>([]),[startCell,setStartCell]=useState<[number,number]|null>(null),[result,setResult]=useState<{score:number;total:number}|null>(null),[error,setError]=useState(''),[pending,start]=useTransition();
 const items=game.config.items??[], grid=game.config.grid??[], words=game.config.words??[];
 const onSelectCell=(r:number,c:number)=>{
  if(!startCell){setStartCell([r,c]);return}
  const [r0,c0]=startCell;setStartCell(null);
  const dr=Math.sign(r-r0),dc=Math.sign(c-c0),len=Math.max(Math.abs(r-r0),Math.abs(c-c0))+1;
  if((dr===0&&dc===0)||(dr!==0&&dc!==0&&Math.abs(r-r0)!==Math.abs(c-c0)))return;
  let word='';for(let i=0;i<len;i++)word+=grid[r0+i*dr]?.[c0+i*dc]??'';
  if(words.includes(word)&&!found.includes(word))setFound([...found,word]);
 };
 return <div className="grid gap-4">{game.game_type==='word_search'?<div className="card space-y-4"><p className="text-sm">Sentuh huruf awal lalu huruf akhir kata pada kotak di bawah:</p><div className="inline-grid grid-cols-12 gap-1 p-2 bg-[var(--mint)] border border-[var(--border)] rounded-2xl max-w-full overflow-x-auto">{grid.map((row,r)=>row.map((ch,c)=><button key={`${r}-${c}`} type="button" onClick={()=>onSelectCell(r,c)} className={`w-7 h-7 sm:w-9 sm:h-9 text-xs sm:text-sm font-bold rounded-lg border ${startCell&&startCell[0]===r&&startCell[1]===c?'bg-[var(--teal)] text-white border-[var(--teal)]':'bg-white border-[var(--border)]'}`}>{ch}</button>))}</div><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">Daftar kata ({found.length}/{words.length}):</p><div className="flex flex-wrap gap-2">{words.map(w=><span key={w} className={`px-2.5 py-1 text-xs rounded-full border ${found.includes(w)?'bg-[var(--teal-soft)] border-[var(--teal)] text-[var(--teal-deep)] font-bold':'bg-white border-[var(--border)] text-[var(--ink-muted)]'}`}>{w}</span>)}</div></div></div>:items.map((item,i)=><fieldset key={item.id} className="card border border-[var(--border)]"><legend className="font-semibold px-1">{i+1}. {item.text??item.label}</legend><div className="flex gap-2 flex-wrap mt-3">{(game.game_type==='myth_fact'?[['Mitos',false],['Fakta',true]]:[['Sebaiknya dikonsumsi','recommended'],['Perlu dibatasi','limit']]).map(([label,value])=><label key={String(value)} className="secondary-link cursor-pointer"><input type="radio" name={item.id} checked={answers[item.id]===value} onChange={()=>setAnswers({...answers,[item.id]:value})}/> {label}</label>)}</div></fieldset>)}
 {error&&<p className="form-error" role="alert">{error}</p>}{result?<div className="card bg-[var(--teal-soft)]" role="status"><h2 className="text-xl font-bold">Skor {result.score}/{result.total}</h2><p>Ini materi edukasi, bukan diagnosis.</p><button className="secondary-link mt-3" onClick={()=>{setResult(null);setAnswers({});setFound([]);setStartCell(null)}}>Main lagi</button></div>:<button className="auth-button" disabled={pending} onClick={()=>start(async()=>{const res=await submitGameAction(game.slug,game.game_type==='word_search'?{found}:answers);if('error' in res)setError(res.error);else setResult({score:res.score,total:res.total})})}>{pending?'Memeriksa…':'Lihat hasil'}</button>}</div>;
}
