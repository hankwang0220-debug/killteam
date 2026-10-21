// canoptek: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { dist, distPointRect } from '../geometry.js';
import { abilityArmed, boardOf, controller, d3, d6, ffReady, handOff, hasPloy, isComputer, killOff, living, log, opName, placeAuto, ployCost, ployTaken, radius, spendFF, team, teamZh, territoryOf, tpl } from '../game.js';
import { pmPloyBought } from '../plague.js';
import { kmPloyBought } from '../kommandos.js';
import { pfPloyBought } from '../pathfinders.js';
import { dkPloyBought } from '../deathkorps.js';
import { adPloyBought } from '../angels.js';


// ---------- Canoptek Circle ----------
export const MATRIX_HALF = 0.39; // the matrix lines are 20mm wide
export const isCC = (op) => !!TEAM_MAP[op.team]?.obeliskNodes;
export const nodesOf = (g, side) => (g.markers || []).filter((m) => m.kind === 'obeliskNode' && m.owner === side);
/** The matrix: the lines between this side's obelisk nodes that are within 6" of each other. */
export function matrixSegs(g, side) {
  const n = nodesOf(g, side).slice(), segs = [];
  if (g.ccManip?.side === side) { const geo = g.ops.find((o) => o.uid === g.ccManip.uid && !o.dead); if (geo) n.push(geo); }
  for (let i = 0; i < n.length; i++) for (let j = i + 1; j < n.length; j++) if (dist(n[i], n[j]) <= 6) segs.push([n[i], n[j]]);
  return segs;
}
export const segDist = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};
/** Is the operative (any part of its base) within this side's matrix? */
export const inMatrix = (g, side, op) => !!op && side < 2 && matrixSegs(g, side).some(([a, b]) => segDist(op, a, b) - (op.tplId ? radius(op) : 0) <= MATRIX_HALF);
export const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
export const segsCross = (p1, p2, q1, q2) => cross(p1, p2, q1) * cross(p1, p2, q2) < 0 && cross(q1, q2, p1) * cross(q1, q2, p2) < 0;
/** Is this side's matrix intervening between the shooter and the target? */
export const matrixBetween = (g, side, from, to) => matrixSegs(g, side).some(([a, b]) => segsCross(from, to, a, b));
/** Within the matrix, or with the matrix in the way of this shot (Hypershielding, Transdynamic Amplification, Shield Flare). */
export const matrixCovers = (g, side, shooter, target) => inMatrix(g, side, target) || (!!shooter && matrixBetween(g, side, shooter, target));
export const souldrained = (g, o, foe) => o.side < 2 && foe.side < 2 && TEAM_MAP[g.teams[1 - o.side]]?.obeliskNodes && hasPloy(g, 1 - o.side, 'souldrain')
  && !isCC(o) && (inMatrix(g, 1 - o.side, o) || (isCC(foe) && inMatrix(g, foe.side, foe)));
