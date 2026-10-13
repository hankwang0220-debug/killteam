// Spectre Squad (魅影小隊) rules engine: Elite Fieldcraft (interrupting the enemy's activation), the Vox-relay Beacon, Medic!, the Loader,
// the ploys and the faction equipment. game.js calls these hooks; the team data is in data/spectres.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { ACTIONS, TARGET_ACTIONS, CONTROL, autoFF, changeApl, d6, edgeDist, engagedEnemies, foes, forcedShot, getOp, handOff, hasPloy, ffArmed, isEngaged, living, log, opName, radius, shootCheck, team, tpl, visibility, weaponsFor, boardOf, deployZones, territoryOf, moveStat, aplNow } from './game.js';
import { dist, distPointRect } from './geometry.js';
import { bestStep, stepTo } from './sanctifiers.js';
import { SPECTRES_TEAM, SP_OVERWATCH, SP_EXTRA_EQUIPMENT, spectresRosterError } from './data/spectres.js';

export function isSP(o) { return o?.team === 'spectres'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
const real = (o) => isSP(o) && !tpl(o).spBeacon;

// ---------- setup ----------
export function spSetup(g, roster) {
  g.sp = { fc: [0, 0], used: [{}, {}] };
  for (const side of [0, 1]) if (g.teams[side] === 'spectres') {
    const error = spectresRosterError(SPECTRES_TEAM, roster[side]);
    if (error) throw new Error(error.en);
  }
}
/** Prepared Killzone (Guide): one extra equipment option, but only an Ammo Cache or equipment terrain. */
export function spTrimEquipment(g, side) {
  if (g.teams[side] !== 'spectres') return;
  const list = g.equip[side], hasGuide = g.ops.some((o) => o.side === side && tpl(o).spGuide);
  const normal = list.filter((id) => !SP_EXTRA_EQUIPMENT.includes(id) || true);
  if (list.length <= 4) return;
  // the fifth option must be an Ammo Cache / terrain option, and only with a Guide
  const extra = [...list].reverse().find((id) => SP_EXTRA_EQUIPMENT.includes(id));
  if (!hasGuide || !extra) { g.equip[side] = list.slice(0, 4); return; }
  g.equip[side] = [...list.filter((id) => id !== extra).slice(0, 4), extra];
  void normal;
}

// ---------- Elite Fieldcraft points ----------
/** The Ready step: 1 Fieldcraft point (2 with a Vox-operator in the killzone and not engaged). */
export function spReady(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'spectres') {
    const vox = living(g, side).some((o) => tpl(o).spVox && o.x > -50 && !isEngaged(g, o));
    g.sp.fc[side] = (g.sp.fc[side] || 0) + (vox ? 2 : 1);
    for (const o of living(g, side)) { o.fcTP = 0; o.spIssued = 0; o.spVolley = false; }
    note(g, side, `野戰點 +${vox ? 2 : 1}（共 ${g.sp.fc[side]}）`, `Fieldcraft points +${vox ? 2 : 1} (${g.sp.fc[side]} in all)`);
  }
}
/** The end of the turning point: the points are discarded. */
export function spTPEnd(g) { if (g.sp) g.sp.fc = [0, 0]; }

const expected = (w, t) => w.atk * Math.max(0.1, (7 - w.hit) / 6) * ((w.dmg[0] + w.dmg[1]) / 2) * (w.rules.devastating ? 1.3 : 1) * (t.save >= 0 ? 1 : 1);
function shotOptions(g, op, actor) {
  const keep = { order: op.order, ap: op.ap, acted: op.acted };
  op.order = 'engage'; op.ap = 1; op.acted = {}; // (as if it could shoot: only the check needs the AP)
  try {
    return weaponsFor(g, op).filter((w) => w.type === 'ranged' && shootCheck(g, op, actor, w).ok).map((w) => ({ w, e: expected(w, actor) })).sort((a, b) => b.e - a.e);
  } finally { op.order = keep.order; op.ap = keep.ap; op.acted = keep.acted; }
}

/**
 * Elite Fieldcraft: after an enemy with an Engage order performs an action, a ready friendly SPECTRE SQUAD operative (not engaged with any
 * other enemy) can interrupt with a free Shoot. Automatic (switch it off with the firefight ploy toggle); only the Shoot is offered.
 */
