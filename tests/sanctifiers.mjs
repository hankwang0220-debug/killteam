import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { sanctifiersRosterError } from '../js/data/sanctifiers.js';
import { sfOrator, sfSermon, sfChooseOrator, sfGambitLeft, sfReady, sfDeclaim, sfNearOrator } from '../js/sanctifiers.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 7077;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.sanctifiers;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['sanctifiers', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [{}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 12) * 1.9; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const wp = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 1, hit: 2, dmg: [4, 6], rules: {} };

// Roster: Confessor + Cherub + nine picks; the limits.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 11);
  assert.equal(T.name.zh, '淨化者');
  assert.deepEqual(T.info.archetypes.map((a) => a.en), ['Security', 'Seek and Destroy']);
  assert.equal(sanctifiersRosterError(T, {}), null);
  const four = { sfConflagrator: 'sfPreacher', sfAssassin: 'sfPreacher', sfDrill: 'sfPreacher', sfMiraculist: 'sfPreacher' };
  assert.equal(sanctifiersRosterError(T, four), null, 'four Preachers');
  assert(sanctifiersRosterError(T, { ...four, sfReliquant: 'sfPreacher' }), 'five Preachers');
  assert(sanctifiersRosterError(T, { sfDrill: 'sfPersecutor' }), 'a duplicate Persecutor');
  assert(sanctifiersRosterError(T, { sfMissC: 'sfMissA' }), 'two Missionaries of the same group');
  assert(sanctifiersRosterError(T, { sfMissC: 'sfMissD' }), 'the two braziers (A and D)');
  assert.equal(sanctifiersRosterError(T, { sfMissC: 'sfMissC', sfMissA: 'sfMissB' }), null, 'B and C');
  assert(sanctifiersRosterError(T, { sfMissA: 'sfMissA', sfMissC: 'sfMissD' }), 'two braziers');
  assert.equal(sanctifiersRosterError(T, { sfMissA: 'sfMissB', sfMissC: 'sfMissD' }), null);
  assert.throws(() => arena({ roster: { sfDrill: 'sfPersecutor' } }));
  const c = G.tpl(get(g, 'sfConfessor')), ch = G.tpl(get(g, 'sfCherub'));
  assert.equal(c.wounds, 10); assert.equal(ch.move, 7); assert.equal(ch.wounds, 5);
  assert.equal(G.tpl(get(g, 'sfAssassin')).apl, 3);
  assert.equal(G.tpl(get(g, 'sfMiraculist')).save, 4);
}

// The Orator and the Sermon: the Confessor (6"), a replacement (3"); a holy relic always benefits.
{
  const g = arena();
  const conf = get(g, 'sfConfessor'), pers = get(g, 'sfPersecutor'), miss = get(g, 'sfMissC');
  assert.equal(sfOrator(g, 0), conf);
  place(conf, 10, 10); place(pers, 15, 10); place(miss, 22, 10);
  assert(sfSermon(g, pers), 'within 6" of the Confessor');
  assert(sfSermon(g, miss), 'holy relic');
  place(pers, 20, 10);
  assert(!sfSermon(g, pers), 'too far');
  const e = foe(g); place(e, 12.5, 10);
  assert(sfNearOrator(g, 0, e));
  conf.wounds = 0; conf.dead = true;
  assert.equal(sfOrator(g, 0), null);
  g.phase = 'strategy'; g.sfGambitTP = [0, 0];
  assert(sfGambitLeft(g, 0));
  assert(sfChooseOrator(g, 0, pers.uid));
  assert.equal(sfOrator(g, 0), pers);
  place(get(g, 'sfDrill'), 22, 10); place(pers, 20, 10);
  assert(sfSermon(g, get(g, 'sfDrill')), 'within 3" of a non-Confessor orator');
  place(get(g, 'sfDrill'), 24.5, 10);
  assert(!sfSermon(g, get(g, 'sfDrill')));
}

