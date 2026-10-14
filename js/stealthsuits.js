// XV26 Stealth Battlesuits (XV26 隱形戰鬥服) rules engine: Stealth Fields, Kauyon, Markerlight, the drones, the Lodestar's Electrochaff Launcher
// and Homing Beacon, the Neutraliser, the ploys and the faction equipment. game.js calls these hooks; the team data is in data/stealthsuits.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { ACTIONS, TARGET_ACTIONS, CONTROL, spend, autoFF, changeApl, d6, edgeDist, foes, getOp, hasPloy, isEngaged, living, log, opName, radius, tpl, visibility, boardOf, deployZones, territoryOf, controller, ffReady, ffArmed } from './game.js';
import { dist } from './geometry.js';
import { bestStep, stepTo } from './sanctifiers.js';
import { STEALTH_TEAM, stealthRosterError } from './data/stealthsuits.js';

export function isXV(o) { return o?.team === 'stealthSuits'; }
const suit = (o) => isXV(o) && !tpl(o).xvDrone;
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }

export function xvSetup(g, roster) {
  g.xv = { used: [{}, {}], ambush: [null, null], jam: [null, null] };
  for (const side of [0, 1]) if (g.teams[side] === 'stealthSuits') {
    const error = stealthRosterError(STEALTH_TEAM, roster[side]);
    if (error) throw new Error(error.en);
    const lode = g.ops.find((o) => o.side === side && tpl(o).xvLodestar);
    if (lode) (g.markers ||= []).push({ id: g.markers.length, kind: 'xvBeacon', owner: side, x: -99, y: -99, carriedBy: lode.uid });
  }
}

// ---------- Stealth Fields ----------
/** A Concealed friendly can't be visible to enemies more than 3" from it. */
export function xvStealth(g, from, to, v) {
  if (!v.visible || !isXV(to) || to.side > 1 || from.side === to.side || from.side > 1 || to.order !== 'conceal' || edgeDist(from, to) <= 3) return v;
  return { visible: false, cover: false, obscured: false, defenceOptions: [] };
}
/** Stealth Fields: a Concealed one Falls Back for 1 less AP. */
export const xvFallBackCheap = (op) => isXV(op) && op.order === 'conceal';

