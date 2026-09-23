import { getPlanningLevel } from '../../src/game/data/planningLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
import { canCompletePlanning } from '../../src/game/core/planningSolvability'

const level = getPlanningLevel(13)
const points = [[1,1],[5,0],[7,2],[1,3],[3,3],[4,3],[7,5],[3,4],[1,7]]
const placements = points.map(([x,y], i) => ({catId:level.cats[i].id,x,y}))
console.log('screenshot plus bottom white solvable:',canCompletePlanning(level, placements))
const completed = [...placements,level.solution[9],{catId:level.cats[10].id,x:1,y:5}]
const result = resolvePlanning(arrangeCats(level,completed)!)
console.log('finish the bottom orange and left blue lines; remaining:',result.remaining)
for (const frame of result.frames.filter(f=>f.clearing.length)) {
 console.log('wave',frame.wave,frame.board.flatMap((row,y)=>row.flatMap((cat,x)=>cat && frame.clearing.includes(cat.id)?[{x:x+1,y:y+1,type:cat.type,order:cat.placementOrder}]:[])))
}
console.log('remaining',result.frames.at(-1)?.board.flatMap((row,y)=>row.flatMap((cat,x)=>cat?[{x:x+1,y:y+1,type:cat.type,order:cat.placementOrder}]:[])))
console.log('before ninth solvable:',canCompletePlanning(level,placements.slice(0,8)))
