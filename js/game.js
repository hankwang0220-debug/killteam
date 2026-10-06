import { ARCHON_EQUIPMENT, CORSAIR_EQUIPMENT } from './data/eldar.js';
import { isCorsair, setupCorsair, corsairActivate, corsairCost, corsairSpend, corsairRules, corsairDefence, corsairStrategy, corsairShield, corsairEquip, registerCorsairActions, corsairPlunder, corsairAfterAction, slicingAttack } from './corsair.js';
import { isArchon, setupArchon, archonWeapons, archonReady, archonActivate, archonRules, archonDefence, archonBeforeAttack, archonAfterAction, painSnapshot, archonDeath, stingerBurst, chainSnare, painRerollValues, painReroll, aiPain, gainPain } from './archon.js';

import { TEAM_MAP, isBoltWeapon } from './data/teams.js';
import { MISSIONS, MISSION_ACTIONS, TAC_OPS, npoTargetFor, tacOnKill, tacOnTPEnd, tacOnBattleEnd, tacOnStrategyEnd } from './missions.js';
import { dist, distPointRect, segRect } from './geometry.js';
import { flatSight } from './sight.js';

export const BOARD = { w: 30, h: 22 };
export const ER = 1;          // engagement range (inches, base edge to base edge)
export const CONTROL = 1;     // objective control range
export const OBJ_R = 0.4;     // objective marker radius
export const MAX_TP = 4;
export const DEPLOY = [{ x0: 0, x1: 6, y0: 0, y1: 22 }, { x0: 24, x1: 30, y0: 0, y1: 22 }];
/** Side index for non-player operatives (mission NPOs), hostile to both players. */
export const NPO = 2;
/** Drop zones for this game (missions can move them, e.g. to the long edges). */
export const deployZones = (g) => g.deploy || DEPLOY;

// ---------- static helpers ----------
export const team = (g, side) => TEAM_MAP[g.teams[side]];
/** Team name for Chinese log lines, with the English name appended. */
const teamZh = (g, side) => `${team(g, side).name.zh}（${team(g, side).name.en}）`;
export const tpl = (op) => TEAM_MAP[op.team].ops.find((o) => o.id === op.tplId);
export const radius = (op) => tpl(op).base / 25.4 / 2;
export const isInjured = (op) => op.wounds < op.maxW / 2;
export const DEFENCE_DICE = 3;
export const hasPloy = (g, side, id) => g.ploys[side].includes(id);
export const living = (g, side) => g.ops.filter((o) => !o.dead && (side == null || o.side === side));
export const getOp = (g, uid) => g.ops.find((o) => o.uid === uid);
export const activeOp = (g) => (g.active == null ? null : getOp(g, g.active));
export const edgeDist = (a, b) => dist(a, b) - radius(a) - radius(b);
export const inEngagement = (a, b) => edgeDist(a, b) <= ER + 0.01;
/** Living operatives hostile to op: the other player's and any NPOs (NPOs are hostile to everyone). */
export const foes = (g, op) => g.ops.filter((o) => !o.dead && o.side !== op.side);
export const engagedEnemies = (g, op) => foes(g, op).filter((e) => inEngagement(op, e));
/** The current mission's rules (standard if none). */
export const mission = (g) => MISSIONS[g.mission] || MISSIONS.standard;
export const isEngaged = (g, op) => engagedEnemies(g, op).length > 0;
export const missionEngaged = (g, op) => isEngaged(g, op) && !op.acted?.lightFingers;
// Every dice roll goes through these, so the UI can tell whether an action rolled anything (undo is
// only offered for actions that didn't — otherwise it would allow re-rolling).
let rolls = 0;
export const rollCount = () => rolls;
export const d6 = () => { rolls++; return 1 + Math.floor(Math.random() * 6); };
const d3 = () => { rolls++; return 1 + Math.floor(Math.random() * 3); };
/** Injured stat changes apply (And They Shall Know No Fear ignores them). */
export const injuredPenalty = (g, op) => isInjured(op) && !hasPloy(g, op.side, 'noFear') && !disciplined(g, op)
  && !(markOf(op) === 'nurgle' && hasPloy(g, op.side, 'implacable')); // Implacable (Legionaries)
/** The operative has this Chapter Tactic (Angels of Death); the sniper's Camo Cloak grants Stealthy. */
export const hasTactic = (g, op, id) => !!g.tactics?.[op.side]?.includes(id) || (id === 'stealthy' && (!!tpl(op).camoCloak || !!tpl(op).wastelandStalker)); // (Wasteland Stalker: Ruststalkers)

/** Art of War option (Mont'ka / Kauyon) in effect for this operative; the Blooded veteran gets either. */
export const artOfWar = (g, op, id) => hasPloy(g, op.side, id)
  || (!!tpl(op).veteran && hasPloy(g, op.side, id === 'montka' ? 'kauyon' : 'montka'));
const isDrone = (op) => !!tpl(op).drone;

/**
 * Contagion (enemy Plague Marine ploy): poisoned and visible within 3" of a Plague Marine, or visible
 * within 3" of the Icon Bearer.
 */
function contagion(g, op) {
  const seen = (pm) => edgeDist(pm, op) <= 3 && (visibility(g, pm, op).visible || visibility(g, op, pm).visible);
  return [0, 1].some((foe) => foe !== op.side && hasPloy(g, foe, 'contagion')
    && living(g, foe).some((pm) => (op.poison || tpl(pm).iconBearer) && seen(pm)));
}
/** -2" Move and Hit worsened by 1: injured (unless ignored) or Contagion; the two aren't cumulative. */
export const statPenalty = (g, op) => injuredPenalty(g, op) || contagion(g, op);

export function moveStat(g, op) {
  // Injured: -2" Move, but never below 4" (unless the Move stat itself is lower).
  const base = tpl(op).move;
  let m = statPenalty(g, op) && !tpl(op).engenderedFocus && !(isArchon(op) && op.drug === 'hypex' && !contagion(g, op)) ? Math.max(Math.min(base, 4), base - 2) : base;
  if (artOfWar(g, op, 'montka')) m += 1;
  if (op.shieldingOn) m -= 2; // Shielding (Trench Sweeper)
  if (optimised(g, op, 'aggressor')) m += 1; // Aggressor Imperative
  if (markOf(op) === 'slaanesh') m += 1; // Unnatural Agility (Legionaries)
  m += op.acted?.moveBonus || 0; // Wild Rage (firefight ploy)
  if (deprecated(g, op, 'bulwark')) m -= 1; // Bulwark Imperative
  if (isDrone(op) && living(g, op.side).some((o) => tpl(o).droneController)) m += 2;
  return m;
}

/** APL for this activation: changes last until the end of the operative's next activation (Resolute ignores them). */
// The APL stat can't be changed by more than 1 in total.
// NEMESIS NPOs use the APL from their activation card and ignore all changes (Bulky).
// Viral Vox-static (Gellerpox Techno-curse): an infected operative's APL can't be increased.
export const aplNow = (g, op) => (tpl(op).nemesis && op.cardApl ? op.cardApl
  : Math.max(0, tpl(op).apl + (hasTactic(g, op, 'resolute') || tpl(op).chemEnhanced || tpl(op).toxicBlessings || tpl(op).engenderedFocus || op.shakeTP === g.tp ? 0 // Chem-enhanced / Toxic Blessings / Engendered Focus ignore APL changes
    : Math.max(-1, Math.min((op.aplNext || 0) > 0 && cursed(g, op, 'voxStatic') ? 0 : 1, op.aplNext || 0)))));

/** Change APL until the end of the operative's next activation (not the one it's in right now). */
function changeApl(g, op, n) {
  op.aplNext = (op.aplNext || 0) + n;
  if (g.active === op.uid && !op.counter) op.aplKeep = true;
}
export function moveAllowance(g, op, kind) {
  let d = moveStat(g, op);
  if (tpl(op).blinkPack && op.blinkOn && kind !== 'dash') return op.counter ? 2 : 7;
  if (kind === 'dash') d = tpl(op).blademaster && op.acted?.charge ? Math.min(3, op.acted.chargeRemaining || 0) : 3;
  if (kind === 'reposition' && guardOrder(g, op) === 'moveMove') d += 1; // Move! Move! Move!
  if (kind === 'reposition' && skillOn(g, op, 'strikeFast')) d += 1; // Strike Fast (Kasrkin)
  // Stealth Attack's free Charge can't exceed the Move stat.
  if (kind === 'charge') d = moveStat(g, op) + (op.acted?.free?.charge === 'stealth' ? 0 : op.acted?.boost ? 4 : 2); // Boost: +4"
  if (kind === 'charge' && op.acted?.free?.charge === 'rampage') d = 3; // Ruthless Rampage: a free Charge of up to 3"
  // Mission NEMESIS NPOs can't move more than a set distance per turning point.
  const cap = mission(g).npoMoveCap;
  if (cap && tpl(op).nemesis) d = Math.max(0, Math.min(d, cap - (op.movedTP || 0)));
  return op.counter ? Math.min(d, 2) : d; // a counteracting operative cannot move more than 2"
}

// ---------- killzone ----------
function mirror(r) { return { ...r, x: BOARD.w - r.x - r.w, y: BOARD.h - r.y - r.h }; }
function makeTerrain() {
  const half = [
    { kind: 'heavy', x: 7, y: 2, w: 4, h: 0.6 },
    { kind: 'heavy', x: 7, y: 2, w: 0.6, h: 4 },
    { kind: 'heavy', x: 12, y: 8, w: 0.6, h: 6 },
    { kind: 'heavy', x: 9, y: 15, w: 5, h: 0.6 },
    { kind: 'heavy', x: 13.5, y: 0, w: 3, h: 2.5 },
    { kind: 'heavy', x: 2, y: 7.2, w: 1.5, h: 0.6 },
    { kind: 'heavy', x: 10.5, y: 12, w: 1, h: 1 },
    { kind: 'light', x: 7, y: 12.8, w: 0.4, h: 2 },
    { kind: 'light', x: 4.5, y: 10, w: 0.4, h: 2 },
    { kind: 'light', x: 13.5, y: 12.6, w: 3, h: 0.4 },
    { kind: 'light', x: 9.5, y: 9, w: 0.4, h: 2.5 },
    { kind: 'light', x: 3.5, y: 17, w: 2.5, h: 0.4 },
    { kind: 'light', x: 3.5, y: 4.6, w: 2.5, h: 0.4 },
  ];
  return [...half, ...half.map(mirror)];
}
const OBJECTIVES = [{ x: 15, y: 11 }, { x: 10, y: 4.5 }, { x: 20, y: 4.5 }, { x: 10, y: 17.5 }, { x: 20, y: 17.5 }];

// ---------- setup ----------
export function newGame({ teams, ai, tactics = [], mission: missionId = 'standard', tacOps = [], equip = [], loadouts = [], roster = [] }) {
  const m = MISSIONS[missionId] || MISSIONS.standard;
  const g = {
    // Index 2 (NPO) of the per-side arrays is for mission NPOs.
    v: 1, teams: [...teams, 'npo'], ai, tp: 0, phase: 'deploy', cp: [2, 2, 0], vp: [0, 0, 0], kills: [0, 0, 0], ploys: [[], [], []],
    initiative: 0, turn: 0, active: null, log: [], mission: m.id,
    terrain: (m.terrain || makeTerrain()).map((t) => ({ ...t })),
    objectives: (m.objectives || OBJECTIVES).map((o, i) => ({ ...o, id: i })),
    markers: [], // mission markers that can be carried: {id, kind, x, y, carriedBy}
    deploy: m.deploy || null, axis: m.axis || 'x', ops: [], seq: 0,
    // Chapter Tactics [primary, secondary] for teams that have them; free ploys already used (Doctrine Warfare).
    tactics: [0, 1].map((s) => (TEAM_MAP[teams[s]].tactics ? tactics[s] || TEAM_MAP[teams[s]].defaultTactics : null)),
    freePloys: [[], [], []],
  };
  for (const side of [0, 1]) {
    let n = 0;
    for (const slot of TEAM_MAP[teams[side]].ops) {
      if (!slot.count) continue;
      const chosen = roster[side]?.[slot.id] || slot.id;
      const allowed = TEAM_MAP[teams[side]].replacements?.[slot.id];
      if (chosen !== slot.id && !allowed?.includes(chosen)) throw new Error('Invalid roster replacement');
      const t = TEAM_MAP[teams[side]].ops.find((o) => o.id === chosen);
      for (let k = 0; k < slot.count; k++) {
        n++;
        g.ops.push({
          uid: `${side}-${n}`, side, team: teams[side], tplId: t.id, num: n, x: 0, y: 0,
          // Operatives are set up with Conceal orders.
          wounds: t.wounds, maxW: t.wounds, order: 'conceal', ready: true, ap: 0, acted: {},
          // ml: enemy Markerlight tokens on it; aplNext: APL change until the end of its next activation;
          // used: uses of Limited weapons.
          // poison: has an enemy Poison token.
          ml: 0, aplNext: 0, used: {}, poison: false, damagedTP: false, dead: false, counteracted: false,
        });
      }
    }
  }
  setupArchon(g, loadouts);
  setupCorsair(g, loadouts);
  // Deployment: players alternate setting up a third of their team (rounded up) at a time; a roll-off
  // decides who sets up first. Operatives not set up yet wait off the board (x = -99).
  for (const o of g.ops) { o.x = -99; o.y = -99; o.placed = false; }
  let r0, r1;
  do { r0 = d6(); r1 = d6(); } while (r0 === r1);
  const first = r0 > r1 ? 0 : 1;
  g.dep = { turn: first, batch: [], size: [0, 1].map((s) => Math.ceil(g.ops.filter((o) => o.side === s).length / 3)), done: false };
  g.dep.need = depNeed(g, first);
  log(g, { zh: `部署擲骰 ${r0} : ${r1} → ${teamZh(g, first)} 先部署；雙方輪流每次部署隊伍的 1/3（無條件進位）`, en: `Deployment roll ${r0} : ${r1} → ${team(g, first).name.en} sets up first; players alternate setting up a third of their team (rounded up)` }, 'tp');
  for (const side of [0, 1]) {
    if (!g.tactics[side]) continue;
    const names = g.tactics[side].map((id) => team(g, side).tactics.find((t) => t.id === id).name);
    const lab = team(g, side).tacticsLabel;
    if (lab) { log(g, { zh: `${teamZh(g, side)} ${lab.zh}：「${names[0].zh}」`, en: `${team(g, side).name.en} ${lab.en}: ${names[0].en}` }, `side${side}`); continue; }
    log(g, { zh: `${teamZh(g, side)} 戰團戰術：主要「${names[0].zh}」、次要「${names[1].zh}」`, en: `${team(g, side).name.en} Chapter Tactics: ${names[0].en} (primary), ${names[1].en} (secondary)` }, `side${side}`);
  }
  log(g, { zh: `任務：${m.name.zh}`, en: `Mission: ${m.name.en}` }, 'tp');
  // Approved Ops missions: each player has a secret Tac Op (picked at setup, or at random from its archetypes).
  if (m.approved) g.tacOps = [0, 1].map((s) => ({ id: tacOps[s] && TAC_OPS[tacOps[s]] ? tacOps[s] : randomTacOp(teams[s]), revealed: false }));
  m.setup?.(g);
  // Universal equipment, set up before the battle (the computer takes its usual kit).
  for (const s of [0, 1]) setupEquipment(g, s, equip[s] || (ai === s ? AI_EQUIP : []));
  // Regular Dosage (Blooded Corpseman): another friendly starts with a stimm — the Fortified stimm on the Ogryn (or the Chieftain).
  for (const side of [0, 1]) {
    if (!g.ops.some((o) => o.side === side && tpl(o).stimms)) continue;
    const t = g.ops.find((o) => o.side === side && tpl(o).chemEnhanced) || g.ops.find((o) => o.side === side && tpl(o).leadWithStrength);
    if (t) giveStimm(g, t, 'fortified');
  }
  log(g, { zh: '部署階段：選一名待部署的特工，再點己方部署區放置；這一批在按「完成」前都能拖曳調整。', en: 'Deployment: pick an operative waiting to be set up, then tap inside your zone; this step\'s operatives can be dragged until you press Done.' });
  return g;
}

/** Add a mission NPO to the game (position it afterwards). */
export function spawnNpo(g, tplId) {
  const t = TEAM_MAP.npo.ops.find((o) => o.id === tplId);
  const num = g.ops.filter((o) => o.side === NPO).length + 1;
  const op = {
    uid: `${NPO}-${num}`, side: NPO, team: 'npo', tplId, num: g.ops.filter((o) => o.side === NPO && o.tplId === tplId).length + 1, x: 0, y: 0,
    wounds: t.wounds, maxW: t.wounds, order: 'conceal', ready: true, ap: 0, acted: {},
    ml: 0, aplNext: 0, used: {}, poison: false, damagedTP: false, dead: false, counteracted: false, actTP: 0, movedTP: 0,
  };
  g.ops.push(op);
  return op;
}

/**
 * Start the NPOs' slot in the alternating sequence: draw the mission's NPO activation card. Returns
 * {op, apl, bid} when an NPO activates (bid: players bid to control it — see resolveBid), or null
 * when the slot is skipped (the slot ends).
 */
export function npoBegin(g) {
  const pick = mission(g).npoDraw?.(g);
  if (!pick || pick.op.dead) { endActivation(g); return null; }
  if (pick.bid) { g.bidding = { uid: pick.op.uid, apl: pick.apl, bids: [null, null] }; return pick; }
  activateNpo(g, pick.op, pick.apl, pick.fights);
  return pick;
}

/** Activate an NPO with the APL from its activation card. */
export function activateNpo(g, op, apl, fights = 1) {
  g.active = op.uid;
  op.acted = { fightsAllowed: fights };
  op.cardApl = apl;
  op.ap = apl;
  op.orderSet = true;
  op.actTP = (op.actTP || 0) + 1;
  (g.recent ||= [null, null])[op.side] = { uid: op.uid, tp: g.tp, trails: [] };
  if (tpl(op).nemesis) op.order = 'engage';
  log(g, { zh: `${opName(op, 'zh')} 啟動（APL ${apl}）`, en: `${opName(op, 'en')} activates (APL ${apl})` }, 'npo');
  // Rad-Maggot Symbiosis (Ambull): regains APL+1 wounds whenever it's activated.
  if (tpl(op).symbiosis && op.wounds < op.maxW) {
    const gain = Math.min(op.maxW - op.wounds, apl + 1);
    op.wounds += gain;
    log(g, { zh: `${opName(op, 'zh')} 輻射蛆共生：回復 ${gain} 生命`, en: `${opName(op, 'en')} Rad-Maggot Symbiosis: regains ${gain} wounds` }, 'npo');
  }
}

/** Negotiation: record a player's secret bid; once both are in, resolve who (if anyone) controls the NPO. */
export function placeBid(g, side, amount) {
  const b = g.bidding;
  if (!b || b.bids[side] != null) return;
  b.bids[side] = Math.max(0, Math.min(g.negotiation?.[side] || 0, Math.floor(amount)));
  if (b.bids.every((x) => x != null)) resolveBid(g);
}

function resolveBid(g) {
  const b = g.bidding, op = getOp(g, b.uid);
  g.bidding = null;
  const [a, c] = b.bids;
  const winner = a > c ? 0 : c > a ? 1 : null;
  log(g, { zh: `談判出價 ${a} : ${c}`, en: `Negotiation bids ${a} : ${c}` }, 'npo');
  if (winner != null) {
    g.negotiation[winner] -= b.bids[winner];
    // Controlled as a friendly player operative for this activation.
    op.homeSide = NPO; op.side = winner;
    g.turn = winner;
    log(g, { zh: `${team(g, winner).name.zh} 本次操控 ${opName(op, 'zh')}`, en: `${team(g, winner).name.en} controls ${opName(op, 'en')} for this activation` }, `side${winner}`);
  } else if (!npoTargetFor(g, op)) {
    // No target under the modified threat principle and nobody controls it: skip.
    log(g, { zh: '沒有目標，檔案管理員略過這次啟動', en: 'No target: the Archivist skips this activation' }, 'npo');
    endActivation(g);
    return;
  }
  activateNpo(g, op, b.apl);
}

// ---------- mission markers ----------
const inMarkerRange = (op, m) => dist(op, m) - radius(op) - OBJ_R <= CONTROL + 0.01;
/** Markers op can pick up now (the mission decides which kinds; carry limit 1 unless the mission says). */
/** Everything that can be carried: mission markers, Retrieval markers, and objective markers in missions that allow it (Energy Cells). */
export const carriables = (g) => [...(g.markers || []), ...(mission(g).carryObjectives ? g.objectives : [])];
/** Can op pick this marker up (whatever the distance)? */
export function canPickUpMarker(g, op, m) {
  if (m.kind === 'retrieval') return m.owner === op.side; // Retrieval tac op
  if (g.objectives.includes(m)) return !!mission(g).carryObjectives && !!mission(g).canPickUpObjective?.(g, op, m);
  return !!mission(g).canPickUp?.(g, op, m);
}
export function pickUpTargets(g, op) {
  const m = mission(g);
  const carried = carriables(g).filter((x) => x.carriedBy === op.uid).length;
  if (carried >= (m.carryCap?.(g, op) ?? 1)) return [];
  return carriables(g).filter((x) => !x.carriedBy && canPickUpMarker(g, op, x) && inMarkerRange(op, x) && controller(g, x) === op.side);
}
/** A random Tac Op from the team's archetypes (any of them if none match). */
export function tacOpsFor(teamId) {
  const arch = (TEAM_MAP[teamId].info?.archetypes || []).map((a) => a.en);
  const ids = Object.keys(TAC_OPS).filter((id) => arch.includes(TAC_OPS[id].arch));
  return ids.length ? ids : Object.keys(TAC_OPS);
}
const randomTacOp = (teamId) => { const ids = tacOpsFor(teamId); return ids[Math.floor(Math.random() * ids.length)]; };
/** Mission actions this side can perform: the mission's, plus its Tac Op's (Clear, Retrieve). */
export const missionActionsFor = (g, side) => [...(mission(g).actions || []), ...(side < 2 ? TAC_OPS[g.tacOps?.[side]?.id]?.actions || [] : [])];
/** Is any operative of this side contesting the marker (within control range of it)? */
export const contests = (g, side, m) => living(g, side).some((o) => inMarkerRange(o, m));
/** Score VP from a mission source ('crit' / 'tac'), with a log line. */
export function addVP(g, side, n, kind, msg) {
  if (n <= 0) return;
  g.vp[side] += n;
  ((g.vpBy ||= [{}, {}])[side])[kind] = (g.vpBy[side][kind] || 0) + n;
  log(g, { zh: `${teamZh(g, side)} ${msg.zh}（+${n} VP）`, en: `${team(g, side).name.en} ${msg.en} (+${n}VP)` }, 'tp');
}
export function doPickUp(g, op) {
  const mk = pickUpTargets(g, op).sort((a, b) => dist(op, a) - dist(op, b))[0];
  if (!mk) return;
  spend(g, op, 'pickUp');
  mk.carriedBy = op.uid; mk.x = op.x; mk.y = op.y;
  log(g, { zh: `${opName(op, 'zh')} 撿起標記`, en: `${opName(op, 'en')} picks up a marker` }, `side${op.side}`);
}
/** Markers a carrier was holding stay where it fell. */
function dropMarkers(g, op) {
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.carriedBy = null; m.x = op.x; m.y = op.y; }
}
export function doMissionAction(g, op, id) {
  spend(g, op, id);
  if (tpl(op).gotIt) op.acted.gotItUsed = true;
  MISSION_ACTIONS[id].apply(g, op);
}

export function deployOk(g, op, p) {
  const z = deployZones(g)[op.side], r = radius(op);
  if (p.x - r < z.x0 || p.x + r > z.x1 || p.y - r < z.y0 || p.y + r > z.y1) return false;
  if (g.terrain.some((t) => distPointRect(p, t) < r)) return false;
  return !g.ops.some((o) => o.uid !== op.uid && !o.dead && dist(o, p) < radius(o) + r + 0.05);
}

// ---------- alternating deployment ----------
const unplaced = (g, side) => g.ops.filter((o) => o.side === side && !o.dead && o.placed === false);
/** How many operatives the side must set up in its current deployment step. */
function depNeed(g, side) { return Math.min(g.dep.size[side], unplaced(g, side).length); }

/** Can this operative be (re)placed now? Unplaced ones of the deploying side, or ones placed in this step. */
export function canPlace(g, op) {
  const d = g.dep;
  if (!d || d.done || g.phase !== 'deploy' || op.side !== d.turn) return false;
  return d.batch.includes(op.uid) || (op.placed === false && d.batch.length < d.need);
}

/** Set up (or move, within this step) one operative. */
export function placeOp(g, op, p) {
  if (!canPlace(g, op) || !deployOk(g, op, p)) return false;
  op.x = p.x; op.y = p.y;
  if (op.placed === false) { op.placed = true; g.dep.batch.push(op.uid); }
  return true;
}

/** Finish this deployment step; play passes to the other side while it still has operatives to set up. */
export function finishDeployStep(g) {
  const d = g.dep;
  if (!d || d.done || d.batch.length < d.need) return false;
  const side = d.turn;
  log(g, { zh: `${teamZh(g, side)} 部署了 ${d.batch.length} 名特工`, en: `${team(g, side).name.en} set up ${d.batch.length} operative(s)` }, `side${side}`);
  const other = 1 - side;
  d.turn = unplaced(g, other).length ? other : side;
  d.batch = [];
  if (!unplaced(g, 0).length && !unplaced(g, 1).length) {
    d.done = true;
    log(g, { zh: '雙方部署完成', en: 'Both teams are set up' }, 'tp');
  } else d.need = depNeed(g, d.turn);
  return true;
}

/** Set up the rest of the current step automatically (the computer, or the "auto" button). */
export function autoDeployStep(g) {
  const d = g.dep;
  if (!d || d.done) return;
  const ops = unplaced(g, d.turn).slice(0, d.need - d.batch.length);
  placeAuto(g, d.turn, ops);
  for (const o of ops) { o.placed = true; d.batch.push(o.uid); }
}

/** Place every operative of a side automatically (rearranging them). */
export function autoDeploy(g, side) {
  const ops = g.ops.filter((o) => o.side === side);
  for (const o of ops) { o.x = -99; o.y = -99; }
  placeAuto(g, side, ops);
  for (const o of ops) o.placed = true;
}

function placeAuto(g, side, ops) {
  const z = deployZones(g)[side];
  const cands = [];
  for (let x = z.x0 + 0.8; x <= z.x1 - 0.8; x += 1.6)
    for (let y = z.y0 + 0.8; y <= z.y1 - 0.8; y += 1.7) cands.push({ x, y });
  // Hidden spots first, then the front line (nearest the centre along the mission's axis), spread out from the middle.
  const along = g.axis === 'y' ? 'y' : 'x', across = along === 'x' ? 'y' : 'x';
  const mid = { x: BOARD.w / 2, y: BOARD.h / 2 };
  const front = (a) => Math.abs(a[along] - mid[along]);
  // Prefer spots where a Concealed operative can't be targeted from the enemy's drop zone (or from enemies
  // already set up): in cover or out of sight from as many viewpoints as possible.
  const ez = deployZones(g)[1 - side], probe = ops[0];
  const views = g.ops.filter((o) => o.side === 1 - side && !o.dead && o.x > -50).map((o) => ({ x: o.x, y: o.y }));
  for (let x = ez.x0 + 1; x <= ez.x1 - 1; x += Math.max(1, (ez.x1 - ez.x0 - 2) / 3)) for (let y = ez.y0 + 1; y <= ez.y1 - 1; y += Math.max(1, (ez.y1 - ez.y0 - 2) / 3)) views.push({ x, y });
  const exposed = (p) => {
    if (!probe) return 0;
    const me = { ...probe, x: p.x, y: p.y, order: 'conceal' };
    let n = 0;
    for (const v of views) { const s = visibility(g, { ...probe, x: v.x, y: v.y }, me); if (s.visible) n += s.cover ? 0.15 : 1; }
    return n;
  };
  const exp = new Map(cands.map((p) => [p, exposed(p)]));
  cands.sort((a, b) => Math.round(exp.get(a) * 2) - Math.round(exp.get(b) * 2) || front(a) - front(b) || Math.abs(a[across] - mid[across]) - Math.abs(b[across] - mid[across]));
  const placed = g.ops.filter((o) => o.side === side && !ops.includes(o) && o.x > -50).map((o) => ({ x: o.x, y: o.y }));
  for (const o of ops) {
    let spot = cands.find((p) => deployOk(g, o, p) && placed.every((q) => dist(p, q) >= 2.6))
      || cands.find((p) => deployOk(g, o, p));
    // Large bases (e.g. a 50mm Technomancer) may not fit the coarse grid: try a finer one.
    for (let x = z.x0 + radius(o); !spot && x <= z.x1 - radius(o); x += 0.4)
      for (let y = z.y0 + radius(o); !spot && y <= z.y1 - radius(o); y += 0.4) if (deployOk(g, o, { x, y })) spot = { x, y };
    if (!spot) spot = { x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2 }; // (should never happen)
    o.x = spot.x; o.y = spot.y; placed.push(spot);
  }
}

// ---------- log ----------
export function log(g, msg, cls = '') {
  g.seq = (g.seq || 0) + 1;
  g.log.push({ msg, cls, tp: g.tp, n: g.seq });
  if (g.log.length > 200) g.log.shift();
}

// ---------- turning points ----------
export function startBattle(g) {
  // Anyone not set up yet (e.g. automatic games) is placed automatically.
  for (const side of [0, 1]) {
    const rest = unplaced(g, side);
    if (rest.length) { placeAuto(g, side, rest); for (const o of rest) o.placed = true; }
  }
  if (g.dep) g.dep.done = true;
  startTP(g);
}

function startTP(g) {
  g.tp++;
  g.phase = 'initiative'; // the Initiative phase comes first; startStrategy moves on
  // Roll-off: the winner decides who has initiative. On a tie, the player who didn't have initiative
  // last turning point wins (in the first turning point, roll again).
  let a, b;
  do { a = d6(); b = d6(); } while (a === b && g.tp === 1);
  const prev = g.initiative;
  g.initDecider = a > b ? 0 : a < b ? 1 : 1 - prev;
  g.initRoll = [a, b];
  g.initiative = null;
  // The computer decides at once (it takes initiative); a human player chooses in the Initiative phase.
  if (g.ai === g.initDecider) setInitiative(g, g.initDecider);
  // Well Supplied (Hearthkyn Lugger): +1CP in the first turning point.
  if (g.tp === 1) for (const s of [0, 1]) if (living(g, s).some((o) => tpl(o).wellSupplied)) g.cp[s] += 1;
  g.counter = false;
  g.stratStep = 0;
  g.actCount = [0, 0, 0];
  for (const s of [0, 1]) gainBlood(g, s, { zh: '策略階段', en: 'Strategy phase' }); // Blooded: a token each Ready step
  // Strategic Oversight (Phobos Commsman): D6 4+ for 1 more CP, if it isn't within enemy control range.
  for (const s of [0, 1]) {
    const cm = living(g, s).find((o) => tpl(o).oversight && !isEngaged(g, o));
    if (!cm) continue;
    const r = d6();
    if (r >= 4) g.cp[s]++;
    log(g, { zh: `${opName(cm, 'zh')} 戰略監督（擲 ${r}）${r >= 4 ? '：+1CP' : '：沒有效果'}`, en: `${opName(cm, 'en')} Strategic Oversight (rolled ${r})${r >= 4 ? ': +1CP' : ': no effect'}` }, `side${s}`);
  }
  // actTP / movedTP: NPO activation and movement limits per turning point.
  for (const o of g.ops) { o.ready = !o.dead; o.acted = {}; o.ap = 0; o.counteracted = false; o.actTP = 0; o.movedTP = 0; }
  for (const s of [0, 1]) { livingMetal(g, s); readyReanimation(g, s); readyFaith(g, s); } // Hierotek Circle / Novitiates
  archonReady(g);
  // Smoke grenades from the last turning point stay for D3 more activations (rolled in this Ready step).
  g.smoke = (g.smoke || []).filter((s) => s.tp === g.tp - 1).map((s) => ({ ...s, left: d3() }));
  log(g, { zh: `── 第 ${g.tp} 回合 ── 主動權擲骰 ${a} : ${b}`, en: `── Turning Point ${g.tp} ── Initiative roll ${a} : ${b}` }, 'tp');
  mission(g).onReady?.(g); // the Ready step
}

/** The roll-off winner's choice: who has initiative this turning point. Then each player gains CP. */
export function setInitiative(g, side) {
  if (g.initiative != null) return;
  g.initiative = side;
  // Each player gains 1CP; after the first TP the player without initiative gains 2CP instead.
  g.cp[side] += 1;
  g.cp[1 - side] += g.tp > 1 ? 2 : 1;
  const d = g.initDecider;
  log(g, { zh: `${teamZh(g, d)} 擲贏主動權，${d === side ? '選擇自己先攻' : `讓 ${teamZh(g, side)} 先攻`}`, en: `${team(g, d).name.en} wins the roll-off and ${d === side ? 'takes initiative' : `gives initiative to ${team(g, side).name.en}`}` }, `side${d}`);
}

/** End the Initiative phase (roll-off, CP, Ready step) and begin the Strategy phase. */
export function startStrategy(g) {
  if (g.phase !== 'initiative') return;
  if (g.initiative == null) setInitiative(g, g.initDecider); // (not chosen: the winner takes it)
  g.phase = 'strategy';
  log(g, { zh: '進入策略階段', en: 'Strategy phase begins' }, 'tp');
}

/** The side choosing strategy ploys: the initiative player first, then the other player. */
export const ployChooser = (g) => (g.stratStep ? 1 - g.initiative : g.initiative);

/** The current chooser is done with ploys; after both sides the Firefight phase begins. */
export function finishPloys(g) {
  const side = ployChooser(g);
  log(g, { zh: `${teamZh(g, side)} 完成計謀選擇`, en: `${team(g, side).name.en} is done choosing ploys` }, `side${side}`);
  if (!g.ploys[side].length && living(g, side).some((o) => tpl(o).cunning)) { g.cp[side]++; log(g, { zh: '狡詐：首先放棄策略計謀，+1CP', en: 'Cunning: passed at first opportunity, +1CP' }, `side${side}`); }
  corsairStrategy(g, side);
  handOutGuardOrder(g, side);
  tacOnStrategyEnd(g, side); // Stake Claim / Envoy picks not made yet are made now
  skillsStrategyEnd(g, side); // Kasrkin: Skill at Arms (if not picked) and the Clearance Sweep marker
  if (g.stratStep) startFirefight(g);
  else g.stratStep = 1;
}

/** An operative whose Doctrine Warfare makes this ploy free (once per battle each), if any. */
function freePloyOp(g, side, ploy) {
  if (g.freePloys?.[side]?.includes(ploy.id)) return null;
  return living(g, side).find((o) => tpl(o).doctrineWarfare?.includes(ploy.id)) || null;
}

/** Which player's territory a point is in (its half of the killzone, along the mission's axis). */
export function territoryOf(g, p) {
  const zones = deployZones(g), along = g.axis === 'y' ? 'y' : 'x', mid = along === 'x' ? BOARD.w / 2 : BOARD.h / 2;
  const side0Low = zones[0][along + '0'] < mid;
  return (p[along] < mid) === side0Low ? 0 : 1;
}
/** In the opponent's territory (wholly in their half of the killzone). */
const inEnemyTerritory = (g, op) => {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(op);
  return [op[along] - r, op[along] + r].every((v) => territoryOf(g, { [along]: v }) !== op.side);
};

// Icon of Contagion: Contagion is free while the Icon Bearer is in the opponent's territory.
// Command Breach (Sergeant-at-Arms): Attack / Defence Order cost 0CP.
export const ployCost = (g, side, ploy) => (freePloyOp(g, side, ploy)
  || (ploy.id === 'contagion' && living(g, side).some((o) => tpl(o).iconBearer && inEnemyTerritory(g, o)))
  || (ploy.group === 'navyOrder' && living(g, side).some((o) => tpl(o).commandBreach)) ? 0 : ploy.cp);

/**
 * Can't be used now: already used this ploy, or another from its group this turning point (e.g. one
 * Combat Doctrine), a once-per-battle ploy already used, or the operative it needs isn't in the killzone.
 */
export const ployTaken = (g, side, ploy) => g.ploys[side].some((id) => id === ploy.id
  || (ploy.group && team(g, side).ploys.find((p) => p.id === id)?.group === ploy.group))
  || (ploy.oncePerBattle && !!g.battlePloys?.[side]?.includes(ploy.id))
  || (ploy.needs && !living(g, side).some((o) => o.tplId === ploy.needs))
  || (ploy.id === 'plunderers' && g.tp === 1);

export function buyPloy(g, side, ploy) {
  const cost = ployCost(g, side, ploy);
  if (side !== ployChooser(g) || g.cp[side] < cost || ployTaken(g, side, ploy)) return false;
  g.cp[side] -= cost;
  g.ploys[side].push(ploy.id);
  if (ploy.id === 'plunderers') corsairPlunder(g, side);
  if (ploy.oncePerBattle) ((g.battlePloys ||= [[], []])[side]).push(ploy.id);
  // Glory Kill: the toughest enemy a friendly can see (it can be changed while choosing ploys).
  if (ploy.id === 'gloryKill') setGloryKill(g, side, living(g, 1 - side).filter((e) => living(g, side).some((f) => visibility(g, f, e).visible)).sort((a, b) => b.wounds - a.wounds)[0]);
  // Attack / Defence Order: the marker starts by the friendly operative nearest the centre of the killzone.
  if (ploy.marker) placeNavyOrder(g, side, living(g, side).sort((a, b) => dist(a, { x: BOARD.w / 2, y: BOARD.h / 2 }) - dist(b, { x: BOARD.w / 2, y: BOARD.h / 2 }))[0]);
  const free = cost === 0 && ploy.cp > 0 ? freePloyOp(g, side, ploy) : null;
  if (free) (g.freePloys[side] ||= []).push(ploy.id);
  const note = free ? { zh: `（${opName(free, 'zh')} 教條戰：0CP）`, en: ` (${opName(free, 'en')} Doctrine Warfare: 0CP)` } : { zh: '', en: '' };
  log(g, { zh: `${teamZh(g, side)} 使用計謀「${ploy.name.zh}（${ploy.name.en}）」${note.zh}`, en: `${team(g, side).name.en} uses ploy "${ploy.name.en}"${note.en}` }, `side${side}`);
  return true;
}

export function startFirefight(g) {
  g.phase = 'firefight';
  g.turn = g.initiative;
}

/**
 * Can this ready operative be activated? A C.A.T. unit can't while within enemy control range or once its
 * Surveyor is gone (the turning point can end with it still ready).
 */
export function canActivateOp(g, o) {
  if (!o.ready || o.dead) return false;
  if (tpl(o).catUnit && (isEngaged(g, o) || !living(g, o.side).some((s) => tpl(s).surveyor))) return false;
  return true;
}
export function hasReady(g, side) { return living(g, side).some((o) => canActivateOp(g, o)); }

// ---------- Group Activation / Directive (Death Korps) ----------
/** Ready operatives the side may activate now (only the chained ones right after a Trooper or a Directive). */
// System Jam tokens (Hearthkyn Kinlynk): those operatives wait until every ready one without a token is expended.
export function readyOps(g, side) {
  let ready = living(g, side).filter((o) => canActivateOp(g, o) && (!g.chain || g.chain.uids.includes(o.uid)));
  ready = ready.filter((o) => !scrambled(g, o, ready)); // Omni-scrambler (Phobos)
  return ready.some((o) => !o.jam) ? ready.filter((o) => !o.jam) : ready;
}

