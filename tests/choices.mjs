import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { xvJammers } from '../js/stealthsuits.js';
import { dkGambit } from '../js/deathkorps.js';

// Room for mistakes: a player side (g.pick) picks the ploy's target / marker / point itself; the computer picks automatically.
function strategyGame(teamId, opts = {}) {
  const g = G.newGame({ teams: [teamId, 'kommandos'], ai: null, equip: [opts.equip || [], []] });
  g.ops.forEach((o, i) => { o.placed = true; o.order = 'engage'; o.x = o.side === 0 ? 4 + (i % 5) * 1.6 : 12 + (i % 5) * 1.6; o.y = o.side === 0 ? 4 + Math.floor(i / 5) * 2 : 12 + Math.floor(i / 5) * 2; });
  Object.assign(g, { tp: 2, phase: 'strategy', initiative: 0, stratStep: 0, stratTurn: 0, terrain: [], cp: [9, 9, 0] });
  g.pick = [true, false];
  return g;
}
const cases = [
  ['aquilons', 'aqEye'], ['aquilons', 'aqSecure'], ['plagueMarines', 'cloudFlies'], ['plagueMarines', 'nurglings'], ['angels', 'adaptiveTactics'],
  ['blooded', 'gloryKill'], ['battleclade', 'prioritisedAcq'], ['goremongers', 'huntForBlood'], ['celestianInsidiants', 'suspectEliminate'],
  ['inquisitorialAgents', 'denounce'], ['inquisitorialAgents', 'quarry'], ['stealthSuits', 'xvAmbush'], ['raveners', 'rvWrithe'],
];
let picked = 0;
for (const [teamId, id] of cases) {
  const g = strategyGame(teamId);
  const ploy = G.team(g, 0).ploys.find((p) => p.id === id);
  assert(ploy, `${id}: a ${teamId} ploy`);
  assert(G.buyPloy(g, 0, ploy), `${id}: bought`);
  const p = G.pendingChoice(g, 0);
  if (!p) { assert.equal(G.ployChooser(g), 1, `${id}: nothing to pick, the turn passes`); continue; }
  picked++;
  assert.equal(G.ployChooser(g), 0, `${id}: the turn waits for the pick`);
  assert(!G.finishPloys(g), `${id}: can't pass with a pick to make`);
  const c = G.CHOICES[id];
  const value = c.kind === 'point' ? c.auto(g, 0, p.ctx) : c.options(g, 0, p.ctx).at(-1).value;
  if (c.kind === 'point') assert(!G.resolveChoice(g, 0, { x: -5, y: -5 }), `${id}: an illegal point is refused`);
  assert(G.resolveChoice(g, 0, value), `${id}: picked`);
  assert(!G.pendingChoice(g, 0));
  assert.equal(G.ployChooser(g), 1, `${id}: then the turn passes`);
}
assert(picked >= 10, `most cases had something to pick (${picked})`);
// Specific effects of the player's pick.
{
  const g = strategyGame('aquilons'); G.buyPloy(g, 0, G.team(g, 0).ploys.find((p) => p.id === 'aqSecure'));
  G.resolveChoice(g, 0, 3); assert.equal(g.aq.secure[0].id, 3, 'Drop and Secure: the marker picked');
  const b = strategyGame('blooded'); G.buyPloy(b, 0, G.team(b, 0).ploys.find((p) => p.id === 'gloryKill'));
  const t = G.CHOICES.gloryKill.options(b, 0)[0].value; G.resolveChoice(b, 0, t); assert.equal(b.gloryKill[0].uid, t, 'Glory Kill: the enemy picked');
  const x = strategyGame('stealthSuits'); G.buyPloy(x, 0, G.team(x, 0).ploys.find((p) => p.id === 'xvAmbush'));
  assert(G.resolveChoice(x, 0, { x: 3, y: 3 })); assert.deepEqual([x.xv.ambush[0].x, x.xv.ambush[0].y], [3, 3], 'Prepare Ambush: the tapped point');
  const a = strategyGame('aquilons'); G.buyPloy(a, 0, G.team(a, 0).ploys.find((p) => p.id === 'aqEye')); assert(G.resolveChoice(a, 0, 'auto'), '"let the computer pick"');
}
// Gambits: Counter-Network Jammers (a marker), Gas Bombardment (a point).
{
  const g = strategyGame('stealthSuits', { equip: ['xvJammers'] });
  assert(xvJammers(g, 0)); assert.equal(G.pendingChoice(g, 0)?.id, 'xvJammers'); G.resolveChoice(g, 0, 2); assert.equal(g.xv.jam[0].id, 2);
  const d = strategyGame('deathKorps', { equip: ['dkGas'] });
  assert(dkGambit(d, 0, 'gas')); assert.equal(G.pendingChoice(d, 0)?.id, 'dkGas'); G.resolveChoice(d, 0, { x: 20, y: 15 });
  assert(d.markers.some((m) => m.kind === 'gas' && m.x === 20 && m.y === 15), 'Gas Bombardment: the tapped point');
}
// Free moves: the player moves an operative to a legal spot (or none), then finishes; the turn passes after.
let moved = 0;
for (const [teamId, id, gambit] of [['kommandos', 'sssshhhh'], ['tauPathfinders', 'reconSweep'], ['deathKorps', 'regroup'], ['sanctifiers', 'sfRally'], ['scoutSquad', 'scStealth'],
  ['scoutSquad', 'scAdaptable'], ['spectres', 'spDisappear'], ['nemesisClaw', 'ncReturn'], ['deathKorps', null, 'chrono']]) {
  const g = strategyGame(teamId, { equip: gambit ? ['dkChrono'] : [] });
  if (teamId === 'tauPathfinders') g.ops.filter((o) => o.side === 0).forEach((o, i) => { o.x = 27 + (i % 2); o.y = 3 + i * 1.5; }); // (wholly within 6" of an edge)
  if (teamId === 'nemesisClaw') g.terrain = [{ kind: 'heavy', x: 9, y: 2, w: 1, h: 10 }];
  if (gambit) { g.tp = 1; assert(dkGambit(g, 0, 'chrono')); } else assert(G.buyPloy(g, 0, G.team(g, 0).ploys.find((p) => p.id === id)), `${id}: bought`);
  let guard = 0;
  while (G.pendingChoice(g, 0) && guard++ < 20) {
    const p = G.pendingChoice(g, 0), c = G.CHOICES[p.id];
    if (c.kind !== 'move') { assert(G.resolveChoice(g, 0, c.options(g, 0, p.ctx)[0].value), `${p.id}: picked`); if (p.id === 'scAdaptable' && G.pendingChoice(g, 0)) assert(G.resolveChoice(g, 0, null)); continue; }
    const o = G.moversLeft(g, 0, c, p.ctx)[0];
    let done = false;
    for (const r of [1, 2, 3]) for (let a = 0; a < 16 && !done; a++) {
      const q = { x: o.x + Math.cos(a * Math.PI / 8) * r, y: o.y + Math.sin(a * Math.PI / 8) * r };
      const path = G.freeMovePath(g, o, c.moveKind(g, o, p.ctx), c.max(g, o, p.ctx), [q]);
      if (path && (!c.check || c.check(g, 0, o, path.pts.at(-1), p.ctx))) { const x0 = o.x; assert(G.resolveChoice(g, 0, { uid: o.uid, pts: [q] }), `${p.id}: moved`); assert(o.x !== x0 || o.y !== path.pts[0].y, `${p.id}: it moved`); done = true; moved++; }
    }
    if (G.pendingChoice(g, 0) === p) assert(!G.resolveChoice(g, 0, { uid: o.uid, pts: [{ x: o.x + 20, y: o.y }] }), `${p.id}: too far is refused`);
    if (G.pendingChoice(g, 0) === p) assert(G.resolveChoice(g, 0, null), `${p.id}: done`);
  }
  assert(!G.pendingChoice(g, 0), `${id || gambit}: finished`);
  if (!gambit) assert.equal(G.ployChooser(g), 1, `${id}: the turn passes`);
}
assert(moved >= 5, `moves made (${moved})`);
// The computer (no g.pick) picks at once.
{
  const g = strategyGame('aquilons'); g.pick = [false, false];
  G.buyPloy(g, 0, G.team(g, 0).ploys.find((p) => p.id === 'aqSecure'));
  assert(!G.pendingChoice(g, 0) && g.aq.secure[0], 'automatic for the computer');
}
console.log(`choices ok (${picked} picks)`);
