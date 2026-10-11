import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { murderwingRosterError, MURDERWING_EQUIPMENT } from '../js/data/murderwing.js';
import { mwBoon, mwStrategy, mwActivation } from '../js/murderwing.js';
import { moveCtx, findPath } from '../js/path.js';
import { aiStep, aiStrategy } from '../js/ai.js';
const get = (g, id) => g.ops.find((o) => o.tplId === id);
function arena(equip = [], roster = {}, loadouts = {}) {
  const g = G.newGame({ teams: ['murderwing', 'angels'], ai: null, equip: [equip, []], roster: [roster], loadouts: [loadouts] });
  g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [0, 0, 0];
  g.ops.forEach((o, i) => { o.x = o.side ? 26 : 2; o.y = 1 + i * 1.5 % 19; o.placed = true; o.order = 'engage'; });
  return g;
}
const enemy = (g) => G.living(g, 1)[0];
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - .5) / 6; try { return fn(); } finally { Math.random = old; } }
{
  const t = TEAM_MAP.murderwing;
  assert.equal(t.ops.length, 9); assert.equal(t.ops.reduce((n,o)=>n+o.count,0), 6);
  assert.deepEqual(t.info.archetypes.map((a)=>a.en), ['Recon', 'Seek & Destroy']);
  assert(t.ops.every((o)=>o.apl===3 && o.move===6 && o.save===3));
  assert.equal(t.ops[0].base,40); assert.equal(t.ops[0].wounds,15);
  assert(t.ops.slice(1).every((o)=>o.base===32 && o.wounds===14));
  assert.equal(t.ploys.length,4); assert.equal(t.firefight.length,4);
  assert.equal(Object.keys(MURDERWING_EQUIPMENT).length,4);
  assert(murderwingRosterError(t,{mwChampion:'mwHuntmaster'}));
  assert.throws(()=>arena([], {mwChampion:'mwHuntmaster'}), /only Raptors/);
  const roster = Object.fromEntries(Object.keys(t.replacements).map((id)=>[id,'mwRaptor']));
  assert.equal(G.living(arena([],roster),0).filter((o)=>o.tplId==='mwRaptor').length,5);
  assert.throws(()=>arena([],roster,{mwRaptor:'plasma'}), /At most two/);
  const specialRoster = {mwCurseclaw:'mwSkysear'};
  assert.throws(()=>arena([],specialRoster,{mwLord:'plasmamwPower',mwChampion:'plasmamwFist',mwSkysear:'melta'}), /At most two/);
  const g = arena([],specialRoster,{mwLord:'relic',mwChampion:'plasmamwFist',mwSkysear:'melta'});
  assert.deepEqual(G.weaponsFor(g,get(g,'mwLord')).map((w)=>w.id),['mwRelic']);
  assert(G.weaponsFor(g,get(g,'mwSkysear')).some((w)=>w.id==='mwMelta' && w.rules.devastating===4));
  const wrong=G.newGame({teams:['angels','murderwing'],ai:null,equip:[['mwVox'],[]]}); assert(!wrong.equip[0].includes('mwVox'));
}
// Boost crosses blocked paths, keeps legal endpoints, and respects the amended Charge cap.
{
  const g=arena(), o=get(g,'mwChampion'); o.x=5;o.y=10;G.activate(g,o);
  g.terrain=[{kind:'heavy',x:7,y:0,w:1,h:22}];
  assert.equal(G.moveAllowance(g,o,'charge'),6);
  assert(findPath(moveCtx(g,o,'reposition'),{x:10,y:10}));
  assert(!findPath(moveCtx(g,o,'dash'),{x:10,y:10}));
  assert(!moveCtx(g,o).free({x:7.5,y:10}));
  assert.equal(G.doMove(g,o,'charge',{pts:[o,{x:12,y:10}],len:7}),false);
  o.counter=true; assert(!findPath(moveCtx(g,o),{x:10,y:10}));
}
// Paid boost-zone Strike From Above, and zero-AP Clawed Charge.
{
  const g=arena(),o=get(g,'mwHuntmaster'),t=enemy(g);o.x=5;o.y=10;t.x=8;t.y=10;G.activate(g,o);
  dice([3,3],()=>G.doMove(g,o,'reposition',{pts:[{x:5,y:10},{x:11,y:10}],len:6}));
  assert.equal(t.wounds,10); assert.equal(o.ap,1); assert.equal(o.acted.mwBoostAction,1);
  assert.equal(o.mwBoostTP,1);
  const h=arena(['mwArmour']),a=get(h,'mwChampion'),b=enemy(h);a.x=5;a.y=10;b.x=10;b.y=10;G.activate(h,a);
  G.doMove(h,a,'charge',{pts:[{x:5,y:10},{x:8,y:10}],len:3});assert.equal(b.wounds,14);assert.equal(a.ap,2);assert(a.acted.mwClawed);
}
// The Raptor clears APL changes and ignores injury only after boosting, never after a Dash.
{
  const g=arena([], {mwChampion:'mwRaptor'}),o=get(g,'mwRaptor');o.x=5;o.y=10;o.wounds=5;o.aplNext=-1;G.activate(g,o);
  assert.equal(o.ap,2);assert.equal(G.moveStat(g,o),4);
  G.doMove(g,o,'reposition',{pts:[{x:5,y:10},{x:8,y:10}],len:3});
  assert.equal(o.aplNext,0);assert.equal(o.ap,2);assert.equal(G.moveStat(g,o),6);
}
// Damnation: current points, one attempt per action, equal failure, backlash and max-point automatic success.
{
  const g=arena(),o=get(g,'mwLord');
  assert.equal(o.damnation,1); assert.equal(dice([6],()=>mwBoon(g,o)),1);assert.equal(o.damnation,2);assert.equal(mwBoon(g,o),0);
  mwActivation(g);assert.equal(dice([2],()=>mwBoon(g,o)),0);assert.equal(o.wounds,15);
  mwActivation(g);assert.equal(dice([1],()=>mwBoon(g,o)),0);assert.equal(o.wounds,13);
  mwActivation(g);o.damnation=6;assert.equal(mwBoon(g,o),6);assert.equal(o.damnation,6);
}
// Shrieker targets, equipment stun, marker/mission interference, Carving Blow restrictions.
{
  const g=arena(['mwVox']),o=get(g,'mwShrieker'),t=enemy(g);o.x=5;o.y=10;t.x=7;t.y=10;G.activate(g,o);
  dice([3],()=>G.doTargetAction(g,o,'mwShriek',t));assert.equal(t.wounds,13);assert.equal(t.aplNext,-1);
  assert.equal(G.actionCost(g,t,'pickUp'),2);
  dice([4],()=>G.doSelfAction(g,o,'mwVox'));assert.equal(g.mwVoxTP[0],1);assert(!G.availableActions(g,o).find((a)=>a.id==='mwVox').ok);
  const h=arena(),a=get(h,'mwDepredator'),b=enemy(h);a.x=5;a.y=10;b.x=7;b.y=10;G.activate(h,a);
  dice([3,3],()=>G.doSelfAction(h,a,'mwCarving'));assert.equal(b.wounds,11);
  a.acted.fight=1;assert(!G.availableActions(h,a).find((x)=>x.id==='fight').ok);
}
// Pinned Prey doesn't spend AP; Wings locks attacks only after the boosted movement.
{
  const g=arena(),o=get(g,'mwHuntmaster'),t=enemy(g);o.x=5;o.y=10;t.x=7;t.y=10;g.turn=1;G.activate(g,t);
  const ap=t.ap;assert.equal(dice([4,1],()=>G.doMove(g,t,'fallBack',{pts:[{x:7,y:10},{x:11,y:10}],len:4})),false);assert.equal(t.ap,ap);assert.equal(t.x,7);
  const h=arena(),a=get(h,'mwChampion');a.x=5;a.y=10;h.tp=2;h.cp[0]=3;G.activate(h,a);
  assert(G.useFFButton(h,a,'mwWings'));assert.equal(G.moveAllowance(h,a,'reposition'),9);
  G.doMove(h,a,'reposition',{pts:[{x:5,y:10},{x:14,y:10}],len:9});assert.equal(a.mwAttackLockTP,2);assert(!G.shootWeapon(h,a,G.weaponsFor(h,a)[0]).ok);assert.equal(G.fightTargets(h,a).length,0);
}
// Challenge and weapon ploys depend on target/current activation state.
{
  const g=arena(),o=get(g,'mwChampion'),t=enemy(g);t.x=8;t.y=o.y;mwStrategy(g);G.activate(g,o);
  assert.equal(g.mwChallenge[0],t.uid);assert(G.effectiveRules(g,o,G.tpl(o).weapons[1],t).severe);
  g.ploys[0]=['mwCull','mwPredators'];t.wounds--;mwActivation(g);o.acted.mwBoost=true;
  const r=G.effectiveRules(g,o,G.tpl(o).weapons[1],t);assert(r.punishing && r.balanced);
  g.cp[0]=2;G.living(g,0).forEach((a)=>a.ready=a===o);g.active=null;
  assert.equal(G.activate(g,o),false);assert.equal(g.turn,1);assert.equal(g.cp[0],1);
}
// Damage integration: the boon adds once per Fight, and Instil Fear protects fighting only.
{
  const g=arena(),o=get(g,'mwLord'),t=enemy(g);o.x=5;o.y=10;t.x=7;t.y=10;G.activate(g,o);
  dice(Array(20).fill(4),()=>G.startFight(g,o,G.weaponsFor(g,o)[1],t)); G.fightRerollDone(g);
  dice([6],()=>G.fightApply(g,'strike-n'));assert.equal(t.wounds,10);assert.equal(o.damnation,2);
  g.fight.turn='A'; G.fightApply(g,'strike-n');assert.equal(t.wounds,6);assert.equal(o.damnation,2);
  for(const activeMW of [true,false]) {
    const h=arena(),a=get(h,'mwChampion'),b=enemy(h);a.x=5;a.y=10;b.x=7;b.y=10;h.ploys[0]=['mwFear'];h.turn=activeMW?0:1;G.activate(h,activeMW?a:b);
    const attacker=activeMW?a:b,defender=activeMW?b:a;
    dice(Array(20).fill(4),()=>G.startFight(h,attacker,G.bestMelee(attacker),defender));G.fightRerollDone(h);h.fight.turn=activeMW?'D':'A';
    const expected=G.fightOptions(h).find((x)=>x.id==='strike-n').dmg-(activeMW?1:0);G.fightApply(h,'strike-n');assert.equal(a.wounds,14-expected);
  }
}
let seed=81284;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(const teams of [['murderwing','angels'],['kommandos','murderwing'],['murderwing','mandrakes'],['murderwing','murderwing']]) {
  const g=G.newGame({teams,ai:null,equip:teams.map((id)=>id==='murderwing'?Object.keys(MURDERWING_EQUIPMENT):[])});
  G.autoDeploy(g,0);G.autoDeploy(g,1);G.startBattle(g);let steps=0;
  while(g.phase!=='gameover'&&steps++<3500){
    if(g.phase==='initiative')G.startStrategy(g);
    else if(g.phase==='strategy'){aiStrategy(g,G.ployChooser(g));G.finishPloys(g);}
    else if(g.phase==='firefight'){
      if(g.fight){if(g.fight.rrOpen)G.fightRerollDone(g);if(!g.fight.done)G.fightApply(g,G.fightAutoChoice(g));else G.endFight(g);}
      else{const d=aiStep(g);if(d?.kind==='shoot')G.resolveShoot(g,G.activeOp(g),d.weapon,d.target);else if(d?.kind==='fight')G.resolveFight(g,G.activeOp(g),d.weapon,d.target);}
    }else throw Error(g.phase);
  }
  assert(steps<3500,`stalled: ${teams}`);assert(g.cp.every((n)=>n>=0));assert(g.ops.every((o)=>o.ap>=0));
  console.log(`${teams.join(' vs ')}: complete (${steps} steps)`);
}
console.log('murderwing ok');