/** After a Directive (optional), the player may decline to activate the chosen operative. */
export function passChain(g) {
  if (!g.chain || g.chain.must || g.active) return;
  const side = g.chain.side;
  // Not using Breach and Clear: an Armsman's Group Activation still applies.
  const fb = (g.chain.fallback || []).filter((u) => canActivateOp(g, getOp(g, u)));
  if (fb.length) { g.chain = { side, uids: fb, must: true, by: g.chain.by }; return; }
  g.chain = null;
  handOff(g, side);
}

export function activate(g, op) {
  op.chained = !!g.chain; // activated through Group Activation / Directive: doesn't chain again
  op.chainFrom = g.chain; // restored if the player switches to another operative before acting
  if (g.chain?.kind === 'breach') {
    (g.breachTP ||= [0, 0])[op.side] = g.tp;
    op.breachedTP = g.tp; // (Overwhelm Target)
    log(g, { zh: `突破清場：${opName(op, 'zh')} 接著行動`, en: `Breach and Clear: ${opName(op, 'en')} activates next` }, `side${op.side}`);
  }
  // Breach and Clear (Navy Breachers): ready friendlies visible within 3" now, one of which may activate right after it.
  if (TEAM_MAP[op.team].breachAndClear && !g.counter && !g.chain && g.breachTP?.[op.side] !== g.tp) {
    op.breach = living(g, op.side).filter((o) => o !== op && o.ready && edgeDist(o, op) <= 3 && visibility(g, op, o).visible).map((o) => o.uid);
  }
  g.chain = null;
  op.acted = {}; // (before Cult Ambush below records whether it started unseen)
  if (!g.counter && tpl(op).ruststalker && hasPloy(g, op.side, 'accelerant')) op.acted.accelerant = true;
  if (!g.counter) op.jam = false; // System Jam token removed when activated
  if (!g.counter) op.shieldingOn = false; // Shielding lasts until the start of its next activation
  if (!g.counter) op.gongOn = false; // so does Gong Knell
  if (!g.counter && g.mantle?.[op.side] === op.uid) g.mantle[op.side] = null; // and Mantle of Darkness
  // Cult Ambush (Wyrmblade): not visible to enemy operatives at the start of the activation.
  if (!g.counter && TEAM_MAP[op.team].cultAmbush) op.acted.unseen = !foes(g, op).some((e) => visibility(g, e, op).visible);
  if (!g.counter) (g.actCount ||= [0, 0, 0])[op.side] = (g.actCount[op.side] || 0) + 1; // for Omni-scrambler
  if (!g.counter && g.auspex?.[op.side] === op.uid) g.auspex[op.side] = null; // Auspex Scan lasts until its next activation
  // Warpcoven psychic powers last until the start of the caster's next activation.
  if (!g.counter) for (const k of ['fate', 'ravage', 'alight']) if (g[k]?.[op.side]?.by === op.uid) g[k][op.side] = null;
  if (!g.counter && g.pan?.[op.side]?.by === op.uid) g.pan[op.side] = null; // Pan Spectral Scan ends when the Lokâtr activates
  g.active = op.uid;
  // Directive (Confidant): ready friendlies visible within 6" now, one of which may activate right after it.
  if (tpl(op).confidant && !g.counter && !g.secondInCommand?.[op.side]) {
    op.directive = living(g, op.side).filter((o) => o !== op && o.ready && sameTeam(o, op) && edgeDist(o, op) <= 6 && visibility(g, op, o).visible).map((o) => o.uid);
  }
  // Each side's latest activated operative and its movement this activation, shown on the board.
  (g.recent ||= [null, null])[op.side] = { uid: op.uid, tp: g.tp, trails: [] };
  if (g.counter) {
    // Counteract: an expended Engage operative performs one 1AP action for free; order unchanged.
    op.counter = true;
    op.ap = 1;
    op.orderSet = true;
  } else {
    if (op.darkAnimus) { op.aplNext = (op.aplNext || 0) - 1; op.aplKeep = false; }
    op.ap = aplNow(g, op);
    // Sorcerous Automata (Rubric Marines): -1 APL this activation unless a friendly Sorcerer is within 9".
    if (tpl(op).automata && !sorcererNear(g, op, 9)) {
      op.ap = Math.max(0, op.ap - 1);
      log(g, { zh: `${opName(op, 'zh')} 巫術自動機：9" 內沒有巫師，本次啟動 APL -1`, en: `${opName(op, 'en')} Sorcerous Automata: no Sorcerer within 9", -1 APL this activation` }, `side${op.side}`);
    }
    op.orderSet = false;
    op.prevOrder = op.order;
    op.optics = false; // Optics lasts until the start of the operative's next activation
    op.longSightOn = false; // so does Long-sight
    if (g.veriscant?.[op.side]?.by === op.uid) g.veriscant[op.side] = null; // Veriscant (Malocator)
    if (g.scrapcode?.[op.side] === op.uid) g.scrapcode[op.side] = null; // Scrapcode Overload
    for (const k of ['augment', 'reinforce']) if (g[k]?.[op.side]?.by === op.uid) g[k][op.side] = null; // Augment Weapon / Reinforce Metal
    if (g.pechra?.[op.side]?.by === op.uid) g.pechra[op.side] = null; // the Tracker's Pech'ra marker
    // (Once per turning point, so switching to another operative before acting doesn't repeat it.)
    if (op.poison && op.poisonTP !== g.tp) {
      op.poisonTP = g.tp;
      log(g, { zh: `${opName(op, 'zh')} 中毒，啟動時受到 1 傷害`, en: `${opName(op, 'en')} is poisoned and takes 1 damage on activation` }, `side${op.side}`);
      applyDamage(g, op, op, 1);
    }
  }
  archonActivate(g, op);
  corsairActivate(g, op);
}

  // Archon effects are committed only when an action begins.

/** You may pick a different operative to activate (or counteract with) until its first action. */
export function canSwitchActive(g) {
  const op = activeOp(g);
  return !!op && startOfActivation(op);
}

/** Undo an activation (or counteract) that hasn't done anything yet. */
export function deactivate(g) {
  const op = activeOp(g);
  if (!op) return;
  if (op.counter) op.counter = false;
  else { if (op.prevOrder) op.order = op.prevOrder; op.orderSet = false; if (g.actCount) g.actCount[op.side]--; }
  op.ap = 0; op.acted = {};
  op.directive = null; op.breach = null;
  if (op.chainFrom?.kind === 'breach' && g.breachTP) g.breachTP[op.side] = 0;
  if (op.chainFrom) g.chain = op.chainFrom;
  op.chainFrom = null; op.chained = false;
  g.active = null;
}

export function setOrder(g, op, order) {
  if (op.orderSet) return;
  if (op.frenzy && order === 'conceal') return; // Frenzy: it can't have a Conceal order
  op.order = order;
}

/** Expended, Engage-order operatives that haven't counteracted this TP (Astartes: any order). */
export const counterCandidates = (g, side) =>
  living(g, side).filter((o) => !o.ready && (o.order === 'engage' || isAstartes(o)) && !o.counteracted);

export function endActivation(g) {
  const op = activeOp(g);
  const wasCounter = g.counter, wasNpo = !!g.npoSlot;
  if (g.proxy) endProxy(g); // an unused Interstitial Command Shoot is lost
  g.ffPending = null; g.ffAtk = null;
  if (g.smoke?.length) { for (const s of g.smoke) if (s.left != null) s.left--; g.smoke = g.smoke.filter((s) => s.left == null || s.left > 0); }
  if (op?.acted?.slink && op.order === 'engage') { op.order = 'conceal'; log(g, { zh: `${opName(op, 'zh')} 遁入黑暗：改為隱蔽指令`, en: `${opName(op, 'en')} Slink into Darkness: now Concealed` }, `side${op.side}`); }
  if (op) {
    op.ready = false; op.ap = 0;
    if (op.counter) { op.counter = false; op.counteracted = true; } else if (op.aplKeep) op.aplKeep = false; else op.aplNext = 0;
    // Frenzy: a Frenzied Fellgor falls when its activation or counteraction ends.
    if (op.frenzy && !op.dead) frenzyDie(g, op);
    // Mindburn lasts until the end of the target's next activation.
    if (!wasCounter && g.mindburn) for (const s of [0, 1]) if (g.mindburn[s] === op.uid) g.mindburn[s] = null;
    // An NPO controlled by a player for one activation (Negotiation) goes back to being an NPO.
    if (op.homeSide != null) { op.side = op.homeSide; op.homeSide = null; }
  }
  g.active = null;
  g.counter = false;
  g.chain = null;
  if (checkWipe(g)) return;
  // Group Activation (Trooper, mandatory) / Directive (Confidant, optional): one more friendly activation first.
  if (op && !wasCounter && !wasNpo && !op.dead && !op.chained) {
    const cur = op.side;
    const grp = tpl(op).groupAct; // Trooper / Glitchling / Mutant / Armsman
    const grpUids = grp ? living(g, cur).filter((o) => canActivateOp(g, o) && tpl(o).groupAct === grp).map((o) => o.uid) : [];
    // Breach and Clear (Navy Breachers, once per TP, optional): a friendly that was ready, visible and within 3"
    // when this one activated. An Armsman that doesn't use it still has to Group Activate.
    const bc = (op.breach || []).filter((u) => canActivateOp(g, getOp(g, u)));
    op.breach = null;
    if (bc.length && g.breachTP?.[cur] !== g.tp) {
      g.chain = { side: cur, uids: bc, must: false, by: op.uid, kind: 'breach', fallback: grpUids.length ? grpUids : null };
      g.turn = cur; return;
    }
    if (grp) {
      if (grpUids.length) { g.chain = { side: cur, uids: grpUids, must: true, by: op.uid }; g.turn = cur; return; }
    } else if (op.directive?.length) {
      const uids = op.directive.filter((u) => getOp(g, u).ready && !getOp(g, u).dead);
      op.directive = null;
      if (uids.length) { g.chain = { side: cur, uids, must: false, by: op.uid }; g.turn = cur; return; }
    }
  }
  if (wasNpo) {
    // The NPO slot is over: play resumes with the player who was due to activate.
    const next = g.npoSlot.next;
    g.npoSlot = null;
    if (hasReady(g, next)) g.turn = next;
    else if (hasReady(g, 1 - next)) g.turn = 1 - next;
    else endTP(g);
    return;
  }
  const cur = g.turn, other = 1 - cur;
  if (wasCounter) {
    // After a counteract (or passing on one), play returns to the player with ready operatives.
    if (hasReady(g, other)) passTurn(g, other);
    else if (!hasReady(g, cur)) endTP(g);
    return;
  }
  handOff(g, cur);
}

/** Play passes on after `cur` finished an activation. */
function handOff(g, cur) {
  const other = 1 - cur;
  if (hasReady(g, other)) { passTurn(g, other); return; }
  if (!hasReady(g, cur)) { endTP(g); return; }
  // The opponent has no ready operatives: between activations they may counteract.
  if (counterCandidates(g, other).length || orderSwapCands(g, other).length) { g.turn = other; g.counter = true; return; }
  passTurn(g, cur);
}

/**
 * Hand play to `next`. In missions with NPOs, once both players have activated (i.e. play is about to go
 * back to the player with initiative), the NPOs get their slot first.
 */
function passTurn(g, next) {
  const m = mission(g);
  if (m.npoSlotDue?.(g) && next === g.initiative) {
    g.npoSlot = { next };
    g.turn = NPO;
    return;
  }
  g.turn = next;
}

/** Farstalker: friendly operatives whose order can be changed (not within enemy control range). */
export const orderSwapCands = (g, side) => (TEAM_MAP[g.teams[side]].farstalker ? living(g, side).filter((o) => !isEngaged(g, o)) : []);

function toggleOrder(g, op) {
  op.order = op.order === 'conceal' ? 'engage' : 'conceal';
  log(g, { zh: `${opName(op, 'zh')} 改為${op.order === 'conceal' ? '隱蔽' : '交戰'}指令`, en: `${opName(op, 'en')} switches to ${op.order === 'conceal' ? 'Conceal' : 'Engage'}` }, `side${op.side}`);
}

/** Farstalker, Strategy phase: change the order of up to three operatives while choosing ploys. */
export function strategySwap(g, op) {
  const side = op.side;
  if (g.phase !== 'strategy' || side !== ployChooser(g) || (g.orderSwaps?.[side] || 0) >= 3 || !orderSwapCands(g, side).includes(op)) return false;
  toggleOrder(g, op);
  (g.orderSwaps ||= [0, 0])[side] = (g.orderSwaps[side] || 0) + 1;
  return true;
}

/** Farstalker, counteract: change one operative's order instead (counts as your counteract, not the operative's). */
export function counterSwap(g, op) {
  if (!g.counter || g.active || op.side !== g.turn || !orderSwapCands(g, g.turn).includes(op)) return false;
  toggleOrder(g, op);
  endActivation(g);
  return true;
}

/** Decline the chance to counteract. */
export function passCounter(g) {
  log(g, { zh: `${teamZh(g, g.turn)} 放棄反擊`, en: `${team(g, g.turn).name.en} does not counteract` }, `side${g.turn}`);
  endActivation(g);
}

/** The side whose operatives control a marker (highest total APL contesting it), or null. */
export function controller(g, obj) {
  if (obj.carriedBy) { const c = getOp(g, obj.carriedBy); return c && !c.dead ? c.side : null; } // a carried marker belongs to its carrier
  const sum = [0, 0, 0], shriek = [false, false, false], nuncio = [false, false, false];
  for (const o of living(g)) {
    if (o.brutalDisplayTP === g.tp) continue;
    // Drones count as 1 APL lower for objective control, the Icon Bearer as 1 higher; NEMESIS NPOs use their Control stat.
    // Ravage Destiny (Warpcoven): the target counts 1 lower. Frenzy (Fellgor): APL 1, whatever else applies.
    const ravaged = o.side < 2 && psyOn(g, 'ravage', 1 - o.side, o) ? 1 : 0;
    // (the Deathknell, an Icon Bearer, keeps its APL even with a Frenzy token)
    const apl = o.frenzy && !tpl(o).warGong ? 1 : tpl(o).control ?? Math.max(0, aplNow(g, o) - (isDrone(o) || tpl(o).machine ? 1 : 0) + (tpl(o).iconBearer ? 1 : 0) - ravaged);
    if (dist(o, obj) - radius(o) - OBJ_R <= CONTROL) { sum[o.side] += apl; if (shrieked(g, o)) shriek[o.side] = true; if (nuncioNear(g, o) || scrapNear(g, o) || grislyNear(g, o)) nuncio[o.side] = true; }
  }
  // Nuncio-aquila (Exaction Squad): likewise 1 lower if one is within 3" of the Proctor-exactant (cumulative).
  for (let s = 0; s < 3; s++) if (nuncio[s]) sum[s] = Math.max(0, sum[s] - 1);
  // Horrifying Shrieking: a side's total counts 1 lower if one of its contesting operatives is within 3" of a Fleshscreamer.
  for (let s = 0; s < 3; s++) if (shriek[s]) sum[s] = Math.max(0, sum[s] - 1);
  const best = Math.max(...sum);
  return best > 0 && sum.filter((v) => v === best).length === 1 ? sum.indexOf(best) : null;
}

function endTP(g) {
  log(g, { zh: `第 ${g.tp} 回合結束`, en: `End of Turning Point ${g.tp}` }, 'tp');
  mission(g).onTPEnd?.(g);
  tacOnTPEnd(g); // Tac Op scoring (before damage this TP is forgotten)
  if (g.phase === 'gameover') return;
  g.ploys = [[], [], []];
  g.mark = [null, null]; // Call the Kill lasts for the turning point
  g.orderSwaps = [0, 0];
  g.gorders = [null, null]; // Guardsman Orders
  g.chain = null;
  for (const o of g.ops) o.damagedTP = false; // Markerlight tokens stay until removed by moving
  if (g.tp >= MAX_TP) return gameOver(g);
  startTP(g);
}

// ---------- Kill Op (Approved Ops) ----------
// Enemy operatives that must be incapacitated to reach kill grades 1–5, by the enemy's starting count.
const KILL_GRADE = {
  5: [1, 2, 3, 4, 5], 6: [1, 2, 4, 5, 6], 7: [1, 3, 4, 6, 7], 8: [2, 3, 5, 6, 8], 9: [2, 4, 5, 7, 9],
  10: [2, 4, 6, 8, 10], 11: [2, 4, 7, 9, 11], 12: [2, 5, 7, 10, 12], 13: [3, 5, 8, 10, 13], 14: [3, 6, 8, 11, 14],
};
export function killThresholds(g, side) {
  // Expendable operatives (Breachers' C.A.T. unit, Gheistskull) don't count.
  const start = g.ops.filter((o) => o.side !== side && o.side !== NPO && !tpl(o).expendable).length;
  return KILL_GRADE[Math.min(14, Math.max(5, start))];
}
export const killGrade = (g, side) => killThresholds(g, side).filter((n) => g.kills[side] >= n).length;

/** Kill Op VP: 1 per kill grade reached, +1 at the end of the battle for the higher kill grade. */
export function killOpVP(g, side) {
  const grade = killGrade(g, side);
  const bonus = g.phase === 'gameover' && grade > killGrade(g, 1 - side) ? 1 : 0;
  return grade + bonus;
}
// Missions can replace the kill op with their own VP (mission(g).killOp === false).
export const totalVP = (g, side) => g.vp[side] + (mission(g).killOp === false ? 0 : killOpVP(g, side));

function checkWipe(g) {
  if (living(g, 0).length && living(g, 1).length) return false;
  // Some missions play out the remaining turning points when one player is wiped out.
  if (mission(g).playOut && (living(g, 0).length || living(g, 1).length)) return false;
  gameOver(g);
  return true;
}

function gameOver(g) {
  g.phase = 'gameover';
  g.active = null;
  for (const o of g.ops) if (o.frenzy && !o.dead) frenzyDie(g, o); // Frenzy: they fall when the battle ends
  mission(g).onBattleEnd?.(g);
  tacOnBattleEnd(g);
  const a = totalVP(g, 0), b = totalVP(g, 1);
  g.winner = a > b ? 0 : b > a ? 1 : null;
  log(g, { zh: `遊戲結束！總分 ${a} : ${b}`, en: `Game over! Final score ${a} : ${b}` }, 'tp');
}

// ---------- actions ----------
const MOVE_ACTIONS = ['reposition', 'charge', 'fallBack'];
const count = (op, k) => op.acted[k] || 0;
// Accelerant Agents (Hunter Clade ploy): set on the Ruststalker when it activates.
const accelerant = (op) => !!op.acted?.accelerant;
const moved = (op) => MOVE_ACTIONS.some((k) => count(op, k)) || count(op, 'dash');

// Astartes (Angels of Death): two Shoot or two Fight actions per activation, but not a second of
// either after doing one of each.
/** Astartes faction rule applies to this operative (Warpcoven: not to its Tzaangor). */
const isAstartes = (op) => !!TEAM_MAP[op.team].astartes && !tpl(op).notAstartes;

function attackAllowed(op, kind) {
  if (count(op, kind) === 0) return true;
  if (kind === 'fight' && (tpl(op).krumpin || tpl(op).twoFights) && count(op, kind) === 1) return true; // Krumpin' Time / Expert Swordsman
  if (kind === 'shoot' && tpl(op).pistolBarrage && op.acted.barrage?.remaining > 0) return true;
  if (kind === 'shoot' && tpl(op).mercilessHunter && !op.acted.archonMark && count(op, kind) === 1) return true;
  if (kind === 'shoot' && tpl(op).twoShoots && count(op, kind) === 1) return true; // Expert Gunslinger
  if (kind === 'shoot' && count(op, kind) === 1 && rapidOK(op) && op.acted.shotRapid) return true; // Rapid Fire (Kasrkin)
  if (kind === 'fight' && count(op, kind) < (op.acted.fightsAllowed || 1)) return true; // Enraged Ambull: two Fights
  if (kind === 'fight' && count(op, kind) === 1 && accelerant(op)) return true; // Accelerant Agents (Ruststalkers)
  const otherKind = kind === 'shoot' ? 'fight' : 'shoot';
  return isAstartes(op) && count(op, kind) === 1 && count(op, otherKind) === 0;
}

export const ACTIONS = {
  reposition: { ap: 1, name: { zh: '移動', en: 'Reposition' } },
  dash: { ap: 1, name: { zh: '衝刺', en: 'Dash' } },
  charge: { ap: 1, name: { zh: '衝鋒', en: 'Charge' } },
  fallBack: { ap: 2, name: { zh: '撤退', en: 'Fall Back' } },
  shoot: { ap: 1, name: { zh: '射擊', en: 'Shoot' } },
  fight: { ap: 1, name: { zh: '近戰', en: 'Fight' } },
  optics: { ap: 1, name: { zh: '光學瞄準', en: 'Optics' } },
  markerlight: { ap: 1, name: { zh: '標記光', en: 'Markerlight' } },
  signal: { ap: 1, name: { zh: '信號', en: 'Signal' } },
  spot: { ap: 1, name: { zh: '觀測', en: 'Spot' } },
  knuxSmash: { ap: 1, name: { zh: '指虎重擊', en: 'Knux Smash' } },
  boost: { ap: 1, name: { zh: '加速', en: 'Boost' } },
  guerrilla: { ap: 1, name: { zh: '游擊戰', en: 'Guerrilla Warfare' } },
  auspexScan: { ap: 1, name: { zh: '鳥卜儀掃描', en: 'Auspex Scan' } },
  helix: { ap: 1, name: { zh: '螺旋手套', en: 'Helix Gauntlet' } },
  gongKnell: { ap: 1, name: { zh: '鳴鑼', en: 'Gong Knell' } },
  inciteFury: { ap: 1, name: { zh: '煽動怒火', en: 'Incite Fury' } },
  rejuvenation: { ap: 1, name: { zh: '暴怒回春', en: 'Apoplectic Rejuvenation' } },
  mantle: { ap: 1, name: { zh: '黑暗披風', en: 'Mantle of Darkness' } },
  sweepingBlow: { ap: 1, name: { zh: '橫掃重擊', en: 'Sweeping Blow' } },
  actuation: { ap: 1, name: { zh: '褻瀆啟動', en: 'Sacrilegious Actuation' } },
  stimm: { ap: 1, name: { zh: '興奮劑', en: 'Stimms' } },
  shieldingUp: { ap: 0, name: { zh: '舉盾', en: 'Shielding' } },
  fate: { ap: 1, name: { zh: '命運庇護', en: 'Protected by Fate' } },
  ravage: { ap: 1, name: { zh: '摧毀命運', en: 'Ravage Destiny' } },
  alight: { ap: 1, name: { zh: '點燃', en: 'Alight' } },
  wayfind: { ap: 1, name: { zh: '尋路', en: 'Wayfind' } },
  pulse: { ap: 1, name: { zh: '干擾脈衝', en: 'Interference Pulse' } },
  signalAny: { ap: 1, name: { zh: '信號', en: 'Signal' } },
  jamToken: { ap: 1, name: { zh: '系統干擾', en: 'System Jam' } },
  panScan: { ap: 1, name: { zh: '全光譜掃描', en: 'Pan Spectral Scan' } },
  systemJam: { ap: 1, name: { zh: '系統干擾', en: 'System Jam' } },
  medikit: { ap: 1, name: { zh: '醫療包', en: 'Medikit' } },
  getItDun: { ap: 1, name: { zh: '快去做！', en: 'Get It Dun!' } },
  listenIn: { ap: 1, name: { zh: '聽好了', en: 'Listen In' } },
  stunGrenade: { ap: 1, name: { zh: '震撼手雷', en: 'Stun Grenade' } },
  dakkaDash: { ap: 1, name: { zh: '達卡衝刺', en: 'Dakka Dash' } },
  flail: { ap: 1, name: { zh: '連枷', en: 'Flail' } },
  miasma: { ap: 1, name: { zh: '毒瘴', en: 'Poisonous Miasma' } },
  vitality: { ap: 1, name: { zh: '腐敗活力', en: 'Putrescent Vitality' } },
  eyeAbove: { ap: 1, name: { zh: '天上之眼', en: 'From the Eye Above' } },
  pechra: { ap: 1, name: { zh: '標記獵物', en: 'Marked for the Hunt' } },
  energise: { ap: 1, name: { zh: '充能', en: 'Energise' } },
  longSight: { ap: 1, name: { zh: '遠視', en: 'Long-sight' } },
  stealthAttack: { ap: 2, name: { zh: '潛行突襲', en: 'Stealth Attack' } },
  pickUp: { ap: 1, name: { zh: '撿起標記', en: 'Pick Up Marker' } },
  veriscant: { ap: 1, name: { zh: '真相鑑定', en: 'Veriscant' } },
  apprehend: { ap: 0, name: { zh: '扣押', en: 'Apprehend' } },
  interstitial: { ap: 1, name: { zh: '間隙指令', en: 'Interstitial Command' } },
  canoptekRepair: { ap: 1, name: { zh: '聖甲蟲修復', en: 'Canoptek Repair' } },
  augment: { ap: 1, name: { zh: '強化武器', en: 'Augment Weapon' } },
  reinforce: { ap: 1, name: { zh: '強化金屬', en: 'Reinforce Metal' } },
  accelerate: { ap: 1, name: { zh: '加速', en: 'Accelerate' } },
  reanimate: { ap: 1, name: { zh: '復甦（擲骰）', en: 'Reanimate (roll)' } },
  reanimateSure: { ap: 2, name: { zh: '復甦（自動）', en: 'Reanimate (automatic)' } },
  mdVision: { ap: 1, name: { zh: '多維視覺', en: 'Multi-dimensional Vision' } },
  ammoResupply: { ap: 0, name: { zh: '補充彈藥', en: 'Ammo Resupply' } },
  meltaMine: { ap: 1, name: { zh: '放置熱熔地雷', en: 'Place Melta Mine' } },
  battleComms: { ap: 1, name: { zh: '戰場通訊', en: 'Battle Comms' } },
  tacticalCommand: { ap: 0, name: { zh: '戰術指揮', en: 'Tactical Command' } },
  grislyMark: { ap: 2, name: { zh: '血腥標記', en: 'Grisly Mark' } },
  unleashDaemon: { ap: 0, name: { zh: '釋放惡魔', en: 'Unleash Daemon' } },
  eqStun: { ap: 1, name: { zh: '震撼彈', en: 'Stun Grenade' } },
  eqSmoke: { ap: 1, name: { zh: '煙霧彈', en: 'Smoke Grenade' } },
};
// Cryptek unique actions (an Apprentek can perform one of them per turning point).
const CRYPTEK_ACTIONS = ['interstitial', 'canoptekRepair', 'augment', 'reinforce'];
Object.assign(ACTIONS, MISSION_ACTIONS); // mission actions (Siphon Power…)

const ACUTE = ['pickUp', 'veriscant'];
Object.assign(ACTIONS, {
  archonMark: { ap: 1, name: { zh: '刺客標記', en: 'Mark' } },
  tormentGrenade: { ap: 1, name: { zh: '折磨手榴彈', en: 'Torment Grenade' } },
  drugHeal: { ap: 1, name: { zh: '施用藥劑：治療', en: 'Administer Drug: heal' } },
  drugPainbringer: { ap: 1, name: { zh: '施用藥劑：痛苦使者', en: 'Administer Drug: Painbringer' } },
  drugAdrenalight: { ap: 1, name: { zh: '施用藥劑：腎上腺之光', en: 'Administer Drug: Adrenalight' } },
  drugHypex: { ap: 1, name: { zh: '施用藥劑：亢奮劑', en: 'Administer Drug: Hypex' } },
});

export function actionCost(g, op, id) {
  const raider = corsairCost(g, op, id); if (raider != null) return raider;
  if (id === 'medikit' && tpl(op).medikit0) return 0; // Kasrkin Combat Medic
  if (id === 'fallBack' && op.acted?.slip) return Math.max(1, actionCost(g, { ...op, acted: { ...op.acted, slip: false } }, id) - 1); // Slip Away
  if (id === 'fallBack' && (hasTactic(g, op, 'mobile') || tpl(op).disengage)) return 1 + (whipped(g, op) ? 1 : 0); // Mobile / Disengage (Endurant)
  if (id === 'fallBack' && whipped(g, op)) return ACTIONS.fallBack.ap + 1; // Whip Control (Herd-goad)
  // Kauyon: a Concealed operative's Markerlight is free.
  if (id === 'markerlight' && op.order === 'conceal' && artOfWar(g, op, 'kauyon')) return 0;
  // Free actions from Dakka Dash, Savage Assault and Stealth Attack.
  if (['dash', 'shoot', 'charge', 'fight'].includes(id) && op.acted?.free?.[id]) return 0;
  if (id === 'fight' && count(op, 'fight') === 1 && accelerant(op)) return 0; // Accelerant Agents: one Fight is free
  // Acute Focus (Malocator): once per activation, Pick Up, Veriscant or a mission action costs 1 less.
  const acute = tpl(op).acuteFocus && !op.acted?.acuteUsed && (ACUTE.includes(id) || MISSION_ACTIONS[id]) ? 1 : 0;
  if (id === 'veriscant') return ACTIONS.veriscant.ap - acute;
  // Pick Up Marker and mission actions: +1AP for Nightmare Hulks (not Vulgrar), and within 3" of a Fleshscreamer.
  if (id === 'pickUp' || MISSION_ACTIONS[id]) {
    // I've Got It (Hearthkyn Lugger): once per activation, a mission action costs 1 less.
    // Vanguard (Phobos): once per turning point, one operative with it pays 1 less for Pick Up or a mission action.
    const gotIt = (MISSION_ACTIONS[id] && tpl(op).gotIt && !op.acted?.gotItUsed ? 1 : 0)
      + (tpl(op).vanguard && g.vanguardTP?.[op.side] !== g.tp ? 1 : 0);
    // Slow-witted (Blooded Ogryn) pays 1 more as well.
    // Nuncio-aquila (Proctor-exactant): +1AP within 3" of it.
    // Energy Cells (crit op): picking up an objective marker costs extra in TP2-3, and that can't be reduced.
    const extra = id === 'pickUp' && pickUpTargets(g, op).some((m) => g.objectives.includes(m)) ? mission(g).pickUpExtra?.(g) || 0 : 0;
    return Math.max(0, ACTIONS[id].ap + ((tpl(op).hulk && !tpl(op).vulgrar) || tpl(op).slowWitted ? 1 : 0) + (shrieked(g, op) ? 1 : 0) + (nuncioNear(g, op) ? 1 : 0) + (grislyNear(g, op) ? 1 : 0) - gotIt - acute) + extra; // (+ Grisly Mark)
  }
  if (op.brutalDisplayTP === g.tp && (id === 'pickUp' || MISSION_ACTIONS[id])) return Infinity;
  return ACTIONS[id].ap;
}

