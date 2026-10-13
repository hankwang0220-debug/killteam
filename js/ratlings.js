// Ratlings (萊特林) rules engine: Scarper, Early Warning, Evade, Slingshot, Tripwire, Target Designation, the ploys and the
// faction equipment. game.js calls these hooks; the team data is in data/ratlings.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { ACTIONS, TARGET_ACTIONS, BOARD, CONTROL, OBJ_R, applyDamage, availableActions, carriables, changeApl, checkMines, clearSpot, controller, d3, edgeDist, engagedEnemies, foes, getOp, hasPloy, hasReady, isEngaged, living, log, opName, ownPoint, radius, spend, team, tpl, territoryOf, visibility } from './game.js';
import { dist, distPointRect } from './geometry.js';
import { flatSight } from './sight.js';
import { moveCtx, wholeInchPath } from './path.js';
import { scTrapCheck } from './scouts.js';
import { RATLINGS_TEAM, ratlingsRosterError, ratFreeCount, cleanRatFree, DEFAULT_RAT_FREE } from './data/ratlings.js';

export function isRat(o) { return o?.team === 'ratlings'; }
/** A RATLING that isn't an Ogryn or Bullgryn. */
export function isSmall(o) { return isRat(o) && !tpl(o).rtBig; }
/** A "rifle": a ranged weapon with "rifle" in its name. */
export function isRifle(w) { return !!w && w.type === 'ranged' && /rifle/i.test(w.name?.en || ''); }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }

// ---------- setup ----------
export function rtSetup(g, roster, ratFree = []) {
  g.ratFree = [[], []]; g.rtTarget = [null, null]; g.rtUsed = [{}, {}];
  for (const side of [0, 1]) if (g.teams[side] === 'ratlings') {
    const error = ratlingsRosterError(RATLINGS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
    g.ratFree[side] = cleanRatFree(ratFree[side] ?? DEFAULT_RAT_FREE, ratFreeCount(RATLINGS_TEAM, roster[side]));
  }
}
/** A ploy chosen to cost 0CP for the battle. */
export function rtFree(g, side, id) { return !!g.ratFree?.[side]?.includes(id); }
/** Tripwire (Bomber): up to two markers, set up with the team's equipment (wholly in its territory, more than 2" from other markers). */
export function rtTripwires(g, side) {
  if (g.teams[side] !== 'ratlings' || !living(g, side).some((o) => tpl(o).rtBomber)) return;
  for (const c of [0.3, 0.7]) {
    g.markers.push({ id: g.markers.length, kind: 'tripwire', owner: side, ...clearSpot(g, ownPoint(g, side, 12, c)), carriedBy: null });
  }
}
/** Stolen Goods (equipment): at the end of the Select Operatives step, D3: 1 you lose 1CP, 2 you gain 1CP, 3 your opponent loses 1CP. */
export function rtStolen(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'ratlings' && equip(g, side, 'rtStolen')) {
    const r = d3();
    if (r === 1) g.cp[side] = Math.max(0, g.cp[side] - 1); else if (r === 2) g.cp[side]++; else g.cp[1 - side] = Math.max(0, g.cp[1 - side] - 1);
    note(g, side, `贓物：擲 ${r}，${r === 1 ? '你失去 1CP' : r === 2 ? '你獲得 1CP' : '對手失去 1CP'}`, `Stolen Goods: rolled ${r} — ${r === 1 ? 'you lose 1CP' : r === 2 ? 'you gain 1CP' : 'your opponent loses 1CP'}`);
  }
}

// ---------- mines (Bomber) ----------
/** Mine: a team with a Bomber inflicts 2D3+3 instead, and its small Ratlings are ignored by its mines. */
export function rtMine(g, m, op) {
  const bomber = g.teams[m.owner] === 'ratlings' && living(g, m.owner).some((o) => tpl(o).rtBomber);
  if (!bomber) return { skip: false, dmg: null };
  return { skip: op.side === m.owner && isSmall(op), dmg: d3() + d3() + 3 };
}

