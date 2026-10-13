import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { wreckaRosterError } from '../js/data/wrecka.js';
import { wreckaOf, shokked } from '../js/wrecka.js';
import { moveCtx, findPath } from '../js/path.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 1203;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.wreckaKrew;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['wreckaKrew', 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.5 + (i % 8) * 2.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const w = (o, id) => G.weaponsFor({ equip: [[], []] }, o).find((x) => x.id === id) || G.tpl(o).weapons.find((x) => x.id === id);
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;

// Team data: Boss Nob, two Bomb Squigs and five more; only Fighters and Gunners repeat; archetypes from the user.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 8);
  assert.equal(g.ops.filter((o) => o.tplId === 'wkSquig').length, 2);
  assert.deepEqual(T.info.archetypes.map((a) => a.en), ['Security', 'Seek & Destroy']);
  assert.equal(T.name.zh, '破壞專隊');
  assert.equal(wreckaRosterError(T, { wkKrusha: 'wkFighter', wkDemolisha: 'wkFighter' }), null, 'Fighters repeat');
  assert(wreckaRosterError(T, { wkFighter: 'wkKrusha' }), 'Krusha only once');
  assert.throws(() => arena({ roster: { wkFighter: 'wkDemolisha' } }));
  // Bomb Squigs are Expendable: the enemy's kill grade uses six starting operatives.
  assert.deepEqual(G.killThresholds(g, 1), [1, 2, 4, 5, 6]);
}
// Tanked Up: the first Shoot on an Engage order adds 1 APL (and 1AP now); not for Bomb Squigs or on Conceal.
{
  const g = arena(), o = get(g, 'wkGunner'), t = foe(g); o.x = 10; o.y = 10; t.x = 20; t.y = 10;
  G.activate(g, o); const ap = o.ap;
  G.resolveShoot(g, o, w(o, 'wkEavyRokkit'), t);
  assert.equal(o.ap, ap - 1 + 1, 'the Shoot is paid for by Tanked Up');
  assert.equal(G.aplNow(g, o), 3); assert(o.wkTanked);
  o.ready = false; G.endActivation(g);
  o.ready = true; G.activate(g, o); assert.equal(o.wkTanked, false, 'until the start of its next activation');
}
// Wrecka Rampage: 6s gain points (max 6), points turn up to two fails into normal successes; Wrecka Boss +1.
{
  const g = arena(), o = get(g, 'wkNob'), t = foe(g); o.x = 10; o.y = 10; t.x = 17; t.y = 10;
  G.activate(g, o);
  const it = G.shootFlow(g, o, w(o, 'wkRokkitPistol'), t);
  const stage = dice([6, 6, 1, 1, 1, 2], () => it.next());
  assert.equal(stage.value.stage, 'attack');
  // +1 Wrecka Boss, +2 sixes = 3, then 2 spent on two of the four fails.
  assert.equal(wreckaOf(g, 0), 1);
  assert.equal(stage.value.seq.a.norms + stage.value.seq.a.crits, 4);
  for (let r = it.next(); !r.done; r = it.next());
  // Starting an action with 6 points: only spending.
  const g2 = arena(), o2 = get(g2, 'wkGunner'), t2 = foe(g2); o2.x = 10; o2.y = 10; t2.x = 17; t2.y = 10;
  g2.wrecka[0] = 6; G.activate(g2, o2);
  dice([6, 6, 6, 6, 1, 1], () => G.resolveShoot(g2, o2, w(o2, 'wkEavyRokkit'), t2));
  assert.equal(wreckaOf(g2, 0), 4, 'two spent, none gained');
}
// Bomb Squig: Stoopid (never Conceal), shoots its explosives while engaged with itself as the primary target.
{
  const g = arena(), s = get(g, 'wkSquig'), t = foe(g); s.x = 10; s.y = 10; t.x = 10 + G.radius(s) + G.radius(t) + 0.3; t.y = 10;
  s.order = 'conceal'; G.activate(g, s); assert.equal(s.order, 'engage');
  G.setOrder(g, s, 'conceal'); assert.equal(s.order, 'engage');
  assert(can(g, s, 'shoot'), 'explosives while engaged');
  const boom = w(s, 'wkExplosives');
  assert(G.shootCheck(g, s, s, boom).ok); assert(!G.shootCheck(g, s, t, boom).ok);
  const before = t.wounds;
  const r = dice([6, 6, 6, 6, 6, 6, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1], () => G.resolveShoot(g, s, boom, s));
  assert(s.dead, 'its own blast'); assert(t.wounds < before, 'the enemy in the blast');
  assert.equal(r.extra.length, 1);
}
// Boom!: incapacitated before using its explosives, two D6 — a 4+ and it explodes before it's removed.
{
  const g = arena(), s = get(g, 'wkSquig'), t = foe(g); s.x = 10; s.y = 10; t.x = 10 + G.radius(s) + G.radius(t) + 0.3; t.y = 10;
  const before = t.wounds;
  dice([1, 5, 6, 6, 6, 6, 6, 6, 1, 1, 1], () => G.applyDamage(g, t, s, 99));
  assert(s.dead); assert(t.wounds < before);
  const g2 = arena(), s2 = get(g2, 'wkSquig'), t2 = foe(g2); s2.x = 10; s2.y = 10; t2.x = 11.5; t2.y = 10;
  dice([1, 3], () => G.applyDamage(g2, t2, s2, 99)); assert.equal(t2.wounds, t2.maxW, 'no 4+, no explosion');
}
// Detonate (Demolisha): the first damage is D6+6 to the enemy and everyone in its control range, then the fight ends.
{
  const g = arena(), d = get(g, 'wkDemolisha'), t = foe(g), t2 = foe(g, 1);
  d.x = 10; d.y = 10; t.x = 10 + G.radius(d) + G.radius(t) + 0.2; t.y = 10; t2.x = t.x; t2.y = 10 + G.radius(t) + G.radius(t2) + 0.3;
  G.activate(g, d);
  dice([5, 5, 5, 5, 1, 1, 1, 1, 6, 6, 6, 6], () => { G.startFight(g, d, w(d, 'wkTankDetonate'), t); while (g.fight && !g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); });
  assert(t.dead, 'D6+6 on 14 Wounds… or close'); assert(t2.wounds < t2.maxW, 'the other operative in its control range');
  assert(d.wkDetonated);
}
// Armoured Up (Krusha): attackers lose Lethal / Rending / Severe against it.
{
  const g = arena(), k = get(g, 'wkKrusha'), t = foe(g);
  const r = G.effectiveRules(g, t, { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 4, hit: 3, dmg: [3, 4], rules: { lethal: 5, rending: true, severe: true } }, k);
  assert(!r.lethal && !r.rending && !r.severe);
}
// Pulsa rokkit: the marker on the target, D3 to each operative wholly within; Shokkwave -2" Move and -1 Hit; Ready step -1 point.
{
  const g = arena({ loadouts: { wkRokkiteer: 'pulsa' } }), o = get(g, 'wkRokkiteer'), t = foe(g); o.x = 6; o.y = 10; t.x = 16; t.y = 10;
  G.activate(g, o);
  const res = dice([5, 5, 5, 1, 1, 1, 2, 2], () => G.resolveShoot(g, o, w(o, 'wkPulsa'), t));
  const m = g.markers.find((x) => x.kind === 'pulsa');
  assert.equal(m.pts, 4); assert.equal(res.kind, 'pulsa');
  assert(t.wounds < t.maxW); assert(shokked(g, t));
  assert.equal(G.moveStat(g, t), G.tpl(t).move - 2);
  o.ready = false; G.endActivation(g);
}
// Break Stuff (Fighter): removes equipment terrain; otherwise a Breach marker lets thin parts be crossed.
{
  const g = arena(), f = get(g, 'wkFighter'); f.x = 10; f.y = 10;
  g.terrain = [{ kind: 'heavy', x: 10.9, y: 8, w: 0.5, h: 4, equip: 1 }];
  G.activate(g, f); assert(can(g, f, 'wkBreak'));
  G.doSelfAction(g, f, 'wkBreak'); assert.equal(g.terrain.length, 0);
  g.terrain = [{ kind: 'heavy', x: 10.9, y: 0, w: 0.5, h: 22 }]; f.acted.wkBreak = 0; f.ap = 2;
  G.doSelfAction(g, f, 'wkBreak'); assert(g.markers.some((x) => x.kind === 'breach'));
  f.counter = true; // (on foot)
  const c = moveCtx(g, f), p = findPath(c, { x: 13, y: 10 });
  assert(p); assert.equal(c.climbs(p.pts), 0, 'through the breach without climbing');
}
// Ploys: Amped Up heals Engage-order friendlies; Glyphs make Waaagh! free; Proppa Scrap gives two Fights.
{
  const g = arena({ equip: ['wkGlyphsW'] }); g.phase = 'strategy'; g.initiative = 0; g.stratStep = 0;
  const n = get(g, 'wkNob'); n.wounds = 5;
  G.buyPloy(g, 0, T.ploys.find((p) => p.id === 'wkAmpedUp')); assert(n.wounds > 5);
  const cp = g.cp[0]; G.buyPloy(g, 0, T.ploys.find((p) => p.id === 'waaagh')); assert.equal(g.cp[0], cp, 'Glyphs: free');
}
// AI vs AI full battles.
for (const [a, b] of [['wreckaKrew', 'angels'], ['kommandos', 'wreckaKrew']]) {
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
  console.log(`${a} vs ${b}: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp}, Wrecka points ${g.wrecka})`);
}
console.log('wrecka ok');
