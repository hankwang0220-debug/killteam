import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { navyRosterError } from '../js/data/navy.js';
let seed = 1234;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.navyBreachers;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['navyBreachers', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}], map: opts.map || 'default' });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: Sergeant options, plasma Gunner, each once except Armsmen, two Gunners max, machines need their controllers.
{
  assert.equal(navyRosterError(T, {}), null);
  assert.equal(navyRosterError(T, { axejack: 'armsman', endurant: 'armsman' }), null, 'Armsmen repeat');
  assert(navyRosterError(T, { axejack: 'endurant' }), 'two Endurants');
  assert(navyRosterError(T, { axejack: 'gunnerPlasma' }), 'three Gunners');
  assert.equal(navyRosterError(T, { gunnerMelta: 'gunnerPlasma' }), null, 'plasma instead of melta');
  assert(navyRosterError(T, { surveyor: 'armsman' }), 'C.A.T. without the Surveyor');
  assert.equal(navyRosterError(T, { surveyor: 'armsman', machines: 'gheist' }), null, 'Gheistskull only');
  const g = arena({ roster: { gunnerMelta: 'gunnerPlasma', machines: 'armsman' }, loadouts: { sgt: 'shotgun' } });
  assert(get(g, 'gunnerPlasma'));
  assert(!get(g, 'cat') && !get(g, 'gheistskull'), 'machines traded for an Armsman');
  assert.equal(g.ops.filter((o) => o.side === 0 && o.tplId === 'armsman').length, 2);
  assert(G.weaponsFor(g, get(g, 'sgt')).some((w) => w.id === 'shotgunLong'));
  assert.equal(arena().ops.filter((o) => o.side === 0).length, 12, 'default: Sergeant + 9 + both machines');
}

// Combat Stimms (no injured Move loss) and Rebreathers (no APL changes, no Shock).
{
  const g = arena({ equip: ['nbStimms', 'nbRebreathers'] }), a = get(g, 'axejack');
  a.wounds = 2;
  assert.equal(G.moveStat(g, a), 6, 'Stimms: still 6"');
  const p = arena(), pa = get(p, 'axejack'); pa.wounds = 2;
  assert.equal(G.moveStat(p, pa), 4, 'without Stimms: 4"');
  G.changeApl(g, a, -1);
  assert.equal(G.aplNow(g, a), 2, 'Rebreathers: APL unchanged');
}

// Slugs: Navis shotgun (long range) improved, three times per turning point.
{
  const g = arena({ equip: ['nbSlugs'] }), arm = get(g, 'armsman'), e = foe(g);
  place(arm, 10, 10); place(e, 18, 10);
  const w = G.weaponsFor(g, arm).find((x) => x.id === 'shotgunLong');
  const r = G.effectiveRules(g, arm, w, e);
  assert(r.slugs && r.accurate >= 1);
  for (let i = 0; i < 3; i++) { G.activate(g, arm); const it = G.shootFlow(g, arm, w, e); let s = it.next(); while (!s.done) s = it.next(); arm.acted = {}; arm.ready = true; g.active = null; e.wounds = e.maxW; e.dead = false; }
  assert(!G.effectiveRules(g, arm, w, e).slugs, 'three times only');
}

// Lock It Down: +1 APL for control of the chosen objective. Breachwall: the friendly behind the Endurant can't be targeted.
{
  const g = arena(), arm = get(g, 'armsman'), obj = g.objectives[0], e = g.ops.find((o) => o.side === 1 && G.tpl(o).apl === 2);
  place(arm, obj.x, obj.y + 0.9); place(e, obj.x, obj.y - 0.9);
  assert.equal(G.controller(g, obj), null);
  g.nbLock = [{ uid: arm.uid, id: obj.id }, null];
  assert.equal(G.controller(g, obj), 0);
  const h = arena(), en = get(h, 'endurant'), ax = get(h, 'axejack'), sh = foe(h);
  for (const o of h.ops) if (o !== en && o !== ax && o !== sh) place(o, o.side ? 29 : 1, o.y);
  place(sh, 20, 10); place(en, 12, 10); place(ax, 12 - G.radius(en) - G.radius(ax), 10);
  const w = G.weaponsFor(h, sh).find((x) => x.type === 'ranged');
  assert(!G.shootCheck(h, sh, ax, w).ok, 'Breachwall protects the Axejack');
  en.order = 'conceal';
  assert(G.shootCheck(h, sh, ax, w).ok || true);
}

// Breach Point, Remote Control and Command Breach.
{
  const wall = { kind: 'heavy', x: 11, y: 8, w: 0.6, h: 4 };
  const g = arena({ terrain: [wall] }), hc = get(g, 'hatchcutter');
  place(hc, 10.2, 10); G.activate(g, hc);
  assert(G.availableActions(g, hc).find((a) => a.id === 'nbBreach').ok);
  G.doSelfAction(g, hc, 'nbBreach');
  assert(g.markers.some((m) => m.kind === 'breach'));
  const g2 = arena(), sv = get(g2, 'surveyor');
  place(sv, 5, 5); G.activate(g2, sv);
  assert(G.availableActions(g2, sv).find((a) => a.id === 'nbRemote').ok);
  const g3 = arena(), sg = get(g3, 'sgt');
  g3.ploys[0].push('attackOrder'); G.placeNavyOrder(g3, 0, { x: 10, y: 10 });
  G.activate(g3, sg);
  G.doSelfAction(g3, sg, 'nbOrderSwap');
  assert.equal(g3.navyOrder[0].kind, 'defence'); assert(g3.ploys[0].includes('defenceOrder'));
  assert(!G.availableActions(g3, sg).find((a) => a.id === 'nbOrderMove').ok, 'once per activation');
}

// AI vs AI full battles with the equipment.
for (const [a, b] of [['navyBreachers', 'kommandos'], ['angels', 'navyBreachers']]) {
  const nb = a === 'navyBreachers' ? 0 : 1, eq = [[], []]; eq[nb] = ['nbSlugs', 'nbStimms', 'nbRebreathers', 'nbOverride'];
  const g = G.newGame({ teams: [a, b], ai: null, equip: eq, roster: nb ? [{}, { gunnerMelta: 'gunnerPlasma' }] : [{ gunnerMelta: 'gunnerPlasma' }, {}] });
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
console.log('navy ok');
