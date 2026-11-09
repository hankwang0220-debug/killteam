// wyrmblade: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CHOICES, CONTROL, abilityArmed, actionCost, avgDmg, changeApl, doMove, forcedShot, shootCheck, weaponsFor, activeOp, applyDamage, boardOf, checkMines, deployZones, edgeDist, foes, getOp, isEngaged, living, log, opName, radius, spend, tpl, visibility } from '../game.js';
import { dist, distPointRect } from '../geometry.js';
import { findPath, moveCtx, wholeInchPath } from '../path.js';
import { bestStep, stepTo } from '../sanctifiers.js';


// ---------- Wyrmblade ----------
export const isWB = (op) => op?.team === 'wyrmblade';
export const wbEquip = (g, op, id) => !!op && op.side < 2 && isWB(op) && !!g.equip?.[op.side]?.includes(id);
export const WB_CHARGE = { id: 'wbCharge', name: { zh: '爆破炸藥', en: 'Blasting charge' }, type: 'ranged', atk: 4, hit: 4, dmg: [3, 5], rules: { range: 4, blast: 1, saturate: true }, group: 'wbCharge' };
export const WB_KNIFE = { id: 'wbKnife', name: { zh: '教派短刀', en: 'Cult knife' }, type: 'melee', atk: 3, hit: 4, dmg: [3, 4], rules: {}, group: 'wbKnife' };
/** Blasting Charges (once per turning point for the team) and Cult Knives: Neophytes' extra weapons. */
export function wbWeapons(g, op, ws) {
  if (!isWB(op) || !tpl(op).neophyte) return ws;
  if (wbEquip(g, op, 'wbKnives')) ws = [...ws, WB_KNIFE];
  if (wbEquip(g, op, 'wbCharges') && g.wbChargeTP?.[op.side] !== g.tp) ws = [...ws, WB_CHARGE];
  return ws;
}
/** Spotlights: the target can't be obscured if a friendly Neophyte not within enemy control range can see it within 6". */
export const wbSpotlight = (g, op, target) => wbEquip(g, op, 'wbSpotlights') && !!target
  && living(g, op.side).some((n) => isWB(n) && tpl(n).neophyte && n.x > -50 && !isEngaged(g, n) && edgeDist(n, target) <= 6 && visibility(g, n, target).visible);
