"use server";
import {requireRole} from "@/lib/auth/roles";
import {createClient} from "@/lib/supabase/server";
export async function submitGameAction(slug:string,answers:unknown){
 await requireRole('patient');const client=await createClient();
 const {data:game}=await client.from('quiz_games').select('id').eq('slug',slug).single();
 if(!game)return {error:'Game tidak ditemukan.'};
 const {data,error}=await client.rpc('submit_game',{p_game_id:game.id,p_answers:answers});
 if(error)return {error:'Jawaban belum dapat dinilai. Coba lagi.'};
 return data as {score:number;total:number};
}
