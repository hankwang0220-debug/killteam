// Vespid Stingwings (胡蜂尖翼) rules engine: Communion points (交融點數), Neutron Charge, Neutron Fragment tokens and Neutron Fallout markers,
// the Oversight Drone, the Shadestrain, the Swarmguard's Skytorch Assault, the ploys and the faction equipment.
// game.js calls these hooks; the team data is in data/vespids.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { ACTIONS, CONTROL, ffOn, applyDamage, autoFF, d6, edgeDist, engagedEnemies, foes, forcedShot, getOp, hasPloy, isEngaged, living, log, opName, radius, spend, tpl, visibility, boardOf, moveStat } from './game.js';
import { dist, distPointSegment } from './geometry.js';
import { moveCtx } from './path.js';
import { VESPIDS_TEAM, VS_SKYTORCH, VS_COMMUNE_PLOYS, vespidsRosterError } from './data/vespids.js';

export function isVS(o) { return o?.team === 'vespids'; }
const bound = (o) => isVS(o) && o.side < 2 && !tpl(o).vsDrone; // (Communion doesn't affect the Oversight Drone)
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
/** A D3 that can't be re-rolled, shown as the D6 it came from (1-2 = 1, 3-4 = 2, 5-6 = 3). */
function d3shown() { const r = d6(); return { r, v: Math.ceil(r / 2) }; }

// ---------- setup and Communion points ----------
export function vsSetup(g, roster, commune = []) {
  g.vs = { cp: [0, 0], used: [{}, {}], commune: [null, null] };
  for (const side of [0, 1]) if (g.teams[side] === 'vespids') {
    const error = vespidsRosterError(VESPIDS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
    g.vs.commune[side] = VS_COMMUNE_PLOYS.includes(commune[side]) ? commune[side] : 'vsPredators';
  }
}
/** The Ready step: the old points go; D3 new ones (+1 with the Oversight Drone in the killzone; Neurostimulant: the better of two D3). */
export function vsReady(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'vespids' && g.vs) {
    const a = d3shown(), b = equip(g, side, 'vsNeuro') ? d3shown() : null;
    const roll = b && b.v > a.v ? b : a;
    const drone = living(g, side).some((o) => tpl(o).vsDrone && o.x > -50);
    g.vs.cp[side] = roll.v + (drone ? 1 : 0);
    g.vs.used[side].convergence = 0;
    note(g, side, `交融點數：擲 ${a.r}${b ? `、${b.r}` : ''} → ${roll.v}${drone ? ' +1（監視無人機）' : ''}，共 ${g.vs.cp[side]} 點`, `Communion points: rolled ${a.r}${b ? `, ${b.r}` : ''} → ${roll.v}${drone ? ' +1 (Oversight Drone)' : ''}, ${g.vs.cp[side]} in all`);
  }
}
export const vsPoints = (g, side) => (g.vs?.cp?.[side] || 0);
/** Can a Communion point be spent for this operative now (a point left, or the Strain Leader's free one this activation)? */
function helmFree(g, op) { return !!tpl(op).vsLeader && g.active === op.uid && !op.acted?.vsHelm; }
export function vsCanSpend(g, op) { return vsPoints(g, op.side) >= 1 || helmFree(g, op); }
/** Spend a Communion point (Communion Helm: the Strain Leader's first one each activation is free). */
export function vsSpend(g, op, why) {
  if (helmFree(g, op)) { op.acted.vsHelm = true; note(g, op.side, `交融頭盔：免費花 1 點交融點數（${why.zh}）`, `Communion Helm: a free Communion point (${why.en})`); return true; }
  if (vsPoints(g, op.side) < 1) return false;
  g.vs.cp[op.side]--;
  note(g, op.side, `花 1 點交融點數（${why.zh}），剩 ${g.vs.cp[op.side]}`, `Spends a Communion point (${why.en}), ${g.vs.cp[op.side]} left`);
  return true;
}