// Sermon damage: Normal and Critical Dmg of 4+ deals 1 less when shot.
{
  const run = (near) => {
    const g = arena(), conf = get(g, 'sfConfessor'), pers = get(g, 'sfPersecutor'), e = foe(g);
    place(conf, 10, 10); place(pers, near ? 12 : 22, 10); place(e, 24, 14); g.phase = 'firefight';
    G.activate(g, e); const before = pers.wounds;
    dice([6, 1, 1, 1], () => G.resolveShoot(g, e, wp, pers));
    return before - pers.wounds;
  };
  assert.equal(run(false), 6, 'no Sermon');
  assert.equal(run(true), 5, 'Sermon');
}

// Blaze: critical damage gives a token; D3 damage on activation, then it may be removed.
{
  const g = arena(), pers = get(g, 'sfPersecutor'), e = foe(g);
  place(pers, 10, 10); place(e, 14, 10); G.activate(g, pers);
  const flamer = G.weaponsFor(g, pers).find((w) => w.rules.blaze);
  dice([6, 6, 6, 6, 1, 1, 1], () => G.resolveShoot(g, pers, flamer, e));
  assert(e.sfBlaze?.[0], 'a Blaze token');
  G.endActivation(g);
  e.maxW = 12; e.wounds = 12; const w0 = e.wounds; g.turn = 1;
  dice([2, 2], () => G.activate(g, e));
  assert(w0 - e.wounds >= 1 && w0 - e.wounds <= 3, 'D3 damage');
  assert.equal(e.sfBlaze[0], true, 'a 2 leaves the token');
  e.sfBlazeTP[0] = 0;
  dice([2, 5], () => G.activate(g, e));
  assert.equal(e.sfBlaze[0], false, 'a 3+ removes it');
}

// Commanding Declamation: a D6 above APL cancels a Shoot (AP spent), once it works.
{
  const g = arena(), conf = get(g, 'sfConfessor'), e = foe(g), pers = get(g, 'sfPersecutor');
  place(conf, 10, 10); place(e, 14, 10); place(pers, 11, 14); G.activate(g, e);
  const ap = e.ap;
  const r = dice([6], () => G.resolveShoot(g, e, G.weaponsFor(g, e).find((w) => w.type === 'ranged'), pers));
  assert.equal(r.kind, 'sfDeclaim');
  assert.equal(e.ap, ap - 1, 'AP spent');
  assert(g.sfDecl[0]);
  const again = dice([6], () => sfDeclaim(g, e, 'shoot'));
  assert.equal(again, false, 'only once');
  const g2 = arena(), c2 = get(g2, 'sfConfessor'), e2 = foe(g2); place(c2, 10, 10); place(e2, 14, 10);
  assert.equal(dice([2], () => sfDeclaim(g2, e2, 'shoot')), false, 'a low roll');
  assert.equal(g2.sfDecl[0], false);
  place(e2, 20, 10);
  assert.equal(dice([6], () => sfDeclaim(g2, e2, 'shoot')), false, 'out of range');
}

// Incentivise (Cherub): +1 APL for another friendly SANCTIFIER (not Confessor, Assassin, Miraculist or the orator).
{
  const g = arena(), ch = get(g, 'sfCherub'), pers = get(g, 'sfPersecutor'), conf = get(g, 'sfConfessor');
  place(ch, 10, 10); place(pers, 11.5, 10); place(conf, 10, 12); place(get(g, 'sfMiraculist'), 11, 8);
  G.activate(g, ch);
  const ts = G.TARGET_ACTIONS.sfIncentivise.targets(g, ch).map((o) => o.tplId);
  assert(ts.includes('sfPersecutor')); assert(!ts.includes('sfConfessor')); assert(!ts.includes('sfMiraculist'));
  assert(can(g, ch, 'sfIncentivise'));
  assert(!can(g, ch, 'shoot') && !can(g, ch, 'sfOrb'), 'the Cherub only moves, fights and incentivises');
  G.doTargetAction(g, ch, 'sfIncentivise', pers);
  assert.equal(G.aplNow(g, pers), 3);
}

// Null Skull (Drill Abbot): an enemy within 4" can't have a positive APL change.
{
  const g = arena(), dr = get(g, 'sfDrill'), e = foe(g);
  place(dr, 10, 10); place(e, 13, 10); e.aplNext = 1;
  assert.equal(G.aplNow(g, e), G.tpl(e).apl);
  place(e, 20, 10);
  assert.equal(G.aplNow(g, e), G.tpl(e).apl + 1);
}