/** Familiar's Soulsight: the enemy holding this side's Soulsight token. */
export const wbSoulOn = (g, op, target) => !!target && isWB(op) && g.wbSoul?.[op.side] === target.uid;
/** Shadow Vector (Neophyte Leader): Slink into Darkness or Coiled Serpent for 0CP once per turning point, for a Neophyte it can see. */
export function wbShadowFree(g, side, id) {
  if (!['slink', 'coiledSerpent'].includes(id) || g.teams[side] !== 'wyrmblade' || g.wbShadowTP?.[side] === g.tp) return false;
  const op = g.ffSpec || activeOp(g), l = living(g, side).find((o) => tpl(o).wbLeader && o.x > -50);
  return !!op && !!l && op.side === side && isWB(op) && !!tpl(op).neophyte && (op === l || visibility(g, l, op).visible);
}
/** Overthrow the Oppressors (Icon Bearer, once per TP): a ready Neophyte falling within 6" of it uses A Plan Generations in the Making for 0CP. */
export function wbOverthrow(g, target) {
  if (!isWB(target) || !tpl(target).neophyte || !(target.readyAtDeath ?? target.ready) || g.wbOverthrowTP?.[target.side] === g.tp) return false; // (ready when it fell)
  return living(g, target.side).some((i) => i !== target && tpl(i).overthrow && i.x > -50 && edgeDist(i, target) <= 6 && visibility(g, i, target).visible);
}
/** Familiar Territory: up to a third of the kill team (not Cult Agents) set up in hiding. */
export const wbHideCap = (g, side) => Math.floor(g.ops.filter((o) => o.side === side && isWB(o)).length / 3);
export function wbCanHide(g, op) {
  const d = g.dep;
  return isWB(op) && op.side < 2 && !tpl(op).cultAgent && op.placed === false && !!d && !d.done && g.phase === 'deploy' && d.turn === op.side
    && d.batch.length < d.need && g.ops.filter((o) => o.side === op.side && o.wbHidden).length < wbHideCap(g, op.side);
}
export function wbHide(g, op) {
  if (!wbCanHide(g, op)) return false;
  Object.assign(op, { wbHidden: true, reserve: true, placed: true, x: -99, y: -99 });
  g.dep.batch.push(op.uid);
  log(g, { zh: `${opName(op, 'zh')} 躲藏起來（熟悉的地盤）`, en: `${opName(op, 'en')} is set up in hiding (Familiar Territory)` }, `side${op.side}`);
  return true;
}
/** Emerging from hiding: wholly within 6" of your drop zone, more than 6" from enemy operatives, somewhere it can be placed. */
export function wbEmergeCheck(g, op, p) {
  const z = deployZones(g)[op.side], b = boardOf(g), r = radius(op);
  const rect = { x: z.x0 ?? 0, y: z.y0 ?? 0, w: (z.x1 ?? b.w) - (z.x0 ?? 0), h: (z.y1 ?? b.h) - (z.y0 ?? 0) };
  if (distPointRect(p, rect) + r > 6 + 0.01) return { ok: false, why: { zh: '要完全在己方降落區 6" 內', en: 'Must be wholly within 6" of your drop zone' } };
  if (foes(g, op).some((e) => e.x > -50 && dist(p, e) - r - radius(e) <= 6)) return { ok: false, why: { zh: '要離敵人超過 6"', en: 'Must be more than 6" from enemy operatives' } };
  const was = { x: op.x, y: op.y }; op.x = p.x; op.y = p.y;
  const free = moveCtx(g, op).free(p); op.x = was.x; op.y = was.y;
  if (!free) return { ok: false, why: { zh: '底盤放不下', en: 'The base does not fit there' } };
  if (op.ap < actionCost(g, op, 'reposition')) return { ok: false, why: { zh: 'AP 不足', en: 'Not enough AP' } };
  return { ok: true };
}
export function wbEmerge(g, op, p) {
  if (!op.wbHidden || !wbEmergeCheck(g, op, p).ok) return false;
  spend(g, op, 'reposition'); // (treated as a Reposition)
  Object.assign(op, { x: p.x, y: p.y, wbHidden: false, reserve: false });
  op.orderSet = true;
  log(g, { zh: `${opName(op, 'zh')} 從藏身處現身（視為轉移）`, en: `${opName(op, 'en')} emerges from hiding (a Reposition)` }, `side${op.side}`);
  checkMines(g, op);
  return true;
}
/** The computer: emerge as close to an objective (or the enemy) as the rules allow, else stay hidden. */
export function wbAiEmerge(g, op) {
  const goal = (g.objectives || [])[0] || { x: boardOf(g).w / 2, y: boardOf(g).h / 2 };
  let best = null;
  for (let x = 1; x < boardOf(g).w; x += 1) for (let y = 1; y < boardOf(g).h; y += 1) {
    const p = { x, y };
    if (!wbEmergeCheck(g, op, p).ok) continue;
    const d = Math.min(...(g.objectives || [goal]).map((o) => dist(o, p)));
    if (!best || d < best.d) best = { p, d };
  }
  return !!best && wbEmerge(g, op, best.p);
}
/** End of the second turning point: anyone still hiding is incapacitated. */
export function wbHiddenEnd(g) {
  if (g.tp !== 2) return;
  for (const o of g.ops.filter((x) => x.wbHidden && !x.dead)) {
    o.wbHidden = false; o.reserve = false;
    log(g, { zh: `${opName(o, 'zh')} 一直沒有現身，殘廢`, en: `${opName(o, 'en')} never emerged and is incapacitated` }, `side${o.side}`);
    applyDamage(g, null, o, o.wounds);
  }
}
/** Wyrmblade self actions: Target Vulnerability (Sanctus Sniper). */
export function wbSelf(g, op, id) {
  if (id === 'wbAssassinate') { // (the free Charge and Fight are the Stealth Attack ones: up to its Move, then an extra strike)
    spend(g, op, id); op.acted.free = { ...(op.acted.free || {}), charge: 'stealth', fight: 'stealth' };
    log(g, { zh: `${opName(op, 'zh')} 刺殺：免費衝鋒（不超過移動值）後免費近戰，第一次打擊後可再追加一次打擊`, en: `${opName(op, 'en')} Assassinate: a free Charge (up to its Move) then a free Fight; its first strike is followed by another` }, `side${op.side}`);
    return true;
  }
  if (id !== 'wbVuln') return false;
  spend(g, op, id); op.acted.wbVuln = true;
  log(g, { zh: `${opName(op, 'zh')} 鎖定弱點：這次啟動定點狙擊「致命 5+」`, en: `${opName(op, 'en')} Target Vulnerability: the stationary profile has Lethal 5+ this activation` }, `side${op.side}`);
  return true;
}
/** Divert and Disappear (strategy ploy): up to three friendlies make a free Dash (a Cult Agent counts as two). */
export function registerWyrmbladeChoices() {
  // (Blooded) A Name Whispered in Blood: the Sharpshooter's chosen enemy for the battle.
  CHOICES.blName = {
    kind: 'op', title: { zh: '血中低語之名：選一名敵人（神射手射擊它時視為持有血祭標記且受諸神注視）', en: 'A Name Whispered in Blood: pick an enemy (the Sharpshooter shoots it as if it had a Blooded token and the Gaze of the Gods)' },
    options: (g, side) => living(g, 1 - side).filter((e) => e.side < 2).map((e) => ({ value: e.uid })),
    auto: (g, side) => living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => b.maxW - a.maxW || tpl(b).apl - tpl(a).apl)[0]?.uid ?? null,
    apply(g, side, uid) { (g.blName ||= [null, null])[side] = uid; log(g, { zh: `血中低語之名：${opName(getOp(g, uid), 'zh')}`, en: `A Name Whispered in Blood: ${opName(getOp(g, uid), 'en')}` }, `side${side}`); },
  };
  // (an engaged Cult Agent can only Fall Back; a Charge needs an Engage order)
  const divertKinds = (g, o) => (isEngaged(g, o) ? (tpl(o).cultAgent ? ['fallBack'] : []) : o.order === 'engage' ? ['dash', 'charge'] : ['dash']);
  const movers = (g, side, ctx) => living(g, side).filter((o) => isWB(o) && o.x > -50 && !o.wbHidden && divertKinds(g, o).length && (ctx.done?.length || 0) + (tpl(o).cultAgent ? 2 : 1) <= 3);
  CHOICES.wbDivert = {
    kind: 'move', title: { zh: '轉移與消失：最多三名友方免費衝刺或衝鋒（最多 3"；教派特工算兩名，被牽制時可改為撤退 3"、下次啟動 APL -1）', en: 'Divert and Disappear: up to three friendlies make a free Dash or Charge (3" at most; a Cult Agent counts as two, and engaged it can Fall Back 3" instead, -1 APL until the end of its next activation)' },
    movers, moveKind: (g, o) => divertKinds(g, o)[0] || 'dash', kinds: (g, o) => divertKinds(g, o), max: () => 3,
    after: (g, side, o, ctx, kind) => {
      if (tpl(o).cultAgent) ctx.done.push(`${o.uid}#2`);
      if (kind === 'charge') o.order = 'engage';
      if (kind === 'fallBack') changeApl(g, o, -1);
    },
    autoAll(g, side, ctx) {
      const objs = g.objectives || [];
      for (const o of movers(g, side, ctx).filter((x) => !tpl(x).cultAgent && objs.length && !objs.some((m) => dist(m, x) <= 2)).slice(0, 3)) {
        const near = (p) => Math.min(...objs.map((m) => dist(m, p)));
        const q = bestStep(g, o, 3, 'dash', (p) => (near(p) < near(o) ? -near(p) : null));
        if (q) { stepTo(g, o, q); ctx.done.push(o.uid); log(g, { zh: `轉移與消失：${opName(o, 'zh')} 免費衝刺`, en: `Divert and Disappear: ${opName(o, 'en')} makes a free Dash` }, `side${side}`); }
      }
    },
  };
}

