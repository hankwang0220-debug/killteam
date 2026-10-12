import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { MISSIONS, MISSION_LIST, TAC_OPS, MISSION_ACTIONS, setReboot, tacOnTPEnd, tacOnBattleEnd, tacOnStrategyEnd, objBadges } from '../js/missions.js';
let seed = 20251012;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

// Both teams lined up on their own killzone edges, nobody near an objective marker.
function arena(mission, tacOps = []) {
  const g = G.newGame({ teams: ['angels', 'kommandos'], ai: null, mission, tacOps, equip: [[], []] });
  Object.assign(g, { tp: 2, phase: 'firefight', turn: 0, terrain: [], cp: [0, 0, 0] });
  g.ops.forEach((o, i) => { o.x = o.side === 0 ? 1 : 29; o.y = 1 + (i % 10) * 2.2; o.placed = true; o.order = 'engage'; o.ready = true; });
  return g;
}
const at = (o, p) => { o.x = p.x - 0.9; o.y = p.y; return o; };
const ops = (g, side) => g.ops.filter((o) => o.side === side);
const can = (g, o, id) => G.availableActions(g, o).find((x) => x.id === id);
const act = (g, o, id) => { G.activate(g, o); assert(can(g, o, id)?.ok, `${id} should be allowed: ${JSON.stringify(can(g, o, id)?.why)}`); G.doMissionAction(g, o, id); };
const [L, C, R] = [0, 1, 2]; // objective markers: left (side 0's), centre, right (side 1's)

// Every Crit Op of the mission pack is listed, all with the three Approved Ops objective markers.
for (const id of ['secure', 'loot', 'transmission', 'orb', 'stakeClaim', 'energyCells', 'download', 'data', 'reboot']) {
  assert(MISSION_LIST.includes(MISSIONS[id]), id);
  assert(MISSIONS[id].approved && MISSIONS[id].objectives.length === 3, id);
}
assert.equal(Object.keys(TAC_OPS).length, 12);
for (const arch of ['Seek & Destroy', 'Recon', 'Security', 'Infiltration']) assert.equal(Object.values(TAC_OPS).filter((t) => t.arch === arch).length, 3, arch);

