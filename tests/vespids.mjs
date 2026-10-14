import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as V from '../js/vespids.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { vespidsRosterError } from '../js/data/vespids.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 97979;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }

function arena(opts = {}) {
  const g = G.newGame({ teams: ['vespids', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], vsCommune: [opts.commune] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = o.side === 0 ? 3 + (i % 6) * 1.6 : 27; o.y = o.side === 0 ? 4 + Math.floor(i / 6) * 2 : 2 + i * 1.8; });
  g.vs.cp = [2, 0];
  return g;
}
const get = (g, id) => g.ops.find((o) => o.side === 0 && o.tplId === id);
const foes = (g) => g.ops.filter((o) => o.side === 1);
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;

// Roster: Strain Leader + Oversight Drone + nine picks (each once except Warriors).
{
  const g = arena(), t = TEAM_MAP.vespids;
  assert.equal(g.ops.filter((o) => o.side === 0).length, 11);
  assert.equal(vespidsRosterError(t, {}), null);
  assert(vespidsRosterError(t, { vsLongsting: ['vsSkyblast'] }), 'two Skyblasts');
  assert.equal(vespidsRosterError(t, { vsLongsting: ['vsWarrior'] }), null, 'Warriors repeat');
  assert.throws(() => G.newGame({ teams: ['vespids', 'angels'], ai: null, roster: [{ vsLongsting: ['vsSkyblast'] }] }));
  assert.equal(t.ops.find((o) => o.id === 'vsDrone').save, 2);
  assert.deepEqual(G.availableActions(g, get(g, 'vsDrone')).map((a) => a.id).sort(), ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'vsGuidance'].sort(), 'the Drone: only its actions');
}

// Communion points: D3 (+1 with the Drone) in the Ready step; Neurostimulant takes the better of two.
{
  const g = arena(); g.vs.cp = [0, 0];
  dice([3], () => V.vsReady(g)); assert.equal(g.vs.cp[0], 3, 'a D6 of 3 → 2, +1 for the Drone');
  const n = arena({ equip: ['vsNeuro'] }); n.vs.cp = [0, 0]; dice([1, 6], () => V.vsReady(n)); assert.equal(n.vs.cp[0], 4, 'the better of two D3, +1');
}

// Shooting: only the closest enemy within 8" unless a point is spent; the point is paid when shooting.
{
  const g = arena(), w = get(g, 'vsWarrior'), [a, b] = foes(g); foes(g).slice(2).forEach((o) => place(o, -99, -99));
  place(w, 10, 10); place(a, 14, 10); place(b, 16, 12); G.activate(g, w);
  assert.deepEqual(V.vsFreeTargets(g, w), [a]);
  const bl = G.weaponsFor(g, w).find((x) => x.id === 'vsBlaster');
  assert(G.shootCheck(g, w, b, bl).ok, 'with a point, another target');
  g.vs.cp[0] = 0; assert(!G.shootCheck(g, w, b, bl).ok, 'without points: only the closest');
  assert(G.shootCheck(g, w, a, bl).ok);
  g.vs.cp[0] = 1; dice([6, 6, 6, 6, 1, 1, 1], () => G.resolveShoot(g, w, bl, b)); assert.equal(g.vs.cp[0], 0, 'a point spent');
  // Warrior Instincts: Accurate 1 without a point spent
  const g2 = arena(), w2 = get(g2, 'vsWarrior'), e2 = foes(g2)[0]; foes(g2).slice(1).forEach((o) => place(o, -99, -99)); place(w2, 10, 10); place(e2, 14, 10); G.activate(g2, w2);
  const b2 = G.weaponsFor(g2, w2).find((x) => x.id === 'vsBlaster'); w2.vsSpentSeq = false;
  assert.equal(G.effectiveRules(g2, w2, b2, e2).accurate, 1);
  // the Strain Leader's first point each activation is free
  const g3 = arena(), l = get(g3, 'vsLeader'); g3.vs.cp[0] = 0; G.activate(g3, l); assert(V.vsCanSpend(g3, l)); assert(V.vsSpend(g3, l, { zh: 'x', en: 'x' })); assert(!V.vsCanSpend(g3, l));
}

