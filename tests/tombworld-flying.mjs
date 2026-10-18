import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { moveCtx } from '../js/path.js';

// Tomb World walls, end pillars and closed hatchways can't be flown over; its light cover (C1–C5) can.
const g = G.newGame({ teams: ['hearthkyn', 'angels'], ai: null, equip: [[], []], map: 'tombworld-1' });
const jp = g.ops.find((o) => o.side === 0 && G.tpl(o).jumpPack), walker = g.ops.find((o) => o.side === 0 && !G.tpl(o).jumpPack);
assert(jp && walker);
g.ops = [jp, walker];
const across = (t) => {
  const vertical = t.w < t.h, cx = t.x + t.w / 2, cy = t.y + t.h / 2;
  return vertical ? [{ x: t.x - 1, y: cy }, { x: t.x + t.w + 1, y: cy }] : [{ x: cx, y: t.y - 1 }, { x: cx, y: t.y + t.h + 1 }];
};
const wall = g.terrain.find((t) => t.twWall && !t.role && t.component === 'B4');
const pillar = g.terrain.find((t) => t.twWall && t.role === 'pillar');
const hatch = g.terrain.find((t) => t.twWall && t.role === 'hatch');
const light = g.terrain.find((t) => t.component === 'C1');
for (const t of [wall, pillar, hatch]) {
  const [a, b] = across(t);
  jp.x = a.x; jp.y = a.y;
  assert(!moveCtx(g, jp).segFree(a, b), `flying over ${t.component} ${t.role || 'wall'}`);
  walker.x = a.x; walker.y = a.y;
  assert(!moveCtx(g, walker).segFree(a, b), `climbing over ${t.component} ${t.role || 'wall'}`);
}
{
  const [a, b] = across(light);
  jp.x = a.x; jp.y = a.y;
  const ctx = moveCtx(g, jp);
  assert(ctx.segFree(a, b));
  assert.equal(ctx.extra([a, b]), 0); // flying: no climb
  walker.x = a.x; walker.y = a.y;
  assert(moveCtx(g, walker).segFree(a, b));
  assert(moveCtx(g, walker).extra([a, b]) >= 2); // walking: climbs it
}
console.log('tombworld-flying ok');
