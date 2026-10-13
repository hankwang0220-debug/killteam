// Scout Squad (偵察小隊) rules engine: Forward Scouting, Guidance and Experience, Track Enemy, Grapnel Assault, the ploys
// and the faction equipment. game.js calls these hooks; the team data is in data/scouts.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load.)
import { ACTIONS, TARGET_ACTIONS, BOARD, CONTROL, OBJ_R, applyDamage, changeApl, d3, d6, deployZones, edgeDist, foes, getOp, hasPloy, isEngaged, living, log, moveAllowance, opName, placeAuto, radius, team, tpl, visibility } from './game.js';
import { dist, distPointRect, pathLength, truncatePath } from './geometry.js';
import { moveCtx, wholeInchPath } from './path.js';
import { revealTacOp } from './missions.js';
import { SCOUTS_TEAM, scoutsRosterError, cleanScouting, DEFAULT_SCOUTING } from './data/scouts.js';

export const isSC = (o) => o?.team === 'scoutSquad';
const equip = (g, side, id) => !!g.equip?.[side]?.includes(id);
const note = (g, side, zh, en) => log(g, { zh, en }, `side${side}`);
const zoneRect = (z) => ({ x: z.x0, y: z.y0, w: z.x1 - z.x0, h: z.y1 - z.y0 });
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const bestDmg = (o) => Math.max(0, ...tpl(o).weapons.filter((w) => w.type === 'ranged').map((w) => w.atk * w.dmg[0]));