// 1 Secure: not in TP1; stays secured until the opponent secures it; 1VP any + 1VP more.
{
  const g = arena('secure'), a = at(ops(g, 0)[0], g.objectives[C]);
  g.tp = 1; G.activate(g, a); assert.equal(can(g, a, 'secure').ok, false); g.tp = 2;
  act(g, a, 'secure');
  assert.equal(g.objectives[C].secured, 0);
  a.x = 1; // walks off: still secured
  G.mission(g).onTPEnd(g);
  assert.deepEqual(g.vp.slice(0, 2), [2, 0]);
  const b = at(ops(g, 1)[0], g.objectives[C]); act(g, b, 'secure');
  assert.equal(g.objectives[C].secured, 1);
  assert.deepEqual(objBadges(g, g.objectives[C], 'en')[0], { text: 'secured', side: 1 });
}
// 2 Loot: 1VP each, at most 2VP per turning point; each objective once per turning point.
{
  const g = arena('loot'), [a, b, c] = ops(g, 0);
  act(g, at(a, g.objectives[L]), 'loot');
  G.activate(g, at(b, g.objectives[L])); assert.equal(can(g, b, 'loot').ok, false, 'already looted this TP');
  act(g, at(b, g.objectives[C]), 'loot');
  g.ops.filter((o) => o.side === 1).forEach((o) => { o.x = 29; }); act(g, at(c, g.objectives[R]), 'loot');
  assert.equal(g.vp[0], 2);
}
// 3 Transmission: transmitting for the turning point; 1VP any controlled + 1VP more.
{
  const g = arena('transmission'), a = at(ops(g, 0)[0], g.objectives[L]), b = at(ops(g, 1)[0], g.objectives[R]);
  act(g, a, 'transmit'); act(g, b, 'transmit');
  at(ops(g, 0)[1], g.objectives[C]); act(g, ops(g, 0)[1], 'transmit');
  G.mission(g).onTPEnd(g);
  assert.deepEqual(g.vp.slice(0, 2), [2, 1]);
  g.tp = 3; G.mission(g).onTPEnd(g); // the transmission ended with the turning point
  assert.deepEqual(g.vp.slice(0, 2), [2, 1]);
}
// 4 Orb: starts in the centre; Move Orb to either player's objective, then back; VP per controlled objective without it.
{
  const g = arena('orb'), a = at(ops(g, 0)[0], g.objectives[C]);
  assert.equal(g.orb, C);
  G.activate(g, a);
  assert.equal(can(g, a, 'orbToCentre').ok, false);
  G.doMissionAction(g, a, 'orbToTheirs');
  assert.equal(g.orb, R);
  at(ops(g, 0)[1], g.objectives[L]);
  G.mission(g).onTPEnd(g);
  assert.equal(g.vp[0], 2);
  const b = at(ops(g, 1)[0], g.objectives[R]); act(g, b, 'orbToCentre');
  assert.equal(g.orb, C);
}
// 7 Download: TP3+, centre or the opponent's objective, once each; 1VP in TP3, 2VP in TP4; majority ignores downloaded ones.
{
  const g = arena('download'), a = at(ops(g, 0)[0], g.objectives[C]), own = at(ops(g, 0)[1], g.objectives[L]);
  G.activate(g, a); assert.equal(can(g, a, 'download').ok, false, 'not in TP2');
  g.tp = 3; act(g, a, 'download');
  assert.equal(g.vp[0], 1);
  G.activate(g, own); assert.equal(can(g, own, 'download').ok, false, 'not its own objective');
  at(ops(g, 1)[0], g.objectives[R]);
  G.mission(g).onTPEnd(g); // 1 (left) vs 1 (right): the downloaded centre doesn't count
  assert.deepEqual(g.vp.slice(0, 2), [1, 0]);
  g.tp = 4; const b = at(ops(g, 1)[1], g.objectives[L]); b.x = g.objectives[L].x + 0.9; own.x = 1;
  act(g, b, 'download');
  assert.equal(g.vp[1], 2);
}
// 8 Data: Compile Data once per objective per TP; more Compiles at the end of TP2/3 = 1VP; Send Data in TP4 = VP per point.
{
  const g = arena('data'), a = at(ops(g, 0)[0], g.objectives[C]);
  act(g, a, 'compileData');
  G.activate(g, ops(g, 0)[1]); at(ops(g, 0)[1], g.objectives[C]);
  assert.equal(can(g, ops(g, 0)[1], 'compileData').ok, false);
  G.mission(g).onTPEnd(g);
  assert.deepEqual(g.vp.slice(0, 2), [1, 0]);
  g.tp = 3; a.ready = true; act(g, a, 'compileData');
  G.activate(g, a); assert.equal(can(g, a, 'sendData').ok, false, 'not before TP4');
  g.tp = 4; a.ready = true; act(g, a, 'sendData');
  assert.equal(g.vp[0], 1 + 2);
  assert.equal(g.objectives[C].data, 0);
}
// 9 Reboot: same pick → that one is inert, different → the third one; Reboot (2AP) brings it back.
{
  const g = arena('reboot');
  g.phase = 'strategy';
  setReboot(g, 0, C); setReboot(g, 1, C); tacOnStrategyEnd(g, 1);
  assert.equal(g.objectives[C].inertTP, 2);
  g.tp = 3; setReboot(g, 0, L); setReboot(g, 1, C); tacOnStrategyEnd(g, 0);
  assert.equal(g.objectives[R].inertTP, 3);
  g.phase = 'firefight';
  const a = at(ops(g, 0)[0], g.objectives[R]); a.x = g.objectives[R].x - 0.9; ops(g, 1).forEach((o) => { o.x = 29.5; });
  at(ops(g, 0)[1], g.objectives[L]);
  G.mission(g).onTPEnd(g);
  assert.equal(g.vp[0], 1, 'the inert one does not score');
  act(g, a, 'reboot');
  assert.equal(MISSION_ACTIONS.reboot.ap, 2);
  G.mission(g).onTPEnd(g);
  assert.equal(g.vp[0], 1 + 2);
}

