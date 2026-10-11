import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as D from '../js/deathwatch.js';
import { TEAM_MAP, TEAMS } from '../js/data/teams.js';
import { DEATHWATCH_TEAM as T, deathwatchRosterError } from '../js/data/deathwatch.js';
import { aiStep, aiAttack, aiStrategy } from '../js/ai.js';
import { TAC_OPS, MISSION_ACTIONS } from '../js/missions.js';
let seed = 286512;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const slots = Object.keys(T.replacements);
const rosterFor = (ids) => Object.fromEntries(slots.map((s, i) => [s, ids[i]]));
const defaults = slots;
function arena(ids = defaults, equip = [], opponent = 'angels') {
  const g = G.newGame({ teams: ['deathwatch', opponent], ai: null, roster: [rosterFor(ids)], equip: [equip] });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [0, 0, 0], dwCommand: [{ strategy: true, firefight: true }, {}] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 24; o.y = 2 + i % 6 * 3; o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const target = (g) => g.ops.find((o) => o.side === 1);
const w = (o, id) => G.weaponsFor({}, o).find((x) => x.id === id);
const can = (g, o, id) => G.availableActions(g, o).find((x) => x.id === id)?.ok;
assert.equal(T.ops.length, 11);
assert.equal(G.living(arena(), 0).length, 5);
assert.equal(D.dwEquipmentLimit(T), 5);
assert.equal(D.dwEquipmentLimit(T, rosterFor(['dwMarksman', ...defaults.slice(1)])), 4);
assert.throws(() => arena(['dwAegis', 'dwAegis', ...defaults.slice(2)]), /only once/);
assert.throws(() => arena(['dwBombard', 'dwBreacher', ...defaults.slice(2)]), /GRAVIS/);
assert.equal(deathwatchRosterError(T, rosterFor(['dwBombard', 'dwDisruptor', 'dwHeadtaker', 'dwHordeSlayer', 'dwMarksman'])).en.includes('GRAVIS'), true);
// Every operative can be selected, including legal teams without a leader.
for (const op of T.ops) {
  const picks = [op.id, ...T.ops.filter((o) => o.id !== op.id && !o.gravis).map((o) => o.id).slice(0, 4)];
  assert.doesNotThrow(() => arena(picks), op.id);
}
assert(G.tacOpsFor('deathwatch').every((id) => ['Seek & Destroy', 'Security'].includes(TAC_OPS[id].arch)));
{
  const g = arena(), o = get(g, 'dwGunner'); G.activate(g, o);
  o.acted.shoot = 1; o.acted.shotWith = 'dwIncinerator'; o.ap = 2;
  assert.equal(G.shootWeapon(g, o, w(o, 'dwIncineratorHot')).ap, 2);
  assert.equal(G.shootWeapon(g, o, w(o, 'dwBoltPistol')).ap, 1);
  o.ap = 1; assert(!G.shootWeapon(g, o, w(o, 'dwIncinerator')).ok);
  o.acted.shotWith = 'dwBoltPistol'; assert(G.shootWeapon(g, o, w(o, 'dwIncinerator')).ok);
  const b = arena(['dwBreacher', ...defaults.slice(1)]), br = get(b, 'dwBreacher'); G.activate(b, br);
  br.acted.shoot = 1; br.acted.shotWith = 'dwMeltaBomb'; br.ap = 2;
  assert.equal(G.shootWeapon(b, br, w(br, 'dwHellstorm')).ap, 2);
  assert(D.dwSecondShotExtra('dwAux', w(get(g, 'dwSergeant'), 'dwPlasma')));
}
{
  const g = arena(), o = get(g, 'dwAegis'); o.ready = false; o.order = 'conceal'; g.counter = true;
  assert(G.counterCandidates(g, 0).includes(o)); G.activate(g, o); assert.equal(o.ap, 2);
  o.order = 'engage'; G.spend(g, o, 'shoot'); assert(!can(g, o, 'shoot')); assert(!can(g, o, 'fight')); assert(can(g, o, 'reposition'));
  G.doMove(g, o, 'reposition', { pts: [{ x: 2, y: 5 }, { x: 3, y: 5 }], len: 1 }); assert.equal(o.ap, 0);
  assert.equal(G.moveAllowance(g, o, 'dash'), 1, 'counter total movement');
  o.ap = 2; o.acted = {}; const e = target(g); e.x = o.x + 1.5; e.y = o.y;
  assert(!can(g, o, 'fallBack'), '2AP actions are not counteractions');
}
{
  const g = arena(), o = get(g, 'dwAegis'); G.activate(g, o);
  o.acted.fight = 1; assert(can(g, o, 'shoot'), 'one Fight and one Shoot are legal during a normal activation');
  o.acted.shoot = 1; const e = target(g); e.x = 3.5; e.y = o.y;
  assert(!can(g, o, 'fight'), 'cannot both double Fight and Shoot');
}
{
  const g = arena(defaults, ['dwAmmoReserve']), o = get(g, 'dwGunner'); G.activate(g, o);
  G.doSelfAction(g, o, 'dwAmmo_severe');
  const first = D.dwApplyAmmo(g, o, w(o, 'dwIncinerator')); assert(first.rules.severe); assert(!w(o, 'dwIncinerator').rules.severe);
  assert(!D.dwAmmoAvailable(g, o, 'severe')); assert(D.dwAmmoAvailable(g, o, 'saturate'));
  G.doSelfAction(g, o, 'dwAmmo_saturate'); assert(D.dwApplyAmmo(g, o, w(o, 'dwBoltPistol')).rules.saturate); assert(g.dwReserve[0]);
  assert(!D.dwAmmoAvailable(g, o, 'lethal')); g.tp++; assert(D.dwAmmoAvailable(g, o, 'severe'));
  D.dwApplyAmmo(g, o, { ...w(o, 'dwBoltPistol'), rules: { ...w(o, 'dwBoltPistol').rules, equipGrenade: 'frag' } });
  assert.equal(g.dwAmmo[0].tp, 1, 'grenades never consume special ammo');
  const b = arena(['dwBombard', ...defaults.slice(1)]), br = get(b, 'dwBombard'); G.activate(b, br); G.doSelfAction(b, br, 'dwAmmo_blast');
  assert(!G.shootWeapon(b, br, w(br, 'dwShrapnel')).ok); assert(!D.dwApplyAmmo(b, br, w(br, 'dwShrapnel')).rules.blast);
  G.doSelfAction(b, br, 'dwAmmoCancel'); assert(G.shootWeapon(b, br, w(br, 'dwShrapnel')).ok);
}
{
  const g = arena(), o = get(g, 'dwGunner'); G.activate(g, o); const e = target(g); e.x = 10; e.y = o.y;
  G.doSelfAction(g, o, 'dwAmmo_blast'); const splash = g.ops.find((x) => x.side === 1 && x !== e); splash.x = 11.5; splash.y = e.y;
  const result = G.resolveShoot(g, o, w(o, 'dwIncinerator'), e); assert(result.extra.some((x) => x.target === splash.uid || x.defender === splash.uid), 'Blast ammo reaches secondary targets');
}
{
  const g = arena(), o = get(g, 'dwAegis'), e = target(g); o.x = 10; o.y = 2; e.x = 15; e.y = 2; G.activate(g, e);
  const weapon = { id: 'test', group: 'test', name: { zh: '測試', en: 'Test' }, type: 'ranged', atk: 4, hit: 2, dmg: [2, 3], rules: { piercing: 1 } };
  const r = G.resolveShoot(g, e, weapon, o); assert.equal(r.defDice, 3, 'Storm Shield ignores Piercing 1');
  e.acted = {}; e.ap = 1; const r2 = G.resolveShoot(g, e, { ...weapon, rules: { piercingCrits: 1, lethal: 2 } }, o); assert.equal(r2.defDice, r2.attack.crits ? 2 : 3, 'Storm Shield does not reduce Piercing Crits');
}
{
  const g = arena(), o = get(g, 'dwDemolisher'); o.x = 25; g.ploys[0] = ['dwShieldSlays'];
  assert.equal(D.dwReduceDamage(g, o, 6, true, true), 5, 'reductions do not stack');
  assert.equal(D.dwReduceDamage(g, o, 7, false, true), 6);
  assert.equal(D.dwReduceDamage(g, o, 7, false, false), 7);
  assert.equal(D.dwReduceDamage(g, o, 4, true, false), 3);
  G.activate(g, o); assert(G.effectiveRules(g, o, w(o, 'dwHammer'), target(g)).brutal); o.acted.charge = 1; assert(G.effectiveRules(g, o, w(o, 'dwHammer')).ceaseless);
  g.active = target(g).uid; assert(!G.effectiveRules(g, o, w(o, 'dwHammer')).brutal, 'Brutal only when fighting');
}
{
  const g = arena(['dwHeadtaker', ...defaults.slice(1)]), o = get(g, 'dwHeadtaker'); o.order = 'conceal'; G.activate(g, o);
  assert(can(g, o, 'charge')); const e = target(g); o.acted.dwUnseen = [e.uid]; e.x = o.x + 1.5; e.y = o.y; e.wounds = e.maxW = 200;
  G.startFight(g, o, w(o, 'dwKnives'), e); assert(g.fight.A.extraStrike);
}
{
  const g = arena(defaults, ['dwCuffs']), o = get(g, 'dwGunner'); o.poison = true; o.wounds = 10;
  G.activate(g, o); assert(!o.poison); assert.equal(o.wounds, 10, 'cleanse before poison damage'); assert(!can(g, o, 'dwCuffsHeal'));
  o.acted = {}; o.wounds = 10; G.doSelfAction(g, o, 'dwCuffsHeal'); assert(o.wounds > 10); assert(!can(g, o, 'dwCuffsHeal'));
}
{
  const g = arena(defaults, ['dwThrall']), o = get(g, 'dwGunner'); G.activate(g, o);
  const id = Object.keys(MISSION_ACTIONS)[0]; const normal = G.actionCost(g, o, id);
  G.doSelfAction(g, o, 'dwThrallUse'); assert.equal(G.actionCost(g, o, id), Math.max(0, normal - 1));
  const e = target(g); e.x = o.x + 1.5; e.y = o.y; assert(!G.missionEngaged(g, o), 'thrall permits engaged mission action');
  D.dwMissionDone(g, o, id); assert.equal(g.dwThrallTP[0], g.tp); assert(!o.acted.dwThrall); assert(!can(g, o, 'dwThrallUse'));
}
{
  const g = arena(), o = get(g, 'dwGunner'); o.wounds = 2; assert(G.injuredPenalty(g, o));
  g.ploys[0] = ['noFear', 'dwLongVigil', 'dwMissionConceal']; assert(!G.injuredPenalty(g, o)); assert.equal(G.moveStat(g, o), 6);
  const r = {}; D.dwDefence(g, o, r); assert(r.balanced); o.x = 15; const crossing = {}; D.dwDefence(g, o, crossing); assert(!crossing.balanced, 'base crossing territory gets no Long Vigil');
  target(g).order = 'conceal'; assert(G.effectiveRules(g, o, w(o, 'dwBoltPistol'), target(g)).balanced);
}
{
  const g = arena(); g.dwCommand = [{}, {}]; g.phase = 'strategy'; g.initiative = 0; g.stratStep = 0;
  const p = T.ploys.find((p) => p.id === 'noFear'); assert.equal(G.ployCost(g, 0, p), 0); assert(G.buyPloy(g, 0, p));
  assert.equal(G.ployCost(g, 0, T.ploys[1]), 1); assert.equal(g.cp[0], 0);
  g.phase = 'firefight'; const o = get(g, 'dwSergeant'); o.ready = false; g.counter = true; G.activate(g, o);
  assert(G.useFFButton(g, o, 'dwTracking')); assert.equal(o.order, 'conceal'); assert(g.dwCommand[0].firefight);
}
{
  const g = arena(['dwDisruptor', ...defaults.slice(1)]), o = get(g, 'dwGunner'), e = target(g); G.activate(g, o);
  const opt = G.ffAttackOptions(g, o, 'shoot', w(o, 'dwIncinerator'), e).find((p) => p.id === 'dwAuspex'); assert(opt.ok); assert.equal(opt.cp, 0);
  G.ffToggle(g, o, 'dwAuspex', e); G.resolveShoot(g, o, w(o, 'dwIncinerator'), e); assert(o.acted.dwAuspexFree); assert(D.dwAuspexOn(g, o, e));
  const disruptor = get(g, 'dwDisruptor'); const blocker = target(g); blocker.x = disruptor.x + 1.5; blocker.y = disruptor.y; assert(!D.dwAuspexOn(g, o, e), 'recheck Triangulation after engagement');
  g.phase = 'strategy'; assert(D.dwScramble(g, 0, e.uid)); assert(D.dwBlocked(g, e)); assert(!G.readyOps(g, 1).includes(e));
  g.actCount = [0, g.dwScramble[0].n, 0]; assert(!D.dwBlocked(g, e));
}
{
  const g = arena(['dwMarksman', ...defaults.slice(1)]), o = get(g, 'dwMarksman'), e = target(g); e.x = 12; e.y = o.y; e.wounds = e.maxW = 200;
  G.activate(g, o); assert(can(g, o, 'dwGuard')); G.doSelfAction(g, o, 'dwGuard'); assert(o.dwGuard); assert.equal(o.ap, 2);
  G.endActivation(g); G.activate(g, e); const before = e.wounds;
  G.doMove(g, e, 'dash', { pts: [{ x: 12, y: e.y }, { x: 11, y: e.y }], len: 1 });
  assert(!o.dwGuard); assert(e.wounds < before); assert.equal(g.active, e.uid, 'guard restores active actor'); assert.equal(e.ap, 2);
}
// Smoke test the AI's action selection with ammo/cuffs/servo-thrall enabled.
{
  const g = arena(defaults, ['dwCuffs', 'dwAmmoReserve', 'dwDigital', 'dwThrall']); g.ai = 0;
  for (let n = 0; n < 40 && g.phase === 'firefight' && g.turn === 0; n++) { const declaration = aiStep(g); if (declaration) aiAttack(g, declaration); }
  assert(g.log.length > 1);
}
{
  const g = arena(defaults, ['dwDigital']), o = get(g, 'dwBlademaster'), e = target(g);
  e.x = o.x + 1.5; e.y = o.y; e.wounds = e.maxW = 200;
  const e2 = g.ops.find((x) => x.side === 1 && x !== e); e2.x = o.x - 1.5; e2.y = o.y; e2.wounds = e2.maxW = 200;
  G.activate(g, o); G.resolveFight(g, o, w(o, 'dwSweep'), e); G.endFight(g);
  assert(g.dwDigitalTP[0] === g.tp); assert(o.acted.free.fight === 'swipe'); assert(!G.fightTargets(g, o).includes(e));
  const ap = o.ap; const fight = G.resolveFight(g, o, w(o, 'dwDuel'), e2); assert.equal(o.ap, ap); assert.equal(fight.A.w, 'dwSweep', 'free sweep must use phase-sweep profile');
}
for (const [ids, opponent] of [[defaults, 'angels'], [['dwSergeant', 'dwMarksman', 'dwDisruptor', 'dwHeadtaker', 'dwBreacher'], 'handOfArchon'], [['dwHordeSlayer', 'dwAegis', 'dwBlademaster', 'dwDemolisher', 'dwGunner'], 'canoptekCircle']]) {
  const g = G.newGame({ teams: ['deathwatch', opponent], ai: null, roster: [rosterFor(ids)], equip: [['dwCuffs', 'dwAmmoReserve', 'dwDigital', 'dwThrall']] });
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 1600) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 1600, 'Deathwatch battle stalled'); assert(g.cp.every((cp) => cp >= 0)); console.log(`Deathwatch vs ${opponent}: full battle passed (${steps} steps, TP ${g.tp})`);
}
for (const t of TEAMS) assert.doesNotThrow(() => G.newGame({ teams: [t.id, 'deathwatch'], ai: null }), t.id);
console.log('Deathwatch: roster, weapon costs, counteractions, ammo, abilities, ploys, equipment, Guard and AI passed.');
