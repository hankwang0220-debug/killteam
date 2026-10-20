import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { wyrmbladeRosterError, wyrmbladeIds } from '../js/data/wyrmblade.js';
let seed = 2468;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.wyrmblade;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['wyrmblade', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: Leader + 13 selections (Cult Agents count as two); each once except Warriors; two Gunners, two Heavy Gunners at most.
{
  assert.equal(wyrmbladeRosterError(T, {}), null);
  assert.equal(wyrmbladeIds(T, {}).length, 12, 'default: Leader, two Cult Agents, nine Neophytes');
  assert.equal(wyrmbladeIds(T, { wbAgent1: 'warrior+warriorShotgun' }).length, 13, 'two Warriors instead of a Cult Agent');
  assert(wyrmbladeRosterError(T, { wbAgent2: 'kelermorph' }), 'two Kelermorphs');
  assert(wyrmbladeRosterError(T, { icon: 'gunnerWebber' }), 'three Gunners');
  assert(wyrmbladeRosterError(T, { gunnerFlamer: 'heavyStubber' }), 'three Heavy Gunners');
  assert.equal(wyrmbladeRosterError(T, { warrior: ['warriorShotgun', 'warriorShotgun'] }), null, 'Warriors repeat');
  const g = arena({ roster: { wbAgent1: 'wbSniper', wbAgent2: 'wbTalon', gunnerGL: 'gunnerWebber', heavyLaser: 'heavyStubber' }, loadouts: { leader: 'web+pick', icon: 'shotgun' } });
  assert(get(g, 'wbSniper') && get(g, 'wbTalon') && get(g, 'gunnerWebber') && get(g, 'heavyStubber'));
  assert.deepEqual(G.weaponsFor(g, get(g, 'leader')).map((w) => w.id), ['webPistol', 'powerPick']);
  assert(G.weaponsFor(g, get(g, 'icon')).some((w) => w.id === 'shotgunGSC'));
}

// Sanctus Sniper: Target Vulnerability, Soulsight; Sanctus Talon: Soulsight, Concealed Charge, free Dash after a Fight.
{
  const g = arena({ roster: { wbAgent1: 'wbSniper', wbAgent2: 'wbTalon' } }), s = get(g, 'wbSniper'), t = get(g, 'wbTalon'), e = foe(g);
  place(s, 5, 10); place(e, 20, 10); G.activate(g, s);
  const stat = G.weaponsFor(g, s).find((w) => w.id === 'sanctusStationary');
  assert(!G.effectiveRules(g, s, stat, e).lethal);
  G.doSelfAction(g, s, 'wbVuln');
  assert.equal(G.effectiveRules(g, s, stat, e).lethal, 5, 'Target Vulnerability');
  G.doTargetAction(g, s, 'wbSoulsight', e);
  assert(G.effectiveRules(g, s, stat, e).saturate, 'Soulsight: Saturate');
  assert(G.effectiveRules(g, t, G.weaponsFor(g, t).find((w) => w.id === 'bioDagger'), e).brutal, 'Soulsight: Brutal for the Talon');
  G.endActivation(g);
  g.active = null; g.turn = 0; t.order = 'conceal'; place(t, 17, 10); G.activate(g, t);
  assert(G.availableActions(g, t).find((a) => a.id === 'charge').ok, 'Creeping Shadow: Charge while Concealed');
}

// Equipment: Cult Knives, Blasting Charges once per TP, Spotlights, Explosive Traps.
{
  const g = arena({ equip: ['wbKnives', 'wbCharges', 'wbSpotlights', 'wbTraps'] }), w = get(g, 'warrior'), e = foe(g);
  assert(G.weaponsFor(g, w).some((x) => x.id === 'wbKnife'));
  assert(!G.weaponsFor(g, get(g, 'kelermorph')).some((x) => x.id === 'wbKnife'), 'Neophytes only');
  assert(G.weaponsFor(g, w).some((x) => x.id === 'wbCharge'));
  place(w, 20, 10); place(e, 23, 10); G.activate(g, w);
  G.resolveShoot(g, w, G.weaponsFor(g, w).find((x) => x.id === 'wbCharge'), e);
  assert(!G.weaponsFor(g, get(g, 'icon')).some((x) => x.id === 'wbCharge'), 'once per turning point');
  const traps = g.eqDeploy.queues[0].filter((q) => q.item.kind === 'mine');
  assert.equal(traps.length, 2, 'two mines');
}

// Leader's Shadow Vector: Slink into Darkness free once per TP for a Neophyte it can see.
{
  const g = arena(), l = get(g, 'leader'), w = get(g, 'warrior');
  place(l, 10, 10); place(w, 12, 10); G.activate(g, w);
  const btn = G.ffButtons(g, w).find((b) => b.id === 'slink');
  assert.equal(btn?.cp, 0, 'Slink for 0CP');
}

// Familiar Territory: hide a third in deployment, emerge within 6" of the drop zone, incapacitated if still hiding after TP2.
{
  const g = G.newGame({ teams: ['wyrmblade', 'kommandos'], ai: null, equip: [[], []] });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  if (g.dep.turn !== 0) { G.autoDeployStep(g); G.finishDeployStep(g); }
  const mine = g.ops.filter((o) => o.side === 0 && o.placed === false);
  assert(!G.wbCanHide(g, mine.find((o) => G.tpl(o).cultAgent)), 'Cult Agents can\'t hide');
  const w = mine.find((o) => o.tplId === 'warrior');
  assert(G.wbHide(g, w)); assert(w.wbHidden && w.reserve);
  // Emerging: more than 6" from enemies and wholly within 6" of the drop zone.
  const h = arena(); const hw = get(h, 'warrior'); Object.assign(hw, { wbHidden: true, reserve: true, x: -99, y: -99 });
  for (const o of h.ops.filter((x) => x.side === 1)) place(o, 28, o.y);
  G.activate(h, hw); hw.orderPicked = true;
  assert(!G.wbEmergeCheck(h, hw, { x: 15, y: 10 }).ok, 'not far from the drop zone');
  assert(G.wbEmergeCheck(h, hw, { x: 8, y: 10 }).ok);
  assert(G.enterFromReserve(h, hw, { x: 8, y: 10 }));
  assert(!hw.wbHidden && hw.x === 8 && G.availableActions(h, hw).find((a) => a.id === 'reposition').ok === false, 'counts as its Reposition');
}

// AI vs AI full battles.
for (const [a, b] of [['wyrmblade', 'kommandos'], ['angels', 'wyrmblade']]) {
  const wb = a === 'wyrmblade' ? 0 : 1, eq = [[], []]; eq[wb] = ['wbKnives', 'wbCharges', 'wbSpotlights', 'wbTraps'];
  const roster = [{}, {}]; roster[wb] = { wbAgent1: 'wbSniper', wbAgent2: 'locus', gunnerGL: 'gunnerWebber' };
  const g = G.newGame({ teams: [a, b], ai: null, equip: eq, roster });
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
console.log('wyrmblade ok');