export function scSetup(g, roster, scouting = []) {
  g.scouting = [[], []];
  g.scGambit = [null, null];
  for (const side of [0, 1]) if (g.teams[side] === 'scoutSquad') {
    const error = scoutsRosterError(SCOUTS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
    g.scouting[side] = cleanScouting(scouting[side] ?? DEFAULT_SCOUTING);
    g.scGambit[side] = { tactical: g.scouting[side].includes('tacticalManoeuvre') ? 2 : 0, diversion: g.scouting[side].includes('diversion') ? 1 : 0, usedTP: {} };
  }
}

// ---------- Forward Scouting (resolved when deployment ends) ----------
const ORDER = ['redeploy', 'reposition', 'tripAlarm', 'boobyTrap', 'devisePlan', 'designateTarget', 'spy', 'tacticalManoeuvre', 'diversion'];
export function scResolve(g) {
  const lists = [0, 1].map((s) => [...(g.scouting?.[s] || [])].filter((id) => !['tacticalManoeuvre', 'diversion'].includes(id)).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)));
  if (!lists[0].length && !lists[1].length) return;
  const first = g.initiative ?? 0;
  note(g, first, '前進偵察：依序執行雙方選的選項', 'Forward Scouting: resolving both sides\' selections');
  for (let i = 0; (lists[0].length || lists[1].length) && i < 40; i++) {
    const side = i % 2 === 0 ? first : 1 - first;
    const id = lists[side].shift();
    if (id) resolveOption(g, side, id);
  }
}
function resolveOption(g, side, id) {
  const t = team(g, side).name;
  if (id === 'devisePlan') { g.cp[side] += 1; note(g, side, `${t.zh} 擬定計畫：+1CP`, `${t.en} Devise Plan: +1CP`); return; }
  if (id === 'redeploy') return redeploy(g, side);
  if (id === 'reposition') return reposition(g, side);
  if (id === 'tripAlarm') return placeMarker(g, side, 'tripAlarm');
  if (id === 'boobyTrap') return placeMarker(g, side, 'boobyTrap');
  if (id === 'designateTarget') {
    const e = foes(g, { side }).filter((x) => x.side < 2 && !tpl(x).expendable).sort((a, b) => b.wounds - a.wounds)[0];
    if (e) { (e.scTarget ||= [false, false])[side] = true; note(g, side, `${t.zh} 指定目標：${opName(e, 'zh')} 獲得目標標記`, `${t.en} Designate Target: ${opName(e, 'en')} gains a Target token`); }
    return;
  }
  if (id === 'spy') {
    if (g.tacOps?.[1 - side]) revealTacOp(g, 1 - side);
    else note(g, side, `${t.zh} 刺探：沒有戰術行動可以揭露`, `${t.en} Spy: there is no Tac Op to reveal`);
  }
}
/** Redeploy: one third of the operatives (rounded up) are set up again. */
function redeploy(g, side) {
  const all = living(g, side), n = Math.ceil(all.length / 3), chosen = shuffle([...all]).slice(0, n);
  const old = chosen.map((o) => ({ o, x: o.x, y: o.y }));
  for (const o of chosen) { o.x = -99; o.y = -99; }
  const placed = placeAuto(g, side, chosen);
  for (const s of old) if (!placed.includes(s.o)) { s.o.x = s.x; s.o.y = s.y; } // no legal space: it stays where it was
  note(g, side, `${team(g, side).name.zh} 重新佈署：重排 ${placed.length} 名特工`, `${team(g, side).name.en} Redeploy: ${placed.length} operative(s) set up again`);
}
/** Reposition: a free move for an operative wholly in the drop zone, ending wholly within 3" of it (towards the nearest objective). */
function reposition(g, side) {
  const z = deployZones(g)[side], lim = 3;
  const wholly = (p, r, pad) => p.x - r >= z.x0 - pad && p.x + r <= z.x1 + pad && p.y - r >= z.y0 - pad && p.y + r <= z.y1 + pad;
  const heavy = g.terrain.filter((t) => t.kind === 'heavy' || t.kind === 'light');
  let best = null;
  for (const o of living(g, side).filter((x) => wholly(x, radius(x), 0))) {
    const goal = [...(g.objectives || [])].sort((a, b) => dist(o, a) - dist(o, b))[0] || { x: BOARD.w / 2, y: BOARD.h / 2 };
    const ctx = moveCtx(g, o, 'reposition'), max = moveAllowance(g, o, 'reposition');
    for (const f of [1, 0.75, 0.5]) for (let a = 0; a < 16; a++) {
      const p = { x: o.x + Math.cos(a * Math.PI / 8) * max * f, y: o.y + Math.sin(a * Math.PI / 8) * max * f };
      if (!wholly(p, radius(o), lim) || p.x < radius(o) || p.y < radius(o) || p.x > BOARD.w - radius(o) || p.y > BOARD.h - radius(o)) continue;
      if (!ctx.free(p) || ctx.inEnemyER(p) || !ctx.segFree(o, p) || ctx.climbs?.([o, p])) continue;
      const path = wholeInchPath(ctx, { pts: [{ x: o.x, y: o.y }, p] }, max, (q) => !ctx.inEnemyER(q));
      if (!path) continue;
      const q = path.pts.at(-1);
      const score = dist(o, goal) - dist(q, goal) + (heavy.some((t) => distPointRect(q, t) - radius(o) <= 1) ? 1.5 : 0);
      if (!best || score > best.score) best = { o, q, score };
    }
  }
  if (!best || best.score <= 0) { note(g, side, `${team(g, side).name.zh} 重新定位：沒有合適的落點`, `${team(g, side).name.en} Reposition: no suitable destination`); return; }
  Object.assign(best.o, { x: best.q.x, y: best.q.y });
  note(g, side, `${team(g, side).name.zh} 重新定位：${opName(best.o, 'zh')} 免費前進到降落區外緣`, `${team(g, side).name.en} Reposition: ${opName(best.o, 'en')} moves forward free to the edge of the drop zone`);
}
/** Trip Alarm / Booby Trap: more than 6" from the opponent's drop zone; a Booby Trap also more than 2" from other markers. */
function placeMarker(g, side, kind) {
  const ez = zoneRect(deployZones(g)[1 - side]);
  const others = [...(g.markers || []), ...(g.objectives || [])];
  const taken = (g.markers || []).filter((m) => m.kind === kind && m.owner === side);
  let best = null;
  for (let x = 1; x <= BOARD.w - 1; x += 1) for (let y = 1; y <= BOARD.h - 1; y += 1) {
    const p = { x, y };
    if (distPointRect(p, ez) <= 6.01 || g.terrain.some((t) => distPointRect(p, t) < 0.5)) continue;
    const nearest = Math.min(...others.map((m) => dist(m, p)), 99);
    if (kind === 'boobyTrap' && nearest <= 2.01) continue;
    if (g.ops.some((o) => !o.dead && o.x > -50 && dist(o, p) - radius(o) < 0.4)) continue;
    let score;
    if (kind === 'tripAlarm') { // 1.5" from an objective marker no other alarm covers, towards the enemy
      const objs = (g.objectives || []).filter((o) => !taken.some((m) => dist(m, o) <= 3));
      const d = Math.min(...objs.map((o) => Math.abs(dist(o, p) - 1.5)), 99);
      score = -d * 3 - distPointRect(p, ez) * 0.05;
      if (nearest < 1) continue;
    } else score = -distPointRect(p, ez) - 0.15 * Math.abs(p.y - BOARD.h / 2); // the most forward spot on the middle lane
    if (!best || score > best.score) best = { p, score };
  }
  if (!best) { note(g, side, `${team(g, side).name.zh} 找不到放${kind === 'tripAlarm' ? '警報' : '陷阱'}的位置`, `${team(g, side).name.en} found no place for the ${kind === 'tripAlarm' ? 'Trip Alarm' : 'Booby Trap'}`); return; }
  (g.markers ||= []).push({ id: g.markers.length, kind, owner: side, x: best.p.x, y: best.p.y, carriedBy: null });
  note(g, side, `${team(g, side).name.zh} 放下${kind === 'tripAlarm' ? '警報' : '陷阱'}標記`, `${team(g, side).name.en} places a ${kind === 'tripAlarm' ? 'Trip Alarm' : 'Booby Trap'} marker`);
}
/** The Ready step: Trip Alarm markers are removed in the third turning point. */
export function scReady(g) {
  if (g.tp >= 3 && (g.markers || []).some((m) => m.kind === 'tripAlarm')) g.markers = g.markers.filter((m) => m.kind !== 'tripAlarm');
}

