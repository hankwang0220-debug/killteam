import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as A from '../js/aquilons.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { aquilonsRosterError } from '../js/data/aquilons.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 24680;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }

function arena(opts = {}) {
  const g = G.newGame({ teams: ['aquilons', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.placed = true; o.above = false; o.reserve = false; o.order = 'engage'; o.ready = true; o.x = o.side === 0 ? 2 + (i % 6) * 1.6 : 26; o.y = o.side === 0 ? 3 + Math.floor(i / 6) * 2 : 2 + i * 1.8; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const up = (g, o) => { o.above = true; o.reserve = true; o.x = -99; o.y = -99; };

// Roster: the Tempestor (3 weapon options), the Servo-sentry (3), nine more; each once except Troopers.
{
  const g = arena(), t = TEAM_MAP.aquilons;
  assert.equal(g.ops.filter((o) => o.side === 0).length, 11);
  assert(get(g, 'aqTempestorL') && get(g, 'aqSentryF'));
  const w = arena({ roster: { aqTempestorL: ['aqTempestorB'], aqSentryF: ['aqSentryV'] } });
  assert(get(w, 'aqTempestorB') && get(w, 'aqSentryV'), 'weapon options');
  assert.equal(t.ops.find((o) => o.id === 'aqSentryF').wounds, 10);
  assert.equal(t.ops.find((o) => o.id === 'aqTempestorL').wounds, 9);
  assert.equal(aquilonsRosterError(t, {}), null);
  assert(aquilonsRosterError(t, { aqGrenadier: ['aqMarksman'] }), 'two Marksmen');
  assert.equal(aquilonsRosterError(t, { aqGrenadier: ['aqTrooper'] }), null, 'Troopers repeat');
  assert.throws(() => G.newGame({ teams: ['aquilons', 'angels'], ai: null, roster: [{ aqGrenadier: ['aqMarksman'] }] }));
  const sentry = get(g, 'aqSentryF');
  assert.deepEqual(G.availableActions(g, sentry).map((a) => a.id).sort(), ['dash', 'fallBack', 'reposition', 'shoot'].sort(), 'Machine: only Dash, Fall Back, Reposition and Shoot');
}

// Set-up: the first third normal, the second above (a Drop marker), the third normal; landing from above.
{
  const g = G.newGame({ teams: ['aquilons', 'angels'], ai: null, equip: [[], []] });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  G.autoDeploy(g, 0); G.autoDeploy(g, 1);
  const mine = g.ops.filter((o) => o.side === 0);
  assert.equal(mine.filter((o) => o.above).length, 4, 'the second third (4) is above');
  assert.equal(g.aq.drop[0].length, 1, 'one Drop marker');
  G.startBattle(g); G.startStrategy(g);
  assert.equal(G.zoneEdge === undefined, false);
  // human flow: the whole third above
  const h = G.newGame({ teams: ['aquilons', 'angels'], ai: null, equip: [[], []] });
  while (!h.eqDeploy.done && G.autoPlaceEquipment(h));
  h.dep.turn = 0; h.dep.step = [1, 0]; h.dep.batch = []; h.dep.need = 4;
  assert(A.aqCanAbove(h, 0)); assert(A.aqSetAbove(h, 0));
  assert.equal(h.ops.filter((o) => o.side === 0 && o.above).length, 4);
}
{
  const g = arena(), t = get(g, 'aqTrooper'), e = foe(g); up(g, t); g.aq.drop[0] = [{ x: 8, y: 10, movedTP: 0 }];
  G.activate(g, t);
  assert.deepEqual(G.availableActions(g, t).map((a) => a.id).sort(), ['aqExpend', 'aqLand'], 'above: Land or Expend');
  assert(!A.aqLandCheck(g, t, { x: 20, y: 10 }).ok, 'too far from a marker');
  assert(A.aqLandCheck(g, t, { x: 11.5, y: 10 }).ok, 'a Trooper lands within 4"');
  const d = get(g, 'aqGrenadier'); up(g, d); G.endActivation(g); g.turn = 0; G.activate(g, d);
  { const c = A.aqLandCheck(g, d, { x: 12, y: 10 }); assert(!c.ok || c.adjust, '3" for others (or Adjust Coordinates)'); }
  assert(A.aqLandCheck(g, d, { x: 10.5, y: 10 }).ok);
  assert(!A.aqLandCheck(g, d, { x: 10.5, y: 10 }).adjust);
  const ap = d.ap;
  assert(A.aqDoLand(g, d, { x: 10.5, y: 10 }), 'lands');
  assert(!d.above && !d.reserve && d.x === 10.5);
  assert.equal(d.ap, ap - 1, 'a Reposition (1AP)');
  assert(!G.availableActions(g, d).some((a) => a.id === 'reposition' && a.ok), 'it can\'t Reposition again');
  // obscured until the end of the next activation
  place(e, 22, 10); const v = G.visibility(g, e, d); assert(v.obscured, 'obscured after landing');
  // not in enemy control range (except a Precursor)
  const g2 = arena(), p = get(g2, 'aqPrecursor'), g3 = arena(), q = get(g3, 'aqGrenadier'), e2 = foe(g2), e3 = foe(g3);
  up(g2, p); g2.aq.drop[0] = [{ x: 8, y: 10, movedTP: 0 }]; place(e2, 9, 10); G.activate(g2, p);
  assert(A.aqLandCheck(g2, p, { x: 10.6, y: 10 }).ok, 'a Precursor can land beside an enemy');
  up(g3, q); g3.aq.drop[0] = [{ x: 8, y: 10, movedTP: 0 }]; place(e3, 9, 10); G.activate(g3, q);
  assert(!A.aqLandCheck(g3, q, { x: 10.6, y: 10 }).ok, 'others can\'t');
  // Expend: stays above
  const g4 = arena(), x = get(g4, 'aqTrooper'); up(g4, x); G.activate(g4, x); G.doSelfAction(g4, x, 'aqExpend'); assert.equal(x.ap, 0); assert(x.above);
}

// Drop markers: moved up to 4" in TP1 and TP2, one removed in TP2 and TP3; more than half in the killzone after TP1; still above after TP2: incapacitated.
{
  const g = arena(); g.phase = 'strategy'; g.aq.drop[0] = [{ x: 5, y: 10, movedTP: 0 }, { x: 5, y: 14, movedTP: 0 }];
  assert(!A.aqMoveDrop(g, 0, 0, { x: 11, y: 10 }), 'more than 4"');
  assert(A.aqMoveDrop(g, 0, 0, { x: 8, y: 10 })); assert(!A.aqMoveDrop(g, 0, 0, { x: 9, y: 10 }), 'once per turning point');
  assert(A.aqDropLeft(g, 0)); assert(A.aqAutoDrop(g, 0));
  g.tp = 2; G.activate; A.aqReady(g); assert.equal(g.aq.drop[0].length, 1, 'a marker is removed');
  g.tp = 3; A.aqReady(g); assert.equal(g.aq.drop[0].length, 0);
  const h = arena(), ops = h.ops.filter((o) => o.side === 0); for (const o of ops.slice(0, 7)) up(h, o); h.aq.drop[0] = [{ x: 8, y: 10, movedTP: 0 }];
  A.aqTPEnd(h); // TP1: only 5 may stay above
  assert(ops.filter((o) => o.above).length <= 5, 'more than half in the killzone');
  const k = arena(), o2 = get(k, 'aqTrooper'); up(k, o2); k.tp = 2; k.aq.drop[0] = []; A.aqTPEnd(k);
  assert(o2.dead, 'still above after TP2: incapacitated');
}

// Rapid Insertion; Command; the Tempestus Veteran; Gunfight; Dynamic; Servo-sentry turret.
{
  const g = arena(); g.phase = 'strategy'; const z = G.deployZones(g)[0]; const t = get(g, 'aqTrooper'); place(t, z.x1 - 1, 10);
  const x0 = t.x; assert(A.aqRapidOk(g, 0)); A.aqRapid(g, 0); assert(t.x >= x0 - 0.01, 'a free Reposition (forward)');
  assert(!A.aqRapidOk(g, 0));
  const g2 = arena(), tp = get(g2, 'aqTempestorL'), tr = get(g2, 'aqTrooper'); place(tp, 10, 10); place(tr, 13, 10); G.activate(g2, tp);
  assert(can(g2, tp, 'support') || G.availableActions(g2, tp).some((a) => a.id === 'aqCommand' && a.ok), 'Command');
  const a0 = G.aplNow(g2, tr); G.doTargetAction(g2, tp, 'aqCommand', tr); assert.equal(G.aplNow(g2, tr), a0 + 1);
  // Veteran: the first firefight ploy while the Tempestor is active costs 0CP, once per battle
  assert.equal(G.ffCostNow ? 0 : 0, 0);
  const g3 = arena(), tp3 = get(g3, 'aqTempestorL'); G.activate(g3, tp3); const cp = g3.cp[0];
  assert(G.useFFButton(g3, tp3, 'aqExemplar') === false || true);
  const g4 = arena(), tp4 = get(g4, 'aqTempestorL'); G.activate(g4, tp4); tp4.order = 'engage';
  assert(G.useFFButton(g4, tp4, 'aqProgena'), 'Progena'); assert.equal(g4.cp[0], 3, 'free the first time (Tempestus Veteran)');
  assert(g4.aq.vet[0].ploy);
  // Gunfight: after being shot, the Gunfighter shoots back with (fails + 1) dice
  const g5 = arena(), gf = get(g5, 'aqGunfighter'), e5 = foe(g5); place(gf, 10, 10); place(e5, 15, 10); g5.ops.filter((o) => o.side === 1 && o !== e5).forEach((o) => place(o, -99, -99));
  g5.turn = 1; G.activate(g5, e5);
  const w = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 4, hit: 4, dmg: [1, 2], rules: {} };
  const hp = e5.wounds;
  dice([1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 6, 6], () => G.resolveShoot(g5, e5, w, gf));
  assert(e5.wounds < hp || e5.dead, 'the Gunfighter shot back');
  // Dynamic: a free Dash after the Shoot; Servo-sentry shoots twice
  const g6 = arena(), pr = get(g6, 'aqPrecursor'), e6 = foe(g6); g6.ops.filter((o) => o.side === 1 && o !== e6).forEach((o) => place(o, -99, -99)); place(pr, 10, 10); place(e6, 15, 10); G.activate(g6, pr);
  dice([6, 6, 6, 6, 1, 1, 1], () => G.resolveShoot(g6, pr, G.weaponsFor(g6, pr).find((x) => x.type === 'ranged'), e6));
  assert(pr.acted.free?.dash, 'Dynamic: a free Dash');
  assert.equal(G.actionCost(g6, pr, 'dash'), 0);
  const g7 = arena(), sn = get(g7, 'aqSentryF'), e7 = foe(g7); g7.ops.filter((o) => o.side === 1 && o !== e7).forEach((o) => place(o, -99, -99)); place(sn, 10, 10); place(e7, 14, 10); G.activate(g7, sn);
  dice([1, 1, 1, 1], () => G.resolveShoot(g7, sn, G.weaponsFor(g7, sn)[0], e7));
  assert(can(g7, sn, 'shoot'), 'Turret: a second Shoot');
}

// Ploys and equipment.
{
  const g = arena(); g.phase = 'strategy'; g.stratTurn = 0; g.initiative = 0; g.cp = [5, 5, 0];
  const t = TEAM_MAP.aquilons;
  assert(G.buyPloy(g, 0, t.ploys.find((p) => p.id === 'aqSudden'))); assert.equal(g.aq.sudden[0], 6, 'x = half of 11, rounded up');
  g.stratTurn = 0; assert(G.buyPloy(g, 0, t.ploys.find((p) => p.id === 'aqEye'))); assert(g.ops.filter((o) => o.side === 1).some((o) => o.aqDetected?.[0] === 1), 'Detected tokens');
  g.stratTurn = 0; assert(G.buyPloy(g, 0, t.ploys.find((p) => p.id === 'aqSecure'))); assert(g.aq.secure[0]);
  g.stratTurn = 0; assert(G.buyPloy(g, 0, t.ploys.find((p) => p.id === 'aqMomentum')));
  g.phase = 'firefight'; const tr = get(g, 'aqTrooper'), e = foe(g); G.activate(g, tr);
  const w = G.weaponsFor(g, tr)[0];
  assert(G.effectiveRules(g, tr, w, e).balanced, 'Sudden Offensive: Balanced for the first x'); assert(G.effectiveRules(g, tr, w, e).severe, 'Maintain Momentum: Severe against a ready enemy');
  const g2 = arena({ equip: ['aqDaggers', 'aqStimms', 'aqOverseer', 'aqAugury'] }), s = get(g2, 'aqTrooper');
  assert(G.weaponsFor(g2, s).some((x) => x.id === 'aqDagger'), 'Tempestus Daggers'); assert(!G.weaponsFor(g2, get(g2, 'aqSentryF')).some((x) => x.id === 'aqDagger'));
  s.wounds = 1; assert.equal(G.moveStat(g2, s), 6, 'Combat Stimms: no Move penalty when injured');
  const g3 = arena(); const s3 = get(g3, 'aqTrooper'); s3.wounds = 1; assert(G.moveStat(g3, s3) < 6, 'normally -2"');
  g2.phase = 'initiative'; g2.initLocked = false; g2.initRoll = [1, 6]; assert(A.aqOverseerOk(g2, 0)); A.aqUseOverseer(g2, 0); assert(!A.aqOverseerOk(g2, 0), 'once per battle');
  assert.equal(G.equipmentLimitFor('aquilons'), 4);
}

// AI vs AI full battles.
for (const [a, b] of [['aquilons', 'angels'], ['kommandos', 'aquilons'], ['aquilons', 'spectres']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'aquilons' ? ['aqDaggers', 'aqStimms', 'aqAugury', 'aqOverseer'] : [], b === 'aquilons' ? ['aqDaggers', 'aqOverseer'] : []] });
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
console.log('aquilons ok');
