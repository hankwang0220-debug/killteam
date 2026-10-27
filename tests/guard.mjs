import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { dwAfterAction } from '../js/deathwatch.js';
const arena = (cq = true) => {
  const g = G.newGame({ teams: ['kommandos', 'angels'], ai: null, equip: [[], []], roster: [{}, {}] });
  Object.assign(g, { tp: 2, phase: 'firefight', turn: 1, terrain: [], cp: [3, 3, 0], closeQuarters: cq });
  g.ops.forEach((o, i) => { o.x = o.side ? 29 : 1; o.y = 1 + (i % 12) * 1.7; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
};
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const has = (g, o, id) => G.availableActions(g, o).some((a) => a.id === id);
const gunner = (g) => g.ops.find((o) => o.side === 1 && o.tplId === 'gunner') || g.ops.find((o) => o.side === 1 && G.tpl(o).weapons.some((w) => w.type === 'ranged'));
const boy = (g) => g.ops.find((o) => o.side === 0 && o.tplId === 'boy') || g.ops.find((o) => o.side === 0);
const step = (g, o, x) => G.doMove(g, o, 'reposition', { pts: [{ x: o.x, y: o.y }, { x, y: o.y }] });

// The Guard action: only in close quarters, Engage order, not engaged; 1AP, treated as a Shoot action.
{
  const g0 = arena(false), a0 = gunner(g0);
  G.activate(g0, a0);
  assert(!has(g0, a0, 'guard'), 'not outside close quarters');
  const g = arena(), a = gunner(g);
  a.order = 'conceal'; G.activate(g, a);
  assert(has(g, a, 'guard') && !can(g, a, 'guard'), 'not with a Conceal order');
  G.endActivation(g);
  const b = g.ops.find((o) => o.side === 1 && o !== a && o.ready); b.order = 'engage'; g.turn = 1; G.activate(g, b);
  assert(G.tpl(b).weapons.some((w) => w.type === 'ranged') ? can(g, b, 'guard') : true);
  G.doSelfAction(g, b, 'guard');
  assert(b.dwGuard, 'on guard');
  assert.equal(b.ap, G.tpl(b).apl - 1, '1AP');
  assert.equal(b.acted.shoot, 1, 'it counts as a Shoot action (Astartes may still take their second one)');
}
// The computer's operative on guard interrupts with a free shot after an enemy action, then can't counteract this turning point.
{
  const g = arena(), a = gunner(g), e = boy(g);
  for (const o of g.ops) if (o !== a && o !== e) o.dead = true;
  a.x = 20; a.y = 10; a.dwGuard = true; a.ready = false; e.x = 4; e.y = 10;
  g.turn = 0; G.activate(g, e);
  const w0 = e.wounds;
  step(g, e, 6);
  assert(!a.dwGuard, 'it came off guard');
  assert(e.acted.dwGuardInterrupted, 'it interrupted this activation');
  assert(e.wounds <= w0);
  assert.equal(a.noCounterTP, g.tp);
  assert(!G.counterCandidates(g, 1).includes(a), 'no counteract after interrupting');
}
// A player chooses: pass, and a guard within the enemy's control range stands down; one further away stays on guard.
{
  const g = arena(), [a, b] = g.ops.filter((o) => o.side === 1 && G.tpl(o).weapons.some((w) => w.type === 'ranged')), e = boy(g);
  for (const o of g.ops) if (![a, b, e].includes(o)) o.dead = true;
  g.pick = [false, true];
  e.x = 10; e.y = 10; a.x = 10 + G.radius(e) + G.radius(a) + 0.5; a.y = 10; b.x = 24; b.y = 16;
  a.dwGuard = true; b.dwGuard = true; a.ready = b.ready = false;
  g.turn = 0; G.activate(g, e);
  dwAfterAction(g, e); // (after any action of the enemy's)
  assert(g.netcounter?.guard, 'the player is asked');
  assert.equal(g.turn, 1);
  G.passCounter(g);
  assert(!a.dwGuard, 'the guard in its control range stands down');
  assert(b.dwGuard, 'the other stays on guard');
  assert.equal(g.active, e.uid, 'back to the enemy activation');
}
// A player picks the guard: a point-blank shot at the enemy in its control range (Hit worsened by 1), then it can't retaliate.
{
  const g = arena(), a = gunner(g), e = boy(g);
  for (const o of g.ops) if (o !== a && o !== e) o.dead = true;
  g.pick = [false, true];
  e.x = 10; e.y = 10; a.x = 10 + G.radius(e) + G.radius(a) + 0.5; a.y = 10; a.dwGuard = true; a.ready = false;
  g.turn = 0; G.activate(g, e);
  dwAfterAction(g, e); // (after any action of the enemy's)
  assert(g.netcounter?.guard);
  G.activate(g, a);
  assert(a.pointBlank, 'point-blank');
  assert(can(g, a, 'shoot'), 'it can shoot while in the enemy\'s control range');
  const w = G.weaponsFor(g, a).find((x) => x.type === 'ranged' && G.shootCheck(g, a, e, x).ok);
  assert(w, 'the enemy in its control range is a target');
  G.resolveShoot(g, a, w, e);
  assert.equal(a.pbNoRetal, e.uid, 'no retaliating for now');
  G.endActivation(g);
  assert.equal(g.active, e.uid, 'the enemy activation carries on');
  if (!e.dead && e.ap >= 1 && G.availableActions(g, e).find((x) => x.id === 'fight')?.ok) {
    G.startFight(g, e, G.bestMelee(e), a);
    assert.equal(g.fight.D.pool?.dice?.length ?? g.fight.D.dice?.length ?? 0, 0, 'the guard rolls no dice');
    g.fight = null;
  }
  G.endActivation(g);
  assert(!a.pbNoRetal, 'it can retaliate again once that activation ends');
}
console.log('guard ok');
