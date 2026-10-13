// Nemesis Claw (復仇之爪) rules engine: Prescience, Terrorchem, In Midnight Clad, Disconcerting Mimicry, the ploys and the
// faction equipment. game.js calls these hooks; the team data is in data/nightlords.js.
import { ACTIONS, TARGET_ACTIONS, CONTROL, OBJ_R, applyDamage, changeApl, controller, d3, d6, edgeDist, engagedEnemies, foes, handOff, hasPloy, hasReady, isEngaged, isInjured, living, log, opName, radius, spend, team, tpl, visibility } from './game.js';
import { dist, distPointRect } from './geometry.js';
import { moveCtx, wholeInchPath } from './path.js';
import { NIGHTLORDS_TEAM, nightlordsRosterError } from './data/nightlords.js';

export const isNC = (o) => o?.team === 'nemesisClaw';
const equip = (g, side, id) => !!g.equip?.[side]?.includes(id);
const note = (g, side, zh, en) => log(g, { zh, en }, `side${side}`);
const IMPERIUM = ['angels', 'phobos', 'deathwatch', 'deathKorps', 'kasrkin', 'exaction', 'navyBreachers', 'hunterClade', 'battleclade', 'novitiates', 'celestianInsidiants', 'elucidianStarstriders', 'inquisitorialAgents'];
const ADEPTUS_ASTARTES = ['angels', 'phobos', 'deathwatch'];

export function ncSetup(g, roster) {
  g.prescience = [0, 0];
  for (const side of [0, 1]) if (g.teams[side] === 'nemesisClaw') {
    const error = nightlordsRosterError(NIGHTLORDS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
  }
}

// ---------- Prescience (Visionary) ----------
const visionary = (g, side) => living(g, side).find((o) => tpl(o).ncVisionary);
/** Prescience points: none can be gained or spent if the Visionary is incapacitated. */
export const prescienceOf = (g, side) => (visionary(g, side) ? g.prescience?.[side] || 0 : 0);
const usedPres = (g, side, k) => g.ncUsed?.[side]?.[k] === g.tp;
function spendPres(g, side, k) {
  g.prescience[side]--;
  (g.ncUsed ||= [{}, {}])[side][k] = g.tp;
}
/** The Ready step: D3 Prescience points for each side with a Visionary. */
export function ncReady(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'nemesisClaw' && visionary(g, side)) {
    const n = d3();
    g.prescience[side] += n;
    note(g, side, `預知：獲得 ${n} 點預知點數（共 ${g.prescience[side]}）`, `Prescience: gains ${n} point(s) (${g.prescience[side]} total)`);
  }
}
/** The end of a turning point: unspent Prescience points are discarded. */
export function ncTPEnd(g) { if (g.prescience) g.prescience = [0, 0]; }
/** Portent: a Normal Dmg die inflicting damage on the Visionary can be ignored (1 point, once per TP). */
export function ncPortent(g, foeOp) {
  if (!tpl(foeOp).ncVisionary || foeOp.dead || prescienceOf(g, foeOp.side) < 1 || usedPres(g, foeOp.side, 'portent')) return false;
  spendPres(g, foeOp.side, 'portent');
  note(g, foeOp.side, `${opName(foeOp, 'zh')} 預兆：無視這顆骰的普通傷害（剩 ${g.prescience[foeOp.side]} 點）`, `${opName(foeOp, 'en')} Portent: ignores that Normal Dmg (${g.prescience[foeOp.side]} point(s) left)`);
  return true;
}
/** Foreboding: when it's your turn to activate, spend a point to skip that activation (once per TP). */
export const canForeboding = (g, side) => g.teams[side] === 'nemesisClaw' && g.phase === 'firefight' && g.turn === side && !g.active && !g.counter && !g.chain
  && prescienceOf(g, side) > 0 && !usedPres(g, side, 'foreboding') && hasReady(g, 1 - side);
export function ncForeboding(g, side) {
  if (!canForeboding(g, side)) return false;
  spendPres(g, side, 'foreboding');
  note(g, side, `${team(g, side).name.zh} 預感：跳過這次啟動（剩 ${g.prescience[side]} 點）`, `${team(g, side).name.en} Foreboding: skips this activation (${g.prescience[side]} point(s) left)`);
  handOff(g, side);
  return true;
}

