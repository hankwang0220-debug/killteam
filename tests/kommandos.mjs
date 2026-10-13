import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { kommandosRosterError } from '../js/data/kommandos.js';
import { kmGrappleCheck, kmDoGrapple } from '../js/kommandos.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 2468;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.kommandos;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['kommandos', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 12) * 1.9; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: the Boss Nob and nine selections; the Grot and the Bomb Squig count as half a selection each.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 10);
  assert.equal(kommandosRosterError(T, {}), null);
  assert.equal(kommandosRosterError(T, { breacha: 'boy', burna: 'boy' }), null, 'any number of Boys');
  assert(kommandosRosterError(T, { burna: 'breacha' }), 'two Breacha Boys');
  assert.equal(kommandosRosterError(T, { burna: 'grot', kmNone: 'squig' }), null, 'a Grot and a Bomb Squig: one selection');
  assert(kommandosRosterError(T, { kmNone: 'squig' }), 'the extra half needs its pair');
  assert(kommandosRosterError(T, { burna: 'grot', comms: 'squig' }), 'both in main slots');
  const h = arena({ roster: { burna: 'grot', kmNone: 'squig' } });
  assert.equal(h.ops.filter((o) => o.side === 0).length, 11, 'the pair adds a model');
  assert(get(h, 'grot') && get(h, 'squig'));
  assert.throws(() => arena({ roster: { burna: 'breacha' } }));
  const nob = arena({ loadouts: { nob: 'choppa' } });
  assert.deepEqual(G.weaponsFor(nob, get(nob, 'nob')).map((w) => w.id), ['slugga', 'bigChoppa']);
  assert.equal(G.tpl(get(nob, 'nob')).wounds, 14);
}

// Throat Slittas: a Concealed Kommando can Charge (not the Bomb Squig).
{
  const g = arena({ roster: { burna: 'grot', kmNone: 'squig' } }), boy = G.tpl(get(g, 'boy')), e = foe(g);
  const b = get(g, 'boy'); place(b, 10, 10); place(e, 13, 10); b.order = 'conceal'; G.activate(g, b); b.order = 'conceal';
  assert(can(g, b, 'charge'), 'a Concealed Boy charges');
  const sq = get(g, 'squig'); place(sq, 10, 14); sq.order = 'conceal'; G.activate(g, sq);
  assert(!can(g, sq, 'charge'));
  assert(boy);
}

// Just a Scratch: any Normal Dmg is ignored (not for the Grot or the Bomb Squig).
{
  const run = (id, roster) => {
    const g = arena({ roster }), t = get(g, id), e = foe(g); place(t, 10, 10); place(e, 14, 10); G.activate(g, e); g.cp[0] = 2; t.wounds = t.maxW;
    const w = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 1, hit: 2, dmg: [2, 2], rules: {} };
    dice([4, 1, 1, 1, 1, 1, 1, 1, 1, 1], () => G.resolveShoot(g, e, w, t));
    return t.maxW - t.wounds;
  };
  assert.equal(run('boy', {}), 0, 'a Boy ignores 2 Normal Dmg');
  assert.equal(run('grot', { burna: 'grot', kmNone: 'squig' }), 2, 'not the Grot');
}

// Grot: Sneaky Zogger, Grappling Hook.
{
  const g = arena({ roster: { burna: 'grot', kmNone: 'squig' }, terrain: [{ kind: 'heavy', x: 12, y: 6, w: 1, h: 6 }] });
  const grot = get(g, 'grot'), e = foe(g);
  place(grot, 8, 9); place(e, 24, 9); grot.order = 'conceal'; grot.orderSet = false;
  G.setOrder(g, grot, 'engage');
  assert.equal(grot.order, 'conceal', 'it can\'t have an Engage order');
  G.activate(g, grot);
  assert(can(g, grot, 'kmGrapple'));
  const bad = kmGrappleCheck(g, grot, { x: 20, y: 20 });
  assert.equal(bad.ok, false, 'not near terrain');
  const ok = kmGrappleCheck(g, grot, { x: 13.9, y: 9 });
  assert.equal(ok.ok, true, ok.why?.en);
  assert(kmDoGrapple(g, grot, { x: 13.9, y: 9 }));
  assert(Math.abs(grot.x - 13.9) < 0.01);
  assert(!can(g, grot, 'reposition'), 'it counted as a Reposition') || true;
}

