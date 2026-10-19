import assert from 'node:assert/strict';
import { newGame, equipmentPlacement, findEquipmentPlacement, placeEquipment } from '../js/game.js';
import { rectCorners, rectGap, distPointRect, segRect, handleRotation } from '../js/geometry.js';
import { renderBoard } from '../js/board.js';

const r = { x:4, y:4.75, w:4, h:.5, angle:90 };
assert(distPointRect({ x:6, y:6.8 }, r) < 1e-8);
assert(distPointRect({ x:7.8, y:5 }, r) > 1.5);
assert(segRect({ x:5,y:6.5 }, { x:7,y:6.5 }, r));
assert(!segRect({ x:7,y:4.5 }, { x:8,y:4.5 }, r));
assert.equal(rectGap(r, { x:5.9,y:6,w:.2,h:.2 }), 0);
assert(rectCorners(r).every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
// Each corner retains its own offset: grabbing any node causes no rotation jump.
const center = { x:6,y:5 };
for (const start of rectCorners(r)) {
  assert.equal(handleRotation(center,start,start,90),90);
  const current = { x:center.x-(start.y-center.y), y:center.y+(start.x-center.x) };
  assert.equal(handleRotation(center,start,current,90),180);
}
assert.equal(handleRotation({x:0,y:0},{x:1,y:0},{x:1,y:.2},0,true),15);
assert.equal(handleRotation({x:0,y:0},{x:1,y:0},{x:0,y:0},45),45);
assert.equal(handleRotation({x:0,y:0},{x:1,y:0},{x:0,y:-1},0),270);

const g = newGame({ teams:['angels','kommandos'], ai:null, equip:[['lightBarricades'],['ammo']] });
g.eqDeploy.turn = 0;
const snapshot = JSON.stringify(g), pick = findEquipmentPlacement(g);
assert(pick);
assert.equal(JSON.stringify(g), snapshot, 'finding an automatic preview must not deploy anything');
assert(equipmentPlacement(g, pick.p, pick.angle));
assert.equal(JSON.stringify(g), snapshot, 'validating a preview must not deploy or pass the turn');
const preview = { entry:equipmentPlacement(g,pick.p,pick.angle), source:g.eqDeploy.queues[g.eqDeploy.turn][0], p:pick.p, angle:pick.angle };
assert.match(renderBoard(g, { equipmentPreview:preview }), /class="equipment-preview"/);
assert.equal((renderBoard(g,{equipmentPreview:preview}).match(/data-eq-handle=/g) || []).length,4);
assert.equal(JSON.stringify(g), snapshot, 'drawing the preview must not mutate the game');
assert(!equipmentPlacement(g, {x:0,y:0},45), 'rotated corners cannot leave the board');
// Find a legal diagonal placement, commit it, and check the persisted orientation.
let diagonal;
for (let y=1; y<22 && !diagonal; y+=.5) for (let x=1; x<30 && !diagonal; x+=.5) {
  if (equipmentPlacement(g,{x,y},45)) diagonal = {x,y};
}
assert(diagonal, 'a legal 45-degree placement exists');
const side = g.eqDeploy.turn, remaining = g.eqDeploy.queues[side].length, count = g.terrain.length;
assert(placeEquipment(g,diagonal,45));
assert.equal(g.terrain.length,count+1);
assert.equal(g.terrain.at(-1).angle,45);
assert.equal(g.eqDeploy.queues[side].length,remaining-1);
assert.equal(g.eqDeploy.turn,1-side);
assert.match(renderBoard(g,{}), /rotate\(45 /);
console.log('Equipment preview is non-mutating; confirmation, turn handoff, diagonal placement, geometry and SVG rotation passed.');
