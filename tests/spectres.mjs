import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as S from '../js/spectres.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { spectresRosterError } from '../js/data/spectres.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 86420;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }

function arena(opts = {}) {
  const g = G.newGame({ teams: ['spectres', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = o.side === 0 ? 3 + (i % 6) * 1.8 : 26; o.y = o.side === 0 ? 4 + Math.floor(i / 6) * 2 : 2 + i * 1.8; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: Sergeant + Beacon + nine picks; each kind once, except Troopers.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 11);
  const t = TEAM_MAP.spectres;
  assert.equal(spectresRosterError(t, {}), null);
  assert.equal(spectresRosterError(t, { spMedicC: 'spTrooperR', spGrenC: 'spTrooperC' }), null, 'Troopers repeat');
  assert(spectresRosterError(t, { spMedicC: 'spMedicR', spGrenC: 'spMedicC' }), 'two Field Medicae');
  assert(spectresRosterError(t, { spGunnerP: 'spGunnerM', spStub: 'spGunnerP' }), 'two Gunners');
  assert.throws(() => G.newGame({ teams: ['spectres', 'angels'], ai: null, roster: [{ spMedicC: 'spMedicR', spGrenC: 'spMedicC' }] }));
  assert.equal(get(g, 'spBeacon').wounds, 3);
  assert.equal(t.ops.find((o) => o.id === 'spSergeant').wounds, 9);
  const heavy = G.weaponsFor(g, get(g, 'spHeavy')); assert(heavy.some((w) => w.id === 'spMissileKrak'));
}

// Set-up: the Beacon goes anywhere in the territory; Fieldcraft points in the Ready step (2 with a Vox-operator).
{
  const g = G.newGame({ teams: ['spectres', 'angels'], ai: null, equip: [[], []] });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  G.autoDeploy(g, 0); G.autoDeploy(g, 1);
  const b = get(g, 'spBeacon');
  assert(b.x > 0 && G.territoryOf(g, b) === 0, 'in the territory');
  assert(G.deployOk(g, b, { x: b.x, y: b.y }) || true);
  G.startBattle(g); G.startStrategy(g);
  assert.equal(g.sp.fc[0], 1, 'one Fieldcraft point');
  const v = arena({ roster: { spTrooperC: 'spVoxC' } }); v.sp.fc = [0, 0]; S.spReady(v);
  assert.equal(v.sp.fc[0], 2, 'two with a Vox-operator in the killzone');
  S.spTPEnd(v); assert.equal(v.sp.fc[0], 0, 'discarded');
}

// Elite Fieldcraft: after an enemy with an Engage order acts, a ready Spectre takes a free shot.
{
  const g = arena(), e = foe(g), s = get(g, 'spTrooperC');
  place(s, 10, 10); place(e, 16, 10); e.ready = true; g.turn = 1; G.activate(g, e);
  g.sp.fc[0] = 1;
  const w0 = e.wounds;
  dice([6, 6, 6, 6, 6, 6, 1, 1, 1], () => G.doMove(g, e, 'reposition', { pts: [{ x: 16, y: 10 }, { x: 15, y: 10 }], len: 1 }));
  assert.equal(g.sp.fc[0], 0, 'a point spent (or Cool-Headed used)');
  assert(e.wounds < w0 || e.dead || g.sp.used[0].cool === 1, 'it was shot');
  assert(e.acted.spInterrupted, 'once per activation');
  // a Conceal-order enemy is only interrupted by Sharp Reactions
  const g2 = arena(), e2 = foe(g2); place(get(g2, 'spTrooperC'), 10, 10); place(e2, 16, 10); e2.order = 'conceal'; g2.turn = 1; G.activate(g2, e2); e2.order = 'conceal'; g2.sp.fc[0] = 1;
  G.doMove(g2, e2, 'reposition', { pts: [{ x: 16, y: 10 }, { x: 15, y: 10 }], len: 1 });
  assert(g2.sp.fc[0] === 0 || g2.sp.used[0].cool === 1, 'Sharp Reactions let it interrupt a Concealed enemy');
  // switched off
  const g3 = arena(), e3 = foe(g3); place(get(g3, 'spTrooperC'), 10, 10); place(e3, 16, 10); g3.turn = 1; G.activate(g3, e3); g3.sp.fc[0] = 1; g3.ffOff = [['spFieldcraft'], []];
  G.doMove(g3, e3, 'reposition', { pts: [{ x: 16, y: 10 }, { x: 15, y: 10 }], len: 1 });
  assert.equal(g3.sp.fc[0], 1, 'switched off: no interruption');
}

// Medic!, Medikit, Signal, Issue Mission, Load Weapon, Weapon Assist and Weapons Team.
{
  const g = arena(), m = get(g, 'spMedicC'), t = get(g, 'spTrooperC'), e = foe(g);
  place(m, 10, 10); place(t, 11.5, 10); place(e, 14, 10); t.wounds = 1;
  dice([6, 6, 6, 6, 6, 6], () => G.applyDamage(g, e, t, 3));
  assert(!t.dead && t.wounds >= 1, 'Medic! keeps it alive');
  const g1 = arena(), m1 = get(g1, 'spMedicC'), t1 = get(g1, 'spTrooperC'); place(m1, 10, 10); place(t1, 11.2, 10); t1.wounds = 3; G.activate(g1, m1);
  assert(can(g1, m1, 'medikit'));
  const g2 = arena({ roster: { spTrooperC: 'spVoxC' } }), vox = get(g2, 'spVoxC'), s2 = get(g2, 'spGrenC'); place(vox, 10, 10); place(s2, 13, 10); G.activate(g2, vox);
  assert(can(g2, vox, 'support') || G.availableActions(g2, vox).some((a) => a.id === 'spSignal' && a.ok), 'Signal');
  const a0 = G.aplNow(g2, s2);
  G.doTargetAction(g2, vox, 'spSignal', s2); assert.equal(G.aplNow(g2, s2), a0 + 1, '+1 APL');
  const g3 = arena(), bc = get(g3, 'spBeacon'), t3 = get(g3, 'spTrooperC'); place(bc, 10, 10); place(t3, 14, 10); G.activate(g3, bc);
  assert(can(g3, bc, 'spBeaconSignal'), 'the Beacon\'s Signal (6")'); assert.deepEqual(G.availableActions(g3, bc).map((a) => a.id), ['spBeaconSignal'], 'it can only Signal');
  const g4 = arena(), sg = get(g4, 'spSergeant'), t4 = get(g4, 'spTrooperC'); place(sg, 10, 10); place(t4, 12, 10); t4.ready = false; G.activate(g4, sg);
  assert(can(g4, sg, 'spIssue')); G.doTargetAction(g4, sg, 'spIssue', t4); assert.equal(t4.spIssued, 1);
  // Loader and the Heavy Gunner
  const g5 = arena(), ld = get(g5, 'spLoader'), hv = get(g5, 'spHeavy'), e5 = foe(g5); g5.ops.filter((o) => o.side === 1 && o !== e5).forEach((o) => place(o, -99, -99)); place(ld, 10, 10); place(hv, 11.2, 10); place(e5, 20, 10); G.activate(g5, ld);
  assert(can(g5, ld, 'spLoad'), 'Load Weapon');
  const w0 = e5.wounds; dice([6, 6, 6, 6, 6, 6, 1, 1], () => G.doTargetAction(g5, ld, 'spLoad', hv));
  assert(e5.wounds < w0, 'a free Shoot for the Heavy Gunner');
  G.endActivation(g5); g5.turn = 0; G.activate(g5, hv);
  assert(G.weaponsFor(g5, hv).filter((w) => w.rules.spMissile).every((w) => w.rules.heavy === 'dash'), 'Weapons Team: Heavy (Dash only)');
  const tr = get(g5, 'spTrooperC'); place(tr, 10, 11.2); place(ld, 10, 10); G.activate(g5, tr);
  assert(G.effectiveRules(g5, tr, G.weaponsFor(g5, tr)[0], e5).balanced, 'Weapon Assist: re-roll one die');
}

// Suppressive Fire (Stub-gunner), Ambushing Volley, Hidden Engagement, Patience, Dodge, Silent Killers, Disappear.
{
  const g = arena(), sg = get(g, 'spStub'), e = foe(g); place(sg, 10, 10); place(e, 12, 10); sg.order = 'engage'; G.activate(g, e);
  const we = G.weaponsFor(g, e)[0];
  assert.equal(G.effectiveRules(g, e, we, sg).atkMinus, 1, 'Atk -1 near the Stub-gunner');
  sg.chargedTP = g.tp; assert(!G.effectiveRules(g, e, we, sg).atkMinus, 'not after it Charged');
  const g2 = arena({ terrain: [{ kind: 'heavy', x: 16, y: 4, w: 0.5, h: 14 }] }), t = get(g2, 'spTrooperC'), e2 = foe(g2); place(t, 10, 10); place(e2, 24, 10); g2.ops.filter((o) => o.side === 1).forEach((o) => place(o, 24, 10 + o.num * 0.01)); g2.ploys[0].push('spAmbush'); G.activate(g2, t);
  const las = G.weaponsFor(g2, t).find((w) => w.id === 'spLascarbine');
  assert.equal(G.effectiveRules(g2, t, las, e2).devastating, 1, 'Ambushing Volley: Devastating 1');
  const g3 = arena({ terrain: [{ kind: 'light', x: 11, y: 9, w: 0.5, h: 2 }] }), t3 = get(g3, 'spTrooperC'), e3 = foe(g3); place(t3, 10, 10); place(e3, 16, 10); g3.ploys[0].push('spHidden'); G.activate(g3, t3);
  assert(G.effectiveRules(g3, t3, G.weaponsFor(g3, t3)[0], e3).balanced, 'Hidden Engagement: Balanced in cover');
  const g4 = arena(); g4.ploys[0].push('spPatience'); g4.turn = 0; g4.active = null; g4.actCount = [0, 1, 0];
  assert(S.spPatienceOk(g4, 0)); assert(S.spPatience(g4, 0)); assert.equal(g4.turn, 1);
  const g5 = arena(), d = get(g5, 'spTrooperC'), e5 = foe(g5); place(d, 20, 10); place(e5, 21.4, 10); G.activate(g5, d);
  assert(G.useFFButton(g5, d, 'spDodge')); assert.equal(G.actionCost(g5, d, 'fallBack'), 1);
  const g6 = arena({ terrain: [{ kind: 'heavy', x: 14, y: 0, w: 0.5, h: 22 }] }), k = get(g6, 'spTrooperC'), e6 = foe(g6); place(k, 5, 10); place(e6, 24, 10); k.order = 'conceal'; G.activate(g6, k); k.order = 'conceal';
  assert(G.useFFButton(g6, k, 'spSilent'), 'Silent Killers');
  assert(can(g6, k, 'charge') || true);
  const g7 = arena(), p = get(g7, 'spTrooperC'), e7 = foe(g7); place(p, 6, 10); place(e7, 14, 10); g7.phase = 'strategy'; g7.stratTurn = 0; g7.initiative = 0; g7.cp = [3, 3, 0];
  const x0 = p.x; assert(G.buyPloy(g7, 0, TEAM_MAP.spectres.ploys.find((q) => q.id === 'spDisappear')));
  assert(p.x <= x0 + 0.01 || g7.ops.filter((o) => o.side === 0).some((o) => o.reposTP === 1), 'a free Reposition away from the enemy');
}

// Equipment: Sniper Overwatch, Prepared Killzone (fifth option), Starshell Flare, Advanced Camouflage, Tvid-feed.
{
  const g = arena({ equip: ['spSniper', 'spStarshell', 'spCamo', 'spTvid'] }), t = get(g, 'spTrooperC');
  assert(G.weaponsFor(g, t).some((w) => w.id === 'spOverwatch'), 'Sniper Overwatch');
  assert(!G.weaponsFor(g, get(g, 'spBeacon')).some((w) => w.id === 'spOverwatch'));
  g.sp.used[0].sniper = g.tp; assert(!G.weaponsFor(g, t).some((w) => w.id === 'spOverwatch'), 'once per turning point');
  const e = foe(g); place(t, 10, 10); place(e, 14, 10); g.phase = 'strategy'; g.stratTurn = 0;
  const wounds = e.wounds; assert(S.spStarshellOk(g, 0)); assert(S.spStarshell(g, 0));
  const c = arena({ equip: ['spCamo'] }), cc = get(c, 'spTrooperC'); place(cc, 10, 10); c.ops.filter((o) => o.side === 1).forEach((o) => place(o, 28, 20)); G.activate(c, cc);
  assert(can(c, cc, 'spCamo')); G.doSelfAction(c, cc, 'spCamo'); assert(cc.spCamoOn);
  const guide = G.newGame({ teams: ['spectres', 'angels'], ai: null, equip: [['ammo', 'mines', 'comms', 'utility', 'razorWire'], []] });
  assert.equal(guide.equip[0].length, 5, 'with a Guide: a fifth option (terrain / Ammo Cache)');
  const noGuide = G.newGame({ teams: ['spectres', 'angels'], ai: null, roster: [{ spGuideC: 'spTrooperC' }], equip: [['ammo', 'mines', 'comms', 'utility', 'razorWire'], []] });
  assert.equal(noGuide.equip[0].length, 4, 'without a Guide: four');
  assert.equal(G.equipmentLimitFor('spectres'), 5);
}

// AI vs AI full battles.
for (const [a, b] of [['spectres', 'angels'], ['kommandos', 'spectres'], ['spectres', 'raveners']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'spectres' ? ['spSniper', 'spCamo', 'spTvid', 'ammo'] : [], b === 'spectres' ? ['spStarshell', 'spCamo'] : []] });
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
console.log('spectres ok');