// ---------- weapon rules ----------
function rtHeavyNear(g, op) { return g.terrain.some((t) => t.kind === 'heavy' && distPointRect(op, t) - radius(op) <= 1.01); }
function noEnemyWithin(g, op, r) { return !foes(g, op).some((e) => edgeDist(op, e) <= r); }
/** Sniper Positions: the stationary profile of its rifle has Silent. */
export function rtSilent(g, op, w) {
  return isRat(op) && hasPloy(g, op.side, 'rtSniperPos') && isRifle(w) && !!w.rules.rtStationary && noEnemyWithin(g, op, 6) && rtHeavyNear(g, op);
}
export function rtRules(g, op, weapon, target, r) {
  if (!isRat(op)) {
    return;
  }
  const side = op.side;
  if (target && isRifle(weapon)) {
    const t = g.rtTarget?.[side];
    if (t && t.tp === g.tp && t.uid === target.uid) r.lethal = Math.min(r.lethal || 6, 5); // Target Designation
    if (hasPloy(g, side, 'rtCrack') && edgeDist(op, target) > 6 && (op.counter || !(op.acted.charge || op.acted.fallBack || op.acted.reposition))) r.balanced = true; // Crack Shots
  }
  if (rtSilent(g, op, weapon)) r.silent = true;
  if (tpl(op).rtBig && hasPloy(g, side, 'rtFrontline')
    && (territoryOf(g, op) === 1 - side || (g.objectives || []).some((o) => dist(op, o) - radius(op) - OBJ_R <= 3))) r.balanced = true; // Frontline Assault
  if (weapon.id === 'rtKnife' && op.acted.rtHunt) { r.atkPlus = 1; r.brutal = true; } // Hunter: a Charge made with a Conceal order
  if (op.optics && weapon.rules.opticsLethal) r.lethal = Math.min(r.lethal || 6, 5); // Sneak: Optics
}
/** Shifty: a friendly small Ratling with a Conceal order and in cover can't be selected as a valid target (unless within 2"). */
export function rtShifty(g, target) { return isSmall(target) && hasPloy(g, target.side, 'rtShifty'); }

/**
 * Purloined Rations and Lucky Round (equipment, once per turning point each): after the attack dice of a rifle are rolled — used
 * automatically when they help (a miss that the improved Hit would turn into a success; no critical success but a normal one).
 */
export function rtEquipRoll(g, op, weapon, pool, retally) {
  if (!isRat(op) || !isRifle(weapon) || op.side > 1 || !pool) return;
  const used = (g.rtUsed ||= [{}, {}])[op.side];
  if (equip(g, op.side, 'rtRations') && used.rations !== g.tp && pool.success > 2
    && pool.dice.some((d) => !d.auto && d.res === 'miss' && d.v === pool.success - 1)) {
    used.rations = g.tp; pool.success--; retally(pool);
    note(g, op.side, `偷來的口糧：${opName(op, 'zh')} 步槍命中值改善 1`, `Purloined Rations: ${opName(op, 'en')}'s rifle Hit improves by 1`);
  }
  if (equip(g, op.side, 'rtLucky') && used.lucky !== g.tp && pool.crits === 0 && pool.norms > 0 && !pool.rules.severe) {
    used.lucky = g.tp; pool.rules.severe = true; retally(pool);
    note(g, op.side, `幸運子彈：${opName(op, 'zh')} 步槍獲得「嚴重」`, `Lucky Round: ${opName(op, 'en')}'s rifle has Severe`);
  }
}
/** Improvised Armour: shooting a friendly Ogryn or Bullgryn, defence dice of 5+ are critical successes. */
export function rtArmour(g, target) { return isRat(target) && !!tpl(target).rtBig && equip(g, target.side, 'rtArmour'); }
/**
 * Survival Instincts: a normal success can block one critical success, a critical success two successes (normal or critical).
 * Same return as bestBlock: {dmg, remC, remN}.
 */
export function rtBlockSI(ac, an, sc, sn, dn, dc) {
  const slots = sn + 2 * sc;
  const blockC = Math.min(ac, slots), blockN = Math.min(an, slots - blockC);
  const remC = ac - blockC, remN = an - blockN;
  return { dmg: remC * dc + remN * dn, remC, remN };
}