// ---------- Booby Trap ----------
/** The first moment a moving operative's control range reaches an enemy Booby Trap marker: {len, m}, or null. */
export function scTrapPath(g, op, path) {
  const traps = (g.markers || []).filter((m) => (m.kind === 'boobyTrap' || m.kind === 'tripwire') && m.owner !== op.side && !m.gone); // (tripwire: Ratling Bomber)
  if (!traps.length || op.side > 1 || !path?.pts?.length) return null;
  let acc = 0;
  for (let i = 1; i < path.pts.length; i++) {
    const a = path.pts[i - 1], b = path.pts[i], seg = dist(a, b), n = Math.max(1, Math.ceil(seg / 0.1));
    for (let k = 1; k <= n; k++) {
      const p = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n };
      const m = traps.find((x) => dist(p, x) - radius(op) <= CONTROL + 0.01);
      if (m) return { len: acc + seg * k / n, m };
    }
    acc += seg;
  }
  return null;
}
export function scTrapShorten(ctx, path, trap) {
  const pts = truncatePath(path.pts, trap.len);
  return { ...path, pts, len: Math.ceil(pathLength(pts) + (ctx.extra?.(pts) || 0) - 1e-6) };
}
/** The marker is removed and the operative takes 2D3 damage (its action ends where it is). */
export function scTrapFire(g, op, m) {
  if (!m || m.gone || op.dead) return;
  m.gone = true;
  g.markers = g.markers.filter((x) => !x.gone);
  if (m.kind === 'tripwire') { // Tripwire (Ratling Bomber): -1 APL until the end of its next activation, and its action ends
    changeApl(g, op, -1);
    note(g, m.owner, `💥 ${opName(op, 'zh')} 絆到絆線：APL -1（到下次啟動結束），動作結束`, `💥 ${opName(op, 'en')} trips a Tripwire: -1 APL until the end of its next activation, and its action ends`);
    return;
  }
  const dmg = d3() + d3();
  note(g, m.owner, `💥 ${opName(op, 'zh')} 觸發陷阱：受到 ${dmg} 傷害${op.dead ? '' : '，動作結束'}`, `💥 ${opName(op, 'en')} sets off a Booby Trap: ${dmg} damage${op.dead ? '' : ' and its action ends'}`);
  applyDamage(g, null, op, dmg);
}
/** An operative that ends up near an enemy Booby Trap without moving along a path (set up, pushed, pulled…). */
export function scTrapCheck(g, op) {
  const m = scTrapPath(g, op, { pts: [{ x: op.x, y: op.y }, { x: op.x, y: op.y }] });
  if (m) scTrapFire(g, op, m.m);
}

