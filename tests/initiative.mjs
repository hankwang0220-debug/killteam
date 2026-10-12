import assert from 'node:assert/strict';
import * as G from '../js/game.js';
let seed = 777;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

// The Initiative phase of turning point tp with the dice set to roll (the cards held carry over).
function phase(g, tp, roll) {
  Object.assign(g, { tp, phase: 'initiative', initRoll: [...roll], initRolled: [...roll], initiative: null, initDecider: null, initLocked: false });
  g.initCards ||= [[], []];
  return g;
}
const game = (ai = null) => G.newGame({ teams: ['angels', 'kommandos'], ai, equip: [[], []] });

// Setup roll-off: the loser gets the Re-roll card; then TP1: ±1, TP2: ±2, TP3: ±3; nothing in the last turning point.
{
  const g = game(), L = g.initCards.findIndex((c) => c.includes('reroll'));
  assert([0, 1].includes(L)); assert.deepEqual(g.initCards[1 - L], []);
  g.initCards = [[], []];
  G.lockInitRoll(phase(g, 1, [2, 5]));
  assert.equal(g.initDecider, 1); assert.deepEqual(g.initCards, [['pm1'], []]);
  G.lockInitRoll(phase(g, 2, [6, 1]));
  assert.deepEqual(g.initCards, [['pm1'], ['pm2']]);
  G.lockInitRoll(phase(g, 3, [1, 6]));
  assert.deepEqual(g.initCards, [['pm1', 'pm3'], ['pm2']]);
  G.lockInitRoll(phase(g, 4, [1, 6]));
  assert.deepEqual(g.initCards, [['pm1', 'pm3'], ['pm2']], 'no card in the last turning point');
}
// ±N on either die, each card once; the winner is worked out after the cards are used, and the loser gets the card.
{
  const g = game();
  phase(g, 2, [3, 4]); g.initCards = [['pm1'], []]; g.initFirstLoser = 1;
  assert.equal(G.initWinner(g), 1);
  assert(G.useInitCard(g, 0, 'pm1', 1, -1));
  assert.deepEqual(g.initRoll, [3, 3]);
  assert.equal(G.useInitCard(g, 0, 'pm1', 0, 1), false, 'used up');
  assert.equal(G.initWinner(g), 1, 'first tie: the loser of the TP1 roll-off decides');
  G.lockInitRoll(g);
  assert.equal(g.initDecider, 1); assert.deepEqual(g.initCards, [['pm2'], []]);
  assert.equal(G.useInitCard(g, 0, 'pm2', 0, 1), false, 'not after the result stands');
}
// Ties: TP1 is rolled again (even after a card); later the first by the TP1 loser, then by the player who didn't decide last time.
{
  const g = game();
  G.lockInitRoll(phase(g, 1, [3, 3]));
  assert.notEqual(g.initRoll[0], g.initRoll[1], 'TP1 tie rolled again');
  assert.equal(g.initFirstLoser, 1 - g.initDecider);
  g.initFirstLoser = 0;
  G.lockInitRoll(phase(g, 2, [3, 3]));
  assert.equal(g.initDecider, 0, 'first tie → the TP1 loser');
  G.lockInitRoll(phase(g, 3, [5, 5]));
  assert.equal(g.initDecider, 1, 'second tie → the one who did not decide last time');
  G.lockInitRoll(phase(g, 4, [2, 2]));
  assert.equal(g.initDecider, 0);
}
// The Re-roll card can already be used in TP1.
{
  const g = game(), L = g.initCards.findIndex((c) => c.includes('reroll'));
  phase(g, 1, L === 0 ? [1, 6] : [6, 1]);
  assert(G.useInitCard(g, L, 'reroll'));
}
// Re-roll: re-rolls the user's own die.
{
  const g = game();
  phase(g, 2, [1, 6]); g.initCards = [['reroll'], []];
  G.useInitCard(g, 0, 'reroll');
  assert.equal(g.initRoll[1], 6); assert.deepEqual(g.initCards[0], []);
}
// The computer uses its smallest card that wins the roll-off, and nothing when it's already winning.
{
  const g = game(1);
  phase(g, 3, [4, 3]); g.initCards = [[], ['pm2', 'pm1']]; g.initFirstLoser = 0;
  G.aiInitCards(g);
  assert.deepEqual(g.initCards[1], ['pm1'], '±1 only ties (side 0 would decide): ±2'); assert.equal(G.initWinner(g), 1);
  G.aiInitCards(g); assert.deepEqual(g.initCards[1], ['pm1'], 'already winning');
  G.lockInitRoll(g);
  assert.equal(g.initiative, 1, 'the computer takes initiative at once');
}
// Not confirmed: Start Strategy phase lets the dice stand.
{
  const g = game();
  phase(g, 2, [5, 2]); g.initFirstLoser = 0;
  G.startStrategy(g);
  assert.equal(g.initLocked, true); assert.equal(g.initiative, 0); assert.equal(g.phase, 'strategy');
}
console.log('initiative ok');