// ---------- shooting: the closest enemy, the re-roll, Warrior Instincts ----------
/** The enemies a Vespid may shoot without spending a point: the closest within 8" (not in another friendly Vespid's control range). */
export function vsFreeTargets(g, op) {
  const others = living(g, op.side).filter((f) => f !== op && isVS(f) && f.x > -50);
  const cands = foes(g, op).filter((e) => e.side < 2 && e.x > -50 && !e.reserve && edgeDist(op, e) <= 8.01
    && !others.some((f) => edgeDist(f, e) <= CONTROL + 0.01) && visibility(g, op, e).visible && !(e.order === 'conceal' && visibility(g, op, e).cover));
  if (!cands.length) return [];
  const m = Math.min(...cands.map((e) => edgeDist(op, e)));
  return cands.filter((e) => edgeDist(op, e) <= m + 0.05);
}
/** Is this target allowed for the shooter (a free target, or a point to spend)? */
export function vsTargetOk(g, op, target) { return !bound(op) || vsFreeTargets(g, op).includes(target) || vsCanSpend(g, op); }
/** The Shoot begins: spend the point for a target other than the closest; Warrior Instincts notes whether one was spent. */
export function vsShootStart(g, op, weapon, target) {
  op.vsSpentSeq = false;
  if (!bound(op) || !target) return;
  if (!vsFreeTargets(g, op).includes(target) && vsSpend(g, op, { zh: '選擇非最近的目標', en: 'a target other than the closest' })) op.vsSpentSeq = true;
}
/** Spend one point to re-roll one attack die (only when two or more are left, and not for a Warrior relying on Warrior Instincts). */
export function vsReroll(g, op, pool, retally) {
  if (!bound(op) || !pool || tpl(op).vsWarrior || vsPoints(g, op.side) < 2 || op.vsRerolled) return;
  const m = pool.dice.find((d) => !d.auto && !d.rr && !d.locked && d.res === 'miss');
  if (!m) return;
  if (!vsSpend(g, op, { zh: '重擲一顆攻擊骰', en: 're-roll an attack die' })) return;
  op.vsSpentSeq = true; op.vsRerolled = true;
  const old = m.v; m.v = d6(); m.rr = true;
  retally(pool);
  note(g, op.side, `交融重擲：${old} → ${m.v}`, `Communion re-roll: ${old} → ${m.v}`);
}

