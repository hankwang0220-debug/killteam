import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { moveCtx } from '../js/path.js';
let seed = 4242;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(opts = {}) {
  const g = G.newGame({ teams: ['gellerpox', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], opts.foeEquip || []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 15) * 1.4; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Mutoid Vermin: four more operatives with the equipment, limited actions, Fall Back 1AP, no control, kill op ignores them.
{
  const g = arena({ equip: ['gpVermin'] });
  const vermin = g.ops.filter((o) => o.side === 0 && G.tpl(o).vermin);
  assert.equal(vermin.length, 4);
  assert.equal(g.ops.filter((o) => o.side === 0).length, 15);
  assert.equal(arena().ops.filter((o) => o.side === 0).length, 11, 'no vermin without the equipment');
  const v = vermin[0], e = foe(g);
  place(v, 10, 10); place(e, 11.2, 10); G.activate(g, v);
  const acts = G.availableActions(g, v).map((a) => a.id);
  assert(!acts.includes('pickUp'));
  assert.equal(G.availableActions(g, v).find((a) => a.id === 'fallBack').ap, 1, 'Fall Back for 1 less AP');
  // An enemy next to only vermin can still Reposition, and can move through them.
  const g2 = arena({ equip: ['gpVermin'] }), v2 = g2.ops.find((o) => o.side === 0 && G.tpl(o).vermin), e2 = foe(g2);
  place(v2, 10, 10); place(e2, 11.1, 10); g2.turn = 1; G.activate(g2, e2);
  assert(G.availableActions(g2, e2).find((a) => a.id === 'reposition').ok, 'vermin control range does not stop a Reposition');
  const ctx = moveCtx(g2, e2, 'reposition');
  assert(ctx.segFree({ x: 11.1, y: 10 }, { x: 7, y: 10 }), 'moves through a vermin');
  // No control of markers.
  const g3 = arena({ equip: ['gpVermin'] }), v3 = g3.ops.find((o) => o.side === 0 && G.tpl(o).vermin), obj = g3.objectives[0];
  for (const o of g3.ops) if (o !== v3) place(o, o.side ? 29 : 1, o.y);
  place(v3, obj.x, obj.y);
  assert.equal(G.controller(g3, obj), null, 'a vermin alone controls nothing');
}

// Feast (Cursemite): +1 Atk and Lethal 5+ against a wounded operative.
{
  const g = arena({ equip: ['gpVermin'] }), c = get(g, 'gpCursemite'), e = foe(g);
  const w = G.weaponsFor(g, c).find((x) => x.id === 'proboscis');
  assert(!G.effectiveRules(g, c, w, e).atkPlus);
  e.wounds -= 1;
  const r = G.effectiveRules(g, c, w, e);
  assert.equal(r.atkPlus, 1); assert.equal(r.lethal, 5);
}

// Barge: a Nightmare Hulk moves through enemies and can Reposition while engaged.
{
  const g = arena(), h = get(g, 'lumberghast'), e = foe(g);
  place(h, 10, 10); place(e, 12.3, 10); G.activate(g, h);
  assert(!G.availableActions(g, h).find((a) => a.id === 'reposition').ok, 'engaged: no Reposition');
  assert(!moveCtx(g, h, 'reposition').segFree({ x: 10, y: 10 }, { x: 16, y: 10 }), 'blocked by the enemy');
  h.acted.gpBarge = true;
  assert(G.availableActions(g, h).find((a) => a.id === 'reposition').ok, 'Barge: Reposition from engagement');
  assert(moveCtx(g, h, 'reposition').segFree({ x: 10, y: 10 }, { x: 16, y: 10 }), 'Barge: through the enemy');
}

// Drawn to the Hum: +1" only for a move that ends within 2" of the chosen objective.
{
  const g = arena(), m = get(g, 'mutantAxe'), obj = g.objectives[0];
  g.ploys[0].push('drawnHum'); g.gpHum = [{ tp: g.tp, id: obj.id }, null];
  for (const o of g.ops) if (o !== m) place(o, o.side ? 29 : 1, o.y);
  place(m, obj.x - 8.5, obj.y); G.activate(g, m);
  assert.equal(G.moveAllowance(g, m, 'reposition'), 6, '5" + 1"');
  assert(G.doMove(g, m, 'reposition', { pts: [{ x: m.x, y: m.y }, { x: m.x + 6, y: m.y }] }));
  assert(Math.abs(m.x - (obj.x - 2.5)) < 0.01, 'ends within 2" of the marker with the extra inch');
  const g2 = arena(), m2 = get(g2, 'mutantAxe');
  g2.ploys[0].push('drawnHum'); g2.gpHum = [{ tp: g2.tp, id: g2.objectives[0].id }, null];
  for (const o of g2.ops) if (o !== m2) place(o, o.side ? 29 : 1, o.y);
  place(m2, 5, 3); G.activate(g2, m2);
  assert(G.doMove(g2, m2, 'reposition', { pts: [{ x: 5, y: 3 }, { x: 11, y: 3 }] }), 'the move still happens');
  assert(m2.x <= 10.01, 'far from the marker: only the normal 5"');
}

// Plague Bellows: shot from more than 6", a Hulk keeps a 3 as a normal save.
{
  const g = arena({ equip: ['gpBellows'] }), h = get(g, 'bloatspawn'), e = foe(g);
  place(h, 10, 10); place(e, 20, 10);
  const w = { id: 'x', group: 'x', name: { zh: 'x', en: 'x' }, type: 'ranged', atk: 1, hit: 2, dmg: [1, 1], rules: {} };
  let saw3 = 0;
  for (let i = 0; i < 40; i++) {
    h.wounds = h.maxW; G.activate(g, e); g.active = e.uid;
    const it = G.shootFlow(g, e, w, h); let s = it.next();
    while (!s.done) { if (s.value?.stage === 'defence') { const d = s.value.seq.d; if (d.dice.some((x) => x.v === 3)) { saw3++; assert(d.dice.some((x) => x.v === 3 && x.res !== 'miss'), 'a 3 is kept'); } } s = it.next(); }
    e.acted = {}; e.ready = true; e.ap = 2; g.active = null;
  }
  assert(saw3 > 0);
}

// Polluted Stockpile: the opponent loses one equipment option.
{
  const g = arena({ equip: ['gpStockpile'], foeEquip: ['comms', 'mines'] });
  assert.equal(g.equip[1].length, 1);
}

// Mutated Symptoms: once per battle, a second curse on that operative this turning point.
{
  const g = arena({ equip: ['gpSymptoms'] }), h = get(g, 'bloatspawn'), e = foe(g);
  g.tactics[0] = ['barrelwarp'];
  for (const o of g.ops) if (o !== h && o !== e) place(o, o.side ? 29 : 1, o.y);
  place(h, 10, 10); place(e, 12.2, 10);
  assert(!G.cursed(g, e, 'voxStatic') && !G.cursed(g, e, 'rustspikes'));
  G.activate(g, h); // (the computer's pick: g.pick isn't set, so it applies the auto choice)
  assert(G.cursed(g, e, 'voxStatic') || G.cursed(g, e, 'rustspikes'), 'a second curse');
  assert(g.gpSymptomsUsed[0]);
}

// AI vs AI full battles with all four equipment options.
for (const [a, b] of [['gellerpox', 'kommandos'], ['kommandos', 'gellerpox']]) {
  const gp = a === 'gellerpox' ? 0 : 1, eq = [[], []]; eq[gp] = ['gpVermin', 'gpBellows', 'gpSymptoms', 'gpStockpile'];
  const g = G.newGame({ teams: [a, b], ai: null, equip: eq });
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
console.log('gellerpox ok');
