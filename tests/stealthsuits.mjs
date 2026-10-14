import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as X from '../js/stealthsuits.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { stealthRosterError } from '../js/data/stealthsuits.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 26262;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }

function arena(opts = {}) {
  const g = G.newGame({ teams: ['stealthSuits', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = o.side === 0 ? 3 + (i % 6) * 1.6 : 27; o.y = o.side === 0 ? 4 + Math.floor(i / 6) * 2 : 2 + i * 1.8; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.side === 0 && o.tplId === id);
const foes = (g) => g.ops.filter((o) => o.side === 1);
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const clear = (g, keep = []) => g.ops.forEach((o) => { if (!keep.includes(o)) place(o, -99, -99); });
const ids = (g, o) => G.availableActions(g, o).map((a) => a.id);
const buy = (g, side, id) => { if (!g.ploys[side].includes(id)) g.ploys[side].push(id); };

// Roster: Shas'vre + two drones + four picks (each once except Infiltrators), two fusion blasters at most.
{
  const g = arena(), t = TEAM_MAP.stealthSuits;
  assert.equal(g.ops.filter((o) => o.side === 0).length, 7);
  assert.equal(stealthRosterError(t, {}), null);
  assert(stealthRosterError(t, { xvDesignatorB: ['xvLiberatorB'] }), 'two Liberators');
  assert.equal(stealthRosterError(t, { xvDesignatorB: ['xvInfiltratorB'] }), null, 'Infiltrators repeat');
  assert(stealthRosterError(t, { xvShasvreB: ['xvShasvreF'], xvDesignatorB: ['xvDesignatorF'] }), 'three fusion blasters');
  assert.equal(stealthRosterError(t, { xvShasvreB: ['xvShasvreF'] }), null, 'two fusion blasters');
  assert.throws(() => G.newGame({ teams: ['stealthSuits', 'angels'], ai: null, roster: [{ xvDesignatorB: ['xvLiberatorF'] }] }));
  const d = get(g, 'xvMarkerDrone');
  assert.deepEqual(ids(g, d).sort(), ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'shoot'].filter((a) => ids(g, d).includes(a)).sort(), 'the drone: only its actions');
  assert(!ids(g, d).includes('pickUp'));
}

// Stealth Fields: Concealed, invisible beyond 3"; Fall Back costs 1 less.
{
  const g = arena(), s = get(g, 'xvInfiltratorF'), e = foes(g)[0]; clear(g, [s, e]);
  place(s, 10, 10); place(e, 20, 10);
  assert(G.visibility(g, e, s).visible);
  s.order = 'conceal'; assert(!G.visibility(g, e, s).visible, 'Concealed beyond 3"');
  place(e, 13, 10); assert(G.visibility(g, e, s).visible, 'within 3"');
  assert(X.xvFallBackCheap(s));
}

// Kauyon: Accurate by where the enemy is; For the Greater Good +1 with two suits down.
{
  const g = arena(), s = get(g, 'xvDesignatorB'), e = foes(g)[0];
  const dz = G.deployZones(g)[0];
  place(e, (dz.x0 + dz.x1) / 2, ((dz.y0 ?? 0) + (dz.y1 ?? 20)) / 2);
  assert.equal(X.xvKauyon(g, s, e), 3, 'in the drop zone');
  place(e, 27, 10); assert.equal(X.xvKauyon(g, s, e), 0, 'far away');
  const ter = [];
  for (let x = 1; x < 30; x += 0.5) { place(e, x, 10); ter.push(X.xvKauyon(g, s, e)); }
  assert(ter.includes(1) && ter.includes(2), 'all three bands appear');
  place(e, (dz.x0 + dz.x1) / 2, ((dz.y0 ?? 0) + (dz.y1 ?? 20)) / 2);
  get(g, 'xvLiberatorB').dead = true; get(g, 'xvNeutraliserB').dead = true;
  assert.equal(X.xvKauyon(g, s, e), 3, 'max 3');
  for (let x = 1; x < 30; x += 0.5) { place(e, x, 10); if (X.xvKauyon(g, s, e) === 2) break; }
}

// Markerlight (Severe) and Focused Markerlight (+1 Hit, once).
{
  const g = arena(), d = get(g, 'xvDesignatorB'), sh = get(g, 'xvShasvreB'), e = foes(g)[0]; clear(g, [d, sh, e]);
  place(d, 10, 10); place(sh, 10, 13); place(e, 18, 10);
  const w = G.weaponsFor(g, sh).find((x) => x.id === 'xvBurstF');
  assert(X.xvMarked(g, 0, e)); assert(G.effectiveRules(g, sh, w, e).severe, 'Markerlight: Severe');
  G.activate(g, d); assert(ids(g, d).includes('xvFocus'));
  G.TARGET_ACTIONS.xvFocus.apply(g, d, e);
  assert(G.effectiveRules(g, sh, w, e).xvHit, 'Focused Markerlight');
  X.xvShootStart(g, sh, w, e); X.xvShootEnd(g, sh);
  assert(!G.effectiveRules(g, sh, w, e).xvHit, 'used once');
}

// Electrochaff: obscured and no Piercing, once per TP; Holowave; Saviour Protocols.
{
  const g = arena(), l = get(g, 'xvLodestarB');
  assert.equal(l, undefined, 'no Lodestar by default');
  const g2 = arena({ roster: { xvDesignatorB: ['xvLodestarB'] } }), lo = get(g2, 'xvLodestarB'), s = get(g2, 'xvShasvreB'), e = foes(g2)[0]; clear(g2, [lo, s, e]);
  place(lo, 10, 10); place(s, 12, 10); place(e, 20, 10);
  X.xvChaffStart(g2, e, s); assert(X.xvChaffOn(g2, e, s)); assert(G.visibility(g2, e, s).obscured);
  X.xvChaffEnd(g2); X.xvChaffStart(g2, e, s); assert(!X.xvChaffOn(g2, e, s), 'once per TP');
  assert(g2.markers.some((m) => m.kind === 'xvBeacon' && m.carriedBy === lo.uid), 'the Lodestar carries the Homing Beacon');
  // Holowave
  buy(g2, 0, 'xvHolowave'); assert(X.xvHolowave(g2, e, s)); place(e, 15, 10); assert(!X.xvHolowave(g2, e, s));
}

// Homing Beacon: place it, +1CP on 5+ (D6 + objectives within 6"), an enemy picking it up discards it.
{
  const g = arena({ roster: { xvDesignatorB: ['xvLodestarB'] } }), lo = get(g, 'xvLodestarB'), e = foes(g)[0]; clear(g, [lo, e]);
  place(lo, 10, 10); place(e, 25, 10); G.activate(g, lo);
  assert(ids(g, lo).includes('xvPlaceBeacon'));
  X.xvSelf(g, lo, 'xvPlaceBeacon');
  const b = g.markers.find((m) => m.kind === 'xvBeacon'); assert.equal(b.carriedBy, null); assert.equal(b.x, 10);
  g.tp = 2; g.objectives = []; const cp = g.cp[0];
  dice([5], () => X.xvReady(g)); assert.equal(g.cp[0], cp + 1);
  dice([4], () => X.xvReady(g)); assert.equal(g.cp[0], cp + 1, '4 + 0 objectives: nothing');
  assert(G.canPickUpMarker(g, e, b)); assert(!G.canPickUpMarker(g, get(g, 'xvGunDrone'), b), 'not a drone');
  X.xvAfterPickUp(g, e, b); assert(!g.markers.includes(b), 'discarded');
}

// Neutraliser: Multispectrum Sensor Package (once per TP) and System Jam (2AP while Concealed).
{
  const g = arena(), n = get(g, 'xvNeutraliserB'), s = get(g, 'xvShasvreB'), e = foes(g)[0]; clear(g, [n, s, e]);
  place(n, 10, 10); place(s, 12, 10); place(e, 16, 10);
  G.activate(g, e); assert.equal(n.order, 'conceal'); assert.equal(s.order, 'conceal');
  assert.equal(X.xvActionCost(n, 'xvJam'), 2); n.order = 'engage'; assert.equal(X.xvActionCost(n, 'xvJam'), 1);
}

// Infiltrator counteracts with any order; Target Locks let a Concealed suit counteract and only Shoot.
{
  const g = arena({ equip: ['xvLocks'] }), i = get(g, 'xvInfiltratorF'), s = get(g, 'xvShasvreB'), e = foes(g)[0]; clear(g, [i, s, e]);
  place(i, 10, 10); place(s, 10, 14); place(e, 25, 10); s.order = 'conceal';
  assert(X.xvCanCounter(g, i)); assert(X.xvCanCounter(g, s));
  place(e, 12, 14); assert(!X.xvCanCounter(g, s), 'within 3" of an enemy');
}

// Drone Controller lifts drone limits; Bonds of Unity sets APL; Photon -2" Move.
{
  const g = arena(); g.phase = 'strategy';
  const d = get(g, 'xvMarkerDrone');
  assert(X.xvDroneOk(g, 0)); assert(X.xvDrone(g, 0, d.uid)); assert(d.xvFreeDrone); assert(!X.xvDroneOk(g, 0), 'once per TP');
  g.phase = 'firefight'; clear(g, [d]); place(d, 10, 10); g.markers.push({ id: 9, kind: 'banner', x: 10.5, y: 10 }); G.activate(g, d);
  assert(ids(g, d).includes('pickUp'), 'free of its limits'); d.xvFreeDrone = false; assert(!ids(g, d).includes('pickUp')); d.xvFreeDrone = true;
  X.xvEnd(g, d); assert(!d.xvFreeDrone);
  const g2 = arena(), s = get(g2, 'xvShasvreB'), o = get(g2, 'xvDesignatorB'); clear(g2, [s, o]); place(s, 10, 10); place(o, 12, 10);
  buy(g2, 0, 'xvBonds'); G.changeApl(g2, s, -1); G.activate(g2, s); assert.equal(s.ap, 3, 'Bonds of Unity: no APL change'); assert(s.xvBondHit);
  const g3 = arena(), e = foes(g3)[0]; e.xvPhoton = true; const m0 = G.moveStat(g3, e); e.xvPhoton = false; assert.equal(G.moveStat(g3, e) - m0, 2);
}

// The AI uses the gambits.
{
  const g = arena({ equip: ['xvJammers'] }); g.phase = 'strategy'; g.objectives = [{ id: 0, x: 15, y: 10 }];
  X.xvAiStrategy(g, 0);
  assert.equal(g.xv.used[0].droneCtl, g.tp); assert.equal(g.xv.jam[0].id, 0);
}

// AI vs AI full battles.
for (const [a, b] of [['stealthSuits', 'angels'], ['kommandos', 'stealthSuits'], ['stealthSuits', 'vespids']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'stealthSuits' ? ['xvBlacksun', 'xvLocks', 'xvMulti', 'xvJammers'] : [], b === 'stealthSuits' ? ['xvLocks', 'xvJammers'] : []], roster: [a === 'stealthSuits' ? { xvDesignatorB: ['xvLodestarB'] } : {}, {}] });
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
console.log('stealthsuits ok');
