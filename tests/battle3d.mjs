import assert from 'node:assert/strict';
import { newGame, boardOf, radius } from '../js/game.js';
import { worldToBoard, battleModelSpec, battleBoardData, battle3dMarkup } from '../js/battle3d.js';
import * as THREE from '../js/vendor/three.module.min.js';
import { createModelKit } from '../js/models3d.js';
import { createTerrainKit } from '../js/terrain3d.js';
import { TEAMS } from '../js/data/teams.js';
import { visibleModelHit } from '../js/viewer3d.js';

const kit=createModelKit(THREE), terrain=createTerrainKit(THREE);
for(const map of ['default','tombworld-01']) {
  const g=newGame({teams:['angels','kommandos'],ai:null,map});
  const b=boardOf(g), before=JSON.stringify(g);
  assert.deepEqual(worldToBoard(g,{x:0,z:0}),{x:b.w/2,y:b.h/2});
  assert.deepEqual(worldToBoard(g,{x:-b.w/2,z:-b.h/2}),{x:0,y:0});
  assert.equal(worldToBoard(g,{x:b.w,z:0}),null);
  assert.equal(worldToBoard(g,{x:NaN,z:0}),null);
  assert.equal(battleModelSpec(g,g.ops[0]),null,'unplaced models stay off the battlefield');
  assert(terrain.buildBoard(battleBoardData(g)).children.length>0);
  assert.equal(JSON.stringify(g),before,'render data must not mutate battle state');
  const op={...g.ops[0],placed:true,x:2,y:3};
  const spec=battleModelSpec(g,op);
  assert.equal(spec.x,2-b.w/2);assert.equal(spec.z,3-b.h/2);
  for(const flag of ['dead','reserve'])assert.equal(battleModelSpec(g,{...op,[flag]:true}),null);
  assert.equal(battleModelSpec(g,{...op,x:undefined}),null);
  const model=kit.buildOperative(spec.team,spec.template,spec.loadout);
  model.position.set(spec.x,0,spec.z);model.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(spec.x,20,spec.z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(model,true).length>0,'model can be picked at its board location');
  const box=new THREE.Box3().setFromObject(model);
  assert(box.max.x-box.min.x>=radius(op)*2-.001,'physical base retains game scale');
}
// Every roster must be usable in a live scene, not just the default gallery team.
for(const team of TEAMS)for(const template of team.ops.filter(o=>o.name?.en&&!o.name.en.startsWith('('))) {
  const model=kit.buildOperative(team,template,template.loadouts?.[0]?.id);
  const box=new THREE.Box3().setFromObject(model);
  assert(Number.isFinite(box.min.x)&&box.max.y>0,`${team.id}/${template.id} builds`);
}
assert.match(battle3dMarkup('<svg id="board"></svg>'),/battle3d-source/);
// The prototype is opt-in: previews keep the same base, roster and loadout without changing battle defaults.
for(const team of TEAMS) {
  const op=team.ops[0],normal=kit.buildOperative(team,op),preview=kit.buildOperative(team,op,undefined,{style:'refined'});
  assert.equal(!!normal.userData.look.refined,false);
  assert.equal(!!preview.userData.look.refined,team.id==='angels');
}
const angels=TEAMS.find(t=>t.id==='angels');
const hiddenGroup = new THREE.Group(), nestedGroup = new THREE.Group();
const hiddenModel = kit.buildOperative(angels, angels.ops[0]);
hiddenGroup.add(nestedGroup); nestedGroup.add(hiddenModel);
assert.equal(visibleModelHit(hiddenModel.children[0]), true);
hiddenGroup.visible = false;
assert.equal(visibleModelHit(hiddenModel.children[0]), false, 'hidden comparison groups cannot intercept picks');
hiddenGroup.visible = true;
hiddenModel.children[0].visible = false;
assert.equal(visibleModelHit(hiddenModel.children[0]), false, 'hidden labels cannot intercept picks');
for(const op of angels.ops)for(const loadout of Object.keys(op.loadouts||{default:[]})) {
  const model=kit.buildOperative(angels,op,loadout==='default'?undefined:loadout,{style:'refined'});
  const box=new THREE.Box3().setFromObject(model);
  assert(Number.isFinite(box.max.y)&&box.max.y>1,`${op.id}/${loadout} prototype builds`);
  assert.equal(model.userData.opId,op.id);
}
console.log('3D board mapping, non-mutating state, model picking and all roster models passed.');
