// Death Korps (克里格死亡兵團) rules engine for the parts added after the first version: the Sapper's mines, the Veteran, Regroup,
// Inspirational Leadership, In Life Shame, In Death Atonement, free ploys and the faction equipment.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load.)
import { ACTIONS, BOARD, activeOp, autoFF, edgeDist, engagedEnemies, foes, forcedShot, isEngaged, living, log, opName, radius, spend, team, tpl, visibility, GUARD_ORDERS } from './game.js';
import { dist } from './geometry.js';
import { bestStep, stepTo } from './sanctifiers.js';
import { deathKorpsRosterError, dkFreeCount, cleanDkFree, DEFAULT_DK_FREE } from './data/deathkorps.js';

export function isDK(o) { return o?.team === 'deathKorps'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }

export function dkSetup(g, roster, dkFree = []) {
  g.dkFree = [[], []]; g.dkUsed = [{}, {}];
  for (const side of [0, 1]) if (g.teams[side] === 'deathKorps') {
    const t = team(g, side), error = deathKorpsRosterError(t, roster[side]);
    if (error) throw new Error(error.en);
    g.dkFree[side] = cleanDkFree(dkFree[side] ?? DEFAULT_DK_FREE, dkFreeCount(t, roster[side] || {}));
  }
}
/** A ploy chosen to cost 0CP for the battle (a Trooper selection traded for it). */
export function dkFreeHas(g, side, id) { return !!g.dkFree?.[side]?.includes(id); }

// ---------- Guardsman Orders: Inspirational Leadership, Adaptive Orders, In Life Shame, the Veteran ----------
/** The order the computer (and the automatic choices) hand out: Fix Bayonets! when many are engaged, else Take Aim!. */
export function dkBestOrder(g, side) {
  const own = living(g, side);
  return own.filter((o) => isEngaged(g, o)).length * 3 > own.length ? 'fixBayonets' : 'takeAim';
}
/** Adaptive Orders: a Watchmaster that didn't issue an order as a strategic gambit uses Inspirational Leadership for 0CP. */
export function dkAdaptiveFree(g, side, id) {
  if (id !== 'inspirationalLeadership' || g.teams[side] !== 'deathKorps') return false;
  const o = activeOp(g);
  return !!o && o.side === side && !!tpl(o).adaptiveOrders && !g.gIssued?.[side];
}
/** Comm-beads: the one friendly that profits most from the order. */
export function dkBeadsTarget(g, candidates, id) {
  const score = (o) => {
    const ranged = Math.max(0, ...tpl(o).weapons.filter((w) => w.type === 'ranged').map((w) => w.atk * w.dmg[1]));
    const melee = Math.max(0, ...tpl(o).weapons.filter((w) => w.type === 'melee').map((w) => w.atk * w.dmg[1]));
    return id === 'fixBayonets' ? melee : id === 'takeAim' ? ranged : o.wounds;
  };
  return [...candidates].sort((a, b) => score(b) - score(a))[0] || null;
}
export const dkBeadsOn = (g, side) => g.teams[side] === 'deathKorps' && equip(g, side, 'dkBeads');
/** Inspirational Leadership (firefight ploy): the Watchmaster or Confidant issues an order now. Returns the log text. */
export function dkLeadership(g, op, giveOrder) {
  const id = dkBestOrder(g, op.side);
  giveOrder(g, op.side, op, { id, relay: false });
  return { zh: `下達衛兵命令「${GUARD_ORDERS[id].zh}」`, en: `issues the Guardsman Order "${GUARD_ORDERS[id].en}"` };
}
/** In Life, Shame: an operative activated with an Engage order receives every Guardsman Order. */
export function dkLifeShame(g, op) {
  if (!isDK(op) || op.side > 1 || g.counter) return;
  if (autoFF(g, op.side, 'lifeShame')) {
    op.gOrder = { id: 'takeAim', tp: g.tp, all: true };
    note(g, op.side, `生之恥辱：${opName(op, 'zh')} 收到所有衛兵命令`, `In Life, Shame: ${opName(op, 'en')} receives every Guardsman Order`);
  }
}
/** The Veteran, when activated, receives one order. */
export function dkVeteranActivate(g, op) {
  if (g.counter || !isDK(op) || !tpl(op).dkVeteran) return;
  const ranged = Math.max(0, ...tpl(op).weapons.filter((w) => w.type === 'ranged').map((w) => w.atk * w.dmg[1]));
  const melee = Math.max(0, ...tpl(op).weapons.filter((w) => w.type === 'melee').map((w) => w.atk * w.dmg[1]));
  op.gOrder = { id: ranged >= melee ? 'takeAim' : 'fixBayonets', tp: g.tp };
  note(g, op.side, `${opName(op, 'zh')} 老兵：收到「${GUARD_ORDERS[op.gOrder.id].zh}」`, `${opName(op, 'en')} Veteran Guardsman: receives ${GUARD_ORDERS[op.gOrder.id].en}`);
}
export const hasOrder = (g, op, id) => op.gOrder?.tp === g.tp && (op.gOrder.id === id || !!op.gOrder.all);