// ---------- unique actions that pick an operative ----------
const sameTeam = (a, b) => a.side === b.side && a.team === b.team;
export const TARGET_ACTIONS = {
  archonMark: {
    targets: (g, o) => foes(g, o).filter((t) => visibility(g, o, t).visible),
    apply(g, o, t) { o.archonMark = { uid: t.uid, tp: g.tp }; return { zh: '標記：搜尋輕型，無視遮擋', en: 'Mark: Seek Light, ignore obscuring' }; },
  },
  tormentGrenade: {
    targets: (g, o) => foes(g, o).filter((t) => edgeDist(o, t) <= 6 && visibility(g, o, t).visible),
    apply(g, o, t) {
      const ts = living(g).filter((x) => x === t || edgeDist(x, t) <= 1);
      for (const x of ts) { if (d6() + (tpl(x).save >= 4 ? 1 : 0) >= 3) { x.archonPoison ||= o.uid; applyDamage(g, o, x, d3()); } }
      return { zh: '折磨手榴彈：命中者受到 D3 傷害並在每次啟動受到 D3 毒素傷害', en: 'Torment Grenade: successful tests cause D3 damage and D3 poison each activation' };
    },
  },
  // Markerlight: a visible enemy gains tokens (max 4). After a Shoot this activation, only its target.
  markerlight: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible
      && (!op.acted.shotTarget || op.acted.shotTarget === t.uid)),
    apply(g, op, t) {
      const n = Math.min(4 - (t.ml || 0), tpl(op).markerlight || 1);
      t.ml = (t.ml || 0) + n;
      op.acted.mlTarget = t.uid;
      return { zh: `標記光：${opName(t, 'zh')} 獲得 ${n} 個標記（共 ${t.ml}）`, en: `Markerlight: ${opName(t, 'en')} gains ${n} token(s) (${t.ml} total)` };
    },
  },
  // Signal (SUPPORT): another friendly Pathfinder visible within 6" gets +1 APL until the end of its next activation.
  signal: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && edgeDist(op, t) <= 6 + commsBonus(g, op) && visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `信號：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Signal: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Spot (SUPPORT, Death Korps Spotter): until the end of the TP, friendlies within 3" of the Spotter shooting that
  // enemy have Seek Light and it can't be obscured.
  spot: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible && (!tpl(op).spotRange || edgeDist(op, t) <= tpl(op).spotRange)),
    apply(g, op, t) {
      (g.spot ||= [null, null])[op.side] = { by: op.uid, t: t.uid, tp: g.tp };
      return { zh: `觀測：${opName(t, 'zh')}（本回合 3" 內友方射擊它時「搜尋（輕型）」且不會被遮擋）`, en: `Spot: ${opName(t, 'en')} (this TP, friendlies within 3" shooting it have Seek Light and it can't be obscured)` };
    },
  },
  // ---- Kasrkin ----
  // Battle Comms (Vox-trooper, twice per activation): another friendly +1 APL next activation (to a maximum of 3).
  battleComms: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && tpl(t).apl + Math.max(0, t.aplNext || 0) < 3),
    apply(g, op, t) { changeApl(g, t, 1); return { zh: `戰場通訊：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Battle Comms: ${opName(t, 'en')} gets +1 APL next activation` }; },
  },
  // Tactical Command (Sergeant): one friendly gets one more Skill at Arms until next TP (the one that suits it best).
  tacticalCommand: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && t.skillExtra?.tp !== g.tp),
    apply(g, op, t) {
      const have = g.skills?.[op.side]?.tp === g.tp ? g.skills[op.side].ids : [];
      const melee = avgDmg(bestMelee(t)) > Math.max(0, ...tpl(t).weapons.filter((w) => w.type === 'ranged').map((w) => avgDmg(w)));
      const id = (melee ? ['forCadia', 'iceInVeins', 'strikeFast', 'lightEmUp'] : ['lightEmUp', 'iceInVeins', 'strikeFast', 'forCadia']).find((s) => !have.includes(s));
      t.skillExtra = { tp: g.tp, id };
      return { zh: `戰術指揮：${opName(t, 'zh')} 獲得戰技「${SKILLS[id].name.zh}」`, en: `Tactical Command: ${opName(t, 'en')} gains ${SKILLS[id].name.en}` };
    },
  },
  // ---- Universal equipment ----
  // Stun grenade: an enemy visible within 6" and each operative within 1" of it: D6, 3+ = -1 APL next activation.
  eqStun: {
    targets: (g, op) => (eqLeft(g, op.side, 'stun') || adaptiveOk(g, op, 'stun') ? foes(g, op).filter((t) => t.side < 2 && edgeDist(op, t) <= 6 && visibility(g, op, t).visible) : []),
    apply(g, op, t) {
      if (adaptiveOk(g, op, 'stun')) ((g.adaptive ||= [{}, {}])[op.side]).stun = g.tp; else g.eqUses[op.side].stun--; // Adaptive Equipment (Kasrkin Trooper) first
      const hit = [t, ...g.ops.filter((o) => !o.dead && o !== t && o.side < 2 && edgeDist(o, t) <= 1)].map((o) => { const roll = d6(); if (roll >= 3) changeApl(g, o, -1); return { o, roll }; });
      const list = (lang) => hit.map(({ o, roll }) => `${opName(o, lang)} ${roll}${roll >= 3 ? (lang === 'zh' ? '（APL -1）' : ' (-1 APL)') : ''}`).join(lang === 'zh' ? '、' : ', ');
      return { zh: `震撼彈：${list('zh')}`, en: `Stun Grenade: ${list('en')}` };
    },
  },
  // Smoke grenade: placed on an operative visible within 6" (friend or foe).
  eqSmoke: {
    targets: (g, op) => (eqLeft(g, op.side, 'smoke') || adaptiveOk(g, op, 'smoke') ? g.ops.filter((t) => !t.dead && t.x > -50 && edgeDist(op, t) <= 6 && (t === op || visibility(g, op, t).visible)) : []),
    apply(g, op, t) {
      if (adaptiveOk(g, op, 'smoke')) ((g.adaptive ||= [{}, {}])[op.side]).smoke = g.tp; else g.eqUses[op.side].smoke--;
      (g.smoke ||= []).push({ x: t.x, y: t.y, side: op.side, tp: g.tp, left: null });
      return { zh: `煙霧彈：在 ${opName(t, 'zh')} 處放出煙霧`, en: `Smoke Grenade: smoke on ${opName(t, 'en')}` };
    },
  },
  // ---- Hierotek Circle ----
  // Interstitial Command (SUPPORT): another friendly visible within 6" (or 6" of a visible Despotek) takes a free Shoot.
  interstitial: {
    targets: (g, op) => interstitialTargets(g, op),
    apply(g, op, t) {
      startProxy(g, op, t);
      return { zh: `間隙指令：${opName(t, 'zh')} 立刻免費射擊一次`, en: `Interstitial Command: ${opName(t, 'en')} takes a free Shoot now` };
    },
  },
  // Canoptek Repair (SUPPORT, once per turning point): a friendly visible within 6" regains up to 2D3 wounds.
  canoptekRepair: {
    targets: (g, op) => (g.repairTP?.[op.side] === g.tp ? [] : living(g, op.side).filter((t) => sameTeam(t, op) && t.wounds < t.maxW && edgeDist(op, t) <= 6 + commsBonus(g, op) && (t === op || visibility(g, op, t).visible))),
    apply(g, op, t) {
      (g.repairTP ||= [0, 0])[op.side] = g.tp;
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + d3() + d3());
      return { zh: `聖甲蟲修復：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Canoptek Repair: ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  },
  // Augment Weapon (SUPPORT): until the caster's next activation, two weapon rules on one weapon of a friendly within 6".
  augment: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && edgeDist(op, t) <= 6 + commsBonus(g, op) && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      const w = tpl(t).weapons.filter((x) => x.type === 'ranged').sort((a, b) => avgDmg(b) - avgDmg(a))[0] || bestMelee(t);
      // Lethal 5+ and Rending if it lacks them; otherwise Severe / Saturate.
      const rules = ['lethal', 'rending', 'severe', 'saturate'].filter((k) => !(k === 'lethal' ? (w.rules.lethal || 6) <= 5 : w.rules[k])).slice(0, 2);
      (g.augment ||= [null, null])[op.side] = { by: op.uid, t: t.uid, w: w.id, rules };
      const name = { lethal: ['致命 5+', 'Lethal 5+'], rending: ['撕裂', 'Rending'], severe: ['重創', 'Severe'], saturate: ['飽和', 'Saturate'] };
      return { zh: `強化武器：${opName(t, 'zh')} 的${w.name.zh}獲得「${rules.map((k) => name[k][0]).join('」「')}」`, en: `Augment Weapon: ${opName(t, 'en')}'s ${w.name.en} gains ${rules.map((k) => name[k][1]).join(' and ')}` };
    },
  },
  // Reinforce Metal (SUPPORT): until the caster's next activation, attack dice of 3+ damage deal 1 less to a friendly within 6".
  reinforce: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && edgeDist(op, t) <= 6 + commsBonus(g, op) && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      (g.reinforce ||= [null, null])[op.side] = { by: op.uid, t: t.uid };
      return { zh: `強化金屬：${opName(t, 'zh')} 受到 3 以上的傷害時 -1`, en: `Reinforce Metal: attack dice inflicting 3+ damage on ${opName(t, 'en')} deal 1 less` };
    },
  },
  // Accelerate (Plasmacyte): a Deathmark or Immortal visible within 6" gets +1 APL until the end of its next activation.
  accelerate: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && (tpl(t).deathmark || tpl(t).steadfast) && edgeDist(op, t) <= 6 && visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `加速：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Accelerate: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // ---- Exaction Squad ----
  // Veriscant (Malocator): a visible enemy — friendly weapons have Lethal 5+ and Severe against it until its next activation.
  veriscant: {
    targets: (g, op) => foes(g, op).filter((t) => t.side !== NPO && visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.veriscant ||= [null, null])[op.side] = { by: op.uid, t: t.uid };
      return { zh: `真相鑑定：${opName(t, 'zh')}（直到下次啟動，友方攻擊它時「致命 5+」＋「重創」）`, en: `Veriscant: ${opName(t, 'en')} (until its next activation, friendlies attacking it have Lethal 5+ and Severe)` };
    },
  },
  // Apprehend (Cyber-mastiff): an enemy in its control range — Hit worsened by 1 and no Fall Back while it stays there.
  apprehend: {
    targets: (g, op) => engagedEnemies(g, op),
    apply(g, op, t) {
      op.apprehend = t.uid;
      return { zh: `扣押：${opName(t, 'zh')} 留在牠控制範圍內時命中變差 1、不能撤退`, en: `Apprehend: while ${opName(t, 'en')} stays in its control range, its Hit is worsened by 1 and it can't Fall Back` };
    },
  },
  // ---- Fellgor Ravagers ----
  // Incite Fury (Herd-goad): another friendly (not the Shaman or Ironhorn) visible within 3" gets +1 APL next activation.
  inciteFury: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && !tpl(t).fgShaman && !tpl(t).ironhorn && edgeDist(op, t) <= 3 && visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `煽動怒火：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Incite Fury: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Apoplectic Rejuvenation (Shaman): a friendly without a Frenzy token visible within 6" regains 2D3 (6 if it has a melee kill).
  rejuvenation: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && !t.frenzy && t.wounds < t.maxW && edgeDist(op, t) <= 6 && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + (t.meleeKill ? 6 : d3() + d3()));
      return { zh: `暴怒回春：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Apoplectic Rejuvenation: ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  },
  // ---- Blooded ----
  // Stimms (Corpseman): a friendly in control range gets Rejuvenated (heal 2D3) if hurt, otherwise another stimm it lacks.
  stimm: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && edgeDist(op, t) <= CONTROL + 0.01
      && ((!t.stimms?.rejuvenated && t.wounds < t.maxW) || !t.stimms?.fortified || !t.stimms?.enraged)),
    apply(g, op, t) {
      const kind = !t.stimms?.rejuvenated && t.maxW - t.wounds >= 2 ? 'rejuvenated'
        : !t.stimms?.fortified ? 'fortified' : !t.stimms?.enraged ? 'enraged' : 'rejuvenated';
      const before = t.wounds;
      giveStimm(g, t, kind);
      const name = { rejuvenated: ['回春', 'Rejuvenated'], fortified: ['強化', 'Fortified'], enraged: ['狂怒', 'Enraged'] }[kind];
      return { zh: `興奮劑「${name[0]}」：${opName(t, 'zh')}${kind === 'rejuvenated' ? ` 回復 ${t.wounds - before} 生命` : ' 整場有效'}`, en: `Stimms (${name[1]}): ${opName(t, 'en')}${kind === 'rejuvenated' ? ` regains ${t.wounds - before} wounds` : ' for the battle'}` };
    },
  },
  // ---- Warpcoven (PSYCHIC; until the start of the caster's next activation) ----
  // Protected by Fate (Sorcerer of Destiny): a visible friendly re-rolls any defence dice when shot.
  fate: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      (g.fate ||= [null, null])[op.side] = { by: op.uid, uid: t.uid };
      return { zh: `命運庇護：${opName(t, 'zh')} 被射擊時可重擲任意防禦骰`, en: `Protected by Fate: ${opName(t, 'en')} re-rolls any defence dice when shot` };
    },
  },
  // Ravage Destiny (Sorcerer of Destiny): a visible enemy within 9" must re-roll attack dice results of 6; counts 1 lower for control.
  ravage: {
    targets: (g, op) => foes(g, op).filter((t) => t.side !== NPO && edgeDist(op, t) <= 9 && visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.ravage ||= [null, null])[op.side] = { by: op.uid, uid: t.uid };
      return { zh: `摧毀命運：${opName(t, 'zh')} 攻擊時必須重擲擲出 6 的骰，控制目標時 APL -1`, en: `Ravage Destiny: ${opName(t, 'en')} must re-roll attack dice results of 6 and counts 1 lower for control` };
    },
  },
  // Alight (Sorcerer of Warpfire): friendlies attacking that visible enemy have Ceaseless.
  alight: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.alight ||= [null, null])[op.side] = { by: op.uid, uid: t.uid };
      return { zh: `點燃：攻擊 ${opName(t, 'zh')} 的友方武器「無休」`, en: `Alight: friendly weapons have Ceaseless against ${opName(t, 'en')}` };
    },
  },
  // ---- Phobos Strike Team ----
  // Helix Gauntlet (Helix Adept): a friendly within control range regains D3+3 wounds (not one saved by Medic! this TP).
  helix: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && t.wounds < t.maxW && t.medicTP !== g.tp && edgeDist(op, t) <= CONTROL + 0.01),
    apply(g, op, t) {
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + d3() + 3);
      return { zh: `螺旋手套：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命（${t.wounds}/${t.maxW}）`, en: `Helix Gauntlet: ${opName(t, 'en')} regains ${t.wounds - before} wounds (${t.wounds}/${t.maxW})` };
    },
  },
  // ---- Imperial Navy Breachers ----
  // Wayfind (Surveyor, SUPPORT): another friendly (not a machine) visible within 6" of it or of the C.A.T. unit: +1 APL.
  wayfind: {
    targets: (g, op) => {
      const from = [op, ...living(g, op.side).filter((c) => tpl(c).catUnit)];
      return living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && !tpl(t).machine
        && from.some((f) => edgeDist(f, t) <= 6 && visibility(g, f, t).visible));
    },
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `尋路：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Wayfind: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Interference Pulse (Void-jammer): an enemy visible to and within 8" of the Gheistskull; D6 (+1 if a valid target for it), 3+ = -1 APL.
  pulse: {
    targets: (g, op) => {
      const skulls = living(g, op.side).filter((s) => tpl(s).gheistskull);
      return foes(g, op).filter((t) => skulls.some((s) => edgeDist(s, t) <= 8 && visibility(g, s, t).visible));
    },
    apply(g, op, t) {
      const skull = living(g, op.side).find((s) => tpl(s).gheistskull && edgeDist(s, t) <= 8 && visibility(g, s, t).visible);
      const roll = d6(), bonus = skull && validTarget(g, skull, t, { type: 'ranged', rules: {} }) ? 1 : 0;
      const hit = roll + bonus >= 3;
      if (hit) changeApl(g, t, -1);
      return { zh: `干擾脈衝（擲 ${roll}${bonus ? '+1' : ''}）：${hit ? `${opName(t, 'zh')} 下次啟動 APL -1` : '沒有效果'}`, en: `Interference Pulse (rolled ${roll}${bonus ? '+1' : ''}): ${hit ? `${opName(t, 'en')} gets -1 APL next activation` : 'no effect'}` };
    },
  },
  // ---- Hearthkyn Salvagers ----
  // Knux Smash (Dôzr): an enemy in control range takes D3+1; on a 3, -1 APL until the end of its next activation.
  // (The 3" push and the free 3" Charge aren't modelled.)
  knuxSmash: {
    targets: (g, op) => engagedEnemies(g, op),
    apply(g, op, t) {
      const r = d3(), dmg = r + 1;
      applyDamage(g, op, t, dmg);
      if (r === 3 && !t.dead) changeApl(g, t, -1);
      return { zh: `指虎重擊：${opName(t, 'zh')} 受到 ${dmg} 傷害${r === 3 ? '，下次啟動 APL -1' : ''}`, en: `Knux Smash: ${opName(t, 'en')} takes ${dmg} damage${r === 3 ? ' and gets -1 APL next activation' : ''}` };
    },
  },
  // Signal (Kinlynk): any other friendly operative in the killzone gets +1 APL until the end of its next activation.
  signalAny: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op)),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `信號：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Signal: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // System Jam (Kinlynk): a valid target gains a token; it can't be activated until every enemy without one is expended.
  jamToken: {
    targets: (g, op) => foes(g, op).filter((t) => !t.jam && t.side !== NPO && validTarget(g, op, t, { type: 'ranged', rules: {} })),
    apply(g, op, t) {
      t.jam = true;
      return { zh: `系統干擾：${opName(t, 'zh')} 要等其他敵人都行動完才能啟動`, en: `System Jam: ${opName(t, 'en')} can't activate until every other enemy is expended` };
    },
  },
  // Pan Spectral Scan (Lokâtr): marker by a visible enemy; friendlies shooting enemies within 3" of it have Accurate 1 and Saturate.
  panScan: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.pan ||= [null, null])[op.side] = { x: t.x, y: t.y, by: op.uid };
      return { zh: `全光譜掃描：標記放在 ${opName(t, 'zh')} 處（3" 內的敵人被射擊時，射手「精準 1」＋「飽和」）`, en: `Pan Spectral Scan: marker by ${opName(t, 'en')} (shooting enemies within 3" of it: Accurate 1 + Saturate)` };
    },
  },
  // System Jam: a visible enemy gets -1 APL until the end of its next activation.
  systemJam: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, -1);
      return { zh: `系統干擾：${opName(t, 'zh')} 下次啟動 APL -1`, en: `System Jam: ${opName(t, 'en')} gets -1 APL for its next activation` };
    },
  },
  // Medikit: a wounded friendly non-drone Pathfinder within control range regains 2D3 wounds.
  medikit: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && !isDrone(t) && t.wounds < t.maxW
      && t !== op && t.medicTP !== g.tp && edgeDist(op, t) <= CONTROL + 0.01 && visibility(g, op, t).visible),
    apply(g, op, t) {
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + d3() + d3()); // up to 2D3
      return { zh: `醫療包：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命（${t.wounds}/${t.maxW}）`, en: `Medikit: ${opName(t, 'en')} regains ${t.wounds - before} wounds (${t.wounds}/${t.maxW})` };
    },
  },
  // Get It Dun! / Listen In (SUPPORT): another friendly visible within 6" gets +1 APL until the end of its next activation.
  // From the Eye Above (SUPPORT): same as Signal.
  eyeAbove: {
    targets: (g, op) => TARGET_ACTIONS.signal.targets(g, op),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `天上之眼：${opName(t, 'zh')} 下次啟動 APL +1`, en: `From the Eye Above: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Marked for the Hunt: the Pech'ra marker goes next to a visible enemy until the Tracker's next
  // activation; friendly shooting at enemies within 1" of it has Seek Light.
  pechra: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.pechra ||= [null, null])[op.side] = { x: t.x, y: t.y, by: op.uid };
      return { zh: `標記獵物：鳥標放在 ${opName(t, 'zh')} 旁`, en: `Marked for the Hunt: the Pech'ra marker is placed by ${opName(t, 'en')}` };
    },
  },
  getItDun: {
    targets: (g, op) => TARGET_ACTIONS.signal.targets(g, op),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `快去做！：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Get It Dun!: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  listenIn: {
    targets: (g, op) => TARGET_ACTIONS.signal.targets(g, op),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `聽好了：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Listen In: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Stun Grenade (Taktical Wot-notz, one Boy per turning point): an enemy visible within 6" and every
  // other operative within 1" of it roll a D6 — on a 3+, -1 APL until the end of its next activation.
  stunGrenade: {
    targets: (g, op) => (g.wotNotz?.[op.side] === g.tp ? [] : foes(g, op).filter((t) => edgeDist(op, t) <= 6 && visibility(g, op, t).visible)),
    apply(g, op, t) {
      (g.wotNotz ||= [0, 0])[op.side] = g.tp;
      const hit = [t, ...g.ops.filter((o) => !o.dead && o !== t && edgeDist(o, t) <= 1)].map((o) => {
        const roll = d6();
        if (roll >= 3) changeApl(g, o, -1);
        return { o, roll };
      });
      const list = (lang) => hit.map(({ o, roll }) => `${opName(o, lang)} ${roll}${roll >= 3 ? (lang === 'zh' ? '（APL -1）' : ' (-1 APL)') : ''}`).join(lang === 'zh' ? '、' : ', ');
      return { zh: `震撼手雷：${list('zh')}`, en: `Stun Grenade: ${list('en')}` };
    },
  },
  // Poisonous Miasma (PSYCHIC): an enemy visible within 7" (or a valid target) gains a Poison token;
  // if it already has one, it takes 3 damage instead.
  miasma: {
    targets: (g, op) => foes(g, op).filter((t) => (edgeDist(op, t) <= 7 && visibility(g, op, t).visible) || validTarget(g, op, t, { rules: {} })),
    apply(g, op, t) {
      if (!t.poison) { t.poison = true; return { zh: `毒瘴：${opName(t, 'zh')} 中毒`, en: `Poisonous Miasma: ${opName(t, 'en')} is poisoned` }; }
      applyDamage(g, op, t, 3);
      return { zh: `毒瘴：${opName(t, 'zh')} 已中毒，受到 3 傷害`, en: `Poisonous Miasma: ${opName(t, 'en')} is already poisoned and takes 3 damage` };
    },
  },
  // Putrescent Vitality (PSYCHIC, once per turning point): a friendly visible within 3" rolls 2D6 —
  // a total of 7 regains 7 wounds, otherwise the highest D6.
  vitality: {
    targets: (g, op) => (op.vitalityTP === g.tp ? [] : living(g, op.side).filter((t) => t !== op && t.wounds < t.maxW
      && edgeDist(op, t) <= 3 && visibility(g, op, t).visible)),
    apply(g, op, t) {
      op.vitalityTP = g.tp;
      const a = d6(), b = d6(), before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + (a + b === 7 ? 7 : Math.max(a, b)));
      return { zh: `腐敗活力（${a}+${b}）：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Putrescent Vitality (${a}+${b}): ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  },
};

/** Free actions still to take this activation (Dakka Dash), so it shouldn't end at 0AP. */
export const freePending = (op) => { const f = op.acted?.free; return !!(op.acted?.proxyFor || (f && (f.dash || f.shoot || f.charge || f.fight))); }; // (or an Interstitial Command Shoot)

/** Dakka Dash: spend 1AP for a free Dash and a free Shoot with the dakka shoota, in either order. */
export function doDakkaDash(g, op) {
  spend(g, op, 'dakkaDash');
  op.acted.free = { dash: true, shoot: 'dakka' };
  log(g, { zh: `${opName(op, 'zh')} 達卡衝刺：可免費衝刺與用達卡槍射擊`, en: `${opName(op, 'en')} Dakka Dash: a free Dash and a free dakka shoota Shoot` }, `side${op.side}`);
}

/** Operatives the Flail action hits: every other operative visible to and within 2" (friends too). */
export const flailTargets = (g, op) => g.ops.filter((t) => !t.dead && t !== op && edgeDist(op, t) <= 2 && visibility(g, op, t).visible);

/** Flail (treated as a Fight action): D3+2 damage to each; an enemy also gains a Poison token on a D3 of 3. */
export function doFlail(g, op) {
  spend(g, op, 'fight');
  log(g, { zh: `${opName(op, 'zh')} 揮舞連枷`, en: `${opName(op, 'en')} swings the Flail` }, `side${op.side}`);
  for (const t of flailTargets(g, op)) {
    const roll = d3();
    const poisoned = t.side !== op.side && roll === 3 && !t.poison;
    if (poisoned) t.poison = true;
    log(g, { zh: `連枷：${opName(t, 'zh')} 受到 ${roll + 2} 傷害${poisoned ? '並中毒' : ''}`, en: `Flail: ${opName(t, 'en')} takes ${roll + 2} damage${poisoned ? ' and is poisoned' : ''}` }, `side${op.side}`);
    applyDamage(g, op, t, roll + 2);
  }
}

export function doTargetAction(g, op, id, target) {
  if (id === 'warpFold' && !op.warpFirst) { op.warpFirst = target.uid; return false; }
  spend(g, op, id);
  const before = painSnapshot(g);
  const msg = TARGET_ACTIONS[id].apply(g, op, target);
  archonAfterAction(g, op, before);
  corsairAfterAction(g, op);
  log(g, { zh: `${opName(op, 'zh')} ${msg.zh}`, en: `${opName(op, 'en')} ${msg.en}` }, `side${op.side}`);
}
for (const [id, drug] of Object.entries({ drugHeal: null, drugPainbringer: 'painbringer', drugAdrenalight: 'adrenalight', drugHypex: 'hypex' })) {
  TARGET_ACTIONS[id] = {
    targets: (g, o) => living(g, o.side).filter((t) => isArchon(t) && edgeDist(o, t) <= 3 && (t === o || visibility(g, o, t).visible) && (drug ? t.drug !== drug : t.wounds < t.maxW)),
    apply(g, o, t) { if (drug) t.drug = drug; else t.wounds = Math.min(t.maxW, t.wounds + d3() + d3()); return { zh: `為 ${opName(t, 'zh')} 施用藥劑`, en: `Administer Drug to ${opName(t, 'en')}` }; },
  };
}

// The second Shoot of an Astartes activation costs +1AP if both use the sniper rifle or heavy bolter.
const DOUBLE_SHOT_GROUPS = ['sniper', 'heavyBolter', 'soulreaper', 'warpflamer']; // Warpcoven: soulreaper cannon / warpflamer
// One of an Astartes operative's two Shoots must use a bolt weapon (Plague Marines: or a Psychic weapon).
const astartesShot = (w) => isBoltWeapon(w) || !!w.rules.psychic;

/** Can the active operative shoot with this weapon now? {ok, ap, why} */
export function shootWeapon(g, op, w) {
  const no = (zh, en) => ({ ok: false, ap: 1, why: { zh, en } });
  if (w.type !== 'ranged') return no('不是遠程武器', 'Not a ranged weapon');
  if (op.order === 'conceal' && !w.rules.silent) return no('隱蔽指令無法射擊', 'Cannot Shoot while Concealed');
  // Heavy (X only): any move other than X rules the weapon out.
  const h = w.rules.heavy;
  const heavyMoved = typeof h === 'string' ? ['reposition', 'dash', 'charge', 'fallBack'].some((k) => k !== h && count(op, k)) : h && moved(op);
  if (heavyMoved) return no('本次已移動，不能用重型武器', 'Moved — cannot use a Heavy weapon');
  let ap = actionCost(g, op, 'shoot');
  if (tpl(op).pistolBarrage) {
    if (op.acted.barrage) {
      if (!op.acted.barrage.remaining || !['cvFusion', 'cvPistol'].includes(w.id) || op.acted.barrage.used.includes(w.id)) return no('手槍彈幕每把手槍各一次', 'Pistol Barrage: each pistol once');
      return { ok: true, ap: 0, why: null };
    }
  }
  if (w.rules.limited && (op.used?.[w.id] || 0) >= w.rules.limited) return no('已用完（限用）', 'Used up (Limited)');
  if (w.rules.detonate && !living(g, op.side).some((o) => tpl(o).gheistskull)) return no('鬼骷髏不在場上', 'No Gheistskull in the killzone');
  if (w.rules.psychic && nullRodded(g, op)) return no('譴責者 6" 內不能用靈能武器', 'No PSYCHIC weapons within 6" of a Condemnor');
  if (w.rules.equipGrenade && !eqLeft(g, op.side, w.rules.equipGrenade)) return no('手榴彈用完了', 'No grenades left');
  if (w.rules.firstShotOnly && op.used?.shoot) return no('只能在第一次射擊使用', 'Only for the first Shoot of the battle');
  const free = op.acted?.free?.shoot; // Dakka Dash: a free Shoot with the dakka shoota
  if (free === 'any') return { ok: true, ap: 0, why: null }; // The Ancestors Are Watching
  if (free) return w.group === free ? { ok: true, ap: 0, why: null } : no('達卡衝刺只能用達卡槍', 'Dakka Dash: dakka shoota only');
  if (count(op, 'shoot')) {
    const first = op.acted.shotWith;
    if (tpl(op).mercilessHunter) {
      if (op.acted.archonMark || count(op, 'shoot') >= 2 || ((first === 'haRazorwing') === (w.id === 'haRazorwing'))) return no('雙射必須恰好一次使用剃刀翼，且本次不能標記', 'Exactly one Razorwing Shoot; cannot Mark');
      return { ok: op.ap >= ap, ap, why: null };
    }
    if (TEAM_MAP[op.team].rapidFire && !rapidWeapon(w)) return no('快速射擊兩次都要用爆彈手槍或熱射雷射槍／手槍', 'Rapid Fire: both Shoots need a bolt pistol or hot-shot lasgun / laspistol');
    if (!TEAM_MAP[op.team].anyAstartesShot && !TEAM_MAP[op.team].rapidFire && !astartesShot(w) && !op.acted.shotBolt) return no('兩次射擊至少一次要用爆彈（或靈能）武器', 'One of the two Shoots must use a bolt (or Psychic) weapon');
    if (w.rules.psychic && first === w.group) return no('同一把靈能武器不能用兩次', 'Same Psychic weapon twice');
    if (first === w.group && DOUBLE_SHOT_GROUPS.includes(w.group)) ap = 2;
  }
  if (op.ap < ap) return { ok: false, ap, why: { zh: 'AP 不足', en: 'Not enough AP' } };
  return { ok: true, ap, why: null };
}

/** Returns [{id, ap, ok, why}] for the active operative. */
export function availableActions(g, op) {
  const engaged = isEngaged(g, op);
  const did = (...ks) => ks.some((k) => count(op, k));
  const hasRanged = weaponsFor(g, op).some((w) => w.type === 'ranged');
  const conceal = op.order === 'conceal';
  const list = [];
  const add = (id, cond, why) => {
    const ap = actionCost(g, op, id);
    const ok = cond && op.ap >= ap;
    list.push({ id, ap, ok, why: !cond ? why : op.ap < ap ? { zh: 'AP 不足', en: 'Not enough AP' } : null });
  };
  const ENG = { zh: '處於交戰中', en: 'Engaged' };
  const DONE = { zh: '本次啟動已執行', en: 'Already done' };
  const CONC = { zh: '隱蔽指令無法執行', en: 'Not while Concealed' };
  // Official combinations: Reposition ✕ Fall Back/Charge; Dash ✕ Charge; Charge ✕ Reposition/Dash/Fall Back.
  const COMBO = { zh: '本次啟動已執行衝突的移動動作', en: 'Conflicts with a move already made' };
  // Heavy: an operative cannot move in an activation or counteraction in which it used a Heavy weapon
  // (Heavy (Dash only) / (Reposition only): that one move is still allowed).
  // Rapid Fire (Kasrkin): after shooting twice it can't move this activation.
  const rapidLock = TEAM_MAP[op.team].rapidFire && count(op, 'shoot') >= 2;
  const HEAVY = rapidLock ? { zh: '快速射擊兩次後不能移動', en: 'Shot twice with Rapid Fire, cannot move' } : { zh: '本次已使用重型武器，不能移動', en: 'Used a Heavy weapon, cannot move' };
  const heavyBlocks = (k) => (op.warpMoveLockTP === g.tp && k !== 'dash') || rapidLock || (!!count(op, 'heavy') && op.acted.heavy !== k);
  const free = op.acted.free || {};
  // Mobile: may Charge while within control range of an enemy.
  const chargeEngaged = engaged && !hasTactic(g, op, 'mobile');
  add('reposition', !engaged && !heavyBlocks('reposition') && !did('reposition', 'fallBack', 'charge'), engaged ? ENG : heavyBlocks('reposition') ? HEAVY : count(op, 'reposition') ? DONE : COMBO);
  const bladeDash = tpl(op).blademaster && count(op, 'charge') && (op.acted.chargeRemaining || 0) > 0;
  const caprice = free.dash === 'capricious'; // Capricious Plan: a free Dash whatever it did before
  add('dash', !engaged && (caprice || (!heavyBlocks('dash') && !count(op, 'dash') && (!count(op, 'charge') || bladeDash))) && op.plunderTP !== g.tp, engaged ? ENG : heavyBlocks('dash') ? HEAVY : count(op, 'dash') ? DONE : COMBO);
  // A Concealed operative can never Charge (the Kommandos' Throat Slittas and the Stalker's exception are not applied).
  const noCharge = conceal;
  // (Dakka Dash includes a Dash, so it also rules out Charge.)
  const rampage = free.charge === 'rampage'; // Ruthless Rampage: a free Charge even after one
  add('charge', !chargeEngaged && !noCharge && (rampage || (!heavyBlocks('charge') && !did('charge', 'reposition', 'dash', 'fallBack', 'dakkaDash'))), chargeEngaged ? ENG : noCharge ? CONC : heavyBlocks('charge') ? HEAVY : count(op, 'charge') ? DONE : COMBO);
  // Apprehend / Castigator's Arrest (Exaction Squad): held in place.
  const held = engaged && (arrested(g, op) || !!op.acted.fallBackDenied);
  add('fallBack', engaged && !held && !heavyBlocks('fallBack') && !did('fallBack', 'reposition', 'charge'), !engaged ? { zh: '未處於交戰', en: 'Not engaged' } : held ? { zh: '被逮捕／扣押，無法撤退', en: 'Apprehended / arrested — cannot Fall Back' } : heavyBlocks('fallBack') ? HEAVY : count(op, 'fallBack') ? DONE : COMBO);
  const shots = weaponsFor(g, op).filter((w) => w.type === 'ranged').map((w) => shootWeapon(g, op, w));
  // Close Quarters Vigilance (Vigilant): may Shoot while engaged, unless it Charged this activation (counteracting is fine).
  const shootEngaged = engaged && !tpl(op).quickTrigger && !(tpl(op).vigilance && (op.counter || !count(op, 'charge')));
  const shootWhy = shootEngaged ? ENG : !attackAllowed(op, 'shoot') ? DONE : (shots.find((s) => !s.ok)?.why || DONE);
  add('shoot', hasRanged && !shootEngaged && attackAllowed(op, 'shoot') && shots.some((s) => s.ok), shootWhy);
  // Savage Assault / Stealth Attack: a free Fight (against the same enemy for Savage Assault).
  add('fight', fightTargets(g, op).length > 0 && (attackAllowed(op, 'fight') || !!free.fight), !engaged ? { zh: '沒有交戰中的敵人', en: 'No enemy in engagement' } : DONE);
  if (tpl(op).optics) add('optics', !engaged && !count(op, 'optics'), engaged ? ENG : DONE);
  const NONE = { zh: '沒有可選的目標', en: 'No valid target' };
  const unique = (id, extra = true, extraWhy = null) => {
    const cond = !engaged && extra && !count(op, id) && TARGET_ACTIONS[id].targets(g, op).length > 0;
    add(id, cond, engaged ? ENG : !extra ? extraWhy : count(op, id) ? DONE : NONE);
  };
  for (const id of ['soulChannel', 'soulHeal', 'wardingShield', 'warpFold']) if (tpl(op)[id]) unique(id);
  if (tpl(op).blinkPack) add('blinkToggle', !did('reposition', 'charge', 'fallBack'), DONE);
  if (tpl(op).pistolBarrage) add('pistolBarrage', !conceal && !did('shoot', 'pistolBarrage'), conceal ? CONC : DONE);
  if (tpl(op).tormentGrenade) unique('tormentGrenade');
  if (tpl(op).administerDrug) for (const id of ['drugHeal', 'drugPainbringer', 'drugAdrenalight', 'drugHypex']) unique(id, !['drugHeal', 'drugPainbringer', 'drugAdrenalight', 'drugHypex'].some((x) => count(op, x)), DONE);
  if (tpl(op).archonMark) unique('archonMark', count(op, 'shoot') < 2, DONE);
  if (tpl(op).markerlight) unique('markerlight');
  if (tpl(op).signal) unique('signal');
  if (tpl(op).signalAny) unique('signalAny');
  if (tpl(op).jamToken) unique('jamToken');
  if (tpl(op).panScan) unique('panScan');
  if (tpl(op).pulse) unique('pulse');
  if (tpl(op).helix) unique('helix');
  if (tpl(op).destiny) { unique('fate'); unique('ravage'); }
  if (tpl(op).stimms) unique('stimm');
  if (tpl(op).inciteFury) unique('inciteFury');
  if (tpl(op).fgShaman) { unique('rejuvenation'); add('mantle', !engaged && !count(op, 'mantle'), engaged ? ENG : DONE); }
  if (tpl(op).gongKnell) add('gongKnell', !count(op, 'gongKnell'), DONE);
  if (tpl(op).sweepingBlow) add('sweepingBlow', !conceal && !count(op, 'sweepingBlow'), conceal ? CONC : DONE);
  if (tpl(op).actuation) add('actuation', !engaged && !!op.bloodToken && !count(op, 'actuation'), engaged ? ENG : !op.bloodToken ? { zh: '自己沒有血祭標記', en: 'It has no Blooded token' } : DONE);
  // Shielding (Trench Sweeper): when activated, -2" Move and re-roll any defence dice until its next activation.
  if (tpl(op).shielding && !op.counter) add('shieldingUp', !op.shieldingOn && Object.keys(op.acted).length === 0, op.shieldingOn ? DONE : { zh: '只能在啟動時使用', en: 'Only when activated' });
  if (tpl(op).alight) unique('alight');
  if (tpl(op).auspex) add('auspexScan', !engaged && !count(op, 'auspexScan'), engaged ? ENG : DONE);
  // Guerrilla Warfare (Phobos ploy): change this operative's order.
  if (hasPloy(g, op.side, 'guerrilla') && TEAM_MAP[op.team].omniScrambler) add('guerrilla', !engaged && !count(op, 'guerrilla') && !op.counter, engaged ? ENG : DONE);
  // Boost (Gheistskull): once per battle, not in the first TP — the next Charge this activation moves +4" instead of +2".
  if (tpl(op).boost) add('boost', g.tp > 1 && !op.boostUsed && !count(op, 'charge'), g.tp <= 1 ? { zh: '第 1 回合不能使用', en: 'Not in the first turning point' } : DONE);
  if (tpl(op).knux) add('knuxSmash', engaged && !count(op, 'knuxSmash'), !engaged ? { zh: '控制範圍內沒有敵人', en: 'No enemy in control range' } : DONE);
  if (tpl(op).systemJam) unique('systemJam', !conceal, CONC);
  if (tpl(op).medikit) unique('medikit');
  if (tpl(op).veriscant) unique('veriscant');
  // Universal equipment: grenades (not beasts or machines) and the Ammo Cache.
  if (!tpl(op).actionsOnly && op.side < 2) {
    if (eqLeft(g, op.side, 'stun') || adaptiveOk(g, op, 'stun')) unique('eqStun', !conceal, CONC);
    if (eqLeft(g, op.side, 'smoke') || adaptiveOk(g, op, 'smoke')) unique('eqSmoke');
  }
  // Kasrkin / Legionary unique actions.
  if (tpl(op).battleComms) add('battleComms', !engaged && count(op, 'battleComms') < 2 && TARGET_ACTIONS.battleComms.targets(g, op).length > 0, engaged ? ENG : count(op, 'battleComms') >= 2 ? DONE : NONE);
  if (tpl(op).tacticalCommand) unique('tacticalCommand');
  if (tpl(op).meltaMine) add('meltaMine', !engaged && !op.meltaPlaced && !count(op, 'meltaMine'), engaged ? ENG : DONE);
  if (tpl(op).grisly) add('grislyMark', !engaged && !op.grislyDone, engaged ? ENG : DONE);
  if (tpl(op).unleashDaemon && !op.counter) add('unleashDaemon', !op.unleashed && Object.keys(op.acted).every((k) => ['unseen', 'accelerant', 'free'].includes(k)), op.unleashed ? DONE : { zh: '只能在啟動時使用', en: 'Only when activated' });
  if (ammoTarget(g, op)) add('ammoResupply', !engaged && !count(op, 'ammoResupply'), engaged ? ENG : DONE);
  // Hierotek Circle: Cryptek actions (an Apprentek only one of them per turning point).
  const crypDone = tpl(op).apprentek && op.crypTP === g.tp;
  const CRYP = { zh: '本回合已用過一次技師動作', en: 'Already used a Cryptek action this turning point' };
  if (tpl(op).interstitial) unique('interstitial', !op.counter && !crypDone, op.counter ? { zh: '反擊時不能執行', en: 'Not while counteracting' } : CRYP);
  for (const id of ['canoptekRepair', 'augment', 'reinforce']) if (tpl(op)[id]) unique(id, !crypDone, CRYP);
  if (tpl(op).accelerate) unique('accelerate');
  if (tpl(op).mdVision) add('mdVision', !engaged && !count(op, 'mdVision'), engaged ? ENG : DONE);
  if (tpl(op).reanimate) {
    const why = engaged ? ENG : count(op, 'reanimate') || count(op, 'reanimateSure') ? DONE : { zh: '6" 內沒有看得到的復甦標記', en: 'No Reanimation marker visible within 6"' };
    const ok = !engaged && !count(op, 'reanimate') && !count(op, 'reanimateSure') && reanimTargets(g, op).length > 0;
    add('reanimate', ok, why); add('reanimateSure', ok, why);
  }
  if (tpl(op).apprehend) add('apprehend', engaged && !count(op, 'apprehend'), !engaged ? { zh: '控制範圍內沒有敵人', en: 'No enemy in control range' } : DONE);
  if (tpl(op).support) unique(tpl(op).support, tpl(op).support !== 'getItDun' || !op.counter, { zh: '反擊時不能執行', en: 'Not while counteracting' });
  if (tpl(op).wotNotz) unique('stunGrenade');
  if (tpl(op).dakkaDash) {
    // Dakka Dash: a free Dash and a free Shoot (dakka shoota only), in either order.
    const ok = !engaged && !conceal && !did('dakkaDash', 'dash', 'charge', 'shoot');
    add('dakkaDash', ok, engaged ? ENG : conceal ? CONC : count(op, 'dakkaDash') ? DONE : COMBO);
  }
  if (tpl(op).miasma) unique('miasma');
  if (tpl(op).vitality) unique('vitality');
  if (tpl(op).pechra) unique('pechra');
  if (tpl(op).energise) add('energise', !engaged && !count(op, 'energise'), engaged ? ENG : DONE);
  if (tpl(op).longSight) add('longSight', !engaged && !count(op, 'longSight'), engaged ? ENG : DONE);
  if (tpl(op).stealthAttack) {
    // Stealth Attack: Conceal order, not engaged, within 1" of Light or Heavy terrain.
    const nearTerrain = g.terrain.some((t) => distPointRect(op, t) - radius(op) <= 1);
    const ok = conceal && !engaged && nearTerrain && !did('stealthAttack', 'charge', 'reposition', 'dash', 'fallBack');
    add('stealthAttack', ok, !conceal ? { zh: '需要隱蔽指令', en: 'Needs a Conceal order' } : engaged ? ENG : !nearTerrain ? { zh: '1" 內沒有地形', en: 'No terrain within 1"' } : count(op, 'stealthAttack') ? DONE : COMBO);
  }
  if (tpl(op).flail) {
    // Flail counts as a Fight action (Astartes double Fight, once-per-activation limits).
    const ok = !conceal && attackAllowed(op, 'fight') && flailTargets(g, op).some((t) => t.side !== op.side);
    add('flail', ok, conceal ? CONC : !attackAllowed(op, 'fight') ? DONE : { zh: '2" 內沒有可見的敵人', en: 'No visible enemy within 2"' });
  }
  // Mission actions and Pick Up Marker (player operatives only).
  if (op.side !== NPO && op.homeSide == null && !op.unleashed && op.brutalDisplayTP !== g.tp) { // (Unleash Daemon: no Pick Up or mission actions)
    for (const id of missionActionsFor(g, op.side)) {
      const why = MISSION_ACTIONS[id].cond(g, op);
      add(id, !why && !count(op, id), why || DONE);
    }
    if (carriables(g).some((m) => canPickUpMarker(g, op, m))) {
      const n = pickUpTargets(g, op).length;
      add('pickUp', (!engaged || op.acted.lightFingers) && n > 0 && !count(op, 'pickUp'), engaged ? ENG : count(op, 'pickUp') ? DONE : { zh: '控制範圍內沒有可撿的標記（或已帶滿）', en: 'No marker to pick up in control range (or already carrying)' });
    }
  }
  // Drones can only perform the actions listed on their datacard.
  // Frenzy (Fellgor): no Pick Up, unique or mission actions (Sweeping Blow excepted).
  if (op.frenzy) {
    const core = ['reposition', 'dash', 'charge', 'fallBack', 'shoot', 'fight', 'sweepingBlow'];
    return list.filter((a) => core.includes(a.id));
  }
  const allowed = tpl(op).actionsOnly;
  const nulled = nullRodded(g, op) ? list.filter((a) => !PSYCHIC_ACTIONS.includes(a.id)) : list; // Null Rod (Condemnor)
  return allowed ? nulled.filter((a) => allowed.includes(a.id)) : nulled;
}

/** Enemies this operative can fight: engaged ones, or only the same enemy for Savage Assault's free Fight. */
export function fightTargets(g, op) {
  const only = op.acted?.free?.fight;
  const list = engagedEnemies(g, op);
  if (only === 'swipe') return list.filter((e) => !op.acted.swiped?.includes(e.uid)); // Swipe: each enemy once
  return typeof only === 'string' && only !== 'stealth' && only !== 'any' ? list.filter((e) => e.uid === only) : list;
}

/** Simple instant actions without a target (Energise, Long-sight, Stealth Attack). */
export function doSelfAction(g, op, id) {
  if (id === 'blinkToggle') { op.blinkOn = !op.blinkOn; return; }
  if (id === 'pistolBarrage') { spend(g, op, id); op.acted.barrage = { remaining: 2, used: [] }; return; }
  if (id === 'reanimate' || id === 'reanimateSure') return doReanimate(g, op, id === 'reanimateSure');
  spend(g, op, id);
  const msg = {
    energise: { zh: '充能：加速弓獲得「致命 5+」，直到本回合結束或射擊後', en: 'Energise: the accelerator bow has Lethal 5+ until the end of the TP or until it shoots' },
    longSight: { zh: '遠視：直到下次啟動，獵槍（隱蔽／定點）獲得「致命 5+」，射擊時敵人不能被遮蔽', en: 'Long-sight: until its next activation, the hunting rifle (concealed/stationary) has Lethal 5+ and enemies cannot be obscured' },
    stealthAttack: { zh: '潛行突襲：免費衝鋒（不超過 Move）後免費近戰，第一次打擊時可再追加一次打擊', en: 'Stealth Attack: a free Charge (up to its Move) then a free Fight; its first strike is followed by another' },
    boost: { zh: '加速：這次啟動的下一次衝鋒多移動 4"（而非 2"）', en: 'Boost: its next Charge this activation moves +4" (instead of +2")' },
    auspexScan: { zh: '鳥卜儀掃描：直到下次啟動，友方射擊它 8" 內的敵人時目標不會被遮擋（突襲者再加「搜尋（輕型）」）', en: 'Auspex Scan: until its next activation, enemies within 8" of it can\'t be obscured when friendlies shoot them (Incursors also have Seek Light)' },
    gongKnell: { zh: '鳴鑼：直到下次啟動，被射擊時豁免值改善 1', en: 'Gong Knell: until its next activation, +1 Save when shot' },
    mantle: { zh: '黑暗披風：直到下次啟動，它 3" 內可見、隱蔽且在掩體中的友方無法被選為目標', en: 'Mantle of Darkness: until its next activation, Concealed friendlies in cover visible within 3" of it can\'t be targeted' },
    sweepingBlow: { zh: '橫掃重擊', en: 'Sweeping Blow' },
    shieldingUp: { zh: '舉盾：直到下次啟動，Move -2"，被射擊時可重擲任意防禦骰', en: 'Shielding: until its next activation, -2" Move and it re-rolls any defence dice when shot' },
    actuation: { zh: '褻瀆啟動', en: 'Sacrilegious Actuation' },
    meltaMine: { zh: '放置熱熔地雷，接著可免費衝刺一次（其他特工進入它的控制範圍時受 2D6+3 傷害）', en: 'places the Melta Mine and may Dash for free (any other operative entering its control range takes 2D6+3)' },
    grislyMark: { zh: '血腥標記：3" 內的敵人撿標記與任務動作多花 1AP，爭奪目標時 APL 總和 -1', en: 'Grisly Mark: enemies within 3" pay +1AP for Pick Up and mission actions, and count 1 less total APL for marker control' },
    unleashDaemon: { zh: '釋放惡魔：整場戰鬥中 4 以上的傷害 -1，惡魔爪「無休」＋「致命 5+」，不能撿標記或做任務動作', en: 'Unleash Daemon: for the rest of the battle 4+ damage deals 1 less, its claw has Ceaseless and Lethal 5+, and it can\'t pick up markers or do mission actions' },
    ammoResupply: { zh: '補充彈藥：直到下回合，射擊時可重擲一顆攻擊骰', en: 'Ammo Resupply: until next TP, it re-rolls one attack die when shooting' },
    mdVision: { zh: '多維視覺：直到下次啟動，射擊時敵人不能被遮蔽', en: 'Multi-dimensional Vision: until its next activation, enemies cannot be obscured when it shoots' },
    guerrilla: { zh: `游擊戰：改為${op.order === 'conceal' ? '交戰' : '隱蔽'}指令`, en: `Guerrilla Warfare: switches to ${op.order === 'conceal' ? 'Engage' : 'Conceal'}` },
  }[id];
  if (id === 'auspexScan') (g.auspex ||= [null, null])[op.side] = op.uid;
  if (id === 'shieldingUp') op.shieldingOn = true;
  if (id === 'mdVision') op.optics = true; // same effect as Optics
  if (id === 'meltaMine') { op.meltaPlaced = true; g.markers.push({ id: g.markers.length, kind: 'meltaMine', owner: op.side, exempt: op.uid, x: op.x, y: op.y, carriedBy: null }); op.acted.free = { ...(op.acted.free || {}), dash: true }; }
  if (id === 'grislyMark') { op.grislyDone = true; g.markers.push({ id: g.markers.length, kind: 'grisly', owner: op.side, x: op.x, y: op.y, carriedBy: null }); }
  if (id === 'unleashDaemon') op.unleashed = true;
  if (id === 'ammoResupply') { const m = ammoTarget(g, op); if (m) m.usedTP = g.tp; op.ammoTP = g.tp; }
  if (id === 'gongKnell') op.gongOn = true;
  if (id === 'mantle') (g.mantle ||= [null, null])[op.side] = op.uid;
  if (id === 'sweepingBlow') {
    // Sweeping Blow (Vandal): D3+1 to each other operative visible within 2" (friends too).
    for (const o of g.ops.filter((x) => !x.dead && x !== op && edgeDist(x, op) <= 2 && visibility(g, op, x).visible)) {
      const dmg = d3() + 1;
      log(g, { zh: `${opName(op, 'zh')} 橫掃重擊：${opName(o, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(op, 'en')} Sweeping Blow: ${opName(o, 'en')} takes ${dmg} damage` }, `side${op.side}`);
      applyDamage(g, op, o, dmg);
    }
  }
  if (id === 'actuation') gainBlood(g, op.side, { zh: '褻瀆啟動', en: 'Sacrilegious Actuation' });
  if (id === 'guerrilla') op.order = op.order === 'conceal' ? 'engage' : 'conceal';
  if (id === 'boost') { op.acted.boost = true; op.boostUsed = true; }
  if (id === 'energise') op.energised = g.tp;
  if (id === 'longSight') op.longSightOn = true;
  if (id === 'stealthAttack') op.acted.free = { ...(op.acted.free || {}), charge: 'stealth', fight: 'stealth' };
  log(g, { zh: `${opName(op, 'zh')} ${msg.zh}`, en: `${opName(op, 'en')} ${msg.en}` }, `side${op.side}`);
}

/** Optics (Eliminator Sniper): until its next activation, enemies can't be obscured when it shoots. */
export function doOptics(g, op) {
  spend(g, op, 'optics');
  op.optics = true;
  log(g, { zh: `${opName(op, 'zh')} 使用光學瞄準：敵人無法被遮蔽`, en: `${opName(op, 'en')} uses Optics: enemies cannot be obscured` }, `side${op.side}`);
}

export function spend(g, op, id, ap = actionCost(g, op, id)) {
  corsairSpend(g, op, id, ap);
  op.ap -= ap;
  if (tpl(op).acuteFocus && (ACUTE.includes(id) || MISSION_ACTIONS[id])) op.acted.acuteUsed = true; // Acute Focus used
  if (tpl(op).apprentek && CRYPTEK_ACTIONS.includes(id)) op.crypTP = g.tp; // Apprentek Assistance: one per turning point
  if (tpl(op).vanguard && (id === 'pickUp' || MISSION_ACTIONS[id])) (g.vanguardTP ||= [0, 0])[op.side] = g.tp; // Vanguard used
  op.acted[id] = count(op, id) + 1;
  op.orderSet = true;
}

/** Apply a validated movement path. */
export function doMove(g, op, kind, path) {
  const seenBefore = foes(g, op).filter((t) => visibility(g, op, t).visible).map((t) => t.uid);
  if (kind === 'fallBack' && chainSnare(g, op)) return false;
  if (kind === 'fallBack' && foes(g, op).some((e) => isCorsair(e) && edgeDist(e, op) <= 1) && autoFF(g, 1 - op.side, 'opportunisticFighters')) { for (const e of foes(g, op).filter((x) => isCorsair(x) && edgeDist(x, op) <= 1)) { applyDamage(g, e, op, d3() + d3()); if (op.dead) return false; } }
  if (isCorsair(op)) { op.movedCorsairTP = g.tp; if (kind === 'charge') op.acted.chargeRemaining = Math.max(0, moveAllowance(g, op, kind) - path.len); }
  // Tentacled Grasp (Bloatspawn): falling back from its control range, D6 (+1 if Wounds stat 8 or less), 4+ = held.
  // Daemonic Aura (Legionary Chosen): falling back from its control range, D6 3+ = it can't (AP refunded).
  const aura = kind === 'fallBack' && engagedEnemies(g, op).find((e) => tpl(e).daemonicAura);
  if (aura) {
    const roll = d6();
    log(g, { zh: `${opName(aura, 'zh')} 惡魔光環（擲 ${roll}）：${roll >= 3 ? `${opName(op, 'zh')} 無法撤退` : '沒擋住'}`, en: `${opName(aura, 'en')} Daemonic Aura (rolled ${roll}): ${roll >= 3 ? `${opName(op, 'en')} can't fall back` : 'no hold'}` }, `side${aura.side}`);
    if (roll >= 3) { op.acted.fallBackDenied = true; return false; }
  }
  const grasp = kind === 'fallBack' && engagedEnemies(g, op).find((e) => tpl(e).tentacledGrasp);
  if (grasp) {
    const roll = d6(), total = roll + (tpl(op).wounds <= 8 ? 1 : 0);
    if (total >= 4) {
      spend(g, op, kind);
      log(g, { zh: `${opName(grasp, 'zh')} 觸手擒抱（擲 ${roll}${total > roll ? '+1' : ''}）：${opName(op, 'zh')} 撤退失敗`, en: `${opName(grasp, 'en')} Tentacled Grasp (rolled ${roll}${total > roll ? '+1' : ''}): ${opName(op, 'en')} can't fall back` }, `side${grasp.side}`);
      return false;
    }
    log(g, { zh: `${opName(grasp, 'zh')} 觸手擒抱（擲 ${roll}${total > roll ? '+1' : ''}）：沒抓住`, en: `${opName(grasp, 'en')} Tentacled Grasp (rolled ${roll}${total > roll ? '+1' : ''}): no hold` }, `side${grasp.side}`);
  }
  const end = path.pts[path.pts.length - 1];
  op.x = end.x; op.y = end.y;
  spend(g, op, kind);
  const rec = g.recent?.[op.side];
  const pts = path.pts.map((p) => ({ x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100 }));
  if (rec?.uid === op.uid) rec.trails.push(pts);
  // Every move this turning point stays on the board for the players to review (older ones fade).
  const log_ = (g.trailLog ||= []);
  log_.push({ uid: op.uid, side: op.side, tp: g.tp, kind, len: Math.round(path.len * 10) / 10, pts });
  if (log_.length > 60) log_.shift();
  op.acted.movedDist = (op.acted.movedDist || 0) + path.len; // Lumbering Death
  if (['charge', 'fallBack', 'reposition'].includes(kind)) op.bigMoveTP = g.tp; // Brace for Counterattack
  if (kind === 'charge') op.chargedTP = g.tp; // Emboldened
  op.movedTP = (op.movedTP || 0) + path.len; // NPO movement limit per turning point
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.x = op.x; m.y = op.y; } // carried markers
  checkMines(g, op); // Mines (universal equipment)
  if (kind === 'dash' && op.acted.free?.dash) op.acted.free.dash = false;
  if (kind === 'charge' && op.acted.free?.charge) op.acted.free.charge = null;
  log(g, { zh: `${opName(op, 'zh')} ${ACTIONS[kind].name.zh} ${path.len.toFixed(1)}"`, en: `${opName(op, 'en')} ${ACTIONS[kind].name.en} ${path.len.toFixed(1)}"` }, `side${op.side}`);
  // Markerlights: once per activation, a marked operative that moves loses one token.
  if (op.ml > 0 && !op.acted.mlDrop) {
    op.ml--; op.acted.mlDrop = true;
    log(g, { zh: `${opName(op, 'zh')} 移動，移除 1 個標記光標記（剩 ${op.ml}）`, en: `${opName(op, 'en')} moves and loses a Markerlight token (${op.ml} left)` }, `side${op.side}`);
  }
  // Avalanche of Muscle (Blooded Ogryn): D3 damage to one enemy in control range at the end of a Charge.
  if (kind === 'charge' && tpl(op).avalanche) {
    const e = engagedEnemies(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) {
      const dmg = d3();
      log(g, { zh: `${opName(op, 'zh')} 肌肉雪崩：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(op, 'en')} Avalanche of Muscle: ${opName(e, 'en')} takes ${dmg} damage` }, `side${op.side}`);
      applyDamage(g, op, e, dmg);
    }
  }
  // Spiked Charger (Lumberghast): D3 damage to each enemy in control range at the end of a Charge.
  if (kind === 'charge' && tpl(op).spikedCharger) {
    for (const e of engagedEnemies(g, op)) {
      const dmg = d3();
      log(g, { zh: `${opName(op, 'zh')} 尖刺衝撞：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(op, 'en')} Spiked Charger: ${opName(e, 'en')} takes ${dmg} damage` }, `side${op.side}`);
      applyDamage(g, op, e, dmg);
    }
  }
  if (kind === 'reposition') slicingAttack(g, op, seenBefore, path);
  corsairAfterAction(g, op, true);
  return true;
}