export function spAfterAction(g, actor) {
  if (g.spBusy || g.phase !== 'firefight' || !actor || actor.dead || actor.side > 1 || actor.counter || g.active !== actor.uid) return;
  const side = 1 - actor.side;
  if (g.teams[side] !== 'spectres' || !g.sp || actor.acted.spInterrupted || actor.x < -50) return;
  if (!ffArmed(g, side, 'spFieldcraft')) return;
  const sharp = actor.order === 'conceal' && living(g, side).some((o) => real(o) && edgeDist(o, actor) <= 8);
  if (actor.order !== 'engage' && !sharp) return;
  const cool = g.sp.used[side].cool !== g.tp && living(g, side).some((o) => tpl(o).spTrooper && !o.dead);
  if ((g.sp.fc[side] || 0) < 1 && !cool) return;
  const cands = living(g, side).filter((o) => real(o) && o.x > -50 && o.fcTP !== g.tp && (o.ready || o.spIssued === g.tp) && engagedEnemies(g, o).every((e) => e === actor));
  let best = null;
  for (const o of cands) { const s = shotOptions(g, o, actor)[0]; if (s && (!best || s.e > best.s.e)) best = { o, s }; }
  if (!best) return;
  if (actor.order !== 'engage' && !autoFF(g, side, 'spReact')) return; // Sharp Reactions (firefight ploy)
  // Cool-Headed: once per turning point a Trooper interrupts for 0 points.
  if (cool && tpl(best.o).spTrooper) g.sp.used[side].cool = g.tp; else if ((g.sp.fc[side] || 0) >= 1) g.sp.fc[side]--; else if (cool) g.sp.used[side].cool = g.tp; else return;
  const { o, s } = best, wasReady = o.ready;
  g.spBusy = true;
  try {
    actor.acted.spInterrupted = true; o.fcTP = g.tp;
    o.order = 'engage';
    if (!wasReady) { o.noCounterTP = g.tp; o.counteracted = true; }
    note(g, side, `野戰技巧：${opName(o, 'zh')} 打斷 ${opName(actor, 'zh')} 的啟動，免費開火`, `Elite Fieldcraft: ${opName(o, 'en')} interrupts ${opName(actor, 'en')}'s activation with a free shot`);
    forcedShot(g, o, s.w, [actor], true);
    if (s.w.rules.spOverwatch || s.w.id === 'spOverwatch') g.sp.used[side].sniper = g.tp;
  } finally { g.spBusy = false; }
}

// ---------- actions: Issue Mission, Signal, Advanced Camouflage ----------
export function spActions(g, op, add) {
  if (!isSP(op) || op.side > 1) return;
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' };
  if (tpl(op).spSergeant) add('spIssue', !eng && TARGET_ACTIONS.spIssue.targets(g, op).length > 0, eng ? ENG : { zh: '沒有可選的目標', en: 'No valid target' });
  if (tpl(op).spBeacon) add('spBeaconSignal', !eng && TARGET_ACTIONS.spBeaconSignal.targets(g, op).length > 0, { zh: '6" 內沒有友方魅影', en: 'No friendly SPECTRE within 6"' });
  if (tpl(op).spLoader) {
    const bad = eng || op.counter || op.acted.charge || op.acted.dash || op.acted.shoot;
    add('spLoad', !bad && TARGET_ACTIONS.spLoad.targets(g, op).length > 0, eng ? ENG : op.counter ? { zh: '反擊時不能執行', en: 'Not while counteracting' } : bad ? { zh: '同一次啟動不能和衝鋒、衝刺或射擊並用', en: 'Not with Charge, Dash or Shoot' } : { zh: '沒有可選的友方', en: 'No valid friendly' });
  }
  if (equip(g, op.side, 'spCamo') && real(op)) {
    const seen = foes(g, op).some((e) => e.side < 2 && e.x > -50 && edgeDist(e, op) <= 3 && visibility(g, e, op).visible);
    add('spCamo', !seen && !op.spCamoOn, op.spCamoOn ? { zh: '已啟動', en: 'Already running' } : { zh: '3" 內有看得到它的敵人', en: 'Visible to and within 3" of an enemy' });
  }
}
export function spSelf(g, op, id) {
  if (id !== 'spCamo') return false;
  op.spCamoOn = true;
  note(g, op.side, `${opName(op, 'zh')} 先進偽裝：到下次啟動前，隱蔽且在掩護中時，2" 外不能被選為目標`, `${opName(op, 'en')} Advanced Camouflage: until its next activation, Concealed and in cover it can't be targeted beyond 2"`);
  return true;
}
/** Advanced Camouflage: can this operative not be selected as a valid target by that enemy? */
export function spCamoHidden(g, from, to) {
  return real(to) && to.spCamoOn && to.order === 'conceal' && visibility(g, from, to).cover && edgeDist(from, to) > 2;
}
export function spActivate(g, op) {
  if (!isSP(op) || op.side > 1) return;
  if (!g.counter) op.spCamoOn = false; // (Advanced Camouflage lasts until the start of its next activation)
  op.spVolley = false;
  if (!g.counter && hasPloy(g, op.side, 'spAmbush') && real(op) && !foes(g, op).some((e) => e.x > -50 && e.side < 2 && (edgeDist(e, op) <= 3 || (visibility(g, e, op).visible && !(op.order === 'conceal' && visibility(g, e, op).cover))))) op.spVolley = true; // Ambushing Volley
  op.spWT = tpl(op).spHeavy && living(g, op.side).some((o) => tpl(o).spLoader && edgeDist(o, op) <= CONTROL + 0.01); // Weapons Team
}
export function spEnd(op) { if (op) { op.spVolley = false; op.spWT = false; } }

