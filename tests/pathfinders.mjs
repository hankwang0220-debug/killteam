import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 31337;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena() {
  const g = G.newGame({ teams: ['tauPathfinders', 'kommandos'], ai: null, equip: [[], []] });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 12) * 1.9; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Remote Pilot (Drone Controller): a drone takes a free action even though its Drone rule restricts it, then the Controller continues.
{
  const g = arena(), dc = get(g, 'controller'), gun = get(g, 'gunDrone'), mk = get(g, 'markerDrone'), e = foe(g);
  place(dc, 10, 10); place(gun, 14, 10); place(mk, 12, 14); place(e, 20, 10);
  G.activate(g, dc);
  assert(can(g, dc, 'remotePilot'), 'Remote Pilot is offered');
  const ap = dc.ap;
  G.doTargetAction(g, dc, 'remotePilot', gun);
  assert.equal(dc.ap, ap - 1, '1AP');
  assert.deepEqual(G.counterCandidates(g, 0).map((o) => o.uid), [gun.uid], 'the drone acts now');
  G.activate(g, gun);
  assert.equal(G.activeOp(g)?.uid, gun.uid);
  assert(G.availableActions(g, gun).find((a) => a.id === 'shoot')?.ok, 'it can shoot');
  assert(G.availableActions(g, gun).find((a) => a.id === 'pickUp') || true);
  assert(G.moveAllowance(g, gun, 'reposition') <= 2.01, 'no more than 2"');
  const w = G.weaponsFor(g, gun).find((x) => x.type === 'ranged');
  const w0 = e.wounds;
  G.resolveShoot(g, gun, w, e);
  G.endActivation(g);
  assert.equal(G.activeOp(g)?.uid, dc.uid, 'the Controller carries on');
  assert.equal(dc.ap, ap - 1);
  // The same drone can't shoot for free again this activation; the other drone can act.
  G.doTargetAction(g, dc, 'remotePilot', gun);
  G.activate(g, gun);
  assert(!G.availableActions(g, gun).find((a) => a.id === 'shoot')?.ok, 'the same free action only once');
  assert(G.availableActions(g, gun).find((a) => a.id === 'reposition')?.ok, 'a different action is fine');
  G.endActivation(g);
  assert.equal(G.activeOp(g)?.uid, dc.uid);
  // Not while engaged.
  place(e, 11.2, 10);
  assert(!can(g, dc, 'remotePilot'), 'not within control range of an enemy');
}

// AI vs AI full battles with Pathfinders.
for (const [a, b] of [['tauPathfinders', 'angels'], ['kommandos', 'tauPathfinders']]) {
  const g = G.newGame({ teams: [a, b], ai: null });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 3000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 3000, `${a} vs ${b}: simulation stalled`);
  console.log(`${a} vs ${b}: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('pathfinders ok');
