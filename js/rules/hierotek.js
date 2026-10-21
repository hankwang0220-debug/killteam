// hierotek: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CHOICES, CONTROL, aplNow, boardOf, canActivateOp, commsBonus, d3, d6, edgeDist, foes, getOp, isEngaged, living, log, needChoice, opName, radius, sameTeam, shootCheck, spend, team, teamZh, tpl, validTarget, visibility } from '../game.js';
import { dist, distPointRect } from '../geometry.js';
import { moveCtx } from '../path.js';
import { bestStep, stepTo } from '../sanctifiers.js';
import { TEAM_MAP } from '../data/teams.js';

// ---------- Hierotek Circle (the Chronomancer, the Psychomancer and the rest of the full roster) ----------
/** Which Cryptek flag grants each of these unique actions (an Apprentek has its Cryptek's actions). */
export const HC_ACTION_FLAG = { canoptekRepair: 'canoptekRepair', augment: 'augment', reinforce: 'reinforce', hcTimesplinter: 'chronomancer', hcNanomine: 'chronomancer', hcChronometron: 'chronomancer', hcVision: 'psychomancer', hcShroud: 'psychomancer', hcDespair: 'psychomancer' };
export const hcHas = (g, op, id) => { const f = HC_ACTION_FLAG[id]; if (tpl(op)[f]) return true; if (!tpl(op).apprentek) return false; const c = g.ops.find((o) => o.side === op.side && tpl(o).cryptek); return !!c && !!tpl(c)[f]; };
/** Effects that last until the caster's next activation: {by, ...}. */
export const hcOn = (g, key, side) => { const e = g[key]?.[side]; return e && !getOp(g, e.by)?.dead ? e : null; };
export function hcActivate(g, op) {
  if (g.counter) return;
  for (const k of ['hcNano', 'hcChrono', 'hcShroud', 'hcDespair']) if (g[k]?.[op.side]?.by === op.uid) g[k][op.side] = null;
  for (const o of g.ops) if (o.hcMad?.by === op.uid) o.hcMad = null; // (Vision of Madness)
  op.hcAmbush = false; // (Dimensional Ambush lasts until its next activation)
}
/** Countertemporal Nanomine: -2" Move within 4" of the enemy's marker. */
export const hcNanoNear = (g, op) => op.side < 2 && !!hcOn(g, 'hcNano', 1 - op.side) && dist(op, g.hcNano[1 - op.side]) - radius(op) <= 4;
/** Nightmare Shroud: an enemy within 4" of the Psychomancer can't re-roll attack dice or retain results below 6 as crits. */
export const hcShrouded = (g, op) => op.side < 2 && !!hcOn(g, 'hcShroud', 1 - op.side) && edgeDist(op, getOp(g, g.hcShroud[1 - op.side].by)) <= 4;
/** Harbinger of Despair: +1AP for Pick Up / mission actions within 2" of the enemy's Despair marker, and 1 lower for control. */
export const hcDespairNear = (g, op) => op.side < 2 && !!hcOn(g, 'hcDespair', 1 - op.side) && dist(op, g.hcDespair[1 - op.side]) - radius(op) <= 2;
/** Self actions: Nightmare Shroud, Harbinger of Despair (the Despair marker goes on the visible objective with most enemies near it). */
export function hcSelf(g, op, id) {
  if (id === 'hcShroud') { spend(g, op, id); (g.hcShroud ||= [null, null])[op.side] = { by: op.uid }; log(g, { zh: `${opName(op, 'zh')} 夢魘帷幕：4" 內的敵人攻擊時不能重擲、只有 6 算暴擊`, en: `${opName(op, 'en')} Nightmare Shroud: enemies within 4" can't re-roll attack dice or crit on less than 6` }, `side${op.side}`); return true; }
  if (id === 'hcDespair') {
    const near = (m) => foes(g, op).filter((e) => dist(e, m) <= 4).length;
    const m = (g.objectives || []).slice().sort((a, b) => near(b) - near(a) || dist(op, a) - dist(op, b))[0] || { x: op.x, y: op.y }; // (the marker's visibility from the Psychomancer isn't checked)
    spend(g, op, id); (g.hcDespair ||= [null, null])[op.side] = { by: op.uid, x: m.x, y: m.y };
    log(g, { zh: `${opName(op, 'zh')} 絕望先兆：在目標點放下絕望標記（2" 內的敵人撿標記與任務動作多 1AP，控制時 APL -1）`, en: `${opName(op, 'en')} Harbinger of Despair: the Despair marker goes on an objective (enemies within 2": +1AP to pick up / mission actions, 1 lower for control)` }, `side${op.side}`);
    return true;
  }
  return false;
}
/** Timesplinter: set the friendly back up within 5" of the Chronomancer, out of enemy sight if possible, else as close as it was. */
export function hcTimesplinterTo(g, op, t) {
  const from = { x: t.x, y: t.y }, ctx = moveCtx(g, t, 'reposition');
  let best = null;
  for (let r = 0.5; r <= 5; r += 0.5) for (let a = 0; a < 24; a++) {
    const p = { x: op.x + Math.cos(a * Math.PI / 12) * (r + radius(op) + radius(t)), y: op.y + Math.sin(a * Math.PI / 12) * (r + radius(op) + radius(t)) };
    if (!ctx.placement(p).ok || ctx.inEnemyER(p)) continue;
    const probe = { ...t, x: p.x, y: p.y };
    if (!visibility(g, op, probe).visible) continue;
    const seen = foes(g, t).filter((e) => e.x > -50 && visibility(g, e, probe).visible).length;
    const s = seen * 100 + dist(p, from);
    if (!best || s < best.s) best = { p, s };
  }
  if (best) { t.x = best.p.x; t.y = best.p.y; }
  return !!best;
}
/** Vision of Madness: when the opponent would activate it, a D6 equal to or above its APL stops that (if it has others to activate). */
export function hcMadness(g, op) {
  if (g.counter || !op.hcMad || op.hcMad.side === op.side) return true;
  if (!living(g, op.side).some((o) => o !== op && canActivateOp(g, o))) { op.hcMad = null; return true; }
  const r = d6();
  if (r >= aplNow(g, op)) {
    op.hcMadBlock = `${g.tp}:${(g.actCount || [])[op.side] || 0}`;
    log(g, { zh: `幻視瘋狂：擲 ${r}，${opName(op, 'zh')} 這次不能啟動`, en: `Vision of Madness: rolled ${r} — ${opName(op, 'en')} can't activate this time` }, `side${op.hcMad.side}`);
    return false;
  }
  log(g, { zh: `幻視瘋狂：擲 ${r}，${opName(op, 'zh')} 照常啟動，標記移除`, en: `Vision of Madness: rolled ${r} — ${opName(op, 'en')} activates; the token is removed` }, `side${op.hcMad.side}`);
  op.hcMad = null;
  return true;
}
export const hcMadBlocked = (g, o) => !!o.hcMadBlock && o.hcMadBlock === `${g.tp}:${(g.actCount || [])[o.side] || 0}`;
/** Command Underlings (strategy ploy): free Dashes near the Cryptek (6") or the Apprentek (3"). */
export function hcUnderMovers(g, side, ctx) {
  const lead = living(g, side).filter((o) => (ctx.mode === 'apprentek' ? tpl(o).apprentek : tpl(o).cryptek) && o.x > -50);
  return living(g, side).filter((o) => o.team === 'hierotek' && o.x > -50 && !isEngaged(g, o) && !lead.includes(o) && !(ctx.mode === 'apprentek' && tpl(o).cryptek)
    && lead.some((c) => edgeDist(c, o) <= (ctx.mode === 'apprentek' ? 3 : 6) && visibility(g, c, o).visible));
}
export function registerHierotekChoices() {
  CHOICES.hcUnderlings = {
    kind: 'option', title: { zh: '指揮下屬：誰下令？', en: 'Command Underlings: which leader?' },
    options: (g, side) => ['cryptek', 'apprentek'].filter((m) => hcUnderMovers(g, side, { mode: m }).length).map((m) => ({ value: m, label: m === 'cryptek' ? { zh: '技師：6" 內的友方免費衝刺', en: 'Cryptek: friendlies within 6" make free Dashes' } : { zh: '學徒：3" 內的友方免費衝刺', en: 'Apprentek: friendlies within 3" make free Dashes' } })),
    auto: (g, side) => ['cryptek', 'apprentek'].sort((a, b) => hcUnderMovers(g, side, { mode: b }).length - hcUnderMovers(g, side, { mode: a }).length)[0],
    none: () => {},
    apply: (g, side, mode) => needChoice(g, side, 'hcUnderMoves', { mode }),
  };
  CHOICES.hcUnderMoves = {
    kind: 'move', title: { zh: '指揮下屬：免費衝刺', en: 'Command Underlings: free Dashes' },
    movers: hcUnderMovers, moveKind: () => 'dash', max: () => 3,
    autoAll(g, side, ctx) {
      for (const o of hcUnderMovers(g, side, ctx)) {
        const objs = g.objectives || [], near = (p) => Math.min(...objs.map((m) => dist(m, p)));
        if (!objs.length || near(o) <= 1) continue;
        const q = bestStep(g, o, 3, 'dash', (p) => (near(p) < near(o) ? -near(p) : null));
        if (q) { stepTo(g, o, q); log(g, { zh: `指揮下屬：${opName(o, 'zh')} 免費衝刺`, en: `Command Underlings: ${opName(o, 'en')} makes a free Dash` }, `side${side}`); }
      }
    },
  };
}
/** Veriscant: friendly weapons have Lethal 5+ and Severe against this enemy until the Malocator's next activation. */
// ---------- Hierotek Circle ----------
export const isHierotek = (op) => !!TEAM_MAP[op.team].reanimation;
/** Living Metal: in the Ready step, each friendly regains up to D3+1 wounds. */
export function livingMetal(g, side) {
  if (!TEAM_MAP[g.teams[side]].livingMetal) return;
  for (const o of living(g, side).filter((x) => isHierotek(x) && x.wounds < x.maxW)) {
    const before = o.wounds;
    o.wounds = Math.min(o.maxW, o.wounds + d3() + 1);
    log(g, { zh: `${opName(o, 'zh')} 活體金屬：回復 ${o.wounds - before} 生命`, en: `${opName(o, 'en')} Living Metal: regains ${o.wounds - before} wounds` }, `side${side}`);
  }
}
/** Reanimation markers of a side whose operative can still come back. */
export const reanimMarkers = (g, side) => (g.reanim || []).filter((m) => m.side === side && getOp(g, m.uid)?.dead);
/** A place within 3" of the marker, not within control range of enemies (null if there's none). */
export function reanimSpot(g, op, m) {
  const r = radius(op);
  for (const d of [0, 0.8, 1.6, 2.4, 3]) {
    for (let i = 0; i < (d ? 12 : 1); i++) {
      const p = { x: m.x + Math.cos(i * Math.PI / 6) * d, y: m.y + Math.sin(i * Math.PI / 6) * d };
      if (p.x - r < 0 || p.y - r < 0 || p.x + r > boardOf(g).w || p.y + r > boardOf(g).h) continue;
      if (g.terrain.some((t) => distPointRect(p, t) < r)) continue;
      if (g.ops.some((o) => o !== op && !o.dead && o.x > -50 && dist(o, p) < radius(o) + r + 0.05)) continue;
      if (foes(g, op).some((e) => dist(e, p) - radius(e) - r <= CONTROL)) continue;
      return p;
    }
  }
  return null;
}
/** REANIMATED: back with 1 wound; the opponent's kill (if it counted) is taken back. */
export function reanimate(g, m, ready) {
  const op = getOp(g, m.uid);
  const p = reanimSpot(g, op, m);
  if (!p) return false;
  Object.assign(op, { reanimatedTP:g.tp, dead: false, wounds: 1, x: p.x, y: p.y, ready, order: 'conceal', poison: false, aplNext: 0, aplKeep: false, ml: 0, jam: false, grudge: {}, dmk: null, acted: {}, ap: 0, bloodToken: false, stimms: null });
  g.reanim = g.reanim.filter((x) => x !== m);
  if (op.killCounted) { op.killCounted = false; g.kills[1 - op.side] = Math.max(0, g.kills[1 - op.side] - 1); }
  log(g, { zh: `✦ ${opName(op, 'zh')} 復甦！以 1 生命回到場上（對手擊殺數 -1）`, en: `✦ ${opName(op, 'en')} is REANIMATED with 1 wound (the opponent loses a kill)` }, `side${op.side}`);
  return true;
}
/** Reanimation Protocols in the Ready step: try markers (toughest operative first) until one rolls a 3+. */
export function readyReanimation(g, side) {
  const ms = reanimMarkers(g, side).sort((a, b) => getOp(g, b.uid).maxW - getOp(g, a.uid).maxW);
  for (const m of ms) {
    const r = d6();
    const ok = r >= 3 && reanimate(g, m, true);
    if (!ok) log(g, { zh: `${teamZh(g, side)} 復甦協議：${opName(getOp(g, m.uid), 'zh')} 擲 ${r}，沒有復甦`, en: `${team(g, side).name.en} Reanimation Protocols: ${opName(getOp(g, m.uid), 'en')} rolled ${r}, no reanimation` }, `side${side}`);
    if (ok) return;
  }
}
/** Reanimate (Plasmacyte Reanimator): markers visible to and within 6" of it. */
export const reanimTargets = (g, op) => reanimMarkers(g, op.side)
  .filter((m) => dist(op, m) - radius(op) <= 6 && visibility(g, op, { ...getOp(g, m.uid), x: m.x, y: m.y }).visible);
