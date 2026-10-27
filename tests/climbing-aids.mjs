import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { moveCtx } from '../js/path.js';

// Ladders (universal equipment): climbing the terrain a ladder leans against, with it in control range, the climb up counts as 1".
{
  const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [['ladders'], []] });
  assert.equal(g.eqDeploy.queues[g.ops[0].side === 0 ? 0 : 0].filter((e) => e.item.kind === 'ladder').length, 2, 'two ladders to set up');
  g.terrain = [{ kind: 'heavy', x: 10, y: 8, w: 0.5, h: 4, height: 3 }];
  g.markers = [];
  const op = g.ops.find((o) => o.side === 0); op.x = 8.5; op.y = 10;
  const pts = [{ x: 8.5, y: 10 }, { x: 12, y: 10 }];
  const without = moveCtx(g, op).climbs(pts);
  g.markers.push({ id: 0, kind: 'ladder', owner: 0, x: 9.7, y: 10 });
  const withLadder = moveCtx(g, op).climbs(pts);
  assert.equal(without, 4, '3" climb: 3 up + 1 drop beyond 2"');
  assert.equal(withLadder, 2, 'with the ladder: 1 up + 1 drop');
  op.x = 8.5; op.y = 13.5; // the ladder out of control range
  assert.equal(moveCtx(g, op).climbs([{ x: 8.5, y: 13.5 }, { x: 8.5, y: 11.5 }, { x: 12, y: 11.5 }]), 4);
  // Placement: against terrain at least 2" tall, in your territory.
  g.phase = 'deploy';
  const z = G.deployZones(g)[0];
  const wallIn = { kind: 'heavy', x: (z.x0 + z.x1) / 2 - 0.25, y: 10, w: 0.5, h: 3, height: 3 };
  g.terrain = [wallIn];
  g.eqDeploy = { turn: 0, done: false, queues: [[{ type: 'marker', item: { kind: 'ladder', owner: 0 } }], []] };
  assert(G.equipmentPlacement(g, { x: wallIn.x - 0.35, y: 11 }), 'against the wall');
  assert(!G.equipmentPlacement(g, { x: wallIn.x - 3, y: 11 }), 'not in the open');
}
// Scout Terrain (Spectre Guide): once per activation, the first 2" of one climb up is ignored on scouted terrain.
{
  const g = G.newGame({ teams: ['spectres', 'kommandos'], ai: null, equip: [[], []] });
  const guide = g.ops.find((o) => o.side === 0 && G.tpl(o).spGuide);
  if (guide) {
    const op = g.ops.find((o) => o.side === 0 && o !== guide);
    g.terrain = [{ kind: 'heavy', x: 14, y: 8, w: 0.5, h: 4, height: 3 }];
    g.markers = []; guide.x = 13; guide.y = 6; op.x = 12.5; op.y = 10;
    const pts = [{ x: 12.5, y: 10 }, { x: 16, y: 10 }];
    assert.equal(moveCtx(g, op).climbs(pts), 2, 'scouted: 3 up - 2 + 1 drop');
    op.acted = { spScoutUsed: true };
    assert.equal(moveCtx(g, op).climbs(pts), 4, 'once per activation');
  }
}
console.log('climbing aids ok');
