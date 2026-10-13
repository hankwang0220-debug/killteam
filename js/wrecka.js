// Wrecka Krew (破壞專隊) rules engine: Wrecka points, Tanked Up, Bomb Squigs, Detonate, Smash, Pulsa rokkit,
// Break Stuff and the faction equipment. game.js calls these hooks; the team data is in data/wrecka.js.
import { ACTIONS, applyDamage, d3, d6, edgeDist, forcedShot, getOp, hasPloy, isEngaged, isInjured, living, log, opName, radius, spend, team, tpl, visibility } from './game.js';
import { dist, distPointRect } from './geometry.js';
import { moveCtx } from './path.js';
import { WRECKA_TEAM, wreckaRosterError } from './data/wrecka.js';

export const isWK = (o) => o?.team === 'wreckaKrew';
const isSquig = (o) => !!tpl(o).wkSquig;
const equip = (g, side, id) => !!g.equip?.[side]?.includes(id);
const note = (g, side, zh, en) => log(g, { zh, en }, `side${side}`);
const MAX = 6;

export function wkSetup(g, roster) {
  for (const side of [0, 1]) if (g.teams[side] === 'wreckaKrew') {
    const error = wreckaRosterError(WRECKA_TEAM, roster[side]);
    if (error) throw new Error(error.en);
    (g.wrecka ||= [0, 0])[side] = 0;
  }
}

// ---------- Wrecka points ----------
export const wreckaOf = (g, side) => g.wrecka?.[side] || 0;
/** Gain Wrecka points (max 6), unless the side started this action with 6. */
function gain(g, side, n, why) {
  if (n <= 0 || g.teams[side] !== 'wreckaKrew') return;
  if ((g.wkStart?.[side] ?? wreckaOf(g, side)) >= MAX) return;
  const was = wreckaOf(g, side);
  (g.wrecka ||= [0, 0])[side] = Math.min(MAX, was + n);
  if (g.wrecka[side] > was) note(g, side, `破壞點數 +${g.wrecka[side] - was}（${why.zh}，共 ${g.wrecka[side]}）`, `Wrecka points +${g.wrecka[side] - was} (${why.en}, ${g.wrecka[side]} total)`);
}
/** An action begins: remember the points it started with; Tanked Up and Wrecka Boss. kind: 'charge' | 'shoot' | 'fight'. */
export function wkActionStart(g, op, kind) {
  g.wkStart = [wreckaOf(g, 0), wreckaOf(g, 1)];
  if (!isWK(op) || op.dead) return;
  // Tanked Up: the first Charge, Shoot or Fight of an Engage-order operative in each activation / counteraction.
  if (!isSquig(op) && op.order === 'engage' && !op.acted.wkTanked) {
    op.acted.wkTanked = true; op.wkTanked = true;
    if (!op.counter) op.ap += 1;
    note(g, op.side, `${opName(op, 'zh')} 猛灌加油：APL +1（直到下次啟動）`, `${opName(op, 'en')} Tanked Up: +1 APL until its next activation`);
  }
  if (tpl(op).wreckaBoss && kind !== 'charge') gain(g, op.side, 1, { zh: '破壞頭目', en: 'Wrecka Boss' });
}
/** Demolition Job: an operative within 3" of this side's Demolition marker. */
const demolished = (g, side, o) => !!o && (g.markers || []).some((m) => m.kind === 'demolition' && m.owner === side && dist(m, o) - radius(o) <= 3);
/**
 * Wrecka Rampage in the Roll Attack Dice step: retained 6s gain points; up to 2 points (one of them free near a
 * Demolition marker) retain fails as normal successes — spent whenever there are fails (automatic).
 */