// ---------- Terrorchem (Fearmonger) ----------
const hasToken = (o, side) => !!o.terrorchem?.[side];
function giveToken(g, side, o, why) {
  if (o.dead || o.side > 1 || hasToken(o, side)) return false;
  (o.terrorchem ||= [false, false])[side] = true;
  note(g, side, `${opName(o, 'zh')} 獲得恐懼毒標記（${why.zh}）`, `${opName(o, 'en')} gains a Terrorchem token (${why.en})`);
  return true;
}
/** Terrorchem weapons: damage inflicted with a critical success (Devastating included) gives the target a token. s: the sequence result. */
export function ncTerror(g, op, weapon, target, s) {
  if (!weapon.rules.terrorchem || !target || target.dead || !isNC(op)) return;
  if (s.dev > 0 || (s.remC > 0 && s.dmg > 0)) giveToken(g, op.side, target, { zh: '暴擊傷害', en: 'critical damage' });
}
export const ncFightToken = (g, op, weapon, target, crit, dmg) => { if (crit && dmg > 0 && weapon.rules.terrorchem && isNC(op)) giveToken(g, op.side, target, { zh: '暴擊傷害', en: 'critical damage' }); };
/** Terrorchem Poison: whenever an operative with a token is activated, D3 damage (once per TP per token owner). */
export function ncActivate(g, op) {
  if (g.counter || op.side > 1) return;
  for (const s of [0, 1]) if (hasToken(op, s) && (op.terrorTP?.[s] ?? 0) !== g.tp) {
    (op.terrorTP ||= [0, 0])[s] = g.tp;
    const d = d3();
    note(g, s, `恐懼毒：${opName(op, 'zh')} 啟動，受到 ${d} 傷害`, `Terrorchem Poison: ${opName(op, 'en')} activates and takes ${d} damage`);
    applyDamage(g, null, op, d);
    if (op.dead) return;
  }
}
/** Poison Objective (Fearmonger): an objective marker it controls, clear of enemies and without its token yet. */
const poisonTarget = (g, op) => (g.objectives || []).find((o) => controller(g, o) === op.side && dist(op, o) - radius(op) - OBJ_R <= CONTROL + 0.01
  && !o.terrorchem?.[op.side] && !foes(g, op).some((e) => dist(e, o) - radius(e) - OBJ_R <= CONTROL + 0.01));
/** The first enemy without a token to contest a poisoned objective marker gains it and takes 2D3. */
export function ncPoisonCheck(g) {
  for (const o of g.objectives || []) for (const s of [0, 1]) {
    if (!o.terrorchem?.[s]) continue;
    for (const e of living(g, 1 - s).filter((x) => x.side < 2 && !hasToken(x, s) && dist(x, o) - radius(x) - OBJ_R <= CONTROL + 0.01)) {
      giveToken(g, s, e, { zh: '爭奪被下毒的目標點', en: 'contesting a poisoned objective' });
      const d = d3() + d3();
      note(g, s, `毒目標點：${opName(e, 'zh')} 受到 ${d} 傷害`, `Poison Objective: ${opName(e, 'en')} takes ${d} damage`);
      applyDamage(g, null, e, d);
    }
  }
}

// ---------- In Midnight Clad ----------
/** An enemy shooting a friendly more than 8" from every enemy it's visible to, within 1" of Heavy terrain: it is obscured (stacking with cover). */
export function ncObscure(g, shooter, target, vis) {
  if (!isNC(target) || !vis.visible || vis.obscured || target.side === shooter.side) return vis;
  if (living(g, 1 - target.side).some((e) => e.side < 2 && edgeDist(e, target) <= 8 && visibility(g, e, target).visible)) return vis;
  if (!g.terrain.some((t) => t.kind === 'heavy' && distPointRect(target, t) - radius(target) <= CONTROL + 0.01)) return vis;
  return { ...vis, obscured: true, defenceOptions: [{ cover: !!vis.cover, obscured: true }] };
}

