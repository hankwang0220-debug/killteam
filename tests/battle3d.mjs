import assert from 'node:assert/strict';
import { newGame, boardOf, radius } from '../js/game.js';
import { worldToBoard, battleModelSpec, battleBoardData, battle3dMarkup } from '../js/battle3d.js';
import * as THREE from '../js/vendor/three.module.min.js';
import { createModelKit } from '../js/models3d.js';
import { createTerrainKit } from '../js/terrain3d.js';
import { TEAMS } from '../js/data/teams.js';
import { visibleModelHit, modelViewFrame } from '../js/viewer3d.js';

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
  const op=team.ops[0],normal=kit.buildOperative(team,op);
  const materials=m=>m.children.filter(o=>o.isMesh).map(o=>[o.material.color.getHex(),o.material.metalness,o.material.roughness]);
  const before=materials(normal),beforeBounds=new THREE.Box3().setFromObject(normal).clone();
  const preview=kit.buildOperative(team,op,undefined,{style:'refined'});
  assert.deepEqual(materials(normal),before,'preview must not modify original shared materials');
  assert(new THREE.Box3().setFromObject(normal).equals(beforeBounds),'preview must not modify original geometry');
  const base=m=>m.children.find(o=>o.isMesh&&o.material.color.getHex()===0x2b2d31&&o.material.roughness===.9);
  assert.deepEqual(base(preview).geometry.attributes.position.array,base(normal).geometry.attributes.position.array,'physical base is identical in both versions');
  assert.equal(!!normal.userData.look.refined,false);
  assert.equal(normal.userData.look.refinementRevision,undefined,'battle defaults keep the original sculpt');
  assert.equal(!!preview.userData.look.refined,true);
  // Narrow and wide screens must keep the complete model/base within the view at different orbit angles.
  const bounds=new THREE.Box3().setFromObject(preview);
  for(const aspect of [304/457,16/9])for(const theta of [0,1.2]){
    const {target,distance}=modelViewFrame(bounds,aspect),center=new THREE.Vector3(target.x,target.y,target.z);
    const camera=new THREE.PerspectiveCamera(35,aspect,.05,200);
    camera.position.copy(center).add(new THREE.Vector3(Math.sin(theta)*Math.sin(1.15),Math.cos(1.15),Math.cos(theta)*Math.sin(1.15)).multiplyScalar(distance));
    camera.lookAt(center);camera.updateMatrixWorld();
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
      const p=new THREE.Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,`${team.id} fits the view`);
    }
  }
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
let previews=0;
const sculptRevisions={gellerpox:'gellerpox-2',hearthkyn:'hearthkyn-2',navyBreachers:'navy-breachers-2',phobos:'phobos-2',kommandos:'kommandos-2',tauPathfinders:'pathfinders-2',plagueMarines:'plague-marines-2',farstalkers:'farstalkers-2',deathKorps:'death-korps-2'};
for(const team of TEAMS)for(const op of team.ops.filter(o=>o.name?.en&&!o.name.en.startsWith('(')))for(const loadout of Object.keys(op.loadouts||{default:[]})) {
  const model=kit.buildOperative(team,op,loadout==='default'?undefined:loadout,{style:'refined'});
  const box=new THREE.Box3().setFromObject(model);
  assert(Number.isFinite(box.max.y)&&box.max.y>0,`${team.id}/${op.id}/${loadout} prototype builds`);
  assert.equal(model.userData.opId,op.id);
  assert.equal(model.userData.look.body,kit.operativeLook(team,op).body,'prototype preserves species, allies and machine types');
  assert.equal(model.userData.look.refinementRevision,sculptRevisions[model.userData.look.team],'dedicated sculpts follow the operative faction, including allies and pets');
  previews++;
}
console.log(`${TEAMS.length} teams / ${previews} operative and loadout prototypes built.`);
console.log('3D board mapping, non-mutating state, model picking and all roster models passed.');

const gellerpox=TEAMS.find(t=>t.id==='gellerpox');
for(const [id,kind]of Object.entries({gpCursemite:'cursemite',gpEyestinger:'eyestinger-swarm',gpSludgegrub:'sludge-grub'})){
  const op=gellerpox.ops.find(o=>o.id===id);
  const refined=kit.buildOperative(gellerpox,op,undefined,{style:'refined'});
  assert.equal(refined.userData.sculptKind,kind,'nuisances use dedicated creature sculpts');
  assert(new THREE.Box3().setFromObject(refined).max.y<.75,'nuisances stay small');
  assert.equal(kit.buildOperative(gellerpox,op).userData.sculptKind,undefined,'original sculpt stays available');
}
