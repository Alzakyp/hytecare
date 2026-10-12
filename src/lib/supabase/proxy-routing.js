export function shouldRefreshSession(headers){
 if(headers.get('next-action'))return true;
 if(headers.get('rsc')==='1'||headers.get('next-router-prefetch')==='1'||headers.get('next-router-state-tree'))return false;
 return true;
}
