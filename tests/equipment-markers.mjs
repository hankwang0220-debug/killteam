import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { accessPointsOf } from '../js/tombworld-access.js';

// Equipment markers (Tripwire, Mines…) can be set up on equipment terrain, either side's; a Tripwire stays more than 2" from access points
// and other markers, wholly within your territory.
const g = G.newGame({ teams: ['ratlings', 'angels'], ai: null, equip: [[], []], map: 'tombworld-3' });
const terr = (x, y) => G.territoryOf(g, { x, y });
// a point well inside player 0's territory, clear of the killzone's terrain and markers
let spot = null;
for (let x = 1; x < 27 && !spot; x += 0.5) for (let y = 1; y < 23 && !spot; y += 0.5) {
  const p = { x, y };
  if (terr(x, y) === 0 && [[2.5, 0], [-2.5, 0], [0, 2.5], [0, -2.5]].every(([dx, dy]) => terr(x + dx, y + dy) === 0)
    && !g.terrain.some((t) => x > t.x - 3 && x < t.x + t.w + 3 && y > t.y - 3 && y < t.y + t.h + 3)
    && ![...g.objectives, ...g.markers].some((m) => Math.hypot(m.x - x, m.y - y) < 3) && !accessPointsOf(g).some((a) => Math.hypot(a.x - x, a.y - y) < 3)) spot = p;
}
assert(spot, 'found a clear spot');
g.phase = 'deploy';
const queue = (item) => { g.eqDeploy = { turn: 0, done: false, queues: [[{ type: 'marker', item: { ...item, owner: 0 } }], []] }; };
// The opponent's light barricade right there.
g.terrain.push({ kind: 'light', equip: 1, x: spot.x - 1.5, y: spot.y - 0.3, w: 3, h: 0.6 });
queue({ kind: 'tripwire' });
assert(G.equipmentPlacement(g, spot), 'a Tripwire on equipment terrain');
queue({ kind: 'mine' });
assert(G.equipmentPlacement(g, spot), 'a mine on the opponent\'s light barricade');
// …but not on the killzone's own terrain.
const wall = g.terrain.find((t) => t.equip == null && t.twWall && terr(t.x + t.w / 2, t.y + t.h / 2) === 0);
if (wall) { queue({ kind: 'mine' }); assert(!G.equipmentPlacement(g, { x: wall.x + wall.w / 2, y: wall.y + wall.h / 2 }), 'not on a wall'); }
// A Tripwire near a door is refused.
const door = accessPointsOf(g).find((a) => terr(a.x - 1, a.y) === 0 || terr(a.x + 1, a.y) === 0);
if (door) {
  queue({ kind: 'tripwire' });
  const near = [{ x: door.x - 1.2, y: door.y }, { x: door.x + 1.2, y: door.y }, { x: door.x, y: door.y - 1.2 }, { x: door.x, y: door.y + 1.2 }].find((p) => terr(p.x, p.y) === 0);
  if (near) assert(!G.equipmentPlacement(g, near), 'more than 2" from access points');
}
// Razor wire costs 2" more to cross.
{
  const h = G.newGame({ teams: ['angels', 'kommandos'], ai: null });
  h.terrain = [{ kind: 'wire', x: 10, y: 9, w: 0.1, h: 2 }];
  const op = h.ops[0]; op.x = 8; op.y = 10;
  const { moveCtx } = await import('../js/path.js');
  assert.equal(moveCtx(h, op).extra([{ x: 8, y: 10 }, { x: 12, y: 10 }]), 2);
}
console.log('equipment markers ok');
