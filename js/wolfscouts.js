// Wolf Scouts (狼偵查小隊) rules engine: the Elemental Storm, Hunting Astartes' limits, the operatives' rules (Lupine Guile, Spiritual
// Chirurgy, Healing Balms, Storm-veiled Execution, Hunter's Senses, Tempest's Fury, Fierce Temperament, Cast the Runes, Call the Storm,
// the Haywire Mine, Pounce), the ploys and the faction equipment. game.js calls these hooks; the team data is in data/wolfscouts.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { ACTIONS, TARGET_ACTIONS, CONTROL, spend, autoFF, ffOn, changeApl, d3, d6, edgeDist, foes, getOp, hasPloy, isEngaged, living, log, opName, radius, tpl, boardOf, applyDamage, resolveFight, bestMelee, doMove, mission, ployChooser } from './game.js';
import { dist } from './geometry.js';
import { moveCtx, findPath, wholeInchPath } from './path.js';
import { WOLF_TEAM, wolfRosterError } from './data/wolfscouts.js';

export function isWS(o) { return o?.team === 'wolfScouts'; }
const wolf = (o) => !!tpl(o).wsWolf;
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
const onBoard = (o) => !!o && !o.dead && o.x > -50;

export function wsSetup(g, roster) {
  g.ws = { storm: [null, null], used: [{}, {}], runes: [null, null], veil: [null, null], fang: [false, false] };
  for (const side of [0, 1]) if (g.teams[side] === 'wolfScouts') {
    const error = wolfRosterError(WOLF_TEAM, roster[side]);
    if (error) throw new Error(error.en);
    g.ws.fang[side] = g.ops.some((o) => o.side === side && tpl(o).wsFang); // Spiritual Chirurgy: selected for the battle
    const trap = g.ops.find((o) => o.side === side && tpl(o).wsTrap);
    if (trap) (g.markers ||= []).push({ id: g.markers.length, kind: 'wsMine', owner: side, x: -99, y: -99, carriedBy: trap.uid });
    // Cast the Runes: three D6 before the battle — a 1-4 is a free Command Re-roll in that turning point, any 5-6 is 1CP.
    if (g.ops.some((o) => o.side === side && tpl(o).wsSkjald)) {
      const r = [d6(), d6(), d6()];
      g.ws.runes[side] = { dice: r, used: {} };
      if (r.some((v) => v >= 5)) g.cp[side]++;
      note(g, side, `擲符文：${r.join('、')}${r.some((v) => v >= 5) ? '，+1CP' : ''}`, `Cast the Runes: ${r.join(', ')}${r.some((v) => v >= 5) ? ', +1CP' : ''}`);
    }
  }
}

// ---------- the Elemental Storm ----------
export function wsStorm(g, side) { return g.ws?.storm?.[side] || null; }
/** Wholly within 6" (horizontally) of that side's Storm marker. */
export function inStorm(g, side, o, at = o) {
  const s = wsStorm(g, side);
  return !!s && !!o && o.x > -50 && dist(s, at) + radius(o) <= 6.01;
}
export function wsStormOk(g, side) { return g.teams[side] === 'wolfScouts' && !!g.ws && g.phase === 'strategy' && g.ws.used[side].storm !== g.tp; }
/** The strategic gambit (or Call the Storm): the marker goes anywhere in the killzone. */
export function wsPlaceStorm(g, side, p, gambit = true) {
  if (gambit && !wsStormOk(g, side)) return false;
  const b = boardOf(g);
  if (!p || p.x < 0 || p.y < 0 || p.x > b.w || p.y > b.h) return false;
  g.ws.storm[side] = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
  if (gambit) g.ws.used[side].storm = g.tp;
  note(g, side, `元素風暴：風暴標記放在 (${g.ws.storm[side].x}, ${g.ws.storm[side].y})`, `Elemental Storm: the Storm marker goes at (${g.ws.storm[side].x}, ${g.ws.storm[side].y})`);
  return true;
}
/** Where the computer puts the storm: over as many friendlies as it can, toward the enemy. */
export function wsBestStorm(g, side) {
  const b = boardOf(g), mine = living(g, side).filter((o) => o.x > -50), en = living(g, 1 - side).filter((o) => o.x > -50 && o.side < 2);
  let best = null;
  for (let x = 2; x < b.w; x += 1) for (let y = 2; y < b.h; y += 1) {
    const p = { x, y };
    const s = mine.filter((o) => dist(p, o) + radius(o) <= 6).length * 3 + en.filter((o) => dist(p, o) + radius(o) <= 6).length
      - (en.length ? Math.min(...en.map((e) => dist(p, e))) / 30 : 0);
    if (!best || s > best.s) best = { p, s };
  }
  return best?.p || null;
}
/** A friendly can Charge with a Conceal order (the Wolf always; the others if the Charge ends wholly within the storm). */
export const wsConcealCharge = (g, op) => isWS(op) && (wolf(op) || !!wsStorm(g, op.side));
export function wsChargeEndOk(g, op, dest) {
  if (!isWS(op) || op.order !== 'conceal' || wolf(op) || !dest) return true;
  return inStorm(g, op.side, op, dest);
}

