import { CORSAIR_EQUIPMENT } from './data/eldar.js';
export { CORSAIR_EQUIPMENT };
import { tpl, living, foes, edgeDist, visibility, hasPloy, d6, log, opName, radius, applyDamage, isEngaged, getOp, ACTIONS, TARGET_ACTIONS, weaponsFor, shootCheck, resolveShoot, resolveFight, bestMelee, aplNow, doMove } from './game.js';
import { dist } from './geometry.js';
import { moveCtx, findPath, clampPath } from './path.js';
export const isCorsair = (o) => o?.team === 'corsairVoidscarred';
const D3 = () => Math.ceil(d6() / 2);

export const corsairEquip = (g, o, id) => isCorsair(o) && g.equip?.[o.side]?.includes(id);
export function setupCorsair(g, loadouts) {
  for (const o of g.ops.filter(isCorsair)) {
    const choices = tpl(o).loadouts;
    if (choices) { const id = loadouts[o.side]?.[o.tplId] || Object.keys(choices)[0]; if (!choices[id]) throw new Error('Invalid Corsair loadout'); o.loadout = id; }
  }
  for (const s of [0, 1]) if (living(g, s).some((o) => o.tplId === 'cvGunner' && o.loadout === 'blaster') && living(g, s).some((o) => o.tplId === 'cvHeavy' && o.loadout === 'wraith')) throw new Error('Cannot combine blaster and wraithcannon');
}
export function corsairActivate(g, o) {
  if (!isCorsair(o) || o.counter) return;
  o.acted.raiderFree = true;
  if (o.wardShield) o.wardShield = null;
  for (const t of g.ops) if (t.wardShield?.by === o.uid) t.wardShield = null;
}
export function corsairCost(g, o, id) {
  if (!isCorsair(o) || !o.acted?.raiderFree || o.counter || (id === 'dash' && o.plunderTP === g.tp)) return null;
  return id === 'dash' || (tpl(o).veteranRaider && ACTIONS[id]?.ap === 1) ? 0 : null;
}
export function corsairSpend(g, o, id, ap) {
  if (isCorsair(o) && ap === 0 && corsairCost(g, o, id) === 0) o.acted.raiderFree = false;
  if (id === 'shoot' && o.acted?.barrage) { o.acted.barrage.remaining--; o.acted.barrage.used.push(o.acted.nextBarrageWeapon); }
}
export function corsairRules(g, o, w, target, r) {
  if (!isCorsair(o)) return;
  if (['cvRifle', 'cvLongMobile', 'cvLongStill'].includes(w.id) && !['charge', 'fallBack', 'reposition'].some((k) => o.acted?.[k])) r.accurate = Math.max(1, r.accurate || 0);
  if (hasPloy(g, o.side, 'corsairOutcasts') && living(g, o.side).every((x) => x === o || edgeDist(x, o) > 5)) r.punishing = true;
  const contests = (x) => x && [...g.objectives, ...g.markers.filter((m) => m.owner === o.side)].some((m) => dist(x, m) - radius(x) - 0.4 <= 1);
  if (hasPloy(g, o.side, 'piraticalProfiteers') && (contests(o) || contests(target))) r.balanced = true;
  if (o.acted?.contemptuous && !o.acted.contemptUsed) r.relentless = true;
}
export function corsairDefence(g, o, w, r) {
  if (!isCorsair(o)) return;
  if (hasPloy(g, o.side, 'mobileEngagement') && o.movedCorsairTP === g.tp) r.balanced = true;
  if (corsairEquip(g, o, 'diuturnalMantles') && (w.rules.blast || w.rules.torrent)) r.balanced = true;
}
export function corsairStrategy(g, side) {
  const o = living(g, side).find(isCorsair);
  if (o && corsairEquip(g, o, 'starCharts') && !g.starChartsDone?.[side] && g.starChartsTP?.[side] !== g.tp) {
    (g.starChartsTP ||= [0, 0])[side] = g.tp; const roll = D3();
    if (roll > g.tp) { g.cp[side]++; (g.starChartsDone ||= [false, false])[side] = true; }
    log(g, { zh: `星圖：擲 ${roll}${roll > g.tp ? '，+1CP' : '，無效果'}`, en: `Star Charts: ${roll}${roll > g.tp ? ', +1CP' : ', no effect'}` }, `side${side}`);
  }
  const h = living(g, side).find((x) => tpl(x).eruditeHunter);
  if (h && h.hunterMarkTP !== g.tp) {
    h.hunterMarkTP = g.tp; h.hunterMark = foes(g, h).filter((t) => edgeDist(h, t) <= 9).sort((a, b) => edgeDist(h, a) - edgeDist(h, b))[0]?.uid || null;
  }
}
export function corsairShield(g, o) {
  const shield = o.wardShield;
  if (!shield || getOp(g, shield.by)?.dead) return false;
  o.wardShield = null; return true;
}
function psychicTargets(g, o, id, heal = false, other = false) {
  const range = 6 + (corsairEquip(g, o, 'runesGuidance') && g.runesTP?.[o.side] !== g.tp ? 3 : 0);
  return living(g, o.side).filter((t) => isCorsair(t) && (!other || t !== o) && (!heal || t.wounds < t.maxW) && edgeDist(o, t) <= range && (t === o || visibility(g, o, t).visible));
}
export function registerCorsairActions() {
  for (const [id, zh, en] of [['soulChannel', '靈魂引導', 'Soul Channel'], ['soulHeal', '靈魂治癒', 'Soul Heal'], ['wardingShield', '守護護盾', 'Warding Shield'], ['warpFold', '折疊空間', 'Warp Fold'], ['pistolBarrage', '手槍彈幕', 'Pistol Barrage']]) ACTIONS[id] = { ap: 1, name: { zh, en } };
  for (const id of ['soulChannel', 'soulHeal', 'wardingShield']) TARGET_ACTIONS[id] = {
    targets: (g, o) => psychicTargets(g, o, id, id === 'soulHeal', id === 'soulChannel'),
    apply(g, o, t) {
      if (edgeDist(o, t) > 6) (g.runesTP ||= [0, 0])[o.side] = g.tp;
      if (id === 'soulChannel') { t.aplNext = (t.aplNext || 0) + 1; if (g.active === t.uid) t.aplKeep = true; }
      if (id === 'soulHeal') t.wounds = Math.min(t.maxW, t.wounds + D3() + D3());
      if (id === 'wardingShield') { for (const x of g.ops) if (x.wardShield?.by === o.uid) x.wardShield = null; t.wardShield = { by: o.uid }; }
      return { zh: `${ACTIONS[id].name.zh}：${opName(t, 'zh')}`, en: `${ACTIONS[id].name.en}: ${opName(t, 'en')}` };
    },
  };
  TARGET_ACTIONS.warpFold = {
    targets: (g, o) => {
      const first = getOp(g, o.warpFirst);
      return living(g, o.side).filter((t) => isCorsair(t) && t !== first && edgeDist(o, t) <= 5 && (t === o || visibility(g, o, t).visible) && (!first || swapOK(g, first, t)));
    },
    apply(g, o, t) {
      const first = getOp(g, o.warpFirst); o.warpFirst = null;
      const pos = { x: first.x, y: first.y }; first.x = t.x; first.y = t.y; t.x = pos.x; t.y = pos.y;
      if (first.movedCorsairTP === g.tp && t.ready) t.warpMoveLockTP = g.tp;
      if (t.movedCorsairTP === g.tp && first.ready) first.warpMoveLockTP = g.tp;
      return { zh: '折疊空間：交換兩名友方的位置', en: 'Warp Fold: swap two friendly positions' };
    },
  };
}
function swapOK(g, a, b) {
  const ca = moveCtx(g, a), cb = moveCtx(g, b);
  // Temporarily move both out of the way to validate different base sizes.
  const ax = a.x, ay = a.y, bx = b.x, by = b.y;
  a.x = a.y = b.x = b.y = -99;
  const ok = moveCtx(g, a).free({ x: bx, y: by }) && moveCtx(g, b).free({ x: ax, y: ay });
  a.x = ax; a.y = ay; b.x = bx; b.y = by; return ok;
}
export function corsairPlunder(g, side) {
  const n = D3(), os = living(g, side).filter((o) => isCorsair(o) && !isEngaged(g, o));
  for (const o of os.slice(0, n)) {
    const obj = [...g.objectives].sort((a, b) => dist(o, a) - dist(o, b))[0]; if (!obj) continue;
    const ctx = moveCtx(g, o), raw = findPath(ctx, obj); if (!raw) continue;
    const path = clampPath(ctx, raw, 3, (p) => !ctx.inEnemyER(p)); if (!path || !path.len) continue;
    const keep = { acted: o.acted, ap: o.ap }; o.acted = { free: { dash: 'capricious' } }; o.ap = 1;
    doMove(g, o, 'dash', path); o.plunderTP = g.tp; o.acted = keep.acted; o.ap = keep.ap;
  }
}
export function corsairAfterAction(g, actor, move = false) {
  if (g.corsairInterrupt) return;
  g.corsairInterrupt = true;
  try {
    if (move) for (const h of living(g).filter((o) => tpl(o).eruditeHunter && o.hunterMark === actor.uid && o.hunterUsedTP !== g.tp)) {
      h.hunterUsedTP = g.tp;
      const ctx = moveCtx(g, h), raw = findPath(ctx, actor);
      // Choose a legal step toward the marked enemy (automatic Reposition).
      const goal = { x: actor.x + (h.x - actor.x) * 0.25, y: actor.y + (h.y - actor.y) * 0.25 };
      const route = findPath(ctx, goal); if (!route) continue;
      const path = clampPath(ctx, route, 7, (p) => !ctx.inEnemyER(p)); if (!path || dist(path.pts.at(-1), actor) > dist(h, actor)) continue;
      const keep = { acted: h.acted, ap: h.ap }; h.acted = {}; h.ap = 1; doMove(g, h, 'reposition', path); h.acted = keep.acted; h.ap = keep.ap;
    }
    for (const f of living(g).filter((o) => tpl(o).oneStepAhead && o.side !== actor.side && o.ready && !o.oneStepUsed && !o.dead)) {
      if (actor.dead) continue;
      const shot = weaponsFor(g, f).find((w) => w.type === 'ranged' && shootCheck(g, { ...f, ap: 1, acted: {} }, actor, w).ok);
      const fight = edgeDist(f, actor) <= 1;
      if (!shot && !fight) continue;
      f.oneStepUsed = true; const roll = d6();
      log(g, { zh: `先行一步：擲 ${roll}`, en: `One Step Ahead: rolled ${roll}` }, `side${f.side}`);
      if (roll <= aplNow(g, actor)) continue;
      const keep = { acted: f.acted, ap: f.ap, fight: g.fight, active: g.active, ffAtk: g.ffAtk, ffPending: g.ffPending };
      f.acted = { free: { shoot: 'any', fight: 'any' } }; f.ap = 1; g.ffPending = null;
      if (fight) resolveFight(g, f, bestMelee(f), actor); else resolveShoot(g, f, shot, actor);
      f.acted = keep.acted; f.ap = keep.ap; g.fight = keep.fight; g.active = keep.active; g.ffAtk = keep.ffAtk; g.ffPending = keep.ffPending;
      f.aplNext = (f.aplNext || 0) - 1;
    }
  } finally { g.corsairInterrupt = false; }
}
export function slicingAttack(g, o, before, path) {
  if (!tpl(o).slicingAttack || !o.blinkOn) return;
  const end = path.pts.at(-1), start = path.pts[0], dx = end.x - start.x, dy = end.y - start.y;
  const ts = before.map((uid) => getOp(g, uid)).filter((t) => !t.dead && t.side !== o.side);
  const hit = ts.find((t) => {
    const k = Math.max(0, Math.min(1, ((t.x - start.x) * dx + (t.y - start.y) * dy) / (dx * dx + dy * dy || 1)));
    return dist(t, { x: start.x + k * dx, y: start.y + k * dy }) <= radius(t) + 0.02;
  });
  if (hit) applyDamage(g, o, hit, D3() + 2);
}
