import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { accessPointsOf } from '../js/tombworld-access.js';

// Operate Hatch during a Dash or Reposition: open the hatchway part-way, then carry on through it with the rest of the move.
function arena() {
  const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [[], []], map: 'tombworld-1' });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side ? 27 : 1; o.y = 1 + i * 1.5; o.placed = true; o.order = 'engage'; o.ready = true; });
  const op = g.ops[0], d = accessPointsOf(g).find((x) => x.id === 'access-12'), r = G.radius(op); // (4, 20), a wall along x = 4
  op.x = d.x - 2.2; op.y = d.y;
  G.activate(g, op);
  return { g, op, d, at: { x: d.x - 0.125 - r - 0.2, y: d.y }, end: { x: d.x + 0.125 + r + 0.6, y: d.y } };
}
const state = (g, d) => accessPointsOf(g).find((x) => x.id === d.id).state;

// Closed: the move can't go through it.
{
  const { g, op, d, end } = arena();
  assert.equal(G.doMove(g, op, 'reposition', { pts: [{ x: op.x, y: op.y }, end] }), false);
  assert(op.x < d.x);
}
// Opened at a waypoint: 1AP for the hatchway, then the move goes on through it.
{
  const { g, op, d, at, end } = arena(), ap = op.ap;
  assert(!G.midMoveHatches(g, op, 'reposition', op).some((h) => h.id === d.id), 'too far at the start');
  assert(G.midMoveHatches(g, op, 'reposition', at).some((h) => h.id === d.id), 'within 1" at the waypoint');
  assert.deepEqual(G.midMoveHatches(g, op, 'charge', at), [], 'only Dash or Reposition');
  assert.notEqual(G.doMove(g, op, 'reposition', { pts: [{ x: op.x, y: op.y }, at, end], hatch: { id: d.id, at: 1 } }), false);
  assert.equal(state(g, d), 'open');
  assert(op.x > d.x, 'went through');
  assert.equal(op.ap, ap - 2);
  assert(G.availableActions(g, op).every((a) => a.id !== `twOpen_${d.id}`));
}
// Opened where the move starts.
{
  const { g, op, d, at, end } = arena();
  op.x = at.x;
  assert.notEqual(G.doMove(g, op, 'reposition', { pts: [{ x: op.x, y: op.y }, end], hatch: { id: d.id, at: 0 } }), false);
  assert.equal(state(g, d), 'open');
  assert(op.x > d.x);
}
// Not enough AP for both, or the hatchway too far from the opening point: nothing happens.
{
  const { g, op, d, at, end } = arena();
  op.ap = 1;
  assert.deepEqual(G.midMoveHatches(g, op, 'reposition', at), []);
  assert.equal(G.doMove(g, op, 'reposition', { pts: [{ x: op.x, y: op.y }, at, end], hatch: { id: d.id, at: 1 } }), false);
  assert.equal(state(g, d), 'closed');
  op.ap = 3;
  assert.equal(G.doMove(g, op, 'reposition', { pts: [{ x: op.x, y: op.y }, end], hatch: { id: d.id, at: 0 } }), false);
  assert.equal(state(g, d), 'closed');
  assert.equal(op.ap, 3);
}
console.log('tombworld mid-move hatch ok');