export function opName(op, lang) {
  const t = tpl(op);
  const sameKind = TEAM_MAP[op.team].ops.find((o) => o.id === op.tplId).count > 1;
  const name = lang === 'zh' ? `${t.name.zh}（${t.name.en}）` : t.name.en;
  return name + (sameKind ? ` #${op.num}` : '');
}

// ---------- line of sight ----------
// Visibility is a model check; cover/obscuring use a fan of base targeting lines.
// Current terrain is flat: opaque heavy walls represent blocked head visibility.
export function visibility(g, from, to, opts = {}) {
  const v = flatSight(g.terrain, from, to, radius(from), radius(to), {
    lightObscures: to.order === 'conceal' && to.side < 2 && hasPloy(g, to.side, 'oneWithShadows'), ...opts,
  });
  const smoked = v.visible && edgeDist(from, to) > 2 && !opts.noObscure && g.smoke?.length && (inSmoke(g, to) || inSmoke(g, from));
  if (smoked) {
    v.obscured = true;
    v.defenceOptions = v.defenceOptions.map(o => ({ ...o, obscured: true }));
  }
  return v;
}

export function inRange(op, target, weapon, extra = 0) {
  return weapon.rules.range == null || edgeDist(op, target) <= weapon.rules.range + extra + 0.01;
}

/** Markerlight tokens that count when op shoots target with weapon (Pathfinders only, not the fusion grenade). */
export const mlLevel = (g, op, weapon, target) =>
  (TEAM_MAP[op.team].markerlights && !weapon.rules.noMarkerlight && target ? target.ml || 0 : 0);

// Optics, Multi-dimensional Vision, Long-sight (hunting rifle) and 3+ Markerlight tokens: the target can't be obscured.
const shotVisibility = (g, op, target, weapon, extra = {}) => visibility(g, op, target, {
  noObscure: (op.archonMark?.tp === g.tp && op.archonMark.uid === target.uid) || !!op.optics || !!tpl(op).multiVision || mlLevel(g, op, weapon, target) >= 3
    || (!!op.longSightOn && weapon.group === 'huntingRifle') || spotOn(g, op, target)
    || !!tpl(op).incursor || auspexOn(g, op, target) || !!tpl(op).incorporealSight || !!weapon.rules.hypersense, ...extra, // Multi-spectrum Array, Auspex Scan, Incorporeal Sight
});

/** Is target a valid target for op with this weapon (visible, and not a Concealed operative in cover)? */
function validTarget(g, op, target, weapon) {
  const v = shotVisibility(g, op, target, weapon);
  if (!v.visible) return null;
  if (target.order === 'conceal') {
    const ml = mlLevel(g, op, weapon, target);
    const seek = weapon.rules.seek || ml >= 5 || (tpl(op).deathmark && !!target.dmk?.[op.side]); // Deathmarked
    const seekLight = weapon.rules.seekLight || ml >= 4 || (weapon.type === 'ranged' && (pechraNear(g, op.side, target) || spotOn(g, op, target)
      || (tpl(op).incursor && auspexOn(g, op, target))));
    // Nightmare Hulks (Gellerpox) can't use Light terrain for cover when targets are picked.
    const vt = seek ? shotVisibility(g, op, target, weapon, { ignoreAll: true })
      : seekLight || tpl(target).hulk || tpl(target).brute ? shotVisibility(g, op, target, weapon, { ignoreLight: true }) : v;
    // Small (Borewyrm): Concealed in cover it can't be targeted, whatever else applies.
    // Mantle of Darkness (Fellgor Shaman): within 3" of it and in cover — can't be targeted, whatever else applies.
    const sh = g.mantle?.[target.side] && getOp(g, g.mantle[target.side]);
    const mantled = sh && !sh.dead && edgeDist(sh, target) <= 3 && visibility(g, sh, target).visible;
    // Guilt Reveals Itself (Exaction Squad ploy): within 4" it can't be in cover for picking targets.
    const guilt = TEAM_MAP[op.team].ruthless && hasPloy(g, op.side, 'guiltReveals') && edgeDist(op, target) <= 4;
    if ((vt.cover && !guilt) || ((tpl(target).small || mantled) && v.cover)) return null;
  }
  return v;
}

/** Can op shoot target with weapon? Returns {ok, cover, obscured} */
export function shootCheck(g, op, target, weapon, secondary = false) {
  // Detonate (Void-jammer): the friendly Gheistskull is always the primary target — no cover, not obscured.
  if (weapon.rules.detonate) {
    const ok = !target.dead && target.side === op.side && !!tpl(target).gheistskull && shootWeapon(g, op, weapon).ok && !isEngaged(g, op);
    return ok ? { ok: true, cover: false, obscured: false } : { ok: false };
  }
  if (tpl(op).quickTrigger && isEngaged(g, op) && !inEngagement(op, target)) return { ok: false };
  if (target.dead || target.side === op.side) return { ok: false };
  if (weapon.rules.psychic && tpl(target).nullRodAura) return { ok: false }; // Null Rod: PSYCHIC weapons can't harm it
  if (!shootWeapon(g, op, weapon).ok) return { ok: false };
  // Magnify (Hierotek Circle): valid target, cover and obscured from another Cryptek / Apprentek.
  const relay = magnifyRelay(g, op, target, weapon);
  const v = validTarget(g, relay || op, target, weapon);
  if (!v) return { ok: false };
  // Ruthless Efficiency (Exaction Squad): friendlies in the enemy's control range don't stop it being picked.
  // Supporting Fire (Pathfinders firefight ploy): the same within 6".
  const support = ffOn(g, op, 'supportingFire') && edgeDist(op, target) <= 6;
  if (!TEAM_MAP[op.team].ruthless && !tpl(op).quickTrigger && !support && living(g, op.side).some((f) => inEngagement(f, target))) return { ok: false };
  // Long Arm of the Emperor's Law (Exaction firefight ploy): Range +3".
  if (!inRange(op, target, weapon, ffOn(g, op, 'longArm') ? 3 : 0)) return { ok: false };
  // Markerlights: after a Markerlight this activation, Shoot must pick that same target.
  if (!secondary && op.acted?.mlTarget && op.acted.mlTarget !== target.uid) return { ok: false };
  return { ok: true, cover: v.cover, obscured: v.obscured, defenceOptions: v.defenceOptions, relay: relay?.uid ?? null };
}

// ---------- dice ----------
export function effectiveRules(g, op, weapon, target) {
  const r = { ...weapon.rules };
  if (weapon.type === 'melee') {
    if (hasPloy(g, op.side, 'docAssault')) r.balanced = true;
    if (hasPloy(g, op.side, 'waaagh')) r.balanced = true;
    if (hasTactic(g, op, 'aggressive')) r.rending = true;
  } else {
    if (hasPloy(g, op.side, 'dakkaDakka')) r.punishing = true;
    if (target && hasPloy(g, op.side, edgeDist(op, target) > 6 ? 'docDevastator' : 'docTactical')) r.balanced = true;
    const ml = mlLevel(g, op, weapon, target);
    if (ml >= 1) { r.saturate = true; r.balanced = true; }
    if (ml >= 2) r.mlHit = true; // Hit improved by 1, to a maximum of 3+
    if (ml >= 4) r.seekLight = true;
    if (ml >= 5) r.seek = true;
    // Bonded: a non-drone within 3" of another friendly non-drone has Accurate 1.
    if (hasPloy(g, op.side, 'bonded') && !isDrone(op) && living(g, op.side).some((o) => o !== op && !isDrone(o) && edgeDist(op, o) <= 3)) {
      r.accurate = Math.max(r.accurate || 0, 1);
    }
    if (hasTactic(g, op, 'siege')) r.saturate = true;
    if (hasTactic(g, op, 'sharpshooter') && isBoltWeapon(weapon) && !MOVE_ACTIONS.some((k) => count(op, k))) {
      r.accurate = Math.max(r.accurate || 0, 1); r.severe = true;
    }
  }
  // Lumbering Death: retaliating, or shooting/fighting after moving no more than 3" this activation.
  if (hasPloy(g, op.side, 'lumbering') && (g.active !== op.uid || (op.acted?.movedDist || 0) <= 3)) r.ceaseless = true;
  // ---- Farstalker Kinband ----
  // Call the Kill (Balanced) / Bring it Down! (Death Korps: Punishing) against the marked enemy.
  if (target && g.mark?.[op.side] === target.uid) { if (TEAM_MAP[op.team].bringItDown) r.punishing = true; else r.balanced = true; }
  // ---- Death Korps ----
  const order = guardOrder(g, op);
  if (order === 'takeAim' && weapon.type === 'ranged' && !weapon.rules.noOrders) r.ceaseless = true;
  if (order === 'fixBayonets' && weapon.type === 'melee') r.ceaseless = true;
  // Uplifting Primer: within 3" of the Zealot, weapons have Severe.
  if (living(g, op.side).some((z) => tpl(z).uplifting && sameTeam(z, op) && edgeDist(z, op) <= 3)) r.severe = true;
  if (weapon.type === 'ranged' && hasPloy(g, op.side, 'siegeWarfare')) { r.saturate = true; r.accurate = Math.max(r.accurate || 0, 1); }
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'clearTheLine')) {
    r.accurate = Math.max(r.accurate || 0, 1);
    if (g.active !== op.uid || whollyInOwnTerritory(g, op)) r.severe = true; // retaliating, or wholly in your territory
  }
  if (weapon.type === 'ranged' && spotOn(g, op, target)) r.seekLight = true; // Spot
  // ---- Fellgor Ravagers ----
  if (weapon.rules.viciousBlows && g.active === op.uid) r.ceaseless = true; // Vicious Blows (fighting, not retaliating)
  if (weapon.type === 'ranged' && target && TEAM_MAP[op.team].frenzy && hasPloy(g, op.side, 'peltingFire') && target.shotBy?.tp === g.tp) {
    const others = new Set(target.shotBy.uids.filter((u) => u !== op.uid && getOp(g, u)?.side === op.side)).size;
    if (others >= 2) r.relentless = true; else if (others === 1) r.ceaseless = true; // Pelting Firepower
  }
  // ---- Blooded ----
  if (op.bloodToken) { r.accurate = Math.max(r.accurate || 0, 1); if (underGaze(g, op)) r.gaze = true; } // Blooded token / Gaze of the Gods
  else if (tpl(op).leadWithStrength && underGaze(g, op)) r.gaze = true;
  if (TEAM_MAP[op.team].bloodedTokens && hasPloy(g, op.side, 'recklessAspirant') && whollyIn(g, op, 1 - op.side)) {
    if (op.bloodToken) r.punishing = true; else r.accurate = Math.max(r.accurate || 0, 1);
  }
  const gk = g.gloryKill?.[op.side];
  if (target && gk?.tp === g.tp && gk.uid === target.uid) { if (op.bloodToken) r.relentless = true; else r.ceaseless = true; } // Glory Kill
  if (weapon.type === 'melee' && op.stimms?.enraged) r.relentless = true; // Enraged stimm
  if (weapon.rules.stalk && g.terrain.some((t) => distPointRect(op, t) - radius(op) <= CONTROL)) r.lethal = Math.min(r.lethal || 6, 5); // Stalk
  // ---- Wyrmblade ----
  if (TEAM_MAP[op.team].cultAmbush && g.active === op.uid) {
    const sprung = op.prevOrder === 'conceal' && op.order === 'engage'; // Conceal → Engage at the start of the activation
    if (sprung || op.acted?.unseen) r.ceaseless = true; // Cult Ambush
    if (sprung && hasPloy(g, op.side, 'dayAtHand')) { if (weapon.type === 'ranged') r.rending = true; else r.atkPlus = 1; } // The Day Is at Hand
  }
  if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'crossfire') && target.shotBy?.tp === g.tp && target.shotBy.uids.some((u) => u !== op.uid && getOp(g, u)?.side === op.side)) r.accurate = Math.max(r.accurate || 0, 1); // Crossfire
  if (tpl(op).bipod && weapon.type === 'ranged' && (op.counter || !op.acted?.movedDist)) { if (r.ceaseless) r.relentless = true; else r.ceaseless = true; } // Heavy Weapon Bipod
  if (tpl(op).neophyte && living(g, op.side).some((k) => tpl(k).heroic && k.killTP === g.tp && edgeDist(k, op) <= 3 && visibility(g, k, op).visible)) r.severe = true; // Heroic Inspiration
  // ---- Warpcoven ----
  if (weapon.type === 'ranged' && tpl(op).incorporealSight) r.saturate = true; // Incorporeal Sight
  if (weapon.type === 'ranged' && tpl(op).slowPurposeful && (op.counter || !['charge', 'reposition'].some((k) => count(op, k)))) r.ceaseless = true; // Slow and Purposeful
  if (target && psyOn(g, 'alight', op.side, target) && TEAM_MAP[op.team].anyAstartesShot) r.ceaseless = true; // Alight
  if (target && psyOn(g, 'ravage', 1 - op.side, op)) r.reroll6 = true; // Ravage Destiny: must re-roll attack dice results of 6
  if (target && hasPloy(g, target.side, 'aetherialWarding') && r.piercing === 1) { delete r.piercing; r.piercingCrits = Math.max(r.piercingCrits || 0, 1); }
  if (weapon.type === 'melee' && tpl(op).tzaangor && hasPloy(g, op.side, 'savageHerd')) {
    r.accurate = Math.max(r.accurate || 0, 1);
    const assisted = target && living(g, op.side).some((f) => f !== op && edgeDist(f, target) <= CONTROL + 0.01);
    if (assisted || living(g, op.side).some((s) => tpl(s).sorcerer && edgeDist(s, op) <= 6 && visibility(g, s, op).visible)) r.severe = true;
  }
  if (weapon.rules.psychic && tpl(op).sorcerer && hasPloy(g, op.side, 'brotherhood')) { if (sorcererNear(g, op, 9)) r.ceaseless = true; else r.balanced = true; }
  // ---- Phobos Strike Team ----
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'lethalAssaults')) { r.balanced = true; if (count(op, 'charge')) r.lethal = Math.min(r.lethal || 6, 5); }
  if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'deadlyShots')
    && (!['charge', 'fallBack', 'reposition'].some((k) => count(op, k)) || (edgeDist(op, target) > 6 && !shotVisibility(g, op, target, weapon).cover))) r.balanced = true;
  if (weapon.type === 'ranged' && tpl(op).incursor && auspexOn(g, op, target)) r.seekLight = true; // Auspex Scan
  // ---- Imperial Navy Breachers ----
  if (navyOrderNear(g, op, 'attack')) r.ceaseless = true; // Attack Order
  if (target && hasPloy(g, op.side, 'closeAssault') && edgeDist(op, target) <= 3) r.closeAssault = true; // Close Assault
  // ---- Hearthkyn Salvagers ----
  if (target && TEAM_MAP[op.team].grudges && target.grudge?.[op.side]) r.grudge = target.grudge[op.side]; // Grudge tokens
  if (weapon.rules.forceImpact && count(op, 'charge')) r.brutal = true; // Force Impact
  if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'proximateFire') && edgeDist(op, target) <= 6) r.mlHit = true; // Hit +1 to 3+
  const tac = g.tactician?.[op.side];
  if (target && tac?.tp === g.tp && tac.kind === 'attack' && dist(tac, target) - radius(target) <= 3) r.balanced = true; // Attack marker
  const pan = g.pan?.[op.side];
  if (weapon.type === 'ranged' && target && pan && dist(pan, target) - radius(target) <= 3) { r.accurate = Math.max(r.accurate || 0, 1); r.saturate = true; } // Pan Spectral Scan
  if (op.shriek) r.balanced = true; // Victory Shriek
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'cutThroats')) r.atkPlus = 1;
  if (weapon.type === 'ranged' && hasPloy(g, op.side, 'prey') && !['charge', 'fallBack', 'reposition'].some((k) => count(op, k))) {
    if (r.balanced) r.ceaseless = true; else r.balanced = true;
    r.severe = true;
  }
  if (weapon.group === 'bow' && op.energised === g.tp) r.lethal = Math.min(r.lethal || 6, 5); // Energise
  if (op.longSightOn && (weapon.id === 'huntingConcealed' || weapon.id === 'huntingStationary')) r.lethal = Math.min(r.lethal || 6, 5);
  // ---- Exaction Squad ----
  if (op.optics && (weapon.id === 'execConcealed' || weapon.id === 'execStationary')) r.lethal = Math.min(r.lethal || 6, 5); // Optics (Marksman)
  if (veriscantOn(g, op, target)) { r.lethal = Math.min(r.lethal || 6, 5); r.severe = true; } // Veriscant
  if (TEAM_MAP[op.team].ruthless) {
    // Dispense Justice: fighting without having moved more than its Move this activation, or retaliating / counteracting.
    if (weapon.type === 'melee' && hasPloy(g, op.side, 'dispenseJustice') && (g.active !== op.uid || op.counter || (op.acted?.movedDist || 0) <= moveStat(g, op))) r.ceaseless = true;
    if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'terminalDecree') && edgeDist(op, target) <= 6) r.balanced = true; // Terminal Decree
  }
  if (tpl(op).aggressivePattern && weapon.type === 'melee') r.relentless = true; // Attack Pattern: Aggressive
  // ---- Novitiates ----
  if (weapon.rules.antiPsyker && target && isPsyker(target)) { r.lethal = Math.min(r.lethal || 6, 5); r.antiPsykerOn = true; } // Anti-PSYKER (+1 Dmg too)
  if (target && TEAM_MAP[op.team].actsOfFaith && hasPloy(g, op.side, 'ardentVengeance') && !target.ready) r.punishing = true; // Ardent Vengeance
  if (hymnal(g, op)) r.severe = true; // Glorious Hymnal
  if (weapon.rules.zealousRage && g.active === op.uid) r.ceaseless = true; // Zealous Rage (fighting, not retaliating)
  if (weapon.type === 'ranged' && target && ffOn(g, op, 'guidedByFaith') && edgeDist(op, target) <= 6) r.seekLight = true; // Guided by Faith
  if (broadcastNear(g, op)) { delete r.balanced; delete r.ceaseless; delete r.relentless; } // Auto-broadcaster: no attack re-rolls
  // ---- Kasrkin ----
  if (weapon.type === 'ranged' && skillOn(g, op, 'lightEmUp')) r.severe = true; // Light 'Em Up
  if (weapon.type === 'melee' && skillOn(g, op, 'forCadia')) { r.atkPlus = 1; r.atkMax = 4; } // For Cadia!
  if (weapon.type === 'ranged' && sweepOn(g, op, target)) r.ceaseless = true; // Clearance Sweep
  if (TEAM_MAP[op.team].skillAtArms && target && /hot-shot/i.test(weapon.name.en) && (hasPloy(g, op.side, 'eliminationPattern') || ffOn(g, op, 'neutraliseTarget'))) {
    const exposed = auspexOn(g, op, target) || !shotVisibility(g, op, target, weapon).cover || r.saturate;
    if (exposed && hasPloy(g, op.side, 'eliminationPattern')) { if (/volley/i.test(weapon.name.en)) r.piercing = Math.max(r.piercing || 0, 1); else r.piercingCrits = Math.max(r.piercingCrits || 0, 1); } // Elimination Pattern
  }
  if (ffOn(g, op, 'neutraliseTarget')) r.relentless = true; // Neutralise Target: re-roll any attack dice
  // ---- Legionaries ----
  const mk = markOf(op);
  if ((mk === 'khorne' && weapon.type === 'melee') || (mk === 'tzeentch' && weapon.type === 'ranged')) r.severe = true; // Wrathful Onslaught / Empyreal Guidance
  if (mk === 'undivided' && target && edgeDist(op, target) <= 6) r.ceaseless = true; // Vicious Reavers
  if (op.unleashed && weapon.id === 'daemonicClaw') { r.ceaseless = true; r.lethal = Math.min(r.lethal || 6, 5); } // Unleash Daemon
  if (weapon.type === 'ranged' && target && TEAM_MAP[op.team].marksOfChaos && hasPloy(g, op.side, 'fickleFates') && target.ready) { if (r.balanced) r.relentless = true; else r.balanced = true; } // Fickle Fates
  if (weapon.type === 'ranged' && target && ffOn(g, op, 'malignantAura') && edgeDist(op, target) <= 3) r.piercing = Math.max(r.piercing || 0, 1); // Malignant Aura
  if (target && TEAM_MAP[target.team]?.marksOfChaos && hasPloy(g, target.side, 'implacable') && r.piercing === 1) { delete r.piercing; r.piercingCrits = Math.max(r.piercingCrits || 0, 1); } // Implacable
  // ---- Universal equipment ----
  if (weapon.type === 'ranged' && op.ammoTP === g.tp && !weapon.rules.equipGrenade) r.balanced = true; // Ammo Cache: re-roll one attack die
  if (target && g.smoke?.length && inSmoke(g, target) && edgeDist(op, target) > 2) { if (r.piercing === 2) r.piercing = 1; if (r.piercingCrits === 2) r.piercingCrits = 1; } // smoke
  // ---- Firefight ploys ----
  if (ffOn(g, op, 'combinedArms') || ffOn(g, op, 'engageToAcquire')) r.relentless = true; // re-roll any attack dice
  if (ffOn(g, op, 'shockAssault') && weapon.type === 'melee') r.shock = true;
  if (ffOn(g, op, 'blitz')) { r.accurate = Math.max(r.accurate || 0, 1); if ((g.actCount?.[op.side] || 0) <= 1) r.severe = true; }
  if (ffOn(g, op, 'coiledSerpent')) r.promote = 1;
  if (weapon.type === 'ranged' && op.omniTP === g.tp && doctrina(g, op)?.mode === 'protector') r.severe = true; // Omnissiah's Imperative
  if (target && g.vengeance?.[op.side] === target.uid) r.relentless = true; // Vengeance for the Kinband
  // ---- Hunter Clade ----
  if ((weapon.type === 'ranged' && optimised(g, op, 'protector')) || (weapon.type === 'melee' && optimised(g, op, 'conqueror'))) r.ceaseless = true; // Doctrina Imperatives
  // Targeting Protocol (Rangers): Lethal 5+ if it hasn't moved this activation, or counteracting.
  if (tpl(op).targetingProtocol && weapon.type === 'ranged' && (op.counter || g.active !== op.uid || !moved(op))) r.lethal = Math.min(r.lethal || 6, 5);
  // ---- Hierotek Circle ----
  if (weapon.rules.magnify && g.magnifyNow === op.uid) r.ceaseless = true; // Magnify
  if (weapon.type === 'ranged' && target && tpl(op).deathmark && target.dmk?.[op.side]) r.seek = true; // Deathmarked
  const aug = g.augment?.[op.side];
  if (aug && aug.t === op.uid && aug.w === weapon.id) for (const k of aug.rules) { if (k === 'lethal') r.lethal = Math.min(r.lethal || 6, 5); else r[k] = true; } // Augment Weapon
  if (isHierotek(op)) {
    if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'relentlessOnslaught') && edgeDist(op, target) <= 8) r.balanced = true; // Relentless Onslaught
    if (weapon.type === 'melee' && hasPloy(g, op.side, 'methodicalElim')) { // Methodical Elimination
      const still = g.active !== op.uid || op.counter || (op.acted?.movedDist || 0) <= moveStat(g, op);
      r.accurate = Math.max(r.accurate || 0, still ? 2 : 1);
    }
  }
  if (tpl(op).coldBlooded && target && target.wounds < target.maxW) {
    // Cold-blooded: against a wounded enemy Lethal 5+; injured as well: also Rending.
    r.lethal = Math.min(r.lethal || 6, 5);
    if (isInjured(target)) r.rending = true;
  }
  if (weapon.type === 'ranged' && pechraNear(g, op.side, target)) r.seekLight = true; // Marked for the Hunt
  archonRules(g, op, weapon, target, r);
  corsairRules(g, op, weapon, target, r);
  // Sickening Emissions (Decaying Generatorium): no re-rolls for a player operative near an objective marker.
  // Voxbreak (Phobos): no re-rolls within 6" of the Voxbreaker.
  if ((mission(g).noRerollNearObjective && op.side !== NPO && g.objectives.some((o) => inMarkerRange(op, o))) || voxbroken(g, op) || neurostatic(g, op)) { // (Neurostatic Interference: Hunter Clade)
    delete r.balanced; delete r.ceaseless; delete r.relentless;
  }
  return r;
}

// ---------- Gellerpox Infected ----------
/**
 * Is this operative within the infection range of an enemy Gellerpox Techno-curse? Barrelwarp: 2" (3" of a
 * Glitchling); Viral Vox-static: 3" (4" of a Glitchling); Screaming Rustspikes: control range.
 */
export function cursed(g, op, curse) {
  const [r, rg] = { barrelwarp: [2, 3], voxStatic: [3, 4], rustspikes: [CONTROL, CONTROL] }[curse];
  return [0, 1].some((s) => s !== op.side && TEAM_MAP[g.teams[s]].tacticSlots === 1 && g.tactics?.[s]?.[0] === curse
    && living(g, s).some((o) => edgeDist(o, op) <= (tpl(o).glitchling ? rg : r) + 0.01));
}

/** Horrifying Shrieking (Fleshscreamer) / Terror (Phobos Reivers): an enemy within 3" of one. */
const shrieked = (g, op) => foes(g, op).some((o) => (tpl(o).shrieking || tpl(o).terror) && edgeDist(o, op) <= 3);

/** Blessings of Infection (fight dice): 3+ fails → one becomes a normal success; else 3+ successes → discard a fail, a normal becomes a crit. */
function blessings(pool) {
  const fails = pool.dice.filter((d) => d.res === 'miss');
  if (fails.length >= 3) { fails[0].res = 'norm'; fails[0].indo = true; pool.norms++; return; }
  const norm = pool.dice.find((d) => d.res === 'norm');
  if (pool.crits + pool.norms >= 3 && fails.length && norm) { norm.res = 'crit'; norm.rend = true; pool.norms--; pool.crits++; }
}

// ---------- Blooded ----------
const isBloodedTeam = (g, side) => side < 2 && !!TEAM_MAP[g.teams[side]]?.bloodedTokens;
function gainBlood(g, side, why) {
  if (!isBloodedTeam(g, side)) return;
  (g.bloodPool ||= [0, 0])[side]++;
  log(g, { zh: `${teamZh(g, side)} 獲得血祭標記（${why.zh}；未分配 ${g.bloodPool[side]}）`, en: `${team(g, side).name.en} gains a Blooded token (${why.en}; ${g.bloodPool[side]} unassigned)` }, `side${side}`);
}
/** STRATEGIC GAMBIT: give an unassigned Blooded token to a friendly operative (one each). */
export function assignBlood(g, side, op) {
  if (!op || op.dead || op.side !== side || op.bloodToken || !(g.bloodPool?.[side] > 0)) return false;
  g.bloodPool[side]--; op.bloodToken = true;
  log(g, { zh: `${opName(op, 'zh')} 獲得血祭標記`, en: `${opName(op, 'en')} takes a Blooded token` }, `side${side}`);
  return true;
}
/** With four or more token holders, one of them is under the Gaze of the Gods for the turning point. */
export function setGaze(g, side, op) {
  const holders = living(g, side).filter((o) => o.bloodToken);
  if (!op || holders.length < 4 || !holders.includes(op)) return false;
  (g.gaze ||= [null, null])[side] = { uid: op.uid, tp: g.tp };
  log(g, { zh: `${opName(op, 'zh')} 受到諸神注視`, en: `${opName(op, 'en')} is under the Gaze of the Gods` }, `side${side}`);
  return true;
}
/** Under the Gaze of the Gods: picked this TP, or the Chieftain's Lead With Strength. */
const underGaze = (g, op) => (g.gaze?.[op.side]?.tp === g.tp && g.gaze[op.side].uid === op.uid)
  || (tpl(op).leadWithStrength && (op.bloodToken || whollyIn(g, op, 1 - op.side)));
/** The operative's base is wholly within that side's territory. */
function whollyIn(g, op, side) {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(op);
  return [-r, r].every((d) => territoryOf(g, { ...op, [along]: op[along] + d }) === side);
}
/** Gruelling Disciplinarian (Enforcer): friendlies within 6" ignore the stat changes from being injured. */
const disciplined = (g, op) => op.side < 2 && living(g, op.side).some((e) => tpl(e).disciplinarian && edgeDist(e, op) <= 6);
/** Glory Kill (ploy): the enemy picked for this turning point. */
export function setGloryKill(g, side, enemy) {
  if (!enemy || !g.ploys[side].includes('gloryKill')) return;
  (g.gloryKill ||= [null, null])[side] = { uid: enemy.uid, tp: g.tp };
  log(g, { zh: `榮耀擊殺目標：${opName(enemy, 'zh')}`, en: `Glory Kill target: ${opName(enemy, 'en')}` }, `side${side}`);
}

