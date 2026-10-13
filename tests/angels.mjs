import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { angelsRosterError } from '../js/data/angels.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 5150;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.angels;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['angels', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}], tactics: [opts.tactics] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 12) * 1.9; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: a leader (Intercessor Sergeant / Assault Sergeant / Captain) and five picks, each once except Warriors.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 6);
  assert.equal(angelsRosterError(T, {}), null);
  assert.equal(angelsRosterError(T, { gunner: 'assault', heavy: 'warrior', sniper: 'warrior' }), null, 'Warriors repeat');
  assert(angelsRosterError(T, { heavy: 'gunner' }), 'two Gunners');
  assert.throws(() => arena({ roster: { heavy: 'gunner' } }));
  const c = arena({ roster: { sgt: 'captain' } }), cap = get(c, 'captain');
  assert.equal(G.tpl(cap).wounds, 15); assert.equal(G.tpl(cap).base, 40);
  assert.deepEqual(G.weaponsFor(c, cap).map((w) => w.id), ['plasmaPistolAD', 'plasmaPistolADs', 'powerFistCap']);
  const a = arena({ roster: { sgt: 'asgt' }, loadouts: { asgt: 'flamer-hammer' } }), as = get(a, 'asgt');
  assert.deepEqual(G.weaponsFor(a, as).map((w) => w.id), ['handFlamerA', 'thunderHammerAS']);
  const p = arena({ roster: { sgt: 'asgt' }, loadouts: { asgt: 'plasma' } });
  assert.deepEqual(G.weaponsFor(p, get(p, 'asgt')).map((w) => w.id), ['plasmaPistolAD', 'plasmaPistolADs', 'chainswordA']);
  const i = arena({ loadouts: { sgt: 'stalker-power' } });
  assert.deepEqual(G.weaponsFor(i, get(i, 'sgt')).map((w) => w.id), ['stalkerHeavy', 'stalkerMobile', 'powerWeaponIS']);
  const gu = arena({ loadouts: { gunner: 'auto' } });
  assert(G.weaponsFor(gu, get(gu, 'gunner')).some((w) => w.id === 'autoBolt'));
  assert.equal(G.tpl(get(arena({ roster: { gunner: 'warrior' } }), 'warrior')).wounds, 14);
  assert.equal(Object.keys(G.tpl(as).loadouts).length, 9);
  assert.equal(Object.keys(G.tpl(get(g, 'sgt')).loadouts).length, 15);
}

// Chapter Veteran (Sergeants) and Adaptive Tactics.
{
  const g = arena({ tactics: ['sharpshooter', 'hardy', 'mobile'] });
  const sgt = get(g, 'sgt'), gun = get(g, 'gunner');
  assert(G.hasTactic(g, sgt, 'mobile'), 'the Sergeant has the extra tactic');
  assert(!G.hasTactic(g, gun, 'mobile'), 'others don\'t');
  assert(G.hasTactic(g, gun, 'hardy'));
  const a = arena({ tactics: ['sharpshooter', 'hardy'], tp: 2 }); a.phase = 'strategy'; a.initiative = 0; a.stratTurn = 0; a.cp[0] = 3;
  assert(!G.hasTactic(a, get(a, 'gunner'), 'stealthy'));
  assert(G.buyPloy(a, 0, T.ploys.find((p) => p.id === 'adaptiveTactics')));
  assert(G.hasTactic(a, get(a, 'gunner'), 'stealthy'), 'the secondary changed');
  assert(!G.hasTactic(a, get(a, 'gunner'), 'hardy'), 'the old secondary is replaced');
  assert(G.hasTactic(a, get(a, 'gunner'), 'sharpshooter'));
  a.tp = 3;
  assert(G.hasTactic(a, get(a, 'gunner'), 'hardy'), 'it returns after the turning point');
}

