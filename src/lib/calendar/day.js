export function calendarDayClass(key,today,measured){return [key===today?'today':'',measured?'measured':''].filter(Boolean).join(' ')}