// ---------- weapon rules ----------
const trophyNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((f) => isNC(f) && f.ncTrophy && edgeDist(f, op) <= 2 && visibility(g, f, op).visible);
/** Screecher: enemies within 3" can't re-roll their attack dice. */
export const ncScreeched = (g, op) => op.side < 2 && living(g, 1 - op.side).some((o) => isNC(o) && tpl(o).ncScreecher && edgeDist(o, op) <= 3);
export function ncRules(g, op, weapon, target, r) {
  if (isNC(op) && target) {
    if (hasPloy(g, op.side, 'ncBlackHunt') && target.wounds < target.maxW) r.balanced = true; // The Black Hunt
    if (tpl(op).ncCruel && (isInjured(target) || tpl(target).wounds <= 7)) r.lethal = Math.min(r.lethal || 6, 5); // Cruel Tormenter
    if (tpl(op).ncAppetite && weapon.type === 'melee' && target.wounds < target.maxW) r.lethal = Math.min(r.lethal || 6, 4); // Appetite for Cruelty
  }
  if (target && isNC(target) && target.side !== op.side && equip(g, target.side, 'ncSkin') && edgeDist(op, target) <= 2) r.noReroll1 = true; // Flayed Skin
  if (trophyNear(g, op)) r.atkMinus = (r.atkMinus || 0) + 1; // Grisly Trophy
}
/** Preysight: an extra ranged version of each weapon with Range 6" and Seek Light while the ploy is on (Limited weapons excepted). */
export function ncWeapons(g, op, ws) {
  if (!isNC(op) || !hasPloy(g, op.side, 'ncPreysight') || tpl(op).actionsOnly) return ws;
  return [...ws, ...ws.filter((w) => w.type === 'ranged' && !w.rules.limited && !w.rules.equipGrenade && !w.ps).map((w) => ({
    ...w, id: `${w.id}_ps`, ps: true, name: { zh: `${w.name.zh}（獵物視線）`, en: `${w.name.en} (Preysight)` }, rules: { ...w.rules, range: 6, seekLight: true },
  }))];
}
/** Comms Jammers: an enemy within 3" of a friendly can't have its APL added to. */
export const ncJammed = (g, op) => op.side < 2 && living(g, 1 - op.side).some((o) => isNC(o) && equip(g, o.side, 'ncJammers') && edgeDist(o, op) <= 3);
/** Death to the False Emperor: after rolling against an IMPERIUM operative — Ceaseless (Relentless against ADEPTUS ASTARTES). */
export function ncDeath(g, op, target, pool, useFF, retally) {
  if (!isNC(op) || !pool || target.side > 1 || target.side === op.side) return;
  const keys = team(g, target.side).keywords || [];
  if (!IMPERIUM.includes(target.team) && !keys.includes('IMPERIUM')) return;
  const relentless = ADEPTUS_ASTARTES.includes(target.team) || keys.includes('ADEPTUS ASTARTES');
  const want = (d) => !d.auto && !d.rr && (relentless ? d.res === 'miss' : d.v === 1);
  if (!pool.dice.some(want) || !useFF(g, op.side, 'ncDeathFalse')) return;
  for (const d of pool.dice) if (want(d)) { d.v = d6(); d.rr = true; }
  retally(pool);
  note(g, op.side, `誅殺偽帝：${opName(op, 'zh')} 用「${relentless ? '無情' : '無休'}」重擲`, `Death to the False Emperor: ${opName(op, 'en')} re-rolls with ${relentless ? 'Relentless' : 'Ceaseless'}`);
}

