// goremongers: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { CONTROL, carriables, checkMines, d3, edgeDist, foes, hasPloy, isEngaged, living, log, opName, radius, tpl } from '../game.js';
import { dist } from '../geometry.js';
import { findPath, moveCtx, wholeInchPath } from '../path.js';


// ---------- Goremongers ----------
export const isGM = (op) => !!TEAM_MAP[op?.team]?.goreTanks;
/** GORE TANK: 0 empty, 1 half, 2 full (it starts at half). */
export const goreOf = (op) => (isGM(op) && op.side < 2 ? op.gore ?? 1 : null);
export const GORE_NAME = [{ zh: '空', en: 'empty' }, { zh: '半', en: 'half' }, { zh: '滿', en: 'full' }];
export function goreUp(g, op, why) {
  if (!isGM(op) || op.dead || op.side > 1 || (op.gore ?? 1) >= 2) return false;
  op.gore = (op.gore ?? 1) + 1;
  log(g, { zh: `${opName(op, 'zh')} 血槽 +1（${why.zh}）→ ${GORE_NAME[op.gore].zh}`, en: `${opName(op, 'en')} GORE TANK up (${why.en}) → ${GORE_NAME[op.gore].en}` }, `side${op.side}`);
  return true;
}
export function goreDown(op) { if ((op.gore ?? 1) <= 0) return false; op.gore = (op.gore ?? 1) - 1; return true; }
export const SANGUAVITAE = {
  mania: { name: { zh: '狂躁', en: 'Mania' }, desc: { zh: 'APL +1，直到它下次啟動（現在就多 1AP）', en: '+1 APL until its next activation (1 more AP now)' } },
  fury: { name: { zh: '狂怒', en: 'Fury' }, desc: { zh: '本次啟動可以近戰兩次，第二次免費', en: 'Two Fight actions this activation, the second free' } },
  rejuvenate: { name: { zh: '再生', en: 'Rejuvenate' }, desc: { zh: '回復 D3+1 生命', en: 'Regain D3+1 wounds' } },
  rage: { name: { zh: '狂暴', en: 'Rage' }, desc: { zh: '這次啟動下一次近戰：近戰武器 Atk +1', en: 'Its next Fight this activation: +1 Atk on melee weapons' } },
  rake: { name: { zh: '撕扯', en: 'Rake' }, desc: { zh: '這次啟動下一次衝鋒移動完：對控制範圍內一名敵人造成 D3', en: 'Its next Charge this activation: D3 to an enemy in its control range when it finishes moving' } },
  surge: { name: { zh: '湧動', en: 'Surge' }, desc: { zh: '這次啟動下一次衝鋒或移動：Move +1"', en: 'Its next Charge or Reposition this activation: +1" Move' } },
};
/** The Sanguavitae this operative could use now (it's activating or counteracting): [{id, ok, why}]. */
export function sangOptions(g, op) {
  if (!op || !isGM(op) || op.side > 1 || op.dead || g.active !== op.uid || g.phase !== 'firefight') return [];
  const used = op.acted.sang || [], gore = goreOf(op);
  return Object.keys(SANGUAVITAE).map((id) => {
    const why = used.includes(id) ? { zh: '這次已用過', en: 'Already used this time' }
      : used.length >= 2 ? { zh: '每次最多兩種', en: 'Two per activation at most' }
        : gore <= 0 ? { zh: '血槽是空的', en: 'GORE TANK is empty' }
          : (id === 'mania' && used.includes('fury')) || (id === 'fury' && used.includes('mania')) ? { zh: '狂躁與狂怒不能同時用', en: 'Not Mania and Fury together' }
            : ['mania', 'fury', 'rake'].includes(id) && op.counter ? { zh: '反擊時不能用', en: 'Not while counteracting' }
              : id === 'rejuvenate' && op.wounds >= op.maxW ? { zh: '沒有受傷', en: 'Not wounded' } : null;
    return { id, ok: !why, why };
  });
}
export function useSang(g, op, id) {
  if (!sangOptions(g, op).find((x) => x.id === id)?.ok) return false;
  goreDown(op);
  (op.acted.sang ||= []).push(id);
  let extra = { zh: '', en: '' };
  if (id === 'mania') { op.mania = true; op.ap += 1; }
  if (id === 'fury') { op.acted.fightsAllowed = Math.max(2, op.acted.fightsAllowed || 1); op.acted.fury = true; }
  if (id === 'rejuvenate') { const b = op.wounds; op.wounds = Math.min(op.maxW, op.wounds + d3() + 1); extra = { zh: `，回復 ${op.wounds - b}`, en: `, regains ${op.wounds - b}` }; }
  if (['rage', 'rake', 'surge'].includes(id)) (op.acted.sangArm ||= {})[id] = true;
  log(g, { zh: `${opName(op, 'zh')} 血之精華「${SANGUAVITAE[id].name.zh}」${extra.zh}（血槽 → ${GORE_NAME[op.gore].zh}）`, en: `${opName(op, 'en')} Sanguavitae: ${SANGUAVITAE[id].name.en}${extra.en} (GORE TANK → ${GORE_NAME[op.gore].en})` }, `side${op.side}`);
  return true;
}
/** Bleeding tokens (Inciter): enemies within 8" of this activating Goremonger whose token it can take. */
export const bleedTargets = (g, op) => (isGM(op) && g.active === op.uid && op.side < 2 && goreOf(op) < 2
  ? foes(g, op).filter((e) => e.bleed?.[op.side] && edgeDist(op, e) <= 8) : []);