/** Blooded tokens gained from deaths, Explosive Demise and Bitter Demise. */
function bloodedOnDeath(g, dead) {
  dead.hadToken = !!dead.bloodToken;
  gains: {
    const t = (g.bloodTP ||= [{}, {}]);
    for (const s of [0, 1]) if (t[s].tp !== g.tp) t[s] = { tp: g.tp };
    // The first enemy incapacitated each TP.
    const foe = 1 - dead.side;
    if (dead.side < 2 && isBloodedTeam(g, foe) && !t[foe].enemy) { t[foe].enemy = true; gainBlood(g, foe, { zh: '本回合第一次擊倒敵人', en: 'first enemy down this TP' }); }
    if (!isBloodedTeam(g, dead.side)) break gains;
    dead.bloodToken = false;
    // The first friendly incapacitated within 6" of an enemy each TP.
    if (!t[dead.side].friend && foes(g, dead).some((e) => edgeDist(e, dead) <= 6)) { t[dead.side].friend = true; gainBlood(g, dead.side, { zh: '本回合第一次友方在敵人附近倒下', en: 'first friendly down near the enemy this TP' }); }
  }
  // Explosive Demise (Brimstone Grenadier): 2D6 (1 if engaged), any 4+ → D3+2 (D6+2 with the bomb unused) to each visible operative within 2".
  if (tpl(dead).explosiveDemise) {
    const rolls = isEngaged(g, dead) ? [d6()] : [d6(), d6()];
    if (rolls.some((r) => r >= 4)) {
      const unused = !(dead.used?.diabolykBomb);
      const near = g.ops.filter((o) => !o.dead && o !== dead && edgeDist(o, dead) <= 2 && visibility(g, dead, o).visible);
      log(g, { zh: `${opName(dead, 'zh')} 爆炸死亡（擲 ${rolls.join('、')}）：2" 內 ${near.length} 名特工受傷`, en: `${opName(dead, 'en')} Explosive Demise (rolled ${rolls.join(', ')}): ${near.length} operative(s) within 2" are hit` }, `side${dead.side}`);
      for (const o of near) applyDamage(g, dead, o, (unused ? d6() : d3()) + 2);
    }
  }
  // Bitter Demise (Blooded ploy): D3 — on a 3 (2+ with a token), that much damage to a visible enemy within 2".
  if (hasPloy(g, dead.side, 'bitterDemise') && isBloodedTeam(g, dead.side)) {
    const r = d3(), e = foes(g, dead).filter((o) => edgeDist(o, dead) <= 2 && visibility(g, dead, o).visible).sort((a, b) => a.wounds - b.wounds)[0];
    if (e && r >= (dead.hadToken ? 2 : 3)) {
      log(g, { zh: `${opName(dead, 'zh')} 苦澀的死亡（擲 ${r}）：${opName(e, 'zh')} 受到 ${r} 傷害`, en: `${opName(dead, 'en')} Bitter Demise (rolled ${r}): ${opName(e, 'en')} takes ${r} damage` }, `side${dead.side}`);
      applyDamage(g, dead, e, r);
    }
  }
}

/** Stimms (Corpseman): Rejuvenated (heal 2D3), Enraged (melee Relentless), Fortified (Dmg 3+ deals 1 less on a 5+). */
function giveStimm(g, op, kind) {
  (op.stimms ||= {})[kind] = true;
  if (kind === 'rejuvenated') op.wounds = Math.min(op.maxW, op.wounds + d3() + d3());
}

// ---------- Warpcoven ----------
/** A psychic effect (Protected by Fate, Ravage Destiny, Alight) one side has on an operative: {by, uid}. */
const psy = (g, key, side) => g[key]?.[side] || null;
const psyOn = (g, key, side, op) => { const p = psy(g, key, side); return !!(p && op && p.uid === op.uid && !getOp(g, p.by)?.dead); };
/** Mindburn: the target's weapons' Hit is worsened by 1 (not cumulative with injured). */
const mindburned = (g, op) => [0, 1].some((s) => s !== op.side && g.mindburn?.[s] === op.uid);
// Apprehend (Cyber-mastiff) worsens it the same way. Engendered Focus (Castigator) ignores it all;
// Stubborn Subjugator (Subductor) ignores it for melee weapons.
const hitWorse = (g, op, w = null) => !tpl(op).engenderedFocus && !(w?.type === 'melee' && tpl(op).stubbornSubjugator)
  && ((statPenalty(g, op) && !(op.acted?.ancestors && injuredPenalty(g, op) && !contagion(g, op))) || mindburned(g, op) || apprehended(g, op) || radSaturated(g, op) || doctrinaHit(g, op, w));

// ---------- Exaction Squad ----------
/** Nuncio-aquila: an enemy within 3" of the Proctor-exactant (it carries the marker in this version). */
const nuncioNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((p) => tpl(p).nuncio && edgeDist(p, op) <= 3);
/** Scrapcode Overload (Hunter Clade firefight ploy): an enemy within 3" of that Infiltrator (marker control only). */
const scrapNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((p) => g.scrapcode?.[p.side] === p.uid && edgeDist(p, op) <= 3);
/** Apprehend: the Cyber-mastiff holds this enemy while it stays within its control range. */
const apprehended = (g, op) => op.side < 2 && living(g, 1 - op.side).some((m) => m.apprehend === op.uid && edgeDist(m, op) <= CONTROL + 0.01);
/** Apprehend / Castigator's Arrest (the only enemy in the Castigator's control range): can't Fall Back. */
export const arrested = (g, op) => apprehended(g, op)
  || (op.side < 2 && living(g, 1 - op.side).some((c) => tpl(c).arrest && edgeDist(c, op) <= CONTROL + 0.01 && engagedEnemies(g, c).length === 1));
/** Veriscant: friendly weapons have Lethal 5+ and Severe against this enemy until the Malocator's next activation. */
// ---------- Hierotek Circle ----------
const isHierotek = (op) => !!TEAM_MAP[op.team].reanimation;
/** Living Metal: in the Ready step, each friendly regains up to D3+1 wounds. */
function livingMetal(g, side) {
  if (!TEAM_MAP[g.teams[side]].livingMetal) return;
  for (const o of living(g, side).filter((x) => isHierotek(x) && x.wounds < x.maxW)) {
    const before = o.wounds;
    o.wounds = Math.min(o.maxW, o.wounds + d3() + 1);
    log(g, { zh: `${opName(o, 'zh')} 活體金屬：回復 ${o.wounds - before} 生命`, en: `${opName(o, 'en')} Living Metal: regains ${o.wounds - before} wounds` }, `side${side}`);
  }
}
/** Reanimation markers of a side whose operative can still come back. */
export const reanimMarkers = (g, side) => (g.reanim || []).filter((m) => m.side === side && getOp(g, m.uid)?.dead);
/** A place within 3" of the marker, not within control range of enemies (null if there's none). */
function reanimSpot(g, op, m) {
  const r = radius(op);
  for (const d of [0, 0.8, 1.6, 2.4, 3]) {
    for (let i = 0; i < (d ? 12 : 1); i++) {
      const p = { x: m.x + Math.cos(i * Math.PI / 6) * d, y: m.y + Math.sin(i * Math.PI / 6) * d };
      if (p.x - r < 0 || p.y - r < 0 || p.x + r > BOARD.w || p.y + r > BOARD.h) continue;
      if (g.terrain.some((t) => distPointRect(p, t) < r)) continue;
      if (g.ops.some((o) => o !== op && !o.dead && o.x > -50 && dist(o, p) < radius(o) + r + 0.05)) continue;
      if (foes(g, op).some((e) => dist(e, p) - radius(e) - r <= CONTROL)) continue;
      return p;
    }
  }
  return null;
}
/** REANIMATED: back with 1 wound; the opponent's kill (if it counted) is taken back. */
function reanimate(g, m, ready) {
  const op = getOp(g, m.uid);
  const p = reanimSpot(g, op, m);
  if (!p) return false;
  Object.assign(op, { dead: false, wounds: 1, x: p.x, y: p.y, ready, order: 'conceal', poison: false, aplNext: 0, aplKeep: false, ml: 0, jam: false, grudge: {}, dmk: null, acted: {}, ap: 0, bloodToken: false, stimms: null });
  g.reanim = g.reanim.filter((x) => x !== m);
  if (op.killCounted) { op.killCounted = false; g.kills[1 - op.side] = Math.max(0, g.kills[1 - op.side] - 1); }
  log(g, { zh: `✦ ${opName(op, 'zh')} 復甦！以 1 生命回到場上（對手擊殺數 -1）`, en: `✦ ${opName(op, 'en')} is REANIMATED with 1 wound (the opponent loses a kill)` }, `side${op.side}`);
  return true;
}
/** Reanimation Protocols in the Ready step: try markers (toughest operative first) until one rolls a 3+. */
function readyReanimation(g, side) {
  const ms = reanimMarkers(g, side).sort((a, b) => getOp(g, b.uid).maxW - getOp(g, a.uid).maxW);
  for (const m of ms) {
    const r = d6();
    const ok = r >= 3 && reanimate(g, m, true);
    if (!ok) log(g, { zh: `${teamZh(g, side)} 復甦協議：${opName(getOp(g, m.uid), 'zh')} 擲 ${r}，沒有復甦`, en: `${team(g, side).name.en} Reanimation Protocols: ${opName(getOp(g, m.uid), 'en')} rolled ${r}, no reanimation` }, `side${side}`);
    if (ok) return;
  }
}
/** Reanimate (Plasmacyte Reanimator): markers visible to and within 6" of it. */
const reanimTargets = (g, op) => reanimMarkers(g, op.side)
  .filter((m) => dist(op, m) - radius(op) <= 6 && visibility(g, op, { ...getOp(g, m.uid), x: m.x, y: m.y }).visible);
export function doReanimate(g, op, sure) {
  const id = sure ? 'reanimateSure' : 'reanimate';
  spend(g, op, id);
  const m = reanimTargets(g, op).sort((a, b) => getOp(g, b.uid).maxW - getOp(g, a.uid).maxW)[0];
  if (!m) return;
  const r = sure ? null : d6();
  const dead = getOp(g, m.uid);
  log(g, { zh: `${opName(op, 'zh')} 復甦：${opName(dead, 'zh')}${sure ? '（多花 1AP，自動成功）' : `（擲 ${r}）`}`, en: `${opName(op, 'en')} Reanimate: ${opName(dead, 'en')}${sure ? ' (extra AP: automatic)' : ` (rolled ${r})`}` }, `side${op.side}`);
  if ((sure || r >= 3) && !reanimate(g, m, dead.diedReady === g.tp)) log(g, { zh: '標記附近沒有可以放置的位置', en: 'No room to set it up near the marker' }, `side${op.side}`);
}
/**
 * Magnify: another friendly Cryptek / Apprentek (Engage order, not in an enemy's control range, visible to the
 * shooter) to determine valid targets, cover and obscured from. Returns the operative giving the best line
 * (null if none is better than shooting normally — ties go to Magnify for its Ceaseless).
 */
function magnifyRelay(g, op, target, weapon) {
  if (!weapon.rules.magnify || !visibility(g, op, target).visible) return null;
  const rank = (v) => (!v ? 9 : (v.cover ? 1 : 0) + (v.obscured ? 2 : 0));
  let best = null, bestRank = rank(validTarget(g, op, target, weapon));
  for (const r of living(g, op.side)) {
    if (r === op || !(tpl(r).cryptek || tpl(r).apprentek) || r.order !== 'engage' || isEngaged(g, r) || !visibility(g, op, r).visible) continue;
    const k = rank(validTarget(g, r, target, weapon));
    if (k < 9 && k <= bestRank) { best = r; bestRank = k; }
  }
  return best;
}
/** Interstitial Command: friendlies (not Crypteks / Apprenteks) that can take the free Shoot now. */
function interstitialTargets(g, op) {
  const despoteks = living(g, op.side).filter((d) => tpl(d).despotek && d !== op && visibility(g, op, d).visible);
  return living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && !tpl(t).cryptek && !tpl(t).apprentek
    && t.commandTP !== g.tp && t.shotTP !== g.tp && !isEngaged(g, t)
    && ((edgeDist(op, t) <= 6 + commsBonus(g, op) && visibility(g, op, t).visible) || (!tpl(op).despotek && despoteks.some((d) => edgeDist(d, t) <= 6 && visibility(g, d, t).visible)))
    && proxyShots(g, t).length > 0);
}
/** Shots the operative could take as Interstitial Command's free Shoot: [{w, t}]. */
export function proxyShots(g, t) {
  const keep = { ap: t.ap, acted: t.acted };
  t.ap = 1; t.acted = {};
  const out = [];
  for (const w of tpl(t).weapons.filter((x) => x.type === 'ranged')) for (const e of foes(g, t)) if (shootCheck(g, t, e, w).ok) out.push({ w, t: e });
  t.ap = keep.ap; t.acted = keep.acted;
  return out;
}
/** Start the free Shoot: the commanded operative gets 1AP for it (g.proxy until it shoots or the activation ends). */
function startProxy(g, op, t) {
  t.commandTP = g.tp; t.ap = 1; t.acted = {};
  g.proxy = { uid: t.uid, by: op.uid };
  op.acted.proxyFor = t.uid;
}
export function endProxy(g) {
  const p = g.proxy && getOp(g, g.proxy.uid);
  if (p) { p.ap = 0; p.acted = {}; }
  const by = g.proxy && getOp(g, g.proxy.by);
  if (by?.acted) by.acted.proxyFor = null;
  g.proxy = null;
}
// ---------- Hunter Clade ----------
/** The Doctrina Imperative this operative's team has this turning point (null if none). */
const doctrina = (g, op) => {
  if (op.docOverride?.tp === g.tp) return { tp: g.tp, mode: op.docOverride.mode, noDep: false }; // Command Override
  const d = op.side < 2 && TEAM_MAP[op.team].doctrina ? g.doctrina?.[op.side] : null;
  return d && d.tp === g.tp ? d : null;
};
const optimised = (g, op, mode) => doctrina(g, op)?.mode === mode;
const deprecated = (g, op, mode) => { const d = doctrina(g, op); return !!d && d.mode === mode && !d.noDep; };
/** Strategic gambit: the Imperative until the next Ready step (the Primary Mode's Deprecation can be ignored once per battle). */
export function setDoctrina(g, side, mode, ignoreDep = false) {
  const primary = g.tactics?.[side]?.[0];
  const prev = g.doctrina?.[side];
  if (prev?.tp === g.tp && prev.noDep) g.primaryUsed[side] = false; // changed its mind in the same Strategy phase
  const noDep = ignoreDep && mode === primary && !g.primaryUsed?.[side];
  if (noDep) (g.primaryUsed ||= [false, false])[side] = true;
  (g.doctrina ||= [null, null])[side] = { tp: g.tp, mode, noDep };
  const t = team(g, side).tactics.find((x) => x.id === mode);
  log(g, { zh: `${teamZh(g, side)} 教條指令：${t.name.zh}${noDep ? '（主要模式：無視劣化）' : ''}`, en: `${team(g, side).name.en} Doctrina Imperative: ${t.name.en}${noDep ? ' (Primary Mode: Deprecation ignored)' : ''}` }, `side${side}`);
}
/** Can this side still ignore its Primary Mode's Deprecation? */
export const primaryLeft = (g, side) => !g.primaryUsed?.[side];
/** Hit worsened by the Imperative's Deprecation (Protector: melee; Conqueror: ranged). */
const doctrinaHit = (g, op, w) => !!w && ((w.type === 'melee' && deprecated(g, op, 'protector')) || (w.type === 'ranged' && deprecated(g, op, 'conqueror')));
const bulwark = (g, op) => !!g && optimised(g, op, 'bulwark');
/** Rad-Saturation: an enemy within 2" of a friendly Vanguard has its Hit worsened by 1. */
const radSaturated = (g, op) => op.side < 2 && living(g, 1 - op.side).some((v) => tpl(v).radSat && edgeDist(v, op) <= 2);
/** Debilitating Irradiation: the attacker is irradiated and its target is a Vanguard of a side that bought the ploy. */
const debilitated = (g, src, target) => target.side < 2 && !!tpl(target).vanguard && hasPloy(g, target.side, 'debilitating') && radSaturated(g, src);
/** Neurostatic Interference: an enemy within 6" of a friendly Infiltrator can't re-roll its attack dice. */
const neurostatic = (g, op) => op.side < 2 && hasPloy(g, 1 - op.side, 'neurostatic') && living(g, 1 - op.side).some((i) => tpl(i).infiltrator && edgeDist(i, op) <= 6);
// ---------- Kasrkin ----------
export const SKILLS = {
  lightEmUp: { name: { zh: '點燃他們', en: 'Light \'Em Up' }, desc: { zh: '遠程武器「重創」。', en: 'Ranged weapons have Severe.' } },
  forCadia: { name: { zh: '為了卡迪亞！', en: 'For Cadia!' }, desc: { zh: '近戰武器 Atk +1（最多 4）；近戰時第一次打擊 +1 傷害。', en: 'Melee weapons +1 Atk (max 4); the first strike when fighting deals 1 more.' } },
  strikeFast: { name: { zh: '快速打擊', en: 'Strike Fast' }, desc: { zh: '移動（Reposition）時 Move +1"。', en: '+1" Move when repositioning.' } },
  iceInVeins: { name: { zh: '冷血', en: 'Ice In Your Veins' }, desc: { zh: '近戰、反擊或被射擊時，每次第一顆 3 以上的普通傷害 -1。', en: 'Fighting, retaliating or being shot: the first attack die inflicting 3+ Normal Dmg each sequence deals 1 less.' } },
};
/** Skill at Arms in effect for this operative (the team's, plus one from Tactical Command). */
const skillOn = (g, op, id) => op.side < 2 && TEAM_MAP[op.team].skillAtArms && (((g.skills?.[op.side]?.tp === g.tp) && g.skills[op.side].ids.includes(id)) || (op.skillExtra?.tp === g.tp && op.skillExtra.id === id));
/** How many Skills at Arms the side picks this turning point (two while its Sergeant is in the killzone). */
export const skillSlots = (g, side) => (living(g, side).some((o) => tpl(o).veteranLeadership) ? 2 : 1);
/** Strategic gambit: the Skills at Arms for this turning point. */
export function setSkills(g, side, ids) {
  const pick = [...new Set(ids.filter((id) => SKILLS[id]))].slice(0, skillSlots(g, side));
  (g.skills ||= [null, null])[side] = { tp: g.tp, ids: pick };
  log(g, { zh: `${teamZh(g, side)} 戰技：${pick.map((id) => SKILLS[id].name.zh).join('、') || '無'}`, en: `${team(g, side).name.en} Skill at Arms: ${pick.map((id) => SKILLS[id].name.en).join(', ') || 'none'}` }, `side${side}`);
}
/** End of a side's Strategy phase: pick Skills at Arms if the player didn't; place the Clearance Sweep marker by the frontmost enemy. */
function skillsStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].skillAtArms) return;
  if (g.skills?.[side]?.tp !== g.tp) setSkills(g, side, ['lightEmUp', 'iceInVeins']);
  if (hasPloy(g, side, 'clearanceSweep') && g.sweep?.[side]?.tp !== g.tp) {
    const mine = living(g, side), cx = mine.reduce((s, o) => s + o.x, 0) / (mine.length || 1), cy = mine.reduce((s, o) => s + o.y, 0) / (mine.length || 1);
    const e = living(g, 1 - side).sort((a, b) => dist(a, { x: cx, y: cy }) - dist(b, { x: cx, y: cy }))[0];
    if (e) { (g.sweep ||= [null, null])[side] = { tp: g.tp, x: e.x, y: e.y }; log(g, { zh: `清掃標記放在 ${opName(e, 'zh')} 處（5" 範圍）`, en: `Clearance Sweep marker placed by ${opName(e, 'en')} (5" area)` }, `side${side}`); }
  }
}
/** Rapid Fire weapons: bolt pistol, hot-shot lasgun, hot-shot laspistol. */
const rapidWeapon = (w) => !!w && (!!w.rules.rapid || /^bolt pistol$/i.test(w.name.en));
const rapidOK = (op) => TEAM_MAP[op.team].rapidFire && !moved(op);
/** Clearance Sweep (ploy): the marker's 5" area. */
const sweepOn = (g, op, target) => { const m = g.sweep?.[op.side]; return !!(m && m.tp === g.tp && target && dist(op, m) - radius(op) <= 5 && dist(target, m) - radius(target) <= 5); };
const adaptiveOk = (g, op, k) => !!tpl(op).adaptive && g.adaptive?.[op.side]?.[k] !== g.tp;

// ---------- Legionaries ----------
const markOf = (op) => tpl(op).mark || null;
/** Siphon Life (Balefire Acolyte, once per turning point): the most hurt friendly visible within 6" regains 1 per damaging die (D3 per critical one). */
function siphonLife(g, op, crits) {
  if (!crits.length || op.siphonTP === g.tp) return;
  const t = living(g, op.side).filter((o) => o.wounds < o.maxW && edgeDist(op, o) <= 6 && (o === op || visibility(g, op, o).visible)).sort((a, b) => (b.maxW - b.wounds) - (a.maxW - a.wounds))[0];
  if (!t) return;
  op.siphonTP = g.tp;
  const before = t.wounds;
  t.wounds = Math.min(t.maxW, t.wounds + crits.reduce((s, c) => s + (c ? d3() : 1), 0));
  log(g, { zh: `吸取生命：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Siphon Life: ${opName(t, 'en')} regains ${t.wounds - before} wounds` }, `side${op.side}`);
}
/** Disgusting Vigour (Nurgle): Normal Dmg of 3+ — on a 5+ it deals 1 less. */
function nurgleVigour(g, target, amount) {
  if (markOf(target) !== 'nurgle' || amount < 3) return amount;
  return d6() >= 5 ? amount - 1 : amount;
}
/** Unleash Daemon (Anointed): Normal and Critical Dmg of 4+ deal 1 less. */
const daemonShell = (t, d) => (t.unleashed && d >= 4 ? d - 1 : d);
/** Grisly Mark (Shrivetalon): an enemy within 3" of the marker. */
const grislyNear = (g, op) => op.side < 2 && (g.markers || []).some((m) => m.kind === 'grisly' && m.owner === 1 - op.side && dist(op, m) - radius(op) <= 3);
/** Quicksilver Speed (ploy): the Legionary moved this turning point. */
const quick = (g, op) => op.side < 2 && TEAM_MAP[op.team].marksOfChaos && hasPloy(g, op.side, 'quicksilver') && (op.movedTP || 0) > 0;

// ---------- Novitiates: Acts of Faith ----------
export const FAITH_ACTS = {
  guidance: { cost: 1, name: { zh: '引導', en: 'Guidance' }, desc: { zh: '重擲一顆骰', en: 're-roll one die' } },
  blessing: { cost: 2, name: { zh: '祝福', en: 'Blessing' }, desc: { zh: '一顆普通成功當暴擊', en: 'a normal success becomes critical' } },
  intervention: { cost: 3, name: { zh: '干預', en: 'Intervention' }, desc: { zh: '一顆失敗當普通成功', en: 'a fail becomes a normal success' } },
};
export const faithOf = (g, side) => g.faith?.[side] || 0;
function gainFaith(g, side, n, why) {
  if (n <= 0 || side > 1 || !TEAM_MAP[g.teams[side]].actsOfFaith) return;
  (g.faith ||= [0, 0])[side] += n;
  log(g, { zh: `${teamZh(g, side)} 獲得 ${n} 信仰點（${why.zh}，共 ${g.faith[side]}）`, en: `${team(g, side).name.en} gains ${n} Faith (${why.en}, ${g.faith[side]} total)` }, `side${side}`);
}
/** The die an Act of Faith would affect (the first fail to re-roll / promote, or a normal success to bless). */
function faithDie(pool, act) {
  const want = act === 'blessing' ? 'norm' : 'miss';
  return pool.dice.findIndex((d) => d.res === want && !d.auto && !d.faith);
}
/** Acts of Faith this side can use on this roll now: [{id, cost, ok}]. holder: a shooting sequence or a fight side; which: 'a' | 'd'. */
export function faithOptions(g, side, holder, which) {
  if (side > 1 || !TEAM_MAP[g.teams[side]]?.actsOfFaith || !holder || holder.faithUsed?.[which]) return [];
  const pool = holder[which === 'a' ? 'a' : 'd'];
  if (!pool) return [];
  return Object.entries(FAITH_ACTS).map(([id, a]) => ({ id, cost: a.cost, ok: faithOf(g, side) >= a.cost && faithDie(pool, id) >= 0 }));
}
export const canFaith = (g, side, holder, which) => faithOptions(g, side, holder, which).some((o) => o.ok);
/** Spend Faith on an Act of Faith for this roll. */
export function useFaith(g, side, holder, which, act, opUid = null) {
  const o = faithOptions(g, side, holder, which).find((x) => x.id === act && x.ok);
  if (!o) return false;
  const pool = holder[which === 'a' ? 'a' : 'd'], d = pool.dice[faithDie(pool, act)];
  g.faith[side] -= o.cost;
  (holder.faithUsed ||= {})[which] = true;
  const old = d.v;
  if (act === 'guidance') { d.v = d6(); d.rr = true; } else d.faith = act === 'blessing' ? 'crit' : 'norm';
  tally(pool);
  const extra = act === 'guidance' ? { zh: `：${old} → ${d.v}`, en: `: ${old} → ${d.v}` } : { zh: '', en: '' };
  log(g, { zh: `${teamZh(g, side)} 信仰行為「${FAITH_ACTS[act].name.zh}」（-${o.cost} 信仰）${extra.zh}`, en: `${team(g, side).name.en} Act of Faith: ${FAITH_ACTS[act].name.en} (-${o.cost} Faith)${extra.en}` }, `side${side}`);
  // Blessed Rejuvenation: the operative regains D3 at the end of the action.
  if (opUid && hasPloy(g, side, 'blessedRejuv')) (g.faithHeal ||= []).push(opUid);
  return true;
}
/** The computer's Act of Faith for a roll: the strongest one it can afford when it helps, or null. */
export function aiFaith(g, side, holder, which) {
  const opts = faithOptions(g, side, holder, which).filter((o) => o.ok);
  if (!opts.length) return null;
  const pool = holder[which === 'a' ? 'a' : 'd'];
  if (which === 'd') { // defence: only when attack successes would still get through
    const att = holder.a.crits + holder.a.norms, def = pool.crits + pool.norms + (holder.coverN || 0) + (holder.coverC || 0);
    if (att <= def) return null;
  }
  return (opts.find((o) => o.id === 'intervention' && faithOf(g, side) >= 5) || opts.find((o) => o.id === 'blessing') || opts.find((o) => o.id === 'guidance') || opts.find((o) => o.id === 'intervention'))?.id || null;
}
/** Blessed Rejuvenation: heal the operatives Faith was spent on this action. */
function faithRejuvenate(g) {
  for (const uid of g.faithHeal || []) {
    const o = getOp(g, uid);
    if (!o || o.dead || o.wounds >= o.maxW) continue;
    const before = o.wounds; o.wounds = Math.min(o.maxW, o.wounds + d3());
    log(g, { zh: `${opName(o, 'zh')} 神聖回春：回復 ${o.wounds - before} 生命`, en: `${opName(o, 'en')} Blessed Rejuvenation: regains ${o.wounds - before} wounds` }, `side${o.side}`);
  }
  g.faithHeal = [];
}
/** Ready step: Faith equal to half the living Novitiates (rounding up). */
function readyFaith(g, side) {
  if (!TEAM_MAP[g.teams[side]].actsOfFaith) return;
  gainFaith(g, side, Math.ceil(living(g, side).length / 2), { zh: '準備步驟', en: 'Ready step' });
}
/** The operative contests an objective marker (Defenders of the Faith). */
const contesting2 = (g, op) => (g.objectives || []).some((o) => !o.carriedBy && dist(op, o) - radius(op) - OBJ_R <= CONTROL);
const isPsyker = (op) => !!tpl(op).psyker || !!tpl(op).sorcerer || tpl(op).weapons.some((w) => w.rules.psychic);
/** Null Rod (Condemnor): an enemy within 6" of a Condemnor can't use PSYCHIC ranged weapons or actions. */
const nullRodded = (g, op) => op.side < 2 && living(g, 1 - op.side).some((c) => tpl(c).nullRodAura && edgeDist(c, op) <= 6);
const PSYCHIC_ACTIONS = ['fate', 'ravage', 'alight', 'miasma', 'soulChannel', 'soulHeal', 'wardingShield', 'warpFold'];
/** Auto-broadcaster (Dialogus): an enemy within 3" of the marker can't re-roll its attack dice. */
const broadcastNear = (g, op) => op.side < 2 && (g.markers || []).some((m) => m.kind === 'broadcaster' && m.owner === 1 - op.side && dist(op, m) - radius(op) <= 3);
/** Glorious Hymnal (Preceptor): friendlies within 3" of it have Severe. */
const hymnal = (g, op) => op.side < 2 && living(g, op.side).some((p) => tpl(p).hymnal && sameTeam(p, op) && edgeDist(p, op) <= 3);

// ---------- Universal equipment (up to 4 options per player, set up automatically before the battle) ----------
export const EQUIPMENT = {
  comms: { name: { zh: '通訊裝置', en: 'Comms Device' }, desc: { zh: '己方領土內放一個通訊裝置標記；控制它的友方，支援動作選友方的距離 +3"。', en: 'A Comms Device marker in your territory; a friendly that controls it adds 3" to the distance of its Support rules that pick friendlies.' } },
  mines: { name: { zh: '地雷', en: 'Mines' }, desc: { zh: '己方領土內放一個地雷標記；第一次有特工（敵我皆然）進入它的控制範圍時移除並造成 D3+3 傷害。', en: 'A Mines marker in your territory; the first time any operative is within its control range, remove it and inflict D3+3 damage.' } },
  ammo: { name: { zh: '彈藥箱', en: 'Ammo Cache' }, desc: { zh: '己方領土內放一個彈藥箱；控制它的友方可執行「補充彈藥」（0AP，每回合一次）：直到下回合，射擊時可重擲一顆攻擊骰。', en: 'An Ammo Cache marker in your territory; a friendly that controls it can Ammo Resupply (0AP, once per TP): until next TP, re-roll one attack die when shooting.' } },
  utility: { name: { zh: '戰術手榴彈', en: 'Utility Grenades' }, desc: { zh: '1 顆震撼彈＋1 顆煙霧彈（全隊共用次數）。震撼：6" 內可見的敵人與它 1" 內的特工擲 D6，3+ 下次 APL -1。煙霧：放在 6" 內看得到的特工處，1" 範圍內的特工對 2" 外互相視為被遮擋。', en: '1 stun + 1 smoke grenade (uses shared by the team). Stun: an enemy visible within 6" and each operative within 1" of it roll a D6, 3+ = -1 APL next activation. Smoke: placed on an operative visible within 6"; operatives wholly within 1" of it are obscured to and from operatives more than 2" away.' } },
  explosive: { name: { zh: '爆裂手榴彈', en: 'Explosive Grenades' }, desc: { zh: '1 顆破片＋1 顆穿甲手榴彈（全隊共用次數），任何特工都能投擲。破片 4/4+/2/4，射程 6"、爆炸 2"、飽和；穿甲 4/4+/4/5，射程 6"、穿甲 1、飽和。', en: '1 frag + 1 krak grenade (uses shared by the team), any operative can throw them. Frag 4/4+/2/4, Range 6", Blast 2", Saturate; krak 4/4+/4/5, Range 6", Piercing 1, Saturate.' } },
  lightBarricades: { name: { zh: '輕掩體 ×2', en: 'Light Barricades ×2' }, desc: { zh: '兩道輕型地形，放在自己的半區內（離其他裝備地形與訪問點 2" 以外）。', en: 'Two pieces of Light terrain wholly within your half (more than 2" from other equipment terrain and access points).' } },
  heavyBarricade: { name: { zh: '重掩體', en: 'Heavy Barricade' }, desc: { zh: '一道重型地形，只能放在距離降落區 4" 內（離其他裝備地形與訪問點 2" 以外）。', en: 'A piece of Heavy terrain wholly within 4" of your drop zone (more than 2" from other equipment terrain and access points).' } },
  razorWire: { name: { zh: '鐵絲網', en: 'Razor Wire' }, desc: { zh: '暴露且阻礙：不提供掩護，特工越過它時移動距離多算 1"。放在自己的半區內（離其他裝備地形與訪問點 2" 以外）。', en: 'Exposed and Obstructing: no cover, and crossing over it counts as 1" more. Wholly within your half (more than 2" from other equipment terrain and access points).' } },
};
export const EQUIP_IDS = Object.keys(EQUIPMENT);
Object.assign(EQUIPMENT, ARCHON_EQUIPMENT, CORSAIR_EQUIPMENT);
registerCorsairActions();
ACTIONS.blinkToggle = { ap: 0, name: { zh: '切換瞬移背包', en: 'Toggle Blink Pack' } };
const FRAG = { id: 'eqFrag', name: { zh: '破片手榴彈', en: 'Frag grenade' }, type: 'ranged', atk: 4, hit: 4, dmg: [2, 4], rules: { range: 6, blast: 2, saturate: true, equipGrenade: 'frag', noMarkerlight: true }, group: 'eqFrag' };
const KRAK = { id: 'eqKrak', name: { zh: '穿甲手榴彈', en: 'Krak grenade' }, type: 'ranged', atk: 4, hit: 4, dmg: [4, 5], rules: { range: 6, piercing: 1, saturate: true, equipGrenade: 'krak', noMarkerlight: true }, group: 'eqKrak' };
const hasEquip = (g, side, id) => side < 2 && !!g.equip?.[side]?.includes(id);
/** Uses left of a team-limited grenade (frag / krak / stun / smoke). */
const eqLeft = (g, side, k) => g.eqUses?.[side]?.[k] || 0;
/** The operative's weapons, plus the team's explosive grenades while any are left (not for beasts and machines). */
export function weaponsFor(g, op) {
  const ws = archonWeapons(op);
  if (!hasEquip(g, op.side, 'explosive') || tpl(op).actionsOnly) return ws;
  return [...ws, ...(eqLeft(g, op.side, 'frag') ? [FRAG] : []), ...(eqLeft(g, op.side, 'krak') ? [KRAK] : [])];
}
/** A point in a side's territory: d inches from its own killzone edge, at fraction c across the board. */
function ownPoint(g, side, d, c) {
  const z = deployZones(g)[side];
  if (g.axis === 'y') { const fromLow = z.y0 === 0; return { x: c * BOARD.w, y: fromLow ? d : BOARD.h - d }; }
  const fromLow = z.x0 === 0;
  return { x: fromLow ? d : BOARD.w - d, y: c * BOARD.h };
}
/** The nearest spot to p clear of terrain (by r) and other markers (by 2"). */
function clearSpot(g, p, r = 0.5) {
  for (let ring = 0; ring <= 5; ring += 0.5) {
    for (let a = 0; a < 16; a++) {
      const q = { x: p.x + Math.cos(a * Math.PI / 8) * ring, y: p.y + Math.sin(a * Math.PI / 8) * ring };
      if (q.x < r || q.y < r || q.x > BOARD.w - r || q.y > BOARD.h - r) continue;
      if (g.terrain.some((t) => distPointRect(q, t) < r + 0.3)) continue;
      if ([...g.objectives, ...g.markers].some((m) => dist(m, q) < 2)) continue;
      return q;
    }
  }
  return p;
}
/** Set up the chosen equipment for a side (called from newGame). */
function setupEquipment(g, side, ids) {
  (g.equip ||= [[], []])[side] = ids.filter((id) => EQUIPMENT[id] && (!ARCHON_EQUIPMENT[id] || g.teams[side] === 'handOfArchon') && (!CORSAIR_EQUIPMENT[id] || g.teams[side] === 'corsairVoidscarred')).slice(0, 4);
  (g.eqUses ||= [{}, {}])[side] = { frag: 0, krak: 0, stun: 0, smoke: 0 };
  const along = g.axis === 'y' ? 'y' : 'x';
  // Where each kind may go: light cover and razor wire wholly within your territory (half); heavy cover wholly
  // within 4" of your drop zone. All of them more than 2" from other equipment terrain and from access points.
  const zone = deployZones(g)[side];
  const inHalf = (t) => [[t.x, t.y], [t.x + t.w, t.y], [t.x, t.y + t.h], [t.x + t.w, t.y + t.h]].every(([x, y]) => territoryOf(g, { x, y }) === side);
  const near4 = (t) => t.x >= zone.x0 - 4 && t.x + t.w <= zone.x1 + 4 && t.y >= (zone.y0 ?? 0) - 4 && t.y + t.h <= (zone.y1 ?? BOARD.h) + 4;
  const rectGap = (a, b) => Math.hypot(Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w)), Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h)));
  const wall = (p, len, kind, area, thick = 0.5) => { // across the line of advance, moved until every rule is met
    const across = along === 'x' ? 'y' : 'x', dir = ownPoint(g, side, 1, 0.5)[along] < BOARD[along === 'x' ? 'w' : 'h'] / 2 ? -1 : 1;
    for (const back of [0, 1, 2, 0.5, 1.5, -1, 3, -2, 4]) {
      for (const shift of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
        const q = { ...p, [along]: p[along] + back * dir, [across]: p[across] + shift };
        const t = along === 'x' ? { kind, x: q.x - thick / 2, y: q.y - len / 2, w: thick, h: len } : { kind, x: q.x - len / 2, y: q.y - thick / 2, w: len, h: thick };
        if (t.x < 0 || t.y < 0 || t.x + t.w > BOARD.w || t.y + t.h > BOARD.h || !area(t)) continue;
        if (g.terrain.some((o) => rectGap(t, o) < (o.equip != null ? 2.01 : 0.4))) continue; // 2" from other equipment terrain
        if ((g.accessPoints || []).some((a) => distPointRect(a, t) <= 2)) continue; // and from access points
        if ([...g.objectives, ...g.markers].some((m) => distPointRect(m, t) < 1.5)) continue;
        g.terrain.push({ ...t, equip: side });
        return;
      }
    }
    log(g, { zh: `${teamZh(g, side)} 找不到合規的位置放${kind === 'wire' ? '鐵絲網' : kind === 'heavy' ? '重掩體' : '輕掩體'}`, en: `${team(g, side).name.en} found no legal place for its ${kind === 'wire' ? 'razor wire' : kind === 'heavy' ? 'heavy barricade' : 'light barricade'}` }, `side${side}`);
  };
  for (const id of g.equip[side]) {
    if (id === 'comms') g.markers.push({ id: g.markers.length, kind: 'comms', owner: side, ...clearSpot(g, ownPoint(g, side, 9, 0.5)), carriedBy: null });
    if (id === 'mines') g.markers.push({ id: g.markers.length, kind: 'mine', owner: side, ...clearSpot(g, ownPoint(g, side, 12.5, Math.random() < 0.5 ? 0.3 : 0.7)), carriedBy: null });
    if (id === 'ammo') g.markers.push({ id: g.markers.length, kind: 'ammo', owner: side, ...clearSpot(g, ownPoint(g, side, 7.5, 0.5)), carriedBy: null });
    if (id === 'utility') Object.assign(g.eqUses[side], { stun: 1, smoke: 1 });
    if (id === 'explosive') Object.assign(g.eqUses[side], { frag: 1, krak: 1 });
    if (id === 'lightBarricades') { wall(ownPoint(g, side, 10.5, 0.25), 3, 'light', inHalf); wall(ownPoint(g, side, 10.5, 0.75), 3, 'light', inHalf); }
    if (id === 'heavyBarricade') wall(ownPoint(g, side, 9, 0.5), 3.5, 'heavy', near4);
    if (id === 'razorWire') wall(ownPoint(g, side, 12.5, 0.5), 4, 'wire', inHalf, 0.3);
  }
  if (g.equip[side].length) log(g, { zh: `${teamZh(g, side)} 的裝備：${g.equip[side].map((id) => EQUIPMENT[id].name.zh).join('、')}`, en: `${team(g, side).name.en} equipment: ${g.equip[side].map((id) => EQUIPMENT[id].name.en).join(', ')}` }, `side${side}`);
}
/** The computer's equipment: grenades, a mine, an ammo cache and a heavy barricade. */
export const AI_EQUIP = ['explosive', 'mines', 'ammo', 'heavyBarricade'];
/** Mines: the first operative to come within control range of a Mines marker sets it off. */
function checkMines(g, op) {
  for (const m of (g.markers || []).filter((x) => (x.kind === 'mine' || x.kind === 'meltaMine') && !x.gone)) {
    if (op.dead || m.exempt === op.uid || dist(op, m) - radius(op) - OBJ_R > CONTROL) continue;
    m.gone = true;
    const dmg = m.kind === 'meltaMine' ? d6() + d6() + 3 : d3() + 3; // Melta Mine (Kasrkin Demo-trooper): 2D6+3
    log(g, { zh: `💥 ${opName(op, 'zh')} 踩到地雷，受到 ${dmg} 傷害`, en: `💥 ${opName(op, 'en')} sets off a mine and takes ${dmg} damage` }, 'kill');
    applyDamage(g, null, op, dmg);
  }
  g.markers = g.markers.filter((x) => !x.gone);
}
/** Comms Device: +3" to Support distances that pick friendlies, while this operative controls its own marker. */
const commsBonus = (g, op) => ((g.markers || []).some((m) => m.kind === 'comms' && m.owner === op.side && dist(op, m) - radius(op) - OBJ_R <= CONTROL && controller(g, m) === op.side) ? 3 : 0);
/** Smoke: an operative wholly within 1" of a smoke marker. */
const inSmoke = (g, op) => (g.smoke || []).some((s) => dist(op, s) + radius(op) <= 1.01);
const ammoTarget = (g, op) => (g.markers || []).find((m) => m.kind === 'ammo' && m.owner === op.side && m.usedTP !== g.tp && dist(op, m) - radius(op) - OBJ_R <= CONTROL && controller(g, m) === op.side);