// ---------- Hunting Astartes ----------
/** Two Shoots: never two PSYCHIC ranged weapons; 1 more AP for the second if both use plasma. */
export function wsSecondShot(op, first, w) {
  if (!isWS(op) || !first) return null;
  const fw = tpl(op).weapons.find((x) => x.group === first);
  if (fw?.rules.psychic && w.rules.psychic) return { no: { zh: '不能兩次都用靈能武器', en: 'Not two PSYCHIC ranged weapons' } };
  return { extra: fw?.rules.wsPlasma && w.rules.wsPlasma ? 1 : 0 };
}

// ---------- weapons and rules ----------
export function wsWeapons(g, op, ws) {
  if (!isWS(op) || op.side > 1) return ws;
  const storm = inStorm(g, op.side, op);
  return ws.map((w) => {
    const r = { ...w.rules };
    if (storm && tpl(op).wsGunner && r.wsPlasmaGun) { r.punishing = true; delete r.hot; } // Tempest's Fury
    if (storm && tpl(op).wsHunter) r.severe = true; // Fierce Temperament
    if (storm && r.wsBlade && equip(g, op.side, 'wsFrostW')) r.lethal = Math.min(r.lethal || 6, 5); // Frost Weapons
    if (r.wsCarbine && op.wsSenses === 'severe') r.severe = true; // Hunter's Senses
    if (r.wsCarbine && op.wsSenses === 'saturate') r.saturate = true;
    return { ...w, rules: r };
  });
}
export function wsRules(g, op, weapon, target, r) {
  if (!isWS(op) || op.side > 1) return;
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'wsWrath') && (inStorm(g, op.side, op) || op.wsStartStorm === g.tp)) r.balanced = true; // Tempestuous Wrath
  if (weapon.type === 'ranged' && ffOn(g, op, 'wsAcute')) r.seekLight = true; // Acute Senses
}
/** Enemies can't be obscured: Acute Senses, Hunter's Senses (Saturate option). */
export const wsNoObscure = (g, op, weapon) => isWS(op) && (ffOn(g, op, 'wsAcute') || (op.wsSenses === 'saturate' && !!weapon?.rules.wsCarbine));
/** Call the Storm (veil): the friendly picked is obscured wholly within the storm and more than 3" from the active operative. */
export function wsObscure(g, from, to, v, opts) {
  if (!v.visible || opts.noObscure || !isWS(to) || to.side > 1 || from.side === to.side) return v;
  const veil = g.ws?.veil?.[to.side];
  if (!veil || veil.uid !== to.uid || !onBoard(getOp(g, veil.by)) || !inStorm(g, to.side, to) || edgeDist(from, to) <= 3) return v;
  v.obscured = true;
  v.defenceOptions = v.defenceOptions.map((o) => ({ ...o, obscured: true }));
  return v;
}
/** Spiritual Chirurgy: friendlies (not the Wolf) ignore stat changes from being injured. */
export const wsChirurgy = (g, op) => isWS(op) && op.side < 2 && !!g.ws?.fang?.[op.side] && !wolf(op);

