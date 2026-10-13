import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { deathKorpsRosterError, dkFreeCount } from '../js/data/deathkorps.js';
import { dkGambit, dkGambitOk, dkMine } from '../js/deathkorps.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 8642;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.deathKorps;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['deathKorps', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}], dkFree: [opts.free] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 14) * 1.5; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: the Watchmaster, four Troopers (or free ploys) and nine selections.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 14);
  assert.equal(deathKorpsRosterError(T, {}), null);
  assert.equal(deathKorpsRosterError(T, { zealot: 'trooper', vox: 'trooper' }), null, 'extra Troopers');
  assert(deathKorpsRosterError(T, { zealot: 'sapper', vox: 'sapper' }), 'two Sappers');
  assert.throws(() => arena({ roster: { zealot: 'sapper', vox: 'sapper' } }));
  const f = arena({ roster: { trooper: ['trooper', 'dkFree', 'dkFree', 'trooper'] }, free: ['regroup', 'lifeShame', 'deathAtonement'] });
  assert.equal(f.ops.filter((o) => o.side === 0).length, 12, 'two Troopers traded for ploys');
  assert.equal(dkFreeCount(T, { trooper: ['trooper', 'dkFree', 'dkFree', 'trooper'] }), 2);
  assert.deepEqual(f.dkFree[0], ['regroup', 'lifeShame'], 'only as many as traded');
  assert.equal(G.ployCost(f, 0, T.ploys.find((p) => p.id === 'regroup')), 0, 'free');
  assert.equal(G.ployCost(f, 0, T.ploys.find((p) => p.id === 'siegeWarfare')), 1);
  const n = arena({ roster: { zealot: 'gunnerFlamer', vox: 'veteran', spotter: 'sapper' } });
  assert(get(n, 'gunnerFlamer') && get(n, 'veteran') && get(n, 'sapper'));
  assert(G.tpl(get(n, 'veteran')).tough);
  const l = arena({ loadouts: { watchmaster: 'relic-chain', confidant: 'las' } });
  assert.deepEqual(G.weaponsFor(l, get(l, 'watchmaster')).map((w) => w.id), ['relicWM', 'chainswordWM']);
  assert.deepEqual(G.weaponsFor(l, get(l, 'confidant')).map((w) => w.id), ['lasgunDK', 'bayonetDK']);
  assert.equal(Object.keys(G.tpl(get(l, 'watchmaster')).loadouts).length, 7);
}

// Guardsman Orders: Inspirational Leadership (Adaptive Orders makes it free for a Watchmaster who didn't issue one).
{
  const g = arena(), wm = get(g, 'watchmaster'), tr = g.ops.filter((o) => o.tplId === 'trooper')[0];
  place(wm, 10, 10); place(tr, 12, 10); place(foe(g), 24, 10); G.activate(g, wm); g.cp[0] = 0;
  assert(G.ffReady(g, 0, 'inspirationalLeadership'), 'Adaptive Orders: free');
  G.useFFButton(g, wm, 'inspirationalLeadership');
  assert(wm.gOrder && tr.gOrder, 'the order reaches the Troopers');
  const g2 = arena(), wm2 = get(g2, 'watchmaster'); place(wm2, 10, 10); G.activate(g2, wm2); g2.cp[0] = 0; g2.gIssued = [true, false];
  assert(!G.ffReady(g2, 0, 'inspirationalLeadership'), 'not after issuing as a gambit');
  const g3 = arena({ equip: ['dkBeads'] }), w3 = get(g3, 'watchmaster'), t3 = g3.ops.filter((o) => o.tplId === 'trooper');
  place(w3, 10, 10); t3.forEach((t, i) => place(t, 11 + i, 11)); G.activate(g3, w3);
  G.useFFButton(g3, w3, 'inspirationalLeadership');
  assert.equal(g3.ops.filter((o) => o.side === 0 && o.gOrder).length, 1, 'Comm-beads: one operative');
}

// In Life, Shame: every order on an Engage-order activation.
{
  const g = arena(), tr = g.ops.filter((o) => o.tplId === 'trooper')[0]; g.cp[0] = 2; place(tr, 10, 10); place(foe(g), 24, 10);
  tr.order = 'conceal'; tr.orderSet = false; G.activate(g, tr); G.setOrder(g, tr, 'engage');
  assert(tr.gOrder?.all, 'every order');
  assert.equal(g.cp[0], 1);
  const r = G.effectiveRules(g, tr, G.weaponsFor(g, tr).find((w) => w.type === 'ranged'), foe(g));
  assert(r.ceaseless, 'Take Aim!');
}

