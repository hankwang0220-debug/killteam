// navy: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CONTROL, abilityArmed, edgeDist, hasPloy, living, log, opName, radius, spend, territoryOf, tpl } from '../game.js';
import { dist, distPointRect, distPointSegment } from '../geometry.js';
import { accessPointsOf, nearHatch } from '../tombworld-access.js';


// ---------- Imperial Navy Breachers (equipment, Lock It Down, Deck Hand) ----------
export const nbEquip = (g, op, id) => !!op && op.side < 2 && op.team === 'navyBreachers' && !!g.equip?.[op.side]?.includes(id);
/** Combat Stimms: no Move change from being injured. Rebreathers: no APL changes and no enemy Shock. */
export const nbStimms = (g, op) => nbEquip(g, op, 'nbStimms');
export const nbRebreathe = (g, op) => nbEquip(g, op, 'nbRebreathers');
/** Slugs: up to three times per turning point, a Navis shotgun (long range) shot gets Hit +1, Dmg +1/+1 and Accurate 1. */
export function nbSlugsOk(g, op, weapon) {
  return nbEquip(g, op, 'nbSlugs') && weapon.id === 'shotgunLong' && abilityArmed(g, op.side, 'nbSlugs') && (g.nbSlugs?.[op.side]?.tp !== g.tp || g.nbSlugs[op.side].n < 3);
}
export function nbSlugsUsed(g, op) {
  const s = (g.nbSlugs ||= [null, null]);
  s[op.side] = { tp: g.tp, n: (s[op.side]?.tp === g.tp ? s[op.side].n : 0) + 1 };
  log(g, { zh: `${opName(op, 'zh')} 使用獨頭彈（本回合第 ${s[op.side].n} 次）`, en: `${opName(op, 'en')} fires Slugs (${s[op.side].n} this turning point)` }, `side${op.side}`);
}
/** System Override Device: once per turning point, one friendly's Operate Hatch costs 1 less AP. Deck Hand: a free one. */
export function nbHatchDiscount(g, op, id) {
  if (!/^tw(Open|Close)_/.test(id) || op.team !== 'navyBreachers') return 0;
  if (op.acted?.nbDeck && !op.acted.nbDeckHatch) return 99;
  return nbEquip(g, op, 'nbOverride') && g.nbOverride?.[op.side] !== g.tp ? 1 : 0;
}
/** Weld Shut (Hatchcutter): opening that hatchway costs others 1 more AP until it is opened. */
export function nbWeldExtra(g, op, id) { const w = id.startsWith('twOpen_') && g.nbWeld?.[id.slice(7)]; return w && w.by !== op.uid ? 1 : 0; }
export function nbHatchUsed(g, op, id) {
  if (!/^tw(Open|Close)_/.test(id) || op.team !== 'navyBreachers') return;
  if (op.acted?.nbDeck && !op.acted.nbDeckHatch) { op.acted.nbDeckHatch = true; return; }
  if (nbEquip(g, op, 'nbOverride') && g.nbOverride?.[op.side] !== g.tp) (g.nbOverride ||= [0, 0])[op.side] = g.tp;
}
/**
 * Breachwall (Endurant): with an Engage order and intervening, the friendly whose base touches it can't be selected as a valid target —
 * unless more than one other friendly's base touches the Endurant.
 */