// ---------- shooting and defence ----------
/** Runic Charms (once per TP, automatic): Piercing 1 worse against a friendly in the storm. */
export function wsCharms(g, op, target, rules) {
  if (!isWS(target) || target.side > 1 || wolf(target) || !rules.piercing || !equip(g, target.side, 'wsCharms') || g.ws.used[target.side].charms === g.tp || !inStorm(g, target.side, target)) return;
  g.ws.used[target.side].charms = g.tp;
  rules.piercing--;
  note(g, target.side, '符文護符：穿甲 -1', 'Runic Charms: Piercing worsened by 1');
}
/** Cloaked by the Storm: re-roll one defence die in the storm. */
export function wsDefence(g, target, r) {
  if (isWS(target) && target.side < 2 && hasPloy(g, target.side, 'wsCloak') && inStorm(g, target.side, target)) r.balanced = true;
}
export const wsTranshumanOk = (target) => isWS(target) && target.side < 2 && !wolf(target);
/** Wolfteeth Necklaces (once per TP): two or more fails — one is retained as a normal success. */
export function wsTeeth(g, op, pool, retally) {
  if (!isWS(op) || op.side > 1 || wolf(op) || !pool || !equip(g, op.side, 'wsTeeth') || g.ws.used[op.side].teeth === g.tp) return;
  if (pool.dice.filter((d) => !d.auto && d.res === 'miss').length < 2) return;
  g.ws.used[op.side].teeth = g.tp;
  const teeth = (p) => { const m = p.dice.filter((d) => !d.auto && d.res === 'miss'); if (m.length >= 2) { m[0].res = 'norm'; m[0].indo = true; p.norms++; } };
  const prev = pool.post;
  pool.post = prev ? (p) => { prev(p); teeth(p); } : teeth;
  retally(pool);
  note(g, op.side, `狼牙項鍊：${opName(op, 'zh')} 一個失敗保留為普通成功`, `Wolfteeth Necklaces: ${opName(op, 'en')} retains a fail as a normal success`);
}

// ---------- fighting ----------
/** Touched by Lokyar (automatic): fighting more than 5" from other friendlies, re-roll the failed attack dice. */
export function wsLokyar(g, op, pool, retally) {
  if (!isWS(op) || op.side > 1 || wolf(op) || !pool || living(g, op.side).some((o) => o !== op && o.x > -50 && edgeDist(o, op) <= 5)) return;
  if (!pool.dice.some((d) => !d.auto && !d.rr && d.res === 'miss') || !autoFF(g, op.side, 'wsLokyar')) return;
  for (const d of pool.dice) if (!d.auto && !d.rr && d.res === 'miss') { d.v = d6(); d.rr = true; }
  retally(pool);
  note(g, op.side, `洛卡之觸：${opName(op, 'zh')} 重擲失敗的攻擊骰`, `Touched by Lokyar: ${opName(op, 'en')} re-rolls its failed attack dice`);
}
/** Storm's Bite: a friendly fighting an enemy in the storm — that enemy's melee weapon has -1 Atk (minimum 3). */
export function wsBite(g, op, target, dWeapon, dr) {
  if (!isWS(op) || op.side > 1 || !target || target.side > 1 || !hasPloy(g, op.side, 'wsBite') || !inStorm(g, op.side, target)) return;
  if (dWeapon.atk + (dr.atkPlus || 0) - (dr.atkMinus || 0) > 3) dr.atkMinus = (dr.atkMinus || 0) + 1;
}
/** Talismanic Trophies: in the storm, one normal success inflicts 1 less damage on it (once per sequence). */
export function wsTrophy(g, me, amount, asNormal, seq) {
  if (!asNormal || amount <= 0 || seq.wsTrophy || !isWS(me) || me.side > 1 || wolf(me) || !equip(g, me.side, 'wsTrophies') || !inStorm(g, me.side, me)) return amount;
  seq.wsTrophy = true;
  return amount - 1;
}
/** Savage Fighters: the retaliating friendly, still standing in the enemy's control range — D3+1 damage. */
export function wsSavage(g, attacker, defender) {
  if (!isWS(defender) || defender.dead || !attacker || attacker.dead || defender.side > 1 || !hasPloy(g, defender.side, 'wsSavage') || defender.convictionNow) return;
  if (edgeDist(attacker, defender) > CONTROL + 0.01) return;
  const dmg = d3() + 1;
  note(g, defender.side, `兇猛鬥士：${opName(attacker, 'zh')} 受到 ${dmg} 傷害`, `Savage Fighters: ${opName(attacker, 'en')} takes ${dmg} damage`);
  applyDamage(g, defender, attacker, dmg);
}
/** Counterattack (automatic): a friendly within the enemy's control range makes a free Fight against that enemy only. */
export function wsCounter(g, enemy) {
  if (!enemy || enemy.dead || enemy.side > 1 || g.wsCounterNow || g.fight || g.phase !== 'firefight') return;
  const side = 1 - enemy.side;
  if (g.teams[side] !== 'wolfScouts') return;
  if (living(g, side).some((o) => o.convictionNow)) return; // (Grizzled Veteran: not at the end of that action)
  const me = living(g, side).filter((o) => o.x > -50 && edgeDist(o, enemy) <= CONTROL + 0.01 && bestMelee(o)).sort((a, b) => b.wounds - a.wounds)[0];
  if (!me || !autoFF(g, side, 'wsCounter')) return;
  note(g, side, `反擊：${opName(me, 'zh')} 免費近戰 ${opName(enemy, 'zh')}`, `Counterattack: ${opName(me, 'en')} makes a free Fight against ${opName(enemy, 'en')}`);
  const keep = { acted: me.acted, ap: me.ap, active: g.active, ffAtk: g.ffAtk, ffPending: g.ffPending };
  me.acted = { free: { fight: 'any' } }; me.ap = 1; g.active = me.uid; g.ffPending = null; g.wsCounterNow = true;
  try { resolveFight(g, me, bestMelee(me), enemy); } finally {
    me.acted = keep.acted; me.ap = keep.ap; g.active = keep.active; g.fight = null; g.ffAtk = keep.ffAtk; g.ffPending = keep.ffPending; g.wsCounterNow = false;
  }
}
/** The end of a Fight: Savage Fighters, then Counterattack against an enemy that fought. */
export function wsFightEnd(g, a, d) {
  if (a && d) wsSavage(g, a, d);
}
export function wsAfterFight(g, a) {
  if (a && !g.wsCounterNow && g.active === a.uid) wsCounter(g, a);
}

