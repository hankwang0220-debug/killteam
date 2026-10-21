// novitiates: the rules added with the full roster (the Acts of Faith engine stays in game.js).
import { CHOICES, CONTROL, OBJ_R, applyDamage, autoFF, d3, deployZones, edgeDist, foes, gainFaith, living, log, opName, playerPicks, radius, tpl, validTarget, visibility } from '../game.js';
import { dist } from '../geometry.js';
import { bestStep, stepTo } from '../sanctifiers.js';

export const isNV = (op) => op?.team === 'novitiates';

/** Righteous Advance (strategy ploy, not in TP1): up to a third of the Novitiates (rounding down, at least 1) Dash closer to a goal. */
const zoneDist = (z, p) => Math.hypot(Math.max(z.x0 - p.x, 0, p.x - z.x1), Math.max(z.y0 - p.y, 0, p.y - z.y1));
/** Each goal's distance from p: its closest enemy, its closest objective marker and the opponent's drop zone (as seen from where it starts). */
function goals(g, o) {
  const e = foes(g, o).filter((x) => x.x > -50).sort((a, b) => dist(a, o) - dist(b, o))[0];
  const m = (g.objectives || []).slice().sort((a, b) => dist(a, o) - dist(b, o))[0];
  const z = deployZones(g)[1 - o.side];
  return [e && ((p) => dist(e, p)), m && ((p) => dist(m, p)), z && ((p) => zoneDist(z, p))].filter(Boolean);
}
export const nvAdvanceOk = (g, o, end) => goals(g, o).some((f) => f(end) < f(o) - 0.01);
export const nvAdvanceN = (g, side) => Math.max(1, Math.floor(living(g, side).filter((o) => isNV(o) && o.x > -50).length / 3));

/** Glorious Martyrdom (firefight ploy, automatic): each enemy visible within 2" of the fallen Novitiate gives 1 Faith and takes D3. */
export function nvMartyrdom(g, dead) {
  if (!isNV(dead)) return;
  const near = foes(g, dead).filter((e) => e.side < 2 && !e.dead && edgeDist(e, dead) <= 2 && visibility(g, dead, e).visible);
  if (!near.length || !autoFF(g, dead.side, 'gloriousMartyrdom')) return;
  g.nvMartyr = true; // (Inspirational Example doesn't count these)
  try {
    for (const e of near) {
      gainFaith(g, dead.side, 1, { zh: '光榮殉道', en: 'Glorious Martyrdom' });
      const d = d3();
      log(g, { zh: `光榮殉道：${opName(e, 'zh')} 受到 ${d} 傷害`, en: `Glorious Martyrdom: ${opName(e, 'en')} takes ${d} damage` }, `side${dead.side}`);
      applyDamage(g, dead, e, d);
    }
  } finally { g.nvMartyr = false; }
}

/** Blazing Inferno (firefight ploy, automatic): a Ministorum flamer's critical damage sets a Blaze token on the target. */
export function nvBlaze(g, op, weapon, target, remC, dmg) {
  if (!isNV(op) || weapon.id !== 'ministorumFlamer' || !remC || !dmg || target.dead || target.blaze != null) return;
  if (!autoFF(g, op.side, 'blazingInferno')) return;
  target.blaze = op.side;
  log(g, { zh: `熊熊烈焰：${opName(target, 'zh')} 獲得燃燒標記`, en: `Blazing Inferno: ${opName(target, 'en')} gains a Blaze token` }, `side${op.side}`);
}
/** When an operative with a Blaze token activates: D3 damage; the computer puts it out (-1 APL) while it has AP to spare. */
export function nvBlazeActivate(g, op) {
  if (op.blaze == null || op.counter || op.blazeTP === g.tp) return; // (switching to another operative before acting doesn't repeat it)
  op.blazeTP = g.tp;
  const d = d3();
  log(g, { zh: `燃燒標記：${opName(op, 'zh')} 受到 ${d} 傷害`, en: `Blaze token: ${opName(op, 'en')} takes ${d} damage` }, `side${op.blaze}`);
  applyDamage(g, null, op, d);
  if (!op.dead && !playerPicks(g, op.side) && op.ap >= 2) nvBlazeOut(g, op);
}
export function nvBlazeOut(g, op) {
  if (op.blaze == null) return false;
  op.blaze = null; op.ap = Math.max(0, op.ap - 1); op.acted.nvBlazeOut = 1;
  log(g, { zh: `${opName(op, 'zh')} 撲滅火焰（本次 APL -1）`, en: `${opName(op, 'en')} puts out the flames (-1 APL this activation)` }, `side${op.side}`);
  return true;
}