// ---------- activation ----------
export function scActivate(g, op) {
  if (g.counter || !isSC(op)) return;
  op.scRaw = false; op.scCovert = false; // Raw Physiology / Covert Position last until the start of its next activation
  // Guidance and Experience (Sergeant): once per activation another friendly Scout Squad operative gets +1 APL for its next activation.
  if (tpl(op).scSergeant) {
    const t = living(g, op.side).filter((o) => o !== op && isSC(o) && (o.aplNext || 0) < 1).sort((a, b) => (b.ready ? 1 : 0) - (a.ready ? 1 : 0) || bestDmg(b) - bestDmg(a))[0];
    if (t) { changeApl(g, t, 1); note(g, op.side, `引導與經驗：${opName(t, 'zh')} 下次啟動 APL +1`, `Guidance and Experience: ${opName(t, 'en')} gets +1 APL for its next activation`); }
  }
}
export function scNoteAttack(g, op) {
  if (!isSC(op)) return;
  const f = (g.scFirst ||= [null, null]);
  if (f[op.side]?.tp !== g.tp) f[op.side] = { tp: g.tp, uid: op.uid };
}
/** Emboldened Aspirant: the first friendly operative to Shoot or Fight this turning point, or an enemy with a higher Wounds stat. */
export function scEmbOk(g, op, target) {
  if (!isSC(op)) return false;
  const f = g.scFirst?.[op.side];
  const first = !f || f.tp !== g.tp || f.uid === op.uid;
  return first || (!!target && tpl(target).wounds > tpl(op).wounds);
}

// ---------- weapon rules ----------
export function scRules(g, op, weapon, target, r) {
  if (!isSC(op)) return;
  if (target) {
    // Trip Alarm: in the first two turning points, shooting an enemy within 2" of the marker — Seek.
    if (weapon.type === 'ranged' && g.tp <= 2 && (g.markers || []).some((m) => m.kind === 'tripAlarm' && m.owner === op.side && dist(m, target) - radius(target) <= 2)) r.seek = true;
    if (weapon.type === 'ranged' && target.scTracked?.side === op.side && target.scTracked.tp === g.tp) r.seekLight = true; // Track Enemy
    if (target.scTarget?.[op.side]) r.balanced = true; // Designate Target: re-roll one attack die
    // Ambush: the order changed from Conceal to Engage at the start of the activation, or it wasn't visible then.
    if (hasPloy(g, op.side, 'scAmbush') && g.active === op.uid && ((op.prevOrder === 'conceal' && op.order === 'engage') || op.acted?.unseen)) {
      if (!target.ready) r.ceaseless = true; else r.balanced = true;
    }
  }
  if (weapon.type === 'melee' && tpl(op).scGrapnel && op.acted?.scGrapnel) r.lethal = Math.min(r.lethal || 6, 3); // Grapnel Assault
}
/** Guerrilla Engagement: a friendly in cover and more than 6" from the enemy operatives it is visible to. */
export function scGuerrilla(g, target) {
  return isSC(target) && hasPloy(g, target.side, 'scGuerrilla')
    && !foes(g, target).some((e) => e.side < 2 && edgeDist(e, target) <= 6 && visibility(g, e, target).visible);
}
/** Camo Cloak (equipment, not Snipers): one more cover save. */
export const scCamoExtra = (g, target) => isSC(target) && !tpl(target).camoCloak && equip(g, target.side, 'scCamo');
/** Combat Blades (equipment): a combat blade for operatives without a better one. */
export function scWeapons(g, op, ws) {
  if (!isSC(op) || tpl(op).actionsOnly || !equip(g, op.side, 'scBlades') || ws.some((w) => w.group === 'scBlade')) return ws;
  return [...ws, { id: 'scBladeEq', name: { zh: '戰鬥刀（裝備）', en: 'Combat blade (equipment)' }, type: 'melee', atk: 3, hit: 3, dmg: [4, 5], rules: {}, group: 'scBladeEq' }];
}
/** Targeting Oculars (equipment): the first two Shoots each turning point have Lethal 5+ and Saturate. */
export function scOculars(g, op, weapon) {
  if (!isSC(op) || !equip(g, op.side, 'scOculars') || weapon.type !== 'ranged') return weapon;
  const u = ((g.scOcular ||= [null, null])[op.side] = g.scOcular[op.side]?.tp === g.tp ? g.scOcular[op.side] : { tp: g.tp, n: 0 });
  if (u.n >= 2) return weapon;
  u.n++;
  note(g, op.side, `${opName(op, 'zh')} 瞄準目鏡：本次射擊「致命 5+」與「飽和」`, `${opName(op, 'en')} Targeting Oculars: Lethal 5+ and Saturate for this Shoot`);
  return { ...weapon, rules: { ...weapon.rules, lethal: Math.min(weapon.rules.lethal || 6, 5), saturate: true } };
}
/** Tactical Vox-link (equipment): Astartes Training or Emboldened Aspirant for 0CP once per TP, with a friendly Sergeant in the killzone. */
export const scVoxFree = (g, side, id) => g.teams[side] === 'scoutSquad' && (id === 'scTraining' || id === 'scEmboldened') && equip(g, side, 'scVox')
  && g.scVoxTP?.[side] !== g.tp && living(g, side).some((o) => tpl(o).scSergeant);