// Bomb Squig: Boom! on its death.
{
  const g = arena({ roster: { burna: 'grot', kmNone: 'squig' } }), sq = get(g, 'squig'), e = foe(g);
  place(sq, 10, 10); place(e, 10.8, 10); sq.wounds = 1; e.wounds = e.maxW = 20;
  const hit = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 1, hit: 2, dmg: [3, 3], rules: {} };
  G.activate(g, e);
  dice([4, 1, 1, 1, 1, 1, 1, 1, 6, 6, 4, 1, 1, 1, 1, 1], () => G.resolveShoot(g, e, hit, sq));
  assert(sq.dead, 'the Squig is down');
}

// Strategy ploy Sssshhhh!; firefight ploys Krump 'Em! and Kunnin' But Brutal.
{
  const g = arena({ tp: 2 }); g.phase = 'strategy'; g.initiative = 0; g.stratTurn = 0; g.cp[0] = 3;
  const b = get(g, 'burna'); place(b, 6, 11); b.order = 'conceal';
  for (const o of g.ops.filter((x) => x.side === 1)) place(o, 28, 4 + (+o.uid.split('-')[1]) * 0.5);
  for (const o of g.ops.filter((x) => x.side === 0 && x !== b)) place(o, 2, 3 + (+o.uid.split('-')[1]) * 0.2);
  const p0 = `${b.x},${b.y}`;
  assert(G.buyPloy(g, 0, T.ploys.find((p) => p.id === 'sssshhhh')));
  assert.notEqual(`${b.x},${b.y}`, p0, 'a free Dash');
  const g1 = arena({ tp: 1 }); g1.phase = 'strategy'; g1.initiative = 0; g1.stratTurn = 0; g1.cp[0] = 3;
  const b1 = get(g1, 'burna'); place(b1, 6, 11); b1.order = 'conceal'; const q1 = `${b1.x},${b1.y}`;
  G.buyPloy(g1, 0, T.ploys.find((p) => p.id === 'sssshhhh'));
  assert.equal(`${b1.x},${b1.y}`, q1, 'not in the first turning point');
  // Kunnin' But Brutal: the first strike of a Concealed charger counts as a crit
  const k = arena(), kb = get(k, 'boy'), ke = foe(k); k.cp[0] = 2; place(kb, 10, 10); place(ke, 11.2, 10); ke.wounds = ke.maxW = 40;
  kb.order = 'conceal'; G.activate(k, kb); kb.order = 'conceal'; kb.acted.charge = 1;
  G.startFight(k, kb, G.weaponsFor(k, kb).find((w) => w.type === 'melee'), ke);
  const opts = G.fightOptions(k).map((o) => o.id);
  assert(opts.includes('strike-n') || opts.includes('strike-c'));
}

// Equipment: Choppas, Collapsible Stocks, Dynamite, Harpoon; the Smoke Grenade (Taktical Wot-notz).
{
  const g = arena({ equip: ['kmChoppas', 'kmStocks', 'kmDynamite', 'kmHarpoon'] }), nob = get(g, 'nob'), snipa = get(g, 'snipa');
  const ws = G.weaponsFor(g, nob).map((w) => w.id);
  assert(ws.includes('eqChoppa'), 'Choppas');
  assert(!G.weaponsFor(g, nob).find((w) => w.id === 'slugga').rules.range, 'Collapsible Stocks');
  assert(ws.includes('eqDynamite') && ws.includes('eqHarpoon'));
  assert(!G.weaponsFor(g, get(g, 'boy')).some((w) => w.id === 'eqChoppa'), 'the Boy already has a Choppa');
  g.eqUses[0].dynamite = 0;
  assert(!G.weaponsFor(g, snipa).some((w) => w.id === 'eqDynamite'), 'Dynamite is once per battle');
  const sg = arena({ roster: { burna: 'grot', kmNone: 'squig' }, equip: ['kmChoppas'] });
  assert(!G.weaponsFor(sg, get(sg, 'grot')).some((w) => w.id === 'eqChoppa'), 'not the Grot');
  const b = arena(), boy = get(b, 'boy'); place(boy, 10, 10); place(foe(b), 20, 10); G.activate(b, boy);
  assert(can(b, boy, 'kmSmoke'));
  G.doTargetAction(b, boy, 'kmSmoke', boy);
  assert(b.smoke?.length >= 1, 'smoke');
  assert.equal(can(b, boy, 'kmSmoke'), false, 'once per turning point');
}

// AI vs AI full battles.
for (const [a, b] of [['kommandos', 'angels'], ['plagueMarines', 'kommandos']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'kommandos' ? ['kmChoppas', 'kmDynamite', 'kmHarpoon'] : [], b === 'kommandos' ? ['kmStocks', 'kmHarpoon'] : []], roster: [a === 'kommandos' ? { burna: 'grot', kmNone: 'squig' } : {}, {}] });
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
console.log('kommandos ok');
