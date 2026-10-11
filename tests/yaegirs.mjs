import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 72027;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function arena(b = 'angels') {
  const g = G.newGame({ teams: ['hernkynYaegirs', b], ai: null }); g.tp = 1; g.phase = 'firefight'; g.turn = 0; g.terrain = []; g.cp = [3, 3, 0];
  g.markers = (g.markers || []).filter((m) => m.kind !== 'hyMine');
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 + i * 2 : 27; o.y = o.side === 0 ? 3 : 2 + i * 1.5; o.placed = true; o.order = 'engage'; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, i = 0) => g.ops.filter((o) => o.side === 1)[i];

// Ten operatives (Theyn + nine, three Warriors); the Ironbraek's five Minefield markers (three live).
{
  const g = G.newGame({ teams: ['hernkynYaegirs', 'angels'], ai: null });
  assert.equal(G.living(g, 0).length, 10);
  assert.equal(g.ops.filter((o) => o.tplId === 'hyWarrior').length, 3);
  const mines = g.markers.filter((m) => m.kind === 'hyMine');
  assert(mines.length >= 3 && mines.length <= 5, `minefield markers: ${mines.length}`);
  assert(mines.every((m, i) => mines.every((n, j) => i === j || Math.hypot(m.x - n.x, m.y - n.y) > 6)), 'more than 6" apart');
}
// Resourceful points: 2 for five or more free friendlies (+1 Veteran Adventurer); +1 APL or heal, once per activation.
{
  const g = arena();
  g.tp = 2; g.res = [3, 0]; g.resTP = [2, 0];
  const w = get(g, 'hyWarrior');
  w.wounds = 3;
  G.activate(g, w);
  assert(G.useResource(g, w, 'heal'));
  assert.equal(w.wounds, 7, 'Intrepid: regains 4');
  assert(!G.useResource(g, w, 'apl'), 'one per activation');
  assert.equal(G.resourceLeft(g, 0), 2);
}
// Outright Conviction: the Theyn survives the first lethal hit on 1 wound.
{
  const g = arena(), t = get(g, 'hyTheyn');
  G.applyDamage(g, null, t, 99);
  assert(!t.dead && t.wounds === 1);
  for (const o of g.ops) o.medicShield = false;
  G.applyDamage(g, null, t, 5);
  assert(t.dead, 'only the first time');
}
// HY-Pex mines: an enemy coming within a live marker's control range flips it and takes damage.
{
  const g = arena(), e = foe(g);
  g.markers.push({ id: 99, kind: 'hyMine', owner: 0, x: 15, y: 15, carriedBy: null, live: true, flipped: false });
  const w0 = e.wounds;
  G.activate(g, e); g.turn = 1;
  G.doMove(g, e, 'reposition', { pts: [{ x: e.x, y: e.y }, { x: 15.9, y: 15 }], len: Math.hypot(15.9 - e.x, 15 - e.y) });
  const m = g.markers.find((x) => x.id === 99);
  assert(m.flipped, 'flipped');
  assert(e.wounds <= w0 - 3, 'HY-Pex: at least 3 damage');
}
// No Kin Left Behind leaves the Fallen Kin marker; In Position protects a Concealed friendly in cover.
{
  const g = arena(), w = get(g, 'hyWarrior');
  G.applyDamage(g, null, w, 99);
  assert(g.markers.some((m) => m.kind === 'fallenKin' && m.owner === 0), 'Fallen Kin marker');
}
// AI vs AI full battles.
for (const [a, b] of [['hernkynYaegirs', 'angels'], ['kasrkin', 'hernkynYaegirs'], ['hernkynYaegirs', 'goremongers'], ['exoditeDragonMasters', 'hernkynYaegirs']]) {
  const g = G.newGame({ teams: [a, b], ai: null }); G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 4000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 4000, `${a} vs ${b}: simulation stalled`); assert(g.cp.every((x) => x >= 0));
  console.log(`${a} vs ${b}: full battle passed (${steps} steps, TP ${g.tp}, VP ${G.totalVP(g, 0)}-${G.totalVP(g, 1)})`);
}
console.log('yaegirs ok');