// ---------- Firefight ploys (交戰計謀) ----------
// Each one can be used once per turning point. Kinds:
//  button — used by the active operative during its activation (start: only before its first action);
//  aim    — chosen while picking a Shoot target (it changes which targets are valid);
//  attack — chosen with a declared Shoot / Fight, before the dice are rolled;
//  auto   — reactions (when shot, damaged, incapacitated…): used automatically while armed and affordable.
export const ffDef = (g, side, id) => TEAM_MAP[g.teams[side]]?.firefight?.find((p) => p.id === id) || null;
const ffUsedNow = (g, side, id) => g.ffUsed?.[side]?.tp === g.tp && g.ffUsed[side].ids.includes(id);
/** Can this side pay for and still use this firefight ploy this turning point? */
const ffBaseCost = (g, side, id) => (['lightFingers', 'capriciousFlight'].includes(id) && tpl(activeOp(g) || { team: g.teams[side], tplId: TEAM_MAP[g.teams[side]].ops[0].id }).prowlingRaiders && activeOp(g)?.side === side ? 0 : ffDef(g, side, id)?.cp || 0);
const ffCostNow = (g, side, id) => ffBaseCost(g, side, id) + (g.deviousTax?.[side] === id ? 1 : 0);
export const ffReady = (g, side, id) => { const p = ffDef(g, side, id); return !!p && !ffUsedNow(g, side, id) && g.cp[side] >= ffCostNow(g, side, id) && (id !== 'deviousScheme' || !g.deviousTax?.[1 - side]); };
function spendFF(g, side, id) {
  const p = ffDef(g, side, id);
  if (g.ffUsed?.[side]?.tp !== g.tp) (g.ffUsed ||= [null, null])[side] = { tp: g.tp, ids: [] };
  g.ffUsed[side].ids.push(id);
  const paid = ffCostNow(g, side, id);
  g.cp[side] -= paid;
  if (g.deviousTax?.[side] === id) g.deviousTax[side] = null;
  if (id !== 'deviousScheme' && paid > 0 && !g.deviousTax?.[side] && autoFF(g, 1 - side, 'deviousScheme')) (g.deviousTax ||= [null, null])[side] = id;
  log(g, { zh: `${teamZh(g, side)} 使用交戰計謀「${p.name.zh}」（${p.cp}CP）`, en: `${team(g, side).name.en} uses the firefight ploy ${p.name.en} (${p.cp}CP)` }, `side${side}`);
}
export function skipArchonActivation(g, side) {
  if (g.phase !== 'firefight' || g.turn !== side || g.active || g.counter || !ffReady(g, side, 'heinousArrogance') || !hasReady(g, 1 - side)) return false;
  spendFF(g, side, 'heinousArrogance'); handOff(g, side); return true;
}

/** Auto ploys: armed unless the player switched them off. */
export const ffArmed = (g, side, id) => !g.ffOff?.[side]?.includes(id);
export function ffToggleArm(g, side, id) {
  const off = ((g.ffOff ||= [[], []])[side] ||= []);
  const i = off.indexOf(id);
  if (i >= 0) off.splice(i, 1); else off.push(id);
}
/** Use an auto ploy now if it's armed, affordable and unused. */
function autoFF(g, side, id) {
  if (side > 1 || !ffDef(g, side, id) || !ffArmed(g, side, id) || !ffReady(g, side, id)) return false;
  spendFF(g, side, id);
  return true;
}
/** Is this attack ploy chosen for the operative's current Shoot / Fight (pending or committed)? */
const ffOn = (g, op, id) => [g.ffPending, g.ffAtk].some((x) => x && x.uid === op.uid && x.ids.includes(id));
const startOfActivation = (op) => !Object.keys(op.acted || {}).some((k) => !['unseen', 'accelerant', 'free', 'raiderFree', 'darknessTarget'].includes(k) && op.acted[k]);
const sprungNow = (op) => op.prevOrder === 'conceal' && op.order === 'engage';
const holdsObjective = (g, t) => (g.objectives || []).some((o) => dist(t, o) - radius(t) - OBJ_R <= CONTROL && controller(g, o) === t.side);

/** Firefight ploy rules, keyed by id (names and descriptions are in teams.js). */
const FF = {
  capriciousFlight: { kind: 'button', cond: (g, o) => !o.counter && isEngaged(g, o) ? null : { zh: '需要在啟動中且交戰', en: 'Must be engaged during an activation' }, apply(g, o) { o.acted.slip = true; } },
  lightFingers: { kind: 'button', cond: (g, o) => !o.counter ? null : { zh: '反擊時不能使用', en: 'Not during counteraction' }, apply(g, o) { o.acted.lightFingers = true; } },
  opportunisticFighters: { kind: 'auto' },
  contemptuousAdventurer: { kind: 'button', start: true, cond: (g, o) => (g.actCount?.[o.side] === 1 && living(g, o.side).every((t) => t === o || edgeDist(t, o) > 5)) ? null : { zh: '本回合首名啟動，且距離所有友方超過 5 吋', en: 'First activated this TP, more than 5 inches from all friendlies' }, apply(g, o) { o.acted.contemptuous = true; } },
  cruelDeception: { kind: 'button', cond: (g, o) => !o.counter && isEngaged(g, o) ? null : { zh: '需要在啟動中且交戰', en: 'Must be engaged during an activation' }, apply(g, o) { o.acted.slip = true; } },
  deviousScheme: { kind: 'auto' },
  preyWounded: { kind: 'auto' },
  // ---- Angels of Death ----
  adjustDoctrine: { kind: 'button',
    cond: (g, op) => (['docAssault', 'docDevastator', 'docTactical'].some((d) => hasPloy(g, op.side, d)) ? null : { zh: '本回合沒有用戰鬥教條', en: 'No Combat Doctrine this turning point' }),
    apply(g, op) {
      const docs = ['docAssault', 'docDevastator', 'docTactical'], cur = docs.find((d) => hasPloy(g, op.side, d));
      const next = docs[(docs.indexOf(cur) + 1) % 3];
      g.ploys[op.side] = g.ploys[op.side].map((p) => (p === cur ? next : p));
      const nm = team(g, op.side).ploys.find((p) => p.id === next)?.name;
      return nm ? { zh: `改為${nm.zh}`, en: `now ${nm.en}` } : null;
    } },
  wrathVengeance: { kind: 'button', cond: (g, op) => (op.counter && !op.acted.wrath ? null : { zh: '只能在反擊時', en: 'Only while counteracting' }), apply(g, op) { op.acted.wrath = true; op.ap += 1; } },
  transhuman: { kind: 'auto' },
  shockAssault: { kind: 'attack', fight: true, cond: (g, op) => (count(op, 'charge') ? null : { zh: '本次啟動沒有衝鋒', en: 'Didn\'t Charge this activation' }) },
  // ---- Blooded ----
  momentRepute: { kind: 'button', cond: (g, op) => (underGaze(g, op) ? null : { zh: '不在諸神注視下', en: 'Not under the Gaze of the Gods' }), apply(g, op) { op.ap += 1; } },
  rewardEarned: { kind: 'auto' },
  // ---- Death Korps ----
  combinedArms: { kind: 'attack', shoot: true, cond: (g, op, t) => (t?.shotBy?.tp === g.tp && t.shotBy.uids.some((u) => u !== op.uid && getOp(g, u)?.side === op.side) ? null : { zh: '目標本回合還沒被其他友方射擊', en: 'Not shot by another friendly this TP' }) },
  // ---- Exaction Squad ----
  longArm: { kind: 'aim', cond: (g, op, t, w) => (w?.rules.range ? null : { zh: '武器沒有射程限制', en: 'The weapon has no Range rule' }) },
  // ---- Fellgor Ravagers ----
  animalisticFury: { kind: 'attack', fight: true },
  wildRage: { kind: 'button', start: true, apply(g, op) { op.acted.moveBonus = (op.acted.moveBonus || 0) + 1; } },
  ruthlessRampage: { kind: 'button',
    cond: (g, op) => (count(op, 'fight') && !isEngaged(g, op) ? null : { zh: '要在近戰後、且不在敵人控制範圍內', en: 'After a Fight, out of enemy control range' }),
    apply(g, op) { op.acted.free = { ...(op.acted.free || {}), charge: 'rampage' }; } },
  // ---- Farstalker Kinband ----
  slipAway: { kind: 'button', apply(g, op) { op.acted.slip = true; } },
  vengeanceKinband: { kind: 'auto' },
  savageAmbush: { kind: 'auto' },
  // ---- Gellerpox Infected ----
  putrescentDemise: { kind: 'auto' },
  frighteningOnslaught: { kind: 'button',
    cond: (g, op) => (tpl(op).hulk && count(op, 'fight') && fightTargets(g, op).length ? null : { zh: '噩夢巨獸近戰後才能用', en: 'A Nightmare Hulk, after a Fight' }),
    apply(g, op) { op.acted.free = { ...(op.acted.free || {}), fight: 'any' }; } },
  revoltingTech: { kind: 'auto' },
  // ---- Hunter Clade ----
  commandOverride: { kind: 'button', start: true,
    apply(g, op) {
      const mode = avgDmg(bestMelee(op)) > Math.max(0, ...tpl(op).weapons.filter((w) => w.type === 'ranged').map((w) => avgDmg(w))) ? 'conqueror' : 'protector';
      op.docOverride = { tp: g.tp, mode };
      const t = team(g, op.side).tactics.find((x) => x.id === mode);
      return { zh: `改為${t.name.zh}`, en: `now ${t.name.en}` };
    } },
  omnissiah: { kind: 'button', cond: (g, op) => (doctrina(g, op) ? null : { zh: '沒有教條指令', en: 'No Doctrina Imperative' }), apply(g, op) { op.omniTP = g.tp; } },
  scrapcode: { kind: 'button', start: true, cond: (g, op) => (tpl(op).infiltrator ? null : { zh: '只有滲透者', en: 'Infiltrators only' }), apply(g, op) { (g.scrapcode ||= [null, null])[op.side] = op.uid; } },
  // ---- Hearthkyn Salvagers ----
  sturdy: { kind: 'auto' },
  engageToAcquire: { kind: 'attack', cond: (g, op, t) => (t && holdsObjective(g, t) ? null : { zh: '目標沒有控制目標點', en: 'The target doesn\'t control an objective' }) },
  ancestorsWatching: { kind: 'button', apply(g, op) { op.acted.ancestors = true; op.acted.free = { ...(op.acted.free || {}), shoot: 'any', fight: 'any' }; } },
  // ---- Hierotek Circle ----
  livingLightning: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w?.id === 'teslaCarbine' ? null : { zh: '只能用特斯拉卡賓槍', en: 'Tesla carbine only' }) },
  // ---- Imperial Navy Breachers ----
  blitz: { kind: 'attack', cond: (g, op, t) => (t && edgeDist(op, t) <= 6 && g.attackTP?.[op.side] !== g.tp ? null : { zh: '要是本回合第一次攻擊、目標在 6" 內', en: 'The team\'s first attack this TP, within 6"' }) },
  overwhelmTarget: { kind: 'button', start: true, cond: (g, op) => (op.breachedTP === g.tp || op.breach?.length ? null : { zh: '要在突破清場啟動時', en: 'Only when activated with Breach and Clear' }), apply(g, op) { op.ap += 1; } },
  // ---- Kommandos ----
  justScratch: { kind: 'auto' },
  shakeItOff: { kind: 'button', start: true, apply(g, op) { op.shakeTP = g.tp; if ((op.aplNext || 0) < 0 && !op.counter) op.ap += Math.min(1, -op.aplNext); } },
  // ---- Pathfinders ----
  supportingFire: { kind: 'aim' },
  // ---- Phobos Strike Team ----
  criticalShot: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w && isBoltWeapon(w) ? null : { zh: '只能用爆彈武器', en: 'Bolt weapons only' }) },
  // ---- Plague Marines ----
  sickeningResilience: { kind: 'auto' },
  virulentPoison: { kind: 'button',
    cond: (g, op) => (poisonTargets(g, op).length ? null : { zh: '附近沒有未中毒的敵人', en: 'No unpoisoned enemy nearby' }),
    apply(g, op) {
      const t = poisonTargets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
      t.poison = true;
      return { zh: `${opName(t, 'zh')} 中毒`, en: `${opName(t, 'en')} is poisoned` };
    } },
  poisonousDemise: { kind: 'auto' },
  // ---- Kasrkin ----
  neutraliseTarget: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (t && w && (auspexOn(g, op, t) || !shotVisibility(g, op, t, w).cover || w.rules.saturate) ? null : { zh: '目標要沒有掩護豁免、或被掃描中', en: 'The target must have no cover saves, or be scanned' }) },
  // ---- Legionaries ----
  mutability: { kind: 'button', start: true, cond: (g, op) => (markOf(op) === 'tzeentch' ? null : { zh: '只有奸奇印記', en: 'Tzeentch only' }), apply(g, op) { op.ap += 1; } },
  malignantAura: { kind: 'attack', shoot: true, cond: (g, op, t) => (markOf(op) === 'nurgle' && t && edgeDist(op, t) <= 3 ? null : { zh: '納垢印記、目標在 3" 內', en: 'Nurgle, target within 3"' }) },
  sickeningCaptivation: { kind: 'button',
    cond: (g, op) => (markOf(op) === 'slaanesh' && foes(g, op).some((e) => e.side < 2 && edgeDist(op, e) <= 4 && visibility(g, op, e).visible) ? null : { zh: '色孽印記、4" 內有看得到的敵人', en: 'Slaanesh, a visible enemy within 4"' }),
    apply(g, op) {
      const e = foes(g, op).filter((x) => x.side < 2 && edgeDist(op, x) <= 4 && visibility(g, op, x).visible).sort((a, b) => tpl(b).apl - tpl(a).apl)[0];
      changeApl(g, e, -1);
      return { zh: `${opName(e, 'zh')} 下次啟動 APL -1`, en: `${opName(e, 'en')} gets -1 APL next activation` };
    } },
  // ---- Warpcoven ----
  allIsDust: { kind: 'auto' },
  capricious: { kind: 'button', cond: (g, op) => (tpl(op).sorcerer && !isEngaged(g, op) ? null : { zh: '只有巫師、且不在交戰中', en: 'Sorcerers only, not engaged' }), apply(g, op) { op.acted.free = { ...(op.acted.free || {}), dash: 'capricious' }; } },
  // ---- Wyrmblade ----
  slink: { kind: 'button', cond: (g, op) => (op.order === 'engage' && !op.slinkUsed ? null : { zh: '要是交戰指令（每名整場一次）', en: 'Engage order only (once per operative per battle)' }), apply(g, op) { op.acted.slink = true; op.slinkUsed = true; } },
  coiledSerpent: { kind: 'attack', cond: (g, op) => (sprungNow(op) && !count(op, 'shoot') && !count(op, 'fight') ? null : { zh: '要在隱蔽轉交戰後的第一次攻擊', en: 'First attack after switching from Conceal' }) },
};
/** The kind of a firefight ploy ('button' | 'aim' | 'attack' | 'auto'), for the interface. */
export const ffKind = (id) => FF[id]?.kind || null;
const poisonTargets = (g, op) => foes(g, op).filter((t) => !t.poison && t.side < 2 && (edgeDist(op, t) <= 3 || (edgeDist(op, t) <= 7 && visibility(g, op, t).visible)));

function archonPrey(g, op, target, pool) {
  if (target.wounds < target.maxW && pool.dice.some((d) => d.res === 'miss' && !d.rr) && !noRerollHere(g, op) && !voxbroken(g, op) && !neurostatic(g, op) && !broadcastNear(g, op) && autoFF(g, op.side, 'preyWounded')) {
    for (const d of pool.dice) if (!d.auto && !d.rr && d.res === 'miss') { d.v = d6(); d.rr = true; } tally(pool);
  }
}

/** Button ploys for the active operative: [{id, cp, ok, why}]. */
export function ffButtons(g, op) {
  if (!op || op.side > 1 || g.phase !== 'firefight' || g.active !== op.uid) return [];
  return (TEAM_MAP[op.team].firefight || []).filter((p) => FF[p.id]?.kind === 'button').map((p) => {
    const def = FF[p.id];
    const why = ffUsedNow(g, op.side, p.id) ? { zh: '本回合已用過', en: 'Already used this TP' }
      : !ffReady(g, op.side, p.id) ? { zh: 'CP 不足', en: 'Not enough CP' }
      : def.start && !startOfActivation(op) ? { zh: '只能在啟動時（第一個動作前）', en: 'Only when activated (before its first action)' }
      : def.cond?.(g, op) || null;
    return { id: p.id, cp: ffCostNow(g, op.side, p.id), ok: !why, why };
  });
}
export function useFFButton(g, op, id) {
  const b = ffButtons(g, op).find((x) => x.id === id);
  if (!b?.ok) return false;
  spendFF(g, op.side, id);
  const msg = FF[id].apply(g, op);
  if (msg) log(g, { zh: `${opName(op, 'zh')}：${msg.zh}`, en: `${opName(op, 'en')}: ${msg.en}` }, `side${op.side}`);
  return true;
}
/** Aim / attack ploys that fit this Shoot or Fight: [{id, cp, ok, why, on}]. */
export function ffAttackOptions(g, op, kind, weapon, target, aim = false) {
  if (!op || op.side > 1) return [];
  return (TEAM_MAP[op.team].firefight || []).filter((p) => {
    const d = FF[p.id];
    if (!d || (aim ? d.kind !== 'aim' : d.kind !== 'attack')) return false;
    return kind === 'fight' ? !d.shoot && (aim ? false : true) : !d.fight;
  }).map((p) => {
    const why = ffUsedNow(g, op.side, p.id) ? { zh: '本回合已用過', en: 'Already used this TP' }
      : !ffReady(g, op.side, p.id) ? { zh: 'CP 不足', en: 'Not enough CP' } : FF[p.id].cond?.(g, op, target, weapon) || null;
    return { id: p.id, cp: ffCostNow(g, op.side, p.id), ok: !why, why, on: ffOn(g, op, p.id) };
  });
}
/** Choose / unchoose an aim or attack ploy for the operative's next Shoot or Fight (paid when the dice are rolled). */
export function ffToggle(g, op, id) {
  const p = (g.ffPending && g.ffPending.uid === op.uid) ? g.ffPending : (g.ffPending = { uid: op.uid, ids: [] });
  const i = p.ids.indexOf(id);
  if (i >= 0) p.ids.splice(i, 1);
  else if (ffReady(g, op.side, id)) p.ids.push(id);
}
export function ffClearPending(g) { g.ffPending = null; }
/** The dice are about to be rolled: pay for the chosen ploys (dropping any that no longer apply). */
export function ffCommit(g, op, kind, weapon, target) {
  const p = g.ffPending && g.ffPending.uid === op.uid ? g.ffPending : null;
  g.ffPending = null;
  const ids = [];
  for (const id of p?.ids || []) {
    const ok = [...ffAttackOptions(g, op, kind, weapon, target, true), ...ffAttackOptions(g, op, kind, weapon, target)].find((x) => x.id === id && x.ok);
    if (ok) { spendFF(g, op.side, id); ids.push(id); }
  }
  g.ffAtk = ids.length ? { uid: op.uid, ids } : null;
  (g.attackTP ||= [0, 0])[op.side] = g.tp; // (Blitz: the team's first attack this turning point)
}
/** Inviolate Jurisdiction (ploy): shot within 2" of an objective marker or an enemy — re-roll one defence die. */
const inviolate = (g, op) => op.side < 2 && TEAM_MAP[op.team].ruthless && hasPloy(g, op.side, 'inviolate')
  && ((g.objectives || []).some((o) => dist(op, o) - radius(op) - OBJ_R <= 2) || foes(g, op).some((e) => edgeDist(e, op) <= 2));
const veriscantOn = (g, op, target) => {
  const v = g.veriscant?.[op.side];
  return !!(v && target && v.t === target.uid && op.team === g.teams[op.side]);
};
const sorcererNear = (g, op, d) => living(g, op.side).some((o) => o !== op && tpl(o).sorcerer && edgeDist(o, op) <= d);

// ---------- Phobos Strike Team ----------
/** Voxbreak: an enemy within 6" of a Voxbreaker can't re-roll its attack or defence dice. */
export const voxbroken = (g, op) => foes(g, op).some((o) => tpl(o).voxbreak && edgeDist(o, op) <= 6);

/** Omni-scrambler (STRATEGIC GAMBIT): enemies that may be picked — visible to a friendly Infiltrator, or within 6" of the Voxbreaker. */
export function scrambleTargets(g, side) {
  const inf = living(g, side).filter((o) => tpl(o).infiltrator);
  if (!TEAM_MAP[g.teams[side]].omniScrambler || !inf.length) return [];
  return living(g, 1 - side).filter((t) => inf.some((o) => visibility(g, o, t).visible || (tpl(o).voxbreak && edgeDist(o, t) <= 6)));
}
export function omniScramble(g, side, target) {
  if (!target || g.scramble?.[side]?.tp === g.tp || !scrambleTargets(g, side).includes(target)) return false;
  const n = living(g, side).filter((o) => tpl(o).infiltrator).length;
  (g.scramble ||= [null, null])[side] = { uid: target.uid, tp: g.tp, n };
  log(g, { zh: `${teamZh(g, side)} 全頻擾亂器：${opName(target, 'zh')} 要等對手先啟動 ${n} 名特工才能行動`, en: `${team(g, side).name.en} Omni-scrambler: ${opName(target, 'en')} can't act until ${n} other operatives have activated` }, `side${side}`);
  return true;
}
/** Is this operative held back by an enemy Omni-scrambler right now? */
function scrambled(g, op, ready) {
  const s = g.scramble?.[1 - op.side];
  if (!s || s.tp !== g.tp || s.uid !== op.uid) return false;
  return (g.actCount?.[op.side] || 0) < s.n && ready.some((o) => o !== op);
}

/** Auspex Scan: shooting an enemy within 8" of the Voxbreaker — it can't be obscured; an Incursor also has Seek Light. */
function auspexOn(g, op, target) {
  const a = g.auspex?.[op.side];
  const vb = a && getOp(g, a);
  return !!(vb && !vb.dead && target && edgeDist(vb, target) <= 8);
}

// ---------- Imperial Navy Breachers ----------
/** The Attack / Defence Order marker for this TP (placed when the ploy is used; moved in the Strategy phase). */
export function placeNavyOrder(g, side, at) {
  const kind = g.ploys[side].includes('attackOrder') ? 'attack' : g.ploys[side].includes('defenceOrder') ? 'defence' : null;
  if (!kind || !at) return;
  (g.navyOrder ||= [null, null])[side] = { kind, x: at.x, y: at.y, tp: g.tp };
}
const navyOrderNear = (g, op, kind) => {
  const m = g.navyOrder?.[op.side];
  return !!(m && m.tp === g.tp && m.kind === kind && dist(m, op) - radius(op) <= 3);
};
/** Brace for Counterattack: in your territory, or no Charge / Fall Back / Reposition this TP. */
const braced = (g, op) => hasPloy(g, op.side, 'braceCounter') && (territoryOf(g, op) === op.side || op.bigMoveTP !== g.tp);

// ---------- Hearthkyn Salvagers ----------
function addGrudge(g, side, enemy, why) {
  (enemy.grudge ||= {})[side] = (enemy.grudge[side] || 0) + 1;
  log(g, { zh: `${opName(enemy, 'zh')} 獲得宿怨標記（${why.zh}，共 ${enemy.grudge[side]}）`, en: `${opName(enemy, 'en')} gains a Grudge token (${why.en}; ${enemy.grudge[side]} in total)` }, `side${side}`);
}

/** Eye of the Ancestors (Theyn, STRATEGIC GAMBIT): how many enemies can still be given a Grudge token this TP. */
export function eyeLeft(g, side) {
  if (!living(g, side).some((o) => tpl(o).eyeOfAncestors)) return 0;
  const lost = g.ops.filter((o) => o.side === side && o.dead).length;
  const used = g.eye?.[side]?.tp === g.tp ? g.eye[side].n : 0;
  return Math.max(0, (lost >= 3 ? 2 : 1) - used);
}
export function eyeOfAncestors(g, side, enemy) {
  if (!eyeLeft(g, side) || !enemy || enemy.dead) return false;
  const e = (g.eye ||= [null, null]);
  e[side] = { tp: g.tp, n: (e[side]?.tp === g.tp ? e[side].n : 0) + 1 };
  addGrudge(g, side, enemy, { zh: '先祖之眼', en: 'Eye of the Ancestors' });
  return true;
}

/** Tactician (Kognitâar, STRATEGIC GAMBIT): the Attack marker on an enemy, or the Defence marker on a friendly, for this TP. */
export function placeTactician(g, side, kind, at) {
  (g.tactician ||= [null, null])[side] = at ? { kind, x: at.x, y: at.y, tp: g.tp } : null;
  if (at) log(g, { zh: `${teamZh(g, side)} 戰術家：${kind === 'attack' ? '攻擊' : '防禦'}標記放在 ${opName(at, 'zh')} 處`, en: `${team(g, side).name.en} Tactician: ${kind === 'attack' ? 'Attack' : 'Defence'} marker placed at ${opName(at, 'en')}` }, `side${side}`);
}
/** Weavefield Crest: use the Theyn's once-per-battle ignore of one die's Normal Dmg (the first time it matters). */
function useCrest(g, op) {
  if (!tpl(op).weavefield || op.crestUsed) return false;
  op.crestUsed = true;
  log(g, { zh: `${opName(op, 'zh')} 編織力場紋章：無視一次普通傷害`, en: `${opName(op, 'en')} Weavefield Crest: ignores one Normal Dmg` }, `side${op.side}`);
  return true;
}
const defenceMarker = (g, op) => { const t = g.tactician?.[op.side]; return !!(t && t.tp === g.tp && t.kind === 'defence' && dist(t, op) - radius(op) <= 3); };

// ---------- Death Korps ----------
export const GUARD_ORDERS = {
  takeAim: { zh: '瞄準！', en: 'Take Aim!', dzh: '遠程武器「無休」（迫擊砲彈幕除外）', den: 'Ranged weapons have Ceaseless (not the mortar barrage)' },
  fixBayonets: { zh: '上刺刀！', en: 'Fix Bayonets!', dzh: '近戰武器「無休」', den: 'Melee weapons have Ceaseless' },
  digIn: { zh: '固守！', en: 'Dig In!', dzh: '被射擊且能保留掩護豁免時，可重擲某一點數的所有防禦骰', den: 'When shot and cover saves can be retained, re-roll all defence dice of one result' },
  moveMove: { zh: '快快快！', en: 'Move! Move! Move!', dzh: '轉移時 Move +1"', den: '+1" Move when Repositioning' },
};
/** The Guardsman Order this operative received this turning point, if any. */
export const guardOrder = (g, op) => (op.gOrder?.tp === g.tp ? op.gOrder.id : null);

/** Who issues Guardsman Orders: the Watchmaster, or the Confidant once the Watchmaster is gone (Second in Command). */
export function orderIssuer(g, side) {
  return living(g, side).find((o) => tpl(o).watchmaster) || living(g, side).find((o) => tpl(o).confidant) || null;
}

/**
 * Strategy phase (STRATEGIC GAMBIT): choose the order for this turning point. It's handed out when the side
 * finishes choosing ploys: all friendlies within 6" of the issuer, or everyone if the Vox-operator relays it.
 */
export function chooseGuardOrder(g, side, id, relay = false) {
  (g.gorders ||= [null, null])[side] = id ? { id, relay: !!relay } : null;
}

function handOutGuardOrder(g, side) {
  const pick = g.gorders?.[side];
  const issuer = orderIssuer(g, side);
  if (!pick || !issuer) return;
  if (!tpl(issuer).watchmaster) (g.secondInCommand ||= [false, false])[side] = true;
  let got = living(g, side).filter((o) => edgeDist(o, issuer) <= 6 || o === issuer);
  const vox = got.find((o) => tpl(o).relay && !isEngaged(g, o));
  const relayed = pick.relay && vox;
  if (relayed) { got = living(g, side); changeApl(g, vox, -1); }
  for (const o of got) o.gOrder = { id: pick.id, tp: g.tp };
  const o = GUARD_ORDERS[pick.id];
  log(g, {
    zh: `${opName(issuer, 'zh')} 下達衛兵命令「${o.zh}」：${got.length} 名友方收到${relayed ? `（${opName(vox, 'zh')} 轉達全隊，下次啟動 APL -1）` : ''}`,
    en: `${opName(issuer, 'en')} issues the Guardsman Order "${o.en}": ${got.length} friendly operatives receive it${relayed ? ` (${opName(vox, 'en')} relays it to everyone, -1 APL next activation)` : ''}`,
  }, `side${side}`);
}

function whollyInOwnTerritory(g, op) {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(op);
  return [-r, r].every((d) => territoryOf(g, { ...op, [along]: op[along] + d }) === op.side);
}

/** Spot: shooting the spotted enemy from within 3" of the Spotter gives Seek Light, and it can't be obscured. */
function spotOn(g, op, target) {
  const s = g.spot?.[op.side];
  if (!s || s.tp !== g.tp || !target || s.t !== target.uid) return false;
  const spotter = getOp(g, s.by);
  // The Navy Breachers' C.A.T. unit spots for the whole team; the Death Korps / Hearthkyn spotters for friendlies within 3".
  return !!spotter && !spotter.dead && sameTeam(spotter, op) && (tpl(spotter).catUnit || edgeDist(spotter, op) <= 3);
}

/** The enemy is within 1" of this side's Pech'ra marker. */
function pechraNear(g, side, target) {
  const m = g.pechra?.[side];
  return !!(m && target && dist(m, target) - radius(target) <= 1);
}

/**
 * A pool of dice: each die keeps its rolled value, and `tally` works out which are successes and applies
 * the rules that change them afterwards (Severe, Rending, Punishing, and `post`). Tallying again after a
 * die is re-rolled (Command Re-roll) recomputes all of that from the dice values.
 */
function rollPool(n, success, critOn, rules = {}, post = null) {
  // Accurate x: retain up to x dice as normal successes without rolling them.
  const auto = Math.min(n, rules.accurate || 0);
  const dice = Array.from({ length: n - auto }, () => ({ v: d6(), rr: false }));
  const fail = (v) => v < success || (rules.no3 && v === 3); // Rust Emanations: results of 3 don't count
  if (rules.reroll6) for (const d of dice) if (d.v === 6) { d.v = d6(); d.rr = true; } // Ravage Destiny (forced)
  if (rules.ceaseless) for (const d of dice) if (!d.rr && d.v === 1) { d.v = d6(); d.rr = true; }
  if (rules.digIn && !rules.relentless) {
    // Dig In!: re-roll every die showing one result — the failed result that came up most.
    const tally_ = {};
    for (const d of dice) if (!d.rr && fail(d.v)) tally_[d.v] = (tally_[d.v] || 0) + 1;
    const v = +Object.keys(tally_).sort((a, b) => tally_[b] - tally_[a])[0];
    if (v) for (const d of dice) if (!d.rr && d.v === v) { d.v = d6(); d.rr = true; }
  }
  if (rules.relentless) for (const d of dice) if (!d.rr && fail(d.v)) { d.v = d6(); d.rr = true; } // re-roll all fails
  if (rules.balanced) {
    const f = dice.filter((d) => !d.rr && fail(d.v)).sort((a, b) => a.v - b.v)[0];
    if (f) { f.v = d6(); f.rr = true; }
  }
  // Void Armour (Navy Breachers): re-roll up to n failed defence dice.
  if (rules.rerollFails) {
    for (const d of dice.filter((x) => !x.rr && fail(x.v)).sort((a, b) => a.v - b.v).slice(0, rules.rerollFails)) { d.v = d6(); d.rr = true; }
  }
  dice.sort((a, b) => b.v - a.v);
  for (let k = 0; k < auto; k++) dice.push({ v: '✓', res: 'norm', auto: true });
  const pool = {
    dice, success, critOn, post, crits: 0, norms: 0,
    rules: { severe: !!rules.severe, rending: !!rules.rending, punishing: !!rules.punishing, no3: !!rules.no3, grudge: rules.grudge || 0, closeAssault: !!rules.closeAssault, gaze: !!rules.gaze, promote: rules.promote || 0 },
  };
  return tally(pool);
}

function tally(pool) {
  const { dice, success, critOn, rules } = pool;
  for (const d of dice) {
    delete d.sev; delete d.rend; delete d.pun; delete d.indo; delete d.obsc; delete d.obscDrop; delete d.grudge; delete d.gaze; delete d.prom;
    const ok = d.v >= success && !(rules.no3 && d.v === 3);
    d.res = d.auto ? 'norm' : ok && d.v >= critOn ? 'crit' : ok ? 'norm' : 'miss';
    // Acts of Faith (Novitiates): Blessing keeps a normal as a crit, Intervention a fail as a normal.
    if (d.faith === 'crit' && d.res === 'norm') d.res = 'crit';
    if (d.faith === 'norm' && d.res === 'miss') d.res = 'norm';
  }
  let crits = dice.filter((d) => d.res === 'crit').length;
  let norms = dice.filter((d) => d.res === 'norm').length;
  if (rules.severe && crits === 0 && norms > 0) {
    // Severe: no critical success retained, so one normal success becomes critical (Rending and Punishing then don't apply).
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.sev = true;
    crits++; norms--;
  } else if (crits > 0) {
    if (rules.rending && norms > 0) {
      const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.rend = true;
      crits++; norms--;
    }
    // Punishing: with a critical success retained, one fail becomes a normal success.
    const miss = rules.punishing && dice.find((x) => x.res === 'miss');
    if (miss) { miss.res = 'norm'; miss.pun = true; norms++; }
  }
  // Gaze of the Gods (Blooded): the success retained through Accurate 1 is a critical success.
  const gz = rules.gaze && dice.find((x) => x.auto && x.res === 'norm');
  if (gz) { gz.res = 'crit'; gz.gaze = true; crits++; norms--; }
  // Grudge (Hearthkyn): one normal success per Grudge token is retained as a critical success.
  for (let k = 0; k < (rules.grudge || 0) && norms > 0; k++) {
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.grudge = true;
    crits++; norms--;
  }
  // Coiled Serpent (Wyrmblade firefight ploy): one normal success is retained as a critical success.
  for (let k = 0; k < (rules.promote || 0) && norms > 0; k++) {
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.prom = true;
    crits++; norms--;
  }
  // Close Assault (Navy Breachers): with two or more fails, one becomes a normal success.
  const misses = rules.closeAssault ? dice.filter((x) => x.res === 'miss') : [];
  if (misses.length >= 2) { misses[0].res = 'norm'; misses[0].indo = true; norms++; }
  pool.crits = crits; pool.norms = norms;
  pool.post?.(pool);
  return pool;
}

/** Obscured: the attacker's critical successes become normal successes, then one success is discarded. */
function obscure(pool) {
  for (const d of pool.dice) if (d.res === 'crit') { d.res = 'norm'; d.obsc = true; }
  const drop = pool.dice.filter((d) => d.res === 'norm').sort((x, y) => (x.auto ? 1 : 0) - (y.auto ? 1 : 0))[0];
  if (drop) { drop.res = 'miss'; drop.obscDrop = true; }
  pool.crits = 0;
  pool.norms = pool.dice.filter((d) => d.res === 'norm').length;
}

/** Expected damage of ac/an unblocked attack successes against n defence dice (save+, crit on critOn) plus retained saves. */
function expectedDamage(ac, an, n, save, critOn, cN, cC, dn, dc) {
  const pc = Math.max(0, 7 - Math.max(critOn, save)) / 6, ps = Math.max(0, 7 - save) / 6, pn = ps - pc, pm = 1 - ps;
  const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
  let e = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; i + j <= n; j++) {
    const p = fact(n) / (fact(i) * fact(j) * fact(n - i - j)) * pc ** i * pn ** j * pm ** (n - i - j);
    if (p) e += p * bestBlock(ac, an, i + cC, j + cN, dn, dc).dmg;
  }
  return e;
}

// ---------- Command Re-roll (firefight ploy, 1CP) ----------
export const isComputer = (g, side) => side === NPO || side === g.ai;
/** A player operative near an objective can't re-roll (Sickening Emissions). */
const noRerollHere = (g, op) => (!!mission(g).noRerollNearObjective && op.side !== NPO && g.objectives.some((o) => inMarkerRange(op, o)))
  || voxbroken(g, op); // Voxbreak (Phobos)

/** Can `side` spend 1CP to re-roll one die of this pool? Each roll of dice can be re-rolled once. */
export function canCommandReroll(g, side, holder, which) {
  if (!holder || holder.rerolled?.[which] || holder.noReroll?.[which]) return false;
  const pool = holder[which === 'a' ? 'a' : 'd'];
  return !!pool && g.cp[side] >= 1 && pool.dice.some((d) => !d.auto);
}

/** Re-roll one die (Command Re-roll): costs 1CP, the pool is tallied again. */
export function commandReroll(g, side, holder, which, index) {
  if (!canCommandReroll(g, side, holder, which)) return false;
  const pool = holder[which === 'a' ? 'a' : 'd'], die = pool.dice[index];
  if (!die || die.auto) return false;
  g.cp[side]--;
  (holder.rerolled ||= {})[which] = true;
  const old = die.v;
  die.v = d6(); die.rr = true;
  tally(pool);
  log(g, { zh: `${teamZh(g, side)} 指揮重擲（-1CP）：${old} → ${die.v}`, en: `${team(g, side).name.en} Command Re-roll (-1CP): ${old} → ${die.v}` }, `side${side}`);
  return true;
}