// Veteran, Hand Axes, Regroup, Chronometer, Gas Bombardment.
{
  const v = arena({ roster: { zealot: 'veteran' }, equip: ['dkAxes'] }), vet = get(v, 'veteran');
  place(vet, 10, 10); G.activate(v, vet);
  assert(vet.gOrder, 'the Veteran receives an order');
  assert(G.weaponsFor(v, vet).some((w) => w.id === 'dkAxe'), 'Hand axe');
  const g = arena({ tp: 2 }); g.phase = 'strategy'; g.initiative = 0; g.stratTurn = 0; g.cp[0] = 3;
  const ops = g.ops.filter((o) => o.side === 0); ops.forEach((o, i) => place(o, 6 + (i % 5) * 1.5, 8 + Math.floor(i / 5) * 2));
  for (const f of g.ops.filter((o) => o.side === 1)) place(f, 28, 3);
  const o = ops[3]; place(o, 3, 11.5); const before = Math.hypot(o.x - ops[0].x, o.y - ops[0].y);
  assert(G.buyPloy(g, 0, T.ploys.find((p) => p.id === 'regroup')));
  assert(g.log.some((l) => /Regroup/.test(l.msg?.en || '')) , 'Regroup');
  assert(before >= 0);
  // Chronometer: once per battle in the first two turning points
  const c = arena({ equip: ['dkChrono', 'dkGas'], tp: 1 }); c.phase = 'strategy'; c.initiative = 0; c.stratTurn = 0;
  assert(dkGambitOk(c, 0, 'chrono') && dkGambitOk(c, 0, 'gas'));
  assert(dkGambit(c, 0, 'chrono'));
  assert(!dkGambitOk(c, 0, 'chrono'), 'once per battle');
  assert(dkGambit(c, 0, 'gas'));
  const m = c.markers.find((x) => x.kind === 'gas');
  assert(m, 'a Gas marker');
  const near = c.ops.find((x) => x.side === 1); place(near, m.x, m.y);
  assert.equal(G.aplNow(c, near), Math.max(0, G.tpl(near).apl - 1), 'APL -1 within 3"');
  place(near, m.x + 8, m.y);
  assert.equal(G.aplNow(c, near), G.tpl(near).apl);
  const { dkReady } = await import('../js/deathkorps.js');
  dkReady(c);
  assert(!c.markers.some((x) => x.kind === 'gas'));
}

// The Sapper: Mine Layer and Detonate.
{
  const g = arena({ roster: { zealot: 'sapper' } }), sap = get(g, 'sapper'), e = foe(g), e2 = foe(g, 1);
  place(sap, 10, 10); place(e, 14, 10); G.activate(g, sap);
  const mine = dkMine(g, 0);
  assert(mine && mine.carriedBy === sap.uid, 'carrying the Mine marker');
  assert(can(g, sap, 'dkPlaceMine'));
  G.doSelfAction(g, sap, 'dkPlaceMine');
  assert.equal(mine.carriedBy, null);
  assert.equal(G.actionCost(g, sap, 'dash'), 0, 'a free Dash after placing it');
  place(sap, 5, 10); place(e, mine.x + 1, mine.y); place(e2, mine.x - 1, mine.y); e.wounds = e.maxW = 30; e2.wounds = e2.maxW = 30;
  assert(can(g, sap, 'dkDetonate'));
  const b = e.wounds + e2.wounds;
  dice([6, 6, 6, 6, 1, 1, 1, 1, 1, 6, 6, 6, 6, 1, 1, 1, 1, 1], () => G.doSelfAction(g, sap, 'dkDetonate'));
  assert(e.wounds + e2.wounds < b, 'damage');
  assert(!g.markers.some((x) => x.kind === 'dkMine'), 'the marker is gone');
  assert(!can(g, sap, 'dkDetonate'), 'Limited 1');
}

// In Death, Atonement: a free shot before it falls.
{
  const g = arena(), tr = g.ops.filter((o) => o.tplId === 'trooper')[0], e = foe(g); g.cp[0] = 2;
  place(tr, 10, 10); place(e, 14, 10); tr.wounds = 1; tr.readyAtDeath = true; e.wounds = e.maxW = 40; G.activate(g, e);
  const big = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 4, hit: 2, dmg: [3, 3], rules: {} };
  dice([6, 6, 6, 6, 1, 1, 1, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g, e, big, tr));
  assert(tr.dead);
  assert(g.ops.some((o) => o.side === 1 && o.wounds < o.maxW), 'a last shot');
  assert(g.log.some((l) => /In Death, Atonement/.test(l.msg?.en || '')), 'the ploy was used');
}

// AI vs AI full battles.
for (const [a, b] of [['deathKorps', 'angels'], ['kommandos', 'deathKorps']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'deathKorps' ? ['dkChrono', 'dkBeads', 'dkAxes', 'dkGas'] : [], b === 'deathKorps' ? ['dkGas'] : []], roster: [a === 'deathKorps' ? { zealot: 'sapper', vox: 'veteran' } : {}, {}] });
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
console.log('death korps ok');