/** Manual set-up: the next obelisk node goes where the player taps (wholly in the territory, first turning point). */
export function nodePlace(g, side, p) {
  if (!TEAM_MAP[g.teams[side]].obeliskNodes || g.tp !== 1 || g.phase !== 'strategy' || nodesOf(g, side).length >= 3) return false;
  const b = boardOf(g);
  if (p.x < 0.5 || p.y < 0.5 || p.x > b.w - 0.5 || p.y > b.h - 0.5) return false;
  if (territoryOf(g, { x: p.x - 0.4, y: p.y - 0.4 }) !== side || territoryOf(g, { x: p.x + 0.4, y: p.y + 0.4 }) !== side) return false; // wholly within the territory
  if (g.terrain.some((t) => distPointRect(p, t) < 0.5) || [...g.objectives, ...g.markers].some((m) => dist(m, p) < 0.8)) return false;
  g.markers.push({ id: g.markers.length, kind: 'obeliskNode', owner: side, x: p.x, y: p.y, carriedBy: null });
  if (nodesOf(g, side).length === 3) {
    (g.nodeTP ||= [0, 0])[side] = g.tp;
    log(g, { zh: `${teamZh(g, side)} 放置 3 個方尖碑節點`, en: `${team(g, side).name.en} sets up its three obelisk nodes` }, `side${side}`);
  }
  return true;
}
/** Manual move: one obelisk node up to 3" (turning points after the first), once each. */
export function nodeMove(g, side, uid, p) {
  const n = nodesOf(g, side).find((m) => m.id === uid);
  if (!n || g.tp < 2 || g.phase !== 'strategy' || n.movedTP === g.tp) return false;
  const b = boardOf(g);
  if (p.x < 0.5 || p.y < 0.5 || p.x > b.w - 0.5 || p.y > b.h - 0.5 || dist(n, p) > 3 + 0.01) return false;
  if (g.terrain.some((t) => distPointRect(p, t) < 0.5)) return false;
  const from = { x: n.x, y: n.y };
  n.x = p.x; n.y = p.y; n.movedTP = g.tp;
  log(g, { zh: `${teamZh(g, side)} 方尖碑節點移動 ${dist(from, p).toFixed(1)}"`, en: `${team(g, side).name.en} moves an obelisk node ${dist(from, p).toFixed(1)}"` }, `side${side}`);
  return true;
}
// ---------- Canoptek Circle: Nodal Response, Animate Obelisk Nodes, faction equipment ----------
export const ccEquip = (g, side, id) => !!g.equip?.[side]?.includes(id);
/** Awakened Obelisk Nodes: after revealing it, D3 uses of Animate Obelisk Nodes cost 0CP. */
export const ccAwakenedFree = (g, side, id) => id === 'animateNodes' && (g.awakened?.[side] || 0) > 0;
/** Phase Shifter: once per TP, the first shot at the Geomancer has Piercing worsened by 1. */
export function ccPhaseStart(g, op, target) {
  g.ccPhase = null;
  if (!target || target.side > 1 || !tpl(target).ccLeader || !(ccEquip(g, target.side, 'ccPhase') && abilityArmed(g, target.side, 'ccPhase')) || g.ccPhaseTP?.[target.side] === g.tp) return;
  (g.ccPhaseTP ||= [0, 0])[target.side] = g.tp; g.ccPhase = target.uid;
  log(g, { zh: '相位轉換器：這次射擊的穿甲 -1', en: 'Phase Shifter: Piercing is worsened by 1 for this shot' }, `side${target.side}`);
}
/** Matrix Manipulator: once per battle, in an activation, the Geomancer counts as a fourth node until it ends (used when it would add a line to the matrix). */
export function ccManipActivate(g, op) {
  if (!g.counter && isCC(op) && op.side < 2 && ccEquip(g, op.side, 'ccCaskets') && op.wounds < op.maxW) { const h = Math.min(op.maxW - op.wounds, d3()); op.wounds += h; log(g, { zh: `納米甲蟲匣：${opName(op, 'zh')} 回復 ${h} 生命`, en: `Nanoscarab Caskets: ${opName(op, 'en')} regains ${h} wounds` }, `side${op.side}`); }
  g.ccManip = null;
  if (g.counter || !isCC(op) || op.side > 1 || !(ccEquip(g, op.side, 'ccManip') && abilityArmed(g, op.side, 'ccManip')) || g.ccManipUsed?.[op.side] || inMatrix(g, op.side, op)) return;
  const geo = living(g, op.side).find((o) => tpl(o).ccLeader);
  if (!geo) return;
  g.ccManip = { side: op.side, uid: geo.uid };
  if (!inMatrix(g, op.side, op)) { g.ccManip = null; return; }
  (g.ccManipUsed ||= [false, false])[op.side] = true;
  log(g, { zh: '矩陣操縱器：地占術士視為第四個方尖碑節點，直到這次啟動結束', en: 'Matrix Manipulator: the Geomancer counts as a fourth obelisk node until the end of this activation' }, `side${op.side}`);
}
/** Reveal Awakened Obelisk Nodes (when the equipment is first used): rolls one D3. */
export function ccRevealAwakened(g, side) {
  if (!ccEquip(g, side, 'ccAwakened') || g.awakened?.[side] != null) return;
  (g.awakened ||= [null, null])[side] = d3();
  log(g, { zh: `覺醒方尖碑節點：可以 0CP 使用「驅動方尖碑節點」${g.awakened[side]} 次`, en: `Awakened Obelisk Nodes: Animate Obelisk Nodes is free ${g.awakened[side]} time(s)` }, `side${side}`);
}
/** Animate Obelisk Nodes: instead of activating, move nodes up to 6" in all (each distance rounded up). */
export function animateBegin(g, side) {
  if (g.phase !== 'firefight' || g.turn !== side || g.active || g.counter || g.animating || !TEAM_MAP[g.teams[side]].obeliskNodes || !nodesOf(g, side).length) return false;
  ccRevealAwakened(g, side);
  if (!ffReady(g, side, 'animateNodes')) return false;
  const free = ccAwakenedFree(g, side, 'animateNodes');
  if (free) g.awakened[side]--;
  g.ccFree = free; spendFF(g, side, 'animateNodes'); g.ccFree = false;
  g.animating = { side, left: 6 };
  return true;
}
export function animateMove(g, side, uid, p) {
  const a = g.animating, n = a && a.side === side && nodesOf(g, side).find((m) => m.id === uid);
  if (!n) return false;
  const b = boardOf(g), d = Math.ceil(dist(n, p) - 1e-6);
  if (p.x < 0.5 || p.y < 0.5 || p.x > b.w - 0.5 || p.y > b.h - 0.5 || d > a.left || g.terrain.some((t) => distPointRect(p, t) < 0.5)) return false;
  n.x = p.x; n.y = p.y; a.left -= d;
  return true;
}
export function animateEnd(g, side) {
  if (!g.animating || g.animating.side !== side) return false;
  log(g, { zh: `${teamZh(g, side)} 驅動方尖碑節點（用掉 ${6 - g.animating.left}"）`, en: `${team(g, side).name.en} animates its obelisk nodes (${6 - g.animating.left}" used)` }, `side${side}`);
  g.animating = null;
  handOff(g, side);
  return true;
}
/** Nodal Response (opened by the firefight button): use a strategy ploy now, or change one already used this TP (extra CP only if dearer). */
export function nodalChoose(g, side, newId, oldId = null) {
  if (g.nodalOpen !== side) return false;
  const ploy = team(g, side).ploys.find((p) => p.id === newId), old = oldId && team(g, side).ploys.find((p) => p.id === oldId);
  if (!ploy || (oldId && (!old || !g.ploys[side].includes(oldId)))) return false;
  if (!old && ployTaken(g, side, ploy)) return false;
  if (old && ployTaken({ ...g, ploys: g.ploys.map((l, i) => (i === side ? l.filter((x) => x !== oldId) : l)) }, side, ploy)) return false;
  const cost = old ? Math.max(0, ployCost(g, side, ploy) - old.cp) : ployCost(g, side, ploy);
  if (g.cp[side] < cost) return false;
  g.cp[side] -= cost;
  if (old) g.ploys[side][g.ploys[side].indexOf(oldId)] = newId; else g.ploys[side].push(newId);
  pmPloyBought(g, side, ploy); kmPloyBought(g, side, ploy); pfPloyBought(g, side, ploy); dkPloyBought(g, side, ploy); adPloyBought(g, side, ploy);
  g.nodalOpen = null;
  log(g, { zh: `${teamZh(g, side)} 節點回應：${old ? `「${old.name.zh}」改為` : '使用'}「${ploy.name.zh}」`, en: `${team(g, side).name.en} Nodal Response: ${old ? `${old.name.en} becomes ` : 'uses '}${ploy.name.en}` }, `side${side}`);
  return true;
}
/** The player is done with the nodes this turning point (moved as far as they wished). */
export function nodesDone(g, side) { (g.nodeTP ||= [0, 0])[side] = g.tp; }
export const nodesLeftToPlace = (g, side) => (g.tp === 1 ? 3 - nodesOf(g, side).length : 0);
export const nodeList = (g, side) => nodesOf(g, side);
/** Nodes: set up in the first Strategy phase (in your territory), then moved up to 3" each turning point after. */
export function placeNodes(g, side) {
  if (!TEAM_MAP[g.teams[side]].obeliskNodes || g.nodeTP?.[side] === g.tp) return;
  if (g.tp > 1 && isComputer(g, side)) { /* the computer moves its nodes below */ } else if (g.tp > 1) return; // (a player moves them by hand)
  (g.nodeTP ||= [0, 0])[side] = g.tp;
  const mine = living(g, side);
  if (!mine.length) return;
  const along = g.axis === 'y' ? 'y' : 'x', perp = along === 'x' ? 'y' : 'x';
  const size = { x: boardOf(g).w, y: boardOf(g).h }, mid = size[along] / 2;
  const low = territoryOf(g, { [along]: 1, [perp]: size[perp] / 2 }) === side; // our territory is the low half
  const c = { x: mine.reduce((s, o) => s + o.x, 0) / mine.length, y: mine.reduce((s, o) => s + o.y, 0) / mine.length };
  const clampPerp = (v) => Math.max(1, Math.min(size[perp] - 1, v));
  const nodes = nodesOf(g, side);
  if (g.tp === 1 && nodes.length < 3) {
    // In a line across the killzone, 5" apart, as far forward as our territory allows.
    const front = low ? Math.min(c[along] + 2, mid - 1) : Math.max(c[along] - 2, mid + 1);
    const centre = clampPerp(Math.max(6, Math.min(size[perp] - 6, c[perp])));
    for (const off of [-5, 0, 5].slice(nodes.length)) g.markers.push({ id: g.markers.length, kind: 'obeliskNode', owner: side, [along]: front, [perp]: clampPerp(centre + off), carriedBy: null });
    log(g, { zh: `${teamZh(g, side)} 放置 3 個方尖碑節點`, en: `${team(g, side).name.en} sets up its three obelisk nodes` }, `side${side}`);
    return;
  }
  // Up to 3" each, together (so the matrix holds): towards the nearest objective we don't control.
  const nc = { x: nodes.reduce((s, n) => s + n.x, 0) / nodes.length, y: nodes.reduce((s, n) => s + n.y, 0) / nodes.length };
  const goal = (g.objectives || []).filter((o) => controller(g, o) !== side).sort((a, b) => dist(a, nc) - dist(b, nc))[0];
  if (!goal) return;
  const d = dist(goal, nc), step = Math.min(3, Math.max(0, d - 1));
  if (step < 0.5) return;
  const vx = (goal.x - nc.x) / d * step, vy = (goal.y - nc.y) / d * step;
  for (const n of nodes) { n.x = Math.max(0.5, Math.min(boardOf(g).w - 0.5, n.x + vx)); n.y = Math.max(0.5, Math.min(boardOf(g).h - 0.5, n.y + vy)); }
  log(g, { zh: `${teamZh(g, side)} 方尖碑節點移動 ${step.toFixed(1)}"`, en: `${team(g, side).name.en} moves its obelisk nodes ${step.toFixed(1)}"` }, `side${side}`);
}
/** Geomantic Disturbance: the point of terrain nearest this enemy, if within 2" of it and within 8" of the Geomancer. */
export function geoPoint(g, op, t) {
  let best = null;
  for (const r of g.terrain) {
    const p = { x: Math.max(r.x, Math.min(r.x + r.w, t.x)), y: Math.max(r.y, Math.min(r.y + r.h, t.y)) };
    if (dist(p, t) - radius(t) > 2 || dist(op, p) - radius(op) > 8) continue;
    if (!best || dist(p, t) < dist(best, t)) best = p;
  }
  return best;
}
/** A Ceaseless Scuttling (Macrocyte Warriors): from the second turning point, a new Warrior if fewer than three remain. */
export function ceaselessScuttling(g, side) {
  if (!TEAM_MAP[g.teams[side]].obeliskNodes || g.tp < 2 || g.scuttleTP?.[side] === g.tp) return;
  (g.scuttleTP ||= [0, 0])[side] = g.tp;
  if (living(g, side).filter((o) => tpl(o).ccWarrior).length >= 3) return;
  const t = TEAM_MAP[g.teams[side]].ops.find((o) => o.id === 'ccWarrior');
  const num = g.ops.filter((o) => o.side === side).length + 1;
  const op = { uid: `${side}-${num}`, side, team: g.teams[side], tplId: t.id, num, x: -99, y: -99, wounds: t.wounds, maxW: t.wounds, order: 'conceal', ready: true, ap: 0, acted: {},
    ml: 0, aplNext: 0, used: {}, poison: false, damagedTP: false, dead: false, counteracted: false, actTP: 0, movedTP: 0, placed: false };
  g.ops.push(op);
  if (!placeAuto(g, side, [op]).length) { g.ops.splice(g.ops.indexOf(op), 1); return; }
  op.placed = true;
  log(g, { zh: `${teamZh(g, side)} 無盡爬行：新的巨細胞戰士在降落區就位`, en: `${team(g, side).name.en} A Ceaseless Scuttling: a new Macrocyte Warrior is set up in the drop zone` }, `side${side}`);
}
/** Dimensional Banishment (transdimensional isolator): after it damaged or retained a crit, 2D6 above the wounds left = gone. */
export function banish(g, op, target, res) {
  if (!target || target.dead || tpl(target).nemesis || !(res?.dmg > 0 || res?.attack?.crits > 0)) return;
  const r = d6() + d6();
  log(g, { zh: `跨維度放逐：擲 ${r}（${opName(target, 'zh')} 剩 ${target.wounds} 生命）`, en: `Dimensional Banishment: rolls ${r} (${opName(target, 'en')} has ${target.wounds} wounds left)` }, `side${op.side}`);
  if (r > target.wounds) { target.noReanimate = true; killOff(g, op, target); }
}