/** The computer's Command Re-roll decision for one roll: the index of a failed die to re-roll, or -1. */
export function aiRerollChoice(g, side, holder, which) {
  if (!canCommandReroll(g, side, holder, which) || g.cp[side] < 1) return -1;
  const pool = holder[which === 'a' ? 'a' : 'd'];
  const misses = pool.dice.map((d, i) => [d, i]).filter(([d]) => !d.auto && d.res === 'miss');
  if (!misses.length) return -1;
  if (which === 'a') return misses.length * 2 >= pool.dice.length ? misses[0][1] : -1;
  // Defence: worth it when more successful attack dice than defence successes are left.
  const att = holder.a.crits + holder.a.norms, def = pool.crits + pool.norms + (holder.coverN || 0) + (holder.coverC || 0);
  return att > def ? misses[0][1] : -1;
}

const clampHit = (h) => Math.min(6, Math.max(2, h));

// Debilitating Irradiation (Hunter Clade ploy): -1 Normal Dmg (to a minimum of 3) for an irradiated attacker hitting a Vanguard.
const normalDmg = (w, target = null, g = null, src = null) => w.dmg[0] - (g && src && target && w.dmg[0] > 3 && debilitated(g, src, target) ? 1 : 0);

function bestBlock(ac, an, sc, sn, dn, dc) {
  let best = { dmg: Infinity };
  for (let c2c = 0; c2c <= Math.min(sc, ac); c2c++) {
    const c2n = Math.min(sc - c2c, an);
    for (let pairs = 0; pairs <= Math.min(Math.floor(sn / 2), ac - c2c); pairs++) {
      const n2n = Math.min(sn - pairs * 2, an - c2n);
      const remC = ac - c2c - pairs, remN = an - c2n - n2n;
      const dmg = remC * dc + remN * dn;
      if (dmg < best.dmg) best = { dmg, remC, remN };
    }
  }
  return best;
}

/**
 * Medic!: the first time each turning point a friendly non-drone operative (Pathfinders, Death Korps) would be
 * incapacitated while visible to and within 3" of the medic (neither in enemy control range), it survives on 1
 * wound. Not usable if the medic is a target of the Shoot action being resolved. (The free Dash isn't modelled.)
 */
function medicFor(g, target) {
  if (isDrone(target) || g.medicTP?.[target.side] === g.tp) return null;
  if (isEngaged(g, target)) return null;
  return living(g, target.side).find((m) => tpl(m).medic && m !== target && edgeDist(m, target) <= 3
    && visibility(g, m, target).visible && !isEngaged(g, m) && !g.shotTargets?.includes(m.uid)) || null;
}

export function applyDamage(g, src, target, dmg) {
  const before = target.wounds;
  const killed = inflict(g, src, target, dmg);
  grandfathersBlessing(g, target, before - Math.max(0, target.wounds));
  return killed;
}

/**
 * Call the Kill: the mark is down. Victory Shriek gives a friendly operative within 6" of the
 * Kill-broker Balanced for the rest of the battle (once each), and a new mark is picked (the enemy
 * with the most wounds left).
 */
function markDown(g, side) {
  const kb = living(g, side).find((o) => tpl(o).callTheKill);
  if (kb) {
    const pick = living(g, side).filter((o) => !o.shriek && edgeDist(o, kb) <= 6)
      .sort((a, b) => Math.max(...tpl(b).weapons.map((w) => avgDmg(w))) - Math.max(...tpl(a).weapons.map((w) => avgDmg(w))))[0];
    if (pick) {
      pick.shriek = true;
      log(g, { zh: `${opName(kb, 'zh')} 勝利尖嘯：${opName(pick, 'zh')} 之後的武器都獲得「平衡」`, en: `${opName(kb, 'en')} Victory Shriek: ${opName(pick, 'en')}'s weapons have Balanced for the rest of the battle` }, `side${side}`);
    }
  }
  const next = living(g, 1 - side).sort((a, b) => b.wounds - a.wounds)[0];
  setMark(g, side, kb || TEAM_MAP[g.teams[side]].justiceMark ? next : null); // Marked for Justice: a new mark too
}

/** Call the Kill (strategic gambit while the Kill-broker is in the killzone): mark an enemy for the turning point. */
export function setMark(g, side, target) {
  (g.mark ||= [null, null])[side] = target ? target.uid : null;
  const t = team(g, side);
  const [zh, en] = t.justiceMark ? ['正義標記', 'Marked for Justice'] : t.bringItDown ? ['集火摧毀', 'Bring it Down'] : ['呼喚獵殺', 'Call the Kill'];
  if (target) log(g, { zh: `${teamZh(g, side)} ${zh}：標記 ${opName(target, 'zh')}`, en: `${t.name.en} ${en}: ${opName(target, 'en')} is marked` }, `side${side}`);
}

/**
 * Grandfather's Blessing: when a poisoned enemy loses wounds within 7" of the Champion, the Champion
 * regains as many (at most 3 per turning point).
 */
function grandfathersBlessing(g, target, lost) {
  if (lost <= 0 || !target.poison) return;
  const champ = foes(g, target).find((o) => tpl(o).blessing && edgeDist(o, target) <= 7);
  if (!champ || champ.wounds >= champ.maxW) return;
  if (champ.blessTP !== g.tp) { champ.blessTP = g.tp; champ.blessed = 0; }
  const gain = Math.min(lost, 3 - champ.blessed, champ.maxW - champ.wounds);
  if (gain <= 0) return;
  champ.wounds += gain; champ.blessed += gain;
  log(g, { zh: `${opName(champ, 'zh')} 祖父的祝福：回復 ${gain} 生命`, en: `${opName(champ, 'en')} Grandfather's Blessing: regains ${gain} wounds` }, `side${champ.side}`);
}

function inflict(g, src, target, dmg) {
  if (dmg <= 0) return false;
  // Frenzy (Fellgor Ravagers): with a Frenzy token it's only incapacitated as the rule says (frenzyDie).
  if (target.frenzy) return false;
  target.damagedTP = true;
  if (target.medicShield) { target.wounds = Math.max(1, target.wounds - dmg); return false; }
  target.wounds -= dmg;
  const medic = target.wounds <= 0 && medicFor(g, target);
  if (medic) {
    // Survives on 1 wound for the rest of the action; both get -1 APL until the end of their next activations.
    target.wounds = tpl(medic).medicD3 ? d3() : 1; target.medicShield = true; target.medicTP = g.tp; // Helix Adept: D3 wounds
    (g.medicTP ||= [0, 0])[target.side] = g.tp;
    changeApl(g, target, -1); changeApl(g, medic, -1);
    if (g.active === target.uid) target.ap = 0; // used during its own activation: that activation ends
    log(g, { zh: `✚ ${opName(medic, 'zh')} 醫療兵！${opName(target, 'zh')} 以 ${target.wounds} 生命撐住`, en: `✚ ${opName(medic, 'en')} Medic! ${opName(target, 'en')} survives on ${target.wounds} wound(s)` }, `side${target.side}`);
    return false;
  }
  if (target.wounds <= 0) {
    target.wounds = 0;
    // Frenzy: instead of being incapacitated it gains a Frenzy token (the opponent scores it as a kill now).
    if (TEAM_MAP[target.team].frenzy) {
      target.frenzy = true; target.frenzyHits = 0;
      if (target.order === 'conceal') target.order = 'engage';
      log(g, { zh: `🔥 ${opName(target, 'zh')} 陷入狂暴！（對手算作擊殺）`, en: `🔥 ${opName(target, 'en')} goes into a Frenzy! (counts as incapacitated for the opponent)` }, 'kill');
      countKill(g, src, target);
      g.frenzyNow = target.uid; // the fight in progress discards its remaining dice
      return false;
    }
    return killOff(g, src, target);
  }
  return false;
}

/** Kill op: enemy operatives incapacitated (whoever caused it), except by NPOs where the mission says so. */
function countKill(g, src, target) {
  if (target.side === NPO || tpl(target).expendable || (src?.side === NPO && mission(g).npoKillsIgnored)) return;
  const scorer = 1 - target.side;
  const before = killGrade(g, scorer);
  g.kills[scorer]++;
  target.killCounted = true; // (taken back if it's REANIMATED)
  const after = killGrade(g, scorer);
  if (mission(g).killOp !== false && after > before) log(g, { zh: `${teamZh(g, scorer)} 擊殺等級 ${after}（+1 VP）`, en: `${team(g, scorer).name.en} reaches kill grade ${after} (+1 VP)` }, 'tp');
  if (g.mark?.[scorer] === target.uid) markDown(g, scorer);
  tacOnKill(g, src, target); // Tac Ops (Dominate, Sweep & Clear, Martyrs)
  // Inspirational Example (Superior) / Unflinching Example (Preceptor: a ready enemy in its control range): Faith.
  if (src && src.side === scorer && (tpl(src).inspirational || (tpl(src).unflinching && target.readyAtDeath && edgeDist(src, target) <= CONTROL + 0.01))) {
    gainFaith(g, scorer, tpl(target).wounds >= 12 ? 2 : 1, { zh: tpl(src).inspirational ? '激勵榜樣' : '不屈榜樣', en: tpl(src).inspirational ? 'Inspirational Example' : 'Unflinching Example' });
  }
}

/** Whip Control (Herd-goad): an enemy visible within 3" of it, while it isn't engaged with any other enemy. */
export function whipped(g, op) {
  return foes(g, op).some((h) => tpl(h).whipControl && edgeDist(h, op) <= 3 && visibility(g, h, op).visible
    && !engagedEnemies(g, h).some((e) => e !== op));
}

/** War Gong (Deathknell): a friendly within 3" of a Deathknell without a Frenzy token can take Normal instead of Critical Dmg. */
const warGong = (g, op) => op.side < 2 && living(g, op.side).some((d) => tpl(d).warGong && !d.frenzy && edgeDist(d, op) <= 3);

/** A Frenzied Fellgor finally falls (its kill was already counted when it gained the token). */
export function frenzyDie(g, op, src = null) {
  if (op.dead || !op.frenzy) return false;
  return killOff(g, src, op);
}

/** Firefight ploys triggered by an incapacitation (armed reactions). */
function ffOnDeath(g, src, target) {
  const side = target.side;
  if (side > 1) return;
  const near = (r) => foes(g, target).filter((e) => e.side < 2 && edgeDist(e, target) <= r && visibility(g, target, e).visible);
  // Vengeance for the Kinband: Relentless against the killer for the rest of the battle.
  const v = g.vengeance?.[side] && getOp(g, g.vengeance[side]);
  if (src && src.side === 1 - side && !src.dead && (!v || v.dead) && autoFF(g, side, 'vengeanceKinband')) {
    (g.vengeance ||= [null, null])[side] = src.uid;
    log(g, { zh: `為戰團復仇：友方攻擊 ${opName(src, 'zh')} 時武器「無情」`, en: `Vengeance for the Kinband: friendlies attacking ${opName(src, 'en')} have Relentless` }, `side${side}`);
  }
  // Putrescent Demise (Gellerpox): 1 damage (D3 for a Nightmare Hulk) to each enemy visible within 2".
  if (!tpl(target).vermin && near(2).length && autoFF(g, side, 'putrescentDemise')) {
    for (const e of near(2)) { const dmg = tpl(target).hulk ? d3() : 1; log(g, { zh: `腐爛之死：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `Putrescent Demise: ${opName(e, 'en')} takes ${dmg} damage` }, `side${side}`); applyDamage(g, target, e, dmg); }
  }
  // Poisonous Demise (Plague Marines): enemies visible within 3" are poisoned, or take 1 damage if they already were.
  if (near(3).length && autoFF(g, side, 'poisonousDemise')) {
    for (const e of near(3)) {
      if (!e.poison) { e.poison = true; log(g, { zh: `劇毒之死：${opName(e, 'zh')} 中毒`, en: `Poisonous Demise: ${opName(e, 'en')} is poisoned` }, `side${side}`); }
      else { log(g, { zh: `劇毒之死：${opName(e, 'zh')} 受到 1 傷害`, en: `Poisonous Demise: ${opName(e, 'en')} takes 1 damage` }, `side${side}`); applyDamage(g, target, e, 1); }
    }
  }
  // Glorious Martyrdom (Novitiates): for each enemy visible within 2", 1 Faith and D3 damage.
  if (near(2).length && autoFF(g, side, 'gloriousMartyrdom')) {
    for (const e of near(2)) { const dmg = d3(); log(g, { zh: `光榮殉道：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `Glorious Martyrdom: ${opName(e, 'en')} takes ${dmg} damage` }, `side${side}`); gainFaith(g, side, 1, { zh: '光榮殉道', en: 'Glorious Martyrdom' }); applyDamage(g, target, e, dmg); }
  }
  // Reward Earned (Blooded): the killer had a Blooded token and was within 2" — one more token.
  if (src && src.side === 1 - side && src.bloodToken && edgeDist(src, target) <= 2 && autoFF(g, src.side, 'rewardEarned')) gainBlood(g, src.side, { zh: '應得的獎賞', en: 'Reward Earned' });
}

function killOff(g, src, target) {
  {
    const wasReady = target.ready && g.active !== target.uid;
    target.readyAtDeath = target.ready; // (Unflinching Example: incapacitating a ready enemy)
    target.wounds = 0; target.dead = true; target.ready = false;
    log(g, { zh: `☠ ${opName(target, 'zh')} 失去戰鬥能力！`, en: `☠ ${opName(target, 'en')} is incapacitated!` }, 'kill');
    dropMarkers(g, target);
    if (!target.frenzy) countKill(g, src, target);
    if (g.pechra?.[target.side]?.by === target.uid) g.pechra[target.side] = null;
    if (g.pan?.[target.side]?.by === target.uid) g.pan[target.side] = null; // Pan Spectral Scan marker
    if (g.auspex?.[target.side] === target.uid) g.auspex[target.side] = null; // Auspex Scan
    if (src && tpl(src).heroic) src.killTP = g.tp; // Heroic Inspiration (Kelermorph)
    // Grudge (Hearthkyn): the enemy operative that incapacitated a Kin gains a Grudge token.
    if (TEAM_MAP[target.team].grudges && src && !src.dead && src.side !== target.side && src.side !== NPO) {
      addGrudge(g, target.side, src, { zh: '擊倒了戰友', en: 'killed one of the Kin' });
    }
    archonDeath(g, src, target);
    mission(g).onIncapacitated?.(g, target, src);
    bloodedOnDeath(g, target);
    ffOnDeath(g, src, target); // firefight ploys used when an operative is incapacitated
    // Reanimation Protocols (Hierotek Circle): the first time it falls, a Reanimation marker is left in its place.
    if (TEAM_MAP[target.team].reanimation && !target.reanimUsed && target.side < 2) {
      target.reanimUsed = true;
      target.diedReady = wasReady ? g.tp : 0; // brought back by the Reanimator this TP: expended unless it hadn't activated
      (g.reanim ||= []).push({ uid: target.uid, side: target.side, x: target.x, y: target.y });
    }
    return true;
  }
  return false;
}

/**
 * Damage from each unblocked attack die (and each Devastating crit), after Disgustingly Resilient:
 * a die inflicting 3+ damage on a Plague Marine rolls a D6 and deals 1 less on a 4+.
 * Returns {dmg, rolls: [{dmg, roll, saved}]}.
 */
function resolveDice(target, amounts, g = null) {
  // Emboldened (Navy Breacher Axejack): the same roll on a 5+, in a turning point it Charged.
  // Fortified stimm (Blooded) works the same way.
  // Toxic Blessings (Toxhorn) too.
  const emboldened = (!!g && tpl(target).emboldened && target.chargedTP === g.tp) || !!target.stimms?.fortified || !!tpl(target).toxicBlessings;
  // Zealous Dedication (Castigator): also on a 5+.
  const zealous = !!tpl(target).zealous;
  const resilient = !!TEAM_MAP[target.team].resilient || !!tpl(target).resilient || emboldened || zealous;
  const need = (emboldened || zealous) && !tpl(target).resilient ? 5 : 4;
  // Brace for Counterattack / Reinforce Metal (Hierotek): Dmg of 3+ deals 1 less.
  // Sickening Resilience (Plague Marines firefight ploy): for the rest of this activation, Disgustingly Resilient
  // always takes 1 off (to a minimum of 2) without rolling. Used when it saves at least 2 damage or a life.
  const actKey = g ? `${g.tp}:${g.active}` : null;
  if (g && TEAM_MAP[target.team].resilient && target.sickAct !== actKey) {
    const big = amounts.filter((x) => x >= 3).length;
    if ((big >= 2 || amounts.reduce((s, x) => s + x, 0) >= target.wounds) && big && autoFF(g, target.side, 'sickeningResilience')) target.sickAct = actKey;
  }
  if (g && target.sickAct === actKey) {
    let dmg = 0;
    for (const a of amounts) dmg += a >= 3 ? Math.max(2, a - 1) : a;
    return { dmg, rolls: [] };
  }
  const brace = !!tpl(target).insensiblePain || !!g && (braced(g, target) || (g.reinforce?.[target.side]?.t === target.uid && !getOp(g, g.reinforce[target.side].by)?.dead));
  let dmg = 0;
  const rolls = [];
  for (const a0 of amounts) {
    const a = brace && a0 >= 3 ? a0 - 1 : a0;
    let d = a;
    if (isArchon(target) && target.drug === 'painbringer' && a >= 3) { const roll = d6(); if (roll === 6) d--; rolls.push({ dmg: a, roll, saved: roll === 6 }); }
    if (resilient && a >= 3) {
      const roll = d6();
      if (roll >= need) d--;
      rolls.push({ dmg: a, roll, saved: roll >= need });
    }
    dmg += d;
  }
  return { dmg, rolls };
}

/** Poison: damaging an enemy (not a friendly) with a Poison weapon gives it a Poison token. */
function poisonOnHit(g, op, target, rules, dealt) {
  if (!rules.poison || dealt <= 0 || target.side === op.side || target.poison || target.dead) return false;
  target.poison = true;
  log(g, { zh: `${opName(target, 'zh')} 中毒`, en: `${opName(target, 'en')} is poisoned` }, `side${op.side}`);
  return true;
}

/** Stun: with any retained crit, the target gets -1 APL until the end of its next activation. */
function stunOnCrit(g, rules, crits, target) {
  if (!rules.stun || crits <= 0 || target.dead || tpl(target).chemEnhanced) return false; // Chem-enhanced: not affected by Stun
  changeApl(g, target, -1);
  log(g, { zh: `${opName(target, 'zh')} 昏迷：下次啟動 APL -1`, en: `${opName(target, 'en')} is stunned: -1 APL next activation` }, `side${1 - target.side}`);
  return true;
}

/**
 * One shooting sequence (attack dice, defence dice, damage) against one target, as a generator so the
 * caller can stop after the attack dice and after the defence dice (Command Re-roll) before damage is
 * dealt. It yields {stage: 'attack' | 'defence', seq}; `seq` holds the dice pools and who can re-roll.
 */
function* shootSequence(g, op, weapon, target, vis, noReroll = false, poisonedAtStart = null) {
  const rules = effectiveRules(g, op, weapon, target);
  if (corsairEquip(g, target, 'mistfield') && edgeDist(op, target) > 3 && rules.piercing && g.mistfieldTP?.[target.side] !== g.tp) { rules.piercing--; (g.mistfieldTP ||= [0, 0])[target.side] = g.tp; }
  if (noReroll) { delete rules.balanced; delete rules.ceaseless; delete rules.relentless; } // Suppressing Fire
  let hit = weapon.hit;
  if (!rules.fixedHit) {
    // injured / Contagion / Mindburn; Quicksilver Speed: a Slaanesh Legionary that moved, shot from more than 6"
    hit += hitWorse(g, op, weapon) || (markOf(target) === 'slaanesh' && quick(g, target) && edgeDist(op, target) > 6) ? 1 : 0;
    if (rules.mlHit && hit > 3) hit = Math.max(3, hit - 1);
  }
  hit = clampHit(hit);
  const atk = Math.max(1, weapon.atk + (rules.atkPlus || 0) - (cursed(g, op, 'barrelwarp') ? 1 : 0)); // Barrelwarp (Gellerpox)
  const a = rollPool(atk, hit, rules.lethal || 6, rules);
  archonPrey(g, op, target, a);
  const seq = { op: op.uid, target: target.uid, weapon, a, d: null, hit, rerolled: {}, noReroll: { a: noReroll || noRerollHere(g, op) || neurostatic(g, op) || broadcastNear(g, op), d: noRerollHere(g, target) } };
  yield { stage: 'attack', seq };
  const inCover = vis.cover && !rules.ignoreCover;
  // Toxic: +1 to both Dmg against an enemy that was poisoned at the start of the action.
  // Close Assault (Navy Breachers): Navis shotguns +1 to both Dmg (counted with Toxic's bonus).
  // (Anti-PSYKER, Novitiate Condemnor: +1 to both Dmg against a psyker.)
  const tox = (rules.toxic && poisonedAtStart?.has(target.uid) ? 1 : 0) + (rules.closeAssault && weapon.rules.shotgun ? 1 : 0) + (rules.antiPsykerOn ? 1 : 0);
  // Xenotech Shielding (Archivist): Normal and Critical Dmg of 4+ deal 1 less.
  const shield = (d) => (tpl(target).xenotech && d >= 4 ? d - 1 : d);
  const tough = (d) => ((tpl(target).tough || bulwark(g, target)) && d >= 3 ? d - 1 : d); // Tough (Thug) / Bulwark Imperative: Normal Dmg of 3+ deals 1 less
  const refined = isArchon(op) && op.acted.refinedSequence && ['haSplinterRifle', 'haSplinterPistol', 'haCannonF', 'haCannonS', 'haShardcarbine', 'haStinger'].includes(weapon.id) ? 1 : 0;
  const dn = tough(shield(refined + normalDmg(weapon, target, g, op) + tox));
  // Hardy (Cold-blood): a critical hit can inflict Normal Dmg instead.
  let dc = tpl(target).hardyCrit ? Math.min(shield(weapon.dmg[1] + tox), dn) : shield(weapon.dmg[1] + tox);
  const camo = !!tpl(target).camoCloak; // Camo Cloak ignores Saturate
  const rogue = hasPloy(g, target.side, 'rogue'); // Rogue: ignore Saturate, and Stealthy-style cover saves
  const saturated = rules.saturate && !camo && !rogue && !tpl(target).cultAgent; // Cult Agents ignore Saturate
  // Defence dice and retained saves, with or without the cover save.
  const defence = (useCover, crits) => {
    // Xenotech Shielding (Archivist) ignores Piercing.
    // Cult Agent (Wyrmblade): Piercing is ignored (Piercing Crits still applies).
    const pierce = tpl(target).xenotech || tpl(target).daemonic ? 0 : tpl(target).cultAgent ? (crits > 0 ? rules.piercingCrits || 0 : 0) : (rules.piercing || 0) + (crits > 0 ? rules.piercingCrits || 0 : 0);
    // Extra Defence (NEMESIS): one more defence die unless injured (Xenotech: even when injured).
    const extraDef = tpl(target).nemesis && (!isInjured(target) || tpl(target).xenotech) ? 1 : 0;
    // The number of defence dice is the target's Defence stat (datacards without one roll 3).
    const defDice = Math.max(0, (tpl(target).def ?? DEFENCE_DICE) + extraDef - pierce);
    // A Concealed target in cover can't be shot at all, so any target here that's in cover gets the cover save.
    const base = useCover && !saturated ? 1 : 0;
    let coverN = base, coverC = 0;
    if (base && (hasTactic(g, target, 'stealthy') || rogue || tpl(target).cultAgent)) {
      // Stealthy: one more cover save, or one as a critical; Camo Cloak with the Stealthy tactic gets both.
      if (camo && g.tactics?.[target.side]?.includes('stealthy')) coverC = 1;
      else if (crits > 0) { coverN--; coverC = 1; } else coverN++;
    }
    // Skulk About: a Concealed target retains one more defence die as a normal success.
    const skulk = target.order === 'conceal' && hasPloy(g, target.side, 'skulkAbout') ? 1 : 0;
    coverN += skulk;
    if (base && tpl(target).camo1) coverN++; // Camo Cloak (Blooded Sharpshooter): one more cover save
    // Reckless Determination (Fellgor ploy): an expended friendly without cover saves retains one die as a normal success.
    if (!base && !target.ready && TEAM_MAP[target.team].frenzy && hasPloy(g, target.side, 'recklessDetermination')) coverN++;
    // Undying Androids (Hierotek ploy): without cover saves, one defence die is retained as a normal success.
    if (!base && target.side < 2 && isHierotek(target) && hasPloy(g, target.side, 'undyingAndroids')) coverN++;
    coverC = Math.min(coverC, defDice);
    coverN = Math.min(coverN, defDice - coverC);
    // Take Cover: if cover saves can be retained, the Save stat improves by 1.
    // Gong Knell (Deathknell): +1 Save when shot until its next activation.
    // Aggressor Imperative (Hunter Clade): the Save is worsened by 1.
    const save = Math.min(6, Math.max(2, tpl(target).save - (base && hasPloy(g, target.side, 'takeCover') ? 1 : 0) - (target.gongOn ? 1 : 0)) + (deprecated(g, target, 'aggressor') ? 1 : 0));
    return { pierce, defDice, base, coverN, coverC, skulk, save };
  };
  // Only a shared terrain feature forces a cover/obscuring choice. Independent features stack.
  let useObscured = !!vis.obscured, useCover = inCover;
  const coverChoice = useObscured && useCover && !!vis.defenceOptions?.length && !vis.defenceOptions.some(o => o.cover && o.obscured);
  if (coverChoice) {
    const critOn = hasTactic(g, target, 'hardy') ? 5 : 6, devD = rules.devastating || 0;
    const ex = (ac, an, o) => expectedDamage(ac, an, o.defDice - o.coverN - o.coverC, o.save, critOn, o.coverN, o.coverC, dn, dc) + devD * ac;
    const att = a.crits + a.norms;
    const withCover = ex(a.crits, a.norms, defence(true, a.crits));
    const withObsc = ex(0, Math.max(0, att - 1), defence(false, 0));
    if (withCover < withObsc) useObscured = false; else useCover = false;
  }
  if (useObscured) { a.post = obscure; tally(a); }
  // Devastating x: each retained critical success inflicts x damage straight away, before any defence dice.
  // (x" Devastating also hits each other operative visible to and within x" of the target.)
  const before = target.wounds;
  let devDmg = 0;
  if (rules.devastating && a.crits > 0) {
    devDmg = resolveDice(target, Array(a.crits).fill(rules.devastating), g).dmg;
    log(g, { zh: `毀滅：${a.crits} 個暴擊立刻造成 ${devDmg} 傷害`, en: `Devastating: ${a.crits} crit(s) inflict ${devDmg} damage at once` }, `side${op.side}`);
    applyDamage(g, op, target, devDmg);
    if (rules.devSplash) {
      for (const o of g.ops.filter((x) => !x.dead && x !== target && !tpl(x).blastPadding && !corsairEquip(g, x, 'diuturnalMantles') && x.x > -50 && edgeDist(x, target) <= rules.devSplash && visibility(g, target, x).visible)) {
        const sp = resolveDice(o, Array(a.crits).fill(rules.devastating), g).dmg;
        log(g, { zh: `毀滅波及 ${opName(o, 'zh')}：${sp} 傷害`, en: `Devastating splashes ${opName(o, 'en')}: ${sp} damage` }, `side${op.side}`);
        applyDamage(g, op, o, sp);
      }
    }
    // Incapacitated by the Devastating damage: the sequence ends here, no defence dice are rolled.
    if (target.dead) {
      seq.d = { dice: [], crits: 0, norms: 0 }; seq.save = tpl(target).save; seq.defDice = 0; seq.coverN = 0; seq.coverC = 0;
      return {
        target: target.uid, rules, hit, atk, attack: a, save: tpl(target).save, defDice: 0, coverSaves: 0, coverCrit: 0,
        inCover: useCover, obscured: useObscured, coverOrObscured: coverChoice, saturated: false, skulk: 0, pierce: 0, defence: seq.d, dmg: devDmg, dev: devDmg, tox, resilient: [], poisoned: false, stunned: false,
        remC: a.crits, remN: a.norms, before, after: 0, killed: true,
      };
    }
  }
  // Sturdy (Hearthkyn firefight ploy): the attacker's retained crits become normal successes.
  if (a.crits > 0 && autoFF(g, target.side, 'sturdy')) {
    for (const x of a.dice) if (x.res === 'crit') { x.res = 'norm'; x.obsc = true; }
    a.norms += a.crits; a.crits = 0; a.post = null;
  }
  const { pierce, defDice, base, coverN, coverC, skulk, save } = defence(useCover, a.crits);
  // Indomitus: with two or more fails, discard one to retain another as a normal success (recomputed after a re-roll).
  const indomitus = hasPloy(g, target.side, 'indomitus') ? (pool) => {
    const misses = pool.dice.filter((x) => x.res === 'miss');
    if (misses.length >= 2) { misses[0].res = 'norm'; misses[0].indo = true; pool.norms++; }
  } : null;
  // The Emperor Protects (Zealot): re-roll any defence dice. Dig In! (order): one result, if cover saves can be retained.
  // Plagueridden Determination (Gellerpox): an Engage-order operative re-rolls one defence die.
  // Defence marker (Hearthkyn Tactician): within 3", re-roll one defence die.
  // Defence Order (Navy Breachers): within 3" of the marker, re-roll all defence dice of one result (as Dig In!).
  // Void Armour: against Blast / Torrent (not a sweeping profile), re-roll one defence die (two for the Grenadier).
  const voidArmour = (TEAM_MAP[target.team].voidArmour || tpl(target).blastPadding) && (weapon.rules.blast || weapon.rules.torrent) && !/sweeping/i.test(weapon.name.en);
  // Protected by Fate (Sorcerer of Destiny): re-roll any defence dice.
  // Shielding (Trench Sweeper): re-roll any defence dice. Malevolent Grit (Blooded): re-roll one.
  const grit = TEAM_MAP[target.team].bloodedTokens && hasPloy(g, target.side, 'malevolentGrit') && (target.bloodToken || whollyIn(g, target, 1 - target.side));
  const defRules = { relentless: !!tpl(target).emperorProtects || psyOn(g, 'fate', target.side, target) || !!target.shieldingOn,
    digIn: (base > 0 && guardOrder(g, target) === 'digIn') || navyOrderNear(g, target, 'defence'),
    balanced: (hasPloy(g, target.side, 'plagueridden') && target.order === 'engage') || defenceMarker(g, target) || grit || inviolate(g, target)
      || (base > 0 && TEAM_MAP[target.team].skillAtArms && hasPloy(g, target.side, 'engageFromCover')), // Engage From Cover (Kasrkin)
    rerollFails: voidArmour ? (tpl(target).voidGrenadier ? 2 : 1) : 0 };
  archonDefence(g, target, op, defRules);
  corsairDefence(g, target, weapon, defRules);
  if (voxbroken(g, target)) { defRules.relentless = false; defRules.digIn = false; defRules.balanced = false; defRules.rerollFails = 0; } // Voxbreak
  // Wrought Defence (Hearthkyn): with one or no successes, one fail is retained as a normal success.
  const wrought = hasPloy(g, target.side, 'wroughtDefence') ? (pool) => {
    const miss = pool.dice.find((x) => x.res === 'miss');
    if (miss && pool.crits + pool.norms <= 1) { miss.res = 'norm'; miss.indo = true; pool.norms++; }
  } : null;
  const post = indomitus || wrought ? (pool) => { indomitus?.(pool); wrought?.(pool); } : null;
  const d = rollPool(defDice - coverN - coverC, save, hasTactic(g, target, 'hardy') ? 5 : 6, defRules, post);
  seq.d = d; seq.save = save; seq.defDice = defDice; seq.coverN = coverN; seq.coverC = coverC;
  yield { stage: 'defence', seq };
  // Fickle Fates (Legionaries): a ready Tzeentch operative that retains a critical save retains one fail as a normal save.
  if (markOf(target) === 'tzeentch' && target.ready && hasPloy(g, target.side, 'fickleFates') && d.crits > 0) { const x = d.dice.find((y) => y.res === 'miss'); if (x) { x.res = 'norm'; x.indo = true; d.norms++; } }
  // Transhuman Physiology (Angels / Phobos firefight ploy): one normal save is retained as a critical one,
  // when that could block a crit that would otherwise get through.
  if (d.norms > 0 && a.crits > d.crits + coverC && autoFF(g, target.side, 'transhuman')) {
    const x = d.dice.find((y) => y.res === 'norm'); x.res = 'crit'; x.prom = true; d.norms--; d.crits++;
  }
  // War Gong: crits that get through inflict Normal Dmg instead (when that's better, or to keep a Frenzied Fellgor up).
  const wasFrenzy = !!target.frenzy;
  const gong = warGong(g, target) && (dn < dc || wasFrenzy);
  const block = bestBlock(a.crits, a.norms, d.crits + coverC, d.norms + coverN, dn, gong ? dn : dc);
  if (gong) dc = dn;
  const dev = devDmg; // (already inflicted, straight after the attack dice)
  // Weavefield Crest (Theyn): once per battle, ignore the Normal Dmg of one attack die.
  const crest = block.remN > 0 && dn > 0 && useCrest(g, target);
  const normals = Array(Math.max(0, block.remN - (crest ? 1 : 0))).fill(dn);
  if (normals.length && corsairShield(g, target)) normals.shift();
  // Just a Scratch (Kommandos) ignores one normal hit; All Is Dust (Rubric Marines) makes one deal 1.
  if (normals.length && dn >= 3 && autoFF(g, target.side, 'justScratch')) normals.pop();
  else if (normals.length && dn >= 2 && tpl(target).automata && autoFF(g, target.side, 'allIsDust')) normals[0] = 1;
  // Critical Shot (Phobos firefight ploy): +D3 damage with a critical success (once per action).
  const critShot = block.remC > 0 && ffOn(g, op, 'criticalShot') && !g.ffAtk.critShotDone ? d3() : 0;
  if (critShot) g.ffAtk.critShotDone = true;
  if (normals.length && normals[0] >= 3 && skillOn(g, target, 'iceInVeins')) normals[0]--; // Ice In Your Veins (Kasrkin)
  // Defenders of the Faith (Novitiates): contesting an objective, one normal success deals half (rounding up, min 2).
  if (normals.length && normals[0] > 2 && TEAM_MAP[target.team]?.actsOfFaith && hasPloy(g, target.side, 'defendersFaith') && contesting2(g, target)) normals[0] = Math.max(2, Math.ceil(normals[0] / 2));
  // Blazing Inferno (Novitiate firefight ploy): critical damage from the Ministorum flamer leaves a Blaze token.
  if (ffOn(g, op, 'blazingInferno') && weapon.id === 'ministorumFlamer' && block.remC > 0 && target.side < 2) target.blaze = op.side;
  // Unleash Daemon (4+ deals 1 less), else Disgusting Vigour (Nurgle) — never more than 1 off a die.
  for (let i = 0; i < normals.length; i++) { const a2 = daemonShell(target, normals[i]); normals[i] = a2 < normals[i] ? a2 : nurgleVigour(g, target, normals[i]); }
  const res = resolveDice(target, [...Array(block.remC).fill(daemonShell(target, dc)), ...normals, critShot].filter((x) => x > 0), g);
  const dmg = res.dmg + devDmg; // (reported with the Devastating damage dealt earlier)
  let killed = target.dead || applyDamage(g, op, target, res.dmg);
  if (killed && weapon.rules.stinger) stingerBurst(g, op, target);
  // Frenzy: shooting fells a Frenzied Fellgor with Critical Dmg, or Normal Dmg from two or more dice.
  if (wasFrenzy && ((block.remC > 0 && dc > 0 && !gong) || block.remN + (gong ? block.remC : 0) >= 2)) killed = frenzyDie(g, target, op);
  g.frenzyNow = null;
  const poisoned = poisonOnHit(g, op, target, rules, block.remC + block.remN > 0 ? dmg : 0);
  const stunned = stunOnCrit(g, rules, a.crits, target);
  // Mindburn (Sorcerer of Warpfire): damage from a critical success gives the target the token (moved from any previous target).
  if (rules.mindburn) {
    const burnt = block.remC > 0 && dmg > 0 && !target.dead;
    (g.mindburn ||= [null, null])[op.side] = burnt ? target.uid : null;
    if (burnt) log(g, { zh: `心靈灼燒：${opName(target, 'zh')} 武器命中變差 1，直到它下次啟動結束`, en: `Mindburn: ${opName(target, 'en')}'s weapons worsen their Hit by 1 until the end of its next activation` }, `side${op.side}`);
  }
  return {
    target: target.uid, rules, hit, atk, attack: a, save, defDice, coverSaves: coverN + coverC, coverCrit: coverC,
    inCover: useCover, obscured: useObscured, coverOrObscured: coverChoice, saturated: rules.saturate && useCover && !base, skulk, pierce, defence: d, dmg, dev, tox, resilient: res.rolls, poisoned, stunned,
    remC: block.remC, remN: block.remN, before, after: target.wounds, killed,
  };
}

/** Other targets hit by Torrent / Blast after the primary target. */
function secondaryTargets(g, op, weapon, primary) {
  const { torrent, blast, salvo } = weapon.rules;
  if (salvo) {
    // Salvo: a second valid target (the most wounded one).
    const second = foes(g, op).filter((t) => t !== primary && shootCheck(g, op, t, weapon, true).ok)
      .sort((a, b) => a.wounds - b.wounds)[0];
    return second ? [second] : [];
  }
  if (torrent) {
    return foes(g, op).filter((t) => t !== primary && edgeDist(primary, t) <= torrent + 0.01
      && shootCheck(g, op, t, weapon, true).ok);
  }
  if (blast) {
    // Any operative (friend or foe) visible to and within x of the primary target; Conceal doesn't matter.
    return g.ops.filter((t) => !t.dead && t !== primary && t !== op && edgeDist(primary, t) <= blast + 0.01
      && visibility(g, primary, t).visible);
  }
  return [];
}

/** Suppressing Fire: the shooter can't re-roll attack dice unless the target is the closest valid target. */
function suppressed(g, op, weapon, target) {
  if (!hasPloy(g, target.side, 'suppressingFire')) return false;
  // Ignore operatives with a Conceal order or that would be obscured.
  const cands = living(g, target.side).filter((t) => t.order !== 'conceal' && visibility(g, op, t).visible && !shotVisibility(g, op, t, weapon).obscured
    && shootCheck(g, op, t, weapon).ok);
  const closest = Math.min(...cands.map((t) => edgeDist(op, t)));
  return edgeDist(op, target) > closest + 0.01;
}

/**
 * Resolve a Shoot action all the way, with the computer's Command Re-roll decisions for every side
 * (used by the AI and tests). The interface steps through `shootFlow` instead so a human can decide.
 */
export function resolveShoot(g, op, weapon, target) {
  const it = shootFlow(g, op, weapon, target);
  let r = it.next();
  while (!r.done) {
    const { stage, seq } = r.value;
    const which = stage === 'attack' ? 'a' : 'd';
    const side = stage === 'attack' ? getOp(g, seq.op).side : getOp(g, seq.target).side;
    aiPain(g, getOp(g, which === 'a' ? seq.op : seq.target), seq, which, tally);
    const i = aiRerollChoice(g, side, seq, which);
    if (i >= 0) commandReroll(g, side, seq, which, i);
    const act = aiFaith(g, side, seq, which); // Acts of Faith (Novitiates)
    if (act) useFaith(g, side, seq, which, act, which === 'a' ? seq.op : seq.target);
    r = it.next();
  }
  return r.value;
}