export function wkRoll(g, op, pool, foe, retally) {
  if (!isWK(op) || !pool) return;
  const sixes = pool.dice.filter((d) => !d.auto && d.v === 6 && d.res !== 'miss').length;
  const misses = pool.dice.filter((d) => d.res === 'miss' && !d.faith);
  const capped = (g.wkStart?.[op.side] ?? wreckaOf(g, op.side)) >= MAX;
  const gained = capped ? 0 : sixes;
  const free = !isSquig(op) && demolished(g, op.side, foe) ? 1 : 0;
  const spendable = isSquig(op) ? 0 : Math.min(2, misses.length, wreckaOf(g, op.side) + gained + free);
  // Spend first and then gain (the points are capped at 6), using the free point first.
  const paid = Math.max(0, spendable - free);
  (g.wrecka ||= [0, 0])[op.side] = Math.min(MAX, wreckaOf(g, op.side) - paid + gained);
  if (gained) note(g, op.side, `破壞狂暴：${sixes} 顆 6，破壞點數 +${gained}（共 ${g.wrecka[op.side]}）`, `Wrecka Rampage: ${sixes} six(es), +${gained} Wrecka point(s) (${g.wrecka[op.side]} total)`);
  if (!spendable) return;
  for (const d of misses.sort((a, b) => b.v - a.v).slice(0, spendable)) { d.faith = 'norm'; d.wk = true; }
  retally(pool);
  note(g, op.side, `破壞狂暴：花 ${paid} 破壞點數${free ? '（拆除標記免費 1 點）' : ''}，${spendable} 顆失敗改成普通成功（剩 ${g.wrecka[op.side]}）`, `Wrecka Rampage: ${paid} point(s) spent${free ? ' (1 free from the Demolition marker)' : ''}, ${spendable} fail(s) retained as normal successes (${g.wrecka[op.side]} left)`);
}
/** Kompetitive Streak (Gunner): once per Shoot, a target another friendly already shot this TP gains 1 point. */
export function wkKompetitive(g, op, targets) {
  if (!tpl(op).wkKompetitive) return;
  if (targets.some((t) => t.shotBy?.tp === g.tp && t.shotBy.uids.some((u) => u !== op.uid && getOp(g, u)?.side === op.side))) gain(g, op.side, 1, { zh: '好勝心', en: 'Kompetitive Streak' });
}

// ---------- activation, stats ----------
export function wkActivate(g, op) {
  if (!isWK(op) || g.counter) return;
  op.wkTanked = false; // Tanked Up lasts until the start of its next activation
  if (tpl(op).stoopid) op.order = 'engage'; // Stoopid: never Conceal in the Firefight phase
  // Engine Oil: once per TP, an injured friendly ignores injury stat changes for this activation.
  if (!isSquig(op) && isInjured(op) && equip(g, op.side, 'wkOil') && g.wkOilTP?.[op.side] !== g.tp) {
    (g.wkOilTP ||= [0, 0])[op.side] = g.tp; op.acted.mwIgnoreInjury = true;
    note(g, op.side, `${opName(op, 'zh')} 機油：本次啟動不受重傷影響`, `${opName(op, 'en')} Engine Oil: ignores being injured this activation`);
  }
}
/** Shokkwave: within x" of a Pulsa marker (x = its Pulsa points) — -2" Move and Hit worsened by 1 (cumulative with injured). */
export const shokked = (g, op) => (g.markers || []).some((m) => m.kind === 'pulsa' && m.pts > 0 && dist(m, op) - radius(op) <= m.pts);
export function wkMove(g, op) {
  let m = shokked(g, op) ? -2 : 0;
  if (isWK(op) && !isSquig(op) && equip(g, op.side, 'wkArmour')) m -= 1; // Extra Armour
  return m;
}
/** Extra Armour: the Save improves by 1 (not Bomb Squigs). */
export const wkSaveBonus = (g, o) => (isWK(o) && !isSquig(o) && equip(g, o.side, 'wkArmour') ? 1 : 0);
/** Reckless Temperament (Demolisha): Normal Dmg of 4+ deals 1 less; with an Engage order Critical Dmg of 4+ too. */
export const wkReckless = (o, amount, asNormal) => (tpl(o).wkReckless && amount >= 4 && (asNormal || o.order === 'engage') ? amount - 1 : amount);
/** Weapon rules: Destruction (ranged Saturate). (Armoured Up is applied last, in effectiveRules.) */
export function wkRules(g, op, weapon, target, r) {
  if (isWK(op) && weapon.type === 'ranged' && hasPloy(g, op.side, 'wkDestruction')) r.saturate = true;
}
/** Glyphs: Waaagh! / Destruction cost 0CP the first time, then while the side has Wrecka points. */
export function wkGlyphFree(g, side, ploy) {
  const id = ploy.id === 'waaagh' ? 'wkGlyphsW' : ploy.id === 'wkDestruction' ? 'wkGlyphsD' : null;
  return !!id && g.teams[side] === 'wreckaKrew' && equip(g, side, id) && (!g.wkGlyphUsed?.[side] || wreckaOf(g, side) > 0);
}
export function wkPloyBought(g, side, ploy, cost) {
  if (cost === 0 && wkGlyphFree(g, side, ploy)) (g.wkGlyphUsed ||= [false, false])[side] = true;
  if (ploy.id === 'wkAmpedUp') {
    for (const o of living(g, side).filter((x) => x.order === 'engage' && x.wounds < x.maxW)) {
      const h = Math.min(o.maxW - o.wounds, d3() + 1);
      o.wounds += h;
      note(g, side, `亢奮：${opName(o, 'zh')} 回復 ${h} 生命`, `Amped Up: ${opName(o, 'en')} regains ${h} wounds`);
    }
  }
}
/** The Ready step: Pulsa markers lose a point (removed at 0); Demolition markers are removed. */
export function wkReady(g) {
  if (!g.markers?.length) return;
  for (const m of g.markers) if (m.kind === 'pulsa') m.pts--;
  g.markers = g.markers.filter((m) => !(m.kind === 'pulsa' && m.pts <= 0) && m.kind !== 'demolition');
}