// ---------- weapons and rules ----------
export function vsWeapons(g, op, ws) {
  if (!isVS(op) || op.side > 1 || !hasPloy(g, op.side, 'vsStingPloy')) return ws;
  return ws.map((w) => (w.rules.vsClaws ? { ...w, hit: Math.max(2, w.hit - 1), rules: { ...w.rules, lethal: 5, shock: true } } : w)); // Sting
}
export function vsRules(g, op, weapon, target, r) {
  // Aerial Guidance (Oversight Drone): Lethal 5+ and Saturate for a friendly Vespid shooting near it at an enemy it can see.
  if (bound(op) && weapon.type === 'ranged' && target && living(g, op.side).some((d) => tpl(d).vsDrone && d.vsGuide && !isEngaged(g, d) && edgeDist(d, op) <= 6 && visibility(g, d, op).visible && visibility(g, d, target).visible)) { r.lethal = Math.min(r.lethal || 6, 5); r.saturate = true; }
  if (!isVS(op) || op.side > 1) return;
  if (weapon.rules.vsNeutron && op.vsMovedTP === g.tp) r.piercing = Math.max(r.piercing || 0, 1); // Neutron Charge
  if (hasPloy(g, op.side, 'vsPredators') && g.active === op.uid && op.acted?.vsMoved) r.balanced = true; // Airborne Predators
  if (tpl(op).vsWarrior && weapon.rules.vsNeutron && !op.vsSpentSeq) r.accurate = Math.max(r.accurate || 0, 1); // Warrior Instincts
  if (weapon.type === 'melee' && !tpl(op).vsDrone && equip(g, op.side, 'vsAggression') && g.fight?.A?.uid === op.uid) r.ceaseless = true; // Aggression Stimulant
}
/** Shadestrain (Camouflaged) and the Oversight Drone: Piercing is ignored when they're shot. */
export const vsNoPierce = (target) => isVS(target) && !!tpl(target).vsNoPierce;
/** Camouflaged (Shadestrain): all its cover saves are retained as critical successes. */
export const vsCamo = (target) => isVS(target) && !!tpl(target).vsShadestrain;
/** Ghost Rig (Shadestrain, Concealed: only within 6"), Evasive Drone (Concealed in cover: only within 2"). */
export function vsHidden(g, from, to) {
  if (!isVS(to) || to.order !== 'conceal') return false;
  if (tpl(to).vsShadestrain && edgeDist(from, to) > 6) return true;
  if (tpl(to).vsDrone && visibility(g, from, to).cover && edgeDist(from, to) > 2) return true;
  return false;
}
/** Aerial Agility (ploy): shot by an operative counteracting / interrupting, or that moved this activation — a 5+ ignores one Normal Dmg die. */
export function vsAgility(g, shooter, target) {
  if (!isVS(target) || target.side > 1 || !hasPloy(g, target.side, 'vsAgility') || g.vsAgilityShot === `${shooter.uid}|${g.tp}|${shooter.acted?.shoot || 0}`) return false;
  const moving = g.counter || g.active !== shooter.uid || ['reposition', 'dash', 'charge', 'fallBack'].some((k) => shooter.acted?.[k]) || shooter.aqLandAct === shooter.uid;
  if (!moving) return false;
  const r = d6();
  if (r < 5) return false;
  g.vsAgilityShot = `${shooter.uid}|${g.tp}|${shooter.acted?.shoot || 0}`;
  note(g, target.side, `空中靈巧：擲 ${r}，無視一次普通傷害`, `Aerial Agility: rolled ${r}, one Normal Dmg is ignored`);
  return true;
}
/** Hardened Exoskeleton (ploy): fighting or retaliating, Normal Dmg of 4+ deals 1 less. */
export const vsExo = (g, op, amount, asNormal) => (asNormal && amount >= 4 && bound(op) && hasPloy(g, op.side, 'vsExo') ? amount - 1 : amount);
/** Vicious Venom (ploy, automatic): a critical strike deals D3 more. */
export function vsVenom(g, meOp) {
  if (!bound(meOp) || !autoFF(g, meOp.side, 'vsVenom')) return 0;
  const d = d3shown();
  note(g, meOp.side, `惡毒毒液：擲 ${d.r} → +${d.v} 傷害`, `Vicious Venom: rolled ${d.r} → +${d.v} damage`);
  return d.v;
}

// ---------- after a shot: Neutron Fragment, Neutron Fallout, Neutron Overload ----------
export function vsShootEnd(g, op, weapon, target, resolvedAny, critsResolved) {
  if (op) op.vsRerolled = false;
  if (!isVS(op) || op.side > 1 || !target) return;
  if (weapon.rules?.vsFragment && !target.dead && resolvedAny && target.side < 2) {
    (target.vsFrag ||= [0, 0])[op.side]++;
    note(g, op.side, `${opName(target, 'zh')} 獲得中子碎片標記（共 ${target.vsFrag[op.side]}）`, `${opName(target, 'en')} gains a Neutron Fragment token (${target.vsFrag[op.side]})`);
  }
  if (weapon.rules?.vsFallout) { // Neutron Bombardment: a Neutron Fallout marker within the target's control range, whatever the dice did
    const d = Math.max(0.01, dist(op, target)), k = Math.min(radius(target) + 0.5, d);
    const p = { x: target.x + (op.x - target.x) / d * k, y: target.y + (op.y - target.y) / d * k };
    (g.markers ||= []).push({ id: g.markers.length, kind: 'vsFallout', owner: op.side, x: p.x, y: p.y, carriedBy: null });
    note(g, op.side, `中子落塵標記放在 ${opName(target, 'zh')} 旁`, `A Neutron Fallout marker lands by ${opName(target, 'en')}`);
  }
  if (critsResolved && weapon.rules?.vsNeutron && ffOn(g, op, 'vsOverload') && !target.dead && edgeDist(op, target) <= 4) {
    const r = d3shown();
    note(g, op.side, `中子超載：擲 ${r.r} → ${opName(target, 'zh')} 額外受到 ${r.v} 傷害`, `Neutron Overload: rolled ${r.r} → ${opName(target, 'en')} takes ${r.v} more damage`);
    applyDamage(g, op, target, r.v);
  }
}
/** Neutron Fallout: once in each enemy activation (not a counteraction), when it's within 2" of a marker, D3 damage. */
export function vsFallout(g, op) {
  if (!op || op.dead || op.side > 1 || g.counter || g.active !== op.uid || op.acted?.vsFallout || op.x < -50) return;
  const m = (g.markers || []).find((x) => x.kind === 'vsFallout' && x.owner !== op.side && dist(op, x) - radius(op) <= 2);
  if (!m) return;
  op.acted.vsFallout = 1;
  const d = d3shown();
  note(g, m.owner, `中子落塵：擲 ${d.r} → ${opName(op, 'zh')} 受到 ${d.v} 傷害`, `Neutron Fallout: rolled ${d.r} → ${opName(op, 'en')} takes ${d.v} damage`);
  applyDamage(g, null, op, d.v);
}
/** At the start of an activation: Neutron Fragment damage (D3 per token), then Neutron Fallout. */
export function vsActivate(g, op) {
  if (op.side > 1) return;
  if (isVS(op) && !g.counter) { op.vsGuide = false; op.acted.vsMoved = false; }
  if (!g.counter) for (const s of [0, 1]) {
    const n = op.vsFrag?.[s] || 0;
    for (let i = 0; i < n && !op.dead; i++) {
      const d = d3shown();
      note(g, s, `中子碎片：擲 ${d.r} → ${opName(op, 'zh')} 受到 ${d.v} 傷害`, `Neutron Fragment: rolled ${d.r} → ${opName(op, 'en')} takes ${d.v} damage`);
      applyDamage(g, null, op, d.v);
    }
  }
  vsFallout(g, op);
}
/** After a move: Neutron Charge, Airborne Predators, Neutron Fallout. */
export function vsMoved(g, op) {
  if (isVS(op)) { op.vsMovedTP = g.tp; if (g.active === op.uid) op.acted.vsMoved = true; }
  vsFallout(g, op);
}

