// exaction: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { BOARD, CHOICES, CONTROL, OBJ_R, autoFF, avgDmg, bestMelee, controller, getOp, moveStat, radius, resolveFight, canActivateOp, edgeDist, engagedEnemies, ffArmed, ffReady, forcedShot, inEngagement, isEngaged, living, log, needChoice, opName, shootCheck, shootWeapon, tpl, weaponsFor } from '../game.js';
import { EX_PATTERNS } from '../data/exaction.js';

// ---------- Exaction Squad (the rules added with the full roster) ----------
/** Attack Patterns (R-VR Cyber-mastiff): two of Aggressive / Swift / Defensive (Aggressive + Swift until picked in TP1). */
export const exPattern = (op, id) => !!tpl(op).attackPatterns && (op.patterns || ['aggressive', 'swift']).includes(id);
export const EX_PAIRS = [['aggressive', 'swift'], ['aggressive', 'defensive'], ['swift', 'defensive']];
/** Brutal Backup: other friendlies within control range of an enemy that is within this operative's control range. */
export const exBackups = (g, op) => living(g, op.side).filter((f) => f !== op && f.team === 'exaction' && engagedEnemies(g, op).some((e) => inEngagement(f, e, g))).sort((a, b) => b.wounds - a.wounds);
export const exPairName = (p) => ({ zh: p.map((id) => EX_PATTERNS[id].name.zh).join('＋'), en: p.map((id) => EX_PATTERNS[id].name.en).join(' + ') });
/** Exaction self actions: R-VR Command (change one Attack Pattern), Handler (the Cyber-mastiff activates with it, here straight after). */
export function exSelf(g, op, id) {
  if (id === 'exRvr') { op.acted.exRvr = 1; needChoice(g, op.side, 'exPatterns', { rvr: true }); return true; }
  if (id === 'exNuncio') { op.acted.exNuncio = 1; needChoice(g, op.side, 'exNuncio', { uid: op.uid }); return true; }
  if (id === 'exHandler') {
    const m = living(g, op.side).find((o) => tpl(o).attackPatterns && canActivateOp(g, o));
    if (!m) return false;
    op.acted.exHandler = 1; op.wcHerd = m.uid; // (the same chain as Mutant Herd: it activates when this one is expended)
    log(g, { zh: `馴犬師：${opName(m, 'zh')} 跟著一起啟動（這裡在它之後）`, en: `Handler: ${opName(m, 'en')} activates with it (here, straight after)` }, `side${op.side}`);
    return true;
  }
  return false;
}
/** Exact Punishment (firefight ploy, automatic): a friendly shot or fought from within 6" and still standing makes a free Shoot or Fight
 * against that enemy only (a Fight when they're in each other's control range and its best blow beats its best shot). */
export function exPunish(g, enemy, target) {
  if (g.exPunishing || !target || target.dead || target.side > 1 || enemy.side === target.side || enemy.dead || target.team !== 'exaction' || edgeDist(enemy, target) > 6) return;
  if (!ffReady(g, target.side, 'exactPunishment') || !ffArmed(g, target.side, 'exactPunishment')) return;
  const keep = { ap: target.ap, acted: target.acted }; target.ap = 1; target.acted = { free: { shoot: 'any', fight: 'any' } };
  const w = weaponsFor(g, target).filter((x) => x.type === 'ranged' && shootWeapon(g, target, x).ok && shootCheck(g, target, enemy, x).ok).sort((a, b) => avgDmg(b) - avgDmg(a))[0];
  const m = inEngagement(target, enemy, g) && bestMelee(target);
  target.ap = keep.ap; target.acted = keep.acted;
  const fight = m && (!w || avgDmg(m) * 1.1 >= avgDmg(w));
  if ((!w && !fight) || !autoFF(g, target.side, 'exactPunishment')) return;
  log(g, { zh: `精確懲處：${opName(target, 'zh')} 對 ${opName(enemy, 'zh')} ${fight ? '免費近戰' : '還擊'}`, en: `Exact Punishment: ${opName(target, 'en')} ${fight ? 'fights' : 'shoots back at'} ${opName(enemy, 'en')}` }, `side${target.side}`);
  g.exPunishing = true;
  try {
    if (!fight) { forcedShot(g, target, w, [enemy], true); return; }
    const k = { ap: target.ap, acted: target.acted, active: g.active, fight: g.fight, ffAtk: g.ffAtk, ffPending: g.ffPending };
    target.ap = 1; target.acted = { free: { fight: 'any' } }; g.active = target.uid; g.fight = null; g.ffPending = null;
    try { resolveFight(g, target, m, enemy); } finally { target.ap = k.ap; target.acted = k.acted; g.active = k.active; g.fight = k.fight; g.ffAtk = k.ffAtk; g.ffPending = k.ffPending; }
  } finally { g.exPunishing = false; }
}
/** Execution Order (firefight ploy, automatic): mark an enemy that just performed a mission action (not Operate Hatch), or, at the end of the
 * Firefight phase, one that controls an objective. Not again until the marked enemy activates or is incapacitated. */