export function doReanimate(g, op, sure) {
  const id = sure ? 'reanimateSure' : 'reanimate';
  spend(g, op, id);
  const m = reanimTargets(g, op).sort((a, b) => getOp(g, b.uid).maxW - getOp(g, a.uid).maxW)[0];
  if (!m) return;
  const r = sure ? null : d6();
  const dead = getOp(g, m.uid);
  log(g, { zh: `${opName(op, 'zh')} 復甦：${opName(dead, 'zh')}${sure ? '（多花 1AP，自動成功）' : `（擲 ${r}）`}`, en: `${opName(op, 'en')} Reanimate: ${opName(dead, 'en')}${sure ? ' (extra AP: automatic)' : ` (rolled ${r})`}` }, `side${op.side}`);
  if ((sure || r >= 3) && !reanimate(g, m, dead.diedReady === g.tp)) log(g, { zh: '標記附近沒有可以放置的位置', en: 'No room to set it up near the marker' }, `side${op.side}`);
}
/**
 * Magnify: another friendly Cryptek / Apprentek (Engage order, not in an enemy's control range, visible to the
 * shooter) to determine valid targets, cover and obscured from. Returns the operative giving the best line
 * (null if none is better than shooting normally — ties go to Magnify for its Ceaseless).
 */
export function magnifyRelay(g, op, target, weapon) {
  if (!weapon.rules.magnify || !visibility(g, op, target).visible) return null;
  const rank = (v) => (!v ? 9 : (v.cover ? 1 : 0) + (v.obscured ? 2 : 0));
  let best = null, bestRank = rank(validTarget(g, op, target, weapon));
  for (const r of living(g, op.side)) {
    if (r === op || !(tpl(r).cryptek || tpl(r).apprentek || weapon.rules.feRelay && !/plasmacyte/i.test(tpl(r).name.en)) || r.order !== 'engage' || isEngaged(g, r) || !visibility(g, op, r).visible) continue;
    const k = rank(validTarget(g, r, target, weapon));
    if (k < 9 && k <= bestRank) { best = r; bestRank = k; }
  }
  return best;
}
/** Interstitial Command: friendlies (not Crypteks / Apprenteks) that can take the free Shoot now. */
export function interstitialTargets(g, op) {
  const despoteks = living(g, op.side).filter((d) => tpl(d).despotek && d !== op && visibility(g, op, d).visible);
  return living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && !tpl(t).cryptek && !tpl(t).apprentek
    && t.commandTP !== g.tp && t.shotTP !== g.tp && !isEngaged(g, t)
    && ((edgeDist(op, t) <= 6 + commsBonus(g, op) && visibility(g, op, t).visible) || (!tpl(op).despotek && despoteks.some((d) => edgeDist(d, t) <= 6 && visibility(g, d, t).visible)))
    && proxyShots(g, t).length > 0);
}
/** Shots the operative could take as Interstitial Command's free Shoot: [{w, t}]. */
export function proxyShots(g, t) {
  const keep = { ap: t.ap, acted: t.acted };
  t.ap = 1; t.acted = {};
  const out = [];
  for (const w of tpl(t).weapons.filter((x) => x.type === 'ranged')) for (const e of foes(g, t)) if (shootCheck(g, t, e, w).ok) out.push({ w, t: e });
  t.ap = keep.ap; t.acted = keep.acted;
  return out;
}
/** Start the free Shoot: the commanded operative gets 1AP for it (g.proxy until it shoots or the activation ends). */
export function startProxy(g, op, t) {
  t.commandTP = g.tp; t.ap = 1; t.acted = {};
  g.proxy = { uid: t.uid, by: op.uid };
  op.acted.proxyFor = t.uid;
}
export function endProxy(g) {
  const p = g.proxy && getOp(g, g.proxy.uid);
  if (p) { p.ap = 0; p.acted = {}; }
  const by = g.proxy && getOp(g, g.proxy.by);
  if (by?.acted) by.acted.proxyFor = null;
  g.proxy = null;
}