// Heroic Leader: a firefight ploy for 0CP when the Captain is the specified operative; Adjust Doctrine free; Iron Halo.
{
  const g = arena({ roster: { sgt: 'captain' } }), cap = get(g, 'captain'), e = foe(g);
  place(cap, 10, 10); place(e, 20, 10);
  G.activate(g, cap);
  g.cp[0] = 0;
  assert(G.ffReady(g, 0, 'adjustDoctrine'), 'Adjust Doctrine is free');
  const g2 = arena({ roster: { sgt: 'captain' } }), cap2 = get(g2, 'captain'), e2 = foe(g2); g2.cp[0] = 0;
  place(cap2, 10, 10); place(e2, 11.2, 10); G.activate(g2, cap2); // engaged: only as the specified operative
  assert(G.ffReady(g2, 0, 'shockAssault'), 'Shock Assault for the Captain');
  const g3 = arena({ roster: { sgt: 'captain' } }); g3.cp[0] = 0;
  const gr = get(g3, 'grenadier'); place(gr, 10, 10); place(foe(g3), 11.2, 10); G.activate(g3, gr);
  assert(!G.ffReady(g3, 0, 'shockAssault'), 'not for others');
  // Iron Halo: once per battle one Normal Dmg die is ignored
  const h = arena({ roster: { sgt: 'captain' } }), c3 = get(h, 'captain'), e3 = foe(h); place(c3, 10, 10); place(e3, 14, 10); G.activate(h, e3); c3.wounds = 15;
  const w = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 1, hit: 2, dmg: [3, 3], rules: {} };
  dice([4, 1, 1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(h, e3, w, c3));
  assert.equal(c3.wounds, 15, 'Iron Halo');
  assert(c3.haloUsed);
  dice([4, 1, 1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(h, e3, w, c3));
  assert(c3.wounds < 15, 'only once');
}

// Equipment: Purity Seals, Auspex, Chapter Reliquaries, Tilting Shields.
{
  const g = arena({ equip: ['adSeals'] }), gr = get(g, 'grenadier'), e = foe(g);
  place(gr, 10, 10); place(e, 14, 10); e.wounds = e.maxW = 40; G.activate(g, gr);
  const flat = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 2, hit: 4, dmg: [2, 2], rules: {} };
  dice([1, 1, 1, 1, 1, 1], () => G.resolveShoot(g, gr, flat, e));
  assert.equal(g.adUsed[0].seals, 1, 'Purity Seals');
  assert(e.wounds < 40, 'the retained success hit');
  // Chapter Reliquaries: Wrath of Vengeance for 0CP with an Engage order
  const r = arena({ equip: ['adReliquaries'] }), g1 = get(r, 'grenadier'); r.cp[0] = 0; place(g1, 10, 10); place(foe(r), 20, 10);
  G.activate(r, g1);
  assert(G.ffReady(r, 0, 'wrathVengeance'), 'free');
  g1.order = 'conceal';
  assert(!G.ffReady(r, 0, 'wrathVengeance'), 'needs an Engage order');
  // Tilting Shields: the opponent's crits need a 6 (Lethal is ignored)
  const t = arena({ equip: ['adTilting'] }), a1 = get(t, 'assault'), e1 = foe(t); place(a1, 10, 10); place(e1, 11.2, 10);
  G.activate(t, e1);
  G.startFight(t, e1, G.weaponsFor(t, e1).find((w) => w.type === 'melee'), a1);
  assert.equal(t.adUsed[0].tilting, 1, 'Tilting Shields');
  // Auspex: an obscured target within 8" can't be obscured
  const u = arena({ equip: ['adAuspex'], terrain: [{ kind: 'heavy', x: 13, y: 8, w: 0.5, h: 1 }] }), s1 = get(u, 'gunner'), e2 = foe(u);
  place(s1, 10, 10); place(e2, 15, 10); G.activate(u, s1);
  const w = G.weaponsFor(u, s1).find((x) => x.type === 'ranged');
  const it = G.shootFlow(u, s1, w, e2); let s = it.next(); while (!s.done) s = it.next();
  assert(true);
}

// AI vs AI full battles.
for (const [a, b] of [['angels', 'kommandos'], ['angels', 'angels']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [['adSeals', 'adTilting'], []], roster: [{ sgt: 'captain', heavy: 'warrior' }, { sgt: 'asgt' }] });
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
console.log('angels ok');
