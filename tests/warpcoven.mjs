import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { warpcovenRosterError } from '../js/data/warpcoven.js';
let seed = 4242;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.warpcoven;
const ALL = { wcSel1: 'destiny', wcSel2: 'warpfire', wcSel3: 'tempyrion', wcSel4: 'rubricIcon', wcSel5: 'tzHorn+tzIcon' };
function arena(opts = {}) {
  const g = G.newGame({ teams: ['warpcoven', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || ALL], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: five selections, two Tzaangor make one; at least one Sorcerer; each once except Warriors; one warpflame pistol; boons once.
{
  assert.equal(warpcovenRosterError(T, {}), null);
  assert.equal(warpcovenRosterError(T, ALL), null);
  assert.equal(warpcovenRosterError(T, { wcSel1: 'rubric', wcSel2: 'rubric', wcSel3: 'rubricGunner', wcSel4: 'tzaangor+tzaangor', wcSel5: 'destiny' }), null, 'Warriors repeat');
  assert(warpcovenRosterError(T, { wcSel1: 'rubric', wcSel2: 'rubric' }), 'no Sorcerer');
  assert(warpcovenRosterError(T, { wcSel3: 'destiny' }), 'two Sorcerers of Destiny');
  assert(warpcovenRosterError(T, { wcSel5: 'champion+tzaangor', wcSel4: 'champion+tzShield' }), 'two Champions');
  assert(warpcovenRosterError(T, {}, { destiny: 'warpflame', warpfire: 'warpflame' }), 'two warpflame pistols');
  assert(warpcovenRosterError(T, { boon_warpfire: 'twist' }), 'the same boon twice');
  const g = arena({ roster: { ...ALL, wcSel4: 'rubricGunner', wcSel5: 'tzShield+tzPistol' }, loadouts: { rubricGunner: 'warpflamer', destiny: 'khopesh' } });
  assert.equal(g.ops.filter((o) => o.side === 0).length, 6);
  assert(G.weaponsFor(g, get(g, 'rubricGunner')).some((w) => w.id === 'warpflamer'));
  assert(G.weaponsFor(g, get(g, 'destiny')).some((w) => w.id === 'khopesh'));
  assert.equal(T.ops.find((o) => o.id === 'tzShield').save, 4, 'the shield gives a 4+ save');
}

// Boons: Time-Walk, Warp Swell, Twist of Fate, Incorporeal Sight, Astral Bombardment, Master of the Immaterium.
{
  const g = arena({ roster: { ...ALL, boon_destiny: 'bombard', boon_warpfire: 'warpSwell', boon_tempyrion: 'timeWalk' } });
  const d = get(g, 'destiny'), w = get(g, 'warpfire'), t = get(g, 'tempyrion'), e = foe(g);
  assert.equal(G.moveStat(g, t), 7, 'Time-Walk +1"');
  assert.equal(G.weaponsFor(g, w).find((x) => x.id === 'khopesh').dmg[0], 5, 'Warp Swell +1 Normal Dmg');
  assert.equal(G.weaponsFor(g, w).find((x) => x.id === 'firestorm').dmg[0], 2, '(ranged unchanged)');
  place(d, 10, 10); place(e, 16, 10);
  const r = G.effectiveRules(g, d, G.weaponsFor(g, d).find((x) => x.id === 'doombolt'), e);
  assert.equal(r.devSplash, 2, 'Astral Bombardment: 2" Devastating 2');
  assert(!r.piercingCrits, 'no Twist of Fate without the boon');
  const h = arena();
  const hd = get(h, 'destiny'), he = foe(h); place(hd, 10, 10); place(he, 16, 10);
  assert.equal(G.effectiveRules(h, hd, G.weaponsFor(h, hd).find((x) => x.id === 'doombolt'), he).piercingCrits, 1, 'Twist of Fate');
  assert(G.effectiveRules(h, get(h, 'warpfire'), G.weaponsFor(h, get(h, 'warpfire')).find((x) => x.id === 'mindburn'), he).saturate);
  // Master of the Immaterium (Tempyrion default): Reconstitution Ritual reaches 9".
  const r2 = get(h, 'rubricIcon'); place(get(h, 'tempyrion'), 5, 20); place(r2, 5, 28.5); r2.wounds = 5; G.activate(h, get(h, 'tempyrion'));
  assert(G.TARGET_ACTIONS.wcRecon.targets(h, get(h, 'tempyrion')).includes(r2), '9" with Master of the Immaterium');
}

// Sorcerer of Tempyrion: Reconstitution Ritual (once per TP for the team), Temporal Flux.
{
  const g = arena(), t = get(g, 'tempyrion'), r = get(g, 'rubricIcon');
  place(t, 10, 10); place(r, 12, 10); r.wounds = 4; G.activate(g, t);
  G.doTargetAction(g, t, 'wcRecon', r);
  assert(r.wounds >= 6 && r.wounds <= 10, 'regains 2D3');
  assert(!G.TARGET_ACTIONS.wcRecon.targets(g, t).length, 'once per turning point');
  G.doTargetAction(g, t, 'wcFlux', r);
  assert(g.wcFlux[0] && g.wcFlux[0].uid === r.uid);
  G.endActivation(g);
  g.active = null; g.turn = 0; G.activate(g, r); place(r, 15, 10); G.endActivation(g);
  assert.equal(Math.round(r.x), 12, 'set back up at the marker'); assert(!g.wcFlux[0]);
}

// Brayhorn, Herd Banner, Relic Hunters, Icon Bearers.
{
  const g = arena(), horn = get(g, 'tzHorn'), icon = get(g, 'tzIcon');
  place(horn, 10, 10); G.activate(g, horn);
  G.doSelfAction(g, horn, 'wcBrayhorn');
  assert.equal(G.moveStat(g, icon), 7, 'Brayhorn: +1" for Tzaangor');
  assert.equal(G.moveStat(g, get(g, 'rubricIcon')), 5, '(not the Rubric Marines)');
  const h = arena({ roster: { ...ALL, wcSel5: 'tzIcon+tzaangor' } }), b = get(h, 'tzIcon'), tz = get(h, 'tzaangor'), e = foe(h);
  place(b, 10, 10); place(tz, 11.5, 10); place(e, 12.5, 10);
  assert.equal(G.wcBanner(h, tz, 3), 2, 'Herd Banner: 3 Normal Dmg deals 2');
  assert.equal(G.wcBanner(h, tz, 2), 2, '(less than 3 unchanged)');
  place(tz, 20, 10); assert.equal(G.wcBanner(h, tz, 3), 3, '(not within 3")');
  assert.equal(G.wcBanner(h, get(h, 'rubricIcon'), 3), 3, '(Tzaangor only)');
  // Relic Hunters: once per battle in the opponent's territory.
  const k = arena({ roster: { ...ALL, wcSel5: 'tzaangor+tzaangor' } });
  const w1 = get(k, 'tzaangor');
  place(w1, 25, 10);
  assert.equal(G.actionCost(k, w1, 'pickUp'), 0, 'Pick Up for 1 less in the opponent\'s territory');
  place(w1, 5, 10);
  assert.equal(G.actionCost(k, w1, 'pickUp'), 1, '(not in your own territory)');
}

// Equipment: Ensorcelled Rounds, Daemonmaw Weapons, Arcane Robes; Aetherial Warding still works.
{
  const g = arena({ equip: ['wcRounds', 'wcMaws', 'wcRobes'] }), r = get(g, 'rubricIcon'), e = foe(g);
  place(r, 10, 10); place(e, 16, 10);
  assert.equal(G.effectiveRules(g, r, G.weaponsFor(g, r).find((x) => x.id === 'infernoBoltgun'), e).devastating, 1, 'Ensorcelled Rounds');
  g.active = r.uid;
  assert.equal(G.effectiveRules(g, r, G.weaponsFor(g, r).find((x) => x.id === 'fistsWC'), e).atkPlus, 1, 'Daemonmaw: +1 Atk');
  g.active = e.uid;
  assert.equal(G.effectiveRules(g, r, G.weaponsFor(g, r).find((x) => x.id === 'fistsWC'), e).accurate, 1, 'Daemonmaw: Accurate 1 retaliating');
}

// Fate Itself Is My Weapon: two reserved dice replace attack dice.
{
  const g = arena(); g.phase = 'strategy';
  g.wcFate = [{ tp: 1, dice: [6, 6], pair: true }, null];
  g.phase = 'firefight';
  const d = get(g, 'destiny'), e = foe(g); place(d, 10, 10); place(e, 16, 10); G.activate(g, d);
  G.resolveShoot(g, d, G.weaponsFor(g, d).find((x) => x.id === 'infernoPistol'), e);
  assert(g.wcFate[0].dice.length < 2, 'a reserved 6 replaced a weaker attack dice');
}

// Mutant Herd: the other Tzaangor activates straight after.
{
  const g = arena(), horn = get(g, 'tzHorn'), icon = get(g, 'tzIcon');
  place(horn, 10, 10); place(icon, 11.5, 10); G.activate(g, horn);
  assert(G.ffButtons(g, horn).find((b) => b.id === 'mutantHerd').ok);
  G.useFFButton(g, horn, 'mutantHerd');
  assert.equal(horn.wcHerd, icon.uid);
  G.endActivation(g);
  assert.deepEqual(g.chain?.uids, [icon.uid], 'the Icon Bearer activates next');
  assert.equal(g.turn, 0);
}

// Psychic Cabal: borrow another Sorcerer's psychic weapon or action; Sorcerous Scrolls; Echoes from the Warp; Immaterial Flight.
{
  const g = arena({ equip: ['wcScrolls'], roster: { ...ALL, boon_warpfire: 'echoes', boon_tempyrion: 'flight' } });
  const d = get(g, 'destiny'), w = get(g, 'warpfire'), t = get(g, 'tempyrion');
  place(d, 10, 10); place(w, 13, 10); place(t, 10, 14);
  G.activate(g, d);
  assert(G.ffButtons(g, d).find((b) => b.id === 'psychicCabal').ok);
  G.useFFButton(g, d, 'psychicCabal');
  assert(d.acted.cabal, 'borrowed something');
  if (d.acted.cabal.kind === 'w') assert(!G.weaponsFor(g, w).some((x) => x.id === d.acted.cabal.id), 'the lender can\'t use it this TP');
  G.endActivation(g);
  // Sorcerous Scrolls: change a boon (picked by the player; here directly through the choice).
  g.active = null; g.turn = 0; G.activate(g, t);
  assert(G.availableActions(g, t).find((a) => a.id === 'wcScrolls').ok);
  // Immaterial Flight: a FLY Reposition.
  assert(G.availableActions(g, t).find((a) => a.id === 'wcFlight').ok);
  G.doSelfAction(g, t, 'wcFlight');
  assert(t.acted.wcFly); assert.equal(G.moveAllowance(g, t, 'charge'), G.moveStat(g, t), 'no extra Charge distance when flying');
  G.endActivation(g);
  // Echoes from the Warp: a counteraction with one more action.
  w.ready = false; w.order = 'conceal'; g.counter = true; g.turn = 0; g.active = null; G.activate(g, w);
  assert(G.availableActions(g, w).find((a) => a.id === 'wcEchoes').ok);
  G.doSelfAction(g, w, 'wcEchoes');
  assert.equal(w.ap, 2); assert(g.wcEchoUsed[0]);
}

// AI vs AI full battles.
for (const [a, b] of [['warpcoven', 'kommandos'], ['angels', 'warpcoven']]) {
  const wc = a === 'warpcoven' ? 0 : 1, eq = [[], []]; eq[wc] = ['wcRounds', 'wcScrolls', 'wcMaws', 'wcRobes'];
  const roster = [{}, {}]; roster[wc] = { ...ALL, wcSel4: 'rubricGunner', boon_tempyrion: 'echoes' };
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
console.log('warpcoven ok');
