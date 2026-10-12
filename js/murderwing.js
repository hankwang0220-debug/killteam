import { ACTIONS, TARGET_ACTIONS, tpl, living, foes, radius, edgeDist, isEngaged, visibility, spend, applyDamage, changeApl, d6, d3, hasPloy, availableActions, readyOps, log, ffReady, ffArmed } from './game.js';
import { dist } from './geometry.js';
import { moveCtx, findPath, wholeInchPath } from './path.js';
import { MURDERWING_TEAM, murderwingRosterError } from './data/murderwing.js';
import { mdFallBack } from './mandrakes.js';
export const isMurderwing = (o) => o?.team === 'murderwing';
const equip = (g, o, id) => g.equip?.[o.side]?.includes(id);
const distPointSeg = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy; const t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)) : 0; return dist(p, { x: a.x + t * dx, y: a.y + t * dy }); };
const note = (g, o, zh, en) => log(g, { zh, en }, `side${o.side}`);
export function mwSetup(g, roster, choices) {
  for (const side of [0, 1]) if (g.teams[side] === 'murderwing') {
    const error = murderwingRosterError(MURDERWING_TEAM, roster[side], choices[side]);
    if (error) throw new Error(error.en);
    for (const o of living(g, side)) if (tpl(o).mwLord) o.damnation = 1;
  }
}
export function mwStrategy(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'murderwing') {
    const champ = living(g, side).find((o) => tpl(o).mwChampion);
    if (!champ) continue;
    const t = foes(g, champ).sort((a, b) => edgeDist(a, champ) - edgeDist(b, champ))[0];
    (g.mwChallenge ||= [null, null])[side] = t?.uid || null;
  }
}
export function mwActivation(g) {
  // Boons are once per action; the receiving Lord can be outside the active side.
  for (const t of living(g)) { t.mwWoundedStart = t.wounds < t.maxW; t.mwBoonUsed = false; }
}
export function mwActionStart(g) { for (const t of living(g)) t.mwBoonUsed = false; }
export function mwBoon(g, o) {
  if (!tpl(o).mwLord || o.dead || o.mwBoonUsed) return 0;
  o.mwBoonUsed = true;
  const n = o.damnation || 1, roll = n === 6 ? 7 : d6();
  if (roll > n) { o.damnation = Math.min(6, n + 1); note(g, o, `詛咒恩賜成功（${n} 點）`, `Boon of Damnation succeeds (${n} points)`); return n; }
  if (roll < n) applyDamage(g, o, o, n);
  note(g, o, `詛咒恩賜失敗（擲 ${roll}）`, `Boon of Damnation fails (rolled ${roll})`);
  return 0;
}
export function mwRules(g, o, w, t, r) {
  if (!isMurderwing(o)) return;
  if (o.acted?.mwBoost && hasPloy(g, o.side, 'mwPredators')) r.balanced = true;
  if (t && hasPloy(g, o.side, 'mwCull') && (t.mwWoundedStart || (t.aplNext || 0) < 0)) r.punishing = true;
  if (w.type === 'melee' && tpl(o).mwChampion && g.mwChallenge?.[o.side] === t?.uid) r.severe = true;
}
export function mwDelay(g, o, useFF) {
  if (!isMurderwing(o) || g.counter || g.mdResume || readyOps(g, o.side).length !== 1 || readyOps(g, 1 - o.side).length <= 1) return false;
  if (g.mwDelayTP?.[o.side] !== g.tp) {
    if (!useFF(g, o.side, 'mwNarcissism')) return false;
    (g.mwDelayTP ||= [0, 0])[o.side] = g.tp;
  }
  g.turn = 1 - o.side;
  note(g, o, '惡意自戀：延後啟動', 'Malicious Narcissism: delay activation');
  return true;
}
export function mwFallBack(g, o) {
  for (const e of foes(g, o).filter((e) => tpl(e).mwHunt && edgeDist(e, o) <= 1.01 && foes(g, e).filter((t) => edgeDist(t, e) <= 1.01).length === 1)) {
    if (Array.from({ length: o.maxW > e.maxW ? 1 : 2 }, d6).some((x) => x >= 4)) {
      o.acted.fallBackDenied = true; note(g, e, '釘住獵物：撤退被阻止', 'Pinned Prey prevents Fall Back'); return false;
    }
  }
  return true;
}
function landing(g, o, target, max, engage, moving = false) {
  const ctx = moveCtx(g, o, 'reposition'), candidates = [];
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
    const r = radius(o) + radius(target) + (engage ? 0.05 : 1.1);
    const p = { x: target.x + Math.cos(angle) * r, y: target.y + Math.sin(angle) * r };
    if (!ctx.free(p) || (!engage && ctx.inEnemyER(p))) continue;
    const raw = findPath(ctx, p), path = moving && raw ? wholeInchPath(ctx, raw, max, engage ? ctx.inEnemyER : (q) => !ctx.inEnemyER(q)) : raw;
    if (path && path.len <= max + 0.01) candidates.push({ p: path.pts.at(-1), path });
  }
  return candidates.sort((a, b) => a.path.len - b.path.len)[0];
}
export function mwMoved(g, o, kind, path, start, pursuers) {
  if (isMurderwing(o) && !o.counter && ['reposition', 'fallBack', 'charge'].includes(kind) && path.len > 0.01) {
    o.mwBoostTP = g.tp; o.acted.mwBoost = true;
    if (o.acted.mwWings) o.mwAttackLockTP = g.tp;
    if (tpl(o).mwRaptor) { const delta = o.aplNext || 0; o.aplNext = 0; o.aplKeep = false; o.ap -= Math.max(-1, Math.min(1, delta)); o.acted.mwIgnoreInjury = true; }
    const ts = foes(g, o).filter((t) => distPointSeg(t, start, o) <= radius(t) + radius(o) + 0.01).sort((a, b) => a.wounds - b.wounds);
    if (!o.acted.mwBoostAction && kind === 'charge' && equip(g, o, 'mwArmour') && !o.acted.mwCarving) {
      const t = foes(g, o).find((e) => edgeDist(e, o) <= 1.01);
      if (t) { o.acted.mwBoostAction = true; o.acted.mwClawed = true; applyDamage(g, o, t, 1); }
    } else if (!o.acted.mwBoostAction && kind !== 'charge' && o.ap >= 1 && ts.length) {
      const t = ts[0]; let used = false;
      if (tpl(o).mwSnatch) {
        used = true;
        if (d6() + o.maxW > d6() + t.maxW) {
          const p = landing(g, t, o, dist(t, o), true);
          if (p && edgeDist({ ...t, ...p.p }, o) <= edgeDist(t, o) + 0.01) Object.assign(t, p.p);
        }
      } else if (tpl(o).mwHunt) { used = true; applyDamage(g, o, t, d3() + d3() + 1); }
      else if (tpl(o).mwShriek && o.order === 'engage' && !o.acted.mwShriek && (!isEngaged(g, o) || edgeDist(o, t) <= 1.01)) { used = true; applyDamage(g, o, t, d3()); changeApl(g, t, -1); o.acted.mwShriek = 1; }
      else if (equip(g, o, 'mwBladefins') && !o.acted.mwCarving) { used = true; applyDamage(g, o, t, d3() + 1); o.acted.mwSlice = true; }
      if (used) { spend(g, o, 'mwBoostAction', 1); note(g, o, '噴射通道動作（1AP）', 'Boost-zone action (1AP)'); }
    }
  }
  if (kind === 'fallBack' && !o.counter && g.active === o.uid) {
    for (const e of pursuers || []) if (equip(g, e, 'mwFuel') && g.mwFuelTP?.[e.side] !== g.tp) {
      const p = landing(g, e, o, 3, e.order === 'engage', true);
      if (p) { Object.assign(e, p.p); (g.mwFuelTP ||= [0, 0])[e.side] = g.tp; note(g, e, '次元燃料：免費追擊', 'Warp Fuel: free pursuit'); break; }
    }
  }
}
export function mwActions(g, o, add) {
  if (!isMurderwing(o)) return;
  const engage = o.order === 'engage', reason = { zh: '條件不符或已使用', en: 'Unavailable or already used' };
  if (tpl(o).mwShriek) add('mwShriek', engage && !o.acted.mwShriek && TARGET_ACTIONS.mwShriek.targets(g, o).length > 0, reason);
  if (tpl(o).mwCarving) add('mwCarving', engage && !o.acted.mwCarving && !o.acted.mwSlice && !o.acted.mwClawed && (o.acted.fight || 0) < 2 && o.mwAttackLockTP !== g.tp && living(g).some((t) => t !== o && edgeDist(o, t) <= 2.01 && visibility(g, o, t).visible), reason);
  if (equip(g, o, 'mwVox')) add('mwVox', engage && g.mwVoxTP?.[o.side] !== g.tp && foes(g, o).some((t) => edgeDist(o, t) <= 2.01), reason);
}
export function mwSelf(g, o, id) {
  if (!['mwCarving', 'mwVox'].includes(id) || !availableActions(g, o).find((a) => a.id === id)?.ok) return false;
  mwActionStart(g); spend(g, o, id);
  if (id === 'mwCarving') for (const t of living(g).filter((t) => t !== o && edgeDist(o, t) <= 2.01 && visibility(g, o, t).visible)) applyDamage(g, o, t, d3() + d3());
  else { (g.mwVoxTP ||= [0, 0])[o.side] = g.tp; for (const t of foes(g, o).filter((t) => edgeDist(o, t) <= 2.01)) if (d6() >= 3) changeApl(g, t, -1); }
  return true;
}
export function mwHonour(g, o, enemy, crit, useFF) {
  if (!crit || !isMurderwing(o) || o.dead || enemy.dead || o.wounds > 7 || !ffReady(g, o.side, 'mwHonour') || !ffArmed(g, o.side, 'mwHonour')) return false;
  const p = landing(g, o, enemy, 3, false, true);
  if (!p || !useFF(g, o.side, 'mwHonour')) return false;
  g.fight.A.c = g.fight.A.n = g.fight.D.c = g.fight.D.n = 0;
  if (mwFallBack(g, o) && mdFallBack(g, o, d6, d3) && !o.dead) Object.assign(o, p.p);
  return true;
}
export function registerMurderwingActions() {
  for (const [id, zh, en] of [['mwShriek', '尖嘯', 'Shriek'], ['mwCarving', '雕斬', 'Carving Blow'], ['mwVox', '擴音吼叫', 'Vox-cry']]) ACTIONS[id] = { ap: 1, name: { zh, en } };
  TARGET_ACTIONS.mwShriek = { targets: (g, o) => foes(g, o).filter((t) => edgeDist(o, t) <= 6.01 && visibility(g, o, t).visible && (!isEngaged(g, o) || edgeDist(o, t) <= 1.01)), apply(g, o, t) { mwActionStart(g); applyDamage(g, o, t, d3()); changeApl(g, t, -1); return { zh: '尖嘯：D3 傷害、APL -1', en: 'Shriek: D3 damage and -1 APL' }; } };
}