// ---------- Kauyon and Markerlight ----------
function nearRect(p, r, z, d) {
  const dx = Math.max(z.x0 - p.x, 0, p.x - z.x1), dy = Math.max((z.y0 ?? 0) - p.y, 0, p.y - (z.y1 ?? 99));
  return Math.hypot(dx, dy) - r <= d;
}
/** Accurate X by where the enemy is: within 3" of your territory 1, in it 2, within 3" of your drop zone 3 (For the Greater Good +1, max 3). */
export function xvKauyon(g, op, target) {
  if (!isXV(op) || op.side > 1 || !target) return 0;
  const side = op.side, r = radius(target), b = boardOf(g), along = g.axis === 'y' ? 'y' : 'x';
  const mid = (along === 'x' ? b.w : b.h) / 2;
  let x = 0;
  if (nearRect(target, r, deployZones(g)[side], 3)) x = 3;
  else if (territoryOf(g, target) === side) x = 2;
  else if (Math.abs(target[along] - mid) - r <= 3) x = 1;
  if (x >= 1 && living(g, side).some((o) => tpl(o).xvShasvre && o.x > -50) && g.ops.filter((o) => o.side === side && suit(o) && o.dead).length >= 2) x = Math.min(3, x + 1); // For the Greater Good
  return x;
}
/** Marked: a valid target for a Designator or the Marker Drone, or visible to one and within 2" of the Ambush marker. */
export function xvMarked(g, side, e) {
  const amb = g.xv?.ambush?.[side];
  return living(g, side).some((m) => tpl(m).xvMarker && m.x > -50 && visibility(g, m, e).visible
    && (!(e.order === 'conceal' && visibility(g, m, e).cover) || (amb && amb.tp >= g.tp - 1 && dist(amb, e) - radius(e) <= 2)));
}
export function xvRules(g, op, weapon, target, r) {
  if (!isXV(op) || op.side > 1) return;
  if (weapon.type === 'ranged' && target) {
    const k = xvKauyon(g, op, target);
    if (k) r.accurate = Math.max(r.accurate || 0, k); // Kauyon
    if (xvMarked(g, op.side, target)) r.severe = true; // Markerlight
    const fm = g.xv.focus?.[op.side];
    if (fm && fm.uid === target.uid && fm.tp === g.tp && !fm.used) r.xvHit = true; // Focused Markerlight
    const amb = g.xv.ambush[op.side];
    if (amb && dist(amb, target) - radius(target) <= 2) r.seek = true; // Prepare Ambush
    if (weapon.rules.xvSweep && equip(g, op.side, 'xvMulti') && (g.xv.used[op.side].multi !== g.tp || g.xv.multiNow === op.uid)) r.torrent = Math.max(r.torrent || 0, 2); // XV26 Multitrackers
  }
  if (target && !target.ready && hasPloy(g, op.side, 'xvPatient')) { r.balanced = true; if (weapon.type === 'ranged') r.saturate = true; } // Patient Hunters
}
/** The Shoot begins: Focused Markerlight and Multitrackers are used up; the Ambush marker goes after the action that used it. */
export function xvShootStart(g, op, weapon, target) {
  if (!isXV(op) || op.side > 1 || !target) return;
  const fm = g.xv.focus?.[op.side];
  if (fm && fm.uid === target.uid && fm.tp === g.tp && !fm.used) { fm.usedNow = true; note(g, op.side, '集中標記光：這次射擊命中 +1', 'Focused Markerlight: Hit improved by 1 for this shot'); }
  if (weapon.rules.xvSweep && equip(g, op.side, 'xvMulti') && g.xv.used[op.side].multi !== g.tp) { g.xv.used[op.side].multi = g.tp; g.xv.multiNow = op.uid; note(g, op.side, 'XV26 多重追蹤器：洪流 2"', 'XV26 Multitrackers: Torrent 2"'); }
  const amb = g.xv.ambush[op.side];
  if (amb && dist(amb, target) - radius(target) <= 2) g.xv.ambushUsed = op.side;
}
export function xvShootEnd(g, op) {
  if (!g.xv) return;
  const fm = op && g.xv.focus?.[op.side];
  if (fm?.usedNow) { fm.used = true; fm.usedNow = false; }
  g.xv.multiNow = null;
  if (g.xv.ambushUsed != null) { g.xv.ambush[g.xv.ambushUsed] = null; g.xv.ambushUsed = null; }
}

