export function gameDuration(type){return type==='word_search'?300000:15000}
export function remainingFraction(start,now,duration){return Math.max(0,Math.min(1,1-(now-start)/duration))}
