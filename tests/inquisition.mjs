import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 82028;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(b = 'angels', roster) {
  const g = G.newGame({ teams: ['inquisitorialAgents', b], ai: null, roster: roster ? [roster] : [] }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + i * 2 : 27; o.y = o.side === 0 ? 3 : 2 + i * 1.5; o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, i = 0) => g.ops.filter((o) => o.side === 1)[i];

// Interrogator, Tome-skull, five agents and five requisitioned Tempestus Scions by default.
{
  const g = G.newGame({ teams: ['inquisitorialAgents', 'angels'], ai: null });
  assert.equal(G.living(g, 0).length, 12);
  assert.equal(g.ops.filter((o) => o.side === 0 && G.tpl(o).rqGroup === 'scions').length, 5);
}
// Inquisitorial Tomes: Denunciation +1 Atk near the Interrogator, Sanctification -1 Atk near the Tome-skull.
{
  const g = arena(), it = get(g, 'iaInterrogator'), sk = get(g, 'iaTomeSkull'), q = get(g, 'iaQuestkeeper'), e = foe(g);
  e.x = it.x + 1.5; e.y = it.y + 1;
  const w = G.weaponsFor(g, q).find((x) => x.type === 'ranged');
  assert.equal(G.effectiveRules(g, q, w, e).atkPlus, 1, 'Denunciation');
  q.x = sk.x + 1; q.y = sk.y + 1;
  const ew = G.weaponsFor(g, e).find((x) => x.type === 'ranged');
  assert.equal(G.effectiveRules(g, e, ew, q).atkMinus, 1, 'Sanctification');
}
// Quarry: Ceaseless against the quarry, and a new one when it falls; Denounce costs more each time.
{
  const g = arena(); g.phase = 'strategy';
  const ploy = (id) => G.team(g, 0).ploys.find((p) => p.id === id);
  g.stratStep = 0; g.initiative = 0; g.cp = [9, 0, 0];
  const first = G.ployCost(g, 0, ploy('denounce'));
  G.buyPloy(g, 0, ploy('quarry'));
  assert(g.quarry[0], 'quarry picked');
  const q = G.getOp(g, g.quarry[0].uid), a = get(g, 'iaQuestkeeper');
  assert(G.effectiveRules(g, a, G.weaponsFor(g, a)[0], q).ceaseless, 'Ceaseless vs the quarry');
  G.applyDamage(g, a, q, 99);
  assert(g.quarry[0] && g.quarry[0].uid !== q.uid, 'a new quarry');
  G.finishPloys(g); // (each ploy passes the turn: the opponent passes before this side buys again)
  G.buyPloy(g, 0, ploy('denounce'));
  assert(g.denounce[0], 'denounced');
  g.tp = 2;
  assert.equal(G.ployCost(g, 0, ploy('denounce')), first + 1, 'Denounce: +1CP per earlier use');
}
// Hexorcise: an enemy within 6" of the Hexorcist loses its re-roll weapon rules.
{
  const g = arena(), h = get(g, 'iaHexorcist'), e = foe(g);
  e.x = h.x + 4; e.y = h.y;
  const w = { id: 't', name: { zh: 't', en: 't' }, type: 'ranged', atk: 4, hit: 3, dmg: [3, 4], rules: { balanced: true }, group: 't' };
  assert(!G.effectiveRules(g, e, w, h).balanced, 'no re-rolls near the Hexorcist');
}
// Pistol Barrage: one free Shoot with each pistol.
{
  const r = { iaQuestkeeper: 'iaPistolier' };
  const g = arena('angels', r), p = get(g, 'iaPistolier'), e = foe(g);
  assert(p, 'Pistolier in the roster');
  e.x = p.x + 6; e.y = p.y;
  G.activate(g, p);
  assert(G.availableActions(g, p).find((a) => a.id === 'iaBarrage').ok);
  G.doSelfAction(g, p, 'iaBarrage');
  const ap = p.ap;
  G.resolveShoot(g, p, G.weaponsFor(g, p).find((w) => w.id === 'iaSuppressed'), e);
  assert.equal(p.ap, ap, 'free');
  assert(!G.shootWeapon(g, p, G.weaponsFor(g, p).find((w) => w.id === 'iaSuppressed')).ok, 'each pistol once');
  assert(G.shootWeapon(g, p, G.weaponsFor(g, p).find((w) => w.id === 'iaPlasmaStd')).ok, 'the plasma pistol still');
}
// Requisitioned forces: Sisters of Silence stop psychic actions within 6"; Exaction Squad keeps Ruthless Efficiency.
{
  const r = { tsMedic: 'ssProsecutor', tsTrooper: 'ssVigilator', tsVox: 'ssWitchseeker', tsGunPlasma: 'ssProsecutor', tsGunMelta: 'ssProsecutor' };
  const g = arena('angels', r), m = get(g, 'iaMystic'), s = get(g, 'ssProsecutor');
  assert(s, 'requisitioned Sister');
  G.activate(g, m);
  s.x = m.x + 3; s.y = m.y;
  assert(!G.availableActions(g, m).some((a) => a.id === 'scryGuide'), 'Psychic Null: no Scry within 6"');
  for (const o of g.ops.filter((x) => G.tpl(x).psychicNull)) { o.x = 20; o.y = 18; }
  assert(G.availableActions(g, m).some((a) => a.id === 'scryGuide' && a.ok), 'Scry away from the Sister');
}
// AI vs AI full battles, with each requisition force.
const forces = {
  scions: null,
  sisters: { tsMedic: 'ssProsecutor', tsTrooper: 'ssVigilator', tsVox: 'ssWitchseeker', tsGunPlasma: 'ssProsecutor', tsGunMelta: 'ssVigilator' },
  kasrkin: { tsMedic: 'rq_kasrkin_ksMedic', tsTrooper: 'rq_kasrkin_ksTrooper', tsVox: 'iaPenal', tsGunPlasma: 'iaPistolier', tsGunMelta: 'iaAutosavant' },
  deathKorps: { tsMedic: 'rq_deathKorps_medic', tsTrooper: 'rq_deathKorps_trooper', tsVox: 'rq_deathKorps_vox', tsGunPlasma: 'iaPenal', tsGunMelta: 'iaAutosavant' },
  exaction: { tsMedic: 'rq_exaction_chirurgant', tsTrooper: 'rq_exaction_subductor', tsVox: 'rq_exaction_vox', tsGunPlasma: 'rq_exaction_mastiff', tsGunMelta: 'rq_exaction_vigilant' },
  navy: { tsMedic: 'rq_navy_armsman', tsTrooper: 'rq_navy_axejack', tsVox: 'rq_navy_surveyor', tsGunPlasma: 'rq_navy_cat', tsGunMelta: 'rq_navy_endurant' },
};
for (const [name, roster] of Object.entries(forces)) {
  const b = ['angels', 'kasrkin', 'goremongers'][Object.keys(forces).indexOf(name) % 3];
  const g = G.newGame({ teams: ['inquisitorialAgents', b], ai: null, roster: roster ? [roster] : [] }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 4000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 4000, `${name}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  console.log(`Inquisition + ${name} vs ${b}: full battle passed (${steps} steps, TP ${g.tp}, VP ${G.totalVP(g, 0)}-${G.totalVP(g, 1)})`);
}
console.log('inquisition ok');
