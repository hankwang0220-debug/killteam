import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { kasrkinRosterError } from '../js/data/kasrkin.js';
let seed = 4242;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.kasrkin;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['kasrkin', opts.foe || 'kommandos'], ai: null, equip: [[], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 2, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0], initiative: 1 });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: each once except Troopers, at most four Gunners; Sergeant loadouts; the new Gunners.
{
  assert.equal(kasrkinRosterError(T, {}), null);
  assert.equal(kasrkinRosterError(T, { ksMedic: 'ksTrooper', ksDemo: 'ksTrooper' }), null, 'Troopers repeat');
  assert(kasrkinRosterError(T, { ksMedic: 'ksRecon' }), 'two Recon-troopers');
  assert(kasrkinRosterError(T, { ksMedic: 'ksGL', ksDemo: 'ksVolley' }), 'five Gunners');
  assert.equal(kasrkinRosterError(T, { ksMedic: 'ksGL', ksFlamer: 'ksVolley' }), null, 'four Gunners');
  const g = arena({ roster: { ksMedic: 'ksGL', ksFlamer: 'ksVolley' }, loadouts: { ksSergeant: 'plasma+chain' } });
  assert.deepEqual(G.weaponsFor(g, get(g, 'ksSergeant')).map((w) => w.id), ['plasmaPistolStd', 'plasmaPistolSup', 'chainswordSgt']);
  assert(G.weaponsFor(g, get(g, 'ksGL')).some((w) => w.id === 'ksGLFrag'));
  assert(G.weaponsFor(g, get(g, 'ksVolley')).some((w) => w.id === 'ksVolleyS'));
  assert.throws(() => arena({ roster: { ksMedic: 'ksRecon' } }));
}

// Relocate: not in TP1; the anchor and friends within 3" of it, all more than 3" from enemies, make free Dashes.
{
  const p = T.ploys.find((x) => x.id === 'ksRelocate');
  const g1 = arena({ tp: 1 }); g1.phase = 'strategy';
  assert(G.ployTaken(g1, 0, p), 'not in the first turning point');
  const g = arena(); g.phase = 'strategy'; g.stratTurn = 0; g.pick = [true, false];
  const a = place(get(g, 'ksTrooper'), 10, 10), b = place(get(g, 'ksVox'), 12, 10), c = place(get(g, 'ksRecon'), 10, 20), e = place(foe(g), 20, 10);
  if (G.ployChooser(g) !== 0) g.stratTurn = 0;
  assert(G.buyPloy(g, 0, p));
  assert(G.resolveChoice(g, 0, a.uid));
  const ax = a.x, bx = b.x, cx = c.x;
  assert(G.resolveChoice(g, 0, 'auto'));
  assert(a.x > ax && b.x > bx, 'both moved towards the enemy');
  assert.equal(c.x, cx, 'too far from the anchor');
  assert(e);
}

// Seize the Initiative: the player without initiative, one free 1AP action without moving, 1CP.
{
  const g = arena(); g.phase = 'strategy'; g.initiative = 1;
  G.startFirefight(g);
  assert.equal(g.turn, 0); assert(g.counter);
  const t = get(g, 'ksTrooper'); place(t, 10, 10); place(foe(g), 16, 10);
  G.activate(g, t);
  assert.equal(g.cp[0], 2, '1CP');
  assert(!G.availableActions(g, t).some((a) => ['reposition', 'dash', 'charge', 'fallBack'].includes(a.id)), 'no moving');
  assert(G.availableActions(g, t).some((a) => a.id === 'shoot' && a.ok));
  G.endActivation(g);
  assert.equal(g.turn, 1, 'then the player with initiative');
  assert(t.ready, 'it can still activate later');
  const h = arena(); h.initiative = 0; G.startFirefight(h);
  assert(!h.counter, 'not for the player with initiative');
}

// Cover Retreat: after a Fall Back, a friendly within 6" makes a free Shoot, then the first carries on.
{
  const g = arena(), a = place(get(g, 'ksTrooper'), 10, 10), b = place(get(g, 'ksVox'), 10, 14), e = place(foe(g), 11.8, 10);
  for (const o of g.ops) if (o.side === 0 && o !== a && o !== b) o.x = -60; // (out of the killzone)
  b.order = 'conceal'; G.activate(g, a);
  assert(!G.ffButtons(g, a).find((x) => x.id === 'coverRetreat')?.ok, 'only after a Fall Back');
  assert.notEqual(G.doMove(g, a, 'fallBack', { pts: [{ x: 10, y: 10 }, { x: 7.5, y: 10 }] }), false);
  assert(G.ffButtons(g, a).find((x) => x.id === 'coverRetreat').ok);
  G.useFFButton(g, a, 'coverRetreat');
  assert.equal(b.order, 'engage');
  assert.deepEqual(G.counterCandidates(g, 0).map((o) => o.uid), [b.uid]);
  G.activate(g, b);
  assert.deepEqual(G.availableActions(g, b).map((x) => x.id), ['shoot']);
  G.endActivation(g);
  assert.equal(g.active, a.uid, 'back to the one that fell back');
  assert(e);
}

// Give No Ground: a tie at a total APL of 2+ on the chosen marker goes to the Kasrkin (this activation).
{
  const g = arena(), m = g.objectives[0], a = place(get(g, 'ksTrooper'), m.x - 1.2, m.y);
  const e = place(g.ops.find((o) => o.side === 1 && TEAM_MAP.kommandos.ops.find((t) => t.id === o.tplId).apl === 2), m.x + 1.2, m.y);
  for (const o of g.ops) if (o !== a && o !== e) place(o, o.side ? 29 : 1, o.y);
  assert.equal(G.controller(g, m), null, 'a tie');
  G.activate(g, a);
  assert(G.ffButtons(g, a).find((x) => x.id === 'giveNoGround').ok);
  G.useFFButton(g, a, 'giveNoGround');
  assert.equal(G.controller(g, m), 0);
  G.endActivation(g);
  assert.equal(G.controller(g, m), null, 'only this activation');
}

// AI vs AI full battles.
for (const roster of [{}, { ksMedic: 'ksGL', ksFlamer: 'ksVolley', ksRecon: 'ksTrooper' }]) {
  const g = G.newGame({ teams: ['kasrkin', 'kommandos'], ai: null, equip: [[], []], roster: [roster, {}] });
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
  assert(steps < 4000, 'kasrkin: simulation stalled');
  console.log(`kasrkin vs kommandos: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('kasrkin ok');