// ---------- Charge and the mission actions ----------
/** The closest enemy a Vespid could charge (the one it must end beside unless it spends a point). */
function closestCharge(g, op) {
  const max = moveStat(g, op) + 2 + 1;
  return foes(g, op).filter((e) => e.side < 2 && e.x > -50 && !e.reserve && edgeDist(op, e) <= max).sort((a, b) => edgeDist(op, a) - edgeDist(op, b))[0] || null;
}
/** The computer only considers the closest enemy when it has no point to spend. */
export function vsChargeAmong(g, op, among) {
  if (!bound(op) || vsCanSpend(g, op)) return among;
  const c = closestCharge(g, op);
  return c ? among.filter((e) => e === c) : among;
}
/** A Charge ending beside an enemy that isn't the closest costs a point (no point: the Charge can't end there). */
export function vsChargeOk(g, op, dest) {
  if (!bound(op) || !dest) return true;
  const c = closestCharge(g, op);
  if (!c || edgeDist({ ...op, x: dest.x, y: dest.y }, c) <= 1.01) return true;
  return vsSpend(g, op, { zh: '衝鋒非最近的敵人', en: 'charging an enemy that isn\'t the closest' });
}
const MISSIONISH = (id, mission) => id === 'pickUp' || (mission && !/^tw(Open|Close)_/.test(id));
/** Pick Up and mission actions need a Communion point (Convergence Stimulant: one free per turning point). */
export function vsGate(g, op, list, missionIds) {
  if (!bound(op)) return;
  const free = (equip(g, op.side, 'vsConvergence') && g.vs.used[op.side].convergence !== g.tp) || vsCanSpend(g, op);
  if (free) return;
  for (const a of list) if (a.ok && MISSIONISH(a.id, missionIds.includes(a.id))) { a.ok = false; a.why = { zh: '沒有交融點數', en: 'No Communion points' }; }
}
export function vsMissionSpend(g, op, id) {
  if (!bound(op) || /^tw(Open|Close)_/.test(id)) return;
  if (equip(g, op.side, 'vsConvergence') && g.vs.used[op.side].convergence !== g.tp) { g.vs.used[op.side].convergence = g.tp; note(g, op.side, '聚合興奮劑：這次不用花交融點數', 'Convergence Stimulant: no Communion point needed this time'); return; }
  vsSpend(g, op, { zh: id === 'pickUp' ? '撿標記' : '任務行動', en: id === 'pickUp' ? 'Pick Up Marker' : 'a mission action' });
}
/** Commune (Strain Leader): the chosen strategy ploy costs 0CP while the Leader is in the killzone and not engaged. */
export function vsCommuneFree(g, side, ploy) {
  return g.teams[side] === 'vespids' && !!g.vs && g.vs.commune[side] === ploy.id && living(g, side).some((o) => tpl(o).vsLeader && o.x > -50 && !isEngaged(g, o));
}

