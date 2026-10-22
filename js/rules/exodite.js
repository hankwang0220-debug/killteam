// exodite: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { CONTROL, OBJ_R, applyDamage, boardOf, carriables, checkMines, controller, d3, edgeDist, engagedEnemies, hasPloy, log, opName, radius, spend, territoryOf, tpl } from '../game.js';
import { moveCtx } from '../path.js';
import { dist, distPointRect, segRect } from '../geometry.js';
import { voltagheistField } from './starstriders.js';
import { wbEmerge } from './wyrmblade.js';


// ---------- Exodite Dragon Masters ----------
export const isEDM = (op) => !!TEAM_MAP[op?.team]?.dragonMasters;
export const isMounted = (op) => !!tpl(op)?.mounted;
/** Upgrades picked for a mounted Dragon Master (its loadout id lists the two). */
export const hasUp = (op, id) => isEDM(op) && !!tpl(op).upgrades && (op.loadout || '').split('+').includes(id);
export const DEG45 = Math.PI / 4;
export const normAng = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
/** SPEED: 3 (SPEED 3-), 4 (SPEED 4+) or 7 (SPEED 7+); Wind's Grace makes it one higher. */
export function speedOf(g, op) {
  if (!isEDM(op)) return 0;
  const s = op.speed || 3;
  return op.windGrace ? (s === 3 ? 4 : 7) : s;
}
/** Facing towards the enemy's side of the killzone (riders entering, Drakolithes). */
export const facingIn = (g, side) => {
  const along = g.axis === 'y' ? 'y' : 'x', lowSide = territoryOf(g, { [along]: 1, [along === 'x' ? 'y' : 'x']: 11 }) === side;
  return along === 'x' ? (lowSide ? 0 : Math.PI) : (lowSide ? Math.PI / 2 : -Math.PI / 2);
};
/** Sprint (mounted, 0AP): straight forwards (≤9") or backwards (≤3") after pivoting up to 45° at the start; 12" per TP; whole inches. */
export function sprintCheck(g, op, p) {
  const no = (zh, en) => ({ ok: false, why: { zh, en } });
  const dx = p.x - op.x, dy = p.y - op.y, d = Math.hypot(dx, dy);
  if (d < 0.25) return no('太近了', 'Too close');
  const ang = Math.atan2(dy, dx), rel = normAng(ang - (op.facing || 0));
  const leap = !!op.acted.leap, back = !leap && Math.abs(rel) > Math.PI / 2, turn = back ? normAng(rel - Math.PI) : rel;
  if (leap && d > 1.01) return no('躍起只能放到 1" 內', 'Leap: within 1"');
  if (!leap && Math.abs(turn) > DEG45 + 1e-6) return no('只能直線向前或向後（起點可轉 45°）', 'Only straight forwards or backwards (pivot up to 45° first)');
  const inches = leap ? 3 : Math.ceil(d - 1e-6);
  if (back && op.acted.fwdOnly) return no('月歌剔除：只能向前', 'Moonsong Cull: forwards only');
  if (!leap && !back && (op.acted.sprintFwd || 0) + inches > 9) return no(`向前最多 9"（已用 ${op.acted.sprintFwd || 0}"）`, `Forwards 9" at most (${op.acted.sprintFwd || 0}" used)`);
  if (back && (op.acted.sprintBack || 0) + inches > 3) return no('向後最多 3"', 'Backwards 3" at most');
  if ((op.movedTP || 0) + inches > 12) return no(`每回合最多 12"（已用 ${op.movedTP || 0}"）`, `12" per TP at most (${op.movedTP || 0}" used)`);
  if (op.counter && inches > 2) return no('反應時最多移動 2"', 'Counteracting: 2" at most');
  if (op.acted.aimedUsed && (op.acted.movedDist || 0) + inches > 3) return no('用過定點長步槍後不能移動超過 3"', 'After the stationary long rifle, no more than 3" of movement');
  const ctx = moveCtx(g, op), r = radius(op);
  // (It moves through operatives and low terrain; tall — Heavy — terrain blocks it.)
  if (!leap) {
    const n = Math.max(1, Math.ceil(d / 0.2));
    for (let k = 1; k < n; k++) {
      const q = { x: op.x + dx * k / n, y: op.y + dy * k / n };
      if (g.terrain.some((t) => t.kind === 'heavy' && t.equip == null && distPointRect(q, t) < r - 1e-6)) return no('被重型地形擋住', 'Blocked by Heavy terrain');
    }
  }
  if (!ctx.free(p)) return no('那裡放不下', 'It can\'t be placed there');
  return { ok: true, why: null, inches, back, facing: leap ? op.facing : back ? normAng(ang + Math.PI) : ang, leap };
}
export function doSprint(g, op, p) {
  const c = sprintCheck(g, op, p);
  if (!c.ok) return false;
  const from = { x: op.x, y: op.y };
  op.acted.sprint = (op.acted.sprint || 0) + 1; op.orderSet = true;
  op.acted.sprintJust = true; // (Riding Mastery / Nomad Executioner: an action straight after it, then Sprint on)
  op.x = p.x; op.y = p.y; op.facing = c.facing;
  op.movedTP = (op.movedTP || 0) + c.inches; op.acted.movedDist = (op.acted.movedDist || 0) + c.inches;
  if (c.back) op.acted.sprintBack = (op.acted.sprintBack || 0) + c.inches; else if (!c.leap) op.acted.sprintFwd = (op.acted.sprintFwd || 0) + c.inches;
  // Equipment terrain it moves through is removed from the battle.
  const gone = g.terrain.filter((t) => t.equip != null && segRect(from, p, t));
  if (gone.length) g.terrain = g.terrain.filter((t) => !gone.includes(t));
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.x = op.x; m.y = op.y; }
  // Mercurial Speed: 4"+ forwards = SPEED 4+, 7"+ = SPEED 7+, otherwise (or backwards, or a Leap) 3-.
  const fwd = c.back || c.leap ? 0 : op.acted.sprintFwd; // (a Sprint continued after Riding Mastery etc. counts as one)
  op.speed = fwd >= 7 ? 7 : fwd >= 4 ? 4 : 3; op.acted.speedSet = true;
  const rec = g.recent?.[op.side];
  if (rec?.uid === op.uid) rec.trails.push([from, { x: op.x, y: op.y }]);
  (g.trailLog ||= []).push({ uid: op.uid, side: op.side, tp: g.tp, kind: 'sprint', len: c.inches, pts: [from, { x: op.x, y: op.y }] });
  log(g, { zh: `${opName(op, 'zh')} 疾馳 ${c.back ? '後退' : c.leap ? '躍起' : '前進'} ${c.inches}"（速度 ${op.speed === 3 ? '3-' : `${op.speed}+`}）${gone.length ? `，撞毀 ${gone.length} 個裝備掩體` : ''}`, en: `${opName(op, 'en')} Sprints ${c.back ? 'back' : c.leap ? '(Leap)' : 'forwards'} ${c.inches}" (SPEED ${op.speed === 3 ? '3-' : `${op.speed}+`})${gone.length ? `, smashing ${gone.length} equipment terrain` : ''}` }, `side${op.side}`);
  // Ride Them Down (ploy, once per activation): 4"+ — 1 damage to an enemy in its control range; 7"+ or a Clanblade — D3.
  if (hasPloy(g, op.side, 'rideThemDown') && fwd >= 4 && !op.acted.rideUsed) {
    const e = engagedEnemies(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) { op.acted.rideUsed = true; const dmg = fwd >= 7 || tpl(op).edLeader ? d3() : 1; log(g, { zh: `輾壓他們：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `Ride Them Down: ${opName(e, 'en')} takes ${dmg} damage` }, `side${op.side}`); applyDamage(g, op, e, dmg); }
  }
  voltagheistField(g, op);
  checkMines(g, op);
  return true;
}
/** Turn (mounted, 1AP): pivot up to 45° towards a point. */
export function turnFacing(op, p) {
  const want = normAng(Math.atan2(p.y - op.y, p.x - op.x) - (op.facing || 0));
  return normAng((op.facing || 0) + Math.max(-DEG45, Math.min(DEG45, want)));
}
export function doTurn(g, op, p) {
  spend(g, op, 'edTurn');
  op.facing = turnFacing(op, p);
  log(g, { zh: `${opName(op, 'zh')} 轉向`, en: `${opName(op, 'en')} Turns` }, `side${op.side}`);
}
/** Draconic Cavalry Tactics: a rider in reserve enters touching your killzone edge (treated as a Turn: 1AP). */
export function entryPoint(g, op, p) {
  const along = g.axis === 'y' ? 'y' : 'x', perp = along === 'x' ? 'y' : 'x', size = { x: boardOf(g).w, y: boardOf(g).h }, r = radius(op);
  const low = territoryOf(g, { [along]: 1, [perp]: size[perp] / 2 }) === op.side;
  return { [along]: low ? r + 0.01 : size[along] - r - 0.01, [perp]: Math.max(r, Math.min(size[perp] - r, p[perp])) };
}
export function enterFromReserve(g, op, p) {
  if (!op.reserve) return false;
  if (op.wbHidden) return wbEmerge(g, op, p); // Familiar Territory (Wyrmblade): emerge from hiding
  const q = entryPoint(g, op, p);
  op.x = q.x; op.y = q.y;
  if (!moveCtx(g, op).free(q)) { op.x = -99; op.y = -99; return false; }
  op.reserve = false; op.facing = facingIn(g, op.side);
  op.ap = Math.max(0, op.ap - 1); op.orderSet = true; op.acted.entered = 1;
  log(g, { zh: `${opName(op, 'zh')} 從場邊進場`, en: `${opName(op, 'en')} enters from the killzone edge` }, `side${op.side}`);
  return true;
}
/** Preternatural Evasion (Drakolithe): SPEED from how far it ends from where it started this activation. */
export function drakolitheSpeed(g, op, kind, from) {
  if (!tpl(op).drakolithe || !['charge', 'fallBack', 'reposition'].includes(kind)) return;
  const d = dist(op, from);
  if (d > 5) { op.speed = 7; op.acted.speedSet = true; } else if (d > 2) { op.speed = Math.max(op.acted.speedSet ? op.speed || 3 : 3, 4); op.acted.speedSet = true; }
}

// ---- Upgrades and Riding Mastery added with the rest of the rules ----
/** Sprints this activation may still start: one, plus one more after Riding Mastery, Nomad Executioner or Moonsong Cull. */
export const sprintsLeft = (op) => 1 + (op.acted.sprintExtra || 0) - (op.acted.sprint || 0);
const moreSprint = (op, why, fwdOnly = false) => { op.acted.sprintExtra = (op.acted.sprintExtra || 0) + 1; if (fwdOnly) op.acted.fwdOnly = true; return why; };
/** Riding Mastery (firefight ploy): straight after a Sprint — a Pick Up / Place Marker / mission action, then the rest of the Sprint. */
export const ridingMasteryOk = (op) => isMounted(op) && !!op.acted.sprintJust && !op.acted.rmUsed;
export function ridingMastery(op) { op.acted.rmUsed = true; return moreSprint(op, { zh: '可以先撿／放標記或做任務動作，再用剩下的距離繼續疾馳', en: 'it can Pick Up / Place a marker or do a mission action, then Sprint on with the distance left' }); }
/** Nomad Executioner (Leystalker): a Shoot straight after a Sprint, then the rest of the Sprint (once per activation). */
export function edNomad(g, op, id) {
  if (id !== 'shoot' || !op.acted.sprintJust || !hasUp(op, 'nomad') || op.acted.nomadUsed) return;
  op.acted.nomadUsed = true; moreSprint(op);
  log(g, { zh: `${opName(op, 'zh')} 游牧處刑者：射擊後可以繼續疾馳`, en: `${opName(op, 'en')} Nomad Executioner: it can Sprint on after shooting` }, `side${op.side}`);
}
/** Moonsong Cull (Clanblade): after a forwards Sprint and a Fight that incapacitated an enemy, out of enemy control range — Sprint on forwards. */
export function edMoonsong(g, op) {
  if (!op || op.dead || !hasUp(op, 'moonsong') || !op.acted.moonKill || op.acted.moonUsed || !(op.acted.sprintFwd > 0) || engagedEnemies(g, op).length) return;
  op.acted.moonUsed = true; moreSprint(op, null, true);
  log(g, { zh: `${opName(op, 'zh')} 月歌剔除：可以用剩下的距離向前疾馳`, en: `${opName(op, 'en')} Moonsong Cull: it can Sprint on forwards with the distance left` }, `side${op.side}`);
}
/** Focused Reflection (Clanblade): shot from within 6", each critical save that blocked inflicts 1 damage on the shooter. */
export function edReflection(g, shooter, target, crits) {
  if (!crits || shooter.dead || !hasUp(target, 'reflection') || edgeDist(shooter, target) > 6) return;
  log(g, { zh: `${opName(target, 'zh')} 聚焦反射：${opName(shooter, 'zh')} 受到 ${crits} 傷害`, en: `${opName(target, 'en')} Focused Reflection: ${opName(shooter, 'en')} takes ${crits} damage` }, `side${target.side}`);
  applyDamage(g, target, shooter, crits);
}
/** Sow the Seeds (Stonesinger, once per TP): an objective it controls counts it as contesting with APL 1 until an enemy controls it. */
export function edSowOk(g, op) { return hasUp(op, 'sow') && op.sowTP !== g.tp && (g.objectives || []).some((m) => edgeDistObj(op, m) && controller(g, m) === op.side); }
const edgeDistObj = (op, m) => dist(op, m) - radius(op) - OBJ_R <= CONTROL + 0.01;
export function edSow(g, op) {
  const m = (g.objectives || []).filter((x) => edgeDistObj(op, x) && controller(g, x) === op.side).sort((a, b) => dist(a, op) - dist(b, op))[0];
  if (!m) return null;
  op.sowTP = g.tp; (g.sow ||= [null, null])[op.side] = { uid: op.uid, id: m.id };
  return { zh: '這個目標當作它在爭奪（APL 1），直到敵人控制它', en: 'it counts as contesting this objective (APL 1) until an enemy controls it' };
}
/** In controller(): the Sow the Seeds marker counts the Stonesinger (APL 1) if it isn't there in person; an enemy taking control ends it. */
export function edSowControl(g, obj, sum) {
  for (const s of [0, 1]) {
    const w = g.sow?.[s];
    if (!w || w.id !== obj.id) continue;
    const o = g.ops.find((x) => x.uid === w.uid);
    if (!o || o.dead) { g.sow[s] = null; continue; }
    if (!edgeDistObj(o, obj)) sum[s] += 1;
    if (sum[1 - s] > sum[s]) g.sow[s] = null; // (an enemy controls it now)
  }
}
/** Elusive Phantasm (Leystalker): at the end of the Firefight phase, out of enemy control range — a free Turn towards the closest enemy (SPEED unchanged). */
export function edPhantasm(g) {
  for (const op of g.ops.filter((o) => !o.dead && o.x > -50 && hasUp(o, 'phantasm') && !engagedEnemies(g, o).length)) {
    const e = g.ops.filter((x) => !x.dead && x.side !== op.side && x.side < 2 && x.x > -50).sort((a, b) => dist(a, op) - dist(b, op))[0];
    if (!e) continue;
    const want = normAng(Math.atan2(e.y - op.y, e.x - op.x) - (op.facing || 0));
    op.facing = normAng((op.facing || 0) + Math.max(-DEG45, Math.min(DEG45, want)));
    log(g, { zh: `${opName(op, 'zh')} 難以捉摸的幻影：免費轉向`, en: `${opName(op, 'en')} Elusive Phantasm: a free Turn` }, `side${op.side}`);
  }
}
