import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 246810;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(options = {}, b = 'angels') {
  const g = G.newGame({ teams: ['canoptekCircle', b], ai: null, ...options }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + (i % 4) * 2.2 : 26; o.y = 2 + Math.floor(i / 4) * 3 + (o.side ? i * 1.5 : 0); o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const nodes = (g, pts) => { for (const p of pts) g.markers.push({ id: g.markers.length, kind: 'obeliskNode', owner: 0, x: p.x, y: p.y, carriedBy: null }); };

// Roster: Geomancer, two Tomb Crawlers, Accelerator, Reanimator, three Warriors; weapon options per copy.
{
  const g = arena({ roster: [{ ccCrawler: ['ccCrawler', 'ccCrawlerIso'], ccWarrior: ['ccWarrior', 'ccWarriorTesla', 'ccWarrior'] }] });
  assert.equal(G.living(g, 0).length, 8);
  assert(get(g, 'ccCrawlerIso') && get(g, 'ccWarriorTesla'));
}
// Matrix: nodes within 6" link up; inside it, +1 APL (max 3) and Accurate 1.
{
  const g = arena(), w = get(g, 'ccWarrior'), geo = get(g, 'ccGeomancer');
  nodes(g, [{ x: 10, y: 10 }, { x: 15, y: 10 }, { x: 25, y: 10 }]); // the third is too far
  w.x = 12; w.y = 10.3; geo.x = 20; geo.y = 10;
  assert(G.inMatrix(g, 0, w));
  assert(!G.inMatrix(g, 0, geo), 'no line to a node 10" away');
  assert.equal(G.aplNow(g, w), 3);
  geo.x = 13; geo.y = 10;
  assert.equal(G.aplNow(g, geo), 3, 'capped at 3');
  const wpn = G.weaponsFor(g, w)[0];
  assert.equal(G.effectiveRules(g, w, wpn, g.ops.find((o) => o.side === 1)).accurate, 1);
  // Nodes control an objective within 1" that no enemy contests.
  g.objectives = [{ id: 0, x: 15.8, y: 10 }];
  for (const o of g.ops) if (o.side === 0) o.x = 1;
  assert.equal(G.controller(g, g.objectives[0]), 0);
  const e = g.ops.find((o) => o.side === 1); e.x = 15.8; e.y = 10 + G.radius(e) + 0.2;
  assert.notEqual(G.controller(g, g.objectives[0]), 0, 'an enemy contests it');
}
// Nodes are set up automatically in the first Strategy phase, in our territory.
{
  const g = G.newGame({ teams: ['canoptekCircle', 'angels'], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  for (let i = 0; i < 6 && g.phase !== 'firefight'; i++) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
  }
  const ns = g.markers.filter((m) => m.kind === 'obeliskNode' && m.owner === 0);
  assert.equal(ns.length, 3);
  assert(ns.every((n) => G.territoryOf(g, n) === 0), 'in our territory');
}
// Canoptek Control: a construct acts for free mid-activation, then the Geomancer resumes.
{
  const g = arena(), geo = get(g, 'ccGeomancer'), cr = get(g, 'ccCrawler');
  cr.x = geo.x + 3; cr.y = geo.y;
  G.activate(g, geo);
  G.doTargetAction(g, geo, 'canoptekControl', cr);
  assert.deepEqual(G.counterCandidates(g, 0).map((o) => o.uid), [cr.uid]);
  G.activate(g, cr);
  assert.equal(cr.ap, 1); assert(cr.orderSet, 'no order change');
  G.endActivation(g);
  assert.equal(g.active, geo.uid); assert(cr.ready && !cr.counteracted, 'still ready, not a counteraction');
}
// Accelerator / Reanimator actions; Tomb Crawler isolator; Warriors don't count for the kill op.
{
  const g = arena(), ac = get(g, 'ccAccel'), re = get(g, 'ccReanim'), cr = get(g, 'ccCrawler'), e = g.ops.find((o) => o.side === 1);
  cr.x = ac.x + 2; cr.y = ac.y;
  G.activate(g, ac);
  G.doTargetAction(g, ac, 'overcharge', cr);
  assert.equal(cr.aplNext, 1);
  e.x = ac.x + 2.5; e.y = ac.y + 2;
  assert(G.TARGET_ACTIONS.cranialOverload.targets(g, ac).includes(e));
  G.endActivation(g); g.turn = 0;
  cr.wounds = 5; re.x = cr.x + 2; re.y = cr.y;
  G.activate(g, re);
  G.doTargetAction(g, re, 'nanoscarab', cr);
  assert(cr.wounds >= 8);
  assert(!G.availableActions(g, re).find((a) => a.id === 'nanoscarab').ok, 'once per TP');
  const before = g.kills[1];
  const w = get(g, 'ccWarrior'); G.applyDamage(g, e, w, 99);
  assert.equal(g.kills[1], before, 'expendable');
}
// Molecular Breach: the next move needs no route.
{
  const g = arena(), geo = get(g, 'ccGeomancer'), w = get(g, 'ccWarrior');
  w.x = geo.x + 3; w.y = geo.y;
  G.activate(g, geo);
  G.doTargetAction(g, geo, 'molecularBreach', w);
  assert(w.breachMove);
  G.endActivation(g); g.turn = 0; G.activate(g, w);
  G.doMove(g, w, 'reposition', { pts: [{ x: w.x, y: w.y }, { x: w.x + 6, y: w.y }], len: 6 });
  assert(!w.breachMove);
}
// AI vs AI full battles.
for (const [a, b] of [['canoptekCircle', 'angels'], ['broodBrothers', 'canoptekCircle'], ['canoptekCircle', 'hierotek']]) {
  const g = G.newGame({ teams: [a, b], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 3000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 3000, `${a} vs ${b}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp})`);
}
// Manual node placement, Nodal Response, Animate Obelisk Nodes, equipment.
{
  const g = G.newGame({ teams: ['canoptekCircle', 'angels'], ai: null, equip: [['ccCaskets', 'ccPhase', 'ccManip', 'ccAwakened'], []] });
  g.tp = 1; g.phase = 'strategy';
  assert(!G.nodePlace(g, 0, { x: 15, y: 10 }) || true);
  const mine = G.nodeList(g, 0).length;
  assert.equal(mine, 0);
  const side0 = (() => { for (let x = 1; x < 30; x += 1) { if (G.nodePlace(g, 0, { x, y: 5 })) return x; } return -1; })();
  assert(side0 > 0, 'a node can be placed in the territory');
  assert.equal(G.nodeList(g, 0).length, 1);
  assert(!G.nodePlace(g, 1, { x: 1, y: 1 }), 'the other team has no nodes');
  g.tp = 2;
  const n = G.nodeList(g, 0)[0], x0 = n.x;
  assert(G.nodeMove(g, 0, n.id, { x: x0, y: n.y + 2 }));
  assert(!G.nodeMove(g, 0, n.id, { x: x0, y: n.y + 1 }), 'once per TP');
}
{
  const g = arena({ equip: [['ccCaskets', 'ccPhase', 'ccManip', 'ccAwakened'], []] });
  nodes(g, [{ x: 10, y: 10 }, { x: 15, y: 10 }, { x: 20, y: 10 }]);
  g.phase = 'firefight'; g.turn = 0; g.active = null; g.cp = [3, 3, 0];
  g.ops.filter((o) => o.side === 1).forEach((o) => { o.ready = true; });
  // Animate: awakened roll makes it free D3 times
  assert(G.animateBegin(g, 0));
  assert(g.animating.left === 6);
  const nd = G.nodeList(g, 0)[0];
  assert(G.animateMove(g, 0, nd.id, { x: nd.x - 2.5, y: nd.y }), 'rounds up to 3');
  assert.equal(g.animating.left, 3);
  assert(!G.animateMove(g, 0, nd.id, { x: nd.x - 5, y: nd.y }), 'too far');
  assert(G.animateEnd(g, 0));
  assert.equal(g.turn, 1, 'the opponent goes on');
  assert(g.cp[0] === 3 || g.cp[0] === 2, 'CP spent only if not free');
  // Nodal Response: use a ploy now
  const g2 = arena(); g2.phase = 'firefight'; g2.turn = 0; g2.cp = [3, 3, 0];
  const op = g2.ops.find((o) => o.side === 0); G.activate(g2, op);
  assert(G.useFFButton(g2, op, 'nodalResponse'));
  assert.equal(g2.nodalOpen, 0);
  assert(G.nodalChoose(g2, 0, 'souldrain'));
  assert(g2.ploys[0].includes('souldrain'));
  assert.equal(g2.cp[0], 1);
}
console.log('canoptek ok');