// ---------- defence: Holowave Countermeasures, Electrochaff Launcher, Saviour Protocols ----------
/** Holowave Countermeasures: shot from more than 6" away (and not obscured), the attacker discards one success. */
export function xvHolowave(g, shooter, target) { return isXV(target) && target.side < 2 && hasPloy(g, target.side, 'xvHolowave') && edgeDist(shooter, target) > 6; }
/** Electrochaff Launcher (Lodestar, once per TP, automatic): friendlies near it shot from more than 2" away are obscured and ignore Piercing. */
export function xvChaffStart(g, shooter, target) {
  g.xvChaff = null;
  if (!isXV(target) || target.side > 1 || tpl(target).xvDrone || g.xv.used[target.side].chaff === g.tp) return;
  const lode = living(g, target.side).find((o) => tpl(o).xvLodestar && o.x > -50 && !isEngaged(g, o));
  if (!lode || !chaffCovers(g, lode, shooter, target)) return;
  g.xv.used[target.side].chaff = g.tp;
  g.xvChaff = { shooter: shooter.uid, lode: lode.uid, side: target.side };
  note(g, target.side, `電子箔片發射器：${opName(target, 'zh')} 被遮蔽，無視穿甲`, `Electrochaff Launcher: ${opName(target, 'en')} is obscured and ignores Piercing`);
}
function chaffCovers(g, lode, shooter, t) { return isXV(t) && t.side === lode.side && edgeDist(lode, t) <= 3 && (t === lode || visibility(g, lode, t).visible) && edgeDist(shooter, t) > 2; }
export function xvChaffOn(g, shooter, target) {
  const c = g.xvChaff;
  if (!c || c.shooter !== shooter?.uid) return false;
  const lode = getOp(g, c.lode);
  return !!lode && chaffCovers(g, lode, shooter, target);
}
export function xvChaffEnd(g) { g.xvChaff = null; }
/** The visibility hook: Electrochaff makes the friendly obscured. */
export function xvObscure(g, from, to, v, opts) {
  if (!v.visible || opts.noObscure || !xvChaffOn(g, from, to)) return v;
  v.obscured = true;
  v.defenceOptions = v.defenceOptions.map((o) => ({ ...o, obscured: true }));
  return v;
}
/** Saviour Protocols (ploy, automatic): a friendly drone visible within 3" takes the shot (not Blast or Torrent). */
export function xvSwap(g, target, weapon) {
  if (!suit(target) || target.side > 1 || weapon?.rules.blast || weapon?.rules.torrent) return target;
  if (!ffReady(g, target.side, 'xvSaviour') || !ffArmed(g, target.side, 'xvSaviour')) return target;
  const d = living(g, target.side).filter((o) => tpl(o).xvDrone && o.x > -50 && edgeDist(o, target) <= 3.01 && visibility(g, target, o).visible).sort((a, b) => b.wounds - a.wounds)[0];
  if (!d || !autoFF(g, target.side, 'xvSaviour')) return target;
  note(g, target.side, `救主協議：${opName(d, 'zh')} 替 ${opName(target, 'zh')} 承受射擊`, `Saviour Protocols: ${opName(d, 'en')} takes the shot for ${opName(target, 'en')}`);
  return d;
}
/** Vectored Retro-Thrusters (ploy, automatic): an enemy ends a Charge beside a friendly suit — it falls back 3". */
export function xvRetro(g, charger) {
  if (!charger || charger.dead || charger.side > 1) return;
  const side = 1 - charger.side;
  if (g.teams[side] !== 'stealthSuits') return;
  const t = living(g, side).find((o) => suit(o) && edgeDist(o, charger) <= CONTROL + 0.01);
  if (!t || !ffReady(g, side, 'xvRetro') || !ffArmed(g, side, 'xvRetro')) return;
  const away = (p) => Math.min(...foes(g, t).filter((e) => e.x > -50).map((e) => edgeDist({ ...t, x: p.x, y: p.y }, e)), 99);
  const q = bestStep(g, t, 3, 'fallBack', (p) => (away(p) > CONTROL + 0.05 ? away(p) : null));
  if (!q || !autoFF(g, side, 'xvRetro')) return;
  stepTo(g, t, q);
  note(g, side, `向量反推：${opName(t, 'zh')} 撤離 ${opName(charger, 'zh')}`, `Vectored Retro-Thrusters: ${opName(t, 'en')} falls back from ${opName(charger, 'en')}`);
}

