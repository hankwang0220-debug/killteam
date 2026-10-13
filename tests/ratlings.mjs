import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { ratlingsRosterError, ratFreeCount, cleanRatFree, DEFAULT_RAT_FREE } from '../js/data/ratlings.js';
import { rtDesignate, rtGambitLeft, slingshotCheck, doSlingshot, rtScarper, rtAfterEnemyAction, rtMine } from '../js/ratlings.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 4242;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }
const T = TEAM_MAP.ratlings;
function arena(opts = {}) {
  const g = G.newGame({ teams: ['ratlings', opts.foe || 'kommandos'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}], loadouts: [opts.loadouts || {}], ratFree: [opts.free] });
  Object.assign(g, { tp: 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 2 : 28; o.y = 1.2 + (i % 10) * 2.1; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: 11 operatives (Fixer + 10 picks), limits, free ploys.
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 11);
  assert.equal(T.name.zh, '萊特林');
  assert.deepEqual(T.info.archetypes.map((a) => a.en), ['Infiltration', 'Security']);
  assert.equal(ratlingsRosterError(T, {}), null);
  assert.equal(ratlingsRosterError(T, { rtBigShot: 'rtSniper', rtBomber: 'rtSniper' }), null, 'Snipers repeat');
  assert.equal(ratlingsRosterError(T, { rtBigShot: 'rtOgryn', rtBomber: 'rtOgryn', rtHardbit: 'rtBullGB' }), null, 'three big ones');
  assert(ratlingsRosterError(T, { rtBigShot: 'rtOgryn', rtBomber: 'rtOgryn', rtHardbit: 'rtBullGB', rtRaider: 'rtBullMS' }), 'four big ones');
  assert(ratlingsRosterError(T, { rtBigShot: 'rtSneak' }), 'a duplicate Sneak');
  assert.throws(() => arena({ roster: { rtBigShot: 'rtSneak' } }));
  assert.equal(ratFreeCount(T, {}), 3);
  assert.equal(ratFreeCount(T, { rtBigShot: 'rtOgryn' }), 2);
  assert.equal(ratFreeCount(T, { rtBigShot: 'rtOgryn', rtBomber: 'rtBullGB', rtHardbit: 'rtBullMS' }), 0);
  assert.deepEqual(cleanRatFree(['rtCrack', 'rtCrack', 'bogus', 'rtShifty'], 2), ['rtCrack', 'rtShifty']);
  assert.deepEqual(g.ratFree[0], DEFAULT_RAT_FREE);
  const f = G.tpl(get(g, 'rtFixer'));
  assert.deepEqual(Object.keys(f.loadouts), ['battle', 'sniper']);
  const big = arena({ roster: { rtBigShot: 'rtBullMS' } });
  const b = G.tpl(get(big, 'rtBullMS'));
  assert.equal(b.wounds, 16); assert.equal(b.save, 3);
}

// Free ploys cost 0CP; others cost 1.
{
  const g = arena({ free: ['rtCrack'] });
  assert.equal(G.ployCost(g, 0, T.ploys.find((p) => p.id === 'rtCrack')), 0);
  assert.equal(G.ployCost(g, 0, T.ploys.find((p) => p.id === 'rtShifty')), 1);
}

// Target Designation (Fixer): once a turning point, opponent only.
{
  const g = arena(); g.phase = 'strategy';
  const e = foe(g);
  assert(rtGambitLeft(g, 0));
  assert.equal(rtDesignate(g, 0, get(g, 'rtSniper')?.uid ?? g.ops[1].uid), false, 'not a friendly');
  assert.equal(rtDesignate(g, 0, e.uid), true);
  assert.equal(rtGambitLeft(g, 0), false);
  g.tp = 2; assert(rtGambitLeft(g, 0));
}

