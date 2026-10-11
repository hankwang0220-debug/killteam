import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 62026;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(b = 'angels') {
  const g = G.newGame({ teams: ['goremongers', b], ai: null }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + i * 2.2 : 27; o.y = o.side === 0 ? 3 : 2 + i * 1.5; o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, i = 0) => g.ops.filter((o) => o.side === 1)[i];

// Eight operatives: the Blood Herald, two Aspirants and one of each specialist; tanks start at half.
{
  const g = G.newGame({ teams: ['goremongers', 'angels'], ai: null });
  assert.equal(G.living(g, 0).length, 8);
  assert.equal(g.ops.filter((o) => o.tplId === 'gmAspirant').length, 2);
  assert(G.living(g, 0).every((o) => G.goreOf(o) === 1));
}
// Sanguavitae: Mania (+1 AP), Fury (second Fight free), limits (two per activation, not Mania with Fury).
{
  const g = arena(), a = get(g, 'gmAspirant');
  a.gore = 2;
  G.activate(g, a);
  const ap = a.ap;
  assert(G.useSang(g, a, 'mania'));
  assert.equal(a.ap, ap + 1); assert.equal(G.goreOf(a), 1);
  assert(!G.sangOptions(g, a).find((o) => o.id === 'fury').ok, 'not Mania and Fury together');
  assert(!G.useSang(g, a, 'mania'), 'once per activation');
  a.wounds = 4;
  assert(G.useSang(g, a, 'rejuvenate'));
  assert(a.wounds >= 6 && a.wounds <= 8);
  assert(!G.sangOptions(g, a).some((o) => o.ok), 'two per activation, and the tank is empty');
  assert.equal(G.aplNow(g, a), 3, 'Mania: +1 APL until its next activation');
}
{
  const g = arena(), a = get(g, 'gmAspirant'), e = foe(g);
  e.x = a.x + 1.3; e.y = a.y;
  G.activate(g, a);
  assert(G.useSang(g, a, 'fury'));
  const w = G.weaponsFor(g, a).find((x) => x.type === 'melee');
  G.resolveFight(g, a, w, e);
  if (!e.dead) assert.equal(G.actionCost(g, a, 'fight'), 0, 'Fury: the second Fight is free');
}
// Runes of Khorne: no more than 8 wounds lost per Shoot action.
{
  const g = arena(), h = get(g, 'gmHerald'), e = foe(g);
  e.x = h.x + 5; e.y = h.y;
  const big = { id: 'test', name: { zh: '測試', en: 'Test' }, type: 'ranged', atk: 8, hit: 2, dmg: [9, 9], rules: { accurate: 8 }, group: 'test' };
  G.activate(g, e); g.turn = 1;
  G.resolveShoot(g, e, big, h);
  assert.equal(h.wounds, h.maxW - 8, 'capped at 8');
}
// Kills fill the tank; Brutish turns Critical Dmg into Normal Dmg (fights).
{
  const g = arena(), s = get(g, 'gmSkullclaimer'), e = foe(g);
  e.x = s.x + 1.3; e.y = s.y; e.wounds = 1;
  G.activate(g, s);
  const cp = g.cp[0];
  G.resolveFight(g, s, G.weaponsFor(g, s).find((w) => w.id === 'gmChainaxe'), e);
  if (e.dead) { assert.equal(G.goreOf(s), 2, 'kill in control range: tank up'); assert.equal(g.cp[0], cp + 1, 'Claim Skull +1CP'); }
}
// Transfusion Ritual and the Impaler's Drag.
{
  const g = arena(), b = get(g, 'gmBloodtaker'), a = get(g, 'gmAspirant');
  a.gore = 0; a.x = b.x + 3; a.y = b.y;
  G.activate(g, b);
  G.doTargetAction(g, b, 'transfusion', a);
  assert.equal(G.goreOf(b), 0); assert.equal(G.goreOf(a), 1);
}
{
  const g = arena(), im = get(g, 'gmImpaler'), e = foe(g);
  e.x = im.x; e.y = im.y + 7; e.wounds = 99; e.maxW = 99;
  G.activate(g, im);
  const sk = { ...G.weaponsFor(g, im).find((w) => w.id === 'gmSkewerR'), rules: { range: 8, drag: true, accurate: 4 }, atk: 4 };
  const d0 = Math.hypot(e.x - im.x, e.y - im.y);
  G.resolveShoot(g, im, sk, e);
  assert(Math.hypot(e.x - im.x, e.y - im.y) < d0 - 1, 'Drag pulls the target in');
}
// AI vs AI full battles.
for (const [a, b] of [['goremongers', 'angels'], ['kasrkin', 'goremongers'], ['goremongers', 'exoditeDragonMasters'], ['chaosCult', 'goremongers']]) {
  const g = G.newGame({ teams: [a, b], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 4000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 4000, `${a} vs ${b}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  assert(g.ops.every((o) => G.goreOf(o) == null || (G.goreOf(o) >= 0 && G.goreOf(o) <= 2)));
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp}, VP ${G.totalVP(g, 0)}-${G.totalVP(g, 1)})`);
}
console.log('goremongers ok');
