import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { adRoll } from '../js/angels.js';
import { sfRoll } from '../js/sanctifiers.js';
import { vdRoll } from '../js/voiddancers.js';
import { kfShootStart } from '../js/kinband.js';

// Automatic "you can" equipment: used while switched on (the engine default, and the computer), never while switched off (a player's start).
const pool = () => ({ dice: [{ v: 1, res: 'miss' }, { v: 2, res: 'miss' }, { v: 5, res: 'norm' }], crits: 0, norms: 1 });
const retally = (p) => { if (p.post) p.post(p); p.norms = p.dice.filter((d) => d.res === 'norm').length; };
for (const [teamId, eq, fn] of [['angels', 'adSeals', adRoll], ['sanctifiers', 'sfSeals', sfRoll], ['voidDancers', 'vdTalisman', vdRoll]]) {
  const g = G.newGame({ teams: [teamId, 'kommandos'], ai: null, equip: [[eq], []] });
  Object.assign(g, { tp: 1, phase: 'firefight' });
  const op = g.ops.find((o) => o.side === 0);
  G.abilityToggle(g, 0, eq);
  assert(!G.abilityArmed(g, 0, eq) && !G.abilityArmed(g, op, eq), `${eq}: off (side or operative)`);
  const p1 = pool(); fn(g, op, p1, retally); assert.equal(p1.dice.filter((d) => d.res === 'norm').length, 1, `${eq}: not used while off`);
  G.abilityToggle(g, 0, eq);
  const p2 = pool(); fn(g, op, p2, retally); assert.equal(p2.dice.filter((d) => d.res === 'norm').length, 2, `${eq}: used while on`);
}
// Kinband ammo: Toxin Shot isn't picked while switched off.
{
  const g = G.newGame({ teams: ['farstalkers', 'kommandos'], ai: null, equip: [['kfToxin'], []] });
  Object.assign(g, { tp: 1, phase: 'firefight' });
  const op = g.ops.find((o) => o.side === 0 && G.weaponsFor(g, o).some((w) => w.id === 'krootRifle'));
  const w = G.weaponsFor(g, op).find((x) => x.id === 'krootRifle');
  G.abilityToggle(g, 0, 'kfToxin'); kfShootStart(g, op, w); assert(!op.kfAmmo, 'Toxin Shot off');
  G.abilityToggle(g, 0, 'kfToxin'); kfShootStart(g, op, w); assert.equal(op.kfAmmo?.kind, 'toxin', 'Toxin Shot on');
}
// The computer's side is never switched off.
assert(G.abilityArmed({ abOff: [['x'], ['x']] }, 2, 'x'));
console.log('autoswitch ok');