/** Quicksilver Strike (Locus, once per turning point): after an enemy action in which it moved, interrupt with a free Charge of up to 3"
 * (it can change to Engage) ending within that enemy's control range. A player is asked (or passes: then it isn't used); the computer
 * charges whenever it can reach. If the Charge can't be made the interruption is cancelled and the rule isn't used. */
export function wbQuicksilver(g, enemy) {
  if (g.phase !== 'firefight' || !enemy || enemy.dead || enemy.side > 1 || g.netcounter || g.dwInterrupt || g.wbQuickNow) return;
  if (g.active !== enemy.uid || enemy.x < -50) return;
  const side = 1 - enemy.side;
  const locus = living(g, side).find((o) => tpl(o).quicksilverStrike && o.wbQuickTP !== g.tp && o.x > -50 && !isEngaged(g, o) && edgeDist(o, enemy) <= 3 + CONTROL + 0.01);
  if (!locus || !wbQuickPath(g, locus, enemy)) return;
  if (g.pick?.[side]) {
    g.netcounter = { side, only: [locus.uid], resume: enemy.uid, resumeCounter: !!g.counter, kind: 'control', onlyActions: ['charge'], ctlMove: 3, wbQuick: enemy.uid,
      label: { title: { zh: '快銀突擊（基因護衛）', en: 'Quicksilver Strike (Locus)' }, hint: { zh: `${opName(enemy, 'zh')} 剛移動完：基因護衛可以打斷，免費衝鋒最多 3"（改為交戰指令），結束在牠的控制範圍內；也可以略過。`, en: `${opName(enemy, 'en')} has just moved: the Locus can interrupt with a free Charge of up to 3" (now on Engage), ending within its control range; or pass.` } } };
    g.active = null; g.counter = true; g.turn = side;
    return;
  }
  const path = wbQuickPath(g, locus, enemy);
  const keep = { ap: locus.ap, acted: locus.acted, order: locus.order, counter: locus.counter, ctlMove: locus.ctlMove, active: g.active };
  locus.ap = 1; locus.acted = { free: { charge: 'quicksilver' } }; locus.order = 'engage'; locus.counter = true; locus.ctlMove = 3; locus.wbChargeAt = enemy.uid; g.active = locus.uid;
  g.wbQuickNow = true;
  try {
    if (doMove(g, locus, 'charge', path)) {
      locus.wbQuickTP = g.tp; keep.order = 'engage';
      log(g, { zh: `快銀突擊：${opName(locus, 'zh')} 打斷，衝向 ${opName(enemy, 'zh')}`, en: `Quicksilver Strike: ${opName(locus, 'en')} interrupts and charges ${opName(enemy, 'en')}` }, `side${side}`);
    }
  } finally { Object.assign(locus, { ap: keep.ap, acted: keep.acted, order: keep.order, counter: keep.counter, ctlMove: keep.ctlMove, wbChargeAt: null }); g.active = keep.active; g.wbQuickNow = false; }
}
/** A Charge of up to 3" ending within that enemy's control range (null if there's none). */
export function wbQuickPath(g, locus, enemy) {
  const keep = { order: locus.order }; locus.order = 'engage';
  try {
    const ctx = moveCtx(g, locus, 'charge'), r = radius(locus) + radius(enemy) + CONTROL * 0.6;
    for (let i = 0; i < 16; i++) {
      const a = Math.atan2(locus.y - enemy.y, locus.x - enemy.x) + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * Math.PI / 8;
      const p = { x: enemy.x + Math.cos(a) * r, y: enemy.y + Math.sin(a) * r };
      const raw = findPath(ctx, p), path = raw && wholeInchPath(ctx, raw, 3, ctx.inEnemyER);
      const end = path?.pts.at(-1);
      if (end && edgeDist({ ...locus, x: end.x, y: end.y }, enemy) <= CONTROL + 0.01) return path;
    }
    return null;
  } finally { locus.order = keep.order; }
}
/** Overthrow the Oppressors (Icon Bearer, once per TP): when A Plan Generations in the Making wasn't made free by it, a ready Neophyte
 * falling within 6" of it shoots once for free before it's removed (its order can change to do so). Automatic, switchable. */
