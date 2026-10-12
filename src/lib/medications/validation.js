export const MEDICATIONS=['Amlodipine','Captopril'];
export function isMedicationName(value){return MEDICATIONS.includes(value)}
export function jakartaDateKey(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