// ---------- In Death, Atonement ----------
export function dkDeath(g, src, target) {
  if (!isDK(target) || target.side > 1 || !target.readyAtDeath || engagedEnemies(g, target).length) return;
  const w = tpl(target).weapons.filter((x) => x.type === 'ranged' && !x.rules.dkDetonate && !(x.rules.limited && (target.used?.[x.id] || 0) >= x.rules.limited))
    .sort((a, b) => b.atk * b.dmg[1] - a.atk * a.dmg[1])[0];
  const t = w && foes(g, target).filter((e) => e.side < 2 && edgeDist(target, e) <= (w.rules.range || 99) && visibility(g, target, e).visible).sort((a, b) => a.wounds - b.wounds)[0];
  if (!t || !autoFF(g, target.side, 'deathAtonement')) return;
  note(g, target.side, `死之救贖：${opName(target, 'zh')} 殘廢前免費射擊 ${opName(t, 'zh')}`, `In Death, Atonement: ${opName(target, 'en')} shoots ${opName(t, 'en')} for free before it falls`);
  forcedShot(g, target, w, [t], true);
}

// ---------- strategy ploy Regroup, and the strategic gambits Chronometer and Gas Bombardment ----------
export function dkPloyBought(g, side, ploy) {
  if (ploy.id !== 'regroup') return;
  if (g.dkUsed[side].chronoTP === g.tp) { note(g, side, '重整：本回合已用懷錶', 'Regroup: the Chronometer was used this turning point'); return; }
  g.dkUsed[side].regroupTP = g.tp;
  const own = living(g, side).filter((o) => isDK(o));
  const anchor = own.filter((o) => !foes(g, o).some((e) => edgeDist(o, e) <= 3)).sort((a, b) => own.filter((x) => x !== b && edgeDist(x, b) <= 5).length - own.filter((x) => x !== a && edgeDist(x, a) <= 5).length)[0];
  if (!anchor) { note(g, side, '重整：沒有符合條件的特工', 'Regroup: no eligible operative'); return; }
  for (const o of own.filter((x) => x !== anchor && edgeDist(x, anchor) <= 5 && !isEngaged(g, x))) {
    const q = bestStep(g, o, 3, 'dash', (p) => (dist(p, anchor) - radius(o) - radius(anchor) < edgeDist(o, anchor) - 0.05 ? edgeDist(o, anchor) - (dist(p, anchor) - radius(o) - radius(anchor)) : null));
    if (q) { stepTo(g, o, q); note(g, side, `重整：${opName(o, 'zh')} 免費衝刺，靠近 ${opName(anchor, 'zh')}`, `Regroup: ${opName(o, 'en')} makes a free Dash towards ${opName(anchor, 'en')}`); }
  }
}
export function dkGambitOk(g, side, id) {
  if (g.teams[side] !== 'deathKorps' || g.phase !== 'strategy' || !living(g, side).some((o) => isDK(o))) return false;
  if (id === 'chrono') return equip(g, side, 'dkChrono') && !g.dkUsed[side].chrono && g.tp <= 2 && g.dkUsed[side].regroupTP !== g.tp;
  if (id === 'gas') return equip(g, side, 'dkGas') && !g.dkUsed[side].gas;
  return false;
}
export function dkGambit(g, side, id) {
  if (!dkGambitOk(g, side, id)) return false;
  if (id === 'chrono') {
    g.dkUsed[side].chrono = true; g.dkUsed[side].chronoTP = g.tp;
    const foeCentre = (() => { const f = foes(g, { side }); return f.length ? { x: f.reduce((s, o) => s + o.x, 0) / f.length, y: f.reduce((s, o) => s + o.y, 0) / f.length } : { x: BOARD.w / 2, y: BOARD.h / 2 }; })();
    for (const o of living(g, side).filter((x) => isDK(x) && !isEngaged(g, x))) {
      const q = bestStep(g, o, 3, 'dash', (p) => dist(o, foeCentre) - dist(p, foeCentre));
      if (q) { stepTo(g, o, q); }
    }
    note(g, side, '懷錶：友方免費衝刺，靠近敵人', 'Chronometer: the friendlies make free Dashes towards the enemy');
    return true;
  }
  g.dkUsed[side].gas = true;
  let best = null;
  for (let x = 2; x < BOARD.w - 1; x += 2) for (let y = 2; y < BOARD.h - 1; y += 2) {
    const p = { x, y };
    const score = foes(g, { side }).filter((e) => dist(e, p) - radius(e) <= 3).length - 2 * living(g, side).filter((o) => dist(o, p) - radius(o) <= 3).length;
    if (!best || score > best.score) best = { p, score };
  }
  (g.markers ||= []).push({ id: g.markers.length, kind: 'gas', owner: side, x: best.p.x, y: best.p.y, tp: g.tp, carriedBy: null });
  note(g, side, `毒氣轟炸：毒氣標記放在戰場 (${best.p.x}, ${best.p.y})`, `Gas Bombardment: the Gas marker goes at (${best.p.x}, ${best.p.y})`);
  return true;
}
/** The computer's gambits: Chronometer in the first two turning points, Gas Bombardment as soon as it hits something. */
export function dkAiStrategy(g, side) {
  if (dkGambitOk(g, side, 'chrono')) dkGambit(g, side, 'chrono');
  if (dkGambitOk(g, side, 'gas') && g.tp >= 2) dkGambit(g, side, 'gas');
}
/** Gas Bombardment: an operative within 3" of the marker has -1 APL. */
export function dkGasApl(g, op) {
  return (g.markers || []).some((m) => m.kind === 'gas' && dist(op, m) - radius(op) <= 3) ? 1 : 0;
}
/** The Ready step: the Gas marker goes. */
export function dkReady(g) { g.markers = (g.markers || []).filter((m) => m.kind !== 'gas'); }

