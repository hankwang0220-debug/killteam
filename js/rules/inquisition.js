// inquisition: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { autoFF, checkMines, d3, edgeDist, ffArmed, ffReady, getOp, isEngaged, living, log, moveStat, needChoice, opName, radius, spendFF, tpl, visibility } from '../game.js';
import { dist } from '../geometry.js';
import { findPath, moveCtx, wholeInchPath } from '../path.js';


// ---------- Inquisitorial Agents ----------
export const isIA = (op) => !!TEAM_MAP[op?.team]?.inquisition;
export const isIATeam = (g, side) => side < 2 && !!TEAM_MAP[g.teams[side]]?.inquisition;
/** Inquisitorial Tomes: Denunciation (+1 Atk attacking an enemy within 2" of it) / Sanctification (-1 Atk for enemies attacking a friendly within 2" of it). */
export const tomeNear = (g, side, kind, o) => living(g, side).some((t) => tpl(t).tome === kind && edgeDist(t, o) <= 2);
/** Hexorcise (Hexorcist): an enemy visible within 6" of it can't re-roll attack or defence dice. */
export const hexorcised = (g, op) => op.side < 2 && living(g, 1 - op.side).some((h) => tpl(h).hexorcise && edgeDist(h, op) <= 6 && visibility(g, h, op).visible);
/** Scry (Mystic): Guidance (attack dice) / Protection (defence dice) — one fail → normal, or one normal → crit. */
export const scryOn = (g, op, mode) => { const s = g.scry?.[op.side]; return !!(s && s.uid === op.uid && s.mode === mode && getOp(g, s.by) && !getOp(g, s.by).dead); };
export const upgradePost = (pool) => {
  const m = pool.dice.find((x) => x.res === 'miss');
  if (m) { m.res = 'norm'; m.indo = true; pool.norms++; return; }
  const n = pool.dice.find((x) => x.res === 'norm');
  if (n) { n.res = 'crit'; n.rend = true; pool.norms--; pool.crits++; }
};
export const scryPost = (g, op, mode) => (scryOn(g, op, mode) ? upgradePost : null);
/** Quarry (ploy): the enemy friendlies attack with Ceaseless; a new one is picked (automatically) when it falls. */
export const quarryOf = (g, side) => (g.quarry?.[side]?.tp === g.tp ? getOp(g, g.quarry[side].uid) : null);

export function quarryAuto(g, side) {
  const mine = living(g, side), near = (e) => Math.min(...mine.map((m) => dist(m, e)));
  return living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => (tpl(b).apl * b.wounds) - (tpl(a).apl * a.wounds) || near(a) - near(b))[0] || null;
}
export function pickQuarry(g, side, t = quarryAuto(g, side)) {
  (g.quarry ||= [null, null])[side] = t ? { tp: g.tp, uid: t.uid } : null;
  if (t) log(g, { zh: `獵物：${opName(t, 'zh')}（友方攻擊它時武器「無休」）`, en: `Quarry: ${opName(t, 'en')} (friendlies attacking it have Ceaseless)` }, `side${side}`);
}
/** Denounce (ploy): the chosen enemy waits until it's the last ready one, or until its side has activated D3 operatives. */
export const denounced = (g, o, ready) => { const d = g.denounce?.[1 - o.side]; return !!(d && d.tp === g.tp && d.uid === o.uid && ready.length > 1 && (g.actCount?.[o.side] || 0) < d.n); };
/** Scrivener (Autosavant): each time the opponent uses a ploy again during the battle, +1CP (2 per TP at most). */
export function scrivener(g, side, id) {
  if (side > 1 || id === 'commandReroll') return;
  const uses = ((g.ployUses ||= [{}, {}])[side]);
  uses[id] = (uses[id] || 0) + 1;
  const opp = 1 - side;
  if (uses[id] < 2 || !living(g, opp).some((o) => tpl(o).scrivener)) return;
  const s = (g.scrivTP ||= [null, null]);
  if (s[opp]?.tp !== g.tp) s[opp] = { tp: g.tp, n: 0 };
  if (s[opp].n >= 2) return;
  s[opp].n++; g.cp[opp]++;
  log(g, { zh: `記錄員：對手再次使用計謀，+1CP`, en: 'Scrivener: the opponent used a ploy again, +1CP' }, `side${opp}`);
}
/** Absolute Authority (firefight ploy, automatic): an opponent's strategy ploy is cancelled and refunded (each ploy once per battle). */
export function absoluteAuthority(g, side, ploy, cost) {
  const ia = 1 - side;
  if (!isIATeam(g, ia) || cost <= 0 || !ffReady(g, ia, 'absoluteAuthority') || !ffArmed(g, ia, 'absoluteAuthority')) return false;
  if (g.authorityStopped?.[ia]?.includes(ploy.id)) return false;
  spendFF(g, ia, 'absoluteAuthority');
  ((g.authorityStopped ||= [[], []])[ia]).push(ploy.id);
  ((g.ployBlocked ||= [{}, {}])[side])[ploy.id] = g.tp;
  log(g, { zh: `絕對權威：對手的「${ploy.name.zh}」被取消，CP 退回`, en: `Absolute Authority: the opponent's ${ploy.name.en} is cancelled and refunded` }, `side${ia}`);
  return true;
}
/** Intimidating Presence (firefight ploy, automatic): +1AP for an enemy picking up / doing a mission action near an agent. */
export const intimidated = (g, op) => op.side < 2 && isIATeam(g, 1 - op.side) && ffReady(g, 1 - op.side, 'intimidatingPresence') && ffArmed(g, 1 - op.side, 'intimidatingPresence')
  && living(g, 1 - op.side).some((a) => edgeDist(a, op) <= (tpl(a).scry ? 6 : 3) && visibility(g, a, op).visible);
