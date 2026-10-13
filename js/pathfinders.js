// Pathfinders (探路者) rules engine for the parts added after the first version: Recon Sweep, the extra drones (Pulse Accelerator,
// Grav-inhibitor, Shield, Recon), Saviour Protocols, Point-Blank Fusillade, A Worthy Cause and the faction equipment.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load.)
import { ACTIONS, TARGET_ACTIONS, BOARD, autoFF, d6, edgeDist, foes, getOp, hasPloy, isEngaged, living, log, missionActionsFor, doMissionAction, opName, radius, spend, team, tpl, visibility, ffReady, ffArmed } from './game.js';
import { dist } from './geometry.js';
import { MISSION_ACTIONS } from './missions.js';
import { bestStep, stepTo } from './sanctifiers.js';
import { pathfindersRosterError } from './data/pathfinders.js';

export function isPF(o) { return o?.team === 'tauPathfinders'; }
const equip = (g, side, id) => !!g.equip?.[side]?.includes(id);
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
const PULSE = ['pulseCarbine', 'pulseCarbineSgt', 'suppressedCarbine', 'twinPulseCarbine', 'burstFocused', 'burstSweeping'];
export const isPulse = (w) => PULSE.includes(w?.id);

// ---------- activation bookkeeping ----------
/** Start of an activation / counteraction: who was engaged (Point-Blank Fusillade), accelerator and photon tokens. */
export function pfActivate(g, op) {
  g.pfStart = new Set(living(g).filter((o) => isEngaged(g, o)).map((o) => o.uid));
  if (g.counter) return;
  if (op.pfAccel) op.pfAccel = false; // Pulse Accelerator lasts until the start of its next activation
  if (op.pfPhoton === 'pending') op.pfPhoton = 'active'; // Photon Grenade: until the end of its next activation
}
export function pfEnd(op) { if (op && op.pfPhoton === 'active' && !op.counter) op.pfPhoton = null; }
/** Photon Grenade: -2" Move (and no Dash) for the target's next activation. */
export const pfSlowed = (op) => (op.pfPhoton ? 2 : 0);

// ---------- weapon rules ----------
/** Pulse Accelerator: another friendly Pathfinder shooting with a pulse weapon within 3" of an active accelerator has Lethal 5+ and Severe. */
export function pfRules(g, op, weapon, target, r) {
  if (!isPF(op) || weapon.type !== 'ranged' || !isPulse(weapon)) return;
  if (living(g, op.side).some((d) => d !== op && d.pfAccel && edgeDist(d, op) <= 3.01)) { r.lethal = Math.min(r.lethal || 6, 5); r.severe = true; }
}
/** Grav-inhibitor: an enemy fighting or retaliating while visible to and within 6" of it has its melee Hit worsened by 1. */
export function pfGravHit(g, op, weapon) {
  if (!weapon || weapon.type !== 'melee' || op.side > 1) return 0;
  return foes(g, op).some((d) => tpl(d).pfGrav && edgeDist(d, op) <= 6.01 && visibility(g, d, op).visible) ? 1 : 0;
}
/** Shield Generator (MV4 Shield Drone): once per turning point, ignore the damage of one Normal Dmg attack die. */
export function pfShield(g, target) {
  if (!tpl(target).pfShield || target.pfShieldTP === g.tp) return false;
  target.pfShieldTP = g.tp;
  note(g, target.side, `${opName(target, 'zh')} 護盾產生器：無視一次普通傷害`, `${opName(target, 'en')} Shield Generator: ignores one Normal Dmg die`);
  return true;
}

