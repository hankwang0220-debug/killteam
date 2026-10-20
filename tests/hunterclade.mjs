import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { hunterCladeRosterError } from '../js/data/hunterclade.js';
let seed = 7531;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.hunterClade;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['hunterClade', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 2, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: four leaders, Gunner weapons once each, one Diktat / Surveyor.
{
  assert.equal(hunterCladeRosterError(T, {}), null);
  assert.equal(hunterCladeRosterError(T, { rsWarrior: 'infWarrior', rsWarriorC: 'infWarrior', rgDiktat: 'rgGunnerArc' }), null, 'Infiltrator Warriors repeat');
  assert(hunterCladeRosterError(T, { vgGunner: 'rgGunnerPlasma', vgWarrior: 'vgGunner' }), 'two plasma calivers');
  assert(hunterCladeRosterError(T, { vgWarrior: 'vgDiktat' }), 'two Diktats');
  assert(hunterCladeRosterError(T, { vgWarrior: 'vgSurveyor' }), 'two Surveyors');
  const g = arena({ roster: { rsPrinceps: 'vgAlpha', rgGunner: 'vgGunnerArc' }, loadouts: { vgAlpha: 'phosphor+taser', infWarrior: 'stub+power' } });
  assert.deepEqual(G.weaponsFor(g, get(g, 'vgAlpha')).map((w) => w.id), ['phosphorPistol', 'taserGoadSk']);
  assert(G.weaponsFor(g, get(g, 'infWarrior')).some((w) => w.id === 'stubcarbine'));
  assert(G.weaponsFor(g, get(g, 'vgGunnerArc')).some((w) => w.id === 'arcRifle'));
}

// Canticles: Elimination (Rangers Punishing), the Glow (rad-saturated enemies -1 Atk), Shroudpsalm (Infiltrators untargetable in cover).
{
  const g = arena({ roster: { rsPrinceps: 'rgAlpha' } }), a = get(g, 'rgAlpha'), r = get(g, 'rgWarrior'), e = foe(g);
  place(a, 10, 10); place(r, 12, 10); place(e, 20, 10);
  assert(G.effectiveRules(g, r, G.weaponsFor(g, r).find((w) => w.id === 'galvanic'), e).punishing, 'Canticle of Elimination');
  const h = arena({ roster: { rsPrinceps: 'vgAlpha' } }), v = get(h, 'vgAlpha'), e2 = foe(h);
  place(v, 10, 10); place(e2, 11.6, 10);
  assert.equal(G.effectiveRules(h, e2, G.weaponsFor(h, e2).find((w) => w.type === 'melee'), v).atkMinus, 1, 'Canticle of the Glow');
  const k = arena({ roster: { rsPrinceps: 'infPrinceps' }, terrain: [{ kind: 'heavy', x: 13.5, y: 8, w: 0.6, h: 4 }] }), p = get(k, 'infPrinceps'), iw = get(k, 'infWarrior'), e3 = foe(k);
  place(p, 10, 10); place(iw, 12.8, 10); iw.order = 'conceal'; place(e3, 20, 10.5);
  const w = G.weaponsFor(k, e3).find((x) => x.type === 'ranged');
  assert(!G.shootCheck(k, e3, iw, w).ok, 'Canticle of Shroudpsalm');
}

// Control Protocol (Command Override 0CP), Control Edict (the partner activates next), Scouting Protocol.
{
  const g = arena({ roster: { rsPrinceps: 'rgAlpha' } }), a = get(g, 'rgAlpha'), r = get(g, 'rgWarrior');
  place(a, 10, 10); place(r, 12, 10); G.activate(g, r);
  const co = G.ffButtons(g, r).find((b) => b.id === 'commandOverride');
  if (co) assert.equal(co.cp, 0, 'Control Protocol: 0CP');
  g.active = null; r.acted = {}; G.activate(g, a);
  assert(G.ffButtons(g, a).find((b) => b.id === 'controlEdict').ok);
  G.useFFButton(g, a, 'controlEdict');
  G.endActivation(g);
  assert.equal(g.chain?.uids.length, 1, 'the partner activates next');
}

// The Phobos Vanguard rule no longer applies to Skitarii Vanguard.
{
  const g = arena(), v = get(g, 'vgWarrior');
  assert.equal(G.actionCost(g, v, 'pickUp'), 1);
}

// AI vs AI full battles with each leader.
for (const lead of ['infPrinceps', 'rgAlpha', 'vgAlpha']) {
  const g = G.newGame({ teams: ['hunterClade', 'kommandos'], ai: null, equip: [[], []], roster: [{ rsPrinceps: lead, rgGunner: 'rgGunnerPlasma', vgGunner: 'vgGunnerArq' }, {}] });
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
  assert(steps < 4000, `hunterClade (${lead}): simulation stalled`);
  console.log(`hunterClade (${lead}) vs kommandos: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('hunterclade ok');