// ---------- ploys ----------
/** We Have Come For You (first action a Charge: D3 to an enemy in control range) and the Poison Objective check. */
export function ncMoved(g, op, kind, first) {
  if (kind === 'charge' && first && isNC(op) && !op.dead && hasPloy(g, op.side, 'ncWeCome')) {
    const e = engagedEnemies(g, op).filter((x) => x.side < 2).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) { const d = d3(); note(g, op.side, `我們為你而來：${opName(e, 'zh')} 受到 ${d} 傷害`, `We Have Come For You: ${opName(e, 'en')} takes ${d} damage`); applyDamage(g, op, e, d); }
  }
  ncPoisonCheck(g);
}
/** Return to Darkness: a friendly makes a free move (up to 4") to end beside Heavy terrain, not closer to any enemy — automatic. */
export function ncReturn(g, side) {
  if (g.teams[side] !== 'nemesisClaw' || !hasPloy(g, side, 'ncReturn') || g.ncReturnTP?.[side] === g.tp) return;
  (g.ncReturnTP ||= [0, 0])[side] = g.tp;
  const heavy = g.terrain.filter((t) => t.kind === 'heavy');
  let best = null;
  for (const o of living(g, side).filter(isNC)) {
    const enemies = foes(g, o).filter((e) => e.side < 2);
    if (!enemies.length || !heavy.length) continue;
    const ctx = moveCtx(g, o, 'reposition'), holds = (g.objectives || []).some((m) => controller(g, m) === side && dist(o, m) - radius(o) - OBJ_R <= CONTROL);
    const seenBy = (p) => enemies.filter((e) => visibility(g, e, { ...o, x: p.x, y: p.y }).visible).length;
    const now = seenBy(o), nearest = Math.min(...enemies.map((e) => edgeDist(o, e)));
    for (const r of [4, 3, 2, 1]) for (let a = 0; a < 16; a++) {
      const p = { x: o.x + Math.cos(a * Math.PI / 8) * r, y: o.y + Math.sin(a * Math.PI / 8) * r };
      if (!ctx.free(p) || !heavy.some((t) => distPointRect(p, t) - radius(o) <= CONTROL + 0.01)) continue;
      const path = wholeInchPath(ctx, { pts: [{ x: o.x, y: o.y }, p] }, 4, (q) => !ctx.inEnemyER(q));
      if (!path || !ctx.segFree(o, p) || ctx.climbs?.(path.pts)) continue;
      const q = path.pts.at(-1), at = { ...o, x: q.x, y: q.y };
      if (Math.min(...enemies.map((e) => edgeDist(at, e))) < nearest - 0.01) continue; // not closer to the enemy (its nearest one)
      if (holds && !(g.objectives || []).some((m) => controller(g, m) === side && dist(at, m) - radius(o) - OBJ_R <= CONTROL)) continue;
      const score = (now - seenBy(q)) * 2 + 1;
      if (!best || score > best.score) best = { o, q, score };
    }
  }
  if (!best) { note(g, side, '回歸黑暗：沒有合適的落點', 'Return to Darkness: no suitable destination'); return; }
  Object.assign(best.o, { x: best.q.x, y: best.q.y });
  note(g, side, `回歸黑暗：${opName(best.o, 'zh')} 免費移動到重型地形旁`, `Return to Darkness: ${opName(best.o, 'en')} moves free beside Heavy terrain`);
}
/**
 * Vox Scream (automatic): the opponent would activate an operative a friendly can see. D6 above its APL and it can't activate this
 * time (they pick another); otherwise the CP is refunded and it can't be used again this turning point.
 */