// ---------- Markerlight ----------
/** The tokens Target Analysis Optic adds while its action lasts (the primary target only). */
export const pfTaoBonus = (g, op, target) => (g.pfTao && g.pfTao.uid === op.uid && g.pfTao.target === target.uid ? 1 : 0);
export function pfShootStart(g, op, weapon, target) {
  g.pfTao = null;
  if (!isPF(op) || tpl(op).drone || op.side > 1 || !equip(g, op.side, 'pfTao') || g.pfUsed?.[op.side]?.tao === g.tp || !(target.ml > 0) || weapon.rules.noMarkerlight) return;
  ((g.pfUsed ||= [{}, {}])[op.side]).tao = g.tp;
  g.pfTao = { uid: op.uid, target: target.uid };
  note(g, op.side, `目標分析光學：${opName(target, 'zh')} 視為多一個標記光標記`, `Target Analysis Optic: ${opName(target, 'en')} counts as having one more Markerlight token`);
}
export function pfShootEnd(g) { g.pfTao = null; }
/** Enemies a Markerlight can be put on: visible ones (after a Shoot, only its target), or any enemy with the Orbital Survey Uplink. */
export function pfMarkerTargets(g, op) {
  const seen = foes(g, op).filter((t) => visibility(g, op, t).visible && (!op.acted.shotTarget || op.acted.shotTarget === t.uid || tpl(op).analyse));
  if (!uplinkReady(g, op)) return seen;
  return foes(g, op).filter((t) => t.side < 2 && !t.dead && (seen.includes(t) || !op.acted.shotTarget || op.acted.shotTarget === t.uid));
}
const uplinkReady = (g, op) => isPF(op) && equip(g, op.side, 'pfUplink') && g.pfUsed?.[op.side]?.uplink !== g.tp;
/** The Markerlight action: tokens for the target (High-intensity Markerlight, Orbital Survey Uplink), and Analyse's neighbours. */
export function pfMarkerlight(g, op, t) {
  let n = tpl(op).markerlight || 1;
  const seen = visibility(g, op, t).visible;
  if (!seen && uplinkReady(g, op)) { // Orbital Survey Uplink: one token, whether or not it's visible
    ((g.pfUsed ||= [{}, {}])[op.side]).uplink = g.tp;
    n = 1;
    note(g, op.side, `軌道偵測連結：${opName(t, 'zh')} 不需看得到也獲得標記`, `Orbital Survey Uplink: ${opName(t, 'en')} gains a token without being visible`);
  } else if (n === 1 && equip(g, op.side, 'pfHiml') && !tpl(op).drone) {
    const u = ((g.pfUsed ||= [{}, {}])[op.side]);
    if (u.himlTP !== g.tp) { u.himlTP = g.tp; u.himl = 0; }
    if (u.himl < 2) { u.himl++; n = 2; note(g, op.side, `高強度標記光：${opName(t, 'zh')} 獲得兩個標記`, `High-intensity Markerlight: ${opName(t, 'en')} gains two tokens`); }
  }
  const got = Math.min(4 - (t.ml || 0), n);
  t.ml = (t.ml || 0) + got;
  op.acted.mlTarget = t.uid;
  const extra = [];
  if (tpl(op).analyse) { // Analyse (MB3 Recon Drone)
    for (const e of foes(g, op).filter((x) => x !== t && x.side < 2 && edgeDist(x, t) <= 3.01 && visibility(g, op, x).visible && (x.ml || 0) < 4)) { e.ml = (e.ml || 0) + 1; extra.push(opName(e, 'en')); }
  }
  return { zh: `標記光：${opName(t, 'zh')} 獲得 ${got} 個標記（共 ${t.ml}）${extra.length ? `；分析：另外 ${extra.length} 名敵人也獲得標記` : ''}`, en: `Markerlight: ${opName(t, 'en')} gains ${got} token(s) (${t.ml} total)${extra.length ? `; Analyse: ${extra.join(', ')} also gain a token` : ''}` };
}

// ---------- Saviour Protocols (firefight ploy) ----------
/** A friendly non-drone Pathfinder is picked as the valid target of a Shoot: a friendly drone visible within 3" takes it instead. */
export function pfSwap(g, target, weapon) {
  if (!isPF(target) || tpl(target).drone || target.side > 1 || weapon?.rules.blast || weapon?.rules.torrent) return target;
  if (!ffReady(g, target.side, 'saviourProtocols') || !ffArmed(g, target.side, 'saviourProtocols')) return target;
  const drones = living(g, target.side).filter((d) => tpl(d).drone && edgeDist(d, target) <= 3.01 && visibility(g, target, d).visible);
  if (!drones.length) return target;
  const pick = drones.sort((a, b) => (tpl(b).pfShield ? 1 : 0) - (tpl(a).pfShield ? 1 : 0) || b.wounds - a.wounds)[0];
  const free = !!tpl(pick).pfShield || living(g, target.side).some((o) => tpl(o).droneController);
  g.pfFree = free;
  const used = autoFF(g, target.side, 'saviourProtocols');
  g.pfFree = false;
  if (!used) return target;
  note(g, target.side, `救主協議：${opName(pick, 'zh')} 替 ${opName(target, 'zh')} 承受射擊`, `Saviour Protocols: ${opName(pick, 'en')} takes the shot for ${opName(target, 'en')}`);
  return pick;
}