// ---------- strategic gambit: Target Designation (Fixer) ----------
export function rtGambitLeft(g, side) {
  return g.teams[side] === 'ratlings' && g.phase === 'strategy' && living(g, side).some((o) => tpl(o).rtFixer) && g.rtTarget?.[side]?.tp !== g.tp;
}
export function rtDesignate(g, side, uid) {
  const e = getOp(g, uid);
  if (!rtGambitLeft(g, side) || !e || e.dead || e.side === side) return false;
  g.rtTarget[side] = { uid, tp: g.tp };
  note(g, side, `指定目標：${opName(e, 'zh')}（本回合萊特林用步槍射擊它時「致命 5+」）`, `Target Designation: ${opName(e, 'en')} (this TP RATLING rifles shooting it have Lethal 5+)`);
  return true;
}
export function rtAiStrategy(g, side) {
  if (!rtGambitLeft(g, side)) return;
  const t = foes(g, { side }).filter((e) => e.side < 2 && !tpl(e).expendable).sort((a, b) => b.wounds - a.wounds)[0];
  if (t) rtDesignate(g, side, t.uid);
}

// ---------- free moves out of turn: Scarper, Early Warning, Evade ----------
/** The best free Dash of up to maxLen" for this operative: {q, score} or null. endOk(p): the rule's end-of-move restriction. */
function bestFreeDash(g, o, maxLen, endOk, minScore) {
  const ctx = moveCtx(g, o, 'dash'), en = foes(g, o), objs = g.objectives || [];
  const seenAt = (p) => en.filter((e) => visibility(g, e, { ...o, x: p.x, y: p.y }).visible).length;
  const nearest = (p) => Math.min(99, ...en.map((e) => edgeDist({ ...o, x: p.x, y: p.y }, e)));
  const objGain = (p) => objs.filter((m) => dist(p, m) - radius(o) - OBJ_R <= CONTROL + 0.01 && controller(g, m) !== o.side).length;
  const seen0 = seenAt(o), near0 = nearest(o), obj0 = objGain(o), eng0 = isEngaged(g, o) ? 2 : 0;
  let best = null;
  for (const f of [1, 0.66, 0.33]) for (let a = 0; a < 16; a++) {
    const p = { x: o.x + Math.cos(a * Math.PI / 8) * maxLen * f, y: o.y + Math.sin(a * Math.PI / 8) * maxLen * f };
    if (!ctx.free(p) || ctx.inEnemyER(p) || !ctx.segFree(o, p) || ctx.climbs?.([o, p])) continue;
    const path = wholeInchPath(ctx, { pts: [{ x: o.x, y: o.y }, p] }, maxLen, (q) => !ctx.inEnemyER(q));
    if (!path) continue;
    const q = path.pts.at(-1), seen = seenAt(q);
    if (!endOk(q, seen)) continue;
    const score = (seen0 - seen) * 3 + eng0 + (objGain(q) - obj0) * 1.5 + (nearest(q) - near0) * 0.05;
    if (!best || score > best.score) best = { q, score };
  }
  return best && best.score >= minScore ? best : null;
}
function freeMove(g, o, q) {
  Object.assign(o, { x: q.x, y: q.y });
  for (const m of carriables(g)) if (m.carriedBy === o.uid) { m.x = q.x; m.y = q.y; }
  checkMines(g, o);
  scTrapCheck(g, o); // Tripwire / Booby Trap markers
}
/** Scarper: after each enemy activation, before the next one, one small Ratling (not a Sneak) makes a free Dash when it helps. */
export function rtScarper(g, side) {
  if (g.teams[side] !== 'ratlings' || g.phase !== 'firefight' || !(hasReady(g, 0) || hasReady(g, 1))) return;
  let best = null;
  for (const o of living(g, side).filter((x) => isSmall(x) && !tpl(x).rtSneak && x.scarperTP !== g.tp && !isEngaged(g, x))) {
    const r = bestFreeDash(g, o, 3, (p, seen) => !(seen > 0 && Math.min(...foes(g, o).map((e) => edgeDist({ ...o, x: p.x, y: p.y }, e))) <= 3), 1);
    if (r && (!best || r.score > best.score)) best = { o, ...r };
  }
  if (!best) return;
  best.o.scarperTP = g.tp;
  freeMove(g, best.o, best.q);
  note(g, side, `逃跑：${opName(best.o, 'zh')} 免費衝刺`, `Scarper: ${opName(best.o, 'en')} makes a free Dash`);
}
/**
 * After an enemy operative's action: the Battlemutt's Early Warning (moves and set-ups only) lets Ratlings near both of them dash or
 * fall back (3" at most), and the Sneak's Evade (once per turning point) a free Dash.
 */