export function ncScream(g, op, useFF) {
  if (g.ncScream === op.uid) { if (living(g, op.side).some((o) => o !== op && o.ready)) return true; g.ncScream = null; return false; } // (blocked once; free again if nothing else is ready)
  if (g.counter || op.side > 1) return false;
  const nc = 1 - op.side;
  if (g.teams[nc] !== 'nemesisClaw' || !living(g, op.side).some((o) => o !== op && o.ready && o.uid !== g.ncScream)) return false;
  if (!living(g, nc).some((f) => isNC(f) && visibility(g, f, op).visible)) return false;
  if (!useFF(g, nc, 'ncVox')) return false;
  const roll = d6(), apl = tpl(op).apl;
  if (roll > apl) {
    g.ncScream = op.uid;
    note(g, nc, `尖嚎：擲 ${roll}，${opName(op, 'zh')} 這次不能啟動`, `Vox Scream: rolled ${roll}, ${opName(op, 'en')} can't activate this time`);
    return true;
  }
  g.cp[nc] += 1;
  note(g, nc, `尖嚎：擲 ${roll}，沒有效果（CP 退還，本回合不能再用）`, `Vox Scream: rolled ${roll}, no effect (CP refunded; not again this TP)`);
  return false;
}
/** A kill by a friendly: Grisly Trophy, Flay Them Alive and Proclivity for Murder. */
export function ncKill(g, src, target, useFF) {
  if (!src || src.dead || src.side > 1 || src.side === target.side || !isNC(src)) return;
  if (equip(g, src.side, 'ncTrophy') && !g.ncTrophyUsed?.[src.side] && edgeDist(src, target) <= 2 && !src.ncTrophy) {
    (g.ncTrophyUsed ||= [false, false])[src.side] = true; src.ncTrophy = true;
    note(g, src.side, `${opName(src, 'zh')} 獲得血腥戰利品標記`, `${opName(src, 'en')} gains a Grisly Trophy token`);
  }
  const adjacent = edgeDist(src, target) <= CONTROL + 0.01;
  if (tpl(src).ncFlay && adjacent && src.flayTP !== g.tp) {
    const e = foes(g, src).filter((x) => x.side < 2 && x !== target && (edgeDist(x, src) <= 6 || edgeDist(x, target) <= 6) && (visibility(g, src, x).visible || visibility(g, target, x).visible))
      .sort((a, b) => tpl(b).apl - tpl(a).apl || b.wounds - a.wounds)[0];
    if (e) { src.flayTP = g.tp; e.ncFlayTP = g.tp; note(g, src.side, `活剝：${opName(e, 'zh')} 本回合不能控制標記或執行任務動作`, `Flay Them Alive: ${opName(e, 'en')} can't control markers or perform mission actions this TP`); }
  }
  if (adjacent && useFF(g, src.side, 'ncMurder')) {
    src.acted.free = { ...(src.acted.free || {}), charge: 'murder', dash: 'murder' };
    note(g, src.side, `嗜殺成性：${opName(src, 'zh')} 可以免費衝鋒（最多 3"）或衝刺一次`, `Proclivity for Murder: ${opName(src, 'en')} may make a free Charge (up to 3") or Dash`);
  }
}
/** Chain Snare: an enemy about to Fall Back from a friendly's control range (the only enemy there): two D6, any 4+ and it can't. */
export function ncSnare(g, o) {
  for (const e of foes(g, o).filter((x) => isNC(x) && equip(g, x.side, 'ncSnare') && edgeDist(x, o) <= CONTROL + 0.01 && g.ncSnareTP?.[x.side] !== g.tp)) {
    if (foes(g, e).filter((x) => edgeDist(e, x) <= CONTROL + 0.01).length !== 1) continue;
    const rs = Array.from({ length: o.maxW > e.maxW ? 1 : 2 }, d6);
    note(g, e.side, `鎖鏈陷阱：${rs.join('、')}`, `Chain Snare: ${rs.join(', ')}`);
    if (rs.some((r) => r >= 4)) { (g.ncSnareTP ||= [0, 0])[e.side] = g.tp; o.acted.fallBackDenied = true; return true; }
  }
  return false;
}

// ---------- actions ----------
/** (A hoisted function, not a const: game.js calls registerNightlordsActions while this module is still being evaluated — the two import each other.) */
function mimicTable() { return { apl: ['ncMimicApl', '變聲：APL -1', 'Mimicry: -1 APL'], order: ['ncMimicOrder', '變聲：改變指令', 'Mimicry: change order'], dash: ['ncMimicDash', '變聲：免費衝刺', 'Mimicry: free Dash'] }; }
/** Where a free Dash (up to 3") would take an enemy — away from the objectives, towards our guns; null if it can't move. */
function dashSpot(g, t, from) {
  const ctx = moveCtx(g, t, 'dash'), objs = g.objectives || [], ours = living(g, from.side).filter(isNC);
  let best = null;
  for (const r of [3, 2, 1]) for (let a = 0; a < 16; a++) {
    const p = { x: t.x + Math.cos(a * Math.PI / 8) * r, y: t.y + Math.sin(a * Math.PI / 8) * r };
    if (!ctx.free(p) || ctx.inEnemyER(p) || !ctx.segFree(t, p) || ctx.climbs?.([t, p])) continue;
    const path = wholeInchPath(ctx, { pts: [{ x: t.x, y: t.y }, p] }, 3, (q) => !ctx.inEnemyER(q));
    if (!path) continue;
    const q = path.pts.at(-1);
    const score = (objs.length ? Math.min(...objs.map((m) => dist(q, m))) : 0) - 0.3 * Math.min(...ours.map((f) => dist(f, q)));
    if (!best || score > best.score) best = { q, score };
  }
  return best?.q || null;
}
const mimicTargets = (g, op, k) => (isEngaged(g, op) || g.ncMimic?.[op.side]?.[k] ? []
  : foes(g, op).filter((t) => t.side < 2 && edgeDist(op, t) <= 6.01 && (k !== 'dash' || dashSpot(g, t, op))));