export function useBleed(g, op, e) {
  if (!bleedTargets(g, op).includes(e)) return false;
  e.bleed[op.side] = false;
  return goreUp(g, op, { zh: `${opName(e, 'zh')} 的流血標記`, en: `${opName(e, 'en')}'s Bleeding token` });
}
/** Khorne's Favour (Blood Herald): once per activation, with an empty tank, increase it. */
export const canFavour = (g, op) => !!tpl(op).khornesFavour && g.active === op.uid && goreOf(op) === 0 && !op.acted.favour && g.phase === 'firefight';
export function useFavour(g, op) {
  if (!canFavour(g, op)) return false;
  op.acted.favour = true;
  return goreUp(g, op, { zh: '恐虐的恩寵', en: 'Khorne\'s Favour' });
}
/** Kills: Gore Tank up (control range, or visible within 2"); Incite the Hunt (Inciter, from more than 2"). */
export function goreOnKill(g, src, target, near) {
  if (!src || src.dead || !isGM(src) || src.side === target.side) return;
  if (near) goreUp(g, src, { zh: '使敵人殘廢', en: 'incapacitated an enemy' });
  if (tpl(src).inciteHunt && edgeDist(src, target) > 2) {
    const t = living(g, src.side).filter((o) => isGM(o) && goreOf(o) < 2 && edgeDist(o, target) <= 8).sort((a, b) => goreOf(a) - goreOf(b))[0];
    if (t) goreUp(g, t, { zh: '煽動狩獵', en: 'Incite the Hunt' });
  }
}
/** Drag (Impaler's fleshskewer): before damage, pull the target up to 2" per unblocked success towards the shooter. */
export function dragTarget(g, op, target, n) {
  if (n <= 0 || target.dead) return;
  const max = n * 2, d = dist(op, target), room = d - radius(op) - radius(target) - 0.02;
  if (room <= 0.05) return;
  const ctx = moveCtx(g, target);
  for (let len = Math.ceil(Math.min(max, room)); len >= 1; len--) {
    const l = Math.min(len, room), q = { x: target.x + (op.x - target.x) / d * l, y: target.y + (op.y - target.y) / d * l };
    if (!ctx.free(q) || !ctx.segFree(target, q) || ctx.climbs([target, q])) continue; // (not dragged over terrain)
    log(g, { zh: `拖拽：${opName(target, 'zh')} 被拉近 ${Math.ceil(l)}"`, en: `Drag: ${opName(target, 'en')} is pulled ${Math.ceil(l)}" closer` }, `side${op.side}`);
    target.x = q.x; target.y = q.y;
    for (const m of carriables(g)) if (m.carriedBy === target.uid) { m.x = q.x; m.y = q.y; }
    return;
  }
}
/** Hunt for Blood (strategy ploy): one friendly (automatic) goes Engage and makes a free Charge of up to 3". */
export function goremongerStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]]?.goreTanks || !hasPloy(g, side, 'huntForBlood') || g.huntTP?.[side] === g.tp) return;
  (g.huntTP ||= [0, 0])[side] = g.tp;
  let best = null;
  for (const op of living(g, side).filter((o) => isGM(o) && !isEngaged(g, o) && (g.huntPick?.[side]?.tp !== g.tp || g.huntPick[side].uid === o.uid))) { // (the friendly the player picked)
    const ctx = moveCtx(g, op);
    for (const e of foes(g, op).filter((x) => x.side < 2 && edgeDist(op, x) <= 3 + CONTROL)) {
      for (let a = 0; a < 16; a++) {
        const r = radius(e) + radius(op) + 0.5, p = { x: e.x + Math.cos(a * Math.PI / 8) * r, y: e.y + Math.sin(a * Math.PI / 8) * r };
        const raw = ctx.free(p) && findPath(ctx, p), path = raw && wholeInchPath(ctx, raw, 3, ctx.inEnemyER);
        if (path && path.len <= 3 + 0.01 && (!best || path.len < best.path.len)) best = { op, e, path };
      }
    }
  }
  if (!best) { log(g, { zh: '血之狩獵：沒有能衝到敵人身邊的友方', en: 'Hunt for Blood: no friendly can reach an enemy' }, `side${side}`); return; }
  const { op, e, path } = best, end = path.pts[path.pts.length - 1];
  op.order = 'engage'; op.x = end.x; op.y = end.y; op.chargedTP = g.tp;
  (g.trailLog ||= []).push({ uid: op.uid, side, tp: g.tp, kind: 'charge', len: Math.round(path.len * 10) / 10, pts: path.pts.map((p) => ({ x: p.x, y: p.y })) });
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.x = op.x; m.y = op.y; }
  log(g, { zh: `血之狩獵：${opName(op, 'zh')} 改為交戰，免費衝鋒 ${path.len}" 到 ${opName(e, 'zh')} 身邊`, en: `Hunt for Blood: ${opName(op, 'en')} goes Engage and Charges ${path.len}" to ${opName(e, 'en')}` }, `side${side}`);
  checkMines(g, op);
}