// ---------- strategy ploys (automatic) ----------
export function scPloyBought(g, side, ploy) {
  const scouts = living(g, side).filter((o) => isSC(o) && !foes(g, o).some((e) => edgeDist(e, o) <= 4));
  if (ploy.id === 'scAdaptable') {
    // Up to D3 operatives: Engage when an enemy is within 12" (it can shoot soon), otherwise Conceal.
    const want = (o) => (Math.min(...foes(g, o).map((e) => edgeDist(e, o)), 99) <= 12 ? 'engage' : 'conceal');
    const list = scouts.filter((o) => o.order !== want(o)).slice(0, d3());
    for (const o of list) { o.order = want(o); note(g, side, `適應訓練：${opName(o, 'zh')} 改為${o.order === 'engage' ? '交戰' : '隱蔽'}指令`, `Adaptable Training: ${opName(o, 'en')} now has a${o.order === 'engage' ? 'n Engage' : ' Conceal'} order`); }
    if (!list.length) note(g, side, '適應訓練：沒有需要改的特工', 'Adaptable Training: no operative needs a change');
  }
  if (ploy.id === 'scStealth') {
    const list = scouts.filter((o) => o.order === 'conceal').slice(0, d3());
    for (const o of list) stealthDash(g, o);
    if (!list.length) note(g, side, '隱蔽轉移：沒有符合條件的特工', 'Stealth Relocation: no eligible operative');
  }
}
/** A free Dash (up to 3") towards the nearest objective marker, preferring a spot beside terrain. */
function stealthDash(g, o) {
  const ctx = moveCtx(g, o, 'dash'), goal = [...(g.objectives || [])].sort((a, b) => dist(o, a) - dist(o, b))[0] || { x: BOARD.w / 2, y: BOARD.h / 2 };
  const cover = g.terrain.filter((t) => t.kind === 'heavy' || t.kind === 'light');
  let best = null;
  for (const r of [3, 2, 1]) for (let a = 0; a < 16; a++) {
    const p = { x: o.x + Math.cos(a * Math.PI / 8) * r, y: o.y + Math.sin(a * Math.PI / 8) * r };
    if (!ctx.free(p) || ctx.inEnemyER(p) || !ctx.segFree(o, p) || ctx.climbs?.([o, p])) continue;
    const path = wholeInchPath(ctx, { pts: [{ x: o.x, y: o.y }, p] }, 3, (q) => !ctx.inEnemyER(q));
    if (!path) continue;
    const q = path.pts.at(-1), score = dist(o, goal) - dist(q, goal) + (cover.some((t) => distPointRect(q, t) - radius(o) <= 1) ? 1 : 0);
    if (!best || score > best.score) best = { q, score };
  }
  if (!best) return;
  const prev = { x: o.x, y: o.y };
  Object.assign(o, best.q);
  scTrapCheck(g, o);
  note(g, o.side, `隱蔽轉移：${opName(o, 'zh')} 免費衝刺（${dist(prev, best.q).toFixed(1)}"）`, `Stealth Relocation: ${opName(o, 'en')} makes a free Dash (${dist(prev, best.q).toFixed(1)}")`);
}

