import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { phobosRosterError } from '../js/data/phobos.js';
let seed = 777;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.phobos;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['phobos', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: three Sergeants, new picks, Warriors repeat, Reiver and Veteran options.
{
  assert.equal(phobosRosterError(T, {}), null);
  assert.equal(phobosRosterError(T, { commsman: 'phInfWarrior', helix: 'phInfWarrior' }), null, 'Warriors repeat');
  assert(phobosRosterError(T, { commsman: 'helix' }), 'two Helix Adepts');
  const g = arena({ roster: { sgt: 'phReiverSgt', commsman: 'phSaboteur', helix: 'phMinelayer', voxbreaker: 'phVeteran' }, loadouts: { phReiverSgt: 'carbine', phVeteran: 'rending+saturate' } });
  assert(G.weaponsFor(g, get(g, 'phReiverSgt')).some((w) => w.id === 'boltCarbinePh'));
  const vw = G.weaponsFor(g, get(g, 'phVeteran')).find((w) => w.id === 'customCarbine');
  assert(vw.rules.rending && vw.rules.saturate && !vw.rules.balanced, 'custom carbine rules');
  assert(g.markers.some((m) => m.kind === 'wsMine' && m.carriedBy === get(g, 'phMinelayer').uid), 'the Minelayer carries the Haywire Mine');
  const sab = get(g, 'phSaboteur'); place(sab, 6, 6); G.activate(g, sab);
  assert(G.availableActions(g, sab).find((a) => a.id === 'dkPlaceMine').ok, 'Plant Explosives');
}

// Equipment: Combat Blades, Purity Seals once per TP, Special Issue Ammunition, Additional Utility Grenades.
{
  const g = arena({ equip: ['phBlades', 'phAmmo', 'phGrenades'] }), s = get(g, 'sgt'), e = foe(g);
  assert(G.weaponsFor(g, s).some((w) => w.id === 'phBlade'));
  assert.equal(g.eqUses[0].stun, 2); assert.equal(g.eqUses[0].smoke, 2);
  place(s, 10, 10); place(e, 18, 10); G.activate(g, s);
  const w = G.weaponsFor(g, s).find((x) => x.id === 'marksmanCarbine');
  assert.equal(G.effectiveRules(g, s, w, e).piercing, 1, 'ammo offered');
  const it = G.shootFlow(g, s, w, e); let st = it.next(); while (!st.done) st = it.next();
  assert(g.phAmmo[0], 'ammo loaded');
  assert.equal(G.effectiveRules(g, s, w, e).piercing, 1, 'Piercing 1 for the rest of the TP');
  const c = get(g, 'commsman'); g.active = null; place(c, 10, 12); G.activate(g, c);
  assert(!G.effectiveRules(g, c, G.weaponsFor(g, c).find((x) => x.id === 'marksmanCarbine'), e).piercing, 'once per TP: not another operative');
}

// Tactical Advantage: initiative re-roll once; a free firefight ploy for the Sergeant once. Patient Ambush skips an activation.
{
  const g = arena(); g.phase = 'initiative'; g.initLocked = false; g.initRoll = [1, 6];
  assert(G.phTacInitOk(g, 0)); assert(G.phTacInit(g, 0)); assert(!G.phTacInitOk(g, 0), 'once per battle');
  const h = arena(); h.cp[0] = 1;
  assert(G.skipArchonActivation(h, 0, 'patientAmbush'), 'Patient Ambush');
  assert.equal(h.turn, 1, 'the opponent activates');
  assert.equal(h.cp[0], 1, 'free through Tactical Advantage (Sergeant ready and free)');
}

// Comms Array: swap a used strategy ploy for free, once per TP.
{
  const g = arena(); g.ploys[0] = ['lethalAssaults'];
  assert(G.phCommsOk(g, 0));
  assert(G.phCommsChoose(g, 0, 'deadlyShots', 'lethalAssaults'));
  assert.deepEqual(g.ploys[0], ['deadlyShots']);
  assert(!G.phCommsOk(g, 0), 'once per TP');
}

// Track Target: the Incursor Marksman can Guard while Concealed.
{
  const g = arena(), m = get(g, 'marksman'); m.order = 'conceal'; place(m, 5, 5); G.activate(g, m);
  assert(G.availableActions(g, m).find((a) => a.id === 'phGuard').ok);
  G.doSelfAction(g, m, 'phGuard'); assert(m.dwGuard);
}

// Stealth Assault: Concealed when activated, Engage, Charge then Fight — an extra attack dice resolved first.
{
  const g = arena(), r = get(g, 'reiver'), e = foe(g);
  r.order = 'conceal'; place(r, 10, 10); place(e, 11.4, 10); G.activate(g, r);
  r.order = 'engage'; r.orderSet = true; r.acted.charge = 1;
  G.startFight(g, r, G.weaponsFor(g, r).find((w) => w.type === 'melee'), e);
  assert(g.fight.A.extraStrike, 'Stealth Assault'); assert.equal(g.cp[0], 2, 'paid 1CP');
  const h = arena(), r2 = get(h, 'reiver'), e2 = foe(h);
  place(r2, 10, 10); place(e2, 11.4, 10); G.activate(h, r2); r2.acted.charge = 1;
  G.startFight(h, r2, G.weaponsFor(h, r2).find((w) => w.type === 'melee'), e2);
  assert(!h.fight.A.extraStrike, '(not without starting Concealed)');
}

// AI vs AI full battles.
for (const [a, b] of [['phobos', 'kommandos'], ['angels', 'phobos']]) {
  const ph = a === 'phobos' ? 0 : 1, eq = [[], []]; eq[ph] = ['phSeals', 'phAmmo', 'phGrenades', 'phBlades'];
  const roster = [{}, {}]; roster[ph] = { sgt: 'phIncSgt', commsman: 'phSaboteur', helix: 'phMinelayer' };
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
console.log('phobos ok');