// ---------- actions: Aerial Guidance, Skytorch Assault, Darting Flight ----------
export function vsActions(g, op, add) {
  if (!isVS(op) || op.side > 1) return;
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' };
  if (tpl(op).vsDrone) add('vsGuidance', !eng && !op.vsGuide, eng ? ENG : { zh: '已啟動', en: 'Already running' });
  if (tpl(op).vsSwarmguard) add('vsSkytorch', !eng && op.order === 'engage' && !op.acted.reposition && !op.acted.shoot && !op.acted.charge && !op.acted.fallBack, eng ? ENG : op.order !== 'engage' ? { zh: '需要 Engage 指令', en: 'Needs an Engage order' } : { zh: '已經移動或射擊過', en: 'Already moved or shot' });
}
export function vsSelf(g, op, id) {
  if (id !== 'vsGuidance') return false;
  spend(g, op, id);
  op.vsGuide = true;
  note(g, op.side, `${opName(op, 'zh')} 空中導引：6" 內友方胡蜂射擊它看得到的敵人時「致命 5+」與「飽和」`, `${opName(op, 'en')} Aerial Guidance: friendly Vespids within 6" shooting enemies it can see have Lethal 5+ and Saturate`);
  return true;
}
/** Skytorch Assault: fly up to Move + 2", then the skytorch hits every operative in the torch zone (furthest first, no cover). */
export function vsSkytorchCheck(g, op, p) {
  if (!tpl(op).vsSwarmguard) return { ok: false, why: { zh: '只有群衛', en: 'Swarmguard only' } };
  if (dist(op, p) > moveStat(g, op) + 2 + 0.01) return { ok: false, why: { zh: `超過 ${moveStat(g, op) + 2}"`, en: `More than ${moveStat(g, op) + 2}"` } };
  const ctx = moveCtx(g, op, 'reposition');
  if (!ctx.placement(p).ok) return { ok: false, why: { zh: '底盤放不下', en: 'The base does not fit' } };
  if (ctx.inEnemyER(p)) return { ok: false, why: { zh: '不能停在敵人控制範圍內', en: 'Not in enemy control range' } };
  return { ok: true };
}
export function vsDoSkytorch(g, op, p) {
  if (!vsSkytorchCheck(g, op, p).ok) return false;
  spend(g, op, 'vsSkytorch');
  const from = { x: op.x, y: op.y }, r = radius(op);
  op.x = p.x; op.y = p.y;
  op.acted.reposition = (op.acted.reposition || 0) + 1; op.acted.shoot = (op.acted.shoot || 0) + 1;
  vsMoved(g, op);
  const hit = g.ops.filter((o) => o !== op && !o.dead && o.x > -50 && distPointSegment(o, from, p) - radius(o) <= r).sort((a, b) => dist(b, p) - dist(a, p));
  note(g, op.side, `${opName(op, 'zh')} 天焰突擊：火焰掃過 ${hit.length} 名特工`, `${opName(op, 'en')} Skytorch Assault: the flames sweep over ${hit.length} operatives`);
  for (const t of hit) if (!t.dead) forcedShot(g, op, VS_SKYTORCH, [t], false);
  return true;
}
export function registerVespidActions() {
  ACTIONS.vsGuidance = { ap: 1, name: { zh: '空中導引', en: 'Aerial Guidance' } };
  ACTIONS.vsSkytorch = { ap: 2, name: { zh: '天焰突擊', en: 'Skytorch Assault' } };
}

// ---------- the computer ----------
/** Darting Flight and the rest are left to the player; the computer's Skytorch Assault isn't used. */
export function vsAiNothing() { return null; }
