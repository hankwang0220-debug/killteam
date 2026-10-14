// Tempestus Aquilons (風暴天鷹) rules engine: Drop Insertion (set up above, Drop markers, landing), Gunfight, Dynamic, the Tempestus Veteran,
// the ploys and the faction equipment. game.js calls these hooks; the team data is in data/aquilons.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { abilityArmed, ACTIONS, TARGET_ACTIONS, CONTROL, ffOn, applyDamage, autoFF, d3, d6, edgeDist, engagedEnemies, foes, forcedShot, hasPloy, ffArmed, ffReady, isEngaged, living, log, opName, radius, spend, tpl, visibility, boardOf, deployZones, moveStat, changeApl, actionCost, controller } from './game.js';
import { dist } from './geometry.js';
import { moveCtx } from './path.js';
import { bestStep, stepTo } from './sanctifiers.js';
import { AQUILONS_TEAM, AQ_DAGGER, aquilonsRosterError } from './data/aquilons.js';

export function isAQ(o) { return o?.team === 'aquilons'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
const zoneOf = (g, side) => deployZones(g)[side];
const inZone = (g, side, p, r) => { const z = zoneOf(g, side); return p.x - r >= z.x0 - 0.001 && p.x + r <= z.x1 + 0.001 && p.y - r >= (z.y0 ?? 0) - 0.001 && p.y + r <= (z.y1 ?? boardOf(g).h) + 0.001; };
const enemyZoneCentre = (g, side) => { const z = zoneOf(g, 1 - side); return { x: (z.x0 + z.x1) / 2, y: ((z.y0 ?? 0) + (z.y1 ?? boardOf(g).h)) / 2 }; };

// ---------- setup ----------
export function aqSetup(g, roster) {
  g.aq = { drop: [[], []], used: [{}, {}], vet: [{}, {}], endCount: 0, actN: [0, 0], sudden: [0, 0] };
  for (const side of [0, 1]) if (g.teams[side] === 'aquilons') {
    const error = aquilonsRosterError(AQUILONS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
  }
}
/** The index of the third an operative belongs to (the team split into three, bigger groups first). */
function thirdOf(g, op) {
  const mine = g.ops.filter((o) => o.side === op.side), n = mine.length, i = mine.indexOf(op);
  let acc = 0;
  for (let t = 0; t < 3; t++) { acc += Math.floor(n / 3) + (t < n % 3 ? 1 : 0); if (i < acc) return t; }
  return 2;
}

// ---------- Drop markers ----------
function dropSpot(g, side) {
  const z = zoneOf(g, side), b = boardOf(g), along = g.axis === 'y' ? 'y' : 'x', across = along === 'x' ? 'y' : 'x';
  const low = z[along + '0'] <= 0.01;
  const front = low ? z[along + '1'] - 1 : z[along + '0'] + 1;
  const n = g.aq.drop[side].length;
  const c = [0.5, 0.3, 0.7][n % 3] * (across === 'y' ? b.h : b.w);
  return { [along]: front, [across]: c };
}
function addMarker(g, side) {
  const p = dropSpot(g, side);
  g.aq.drop[side].push({ x: p.x, y: p.y, movedTP: 0 });
  note(g, side, `空降標記放在 (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`, `Drop marker placed at (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
}
export function aqCanAbove(g, side) {
  const d = g.dep;
  return g.teams[side] === 'aquilons' && !!d && !d.done && g.phase === 'deploy' && d.turn === side && (d.step?.[side] || 0) >= 1 && d.batch.length === 0;
}
/** Set up the whole current third above (aside), with a Drop marker in the drop zone. */
export function aqSetAbove(g, side) {
  if (!aqCanAbove(g, side)) return false;
  const ops = g.ops.filter((o) => o.side === side && !o.dead && o.placed === false).slice(0, g.dep.need);
  for (const o of ops) { o.above = true; o.reserve = true; o.placed = true; o.x = -99; o.y = -99; g.dep.batch.push(o.uid); }
  addMarker(g, side);
  note(g, side, `${ops.length} 名特工在天上待命`, `${ops.length} operatives wait above`);
  return true;
}
/** Automatic set-up: the second third goes above (the first and third are set up normally). */
export function aqPlaceAuto(g, side, ops, base) {
  if (g.teams[side] !== 'aquilons') return base(g, side, ops);
  const up = ops.filter((o) => thirdOf(g, o) === 1 && o.side === side), rest = ops.filter((o) => !up.includes(o));
  const placed = rest.length ? base(g, side, rest) : [];
  if (up.length) {
    for (const o of up) { o.above = true; o.reserve = true; o.x = -99; o.y = -99; }
    addMarker(g, side);
  }
  return [...placed, ...up];
}

/** The Ready step: a Drop marker is removed in turning points 2 and 3. */
export function aqReady(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'aquilons' && g.aq) {
    g.aq.actN[side] = 0;
    for (const o of living(g, side)) { o.aqNoAtk = 0; }
    if ((g.tp === 2 || g.tp === 3) && g.aq.drop[side].length) { g.aq.drop[side].pop(); note(g, side, '移除一個空降標記', 'A Drop marker is removed'); }
    for (const m of g.aq.drop[side]) m.movedTP = 0;
  }
}
/** The end of a turning point: more than half in the killzone after TP1; whoever is still above after TP2 is incapacitated. */
export function aqTPEnd(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'aquilons' && g.aq) {
    const mine = living(g, side), above = mine.filter((o) => o.above);
    if (g.tp === 1) {
      const limit = Math.ceil(mine.length / 2) - 1; // (less than half of them above)
      for (const o of above.slice(limit)) { if (aqAutoLand(g, o)) note(g, side, `${opName(o, 'zh')} 必須降落（超過一半要在戰場上）`, `${opName(o, 'en')} must land (more than half must be in the killzone)`); }
    }
    if (g.tp === 2) for (const o of above) { note(g, side, `${opName(o, 'zh')} 沒有降落，殘廢`, `${opName(o, 'en')} never landed and is incapacitated`); applyDamage(g, null, o, o.wounds); }
  }
  for (const o of g.ops) o.aqObs = null;
}
const markerStep = (g, side, m, to) => dist(m, to) <= 4 + 0.01 && m.movedTP !== g.tp;
export function aqMoveDrop(g, side, idx, p) {
  const m = g.aq?.drop?.[side]?.[idx];
  if (!m || g.phase !== 'strategy' || g.tp > 2 || !markerStep(g, side, m, p)) return false;
  const b = boardOf(g);
  if (p.x < 0.5 || p.y < 0.5 || p.x > b.w - 0.5 || p.y > b.h - 0.5) return false;
  m.x = p.x; m.y = p.y; m.movedTP = g.tp;
  note(g, side, `空降標記移動到 (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`, `A Drop marker moves to (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
  return true;
}
export function aqDropLeft(g, side) { return g.teams[side] === 'aquilons' && !!g.aq && g.phase === 'strategy' && g.tp <= 2 && g.aq.drop[side].some((m) => m.movedTP !== g.tp); }
/** Automatic: every Drop marker moves 4" towards the enemy (the nearest spot that keeps it on the board and off terrain). */
export function aqAutoDrop(g, side) {
  if (!aqDropLeft(g, side)) return false;
  const goal = enemyZoneCentre(g, side);
  g.aq.drop[side].forEach((m, i) => {
    if (m.movedTP === g.tp) return;
    const d = Math.min(4, dist(m, goal)), p = { x: m.x + (goal.x - m.x) / Math.max(0.01, dist(m, goal)) * d, y: m.y + (goal.y - m.y) / Math.max(0.01, dist(m, goal)) * d };
    if (!g.terrain.some((t) => p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h)) aqMoveDrop(g, side, i, p);
  });
  return true;
}

// ---------- Rapid Insertion (Trooper strategic gambit, first turning point) ----------
export function aqRapidOk(g, side) {
  return g.teams[side] === 'aquilons' && !!g.aq && g.phase === 'strategy' && g.tp === 1 && !g.aq.used[side].rapid
    && living(g, side).some((o) => tpl(o).aqTrooper && o.x > -50 && inZone(g, side, o, radius(o)));
}
export function aqRapid(g, side) {
  if (!aqRapidOk(g, side)) return false;
  g.aq.used[side].rapid = true;
  const goal = enemyZoneCentre(g, side), z = zoneOf(g, side);
  const near = (p, r) => { const dx = Math.max(z.x0 - p.x, 0, p.x - z.x1), dy = Math.max((z.y0 ?? 0) - p.y, 0, p.y - (z.y1 ?? boardOf(g).h)); return Math.hypot(dx, dy) + r <= 3.0; };
  let n = 0;
  for (const o of living(g, side).filter((x) => tpl(x).aqTrooper && x.x > -50 && inZone(g, side, x, radius(x)))) {
    const q = bestStep(g, o, moveStat(g, o), 'dash', (p) => (near(p, radius(o)) ? dist(o, goal) - dist(p, goal) : null));
    if (q) { stepTo(g, o, q); n++; }
  }
  note(g, side, `快速空降：${n} 名士兵免費重新定位`, `Rapid Insertion: ${n} Troopers make a free Reposition`);
  return true;
}

// ---------- activation: landing from above ----------
export function aqActivate(g, op) {
  if (!isAQ(op) || op.side > 1) return;
  if (!g.counter) { op.aqApplied = false; g.aq.actN[op.side]++; op.aqActIdx = g.aq.actN[op.side]; }
}
export function aqEnd(g, op) { if (g.aq) g.aq.endCount++; void op; }
const landRange = (g, op) => (tpl(op).aqTrooper ? 4 : 3);
export function aqLandCheck(g, op, p) {
  if (!op.above) return { ok: false, why: { zh: '不在天上', en: 'Not above' } };
  const side = op.side, r = radius(op), b = boardOf(g);
  if (p.x < r || p.y < r || p.x > b.w - r || p.y > b.h - r) return { ok: false, why: { zh: '超出戰場', en: 'Off the board' } };
  const probe = { ...op, x: p.x, y: p.y, above: false, reserve: false };
  const ctx = moveCtx(g, probe, 'reposition');
  if (!ctx.placement(p).ok) return { ok: false, why: { zh: '底盤放不下', en: 'The base does not fit' } };
  if (!tpl(op).aqPrecursor && ctx.inEnemyER(p)) return { ok: false, why: { zh: '不能在敵人控制範圍內（先驅除外）', en: 'Not in enemy control range (Precursors can)' } };
  const markers = g.aq.drop[side], rng = landRange(g, op);
  if (markers.some((m) => dist(p, m) - r <= rng + 0.01) || inZone(g, side, p, r)) return { ok: true };
  // Adjust Coordinates (firefight ploy): within 5" of a Drop marker
  if (markers.some((m) => dist(p, m) - r <= 5 + 0.01) && ffReady(g, side, 'aqAdjust') && ffArmed(g, side, 'aqAdjust')) return { ok: true, adjust: true };
  // Drop Augury (equipment, once per battle): a marker can be moved again (not closer to the enemy drop zone)
  if ((equip(g, side, 'aqAugury') && abilityArmed(g, side, 'aqAugury')) && !g.aq.used[side].augury && markers.some((m) => dist(p, m) - r <= rng + 4 + 0.01)) return { ok: true, augury: true };
  return { ok: false, why: { zh: `要在空降標記 ${rng}" 內，或完全在己方降落區內`, en: `Must be within ${rng}" of a Drop marker or wholly in your drop zone` } };
}
export function aqDoLand(g, op, p) {
  const c = aqLandCheck(g, op, p);
  if (!c.ok || op.ap < actionCost(g, op, 'reposition')) return false;
  const side = op.side;
  if (c.adjust) { if (!autoFF(g, side, 'aqAdjust')) return false; op.aqNoAtk = g.tp; }
  if (c.augury) {
    g.aq.used[side].augury = true;
    const r = radius(op), goal = enemyZoneCentre(g, side), m = g.aq.drop[side].slice().sort((a, b) => dist(a, p) - dist(b, p))[0];
    const d = dist(m, p), t = Math.min(4, Math.max(0, d - landRange(g, op) + r + 0.01));
    const np = { x: m.x + (p.x - m.x) / d * t, y: m.y + (p.y - m.y) / d * t };
    if (dist(np, goal) < dist(m, goal) - 0.01) { // not closer to the enemy drop zone: it lands in the nearest legal spot instead
      g.aq.used[side].augury = false; return false;
    }
    m.x = np.x; m.y = np.y;
    note(g, side, '空降占卜：空降標記移動', 'Drop Augury: a Drop marker moves');
  }
  spend(g, op, 'reposition');
  op.x = p.x; op.y = p.y; op.above = false; op.reserve = false;
  op.aqLandAct = op.uid; op.aqLandTP = g.tp; op.aqObs = g.aq.endCount + 2; op.aqObsTP = g.tp;
  note(g, side, `${opName(op, 'zh')} 降落（視為重新定位）`, `${opName(op, 'en')} lands (counts as a Reposition)`);
  return true;
}
/** Land wherever it fits near a Drop marker (the computer, and the TP1 limit). */
export function aqAutoLand(g, op) {
  const side = op.side, ms = g.aq.drop[side], r = radius(op);
  const cands = [];
  for (const m of ms) for (let a = 0; a < 360; a += 20) for (const d of [0.5, 1.5, 2.5]) cands.push({ x: m.x + d * Math.cos(a * Math.PI / 180), y: m.y + d * Math.sin(a * Math.PI / 180) });
  const z = zoneOf(g, side); for (let x = z.x0 + r; x <= z.x1 - r; x += 1.2) for (let y = (z.y0 ?? 0) + r; y <= (z.y1 ?? boardOf(g).h) - r; y += 1.2) cands.push({ x, y });
  const en = foes(g, op).filter((e) => e.side < 2 && e.x > -50);
  const score = (p) => (en.length ? Math.min(...en.map((e) => Math.abs(dist(p, e) - 6))) : 0);
  const ok = cands.filter((p) => aqLandCheck(g, op, p).ok).sort((a, b) => score(a) - score(b))[0];
  if (!ok) return false;
  const keep = op.ap; op.ap = Math.max(op.ap, 1);
  const done = aqDoLandFree(g, op, ok);
  op.ap = keep;
  return done;
}
function aqDoLandFree(g, op, p) {
  const side = op.side;
  op.x = p.x; op.y = p.y; op.above = false; op.reserve = false;
  op.aqLandAct = op.uid; op.aqLandTP = g.tp; op.aqObs = g.aq.endCount + 2; op.aqObsTP = g.tp;
  note(g, side, `${opName(op, 'zh')} 降落`, `${opName(op, 'en')} lands`);
  return true;
}
/** The computer's activation of an operative set up above: land (it must by the end of TP2), or wait. */
export function aqAiAbove(g, op) {
  const mustLand = g.tp >= 2 || living(g, op.side).filter((o) => o.above).length > Math.ceil(living(g, op.side).length / 2) - 1;
  const en = foes(g, op).filter((e) => e.side < 2 && e.x > -50);
  let best = null;
  const side = op.side, r = radius(op);
  const cands = [];
  for (const m of g.aq.drop[side]) for (let a = 0; a < 360; a += 15) for (const d of [1, 2, 3, 4, 5]) cands.push({ x: m.x + d * Math.cos(a * Math.PI / 180), y: m.y + d * Math.sin(a * Math.PI / 180) });
  const z = zoneOf(g, side); for (let x = z.x0 + r; x <= z.x1 - r; x += 1.2) for (let y = (z.y0 ?? 0) + r; y <= (z.y1 ?? boardOf(g).h) - r; y += 1.2) cands.push({ x, y });
  for (const p of cands) {
    const c = aqLandCheck(g, op, p);
    if (!c.ok || c.augury) continue;
    const near = en.length ? Math.min(...en.map((e) => dist(p, e) - radius(e) - r)) : 10;
    const s = Math.abs(near - 5) + (c.adjust ? 3 : 0);
    if (!best || s < best.s) best = { p, s, near, c };
  }
  if (best && (mustLand || best.near <= 9) && op.ap >= actionCost(g, op, 'reposition')) { aqDoLand(g, op, best.p); return; }
  op.ap = 0; // expended: it stays above
}

// ---------- actions ----------
export function aqActions(g, op, add) {
  if (!isAQ(op) || op.side > 1) return;
  if (op.above) {
    add('aqLand', g.aq.drop[op.side].length > 0 || true, { zh: '沒有可降落的位置', en: 'Nowhere to land' });
    add('aqExpend', true, { zh: '', en: '' });
  }
}
export function aqSelf(g, op, id) {
  if (id !== 'aqExpend') return false;
  op.ap = 0;
  note(g, op.side, `${opName(op, 'zh')} 消耗（留在天上）`, `${opName(op, 'en')} expends (stays above)`);
  return true;
}
export function registerAquilonActions() {
  ACTIONS.aqLand = { ap: 1, name: { zh: '降落', en: 'Land' } };
  ACTIONS.aqExpend = { ap: 0, name: { zh: '消耗（留在天上）', en: 'Expend (stay above)' } };
  ACTIONS.aqCommand = { ap: 1, name: { zh: '指揮', en: 'Command' } };
  TARGET_ACTIONS.aqCommand = {
    targets: (g, o) => living(g, o.side).filter((t) => t !== o && isAQ(t) && !tpl(t).aqSentry && !t.above && edgeDist(o, t) <= 6 && visibility(g, o, t).visible),
    apply(g, o, t) { changeApl(g, t, 1); return { zh: `指揮：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Command: ${opName(t, 'en')} gets +1 APL for its next activation` }; },
  };
}
/** Is the Tempestor's Command action available? (the support action). */
export function aqCommandOk(g, op) { return isAQ(op) && !!tpl(op).aqTempestor && !isEngaged(g, op); }

// ---------- weapons, rules and defence ----------
export function aqWeapons(g, op, ws) {
  if (!isAQ(op) || op.side > 1 || tpl(op).aqSentry) return ws;
  return equip(g, op.side, 'aqDaggers') && !ws.some((w) => w.id === 'aqDagger' || w.id === 'aqDaggerP') ? [...ws, AQ_DAGGER] : ws;
}
export function aqRules(g, op, weapon, target, r) {
  if (!isAQ(op) || op.side > 1) return;
  // Sudden Offensive: the first x operatives activated have Balanced.
  if (g.aq.sudden[op.side] && op.aqActIdx && op.aqActIdx <= g.aq.sudden[op.side] && hasPloy(g, op.side, 'aqSudden')) r.balanced = true;
  // Maintain Momentum: Severe against a ready enemy.
  if (hasPloy(g, op.side, 'aqMomentum') && target && target.ready) r.severe = true;
  // Drop and Secure: melee Atk +1 (max 4) within 3" of the marker.
  const mk = g.aq.secure?.[op.side];
  if (weapon.type === 'melee' && mk && mk.tp === g.tp && dist(op, mk) - radius(op) <= 3) { r.atkPlus = (r.atkPlus || 0) + 1; r.atkMax = Math.min(r.atkMax || 4, 4); }
  // Hot Drop (ploy): re-roll any attack dice (target within 6", landed this activation or in the enemy territory)
  if (target && edgeDist(op, target) <= 6 && (op.aqLandAct === op.uid && op.aqLandTP === g.tp)) { /* offered as an attack ploy */ }
  if (ffOn(g, op, 'aqHotDrop')) r.relentless = true; // Hot Drop (ploy)
  if (op.aqNoAtk === g.tp && (weapon.type === 'ranged' || weapon.type === 'melee')) r.aqNoAtk = true;
}
/** Eye Above: a Detected enemy shooting a friendly TEMPESTUS AQUILON — re-roll one defence die. */
export function aqDefence(g, shooter, target, defRules) {
  if (!isAQ(target) || target.side > 1 || !hasPloy(g, target.side, 'aqEye')) return;
  if (shooter.aqDetected?.[target.side] === g.tp) defRules.balanced = true;
}
export function aqDetectedBlock(g, foeOp, op) { return isAQ(op) && op.side < 2 && foeOp.aqDetected?.[op.side] === g.tp && hasPloy(g, op.side, 'aqEye'); }
/** Combat Stimms (equipment): injured Move changes are ignored. */
export const aqStimms = (g, op) => isAQ(op) && op.side < 2 && equip(g, op.side, 'aqStimms');
/** Drop and Secure: control counts 1 higher where a friendly TEMPESTUS AQUILON contests the chosen marker. */
export function aqControl(g, obj, sum) {
  for (const s of [0, 1]) {
    const mk = g.aq?.secure?.[s];
    if (!mk || mk.tp !== g.tp || mk.id !== obj.id || sum[s] <= 0) continue;
    if (living(g, s).some((o) => isAQ(o) && o.x > -50 && dist(o, obj) - radius(o) - 0.4 <= CONTROL)) sum[s]++;
  }
}
/** Eye Above / Drop and Secure / Sudden Offensive: chosen automatically when bought. */
export function aqPloyBought(g, side, ploy) {
  if (ploy.id === 'aqSudden') g.aq.sudden[side] = Math.ceil(living(g, side).length / 2);
  if (ploy.id === 'aqEye') {
    const t = foes(g, { side }).filter((e) => e.side < 2 && e.x > -50).sort((a, b) => foes(g, { side: 1 - side }).filter((x) => edgeDist(x, b) <= 3).length - foes(g, { side: 1 - side }).filter((x) => edgeDist(x, a) <= 3).length || b.wounds - a.wounds)[0];
    if (!t) return;
    const hit = [t, ...foes(g, { side }).filter((e) => e !== t && e.side < 2 && e.x > -50 && edgeDist(e, t) <= 3)];
    for (const e of hit) (e.aqDetected ||= [0, 0])[side] = g.tp;
    note(g, side, `天眼：${hit.length} 名敵人獲得偵測標記`, `Eye Above: ${hit.length} enemies gain a Detected token`);
  }
  if (ploy.id === 'aqSecure') {
    const mine = living(g, side).filter((o) => o.x > -50);
    const cands = (g.objectives || []).filter((m) => controller(g, m) !== side);
    const pool = cands.length ? cands : g.objectives || [];
    const mk = pool.slice().sort((a, b) => Math.min(...mine.map((o) => dist(o, a)), 99) - Math.min(...mine.map((o) => dist(o, b)), 99))[0];
    if (!mk) return;
    (g.aq.secure ||= [null, null])[side] = { id: mk.id, x: mk.x, y: mk.y, tp: g.tp };
    note(g, side, `空降並確保：標記 (${mk.x.toFixed(1)}, ${mk.y.toFixed(1)})`, `Drop and Secure: the marker at (${mk.x.toFixed(1)}, ${mk.y.toFixed(1)})`);
  }
}

// ---------- Tempestus Veteran ----------
/** Once per battle: a firefight ploy for 0CP while the Tempestor is the active operative. */
export function aqVetFree(g, side, id) {
  if (g.teams[side] !== 'aquilons' || !g.aq || g.aq.vet[side].ploy || id === 'aqFieldcraft') return false;
  const t = living(g, side).find((o) => tpl(o).aqTempestor);
  return !!t && g.active === t.uid;
}
export function aqVetUsed(g, side) { if (g.aq) g.aq.vet[side].ploy = true; }
/** Once per battle: the Command Re-roll for dice rolled for the Tempestor costs 0CP. */
export function aqVetReroll(g, side, holder, which) {
  if (side > 1 || g.teams[side] !== 'aquilons' || !g.aq || g.aq.vet[side].reroll) return false;
  const uid = which === 'a' ? holder.uid : holder.uid;
  const o = g.ops.find((x) => x.uid === uid);
  return !!o && o.side === side && !!tpl(o).aqTempestor;
}
export function aqVetRerollUsed(g, side) { if (g.aq) g.aq.vet[side].reroll = true; }

// ---------- Gunfight (Gunfighter) and Dynamic (Precursor) ----------
/** The attack dice are rolled: remember how many were discarded as fails for a Gunfighter within 8" of the shooter. */
export function aqTrack(g, op, target, a) {
  g.aqShot = null;
  if (!target || !isAQ(target) || !tpl(target).aqGunfighter || target.side === op.side || edgeDist(op, target) > 8 + 0.01) return;
  g.aqShot = { shooter: op.uid, target: target.uid, fails: a.dice.filter((d) => d.res === 'miss').length };
}
/** After a Shoot action: the Gunfighter shoots back (free) with the focused profile, fails + 1 dice (max 4). */
export function aqAfterShoot(g, op) {
  const s = g.aqShot;
  g.aqShot = null;
  if (!s || s.shooter !== op.uid || op.dead) return;
  const t = g.ops.find((o) => o.uid === s.target);
  if (!t || g.aqBusy) return;
  const w = tpl(t).weapons.find((x) => x.id === 'aqGfFocused');
  if (!w) return;
  const wasDead = t.dead, hp = t.wounds;
  g.aqBusy = true;
  try {
    if (wasDead) { t.dead = false; t.wounds = 1; }
    const dice = Math.min(4, s.fails + 1);
    const shot = { ...w, atk: dice, rules: { ...w.rules } };
    const order = t.order; t.order = 'engage';
    note(g, t.side, `槍戰：${opName(t, 'zh')} 還擊 ${opName(op, 'zh')}（${dice} 顆攻擊骰）`, `Gunfight: ${opName(t, 'en')} shoots back at ${opName(op, 'en')} (${dice} attack dice)`);
    forcedShot(g, t, shot, [op], true);
    if (!wasDead) t.order = order;
  } finally {
    if (wasDead) { t.dead = true; t.wounds = hp > 0 ? 0 : t.wounds; if (t.wounds > 0) t.wounds = 0; }
    g.aqBusy = false;
  }
}
/** Dynamic (Precursor): after a Shoot or Fight, a free Dash — even after a Charge. */
export function aqDynamic(g, op) {
  if (!isAQ(op) || !tpl(op).aqPrecursor || op.dead || g.active !== op.uid || op.side > 1) return;
  op.acted.free = { ...(op.acted.free || {}), dash: true };
}

// ---------- Remote Overseer (equipment) ----------
export function aqOverseerOk(g, side) { return g.teams[side] === 'aquilons' && !!g.aq && equip(g, side, 'aqOverseer') && !g.aq.used[side].overseer && g.phase === 'initiative' && !g.initLocked; }
export function aqUseOverseer(g, side) {
  if (!aqOverseerOk(g, side)) return false;
  g.aq.used[side].overseer = true;
  const before = g.initRoll[side];
  g.initRoll[side] = d6();
  note(g, side, `遠程監督：重擲先攻骰 ${before} → ${g.initRoll[side]}（${g.initRoll[0]} : ${g.initRoll[1]}）`, `Remote Overseer: re-rolls the initiative die ${before} → ${g.initRoll[side]} (${g.initRoll[0]} : ${g.initRoll[1]})`);
  return true;
}

// ---------- visibility: just-landed operatives are obscured ----------
export function aqObscure(g, from, to, v, opts) {
  if (!v.visible || !isAQ(to) || to.aqObs == null || to.aqObsTP !== g.tp || (g.aq?.endCount ?? 0) >= to.aqObs || opts.noObscure || edgeDist(from, to) <= 2) return v;
  v.obscured = true;
  v.defenceOptions = v.defenceOptions.map((o) => ({ ...o, obscured: true }));
  return v;
}

// ---------- strategy ----------
export function aqAiStrategy(g, side) {
  if (g.teams[side] !== 'aquilons' || !g.aq) return;
  if (aqRapidOk(g, side)) aqRapid(g, side);
  if (aqDropLeft(g, side)) aqAutoDrop(g, side);
}
