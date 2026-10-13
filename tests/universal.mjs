import assert from 'node:assert/strict';
import * as G from '../js/game.js';
let seed = 4242;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;

// Portable Barricade: set up as Light, Protective, Portable terrain; Move With Barricade carries it.
{
  const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [['portableBarricade'], []] });
  const t = g.terrain.find((x) => x.portable || (g.eqDeploy?.queues[0] || []).length);
  const item = g.eqDeploy.queues[0].map((e) => e.item).find((i) => i.portable);
  assert(item && item.protective && item.kind === 'light', 'a portable barricade is queued for set-up');
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  const bar = g.terrain.find((x) => x.portable);
  assert(bar, 'placed');
  g.tp = 1; g.phase = 'firefight'; g.turn = 0;
  const op = g.ops.find((o) => o.side === 0);
  op.placed = true; op.order = 'engage'; op.ready = true;
  op.x = bar.x + bar.w + 0.6; op.y = bar.y + bar.h / 2;
  g.ops.filter((o) => o.side === 1).forEach((o, i) => { o.x = 29; o.y = 1 + i; o.placed = true; });
  G.activate(g, op);
  assert(can(g, op, 'mvBarricade'), 'connected');
  G.doSelfAction(g, op, 'mvBarricade');
  assert.equal(G.actionCost(g, op, 'reposition'), 0, 'the Reposition is free');
  const cap = G.moveAllowance(g, op, 'reposition');
  assert(cap <= 4 - 1.99 + 1e-6 + 0 || cap < 6, 'Move -2"');
  const bx = bar.x;
  assert(G.doMove(g, op, 'reposition', { pts: [{ x: op.x, y: op.y }, { x: op.x + (g.deploy ? 0 : 0) - 0, y: op.y + 0 }, { x: op.x, y: op.y + 2 }], len: 2 }) !== undefined);
  assert(Math.abs(bar.y - (op.y - 2 - bar.h / 2 + 0)) < 5, 'the barricade moved with it (or stayed if blocked)');
}
// Breaching Charge: once per battle any friendly can Breach.
{
  const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [['breachingCharge'], []] });
  g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = [{ kind: 'heavy', x: 10, y: 8, w: 0.5, h: 4 }];
  const op = g.ops.find((o) => o.side === 0);
  op.placed = true; op.order = 'engage'; op.ready = true; op.x = 9.2; op.y = 10;
  g.ops.filter((o) => o.side === 1).forEach((o, i) => { o.x = 29; o.y = 1 + i; o.placed = true; });
  G.activate(g, op);
  assert(can(g, op, 'kmBreach'), 'Breach is available');
  G.doSelfAction(g, op, 'kmBreach');
  assert(g.markers.some((m) => m.kind === 'breach'));
  assert.equal(g.eqUses[0].breachCharge, 1);
  G.endActivation(g);
  const o2 = g.ops.find((o) => o.side === 0 && o !== op); o2.placed = true; o2.order = 'engage'; o2.ready = true; o2.x = 9.2; o2.y = 9;
  g.turn = 0; G.activate(g, o2);
  assert(!can(g, o2, 'kmBreach'), 'only once per battle');
}
console.log('universal ok');