// ---------- Point-Blank Fusillade (firefight ploy) ----------
/** A retaliating Pathfinder that wasn't engaged at the start of that activation uses a ranged weapon as a melee weapon. */
export function pfPointBlank(g, attacker, target, best, avg) {
  if (!isPF(target) || tpl(target).drone || target.side > 1 || g.pfStart?.has(target.uid)) return null;
  if (!ffReady(g, target.side, 'pointBlank') || !ffArmed(g, target.side, 'pointBlank')) return null;
  const w = tpl(target).weapons.filter((x) => x.type === 'ranged' && !/grenade/i.test(x.name.en)).map((x) => ({ ...x, type: 'melee', rules: stripRules(x.rules) }))
    .sort((a, b) => avg(b) - avg(a))[0];
  if (!w || avg(w) <= avg(best) + 0.5 || !autoFF(g, target.side, 'pointBlank')) return null;
  note(g, target.side, `近距離齊射：${opName(target, 'zh')} 用 ${w.name.zh} 當近戰武器反擊（不能格擋）`, `Point-Blank Fusillade: ${opName(target, 'en')} retaliates with its ${w.name.en} as a melee weapon (no blocking)`);
  return w;
}
function stripRules(r) { const o = { ...r }; delete o.devastating; delete o.piercing; delete o.torrent; delete o.blast; delete o.range; return o; }

// ---------- strategy ploy: Recon Sweep ----------
/** Edges of the killzone: a point's distance to each. */
const EDGES = (p) => ({ left: p.x, right: BOARD.w - p.x, top: p.y, bottom: BOARD.h - p.y });
function ownEdge(g, side) {
  const mid = { x: BOARD.w / 2, y: BOARD.h / 2 };
  const ops = living(g, side); if (!ops.length) return null;
  const cx = ops.reduce((s, o) => s + o.x, 0) / ops.length, cy = ops.reduce((s, o) => s + o.y, 0) / ops.length;
  const dx = cx - mid.x, dy = cy - mid.y;
  return Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'top' : 'bottom');
}
const whollyWithin = (o, edge) => EDGES(o)[edge] + radius(o) <= 6.01;
const whollyNear = (o, edges) => edges.some((e) => whollyWithin(o, e));
export function pfPloyBought(g, side, ploy) {
  if (ploy.id !== 'reconSweep') return;
  if (g.tp === 1) { note(g, side, '偵察掃蕩：第 1 回合不能用', 'Recon Sweep: not in the first turning point'); return; }
  const own = ownEdge(g, side), edges = ['left', 'right', 'top', 'bottom'].filter((e) => e !== own);
  const cands = (e) => living(g, side).filter((o) => isPF(o) && whollyWithin(o, e) && !isEngaged(g, o));
  const edge = edges.map((e) => [e, cands(e).length]).sort((a, b) => b[1] - a[1])[0];
  if (!edge || !edge[1]) { note(g, side, '偵察掃蕩：沒有符合條件的特工', 'Recon Sweep: no eligible operative'); return; }
  note(g, side, `偵察掃蕩：選擇${{ left: '左', right: '右', top: '上', bottom: '下' }[edge[0]]}側邊緣`, `Recon Sweep: the ${edge[0]} edge`);
  for (const o of cands(edge[0])) {
    const goal = [...(g.objectives || [])].sort((a, b) => dist(o, a) - dist(o, b))[0] || { x: BOARD.w / 2, y: BOARD.h / 2 };
    const q = bestStep(g, o, 3, 'dash', (p) => {
      const at = { ...o, x: p.x, y: p.y };
      return whollyNear(at, edges) ? dist(o, goal) - dist(p, goal) : null;
    });
    if (q) { stepTo(g, o, q); note(g, side, `偵察掃蕩：${opName(o, 'zh')} 免費衝刺`, `Recon Sweep: ${opName(o, 'en')} makes a free Dash`); }
  }
}

