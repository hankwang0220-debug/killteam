import assert from 'node:assert/strict';
import * as G from '../js/game.js';

// Breacha Boy (Kommandos): Breach during a Charge or Reposition for 1 less AP — the marker goes down part-way and the move carries on through it.
const g = G.newGame({ teams: ['kommandos', 'angels'], ai: null, equip: [[], []] });
Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, cp: [3, 3, 0], terrain: [{ kind: 'heavy', x: 10, y: 6, w: 0.5, h: 8, height: 2.6 }] });
g.ops.forEach((o, i) => { o.x = o.side ? 27 : 1; o.y = 1 + i * 1.5; o.placed = true; o.order = 'engage'; o.ready = true; });
const b = g.ops.find((o) => o.side === 0 && G.tpl(o).kmBreacha);
assert(b, 'a Breacha Boy in the default roster');
const r = G.radius(b);
b.x = 10 - r - 2; b.y = 10;
G.activate(g, b);
const at = { x: 10 - r - 0.3, y: 10 }, end = { x: 10.5 + r + 1, y: 10 };
assert(!G.midMoveBreach(g, b, 'reposition', { x: 3, y: 10 }), 'no terrain in reach');
assert(G.midMoveBreach(g, b, 'reposition', at));
assert(!G.midMoveBreach(g, b, 'dash', at), 'only Charge or Reposition');
const ap = b.ap;
assert.notEqual(G.doMove(g, b, 'reposition', { pts: [{ x: b.x, y: b.y }, at, end], breach: { at: 1 } }), false);
assert(b.x > 10.5, 'through the breach');
assert(g.markers.some((m) => m.kind === 'breach' && m.owner === 0), 'the Breach marker is down');
assert.equal(b.ap, ap - 1, 'the Breach was free (1 less AP)');
assert(!G.availableActions(g, b).some((a) => a.id === 'kmBreach' && a.ok), 'once per activation');
console.log('mid-move breach ok');