export function exOrderMark(g, enemy, atEnd = false) {
  const side = enemy ? 1 - enemy.side : -1;
  if (side < 0 || side > 1 || g.teams[side] !== 'exaction' || enemy.dead || g.phase !== 'firefight') return;
  const prev = g.exOrder?.[side] && getOp(g, g.exOrder[side]);
  if (prev && !prev.dead) return;
  if (!atEnd && !living(g, side).some((f) => f.team === 'exaction' && f.ready)) return; // (nobody could answer it this turning point; wait for the end of the phase)
  if (!autoFF(g, side, 'executionOrder')) return;
  (g.exOrder ||= [null, null])[side] = enemy.uid;
  log(g, { zh: `處決令：${opName(enemy, 'zh')} 被標記，牠下次啟動時強徵小隊可以先打斷`, en: `Execution Order: ${opName(enemy, 'en')} is marked; the next time it would activate, the Exaction Squad can interrupt` }, `side${side}`);
}
/** At the end of the Firefight phase: an enemy controlling an objective (the one with the most wounds). */
export function exOrderEnd(g) {
  for (const side of [0, 1]) {
    if (g.teams[side] !== 'exaction') continue;
    const holders = living(g, 1 - side).filter((e) => e.x > -50 && (g.objectives || []).some((o) => Math.hypot(e.x - o.x, e.y - o.y) - radius(e) - OBJ_R <= CONTROL && controller(g, o) === e.side));
    const t = holders.sort((a, b) => b.wounds - a.wounds)[0];
    if (t) exOrderMark(g, t, true);
  }
}
/** Could this friendly shoot or fight that enemy this activation? */
const exCanPunish = (g, f, e) => edgeDist(f, e) <= moveStat(g, f) + CONTROL
  || weaponsFor(g, f).some((w) => w.type === 'ranged' && shootCheck(g, { ...f, order: 'engage', ap: 3, acted: {} }, e, w).ok);
/** The marked enemy would activate: interrupt, and a ready Exaction operative that can attack it activates first (it must shoot or fight
 * that enemy before any other). The enemy's activation then goes on. True when the interrupt is set up. */
export function exOrderInterrupt(g, o) {
  if (g.counter || g.mdResume || o.side > 1) return false;
  const side = 1 - o.side, uid = g.exOrder?.[side];
  if (!uid) return false;
  if (uid !== o.uid) { const m = getOp(g, uid); if (!m || m.dead) g.exOrder[side] = null; return false; }
  g.exOrder[side] = null;
  const cands = living(g, side).filter((f) => f.team === 'exaction' && canActivateOp(g, f) && exCanPunish(g, f, o));
  if (!cands.length) { log(g, { zh: '處決令：沒有能攻擊牠的準備中友方，這次打斷取消', en: 'Execution Order: no ready friendly can attack it; the interrupt is cancelled' }, `side${side}`); return false; }
  g.mdResume = { uid: o.uid, side: o.side };
  g.chain = { side, uids: cands.map((f) => f.uid), must: false, by: o.uid, kind: 'exOrder', target: o.uid };
  g.turn = side;
  log(g, { zh: `處決令：打斷 ${opName(o, 'zh')} 的啟動，強徵小隊先行動（必須先射擊或近戰牠）`, en: `Execution Order: ${opName(o, 'en')}'s activation is interrupted; the Exaction Squad acts first (it must shoot or fight it first)` }, `side${side}`);
  return true;
}
export function registerExactionChoices() {
  CHOICES.exNuncio = {
    kind: 'point', title: { zh: '部署使節天鷹：點棋盤放標記（隊長 6" 內；已在場上就移動最多 6"）', en: 'Deploy Nuncio-aquila: tap the board for the marker (within 6" of the Proctor; once it is out, move it up to 6")' },
    valid: (g, side, p, ctx) => nuncioOk(g, getOp(g, ctx.uid), p),
    auto: (g, side, ctx) => nuncioAuto(g, getOp(g, ctx.uid)),
    apply(g, side, p, ctx) {
      const q = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }, m = nuncioMarker(g, side);
      if (m) Object.assign(m, q); else (g.markers ||= []).push({ id: g.markers.length, kind: 'nuncio', owner: side, x: q.x, y: q.y, carriedBy: null });
      log(g, { zh: `使節天鷹：標記${m ? '移到' : '放在'} (${q.x}, ${q.y})`, en: `Nuncio-aquila: the marker ${m ? 'moves to' : 'goes at'} (${q.x}, ${q.y})` }, `side${side}`);
    },
  };
  CHOICES.exPatterns = {
    kind: 'option', title: { zh: '攻擊模式：機械獒犬的兩種模式', en: 'Attack Pattern: the Cyber-mastiff\'s two patterns' },
    options: () => EX_PAIRS.map((p) => ({ value: p.join('+'), label: exPairName(p) })),
    // The computer keeps Aggressive + Swift, or Defensive in place of Swift once the mastiff is in a fight.
    auto: (g, side) => { const m = living(g, side).find((o) => tpl(o).attackPatterns); return m && isEngaged(g, m) ? 'aggressive+defensive' : 'aggressive+swift'; },
    apply(g, side, v) {
      for (const m of living(g, side).filter((o) => tpl(o).attackPatterns)) m.patterns = v.split('+');
      log(g, { zh: `攻擊模式：${exPairName(v.split('+')).zh}`, en: `Attack Pattern: ${exPairName(v.split('+')).en}` }, `side${side}`);
    },
  };
}