// ---------- activation ----------
export function xvActivate(g, op) {
  if (op.side > 1) return;
  op.xvPhotonActive = !!op.xvPhoton; // (Photon Grenade Launcher: until the end of its next activation)
  // Multispectrum Sensor Package (Neutraliser, once per TP, automatic): an enemy activates within 8" — friendlies within 3" of it go Concealed.
  const side = 1 - op.side;
  if (!g.counter && g.teams[side] === 'stealthSuits' && g.xv && g.xv.used[side].sensor !== g.tp) {
    const n = living(g, side).find((o) => tpl(o).xvNeutraliser && o.x > -50 && edgeDist(o, op) <= 8);
    const near = n ? living(g, side).filter((o) => isXV(o) && o.x > -50 && o.order === 'engage' && edgeDist(o, n) <= 3) : [];
    if (n && near.length) {
      g.xv.used[side].sensor = g.tp;
      for (const o of near) o.order = 'conceal';
      note(g, side, `多光譜感測組件：${near.map((o) => opName(o, 'zh')).join('、')} 改為隱蔽指令`, `Multispectrum Sensor Package: ${near.map((o) => opName(o, 'en')).join(', ')} switch to Conceal`);
    }
  }
  if (!isXV(op) || g.counter) {
    // Hardwired Target Locks: a Concealed counteracting suit goes Engage and can only Shoot.
    if (isXV(op) && g.counter && op.order === 'conceal' && equip(g, op.side, 'xvLocks') && !tpl(op).xvInfiltrator) { op.order = 'engage'; op.xvLockOnly = true; note(g, op.side, `硬接線目標鎖定：${opName(op, 'zh')} 改為 Engage，只能射擊`, `Hardwired Target Locks: ${opName(op, 'en')} goes Engage and can only Shoot`); }
    return;
  }
  // Bonds of Unity: beside another suit, ignore APL changes and the injured Hit penalty this activation.
  if (suit(op) && hasPloy(g, op.side, 'xvBonds') && living(g, op.side).some((o) => o !== op && suit(o) && o.x > -50 && edgeDist(o, op) <= 6 && visibility(g, o, op).visible)) {
    op.ap = tpl(op).apl; op.xvBondHit = true;
  }
}
export function xvEnd(g, op) {
  if (!op) return;
  if (op.xvPhotonActive) { op.xvPhoton = false; op.xvPhotonActive = false; }
  op.xvBondHit = false; op.xvLockOnly = false;
  if (op.xvFreeDrone && !g.counter) op.xvFreeDrone = false;
  if (op.acted?.xvGhost && op.order === 'engage') { op.order = 'conceal'; note(g, op.side, `幽靈罩：${opName(op, 'zh')} 改為隱蔽指令`, `Ghostshroud: ${opName(op, 'en')} switches to Conceal`); }
}
/** Counteraction choices: Covert Protocols (Infiltrator, any order) and Hardwired Target Locks (a Concealed suit more than 3" from enemies). */
export const xvCanCounter = (g, o) => isXV(o) && (!!tpl(o).xvInfiltrator || (equip(g, o.side, 'xvLocks') && o.order === 'conceal' && !tpl(o).xvDrone && !foes(g, o).some((e) => e.x > -50 && edgeDist(e, o) <= 3)));
/** Action filters: Covert Protocols (a Concealed counteracting Infiltrator only does marker / mission actions); Target Locks (only Shoot). */
export function xvFilter(g, op, list, missionIds) {
  if (!isXV(op)) return list;
  if (op.xvLockOnly) return list.filter((a) => a.id === 'shoot');
  if (op.counter && op.order === 'conceal' && tpl(op).xvInfiltrator) return list.filter((a) => a.id === 'pickUp' || a.id === 'xvPlaceBeacon' || missionIds.includes(a.id));
  return list;
}