// Tac Ops.
const tac = (id) => { const g = arena('secure', [id, 'dominate']); return g; };
// Rout: kills within 6" of the enemy drop zone, 2VP for a 12+ Wounds enemy, max 2 per TP.
{
  const g = tac('rout'), a = ops(g, 0)[0]; a.x = 20; a.y = 11;
  const small = ops(g, 1).filter((o) => G.tpl(o).wounds < 12), big = ops(g, 1).find((o) => G.tpl(o).wounds >= 12);
  G.applyDamage(g, a, small[0], 99);
  assert.equal(g.vpBy[0].tac, 1); assert(g.tacOps[0].revealed);
  G.applyDamage(g, a, big, 99); G.applyDamage(g, a, small[1], 99);
  assert.equal(g.vpBy[0].tac, 2, 'max 2VP per TP');
  g.tp = 3; G.applyDamage(g, a, small[2], 99); assert.equal(g.vpBy[0].tac, 3, 'a new turning point');
  a.x = 10; G.applyDamage(g, a, small[3], 99); assert.equal(g.vpBy[0].tac, 3, 'too far from the enemy drop zone');
}
{
  const g = tac('rout'), a = ops(g, 0)[0]; a.x = 20; a.y = 11;
  G.applyDamage(g, a, ops(g, 1).find((o) => G.tpl(o).wounds >= 12), 99);
  assert.equal(g.vpBy[0].tac, 2, '12+ Wounds: 2VP');
}
// Steal Intelligence: a marker where each enemy falls; up to two carried; 1VP per TP while carrying, 1VP each at the end.
{
  const g = tac('stealIntel'), a = ops(g, 0)[0], [e1, e2] = ops(g, 1);
  e1.x = 10; e1.y = 5; e2.x = 10; e2.y = 6;
  G.applyDamage(g, a, e1, 99); G.applyDamage(g, a, e2, 99);
  assert.equal(g.markers.filter((m) => m.kind === 'intel').length, 2);
  a.x = 10; a.y = 5.5; G.activate(g, a);
  G.doPickUp(g, a); a.acted.pickUp = 0; G.doPickUp(g, a);
  assert.equal(g.markers.filter((m) => m.carriedBy === a.uid).length, 2, 'carries two Intelligence markers');
  tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 1);
  tacOnBattleEnd(g); assert.equal(g.vpBy[0].tac, 3);
}
// Plant Banner: wholly in the enemy territory, more than 5" from the neutral edges; 2VP uncontested, 1VP contested.
{
  const g = tac('plantBanner'), a = ops(g, 0)[0];
  a.x = 20; a.y = 4; G.activate(g, a); assert.equal(can(g, a, 'plantBanner').ok, false, 'too close to a neutral edge');
  a.y = 11; act(g, a, 'plantBanner');
  tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 2);
  const e = ops(g, 1)[0]; e.x = 20; e.y = 12.6; e.order = 'engage';
  const sum = g.vpBy[0].tac; a.x = 18.8; tacOnTPEnd(g);
  assert.equal(g.vpBy[0].tac - sum, G.controller(g, g.markers.find((m) => m.kind === 'banner')) === 0 ? 1 : 0);
  a.ready = true; G.activate(g, a); assert.equal(can(g, a, 'plantBanner').ok, false, 'once per battle');
}
// Plant Devices: the opponent's objective 1VP, other objectives the enemy contests 1VP each, max 2.
{
  const g = tac('plantDevices'), [a, b] = ops(g, 0);
  act(g, at(a, g.objectives[R]), 'plantDevice'); act(g, at(b, g.objectives[C]), 'plantDevice');
  a.x = 1; b.x = 1;
  tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 1);
  at(ops(g, 1)[0], g.objectives[C]); tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 3);
}
// Scout Enemy Movement: not with an Engage order; a ready enemy more than 6" away is monitored; 1VP each while visible.
{
  const g = tac('scout'), a = ops(g, 0)[0], e = ops(g, 1)[0];
  a.x = 10; a.y = 11; e.x = 20; e.y = 11;
  G.activate(g, a); assert.equal(can(g, a, 'scout').ok, false, 'Engage order');
  a.order = 'conceal'; G.doMissionAction(g, a, 'scout');
  assert.equal(ops(g, 1).filter((o) => o.monitored?.[0] === 2).length, 1);
  tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 1);
}
// Track Enemy: a Concealed friendly within 6" that the enemy can't target (Concealed in cover).
{
  const g = tac('trackEnemy'), a = ops(g, 0)[0], e = ops(g, 1)[0];
  a.x = 14; a.y = 11; a.order = 'conceal'; e.x = 19; e.y = 11;
  tacOnTPEnd(g); assert.equal(g.vpBy?.[0]?.tac || 0, 0, 'in the open the enemy can target it');
  g.terrain = [{ kind: 'light', x: 14.6, y: 9, w: 0.3, h: 4 }];
  const v = G.visibility(g, e, a), w = G.visibility(g, a, e);
  assert(v.visible && v.cover && w.visible && !w.cover, 'the light cover hides the tracker only');
  tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 1);
}
// Sweep & Clear: controlling a swept objective 1VP, 2VP if it's also cleared.
{
  const g = tac('sweepClear'), a = ops(g, 0)[0], e = at(ops(g, 1)[0], g.objectives[C]);
  G.applyDamage(g, a, e, 99);
  act(g, at(a, g.objectives[C]), 'clear');
  tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 2);
}
// Flank: 2VP for a flank also held at the end of the previous turning point (not the first).
{
  const g = tac('flank');
  ops(g, 1).forEach((o) => { o.x = 29.5; });
  const a = ops(g, 0)[0]; a.x = 17; a.y = 3;
  tacOnStrategyEnd(g, 0); tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 1);
  g.tp = 3; tacOnTPEnd(g); assert.equal(g.vpBy[0].tac, 1 + 2);
}
// Dominate: one token per enemy incapacitated, whatever its Wounds.
{
  const g = tac('dominate'), a = ops(g, 0)[0];
  G.applyDamage(g, a, ops(g, 1)[0], 99);
  assert.equal(a.dominate, 1);
}
// Kill Op: the grade table (by the enemy's starting count) and the end-of-battle bonus.
{
  const g = arena('secure');
  assert.deepEqual(G.killThresholds(g, 0), [2, 4, 6, 8, 10]); // 10 Kommandos
  assert.deepEqual(G.killThresholds(g, 1), [1, 2, 4, 5, 6]); // 6 Angels of Death
  g.kills = [4, 2];
  assert.equal(G.killGrade(g, 0), 2); assert.equal(G.killGrade(g, 1), 2);
  g.phase = 'gameover'; g.kills = [6, 2];
  assert.equal(G.killOpVP(g, 0), 3 + 1); assert.equal(G.killOpVP(g, 1), 2);
}
// AI vs AI full battles on every Crit Op, using every Tac Op at least once.
{
  const { aiStep, aiStrategy } = await import('../js/ai.js');
  const tacs = Object.keys(TAC_OPS), crits = ['secure', 'loot', 'transmission', 'orb', 'stakeClaim', 'energyCells', 'download', 'data', 'reboot'];
  crits.forEach((mission, i) => {
    const g = G.newGame({ teams: i % 2 ? ['kommandos', 'angels'] : ['angels', 'kommandos'], ai: null, mission, tacOps: [tacs[(2 * i) % 12], tacs[(2 * i + 1) % 12]] });
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
    assert(steps < 3000, `${mission}: simulation stalled`);
    assert.equal(g.phase, 'gameover');
    console.log(`${mission} (${g.tacOps.map((t) => t.id).join(' / ')}): ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)}  crit ${g.vpBy?.[0]?.crit || 0}:${g.vpBy?.[1]?.crit || 0} tac ${g.vpBy?.[0]?.tac || 0}:${g.vpBy?.[1]?.tac || 0}`);
  });
}
console.log('approved ops ok');
