import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 13579;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(options = {}, b = 'angels') {
  const g = G.newGame({ teams: ['celestianInsidiants', b], ai: null, ...options }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + (i % 4) * 2.2 : 26; o.y = 2 + Math.floor(i / 4) * 3 + (o.side ? i * 1.5 : 0); o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);

// Roster: a Superior and eight from the list (two Cremators by default); weapon options.
{
  const g = arena({ loadouts: [{ ciSuperior: 'inferno' }] });
  assert.equal(G.living(g, 0).length, 9);
  assert.equal(g.ops.filter((o) => o.side === 0 && G.tpl(o).pyre).length, 2);
  assert.deepEqual(G.weaponsFor(g, get(g, 'ciSuperior')).map((w) => w.id), ['ciInferno', 'ciNullMace']);
}
// Inspiration: a Charge inspires; inspiring weapons have Severe; incapacitating a Wounds 6+ enemy inspires.
{
  const g = arena(), w = get(g, 'ciWarrior'), e = g.ops.find((o) => o.side === 1);
  e.x = w.x + 4; e.y = w.y;
  G.activate(g, w);
  G.doMove(g, w, 'charge', { pts: [{ x: w.x, y: w.y }, { x: e.x - G.radius(e) - G.radius(w) - 0.3, y: w.y }], len: 3 });
  assert(w.inspiring, 'Charge inspires');
  const mace = G.bestMelee(w);
  assert(G.effectiveRules(g, w, mace, e).severe);
  const m = get(g, 'ciMortis');
  G.applyDamage(g, m, e, 99);
  assert(m.inspiring, 'incapacitating a 6+ Wounds enemy inspires');
}
// Martyrdom: an inspiring sister falling gives a nearby sister a Benediction.
{
  const g = arena(), w = get(g, 'ciWarrior'), r = get(g, 'ciReliq'), e = g.ops.find((o) => o.side === 1);
  w.inspiring = true; r.x = w.x + 2; r.y = w.y;
  for (const o of g.ops) if (o.side === 0 && o !== w && o !== r) o.x = 28 - (o.num % 3);
  G.applyDamage(g, e, w, 99);
  assert(r.ardour || r.wrath || g.log.some((x) => x.msg.en.includes('Restoration')), 'Benediction');
  if (r.ardour) assert.equal(G.aplNow(g, r), 3);
}
// Holy Defender: the Abjuror takes a shot meant for a sister within 2"; Null Field slows and blunts enemies.
{
  const g = arena(), ab = get(g, 'ciAbjuror'), w = get(g, 'ciWarrior'), e = g.ops.find((o) => o.side === 1);
  ab.x = w.x + 1.6; ab.y = w.y; e.x = w.x + 12; e.y = w.y;
  g.turn = 1; G.activate(g, e);
  const before = ab.wounds, wb = w.wounds;
  G.resolveShoot(g, e, G.weaponsFor(g, e)[0], w);
  assert(g.log.some((x) => x.msg.en.startsWith('Holy Defender')));
  assert.equal(w.wounds, wb); assert(ab.wounds <= before);
  const c = get(g, 'ciCensor'), e2 = g.ops.filter((o) => o.side === 1)[1];
  e2.x = c.x + G.radius(c) + G.radius(e2) + 0.6; e2.y = c.y;
  assert(G.moveStat(g, e2) <= G.tpl(e2).move - 2, 'Null Field: -2" Move');
}
// Weapons of the Witch Hunters: within 3" of an Insidiant, an enemy psyker can't use Psychic actions.
{
  const g = arena({}, 'warpcoven'), c = get(g, 'ciWarrior');
  const psy = g.ops.find((o) => o.side === 1 && G.tpl(o).destiny);
  psy.x = c.x + 2; psy.y = c.y; g.turn = 1; G.activate(g, psy);
  assert(!G.availableActions(g, psy).some((a) => ['fate', 'ravage', 'alight'].includes(a.id)));
}
// Spiritual Mentor and Nullifying Ritual.
{
  const g = arena(), sup = get(g, 'ciSuperior'), w = get(g, 'ciWarrior'), c = get(g, 'ciCensor');
  w.x = sup.x + 2; w.y = sup.y;
  G.activate(g, sup);
  G.doTargetAction(g, sup, 'spiritualMentor', w);
  assert(w.inspiring);
  G.endActivation(g); g.turn = 0; G.activate(g, c);
  G.doSelfAction(g, c, 'nullifyingRitual');
  assert.equal(c.nullRange, 2);
}
// AI vs AI full battles.
for (const [a, b] of [['celestianInsidiants', 'angels'], ['warpcoven', 'celestianInsidiants'], ['celestianInsidiants', 'broodBrothers']]) {
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
console.log('insidiants ok');
