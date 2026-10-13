import assert from 'node:assert/strict';
import { TOMB_WORLD_MAPS, tombWorldTerrain } from '../js/tombworld-maps.js';
import { newGame, boardOf, autoPlaceEquipment, autoDeployStep, finishDeployStep, radius, doMissionAction } from '../js/game.js';
import { moveCtx, findPath } from '../js/path.js';
import { renderBoard } from '../js/board.js';
import { recordStep, viewAt } from '../js/replay.js';
import { tombWorldTeleportDestination } from '../js/missions.js';

assert.equal(TOMB_WORLD_MAPS.length, 6);
for (const map of TOMB_WORLD_MAPS) {
  const g=newGame({teams:['angels','kommandos'],ai:null,equip:[[],[]],mission:'secure',map:map.id});
  assert.deepEqual(boardOf(g), {w:28,h:24,grid:4});
  assert.equal(g.objectives.length,3); assert.equal(g.pads.length,2);
  assert.equal(g.objectives.filter(o=>o.centre).length,1);
  for(const t of tombWorldTerrain(map)) assert(t.x>=0 && t.y>=0 && t.x+t.w<=28 && t.y+t.h<=24, `${map.id}: terrain bounds`);
  while (g.eqDeploy && !g.eqDeploy.done) assert(autoPlaceEquipment(g));
  let steps=0;
  while(!g.dep.done && steps++<40) { autoDeployStep(g); assert(finishDeployStep(g), `${map.id}: deploy batch fits`); }
  assert(g.dep.done);
  for(const op of g.ops) {
    assert(moveCtx(g,op).free(op));
    assert(op.x+radius(op)<=28 && op.y+radius(op)<=24);
  }
  const svg=renderBoard(g,{});
  assert(svg.includes('29.2 25.2')); assert(svg.includes('width="4" height="4"'));
  recordStep(g);const rep=viewAt(g.replay,0);
  assert.deepEqual(rep.board,g.board);assert.deepEqual(rep.pads,g.pads);
  // Force an obstacle detour to exercise the A* board bounds, not only straight lines.
  const op=g.ops[0];g.ops=[op];op.x=1;op.y=22;
  g.terrain=[{kind:'heavy',x:3,y:21,w:1,h:2,height:10}];
  const path=findPath(moveCtx(g,op),{x:6,y:22}); assert(path);
  assert(path.pts.every(p=>p.x>=radius(op) && p.y<=24-radius(op)));
  assert(!moveCtx(g,op).free({x:28,y:22}));
  g.terrain=[];op.x=g.pads[0].x;op.y=g.pads[0].y;op.acted={};op.ap=2;
  assert(tombWorldTeleportDestination(g,op));
  doMissionAction(g,op,'twTeleport');assert.equal(op.ap,1);assert.equal(op.x,g.pads[1].x);
  const blocker={...op,uid:'block',side:1};g.ops.push(blocker);
  assert.equal(tombWorldTeleportDestination(g,op),null,'engaged operative cannot teleport');
}
const old=newGame({teams:['angels','kommandos'],ai:null});assert.deepEqual(boardOf(old),{w:30,h:22});
const fixed=newGame({teams:['angels','kommandos'],ai:null,mission:'generatorium',map:'tombworld-1'});assert.equal(fixed.map,'default');
console.log('Six Tomb World maps: bounds, deployment, A* detours, collision, rendering, replay, teleport and default-map compatibility passed.');