export function nbBreachwalled(g, shooter, target) {
  if (target.side > 1 || shooter.side === target.side) return false;
  const touching = (a, b) => edgeDist(a, b) <= 0.05;
  return living(g, target.side).some((e) => tpl(e).breachwall && e !== target && e.order === 'engage' && touching(e, target)
    && distPointSegment(e, shooter, target) < radius(e) && living(g, target.side).filter((o) => o !== e && touching(o, e)).length <= 1);
}
export const nbTerrainNear = (g, op) => g.terrain.filter((t) => (t.kind === 'heavy' || t.kind === 'light') && distPointRect(op, t) - radius(op) <= CONTROL + 0.01);
export const nbHatchToWeld = (g, op) => accessPointsOf(g).find((d) => d.kind === 'hatchway' && d.state !== 'open' && !g.nbWeld?.[d.id] && nearHatch(g, op, d, radius(op)));
export function nbSelf(g, op, id) {
  if (id === 'nbBreach') {
    const t = nbTerrainNear(g, op).sort((a, b) => distPointRect(op, a) - distPointRect(op, b))[0];
    if (!t) return true;
    spend(g, op, id);
    const p = { x: Math.max(t.x, Math.min(t.x + t.w, op.x)), y: Math.max(t.y, Math.min(t.y + t.h, op.y)) };
    (g.markers ||= []).push({ id: g.markers.length, kind: 'breach', owner: op.side, x: p.x, y: p.y, rect: { x: t.x, y: t.y, w: t.w, h: t.h }, carriedBy: null });
    log(g, { zh: `${opName(op, 'zh')} 破口：在地形上放破口標記（1" 內厚度 1" 以下的部分可以穿過）`, en: `${opName(op, 'en')} Breach Point: a Breach marker on the terrain (parts no more than 1" thick within 1" can be passed through)` }, `side${op.side}`);
    return true;
  }
  if (id === 'nbWeld') {
    const d = nbHatchToWeld(g, op);
    if (!d) return true;
    spend(g, op, id);
    (g.nbWeld ||= {})[d.id] = { by: op.uid };
    log(g, { zh: `${opName(op, 'zh')} 焊死艙門 ${d.component}：其他人開門要多花 1AP`, en: `${opName(op, 'en')} welds hatchway ${d.component} shut: others pay 1 more AP to open it` }, `side${op.side}`);
    return true;
  }
  if (id === 'phComms') { g.phCommsOpen = op.side; return true; } // (the player picks the ploys to swap: phCommsChoose)
  if (id === 'phGuard') {
    spend(g, op, id); op.dwGuard = true;
    log(g, { zh: `${opName(op, 'zh')} 追蹤目標：警戒`, en: `${opName(op, 'en')} Track Target: on Guard` }, `side${op.side}`);
    return true;
  }
  if (id === 'nbOrderSwap') {
    const m = g.navyOrder?.[op.side];
    if (!m) return true;
    spend(g, op, id);
    m.kind = m.kind === 'attack' ? 'defence' : 'attack'; op.acted.nbCmd = true;
    g.ploys[op.side] = g.ploys[op.side].map((p) => (p === 'attackOrder' ? 'defenceOrder' : p === 'defenceOrder' ? 'attackOrder' : p));
    log(g, { zh: `指揮突破：改為${m.kind === 'attack' ? '攻擊' : '防禦'}命令`, en: `Command Breach: now a ${m.kind === 'attack' ? 'Attack' : 'Defence'} Order` }, `side${op.side}`);
    return true;
  }
  return false;
}
/** Lock It Down: this operative counts 1 higher APL for control of the chosen objective until the end of the battle (or the next use). */
export const nbLocked = (g, o, obj) => !!g.nbLock?.[o.side] && g.nbLock[o.side].uid === o.uid && g.nbLock[o.side].id === obj.id;

// ---------- Imperial Navy Breachers ----------
/** The Attack / Defence Order marker for this TP (placed when the ploy is used; moved in the Strategy phase). */
export function placeNavyOrder(g, side, at) {
  const kind = g.ploys[side].includes('attackOrder') ? 'attack' : g.ploys[side].includes('defenceOrder') ? 'defence' : null;
  if (!kind || !at) return;
  (g.navyOrder ||= [null, null])[side] = { kind, x: at.x, y: at.y, tp: g.tp };
}
export const navyOrderNear = (g, op, kind) => {
  const m = g.navyOrder?.[op.side];
  return !!(m && m.tp === g.tp && m.kind === kind && dist(m, op) - radius(op) <= 3);
};
/** Brace for Counterattack: in your territory, or no Charge / Fall Back / Reposition this TP. */
export const braced = (g, op) => hasPloy(g, op.side, 'braceCounter') && (territoryOf(g, op) === op.side || op.bigMoveTP !== g.tp);
