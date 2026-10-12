export function cellsBetween(a,b){
 const [r0,c0]=a,[r1,c1]=b,dr=Math.sign(r1-r0),dc=Math.sign(c1-c0);
 const len=Math.max(Math.abs(r1-r0),Math.abs(c1-c0))+1;
 if((dr===0&&dc===0)||(dr!==0&&dc!==0&&Math.abs(r1-r0)!==Math.abs(c1-c0)))return [];
 const cells=[];for(let i=0;i<len;i++)cells.push([r0+i*dr,c0+i*dc]);return cells;
}
export function wordAtCells(grid,cells){return cells.map(([r,c])=>grid[r]?.[c]??'').join('')}