// Neutron Charge, Neutron Fragment (stacking), Neutron Fallout (enemy activations only, once per activation), Skytorch Assault.
{
  const g = arena(), w = get(g, 'vsWarrior'), e = foes(g)[0]; foes(g).slice(1).forEach((o) => place(o, -99, -99)); place(w, 5, 10); place(e, 14, 10); G.activate(g, w);
  const bl = G.weaponsFor(g, w).find((x) => x.id === 'vsBlaster');
  assert(!G.effectiveRules(g, w, bl, e).piercing);
  G.doMove(g, w, 'reposition', { pts: [{ x: 5, y: 10 }, { x: 8, y: 10 }], len: 3 });
  assert.equal(G.effectiveRules(g, w, bl, e).piercing, 1, 'Piercing 1 after moving');
  const g2 = arena(), ls = get(g2, 'vsLongsting'), e2 = foes(g2)[0]; foes(g2).slice(1).forEach((o) => place(o, -99, -99)); place(ls, 10, 10); place(e2, 14, 10); e2.wounds = e2.maxW = 40; G.activate(g2, ls);
  const rr = G.weaponsFor(g2, ls).find((x) => x.id === 'vsRailS');
  dice([6, 6, 1, 1, 1, 1, 1], () => G.resolveShoot(g2, ls, rr, e2)); assert.equal(e2.vsFrag[0], 1, 'Neutron Fragment');
  G.endActivation(g2); g2.turn = 0; G.activate(g2, ls); ls.ap = 3; dice([6, 6, 1, 1, 1, 1, 1], () => G.resolveShoot(g2, ls, rr, e2)); assert.equal(e2.vsFrag[0], 2, 'they stack');
  G.endActivation(g2); g2.turn = 1; const hp = e2.wounds; dice([1, 6], () => G.activate(g2, e2)); assert.equal(e2.wounds, hp - 4, 'D3 per token (D6 1 → 1, 6 → 3)');
  // Fallout
  const g3 = arena(), sb = get(g3, 'vsSkyblast'), e3 = foes(g3)[0]; foes(g3).slice(1).forEach((o) => place(o, -99, -99)); place(sb, 10, 10); place(e3, 16, 10); G.activate(g3, sb);
  const gl = G.weaponsFor(g3, sb).find((x) => x.id === 'vsLauncher');
  dice([1, 1, 1, 1, 6, 6, 6], () => G.resolveShoot(g3, sb, gl, e3)); assert(g3.markers.some((m) => m.kind === 'vsFallout'), 'a Fallout marker even when it misses');
  G.endActivation(g3); g3.turn = 1; const h3 = e3.wounds; dice([3], () => G.activate(g3, e3)); assert.equal(e3.wounds, h3 - 2, 'D3 when the enemy activates within 2"');
  const h4 = e3.wounds; G.doMove(g3, e3, 'reposition', { pts: [{ x: 16, y: 10 }, { x: 16, y: 11 }], len: 1 }); assert.equal(e3.wounds, h4, 'once per activation');
  // a counteraction doesn't set it off
  const g4 = arena(), e4 = foes(g4)[0]; place(e4, 16, 10); g4.markers.push({ id: 99, kind: 'vsFallout', owner: 0, x: 16.5, y: 10, carriedBy: null });
  e4.ready = false; e4.counter = true; g4.counter = true; g4.active = e4.uid; g4.turn = 1; const h5 = e4.wounds; V.vsFallout(g4, e4); assert.equal(e4.wounds, h5, 'not while counteracting');
  // Skytorch Assault
  const g5 = arena(), sw = get(g5, 'vsSwarmguard'), [x, y] = foes(g5); foes(g5).slice(2).forEach((o) => place(o, -99, -99)); place(sw, 4, 15); place(x, 8, 15); place(y, 20, 20); G.activate(g5, sw);
  assert(can(g5, sw, 'vsSkytorch'));
  const hx = x.wounds; dice([6, 6, 6, 6, 1, 1, 1], () => V.vsDoSkytorch(g5, sw, { x: 12, y: 15 }));
  assert(x.wounds < hx, 'the operative under the torch zone is hit'); assert.equal(sw.x, 12);
}

