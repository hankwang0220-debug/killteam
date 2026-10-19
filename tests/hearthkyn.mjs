import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 9001;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(opts = {}) {
  const g = G.newGame({ teams: ['hearthkyn', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], opts.foeEquip || []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 12) * 1.8; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Need Keeps: +1 total APL contesting the marker; melee Atk +1 within 3" (Atk 4 → Balanced).
{
  const g = arena(), obj = g.objectives[0], d = get(g, 'dozr'), e = g.ops.find((o) => o.side === 1 && G.tpl(o).apl === 2);
  place(d, obj.x, obj.y + 0.9); place(e, obj.x, obj.y - 0.9);
  const sumBefore = G.controller(g, obj);
  g.ploys[0].push('needKeeps'); g.hkMarker = { needKeeps: [{ tp: g.tp, id: obj.id }, null] };
  assert.equal(sumBefore, null, 'APL 2 vs 2: contested');
  assert.equal(G.controller(g, obj), 0, 'Need Keeps tips it');
  const knux = G.weaponsFor(g, d).find((w) => w.type === 'melee');
  const r = G.effectiveRules(g, d, knux, e);
  assert(knux.atk < 4 ? r.atkPlus === 1 : knux.atk === 4 ? r.balanced : true, 'melee bonus within 3"');
  place(d, 2, 2);
  assert(!G.effectiveRules(g, d, knux, e).atkPlus, 'not far from the marker');
}

// Toil Earns: an enemy within 3" of the marker counts one more Grudge token.
{
  const g = arena(), obj = g.objectives[0], th = get(g, 'theyn'), e = foe(g);
  place(e, obj.x + 1, obj.y); place(th, obj.x - 6, obj.y);
  const w = G.weaponsFor(g, th).find((x) => x.type === 'ranged');
  assert(!G.effectiveRules(g, th, w, e).grudge);
  g.ploys[0].push('toilEarns'); g.hkMarker = { toilEarns: [{ tp: g.tp, id: obj.id }, null] };
  assert.equal(G.effectiveRules(g, th, w, e).grudge, 1);
}

// Excavation Tools: Pick Up Marker for 1 less AP, contesting is enough. Plasma Knives: everyone has one.
{
  const g = arena({ equip: ['hkTools', 'hkKnives'] }), k = get(g, 'kinlynk');
  assert(G.weaponsFor(g, k).some((w) => w.id === 'hkPlasmaKnife'), 'plasma knife added');
  const med = get(g, 'medic');
  assert.equal(G.weaponsFor(g, med).filter((w) => /plasma knife/i.test(w.name.en)).length, 1, 'the Medic keeps its own');
  const plain = arena();
  assert(!G.weaponsFor(plain, get(plain, 'kinlynk')).some((w) => w.id === 'hkPlasmaKnife'));
}

// Writ of Claim: once per battle, an initiative re-roll while contesting two objective markers.
{
  const g = arena({ equip: ['hkWrit'] });
  g.phase = 'initiative'; g.initLocked = false; g.initRoll = [1, 6];
  assert(!G.hkWritOk(g, 0), 'not contesting two markers');
  const [a, b] = g.ops.filter((o) => o.side === 0);
  place(a, g.objectives[0].x, g.objectives[0].y + 0.8); place(b, g.objectives[1].x, g.objectives[1].y + 0.8);
  assert(G.hkWritOk(g, 0));
  assert(G.hkUseWrit(g, 0));
  assert(!G.hkWritOk(g, 0), 'once per battle');
}

// Worth It: an incapacitated Hearthkyn performs a free mission action (armed for the engine by default).
{
  const g = G.newGame({ teams: ['hearthkyn', 'kommandos'], ai: null, mission: 'secure', equip: [[], []] });
  Object.assign(g, { tp: 2, phase: 'firefight', turn: 1, terrain: [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 12) * 1.8; o.placed = true; o.order = 'engage'; o.ready = true; });
  const v = get(g, 'lugger'), obj = g.objectives[0];
  place(v, obj.x, obj.y + 0.8);
  const before = g.log.length;
  v.wounds = 1; G.applyDamage(g, foe(g), v, 5);
  assert(v.dead);
  const worth = g.log.slice(before).some((l) => /Worth It/.test(l.msg?.en || ''));
  assert(worth, 'Worth It: a free Secure before it is removed');
  assert.equal(obj.secured, 0, 'the objective is secured');
}

// Roster: Warriors and Gunner options; each once except Warriors; at most three Gunners; the Theyn's weapon options.
{
  const { hearthkynRosterError } = await import('../js/data/hearthkyn.js');
  const { TEAM_MAP } = await import('../js/data/teams.js');
  const T = TEAM_MAP.hearthkyn;
  assert.equal(hearthkynRosterError(T, {}), null);
  assert.equal(hearthkynRosterError(T, { dozr: 'hkWarrior', medic: 'hkWarrior' }), null, 'two Warriors are fine');
  assert(hearthkynRosterError(T, { dozr: 'medic' }), 'two Field Medics');
  assert(hearthkynRosterError(T, { dozr: 'hkGunnerBeamer', medic: 'hkGunnerRifle', grenadier: 'hkGunnerL7' }), 'four Gunners');
  assert.throws(() => arena({ roster: { dozr: 'medic' } }));
  const g = G.newGame({ teams: ['hearthkyn', 'kommandos'], ai: null, equip: [[], []], roster: [{ dozr: 'hkWarrior', medic: 'hkGunnerMagna' }], loadouts: [{ theyn: 'ionPistol+gauntlet', hkWarrior: 'ion' }] });
  const th = get(g, 'theyn'), w = get(g, 'hkWarrior'), mg = get(g, 'hkGunnerMagna');
  assert(w && mg, 'picked operatives');
  assert.deepEqual(G.weaponsFor(g, th).map((x) => x.id), ['ionPistolTh', 'concussionGauntlet']);
  assert(G.weaponsFor(g, w).some((x) => x.id === 'ionBlaster'));
  // Well Supplied: a fifth equipment option only with the Lugger.
  const five = ['hkTools', 'hkWrit', 'hkKnives', 'hkRigs', 'comms'];
  assert.equal(G.newGame({ teams: ['hearthkyn', 'kommandos'], ai: null, equip: [five, []] }).equip[0].length, 5);
  assert.equal(G.newGame({ teams: ['hearthkyn', 'kommandos'], ai: null, equip: [five, []], roster: [{ lugger: 'hkWarrior' }] }).equip[0].length, 4);
}

// Beam: crits hurt the operatives behind the target on the beam line, not the target.
{
  const g = arena({ roster: { gunner: 'hkGunnerBeamer' } }), b = get(g, 'hkGunnerBeamer');
  const [t1, t2, t3] = g.ops.filter((o) => o.side === 1);
  for (const o of g.ops) if (o !== b && o !== t1 && o !== t2 && o !== t3) place(o, o.side ? 29 : 1, o.y);
  place(b, 5, 10); place(t1, 12, 10); place(t2, 16, 10); place(t3, 16, 16);
  const w = G.weaponsFor(g, b).find((x) => x.id === 'plasmaBeamer');
  let hitBehind = false;
  for (let i = 0; i < 30 && !hitBehind; i++) {
    t1.wounds = t1.maxW; t2.wounds = t2.maxW; t3.wounds = t3.maxW; t1.dead = t2.dead = t3.dead = false;
    G.activate(g, b); const it = G.shootFlow(g, b, w, t1); let s = it.next(); while (!s.done) s = it.next();
    if (t2.wounds < t2.maxW) hitBehind = true;
    assert.equal(t3.wounds, t3.maxW, 'not on the beam line');
    b.acted = {}; b.ready = true; g.active = null;
  }
  assert(hitBehind, 'an operative behind the target takes beam damage');
}

// Secure Salvage: a Warrior contesting a marker takes 1 less from one success per attack.
{
  const g = arena({ roster: { dozr: 'hkWarrior' } }), w = get(g, 'hkWarrior'), obj = g.objectives[0];
  place(w, obj.x, obj.y + 0.9);
  assert(G.hkSecureSalvage(g, w));
  place(w, 3, 3);
  assert(!G.hkSecureSalvage(g, w));
}

// Utility Grenade (Grenadier) and Accelerated Appraisal (Kognitâar).
{
  const g = arena(), gr = get(g, 'grenadier'), kg = get(g, 'kognitaar'), e = foe(g), obj = g.objectives[0];
  place(gr, 10, 10); place(e, 14, 10); G.activate(g, gr);
  assert(G.availableActions(g, gr).some((a) => a.id === 'hkUtility' && a.ok));
  G.doTargetAction(g, gr, 'hkUtility', e);
  const pick = (o) => G.availableActions(g, o).find((a) => a.id === 'pickUp');
  assert(g.hkUtil[0], 'marker placed');
  g.active = null; gr.ready = false;
  place(kg, 6, 6); G.activate(g, kg);
  assert(G.availableActions(g, kg).some((a) => a.id === 'hkAppraisal' && a.ok));
  G.doTargetAction(g, kg, 'hkAppraisal', e);
  assert.equal(g.tactician[0].kind, 'attack');
}

// AI vs AI full battles with all four equipment options and the ploys.
for (const [a, b] of [['hearthkyn', 'kommandos'], ['angels', 'hearthkyn']]) {
  const hk = a === 'hearthkyn' ? 0 : 1, eq = [[], []]; eq[hk] = ['hkTools', 'hkWrit', 'hkKnives', 'hkRigs'];
  const g = G.newGame({ teams: [a, b], ai: null, equip: eq, mission: 'secure' });
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
console.log('hearthkyn ok');
