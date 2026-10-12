import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { moveCtx, findPath, wholeInchPath, clampPath } from '../js/path.js';
import { pathLength } from '../js/geometry.js';
import { renderBoard } from '../js/board.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { MISSIONS } from '../js/missions.js';
function arena() {
  const g = G.newGame({ teams: ['murderwing', 'angels'], ai: null, equip: [[], []] });
  g.terrain = []; g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.cp = [0, 0, 0];
  g.ops.forEach((o, i) => { o.x = 20 + (i % 3) * 3; o.y = 2 + Math.floor(i / 3) * 4; o.placed = true; o.order = 'engage'; });
  const op = g.ops.find((o) => o.tplId === 'mwChampion'); op.x = 3; op.y = 10;
  G.activate(g, op); return { g, op };
}
// Placement reports the entire base footprint, rather than just the clicked centre.
{
  const { g, op } = arena(), large = g.ops.find((o) => o.tplId === 'mwLord');
  g.terrain = [{ kind: 'heavy', x: 7, y: 0, w: 1, h: 9.27 }, { kind: 'heavy', x: 7, y: 10.73, w: 1, h: 11.27 }];
  const p = { x: 7.5, y: 10 };
  assert(moveCtx(g, op).placement(p).ok, '32mm base fits a 1.46 inch gap');
  const blocked = moveCtx(g, large).placement(p);
  assert(!blocked.ok); assert.equal(blocked.terrain.length, 2); assert(!blocked.outside);
  assert(!moveCtx(g, large).free(p), 'diagnostics agree with the placement rule');
  assert(moveCtx(g, large).placement({ x: .5, y: 10 }).outside);
  const other = g.ops.find((o) => o.side === 1); other.x = 5; other.y = 10;
  const overlap = moveCtx(g, op).placement({ x: 5.8, y: 10 });
  assert.equal(overlap.operatives[0].uid, other.uid);
  other.dead = true; assert(moveCtx(g, op).placement({ x: 5.8, y: 10 }).ok);
  const html = renderBoard(g, { path: { pts: [{ x: 3, y: 10 }, p], r: G.radius(large), len: 5, ok: false, placement: blocked }, recent: [], trailLog: [] });
  assert(html.includes('底盤放不下')); assert(html.includes('placement-base')); assert(html.includes('placement-cross'));
  assert.equal((html.match(/class="placement-block"/g) || []).length, 2);
}
// All cover and living bases block endpoints; ordinary movement cannot cut through either.
for (const kind of ['heavy', 'light']) {
  const { g, op } = arena();
  const terrain = { kind, x: 5, y: 9, w: .1, h: 2 }; g.terrain = [terrain];
  const ctx = moveCtx(g, op), r = G.radius(op), clipped = { x: 5 - r + .01, y: 10 };
  assert(!ctx.free(clipped), `${kind}: centre outside cover still overlaps with the base`);
  assert.equal(ctx.placement(clipped).terrain[0], terrain);
  assert(ctx.free({ x: 5 - r, y: 10 }), 'touching without overlap is legal');
  assert.equal(findPath(ctx, clipped), null);
  const ap = op.ap;
  assert.equal(G.doMove(g, op, 'reposition', { pts: [op, clipped] }), false);
  assert.equal(op.ap, ap); assert.equal(op.x, 3);
  // Jump packs may cross cover, but their landing base must be clear.
  assert(ctx.segFree(op, { x: 7, y: 10 }));
  op.counter = true;
  const ground = moveCtx(g, op);
  assert(!ground.segFree(op, { x: 7, y: 10 }));
  const route = findPath(ground, { x: 7, y: 10 });
  assert(route); assert(route.pts.slice(1).every((p, i) => ground.segFree(route.pts[i], p)));
  // A tiny corner overlap between former 0.1-inch samples must also be blocked.
  g.terrain = [{ kind, x: 4.05, y: 10 + r - .0001, w: .001, h: .001 }];
  assert(!moveCtx(g, op).segFree(op, { x: 5, y: 10 }));
}
for (const side of [0, 1]) {
  const { g, op } = arena(), other = g.ops.find((o) => o !== op && o.side === side);
  other.x = 5; other.y = 10;
  const ctx = moveCtx(g, op), p = { x: 5 + G.radius(op) + G.radius(other) - .01, y: 10 };
  assert(!ctx.free(p)); assert.equal(ctx.placement(p).operatives[0].uid, other.uid);
  assert.equal(G.doMove(g, op, 'reposition', { pts: [op, p] }), false);
  op.counter = true; other.y = 10 + G.radius(op) + G.radius(other) - .0001; other.x = 4.05;
  assert(!moveCtx(g, op).segFree(op, { x: 5, y: 10 }));
}
// No legal deployment or NPO spawn space means no forced overlapping placement.
{
  const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, equip: [[], []] });
  g.terrain = [{ kind: 'light', x: 0, y: 0, w: G.BOARD.w, h: G.BOARD.h }];
  G.autoDeployStep(g); assert.equal(g.dep.batch.length, 0);
  G.autoDeploy(g, 0); assert(g.ops.filter((o) => o.side === 0).every((o) => !o.placed && o.x === -99));
  assert.equal(G.startBattle(g), false); assert.equal(g.tp, 0);
  const n = G.newGame({ teams: ['angels', 'kommandos'], mission: 'negotiation', ai: null, equip: [[], []] });
  n.tp = 2; n.terrain = g.terrain;
  MISSIONS.negotiation.onReady(n);
  assert(!n.ops.some((o) => o.side === G.NPO)); assert.deepEqual(n.npoState.reserve, ['archivist']);
  n.terrain = [{ kind: 'light', x: 0, y: 8, w: 3, h: 6 }, { kind: 'light', x: 27, y: 8, w: 3, h: 6 }];
  MISSIONS.negotiation.onReady(n);
  const npo = n.ops.find((o) => o.side === G.NPO);
  assert(npo); assert(moveCtx(n, npo).free(npo));
}
// A mutation cannot enlarge a base into cover or another operative.
for (const blocker of ['cover', 'operative']) {
  const g = G.newGame({ teams: ['chaosCult', 'angels'], ai: null, equip: [[], []] });
  g.terrain = []; g.tp = 2; g.phase = 'strategy'; g.stratStep = 0; g.initiative = 0;
  g.ops.forEach((o, i) => { o.x = 2 + i % 8 * 3; o.y = 2 + Math.floor(i / 8) * 4; o.placed = true; });
  const op = g.ops.find((o) => o.tplId === 'ctDevotee'); op.tplId = 'ctMutant'; op.x = 10; op.y = 17;
  if (blocker === 'cover') g.terrain = [{ kind: 'light', x: 10.6, y: 16, w: 1, h: 2 }];
  else { const other = g.ops.find((o) => o.side === 1); other.x = 10 + G.radius(other) + .6; other.y = 17; }
  assert(moveCtx(g, op).free(op));
  G.finishPloys(g); G.finishPloys(g);
  assert.equal(op.tplId, 'ctMutant'); assert(moveCtx(g, op).free(op));
}
// Preserve freely chosen fractional endpoints; round up only the movement cost.
for (const [distance, expected] of [[.3, 1], [1.3, 2], [1.8, 2], [3.00000000001, 3], [7.2, 6]]) {
  const { g, op } = arena(), ctx = moveCtx(g, op);
  const raw = { pts: [{ x: op.x, y: op.y }, { x: op.x + distance, y: op.y }] };
  const path = wholeInchPath(ctx, raw, 6);
  assert.equal(path.len, expected); assert(Math.abs(pathLength(path.pts) - Math.min(distance, 6)) < 1e-6);
  assert.deepEqual(wholeInchPath(ctx, path, 6), path, 'confirmation cannot change the preview');
  G.doMove(g, op, 'reposition', raw);
  assert(Math.abs(op.x - 3 - Math.min(distance, 6)) < 1e-6); assert.equal(op.acted.movedDist, expected);
  assert.equal(g.trailLog.at(-1).len, expected);
  assert(g.log.at(-1).msg.zh.includes(`${expected}"`));
  assert(!g.log.at(-1).msg.zh.includes('.3'));
}
// Over-budget paths are clamped; destinations inside the budget are never extended.
{
  const { g, op } = arena();
  g.terrain = [{ kind: 'heavy', x: 7.5, y: 9, w: 1, h: 2 }];
  const ctx = moveCtx(g, op), path = clampPath(ctx, { pts: [{ x: 3, y: 10 }, { x: 7.2, y: 10 }], len: 4.2 }, 3);
  assert(path); assert.equal(path.len, 3); assert.equal(path.pts.at(-1).x, 6);
  assert(ctx.free(path.pts.at(-1)));
  assert.equal(wholeInchPath(ctx, { pts: [{ x: 3, y: 10 }, { x: 3.3, y: 10 }] }, .5), null);
}
// Turns and wire costs round up the total once, including remaining movement limits.
{
  const { g, op } = arena();
  const path = wholeInchPath(moveCtx(g, op), { pts: [{ x: 3, y: 10 }, { x: 4, y: 10 }, { x: 4, y: 11.3 }] }, 6);
  assert.equal(path.len, 3); assert(Math.abs(pathLength(path.pts) - 2.3) < 1e-6);
  const shortTurns = wholeInchPath(moveCtx(g, op), { pts: [{ x: 3, y: 10 }, { x: 3.3, y: 10 }, { x: 3.3, y: 10.3 }] }, 6);
  assert.equal(shortTurns.len, 1, 'round the complete 0.6-inch route once, rather than each leg');
  const basic = G.living(g, 1)[0]; basic.x = 3; basic.y = 5; basic.counter = true;
  g.terrain = [{ kind: 'wire', x: 4.5, y: 4, w: .1, h: 2 }];
  const wire = wholeInchPath(moveCtx(g, basic), { pts: [basic, { x: 6, y: 5 }] }, 3);
  assert.equal(wire.len, 3); assert.equal(pathLength(wire.pts), 2);
  assert.deepEqual(wholeInchPath(moveCtx(g, basic), wire, 3), wire, 'wire costs are not added twice on confirmation');
}
// Zero-length and invalid placements cost no AP; fractional endpoints need not fit a full inch.
{
  const { g, op } = arena(), ap = op.ap;
  assert.equal(G.doMove(g, op, 'reposition', { pts: [op, { x: op.x, y: op.y }], len: 0 }), false);
  assert.equal(op.ap, ap); assert.equal(op.x, 3);
  g.terrain = [{ kind: 'heavy', x: 4.2, y: 9, w: 1, h: 2 }];
  assert(moveCtx(g, op).free({ x: 3.3, y: 10 }), 'the fractional endpoint fits');
  assert.equal(G.doMove(g, op, 'reposition', { pts: [{ x: 3, y: 10 }, { x: 4, y: 10 }], len: 1 }), false, 'the base cannot fit at the chosen endpoint');
  assert.equal(op.ap, ap); assert.equal(op.x, 3); assert(!g.trailLog?.length);
  assert.notEqual(G.doMove(g, op, 'reposition', { pts: [{ x: 3, y: 10 }, { x: 3.3, y: 10 }], len: .3 }), false);
  assert.equal(op.x, 3.3); assert.equal(op.acted.movedDist, 1); assert.equal(op.ap, ap - 1);
}
let seed = 95041;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
for (const teams of [['angels', 'kommandos'], ['deathwatch', 'murderwing'], ['mandrakes', 'hernkynYaegirs']]) {
  const g = G.newGame({ teams, ai: null, equip: [[], []] });
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g); let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 3500) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { aiStrategy(g, G.ployChooser(g)); G.finishPloys(g); }
    else if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
    else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    assert((g.trailLog || []).every((e) => Number.isInteger(e.len)), 'AI and free movements must record whole-inch costs');
    assert(g.ops.filter((o) => !o.dead && o.placed && !o.reserve).every((o) => moveCtx(g, o).free(o)), 'battle units never overlap cover or living bases');
  }
  assert(steps < 3500, `stalled: ${teams}`);
  console.log(`${teams.join(' vs ')}: whole-inch movement costs passed (${steps} steps)`);
}
console.log('movement placement, cost rounding, limits and rendering passed');
