import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { accessPointsOf, accessCrossingCost, hatchwayFightAccess, setHatchState } from '../js/tombworld-access.js';
import { moveCtx, findPath, wholeInchPath } from '../js/path.js';
import { renderBoard } from '../js/board.js';
import { tombWorldMapSvg, TOMB_WORLD_MAPS } from '../js/tombworld-maps.js';
import { aiStep, aiStrategy } from '../js/ai.js';

const make = () => G.newGame({teams:['angels','kommandos'],ai:null,equip:[[],[]],mission:'secure',map:'tombworld-1'});
const g=make(), a=g.ops[0], b=g.ops.find(o=>o.side === 1);
const door=accessPointsOf(g).find(d=>d.component === 'A3' && d.x === 12);
assert(door);assert.equal(door.moveCost,1);setHatchState(g,door.id,'open');
const line=(xs)=>xs.map(x=>({x,y:8}));
assert.equal(accessCrossingCost(line([10,14]),[door]),1);
assert.equal(accessCrossingCost(line([14,10]),[door]),1);
assert.equal(accessCrossingCost(line([10,12,14]),[door]),1,'waypoint at the access plane does not double charge');
assert.equal(accessCrossingCost(line([10,14,10]),[door]),2,'out and back crosses twice');
assert.equal(accessCrossingCost(line([14,12,14]),[door]),0,'touch and return is not a crossing');
assert.equal(accessCrossingCost([{x:12,y:7.8},{x:12,y:8.2}],[door]),0,'parallel movement is not a crossing');
assert.equal(accessCrossingCost([{x:10,y:6},{x:14,y:6}],[door]),0,'solid wall is not a door');

g.ops=[a];a.x=10;a.y=8;a.acted={};
for(const kind of ['reposition','dash','charge','fallBack']) {
  const ctx=moveCtx(g,a,kind), pts=line([10,14]);
  assert(ctx.segFree(pts[0],pts[1]),'32mm base can pass 1.25-inch Accessible aperture');
  assert.equal(ctx.climbs(pts),0,'passing the door is not climbing its walls');
  assert.equal(ctx.extra(pts),1);
  const path=findPath(ctx,{x:14,y:8});assert(path);assert.equal(path.len,5);
  assert.equal(wholeInchPath(ctx,path,5).len,5);
  const limited=wholeInchPath(ctx,path,4);assert(limited && limited.len<=4 && limited.pts.at(-1).x<14);
  assert(!ctx.segFree({x:10,y:6},{x:14,y:6}),'solid wall cannot be crossed');
}
// Use an actual Murderwing operative to check Wall takes precedence over FLY.
const flight=G.newGame({teams:['murderwing','angels'],ai:null,equip:[[],[]],map:'tombworld-1'});
const f=flight.ops[0];flight.ops=[f];f.acted={};flight.active=f.uid;
assert(!moveCtx(flight,f).segFree({x:10,y:6},{x:14,y:6}));

g.ops=[a,b];a.acted={};b.acted={};a.dead=false;b.dead=false;
const ra=G.radius(a), rb=G.radius(b);
a.x=12-.125-ra;a.y=8;b.x=12+.125+rb+1;b.y=8;
assert(!G.isEngaged(g,a));assert(hatchwayFightAccess(g,a,b,ra,rb));
assert(G.fightTargets(g,a).includes(b));
g.active=a.uid;g.phase='firefight';g.tp=1;a.ap=3;a.order='conceal';
const act=G.availableActions(g,a).find(x=>x.id==='fight');assert(act.ok);assert.equal(act.name.en,'Hatchway Fight');
const before=a.ap;G.startFight(g,a,G.tpl(a).weapons.find(w=>w.type==='melee'),b);
assert(g.fight.hatchway);assert.equal(a.ap,before-1);assert.equal(a.acted.fight,1);
if(!g.fight.done) assert(G.inEngagement(a,b,g),'temporary control range during the action');
G.endFight(g);assert.equal(g.hatchwayFight,null);assert(!G.inEngagement(a,b,g));
a.acted={};b.x=14.8;assert(!hatchwayFightAccess(g,a,b,ra,rb));
b.x=10;assert(!hatchwayFightAccess(g,a,b,ra,rb),'target must be on the opposite side');
b.x=13.8;a.x=10;assert(!hatchwayFightAccess(g,a,b,ra,rb),'attacker must touch the access point');
a.x=12-.125-ra;b.x=13.8;
const other={...b,uid:'third-enemy',x:a.x-1.5,y:a.y};g.ops.push(other);
assert(G.isEngaged(g,a));assert(!G.fightTargets(g,a).includes(b),'already engaged: use ordinary Fight, not Hatchway Fight');
g.ops=[a,b];a.x=11.2;a.y=6;b.x=12.8;b.y=6;
assert(G.edgeDist(a,b)<1);assert(!G.isEngaged(g,a),'solid wall interrupts control range');
assert(!G.fightTargets(g,a).includes(b));assert(!moveCtx(g,a).inEnemyER(a));
const apBefore=a.ap;
assert.equal(G.resolveFight(g,a,G.tpl(a).weapons.find(w=>w.type==='melee'),b),null);
assert.equal(a.ap,apBefore,'an invalid wall-separated fight cannot spend AP');
assert(renderBoard(g,{}).includes('開 +1″'));assert(tombWorldMapSvg(TOMB_WORLD_MAPS[0]).includes('關'));
console.log('Tomb World access: crossing costs, split/repeated paths, all move types, Accessible base transit, FLY restrictions, Hatchway Fight conditions/AP/control range and map labels passed.');

let seed=81297;
Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(const map of process.argv.includes('--unit-only') ? [] : ['tombworld-1','tombworld-4']) {
  const battle=G.newGame({teams:['angels','kommandos'],ai:null,equip:[[],[]],map,mission:'secure'});
  G.autoDeploy(battle,0);G.autoDeploy(battle,1);G.startBattle(battle);assert.equal(battle.tp,1);
  let steps=0;
  while(battle.phase!=='gameover' && steps++<2000) {
    if(battle.phase==='initiative') G.startStrategy(battle);
    else if(battle.phase==='strategy') {aiStrategy(battle,G.ployChooser(battle));G.finishPloys(battle);}
    else if(battle.fight) {if(battle.fight.rrOpen)G.fightRerollDone(battle);if(!battle.fight.done)G.fightApply(battle,G.fightAutoChoice(battle));else G.endFight(battle);}
    else {const d=aiStep(battle);if(d?.kind==='shoot')G.resolveShoot(battle,G.activeOp(battle),d.weapon,d.target);else if(d?.kind==='fight')G.resolveFight(battle,G.activeOp(battle),d.weapon,d.target);}
    assert(battle.ops.filter(o=>!o.dead && o.placed).every(o=>moveCtx(battle,o).free(o)));
  }
  assert(steps<2000,`${map}: battle must not stall`);
  console.log(`${map}: complete AI battle passed (${steps} steps)`);
}