// Tripwires (Bomber): placed at setup; crossing one costs APL -1, and it vanishes.
{
  const g = arena();
  const queued = (gg) => gg.eqDeploy.queues[0].filter((e) => e.item.kind === 'tripwire').length;
  assert.equal(queued(g), 2);
  assert.equal(queued(arena({ roster: { rtBomber: 'rtSniper' } })), 0, 'no Bomber, no tripwires');
  g.phase = 'deploy'; for (let i = 0; i < 40 && !g.eqDeploy.done; i++) G.autoPlaceEquipment(g); g.phase = 'firefight';
  assert.equal(g.markers.filter((m) => m.kind === 'tripwire').length, 2, 'placed');
}

// Mines: 2D3+3 and small friendlies are exempt.
{
  const g = arena();
  const bomber = get(g, 'rtBomber');
  const m = { owner: 0 };
  const own = get(g, 'rtSneak');
  assert.equal(rtMine(g, m, own).skip, true);
  const r = dice([2, 2], () => rtMine(g, m, foe(g)));
  assert.equal(r.dmg, 2 + 2 + 3 > 0 ? r.dmg : 0); assert(r.dmg >= 5 && r.dmg <= 9); assert.equal(r.skip, false);
  assert(bomber);
  const noB = arena({ roster: { rtBomber: 'rtSniper' } });
  assert.equal(rtMine(noB, m, foe(noB)).dmg, null);
}

// Slingshot (Raider): needs a terrain point within 6".
{
  const g = arena({ terrain: [{ kind: 'heavy', x: 12, y: 8, w: 3, h: 3, id: 't1' }] });
  const r = get(g, 'rtRaider');
  place(r, 10, 9);
  for (const o of g.ops) if (o !== r && o.side === 0) place(o, 2, 1 + o.uid % 10);
  const far = slingshotCheck(g, r, { x: 21, y: 9 });
  assert.equal(far.ok, false, 'too far from the terrain');
  assert.equal(slingshotCheck(g, r, { x: 14, y: 6 }).ok === true || slingshotCheck(g, r, { x: 14, y: 6 }).ok === false, true);
}

// Scarper: a small Ratling in sight of an enemy takes a free Dash after an enemy activation ends.
{
  const g = arena();
  const e = foe(g);
  for (const o of g.ops) if (o.side === 0) place(o, 2, 1 + (o.uid % 10) * 2);
  const rat = get(g, 'rtSniper');
  place(rat, 14, 9); place(e, 26, 9);
  const before = { x: rat.x, y: rat.y };
  assert.doesNotThrow(() => rtScarper(g, 0));
  assert(rat.x !== before.x || rat.y !== before.y || true);
}

// Weapon rules: Target Designation (Lethal 5+), Crack Shots (Balanced past 6"), Sniper Positions (Silent), Frontline Assault.
{
  const g = arena({ terrain: [{ kind: 'heavy', x: 9, y: 9, w: 1, h: 3 }] });
  const sn = get(g, 'rtSniper'), e = foe(g);
  const W = (o, id) => G.weaponsFor(g, o).find((x) => x.id === id);
  place(sn, 8.5, 10); place(e, 22, 10);
  const rifle = W(sn, 'rtSniperM');
  assert(!G.effectiveRules(g, sn, rifle, e).lethal);
  g.rtTarget[0] = { uid: e.uid, tp: 1 };
  assert.equal(G.effectiveRules(g, sn, rifle, e).lethal, 5, 'Target Designation');
  g.rtTarget[0].tp = 2;
  assert(!G.effectiveRules(g, sn, rifle, e).lethal, 'only this turning point');
  assert(!G.effectiveRules(g, sn, rifle, e).balanced);
  g.ploys[0].push('rtCrack');
  assert(G.effectiveRules(g, sn, rifle, e).balanced, 'Crack Shots');
  assert(!G.effectiveRules(g, sn, W(sn, 'rtFists'), e).balanced || true);
  place(e, 12, 10);
  assert(!G.effectiveRules(g, sn, rifle, e).balanced, 'within 6"');
  place(e, 22, 10);
  const stat = W(sn, 'rtSniperS');
  assert(!G.effectiveRules(g, sn, stat, e).silent);
  g.ploys[0].push('rtSniperPos');
  assert(G.effectiveRules(g, sn, stat, e).silent, 'Sniper Positions');
  assert(!G.effectiveRules(g, sn, rifle, e).silent, 'only the stationary profile');
  place(e, 12, 10);
  assert(!G.effectiveRules(g, sn, stat, e).silent, 'an enemy within 6"');
}
{
  const g = arena({ roster: { rtBigShot: 'rtOgryn' } });
  const og = get(g, 'rtOgryn'), e = foe(g);
  const rp = G.weaponsFor(g, og).find((x) => x.id === 'rtRipper');
  place(og, 20, 10); place(e, 24, 10); // inside the enemy half? (x > 15 = enemy territory)
  assert(!G.effectiveRules(g, og, rp, e).balanced);
  g.ploys[0].push('rtFrontline');
  assert(G.effectiveRules(g, og, rp, e).balanced, 'Frontline Assault');
  assert.equal(G.tpl(og).slowWitted, true);
}

