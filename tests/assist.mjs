import assert from 'node:assert/strict';
import * as G from '../js/game.js';

// Fight assists: +1 Hit for each other friendly in the enemy's control range that isn't in another enemy's control range;
// cumulative, 2+ at best, and a 1 always fails.
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
function setup() {
  const g = G.newGame({ teams: ['kommandos', 'angels'], ai: null });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = -99; o.y = -99; });
  const mine = g.ops.filter((o) => o.side === 0 && o.tplId !== 'kmBombSquig' && !G.tpl(o).machine), theirs = g.ops.filter((o) => o.side === 1);
  const [a, f1, f2, f3] = mine, [e, e2] = theirs;
  Object.assign(e, { x: 15, y: 10 }); Object.assign(a, { x: 13.7, y: 10 });
  return { g, a, f1, f2, f3, e, e2 };
}
const hitWith = (g, a, e) => { const w = G.bestMelee(a); G.activate(g, a); dice([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], () => G.startFight(g, a, w, e)); return { hit: g.fight.A.hit, base: w.hit, assist: g.fight.A.assist, dice: g.fight.A.a.dice }; };
{
  const { g, a, e } = setup();
  const r = hitWith(g, a, e);
  assert.equal(r.assist, 0); assert.equal(r.hit, r.base, 'no assist');
}
{
  const { g, a, f1, e } = setup(); Object.assign(f1, { x: 16.3, y: 10 });
  const r = hitWith(g, a, e);
  assert.equal(r.assist, 1); assert.equal(r.hit, Math.max(2, r.base - 1), 'one assist: +1');
}
{
  const { g, a, f1, f2, e } = setup(); Object.assign(f1, { x: 16.3, y: 10 }); Object.assign(f2, { x: 15, y: 11.3 });
  const r = hitWith(g, a, e);
  assert.equal(r.assist, 2); assert.equal(r.hit, Math.max(2, r.base - 2), 'two assists: cumulative');
}
{
  const { g, a, f1, f2, f3, e } = setup(); Object.assign(f1, { x: 16.3, y: 10 }); Object.assign(f2, { x: 15, y: 11.3 }); Object.assign(f3, { x: 15, y: 8.7 });
  const r = hitWith(g, a, e);
  assert.equal(r.assist, 3); assert.equal(r.hit, 2, '2+ at best');
  assert(r.dice.every((d) => d.auto || d.res === 'miss'), 'a 1 always fails');
}
{
  const { g, a, f1, f2, e, e2 } = setup(); Object.assign(f1, { x: 16.3, y: 10 }); Object.assign(f2, { x: 15, y: 11.3 }); Object.assign(e2, { x: 15, y: 12.6 });
  const r = hitWith(g, a, e);
  assert.equal(r.assist, 1, 'a friendly in another enemy\'s control range doesn\'t assist');
}
console.log('assist ok');
