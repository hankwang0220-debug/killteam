import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { wkActionStart } from '../js/wrecka.js';

const weapon = (rules = {}, type = 'ranged') => ({ id: 'core-test', group: 'core-test', name: { zh: '測試', en: 'Test' }, type, atk: 4, hit: 4, dmg: [3, 4], rules });
function arena(teams = ['kommandos', 'kommandos']) {
  const g = G.newGame({ teams, ai: null, equip: [[], []] });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: [], cp: [0, 0, 0] });
  g.ops.forEach((o) => Object.assign(o, { x: -99, y: -99, placed: true, ready: true, order: 'engage' }));
  const a = g.ops.find((o) => o.side === 0), b = g.ops.find((o) => o.side === 1);
  Object.assign(a, { x: 2, y: 10 }); Object.assign(b, { x: 12, y: 10 });
  G.activate(g, a);
  return { g, a, b };
}
function dice(values, fn) {
  const old = Math.random; let i = 0;
  Math.random = () => ((values[i++] ?? 4) - .5) / 6;
  try { return fn(); } finally { Math.random = old; }
}
function drain(it, value) { let r = it.next(value); while (!r.done) r = it.next(); return r.value; }

// Every Move modifier shares the final floor, including multiple simultaneous penalties.
{
  const { g, a } = arena(); a.wounds = 1; a.xvPhoton = true; a.shieldingOn = true;
  assert.equal(G.moveStat(g, a), 4);
}
// Clamp the combined APL delta, rather than each source separately.
{
  const { g, a } = arena(); a.aplNext = -1;
  g.markers.push({ kind: 'gas', x: a.x, y: a.y, owner: 1 });
  assert.equal(G.aplNow(g, a), G.tpl(a).apl - 1);
  a.aplNext = 1; a.mania = true; a.ardour = true;
  g.markers = [];
  assert.equal(G.aplNow(g, a), G.tpl(a).apl + 1);
  a.aplNext = -1; a.ardour = false;
  assert.equal(G.aplNow(g, a), G.tpl(a).apl, 'opposing changes cancel before clamping');
}
// An APL increase already at the cap must not grant another current AP.
{
  const { g, a } = arena(['wreckaKrew', 'kommandos']);
  a.aplNext = 1; const before = a.ap;
  wkActionStart(g, a, 'shoot');
  assert.equal(a.ap, before);
  assert.equal(G.aplNow(g, a), G.tpl(a).apl + 1);
}
// Shared terrain protection is chosen before the first attack die.
for (const choice of ['cover', 'obscured']) {
  const { g, a, b } = arena(); g.pick = [true, true];
  g.terrain = [{ kind: 'heavy', blocksSight: false, x: 4, y: 9.9, w: 7, h: .2 }];
  const it = G.shootFlow(g, a, weapon(), b, true);
  let calls = 0; const old = Math.random; Math.random = () => { calls++; return .6; };
  try {
    const first = it.next();
    assert.equal(first.value.stage, 'choice'); assert.equal(first.value.side, b.side);
    assert.equal(calls, 0, 'cover choice must not see the attack roll');
    assert(first.value.options.some((o) => o.id === choice));
    let r = it.next(choice);
    assert.equal(r.value.stage, 'attack');
    while (!r.done) r = it.next();
    assert.equal(r.value.inCover, choice === 'cover');
    assert.equal(r.value.obscured, choice === 'obscured');
  } finally { Math.random = old; }
}
// Accurate allows every count including zero, before any dice are rolled.
for (const count of [0, 1, 2]) {
  const { g, a, b } = arena(); g.pick = [true, false];
  const it = G.shootFlow(g, a, weapon({ accurate: 2 }), b, true);
  assert.equal(it.next().value.stage, 'choice');
  const next = dice([4, 4, 4, 4], () => it.next(String(count)));
  assert.equal(next.value.seq.a.dice.filter((d) => d.auto).length, count);
  drain(it);
}
// Automatic Accurate can prefer rolling for high-value criticals over guaranteed normals.
{
  const { g, a, b } = arena();
  const w = { ...weapon({ accurate: 2, lethal: 2 }), hit: 2, dmg: [1, 8] };
  const result = dice([6, 6, 6, 6], () => G.resolveShoot(g, a, w, b));
  assert.equal(result.attack.dice.filter((d) => d.auto).length, 0);
}
// Automatic Ceaseless re-rolls the most common failed result, including when 1s are forbidden.
for (const noReroll1 of [false, true]) {
  const { g, a, b } = arena();
  const result = dice([1, 2, 2, 5, 6, 6], () => G.resolveShoot(g, a, weapon({ ceaseless: true, noReroll1 }), b));
  assert.equal(result.attack.dice.filter((d) => d.rr).length, 2);
  assert.equal(result.attack.dice.filter((d) => d.v === 6).length, 2);
}
// Scry's fail->normal upgrade remains effective through obscured and Holowave, including a retally.
for (const mode of ['obscured', 'holowave']) {
  const { g, a, b } = arena(['inquisitorialAgents', mode === 'holowave' ? 'stealthSuits' : 'kommandos']);
  g.scry = [{ uid: a.uid, by: a.uid, mode: 'guide' }, null];
  if (mode === 'obscured') g.terrain = [{ kind: 'heavy', blocksSight: false, x: 7, y: 9.9, w: .2, h: .2 }];
  else g.ploys[1].push('xvHolowave');
  const it = G.shootFlow(g, a, weapon(), b);
  const first = dice([1, 2, 2, 5], () => it.next());
  const seq = first.value.seq;
  assert.equal(seq.a.norms, 1, 'two retained successes, then discard one');
  assert.equal(seq.a.crits, 0);
  g.cp[0] = 1;
  const index = seq.a.dice.findIndex((d) => d.v === 1);
  dice([1], () => G.commandReroll(g, 0, seq, 'a', index));
  assert.equal(seq.a.norms, 1, 'retally keeps both effects');
  drain(it);
}
// Obscured does not allow crit-triggered extra retained successes or Piercing Crits.
{
  const { g, a, b } = arena();
  g.terrain = [{ kind: 'heavy', blocksSight: false, x: 7, y: 9.9, w: .2, h: .2 }];
  const result = dice([6, 4, 1, 1], () => G.resolveShoot(g, a, weapon({ severe: true, rending: true, punishing: true, piercingCrits: 1 }), b));
  assert.equal(result.attack.crits, 0); assert.equal(result.attack.norms, 1);
  assert.equal(result.defDice, 3);
}
// A human defender chooses a legal weapon before both sides roll; no generic decline action.
{
  const { g, a } = arena(['kommandos', 'gellerpox']);
  const b = g.ops.find((o) => o.side === 1 && o.tplId === 'bloatspawn');
  Object.assign(b, { x: 3.4, y: 10 }); g.pick = [false, true];
  const it = G.fightFlow(g, a, G.bestMelee(a), b, true);
  const first = it.next(); assert.equal(first.value.stage, 'choice');
  const id = first.value.options.at(-1).id;
  drain(it, id);
  assert.equal(g.fight.D.w, id);
  G.fightRerollDone(g);
  if (!g.fight.done) assert(G.fightOptions(g).every((o) => o.act === 'strike' || o.act === 'parry'));
}
// No Kin Left Behind also survives obscured.
{
  const { g, a, b } = arena(['hernkynYaegirs', 'kommandos']);
  g.markers.push({ kind: 'fallenKin', owner: 0, x: a.x, y: a.y });
  g.terrain = [{ kind: 'heavy', blocksSight: false, x: 7, y: 9.9, w: .2, h: .2 }];
  const result = dice([1, 2, 2, 5], () => G.resolveShoot(g, a, weapon(), b));
  assert.equal(result.attack.norms, 1); assert.equal(result.attack.crits, 0);
}
// Shock removes an unresolved enemy success; Brutal prevents normal blocks.
{
  const { g, a, b } = arena(); b.x = 3.4;
  a.wounds = a.maxW = b.wounds = b.maxW = 100;
  const w = { ...weapon({ shock: true, brutal: true }, 'melee'), dmg: [1, 1] };
  dice([6, 4, 4, 4, 4, 4, 4, 4], () => G.startFight(g, a, w, b));
  const normals = g.fight.D.n;
  G.fightApply(g, 'strike-c');
  assert.equal(g.fight.D.n, normals - 1, 'Shock discards one unresolved normal');
  assert(G.fightOptions(g).every((o) => o.act !== 'parry'), 'normal successes cannot block Brutal');
}
console.log('core rules ok');