export function registerSpectreActions() {
  ACTIONS.spIssue = { ap: 0, name: { zh: '下達任務', en: 'Issue Mission' } };
  ACTIONS.spBeaconSignal = { ap: 1, name: { zh: '信標信號', en: 'Signal' } };
  ACTIONS.spLoad = { ap: 1, name: { zh: '裝填武器', en: 'Load Weapon' } };
  ACTIONS.spCamo = { ap: 1, name: { zh: '先進偽裝', en: 'Advanced Camouflage' } };
  ACTIONS.spSignal = { ap: 1, name: { zh: '信號', en: 'Signal' } };
  TARGET_ACTIONS.spIssue = {
    targets: (g, o) => living(g, o.side).filter((t) => real(t) && t !== o && !t.ready && t.fcTP !== g.tp && t.spIssued !== g.tp && visibility(g, o, t).visible),
    apply(g, o, t) { t.spIssued = g.tp; return { zh: `下達任務：${opName(t, 'zh')} 本回合即使已行動也能用野戰技巧打斷（但不能反應）`, en: `Issue Mission: ${opName(t, 'en')} can interrupt with Elite Fieldcraft this turning point even though it is expended (it can't counteract)` }; },
  };
  const signal = (range, vis) => ({
    targets: (g, o) => living(g, o.side).filter((t) => t !== o && real(t) && (vis ? visibility(g, o, t).visible : edgeDist(o, t) <= range)),
    apply(g, o, t) { changeApl(g, t, 1); return { zh: `信號：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Signal: ${opName(t, 'en')} gets +1 APL for its next activation` }; },
  });
  TARGET_ACTIONS.spSignal = signal(0, true);
  TARGET_ACTIONS.spBeaconSignal = signal(6, false);
  TARGET_ACTIONS.spLoad = {
    targets: (g, o) => living(g, o.side).filter((t) => t !== o && real(t) && edgeDist(o, t) <= CONTROL + 0.01 && !foes(g, t).some((e) => e.x > -50 && e.side < 2 && edgeDist(e, t) <= 3) && !t.dead),
    apply(g, o, t) {
      const foesNear = foes(g, t).filter((e) => e.side < 2 && e.x > -50);
      const keep = { order: t.order, ap: t.ap, acted: t.acted };
      t.order = 'engage'; t.ap = 1; t.acted = {};
      let best = null;
      for (const w of weaponsFor(g, t).filter((x) => x.type === 'ranged')) for (const e of foesNear) if (shootCheck(g, t, e, w).ok) { const s = expected(w, e) - e.wounds * 0.01; if (!best || s > best.s) best = { w, e, s }; }
      t.ap = keep.ap; t.acted = keep.acted;
      if (!best) { t.order = keep.order; return { zh: `裝填武器：${opName(t, 'zh')} 沒有可射擊的目標`, en: `Load Weapon: ${opName(t, 'en')} has nothing to shoot` }; }
      t.order = 'engage';
      forcedShot(g, t, best.w, [best.e], true);
      return { zh: `裝填武器：${opName(t, 'zh')} 免費射擊 ${opName(best.e, 'zh')}`, en: `Load Weapon: ${opName(t, 'en')} makes a free Shoot at ${opName(best.e, 'en')}` };
    },
  };
}