// ---------- Bomb Squig ----------
/** Boom!: incapacitated before using its explosives — two D6, any 4+ and it explodes before it's removed. */
export function wkBoom(g, o) {
  if (!tpl(o).boom || o.wkExploded) return;
  const w = tpl(o).weapons.find((x) => x.rules.wkExplosive);
  const rolls = [d6(), d6()];
  const go = rolls.some((r) => r >= 4);
  note(g, o.side, `${opName(o, 'zh')} 轟！擲 ${rolls.join('、')}${go ? '：引爆炸藥' : '：沒有爆炸'}`, `${opName(o, 'en')} Boom!: rolled ${rolls.join(', ')}${go ? ' — the explosives go off' : ' — no explosion'}`);
  if (!go) return;
  o.wkExploded = true;
  const ts = g.ops.filter((t) => !t.dead && t !== o && t.x > -50 && edgeDist(o, t) <= w.rules.blast + 0.01 && visibility(g, o, t).visible);
  forcedShot(g, o, w, ts);
}

// ---------- Breaka Boy Demolisha: Detonate ----------
/** The first damage with the detonate profile: D6+6 (2D6+6 on a crit) to the enemy and everyone in its control range, then the action ends. */
export function wkDetonate(g, f, meOp, foeOp, weapon, crit) {
  if (!weapon.rules.wkDetonate || meOp.wkDetonated) return false;
  meOp.wkDetonated = true;
  const victims = [foeOp, ...g.ops.filter((o) => !o.dead && o !== foeOp && o.x > -50 && edgeDist(o, foeOp) <= 1.01)];
  let kills = 0;
  note(g, meOp.side, `${opName(meOp, 'zh')} 引爆坦克錘！`, `${opName(meOp, 'en')} detonates the tankhammer!`);
  for (const o of victims) {
    if (o.dead) continue;
    const dmg = (crit ? d6() + d6() : d6()) + 6;
    note(g, meOp.side, `引爆：${opName(o, 'zh')} 受到 ${dmg} 傷害`, `Detonate: ${opName(o, 'en')} takes ${dmg} damage`);
    if (applyDamage(g, meOp, o, dmg)) kills++;
  }
  f.A.c = f.A.n = f.D.c = f.D.n = 0; // the action ends
  f.steps.push({ side: f.A.uid === meOp.uid ? 'A' : 'D', act: 'strike', crit, dmg: 0, killed: foeOp.dead, detonate: true });
  gain(g, meOp.side, 1 + kills, { zh: `引爆（${kills} 名殘廢）`, en: `Detonate (${kills} incapacitated)` });
  return true;
}

// ---------- Breaka Boy Krusha: Smash ----------
/** After a strike: push the enemy up to 1" straight away, then follow up to 1" (both must be possible). */
export function wkSmash(g, meOp, foeOp) {
  if (meOp.dead || foeOp.dead) return;
  const d = dist(meOp, foeOp) || 1, ux = (foeOp.x - meOp.x) / d, uy = (foeOp.y - meOp.y) / d;
  const p = { x: foeOp.x + ux, y: foeOp.y + uy }, q = { x: meOp.x + ux, y: meOp.y + uy };
  const save = { x: foeOp.x, y: foeOp.y };
  if (!moveCtx(g, foeOp).free(p)) return;
  Object.assign(foeOp, p);
  if (!moveCtx(g, meOp).free(q) || edgeDist({ ...meOp, ...q }, foeOp) > 1.01) { Object.assign(foeOp, save); return; }
  Object.assign(meOp, q);
  note(g, meOp.side, `${opName(meOp, 'zh')} 粉碎：把 ${opName(foeOp, 'zh')} 撞退 1"，跟上`, `${opName(meOp, 'en')} Smash: knocks ${opName(foeOp, 'en')} back 1" and follows`);
}

