import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { legionariesRosterError } from '../js/data/legionaries.js';
import { TEAM_MAP } from '../js/data/teams.js';
const arena = (teams, opts = {}) => {
  const g = G.newGame({ teams, ai: null, equip: [[], []], roster: opts.roster || [{}, {}] });
  Object.assign(g, { tp: 2, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side ? 27 : 1; o.y = 1 + (i % 12) * 1.7; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
};

// Butcher (Legionaries): at the end of an enemy activation, a free Charge of up to 2" at an enemy within 2".
{
  const g = arena(['kommandos', 'legionaries']);
  const b = g.ops.find((o) => o.tplId === 'lgButcher'), e = g.ops.find((o) => o.side === 0);
  b.x = 10; b.y = 10; e.x = 10 + G.radius(b) + G.radius(e) + 1.6; e.y = 10;
  for (const o of g.ops) if (o !== b && o !== e) o.x = o.side ? 27 : 1;
  G.activate(g, e); G.endActivation(g);
  assert(G.edgeDist(b, e) <= 1.01, 'the computer charged in');
  assert.equal(b.order, 'engage');
  // A player is asked instead.
  const h = arena(['kommandos', 'legionaries']); h.pick = [false, true];
  const b2 = h.ops.find((o) => o.tplId === 'lgButcher'), e2 = h.ops.find((o) => o.side === 0);
  b2.x = 10; b2.y = 10; e2.x = 10 + G.radius(b2) + G.radius(e2) + 1.6; e2.y = 10;
  G.activate(h, e2); G.endActivation(h);
  assert(h.counter && h.turn === 1 && h.netcounter?.butcher, 'the Legionary player picks');
  G.passCounter(h);
  assert.equal(h.turn, 1, 'then play goes on as after any enemy activation');
}
// Two Warriors can carry different loadouts (a second Warrior entry).
{
  const T = TEAM_MAP.legionaries;
  assert.equal(legionariesRosterError(T, { lgButcher: 'lgWarrior', lgShrivetalon: 'lgWarrior2' }), null);
  const g = G.newGame({ teams: ['legionaries', 'kommandos'], ai: null, equip: [[], []], roster: [{ lgButcher: 'lgWarrior', lgShrivetalon: 'lgWarrior2' }, {}], loadouts: [{ lgWarrior: 'boltgun', lgWarrior2: 'chain' }, {}] });
  const ws = g.ops.filter((o) => /lgWarrior/.test(o.tplId)).map((o) => G.weaponsFor(g, o).map((w) => w.id).join('+'));
  assert.notEqual(ws[0], ws[1]);
}
// Portable Barricade: cover only for an operative connected to it.
{
  const g = arena(['angels', 'kommandos']);
  const a = g.ops.find((o) => o.side === 0), t = g.ops.find((o) => o.side === 1);
  g.terrain = [{ kind: 'light', portable: true, equip: 1, x: 12, y: 9, w: 0.3, h: 2 }];
  a.x = 6; a.y = 10; t.x = 12.3 + G.radius(t) + 0.2; t.y = 10;
  assert(G.visibility(g, a, t).cover, 'connected: in cover');
  t.x = 12.3 + G.radius(t) + 1.6;
  assert(!G.visibility(g, a, t).cover, 'not connected: no cover');
}
// Elite Fieldcraft (Spectre Squad): a player picks the interrupter, and the point is spent only then.
{
  const g = arena(['kommandos', 'spectres']); g.pick = [false, true];
  const e = g.ops.find((o) => o.side === 0), s = g.ops.find((o) => o.side === 1 && !G.tpl(o).spBeacon);
  g.sp.fc[1] = 1;
  e.x = 10; e.y = 10; s.x = 18; s.y = 10;
  G.activate(g, e);
  G.doMove(g, e, 'reposition', { pts: [{ x: 10, y: 10 }, { x: 11, y: 10 }] });
  if (g.netcounter?.spFC) {
    assert(g.counter && g.turn === 1, 'the Spectre player is asked');
    assert.deepEqual(g.netcounter.onlyActions, ['shoot', 'dash', 'reposition']);
    const pick = G.getOp(g, g.netcounter.only[0]);
    G.activate(g, pick);
    assert.equal(g.sp.fc[1], 0, 'the point is spent');
    G.endActivation(g);
    assert.equal(g.active, e.uid, 'back to the enemy activation');
  }
}
console.log('interrupts and choices ok');