// ---------- equipment: Hand Axes ----------
const HAND_AXE = { id: 'dkAxe', name: { zh: '手斧', en: 'Hand axe' }, type: 'melee', atk: 3, hit: 4, dmg: [3, 4], rules: {}, group: 'dkAxe' };
export function dkWeapons(g, op, ws) {
  if (!isDK(op) || tpl(op).actionsOnly || !equip(g, op.side, 'dkAxes')) return ws;
  return [...ws, HAND_AXE];
}

// ---------- the Sapper: Mine Layer and the remote detonator ----------
/** The side's Mine marker: made the first time a Sapper is looked at, carried by that Sapper. */
export function dkMine(g, side) {
  let m = (g.markers || []).find((x) => x.kind === 'dkMine' && x.owner === side);
  if (!m && !g.dkUsed?.[side]?.mineMade) {
    const sap = living(g, side).find((o) => tpl(o).dkSapper);
    if (sap) { g.dkUsed[side].mineMade = true; m = { id: (g.markers ||= []).length, kind: 'dkMine', owner: side, x: sap.x, y: sap.y, carriedBy: sap.uid }; g.markers.push(m); }
  }
  return m || null;
}
export function dkActions(g, op, add) {
  if (!isDK(op) || !tpl(op).dkSapper) return;
  const mine = dkMine(g, op.side);
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' };
  add('dkPlaceMine', !eng && !!mine && mine.carriedBy === op.uid, eng ? ENG : { zh: '沒有攜帶地雷標記', en: 'It isn\'t carrying the Mine marker' });
  const w = tpl(op).weapons.find((x) => x.rules.dkDetonate);
  const used = (op.used?.[w?.id] || 0) >= 1, moved = op.acted.reposition || op.acted.charge || op.acted.fallBack;
  const down = !!mine && mine.carriedBy == null;
  add('dkDetonate', down && !used && !moved && !(op.acted.shoot), !down ? { zh: '地雷標記不在戰場上', en: 'The Mine marker isn\'t in the killzone' } : used ? { zh: '已用過（限用 1 次）', en: 'Used up (Limited 1)' } : { zh: '不能在移動後引爆（只能衝刺）', en: 'Not after moving (Heavy: Dash only)' });
}
export function dkSelf(g, op, id) {
  const mine = dkMine(g, op.side);
  if (id === 'dkPlaceMine') {
    if (!mine) return true;
    spend(g, op, id);
    mine.carriedBy = null; mine.x = op.x; mine.y = op.y;
    op.acted.free = { ...(op.acted.free || {}), dash: true }; // a free Dash right after
    note(g, op.side, `${opName(op, 'zh')} 放下地雷標記，並可免費衝刺`, `${opName(op, 'en')} places the Mine marker, then can Dash for free`);
    return true;
  }
  if (id === 'dkDetonate') {
    const w = tpl(op).weapons.find((x) => x.rules.dkDetonate);
    if (!mine || !w) return true;
    spend(g, op, id);
    op.acted.shoot = (op.acted.shoot || 0) + 1;
    (op.used ||= {})[w.id] = (op.used[w.id] || 0) + 1;
    const targets = g.ops.filter((o) => !o.dead && o.x > -50 && o.side < 2 && dist(o, mine) - radius(o) <= 2.01);
    note(g, op.side, `${opName(op, 'zh')} 引爆地雷：${targets.length} 名特工受到攻擊`, `${opName(op, 'en')} detonates the mine: ${targets.length} operative(s) are attacked`);
    forcedShot(g, op, w, targets);
    g.markers = g.markers.filter((m) => m !== mine);
    return true;
  }
  return false;
}
export function registerDeathKorpsActions() {
  ACTIONS.dkPlaceMine = { ap: 1, name: { zh: '放下地雷標記', en: 'Place Marker (Mine)' } };
  ACTIONS.dkDetonate = { ap: 1, name: { zh: '引爆', en: 'Detonate' } };
}
