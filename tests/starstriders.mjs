import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 42024;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(options = {}, b = 'angels') {
  const g = G.newGame({ teams: ['elucidianStarstriders', b], ai: null, ...options }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1.5 + (i % 5) * 2 : 26; o.y = 2 + Math.floor(i / 5) * 3 + (o.side ? i * 1.5 : 0); o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);

// Fixed roster of ten; Coordinate gives 1 extra CP at the start.
{
  const g = G.newGame({ teams: ['elucidianStarstriders', 'angels'], ai: null });
  assert.equal(G.living(g, 0).length, 10);
  assert.equal(g.cp[0], g.cp[1] + 1, 'Coordinate');
}
// Privateer Support Assets: Navis / Vhane get the batteries once per Firefight phase, each once per battle.
{
  const g = arena(), vs = get(g, 'esVoidsman'), e = g.ops.find((o) => o.side === 1);
  e.x = vs.x + 10; e.y = vs.y;
  G.activate(g, vs);
  const asset = G.weaponsFor(g, vs).find((w) => w.rules.supportAsset);
  assert(asset, 'a battery is available');
  assert(!G.weaponsFor(g, get(g, 'esCanid')).some((w) => w.rules.supportAsset), 'not for the Canid');
  G.resolveShoot(g, vs, asset, e);
  assert(!G.weaponsFor(g, get(g, 'esVoidmaster')).some((w) => w.rules.supportAsset), 'once per Firefight phase');
  g.tp = 2;
  assert(!G.weaponsFor(g, get(g, 'esVoidmaster')).some((w) => w.id === asset.id), 'each battery once per battle');
}
// Merciless (Vhane) and Disciplinarian (Voidmaster); Vhane ignores Piercing.
{
  const g = arena(), vh = get(g, 'esVhane'), vm = get(g, 'esVoidmaster'), vs = get(g, 'esVoidsman'), e = g.ops.find((o) => o.side === 1);
  e.wounds = e.maxW - 1;
  assert(G.effectiveRules(g, vh, G.weaponsFor(g, vh)[0], e).balanced, 'Merciless');
  vs.x = vm.x + 2; vs.y = vm.y;
  assert(G.effectiveRules(g, vs, G.weaponsFor(g, vs)[0], e).balanced, 'Disciplinarian');
}
// Rejuvenat Adept: Medic! leaves 3 wounds; Bribe skips an activation.
{
  const g = arena(), ad = get(g, 'esAdept'), vs = get(g, 'esVoidsman'), e = g.ops.find((o) => o.side === 1);
  vs.x = ad.x + 2; vs.y = ad.y;
  G.applyDamage(g, e, vs, 99);
  assert(!vs.dead && vs.wounds === 3, 'Medic! keeps it on 3 wounds');
  assert(G.canBribe(g, 0));
  assert(G.bribeSkip(g, 0));
  assert.equal(g.turn, 1);
  g.turn = 0;
  assert(!G.canBribe(g, 0), 'once per battle');
}
// AI vs AI full battles.
for (const [a, b] of [['elucidianStarstriders', 'angels'], ['chaosCult', 'elucidianStarstriders'], ['elucidianStarstriders', 'kasrkin']]) {
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
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp})`);
}
console.log('starstriders ok');
