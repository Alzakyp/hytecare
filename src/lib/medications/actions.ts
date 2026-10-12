"use server";
import {revalidatePath} from "next/cache";
import {requireRole} from "@/lib/auth/roles";
import {createClient} from "@/lib/supabase/server";
import {isMedicationName,jakartaDateKey} from "./validation.js";
export async function toggleMedicationIntake(name:string){
 const {userId}=await requireRole("patient");
 if(!isMedicationName(name))return {error:"Nama obat tidak valid."};
 const supabase=await createClient(),day=jakartaDateKey();
 const {data,error}=await supabase.from("medication_logs").select("id").eq("user_id",userId).eq("medication_name",name).eq("intake_date",day).maybeSingle();
 if(error)return {error:"Catatan obat belum tersedia."};
 const result=data?await supabase.from("medication_logs").delete().eq("id",data.id).eq("user_id",userId):await supabase.from("medication_logs").insert({user_id:userId,medication_name:name,intake_date:day});
 if(result.error)return {error:"Gagal menyimpan catatan obat."};
 revalidatePath("/dashboard");return {message:data?"Tanda minum dibatalkan.":"Dicatat sudah diminum."};
}