export function rtAfterEnemyAction(g, enemy, moved) {
  if (enemy.dead || enemy.side > 1) return;
  const side = 1 - enemy.side;
  if (g.teams[side] !== 'ratlings' || g.phase !== 'firefight') return;
  const mutt = moved ? living(g, side).find((o) => tpl(o).rtMutt && o.ewTP !== g.tp) : null;
  if (mutt) {
    let any = false;
    for (const o of living(g, side).filter((x) => isSmall(x) && edgeDist(x, mutt) <= 6 && edgeDist(x, enemy) <= 2)) {
      const r = bestFreeDash(g, o, 3, (p, seen) => !(seen > 0 && Math.min(...foes(g, o).map((e) => edgeDist({ ...o, x: p.x, y: p.y }, e))) <= 2), 0.8);
      if (!r) continue;
      const wasEngaged = isEngaged(g, o);
      freeMove(g, o, r.q); any = true;
      note(g, side, `預警：${opName(o, 'zh')} 免費${wasEngaged ? '撤退' : '衝刺'}（最多 3"）`, `Early Warning: ${opName(o, 'en')} makes a free ${wasEngaged ? 'Fall Back' : 'Dash'} (3" at most)`);
    }
    if (any) mutt.ewTP = g.tp;
  }
  const sneak = living(g, side).find((o) => tpl(o).rtSneak && o.evadeTP !== g.tp && !isEngaged(g, o));
  if (sneak) {
    const r = bestFreeDash(g, sneak, 3, () => true, 1);
    if (r) { sneak.evadeTP = g.tp; freeMove(g, sneak, r.q); note(g, side, `閃避：${opName(sneak, 'zh')} 免費衝刺`, `Evade: ${opName(sneak, 'en')} makes a free Dash`); }
  }
}

// ---------- own moves and fights ----------
/** After a Ratling moves: Hunter (a Charge with a Conceal order), Ogryn Bayonet Charge. */
export function rtMoved(g, op, kind, concealed) {
  if (!isRat(op) || kind !== 'charge' || op.dead) return;
  if (tpl(op).rtHunter && concealed) op.acted.rtHunt = true;
  if (tpl(op).bayonetCharge) {
    const e = engagedEnemies(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) { const dmg = d3() + 1; note(g, op.side, `刺刀衝鋒：${opName(e, 'zh')} 受到 ${dmg} 傷害`, `Bayonet Charge: ${opName(e, 'en')} takes ${dmg} damage`); applyDamage(g, op, e, dmg); }
  }
}
/** Lie in Wait (Hardbit): retaliating with Light or Heavy terrain in its control range, its side resolves the first attack dice. */
export function rtLieInWait(g, target) {
  return isRat(target) && !!tpl(target).rtHunter && g.terrain.some((t) => (t.kind === 'heavy' || t.kind === 'light') && distPointRect(target, t) - radius(target) <= CONTROL + 0.01);
}
/** Bookkeeping after a Shoot (Shoot and Hide needs to know a rifle was used). */
export function rtShot(g, op, weapon) { if (isRat(op)) op.acted.rtRifleShot = isRifle(weapon); }

