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

// Defence re-rolls a player uses itself: Void Armour (Navy Breachers, shot by Blast / Torrent) and Dig In!-type (Forewarned, Blades of Khaine).
function shotAt(defTeam, setup) {
  const g = G.newGame({ teams: ['kommandos', defTeam], ai: null });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = -99; o.y = -99; });
  const sh = g.ops.find((o) => o.side === 0 && G.weaponsFor(g, o).some((w) => w.type === 'ranged' && w.rules.torrent));
  const t = g.ops.find((o) => o.side === 1);
  Object.assign(sh, { x: 10, y: 10 }); Object.assign(t, { x: 13, y: 10 });
  g.pick = [false, true]; g.ffOff = [[], G.team(g, 1).firefight?.map((p) => p.id) || []];
  setup?.(g, t);
  G.activate(g, sh);
  const w = G.weaponsFor(g, sh).find((x) => x.type === 'ranged' && x.rules.torrent);
  const it = G.shootFlow(g, sh, w, t);
  let r = it.next();
  while (!r.done && r.value.stage !== 'defence') r = it.next();
  return { g, seq: r.value?.seq, it };
}
{
  const { g, seq, it } = dice([6, 6, 6, 6, 6, 1, 1, 1], () => shotAt('navyBreachers'));
  assert(seq.d.rerollLeft >= 1, 'Void Armour waits for the player');
  assert(!seq.d.dice.some((d) => d.rr), 'nothing re-rolled automatically');
  const i = seq.d.dice.findIndex((d) => !d.auto);
  const n = seq.d.rerollLeft;
  assert(dice([6], () => G.voidReroll(g, seq, 'd', i))); assert.equal(seq.d.dice[i].v, 6); assert.equal(seq.d.rerollLeft, n - 1);
  while (!it.next().done);
}
{
  const { g, seq, it } = dice([6, 6, 6, 6, 6, 2, 2, 5], () => shotAt('bladesOfKhaine', (g) => g.ploys[1].push('forewarned')));
  assert.equal(seq.d.digInLeft, 1, 'Forewarned waits for the player');
  const v = seq.d.dice.find((d) => !d.auto).v;
  assert(G.digInReroll(g, seq, 'd', v), 're-roll every die of one result');
  assert(!seq.d.dice.some((d) => !d.auto && d.v === v && !d.rr)); assert.equal(seq.d.digInLeft, 0);
  assert(!G.digInReroll(g, seq, 'd', 1) && !G.digInReroll(g, seq, 'd', 6), 'only once');
  while (!it.next().done);
}
console.log('defence re-rolls ok');
