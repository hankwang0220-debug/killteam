import assert from 'node:assert/strict';
import { newGame, activate, weaponsFor, shootWeapon, availableActions, shootCheck } from '../js/game.js';

const g = newGame({ teams: ['angels', 'kommandos'], ai: null });
g.phase = 'firefight'; g.tp = 1; g.turn = 0; g.terrain = [];
g.ops.forEach((o) => { o.x = -100; o.y = -100; });
const sniper = g.ops.find((o) => o.side === 0 && o.tplId === 'sniper');
const target = g.ops.find((o) => o.side === 1);
sniper.x = 3; sniper.y = 5; sniper.order = 'conceal';
target.x = 10; target.y = 5; target.order = 'engage';
activate(g, sniper);
const rifles = weaponsFor(g, sniper).filter((w) => w.rules.silent);
assert.equal(rifles.length, 3);
for (const w of rifles) {
  assert.equal(shootWeapon(g, sniper, w).ok, true, w.id);
  assert.equal(shootCheck(g, sniper, target, w).ok, true, w.id);
}
assert.equal(availableActions(g, sniper).find((a) => a.id === 'shoot').ok, true);
const pistol = weaponsFor(g, sniper).find((w) => w.type === 'ranged' && !w.rules.silent);
assert.equal(shootWeapon(g, sniper, pistol).ok, false);
sniper.acted.dash = 1;
assert.equal(shootWeapon(g, sniper, rifles[0]).ok, true);
sniper.acted.reposition = 1;
assert.equal(shootWeapon(g, sniper, rifles[0]).ok, false);
console.log('Silent: concealed sniper modes, targets, pistol exclusion and Heavy restrictions passed');
