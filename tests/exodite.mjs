import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 52025;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(b = 'angels') {
  const g = G.newGame({ teams: ['exoditeDragonMasters', b], ai: null }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 3 + i * 4 : 27; o.y = o.side === 0 ? 4 : 2 + i * 1.5; o.placed = true; o.reserve = false; o.order = 'engage'; o.facing = 0; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);

// Five operatives: three riders that start in reserve, two Drakolithes that deploy normally.
{
  const g = G.newGame({ teams: ['exoditeDragonMasters', 'angels'], ai: null });
  assert.equal(G.living(g, 0).length, 5);
  assert.equal(g.ops.filter((o) => o.side === 0 && o.reserve).length, 3);
  assert(g.ops.filter((o) => o.side === 0 && G.isMounted(o)).every((o) => o.loadout.includes('+')), 'two upgrades each');
}
// Sprint: straight forwards up to 9" (pivot 45° first) or backwards up to 3"; SPEED from how far it went.
{
  const g = arena(), r = get(g, 'edClanblade');
  r.x = 10; r.y = 10; r.facing = 0;
  G.activate(g, r);
  assert(G.availableActions(g, r).some((a) => a.id === 'edSprint' && a.ok));
  assert(!G.availableActions(g, r).some((a) => a.id === 'reposition'), 'no normal moves');
  assert(G.sprintCheck(g, r, { x: 19, y: 10 }).ok, '9" forwards');
  assert(!G.sprintCheck(g, r, { x: 20, y: 10 }).ok, 'not 10"');
  assert(G.sprintCheck(g, r, { x: 10 + 5 * Math.cos(0.7), y: 10 + 5 * Math.sin(0.7) }).ok, 'within 45°');
  assert(!G.sprintCheck(g, r, { x: 10 + 5 * Math.cos(1.0), y: 10 + 5 * Math.sin(1.0) }).ok, 'beyond 45°');
  assert(G.sprintCheck(g, r, { x: 7, y: 10 }).ok, '3" backwards');
  assert(!G.sprintCheck(g, r, { x: 6, y: 10 }).ok, 'not 4" backwards');
  assert(G.doSprint(g, r, { x: 17, y: 10 }));
  assert.equal(r.speed, 7, 'SPEED 7+');
  assert.equal(G.speedOf(g, r), 7);
  assert(!G.availableActions(g, r).find((a) => a.id === 'edSprint').ok, 'once per activation');
  r.acted.sprint = 0;
  assert(!G.sprintCheck(g, r, { x: 23, y: 10 }).ok, '12" per TP');
}
// Heavy terrain blocks a Sprint; equipment terrain it rides through is removed.
{
  const g = arena(), r = get(g, 'edLeystalker');
  r.x = 10; r.y = 10; r.facing = 0;
  g.terrain = [{ kind: 'heavy', x: 13, y: 9, w: 1, h: 2 }];
  G.activate(g, r);
  assert(!G.sprintCheck(g, r, { x: 17, y: 10 }).ok, 'blocked by Heavy terrain');
  g.terrain = [{ kind: 'light', x: 13, y: 9.5, w: 0.5, h: 1, equip: 1 }];
  assert(G.doSprint(g, r, { x: 17, y: 10 }));
  assert.equal(g.terrain.length, 0, 'equipment terrain smashed');
}
// Turn pivots 45° at most; riders in reserve enter touching their killzone edge facing in.
{
  const g = arena(), r = get(g, 'edStonesinger');
  r.x = 10; r.y = 10; r.facing = 0;
  assert(Math.abs(G.turnFacing(r, { x: 10, y: 20 }) - Math.PI / 4) < 1e-9);
  r.reserve = true; r.x = -99; r.y = -99;
  G.activate(g, r);
  const ap = r.ap;
  assert(G.enterFromReserve(g, r, { x: 5, y: 8 }));
  assert(!r.reserve && r.x > 0 && r.ap === ap - 1);
}
// Riders: at most 3 AP per activation and activate twice per TP.
{
  const g = arena(), r = get(g, 'edClanblade');
  G.activate(g, r);
  assert(r.ap <= 3, 'at most 3 AP');
  G.endActivation(g);
  assert(r.ready, 'ready for a second activation');
}
// AI vs AI full battles.
for (const [a, b] of [['exoditeDragonMasters', 'angels'], ['kasrkin', 'exoditeDragonMasters'], ['exoditeDragonMasters', 'chaosCult']]) {
  const g = G.newGame({ teams: [a, b], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 4000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 4000, `${a} vs ${b}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  const edm = g.teams.indexOf('exoditeDragonMasters');
  assert(g.ops.filter((o) => o.side === edm && G.isMounted(o)).every((o) => !o.reserve || o.dead), 'riders entered');
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp}, VP ${g.vp[0]}-${g.vp[1]})`);
}
console.log('exodite ok');