/** Blinding Aura (firefight ploy, automatic): the selected Novitiate target can't be picked from more than 2" away this activation. */
export const nvBlinded = (g, op, target) => !!g.nvBlind && g.nvBlind.by === op.uid && g.nvBlind.uid === target.uid && edgeDist(op, target) > 2;
/** 'retarget' (the shooter picks again), 'end' (no other target: the Shoot ends) or null (it shoots). */
export function nvBlindingAura(g, op, weapon, target) {
  if (!isNV(target) || op.side === target.side || op.side > 1 || g.nvBlind?.uid === target.uid || edgeDist(op, target) <= 2) return null;
  if (!autoFF(g, target.side, 'blindingAura')) return null;
  g.nvBlind = { by: op.uid, uid: target.uid };
  log(g, { zh: `炫目光環：${opName(target, 'zh')} 本次啟動不能被 ${opName(op, 'zh')} 從 2" 外選為目標`, en: `Blinding Aura: ${opName(op, 'en')} can't target ${opName(target, 'en')} from more than 2" this activation` }, `side${target.side}`);
  return foes(g, op).some((e) => e !== target && e.side < 2 && !e.dead && validTarget(g, op, e, weapon)) ? 'retarget' : 'end';
}

/** Relic Seeker (Pronatus): once per activation, Pick Up Marker, Place Marker or a mission action for 1 less AP. */
export const nvRelicSeeker = (g, op, id, mission) => (tpl(op).relicSeeker && !op.acted.nvRelic && (id === 'pickUp' || id === 'placeMarker' || mission) ? 1 : 0);
/** Divine Acquisition (Pronatus): once per turning point, a mission action while it controls a marker gives Faith equal to the turning point. */
export function nvDivine(g, op) {
  if (!tpl(op).divineAcq || op.divineTP === g.tp) return;
  const marks = [...(g.objectives || []), ...(g.markers || []).filter((m) => !m.carriedBy)];
  if (!marks.some((m) => dist(op, m) - radius(op) - OBJ_R <= CONTROL)) return;
  op.divineTP = g.tp;
  gainFaith(g, op.side, g.tp, { zh: '神聖取得', en: 'Divine Acquisition' });
}
/** Militant Faith (Militant): Faith spent on its own attack comes back if an enemy is incapacitated in that sequence. */
export function nvMilitantRefund(g, src) {
  if (!src || !tpl(src).militantFaith || !src.nvFaithSpent) return;
  const n = src.nvFaithSpent; src.nvFaithSpent = 0;
  gainFaith(g, src.side, n, { zh: '武裝信仰：退還', en: 'Militant Faith: refunded' });
}

export function registerNovitiateChoices() {
  CHOICES.nvAdvance = {
    kind: 'move', title: { zh: '正義推進：免費衝刺（結束時要更接近最近的敵人、目標點或對手部署區）', en: 'Righteous Advance: free Dashes (ending closer to the closest enemy, objective or the opponent\'s drop zone)' },
    movers: (g, side) => living(g, side).filter((o) => isNV(o) && o.x > -50),
    moveKind: () => 'dash', max: () => 3,
    check: (g, side, o, end) => nvAdvanceOk(g, o, end),
    autoAll(g, side, ctx) {
      const movers = living(g, side).filter((o) => isNV(o) && o.x > -50 && foes(g, o).some((e) => e.x > -50)).sort((a, b) => Math.min(...foes(g, a).map((e) => dist(e, a))) - Math.min(...foes(g, b).map((e) => dist(e, b))));
      for (const o of movers.slice(0, ctx.n)) {
        const es = foes(g, o).filter((e) => e.x > -50), near = (p) => Math.min(...es.map((e) => dist(e, p)));
        const q = bestStep(g, o, 3, 'dash', (p) => (near(p) < near(o) ? -near(p) : null));
        if (q) { stepTo(g, o, q); log(g, { zh: `正義推進：${opName(o, 'zh')} 免費衝刺`, en: `Righteous Advance: ${opName(o, 'en')} makes a free Dash` }, `side${side}`); }
      }
    },
  };
}
