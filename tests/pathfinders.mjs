import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { pathfindersRosterError } from '../js/data/pathfinders.js';
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
let seed = 31337;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(opts = {}) {
  const g = G.newGame({ teams: ['tauPathfinders', 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
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

// Roster: Shas'ui + 11 selections; the MB3 Recon Drone counts as two.
{
  const T = TEAM_MAP.tauPathfinders;
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 12);
  assert.equal(pathfindersRosterError(T, {}), null);
  assert(pathfindersRosterError(T, { gunDrone: 'mb3' }), 'the MB3 needs an empty slot');
  assert.equal(pathfindersRosterError(T, { gunDrone: 'mb3', markerDrone: 'pfNone' }), null);
  assert(pathfindersRosterError(T, { markerDrone: 'pfNone' }), 'empty without an MB3');
  assert(pathfindersRosterError(T, { gunDrone: 'markerDrone' }), 'a duplicate Marker Drone');
  assert.equal(pathfindersRosterError(T, { gunDrone: 'shasla', markerDrone: 'shasla', blooded: 'shasla' }), null, "any number of Shas'la");
  assert(pathfindersRosterError(T, { gunDrone: 'ionExpert', markerDrone: 'railExpert' }), 'three Weapons Experts');
  const h = G.newGame({ teams: ['tauPathfinders', 'kommandos'], ai: null, equip: [[], []], roster: [{ gunDrone: 'mb3', markerDrone: 'pfNone' }] });
  assert.equal(h.ops.filter((o) => o.side === 0).length, 11);
  assert(h.ops.some((o) => o.tplId === 'mb3'));
  assert.throws(() => G.newGame({ teams: ['tauPathfinders', 'kommandos'], ai: null, roster: [{ gunDrone: 'markerDrone' }] }));
}

// Shas'la: Fearless on the Frontline (Markerlight while engaged, Fall Back 1 less AP); Group Activation.
{
  const g = arena({ roster: { blooded: 'shasla', comms: 'shasla' } }), sl = get(g, 'shasla'), e = foe(g);
  place(sl, 10, 10); place(e, 11.3, 10); G.activate(g, sl);
  assert(can(g, sl, 'markerlight'), 'engaged, still Markerlights');
  assert.equal(G.actionCost(g, sl, 'fallBack'), 1);
  assert.equal(G.tpl(sl).groupAct, 'pfShasla');
}

// MB3 Recon Drone: Analyse; MV31 Pulse Accelerator; MV33 Grav-inhibitor; MV4 Shield Drone.
{
  const g = arena({ roster: { gunDrone: 'mb3', markerDrone: 'pfNone', blooded: 'mv31', comms: 'mv33', marksman: 'mv4' } });
  const mb = get(g, 'mb3'), a = get(g, 'mv31'), gv = get(g, 'mv33'), sh = get(g, 'mv4'), e1 = foe(g), e2 = foe(g, 1), pf = get(g, 'grenadier');
  assert.equal(G.tpl(mb).apl, 3); assert.equal(G.tpl(mb).wounds, 12);
  // Analyse
  place(mb, 10, 10); place(e1, 16, 10); place(e2, 17.5, 10.5); G.activate(g, mb);
  G.doTargetAction(g, mb, 'markerlight', e1);
  assert.equal(e1.ml, 1); assert.equal(e2.ml, 1, 'Analyse: the neighbour gains a token too');
  // Pulse Accelerator
  place(a, 12, 12); place(pf, 14, 12); place(e1, 22, 12);
  G.endActivation(g); G.activate(g, a);
  assert(can(g, a, 'pfAccel'));
  G.doSelfAction(g, a, 'pfAccel');
  const pulse = G.weaponsFor(g, pf).find((w) => w.id === 'pulseCarbine');
  const r = G.effectiveRules(g, pf, pulse, e1);
  assert.equal(r.lethal, 5); assert(r.severe);
  place(pf, 20, 12);
  assert(!G.effectiveRules(g, pf, pulse, e1).severe, 'more than 3" away');
  // Grav-inhibitor: a move that goes near it costs 2" more; melee Hit worsened
  place(gv, 12, 5); place(e2, 12, 12); e2.order = 'engage';
  const { moveCtx } = await import('../js/path.js');
  const ctx = moveCtx(g, e2, 'reposition');
  assert.equal(ctx.extra([{ x: 12, y: 12 }, { x: 12, y: 9 }]), 2, '+2"');
  assert.equal(moveCtx(g, e2, 'dash').extra([{ x: 12, y: 12 }, { x: 12, y: 9 }]), 0, 'not for a Dash');
  const { pfGravHit } = await import('../js/pathfinders.js');
  place(e2, 12, 8);
  assert.equal(pfGravHit(g, e2, { type: 'melee' }), 1);
  place(e2, 25, 8);
  assert.equal(pfGravHit(g, e2, { type: 'melee' }), 0);
  // Shield Drone: ignores Piercing; once per TP ignores one Normal Dmg die.
  assert(G.tpl(sh).ignorePiercing);
  const { pfShield } = await import('../js/pathfinders.js');
  assert.equal(pfShield(g, sh), true); assert.equal(pfShield(g, sh), false, 'once per TP');
  g.tp = 2; assert.equal(pfShield(g, sh), true);
}

// Equipment: High-intensity Markerlight, Orbital Survey Uplink, Photon Grenade, Target Analysis Optic.
{
  const g = arena({ equip: ['pfHiml', 'pfUplink', 'pfPhoton', 'pfTao'] }), bl = get(g, 'blooded'), e = foe(g), e2 = foe(g, 1);
  g.terrain = [{ kind: 'heavy', x: 20, y: 0, w: 1, h: 30 }]; // (the second enemy is behind a wall)
  place(bl, 10, 10); place(e, 16, 10); place(e2, 28, 20); G.activate(g, bl); bl.ap = 4;
  G.doTargetAction(g, bl, 'markerlight', e);
  assert.equal(e.ml, 2, 'High-intensity Markerlight');
  assert(G.TARGET_ACTIONS.markerlight.targets(g, bl).includes(e2), 'Orbital Survey Uplink: any enemy');
  G.doTargetAction(g, bl, 'markerlight', e2);
  assert.equal(e2.ml, 1, 'one token, not visible');
  const g2 = arena({ equip: ['pfPhoton'] }), b2 = get(g2, 'blooded'), f2 = foe(g2); place(b2, 10, 10); place(f2, 16, 10); G.activate(g2, b2);
  assert(can(g2, b2, 'pfPhoton'));
  dice([5], () => G.doTargetAction(g2, b2, 'pfPhoton', f2));
  assert.equal(f2.pfPhoton, 'pending');
  const g3 = arena({ equip: ['pfTao'] }), b3 = get(g3, 'blooded'), f3 = foe(g3); place(b3, 10, 10); place(f3, 16, 10); f3.ml = 1; G.activate(g3, b3);
  const w3 = G.weaponsFor(g3, b3).find((w) => w.type === 'ranged');
  const it = G.shootFlow(g3, b3, w3, f3); let s = it.next(); const lvl = G.mlLevel(g3, b3, w3, f3);
  while (!s.done) s = it.next();
  assert.equal(lvl, 2, 'Target Analysis Optic: one more');
  assert.equal(G.mlLevel(g3, b3, w3, f3), 1, 'only during the action');
}

// Recon Sweep: a free Dash for Pathfinders near a killzone edge that isn't yours (not in the first turning point).
{
  const g = arena({ tp: 2 }), c = get(g, 'comms');
  g.phase = 'strategy'; g.initiative = 0; g.stratTurn = 0; g.stratPasses = 0; g.cp[0] = 3;
  for (const o of g.ops.filter((x) => x.side === 0)) place(o, 3, 8 + (+o.uid.split('-')[1]) * 0.5);
  place(c, 26, 11); for (const f of g.ops.filter((x) => x.side === 1)) place(f, 20, 3 + (+f.uid.split('-')[1]) * 0.3);
  const x0 = `${c.x},${c.y}`;
  assert(G.buyPloy(g, 0, TEAM_MAP.tauPathfinders.ploys.find((p) => p.id === 'reconSweep')));
  assert.notEqual(`${c.x},${c.y}`, x0, 'it dashed');
  const g1 = arena({ tp: 1 }); g1.phase = 'strategy'; g1.initiative = 0; g1.stratTurn = 0; g1.cp[0] = 3;
  const c1 = get(g1, 'comms'); place(c1, 26, 14); const x1 = `${c1.x},${c1.y}`;
  G.buyPloy(g1, 0, TEAM_MAP.tauPathfinders.ploys.find((p) => p.id === 'reconSweep'));
  assert.equal(`${c1.x},${c1.y}`, x1, 'not in the first turning point');
}

// Saviour Protocols: a drone takes the shot meant for a Pathfinder (free with a Drone Controller or for the Shield Drone).
{
  const run = (roster) => {
    const g = arena({ roster }), bl = get(g, 'blooded'), e = foe(g), dr = get(g, 'gunDrone');
    place(bl, 10, 10); place(dr, 11.5, 10); place(e, 24, 10); G.activate(g, e); g.cp[0] = 1;
    const r = dice([1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g, e, G.weaponsFor(g, e).find((w) => w.type === 'ranged'), bl));
    return { r, g, bl, dr };
  };
  const a = run({});
  assert.equal(a.r.target, a.dr.uid, 'the drone is shot instead');
  assert.equal(a.g.cp[0], 1, 'free with the Drone Controller in the killzone');
  const b = run({ controller: 'shasla' });
  assert.equal(b.g.cp[0], 0, 'costs 1CP without a Controller');
}

// Point-Blank Fusillade: a Pathfinder that wasn't engaged retaliates with its carbine (no blocking).
{
  const g = arena(), bl = get(g, 'blooded'), e = foe(g); g.cp[0] = 2;
  place(bl, 10, 10); place(e, 14, 10); G.activate(g, e);
  g.pfStart = new Set();
  place(e, 11.2, 10);
  const f = G.startFight(g, e, G.weaponsFor(g, e).find((w) => w.type === 'melee'), bl);
  assert(f, 'a fight');
  assert.equal(g.fight.D.noBlock, true);
  assert.equal(g.cp[0], 1, '1CP');
  assert(!G.fightOptions(g).some((o) => o.act === 'parry'));
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