// Miracle: the first time the Miraculist would be incapacitated it stays on 1 wound.
{
  const g = arena(), mir = get(g, 'sfMiraculist'), e = foe(g);
  place(mir, 10, 10); place(e, 14, 10); G.activate(g, e);
  mir.wounds = 2;
  const big = { ...wp, atk: 4, dmg: [5, 6] };
  dice([6, 6, 6, 6, 1, 1, 1, 1], () => G.resolveShoot(g, e, big, mir));
  assert.equal(mir.dead, false);
  assert.equal(mir.wounds, 1);
  assert.equal(mir.convictionUsed, true);
}

// Wreathe in Fire (Miraculist): attacks every enemy within 1", even when engaged; Limited 1.
{
  const g = arena(), mir = get(g, 'sfMiraculist'), e = foe(g), e2 = foe(g, 1);
  place(mir, 10, 10); place(e, 11.4, 10); place(e2, 10, 11.4); G.activate(g, mir);
  assert(can(g, mir, 'sfWreathe'));
  assert(!G.shootWeapon(g, mir, G.weaponsFor(g, mir).find((w) => w.rules.wreathed)).ok, 'not a normal Shoot');
  const w0 = 24;
  e.wounds = e.maxW = 12; e2.wounds = e2.maxW = 12;
  dice([6, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 1, 1], () => G.doSelfAction(g, mir, 'sfWreathe'));
  assert(e.wounds + e2.wounds < w0, 'damage');
  assert(!can(g, mir, 'sfWreathe'), 'Limited 1');
  assert(e.sfBlaze?.[0] || e2.sfBlaze?.[0], 'Blaze');
}

// Sanctification Orb: Doused enemies are Seek targets for Blaze weapons.
{
  const g = arena(), con = get(g, 'sfConflagrator'), e = foe(g), e2 = foe(g, 1);
  place(con, 10, 10); place(e, 14, 10); place(e2, 14.5, 10.5); G.activate(g, con);
  assert(can(g, con, 'sfOrb'), 'the Rack, without equipment');
  dice([3, 3], () => G.doTargetAction(g, con, 'sfOrb', e));
  assert(e.sfDoused?.[0]);
  const fl = G.weaponsFor(g, con).find((w) => w.rules.blaze && w.rules.torrent);
  assert(G.effectiveRules(g, con, fl, e).seek, 'Seek');
  assert(!G.effectiveRules(g, con, G.weaponsFor(g, con).find((w) => w.type === 'melee'), e).seek);
  const g2 = arena(), pers = get(g2, 'sfPersecutor'); place(pers, 10, 10); G.activate(g2, pers);
  assert(!can(g2, pers, 'sfOrb'), 'needs the equipment');
  const g3 = arena({ equip: ['sfOrbs'] }), pers3 = get(g3, 'sfPersecutor'), e3 = foe(g3); place(pers3, 10, 10); place(e3, 14, 10); G.activate(g3, pers3);
  assert(can(g3, pers3, 'sfOrb'));
}

// Ploys: Fervent Brawl (Ceaseless), Zealous Persecution (Lethal 5+ after a Charge), Spread the Word (Severe).
{
  const g = arena(), conf = get(g, 'sfConfessor'), pers = get(g, 'sfPersecutor'), e = foe(g);
  place(conf, 10, 10); place(pers, 12, 10); place(e, 13, 10);
  const melee = G.weaponsFor(g, pers).find((w) => w.type === 'melee');
  assert(!G.effectiveRules(g, pers, melee, e).ceaseless);
  g.ploys[0].push('sfBrawl');
  assert(G.effectiveRules(g, pers, melee, e).ceaseless, 'Fervent Brawl');
  g.ploys[0].push('sfZealous');
  assert(!G.effectiveRules(g, pers, melee, e).lethal);
  G.activate(g, pers); pers.acted.charge = 1;
  assert.equal(G.effectiveRules(g, pers, melee, e).lethal, 5, 'Zealous Persecution');
  const sp = get(g, 'sfMissA'); place(sp, 20, 12);
  const f2 = G.weaponsFor(g, sp).find((w) => w.type === 'ranged');
  assert(G.effectiveRules(g, sp, f2, e).severe, 'Spread the Word');
  place(sp, 11, 12);
  assert(!G.effectiveRules(g, sp, f2, e).severe);
}