// ---------- actions: Focused Markerlight, System Jam, Photon Grenade Launcher, the Homing Beacon ----------
export function xvActions(g, op, add) {
  if (!isXV(op) || op.side > 1) return;
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' }, NONE = { zh: '沒有可選的目標', en: 'No valid target' };
  if (tpl(op).xvDesignator && !op.acted.xvFocus) add('xvFocus', !eng && TARGET_ACTIONS.xvFocus.targets(g, op).length > 0, eng ? ENG : NONE);
  if (tpl(op).xvNeutraliser && !op.acted.xvJam) add('xvJam', !eng && TARGET_ACTIONS.xvJam.targets(g, op).length > 0, eng ? ENG : NONE);
  if (op.tplId === 'xvGunDrone' && !op.acted.xvPhoton) add('xvPhoton', !eng && TARGET_ACTIONS.xvPhoton.targets(g, op).length > 0, eng ? ENG : NONE);
  const beacon = (g.markers || []).find((m) => m.kind === 'xvBeacon' && m.carriedBy === op.uid);
  if (beacon) add('xvPlaceBeacon', !op.acted.xvPlaceBeacon, { zh: '已放過', en: 'Already placed' });
}
export function xvSelf(g, op, id) {
  if (id !== 'xvPlaceBeacon') return false;
  const m = (g.markers || []).find((x) => x.kind === 'xvBeacon' && x.carriedBy === op.uid);
  if (!m) return true;
  op.acted.xvPlaceBeacon = 1;
  spend(g, op, id);
  m.carriedBy = null; m.x = op.x; m.y = op.y;
  note(g, op.side, `${opName(op, 'zh')} 放下歸航信標`, `${opName(op, 'en')} places the Homing Beacon`);
  return true;
}
export const xvActionCost = (op, id) => (id === 'xvJam' ? 1 + (op.order === 'conceal' ? 1 : 0) : null);
/** An enemy picking up the Homing Beacon discards it. */
export function xvAfterPickUp(g, op, m) {
  if (m?.kind === 'xvBeacon' && op.side !== m.owner) { m.gone = true; g.markers = g.markers.filter((x) => x !== m); note(g, m.owner, `${opName(op, 'zh')} 撿起歸航信標：信標被移除`, `${opName(op, 'en')} picks up the Homing Beacon: it is discarded`); }
}
export function registerStealthActions() {
  ACTIONS.xvFocus = { ap: 1, name: { zh: '集中標記光', en: 'Focused Markerlight' } };
  ACTIONS.xvJam = { ap: 1, name: { zh: '系統干擾', en: 'System Jam' } };
  ACTIONS.xvPhoton = { ap: 1, name: { zh: '光子榴彈發射器', en: 'Photon Grenade Launcher' } };
  ACTIONS.xvPlaceBeacon = { ap: 1, name: { zh: '放下歸航信標', en: 'Place Homing Beacon' } };
  const visibleFoes = (g, o) => foes(g, o).filter((e) => e.side < 2 && e.x > -50 && visibility(g, o, e).visible);
  TARGET_ACTIONS.xvFocus = {
    targets: visibleFoes,
    apply(g, o, t) { o.acted.xvFocus = 1; (g.xv.focus ||= [null, null])[o.side] = { uid: t.uid, tp: g.tp, used: false }; return { zh: `集中標記光：本回合友方射擊 ${opName(t, 'zh')} 時一次命中 +1`, en: `Focused Markerlight: once this TP a friendly shooting ${opName(t, 'en')} improves its Hit by 1` }; },
  };
  TARGET_ACTIONS.xvJam = {
    targets: visibleFoes,
    apply(g, o, t) { o.acted.xvJam = 1; changeApl(g, t, -1); return { zh: `系統干擾：${opName(t, 'zh')} 下次啟動 APL -1`, en: `System Jam: ${opName(t, 'en')} has -1 APL for its next activation` }; },
  };
  TARGET_ACTIONS.xvPhoton = {
    targets: visibleFoes,
    apply(g, o, t) {
      o.acted.xvPhoton = 1;
      const r = d6();
      if (r >= 3) { t.xvPhoton = true; return { zh: `光子榴彈：擲 ${r}，${opName(t, 'zh')} 到下次啟動結束 Move -2"`, en: `Photon Grenade Launcher: rolled ${r}, ${opName(t, 'en')} has -2" Move until the end of its next activation` }; }
      return { zh: `光子榴彈：擲 ${r}，沒有效果`, en: `Photon Grenade Launcher: rolled ${r}, no effect` };
    },
  };
}