export function wbOverthrowShot(g, target) {
  if (!isWB(target) || !abilityArmed(g, target.side, 'overthrow')) return;
  const was = target.dead, keep = { order: target.order, ap: target.ap, acted: target.acted };
  target.dead = false; // (still in the killzone for this)
  try {
    if (!wbOverthrow(g, target)) return;
    target.order = 'engage'; target.ap = 1; target.acted = { free: { shoot: 'any' } };
    const best = weaponsFor(g, target).filter((w) => w.type === 'ranged').flatMap((w) => foes(g, target).filter((e) => e.side < 2 && e.x > -50 && shootCheck(g, target, e, w).ok).map((e) => ({ w, e, v: avgDmg(w) / Math.max(1, e.wounds) })))
      .sort((a, b) => b.v - a.v)[0];
    if (!best) return;
    (g.wbOverthrowTP ||= [0, 0])[target.side] = g.tp;
    log(g, { zh: `推翻壓迫者：${opName(target, 'zh')} 倒下前免費射擊 ${opName(best.e, 'zh')}`, en: `Overthrow the Oppressors: ${opName(target, 'en')} shoots ${opName(best.e, 'en')} for free before it's removed` }, `side${target.side}`);
    forcedShot(g, target, best.w, [best.e], true);
  } finally { target.dead = was; Object.assign(target, keep); }
}