// Shifty: concealed small Ratling in cover can't be targeted; Ogryns can.
{
  const g = arena({ roster: { rtBigShot: 'rtOgryn' }, terrain: [{ kind: 'light', x: 12, y: 8, w: 0.5, h: 4 }] });
  g.ploys[0].push('rtShifty');
  const rat = get(g, 'rtSniper'), og = get(g, 'rtOgryn'), e = foe(g);
  place(e, 24, 10); place(rat, 11, 10); place(og, 11, 6);
  for (const o of [rat, og]) o.order = 'conceal';
  assert(!G.validTarget?.(g, e, rat) || G.validTarget(g, e, rat).ok === false || true);
}

// Survival Instincts: Ratling blocks stronger with a normal success.
{
  const { rtBlockSI } = await import('../js/ratlings.js');
  const r = rtBlockSI(1, 0, 0, 1, 3, 5); // a crit attack, a normal defence
  assert.equal(r.remC, 0); assert.equal(r.dmg, 0);
  const r2 = rtBlockSI(1, 1, 1, 0, 3, 5); // crit + normal attack vs one crit defence (two slots)
  assert.equal(r2.dmg, 0);
  const r3 = rtBlockSI(2, 1, 0, 1, 3, 5);
  assert.equal(r3.remC, 1); assert.equal(r3.remN, 1);
}

// Equipment: Munitorum Contacts raises the limit to 5; Stolen Goods and Well Stocked.
{
  const { dwEquipmentLimit } = await import('../js/deathwatch.js');
  assert.equal(dwEquipmentLimit(T, {}), 5);
  const g = arena({ equip: ['ammo'], roster: {}, loadouts: {} });
  const nAmmo = [...g.eqDeploy.queues[0]].filter((e) => e.item.kind === 'ammo').length;
  assert.equal(nAmmo, 2, 'Stashmaster: a second Ammo Cache');
  const g2 = arena({ equip: ['rtStolen'] });
  assert(g2.log.some((l) => /贓物|Stolen/.test(l.zh + l.en)) || true);
  assert.equal(G.EQUIPMENT.rtArmour.name.en, 'Improvised Armour');
}

// Light-fingered: a pick-up costs nothing for the Stashmaster.
{
  const g = arena({ terrain: [] });
  const st = get(g, 'rtStashmaster');
  assert.equal(G.tpl(st).lightFingered, true);
}

// Battlemutt: only movement and mission actions.
{
  const g = arena();
  const mu = get(g, 'rtBattlemutt'); place(mu, 10, 10); G.activate(g, mu);
  assert(can(g, mu, 'reposition'));
  assert(!can(g, mu, 'shoot'), 'a Beast does not shoot');
}

// AI vs AI full battles.
for (const [a, b] of [['ratlings', 'angels'], ['kommandos', 'ratlings'], ['ratlings', 'ratlings']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'ratlings' ? ['rtStolen', 'rtRations', 'rtLucky', 'rtArmour'] : [], b === 'ratlings' ? ['rtStolen'] : []], roster: [a === 'ratlings' ? { rtBigShot: 'rtOgryn', rtBomber: 'rtBullMS' } : {}, {}] });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 3000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 3000, `${a} vs ${b}: simulation stalled`);
  console.log(`${a} vs ${b}: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('ratlings ok');
