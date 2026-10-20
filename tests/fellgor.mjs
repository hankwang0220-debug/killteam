import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { fellgorRosterError } from '../js/data/fellgor.js';
let seed = 9753;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.fellgor;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['fellgor', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: Ironhorn options, Warriors (repeatable), each other operative once.
{
  assert.equal(fellgorRosterError(T, {}), null);
  assert.equal(fellgorRosterError(T, { vandal: 'fgWarriorB', shaman: 'fgWarriorB' }), null, 'Warriors repeat');
  assert(fellgorRosterError(T, { vandal: 'mangler' }), 'two Manglers');
  const g = arena({ roster: { vandal: 'fgWarriorC' }, loadouts: { ironhorn: 'plasma' } });
  assert(G.weaponsFor(g, get(g, 'ironhorn')).some((w) => w.id === 'plasmaPistolFGx'));
  const w = get(g, 'fgWarriorC'); w.frenzy = true; w.wounds = 0;
  assert(!G.injuredPenalty(g, w), 'Warrior Frenzy: not injured');
}

// Cleaver Flurry: a free Reposition 2" further, D3+1 to each enemy passed.
{
  const g = arena(), fx = get(g, 'fluxbray'), e = foe(g);
  place(fx, 10, 10); place(e, 13, 11.6); G.activate(g, fx);
  assert(G.availableActions(g, fx).find((a) => a.id === 'fgFlurry').ok);
  G.doSelfAction(g, fx, 'fgFlurry');
  assert.equal(G.moveAllowance(g, fx, 'reposition'), 8, '6" + 2"');
  assert.equal(G.actionCost(g, fx, 'reposition'), 0, 'free');
  const before = e.wounds;
  assert(G.doMove(g, fx, 'reposition', { pts: [{ x: 10, y: 10 }, { x: 16, y: 10 }], len: 6 }));
  assert(e.wounds < before, 'the enemy passed takes damage');
}

// Uncompromising Attack: engaged — a free Fight and a free autopistol Shoot at the enemy in its control range.
{
  const g = arena(), gn = get(g, 'gnarlscar'), e = foe(g);
  place(gn, 10, 10); place(e, 11.4, 10); G.activate(g, gn);
  G.doSelfAction(g, gn, 'fgUncomp');
  assert(G.availableActions(g, gn).find((a) => a.id === 'shoot').ok, 'can shoot while engaged');
  const pistol = G.weaponsFor(g, gn).find((w) => w.id === 'autopistolFG');
  assert(G.shootCheck(g, gn, e, pistol).ok);
  assert.equal(G.actionCost(g, gn, 'shoot'), 0); assert.equal(G.actionCost(g, gn, 'fight'), 0);
}

// Pox Bomb: the Toxhorn's stun grenade also hurts on a 3+.
{
  const g = arena(), t = get(g, 'toxhorn'), e = foe(g);
  place(t, 10, 10); place(e, 14, 10); G.activate(g, t);
  assert(G.availableActions(g, t).find((a) => a.id === 'stunGrenade').ok);
  G.doTargetAction(g, t, 'stunGrenade', e);
  assert(g.log.some((l) => /Stun Grenade/.test(JSON.stringify(l))));
}

// Bloodsense: a kill in its control range lets a nearby ready friend activate next.
{
  const g = arena(), m = get(g, 'mangler'), v = get(g, 'vandal'), e = foe(g);
  place(m, 10, 10); place(e, 11.4, 10); place(v, 12.5, 11.5); G.activate(g, m);
  e.wounds = 1; G.applyDamage(g, m, e, 1);
  assert.equal(m.wcHerd, v.uid, 'Bloodsense picked the Vandal');
  G.endActivation(g);
  assert.deepEqual(g.chain?.uids, [v.uid]);
}

// Call the Attack: offered in each Strategy phase while the Ironhorn has no Frenzy token (the computer dashes).
{
  const g = arena(); g.phase = 'initiative'; g.initLocked = true; g.initiative = 0;
  const h = get(g, 'ironhorn'), d = get(g, 'deathknell'); place(h, 5, 10); place(d, 6.5, 10);
  const x0 = d.x; G.startStrategy(g);
  assert(g.log.some((l) => /Call the Attack/.test(JSON.stringify(l))), 'free Dashes');
  void x0;
}

// AI vs AI full battles.
for (const [a, b] of [['fellgor', 'kommandos'], ['angels', 'fellgor']]) {
  const fg = a === 'fellgor' ? 0 : 1;
  const roster = [{}, {}]; roster[fg] = { vandal: 'fgWarriorB', herdgoad: 'fgWarriorC' };
  const g = G.newGame({ teams: [a, b], ai: null, equip: [[], []], roster });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 4000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 4000, `${a} vs ${b}: simulation stalled`);
  console.log(`${a} vs ${b}: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('fellgor ok');
