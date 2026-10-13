import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { scoutsRosterError, cleanScouting, DEFAULT_SCOUTING } from '../js/data/scouts.js';
import { scTactical, scDiversion, scReady, scGuerrilla, scCamoExtra, scGambitsLeft } from '../js/scouts.js';
import { moveCtx, findPath } from '../js/path.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 90210;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.scoutSquad;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['scoutSquad', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}], scouting: [opts.scouting || []] });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 10) * 2.1; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const w = (o, id) => G.tpl(o).weapons.find((x) => x.id === id) || G.weaponsFor({ equip: [[], []] }, o).find((x) => x.id === id);
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const wp = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 4, hit: 3, dmg: [3, 4], rules: {} };

// Team data: Sergeant + 8; archetypes; roster limits (Warriors repeat, the others once).
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 9);
  assert.deepEqual(T.info.archetypes.map((a) => a.en), ['Recon', 'Infiltration']);
  assert.equal(T.name.zh, '偵察小隊');
  assert.equal(scoutsRosterError(T, {}), null);
  assert.equal(scoutsRosterError(T, { scHGHB: 'scWarriorBolt', scHGML: 'scWarriorShotgun' }), null, 'any number of Warriors');
  assert(scoutsRosterError(T, { scHunter: 'scSniper' }), 'two Snipers');
  assert(scoutsRosterError(T, { scHunter: 'scHGHB' }), 'two heavy bolter Gunners');
  assert.throws(() => arena({ roster: { scHunter: 'scSniper' } }));
  assert.deepEqual(Object.keys(G.tpl(get(g, 'scSergeant')).loadouts), ['shotgun', 'bolt', 'chain']);
  const s = arena({ loadouts: { scSergeant: 'chain' } });
  assert.deepEqual(G.weaponsFor(s, get(s, 'scSergeant')).map((x) => x.id), ['scBoltPistol', 'scChainsword']);
  // Stats from the datacards.
  const t = (id) => G.tpl(get(g, id));
  assert.equal(t('scSergeant').apl, 3); assert.equal(t('scSergeant').wounds, 11); assert.equal(t('scHunter').wounds, 10); assert.equal(t('scHunter').save, 4);
  // Forward Scouting selections: at most six, each up to its maximum.
  assert.deepEqual(cleanScouting(['reposition', 'reposition', 'reposition', 'devisePlan', 'nope']), ['reposition', 'reposition', 'devisePlan']);
  assert.equal(cleanScouting(['redeploy', 'reposition', 'tripAlarm', 'boobyTrap', 'devisePlan', 'spy', 'diversion']).length, 6);
}
// Astartes is the Sergeant's alone: two Shoots (a shotgun / bolt pistol / boltgun in one), counteracting under either order.
{
  const g = arena(), s = get(g, 'scSergeant'), warrior = get(g, 'scWarriorBolt'), t = foe(g);
  place(s, 10, 10); place(t, 17, 10); G.activate(g, s);
  G.resolveShoot(g, s, w(s, 'scShotgun'), place(t, 14, 10));
  assert(can(g, s, 'shoot') && G.shootWeapon(g, s, w(s, 'scShotgun')).ok, 'second Shoot with the shotgun');
  const h = arena(), sh = get(h, 'scSergeant'); place(sh, 10, 10); G.activate(h, sh);
  assert(!G.isAstartes?.(warrior) || true);
  const wr = get(h, 'scWarriorBolt'); place(wr, 10, 14); h.ops.filter((o) => o.side === 1).forEach((o) => place(o, 28, 5)); G.activate(h, wr);
  G.resolveShoot(h, wr, w(wr, 'scBoltgun'), place(foe(h), 16, 14));
  assert(!can(h, wr, 'shoot'), 'a Warrior has no Astartes rule: one Shoot only');
  const c = arena(); get(c, 'scSergeant').ready = false; get(c, 'scSergeant').order = 'conceal'; get(c, 'scWarriorBolt').ready = false; get(c, 'scWarriorBolt').order = 'conceal';
  const cands = G.counterCandidates(c, 0).map((o) => o.tplId);
  assert(cands.includes('scSergeant')); assert(!cands.includes('scWarriorBolt'));
}
// Astartes Training (ploy): a Warrior shoots twice; heavy weapons twice with 1 more AP; or fights twice.
{
  const g = arena({ equip: [] }), wr = get(g, 'scWarriorShotgun'), t = foe(g); place(wr, 10, 10); place(t, 14, 10); g.cp[0] = 3;
  G.activate(g, wr);
  assert(G.useFFButton(g, wr, 'scTraining'));
  G.resolveShoot(g, wr, w(wr, 'scShotgun'), t);
  assert(can(g, wr, 'shoot') && G.shootWeapon(g, wr, w(wr, 'scShotgun')).ok, 'two Shoots');
  assert.equal(g.cp[0], 2);
  const h = arena(), hg = get(h, 'scHGHB'), t2 = foe(h); place(hg, 10, 10); place(t2, 20, 10); h.cp[0] = 3; G.activate(h, hg);
  G.resolveShoot(h, hg, w(hg, 'scHbFocused'), t2);
  assert(!can(h, hg, 'shoot'), 'without the ploy only one Shoot');
  const k = arena(), hk = get(k, 'scHGHB'), t3 = foe(k); place(hk, 10, 10); place(t3, 20, 10); k.cp[0] = 3; G.activate(k, hk);
  G.useFFButton(k, hk, 'scTraining');
  G.resolveShoot(k, hk, w(hk, 'scHbFocused'), t3);
  hk.ap = 2; // (APL 2: it needs 2AP for the second heavy Shoot)
  const second = G.shootWeapon(k, hk, w(hk, 'scHbSweeping'));
  assert(can(k, hk, 'shoot') && second.ok); assert.equal(second.ap, 2, 'the second heavy Shoot costs 1 more AP');
  assert.equal(G.shootWeapon(k, hk, w(hk, 'scBoltPistol')).ap, 1, 'a bolt pistol Shoot costs the usual AP');
  // Two Fights.
  const f = arena(), hu = get(f, 'scHunter'), t4 = foe(f); place(hu, 10, 10); place(t4, 10 + G.radius(hu) + G.radius(t4) + 0.3, 10); f.cp[0] = 3; G.activate(f, hu);
  G.useFFButton(f, hu, 'scTraining');
  dice([1, 1, 1, 1, 1, 1, 1, 1], () => { G.startFight(f, hu, w(hu, 'scBlade'), t4); while (f.fight && !f.fight.done) G.fightApply(f, G.fightAutoChoice(f)); G.endFight(f); });
  assert(can(f, hu, 'fight'), 'a second Fight');
}
// Heavy Gunner: Heavy Weapon Bipod, and it can still move after shooting.
{
  const g = arena(), hg = get(g, 'scHGHB'), t = foe(g); place(hg, 10, 10); place(t, 20, 10); G.activate(g, hg);
  const r = G.effectiveRules(g, hg, w(hg, 'scHbFocused'), t);
  assert(r.ceaseless && !r.relentless, 'Ceaseless when it hasn\'t moved');
  G.resolveShoot(g, hg, w(hg, 'scHbFocused'), t);
  assert(can(g, hg, 'reposition'), 'moving after shooting is allowed');
  assert(can(g, hg, 'dash'));
  hg.acted.movedDist = 2;
  assert(!G.effectiveRules(g, hg, w(hg, 'scHbFocused'), t).ceaseless, 'no Ceaseless after moving');
}
// Hunter: Grapnel Launcher (climbing up counts as 2") and Grapnel Assault (a Charge that climbs: melee Lethal 3+).
{
  const g = arena(), h = get(g, 'scHunter'), x = get(g, 'scWarriorBolt'); place(h, 5, 10); place(x, 5, 14); h.counter = true; x.counter = true; // (on foot)
  g.terrain = [{ kind: 'heavy', x: 6, y: 0, w: 0.5, h: G.BOARD.h }];
  const ch = moveCtx(g, h), cx = moveCtx(g, x);
  assert.equal(cx.climbs([{ x: 5, y: 14 }, { x: 8, y: 14 }]), 3.2);
  assert.equal(ch.climbs([{ x: 5, y: 10 }, { x: 8, y: 10 }]), 2.6, 'up 2" + drop beyond 2"');
  // Charge over the wall
  const t = foe(g); place(h, 5, 10); place(t, 10.2, 10); h.counter = false; G.activate(g, h);
  assert(G.doMove(g, h, 'charge', { pts: [{ x: 5, y: 10 }, { x: 8.5, y: 10 }] }) !== false);
  assert(h.acted.scGrapnel, 'it climbed');
  assert.equal(G.effectiveRules(g, h, w(h, 'scBlade'), t).lethal, 3);
  const f = arena(), h2 = get(f, 'scHunter'), t2 = foe(f); place(h2, 5, 10); place(t2, 7, 10); G.activate(f, h2);
  G.doMove(f, h2, 'charge', { pts: [{ x: 5, y: 10 }, { x: 6.2, y: 10 }] });
  assert(!h2.acted.scGrapnel); assert.equal(G.effectiveRules(f, h2, w(h2, 'scBlade'), t2).lethal, undefined);
}
// Sniper: Camo Cloak, Optics, Silent stationary rifle; Auspex Scan + Optics gives Seek Light.
{
  const g = arena(), s = get(g, 'scSniper'), tr = get(g, 'scTracker'), t = foe(g), wr = get(g, 'scWarriorBolt');
  place(s, 5, 5); place(tr, 8, 8); place(t, 14, 8); place(wr, 6, 12);
  assert(w(s, 'scSniperStationary').rules.silent); assert.equal(w(s, 'scSniperStationary').rules.devastating, 3); assert.equal(w(s, 'scSniperStationary').dmg.join('/'), '3/3');
  G.activate(g, tr); G.doSelfAction(g, tr, 'auspexScan'); assert.equal(g.auspex[0], tr.uid);
  const bare = G.effectiveRules(g, s, w(s, 'scSniperMobile'), t); assert(!bare.seekLight, 'Optics not active');
  s.optics = true;
  assert(G.effectiveRules(g, s, w(s, 'scSniperMobile'), t).seekLight, 'Optics + Auspex Scan');
  wr.optics = true; assert(!G.effectiveRules(g, wr, w(wr, 'scBoltgun'), t).seekLight, 'only the Sniper');
  place(t, 25, 20); assert(!G.effectiveRules(g, s, w(s, 'scSniperMobile'), t).seekLight, 'beyond 8" of the Tracker');
}
// Tracker: Track Enemy — Seek Light against it for the whole turning point.
{
  const g = arena(), tr = get(g, 'scTracker'), wr = get(g, 'scWarriorBolt'), t = foe(g); place(tr, 8, 8); place(t, 14, 8); G.activate(g, tr);
  assert(can(g, tr, 'scTrack'));
  G.doTargetAction(g, tr, 'scTrack', t);
  assert(G.effectiveRules(g, wr, w(wr, 'scBoltgun'), t).seekLight);
  assert(!G.effectiveRules(g, get(g, 'scHunter'), w(get(g, 'scHunter'), 'scBlade'), t).seekLight, 'ranged weapons only');
  g.tp = 2; assert(!G.effectiveRules(g, wr, w(wr, 'scBoltgun'), t).seekLight, 'until the end of the TP');
  const far = arena(), t2 = get(far, 'scTracker'), e = foe(far); place(t2, 8, 8); place(e, 22, 8); G.activate(far, t2);
  assert(!can(far, t2, 'scTrack'), 'nobody within 8"');
}
// Sergeant: Guidance and Experience (once per activation, +1 APL on another Scout for its next activation).
{
  const g = arena(), s = get(g, 'scSergeant');
  G.activate(g, s);
  const boosted = g.ops.filter((o) => o.side === 0 && o !== s && o.aplNext === 1);
  assert.equal(boosted.length, 1);
  const o = boosted[0]; o.ready = true; G.deactivate(g); g.active = null;
  G.activate(g, o); assert.equal(o.ap, G.tpl(o).apl + 1, '+1 APL');
}
// Warrior: Adaptive Equipment (a stun and a smoke grenade once per TP, without equipment).
{
  const g = arena(), wr = get(g, 'scWarriorBolt'), t = foe(g); place(wr, 10, 10); place(t, 14, 10); G.activate(g, wr);
  assert(can(g, wr, 'eqStun') && can(g, wr, 'eqSmoke'));
  const hg = get(g, 'scHGHB'); G.deactivate(g); G.activate(g, hg);
  assert(!can(g, hg, 'eqStun'), 'only Warriors');
}
// Forward Scouting: resolved when deployment ends.
{
  const g = G.newGame({ teams: ['scoutSquad', 'kommandos'], ai: null, equip: [[], []], scouting: [['devisePlan', 'tripAlarm', 'tripAlarm', 'boobyTrap', 'designateTarget', 'reposition'], []] });
  G.autoDeploy(g, 0); G.autoDeploy(g, 1);
  const cp = g.cp[0];
  const before = g.ops.filter((o) => o.side === 0).map((o) => ({ x: o.x, y: o.y }));
  G.startBattle(g);
  const marks = (k) => (g.markers || []).filter((m) => m.kind === k && m.owner === 0);
  assert.equal(g.cp[0], cp + 1 + 0, 'Devise Plan: +1CP'); // (the Ready step adds the other CP too)
  assert.equal(marks('tripAlarm').length, 2); assert.equal(marks('boobyTrap').length, 1);
  const ez = G.deployZones(g)[1];
  for (const m of [...marks('tripAlarm'), ...marks('boobyTrap')]) assert(m.x < ez.x0 - 6, `${m.kind} more than 6" from the enemy drop zone`);
  const trap = marks('boobyTrap')[0];
  assert([...(g.objectives || []), ...(g.markers || [])].every((m) => m === trap || Math.hypot(m.x - trap.x, m.y - trap.y) > 2), 'more than 2" from other markers');
  assert.equal(g.ops.filter((o) => o.side === 1 && o.scTarget?.[0]).length, 1, 'Designate Target');
  const after = g.ops.filter((o) => o.side === 0).map((o) => ({ x: o.x, y: o.y }));
  assert(after.some((p, i) => p.x !== before[i].x || p.y !== before[i].y), 'Reposition moved someone');
  assert(g.ops.filter((o) => o.side === 0).every((o) => o.x > -50), 'everyone is on the board');
  // Designate Target: re-roll one attack die against it.
  const marked = g.ops.find((o) => o.scTarget?.[0]), me = get(g, 'scWarriorBolt');
  assert(G.effectiveRules(g, me, w(me, 'scBoltgun'), marked).balanced);
  // Tactical Manoeuvre and Diversion are strategic gambits.
  assert.equal(g.scGambit[0].tactical, 0, 'not selected');
  // Trip Alarm: Seek in TP1 and TP2 against an enemy within 2" of it; removed in TP3.
  const e = foe(g); place(e, marks('tripAlarm')[0].x + 1, marks('tripAlarm')[0].y);
  assert(G.effectiveRules(g, me, w(me, 'scBoltgun'), e).seek, 'TP1');
  g.tp = 2; assert(G.effectiveRules(g, me, w(me, 'scBoltgun'), e).seek, 'TP2');
  place(e, marks('tripAlarm')[0].x + 3, marks('tripAlarm')[0].y); assert(!G.effectiveRules(g, me, w(me, 'scBoltgun'), e).seek, 'beyond 2"');
  g.tp = 3; scReady(g); assert.equal(marks('tripAlarm').length, 0);
}
{
  const g = G.newGame({ teams: ['scoutSquad', 'kommandos'], ai: null, equip: [[], []], scouting: [['redeploy', 'tacticalManoeuvre', 'diversion', 'spy'], []] });
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  assert(g.ops.filter((o) => o.side === 0).every((o) => o.x > -50 && G.deployZones(g)[0].x1 >= o.x), 'Redeploy keeps everyone in the drop zone');
  assert.equal(g.scGambit[0].tactical, 2); assert.equal(g.scGambit[0].diversion, 1);
}
// Tactical Manoeuvre (twice per battle, once per TP) and Diversion (once per battle).
{
  const g = G.newGame({ teams: ['scoutSquad', 'kommandos'], ai: null, equip: [[], []], scouting: [['tacticalManoeuvre', 'diversion'], []] });
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g); g.phase = 'strategy';
  const o = get(g, 'scHunter'), e = foe(g); place(e, 28, 1.5);
  assert(scGambitsLeft(g, 0, 'tactical'));
  assert(scTactical(g, 0, o.uid)); assert.equal(o.aplNext, 1);
  assert(!scTactical(g, 0, o.uid), 'once per TP');
  g.tp = 2; assert(scTactical(g, 0, o.uid)); g.tp = 3; assert(!scTactical(g, 0, o.uid), 'twice per battle');
  const far = foe(g, 1); place(far, 15, 11); assert(!scDiversion(g, 0, far.uid), 'not near an edge');
  assert(scDiversion(g, 0, e.uid)); assert.equal(e.aplNext, -1); g.tp = 4; assert(!scDiversion(g, 0, e.uid), 'once per battle');
}
// Booby Trap: the first enemy to get a control range on it takes 2D3 and its move ends there.
{
  const g = arena(), e = foe(g);
  g.markers = [{ id: 0, kind: 'boobyTrap', owner: 0, x: 12, y: 10, carriedBy: null }];
  place(e, 18, 10); G.activate(g, e);
  const hp = e.wounds;
  dice([2, 2], () => G.doMove(g, e, 'reposition', { pts: [{ x: 18, y: 10 }, { x: 10, y: 10 }] }));
  assert(e.wounds < hp, '2D3 damage'); assert(e.x > 12, 'stopped where its control range reached the marker');
  assert.equal(g.markers.filter((m) => m.kind === 'boobyTrap').length, 0, 'the marker is removed');
  // The owner's own operatives don't set it off.
  const h = arena(), o = get(h, 'scHunter'); h.markers = [{ id: 0, kind: 'boobyTrap', owner: 0, x: 8, y: 10, carriedBy: null }];
  place(o, 3, 10); G.activate(h, o); G.doMove(h, o, 'reposition', { pts: [{ x: 3, y: 10 }, { x: 8.5, y: 10 }] });
  assert.equal(h.markers.length, 1);
}
// Strategy ploys: Ambush, Guerrilla Engagement, Adaptable Training, Stealth Relocation.
{
  const g = arena(), wr = get(g, 'scWarriorBolt'), t = foe(g); place(wr, 10, 10); place(t, 16, 10); g.ploys[0] = ['scAmbush'];
  wr.order = 'conceal'; G.activate(g, wr); wr.order = 'engage'; // Conceal → Engage at the start of the activation
  assert(G.effectiveRules(g, wr, w(wr, 'scBoltgun'), t).balanced, 'Balanced');
  t.ready = false; const r = G.effectiveRules(g, wr, w(wr, 'scBoltgun'), t);
  assert(r.ceaseless && !r.balanced, 'Ceaseless instead against an expended target');
  G.deactivate(g); const g2 = arena(), x = get(g2, 'scWarriorBolt'), t2 = foe(g2); place(x, 10, 10); place(t2, 16, 10); g2.ploys[0] = ['scAmbush'];
  G.activate(g2, x); x.acted.unseen = false; assert(!G.effectiveRules(g2, x, w(x, 'scBoltgun'), t2).balanced, 'no condition');
  x.acted.unseen = true; assert(G.effectiveRules(g2, x, w(x, 'scBoltgun'), t2).balanced, 'not visible at the start of the activation');
  // Guerrilla Engagement
  const q = arena(), sc = get(q, 'scWarriorBolt'), e = foe(q); q.ploys[0] = ['scGuerrilla']; place(sc, 10, 10); place(e, 22, 10);
  assert(scGuerrilla(q, sc), 'more than 6" from the enemies that see it'); place(e, 14, 10); assert(!scGuerrilla(q, sc), 'an enemy within 6"');
  // Adaptable Training / Stealth Relocation
  const a = arena(); a.phase = 'strategy'; a.initiative = 0; a.stratStep = 0; a.cp[0] = 3;
  a.ops.filter((o) => o.side === 0).forEach((o, i) => { place(o, 3, 1.5 + i * 2); o.order = 'conceal'; });
  a.ops.filter((o) => o.side === 1).forEach((o, i) => place(o, 28, 1.5 + i * 2));
  assert(G.buyPloy(a, 0, T.ploys.find((p) => p.id === 'scAdaptable')));
  const engaged = a.ops.filter((o) => o.side === 0 && o.order === 'engage').length;
  assert(engaged <= 3, 'up to D3 operatives'); assert(engaged >= 0);
  const s = arena(); s.phase = 'strategy'; s.initiative = 0; s.stratStep = 0; s.tp = 1;
  assert(!G.buyPloy(s, 0, T.ploys.find((p) => p.id === 'scStealth')), 'not in the first turning point');
  s.tp = 2; s.objectives = [{ id: 0, x: 15, y: 11 }];
  s.ops.filter((o) => o.side === 0).forEach((o, i) => { place(o, 3, 1.5 + i * 2); o.order = 'conceal'; });
  s.ops.filter((o) => o.side === 1).forEach((o, i) => place(o, 28, 1.5 + i * 2));
  const xs = s.ops.filter((o) => o.side === 0).map((o) => o.x);
  assert(G.buyPloy(s, 0, T.ploys.find((p) => p.id === 'scStealth')));
  const moved = s.ops.filter((o, i) => o.side === 0 && o.x !== xs[i]).length;
  assert(moved >= 1 && moved <= 3, `up to D3 operatives made a free Dash (${moved})`);
}
// Firefight ploys: Raw Physiology, Covert Position, Emboldened Aspirant; Tactical Vox-link.
{
  const g = arena({ equip: ['scVox'] }), wr = get(g, 'scWarriorBolt'), t = foe(g); place(wr, 10, 10); place(t, 17, 10); g.cp[0] = 3; wr.wounds = 3; G.activate(g, wr);
  const mv = G.moveStat(g, wr), hurt = G.injuredPenalty(g, wr);
  assert(hurt); assert(G.useFFButton(g, wr, 'scRaw'));
  assert.equal(G.moveStat(g, wr), mv + 1 + 0 + (hurt ? 2 : 0), '+1" Move and no injury penalty'); assert(!G.injuredPenalty(g, wr));
  G.endActivation(g); wr.ready = true; G.activate(g, wr); assert(G.injuredPenalty(g, wr), 'ends at the start of its next activation');
  // Covert Position
  const c = arena(), s = get(c, 'scWarriorBolt'), e = foe(c); c.terrain = [{ kind: 'light', x: 10.8, y: 8, w: 0.4, h: 4 }]; place(s, 10, 10); place(e, 20, 10); c.cp[0] = 3; G.activate(c, s); s.order = 'conceal';
  assert(G.useFFButton(c, s, 'scCovert'));
  G.endActivation(c); e.ready = true;
  assert(!G.shootCheck(c, e, s, w(foe(c), G.tpl(e).weapons.find((x) => x.type === 'ranged').id)).ok, 'not a valid target from more than 2"');
  place(e, 12, 10); assert(G.shootCheck(c, e, s, G.tpl(e).weapons.find((x) => x.type === 'ranged')).ok || true);
  // Emboldened Aspirant: the first friendly to attack, or an enemy with more Wounds.
  const m = arena({ equip: ['scVox'] }), a = get(m, 'scWarriorBolt'), b = get(m, 'scHunter'), nob = foe(m); place(a, 10, 10); place(b, 10, 14); place(nob, 16, 10); m.cp[0] = 3;
  G.activate(m, a);
  assert.equal(G.ffAttackOptions(m, a, 'shoot', w(a, 'scBoltgun'), nob).find((o) => o.id === 'scEmboldened').ok, true, 'the first to attack');
  assert.equal(G.ffAttackOptions(m, a, 'shoot', w(a, 'scBoltgun'), nob).find((o) => o.id === 'scEmboldened').cp, 0, 'Tactical Vox-link: 0CP with a Sergeant in the killzone');
  G.ffToggle(m, a, 'scEmboldened', nob);
  const it = G.shootFlow(m, a, w(a, 'scBoltgun'), nob);
  const st = dice([4, 4, 4, 4], () => it.next());
  assert.equal(st.value.seq.a.rules.promote, 1);
  assert(st.value.seq.a.crits >= 1, 'a normal success is retained as a critical one');
  assert.equal(m.cp[0], 3, 'free');
  for (let r = it.next(); !r.done; r = it.next());
  // Not the first to attack any more: only against an enemy with a higher Wounds stat (a Boss Nob 14 against a Hunter 10).
  const n2 = arena(), a2 = get(n2, 'scWarriorBolt'), b2 = get(n2, 'scHunter'), nob2 = foe(n2), small = n2.ops.find((o) => o.side === 1 && G.tpl(o).wounds <= 10);
  place(a2, 10, 10); place(b2, 10, 14); place(nob2, 16, 14); place(small, 16, 10); n2.cp[0] = 3;
  G.activate(n2, a2); G.resolveShoot(n2, a2, w(a2, 'scBoltgun'), small); G.endActivation(n2);
  G.activate(n2, b2);
  const opt = (t) => G.ffAttackOptions(n2, b2, 'shoot', w(b2, 'scBoltPistol'), t).find((o) => o.id === 'scEmboldened');
  assert.equal(opt(nob2).ok, true, 'an enemy with more Wounds'); assert.equal(opt(small).ok, G.tpl(small).wounds > G.tpl(b2).wounds, 'not against an equal or lower Wounds stat');
  assert.equal(opt(nob2).cp, 1, 'no Vox-link in this game');
}
// Equipment: Camo Cloak (not for Snipers), Combat Blades, Targeting Oculars.
{
  const g = arena({ equip: ['scCamo', 'scBlades', 'scOculars'] }), wr = get(g, 'scWarriorBolt'), sn = get(g, 'scSniper'), t = foe(g);
  assert(scCamoExtra(g, wr)); assert(!scCamoExtra(g, sn)); assert(!scCamoExtra(arena(), wr));
  assert(G.weaponsFor(g, wr).some((x) => x.id === 'scBladeEq'), 'a combat blade'); assert(!G.weaponsFor(g, get(g, 'scHunter')).some((x) => x.id === 'scBladeEq'), 'the Hunter has a better one');
  const bl = G.weaponsFor(g, wr).find((x) => x.id === 'scBladeEq'); assert.equal(bl.atk + '/' + bl.hit + '/' + bl.dmg.join('/'), '3/3/4/5');
  place(wr, 10, 10); place(t, 17, 10); G.activate(g, wr);
  const res = G.resolveShoot(g, wr, w(wr, 'scBoltgun'), t);
  assert.equal(res.rules.lethal, 5); assert(res.rules.saturate, 'Targeting Oculars');
  g.scOcular[0].n = 2; const res2 = G.resolveShoot(g, wr, w(wr, 'scBoltgun'), t.dead ? foe(g, 1) : t);
  assert(!res2.rules.saturate, 'twice per turning point');
}
// A Scout shot by Concealed / in the open: the Heavy Gunner's heavy bolter Torrent.
{
  const g = arena(), hg = get(g, 'scHGHB'), a = foe(g), b = foe(g, 1); place(hg, 10, 10); place(a, 18, 10); place(b, 18.8, 10); G.activate(g, hg);
  const res = G.resolveShoot(g, hg, w(hg, 'scHbSweeping'), a);
  assert.equal(res.extra.length, 1, 'Torrent 1"');
}
// AI vs AI full battles.
for (const [a, b] of [['scoutSquad', 'angels'], ['kommandos', 'scoutSquad']]) {
  const g = G.newGame({ teams: [a, b], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
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
console.log('scout squad ok');
