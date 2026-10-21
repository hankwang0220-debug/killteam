import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { aiStep, aiStrategy } from '../js/ai.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { novitiatesRosterError } from '../js/data/novitiates.js';
let seed = 2718;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = TEAM_MAP.novitiates;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['novitiates', opts.foe || 'kommandos'], ai: null, equip: [[], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}] });
  Object.assign(g, { tp: opts.tp || 2, phase: 'firefight', turn: 0, terrain: opts.terrain ?? [], cp: [3, 3, 0], faith: [0, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1.2 + (i % 13) * 1.6; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id, side = 0) => g.ops.find((o) => o.tplId === id && o.side === side);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: each once except Militants and Purgatus (two at most); Superior loadouts; Pronatus and Militants.
{
  assert.equal(novitiatesRosterError(T, {}), null);
  assert.equal(novitiatesRosterError(T, { nvCondemnor: 'nvMilitantB', nvDialogus: 'nvMilitantB', nvDuellist: 'nvPurgatus' }), null);
  assert(novitiatesRosterError(T, { nvCondemnor: 'nvPurgatus', nvDialogus: 'nvPurgatus' }), 'three Purgatus');
  assert(novitiatesRosterError(T, { nvCondemnor: 'nvDuellist' }), 'two Duellists');
  const g = arena({ roster: { nvCondemnor: 'nvPronatus', nvDialogus: 'nvMilitantG' }, loadouts: { nvSuperior: 'boltgun' } });
  assert.deepEqual(G.weaponsFor(g, get(g, 'nvSuperior')).map((w) => w.id), ['relicBoltgunN', 'gunButtNS']);
  assert(G.weaponsFor(g, get(g, 'nvMilitantG')).some((w) => w.id === 'autogunN'));
  // Relic Seeker: a mission action / Pick Up for 1 less AP, once per activation.
  const p = get(g, 'nvPronatus');
  G.activate(g, p);
  assert.equal(G.actionCost(g, p, 'pickUp'), 0);
  p.acted.nvRelic = 1;
  assert.equal(G.actionCost(g, p, 'pickUp'), 1);
}

// Righteous Advance: not in TP1; a third (rounding down) Dash, each ending closer to a goal.
{
  const pl = T.ploys.find((x) => x.id === 'righteousAdvance');
  const g1 = arena({ tp: 1 }); g1.phase = 'strategy';
  assert(G.ployTaken(g1, 0, pl));
  const g = arena(); g.phase = 'strategy'; g.stratTurn = 0; g.pick = [true, false];
  const a = place(get(g, 'nvDuellist'), 10, 10); place(foe(g), 20, 10);
  assert(G.buyPloy(g, 0, pl));
  assert.equal(G.pendingChoice(g, 0).ctx.n, 3, '10 operatives: 3');
  assert(!G.resolveChoice(g, 0, { uid: a.uid, pts: [{ x: 7.5, y: 10 }] }), 'moving away from everything');
  assert(G.resolveChoice(g, 0, { uid: a.uid, pts: [{ x: 12.5, y: 10 }] }));
  assert(a.x > 12);
}

// Glorious Martyrdom: each enemy visible within 2" of the fallen Novitiate — 1 Faith and D3 damage.
{
  const g = arena(), n = place(get(g, 'nvDuellist'), 10, 10), e = place(foe(g), 11.5, 10), w = e.wounds;
  n.wounds = 1; G.applyDamage(g, e, n, 3);
  assert(n.dead); assert.equal(g.faith[0], 1); assert(e.wounds < w);
}

// Blazing Inferno: a Blaze token from the Ministorum flamer's critical damage; D3 when it activates, -1 APL puts it out.
{
  const g = arena(), e = foe(g); e.blaze = 0; e.x = 20; e.y = 10;
  g.turn = 1; g.pick = [true, true]; const w = e.wounds; G.activate(g, e);
  assert(e.wounds < w, 'D3 damage');
  assert(G.availableActions(g, e).find((a) => a.id === 'nvBlazeOut')?.ok);
  const ap = e.ap; G.doSelfAction(g, e, 'nvBlazeOut');
  assert.equal(e.blaze, null); assert.equal(e.ap, ap - 1);
}

// Blinding Aura: an enemy picking a Novitiate from more than 2" must pick again (or the Shoot ends).
{
  const g = arena(), n = place(get(g, 'nvDuellist'), 10, 10), m = place(get(g, 'nvExactor'), 10, 13), e = place(foe(g), 18, 10);
  for (const o of g.ops) if (o.side === 0 && o !== n && o !== m) o.x = -60;
  g.turn = 1; G.activate(g, e); const ap = e.ap;
  const w = G.weaponsFor(g, e).find((x) => x.type === 'ranged');
  const r = G.resolveShoot(g, e, w, n);
  assert.equal(r.kind, 'sfDeclaim'); assert.equal(e.ap, ap, 'no AP: pick again');
  assert(!G.shootCheck(g, e, n, w).ok, 'not a valid target now');
}

// AI vs AI full battles.
for (const roster of [{}, { nvCondemnor: 'nvPronatus', nvDialogus: 'nvMilitantB', nvDuellist: 'nvMilitantG', nvExactor: 'nvPurgatus' }]) {
  const g = G.newGame({ teams: ['novitiates', 'kommandos'], ai: null, equip: [[], []], roster: [roster, {}] });
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
  assert(steps < 4000, 'novitiates: simulation stalled');
  console.log(`novitiates vs kommandos: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('novitiates ok');
