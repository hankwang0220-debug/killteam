import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 66613;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(options = {}, b = 'angels') {
  const g = G.newGame({ teams: ['chaosCult', b], ai: null, ...options }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1.5 + (i % 7) * 2 : 26; o.y = 2 + Math.floor(i / 7) * 3 + (o.side ? i * 1.5 : 0); o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);

// Roster: 14 — Demagogue, two Blessed Blades, nine Devotees, Iconarch, Mindwitch.
{
  const g = arena();
  assert.equal(G.living(g, 0).length, 14);
  assert.equal(g.ops.filter((o) => o.side === 0 && o.tplId === 'ctDevotee').length, 9);
}
// Mutation: in the Strategy phase Devotees become Mutants (lost wounds carry over) and gain the primary Gift.
{
  const g = arena(); g.phase = 'strategy'; g.stratStep = 0; g.initiative = 0;
  const d = get(g, 'ctDevotee'); d.wounds = 5; d.x = 24; // nearest the enemy
  G.finishPloys(g); G.finishPloys(g);
  assert.equal(d.tplId, 'ctMutant', 'mutated');
  assert.equal(d.maxW, 7); assert.equal(d.wounds, 5, 'lost wounds carry over');
  assert.equal(g.ops.filter((o) => o.side === 0 && o.tplId === 'ctMutant').length, 2, 'two in TP1');
  assert(G.giftsOf(g, d).length === 1, 'primary Accursed Gift');
}
// A Mutant becomes a Torment; a Devotee that incapacitates an enemy in its control range mutates.
{
  const g = arena(), d = get(g, 'ctDevotee'), e = g.ops.find((o) => o.side === 1);
  e.x = d.x + G.radius(d) + G.radius(e) + 0.5; e.y = d.y;
  G.applyDamage(g, d, e, 99);
  assert.equal(d.tplId, 'ctMutant');
  g.tp = 2; g.phase = 'strategy'; g.stratStep = 0; g.initiative = 0;
  G.finishPloys(g); G.finishPloys(g);
  assert.equal(d.tplId, 'ctTorment', 'Mutants are mutated first');
  assert.equal(G.giftsOf(g, d).length, 2, 'Torments have both gifts');
  assert(!G.availableActions(g, d).some((a) => a.id === 'pickUp'), 'Accursed Torment');
}
// Cut Them Down: falling back from a Blessed Blade costs D3+1 first.
{
  const g = arena(), b = get(g, 'ctBlade'), e = g.ops.find((o) => o.side === 1);
  for (const o of g.ops) if (o.side === 0 && o !== b) o.x = 28 - (o.num % 2);
  e.x = b.x + G.radius(b) + G.radius(e) + 0.5; e.y = b.y;
  g.turn = 1; G.activate(g, e);
  const before = e.wounds;
  G.doMove(g, e, 'fallBack', { pts: [{ x: e.x, y: e.y }, { x: e.x + 4, y: e.y }], len: 4 });
  assert(e.wounds <= before - 2 && e.wounds >= before - 4);
}
// Incite Slaughter: an engaged cultist fights for free, then the Demagogue resumes.
{
  const g = arena(), dm = get(g, 'ctDemagogue'), d = get(g, 'ctDevotee'), e = g.ops.find((o) => o.side === 1);
  d.x = dm.x + 3; d.y = dm.y; e.x = d.x + G.radius(d) + G.radius(e) + 0.5; e.y = d.y;
  G.activate(g, dm);
  G.doTargetAction(g, dm, 'inciteSlaughter', d);
  G.activate(g, d);
  assert.deepEqual(G.availableActions(g, d).map((a) => a.id), ['fight'], 'only the free Fight');
  G.resolveFight(g, d, G.bestMelee(d), e);
  G.endActivation(g);
  assert.equal(g.active, dm.uid);
}
// Ruinous Icon (Deterioration) and Malefic Vortex.
{
  const g = arena(), ic = get(g, 'ctIconarch'), mw = get(g, 'ctMindwitch'), e = g.ops.find((o) => o.side === 1);
  e.x = ic.x + 3; e.y = ic.y;
  G.activate(g, ic); G.doSelfAction(g, ic, 'ruinousDeter');
  const w = e.wounds; G.applyDamage(g, null, e, 0); // (no-op)
  G.endActivation(g); g.turn = 0;
  G.activate(g, mw);
  e.x = mw.x + 5; e.y = mw.y;
  G.doTargetAction(g, mw, 'maleficVortex', e);
  assert(g.markers.some((m) => m.kind === 'vortex'));
  assert(e.wounds <= w - 1, 'vortex damage');
}
// AI vs AI full battles.
for (const [a, b] of [['chaosCult', 'angels'], ['celestianInsidiants', 'chaosCult'], ['chaosCult', 'kasrkin']]) {
  const g = G.newGame({ teams: [a, b], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 4000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 4000, `${a} vs ${b}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp})`);
}
console.log('chaoscult ok');