/** Relentless in Pursuit (firefight ploy, automatic): an enemy that started within 2" of a ready agent moves — the agent follows. */
export function relentlessPursuit(g, enemy, from) {
  const side = 1 - enemy.side;
  if (enemy.dead || enemy.side > 1 || !isIATeam(g, side) || !ffReady(g, side, 'relentlessPursuit') || !ffArmed(g, side, 'relentlessPursuit')) return;
  const was = { ...enemy, x: from.x, y: from.y };
  const ag = living(g, side).filter((a) => a.ready && !tpl(a).machine && edgeDist(a, was) <= 2).sort((a, b) => (prefersMeleeG(b) - prefersMeleeG(a)))[0];
  if (!ag || isEngaged(g, ag)) return;
  const ctx = moveCtx(g, ag);
  const charge = ag.order === 'engage';
  let best = null;
  for (let a = 0; a < 16; a++) for (const gap of charge ? [0.5, 0.9] : [1.5, 1.9]) {
    const r = radius(enemy) + radius(ag) + gap, p = { x: enemy.x + Math.cos(a * Math.PI / 8) * r, y: enemy.y + Math.sin(a * Math.PI / 8) * r };
    if (!ctx.free(p)) continue;
    const max = charge ? moveStat(g, ag) + 2 : moveStat(g, ag);
    const raw = findPath(ctx, p), path = raw && wholeInchPath(ctx, raw, max, charge ? ctx.inEnemyER : (q) => !ctx.inEnemyER(q));
    if (path && (!best || path.len < best.path.len)) best = { path, p: path.pts.at(-1) };
  }
  if (!best || !autoFF(g, side, 'relentlessPursuit')) return;
  ag.x = best.p.x; ag.y = best.p.y;
  (g.trailLog ||= []).push({ uid: ag.uid, side, tp: g.tp, kind: charge ? 'charge' : 'reposition', len: Math.round(best.path.len * 10) / 10, pts: best.path.pts.map((p) => ({ x: p.x, y: p.y })) });
  log(g, { zh: `窮追不捨：${opName(ag, 'zh')} ${charge ? '衝鋒' : '移動'}追上 ${opName(enemy, 'zh')}`, en: `Relentless in Pursuit: ${opName(ag, 'en')} ${charge ? 'Charges' : 'Repositions'} after ${opName(enemy, 'en')}` }, `side${side}`);
  checkMines(g, ag);
}
export const prefersMeleeG = (o) => { const ws = tpl(o).weapons; const best = (t) => Math.max(0, ...ws.filter((w) => w.type === t).map((w) => w.atk * w.dmg[0])); return best('melee') > best('ranged') ? 1 : 0; };
/** Inquisition strategy ploys that pick a target: Denounce and Quarry (automatic). */
export function inquisitionPloy(g, side, ploy) {
  if (ploy.id === 'quarry') needChoice(g, side, 'quarry');
  if (ploy.id === 'denounce') needChoice(g, side, 'denounce');
}
export function denounceOn(g, side, t) {
  {
    if (t) {
      const n = d3();
      (g.denounce ||= [null, null])[side] = { tp: g.tp, uid: t.uid, n };
      ((g.denounceUses ||= [0, 0])[side])++;
      log(g, { zh: `揭發：${opName(t, 'zh')} 本回合要等對手啟動 ${n} 名特工後（或最後）才能行動`, en: `Denounce: ${opName(t, 'en')} can't activate until ${n} other operatives have (or it's the last)` }, `side${side}`);
    }
  }
}
