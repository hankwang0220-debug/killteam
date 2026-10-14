import assert from 'node:assert/strict';
import * as G from '../js/game.js';

// Balanced is the player's choice: a player's roll keeps one free re-roll (balancedLeft) instead of re-rolling automatically;
// the computer's (no g.pick) still re-rolls its lowest fail at once.
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
function fightGame(pick) {
  const g = G.newGame({ teams: ['wolfScouts', 'kommandos'], ai: null });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = -99; o.y = -99; });
  const l = g.ops.find((o) => o.side === 0 && o.tplId === 'wsLeader'), e = g.ops.find((o) => o.side === 1 && o.tplId !== 'kmBombSquig');
  Object.assign(l, { x: 10, y: 10 }); Object.assign(e, { x: 11.3, y: 10 });
  g.ws.storm[0] = { x: 10, y: 10 }; g.ploys[0].push('wsWrath'); // Tempestuous Wrath: Balanced melee weapons
  g.ffOff = [['wsLokyar'], []]; // (Touched by Lokyar would re-roll the fails too)
  if (pick) g.pick = [true, false];
  G.activate(g, l);
  return { g, l, e };
}
{
  const { g, l, e } = fightGame(true);
  const w = G.weaponsFor(g, l).find((x) => x.id === 'wsPower');
  assert(G.effectiveRules(g, l, w, e).balanced);
  dice([1, 1, 1, 1, 1, 4, 4, 4, 4], () => G.startFight(g, l, w, e));
  const pool = g.fight.A.a;
  assert.equal(pool.balancedLeft, 1, 'the player keeps the Balanced re-roll');
  assert(!pool.dice.some((d) => d.rr), 'nothing re-rolled automatically');
  assert(g.fight.rrOpen?.A, 'the re-roll window opens for it');
  const i = pool.dice.findIndex((d) => !d.auto);
  assert(dice([6], () => G.fightBalanced(g, 'A', i)), 'used');
  assert.equal(pool.dice[i].v, 6); assert.equal(pool.balancedLeft, 0);
  assert(!G.fightBalanced(g, 'A', i), 'only once');
}
{
  const { g, l, e } = fightGame(false);
  const w = G.weaponsFor(g, l).find((x) => x.id === 'wsPower');
  dice([1, 1, 1, 1, 1, 4, 4, 4, 4], () => G.startFight(g, l, w, e));
  assert(g.fight.A.a.dice.some((d) => d.rr), 'the computer re-rolls at once');
  assert(!g.fight.A.a.balancedLeft);
}
console.log('balanced ok');
