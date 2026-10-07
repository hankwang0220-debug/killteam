import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
let seed = 515151;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(options = {}, b = 'angels') {
  const g = G.newGame({ teams: ['broodBrothers', b], ai: null, ...options }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + (i % 5) * 1.6 : 25; o.y = 2 + Math.floor(i / 5) * 2.2 + (o.side ? i * 1.5 : 0); o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const act = (g, op, id) => G.availableActions(g, op).find((a) => a.id === id);

// Roster: Commander + 9 + three Troopers by default; Broodcoven packages; ploys instead of operatives.
{
  const g = arena();
  assert.equal(G.living(g, 0).length, 13);
  assert.equal(g.ops.filter((o) => o.side === 0 && o.tplId === 'bbTrooper').length, 3);
  const p = arena({ roster: [{ coven: 'patriarch', bbVox: 'bbSniper' }] });
  assert(get(p, 'bbPatriarch') && get(p, 'bbSniper') && !get(p, 'bbVox'));
  assert.equal(G.living(p, 0).length, 11);
  const f = arena({ roster: [{ coven: 'ploys' }] });
  assert.equal(G.living(f, 0).length, 10);
  f.phase = 'strategy'; f.stratStep = 0; f.initiative = 0;
  const ploy = TEAM_MAP.broodBrothers.ploys[0];
  assert.equal(G.ployCost(f, 0, ploy), 0, 'free Broodcoven ploys');
}
// Crossfire: a Brood Brother's target that survives gains a token; later, tokens re-roll failed attack dice.
{
  const g = arena(), tr = get(g, 'bbTrooper'), e = g.ops.find((o) => o.side === 1);
  e.x = tr.x + 10; e.y = tr.y;
  G.activate(g, tr);
  G.resolveShoot(g, tr, G.weaponsFor(g, tr)[0], e);
  if (!e.dead) assert.equal(e.crossfire[0], 1, 'Crossfire token gained');
  e.crossfire = [5, 0];
  G.endActivation(g); g.turn = 0;
  const tr2 = g.ops.filter((o) => o.tplId === 'bbTrooper')[1];
  e.wounds = e.maxW; e.dead = false;
  G.activate(g, tr2);
  G.resolveShoot(g, tr2, G.weaponsFor(g, tr2)[0], e);
  assert(g.log.some((x) => x.msg.en.startsWith('Crossfire:')) || e.crossfire[0] === 6, 'tokens spent on fails (or no fails)');
}
// Leaders: the Commander, unless a Broodcoven operative is in the team. Unquestioning Loyalty swaps the target.
{
  const g = arena(), cmd = get(g, 'bbCommander'), vet = get(g, 'bbVox');
  vet.x = cmd.x + 1.5; vet.y = cmd.y;
  const e = g.ops.find((o) => o.side === 1); e.x = cmd.x + 10; e.y = cmd.y;
  g.turn = 1; G.activate(g, e);
  const before = vet.wounds, cBefore = cmd.wounds;
  G.resolveShoot(g, e, G.weaponsFor(g, e)[0], cmd);
  assert(g.log.some((x) => x.msg.en.startsWith('Unquestioning Loyalty')), 'a bodyguard steps in');
  assert.equal(cmd.wounds, cBefore);
  assert(vet.wounds <= before);
}
// Patriarch: two activations, 4AP between them; ignores Piercing.
{
  const g = arena({ roster: [{ coven: 'patriarch' }] }), pat = get(g, 'bbPatriarch');
  G.activate(g, pat);
  assert.equal(pat.ap, 4);
  pat.ap = 2; // spent 2AP
  G.endActivation(g);
  assert(pat.ready, 'stays ready for a second activation');
  g.turn = 0; G.activate(g, pat);
  assert.equal(pat.ap, 2, 'the rest of its 4AP');
  G.endActivation(g);
  assert(!pat.ready);
  assert(G.moveAllowance(g, pat, 'reposition') <= 9);
}
// Primus: Conspire (+1CP once per TP) and two Fights / Shoots; Sapper: Explosives place then detonate.
{
  const g = arena({ roster: [{ coven: 'primus' }] }), pr = get(g, 'bbPrimus');
  G.activate(g, pr);
  const cp = g.cp[0];
  G.doSelfAction(g, pr, 'conspire');
  assert.equal(g.cp[0], cp + 1);
  assert(!act(g, pr, 'conspire').ok);
  G.endActivation(g); g.turn = 0;
  const sp = get(g, 'bbSapper'), e = g.ops.find((o) => o.side === 1);
  G.activate(g, sp);
  G.doSelfAction(g, sp, 'explosives');
  assert(g.markers.some((m) => m.kind === 'explosives'));
  assert(!act(g, sp, 'dash').ok, 'no Dash after Explosives');
  G.endActivation(g); g.turn = 0;
  const m = g.markers.find((x) => x.kind === 'explosives');
  sp.x = m.x + 5; e.x = m.x + 1; e.y = m.y; e.wounds = e.maxW;
  for (const o of g.ops) if (o.side === 0 && o !== sp && G.edgeDist(o, e) < 3) o.x = 28;
  G.activate(g, sp);
  const ew = e.wounds;
  G.doSelfAction(g, sp, 'explosives');
  assert(e.wounds < ew || e.dead, 'detonation hurts the enemy');
  assert(!g.markers.some((x) => x.kind === 'explosives'));
}
// AI vs AI full battles, with the different Broodcoven picks.
for (const [a, b, roster] of [['broodBrothers', 'angels', []], ['kasrkin', 'broodBrothers', [{}, { coven: 'patriarch' }]], ['broodBrothers', 'bladesOfKhaine', [{ coven: 'magusFam' }]]]) {
  const g = G.newGame({ teams: [a, b], ai: null, roster }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
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
console.log('brood ok');