// ---------- A Worthy Cause (firefight ploy): at the start of the Firefight phase ----------
export function pfWorthy(g) {
  for (const side of [g.initiative, 1 - g.initiative]) if (g.teams[side] === 'tauPathfinders' && ffReady(g, side, 'worthyCause') && ffArmed(g, side, 'worthyCause')) {
    for (const o of living(g, side).filter((x) => isPF(x) && !tpl(x).drone && !isEngaged(g, x))) {
      const id = missionActionsFor(g, side).find((a) => !MISSION_ACTIONS[a].cond(g, o));
      if (!id) continue;
      if (!autoFF(g, side, 'worthyCause')) break;
      note(g, side, `正義之舉：${opName(o, 'zh')} 免費做任務動作`, `A Worthy Cause: ${opName(o, 'en')} performs a free mission action`);
      const keep = { ap: o.ap, acted: o.acted };
      o.acted = {}; g.seekerFree = o.uid;
      try { doMissionAction(g, o, id); } finally { g.seekerFree = null; }
      o.ap = keep.ap; o.acted = keep.acted;
      break;
    }
  }
}

// ---------- actions: Pulse Accelerator, Photon Grenade ----------
const eligiblePhoton = (g, op) => isPF(op) && !tpl(op).drone && !!tpl(op).markerlight && equip(g, op.side, 'pfPhoton') && g.pfUsed?.[op.side]?.photon !== g.tp;
export function pfActions(g, op, add) {
  if (!isPF(op)) return;
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' };
  if (tpl(op).pfAccelerator) add('pfAccel', !op.pfAccel, { zh: '已啟動', en: 'Already running' });
  if (eligiblePhoton(g, op)) add('pfPhoton', !eng && TARGET_ACTIONS.pfPhoton.targets(g, op).length > 0, eng ? ENG : { zh: '看不到敵人', en: 'No visible enemy' });
}
export function pfSelf(g, op, id) {
  if (id !== 'pfAccel') return false;
  spend(g, op, id);
  op.pfAccel = true;
  note(g, op.side, `${opName(op, 'zh')} 啟動脈衝加速器：3" 內友方脈衝武器「致命 5+」與「嚴重」`, `${opName(op, 'en')} runs the Pulse Accelerator: friendly pulse weapons within 3" have Lethal 5+ and Severe`);
  return true;
}
export function registerPathfinderActions() {
  ACTIONS.pfAccel = { ap: 1, name: { zh: '脈衝加速器', en: 'Pulse Accelerator' } };
  ACTIONS.pfPhoton = { ap: 1, name: { zh: '光子手雷', en: 'Photon Grenade' } };
  TARGET_ACTIONS.pfPhoton = {
    targets: (g, o) => foes(g, o).filter((e) => e.side < 2 && visibility(g, o, e).visible),
    apply(g, o, t) {
      ((g.pfUsed ||= [{}, {}])[o.side]).photon = g.tp;
      const r = d6();
      if (r >= 3) { t.pfPhoton = 'pending'; return { zh: `光子手雷：${opName(t, 'zh')} 擲 ${r}，到它下次啟動結束 Move -2" 且不能衝刺`, en: `Photon Grenade: ${opName(t, 'en')} rolls ${r} — -2" Move and no Dash until the end of its next activation` }; }
      return { zh: `光子手雷：${opName(t, 'zh')} 擲 ${r}，沒有效果`, en: `Photon Grenade: ${opName(t, 'en')} rolls ${r} — no effect` };
    },
  };
}

/** Setup: the roster limits (each once except Shas'la and Weapons Experts; the MB3 counts as two selections). */
export function pfSetup(g, roster) {
  for (const side of [0, 1]) if (g.teams[side] === 'tauPathfinders') {
    const error = pathfindersRosterError(team(g, side), roster[side]);
    if (error) throw new Error(error.en);
  }
}
