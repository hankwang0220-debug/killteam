import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { nightlordsRosterError } from '../js/data/nightlords.js';
import { prescienceOf, ncReady, ncObscure, ncDeath, ncForeboding } from '../js/nightlords.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 4177;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.nemesisClaw;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['nemesisClaw', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.5 + (i % 8) * 2.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const w = (o, id) => G.tpl(o).weapons.find((x) => x.id === id) || G.weaponsFor({ equip: [[], []] }, o).find((x) => x.id === id);
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const next = (a, b, d = 0.3) => { b.x = a.x + G.radius(a) + G.radius(b) + d; b.y = a.y; }; // b right beside a

// Team data: Visionary + five from the list; archetypes from the user; roster limits (Warriors repeat, others once).
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 6);
  assert.deepEqual(T.info.archetypes.map((a) => a.en), ['Infiltration', 'Seek & Destroy']);
  assert.equal(T.name.zh, '復仇之爪');
  assert.equal(nightlordsRosterError(T, {}), null);
  assert.equal(nightlordsRosterError(T, { ncGunnerPlasma: 'ncWarriorBolt', ncHeavyBolter: 'ncWarriorChain' }), null, 'Warriors repeat');
  assert(nightlordsRosterError(T, { ncScreecher: 'ncGunnerFlamer' }), 'two Gunners');
  assert(nightlordsRosterError(T, { ncScreecher: 'ncHeavyMissile' }), 'two Heavy Gunners');
  assert.throws(() => arena({ roster: { ncScreecher: 'ncGunnerFlamer' } }));
  // Every pick can be taken in any slot; the picks decide the weapons.
  const slotFor = { ncSkinthief: 'ncScreecher', ncVentrilokar: 'ncScreecher', ncGunnerMelta: 'ncGunnerPlasma', ncHeavyMissile: 'ncHeavyBolter', ncWarriorBolt: 'ncWarriorChain' };
  for (const [id, slot] of Object.entries(slotFor)) {
    const h = arena({ roster: { [slot]: id } });
    assert(get(h, id), id);
  }
  // The Visionary's four weapon options.
  assert.deepEqual(Object.keys(G.tpl(get(g, 'ncVisionary')).loadouts), ['fist', 'maul', 'power', 'plasma']);
  const v = arena({ loadouts: { ncVisionary: 'plasma' } });
  assert.deepEqual(G.weaponsFor(v, get(v, 'ncVisionary')).map((x) => x.id), ['ncPlasmaPistol', 'ncPlasmaPistolHot', 'ncChainblade']);
}
// Astartes: two Shoots need a bolt pistol / boltgun / scoped bolt pistol — the heavy bolter and missile launcher don't count.
{
  const g = arena(), h = get(g, 'ncHeavyBolter'), t = foe(g); h.x = 10; h.y = 10; t.x = 20; t.y = 10; G.activate(g, h);
  G.resolveShoot(g, h, w(h, 'ncHbFocused'), t);
  assert(!G.shootWeapon(g, h, w(h, 'ncHbSweeping')).ok, 'a second heavy bolter Shoot');
  assert(G.shootWeapon(g, h, w(h, 'ncBolt')).ok, 'then the bolt pistol');
  // counteracts under either order
  const o = get(g, 'ncWarriorChain'); o.ready = false; o.order = 'conceal';
  assert(G.counterCandidates(g, 0).includes(o));
}
// In Midnight Clad: obscured when more than 8" from every enemy it's visible to and within 1" of Heavy terrain.
{
  const g = arena(), n = get(g, 'ncWarriorChain'), e = foe(g);
  n.x = 10; n.y = 10; e.x = 22; e.y = 10;
  g.terrain = [{ kind: 'heavy', x: 10.9, y: 5.5, w: 0.4, h: 3.7 }]; // beside it, out of the way of the line of sight
  const vis = { visible: true, cover: false, obscured: false, defenceOptions: [] };
  assert(ncObscure(g, e, n, vis).obscured);
  e.x = 17; assert(!ncObscure(g, e, n, vis).obscured, 'an enemy within 8"');
  e.x = 22; g.terrain = []; assert(!ncObscure(g, e, n, vis).obscured, 'no Heavy terrain nearby');
  g.terrain = [{ kind: 'light', x: 10.9, y: 5.5, w: 0.4, h: 3.7 }]; assert(!ncObscure(g, e, n, vis).obscured, 'Light terrain doesn\'t count');
  g.terrain = [{ kind: 'heavy', x: 10.9, y: 5.5, w: 0.4, h: 3.7 }];
  assert(!ncObscure(g, n, e, vis).obscured, 'only for Nemesis Claw operatives');
}
// Prescience: D3 points in the Ready step, discarded at the end of the TP, none without the Visionary.
{
  const g = arena();
  dice([6], () => ncReady(g)); assert.equal(prescienceOf(g, 0), 3); // (D6 6 → D3 3)
  const v = get(g, 'ncVisionary');
  v.dead = true; assert.equal(prescienceOf(g, 0), 0, 'Visionary incapacitated'); v.dead = false;
  // Premonition: 1AP, a point for 1CP, once per TP, not while engaged.
  G.activate(g, v); const cp = g.cp[0];
  assert(can(g, v, 'ncPremonition'));
  G.doSelfAction(g, v, 'ncPremonition');
  assert.equal(g.cp[0], cp + 1); assert.equal(prescienceOf(g, 0), 2);
  assert(!can(g, v, 'ncPremonition'), 'once per TP');
  // Foreboding: skip an activation (the opponent goes next); once per TP.
  v.ap = 0; v.ready = false; G.endActivation(g);
  g.turn = 0; g.active = null; g.counter = false;
  assert(ncForeboding(g, 0)); assert.equal(g.turn, 1); assert.equal(prescienceOf(g, 0), 1);
  g.turn = 0; assert.equal(ncForeboding(g, 0), false, 'once per TP');
  // Portent: ignore one Normal Dmg die against the Visionary (shot).
  const g2 = arena(), v2 = get(g2, 'ncVisionary'), t = foe(g2); g2.prescience[0] = 2; v2.x = 20; v2.y = 10; t.x = 14; t.y = 10;
  G.activate(g2, t);
  const before = v2.wounds;
  dice([6, 6, 6, 6, 1, 1, 1], () => G.resolveShoot(g2, t, G.weaponsFor(g2, t).find((x) => x.type === 'ranged'), v2));
  assert(g2.prescience[0] < 2 || v2.wounds < before, 'Portent spent or no normal damage');
  // The end of the turning point discards the points.
  const g3 = arena(); g3.prescience = [5, 0, 0]; g3.ops.forEach((o) => { o.ready = false; }); get(g3, 'ncVisionary').ready = true; G.activate(g3, get(g3, 'ncVisionary'));
  G.endActivation(g3); assert.equal(g3.tp, 2); assert(prescienceOf(g3, 0) <= 3, 'the old points were discarded (only the new D3 remain)');
}
// Terrorchem: critical damage gives a token; D3 damage whenever it activates; Poison Objective.
{
  const g = arena(), f = get(g, 'ncFearmonger'), t = foe(g); f.x = 10; f.y = 10; t.x = 14; t.y = 10; G.activate(g, f);
  const vial = w(f, 'ncVial');
  assert.equal(vial.rules.limited, 1);
  dice([6, 3, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g, f, vial, t)); // (one critical: Devastating 3 — the target survives)
  assert(t.terrorchem?.[0], 'token on the target');
  g.turn = 1; G.endActivation(g);
  const before = t.wounds; t.ready = true; g.active = null; g.turn = 1;
  dice([2], () => G.activate(g, t));
  assert(t.wounds < before, 'D3 on activating');
  const o = g.objectives[0], f2 = arena();
  // Poison Objective
  const g2 = arena(), q = get(g2, 'ncFearmonger'), e = foe(g2); g2.objectives = [{ id: 0, x: 15, y: 11 }]; q.x = 14.2; q.y = 11; e.x = 28; e.y = 20;
  G.activate(g2, q); assert(can(g2, q, 'ncPoison'));
  G.doSelfAction(g2, q, 'ncPoison'); assert(g2.objectives[0].terrorchem[0]);
  assert.equal(can(g2, q, 'ncPoison'), false, 'one token per objective marker');
  q.x = 3; q.y = 3; e.x = 15.5; e.y = 11.8;
  const hp = e.wounds; dice([3, 3, 3, 3], () => G.doMove(g2, e, 'reposition', { pts: [{ x: e.x, y: e.y }, { x: 15.4, y: 11.5 }] }));
  assert(e.terrorchem?.[0], 'the first enemy to contest it'); assert(e.wounds < hp, '2D3');
}
// Screecher: enemies within 3" can't re-roll; Appetite for Cruelty; Cruel Tormenter; The Black Hunt.
{
  const g = arena({ roster: { ncScreecher: 'ncScreecher' } }), s = get(g, 'ncScreecher'), e = foe(g), n = get(g, 'ncWarriorChain');
  s.x = 10; s.y = 10; e.x = 12.5; e.y = 10;
  const wp = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 4, hit: 3, dmg: [3, 4], rules: { balanced: true, ceaseless: true } };
  const r = G.effectiveRules(g, e, wp, s);
  assert(!r.balanced && !r.ceaseless, 'no re-rolls within 3" of the Screecher');
  e.x = 16; assert(G.effectiveRules(g, e, wp, s).balanced);
  e.wounds = e.maxW - 1;
  assert.equal(G.effectiveRules(g, s, w(s, 'ncClaws'), e).lethal, 4, 'Appetite for Cruelty');
  assert.equal(G.effectiveRules(g, n, w(n, 'ncChainsword'), e).lethal, undefined, 'Cruel Tormenter: not injured');
  e.wounds = 1; assert.equal(G.effectiveRules(g, n, w(n, 'ncChainsword'), e).lethal, 5, 'Cruel Tormenter: injured');
  e.wounds = e.maxW; g.ploys[0] = ['ncBlackHunt']; assert(!G.effectiveRules(g, n, w(n, 'ncChainsword'), e).balanced);
  e.wounds = e.maxW - 1; assert(G.effectiveRules(g, n, w(n, 'ncChainsword'), e).balanced, 'The Black Hunt: a wounded enemy');
}
// Skinthief: Flay Them Alive; Proclivity for Murder (free Charge or Dash after a kill).
{
  const g = arena({ roster: { ncScreecher: 'ncSkinthief' } }), s = get(g, 'ncSkinthief'), t = foe(g), t2 = foe(g, 1);
  g.cp[0] = 3; s.x = 10; s.y = 10; next(s, t); t2.x = 15; t2.y = 10;
  G.activate(g, s);
  G.applyDamage(g, s, t, 99);
  assert(t.dead); assert.equal(t2.ncFlayTP, 1, 'Flay Them Alive on the visible enemy within 6"');
  assert.equal(s.acted.free.charge, 'murder'); assert.equal(g.ffUsed[0].ids.includes('ncMurder'), true);
  assert(can(g, s, 'charge') && can(g, s, 'dash'));
  const ap = s.ap; G.doMove(g, s, 'dash', { pts: [{ x: s.x, y: s.y }, { x: s.x + 2, y: s.y }] });
  assert.equal(s.ap, ap, 'free'); assert.equal(s.acted.free.charge, null, 'Charge or Dash: one of them');
}
// Ventrilokar: Icon Bearer; Disconcerting Mimicry (APL, order, Dash — each once per battle).
{
  const g = arena({ roster: { ncScreecher: 'ncVentrilokar' } }), v = get(g, 'ncVentrilokar'), e = foe(g), e2 = foe(g, 1);
  v.x = 10; v.y = 10; e.x = 14; e.y = 10; e2.x = 12; e2.y = 14; g.objectives = [{ id: 0, x: 15, y: 10 }];
  G.activate(g, v);
  assert(can(g, v, 'ncMimicApl') && can(g, v, 'ncMimicOrder') && can(g, v, 'ncMimicDash'));
  G.doTargetAction(g, v, 'ncMimicApl', e); assert.equal(e.aplNext, -1);
  assert.equal(can(g, v, 'ncMimicApl'), false, 'once per battle');
  const was = e2.order; v.ap = 3; G.doTargetAction(g, v, 'ncMimicOrder', e2); assert.notEqual(e2.order, was);
  v.ap = 3; const d0 = Math.hypot(e.x - 15, e.y - 10); G.doTargetAction(g, v, 'ncMimicDash', e);
  assert(Math.hypot(e.x - 15, e.y - 10) > d0, 'pulled off the objective marker');
  // Icon Bearer: counts 1 higher for control.
  const h = arena({ roster: { ncScreecher: 'ncVentrilokar' } }), v2 = get(h, 'ncVentrilokar'), n2 = get(h, 'ncWarriorChain'), f2 = foe(h); h.objectives = [{ id: 0, x: 15, y: 10 }];
  v2.x = 14.5; v2.y = 10; f2.x = 15.5; f2.y = 10.4; n2.x = 3; n2.y = 3;
  assert.equal(G.controller(h, h.objectives[0]), 0, 'APL 3 + 1 against APL 3');
}
// Ploys: We Have Come For You, Preysight, Return to Darkness.
{
  const g = arena(), n = get(g, 'ncWarriorChain'), t = foe(g); g.ploys[0] = ['ncWeCome'];
  n.x = 10; n.y = 10; t.x = 14; t.y = 10; G.activate(g, n);
  const hp = t.wounds; dice([2], () => G.doMove(g, n, 'charge', { pts: [{ x: 10, y: 10 }, { x: 13 - G.radius(n) - G.radius(t) + 0.8, y: 10 }] }));
  assert(t.wounds < hp, 'D3 at the end of a first-action Charge');
  const h = arena(), m = get(h, 'ncGunnerPlasma'); h.ploys[0] = ['ncPreysight'];
  const ps = G.weaponsFor(h, m).filter((x) => x.ps);
  assert(ps.length >= 2); assert(ps.every((x) => x.rules.range === 6 && x.rules.seekLight));
  assert(!G.weaponsFor(h, get(h, 'ncFearmonger')).some((x) => x.id === 'ncVial_ps'), 'Limited weapons have no Preysight version');
  // Return to Darkness: a free move of up to 4" ending beside Heavy terrain, not closer to the enemy.
  const r = arena(), q = get(r, 'ncWarriorChain'), e = foe(r); r.ploys[0] = ['ncReturn']; r.phase = 'strategy'; r.initiative = 0; r.stratStep = 0; r.turn = 0;
  r.ops.filter((o) => o.side === 0 && o !== q).forEach((o) => { o.x = 3; o.y = 20; }); q.x = 10; q.y = 10; e.x = 2; e.y = 10;
  r.terrain = [{ kind: 'heavy', x: 12.5, y: 7, w: 0.5, h: 6 }];
  G.finishPloys(r); G.finishPloys(r); // (strategy ends after two consecutive passes)
  assert(q.x > 10, 'it moved'); assert(12.5 - q.x <= 1 + G.radius(q) + 0.01, 'beside the Heavy terrain');
  assert(Math.hypot(q.x - e.x, q.y - e.y) >= 8 - 0.01, 'not closer to the enemy');
}
// Death to the False Emperor: Ceaseless against IMPERIUM, Relentless against ADEPTUS ASTARTES.
{
  const mk = () => ({ dice: [{ v: 1, res: 'miss' }, { v: 2, res: 'miss' }, { v: 6, res: 'crit' }] });
  const run = (foeId) => {
    const g = arena({ foe: foeId }), n = get(g, 'ncWarriorChain'), t = foe(g), pool = mk();
    dice([5, 5, 5], () => ncDeath(g, n, t, pool, () => true, () => {}));
    return pool.dice.map((d) => !!d.rr);
  };
  assert.deepEqual(run('angels'), [true, true, false], 'Relentless: every fail');
  assert.deepEqual(run('kasrkin'), [true, false, false], 'Ceaseless: results of 1');
  assert.deepEqual(run('kommandos'), [false, false, false], 'not IMPERIUM');
}
// Dirty Fighter: retaliating, one success is resolved first — and no other.
{
  const g = arena(), n = get(g, 'ncWarriorChain'), a = foe(g); n.x = 10; n.y = 10; next(n, a, 0.2);
  G.activate(g, a);
  dice([6, 6, 6, 6, 5, 5, 5, 5], () => G.startFight(g, a, G.tpl(a).weapons.find((x) => x.type === 'melee'), n));
  assert.equal(g.fight.turn, 'D', 'it resolves first'); assert(g.fight.D.dirty);
  assert(g.ffUsed[0].ids.includes('ncDirty'));
  G.fightApply(g, G.fightAutoChoice(g));
  assert.equal(g.fight.D.c + g.fight.D.n, 0, 'no other success');
}
// Equipment: Comms Jammers, Flayed Skin, Chain Snare, Grisly Trophy.
{
  const g = arena({ equip: ['ncJammers', 'ncSkin', 'ncSnare', 'ncTrophy'] }), n = get(g, 'ncWarriorChain'), e = foe(g);
  n.x = 10; n.y = 10; e.x = 12.5; e.y = 10; e.aplNext = 1;
  assert.equal(G.aplNow(g, e), G.tpl(e).apl, 'its APL can\'t be added to within 3"');
  e.x = 20; assert.equal(G.aplNow(g, e), G.tpl(e).apl + 1);
  const wp = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 4, hit: 3, dmg: [3, 4], rules: {} };
  e.x = 11.8; assert(G.effectiveRules(g, e, wp, n).noReroll1, 'Flayed Skin within 2"');
  e.x = 14; assert(!G.effectiveRules(g, e, wp, n).noReroll1);
  // Chain Snare: a Fall Back from its control range (the only enemy there)
  e.x = n.x + G.radius(n) + G.radius(e) + 0.3; e.y = 10; G.activate(g, e);
  const ap = e.ap; dice([6, 6], () => G.doMove(g, e, 'fallBack', { pts: [{ x: e.x, y: e.y }, { x: e.x + 3, y: e.y }] }));
  assert.equal(e.ap, ap, 'no AP spent'); assert(e.acted.fallBackDenied);
  // Grisly Trophy: a kill within 2" gives the token; enemies within 2" have -1 Atk.
  const h = arena({ equip: ['ncTrophy'] }), m = get(h, 'ncWarriorChain'), t = foe(h), t2 = foe(h, 1);
  m.x = 10; m.y = 10; t.x = 11.5; t.y = 10; t2.x = 11.5; t2.y = 11.4; G.activate(h, m);
  G.applyDamage(h, m, t, 99); assert(m.ncTrophy); assert(h.ncTrophyUsed[0]);
  assert.equal(G.effectiveRules(h, t2, wp, m).atkMinus, 1);
}
// Flayed enemy: can't control markers or perform mission actions this TP.
{
  const g = arena(), e = foe(g); g.objectives = [{ id: 0, x: 15, y: 10 }]; e.x = 15.3; e.y = 10;
  assert.equal(G.controller(g, g.objectives[0]), 1); e.ncFlayTP = 1; assert.equal(G.controller(g, g.objectives[0]), null);
}
// AI vs AI full battles.
for (const [a, b] of [['nemesisClaw', 'angels'], ['kommandos', 'nemesisClaw']]) {
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
console.log('nemesis claw ok');