// ---------- Tankbusta Rokkiteer: Pulsa rokkit ----------
/** The Pulsa marker goes on the target (2D); 1 + up to 3 Pulsa points from the attack dice; D3 to each operative wholly within. */
export function wkPulsaShot(g, op, weapon, target, ap, hit, retally) {
  const dice = Array.from({ length: weapon.atk }, () => { const v = d6(); return { v, res: v >= hit ? (v === 6 ? 'crit' : 'norm') : 'miss' }; });
  const pool = { dice, crits: 0, norms: 0 };
  const count = (p) => { p.crits = p.dice.filter((d) => d.res === 'crit').length; p.norms = p.dice.filter((d) => d.res === 'norm').length; };
  count(pool);
  wkRoll(g, op, pool, target, (p) => { for (const d of p.dice) if (d.faith === 'norm' && d.res === 'miss') d.res = 'norm'; count(p); });
  const pts = 1 + Math.min(3, pool.crits + pool.norms);
  g.markers = (g.markers || []).filter((m) => !(m.kind === 'pulsa' && m.owner === op.side));
  g.markers.push({ id: g.markers.length, kind: 'pulsa', owner: op.side, x: target.x, y: target.y, pts, carriedBy: null });
  note(g, op.side, `${opName(op, 'zh')} 發射脈衝火箭：標記 ${pts} 點（${pts}" 震波）`, `${opName(op, 'en')} fires the pulsa rokkit: the marker has ${pts} Pulsa point(s) (${pts}" shokkwave)`);
  const hits = [];
  for (const o of g.ops.filter((x) => !x.dead && x.x > -50 && dist(x, target) + radius(x) <= pts + 0.01)) {
    const dmg = d3();
    hits.push({ uid: o.uid, dmg, killed: applyDamage(g, op, o, dmg) });
    note(g, op.side, `脈衝：${opName(o, 'zh')} 受到 ${dmg} 傷害`, `Pulsa: ${opName(o, 'en')} takes ${dmg} damage`);
  }
  spend(g, op, 'shoot', ap);
  (op.used ||= {})[weapon.id] = (op.used[weapon.id] || 0) + 1;
  op.acted.heavy = 'reposition';
  op.acted.shotWith = weapon.group;
  return { kind: 'pulsa', attacker: op.uid, target: target.uid, weapon, ap, dice: pool.dice, pts, hits };
}

// ---------- Breaka Boy Fighter: Break Stuff ----------
const nearTerrain = (g, op) => g.terrain.filter((t) => (t.kind === 'heavy' || t.kind === 'light') && distPointRect(op, t) - radius(op) <= 1.01);
/** The terrain Break Stuff would pick: enemy equipment terrain first, then any equipment, then the nearest other piece. */
export function breakTarget(g, op) {
  const ts = nearTerrain(g, op);
  return ts.find((t) => t.equip === 1 - op.side) || ts.find((t) => t.equip != null) || ts.sort((a, b) => distPointRect(op, a) - distPointRect(op, b))[0] || null;
}
export function wkActions(g, op, add) {
  if (!tpl(op).wkBreakStuff) return;
  const engaged = isEngaged(g, op);
  add('wkBreak', !engaged && !!breakTarget(g, op) && !op.acted.wkBreak, engaged ? { zh: '處於交戰中', en: 'Engaged' } : { zh: '控制範圍內沒有地形', en: 'No terrain in control range' });
}
export function wkSelf(g, op, id) {
  if (id !== 'wkBreak') return false;
  const t = breakTarget(g, op);
  if (!t) return true;
  spend(g, op, 'wkBreak');
  op.acted.wkBreak = 1;
  if (t.equip != null) {
    g.terrain.splice(g.terrain.indexOf(t), 1);
    note(g, op.side, `${opName(op, 'zh')} 搗毀：拆掉${team(g, t.equip).name.zh}的裝備地形`, `${opName(op, 'en')} Break Stuff: tears down ${team(g, t.equip).name.en}'s equipment terrain`);
    return true;
  }
  // A Breach marker on the terrain's nearest point to the operative.
  const p = { x: Math.max(t.x, Math.min(t.x + t.w, op.x)), y: Math.max(t.y, Math.min(t.y + t.h, op.y)) };
  (g.markers ||= []).push({ id: g.markers.length, kind: 'breach', owner: op.side, x: p.x, y: p.y, rect: { x: t.x, y: t.y, w: t.w, h: t.h }, carriedBy: null });
  note(g, op.side, `${opName(op, 'zh')} 搗毀：在地形上打出破口（1" 內厚度 1" 以下的部分可以穿過）`, `${opName(op, 'en')} Break Stuff: breaches the terrain (parts no more than 1" thick can be crossed within 1" of the marker)`);
  return true;
}
export function registerWreckaActions() {
  ACTIONS.wkBreak = { ap: 1, name: { zh: '搗毀', en: 'Break Stuff' } };
}