// ---------- weapons and rules ----------
/** Weapons Team (Heavy Gunner with a Loader) and the Sniper Overwatch equipment. */
export function spWeapons(g, op, ws) {
  if (!isSP(op) || op.side > 1) return ws;
  if (op.spWT) ws = ws.map((w) => (w.rules.spMissile ? { ...w, rules: { ...w.rules, heavy: 'dash' } } : w));
  if (equip(g, op.side, 'spSniper') && real(op) && g.sp?.used[op.side]?.sniper !== g.tp) ws = [...ws, SP_OVERWATCH];
  return ws;
}
export function spRules(g, op, weapon, target, r) {
  // An enemy shooting or fighting near a Stub-gunner: Suppressive Fire.
  if (op.side < 2 && foes(g, op).some((s) => tpl(s).spStubGunner && s.order === 'engage' && s.chargedTP !== g.tp && s.x > -50 && edgeDist(s, op) <= 3 && visibility(g, s, op).visible && engagedEnemies(g, s).every((e) => e === op))) r.atkMinus = (r.atkMinus || 0) + 1;
  if (!isSP(op) || op.side > 1) return;
  if (weapon.type === 'ranged' && op.spVolley && !weapon.rules.spSuppressive) r.devastating = (r.devastating || 0) + 1; // Ambushing Volley
  if (hasPloy(g, op.side, 'spHidden') && weapon.type === 'ranged' && target && visibility(g, target, op).cover) r.balanced = true; // Hidden Engagement
  if (weapon.type === 'ranged' && living(g, op.side).some((o) => o !== op && tpl(o).spLoader && edgeDist(o, op) <= CONTROL + 0.01)) r.balanced = true; // Weapon Assist (Loader)
  if (hasPloy(g, op.side, 'spPatience') && op.ready !== undefined && g.active === op.uid && living(g, op.side).filter((o) => o.ready && o !== op).length === 0 && (weapon.type === 'ranged' || weapon.type === 'melee')) r.relentless = true; // Patience: the last to activate
  if (op.acted?.spSilent && weapon.type === 'melee') r.spSilent = true;
}
/** Patience (ploy): once, after the opponent's first activation, skip your own activation. */
export function spPatienceOk(g, side) {
  return g.teams[side] === 'spectres' && hasPloy(g, side, 'spPatience') && g.phase === 'firefight' && g.turn === side && !g.active && !g.counter && g.sp.used[side].patience !== g.tp
    && (g.actCount?.[1 - side] || 0) >= 1;
}
export function spPatience(g, side) {
  if (!spPatienceOk(g, side)) return false;
  g.sp.used[side].patience = g.tp;
  note(g, side, '耐心：跳過這次啟動', 'Patience: skips this activation');
  handOff(g, side);
  return true;
}

// ---------- strategy ----------
/** Disappear (ploy): a free Reposition for the friendly operative that needs it most. */
export function spPloyBought(g, side, ploy) {
  if (ploy.id !== 'spDisappear') return;
  const enemies = foes(g, { side }).filter((e) => e.x > -50 && e.side < 2);
  const z = deployZones(g)[1 - side], zc = { x: (z.x0 + z.x1) / 2, y: ((z.y0 ?? 0) + (z.y1 ?? boardOf(g).h)) / 2 };
  const near = (o) => Math.min(...enemies.map((e) => dist(o, e)), 99);
  const cands = living(g, side).filter((o) => real(o) && o.x > -50 && !isEngaged(g, o) && o.reposTP !== g.tp).sort((a, b) => near(a) - near(b));
  for (const o of cands) {
    const q = bestStep(g, o, moveStat(g, o), 'dash', (p) => {
      if (enemies.some((e) => dist(p, e) < dist(o, e) - 0.01)) return null; // not closer to any enemy
      if (dist(p, zc) < dist(o, zc) - 0.01) return null; // nor to the enemy drop zone
      return Math.min(...enemies.map((e) => dist(p, e)), 20) - near(o);
    });
    if (q) { stepTo(g, o, q); o.reposTP = g.tp; note(g, side, `消失：${opName(o, 'zh')} 免費重新定位，離開敵人`, `Disappear: ${opName(o, 'en')} makes a free Reposition away from the enemy`); return; }
  }
  note(g, side, '消失：沒有合適的重新定位', 'Disappear: no worthwhile Reposition');
}
/** Starshell Flare (equipment, strategic gambit): a free Stun Grenade; it can't be used again once it changed an enemy's APL. */
export function spStarshellOk(g, side) { return g.teams[side] === 'spectres' && g.phase === 'strategy' && equip(g, side, 'spStarshell') && !g.sp.used[side].starshellDone && g.sp.used[side].starshell !== g.tp; }
export function spStarshell(g, side) {
  if (!spStarshellOk(g, side)) return false;
  let best = null;
  for (const o of living(g, side).filter((x) => real(x) && x.x > -50)) for (const t of foes(g, o).filter((e) => e.side < 2 && edgeDist(o, e) <= 6 && visibility(g, o, e).visible)) {
    const hit = [t, ...g.ops.filter((x) => !x.dead && x !== t && x.side < 2 && edgeDist(x, t) <= 1)];
    const score = hit.filter((x) => x.side !== side).length - 2 * hit.filter((x) => x.side === side).length;
    if (!best || score > best.score) best = { o, t, hit, score };
  }
  if (!best) return false;
  g.sp.used[side].starshell = g.tp;
  let changed = false;
  const parts = best.hit.map((x) => { const roll = d6(); if (roll >= 3) { changeApl(g, x, -1); if (x.side !== side) changed = true; } return `${opName(x, 'zh')} ${roll}${roll >= 3 ? '（APL -1）' : ''}`; });
  if (changed) g.sp.used[side].starshellDone = true;
  note(g, side, `照明彈：${opName(best.o, 'zh')} 投出，${parts.join('、')}${changed ? '（之後不能再用）' : ''}`, `Starshell Flare: ${opName(best.o, 'en')} throws it${changed ? ' (it can\'t be used again)' : ''}`);
  return true;
}
export function spAiStrategy(g, side) {
  if (g.teams[side] !== 'spectres' || !g.sp) return;
  if (spStarshellOk(g, side) && g.tp >= 2) spStarshell(g, side);
}

