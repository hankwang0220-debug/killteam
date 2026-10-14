import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as W from '../js/wolfscouts.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { wolfRosterError } from '../js/data/wolfscouts.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 31313;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }

function arena(opts = {}) {
  const g = G.newGame({ teams: ['wolfScouts', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = o.side === 0 ? 3 + (i % 6) * 1.6 : 27; o.y = o.side === 0 ? 4 + Math.floor(i / 6) * 2 : 2 + i * 1.8; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.side === 0 && o.tplId === id);
const foes = (g) => g.ops.filter((o) => o.side === 1);
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const clear = (g, keep = []) => g.ops.forEach((o) => { if (!keep.includes(o)) place(o, -99, -99); });
const ids = (g, o) => G.availableActions(g, o).map((a) => a.id);
const okIds = (g, o) => G.availableActions(g, o).filter((a) => a.ok).map((a) => a.id);
const buy = (g, side, id) => { if (!g.ploys[side].includes(id)) g.ploys[side].push(id); };
const storm = (g, x, y) => { g.ws.storm[0] = { x, y }; };

// Roster: the Wolf + five picks (each once except Hunters); Cast the Runes at set-up.
{
  const g = arena(), t = TEAM_MAP.wolfScouts;
  assert.equal(g.ops.filter((o) => o.side === 0).length, 6);
  assert(get(g, 'wsWolf') && !get(g, 'wsTrap'), 'no Trapmaster by default');
  assert.equal(wolfRosterError(t, {}), null);
  assert(wolfRosterError(t, { wsFang: ['wsGunner'] }), 'two Gunners');
  assert.equal(wolfRosterError(t, { wsFang: ['wsHunter'], wsFrost: ['wsHunter'] }), null, 'Hunters repeat');
  assert.throws(() => G.newGame({ teams: ['wolfScouts', 'angels'], ai: null, roster: [{ wsFang: ['wsLeader'] }] }));
  assert.equal(g.ws.runes[0].dice.length, 3, 'Cast the Runes');
  const w = get(g, 'wsWolf');
  assert(!okIds(g, w).includes('shoot'));
  w.order = 'conceal'; clear(g, [w, foes(g)[0]]); place(w, 10, 10); place(foes(g)[0], 15, 10); G.activate(g, w);
  assert(okIds(g, w).includes('charge'), 'the Wolf Charges on Conceal');
}

// Elemental Storm: placement, wholly within, Concealed Charge only ending in the storm.
{
  const g = arena(), h = get(g, 'wsLeader'), e = foes(g)[0]; clear(g, [h, e]); g.phase = 'strategy';
  assert(W.wsStormOk(g, 0)); assert(W.wsPlaceStorm(g, 0, { x: 10, y: 10 })); assert(!W.wsStormOk(g, 0), 'once per TP');
  place(h, 14, 10); assert(W.inStorm(g, 0, h)); place(h, 15.6, 10); assert(!W.inStorm(g, 0, h), 'wholly within 6"');
  g.phase = 'firefight'; place(h, 12, 10); place(e, 16, 10); h.order = 'conceal'; G.activate(g, h);
  assert(okIds(g, h).includes('charge'), 'Concealed Charge with a storm');
  assert(W.wsChargeEndOk(g, h, { x: 14.5, y: 10 })); assert(!W.wsChargeEndOk(g, h, { x: 17, y: 12 }));
}

// Hunting Astartes: two Shoots with plasma cost 1 more; never two PSYCHIC weapons.
{
  const g = arena(), gun = get(g, 'wsGunner'), e = foes(g)[0]; clear(g, [gun, e]); place(gun, 10, 10); place(e, 18, 10);
  G.activate(g, gun); gun.ap = 4;
  const pg = G.weaponsFor(g, gun).find((w) => w.id === 'wsPGunS');
  dice([1, 1, 1, 1, 6, 6, 6], () => G.resolveShoot(g, gun, pg, e));
  assert.equal(G.shootWeapon(g, gun, pg).ap, 2, 'second plasma Shoot: 2AP');
  const g2 = arena(), sk = get(g2, 'wsSkjald'), e2 = foes(g2)[0]; clear(g2, [sk, e2]); place(sk, 10, 10); place(e2, 14, 10);
  G.activate(g2, sk); sk.ap = 4;
  const jaws = G.weaponsFor(g2, sk).find((w) => w.id === 'wsJaws'), th = G.weaponsFor(g2, sk).find((w) => w.id === 'wsThunder'), bp = G.weaponsFor(g2, sk).find((w) => w.id === 'wsBoltPistol');
  dice([1, 1, 1, 1, 6, 6, 6], () => G.resolveShoot(g2, sk, jaws, e2));
  assert(!G.shootCheck(g2, sk, e2, th).ok, 'not two PSYCHIC weapons');
  assert(G.shootCheck(g2, sk, e2, bp).ok, 'a bolt pistol after');
}

// Storm rules: Tempest's Fury, Fierce Temperament, Frost Weapons, Spiritual Chirurgy.
{
  const g = arena({ equip: ['wsFrostW'], roster: { wsFrost: ['wsHunter'] } }), gun = get(g, 'wsGunner'), hu = get(g, 'wsHunter'), f = get(g, 'wsFang');
  clear(g, [gun, hu, f]); storm(g, 10, 10); place(gun, 10, 10); place(hu, 12, 10); place(f, 20, 20);
  const sup = G.weaponsFor(g, gun).find((w) => w.id === 'wsPGunC');
  assert(sup.rules.punishing && !sup.rules.hot, "Tempest's Fury");
  assert(G.weaponsFor(g, hu).every((w) => w.rules.severe), 'Fierce Temperament');
  assert.equal(G.weaponsFor(g, hu).find((w) => w.rules.wsBlade).rules.lethal, 5, 'Frost Weapons');
  place(gun, 25, 20); assert(G.weaponsFor(g, gun).find((w) => w.id === 'wsPGunC').rules.hot, 'outside: Hot');
  hu.wounds = 3; assert(!G.injuredPenalty(g, hu), 'Spiritual Chirurgy');
  const w = get(g, 'wsWolf'); w.wounds = 2; assert(G.injuredPenalty(g, w), 'not the Wolf');
  const g2 = arena({ roster: { wsFang: ['wsHunter'] } }), h2 = get(g2, 'wsLeader'); h2.wounds = 3; assert(G.injuredPenalty(g2, h2), 'without a Fangbearer');
}

// Healing Balms (once per TP), Hunter's Senses, Frosteye Guard in the storm on Conceal.
{
  const g = arena(), f = get(g, 'wsFang'), l = get(g, 'wsLeader'), fr = get(g, 'wsFrost'), e = foes(g)[0]; clear(g, [f, l, fr, e]);
  place(f, 10, 10); place(l, 11.4, 10); place(fr, 5, 5); place(e, 25, 18); l.wounds = 5;
  G.activate(g, f); assert(okIds(g, f).includes('wsBalm'));
  dice([6], () => G.TARGET_ACTIONS.wsBalm.apply(g, f, l)); assert.equal(l.wounds, 11, 'D3+3 = 6');
  assert(!okIds(g, f).includes('wsBalm'), 'once per TP');
  G.endActivation(g); G.activate(g, fr);
  W.wsSelf(g, fr, 'wsSensesSat'); assert(G.weaponsFor(g, fr).find((w) => w.id === 'wsCarbine').rules.saturate);
  assert(W.wsNoObscure(g, fr, G.weaponsFor(g, fr).find((w) => w.id === 'wsCarbine')));
  fr.order = 'conceal'; assert(!okIds(g, fr).includes('wsGuard'), 'no storm: no Guard');
  storm(g, 5, 5); assert(okIds(g, fr).includes('wsGuard'), 'in the storm, on Conceal');
  W.wsSelf(g, fr, 'wsGuard'); assert(fr.dwGuard);
}

// Lupine Guile; Grizzled Veteran.
{
  const g = arena(); g.phase = 'initiative'; g.initLocked = false; g.initRoll = [1, 6];
  assert(W.wsGuileOk(g, 0)); dice([5], () => W.wsUseGuile(g, 0)); assert.equal(g.initRoll[0], 5); assert(!W.wsGuileOk(g, 0), 'once per battle');
  const g2 = arena(), l = get(g2, 'wsLeader'), e = foes(g2)[0];
  G.applyDamage(g2, e, l, 99); assert(!l.dead); assert.equal(l.wounds, 1, 'Grizzled Veteran');
}

// Cast the Runes: a free Command Re-roll in the matching turning point.
{
  const g = arena(); g.ws.runes[0] = { dice: [2, 2, 5], used: {} }; g.tp = 2; g.cp[0] = 0;
  assert(W.wsRuneFree(g, 0)); W.wsRuneUsed(g, 0); assert(W.wsRuneFree(g, 0)); W.wsRuneUsed(g, 0); assert(!W.wsRuneFree(g, 0));
  g.tp = 1; assert(!W.wsRuneFree(g, 0));
}

// Call the Storm: move the storm, or veil a friendly (obscured in the storm more than 3" from the shooter).
{
  const g = arena(), sk = get(g, 'wsSkjald'), gun = get(g, 'wsGunner'), e = foes(g)[0]; clear(g, [sk, gun, e]);
  place(sk, 10, 10); place(gun, 12, 12); place(e, 22, 12);
  G.activate(g, sk); G.TARGET_ACTIONS.wsCallMove.apply(g, sk, gun); assert.deepEqual(g.ws.storm[0], { x: 12, y: 12 });
  G.TARGET_ACTIONS.wsCallVeil.apply(g, sk, gun);
  assert(G.visibility(g, e, gun).obscured, 'veiled');
  place(e, 14, 12); assert(!G.visibility(g, e, gun).obscured, 'within 3"');
}

// Haywire Mine: placed, set off by another operative's move (2D3+3, or D3+6 near the storm), not by the Trapmaster.
{
  const g = arena({ roster: { wsFang: ['wsTrap'] } }), tr = get(g, 'wsTrap'), e = foes(g)[0]; clear(g, [tr, e]);
  place(tr, 10, 10); place(e, 25, 10); G.activate(g, tr);
  assert(okIds(g, tr).includes('wsPlaceMine')); W.wsSelf(g, tr, 'wsPlaceMine');
  const m = g.markers.find((x) => x.kind === 'wsMine'); assert.equal(m.carriedBy, null);
  W.wsMoved(g, tr, { pts: [{ x: 10, y: 10 }] }); assert(g.markers.includes(m), 'the Trapmaster is ignored');
  assert(G.canPickUpMarker(g, tr, m)); assert(!G.canPickUpMarker(g, e, m));
  const w0 = e.wounds;
  dice([6, 6], () => W.wsMoved(g, e, { pts: [{ x: 25, y: 10 }, { x: 10.5, y: 11.2 }] }));
  assert(!g.markers.includes(m)); assert.equal(w0 - e.wounds, 9, '2D3+3 (3+3+3)'); assert.equal(e.aplNext, -1);
}

// Pounce: a free move in the Strategy phase, then -1 APL and no moves in its next activation.
{
  const g = arena(), w = get(g, 'wsWolf'), e = foes(g)[0]; clear(g, [w, e]); place(w, 10, 10); place(e, 30, 20); g.phase = 'strategy';
  assert(W.wsPounceOk(g, 0));
  const path = W.wsPouncePath(g, 0, 'reposition', { x: 14, y: 10 }); assert(path);
  assert(W.wsPounce(g, 0, 'reposition', path)); assert(Math.abs(w.x - 14) < 0.6); assert(!W.wsPounceOk(g, 0), 'once per battle');
  g.phase = 'firefight'; G.activate(g, w); assert.equal(w.ap, 1, 'APL -1');
  assert(!ids(g, w).includes('reposition') && !ids(g, w).includes('charge'));
  G.endActivation(g); assert(!w.wsPounceBlock);
}

// Ploys and equipment: Cloaked by the Storm, Tempestuous Wrath, Storm's Bite, Savage Fighters, Talismanic Trophies, Runic Charms, Wolfteeth.
{
  const g = arena({ equip: ['wsCharms', 'wsTeeth', 'wsTrophies'] }), l = get(g, 'wsLeader'), e = foes(g)[0]; clear(g, [l, e]); storm(g, 10, 10);
  place(l, 10, 10); place(e, 11.3, 10);
  buy(g, 0, 'wsWrath'); const pw = G.weaponsFor(g, l).find((w) => w.id === 'wsPower');
  assert(G.effectiveRules(g, l, pw, e).balanced, 'Tempestuous Wrath');
  const r = {}; W.wsDefence(g, l, r); assert(!r.balanced); buy(g, 0, 'wsCloak'); W.wsDefence(g, l, r); assert(r.balanced, 'Cloaked by the Storm');
  buy(g, 0, 'wsBite'); const dr = {}; W.wsBite(g, l, e, { atk: 5 }, dr); assert.equal(dr.atkMinus, 1); const dr3 = {}; W.wsBite(g, l, e, { atk: 3 }, dr3); assert(!dr3.atkMinus, 'minimum 3');
  const seq = {}; assert.equal(W.wsTrophy(g, l, 4, true, seq), 3); assert.equal(W.wsTrophy(g, l, 4, true, seq), 4, 'once per sequence');
  const rules = { piercing: 1 }; W.wsCharms(g, e, l, rules); assert.equal(rules.piercing, 0); const r2 = { piercing: 1 }; W.wsCharms(g, e, l, r2); assert.equal(r2.piercing, 1, 'once per TP');
  buy(g, 0, 'wsSavage'); const ew = e.wounds; dice([6], () => W.wsSavage(g, e, l)); assert.equal(ew - e.wounds, 4, 'D3+1');
}

// Counterattack: at the end of an enemy's activation, a friendly in its control range fights it for free (1CP).
{
  const g = arena(), l = get(g, 'wsLeader'), e = foes(g)[0]; clear(g, [l, e]); place(l, 10, 10); place(e, 11.4, 10);
  g.cp[0] = 2; G.activate(g, e); const ew = e.wounds;
  dice([6, 6, 6, 6, 6, 1, 1, 1, 1, 1], () => G.endActivation(g));
  assert.equal(g.cp[0], 1, 'Counterattack: 1CP'); assert(e.wounds < ew || e.dead, 'the free Fight hit');
  assert(!g.fight && !g.wsCounterNow);
}

// The AI: storm and Pounce.
{
  const g = arena(); g.phase = 'strategy'; g.stratTurn = 0;
  W.wsAiStrategy(g, 0, () => null);
  assert(g.ws.storm[0], 'the computer places the storm');
}

// AI vs AI full battles.
for (const [a, b] of [['wolfScouts', 'angels'], ['kommandos', 'wolfScouts'], ['wolfScouts', 'stealthSuits']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'wolfScouts' ? ['wsFrostW', 'wsCharms', 'wsTeeth', 'wsTrophies'] : [], b === 'wolfScouts' ? ['wsCharms', 'wsTeeth'] : []], roster: [a === 'wolfScouts' ? { wsFang: ['wsTrap'] } : {}, {}] });
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
console.log('wolfscouts ok');
