import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 424242;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(a = 'battleclade', b = 'angels') {
  const g = G.newGame({ teams: [a, b], ai: null }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + (i % 5) * 1.5 : 25; o.y = 2 + Math.floor(i / 5) * 2 + (o.side ? i : 0); o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const can = (g, op, id) => G.availableActions(g, op).find((a) => a.id === id);

// Transfer Power → one other servitor network counteracts (a ready one stays ready), then the opponent activates.
{
  const g = arena(), gun = get(g, 'bcGunBolter'), melta = get(g, 'bcMelta');
  G.activate(g, gun);
  assert(can(g, gun, 'transferPower').ok);
  G.doSelfAction(g, gun, 'transferPower');
  assert.equal(gun.ap, 1);
  assert(!can(g, gun, 'transferPower').ok, 'once per activation');
  G.endActivation(g);
  assert(g.counter && g.turn === 0, 'network counteract offered to the same player');
  const cands = G.counterCandidates(g, 0);
  assert(!cands.includes(gun), 'not the servitor that transferred');
  assert(cands.includes(melta) && melta.ready, 'a ready servitor qualifies');
  assert(!cands.some((o) => G.tpl(o).techPriest), 'servitors only');
  G.activate(g, melta);
  assert(melta.counter && melta.netCounter && melta.ap === 1 && !melta.orderSet, 'select its order, one free action');
  assert.equal(G.moveAllowance(g, melta, 'reposition'), 2);
  G.endActivation(g);
  assert(melta.ready, 'still ready afterwards');
  assert(melta.counteracted && G.netCands(g, 0).every((o) => o !== melta), 'cannot do it again this TP');
  assert.equal(g.turn, 1, 'the opponent activates next');
  assert(!g.counter && !g.netcounter);
}
// Passing on the network counteract.
{
  const g = arena(), gun = get(g, 'bcGunArc');
  G.activate(g, gun); G.doSelfAction(g, gun, 'transferPower'); G.endActivation(g);
  G.passCounter(g);
  assert.equal(g.turn, 1); assert(!g.counter);
}
// Network Override: a servitor counteracts mid-activation, then the Underseer continues; twice, different servitors.
{
  const g = arena(), us = get(g, 'bcUnderseer');
  G.activate(g, us);
  const ts = G.TARGET_ACTIONS.networkOverride.targets(g, us);
  assert(ts.length >= 2 && ts.every((o) => G.tpl(o).servitor));
  G.doTargetAction(g, us, 'networkOverride', ts[0]);
  assert(!g.active && g.counter && g.turn === 0);
  assert.deepEqual(G.counterCandidates(g, 0), [ts[0]]);
  G.activate(g, ts[0]); G.endActivation(g);
  assert.equal(g.active, us.uid, 'Underseer resumes'); assert.equal(us.ap, 2); assert(!g.counter);
  assert(!G.TARGET_ACTIONS.networkOverride.targets(g, us).includes(ts[0]), 'a different operative each time');
  G.doTargetAction(g, us, 'networkOverride', G.TARGET_ACTIONS.networkOverride.targets(g, us)[0]);
  G.passCounter(g);
  assert.equal(g.active, us.uid);
  assert(!can(g, us, 'networkOverride').ok, 'twice per activation');
}
// Omniscanner → Ceaseless; Achillan Eye → Saturate; Noospheric Possession → Accurate 1.
{
  const g = arena(), ar = get(g, 'bcArcheo'), enemy = g.ops.find((o) => o.side === 1);
  enemy.x = ar.x + 10; enemy.y = ar.y; // visible, beyond 8", nobody engaged
  G.activate(g, ar);
  G.doTargetAction(g, ar, 'omniscanner', enemy);
  assert(enemy.omni[0]);
  const gun = get(g, 'bcGunBolter'), w = G.weaponsFor(g, gun)[0];
  const r = G.effectiveRules(g, gun, w, enemy);
  assert(r.ceaseless, 'Ceaseless against an Omniscanner token');
  assert(r.saturate, 'Achillan Eye: the Auto-proxy sees the target');
  g.ploys[0].push('noosphericPossession');
  assert.equal(G.effectiveRules(g, gun, w, enemy).accurate, 1);
}
// Datacoronal Accumulator: gains 1CP only when the D3 is no more than the objectives contested.
{
  const g = arena(), us = get(g, 'bcUnderseer');
  g.objectives = [{ id: 0, x: us.x, y: us.y }];
  G.activate(g, us);
  const before = g.cp[0];
  G.doSelfAction(g, us, 'datacoronal');
  assert(g.cp[0] - before <= 1);
  assert(!can(g, us, 'datacoronal').ok);
}
// Prioritised Acquisition: +1 total APL contesting the chosen objective.
{
  const g = arena(), gun = get(g, 'bcGunBolter'), e = g.ops.find((o) => o.side === 1);
  g.objectives = [{ id: 0, x: 10, y: 10 }];
  gun.x = 10; gun.y = 10 + G.radius(gun); e.x = 10; e.y = 10 - G.radius(e);
  for (const o of g.ops) if (o !== gun && o !== e) o.x = o.side ? 27 : 1;
  const total = (s) => G.aplNow(g, s ? e : gun);
  const before = G.controller(g, g.objectives[0]);
  g.acquisition = [{ tp: g.tp, id: 0, x: 10, y: 10 }, null];
  const diff = total(0) + 1 - total(1);
  assert.equal(before, total(0) > total(1) ? 0 : total(0) < total(1) ? 1 : null);
  assert.equal(G.controller(g, g.objectives[0]), diff > 0 ? 0 : diff < 0 ? 1 : null, 'Battleclade counts +1 APL there');
}
// AI vs AI runs to the end with Battleclade on either side.
for (const [a, b] of [['battleclade', 'angels'], ['kasrkin', 'battleclade']]) {
  const g = G.newGame({ teams: [a, b], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0, nets = 0;
  while (g.phase !== 'gameover' && steps++ < 3000) {
    if (g.netcounter) nets++;
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 3000, `${a} vs ${b}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp}, network counteract steps ${nets})`);
}
console.log('battleclade ok');