// ---------- deployment: the Beacon is set up in the territory ----------
/** Pre-Deploy (Vox-relay Beacon): wholly within the territory, more than 2" from markers and equipment terrain. */
export function spBeaconOk(g, op, p) {
  const r = radius(op), b = boardOf(g);
  if (p.x - r < 0 || p.y - r < 0 || p.x + r > b.w || p.y + r > b.h) return false;
  if (territoryOf(g, { x: p.x - r, y: p.y - r }) !== op.side || territoryOf(g, { x: p.x + r, y: p.y + r }) !== op.side || territoryOf(g, { x: p.x - r, y: p.y + r }) !== op.side || territoryOf(g, { x: p.x + r, y: p.y - r }) !== op.side) return false;
  if (g.terrain.some((t) => distPointRect(p, t) < r || (t.equip != null && distPointRect(p, t) <= 2))) return false;
  if ([...(g.markers || []), ...(g.objectives || [])].some((m) => dist(m, p) <= 2)) return false;
  return !g.ops.some((o) => o.uid !== op.uid && !o.dead && o.x > -50 && dist(o, p) < radius(o) + r + 0.05);
}
/** Automatic set-up: the Beacon goes forward in the territory (the rest use the usual placement). */
export function spPlaceAuto(g, side, ops, base) {
  if (g.teams[side] !== 'spectres') return base(g, side, ops);
  const beacons = ops.filter((o) => tpl(o).spBeacon), rest = ops.filter((o) => !tpl(o).spBeacon);
  const placed = rest.length ? base(g, side, rest) : [];
  const out = [...placed];
  for (const o of beacons) {
    const b = boardOf(g), along = g.axis === 'y' ? 'y' : 'x', mid = (along === 'x' ? b.w : b.h) / 2;
    let best = null;
    for (let x = 1; x < b.w; x += 0.8) for (let y = 1; y < b.h; y += 0.8) {
      const p = { x, y };
      if (!spBeaconOk(g, o, p)) continue;
      const score = Math.abs(p[along] - mid) + Math.abs((along === 'x' ? p.y : p.x) - ((along === 'x' ? b.h : b.w) / 2)) * 0.2;
      if (!best || score < best.score) best = { p, score };
    }
    if (best) { o.x = best.p.x; o.y = best.p.y; out.push(o); }
  }
  return out;
}

// ---------- Tvid-feed Triangulation ----------
/** Once per turning point (automatic): the target of a friendly SPECTRE SQUAD shot can't be obscured. */
export function spTvid(g, op, target) {
  if (!real(op) || op.side > 1 || !equip(g, op.side, 'spTvid') || g.sp?.used[op.side]?.tvid === g.tp || !target) return false;
  const other = living(g, op.side).some((o) => o !== op && real(o) && o.x > -50 && visibility(g, o, target).visible);
  const beacon = living(g, op.side).some((o) => tpl(o).spBeacon && edgeDist(o, target) <= 6);
  return other || beacon;
}
export function spTvidUsed(g, op) { if (g.sp) g.sp.used[op.side].tvid = g.tp; }

// ---------- the computer ----------
/** The computer's Silent Killers / Patience and other bits are automatic; nothing else to decide. */
export function spAiSkip(g, side) { return spPatienceOk(g, side) && living(g, side).filter((o) => o.ready).length >= 3 && Math.random() < 0.2 ? spPatience(g, side) : false; }
