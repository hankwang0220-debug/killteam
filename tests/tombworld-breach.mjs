import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { accessPointsOf } from '../js/tombworld-access.js';
import { TOMB_WORLD_MAPS } from '../js/tombworld-maps.js';

// A1 walls are breach points: closed (a breach wall in the opening) until the Breach action opens them for good.
for (const map of TOMB_WORLD_MAPS) {
  const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [[], []], map: map.id });
  const bps = accessPointsOf(g).filter((d) => d.kind === 'breachPoint');
  assert.equal(bps.length, map.runs.filter((r) => r.id === 'A1').length, `${map.id}: one per A1 wall`);
  assert(bps.every((d) => d.state === 'closed'));
  assert.equal(g.terrain.filter((t) => t.role === 'breachWall').length, bps.length);
}
// Map 3: the A1 wall at x = 20 between y = 8 and 16.
const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [[], []], map: 'tombworld-3' });
Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, cp: [3, 3, 0] });
g.ops.forEach((o, i) => { o.x = o.side ? 27 : 1; o.y = 1 + i * 1.5; o.placed = true; o.order = 'engage'; o.ready = true; });
const d = accessPointsOf(g).find((x) => x.kind === 'breachPoint' && x.x === 20 && x.y === 12);
assert(d, 'the breach point the user pointed out');
const id = `twBreach_${d.id}`;
const sgt = g.ops.find((o) => o.side === 0 && o.tplId === 'sgt'), r = G.radius(sgt);
const foe = g.ops.find((o) => o.side === 1);
sgt.x = 20 - 0.125 - r - 0.3; sgt.y = 12; foe.x = 20 + 0.125 + G.radius(foe) + 0.3; foe.y = 12;
// Closed: it blocks movement through.
G.activate(g, sgt);
G.doMove(g, sgt, 'reposition', { pts: [{ x: sgt.x, y: sgt.y }, { x: 23, y: 10 }] });
assert(sgt.x < 20, 'a closed breach point is a wall');
sgt.x = 20 - 0.125 - r - 0.3; sgt.y = 12; g.active = null; sgt.acted = {}; G.activate(g, sgt);
const a = G.availableActions(g, sgt).find((x) => x.id === id);
assert(a && a.ok, 'Breach offered within 1"');
assert.equal(a.ap, 2, '2AP for an Intercessor Sergeant');
const ap = sgt.ap, fw = foe.wounds;
const rnd = Math.random; Math.random = () => 0.99; // (the D6 rolls a 6)
G.doMissionAction(g, sgt, id);
Math.random = rnd;
assert.equal(accessPointsOf(g).find((x) => x.id === d.id).state, 'open');
assert.equal(g.terrain.filter((t) => t.hatchId === d.id).length, 0, 'the breach wall is removed');
assert.equal(sgt.ap, ap - 2);
assert.equal(foe.wounds, fw - 3, 'a 6 beyond it: 3 damage');
assert.equal(foe.aplNext, -1, 'and -1 APL');
assert(!G.missionActionsFor(g, 0).includes(id), 'it cannot be closed or breached again');
// Breachers (a grenadier, a mine, a Piercing 2 weapon) pay 1AP — not after shooting or charging, and then no Shoot or Charge.
{
  const h = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [[], []], map: 'tombworld-3' });
  const gren = h.ops.find((o) => o.side === 0 && /Grenadier/.test(G.tpl(o).name.en));
  if (gren) {
    gren.acted = {};
    assert.equal(G.twBreachCost(h, gren), 1);
    gren.acted.shoot = 1;
    assert.equal(G.twBreachCost(h, gren), 2, 'not after shooting');
  }
}
console.log('tombworld breach ok');