// Charge (closest enemy unless a point), Pick Up (needs a point), Commune, ploys and equipment.
{
  const g = arena(), w = get(g, 'vsWarrior'), [a, b] = foes(g); foes(g).slice(2).forEach((o) => place(o, -99, -99)); place(w, 10, 10); place(a, 13, 10); place(b, 13, 14); G.activate(g, w);
  g.vs.cp[0] = 0;
  assert(!G.doMove(g, w, 'charge', { pts: [{ x: 10, y: 10 }, { x: 12, y: 13 }], len: 3.2 }), 'only the closest without a point');
  g.vs.cp[0] = 1; assert(G.doMove(g, w, 'charge', { pts: [{ x: 10, y: 10 }, { x: 12, y: 13 }], len: 3.2 }) !== false); assert.equal(g.vs.cp[0], 0);
  const p = arena(); p.vs.cp[0] = 0; const pw = get(p, 'vsWarrior'); G.activate(p, pw);
  const list = G.availableActions(p, pw); assert(!list.find((x) => x.id === 'pickUp')?.ok || !list.find((x) => x.id === 'pickUp'), 'no point: no Pick Up');
  const c = arena({ commune: 'vsExo' }); c.phase = 'strategy'; const exo = TEAM_MAP.vespids.ploys.find((x) => x.id === 'vsExo');
  assert.equal(G.ployCost(c, 0, exo), 0, 'Commune: 0CP while the Strain Leader is free');
  // ploys
  const g2 = arena(); g2.ploys[0].push('vsPredators', 'vsStingPloy'); const w2 = get(g2, 'vsWarrior'), e2 = foes(g2)[0]; place(w2, 5, 10); place(e2, 15, 10); G.activate(g2, w2);
  G.doMove(g2, w2, 'reposition', { pts: [{ x: 5, y: 10 }, { x: 7, y: 10 }], len: 2 });
  assert(G.effectiveRules(g2, w2, G.weaponsFor(g2, w2)[0], e2).balanced, 'Airborne Predators');
  const cl = G.weaponsFor(g2, w2).find((x) => x.id === 'vsClaws'); assert.equal(cl.hit, 3); assert.equal(cl.rules.lethal, 5);
  assert.equal(V.vsExo(Object.assign(arena(), { ploys: [['vsExo'], [], []] }), w2, 4, true), 3, 'Hardened Exoskeleton'); assert.equal(V.vsExo(arena(), w2, 4, true), 4, 'only with the ploy');
  const g3 = arena(), w3 = get(g3, 'vsWarrior'); G.activate(g3, w3); assert(G.useFFButton(g3, w3, 'vsDart')); assert(w3.acted.vsDart >= 1); assert(!G.availableActions(g3, w3).some((x) => x.id === 'shoot'), 'Darting Flight: no Shoot');
  const g4 = arena({ equip: ['vsAccelerant'] }), w4 = get(g4, 'vsWarrior'); G.activate(g4, w4); assert.equal(G.moveAllowance(g4, w4, 'dash'), 4, 'Accelerant Stimulant: +1"');
}

// AI vs AI full battles.
for (const [a, b] of [['vespids', 'angels'], ['kommandos', 'vespids'], ['vespids', 'voidDancers']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'vespids' ? ['vsNeuro', 'vsConvergence', 'vsAccelerant', 'vsAggression'] : [], b === 'vespids' ? ['vsNeuro', 'vsAggression'] : []] });
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
console.log('vespids ok');
