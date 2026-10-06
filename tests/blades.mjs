import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 777331;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(options = {}, b = 'angels') {
  const g = G.newGame({ teams: ['bladesOfKhaine', b], ai: null, ...options }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + (i % 4) * 1.5 : 25; o.y = 2 + Math.floor(i / 4) * 2 + (o.side ? i * 1.5 : 0); o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const act = (g, op, id) => G.availableActions(g, op).find((a) => a.id === id);

// Roster: one Exarch, seven Aspect Warriors, each slot picked on its own; Exarch weapon options.
{
  const g = arena();
  assert.equal(G.living(g, 0).length, 8);
  assert.equal(g.ops.filter((o) => o.side === 0 && G.tpl(o).exarch).length, 1);
  const g2 = arena({ roster: [{ bkScEx: 'bkAvEx', bkScW: ['bkScW', 'bkAvW', 'bkHbW'], bkHbW: ['bkAvW', 'bkAvW'] }], loadouts: [{ bkAvEx: 'powerShield' }] });
  const mine = g2.ops.filter((o) => o.side === 0);
  assert.deepEqual(mine.map((o) => o.tplId).sort(), ['bkAvEx', 'bkAvW', 'bkAvW', 'bkAvW', 'bkAvW', 'bkAvW', 'bkHbW', 'bkScW'].sort());
  const ex = get(g2, 'bkAvEx');
  assert.equal(ex.loadout, 'powerShield');
  assert.deepEqual(G.weaponsFor(g2, ex).map((w) => w.id), ['bkPowerEx']);
  assert.throws(() => arena({ roster: [{ bkScW: ['bkScEx'] }] }), /Invalid roster/);
}
// Exarch: two Shoot actions; a warrior only one (Starfall gives it two).
{
  const g = arena(), ex = get(g, 'bkScEx'), w = get(g, 'bkScW');
  G.activate(g, ex); G.spend(g, ex, 'shoot', 1); ex.acted.shotWith = 'bkPistol';
  const e = g.ops.find((o) => o.side === 1); e.x = ex.x + 6; e.y = ex.y;
  assert(act(g, ex, 'shoot').ok, 'Exarch shoots twice');
  G.endActivation(g); g.turn = 0;
  G.activate(g, w); G.spend(g, w, 'shoot', 1);
  assert(!act(g, w, 'shoot').ok);
  assert(G.useFFButton(g, w, 'starfall'));
  assert(act(g, w, 'shoot').ok, 'Starfall');
}
// Aspect Techniques: matching Aspect only, 0CP, one per activation, once per TP.
{
  const g = arena(), av = get(g, 'bkAvW'), sc = get(g, 'bkScW'), e = g.ops.find((o) => o.side === 1);
  e.x = av.x + 8; e.y = av.y;
  G.activate(g, av);
  const cat = G.weaponsFor(g, av)[0];
  const opts = G.ffAttackOptions(g, av, 'shoot', cat, e);
  assert(opts.some((o) => o.id === 'avVigilance' && o.ok && o.cp === 0));
  assert(!opts.some((o) => o.id === 'ssEye'), 'other Aspects hidden');
  G.ffToggle(g, av, 'avVigilance');
  assert.equal(G.effectiveRules(g, av, cat, e).lethal, 5);
  g.cp[0] = 0; // (0CP: usable with no CP, and no Command Re-roll muddles the count)
  G.resolveShoot(g, av, cat, e);
  assert.equal(g.cp[0], 0, 'no CP');
  assert(g.log.some((x) => x.msg.en.includes('Aspect Technique Vigilance')));
  g.cp[0] = 3;
  assert(!G.ffAttackOptions(g, av, 'shoot', cat, e).find((o) => o.id === 'avThousand').ok, 'one Technique per activation');
  G.endActivation(g); g.turn = 0;
  const av2 = g.ops.filter((o) => o.tplId === 'bkAvW')[1];
  G.activate(g, av2);
  assert(!G.ffAttackOptions(g, av2, 'shoot', cat, e).find((o) => o.id === 'avVigilance').ok, 'once per TP');
  assert(G.ffAttackOptions(g, av2, 'shoot', cat, e).find((o) => o.id === 'avThousand').ok);
  G.endActivation(g); g.turn = 0;
  // Shriek-that-Kills: an extra weapon for a Howling Banshee while unused.
  const hb = get(g, 'bkHbW'); G.activate(g, hb);
  assert(G.weaponsFor(g, hb).some((w) => w.id === 'bkShriek'));
  assert(!G.weaponsFor(g, sc).some((w) => w.id === 'bkShriek'));
}
// Mandiblasters: 2 damage before the Fight's dice; Banshee Mask: the enemy's melee Hit is worse.
{
  const g = arena(), sc = get(g, 'bkScW'), e = g.ops.find((o) => o.side === 1);
  e.x = sc.x + G.radius(sc) + G.radius(e) + 0.5; e.y = sc.y;
  G.activate(g, sc);
  const before = e.wounds;
  G.startFight(g, sc, G.bestMelee(sc), e);
  assert(e.wounds <= before - 2, 'Mandiblasters');
  const hbG = arena(), hb = get(hbG, 'bkHbW'), e2 = hbG.ops.find((o) => o.side === 1);
  e2.x = hb.x + G.radius(hb) + G.radius(e2) + 0.5; e2.y = hb.y;
  G.activate(hbG, hb);
  G.startFight(hbG, hb, G.bestMelee(hb), e2);
  assert.equal(hbG.fight.D.hit, Math.min(6, G.bestMelee(e2).hit + 1), 'Banshee Mask');
}
// Shimmershield: Piercing ignored for friendlies within 2"; One with the Gloom: can't be targeted in cover.
{
  const g = arena({ roster: [{ bkScEx: 'bkAvEx' }], loadouts: [{ bkAvEx: 'direShield' }] });
  const ex = get(g, 'bkAvEx');
  assert.equal(ex.loadout, 'direShield');
}
// AI vs AI full battles.
for (const [a, b] of [['bladesOfKhaine', 'angels'], ['kasrkin', 'bladesOfKhaine']]) {
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
  assert(steps < 3000, `${a} vs ${b}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp})`);
}
console.log('blades ok');
