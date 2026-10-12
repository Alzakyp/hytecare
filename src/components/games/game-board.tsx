"use client";
import {useState,useEffect,useTransition,useCallback} from "react";
import {submitGameAction} from "@/lib/games/actions";
import {gameDuration,remainingFraction} from "@/lib/games/timing.js";
import {playChime} from "@/lib/games/audio";
import {cellsBetween,wordAtCells} from "@/lib/games/word-search.js";

type Item={id:string;text?:string;label?:string};
type Game={slug:string;title:string;game_type:string;config:{items?:Item[];words?:string[];grid?:string[][]}};

export function GameBoard({game}:{game:Game}){
 const items=game.config.items??[], grid=game.config.grid??[], words=game.config.words??[];
 const duration=gameDuration(game.game_type);
 const [index,setIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<string,boolean|string>>({});
 const [found,setFound]=useState<string[]>([]);
 const [markedCells,setMarkedCells]=useState<string[]>([]);
 const [startCell,setStartCell]=useState<[number,number]|null>(null);
 const [startTime,setStartTime]=useState<number>(()=>Date.now());
 const [fraction,setFraction]=useState(1);
 const [result,setResult]=useState<{score:number;total:number}|null>(null);
 const [error,setError]=useState("");
 const [pending,start]=useTransition();

 const finish=useCallback((finalAnswers:Record<string,boolean|string>,finalFound:string[])=>{
  start(async()=>{
   const res=await submitGameAction(game.slug,game.game_type==='word_search'?{found:finalFound}:finalAnswers);
   if('error' in res)setError(res.error);else setResult({score:res.score,total:res.total});
  });
 },[game.slug,game.game_type]);

 const advance=useCallback((updatedAnswers:Record<string,boolean|string>)=>{
  if(index+1<items.length){
   setIndex(i=>i+1);
   setStartTime(Date.now());
  }else{
   finish(updatedAnswers,found);
  }
 },[index,items.length,finish,found]);

 useEffect(()=>{
  if(result)return;
  const timer=setInterval(()=>{
   const f=remainingFraction(startTime,Date.now(),duration);
   setFraction(f);
   if(f<=0){
    if(game.game_type==='word_search')finish(answers,found);
    else advance(answers);
   }
  },100);
  return ()=>clearInterval(timer);
 },[startTime,duration,result,game.game_type,answers,found,finish,advance]);

 const choose=(val:boolean|string)=>{
  playChime();
  const currentItem=items[index];
  if(!currentItem)return;
  const nextAns={...answers,[currentItem.id]:val};
  setAnswers(nextAns);
  advance(nextAns);
 };

 const onSelectCell=(r:number,c:number)=>{
  playChime();
  if(!startCell){setStartCell([r,c]);return;}
  const cells=cellsBetween(startCell,[r,c]);setStartCell(null);
  const word=wordAtCells(grid,cells);
  if(words.includes(word)&&!found.includes(word)){
   const nextFound=[...found,word];
   setFound(nextFound);
   setMarkedCells(previous=>[...new Set([...previous,...cells.map(([row,col])=>`${row}-${col}`)])]);
   if(nextFound.length===words.length)finish(answers,nextFound);
  }
 };

 if(result){
  return <div className="card text-center p-8 bg-[var(--teal-soft)] border border-[var(--teal)] animate-enter" role="status">
   <div className="w-20 h-20 mx-auto rounded-3xl bg-[var(--teal)] flex items-center justify-center text-white mb-4 shadow-lg">
    <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
   </div>
   <h2 className="text-3xl font-extrabold text-[var(--teal-deep)]">Skor {result.score} / {result.total}</h2>
   <button className="dashboard-link mt-6 mx-auto" onClick={()=>{setResult(null);setAnswers({});setFound([]);setMarkedCells([]);setIndex(0);setStartTime(Date.now())}}>Main lagi</button>
  </div>;
 }

 return <div className="grid gap-5">
  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner" aria-hidden="true">
   <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-100 ease-linear rounded-full" style={{width:`${Math.round(fraction*100)}%`}}/>
  </div>

  {game.game_type==='word_search'?(
   <div className="card space-y-4">
    <div className="flex justify-between items-center text-xs font-bold text-[var(--ink-muted)]">
     <span>Sentuh huruf awal lalu akhir kata</span>
     <span>{found.length} / {words.length} ditemukan</span>
    </div>
    <div className="inline-grid grid-cols-12 gap-1 p-2 bg-[var(--mint)] border border-[var(--border)] rounded-2xl max-w-full overflow-x-auto mx-auto shadow-sm">
     {grid.map((row,r)=>row.map((ch,c)=>(
      <button key={`${r}-${c}`} type="button" onClick={()=>onSelectCell(r,c)} className={`w-7 h-7 sm:w-9 sm:h-9 text-xs sm:text-sm font-bold rounded-lg border transition-transform active:scale-95 ${startCell&&startCell[0]===r&&startCell[1]===c?'bg-[var(--teal)] text-white border-[var(--teal)] shadow':markedCells.includes(`${r}-${c}`)?'bg-emerald-400 text-emerald-950 border-emerald-600 shadow-sm':'bg-white border-[var(--border)]'}`}>{ch}</button>
     )))}
    </div>
    <div className="flex flex-wrap gap-2 pt-2">
     {words.map(w=><span key={w} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${found.includes(w)?'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold line-through':'bg-white border-[var(--border)] text-[var(--ink-muted)]'}`}>{w}</span>)}
    </div>
    <button className="secondary-link w-full justify-center" disabled={pending} onClick={()=>finish(answers,found)}>{pending?'Menyimpan…':'Selesaikan sekarang'}</button>
   </div>
  ):(
   items[index]&&(
    <div key={items[index].id} className="card p-6 border border-[var(--border)] shadow-md animate-enter space-y-6">
     <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--teal-deep)]">
      <span>Soal {index+1} dari {items.length}</span>
      <span>Pilih langsung</span>
     </div>
     <h2 className="text-xl sm:text-2xl font-bold text-center py-4 text-[var(--ink)] min-h-24 flex items-center justify-center">
      {items[index].text??items[index].label}
     </h2>
     <div className="grid grid-cols-2 gap-4 pt-2">
      {(game.game_type==='myth_fact'?[['Mitos',false,'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'],['Fakta',true,'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300']]:[['Konsumsi','recommended','bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'],['Batasi','limit','bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300']]).map(([lbl,val,cls])=>(
       <button key={String(val)} type="button" disabled={pending} onClick={()=>choose(val as boolean|string)} className={`min-h-16 rounded-2xl border-2 font-extrabold text-lg sm:text-xl active:scale-95 transition-all shadow-sm flex items-center justify-center ${cls}`}>
        {lbl}
       </button>
      ))}
     </div>
    </div>
   )
  )}
  {error&&<p className="form-error" role="alert">{error}</p>}
 </div>;
}
