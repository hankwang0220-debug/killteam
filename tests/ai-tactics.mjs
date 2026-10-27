import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy, aiTune } from '../js/ai.js';
const arena = (teams) => {
  const g = G.newGame({ teams, ai: null, equip: [[], []], roster: [{}, {}] });
  Object.assign(g, { tp: 2, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side ? 29 : 1; o.y = 1 + (i % 12) * 1.7; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
};
const D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const offBoard = (g, keep) => { for (const o of g.ops) if (!keep.includes(o)) { o.dead = true; } };
aiTune.legacy = [false, false];

// Strategy ploys: a team with CP to spare buys the ploy that fits (not at random).
{
  const g = arena(['angels', 'kommandos']);
  Object.assign(g, { phase: 'strategy', cp: [3, 3, 0] });
  g.ployTurn = 0;
  const before = g.cp[0];
  aiStrategy(g, G.ployChooser(g));
  const s = G.ployChooser(g) === 0 ? 0 : 1;
  assert(g.cp[0] < before || g.cp[1] < 3, 'a strategy ploy was bought');
  assert(g.ploys[0].length + g.ploys[1].length >= 1);
}
// A shooter with nothing to shoot, here or where it's going, goes Conceal.
{
  const g = arena(['angels', 'kommandos']);
  const a = g.ops.find((o) => o.side === 0 && o.tplId === 'gunner') || g.ops.find((o) => o.side === 0 && o.tplId !== 'sgt');
  const e = g.ops.find((o) => o.side === 1);
  offBoard(g, [a, e]);
  a.x = 3; a.y = 11; e.x = 27; e.y = 11;
  g.terrain = [{ kind: 'heavy', x: 14, y: 0, w: 1, h: 22, height: 9 }]; // a wall across the middle: no line of sight
  g.objectives = [];
  aiStep(g);
  assert.equal(G.activeOp(g)?.uid, a.uid);
  assert.equal(a.order, 'conceal');
}
// Holding a marker no one else holds, with an enemy close: it stays within control range.
{
  const g = arena(['angels', 'kommandos']);
  const a = g.ops.find((o) => o.side === 0 && o.tplId === 'gunner') || g.ops.find((o) => o.side === 0 && o.tplId !== 'sgt');
  const e = g.ops.find((o) => o.side === 1 && o.tplId === 'boy') || g.ops.find((o) => o.side === 1);
  offBoard(g, [a, e]);
  const m = g.objectives[0];
  a.x = m.x; a.y = m.y + 0.5; e.x = m.x + 6; e.y = m.y + 3;
  let n = 0;
  while (g.turn === 0 && n++ < 20) { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); }
  assert(!a.dead && D(a, m) - G.radius(a) - 0.4 <= 1.01, 'still on the marker');
}
// Two operatives don't both walk to the same free marker when one is enough.
{
  const g = arena(['angels', 'kommandos']);
  const [a, b] = g.ops.filter((o) => o.side === 0 && !['sgt', 'asgt', 'captain'].includes(o.tplId)).slice(0, 2);
  const e = g.ops.find((o) => o.side === 1);
  offBoard(g, [a, b, e]);
  e.x = 29; e.y = 21;
  g.objectives = [{ id: 0, x: 8, y: 6 }, { id: 1, x: 8, y: 16 }];
  a.x = 3; a.y = 10; b.x = 3; b.y = 12;
  for (const op of [a, b]) {
    G.activate(g, op);
    let n = 0;
    while (g.active === op.uid && n++ < 10) aiStep(g);
    if (g.active === op.uid) G.endActivation(g);
    g.turn = 0;
  }
  const near = (o) => g.objectives.map((m) => D(o, m)).indexOf(Math.min(...g.objectives.map((m) => D(o, m))));
  assert.notEqual(near(a), near(b), 'they split between the markers');
}
// Shooting: of two equal targets, the one holding a marker.
{
  const g = arena(['angels', 'kommandos']);
  const a = g.ops.find((o) => o.side === 0 && o.tplId === 'gunner') || g.ops.find((o) => o.side === 0);
  const [e1, e2] = g.ops.filter((o) => o.side === 1 && o.tplId === 'boy').length >= 2 ? g.ops.filter((o) => o.side === 1 && o.tplId === 'boy') : g.ops.filter((o) => o.side === 1 && G.tpl(o).wounds === 10);
  offBoard(g, [a, e1, e2]);
  const m = g.objectives[1];
  a.x = m.x - 8; a.y = m.y; e1.x = m.x - 2; e1.y = m.y + 4; e2.x = m.x; e2.y = m.y + 0.3;
  G.activate(g, a);
  let d = null, n = 0;
  while (!d && g.active === a.uid && n++ < 6) d = aiStep(g);
  assert.equal(d?.kind, 'shoot');
  assert.equal(d.target.uid, e2.uid, 'the enemy on the marker');
}
console.log('ai tactics ok');
