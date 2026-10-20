import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { hierotekRosterError } from '../js/data/hierotek.js';
let seed = 5311;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.hierotek;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['hierotek', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 2, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: the three Crypteks, Immortal weapon options, five picks (Deathmarks and Guardians repeat).
{
  assert.equal(hierotekRosterError(T, {}), null);
  assert.equal(hierotekRosterError(T, { apprentek: 'guardian', despotek: 'deathmark' }), null);
  assert(hierotekRosterError(T, { guardian: 'despotek' }), 'two Despoteks');
  const g = arena({ roster: { technomancer: 'chronomancer', guardian: 'guardian' }, loadouts: { chronomancer: 'entropic', guardian: 'tesla' } });
  assert(G.weaponsFor(g, get(g, 'chronomancer')).some((w) => w.id === 'entropicLance'));
  assert(G.weaponsFor(g, get(g, 'guardian')).some((w) => w.id === 'teslaCarbine'));
  // Apprentek Assistance: the Apprentek has the Chronomancer's actions now.
  const a = get(g, 'apprentek'); place(a, 10, 10); place(foe(g), 15, 10); G.activate(g, a);
  const ids = G.availableActions(g, a).map((x) => x.id);
  assert(ids.includes('hcNanomine') && !ids.includes('canoptekRepair'), 'Apprentek: Chronomancer actions');
}

// Chronomancer: Nanomine (-2" Move), Chronometron (-1 Atk), Timesplinter (set back up within 5").
{
  const g = arena({ roster: { technomancer: 'chronomancer' } }), c = get(g, 'chronomancer'), e = foe(g), gd = get(g, 'guardian');
  place(c, 10, 10); place(e, 16, 10); place(gd, 12, 12); gd.ready = false; G.activate(g, c);
  G.doTargetAction(g, c, 'hcNanomine', e);
  assert.equal(G.moveStat(g, e), 4, 'Nanomine: 6" - 2"');
  const g2 = arena({ roster: { technomancer: 'chronomancer' } }), c2 = get(g2, 'chronomancer'), gd2 = get(g2, 'guardian'), e2 = foe(g2);
  place(c2, 10, 10); place(gd2, 12, 10); place(e2, 20, 10); G.activate(g2, c2);
  G.doTargetAction(g2, c2, 'hcChronometron', gd2);
  assert.equal(G.effectiveRules(g2, e2, G.weaponsFor(g2, e2).find((w) => w.type === 'ranged'), gd2).atkMinus, 1, 'Chronometron');
  const g3 = arena({ roster: { technomancer: 'chronomancer' } }), c3 = get(g3, 'chronomancer'), gd3 = get(g3, 'guardian');
  place(c3, 10, 10); place(gd3, 13, 10); gd3.ready = false; G.activate(g3, c3);
  assert(G.TARGET_ACTIONS.hcTimesplinter.targets(g3, c3).includes(gd3));
  G.doTargetAction(g3, c3, 'hcTimesplinter', gd3);
  assert(G.edgeDist(c3, gd3) <= 5.01, 'within 5"');
}

// Psychomancer: Nightmare Shroud, Vision of Madness, Harbinger of Despair.
{
  const g = arena({ roster: { technomancer: 'psychomancer' } }), p = get(g, 'psychomancer'), e = foe(g);
  place(p, 10, 10); place(e, 13, 10); G.activate(g, p);
  G.doSelfAction(g, p, 'hcShroud');
  const w = G.weaponsFor(g, e).find((x) => x.type === 'melee');
  const r = G.effectiveRules(g, e, { ...w, rules: { ...w.rules, lethal: 5, balanced: true } }, p);
  assert(!r.lethal && !r.balanced, 'Nightmare Shroud strips Lethal and re-rolls');
  G.doTargetAction(g, p, 'hcVision', e);
  assert(e.hcMad);
  G.endActivation(g);
  // The opponent tries to activate it: blocked on a roll >= APL (with others to activate).
  g.turn = 1; g.active = null;
  let tries = 0, blocked = 0; while (e.hcMad && tries++ < 20) { G.activate(g, e); if (g.active !== e.uid) { blocked++; assert(!G.canActivateOp(g, e), 'pick another'); e.hcMadBlock = null; } }
  assert(!e.hcMad, 'the token goes once it activates');
  const g2 = arena({ roster: { technomancer: 'psychomancer' } }), p2 = get(g2, 'psychomancer'); place(p2, 10, 10); G.activate(g2, p2);
  G.doSelfAction(g2, p2, 'hcDespair');
  assert(g2.hcDespair[0], 'Despair marker placed');
}

// Firefight ploys: Cortical Control, Dimensional Ambush; Command Underlings.
{
  const g = arena(), t = get(g, 'technomancer'), gd = get(g, 'guardian');
  place(t, 2, 2); place(gd, 20, 18); gd.wounds = 5; G.activate(g, t);
  assert(!G.TARGET_ACTIONS.canoptekRepair.targets(g, t).includes(gd));
  G.useFFButton(g, t, 'corticalControl');
  assert(G.TARGET_ACTIONS.canoptekRepair.targets(g, t).includes(gd), 'Cortical Control: no distance limit');
  const h = arena(), d = get(h, 'deathmark'); d.order = 'conceal'; place(d, 10, 10); G.activate(h, d);
  G.useFFButton(h, d, 'dimensionalAmbush');
  assert(G.availableActions(h, d).find((a) => a.id === 'phGuard').ok, 'a Concealed Deathmark can Guard');
}

// AI vs AI full battles.
for (const [a, b] of [['hierotek', 'kommandos'], ['angels', 'hierotek']]) {
  for (const lead of ['chronomancer', 'psychomancer']) {
    const hc = a === 'hierotek' ? 0 : 1;
    const roster = [{}, {}]; roster[hc] = { technomancer: lead };
    const g = G.newGame({ teams: [a, b], ai: null, equip: [[], []], roster });
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
    assert(steps < 4000, `${a} vs ${b} (${lead}): simulation stalled`);
    console.log(`${a} vs ${b} (${lead}): ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
  }
}
console.log('hierotek ok');