// ---------- strategy: Prepare Ambush, the Drone Controller, Counter-Network Jammers, the Homing Beacon ----------
/** The Ready step: the old Ambush marker goes; the Homing Beacon may give 1CP. */
export function xvReady(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'stealthSuits' && g.xv) {
    if (g.xv.ambush[side] && g.xv.ambush[side].tp < g.tp) g.xv.ambush[side] = null;
    const b = (g.markers || []).find((m) => m.kind === 'xvBeacon' && m.owner === side && !m.carriedBy && m.x > -50);
    if (b && g.tp > 1) {
      const n = (g.objectives || []).filter((o) => dist(o, b) <= 6).length, r = d6();
      if (r + n >= 5) g.cp[side]++;
      note(g, side, `歸航信標：擲 ${r} +${n}${r + n >= 5 ? '，+1CP' : '，沒有效果'}`, `Homing Beacon: rolled ${r} +${n}${r + n >= 5 ? ', +1CP' : ', no effect'}`);
    }
  }
}
export function xvPloyBought(g, side, ploy) {
  if (ploy.id !== 'xvAmbush') return;
  const en = foes(g, { side }).filter((e) => e.x > -50 && e.side < 2);
  const b = boardOf(g);
  let best = null;
  for (let x = 1; x < b.w; x += 1) for (let y = 1; y < b.h; y += 1) {
    const p = { x, y };
    if (territoryOf(g, p) !== side || en.some((e) => dist(e, p) - radius(e) <= 2)) continue;
    const s = en.length ? Math.min(...en.map((e) => dist(e, p))) : 0;
    if (!best || s < best.s) best = { p, s };
  }
  if (!best) return;
  g.xv.ambush[side] = { x: best.p.x, y: best.p.y, tp: g.tp };
  note(g, side, `準備伏擊：伏擊標記放在 (${best.p.x}, ${best.p.y})`, `Prepare Ambush: the Ambush marker goes at (${best.p.x}, ${best.p.y})`);
}
export function xvDroneOk(g, side) { return g.teams[side] === 'stealthSuits' && !!g.xv && g.phase === 'strategy' && g.xv.used[side].droneCtl !== g.tp && living(g, side).some((o) => tpl(o).xvShasvre && o.x > -50) && living(g, side).some((o) => tpl(o).xvDrone && o.x > -50); }
/** XV26 Drone Controller (Shas'vre gambit): a drone ignores its action limits and its control penalty until the end of its next activation. */
export function xvDrone(g, side, uid) {
  const d = getOp(g, uid) || living(g, side).find((o) => o.tplId === 'xvGunDrone' && o.x > -50) || living(g, side).find((o) => tpl(o).xvDrone && o.x > -50);
  if (!xvDroneOk(g, side) || !d || !tpl(d).xvDrone || d.side !== side) return false;
  g.xv.used[side].droneCtl = g.tp; d.xvFreeDrone = true;
  note(g, side, `XV26 無人機控制：${opName(d, 'zh')} 到下次啟動結束不受無人機限制`, `XV26 Drone Controller: ${opName(d, 'en')} ignores its Drone limits until the end of its next activation`);
  return true;
}
export function xvJamOk(g, side) { return g.teams[side] === 'stealthSuits' && !!g.xv && g.phase === 'strategy' && equip(g, side, 'xvJammers') && g.xv.used[side].jammers !== g.tp && (g.objectives || []).length > 0; }
export function xvJammers(g, side) {
  if (!xvJamOk(g, side)) return false;
  const mine = living(g, side).filter((o) => isXV(o) && o.x > -50);
  const obj = (g.objectives || []).slice().sort((a, b) => Math.min(...mine.map((o) => dist(o, a)), 99) - Math.min(...mine.map((o) => dist(o, b)), 99))[0];
  g.xv.used[side].jammers = g.tp; g.xv.jam[side] = { id: obj.id, tp: g.tp };
  note(g, side, `反網路干擾器：鎖定 (${obj.x.toFixed(1)}, ${obj.y.toFixed(1)}) 的目標點`, `Counter-Network Jammers: the marker at (${obj.x.toFixed(1)}, ${obj.y.toFixed(1)})`);
  return true;
}
/** Counter-Network Jammers at a marker: the enemy total counts 1 lower when one of them is within 3" of a friendly suit. */
export function xvJamControl(g, obj, sum) {
  for (const s of [0, 1]) {
    const j = g.xv?.jam?.[s];
    if (!j || j.tp !== g.tp || j.id !== obj.id) continue;
    const e = 1 - s, mine = living(g, s).filter((o) => isXV(o) && o.x > -50);
    if (living(g, e).some((o) => o.x > -50 && dist(o, obj) - radius(o) - 0.4 <= CONTROL && mine.some((m) => edgeDist(m, o) <= 3))) sum[e] = Math.max(0, sum[e] - 1);
  }
}
export function xvAiStrategy(g, side) {
  if (g.teams[side] !== 'stealthSuits' || !g.xv) return;
  if (xvDroneOk(g, side)) xvDrone(g, side, null);
  if (xvJamOk(g, side)) xvJammers(g, side);
}
