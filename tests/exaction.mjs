import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { exactionRosterError } from '../js/data/exaction.js';
let seed = 8642;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.exaction;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['exaction', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: the Proctor's options, Gunners (two, different), Subductors (four) and Vigilants repeat.
{
  assert.equal(exactionRosterError(T, {}), null);
  assert.equal(exactionRosterError(T, { castigator: 'exGunnerGL', chirurgant: 'exGunnerWebber', malocator: 'subductor', marksman: 'subductor', revelatum: 'vigilant' }), null);
  assert(exactionRosterError(T, { castigator: 'exGunnerGL', chirurgant: 'exGunnerGL' }), 'the same Gunner option twice');
  assert(exactionRosterError(T, { castigator: 'exGunnerGL', chirurgant: 'exGunnerWebber', malocator: 'exGunnerStubber' }), 'three Gunners');
  assert(exactionRosterError(T, { castigator: 'subductor', chirurgant: 'subductor', malocator: 'subductor', marksman: 'subductor' }), 'five Subductors');
  assert(exactionRosterError(T, { castigator: 'vox' }), 'two Vox-signifiers');
  const g = arena({ roster: { proctor: 'proctorShotgun', castigator: 'exGunnerStubber' } });
  assert.equal(G.tpl(get(g, 'proctorShotgun')).save, 4, 'no assault shield: 4+');
  assert(G.weaponsFor(g, get(g, 'exGunnerStubber')).some((w) => w.id === 'exStubberS'));
}

// Attack Patterns: Aggressive + Swift until picked; Defensive improves the Save; R-VR Command changes them.
{
  const g = arena(), m = get(g, 'mastiff');
  assert.equal(G.moveStat(g, m), 8, 'Swift: 6" + 2"');
  assert(G.effectiveRules(g, m, G.weaponsFor(g, m)[0], foe(g)).relentless, 'Aggressive');
  const l = get(g, 'leashmaster'); place(l, 10, 10); G.activate(g, l);
  assert(G.availableActions(g, l).find((a) => a.id === 'exRvr').ok);
  G.doSelfAction(g, l, 'exRvr'); // (the computer picks for a side nobody plays: Aggressive + Swift, or Defensive once engaged)
  m.patterns = ['aggressive', 'defensive'];
  assert.equal(G.moveStat(g, m), 6, 'no longer Swift');
  assert(G.exPattern(m, 'defensive'));
}

// Handler: the Cyber-mastiff activates straight after the Leashmaster.
{
  const g = arena(), l = get(g, 'leashmaster'), m = get(g, 'mastiff');
  place(l, 10, 10); place(m, 11, 10); G.activate(g, l);
  assert(G.availableActions(g, l).find((a) => a.id === 'exHandler').ok);
  G.doSelfAction(g, l, 'exHandler');
  G.endActivation(g);
  assert.deepEqual(g.chain?.uids, [m.uid]);
}

// Exact Punishment: shot from within 6" and still standing, it shoots back.
{
  const g = arena(), v = get(g, 'vigilant'), e = foe(g);
  place(v, 10, 10); place(e, 15, 10); v.wounds = 8;
  g.turn = 1; G.activate(g, e);
  const w = G.weaponsFor(g, e).find((x) => x.type === 'ranged' && !x.rules.blast && !x.rules.torrent && G.shootCheck(g, e, v, x).ok);
  const cp = g.cp[0];
  G.resolveShoot(g, e, w, v);
  if (!v.dead) { assert(g.cp[0] <= cp - 1, 'paid'); assert(g.log.some((l) => /Exact Punishment/.test(JSON.stringify(l)))); } // (a Command Re-roll may cost 1CP too)
}

// Brutal Backup: another friendly fighting the same enemy makes a free Fight.
{
  const g = arena(), c = get(g, 'castigator'), s = get(g, 'subductor'), e = foe(g);
  place(e, 10, 10); place(c, 11.2, 10); place(s, 8.8, 10); G.activate(g, c);
  assert(G.ffButtons(g, c).find((b) => b.id === 'brutalBackup').ok);
  G.useFFButton(g, c, 'brutalBackup');
  assert(g.netcounter?.only[0] === s.uid && g.netcounter.onlyActions[0] === 'fight');
}

// AI vs AI full battles.
for (const [a, b] of [['exaction', 'kommandos'], ['angels', 'exaction']]) {
  const ex = a === 'exaction' ? 0 : 1;
  const roster = [{}, {}]; roster[ex] = { proctor: 'proctorShotgun', castigator: 'exGunnerGL', revelatum: 'exGunnerWebber', vox: 'subductor' };
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
console.log('exaction ok');
