import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { plagueRosterError } from '../js/data/plague.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 777;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.plagueMarines;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['plagueMarines', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 12) * 1.9; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const wp = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 1, hit: 2, dmg: [3, 3], rules: {} };

// Roster: the Champion and five of the six others, each once (the Warrior is a pick).
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 6);
  assert.equal(plagueRosterError(T, {}), null);
  assert.equal(plagueRosterError(T, { fighter: 'warrior' }), null, 'a Warrior instead of the Fighter');
  assert(plagueRosterError(T, { fighter: 'bombardier' }), 'two Bombardiers');
  assert.throws(() => arena({ roster: { fighter: 'bombardier' } }));
  const w = arena({ roster: { fighter: 'warrior' } }), wr = get(w, 'warrior');
  assert.deepEqual(G.weaponsFor(w, wr).map((x) => x.id), ['boltgunW', 'plagueKnife4']);
  assert(G.hasTactic(w, wr, 'hardy'), 'Repulsive Fortitude: defence 5+ are crits');
  assert(!G.hasTactic(w, get(w, 'champion'), 'hardy'));
}

// Cloud of Flies and Nurglings (strategy ploys).
{
  const g = arena({ tp: 2 }); g.phase = 'strategy'; g.initiative = 0; g.stratTurn = 0; g.cp[0] = 3;
  const ic = get(g, 'icon'), e = foe(g);
  place(ic, 10, 10); place(e, 20, 10);
  for (const o of g.ops.filter((x) => x.side === 0 && x !== ic)) place(o, 2, 2 + (+o.uid.split('-')[1]));
  assert(G.buyPloy(g, 0, T.ploys.find((p) => p.id === 'cloudFlies')));
  const m = g.markers.find((x) => x.kind === 'flies');
  assert(m, 'a marker');
  assert(Math.hypot(m.x - ic.x, m.y - ic.y) < 0.1, 'on the nearest Plague Marine');
  // Obscured when shot from more than 3" away; not from within 3".
  g.phase = 'firefight'; G.activate(g, e); place(e, 16, 10);
  const r = dice([6, 1, 1, 1, 1, 1], () => G.resolveShoot(g, e, wp, ic));
  assert(r.obscured, 'obscured by the Cloud of Flies');
  place(e, 12, 10); G.endActivation(g); g.turn = 1; G.activate(g, e);
  const r2 = dice([6, 1, 1, 1, 1, 1], () => G.resolveShoot(g, e, wp, ic));
  assert(!r2.obscured, 'within 3" of the marker');
  // The marker goes in the next Ready step.
  const { pmReady } = await import('../js/plague.js');
  pmReady(g);
  assert(!g.markers.some((x) => x.kind === 'flies'));
  // Nurglings: -1 APL for an enemy near a Plague Marine.
  const n = arena({ tp: 2 }); n.phase = 'strategy'; n.initiative = 0; n.stratTurn = 0; n.cp[0] = 3;
  place(get(n, 'icon'), 10, 10); place(foe(n), 12, 10);
  assert(G.buyPloy(n, 0, T.ploys.find((p) => p.id === 'nurglings')));
  assert.equal(G.aplNow(n, foe(n)), G.tpl(foe(n)).apl - 1);
}

// Curse of Rot: each 3 the enemy rolls hurts it and can't be kept.
{
  const g = arena(), pm = get(g, 'champion'), e = foe(g); g.cp[0] = 2;
  place(pm, 10, 10); place(e, 12, 10); e.wounds = e.maxW = 30; G.activate(g, pm);
  const big = { ...wp, atk: 2, hit: 2, dmg: [3, 3] };
  const before = e.wounds;
  const r = dice([6, 6, 3, 3, 3, 1, 1], () => G.resolveShoot(g, pm, big, e));
  assert(e.wounds < before, 'damage from the 3s and the shots');
  assert.equal(g.cp[0], 1, '1CP');
  assert(r.defence.dice.filter((d) => d.v === 3).every((d) => d.res === 'miss' && d.locked));
  const g2 = arena(), pm2 = get(g2, 'champion'), e2 = foe(g2); g2.cp[0] = 2;
  place(pm2, 10, 10); place(e2, 20, 10); G.activate(g2, pm2);
  dice([6, 6, 3, 3, 3, 1, 1], () => G.resolveShoot(g2, pm2, big, e2));
  assert.equal(g2.cp[0], 2, 'not within 3"');
}

// Equipment: Plague Rounds, Poison Vents, Plague Bells, Blight Grenades.
{
  const g = arena({ equip: ['pmRounds'] }), w = get(g, 'bombardier'), e = foe(g); place(w, 10, 10); place(e, 14, 10);
  const bolt = G.weaponsFor(g, w).find((x) => x.id === 'boltgunPM');
  const r = G.effectiveRules(g, w, bolt, e);
  assert(r.poison && r.severe, 'Plague Rounds');
  const g0 = arena(), w0 = get(g0, 'bombardier');
  assert(!G.effectiveRules(g0, w0, G.weaponsFor(g0, w0).find((x) => x.id === 'boltgunPM'), foe(g0)).poison);
  // Poison Vents
  const v = arena({ equip: ['pmVents'] }), pm = get(v, 'champion'), en = foe(v); place(pm, 10, 10); place(en, 12, 10); en.wounds = en.maxW = 30; v.turn = 1;
  dice([6], () => G.activate(v, en));
  assert(en.poison, 'D3 = 3: poisoned');
  en.ready = true; v.tp = 2; en.poisonTP = 0; G.endActivation(v); v.turn = 1;
  const w1 = en.wounds;
  dice([6], () => G.activate(v, en));
  assert.equal(w1 - en.wounds, 3, 'D3 damage instead of 1');
  // Plague Bells
  const b = arena({ equip: ['pmBells'] }), p2 = get(b, 'champion'); p2.wounds = 3;
  assert(!G.injuredPenalty(b, p2), 'injured stat changes ignored');
  const nb = arena(), p3 = get(nb, 'champion'); p3.wounds = 3;
  assert(G.injuredPenalty(nb, p3));
  // Blight Grenades: twice a battle
  const gr = arena({ equip: ['pmBlight'] }), c = get(gr, 'champion');
  assert(G.weaponsFor(gr, c).some((x) => x.id === 'eqBlight'));
  gr.eqUses[0].blight = 0;
  assert(!G.weaponsFor(gr, c).some((x) => x.id === 'eqBlight'));
}

// AI vs AI full battles.
for (const [a, b] of [['plagueMarines', 'angels'], ['kommandos', 'plagueMarines']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'plagueMarines' ? ['pmRounds', 'pmVents', 'pmBells', 'pmBlight'] : [], b === 'plagueMarines' ? ['pmRounds', 'pmVents'] : []], roster: [a === 'plagueMarines' ? { fighter: 'warrior' } : {}, {}] });
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
console.log('plague ok');
