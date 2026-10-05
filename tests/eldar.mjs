import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAMS } from '../js/data/teams.js';
import { gainPain, usePain, painOptions, painSnapshot, archonAfterAction } from '../js/archon.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 918273;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(a = 'handOfArchon', b = 'angels', options = {}) {
  const g = G.newGame({ teams: [a, b], ai: null, ...options }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [0, 0, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 25; o.y = 2 + i; o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
for (const t of TEAMS) assert.doesNotThrow(() => G.newGame({ teams: [t.id, 'handOfArchon'], ai: null }), t.id);
assert.throws(() => arena('handOfArchon', 'angels', { loadouts: [{ haLeader: 'blastVenom' }] }), /two darklight/);
{
  const g = arena('handOfArchon', 'angels', { loadouts: [{ haLeader: 'blastVenom', haHeavy: 'cannon' }] });
  assert.equal(G.weaponsFor(g, get(g, 'haLeader'))[0].id, 'haBlastPistol');
  assert.equal(G.bestMelee(get(g, 'haLeader')).id, 'haVenomBlade');
}
{
  const g = arena(), o = get(g, 'haLeader'); G.activate(g, o); gainPain(g, o, 2);
  assert.equal(get(g, 'haAgent').pain, 1, 'Sadistic Competition');
  assert(usePain(g, o, 'darkAnimus')); assert.equal(o.ap, 3); assert(!painOptions(g, o).length);
  G.endActivation(g); G.activate(g, o); assert.equal(o.ap, 2, 'Dark Animus expires at next activation');
}
{
  const g = arena(), o = get(g, 'haGunner'), target = g.ops.find((x) => x.side === 1);
  const before = painSnapshot(g); target.wounds = 1; archonAfterAction(g, o, before); assert.equal(o.pain, 1);
  const next = painSnapshot(g); G.applyDamage(g, o, target, 99); archonAfterAction(g, o, next); assert.equal(o.pain, 3, '12+ Wounds kill grants 2');
}
{
  const g = arena(), o = get(g, 'haAssassin'); G.activate(g, o);
  const wing = G.weaponsFor(g, o).find((w) => w.id === 'haRazorwing');
  o.acted.shoot = 1; o.acted.shotWith = wing.group;
  assert(!G.shootWeapon(g, o, wing).ok); assert(G.shootWeapon(g, o, G.weaponsFor(g, o)[1]).ok);
  o.acted.archonMark = 1; assert(!G.shootWeapon(g, o, G.weaponsFor(g, o)[1]).ok);
}
{
  const g = arena('corsairVoidscarred'); assert.equal(G.living(g, 0).length, 9);
  const o = get(g, 'cvFate'); G.activate(g, o); assert.equal(G.actionCost(g, o, 'dash'), 0);
  G.doMove(g, o, 'dash', { pts: [{ x: o.x, y: o.y }, { x: o.x + 2, y: o.y }], len: 2 }); assert.equal(o.ap, 2); assert.equal(G.actionCost(g, o, 'dash'), 1);
  const f = get(g, 'cvFelarch'); G.activate(g, f); assert.equal(G.shootWeapon(g, f, G.weaponsFor(g, f)[0]).ap, 0);
  G.spend(g, f, 'shoot', 0); assert.equal(G.actionCost(g, f, 'dash'), 1);
}
{
  const g = arena('corsairVoidscarred', 'angels', { roster: [{ cvGunner: 'cvHeavy', cvFate: 'cvWarrior' }], loadouts: [{ cvHeavy: 'wraith' }] });
  assert.equal(G.living(g, 0).length, 9); assert(get(g, 'cvHeavy')); assert(get(g, 'cvWarrior')); assert(!get(g, 'cvGunner')); assert.equal(G.weaponsFor(g, get(g, 'cvHeavy'))[0].id, 'cvWraith');
}
{
  const g = arena('corsairVoidscarred'), o = get(g, 'cvStarstorm'); G.activate(g, o); G.doSelfAction(g, o, 'pistolBarrage'); assert.equal(o.ap, 1);
  const target = g.ops.find((x) => x.side === 1); target.x = o.x + 2; target.y = o.y;
  const ws = G.weaponsFor(g, o).filter((w) => w.type === 'ranged');
  assert(G.shootWeapon(g, o, ws[0]).ok); G.resolveShoot(g, o, ws[0], target); assert(!G.shootWeapon(g, o, ws[0]).ok); assert(G.shootWeapon(g, o, ws[1]).ok);
  if (target.dead) target.dead = false, target.wounds = target.maxW;
  G.resolveShoot(g, o, ws[1], target); assert.equal(o.ap, 1); assert(!G.availableActions(g, o).find((a) => a.id === 'shoot').ok);
}
{
  const g = arena('corsairVoidscarred'), o = get(g, 'cvWay'), a = get(g, 'cvSoul'), b = get(g, 'cvFate'); G.activate(g, o);
  a.x = o.x + 2; a.y = o.y; b.x = o.x - 1; b.y = o.y; const ax = a.x, bx = b.x;
  assert.equal(G.doTargetAction(g, o, 'warpFold', a), false); assert.equal(o.ap, 2);
  G.doTargetAction(g, o, 'warpFold', b); assert.equal(a.x, bx); assert.equal(b.x, ax); assert.equal(o.ap, 1);
}
for (const a of ['handOfArchon', 'corsairVoidscarred']) {
  const g = G.newGame({ teams: [a, 'angels'], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 1600) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 1600, `${a}: simulation stalled`); assert(g.cp.every((x) => x >= 0)); console.log(`${a}: full battle passed (${steps} steps, TP ${g.tp})`);
}
console.log('Eldar integration checks passed');