// ---------- Slingshot (Raider) ----------
function clampTo(r, p) { return { x: Math.max(r.x, Math.min(r.x + r.w, p.x)), y: Math.max(r.y, Math.min(r.y + r.h, p.y)) }; }
/** A terrain point for a Slingshot: visible to and within 6" of the operative, and the destination wholly within 6" of it and sees it. */
function slingshotPoint(g, op, p) {
  const r0 = radius(op);
  for (const t of g.terrain.filter((x) => x.kind === 'heavy' || x.kind === 'light')) {
    const others = g.terrain.filter((x) => x !== t);
    const mid = { x: (op.x + p.x) / 2, y: (op.y + p.y) / 2 };
    for (const c of [clampTo(t, op), clampTo(t, p), clampTo(t, mid), { x: t.x + t.w / 2, y: t.y + t.h / 2 }]) {
      if (dist(op, c) - r0 > 6 || dist(p, c) + r0 > 6) continue;
      if (!flatSight(others, op, c, r0, 0, {}).visible || !flatSight(others, { ...op, x: p.x, y: p.y }, c, r0, 0, {}).visible) continue;
      return c;
    }
  }
  return null;
}
export function slingshotCheck(g, op, p) {
  const a = availableActions(g, op).find((x) => x.id === 'rtSlingshot');
  if (!a?.ok) return { ok: false, why: a?.why || { zh: '目前不能使用彈弓', en: 'Slingshot unavailable' } };
  const ctx = moveCtx(g, op, 'reposition');
  if (!ctx.free(p)) return { ok: false, why: { zh: '底盤放不下', en: 'The base doesn\'t fit there' } };
  if (ctx.inEnemyER(p)) return { ok: false, why: { zh: '不能在敵人控制範圍內', en: 'Not within an enemy\'s control range' } };
  const q = slingshotPoint(g, op, p);
  if (!q) return { ok: false, why: { zh: '要有一個看得到、6" 內的地形點，且落點完全在它 6" 內並看得到它', en: 'Needs a terrain point visible to it within 6", with the destination wholly within 6" of the point and seeing it' } };
  return { ok: true, q };
}
export function doSlingshot(g, op, p) {
  const c = slingshotCheck(g, op, p);
  if (!c.ok) return false;
  const from = { x: op.x, y: op.y };
  spend(g, op, 'reposition', 1); // treated as a Reposition action
  op.acted.rtSlingshot = 1;
  op.acted.movedDist = (op.acted.movedDist || 0) + dist(from, p);
  Object.assign(op, { x: p.x, y: p.y });
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.x = p.x; m.y = p.y; }
  note(g, op.side, `${opName(op, 'zh')} 用彈弓飛到新位置`, `${opName(op, 'en')} slingshots to a new position`);
  checkMines(g, op);
  scTrapCheck(g, op);
  return true;
}
/** The computer: a Slingshot towards an uncontrolled objective marker (when it isn't in range of one already). */
export function rtSlingshotAI(g, op) {
  const objs = (g.objectives || []).filter((m) => controller(g, m) !== op.side).sort((a, b) => dist(op, a) - dist(op, b));
  const goal = objs[0];
  if (!goal || dist(op, goal) < 6) return null;
  let best = null;
  for (const f of [1, 0.8, 0.6]) for (let a = 0; a < 24; a++) {
    const p = { x: op.x + Math.cos(a * Math.PI / 12) * 11 * f, y: op.y + Math.sin(a * Math.PI / 12) * 11 * f };
    const gain = dist(op, goal) - dist(p, goal);
    if (gain < 3 || (best && gain <= best.gain)) continue;
    if (slingshotCheck(g, op, p).ok) best = { p, gain };
  }
  return best?.p || null;
}
export function rtActions(g, op, add) {
  if (!isRat(op) || !tpl(op).rtRaider) return;
  const a = op.acted || {}, eng = isEngaged(g, op);
  const blocked = a.rtSlingshot || a.reposition || a.fallBack || a.charge || a.shoot;
  add('rtSlingshot', !eng && !blocked, eng ? { zh: '處於交戰中', en: 'Engaged' } : { zh: '同一次啟動不能和衝鋒、撤退、射擊、重新定位並用', en: 'Not with Charge, Fall Back, Shoot or another Reposition in the same activation' });
}

// ---------- Larcenous / Shoot and Hide (firefight ploys) ----------
export function rtShootHideWhy(g, op) {
  if (!isSmall(op)) return { zh: '只有萊特林（不含歐格林）', en: 'Ratlings only (not Ogryns or Bullgryns)' };
  if (op.order !== 'engage' || !op.acted.rtRifleShot) return { zh: '要在交戰指令下用步槍射擊之後', en: 'After shooting with a rifle on an Engage order' };
  const en = foes(g, op);
  if (en.some((e) => edgeDist(op, e) <= 3) && en.some((e) => visibility(g, e, op).visible)) return { zh: '離敵人要超過 3"、或沒有敵人看得到它', en: 'It must be more than 3" from enemies, or unseen by all of them' };
  return null;
}

// ---------- actions ----------
export function registerRatlingActions() {
  ACTIONS.rtSlingshot = { ap: 1, name: { zh: '彈弓', en: 'Slingshot' } };
  ACTIONS.rtIntercept = { ap: 1, name: { zh: '攔截通訊', en: 'Intercept Communications' } };
  TARGET_ACTIONS.rtIntercept = {
    targets: (g, o) => living(g, o.side).filter((t) => t !== o && isRat(t) && edgeDist(o, t) <= 6.01 && visibility(g, o, t).visible),
    apply(g, o, t) {
      changeApl(g, t, 1);
      return { zh: `攔截通訊：${opName(t, 'zh')} 到下次啟動結束 APL +1`, en: `Intercept Communications: ${opName(t, 'en')} gets +1 APL until the end of its next activation` };
    },
  };
}