export function ncActions(g, op, add) {
  if (!isNC(op)) return;
  const reason = { zh: '條件不符或已使用', en: 'Unavailable or already used' };
  if (tpl(op).ncVisionary) add('ncPremonition', !isEngaged(g, op) && prescienceOf(g, op.side) > 0 && !usedPres(g, op.side, 'premonition'), reason);
  if (tpl(op).ncFearmonger) add('ncPoison', !isEngaged(g, op) && !!poisonTarget(g, op), reason);
  if (tpl(op).ncMimicry) for (const k of Object.keys(mimicTable())) add(mimicTable()[k][0], mimicTargets(g, op, k).length > 0, reason);
}
export function ncSelf(g, op, id) {
  if (id === 'ncPremonition') {
    spend(g, op, id); spendPres(g, op.side, 'premonition');
    g.cp[op.side] += 1;
    note(g, op.side, `${opName(op, 'zh')} 預感：花 1 點預知點數換 1CP`, `${opName(op, 'en')} Premonition: 1 Prescience point for 1CP`);
    return true;
  }
  if (id === 'ncPoison') {
    const o = poisonTarget(g, op);
    if (!o) return true;
    spend(g, op, id);
    (o.terrorchem ||= [false, false])[op.side] = true;
    note(g, op.side, `${opName(op, 'zh')} 對目標點下毒（敵人第一次爭奪時獲得恐懼毒標記並受 2D3 傷害）`, `${opName(op, 'en')} poisons an objective (the first enemy to contest it gains a Terrorchem token and takes 2D3)`);
    return true;
  }
  return false;
}
export function registerNightlordsActions() {
  ACTIONS.ncPremonition = { ap: 1, name: { zh: '預感', en: 'Premonition' } };
  ACTIONS.ncPoison = { ap: 1, name: { zh: '毒化目標點', en: 'Poison Objective' } };
  for (const k of Object.keys(mimicTable())) {
    const [id, zh, en] = mimicTable()[k];
    ACTIONS[id] = { ap: 1, name: { zh, en } };
    TARGET_ACTIONS[id] = {
      targets: (g, o) => mimicTargets(g, o, k),
      apply(g, o, t) {
        (g.ncMimic ||= [{}, {}])[o.side][k] = true;
        if (k === 'apl') { changeApl(g, t, -1); return { zh: `變聲模仿：${opName(t, 'zh')} APL -1`, en: `Disconcerting Mimicry: ${opName(t, 'en')} gets -1 APL` }; }
        if (k === 'order') { t.order = t.order === 'engage' ? 'conceal' : 'engage'; return { zh: `變聲模仿：${opName(t, 'zh')} 的指令改成${t.order === 'engage' ? '交戰' : '隱蔽'}`, en: `Disconcerting Mimicry: ${opName(t, 'en')} is now ${t.order === 'engage' ? 'Engage' : 'Conceal'}` }; }
        const q = dashSpot(g, t, o);
        if (q) {
          for (const m of [...(g.markers || []), ...(g.objectives || [])]) if (m.carriedBy === t.uid) { m.x = q.x; m.y = q.y; }
          t.x = q.x; t.y = q.y;
        }
        return { zh: `變聲模仿：${opName(t, 'zh')} 被迫免費衝刺`, en: `Disconcerting Mimicry: ${opName(t, 'en')} is made to Dash` };
      },
    };
  }
}
