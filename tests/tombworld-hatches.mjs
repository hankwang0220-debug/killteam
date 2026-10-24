import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { accessPointsOf, hatchActionId, setHatchState } from '../js/tombworld-access.js';
import { moveCtx } from '../js/path.js';
import { renderBoard } from '../js/board.js';
import { recordStep, viewAt } from '../js/replay.js';
import { TOMB_WORLD_MAPS } from '../js/tombworld-maps.js';
import { aiStep } from '../js/ai.js';

for(const map of TOMB_WORLD_MAPS) {
  const g=G.newGame({teams:['angels','kommandos'],ai:null,equip:[[],[]],map:map.id});
  const access=accessPointsOf(g), doors=access.filter(d=>d.kind==='hatchway');
  assert(doors.length);assert(doors.every(d=>d.state==='closed'));
  assert(access.filter(d=>d.kind==='breach').every(d=>d.state==='open'));
  assert.equal(g.terrain.filter(t=>t.hatchId && t.role==='hatch').length,doors.length); // (A1 breach walls are leaves too: role 'breachWall')
}
const g=G.newGame({teams:['angels','kommandos'],ai:null,equip:[[],[]],map:'tombworld-1'});
const a=g.ops[0],b=g.ops.find(o=>o.side===1),d=accessPointsOf(g).find(d=>d.component==='A3' && d.x===12);
const open=`twOpen_${d.id}`,close=`twClose_${d.id}`,ra=G.radius(a),rb=G.radius(b);
g.ops=[a,b];a.x=12-.125-ra;a.y=8;b.x=12+.125+rb+1;b.y=8;
a.acted={};a.ap=3;a.order='conceal';g.active=a.uid;g.phase='firefight';g.tp=1;
assert(!moveCtx(g,a).segFree({x:10,y:8},{x:14,y:8}));
assert(!G.visibility(g,a,b).visible);assert(!G.fightTargets(g,a).includes(b));
assert(G.availableActions(g,a).find(x=>x.id===open).ok);
assert.equal(G.actionCost(g,a,open),1);assert.equal(G.actionCost(g,a,close),1);
recordStep(g);
G.doMissionAction(g,a,open);
assert.equal(a.ap,2);assert.equal(g.hatches[d.id],'open');
assert(!g.terrain.some(t=>t.hatchId===d.id));
g.ops=[a];assert(moveCtx(g,a).segFree({x:10,y:8},{x:14,y:8}));g.ops=[a,b];
assert(G.visibility(g,a,b).visible);assert(G.fightTargets(g,a).includes(b));
recordStep(g);
assert.equal(G.doMissionAction(g,a,close),false,'enemy controlling the open access prevents closure');
assert.equal(a.ap,2);assert.equal(g.hatches[d.id],'open');
g.ops=[a];G.doMissionAction(g,a,close);
assert.equal(a.ap,1);assert.equal(g.hatches[d.id],'closed');
assert(g.terrain.some(t=>t.hatchId===d.id));assert(!moveCtx(g,a).segFree({x:10,y:8},{x:14,y:8}));
recordStep(g);
assert.equal(viewAt(g.replay,0).hatches[d.id],'closed');
assert.equal(viewAt(g.replay,1).hatches[d.id],'open');
assert.equal(viewAt(g.replay,2).hatches[d.id],'closed');
assert(renderBoard(viewAt(g.replay,0),{}).includes('tw-access-closed'));
assert(renderBoard(viewAt(g.replay,1),{}).includes('開 +1″'));
const restored=JSON.parse(JSON.stringify(g));assert.equal(restored.hatches[d.id],'closed');
assert(!moveCtx(restored,restored.ops[0]).segFree({x:10,y:8},{x:14,y:8}));
a.acted={};a.ap=0;assert.equal(G.doMissionAction(g,a,open),false);assert.equal(a.ap,0);
a.ap=2;a.x=9;assert.equal(G.doMissionAction(g,a,open),false,'out of range');
a.x=12-.125-ra;
const friend={...a,uid:'friend',x:12,y:8};setHatchState(g,d.id,'open');g.ops=[a,friend];
assert.equal(G.doMissionAction(g,a,close),false,'closing cannot overlap any living base');
g.ops=[a];setHatchState(g,d.id,'closed');
const foe={...b,uid:'foe',x:a.x-1.5,y:8};g.ops.push(foe);
assert(G.isEngaged(g,a));assert.equal(G.doMissionAction(g,a,open),false,'engaged operative cannot operate hatch');
// A stored pre-hatch-state game retains its open portals, rather than silently
// placing new solid terrain on existing models. New games always start closed.
const legacy=G.newGame({teams:['angels','kommandos'],ai:null,map:'tombworld-1',equip:[[],[]]});
delete legacy.hatches;legacy.terrain=legacy.terrain.filter(t=>!t.hatchId);
assert(accessPointsOf(legacy).filter(d=>d.kind==='hatchway').every(d=>d.state==='open'));
assert(hatchActionId(accessPointsOf(g).find(v=>v.id===d.id))===open);
const ai=G.newGame({teams:['angels','kommandos'],ai:null,map:'tombworld-1',equip:[[],[]]});
const o=ai.ops[0];ai.ops=[o];ai.active=o.uid;ai.phase='firefight';ai.tp=1;ai.cp=[0,0,0];
o.x=12-.125-G.radius(o);o.y=8;o.ap=2;o.acted={};o.order='conceal';
aiStep(ai);assert.equal(ai.hatches[d.id],'open');assert.equal(o.ap,1,'AI opens the nearby closed door for 1AP');
console.log('Tomb World hatches: six closed-start maps, exact 1AP open/close, movement/sight/melee, range/engagement/occupancy/AP restrictions, persistence, legacy saves and replay passed.');