// ---------- Exaction Squad ----------
/** The Nuncio-aquila marker of that side (null while it isn't in the killzone). */
export const nuncioMarker = (g, side) => (g.markers || []).find((m) => m.kind === 'nuncio' && m.owner === side) || null;
/** Nuncio-aquila: an enemy within 3" of the marker (or of the Proctor-exactant while the marker isn't in the killzone). */
export const nuncioNear = (g, op) => {
  if (op.side > 1) return false;
  const m = nuncioMarker(g, 1 - op.side);
  return m ? Math.hypot(op.x - m.x, op.y - m.y) - radius(op) <= 3 : living(g, 1 - op.side).some((p) => tpl(p).nuncio && edgeDist(p, op) <= 3);
};
/** Where the marker can go: within 6" horizontally of the Proctor (placing it) or of the marker (moving it), on the board. */
const nuncioFrom = (g, op) => nuncioMarker(g, op.side) || op;
const nuncioOk = (g, op, p) => !!p && p.x > 0 && p.y > 0 && p.x < (g.board?.w ?? BOARD.w) && p.y < (g.board?.h ?? BOARD.h) && Math.hypot(p.x - nuncioFrom(g, op).x, p.y - nuncioFrom(g, op).y) <= 6 + 0.01;
/** The computer's spot: up to 6" towards the objective nearest the Proctor (or onto it). */
export function nuncioAuto(g, op) {
  const from = nuncioFrom(g, op), obj = [...(g.objectives || [])].sort((a, b) => Math.hypot(a.x - op.x, a.y - op.y) - Math.hypot(b.x - op.x, b.y - op.y))[0];
  if (!obj) return null;
  const d = Math.hypot(obj.x - from.x, obj.y - from.y), k = d <= 6 ? 1 : 6 / d;
  return { x: Math.round((from.x + (obj.x - from.x) * k) * 10) / 10, y: Math.round((from.y + (obj.y - from.y) * k) * 10) / 10 };
}
/** Worth deploying (computer): the marker isn't out yet, or it's more than 1" from where it would go. */
export const nuncioWorth = (g, op) => { const p = nuncioAuto(g, op), m = nuncioMarker(g, op.side); return !!p && (!m || Math.hypot(p.x - m.x, p.y - m.y) > 1); };
/** The Proctor is gone: its marker goes too. */
export function nuncioCheck(g) { for (const side of [0, 1]) if (nuncioMarker(g, side) && !living(g, side).some((p) => tpl(p).nuncio)) g.markers = g.markers.filter((m) => !(m.kind === 'nuncio' && m.owner === side)); }
/** Scrapcode Overload (Hunter Clade firefight ploy): an enemy within 3" of that Infiltrator (marker control only). */
export const scrapNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((p) => g.scrapcode?.[p.side] === p.uid && edgeDist(p, op) <= 3);
/** Apprehend: the Cyber-mastiff holds this enemy while it stays within its control range. */
export const apprehended = (g, op) => op.side < 2 && living(g, 1 - op.side).some((m) => m.apprehend === op.uid && edgeDist(m, op) <= CONTROL + 0.01);
/** Apprehend / Castigator's Arrest (the only enemy in the Castigator's control range): can't Fall Back. */
export const arrested = (g, op) => apprehended(g, op)
  || (op.side < 2 && living(g, 1 - op.side).some((c) => tpl(c).arrest && edgeDist(c, op) <= CONTROL + 0.01 && engagedEnemies(g, c).length === 1));
