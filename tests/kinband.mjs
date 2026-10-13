import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { kinbandRosterError } from '../js/data/kinband.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 1357;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.farstalkers;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['farstalkers', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 12) * 1.9; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: the Kill-broker and eleven selections; weapon options.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 12);
  assert.equal(kinbandRosterError(T, {}), null);
  assert.equal(kinbandRosterError(T, { bowHunter: 'warrior', coldBlood: 'warrior' }), null, 'Warriors repeat');
  assert(kinbandRosterError(T, { bowHunter: 'tracker' }), 'two Trackers');
  assert(kinbandRosterError(T, { cutSkin: 'hound', bowHunter: 'hound' }), 'three Hounds');
  assert.throws(() => arena({ roster: { bowHunter: 'tracker' } }));
  const l = arena({ loadouts: { killBroker: 'pulse', heavyGunner: 'skinner', warrior: 'scattergun' } });
  assert.deepEqual(G.weaponsFor(l, get(l, 'killBroker')).map((w) => w.id), ['pulseWeaponKB', 'ritualBlade']);
  assert.deepEqual(G.weaponsFor(l, get(l, 'heavyGunner')).map((w) => w.id), ['dvorgite', 'krootBlade']);
  assert.deepEqual(G.weaponsFor(l, get(l, 'warrior')).map((w) => w.id), ['scattergun', 'krootBlade']);
}

// Poach (firefight ploy): a Pick Up Marker only needs the marker contested. Gather (Hound).
{
  const g = arena(), h = g.ops.filter((o) => o.tplId === 'hound')[0];
  place(h, 10, 10); G.activate(g, h);
  assert(can(g, h, 'kfGather'), 'Gather');
  G.doSelfAction(g, h, 'kfGather');
  assert(h.kfPoach, 'the marker only needs contesting');
  assert.equal(G.actionCost(g, h, 'pickUp'), 0, 'a free Pick Up Marker');
  assert.equal(G.actionCost(g, h, 'dash'), 0, 'a free Dash');
  G.endActivation(g);
  assert(!h.kfPoach, 'it ends with the activation');
  const p = arena(), w = get(p, 'warrior'); place(w, 10, 10); G.activate(p, w);
  assert(G.ffReady(p, 0, 'poach'));
  G.useFFButton(p, w, 'poach');
  assert(w.kfPoach);
}

// Quick Draw: a ready Pistolier shoots first, once per turning point.
{
  const g = arena(), pi = get(g, 'pistolier'), e = foe(g); g.cp[0] = 0;
  place(pi, 10, 10); place(e, 14, 10); e.wounds = e.maxW = 3; G.activate(g, e);
  const w = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 1, hit: 2, dmg: [3, 3], rules: {} };
  const r = dice([6, 6, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1], () => G.resolveShoot(g, e, w, pi));
  assert.equal(g.kfUsed[0].quickDraw, 1, 'Quick Draw');
  assert(e.dead || e.wounds < 3, 'the shooter was hit first');
  if (e.dead) assert.equal(r.kind, 'sfDeclaim', 'the Shoot is cancelled');
  const g2 = arena(), p2 = get(g2, 'pistolier'), e2 = foe(g2); place(p2, 10, 10); place(e2, 14, 10); p2.ready = false; G.activate(g2, e2);
  dice([4, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g2, e2, w, p2));
  assert(!g2.kfUsed[0].quickDraw, 'not when it isn\'t ready');
}

// Equipment: Meat, Trophy, Piercing Shot, Toxin Shot, Ready for Anything.
{
  const g = arena({ equip: ['kfMeat', 'kfTrophy'], tp: 2 }), tr = get(g, 'tracker'); place(tr, 10, 10); tr.wounds = 3; place(foe(g), 24, 10);
  const ap = G.aplNow(g, tr);
  G.activate(g, tr);
  assert(tr.wounds > 3, 'Meat');
  assert.equal(tr.ap, ap + 1, 'Trophy');
  const g1 = arena({ equip: ['kfPiercing', 'kfToxin'] }), w = get(g1, 'warrior'), e = foe(g1); place(w, 10, 10); place(e, 14, 10); G.activate(g1, w);
  const rifle = G.weaponsFor(g1, w).find((x) => x.id === 'krootRifle');
  const it = G.shootFlow(g1, w, rifle, e); let s = it.next(); const rules = G.effectiveRules(g1, w, rifle, e);
  while (!s.done) s = it.next();
  assert.equal(rules.lethal, 5, 'Toxin Shot: Lethal 5+'); assert(rules.stun, 'and Stun');
  assert.equal(g1.kfUsed[0].toxin, 1);
  assert(!G.effectiveRules(g1, w, rifle, e).stun, 'only for that action');
  // Ready for Anything: a Warrior gets one more use per TP
  const g2 = arena({ equip: ['kfToxin'] }), w2 = get(g2, 'warrior'), e2 = foe(g2); place(w2, 10, 10); place(e2, 14, 10); G.activate(g2, w2);
  const r2 = G.weaponsFor(g2, w2).find((x) => x.id === 'krootRifle');
  for (let i = 0; i < 2; i++) { const it2 = G.shootFlow(g2, w2, r2, e2); let st = it2.next(); while (!st.done) st = it2.next(); }
  assert.equal(g2.kfUsed[0].ready, 1, 'Ready for Anything');
}

// Bound: the first 2" of one climb up is free.
{
  const g = arena({ terrain: [{ kind: 'heavy', x: 12, y: 8, w: 0.5, h: 6 }] }), w = get(g, 'warrior');
  place(w, 10, 10); G.activate(g, w);
  const { moveCtx } = await import('../js/path.js');
  const before = moveCtx(g, w, 'reposition').climbs([{ x: 10, y: 10 }, { x: 14, y: 10 }]);
  g.ploys[0].push('bound');
  const after = moveCtx(g, w, 'reposition').climbs([{ x: 10, y: 10 }, { x: 14, y: 10 }]);
  assert(before > after, 'cheaper with Bound');
  assert(Math.abs(after - Math.max(0, before - 2)) < 1e-6, 'two inches cheaper');
}

// AI vs AI full battles.
for (const [a, b] of [['farstalkers', 'angels'], ['kommandos', 'farstalkers']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'farstalkers' ? ['kfMeat', 'kfTrophy', 'kfPiercing', 'kfToxin'] : [], b === 'farstalkers' ? ['kfMeat', 'kfToxin'] : []], loadouts: [a === 'farstalkers' ? { killBroker: 'pulse', heavyGunner: 'skinner' } : {}, {}] });
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
console.log('kinband ok');