// Rosarius: a Normal damage die on a Sanctifier is ignored (firefight ploy, 1CP).
{
  const run = (cp) => {
    const g = arena(), pers = get(g, 'sfPersecutor'), e = foe(g);
    place(pers, 10, 10); place(e, 14, 10); G.activate(g, e); pers.wounds = 7;
    g.cp[0] = cp;
    const w = { ...wp, dmg: [3, 3] };
    dice([4, 1, 1, 1], () => G.resolveShoot(g, e, w, pers));
    return 7 - pers.wounds;
  };
  assert.equal(run(0), 3, 'no CP');
  assert.equal(run(2), 0, 'Rosarius');
}

// Equipment: Ecclesiarchy Texts (+1CP when 3D6 is below the orator's wounds, after the first turning point).
{
  const g = arena({ equip: ['sfTexts'], tp: 2 });
  const cp = g.cp[0];
  dice([1, 1, 1], () => sfReady(g));
  assert.equal(g.cp[0], cp + 1);
  dice([6, 6, 6], () => sfReady(g));
  assert.equal(g.cp[0], cp + 1, 'a high roll');
  const g1 = arena({ equip: ['sfTexts'], tp: 1 });
  dice([1, 1, 1], () => sfReady(g1));
  assert.equal(g1.cp[0], 3, 'nothing in the first turning point');
}
// Conversion Field (Salvationist): saves 1 better when shot from more than 6" away.
{
  const g = arena(), sal = get(g, 'sfSalvationist'), pers = get(g, 'sfPersecutor'), e = foe(g);
  place(sal, 10, 10); place(pers, 12, 10); place(e, 24, 10);
  const { sfConversion } = await import('../js/sanctifiers.js');
  assert.equal(sfConversion(g, e, pers), 1);
  place(e, 14, 10);
  assert.equal(sfConversion(g, e, pers), 0, 'the shooter is within 6" of the Salvationist');
  place(e, 24, 10); place(pers, 18, 10);
  assert.equal(sfConversion(g, e, pers), 0, 'the target is more than 6" from the Salvationist');
  assert(G.TARGET_ACTIONS.medikit && G.tpl(sal).medikit, 'Medikit');
}

// Merciless Castigation and Fanatical Retribution (Persecutor).
{
  const g = arena(), pers = get(g, 'sfPersecutor'), e = foe(g);
  place(pers, 10, 10); place(e, 11.2, 10); e.wounds = e.maxW = 40; pers.wounds = pers.maxW = 40;
  G.activate(g, pers);
  dice([4, 4, 4, 4, 1, 1, 1, 1], () => G.resolveFight(g, pers, G.weaponsFor(g, pers).find((w) => w.type === 'melee'), e));
  assert.equal(pers.acted.free?.fight, e.uid, 'a free Fight against the same enemy');
  const g2 = arena(), p2 = get(g2, 'sfPersecutor'), e2 = foe(g2);
  place(p2, 10, 10); place(e2, 11.2, 10); p2.wounds = 1; e2.wounds = e2.maxW = 40; G.activate(g2, e2);
  const f = dice([6, 6, 1, 1, 1, 6, 6, 6, 1, 1], () => G.resolveFight(g2, e2, G.weaponsFor(g2, e2).find((w) => w.type === 'melee'), p2));
  assert(p2.dead, 'incapacitated');
  assert(f.steps.some((s) => s.lastBlow) || e2.wounds < 40, 'Fanatical Retribution: a last strike');
}

// Redeemed Through Fire: an incapacitated Blaze carrier sets nearby enemies alight; Imperial Cult Devotion: a last free shot.
{
  const g = arena(), pers = get(g, 'sfPersecutor'), e = foe(g), e2 = foe(g, 1), rel = get(g, 'sfReliquant');
  place(pers, 10, 10); place(rel, 8, 10); place(e, 11.4, 10); place(e2, 12, 10.6); e.wounds = e.maxW = 30;
  G.activate(g, e); pers.wounds = 1; pers.readyAtDeath = true;
  const big = { ...wp, atk: 4, dmg: [5, 6] };
  dice([6, 6, 6, 6, 1, 1, 1, 1, 6, 6, 6, 6, 1, 1, 1, 1], () => G.resolveShoot(g, e, big, pers));
  assert(pers.dead);
  assert(e2.sfBlaze?.[0] || e.sfBlaze?.[0], 'Redeemed Through Fire');
  assert(e.wounds < 30 || e2.wounds < e2.maxW, 'Imperial Cult Devotion: a last shot');
}