// ---------- strategic gambits: Tactical Manoeuvre and Diversion ----------
export const scGambitsLeft = (g, side, k) => (g.scGambit?.[side]?.[k] || 0) > 0 && g.scGambit[side].usedTP?.[k] !== g.tp;
const nearEdge = (o) => Math.min(o.x, o.y, BOARD.w - o.x, BOARD.h - o.y) - radius(o) <= 6;
export const scDiversionTargets = (g, side) => living(g, 1 - side).filter((o) => o.side < 2 && nearEdge(o));
export function scTactical(g, side, uid) {
  const o = getOp(g, uid);
  if (!scGambitsLeft(g, side, 'tactical') || !o || o.dead || o.side !== side || g.phase !== 'strategy') return false;
  g.scGambit[side].tactical--; g.scGambit[side].usedTP.tactical = g.tp;
  changeApl(g, o, 1);
  note(g, side, `戰術機動：${opName(o, 'zh')} 到下次啟動結束 APL +1（剩 ${g.scGambit[side].tactical} 次）`, `Tactical Manoeuvre: ${opName(o, 'en')} gets +1 APL until the end of its next activation (${g.scGambit[side].tactical} left)`);
  return true;
}
export function scDiversion(g, side, uid) {
  const o = getOp(g, uid);
  if (!scGambitsLeft(g, side, 'diversion') || !o || o.dead || o.side !== 1 - side || !nearEdge(o) || g.phase !== 'strategy') return false;
  g.scGambit[side].diversion--; g.scGambit[side].usedTP.diversion = g.tp;
  changeApl(g, o, -1);
  note(g, side, `誘餌：${opName(o, 'zh')} 到下次啟動結束 APL -1`, `Diversion: ${opName(o, 'en')} gets -1 APL until the end of its next activation`);
  return true;
}
/** The computer: Tactical Manoeuvre on its best shooter, Diversion on the strongest enemy near an edge. */
export function scAiStrategy(g, side) {
  if (g.teams[side] !== 'scoutSquad') return;
  if (scGambitsLeft(g, side, 'tactical')) {
    const t = living(g, side).filter((o) => o.ready && (o.aplNext || 0) < 1).sort((a, b) => bestDmg(b) - bestDmg(a))[0];
    if (t) scTactical(g, side, t.uid);
  }
  if (scGambitsLeft(g, side, 'diversion')) {
    const t = scDiversionTargets(g, side).sort((a, b) => tpl(b).apl - tpl(a).apl || b.wounds - a.wounds)[0];
    if (t) scDiversion(g, side, t.uid);
  }
}

// ---------- actions ----------
export function scActions(g, op, add) {
  if (!isSC(op) || !tpl(op).scTracker) return;
  add('scTrack', !isEngaged(g, op) && TARGET_ACTIONS.scTrack.targets(g, op).length > 0, { zh: '處於交戰中或 8" 內沒有敵人', en: 'Engaged, or no enemy within 8"' });
}
export function registerScoutActions() {
  ACTIONS.scTrack = { ap: 1, name: { zh: '追蹤敵人', en: 'Track Enemy' } };
  TARGET_ACTIONS.scTrack = {
    targets: (g, o) => (isEngaged(g, o) ? [] : foes(g, o).filter((t) => t.side < 2 && edgeDist(o, t) <= 8)),
    apply(g, o, t) {
      t.scTracked = { side: o.side, tp: g.tp };
      return { zh: `追蹤敵人：${opName(t, 'zh')} 本回合被友方射擊時，遠程武器「搜尋（輕型）」`, en: `Track Enemy: friendly ranged weapons shooting ${opName(t, 'en')} have Seek Light this TP` };
    },
  };
}