// ---------- activation ----------
export function wsActivate(g, op) {
  if (!isWS(op) || op.side > 1) return;
  if (g.counter) return;
  op.wsStartStorm = inStorm(g, op.side, op) ? g.tp : 0; // (Tempestuous Wrath)
  op.wsSenses = null; // Hunter's Senses: until the start of its next activation
  if (g.ws.veil[op.side]?.by === op.uid) g.ws.veil[op.side] = null; // Call the Storm: until the start of the Skjald's next activation
}
export function wsEnd(g, op) {
  if (!op) return;
  if (!g.counter && op.wsPounceBlock) op.wsPounceBlock = false; // Pounce: until the end of its next activation
  if (!g.counter && op.side < 2) wsCounter(g, op); // Counterattack: at the end of an enemy's activation
}
/** Pounce: the Wolf can't Charge, Fall Back or Reposition until the end of its next activation. */
export function wsFilter(g, op, list) {
  if (!isWS(op)) return list;
  if (op.wsPounceBlock) return list.filter((a) => !['charge', 'fallBack', 'reposition'].includes(a.id));
  return list;
}
/** Is a Guard action open to it: the Frosteye wholly within the storm (any killzone, any order), or anyone on Engage in Close Quarters. */
function guardOk(g, op) {
  if (op.counter || isEngaged(g, op) || op.dwGuard) return false;
  if (tpl(op).wsFrost && inStorm(g, op.side, op)) return true;
  return op.order === 'engage' && !!(mission(g).closeQuarters || g.closeQuarters);
}

