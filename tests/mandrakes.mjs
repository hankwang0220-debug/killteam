import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { MANDRAKES_EQUIPMENT } from '../js/data/mandrakes.js';
import { withinShadow, shadowPassageCheck, doShadowPassage, mdStrategy } from '../js/mandrakes.js';
import { moveCtx, findPath } from '../js/path.js';
import { aiStep, aiStrategy } from '../js/ai.js';
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const enemy = (g) => G.living(g, 1)[0];
function arena(equip = [], other = 'angels') {
  const g = G.newGame({ teams: ['mandrakes', other], ai: null, equip: [equip, []] });
  g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [0, 0, 0];
  g.ops.forEach((o, i) => { o.x = o.side ? 26 : 2; o.y = 2 + i; o.placed = true; o.order = 'engage'; });
  return g;
}
function dice(values, fn) {
  const old = Math.random; let n = 0;
  Math.random = () => ((values[n++] ?? 4) - 0.5) / 6;
  try { return fn(); } finally { Math.random = old; }
}
{
  const t = TEAM_MAP.mandrakes;
  assert.equal(t.ops.reduce((n, o) => n + o.count, 0), 9);
  assert.equal(t.ops.length, 6); assert.equal(t.ops[0].wounds, 9);
  assert(t.ops.every((o) => o.apl === 2 && o.move === 7 && o.save === 5 && o.base === 28));
  assert.equal(t.ploys.length, 4); assert.equal(t.firefight.length, 4);
  assert.equal(Object.keys(MANDRAKES_EQUIPMENT).length, 4);
  assert.deepEqual(t.info.archetypes.map((x) => x.en), ['Recon', 'Infiltration']);
  const g = G.newGame({ teams: ['mandrakes', 'angels'], roster: [{ mdAbyssal: 'mdWarrior', mdChooser: 'mdWarrior' }], ai: null });
  assert.equal(G.living(g, 0).length, 9); assert.equal(g.ops.filter((o) => o.tplId === 'mdWarrior').length, 6);
  const wrong = G.newGame({ teams: ['angels', 'mandrakes'], equip: [['mdDarts'], []], ai: null });
  assert(!wrong.equip[0].includes('mdDarts'), 'faction equipment cannot leak to other teams');
}
// Soulstrike attack dice still use Hit 3+; defence reverses the threshold and ignores Hardy.
for (const [other, apl, values, retained] of [['angels', 3, [1, 2, 3], ['crit', 'norm', 'norm']], ['kommandos', 2, [1, 2, 3], ['crit', 'norm', 'miss']], ['angels', 3, [4, 5, 6], ['miss', 'miss', 'miss']]]) {
  const g = arena([], other), o = get(g, 'mdWarrior'), t = enemy(g);
  o.x = 3; o.y = 8; t.x = 10; t.y = 8; t.aplNext = apl - G.tpl(t).apl;
  g.tactics[1] = ['hardy']; G.activate(g, o);
  const result = dice([6, 5, 4, 3, ...values], () => G.resolveShoot(g, o, G.tpl(o).weapons[0], t));
  const seq = result;
  assert.equal(seq.attack.crits + seq.attack.norms, 4, 'Soulstrike does not reverse attack rolls');
  assert.deepEqual(seq.defence.dice.map((d) => d.res), [...retained].reverse());
}
// Umbral Entities ignores Piercing, but not Piercing Crits; shadow Save and Gloaming Shroud.
{
  const g = arena(), t = get(g, 'mdWarrior'), o = enemy(g);
  o.x = 3; o.y = 8; t.x = 10; t.y = 8;
  g.terrain = [{ kind: 'heavy', x: 10, y: 9.4, w: 1, h: 0.6 }];
  assert(withinShadow(g, t)); g.ploys[0] = ['mdShroud']; g.turn = 1; G.activate(g, o);
  const w = { id: 'test', group: 'test', name: { zh: '測試', en: 'Test' }, type: 'ranged', atk: 4, hit: 3, dmg: [3, 4], rules: { piercing: 2, piercingCrits: 1 } };
  const seq = dice([6, 4, 4, 4, 2, 2], () => G.resolveShoot(g, o, w, t));
  assert.equal(seq.defDice, 2); assert.equal(seq.save, 4); assert.equal(seq.coverSaves, 1);
}
// Passage validates destination before spending AP, leaves usable portals and locks attacks for the TP.
{
  const g = arena(), s = get(g, 'mdShadeweaver'), w = get(g, 'mdWarrior');
  g.terrain = [{ kind: 'heavy', x: 6, y: 7, w: 1, h: 6 }, { kind: 'heavy', x: 20, y: 7, w: 1, h: 6 }];
  s.x = 5; s.y = 10; s.order = 'conceal'; w.x = 5; w.y = 11.2; w.order = 'conceal';
  G.activate(g, s); assert(shadowPassageCheck(g, s, { x: 19, y: 10 }).ok);
  assert(!doShadowPassage(g, s, { x: 15, y: 2 })); assert.equal(s.ap, 2);
  assert(doShadowPassage(g, s, { x: 19, y: 10 })); assert.equal(s.ap, 1);
  assert.equal(g.markers.filter((m) => m.kind === 'mdPortal').length, 2);
  s.order = 'engage'; assert(!G.shootWeapon(g, s, G.tpl(s).weapons[0]).ok);
  s.acted = {}; g.active = null; G.activate(g, w);
  assert(shadowPassageCheck(g, w, { x: 19, y: 11.2 }).pair);
  assert(doShadowPassage(g, w, { x: 19, y: 11.2 }));
  w.acted = {}; assert(!shadowPassageCheck(g, w, { x: 5, y: 10 }).ok, 'one portal passage per operative per TP');
  g.tp++; assert(G.shootWeapon(g, { ...s, ap: 2, acted: {} }, G.tpl(s).weapons[0]).ok);
}
// Balefire, Projection expiry and persistent darkness.
{
  const g = arena(), a = get(g, 'mdAbyssal'), d = get(g, 'mdDirgemaw'), s = get(g, 'mdShadeweaver'), t = enemy(g);
  a.x = 3; a.y = 8; t.x = 10; t.y = 8;
  G.activate(g, a); G.doTargetAction(g, a, 'mdWreathe', t);
  assert.equal(t.mdBalefire, a.uid); assert(G.effectiveRules(g, a, G.tpl(a).weapons[1], t).saturate);
  const shot = dice([3, 3, 3, 3, 3, 6, 6, 6], () => G.resolveShoot(g, a, G.tpl(a).weapons[1], t));
  assert(shot.dmg >= 12, 'balefire adds damage');
  t.dead = false; t.wounds = t.maxW; g.active = null; d.x = 3; d.y = 8; G.activate(g, d);
  assert(G.TARGET_ACTIONS.mdProject.targets(g, d).includes(t)); G.doTargetAction(g, d, 'mdProject', t);
  assert.equal(G.moveStat(g, t), 4); t.wounds = 1; assert.equal(G.moveStat(g, t), 4, 'not cumulative with injury');
  g.active = null; G.activate(g, d); assert(!t.mdProjection);
  g.active = null; G.activate(g, s); G.doTargetAction(g, s, 'mdWeave', s);
  assert(g.smoke.some((x) => x.persistent)); G.applyDamage(g, null, s, 99); assert(!g.smoke.length);
}
// Soul Harvest from the baleblade, permanent APL and Oubliex.
{
  const g = arena(), c = get(g, 'mdChooser'), t = enemy(g);
  c.x = 10; c.y = 10; t.x = 11.9; t.y = 10; t.wounds = 1; G.activate(g, c);
  dice([6, 6, 6, 6, 1, 1, 1, 1], () => {
    G.startFight(g, c, G.tpl(c).weapons[1], t); G.fightRerollDone(g); G.fightApply(g, 'strike-c');
  });
  assert(t.dead); assert.equal(g.mdSouls[0], 2); G.endFight(g);
  const w = get(g, 'mdWarrior'); g.active = null; G.activate(g, w); G.doSelfAction(g, w, 'mdSoulApl');
  assert.equal(G.aplNow(g, w), 3); assert.equal(w.ap, 3); assert.equal(g.mdSouls[0], 1);
  const n = get(g, 'mdNightfiend'); n.mdOubliex = true;
  const foe = G.living(g, 1)[0]; foe.x = 3; foe.y = 8; n.x = 10; n.y = 8; g.active = null; g.turn = 1; G.activate(g, foe);
  const weapon = { id: 'check', group: 'check', name: { zh: '測試', en: 'Test' }, type: 'ranged', atk: 1, hit: 3, dmg: [4, 5], rules: {} };
  const seq = dice([4, 1, 1, 1, 5], () => G.resolveShoot(g, foe, weapon, n));
  assert.equal(seq.dmg, 0); assert(!n.mdOubliex);
}
// Nowhere to Hide phases through terrain with legal endpoints and a Move-only Charge.
// Chain Snare prevents Fall Back without spending AP, and Shadow Glyph overrides Seek.
{
  const g = arena(['mdSnare', 'mdGlyph', 'mdDarts', 'mdGem']), w = get(g, 'mdWarrior'), t = enemy(g);
  w.x = 10; w.y = 10; t.x = 11.9; t.y = 10; g.turn = 1; G.activate(g, t);
  const path = { pts: [{ x: t.x, y: t.y }, { x: 15, y: 10 }], len: 3.1 };
  dice([4], () => assert.equal(G.doMove(g, t, 'fallBack', path), false));
  assert.equal(t.ap, 3); assert.equal(t.x, 11.9); assert.equal(g.mdSnareTP[0], g.tp);
  t.x = 20; t.y = 10; w.x = 10; w.y = 10; w.order = 'conceal'; g.active = null; g.turn = 0;
  g.terrain = [{ kind: 'heavy', x: 11.2, y: 9, w: 0.6, h: 2, blocksSight: false }];
  G.activate(g, w); assert(w.mdGlyph);
  const seeker = { id: 'seek', group: 'seek', name: { zh: '測試', en: 'Test' }, type: 'ranged', atk: 4, hit: 3, dmg: [3, 4], rules: { seek: true } };
  assert(!G.shootCheck(g, { ...t, ap: 3, acted: {} }, w, seeker).ok);
  const darts = G.weaponsFor(g, w).find((x) => x.id === 'mdDart'); assert(darts && G.shootWeapon(g, w, darts).ok);
  w.order = 'engage'; dice([3, 3, 3, 3, 1, 1, 1], () => G.resolveShoot(g, w, darts, t));
  assert(!G.weaponsFor(g, get(g, 'mdAbyssal')).some((x) => x.id === 'mdDart'));
  assert(G.weaponsFor(g, get(g, 'mdChooser')).some((x) => x.id === 'mdGemBlast'));
}
// Soulstrike Command Re-roll must still retain 1 as critical and 2 as normal.
{
  const g = arena(), w = get(g, 'mdWarrior'), t = enemy(g); G.activate(g, w);
  const it = G.shootFlow(g, w, G.tpl(w).weapons[0], t);
  dice([3, 3, 3, 3], () => it.next());
  const stage = dice([6, 5, 4], () => it.next()); assert.equal(stage.value.stage, 'defence');
  g.cp[1] = 1; dice([1], () => G.commandReroll(g, 1, stage.value.seq, 'd', 0));
  assert.equal(stage.value.seq.d.crits, 1);
  assert.equal(stage.value.seq.d.dice[0].res, 'crit');
}
// Nowhere to Hide phases through terrain with legal endpoints and a Move-only Charge.
{
  const g = arena(), o = get(g, 'mdWarrior'); o.x = 5; o.y = 10; G.activate(g, o); g.cp[0] = 3;
  g.terrain = [{ kind: 'heavy', x: 7, y: 0, w: 1, h: 22 }];
  { const c = moveCtx(g, o); assert.equal(c.climbs(findPath(c, { x: 10, y: 10 }).pts), 3.2, 'on foot: a 3.2" climb'); }
  assert(G.useFFButton(g, o, 'mdNowhere'));
  const p = findPath(moveCtx(g, o), { x: 10, y: 10 }); assert(p && p.len === 5);
  assert(!moveCtx(g, o).free({ x: 7.5, y: 10 })); assert.equal(G.moveAllowance(g, o, 'charge'), 7);
}
// Haunting Focus interrupts, and the opponent resumes after the Dirgemaw.
{
  const g = arena(), d = get(g, 'mdDirgemaw'), t = enemy(g);
  d.x = 3; d.y = 8; d.order = 'engage'; t.x = 8; t.y = 8; g.turn = 1; mdStrategy(g);
  G.activate(g, t); assert.equal(g.active, d.uid); assert.equal(d.mdFocusTarget, t.uid);
  const shot = G.tpl(d).weapons[0]; dice([4, 4, 4, 4, 1, 1, 1], () => G.resolveShoot(g, d, shot, t));
  assert(!d.mdFocusTarget); G.endActivation(g); assert.equal(g.active, t.uid);
}
let seed = 98173;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
for (const teams of [['mandrakes', 'angels'], ['kommandos', 'mandrakes'], ['mandrakes', 'mandrakes']]) {
  const g = G.newGame({ teams, ai: null, equip: teams.map((id) => id === 'mandrakes' ? Object.keys(MANDRAKES_EQUIPMENT) : []) });
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g); let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 3500) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { aiStrategy(g, G.ployChooser(g)); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const decl = aiStep(g); if (decl?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), decl.weapon, decl.target); else if (decl?.kind === 'fight') G.resolveFight(g, G.activeOp(g), decl.weapon, decl.target); }
    } else throw Error(g.phase);
  }
  assert(steps < 3500, `stalled: ${teams}`); assert(g.cp.every((n) => n >= 0));
  console.log(`${teams.join(' vs ')}: complete battle (${steps} steps)`);
}
console.log('mandrakes ok');