// Equipment: Purity Seals (a fail kept as a normal success) and Imperial Cult Symbols (a crit becomes normal).
{
  const g = arena({ equip: ['sfSeals'], foe: 'plagueMarines' }), pers = get(g, 'sfPersecutor'), e = foe(g);
  place(pers, 10, 10); place(e, 14, 10); e.wounds = e.maxW = 40; G.activate(g, pers);
  const flat = { ...wp, atk: 2, hit: 4, dmg: [2, 2] };
  dice([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g, pers, flat, e));
  assert.equal(g.sfUsed[0].seals, 1, 'Purity Seals');
  assert(e.wounds < 40, 'the retained success hit');
  const g2 = arena({ equip: ['sfSymbols'] }), conf = get(g2, 'sfConfessor'), p2 = get(g2, 'sfPersecutor'), e2 = foe(g2);
  place(conf, 10, 10); place(p2, 12, 10); place(e2, 24, 10); G.activate(g2, e2); p2.wounds = p2.maxW = 30;
  const h = dice([6, 1, 1, 1], () => G.resolveShoot(g2, e2, wp, p2));
  assert.equal(h.remC, 0, 'the crit became a normal success'); assert.equal(h.remN, 1);
  assert.equal(g2.sfUsed[0].symbols, 1);
}

// Unwavering Devotion: another Sanctifier takes the shot meant for the orator or the Miraculist.
{
  const g = arena(), mir = get(g, 'sfMiraculist'), pers = get(g, 'sfPersecutor'), e = foe(g);
  place(mir, 10, 10); place(pers, 11.5, 10); place(e, 24, 10); G.activate(g, e);
  const w = G.weaponsFor(g, e).find((x) => x.type === 'ranged');
  const r = dice([1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g, e, w, mir));
  assert.notEqual(r.target, mir.uid, 'redirected');
  const g2 = arena(), m2 = get(g2, 'sfMiraculist'), e2 = foe(g2); g2.cp[0] = 0;
  place(m2, 10, 10); place(get(g2, 'sfPersecutor'), 11.5, 10); place(e2, 24, 10); G.activate(g2, e2);
  const r2 = dice([1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g2, e2, G.weaponsFor(g2, e2).find((x) => x.type === 'ranged'), m2));
  assert.equal(r2.target, m2.uid, 'no CP');
}

// Rally the Flock: a free Dash towards the orator for each Sanctifier benefitting from the Sermon.
{
  const g = arena({ tp: 2 }), conf = get(g, 'sfConfessor'), pers = get(g, 'sfPersecutor'), e = foe(g);
  g.phase = 'strategy'; g.initiative = 0; g.stratTurn = 0; g.stratPasses = 0; g.cp[0] = 3;
  place(conf, 10, 10); place(pers, 15.5, 10); place(e, 26, 10);
  const x0 = pers.x;
  assert(G.buyPloy(g, 0, T.ploys.find((p) => p.id === 'sfRally')));
  assert(pers.x < x0, 'closer to the Confessor');
}

// Cherub: Fly moves it over terrain and a Charge doesn't gain +2".
{
  const g = arena({ terrain: [{ kind: 'heavy', x: 12, y: 8, w: 1, h: 6, id: 'w' }] }), ch = get(g, 'sfCherub');
  place(ch, 9, 10); G.activate(g, ch);
  assert.equal(G.moveAllowance(g, ch, 'charge'), 7);
  assert.equal(G.moveAllowance(g, ch, 'dash'), 3);
}

// AI vs AI full battles.
for (const [a, b] of [['sanctifiers', 'angels'], ['kommandos', 'sanctifiers'], ['sanctifiers', 'sanctifiers']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'sanctifiers' ? ['sfOrbs', 'sfSymbols', 'sfSeals', 'sfTexts'] : [], b === 'sanctifiers' ? ['sfOrbs', 'sfTexts'] : []] });
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
console.log('sanctifiers ok');