/** The Shoot action as a generator: yields after each dice roll (see shootSequence) and returns the result. */
export function* shootFlow(g, op, weapon, target) {
  const painBefore = painSnapshot(g);
  archonBeforeAttack(g, op, 'shoot');
  if (!['haSplinterRifle', 'haSplinterPistol', 'haCannonF', 'haCannonS', 'haShardcarbine', 'haStinger'].includes(weapon.id)) { if (op.acted.refinedSequence) g.archonEq[op.side].refinedPoison--; op.acted.refinedSequence = false; }
  const ap = shootWeapon(g, op, weapon).ap;
  if (op.acted.barrage) op.acted.nextBarrageWeapon = weapon.id;
  ffCommit(g, op, 'shoot', weapon, target); // firefight ploys chosen for this Shoot are paid now
  if (ffOn(g, op, 'livingLightning')) { // Living Lightning: Blast 2" instead of 2" Devastating
    const rules = { ...weapon.rules, blast: 2 }; delete rules.devSplash;
    weapon = { ...weapon, rules };
  }
  // Revolting Technology (Gellerpox firefight ploy): the shooter's weapon gains Hot for this action.
  const revolt = !weapon.rules.hot && target.side < 2 && autoFF(g, target.side, 'revoltingTech');
  const relay = weapon.rules.detonate ? null : magnifyRelay(g, op, target, weapon);
  const vis = weapon.rules.detonate ? { visible: true, cover: false, obscured: false } : shotVisibility(g, relay || op, target, weapon);
  g.magnifyNow = relay ? op.uid : null; // Magnify: Ceaseless until the end of the action
  if (relay) log(g, { zh: `${opName(op, 'zh')} 放大：借 ${opName(relay, 'zh')} 的視角射擊（無休）`, en: `${opName(op, 'en')} Magnify: shoots through ${opName(relay, 'en')} (Ceaseless)` }, `side${op.side}`);
  const others = secondaryTargets(g, op, weapon, target); // chosen before any damage is dealt
  const noReroll = suppressed(g, op, weapon, target);
  g.shotTargets = [target.uid, ...others.map((t) => t.uid)];
  const poisonedAtStart = new Set(g.ops.filter((o) => o.poison).map((o) => o.uid));
  const main = yield* shootSequence(g, op, weapon, target, vis, noReroll, poisonedAtStart);
  spend(g, op, 'shoot', ap);
  // Crossfire (Wyrmblade): remember who shot this target this turning point.
  if (target.shotBy?.tp !== g.tp) target.shotBy = { tp: g.tp, uids: [] };
  target.shotBy.uids.push(op.uid);
  const h = weapon.rules.heavy; // the one move still allowed (Heavy (X only)), or 1 for none
  if (h) op.acted.heavy = typeof h === 'string' && (op.acted.heavy == null || op.acted.heavy === h) ? h : 1;
  if (weapon.group === 'bow') op.energised = 0; // Energise lasts until the bow is shot
  op.acted.shotWith = weapon.group;
  if (count(op, 'shoot') === 1) op.acted.shotRapid = rapidWeapon(weapon); // (Rapid Fire: a second Shoot)
  op.acted.shotTarget = target.uid;
  if (astartesShot(weapon)) op.acted.shotBolt = true;
  if (weapon.rules.limited) (op.used ||= {})[weapon.id] = (op.used[weapon.id] || 0) + 1;
  if (weapon.rules.equipGrenade) g.eqUses[op.side][weapon.rules.equipGrenade]--; // the team's grenades
  (op.used ||= {}).shoot = (op.used.shoot || 0) + 1; // Concealed Position
  if (op.acted.free?.shoot) { op.acted.free.shoot = null; if (op.acted.ancestors) op.acted.free.fight = null; } // (The Ancestors Are Watching: a free Shoot OR Fight)
  const logShot = (t, s) => log(g, {
    zh: `${opName(op, 'zh')} 以${weapon.name.zh}（${weapon.name.en}）射擊 ${opName(t, 'zh')}：${s.dmg} 傷害`,
    en: `${opName(op, 'en')} shoots ${opName(t, 'en')} with ${weapon.name.en}: ${s.dmg} damage`,
  }, `side${op.side}`);
  logShot(target, main);
  const extra = [];
  for (const t of others) {
    if (t.dead) continue;
    // Torrent and Salvo targets use their own cover; Blast targets are in cover if the primary target was.
    const v = weapon.rules.blast ? vis : shotVisibility(g, op, t, weapon);
    const s = yield* shootSequence(g, op, weapon, t, v, noReroll, poisonedAtStart);
    logShot(t, s);
    extra.push(s);
  }
  // Hot: roll one D6 per action; below the Hit stat, the shooter takes twice the result.
  let hot = null;
  if ((weapon.rules.hot || revolt) && !op.dead) {
    const roll = d6();
    hot = { roll, dmg: roll < main.hit ? roll * 2 : 0 };
    if (hot.dmg) {
      log(g, { zh: `${opName(op, 'zh')} 武器過熱（擲 ${roll}）：自身受到 ${hot.dmg} 傷害`, en: `${opName(op, 'en')} overheats (rolled ${roll}): takes ${hot.dmg} damage` }, `side${op.side}`);
      hot.killed = applyDamage(g, op, op, hot.dmg);
    }
  }
  if (op.acted.darknessTarget === target.uid) op.acted.darknessUsed = true;
  archonAfterAction(g, op, painBefore);
  g.shotTargets = null;
  g.magnifyNow = null;
  op.shotTP = g.tp; // (Interstitial Command can't give a Shoot to one that already shot this turning point)
  // Deathmarked: a Deathmark's surviving primary target gains a token; Deathmarks shooting it have Seek.
  if (tpl(op).deathmark && !target.dead && !(target.dmk?.[op.side])) {
    (target.dmk ||= {})[op.side] = true;
    log(g, { zh: `${opName(target, 'zh')} 獲得死亡標記（死亡標記射擊它時武器「搜尋」）`, en: `${opName(target, 'en')} gains a Deathmarked token (Deathmarks shooting it have Seek)` }, `side${op.side}`);
  }
  if (g.proxy?.uid === op.uid) endProxy(g); // Interstitial Command's free Shoot is done
  // Siphon Life (life siphon): heal a friendly for the dice that inflicted damage.
  if (weapon.rules.siphon && !op.dead) siphonLife(g, op, [...Array(main.remC).fill(true), ...Array(main.remN).fill(false)].slice(0, main.dmg > 0 ? 99 : 0));
  g.ffAtk = null;
  if (op.acted.contemptuous) op.acted.contemptUsed = true;
  corsairAfterAction(g, op);
  faithRejuvenate(g); // Blessed Rejuvenation (Novitiates)
  for (const o of g.ops) o.medicShield = false;
  return { kind: 'shoot', attacker: op.uid, weapon, ap, ...main, extra, hot, suppressed: noReroll };
}

export function bestMelee(op) {
  const ws = archonWeapons(op).filter((w) => w.type === 'melee');
  return ws.sort((a, b) => avgDmg(b) - avgDmg(a))[0];
}

export function avgDmg(w, hitMod = 0) {
  const hit = clampHit(w.hit + hitMod);
  const crit = w.rules.lethal || 6;
  const pc = (7 - crit) / 6, ph = Math.max(0, (7 - hit) / 6 - pc);
  return w.atk * (pc * (w.dmg[1] + (w.rules.devastating || 0)) + ph * w.dmg[0]);
}

// ---------- melee ----------
// A fight lives in g.fight while it is being resolved, so a human player can choose
// Strike or Parry for each die. Both sides roll; the attacker resolves first, then they alternate.
const weaponById = (op, id) => archonWeapons(op).find((w) => w.id === id);
const other = (k) => (k === 'A' ? 'D' : 'A');
const left = (p) => p.c + p.n;

export function startFight(g, op, weapon, target) {
  // Bad-tempered (Kroot Hound): an enemy fighting while the hound is a valid choice must fight the hound.
  const hound = engagedEnemies(g, op).find((e) => tpl(e).badTempered);
  if (hound && hound !== target && !tpl(target).badTempered) {
    log(g, { zh: `${opName(hound, 'zh')} 脾氣暴躁：${opName(op, 'zh')} 必須改打牠`, en: `${opName(hound, 'en')} Bad-tempered: ${opName(op, 'en')} must fight it instead` }, `side${hound.side}`);
    target = hound;
  }
  const free = op.acted.free?.fight; // Savage Assault (an enemy uid), Stealth Attack ('stealth') or Swipe ('swipe')
  if (free === 'swipe') weapon = tpl(op).weapons.find((w) => w.rules.swipe); // the free Fight must use the swipe profile
  if (weapon.rules.swipe) (op.acted.swiped ||= []).push(target.uid);
  const painBefore = painSnapshot(g);
  archonBeforeAttack(g, op, 'fight'); archonBeforeAttack(g, target, 'fight');
  const dWeapon = bestMelee(target);
  ffCommit(g, op, 'fight', weapon, target); // firefight ploys chosen for this Fight are paid now
  const ar = effectiveRules(g, op, weapon, target);
  const dr = effectiveRules(g, target, dWeapon, op);
  // Rust Emanations (Gellerpox): a Nightmare Hulk fighting — the opponent can't retain results of 3.
  if (tpl(op).hulk && hasPloy(g, op.side, 'rustEmanations')) dr.no3 = true;
  // Blessings of Infection (Gellerpox): adjusts the fight dice of its operatives.
  const bless = (o) => (hasPloy(g, o.side, 'blessingsInfection') ? blessings : null);
  // Assist: another friendly operative within the enemy's control range improves the Hit stat by 1.
  // Brawler (Dôzr): enemies fighting it can't be assisted.
  // Devastating Onslaught (Legionary Butcher): enemies fighting it can't be assisted either.
  const assist = (me, foe) => !tpl(foe).brawler && !tpl(foe).noAssistVs && living(g, me.side).some((f) => f !== me && edgeDist(f, foe) <= CONTROL + 0.01);
  const aAssist = assist(op, target), dAssist = assist(target, op);
  // Quicksilver Speed (Legionaries): against a Legionary that moved this TP, melee Hit is worsened by 1 (not with injured).
  const aHit = clampHit(weapon.hit + (hitWorse(g, op, weapon) || quick(g, target) ? 1 : 0) - (aAssist ? 1 : 0));
  const dHit = clampHit(dWeapon.hit + (hitWorse(g, target, dWeapon) || quick(g, op) ? 1 : 0) - (dAssist ? 1 : 0));
  // Cut-throats: +1 Atk to a maximum of 5.
  const atk = (w, r) => (r.atkPlus ? Math.max(w.atk, Math.min(r.atkMax || 5, w.atk + r.atkPlus)) : w.atk); // (For Cadia!: max 4)
  // Whip Control (Herd-goad): -1 Atk on the melee weapons of a whipped enemy (to a minimum of 1).
  const whip = (o, n) => (n > 0 && whipped(g, o) ? Math.max(1, n - 1) : n);
  // Ambush (Fellgor ploy): when it fights after springing from Conceal, a normal becomes a crit (or a fail a normal).
  const ambush = TEAM_MAP[op.team].frenzy && hasPloy(g, op.side, 'ambushFG') && !op.frenzy && op.prevOrder === 'conceal' && op.order === 'engage';
  const ambushPost = (pool) => {
    const n = pool.dice.find((x) => x.res === 'norm'), m = pool.dice.find((x) => x.res === 'miss');
    if (n) { n.res = 'crit'; n.rend = true; pool.norms--; pool.crits++; } else if (m) { m.res = 'norm'; m.indo = true; pool.norms++; }
  };
  const aPost = ambush ? (bless(op) ? (p) => { bless(op)(p); ambushPost(p); } : ambushPost) : bless(op);
  let aRoll = rollPool(whip(op, atk(weapon, ar)), aHit, ar.lethal || 6, ar, aPost);
  let dRoll = rollPool(whip(target, atk(dWeapon, dr)), dHit, dr.lethal || 6, dr, bless(target));
  // Violent Temperament (Fellgor ploy): re-roll all the attack dice when fewer than two succeeded.
  const violent = (o, roll, w, r, hit, post) => (TEAM_MAP[o.team].frenzy && hasPloy(g, o.side, 'violentTemperament') && roll.crits + roll.norms < 2 && roll.dice.length >= 2
    ? (() => { const re = rollPool(whip(o, atk(w, r)), hit, r.lethal || 6, r, post); for (const d of re.dice) if (!d.auto) d.rr = true; return re; })() : roll);
  aRoll = violent(op, aRoll, weapon, ar, aHit, aPost);
  dRoll = violent(target, dRoll, dWeapon, dr, dHit, bless(target));
  archonPrey(g, op, target, aRoll);
  spend(g, op, 'fight');
  if (free) { op.acted.free.fight = null; if (op.acted.ancestors && op.acted.free.shoot === 'any') op.acted.free.shoot = null; }
  // dueller: (Chapter Tactic) a normal success can block a critical success.
  // tox: Toxic bonus (foe poisoned at the start of the action); shock: Shock not used yet this sequence;
  // hardy: Cold-blood takes Normal Dmg from critical strikes; extraStrike: Stealth Attack.
  // a: the dice pool (re-rolled with Command Re-roll before any dice are resolved).
  const side = (o, foe, w, r, roll, hit) => ({
    uid: o.uid, w: w.id, c: roll.crits, n: roll.norms, brutal: !!r.brutal, dueller: hasTactic(g, o, 'dueller'), hit, dice: roll.dice, before: o.wounds,
    tox: (r.toxic && foe.poison ? 1 : 0) + (r.antiPsykerOn ? 1 : 0), poison: !!r.poison, shock: !!r.shock && !hasTactic(g, foe, 'resolute') && !tpl(foe).chemEnhanced && !tpl(foe).toxicBlessings, hardy: !!tpl(o).hardyCrit,
    a: roll, rerolled: {}, noReroll: { a: noRerollHere(g, o) || neurostatic(g, o) || broadcastNear(g, o) },
    // +1 damage on the first critical strike: Canticle of Destruction (Ruststalkers near the Princeps).
    critBonus: tpl(o).ruststalker && living(g, o.side).some((p) => tpl(p).canticleDestruction && edgeDist(p, o) <= 3) ? 1 : 0,
  });
  // Repress (Exaction Squad shields): retaliating with it, the defender resolves the first die.
  g.fight = { A: side(op, target, weapon, ar, aRoll, aHit), D: side(target, op, dWeapon, dr, dRoll, dHit), turn: dWeapon.rules.repress && !weapon.rules.repress ? 'D' : 'A', steps: [], done: false };
  g.fight.painBefore = painBefore;
  if (tpl(target).faolchuBond && target.ready && target.faolchuTP !== g.tp) { target.faolchuTP = g.tp; g.fight.turn = 'D'; }
  if (op.acted.darknessTarget === target.uid) op.acted.darknessUsed = true;
  g.fight.A.assist = aAssist; g.fight.D.assist = dAssist;
  if (free === 'stealth') g.fight.A.extraStrike = true;
  // ---- Firefight ploys ----
  if (ffOn(g, op, 'shockAssault')) g.fight.A.firstBonus = 1; // the first strike deals 1 more (max 7)
  if (ffOn(g, op, 'animalisticFury')) g.fight.A.critBonus += 1;
  if (dRoll.crits > 0 && autoFF(g, target.side, 'animalisticFury')) g.fight.D.critBonus += 1; // (retaliating)
  if (op.omniTP === g.tp && doctrina(g, op)?.mode === 'conqueror') g.fight.A.extraStrike = true; // Omnissiah's Imperative
  // For Cadia! (Kasrkin) / Blood for the Blood God (Legionaries, not Khorne): the first strike deals 1 more.
  if (skillOn(g, op, 'forCadia') || (TEAM_MAP[op.team].marksOfChaos && hasPloy(g, op.side, 'bloodGod') && markOf(op) !== 'khorne')) g.fight.A.firstBonus = 1;
  // Blood for the Blood God: Khorne operatives' melee weapons +1 to both Dmg (max 7).
  for (const [k, o] of [['A', op], ['D', target]]) if (markOf(o) === 'khorne' && hasPloy(g, o.side, 'bloodGod')) g.fight[k].dmgPlus = 1;
  if (tpl(target).viciousReflexes) g.fight.turn = 'D'; // Vicious Reflexes (Shrivetalon): it resolves first when retaliating
  // Savage Ambush (Kinband firefight ploy): a ready Kroot by terrain that's fought against strikes first.
  if (target.ready && g.terrain.some((t) => distPointRect(target, t) - radius(target) <= CONTROL) && autoFF(g, target.side, 'savageAmbush')) g.fight.turn = 'D';
  // Savage Assault: the first Fight of the activation may be followed by a free one against the same enemy.
  if (tpl(op).savageAssault && !op.acted.savageUsed) { op.acted.savageUsed = true; g.fight.savage = true; }
  stunOnCrit(g, ar, aRoll.crits, target);
  stunOnCrit(g, dr, dRoll.crits, op);
  // Vicious Duellist (Cut-skin): 1 damage to the enemy for each of its attack dice discarded as a fail.
  for (const [me, foe, foeRoll, k] of [[op, target, dRoll, 'A'], [target, op, aRoll, 'D']]) {
    if (!tpl(me).viciousDuellist) continue;
    const fails = foeRoll.dice.filter((d) => d.res === 'miss').length;
    if (!fails) continue;
    log(g, { zh: `${opName(me, 'zh')} 兇猛決鬥者：${opName(foe, 'zh')} ${fails} 顆失敗骰，受到 ${fails} 傷害`, en: `${opName(me, 'en')} Vicious Duellist: ${opName(foe, 'en')} failed ${fails} dice and takes ${fails} damage` }, `side${me.side}`);
    applyDamage(g, me, foe, fails);
    g.fight.duellist = { side: k, dmg: fails };
  }
  // Screaming Rustspikes (Gellerpox Techno-curse): an infected enemy with any failed attack dice takes 1 damage.
  for (const [foe, foeRoll, k, me] of [[target, dRoll, 'A', op], [op, aRoll, 'D', target]]) {
    if (foe.dead || TEAM_MAP[me.team].tacticSlots !== 1 || !cursed(g, foe, 'rustspikes') || !foeRoll.dice.some((d) => d.res === 'miss')) continue;
    log(g, { zh: `尖嘯鏽刺：${opName(foe, 'zh')} 有攻擊骰失敗，受到 1 傷害`, en: `Screaming Rustspikes: ${opName(foe, 'en')} failed attack dice and takes 1 damage` }, `side${1 - foe.side}`);
    applyDamage(g, null, foe, 1);
    g.fight.rust = [...(g.fight.rust || []), k === 'A' ? 'D' : 'A'];
  }
  // Command Re-roll window: the computer decides at once; a human side that can re-roll gets to choose
  // before any dice are resolved (fightRerollDone closes the window).
  g.fight.rrOpen = {};
  for (const k of ['A', 'D']) {
    const side = fightOp(g, k).side, holder = g.fight[k];
    if (isComputer(g, side)) {
      aiPain(g, fightOp(g, k), holder, 'a', tally); syncFightSide(holder);
      const i = aiRerollChoice(g, side, holder, 'a');
      if (i >= 0) { commandReroll(g, side, holder, 'a', i); syncFightSide(holder); }
      const act = aiFaith(g, side, holder, 'a'); // Acts of Faith (Novitiates)
      if (act) { useFaith(g, side, holder, 'a', act, holder.uid); syncFightSide(holder); }
    } else if (canCommandReroll(g, side, holder, 'a') || canFaith(g, side, holder, 'a') || painRerollValues(g, fightOp(g, k), holder, 'a').length) g.fight.rrOpen[k] = true;
  }
  // Novitiate Penitent (Absolution Through Destruction): after a Fight it didn't get for free, a free Fight follows.
  if (tpl(op).absolution && !free) op.acted.free = { ...(op.acted.free || {}), fight: 'any' };
  // Whip Into Frenzy (Exactor): the first of its two Fights makes the second free.
  if (op.acted.whip && !free && count(op, 'fight') === 1) op.acted.free = { ...(op.acted.free || {}), fight: op.acted.free?.fight || 'any' };
  if (g.fight.rrOpen.A || g.fight.rrOpen.D) return g.fight;
  g.fight.rrOpen = null;
  advanceFight(g);
  return g.fight;
}

const syncFightSide = (s) => { s.c = s.a.crits; s.n = s.a.norms; s.dice = s.a.dice; };
function syncFightSideFromCounts(s) { s.a.crits = s.c; s.a.norms = s.n; }

/** A human player's Act of Faith in the fight (before any dice are resolved). */
export function fightFaith(g, k, act) {
  const f = g.fight;
  if (!f?.rrOpen?.[k]) return false;
  const ok = useFaith(g, fightOp(g, k).side, f[k], 'a', act, f[k].uid);
  if (ok) syncFightSide(f[k]);
  return ok;
}

/** A human player's Command Re-roll of one die in the fight (before any dice are resolved). */
export function archonReroll(g, op, holder, which, value) { return painReroll(g, op, holder, which, value, tally); }
export function archonFightReroll(g, k, value) { if (!g.fight?.rrOpen?.[k]) return false; const ok = archonReroll(g, fightOp(g, k), g.fight[k], 'a', value); if (ok) syncFightSide(g.fight[k]); return ok; }
export function archonAutoReroll(g, op, holder, which) { aiPain(g, op, holder, which, tally); }

export function fightCommandReroll(g, k, index) {
  const f = g.fight;
  if (!f?.rrOpen?.[k]) return false;
  const ok = commandReroll(g, fightOp(g, k).side, f[k], 'a', index);
  if (ok) syncFightSide(f[k]);
  return ok;
}

/** Close the Command Re-roll window and start resolving the fight dice. */
export function fightRerollDone(g) {
  if (!g.fight?.rrOpen) return;
  g.fight.rrOpen = null;
  advanceFight(g);
}

export const fightOp = (g, k) => getOp(g, g.fight[k].uid);
export const fightWeapon = (g, k) => weaponById(fightOp(g, k), g.fight[k].w);
/** Which player (side 0/1) must choose next. */
export const fightChooser = (g) => fightOp(g, g.fight.turn).side;

/** Legal choices for the side whose turn it is. */
export function fightOptions(g) {
  const f = g.fight;
  if (!f.stanceDone) {
    f.stanceDone = true;
  for (const k of ['A', 'D']) if (tpl(fightOp(g, k)).bladedStance) {
    const me = g.fight[k], foe = g.fight[k === 'A' ? 'D' : 'A'];
    if (me.c && (foe.c || foe.n)) { me.c--; if (foe.c) foe.c--; else foe.n--; }
    else if (me.n && foe.n && !foe.brutal) { me.n--; foe.n--; }
    syncFightSideFromCounts(me);
    syncFightSideFromCounts(foe);
  }
    advanceFight(g); // Stance may remove the last die or change whose turn it is.
  }
  if (f.done) return [];
  const k = f.turn, me = f[k], foe = f[other(k)];
  const w = fightWeapon(g, k), foeOp = fightOp(g, other(k));
  const opts = [];
  // Shock Assault (firefight ploy): the first strike deals 1 more (to a maximum of 7).
  const first = (d) => (me.firstBonus ? Math.max(d, Math.min(7, d + 1)) : d);
  const plus = (d) => (me.dmgPlus ? Math.max(d, Math.min(7, d + me.dmgPlus)) : d); // Blood for the Blood God (Khorne)
  const normal = first(plus(normalDmg(w, foeOp, g, fightOp(g, k)) + (me.tox || 0)));
  // Headtaker: the skullcleaver's Critical Dmg grows with each kill.
  // Canticle of Destruction / Animalistic Fury: more damage on the first critical strike of the sequence.
  const critD = first(plus(w.dmg[1]) + (me.tox || 0) + (w.rules.headtaker ? fightOp(g, k).headBonus || 0 : 0) + (me.critBonus && !me.critBonusUsed ? me.critBonus : 0));
  if (me.c) opts.push({ id: 'strike-c', act: 'strike', die: 'c', dmg: foe.hardy ? Math.min(critD, normal) : critD });
  if (me.n) opts.push({ id: 'strike-n', act: 'strike', die: 'n', dmg: normal });
  // Parry: a crit cancels any success, a normal cancels a normal (not vs Brutal).
  if (me.c && foe.c) opts.push({ id: 'parry-c-c', act: 'parry', die: 'c', target: 'c' });
  if (me.c && foe.n) opts.push({ id: 'parry-c-n', act: 'parry', die: 'c', target: 'n' });
  if (me.n && foe.n && !foe.brutal) opts.push({ id: 'parry-n-n', act: 'parry', die: 'n', target: 'n' });
  if (me.n && foe.c && me.dueller && !foe.brutal) opts.push({ id: 'parry-n-c', act: 'parry', die: 'n', target: 'c' });
  // A success doesn't have to be used: discard it without striking.
  if (me.n) opts.push({ id: 'decline-n', act: 'decline', die: 'n' });
  else if (me.c) opts.push({ id: 'decline-c', act: 'decline', die: 'c' });
  return opts;
}

export function fightApply(g, optId) {
  const f = g.fight;
  if (f.rrOpen) fightRerollDone(g); // choosing a die to resolve closes the re-roll window
  if (f.done) return;
  const opt = fightOptions(g).find((o) => o.id === optId);
  if (!opt) return;
  const k = f.turn, me = f[k], foe = f[other(k)];
  me[opt.die]--;
  if (opt.act === 'strike' && opt.die === 'c' && me.critBonus) me.critBonusUsed = true;
  if (opt.act === 'strike' && me.firstBonus) me.firstBonus = 0; // Shock Assault: only the first strike
  if (opt.act === 'strike') {
    const meOp = fightOp(g, k), foeOp = fightOp(g, other(k));
    // Bruiser: once per turning point, ignore the damage from one normal success when fighting or retaliating.
    let shrug = opt.die === 'n' && tpl(foeOp).bruiser && foeOp.bruiserTP !== g.tp;
    if (shrug) foeOp.bruiserTP = g.tp;
    if (!shrug && opt.die === 'n' && corsairShield(g, foeOp)) shrug = true;
    if (!shrug && opt.die === 'n' && useCrest(g, foeOp)) shrug = true; // Weavefield Crest (Theyn)
    if (!shrug && opt.die === 'n' && opt.dmg >= 3 && autoFF(g, foeOp.side, 'justScratch')) shrug = true; // Just a Scratch (Kommandos)
    // Brawler (Dôzr): Normal Dmg of 4 or more inflicts 1 less when it's fighting or retaliating.
    // Tough (Blooded Thug): Normal Dmg of 3 or more inflicts 1 less.
    // War Gong: a critical strike inflicts Normal Dmg instead (when lower, or to keep a Frenzied Fellgor up).
    const wasFrenzy = !!foeOp.frenzy;
    const normalHit = normalDmg(fightWeapon(g, k), foeOp, g, meOp) + (me.tox || 0);
    const gong = opt.die === 'c' && warGong(g, foeOp) && (normalHit < opt.dmg || wasFrenzy);
    const dmg0 = gong ? normalHit : opt.dmg, asNormal = opt.die === 'n' || gong;
    let amount = asNormal && ((tpl(foeOp).brawler && dmg0 >= 4) || ((tpl(foeOp).tough || bulwark(g, foeOp)) && dmg0 >= 3)) ? dmg0 - 1 : dmg0;
    if (!shrug && opt.die === 'n' && amount >= 2 && tpl(foeOp).automata && autoFF(g, foeOp.side, 'allIsDust')) amount = 1; // All Is Dust (Rubric Marines)
    // Ice In Your Veins (Kasrkin): the first Normal Dmg of 3+ in the sequence deals 1 less.
    if (!shrug && asNormal && amount >= 3 && skillOn(g, foeOp, 'iceInVeins') && !foe.iceUsed) { foe.iceUsed = true; amount--; }
    // Unleash Daemon (4+ deals 1 less), else Disgusting Vigour (Nurgle, Normal Dmg 3+: 5+ = 1 less) — never more than 1 off.
    if (!shrug) { const a2 = daemonShell(foeOp, amount); amount = a2 < amount ? a2 : asNormal ? nurgleVigour(g, foeOp, amount) : amount; }
    const res = shrug ? { dmg: 0, rolls: [] } : resolveDice(foeOp, [amount], g); // Disgustingly Resilient
    // Shock: the first crit strike in the sequence also discards an unresolved enemy normal (else a crit).
    let shocked = null;
    if (opt.die === 'c' && me.shock) {
      me.shock = false;
      if (foe.n) { foe.n--; shocked = 'n'; } else if (foe.c) { foe.c--; shocked = 'c'; }
    }
    if (opt.die === 'c' && fightWeapon(g, k).rules.flay && !me.flayUsed) { me.flayUsed = true; const pick = living(g, meOp.side).filter((x) => edgeDist(x, meOp) <= 6).sort((a, b) => (a.pain || 0) - (b.pain || 0))[0]; if (pick) gainPain(g, pick); }
    let killed = applyDamage(g, meOp, foeOp, res.dmg);
    // Frenzy: a Frenzied Fellgor falls to a critical strike, or to a second normal one.
    if (wasFrenzy && !shrug) {
      if (!asNormal) killed = frenzyDie(g, foeOp, meOp);
      else if (++foeOp.frenzyHits >= 2) killed = frenzyDie(g, foeOp, meOp);
    }
    // Gaining a Frenzy token discards all remaining attack dice of the fight.
    if (g.frenzyNow === foeOp.uid) { f.A.c = f.A.n = f.D.c = f.D.n = 0; g.frenzyNow = null; }
    poisonOnHit(g, meOp, foeOp, { poison: me.poison }, res.dmg);
    // Headtaker (Gorehorn): a kill heals D3 (no Frenzy token) and adds D3 to the skullcleaver's Critical Dmg (max 8).
    if (killed && fightWeapon(g, k).rules.headtaker) {
      const r = d3();
      if (!meOp.frenzy && !meOp.dead) meOp.wounds = Math.min(meOp.maxW, meOp.wounds + r);
      meOp.headBonus = Math.min(8 - fightWeapon(g, k).dmg[1], (meOp.headBonus || 0) + r);
    }
    if (killed) meOp.meleeKill = true; // Apoplectic Rejuvenation heals 6 for it
    // Horrifying Dismemberment (Shrivetalon): another enemy visible within 3" of it or the victim gets -1 APL.
    if (killed && tpl(meOp).dismember && !meOp.dead) {
      const v = living(g, foeOp.side).filter((e) => e !== foeOp && (edgeDist(e, meOp) <= 3 && visibility(g, meOp, e).visible || edgeDist(e, foeOp) <= 3)).sort((x, y) => tpl(y).apl - tpl(x).apl)[0];
      if (v) { changeApl(g, v, -1); log(g, { zh: `恐怖肢解：${opName(v, 'zh')} 下次啟動 APL -1`, en: `Horrifying Dismemberment: ${opName(v, 'en')} gets -1 APL next activation` }, `side${meOp.side}`); }
    }
    // Stealth Attack: the first strike is followed straight away by another (before the opponent).
    // Tactual Hunter (Mangler): against an expended enemy, the first critical strike is followed by another.
    const tactual = opt.die === 'c' && fightWeapon(g, k).rules.tactualHunter && !foeOp.ready && !me.tactualUsed && !killed;
    if (tactual) me.tactualUsed = true;
    const again = (!!me.extraStrike || tactual) && left(me) > 0;
    me.extraStrike = false;
    f.steps.push({ side: k, act: 'strike', crit: opt.die === 'c', dmg: res.dmg, killed, resil: res.rolls[0], shocked, again, shrug });
    f.turn = again ? k : other(k);
    // Bruiser: incapacitated in the fight, it strikes back once with an unresolved success before it's removed.
    // Blood Offering (Butcher): the first critical strike in the sequence gains a Blooded token.
    if (opt.die === 'c' && fightWeapon(g, k).rules.bloodOffering && !me.offered) { me.offered = true; gainBlood(g, meOp.side, { zh: '血之獻祭', en: 'Blood Offering' }); }
    // Unholy Sustenance (Butcher): incapacitating the enemy in a fight regains D3 wounds.
    if (killed && tpl(meOp).unholySustenance && !meOp.dead) { const h = d3(); meOp.wounds = Math.min(meOp.maxW, meOp.wounds + h); }
    if (killed && (tpl(foeOp).bruiser || tpl(foeOp).brawler || tpl(foeOp).wretched) && left(foe) > 0 && !meOp.dead) {
      const w = fightWeapon(g, other(k)), crit = foe.c > 0;
      foe[crit ? 'c' : 'n']--;
      const dmg = crit ? w.dmg[1] + (foe.tox || 0) : normalDmg(w, meOp, g, foeOp) + (foe.tox || 0);
      const r2 = resolveDice(meOp, [dmg], g);
      const k2 = applyDamage(g, foeOp, meOp, r2.dmg);
      f.steps.push({ side: other(k), act: 'strike', crit, dmg: r2.dmg, killed: k2, lastBlow: true });
    }
  } else if (opt.act === 'decline') {
    f.steps.push({ side: k, act: 'decline', crit: opt.die === 'c' });
    f.turn = other(k);
  } else {
    foe[opt.target]--;
    // Shield (Endurant's shield bash): each block cancels two unresolved successes.
    if (fightWeapon(g, k).rules.shield) {
      const can = (t) => foe[t] > 0 && !(opt.die === 'n' && t === 'c' && !me.dueller); // a normal can only block a normal
      const t2 = can(opt.target) ? opt.target : can(opt.target === 'c' ? 'n' : 'c') ? (opt.target === 'c' ? 'n' : 'c') : null;
      if (t2) foe[t2]--;
    }
    f.steps.push({ side: k, act: 'parry', crit: opt.die === 'c', blocked: opt.target === 'c' });
    f.turn = other(k);
  }
  advanceFight(g);
}

/** Skip sides with no dice, auto-strike when the opponent has nothing left to parry, detect the end. */
function advanceFight(g) {
  const f = g.fight;
  if (fightOp(g, 'A').dead || fightOp(g, 'D').dead || (!left(f.A) && !left(f.D))) return finishFight(g);
  if (!left(f[f.turn])) f.turn = other(f.turn);
  if (left(f[other(f.turn)])) return; // a real choice remains
  // Opponent has no dice: a human still chooses (strike or hold back); the computer strikes (crits first).
  if (!isComputer(g, fightChooser(g))) return;
  fightApply(g, fightOptions(g)[0].id);
}

function finishFight(g) {
  const f = g.fight;
  if (f.done) return;
  f.done = true;
  g.ffAtk = null;
  faithRejuvenate(g); // Blessed Rejuvenation (Novitiates)
  const a = fightOp(g, 'A'), d = fightOp(g, 'D');
  archonAfterAction(g, a, f.painBefore || []);
  d.acted.toxinSequence = false;
  if (a.acted.contemptuous) a.acted.contemptUsed = true;
  corsairAfterAction(g, a);
  for (const [k, me, foe] of [['A', a, d], ['D', d, a]]) {
    if (me.dead) continue;
    const hits = f.steps.filter((s) => s.side === k && s.act === 'strike' && s.dmg > 0);
    // Soul Gorge (Chosen): it incapacitated the enemy or inflicted Critical Dmg — regains up to D3+1.
    if (tpl(me).soulGorge && (foe.dead || hits.some((s) => s.crit)) && me.wounds < me.maxW) {
      const before = me.wounds; me.wounds = Math.min(me.maxW, me.wounds + d3() + 1);
      log(g, { zh: `${opName(me, 'zh')} 靈魂吞噬：回復 ${me.wounds - before} 生命`, en: `${opName(me, 'en')} Soul Gorge: regains ${me.wounds - before} wounds` }, `side${me.side}`);
    }
    // Siphon Life (fell dagger): a friendly visible within 6" regains 1 per damaging strike (D3 for a critical one).
    if (fightWeapon(g, k).rules.siphon && hits.length) siphonLife(g, me, hits.map((s) => s.crit));
  }
  log(g, {
    zh: `${opName(a, 'zh')} 與 ${opName(d, 'zh')} 近戰：造成 ${f.D.before - d.wounds}，承受 ${f.A.before - a.wounds}`,
    en: `${opName(a, 'en')} fights ${opName(d, 'en')}: dealt ${f.D.before - d.wounds}, took ${f.A.before - a.wounds}`,
  }, `side${a.side}`);
  // Dat All You Got?: after fighting or retaliating, if still standing, inflict D3 damage on the enemy.
  for (const [me, foe] of [[a, d], [d, a]]) {
    if (!tpl(me).datAllYouGot || me.dead || foe.dead) continue;
    const dmg = d3();
    log(g, { zh: `${opName(me, 'zh')}「就這樣？」：${opName(foe, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(me, 'en')} "Dat All You Got?": ${opName(foe, 'en')} takes ${dmg} damage` }, `side${me.side}`);
    applyDamage(g, me, foe, dmg);
    f.datAllYouGot = { side: me === a ? 'A' : 'D', dmg };
  }
  // Savage Brutality (Tzaangor Champion): after its first Fight each activation, a free Fight against any enemy.
  if (tpl(a).savageBrutality && g.active === a.uid && !a.acted.brutalityUsed && !a.dead && engagedEnemies(g, a).length) {
    a.acted.brutalityUsed = true;
    a.acted.free = { ...(a.acted.free || {}), fight: 'any' };
    f.savageNext = true;
  }
  // Swipe (Bloatspawn): a free Fight with the swipe profile against each other enemy in control range.
  if (fightWeapon(g, 'A').rules.swipe && !a.dead && engagedEnemies(g, a).some((e) => !a.acted.swiped?.includes(e.uid))) {
    a.acted.free = { ...(a.acted.free || {}), fight: 'swipe' };
    f.swipeNext = true;
  }
  // Savage Assault: if both are still standing, a free Fight against the same enemy.
  if (f.savage && !a.dead && !d.dead && inEngagement(a, d)) {
    a.acted.free = { ...(a.acted.free || {}), fight: d.uid };
    f.savageNext = true;
    log(g, { zh: `${opName(a, 'zh')} 野蠻突擊：可再對 ${opName(d, 'zh')} 免費近戰一次`, en: `${opName(a, 'en')} Savage Assault: may fight ${opName(d, 'en')} again for free` }, `side${a.side}`);
  }
  for (const o of g.ops) o.medicShield = false;
}

export function endFight(g) { g.fight = null; }

/** Computer choice for the current fight die. */
export function fightAutoChoice(g) {
  if (g.fight.rrOpen) fightRerollDone(g); // automatic play skips the human Command Re-roll window
  if (g.fight.done) return null;
  const opts = fightOptions(g);
  if (g.fight.done) return null;
  const f = g.fight, k = f.turn, me = f[k], foe = f[other(k)];
  const meOp = fightOp(g, k), foeOp = fightOp(g, other(k));
  const has = (id) => opts.find((o) => o.id === id);
  const killer = opts.filter((o) => o.act === 'strike' && o.dmg >= foeOp.wounds).sort((x, y) => x.dmg - y.dmg)[0];
  if (killer) return killer.id;
  const fw = fightWeapon(g, other(k));
  const threat = foe.c * fw.dmg[1] + foe.n * normalDmg(fw, meOp);
  if (threat >= meOp.wounds) {
    if (has('parry-n-c')) return 'parry-n-c';
    if (has('parry-c-c')) return 'parry-c-c';
    if (has('parry-n-n')) return 'parry-n-n';
    if (has('parry-c-n') && me.c > 1) return 'parry-c-n';
  }
  return (has('strike-c') || has('strike-n')).id;
}

/** Resolve a whole fight automatically (AI vs AI, simulations). */
export function resolveFight(g, op, weapon, target) {
  startFight(g, op, weapon, target);
  while (!g.fight.done) fightApply(g, fightAutoChoice(g));
  const f = g.fight;
  endFight(g);
  return f;
}