// ---------- actions ----------
export function wsActions(g, op, add) {
  if (!isWS(op) || op.side > 1) return;
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' }, NONE = { zh: '沒有可選的目標', en: 'No valid target' }, DONE = { zh: '已做過', en: 'Already done' };
  if (tpl(op).wsFang) add('wsBalm', !eng && g.ws.used[op.side].balm !== g.tp && TARGET_ACTIONS.wsBalm.targets(g, op).length > 0, eng ? ENG : g.ws.used[op.side].balm === g.tp ? { zh: '本回合已用過', en: 'Already used this TP' } : NONE);
  if (tpl(op).wsFrost) for (const id of ['wsSensesSev', 'wsSensesSat']) add(id, !eng && !op.acted.wsSenses, eng ? ENG : DONE);
  if (tpl(op).wsSkjald) {
    add('wsCallMove', !eng && !op.acted.wsCall, eng ? ENG : DONE);
    add('wsCallVeil', !eng && !op.acted.wsCall && TARGET_ACTIONS.wsCallVeil.targets(g, op).length > 0, eng ? ENG : op.acted.wsCall ? DONE : NONE);
  }
  if (tpl(op).wsFrost || wolf(op) || mission(g).closeQuarters || g.closeQuarters) add('wsGuard', guardOk(g, op), { zh: '條件不符（霜眼要完全在風暴內；其他只在近距離戰鬥地圖、Engage 指令）', en: 'Not now (the Frosteye wholly within the storm; others only in Close Quarters with Engage)' });
  if (op.counter && !op.acted.wsOrder && inStorm(g, op.side, op)) add('wsOrder', true, DONE);
  const mine = (g.markers || []).find((m) => m.kind === 'wsMine' && m.carriedBy === op.uid);
  if (mine) add('wsPlaceMine', !op.acted.wsPlaceMine && !mineBlocked(g, op, op), { zh: '不能放在其他特工的控制範圍內', en: 'Not within another operative\'s control range' });
}
/** The Haywire Mine can't be placed within another operative's control range. */
function mineBlocked(g, op, p) { return g.ops.some((o) => o !== op && !o.dead && o.x > -50 && dist(o, p) - radius(o) <= CONTROL); }
export function wsSelf(g, op, id) {
  if (!isWS(op)) return false;
  if (id === 'wsSensesSev' || id === 'wsSensesSat') {
    spend(g, op, id); op.acted.wsSenses = 1;
    op.wsSenses = id === 'wsSensesSev' ? 'severe' : 'saturate';
    note(g, op.side, `獵人感官：卡賓槍到下次啟動前${id === 'wsSensesSev' ? '「嚴重」' : '「飽和」且敵人不能被遮蔽'}`, `Hunter's Senses: until its next activation the carbine has ${id === 'wsSensesSev' ? 'Severe' : 'Saturate, and enemies can\'t be obscured'}`);
    return true;
  }
  if (id === 'wsGuard') {
    spend(g, op, id); op.dwGuard = true;
    note(g, op.side, `${opName(op, 'zh')} 警戒`, `${opName(op, 'en')} goes on Guard`);
    return true;
  }
  if (id === 'wsOrder') {
    op.acted.wsOrder = 1; op.order = op.order === 'engage' ? 'conceal' : 'engage';
    note(g, op.side, `狩獵阿斯塔特：${opName(op, 'zh')} 在風暴內反應，改為${op.order === 'engage' ? 'Engage' : '隱蔽'}指令`, `Hunting Astartes: ${opName(op, 'en')} counteracting within the storm changes to ${op.order}`);
    return true;
  }
  if (id === 'wsPlaceMine') {
    const m = (g.markers || []).find((x) => x.kind === 'wsMine' && x.carriedBy === op.uid);
    if (!m) return true;
    spend(g, op, id); op.acted.wsPlaceMine = 1;
    m.carriedBy = null; m.x = op.x; m.y = op.y;
    note(g, op.side, `${opName(op, 'zh')} 放下干擾地雷`, `${opName(op, 'en')} places the Haywire Mine`);
    return true;
  }
  return false;
}
export function registerWolfActions() {
  ACTIONS.wsBalm = { ap: 1, name: { zh: '治療香膏', en: 'Healing Balms' } };
  ACTIONS.wsSensesSev = { ap: 1, name: { zh: '獵人感官（嚴重）', en: 'Hunter\'s Senses (Severe)' } };
  ACTIONS.wsSensesSat = { ap: 1, name: { zh: '獵人感官（飽和）', en: 'Hunter\'s Senses (Saturate)' } };
  ACTIONS.wsCallMove = { ap: 1, name: { zh: '召喚風暴（移動風暴）', en: 'Call the Storm (move it)' } };
  ACTIONS.wsCallVeil = { ap: 1, name: { zh: '召喚風暴（遮蔽友方）', en: 'Call the Storm (veil a friendly)' } };
  ACTIONS.wsGuard = { ap: 1, name: { zh: '警戒（自動攻擊）', en: 'Guard (automatic attack)' } };
  ACTIONS.wsOrder = { ap: 0, name: { zh: '改變指令（風暴內反應）', en: 'Change order (counteracting in the storm)' } };
  ACTIONS.wsPlaceMine = { ap: 1, name: { zh: '放下干擾地雷', en: 'Place Marker (Haywire Mine)' } };
  const friends = (g, o) => living(g, o.side).filter((f) => f.x > -50);
  TARGET_ACTIONS.wsBalm = {
    targets: (g, o) => friends(g, o).filter((f) => isWS(f) && f.wounds < f.maxW && edgeDist(f, o) <= CONTROL + 0.01),
    apply(g, o, t) {
      g.ws.used[o.side].balm = g.tp;
      const before = t.wounds; t.wounds = Math.min(t.maxW, t.wounds + d3() + 3);
      return { zh: `治療香膏：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Healing Balms: ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  };
  TARGET_ACTIONS.wsCallMove = {
    targets: (g, o) => friends(g, o),
    apply(g, o, t) { o.acted.wsCall = 1; wsPlaceStorm(g, o.side, { x: t.x, y: t.y }, false); return { zh: `召喚風暴：風暴移到 ${opName(t, 'zh')} 身上`, en: `Call the Storm: the storm moves onto ${opName(t, 'en')}` }; },
  };
  TARGET_ACTIONS.wsCallVeil = {
    targets: (g, o) => friends(g, o).filter((f) => isWS(f)),
    apply(g, o, t) { o.acted.wsCall = 1; g.ws.veil[o.side] = { uid: t.uid, by: o.uid }; return { zh: `召喚風暴：${opName(t, 'zh')} 在風暴內、離行動中的敵人 3" 外時被遮蔽`, en: `Call the Storm: ${opName(t, 'en')} is obscured wholly within the storm, more than 3" from the active operative` }; },
  };
}

// ---------- the Haywire Mine ----------
export function wsCanPickUp(op, m) { return m.owner === op.side && !!tpl(op).wsTrap; }
/** Proximity Mine: the first time the mine is within another operative's control range (checked along its move). */
export function wsMoved(g, op, path) {
  if (!op || op.dead || op.side > 1) return;
  for (const m of (g.markers || []).filter((x) => x.kind === 'wsMine' && !x.carriedBy && x.x > -50)) {
    if (tpl(op).wsTrap && op.side === m.owner) continue; // (the Trapmaster itself is ignored)
    const pts = [...(path?.pts || []), { x: op.x, y: op.y }];
    let hit = false;
    for (let i = 0; i < pts.length && !hit; i++) {
      const a = pts[i], b = pts[i + 1] || a, n = Math.max(1, Math.ceil(dist(a, b) / 0.25));
      for (let k = 0; k <= n && !hit; k++) { const p = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }; if (dist(p, m) - radius(op) <= CONTROL) hit = true; }
    }
    if (hit) wsBlow(g, op, m);
  }
}
function wsBlow(g, op, m) {
  g.markers = g.markers.filter((x) => x !== m);
  const s = wsStorm(g, m.owner), near = !!s && dist(s, m) <= 6;
  const dmg = near ? d3() + 6 : d3() + d3() + 3;
  changeApl(g, op, -1);
  note(g, m.owner, `干擾地雷：${opName(op, 'zh')} 受到 ${dmg} 傷害${near ? '（風暴 6" 內）' : ''}，下次啟動 APL -1`, `Haywire Mine: ${opName(op, 'en')} takes ${dmg} damage${near ? ' (within 6" of the storm)' : ''} and -1 APL`);
  const src = g.ops.find((o) => o.side === m.owner && tpl(o).wsTrap) || op;
  applyDamage(g, src, op, dmg);
}
/** The Trapmaster incapacitated while carrying it: the mine stays where it fell unless it's within another operative's control range. */
export function wsDeath(g, op) {
  if (!tpl(op).wsTrap) return;
  const m = (g.markers || []).find((x) => x.kind === 'wsMine' && x.owner === op.side && !x.carriedBy && x.x === op.x && x.y === op.y);
  if (m && mineBlocked(g, op, m)) g.markers = g.markers.filter((x) => x !== m);
}

// ---------- the Pack Leader, the Skjald ----------
export function wsGuileOk(g, side) {
  return g.teams[side] === 'wolfScouts' && !!g.ws && g.phase === 'initiative' && !g.initLocked && !g.ws.used[side].guile && living(g, side).some((o) => tpl(o).wsLupine && o.x > -50);
}
export function wsUseGuile(g, side) {
  if (!wsGuileOk(g, side)) return false;
  g.ws.used[side].guile = true;
  const before = g.initRoll[side];
  g.initRoll[side] = d6();
  note(g, side, `狼之狡詐：重擲先攻骰 ${before} → ${g.initRoll[side]}（${g.initRoll[0]} : ${g.initRoll[1]}）`, `Lupine Guile: re-rolls the initiative die ${before} → ${g.initRoll[side]} (${g.initRoll[0]} : ${g.initRoll[1]})`);
  return true;
}
/** Cast the Runes: a free Command Re-roll for each die that matches this turning point. */
export function wsRuneFree(g, side) {
  const r = g.ws?.runes?.[side];
  return !!r && side < 2 && r.dice.filter((v) => v === g.tp).length > (r.used[g.tp] || 0);
}
export function wsRuneUsed(g, side) { const r = g.ws.runes[side]; r.used[g.tp] = (r.used[g.tp] || 0) + 1; }

// ---------- Pounce ----------
export function wsPounceOk(g, side) {
  const w = living(g, side).find((o) => wolf(o) && o.x > -50);
  return g.teams[side] === 'wolfScouts' && !!g.ws && g.phase === 'strategy' && !g.ws.used[side].pounce && !!w && tpl(w).apl + (w.aplNext || 0) >= 2;
}
/** The path for a Pounce move to p (null if it can't get there). */
export function wsPouncePath(g, side, kind, p) {
  const w = living(g, side).find((o) => wolf(o) && o.x > -50);
  if (!w || !p) return null;
  const ctx = moveCtx(g, w, kind), raw = findPath(ctx, p);
  return raw && wholeInchPath(ctx, raw, Infinity, kind === 'charge' ? ctx.inEnemyER : (q) => !ctx.inEnemyER(q));
}
export function wsPounce(g, side, kind, path) {
  if (!wsPounceOk(g, side) || !['charge', 'fallBack', 'reposition'].includes(kind) || !path) return false;
  const w = living(g, side).find((o) => wolf(o) && o.x > -50);
  if ((kind === 'fallBack') !== isEngaged(g, w)) return false;
  const keep = { ap: w.ap, acted: w.acted };
  w.acted = {}; w.ap = 99; g.seekerFree = w.uid;
  let ok;
  try { ok = doMove(g, w, kind, path); } finally { w.ap = keep.ap; w.acted = keep.acted; delete g.seekerFree; }
  if (ok === false) return false;
  g.ws.used[side].pounce = true; w.wsPounceBlock = true; w.wsPounceTP = g.tp;
  changeApl(g, w, -1);
  note(g, side, `撲擊：${opName(w, 'zh')} 免費${{ charge: '衝鋒', fallBack: '撤退', reposition: '移動' }[kind]}；到下次啟動結束 APL -1，不能衝鋒、撤退或移動`, `Pounce: ${opName(w, 'en')} makes a free ${kind}; until the end of its next activation -1 APL and no Charge, Fall Back or Reposition`);
  return true;
}

// ---------- the computer ----------
export function wsAiStrategy(g, side, chargePath) {
  if (g.teams[side] !== 'wolfScouts' || !g.ws) return;
  if (wsStormOk(g, side)) wsPlaceStorm(g, side, wsBestStorm(g, side));
  if (wsPounceOk(g, side) && ployChooser(g) === side) {
    const w = living(g, side).find((o) => wolf(o) && o.x > -50);
    const path = w && !isEngaged(g, w) && chargePath(g, w);
    if (path) wsPounce(g, side, 'charge', path);
  }
}
/** The computer's Wolf Scout actions: Healing Balms, Hunter's Senses before shooting, the Haywire Mine near the enemy. */
export function wsAiAction(g, op, can, self, target) {
  if (!isWS(op)) return false;
  if (can.wsBalm) { const t = TARGET_ACTIONS.wsBalm.targets(g, op).filter((o) => o.maxW - o.wounds >= 4).sort((a, b) => a.wounds - b.wounds)[0]; if (t) { target(g, op, 'wsBalm', t); return true; } }
  if (can.wsPlaceMine && foes(g, op).some((e) => e.x > -50 && edgeDist(op, e) <= 10)) { self(g, op, 'wsPlaceMine'); return true; }
  if (can.wsSensesSev && op.ap >= 2 && can.shoot) { self(g, op, 'wsSensesSev'); return true; }
  return false;
}
