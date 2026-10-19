import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { ADDITIONAL_EQUIPMENT } from '../js/data/faction-equipment.js';
import { TEAMS } from '../js/data/teams.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed=71321;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
Math.random=random;
function fixed(value,fn){Math.random=()=>value;try{return fn();}finally{Math.random=random;}}
function arena(id,eq=[],enemy='angels',enemyEq=[]) {
  const g=G.newGame({teams:[id,enemy],ai:null,equip:[eq,enemyEq]});
  let n=0;while(!g.eqDeploy.done && n++<100)assert(G.autoPlaceEquipment(g),'equipment must have a legal spot');
  g.phase='firefight';g.tp=1;g.turn=0;g.terrain=[];g.cp=[0,0];g.tactics=[[],[]];
  g.ops.forEach((o,i)=>{o.x=o.side?27:2;o.y=1+i*.6;o.placed=true;o.reserve=false;o.order='engage';o.ready=true;o.acted={};});
  return g;
}
const get=(g,id)=>g.ops.find(o=>o.tplId===id);
function pair(g,id=null) {
  const a=id?get(g,id):g.ops.find(o=>o.side===0),b=g.ops.find(o=>o.side===1);
  a.x=8;a.y=10;a.ap=6;a.acted={};g.active=a.uid;b.x=15;b.y=10;b.wounds=100;b.maxW=100;
  return [a,b];
}
function shot(g,a,b,w) { const it=G.shootFlow(g,a,w,b),stages=[];let r=it.next();while(!r.done){stages.push(r.value);r=it.next();}return {stages,result:r.value}; }
// Every missing team now owns its options; selections remain unique and share the universal cap.
assert.equal(Object.keys(ADDITIONAL_EQUIPMENT).length,18);
for(const [id,items] of Object.entries(ADDITIONAL_EQUIPMENT)) {
  assert.equal(Object.keys(items).length,4,id);
  const options=G.equipmentOptionsFor(id);
  assert.deepEqual(options.filter(x=>!G.EQUIP_IDS.includes(x)),Object.keys(items));
  assert.equal(G.cleanEquipment(id,[...Object.keys(items),'ammo']).length,4);
  const foreign=Object.keys(ADDITIONAL_EQUIPMENT[id==='blooded'?'fellgor':'blooded'])[0];
  assert(!G.cleanEquipment(id,[foreign]).length);
  const g=arena(id,Object.keys(items));
  for(const o of G.living(g,0))for(const w of G.weaponsFor(g,o)) {
    assert(w.name.zh && w.name.en && Number.isFinite(w.atk) && w.dmg.every(Number.isFinite),`${id}: valid equipment weapon`);
  }
}
assert(TEAMS.filter(t=>t.id!=='npo').every(t=>G.equipmentOptionsFor(t.id).some(id=>!G.EQUIP_IDS.includes(id))),'all playable teams have faction equipment');
// Weapons and profiles are discoverable without spending their charges.
for(const [id,key,opId] of [
  ['kasrkin','feKasDagger','ksTrooper'],['legionaries','feMalefic',null],
  ['broodBrothers','feCultKnives',null],['inquisitorialAgents','feAgentDaggers',null],['hernkynYaegirs','fePlasma',null],
]) {
  const g=arena(id,[key]),o=opId?get(g,opId):G.living(g,0).find(o=>id!=='broodBrothers'||!G.tpl(o).broodcoven);
  assert(G.weaponsFor(g,o).some(w=>w.id===key || key==='fePlasma'&&/plasma knife/i.test(w.name.en)),key);
  assert(!g.feUsed?.[0]?.[key]);
}
{
  const g=arena('blooded',['feWicked','feBloodSigil','feTrophies']),[a,b]=pair(g,'brimstone');
  const w=G.weaponsFor(g,a).find(w=>w.name.en==='Bayonet');assert.deepEqual(w.dmg,[3,4]);
  a.bloodToken=true;b.x=a.x+1;
  assert(G.effectiveRules(g,b,G.tpl(b).weapons[0],a).noReroll1);
  assert.equal(G.ffDef(g,0,'rewardEarned').cp,1);
  assert(G.ffReady(g,0,'rewardEarned'),'Chaos Sigil makes Reward Earned usable at 0CP');
}
{
  const g=arena('kasrkin',['feGrip','feScope','feCadia']),[a,b]=pair(g,'ksTrooper');
  const w=G.weaponsFor(g,a).find(w=>/Hot-shot lasgun/.test(w.name.en));
  b.x=a.x+2;assert.equal(G.effectiveRules(g,a,w,b).accurate,1);
  b.x=a.x+10;assert(G.effectiveRules(g,a,w,b).saturate);
  const it=G.shootFlow(g,a,w,b),first=fixed(.01,()=>it.next());
  assert.equal(first.value.seq.a.norms,1,'Relics of Cadia converts two failures');
  assert.equal(g.feUsed[0].feCadia.n,1);it.return();
}
{
  const g=arena('legionaries',['feTainted']),[a,b]=pair(g);
  const candidate=G.living(g,0).flatMap(o=>G.weaponsFor(g,o).map(w=>({o,w}))).find(x=>x.w.rules.feEquip==='feTainted');
  assert(candidate);const o=candidate.o;o.x=8;o.y=10;o.ap=6;o.acted={};g.active=o.uid;
  G.weaponsFor(g,o);G.shootCheck(g,o,b,candidate.w);assert(!g.feUsed?.[0]?.feTainted);
  shot(g,o,b,candidate.w);assert.equal(g.feUsed[0].feTainted.n,1);
  assert(!G.weaponsFor(g,o).some(w=>w.rules.feEquip==='feTainted'));
  assert(!G.shootWeapon(g,o,candidate.w).ok,'an exhausted saved profile cannot be reused');
  g.tp++;assert(G.weaponsFor(g,o).some(w=>w.rules.feEquip==='feTainted'));
}
{
  const g=arena('exaction',['feShells','feVisor','feLumen']),[a,b]=pair(g,'vigilant');
  assert.equal(G.aplNow(g,{...a,aplNext:-1}),G.tpl(a).apl);
  G.changeApl(g,a,-1);assert(!a.aplNext);
  const w=G.weaponsFor(g,a).find(w=>w.rules.feSave3);assert(w);
  const old=G.tpl(b).save;assert(G.shootCheck(g,a,b,w).ok);
  b.x=a.x+1;assert(G.effectiveRules(g,b,G.tpl(b).weapons[0],a).noReroll1);
  assert(old<=3);
}
{
  const g=arena('battleclade',['feCapacitors','feApparatus','feCells']),[a,b]=pair(g,'bcMelta');
  const alt=G.weaponsFor(g,a).find(w=>w.rules.feEquip==='feApparatus');assert(alt,'other Combat Servitor loadouts are available');
  assert(G.effectiveRules(g,a,G.tpl(a).weapons.at(-1),b).shock);
  g.active=b.uid;assert(G.effectiveRules(g,a,G.tpl(a).weapons.at(-1),b).severe);g.active=a.uid;
  assert.equal(G.actionCost(g,a,'transferPower'),0);G.spend(g,a,'transferPower');assert.equal(G.actionCost(g,a,'transferPower'),1);
}
{
  const g=arena('hunterClade',['feRedundancy','feWarded']),o=G.living(g,0)[0];
  o.wounds=2;fixed(.5,()=>G.activate(g,o));assert(o.wounds>2);assert.equal(g.feUsed[0].feRedundancy.n,1);
}
{
  const g=arena('celestianInsidiants',['fePsyk','feFlagellator']),[a,b]=pair(g);
  assert.equal(g.eqUses[0].stun,2);b.wounds=100;
  fixed(.5,()=>G.TARGET_ACTIONS.eqStun.apply(g,a,b));assert.equal(b.wounds,98);assert.equal(g.eqUses[0].stun,1);
  g.active=null;a.wounds=a.maxW;fixed(.6,()=>G.activate(g,a));assert(a.inspiring);assert(a.wounds<a.maxW);
}
{
  const g=arena('goremongers',['feTotem','feCadaver','feChains']);
  assert(g.markers.some(m=>m.kind==='goryTotem'));const m=g.markers.find(m=>m.kind==='bloodyCadaver');
  const o=G.living(g,0)[0];assert(G.canPickUpMarker(g,o,m));
  assert(G.living(g,0).some(o=>G.weaponsFor(g,o).some(w=>w.rules.feEquip==='feChains'&&w.rules.range===2)));
}
{
  const g=arena('bladesOfKhaine',['feProphecy']);g.phase='initiative';g.initRoll=[2,5];g.initLocked=false;
  assert(g.initCards[0].includes('feProphecy'));fixed(.5,()=>G.useInitCard(g,0,'feProphecy',0,1));
  assert.equal(g.initRoll[0],4);assert(!G.useInitCard(g,0,'feProphecy',0,1));
}
// Choice-based gambits keep the human's pick pending and apply exactly once.
{
  const g=arena('legionaries',['feWarded','feTalismans']);g.phase='initiative';g.pick=[true,true];
  g.initRoll=[5,2];g.initDecider=0;G.startStrategy(g);
  assert.equal(G.pendingChoice(g,0).id,'feWarded');const o=G.living(g,0)[0];
  assert(G.resolveChoice(g,0,o.uid));assert.equal(g.feWarded[0].uid,o.uid);
  assert.equal(G.pendingChoice(g,0).id,'feTalismans');const marks=G.CHOICES.feTalismans.options(g,0);assert(marks.length);
  assert(G.resolveChoice(g,0,marks[0].value));assert.equal(g.feMark[0].mark,marks[0].value);
}
{
  const g=arena('broodBrothers',['feLookout']),b=G.living(g,1)[0];g.terrain=[];
  G.CHOICES.feLookout.apply(g,0,b.uid);assert.equal(b.crossfire[0],1);
}
// The final charge of a Blast profile still resolves its secondary targets.
{
  const g=arena('hernkynYaegirs',['feFirestorm','feStabilised']),[a,b]=pair(g,'hyWarrior');a.loadout='shotgun';a.x=10;b.x=14;
  const other=G.living(g,1)[1];other.x=14;other.y=11.2;other.wounds=other.maxW=100;
  const w=G.weaponsFor(g,a).find(w=>w.rules.feEquip==='feFirestorm');assert(w);
  const r=fixed(.5,()=>shot(g,a,b,w));assert(r.stages.length>=4,'primary and secondary both resolve on the last equipment use');
  assert.equal(g.feUsed[0].feFirestorm.n,1);
}
// Faith equipment: distinct second acts, nonlethal blood payment, and actual paid-Faith tracking.
{
  const g=arena('novitiates',['feFaithIcon','feChastisers','feSanctified']),[a]=pair(g);g.faith=[10,0];
  const pool=()=>({dice:[{v:4,res:'norm'},{v:2,res:'miss'},{v:3,res:'miss'}],success:4,critOn:6,rules:{},norms:1,crits:0,post:null});
  const h={op:a.uid,a:pool()};
  assert(G.useFaith(g,0,h,'a','blessing',a.uid));assert(h.feSanctified);
  assert(!G.faithOptions(g,0,h,'a').some(o=>o.id==='blessing'));
  assert(G.useFaith(g,0,h,'a','intervention',a.uid));assert.equal(g.feUsed[0].feFaithIcon.n,1);
  assert.equal(G.faithOptions(g,0,h,'a').length,0);
  const h2={op:a.uid,a:pool()},before=a.wounds;g.faith[0]=0;
  assert(G.useFaith(g,0,h2,'a','fe_intervention',a.uid));assert.equal(a.wounds,before-3);assert(!h2.feSanctified);
  assert(!G.faithOptions(g,0,{op:a.uid,a:pool()},'a').some(o=>o.damage),'blood payment is once per TP');
}
// Mind-link allows interleaving actions, preserving both operatives' AP and action history.
{
  const g=arena('hunterClade',['feMindLink']);const a=G.living(g,0)[0],b=get(g,'rgWarrior');
  a.x=8;a.y=10;b.x=9.5;b.y=10;G.activate(g,a);
  assert(G.TARGET_ACTIONS.feMindLink.targets(g,a).includes(b));G.doTargetAction(g,a,'feMindLink',b);
  G.spend(g,a,'dash');const ap=a.ap;assert(G.canSwitchActive(g));G.deactivate(g);G.activate(g,b);G.spend(g,b,'dash');
  G.deactivate(g);G.activate(g,a);assert.equal(a.ap,ap);assert.equal(a.acted.dash,1);
  G.endActivation(g);assert.equal(g.turn,0);G.activate(g,b);assert.equal(b.acted.dash,1);
  G.endActivation(g);assert.equal(g.feLink,null);assert.equal(g.turn,1);
}
// Armour does not accidentally protect the excluded Canid/Tome-skull.
for(const [id,key,excluded] of [['elucidianStarstriders','feArmour','esCanid'],['inquisitorialAgents','feBodysuits','iaTomeSkull']]) {
  const g=arena('angels',[],id,[key]),[a]=pair(g),b=get(g,excluded);b.x=15;b.y=10;b.wounds=b.maxW=100;
  const w=G.weaponsFor(g,a).find(w=>w.type==='ranged'&&!w.rules.range);
  const result=fixed(.5,()=>shot(g,a,b,w));const d=result.stages.find(s=>s.stage==='defence')?.seq.d;
  assert(d);assert.equal(d.norms,0,`${excluded}: rolled 4s remain failed saves`);
}
// Successful Manacles deny Fall Back without spending AP and remove it from available actions.
{
  const g=arena('angels',[],'exaction',['feManacles']),[a,b]=pair(g);b.x=9.8;
  const ctx=(await import('../js/path.js')).moveCtx(g,a,'fallBack');
  const path=(await import('../js/path.js')).findPath(ctx,{x:5,y:10});assert(path);
  const ap=a.ap;assert.equal(fixed(.6,()=>G.doMove(g,a,'fallBack',path)),false);
  assert.equal(a.ap,ap);assert(a.acted.feCuffed);
  assert(!G.availableActions(g,a).find(x=>x.id==='fallBack').ok);
}
// Totems forbid attack re-rolls only; they must not disable enemy defence re-rolls.
{
  const g=arena('goremongers',['feTotem']),[a,b]=pair(g);a.x=11;b.x=15;
  const marker=g.markers.find(m=>m.kind==='goryTotem');marker.x=b.x;marker.y=b.y;
  const w=G.weaponsFor(g,a).find(w=>w.type==='ranged');assert(w);
  const result=fixed(.5,()=>shot(g,a,b,w));const defence=result.stages.find(s=>s.stage==='defence');assert(defence);
  assert.equal(defence.seq.noReroll.d,false);
}
// Each complete battle exercises equipment state across turning points and both AI sides.
if(process.argv.includes('--battles'))for(const [id,items] of Object.entries(ADDITIONAL_EQUIPMENT)) {
  const g=G.newGame({teams:[id,'angels'],ai:null,equip:[Object.keys(items),['adSeals','adTilting']]});
  let placements=0;while(!g.eqDeploy.done && placements++<100)assert(G.autoPlaceEquipment(g),id);
  G.autoDeploy(g,0);G.autoDeploy(g,1);G.startBattle(g);
  let steps=0;
  while(g.phase!=='gameover' && steps++<2500) {
    if(g.phase==='initiative')G.startStrategy(g);
    else if(g.phase==='strategy'){const s=G.ployChooser(g);aiStrategy(g,s);G.finishPloys(g);}
    else if(g.phase==='firefight'){
      if(g.fight){if(g.fight.rrOpen)G.fightRerollDone(g);if(!g.fight.done)G.fightApply(g,G.fightAutoChoice(g));else G.endFight(g);}
      else {const d=aiStep(g);if(d?.kind==='shoot')G.resolveShoot(g,G.activeOp(g),d.weapon,d.target);else if(d?.kind==='fight')G.resolveFight(g,G.activeOp(g),d.weapon,d.target);}
    }else throw Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps<2500,`${id}: stalled`);assert(g.cp.every(n=>n>=0));
  console.log(`${id}: equipment battle passed (${steps} steps)`);
}
console.log('18 teams / 72 faction equipment: selection, weapons, charges and targeted effects passed.');
