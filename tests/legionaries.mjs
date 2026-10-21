import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { legionariesRosterError } from '../js/data/legionaries.js';
import { lgFavoured, markOf } from '../js/rules/legionaries.js';
let seed = 9137;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.legionaries;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['legionaries', opts.foe || 'kommandos'], ai: null, equip: [[], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 2, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: a Chosen or an Aspiring Champion, five picks (each once except Warriors), a Mark of Chaos each.
{
  assert.equal(legionariesRosterError(T, {}), null);
  assert.equal(legionariesRosterError(T, { lgButcher: 'lgWarrior', lgShrivetalon: 'lgWarrior' }), null, 'Warriors repeat');
  assert(legionariesRosterError(T, { lgButcher: 'lgGunner', lgShrivetalon: 'lgGunner' }), 'two Gunners');
  assert(legionariesRosterError(T, { mark_lgBalefire: 'khorne' }), 'no Khorne Balefire Acolyte');
  const g = arena({ roster: { lgChosen: 'lgChampion', lgButcher: 'lgIcon', lgShrivetalon: 'lgWarrior', lgAnointed: 'lgGunner', mark_lgShrivetalon: 'nurgle', mark_lgChosen: 'slaanesh' }, loadouts: { lgChampion: 'tainted+fist', lgGunner: 'melta', lgHeavy: 'missile' } });
  assert.equal(markOf(get(g, 'lgWarrior')), 'nurgle');
  assert.equal(markOf(get(g, 'lgChampion')), 'slaanesh');
  assert.equal(markOf(get(g, 'lgHeavy')), 'nurgle', 'the default');
  assert.deepEqual(G.weaponsFor(g, get(g, 'lgChampion')).map((w) => w.id), ['taintedBoltPistol', 'powerFistL']);
  assert(G.weaponsFor(g, get(g, 'lgGunner')).some((w) => w.id === 'meltaL'));
  assert(G.weaponsFor(g, get(g, 'lgHeavy')).some((w) => w.id === 'missileLK'));
  assert.equal(G.moveStat ? G.moveStat(g, get(g, 'lgChampion')) : 7, 7, 'Slaanesh: +1" Move');
}

// Infernal Pact: once per battle, when a Warrior is activated, change its Mark.
{
  const g = arena({ roster: { lgButcher: 'lgWarrior' } }), w = get(g, 'lgWarrior'); g.pick = [true, false];
  G.activate(g, w);
  assert(G.availableActions(g, w).find((a) => a.id === 'lgPact').ok);
  G.doSelfAction(g, w, 'lgPact');
  assert(G.resolveChoice(g, 0, 'khorne'));
  assert.equal(markOf(w), 'khorne');
  G.endActivation(g); w.ready = true; w.acted = {};
  G.activate(g, w);
  assert(!G.availableActions(g, w).some((a) => a.id === 'lgPact'), 'once per battle');
}

// In the Eyes of the Gods: an incapacitation adds 1 AP once per activation.
{
  const g = arena({ roster: { lgChosen: 'lgChampion' } }), c = get(g, 'lgChampion'), e = foe(g);
  G.activate(g, c); const ap = c.ap;
  e.wounds = 1; G.applyDamage(g, c, e, 5);
  assert(e.dead); assert.equal(c.ap, ap + 1);
}

// Favoured of the Dark Gods: the Icon Bearer controlling an untainted objective in the Ready step, +1CP.
{
  const g = arena({ roster: { lgButcher: 'lgIcon' } }), i = get(g, 'lgIcon'), m = g.objectives[0];
  place(i, m.x + 1, m.y); const cp = g.cp[0];
  lgFavoured(g); // (the Ready step of the Strategy phase)
  assert.equal(g.cp[0], cp + 1); assert(g.tainted.includes(m.id));
}

// AI vs AI full battles.
for (const roster of [{}, { lgChosen: 'lgChampion', lgButcher: 'lgIcon', lgShrivetalon: 'lgWarrior', lgAnointed: 'lgGunner', mark_lgButcher: 'khorne' }]) {
  const g = G.newGame({ teams: ['legionaries', 'kommandos'], ai: null, equip: [[], []], roster: [roster, {}] });
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
  assert(steps < 4000, 'legionaries: simulation stalled');
  console.log(`legionaries vs kommandos: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('legionaries ok');
