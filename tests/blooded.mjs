import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { bloodedRosterError, bloodedIds } from '../js/data/blooded.js';
let seed = 1357;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.blooded;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['blooded', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: Chieftain + nine picks + four from the second list (Enforcer / Ogryn count as two); limits.
{
  assert.equal(bloodedRosterError(T, {}), null);
  assert.equal(bloodedIds(T, {}).length, 12);
  assert.equal(bloodedIds(T, { blSel1: 'trooper+trooper', blSel2: 'trooper+trooper' }).length, 14, 'Troopers instead');
  assert(bloodedRosterError(T, { butcher: 'thug' }), 'two Thugs');
  assert(bloodedRosterError(T, { butcher: 'gunnerGL', thug: 'gunnerMelta' }), 'four Gunners / Sharpshooter');
  assert.equal(bloodedRosterError(T, { butcher: 'trooper', thug: 'trooper' }), null, 'Troopers repeat');
  assert(bloodedRosterError(T, { gunner: 'gunnerPlasma' }, { chieftain: 'plasma+improvised' }), 'one plasma weapon');
  const g = arena({ roster: { gunner: 'gunnerPlasma', blSel1: 'trooper+trooper' }, loadouts: { chieftain: 'boltgun+bayonet' } });
  assert.deepEqual(G.weaponsFor(g, get(g, 'chieftain')).map((w) => w.id).filter((id) => /boltgun|bayonet/i.test(id)), ['boltgunBL', 'bayonetChief']);
  assert.equal(g.ops.filter((o) => o.side === 0 && o.tplId === 'trooper').length, 2);
  assert.equal(G.tpl(get(g, 'trooper')).groupAct, 'blTrooper');
}

// Enforce: another friendly within 3" takes a free 1AP action (moving 2" at most).
{
  const g = arena(), en = get(g, 'enforcer'), t = get(g, 'thug');
  place(en, 10, 10); place(t, 12, 10); G.activate(g, en);
  assert(G.TARGET_ACTIONS.blEnforce.targets(g, en).includes(t));
  G.doTargetAction(g, en, 'blEnforce', t);
  assert(g.netcounter && g.netcounter.only[0] === t.uid && g.netcounter.ctlMove === 2);
}

// Blooded Icon: a token holder falling within 6" of the Chieftain gives the token back (once per TP).
{
  const g = arena(), c = get(g, 'chieftain'), t = get(g, 'thug');
  place(c, 10, 10); place(t, 12, 10); t.bloodToken = true;
  const pool = g.bloodPool?.[0] || 0;
  G.applyDamage(g, null, t, t.wounds);
  assert.equal(g.bloodPool[0], pool + 1, 'token regained');
}

// A Name Whispered in Blood: the Sharpshooter's pick counts as token + Gaze.
{
  const g = arena(), s = get(g, 'sharpshooter'), e = foe(g); place(s, 5, 10); place(e, 20, 10);
  g.blName = [e.uid, null];
  const r = G.effectiveRules(g, s, G.weaponsFor(g, s).find((w) => w.id === 'longLasMobileBL'), e);
  assert(r.accurate === 1 && r.gaze, 'Accurate 1 and the Gaze');
  const g2 = arena(); g2.phase = 'initiative'; g2.initLocked = true; g2.initiative = 0; G.startStrategy(g2);
  assert(g2.blName?.[0], 'picked automatically in TP1');
}

// Dark Favour: a token holder targeted — a sturdier friend within 3" takes its place.
{
  const g = arena(), t = get(g, 'thug'), og = get(g, 'ogryn'), e = foe(g);
  place(t, 10, 10); place(og, 11.8, 10); place(e, 20, 10); t.bloodToken = true;
  g.active = e.uid; g.turn = 1; e.order = 'engage'; G.activate(g, e);
  const w = G.weaponsFor(g, e).find((x) => x.type === 'ranged' && !x.rules.blast && !x.rules.torrent);
  G.resolveShoot(g, e, w, t);
  assert(g.log.some((l) => /Dark Favour|黑暗恩寵/.test(JSON.stringify(l))), 'Dark Favour used');
}

// Callous Disregard: shoot into a fight a friend is in; failed dice hurt the friend.
{
  const g = arena(), s = get(g, 'sharpshooter'), t = get(g, 'thug'), e = foe(g);
  place(s, 5, 10); place(e, 20, 10); place(t, 21.2, 10); G.activate(g, s);
  const w = G.weaponsFor(g, s).find((x) => x.id === 'longLasMobileBL');
  assert(G.shootCheck(g, s, e, w).ok, 'a valid target despite the friend fighting it');
  const before = t.wounds, cp = g.cp[0];
  G.resolveShoot(g, s, w, e);
  assert.equal(g.cp[0], cp - 1, 'paid');
  assert(t.wounds <= before);
  g.ffOff = [['callousDisregard'], []]; const h = arena(); h.ffOff = [['callousDisregard'], []]; const s2 = get(h, 'sharpshooter'), e2 = foe(h); place(s2, 5, 10); place(e2, 20, 10); place(get(h, 'thug'), 21.2, 10); G.activate(h, s2);
  assert(!G.shootCheck(h, s2, e2, w).ok, '(switched off: not a valid target)');
}

// AI vs AI full battles.
for (const [a, b] of [['blooded', 'kommandos'], ['angels', 'blooded']]) {
  const bl = a === 'blooded' ? 0 : 1;
  const roster = [{}, {}]; roster[bl] = { gunner: 'gunnerMelta', thug: 'trooper', blSel2: 'trooper+trooper' };
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
  assert(steps < 4000, `${a} vs ${b}: simulation stalled`);
  console.log(`${a} vs ${b}: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('blooded ok');
