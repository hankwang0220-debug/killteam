import { TEAM_MAP, isBoltWeapon } from './data/teams.js';
import { dist, distPointRect, segRect } from './geometry.js';

export const BOARD = { w: 30, h: 22 };
export const ER = 1;          // engagement range (inches, base edge to base edge)
export const CONTROL = 1;     // objective control range
export const OBJ_R = 0.4;     // objective marker radius
export const MAX_TP = 4;
export const DEPLOY = [{ x0: 0, x1: 6 }, { x0: 24, x1: 30 }];

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
export const engagedEnemies = (g, op) => living(g, 1 - op.side).filter((e) => inEngagement(op, e));
export const isEngaged = (g, op) => engagedEnemies(g, op).length > 0;
export const d6 = () => 1 + Math.floor(Math.random() * 6);
/** Injured stat changes apply (And They Shall Know No Fear ignores them). */
export const injuredPenalty = (g, op) => isInjured(op) && !hasPloy(g, op.side, 'noFear');
/** The operative has this Chapter Tactic (Angels of Death); the sniper's Camo Cloak grants Stealthy. */
export const hasTactic = (g, op, id) => !!g.tactics?.[op.side]?.includes(id) || (id === 'stealthy' && !!tpl(op).camoCloak);

/** Art of War option (Mont'ka / Kauyon) in effect for this operative; the Blooded veteran gets either. */
export const artOfWar = (g, op, id) => hasPloy(g, op.side, id)
  || (!!tpl(op).veteran && hasPloy(g, op.side, id === 'montka' ? 'kauyon' : 'montka'));
const isDrone = (op) => !!tpl(op).drone;

/**
 * Contagion (enemy Plague Marine ploy): poisoned and visible within 3" of a Plague Marine, or visible
 * within 3" of the Icon Bearer.
 */
function contagion(g, op) {
  const foe = 1 - op.side;
  if (!hasPloy(g, foe, 'contagion')) return false;
  const seen = (pm) => edgeDist(pm, op) <= 3 && (visibility(g, pm, op).visible || visibility(g, op, pm).visible);
  return living(g, foe).some((pm) => (op.poison || tpl(pm).iconBearer) && seen(pm));
}
/** -2" Move and Hit worsened by 1: injured (unless ignored) or Contagion; the two aren't cumulative. */
export const statPenalty = (g, op) => injuredPenalty(g, op) || contagion(g, op);

export function moveStat(g, op) {
  let m = tpl(op).move - (statPenalty(g, op) ? 2 : 0) + (hasPloy(g, op.side, 'moveMove') ? 1 : 0);
  if (artOfWar(g, op, 'montka')) m += 1;
  if (isDrone(op) && living(g, op.side).some((o) => tpl(o).droneController)) m += 2;
  return m;
}

/** APL for this activation: changes last until the end of the operative's next activation (Resolute ignores them). */
// The APL stat can't be changed by more than 1 in total.
export const aplNow = (g, op) => Math.max(0, tpl(op).apl + (hasTactic(g, op, 'resolute') ? 0 : Math.max(-1, Math.min(1, op.aplNext || 0))));

/** Change APL until the end of the operative's next activation (not the one it's in right now). */
function changeApl(g, op, n) {
  op.aplNext = (op.aplNext || 0) + n;
  if (g.active === op.uid && !op.counter) op.aplKeep = true;
}
export function moveAllowance(g, op, kind) {
  let d = moveStat(g, op);
  if (kind === 'dash') d = 3;
  if (kind === 'charge') d = moveStat(g, op) + 2;
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
export function newGame({ teams, ai, tactics = [] }) {
  const g = {
    v: 1, teams, ai, tp: 0, phase: 'deploy', cp: [2, 2], vp: [0, 0], kills: [0, 0], ploys: [[], []],
    initiative: 0, turn: 0, active: null, log: [], terrain: makeTerrain(),
    objectives: OBJECTIVES.map((o, i) => ({ ...o, id: i })), ops: [], seq: 0,
    // Chapter Tactics [primary, secondary] for teams that have them; free ploys already used (Doctrine Warfare).
    tactics: [0, 1].map((s) => (TEAM_MAP[teams[s]].tactics ? tactics[s] || TEAM_MAP[teams[s]].defaultTactics : null)),
    freePloys: [[], []],
  };
  for (const side of [0, 1]) {
    let n = 0;
    for (const t of TEAM_MAP[teams[side]].ops) {
      for (let k = 0; k < t.count; k++) {
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
    autoDeploy(g, side);
  }
  for (const side of [0, 1]) {
    if (!g.tactics[side]) continue;
    const names = g.tactics[side].map((id) => team(g, side).tactics.find((t) => t.id === id).name);
    log(g, { zh: `${teamZh(g, side)} 戰團戰術：主要「${names[0].zh}」、次要「${names[1].zh}」`, en: `${team(g, side).name.en} Chapter Tactics: ${names[0].en} (primary), ${names[1].en} (secondary)` }, `side${side}`);
  }
  log(g,{ zh: '部署階段：可拖曳己方操作員，或點選後點擊部署區調整位置。', en: 'Deployment: drag your operatives, or select one and click inside your zone, to reposition them.' });
  return g;
}

export function deployOk(g, op, p) {
  const z = DEPLOY[op.side], r = radius(op);
  if (p.x - r < z.x0 || p.x + r > z.x1 || p.y < r || p.y > BOARD.h - r) return false;
  if (g.terrain.some((t) => distPointRect(p, t) < r)) return false;
  return !g.ops.some((o) => o.uid !== op.uid && !o.dead && dist(o, p) < radius(o) + r + 0.05);
}

export function autoDeploy(g, side) {
  const ops = g.ops.filter((o) => o.side === side);
  for (const o of ops) { o.x = -99; o.y = -99; }
  const z = DEPLOY[side];
  const cands = [];
  for (let x = z.x0 + 0.8; x <= z.x1 - 0.8; x += 1.6)
    for (let y = 1.5; y <= BOARD.h - 1.5; y += 1.7) cands.push({ x, y });
  // Front line first, spread vertically.
  const front = side === 0 ? (p) => -p.x : (p) => p.x;
  cands.sort((a, b) => front(a) - front(b) || Math.abs(a.y - 11) - Math.abs(b.y - 11));
  const placed = [];
  for (const o of ops) {
    const spot = cands.find((p) => deployOk(g, o, p) && placed.every((q) => dist(p, q) >= 2.6))
      || cands.find((p) => deployOk(g, o, p));
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
export function startBattle(g) { startTP(g); }

function startTP(g) {
  g.tp++;
  g.phase = 'strategy';
  let a, b;
  do { a = d6(); b = d6(); } while (a === b);
  g.initiative = a > b ? 0 : 1;
  g.initRoll = [a, b];
  // Each player gains 1CP; after the first TP the player without initiative gains 2CP instead.
  g.cp[g.initiative] += 1;
  g.cp[1 - g.initiative] += g.tp > 1 ? 2 : 1;
  g.counter = false;
  g.stratStep = 0;
  for (const o of g.ops) { o.ready = !o.dead; o.acted = {}; o.ap = 0; o.counteracted = false; }
  log(g, { zh: `── 第 ${g.tp} 回合 ── 主動權擲骰 ${a} : ${b}`, en: `── Turning Point ${g.tp} ── Initiative roll ${a} : ${b}` }, 'tp');
}

/** The side choosing strategy ploys: the initiative player first, then the other player. */
export const ployChooser = (g) => (g.stratStep ? 1 - g.initiative : g.initiative);

/** The current chooser is done with ploys; after both sides the Firefight phase begins. */
export function finishPloys(g) {
  const side = ployChooser(g);
  log(g, { zh: `${teamZh(g, side)} 完成計謀選擇`, en: `${team(g, side).name.en} is done choosing ploys` }, `side${side}`);
  if (g.stratStep) startFirefight(g);
  else g.stratStep = 1;
}

/** An operative whose Doctrine Warfare makes this ploy free (once per battle each), if any. */
function freePloyOp(g, side, ploy) {
  if (g.freePloys?.[side]?.includes(ploy.id)) return null;
  return living(g, side).find((o) => tpl(o).doctrineWarfare?.includes(ploy.id)) || null;
}

/** In the opponent's territory (their half of the killzone). */
const inEnemyTerritory = (op) => (op.side === 0 ? op.x - radius(op) > BOARD.w / 2 : op.x + radius(op) < BOARD.w / 2);

// Icon of Contagion: Contagion is free while the Icon Bearer is in the opponent's territory.
export const ployCost = (g, side, ploy) => (freePloyOp(g, side, ploy)
  || (ploy.id === 'contagion' && living(g, side).some((o) => tpl(o).iconBearer && inEnemyTerritory(o))) ? 0 : ploy.cp);

/**
 * Can't be used now: already used this ploy, or another from its group this turning point (e.g. one
 * Combat Doctrine), a once-per-battle ploy already used, or the operative it needs isn't in the killzone.
 */
export const ployTaken = (g, side, ploy) => g.ploys[side].some((id) => id === ploy.id
  || (ploy.group && team(g, side).ploys.find((p) => p.id === id)?.group === ploy.group))
  || (ploy.oncePerBattle && !!g.battlePloys?.[side]?.includes(ploy.id))
  || (ploy.needs && !living(g, side).some((o) => o.tplId === ploy.needs));

export function buyPloy(g, side, ploy) {
  const cost = ployCost(g, side, ploy);
  if (side !== ployChooser(g) || g.cp[side] < cost || ployTaken(g, side, ploy)) return false;
  g.cp[side] -= cost;
  g.ploys[side].push(ploy.id);
  if (ploy.oncePerBattle) ((g.battlePloys ||= [[], []])[side]).push(ploy.id);
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

export function hasReady(g, side) { return living(g, side).some((o) => o.ready); }

export function activate(g, op) {
  g.active = op.uid;
  op.acted = {};
  if (g.counter) {
    // Counteract: an expended Engage operative performs one 1AP action for free; order unchanged.
    op.counter = true;
    op.ap = 1;
    op.orderSet = true;
  } else {
    op.ap = aplNow(g, op);
    op.orderSet = false;
    op.prevOrder = op.order;
    op.optics = false; // Optics lasts until the start of the operative's next activation
    // (Once per turning point, so switching to another operative before acting doesn't repeat it.)
    if (op.poison && op.poisonTP !== g.tp) {
      op.poisonTP = g.tp;
      log(g, { zh: `${opName(op, 'zh')} 中毒，啟動時受到 1 傷害`, en: `${opName(op, 'en')} is poisoned and takes 1 damage on activation` }, `side${op.side}`);
      applyDamage(g, op, op, 1);
    }
  }
}

/** You may pick a different operative to activate (or counteract with) until its first action. */
export function canSwitchActive(g) {
  const op = activeOp(g);
  return !!op && Object.keys(op.acted).length === 0;
}

/** Undo an activation (or counteract) that hasn't done anything yet. */
export function deactivate(g) {
  const op = activeOp(g);
  if (!op) return;
  if (op.counter) op.counter = false;
  else { if (op.prevOrder) op.order = op.prevOrder; op.orderSet = false; }
  op.ap = 0; op.acted = {};
  g.active = null;
}

export function setOrder(g, op, order) {
  if (op.orderSet) return;
  op.order = order;
}

/** Expended, Engage-order operatives that haven't counteracted this TP (Astartes: any order). */
export const counterCandidates = (g, side) =>
  living(g, side).filter((o) => !o.ready && (o.order === 'engage' || TEAM_MAP[o.team].astartes) && !o.counteracted);

export function endActivation(g) {
  const op = activeOp(g);
  const wasCounter = g.counter;
  if (op) {
    op.ready = false; op.ap = 0;
    if (op.counter) { op.counter = false; op.counteracted = true; } else if (op.aplKeep) op.aplKeep = false; else op.aplNext = 0;
  }
  g.active = null;
  g.counter = false;
  if (checkWipe(g)) return;
  const cur = g.turn, other = 1 - cur;
  if (wasCounter) {
    // After a counteract (or passing on one), play returns to the player with ready operatives.
    if (hasReady(g, other)) g.turn = other;
    else if (!hasReady(g, cur)) endTP(g);
    return;
  }
  if (hasReady(g, other)) { g.turn = other; return; }
  if (!hasReady(g, cur)) { endTP(g); return; }
  // The opponent has no ready operatives: between activations they may counteract.
  if (counterCandidates(g, other).length) { g.turn = other; g.counter = true; }
}

/** Decline the chance to counteract. */
export function passCounter(g) {
  log(g, { zh: `${teamZh(g, g.turn)} 放棄反擊`, en: `${team(g, g.turn).name.en} does not counteract` }, `side${g.turn}`);
  endActivation(g);
}

export function controller(g, obj) {
  const sum = [0, 0];
  for (const o of living(g)) {
    // Drones count as 1 APL lower for objective control, the Icon Bearer as 1 higher.
    if (dist(o, obj) - radius(o) - OBJ_R <= CONTROL) sum[o.side] += Math.max(0, aplNow(g, o) - (isDrone(o) ? 1 : 0) + (tpl(o).iconBearer ? 1 : 0));
  }
  if (sum[0] > sum[1]) return 0;
  if (sum[1] > sum[0]) return 1;
  return null;
}

function endTP(g) {
  log(g, { zh: `第 ${g.tp} 回合結束`, en: `End of Turning Point ${g.tp}` }, 'tp');
  g.ploys = [[], []];
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
  const start = g.ops.filter((o) => o.side !== side).length;
  return KILL_GRADE[Math.min(14, Math.max(5, start))];
}
export const killGrade = (g, side) => killThresholds(g, side).filter((n) => g.kills[side] >= n).length;

/** Kill Op VP: 1 per kill grade reached, +1 at the end of the battle for the higher kill grade. */
export function killOpVP(g, side) {
  const grade = killGrade(g, side);
  const bonus = g.phase === 'gameover' && grade > killGrade(g, 1 - side) ? 1 : 0;
  return grade + bonus;
}
export const totalVP = (g, side) => g.vp[side] + killOpVP(g, side);

function checkWipe(g) {
  if (living(g, 0).length && living(g, 1).length) return false;
  gameOver(g);
  return true;
}

function gameOver(g) {
  g.phase = 'gameover';
  g.active = null;
  const a = totalVP(g, 0), b = totalVP(g, 1);
  g.winner = a > b ? 0 : b > a ? 1 : null;
  log(g, { zh: `遊戲結束！總分 ${a} : ${b}`, en: `Game over! Final score ${a} : ${b}` }, 'tp');
}

// ---------- actions ----------
const MOVE_ACTIONS = ['reposition', 'charge', 'fallBack'];
const count = (op, k) => op.acted[k] || 0;
const moved = (op) => MOVE_ACTIONS.some((k) => count(op, k)) || count(op, 'dash');

// Astartes (Angels of Death): two Shoot or two Fight actions per activation, but not a second of
// either after doing one of each.
function attackAllowed(op, kind) {
  if (count(op, kind) === 0) return true;
  if (kind === 'fight' && tpl(op).krumpin && count(op, kind) === 1) return true; // Krumpin' Time: two Fights
  const otherKind = kind === 'shoot' ? 'fight' : 'shoot';
  return !!TEAM_MAP[op.team].astartes && count(op, kind) === 1 && count(op, otherKind) === 0;
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
  systemJam: { ap: 1, name: { zh: '系統干擾', en: 'System Jam' } },
  medikit: { ap: 1, name: { zh: '醫療包', en: 'Medikit' } },
  getItDun: { ap: 1, name: { zh: '快去做！', en: 'Get It Dun!' } },
  listenIn: { ap: 1, name: { zh: '聽好了', en: 'Listen In' } },
  stunGrenade: { ap: 1, name: { zh: '震撼手雷', en: 'Stun Grenade' } },
  dakkaDash: { ap: 1, name: { zh: '達卡衝刺', en: 'Dakka Dash' } },
  flail: { ap: 1, name: { zh: '連枷', en: 'Flail' } },
  miasma: { ap: 1, name: { zh: '毒瘴', en: 'Poisonous Miasma' } },
  vitality: { ap: 1, name: { zh: '腐敗活力', en: 'Putrescent Vitality' } },
};

export function actionCost(g, op, id) {
  if (id === 'fallBack' && hasTactic(g, op, 'mobile')) return 1;
  // Kauyon: a Concealed operative's Markerlight is free.
  if (id === 'markerlight' && op.order === 'conceal' && artOfWar(g, op, 'kauyon')) return 0;
  if (id === 'dash' && op.acted?.free?.dash) return 0; // Dakka Dash
  if (id === 'shoot' && op.acted?.free?.shoot) return 0;
  return ACTIONS[id].ap;
}

// ---------- unique actions that pick an operative ----------
const sameTeam = (a, b) => a.side === b.side && a.team === b.team;
export const TARGET_ACTIONS = {
  // Markerlight: a visible enemy gains tokens (max 4). After a Shoot this activation, only its target.
  markerlight: {
    targets: (g, op) => living(g, 1 - op.side).filter((t) => visibility(g, op, t).visible
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
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && edgeDist(op, t) <= 6 && visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `信號：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Signal: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // System Jam: a visible enemy gets -1 APL until the end of its next activation.
  systemJam: {
    targets: (g, op) => living(g, 1 - op.side).filter((t) => visibility(g, op, t).visible),
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
      t.wounds = Math.min(t.maxW, t.wounds + d6() + d6());
      return { zh: `醫療包：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命（${t.wounds}/${t.maxW}）`, en: `Medikit: ${opName(t, 'en')} regains ${t.wounds - before} wounds (${t.wounds}/${t.maxW})` };
    },
  },
  // Get It Dun! / Listen In (SUPPORT): another friendly visible within 6" gets +1 APL until the end of its next activation.
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
    targets: (g, op) => (g.wotNotz?.[op.side] === g.tp ? [] : living(g, 1 - op.side).filter((t) => edgeDist(op, t) <= 6 && visibility(g, op, t).visible)),
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
    targets: (g, op) => living(g, 1 - op.side).filter((t) => (edgeDist(op, t) <= 7 && visibility(g, op, t).visible) || validTarget(g, op, t, { rules: {} })),
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
export const freePending = (op) => !!(op.acted?.free?.dash || op.acted?.free?.shoot);

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
    const d3 = 1 + Math.floor(Math.random() * 3);
    const poisoned = t.side !== op.side && d3 === 3 && !t.poison;
    if (poisoned) t.poison = true;
    log(g, { zh: `連枷：${opName(t, 'zh')} 受到 ${d3 + 2} 傷害${poisoned ? '並中毒' : ''}`, en: `Flail: ${opName(t, 'en')} takes ${d3 + 2} damage${poisoned ? ' and is poisoned' : ''}` }, `side${op.side}`);
    applyDamage(g, op, t, d3 + 2);
  }
}

export function doTargetAction(g, op, id, target) {
  spend(g, op, id);
  const msg = TARGET_ACTIONS[id].apply(g, op, target);
  log(g, { zh: `${opName(op, 'zh')} ${msg.zh}`, en: `${opName(op, 'en')} ${msg.en}` }, `side${op.side}`);
}

// The second Shoot of an Astartes activation costs +1AP if both use the sniper rifle or heavy bolter.
const DOUBLE_SHOT_GROUPS = ['sniper', 'heavyBolter'];
// One of an Astartes operative's two Shoots must use a bolt weapon (Plague Marines: or a Psychic weapon).
const astartesShot = (w) => isBoltWeapon(w) || !!w.rules.psychic;

/** Can the active operative shoot with this weapon now? {ok, ap, why} */
export function shootWeapon(g, op, w) {
  const no = (zh, en) => ({ ok: false, ap: 1, why: { zh, en } });
  if (w.type !== 'ranged') return no('不是遠程武器', 'Not a ranged weapon');
  if (op.order === 'conceal' && !w.rules.silent) return no('隱蔽指令無法射擊（需「無聲」）', 'Concealed (needs Silent)');
  const reMoved = MOVE_ACTIONS.some((k) => count(op, k));
  if (w.rules.heavy === 'dash' ? reMoved : w.rules.heavy && moved(op)) return no('本次已移動，不能用重型武器', 'Moved — cannot use a Heavy weapon');
  let ap = 1;
  if (w.rules.limited && (op.used?.[w.id] || 0) >= w.rules.limited) return no('已用完（限用）', 'Used up (Limited)');
  if (w.rules.firstShotOnly && op.used?.shoot) return no('只能在第一次射擊使用', 'Only for the first Shoot of the battle');
  const free = op.acted?.free?.shoot; // Dakka Dash: a free Shoot with the dakka shoota
  if (free) return w.group === free ? { ok: true, ap: 0, why: null } : no('達卡衝刺只能用達卡槍', 'Dakka Dash: dakka shoota only');
  if (count(op, 'shoot')) {
    const first = op.acted.shotWith;
    if (!astartesShot(w) && !op.acted.shotBolt) return no('兩次射擊至少一次要用爆彈（或靈能）武器', 'One of the two Shoots must use a bolt (or Psychic) weapon');
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
  const hasRanged = tpl(op).weapons.some((w) => w.type === 'ranged');
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
  // (Heavy (Dash only): Dash is still allowed).
  const HEAVY = { zh: '本次已使用重型武器，不能移動', en: 'Used a Heavy weapon, cannot move' };
  const heavy = !!count(op, 'heavy'), heavyAll = heavy && op.acted.heavy !== 'dash';
  // Mobile: may Charge while within control range of an enemy.
  const chargeEngaged = engaged && !hasTactic(g, op, 'mobile');
  add('reposition', !engaged && !heavy && !did('reposition', 'fallBack', 'charge'), engaged ? ENG : heavy ? HEAVY : count(op, 'reposition') ? DONE : COMBO);
  add('dash', !engaged && !heavyAll && !did('dash', 'charge'), engaged ? ENG : heavyAll ? HEAVY : count(op, 'dash') ? DONE : COMBO);
  // Throat Slittas (Kommandos): may Charge with a Conceal order.
  const noCharge = conceal && !TEAM_MAP[op.team].concealCharge;
  // (Dakka Dash includes a Dash, so it also rules out Charge.)
  add('charge', !chargeEngaged && !noCharge && !heavy && !did('charge', 'reposition', 'dash', 'fallBack', 'dakkaDash'), chargeEngaged ? ENG : noCharge ? CONC : heavy ? HEAVY : count(op, 'charge') ? DONE : COMBO);
  add('fallBack', engaged && !heavy && !did('fallBack', 'reposition', 'charge'), !engaged ? { zh: '未處於交戰', en: 'Not engaged' } : heavy ? HEAVY : count(op, 'fallBack') ? DONE : COMBO);
  const shots = tpl(op).weapons.filter((w) => w.type === 'ranged').map((w) => shootWeapon(g, op, w));
  const shootWhy = engaged ? ENG : !attackAllowed(op, 'shoot') ? DONE : (shots.find((s) => !s.ok)?.why || DONE);
  add('shoot', hasRanged && !engaged && attackAllowed(op, 'shoot') && shots.some((s) => s.ok), shootWhy);
  add('fight', engaged && attackAllowed(op, 'fight'), !engaged ? { zh: '沒有交戰中的敵人', en: 'No enemy in engagement' } : DONE);
  if (tpl(op).optics) add('optics', !engaged && !count(op, 'optics'), engaged ? ENG : DONE);
  const NONE = { zh: '沒有可選的目標', en: 'No valid target' };
  const unique = (id, extra = true, extraWhy = null) => {
    const cond = !engaged && extra && !count(op, id) && TARGET_ACTIONS[id].targets(g, op).length > 0;
    add(id, cond, engaged ? ENG : !extra ? extraWhy : count(op, id) ? DONE : NONE);
  };
  if (tpl(op).markerlight) unique('markerlight');
  if (tpl(op).signal) unique('signal');
  if (tpl(op).systemJam) unique('systemJam', !conceal, CONC);
  if (tpl(op).medikit) unique('medikit');
  if (tpl(op).support) unique(tpl(op).support, tpl(op).support !== 'getItDun' || !op.counter, { zh: '反擊時不能執行', en: 'Not while counteracting' });
  if (tpl(op).wotNotz) unique('stunGrenade');
  if (tpl(op).dakkaDash) {
    // Dakka Dash: a free Dash and a free Shoot (dakka shoota only), in either order.
    const ok = !engaged && !conceal && !did('dakkaDash', 'dash', 'charge', 'shoot');
    add('dakkaDash', ok, engaged ? ENG : conceal ? CONC : count(op, 'dakkaDash') ? DONE : COMBO);
  }
  if (tpl(op).miasma) unique('miasma');
  if (tpl(op).vitality) unique('vitality');
  if (tpl(op).flail) {
    // Flail counts as a Fight action (Astartes double Fight, once-per-activation limits).
    const ok = !conceal && attackAllowed(op, 'fight') && flailTargets(g, op).some((t) => t.side !== op.side);
    add('flail', ok, conceal ? CONC : !attackAllowed(op, 'fight') ? DONE : { zh: '2" 內沒有可見的敵人', en: 'No visible enemy within 2"' });
  }
  // Drones can only perform the actions listed on their datacard.
  const allowed = tpl(op).drone;
  return allowed ? list.filter((a) => allowed.includes(a.id)) : list;
}

/** Optics (Eliminator Sniper): until its next activation, enemies can't be obscured when it shoots. */
export function doOptics(g, op) {
  spend(g, op, 'optics');
  op.optics = true;
  log(g, { zh: `${opName(op, 'zh')} 使用光學瞄準：敵人無法被遮蔽`, en: `${opName(op, 'en')} uses Optics: enemies cannot be obscured` }, `side${op.side}`);
}

export function spend(g, op, id, ap = actionCost(g, op, id)) {
  op.ap -= ap;
  op.acted[id] = count(op, id) + 1;
  op.orderSet = true;
}

/** Apply a validated movement path. */
export function doMove(g, op, kind, path) {
  const end = path.pts[path.pts.length - 1];
  op.x = end.x; op.y = end.y;
  spend(g, op, kind);
  op.acted.movedDist = (op.acted.movedDist || 0) + path.len; // Lumbering Death
  if (kind === 'dash' && op.acted.free?.dash) op.acted.free.dash = false;
  log(g, { zh: `${opName(op, 'zh')} ${ACTIONS[kind].name.zh} ${path.len.toFixed(1)}"`, en: `${opName(op, 'en')} ${ACTIONS[kind].name.en} ${path.len.toFixed(1)}"` }, `side${op.side}`);
  // Markerlights: once per activation, a marked operative that moves loses one token.
  if (op.ml > 0 && !op.acted.mlDrop) {
    op.ml--; op.acted.mlDrop = true;
    log(g, { zh: `${opName(op, 'zh')} 移動，移除 1 個標記光標記（剩 ${op.ml}）`, en: `${opName(op, 'en')} moves and loses a Markerlight token (${op.ml} left)` }, `side${op.side}`);
  }
}

export function opName(op, lang) {
  const t = tpl(op);
  const sameKind = TEAM_MAP[op.team].ops.find((o) => o.id === op.tplId).count > 1;
  const name = lang === 'zh' ? `${t.name.zh}（${t.name.en}）` : t.name.en;
  return name + (sameKind ? ` #${op.num}` : '');
}

// ---------- line of sight ----------
// Official rules, checked on lines from the shooter to any part of the target (best line is used):
//  - Cover: intervening terrain within the target's control range (1"), but never while the
//    target is within 2" of the shooter.
//  - Obscured: intervening Heavy terrain, unless that terrain is within 1" of either operative.
function targetPoints(t) {
  const r = radius(t) * 0.95;
  const pts = [{ x: t.x, y: t.y }];
  for (let i = 0; i < 12; i++) pts.push({ x: t.x + Math.cos(i * Math.PI / 6) * r, y: t.y + Math.sin(i * Math.PI / 6) * r });
  return pts;
}

/**
 * opts.noObscure: Heavy terrain never obscures (Optics).
 * opts.ignoreLight: Light terrain gives no cover (Seek Light, when picking valid targets).
 * opts.ignoreAll: no terrain gives cover (Seek, when picking valid targets).
 */
export function visibility(g, from, to, opts = {}) {
  const rf = radius(from), rt = radius(to);
  const close = edgeDist(from, to) <= 2;
  let visible = false;
  for (const p of targetPoints(to)) {
    let cover = false, obscured = false;
    for (const t of g.terrain) {
      if (!segRect(from, p, t)) continue;
      const dt = distPointRect(to, t) - rt, ds = distPointRect(from, t) - rf;
      if (t.kind === 'heavy' && dt > 1 && ds > 1) {
        if (opts.noObscure) continue;
        obscured = true; break;
      }
      if (dt <= 1 && !close && !opts.ignoreAll && !(opts.ignoreLight && t.kind === 'light')) cover = true;
    }
    if (obscured) continue;
    if (!cover) return { visible: true, cover: false };
    visible = true;
  }
  return { visible, cover: visible };
}

export function inRange(op, target, weapon) {
  return weapon.rules.range == null || edgeDist(op, target) <= weapon.rules.range + 0.01;
}

/** Markerlight tokens that count when op shoots target with weapon (Pathfinders only, not the fusion grenade). */
export const mlLevel = (g, op, weapon, target) =>
  (TEAM_MAP[op.team].markerlights && !weapon.rules.noMarkerlight && target ? target.ml || 0 : 0);

// Optics, Multi-dimensional Vision and 3+ Markerlight tokens: the target can't be obscured.
const shotVisibility = (g, op, target, weapon, extra = {}) => visibility(g, op, target, {
  noObscure: !!op.optics || !!tpl(op).multiVision || mlLevel(g, op, weapon, target) >= 3, ...extra,
});

/** Is target a valid target for op with this weapon (visible, and not a Concealed operative in cover)? */
function validTarget(g, op, target, weapon) {
  const v = shotVisibility(g, op, target, weapon);
  if (!v.visible) return null;
  if (target.order === 'conceal') {
    const ml = mlLevel(g, op, weapon, target);
    const seek = weapon.rules.seek || ml >= 5, seekLight = weapon.rules.seekLight || ml >= 4;
    const vt = seek ? shotVisibility(g, op, target, weapon, { ignoreAll: true })
      : seekLight ? shotVisibility(g, op, target, weapon, { ignoreLight: true }) : v;
    if (vt.cover) return null;
  }
  return v;
}

/** Can op shoot target with weapon? Returns {ok, cover} */
export function shootCheck(g, op, target, weapon, secondary = false) {
  if (target.dead || target.side === op.side) return { ok: false };
  if (!shootWeapon(g, op, weapon).ok) return { ok: false };
  const v = validTarget(g, op, target, weapon);
  if (!v) return { ok: false };
  if (living(g, op.side).some((f) => inEngagement(f, target))) return { ok: false };
  if (!inRange(op, target, weapon)) return { ok: false };
  // Markerlights: after a Markerlight this activation, Shoot must pick that same target.
  if (!secondary && op.acted?.mlTarget && op.acted.mlTarget !== target.uid) return { ok: false };
  return { ok: true, cover: v.cover };
}

// ---------- dice ----------
export function effectiveRules(g, op, weapon, target) {
  const r = { ...weapon.rules };
  if (weapon.type === 'melee') {
    if (hasPloy(g, op.side, 'docAssault')) r.balanced = true;
    if (hasPloy(g, op.side, 'waaagh')) r.balanced = true;
    if (hasTactic(g, op, 'aggressive')) r.rending = true;
  } else {
    if (hasPloy(g, op.side, 'takeAim')) r.balanced = true;
    if (hasPloy(g, op.side, 'dakkaDakka')) r.punishing = true;
    if (target && hasPloy(g, op.side, edgeDist(op, target) > 6 ? 'docDevastator' : 'docTactical')) r.balanced = true;
    if (op.team === 'troopers' && target?.damagedTP) r.ceaseless = true;
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
  return r;
}

function rollPool(n, success, critOn, rules = {}) {
  // Accurate x: retain up to x dice as normal successes without rolling them.
  const auto = Math.min(n, rules.accurate || 0);
  const dice = Array.from({ length: n - auto }, () => ({ v: d6(), rr: false }));
  if (rules.ceaseless) for (const d of dice) if (d.v === 1) { d.v = d6(); d.rr = true; }
  if (rules.balanced) {
    const f = dice.filter((d) => !d.rr && d.v < success).sort((a, b) => a.v - b.v)[0];
    if (f) { f.v = d6(); f.rr = true; }
  }
  for (const d of dice) d.res = d.v >= critOn && d.v >= success ? 'crit' : d.v >= success ? 'norm' : 'miss';
  dice.sort((a, b) => b.v - a.v);
  for (let k = 0; k < auto; k++) dice.push({ v: '✓', res: 'norm', auto: true });
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
  return { dice, crits, norms };
}

const clampHit = (h) => Math.min(6, Math.max(2, h));

const normalDmg = (w) => w.dmg[0];

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
 * Medic!: the first time each turning point a friendly non-drone Pathfinder would be incapacitated while
 * visible to and within 3" of the Medical Technician (neither in enemy control range), it survives on 1 wound.
 * Not usable if the medic is a target of the Shoot action being resolved. (The free Dash isn't modelled.)
 */
function medicFor(g, target) {
  if (!TEAM_MAP[target.team].markerlights || isDrone(target) || g.medicTP?.[target.side] === g.tp) return null;
  if (isEngaged(g, target)) return null;
  return living(g, target.side).find((m) => tpl(m).medic && m !== target && edgeDist(m, target) <= 3
    && visibility(g, m, target).visible && !isEngaged(g, m) && !g.shotTargets?.includes(m.uid)) || null;
}

function applyDamage(g, src, target, dmg) {
  const before = target.wounds;
  const killed = inflict(g, target, dmg);
  grandfathersBlessing(g, target, before - Math.max(0, target.wounds));
  return killed;
}

/**
 * Grandfather's Blessing: when a poisoned enemy loses wounds within 7" of the Champion, the Champion
 * regains as many (at most 3 per turning point).
 */
function grandfathersBlessing(g, target, lost) {
  if (lost <= 0 || !target.poison) return;
  const champ = living(g, 1 - target.side).find((o) => tpl(o).blessing && edgeDist(o, target) <= 7);
  if (!champ || champ.wounds >= champ.maxW) return;
  if (champ.blessTP !== g.tp) { champ.blessTP = g.tp; champ.blessed = 0; }
  const gain = Math.min(lost, 3 - champ.blessed, champ.maxW - champ.wounds);
  if (gain <= 0) return;
  champ.wounds += gain; champ.blessed += gain;
  log(g, { zh: `${opName(champ, 'zh')} 祖父的祝福：回復 ${gain} 生命`, en: `${opName(champ, 'en')} Grandfather's Blessing: regains ${gain} wounds` }, `side${champ.side}`);
}

function inflict(g, target, dmg) {
  if (dmg <= 0) return false;
  target.damagedTP = true;
  if (target.medicShield) { target.wounds = Math.max(1, target.wounds - dmg); return false; }
  target.wounds -= dmg;
  const medic = target.wounds <= 0 && medicFor(g, target);
  if (medic) {
    // Survives on 1 wound for the rest of the action; both get -1 APL until the end of their next activations.
    target.wounds = 1; target.medicShield = true; target.medicTP = g.tp;
    (g.medicTP ||= [0, 0])[target.side] = g.tp;
    changeApl(g, target, -1); changeApl(g, medic, -1);
    if (g.active === target.uid) target.ap = 0; // used during its own activation: that activation ends
    log(g, { zh: `✚ ${opName(medic, 'zh')} 醫療兵！${opName(target, 'zh')} 以 1 生命撐住`, en: `✚ ${opName(medic, 'en')} Medic! ${opName(target, 'en')} survives on 1 wound` }, `side${target.side}`);
    return false;
  }
  if (target.wounds <= 0) {
    target.wounds = 0; target.dead = true; target.ready = false;
    // Kill op counts enemy operatives incapacitated, whoever caused it (e.g. a Blast hitting a friendly).
    const scorer = 1 - target.side;
    const before = killGrade(g, scorer);
    g.kills[scorer]++;
    log(g, { zh: `☠ ${opName(target, 'zh')} 失去戰鬥能力！`, en: `☠ ${opName(target, 'en')} is incapacitated!` }, 'kill');
    const after = killGrade(g, scorer);
    if (after > before) log(g, { zh: `${teamZh(g, scorer)} 擊殺等級 ${after}（+1 VP）`, en: `${team(g, scorer).name.en} reaches kill grade ${after} (+1 VP)` }, 'tp');
    return true;
  }
  return false;
}

/**
 * Damage from each unblocked attack die (and each Devastating crit), after Disgustingly Resilient:
 * a die inflicting 3+ damage on a Plague Marine rolls a D6 and deals 1 less on a 4+.
 * Returns {dmg, rolls: [{dmg, roll, saved}]}.
 */
function resolveDice(target, amounts) {
  const resilient = !!TEAM_MAP[target.team].resilient;
  let dmg = 0;
  const rolls = [];
  for (const a of amounts) {
    let d = a;
    if (resilient && a >= 3) {
      const roll = d6();
      if (roll >= 4) d--;
      rolls.push({ dmg: a, roll, saved: roll >= 4 });
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
  if (!rules.stun || crits <= 0 || target.dead) return false;
  changeApl(g, target, -1);
  log(g, { zh: `${opName(target, 'zh')} 昏迷：下次啟動 APL -1`, en: `${opName(target, 'en')} is stunned: -1 APL next activation` }, `side${1 - target.side}`);
  return true;
}

/** One shooting sequence (attack dice, defence dice, damage) against one target. */
function shootSequence(g, op, weapon, target, cover, noReroll = false, poisonedAtStart = null) {
  const rules = effectiveRules(g, op, weapon, target);
  if (noReroll) { delete rules.balanced; delete rules.ceaseless; } // Suppressing Fire
  let hit = weapon.hit;
  if (!rules.fixedHit) {
    hit += statPenalty(g, op) ? 1 : 0;
    if (rules.mlHit && hit > 3) hit = Math.max(3, hit - 1);
  }
  hit = clampHit(hit);
  const atk = weapon.atk;
  const a = rollPool(atk, hit, rules.lethal || 6, rules);
  const inCover = cover && !rules.ignoreCover;
  const pierce = (rules.piercing || 0) + (a.crits > 0 ? rules.piercingCrits || 0 : 0);
  const defDice = Math.max(0, DEFENCE_DICE - pierce);
  const camo = !!tpl(target).camoCloak; // Camo Cloak ignores Saturate
  const saturated = rules.saturate && !camo;
  // A Concealed target in cover can't be shot at all, so any target here that's in cover gets the cover save.
  const base = inCover && !saturated ? 1 : 0;
  let coverN = base, coverC = 0;
  if (base && hasTactic(g, target, 'stealthy')) {
    // Stealthy: one more cover save, or one as a critical; Camo Cloak with the Stealthy tactic gets both.
    if (camo && g.tactics?.[target.side]?.includes('stealthy')) coverC = 1;
    else if (a.crits > 0) { coverN--; coverC = 1; } else coverN++;
  }
  // Skulk About: a Concealed target retains one more defence die as a normal success.
  const skulk = target.order === 'conceal' && hasPloy(g, target.side, 'skulkAbout') ? 1 : 0;
  coverN += skulk;
  coverC = Math.min(coverC, defDice);
  coverN = Math.min(coverN, defDice - coverC);
  // Take Cover: if cover saves can be retained, the Save stat improves by 1.
  const save = Math.max(2, tpl(target).save - (base && hasPloy(g, target.side, 'takeCover') ? 1 : 0));
  const d = rollPool(defDice - coverN - coverC, save, hasTactic(g, target, 'hardy') ? 5 : 6);
  if (hasPloy(g, target.side, 'indomitus')) {
    // Indomitus: with two or more fails, discard one to retain another as a normal success.
    const misses = d.dice.filter((x) => x.res === 'miss');
    if (misses.length >= 2) { misses[0].res = 'norm'; misses[0].indo = true; d.norms++; }
  }
  // Toxic: +1 to both Dmg against an enemy that was poisoned at the start of the action.
  const tox = rules.toxic && poisonedAtStart?.has(target.uid) ? 1 : 0;
  const dn = normalDmg(weapon, target) + tox, dc = weapon.dmg[1] + tox;
  const block = bestBlock(a.crits, a.norms, d.crits + coverC, d.norms + coverN, dn, dc);
  const dev = (rules.devastating || 0) * a.crits;
  const res = resolveDice(target, [...Array(a.crits).fill(rules.devastating || 0), ...Array(block.remC).fill(dc), ...Array(block.remN).fill(dn)].filter((x) => x > 0));
  const dmg = res.dmg;
  const before = target.wounds;
  const killed = applyDamage(g, op, target, dmg);
  const poisoned = poisonOnHit(g, op, target, rules, block.remC + block.remN > 0 ? dmg : 0);
  const stunned = stunOnCrit(g, rules, a.crits, target);
  return {
    target: target.uid, rules, hit, atk, attack: a, save, defDice, coverSaves: coverN + coverC, coverCrit: coverC,
    inCover, saturated: rules.saturate && inCover, skulk, pierce, defence: d, dmg, dev, tox, resilient: res.rolls, poisoned, stunned,
    remC: block.remC, remN: block.remN, before, after: target.wounds, killed,
  };
}

/** Other targets hit by Torrent / Blast after the primary target. */
function secondaryTargets(g, op, weapon, primary) {
  const { torrent, blast } = weapon.rules;
  if (torrent) {
    return living(g, 1 - op.side).filter((t) => t !== primary && edgeDist(primary, t) <= torrent + 0.01
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
  const cands = living(g, target.side).filter((t) => t.order !== 'conceal' && visibility(g, op, t).visible
    && shootCheck(g, op, t, weapon).ok);
  const closest = Math.min(...cands.map((t) => edgeDist(op, t)));
  return edgeDist(op, target) > closest + 0.01;
}

export function resolveShoot(g, op, weapon, target) {
  const ap = shootWeapon(g, op, weapon).ap;
  const vis = shotVisibility(g, op, target, weapon);
  const others = secondaryTargets(g, op, weapon, target); // chosen before any damage is dealt
  const noReroll = suppressed(g, op, weapon, target);
  g.shotTargets = [target.uid, ...others.map((t) => t.uid)];
  const poisonedAtStart = new Set(g.ops.filter((o) => o.poison).map((o) => o.uid));
  const main = shootSequence(g, op, weapon, target, vis.cover, noReroll, poisonedAtStart);
  spend(g, op, 'shoot', ap);
  if (weapon.rules.heavy) op.acted.heavy = weapon.rules.heavy === 'dash' && op.acted.heavy !== 1 ? 'dash' : 1;
  op.acted.shotWith = weapon.group;
  op.acted.shotTarget = target.uid;
  if (astartesShot(weapon)) op.acted.shotBolt = true;
  if (weapon.rules.limited) (op.used ||= {})[weapon.id] = (op.used[weapon.id] || 0) + 1;
  (op.used ||= {}).shoot = (op.used.shoot || 0) + 1; // Concealed Position
  if (op.acted.free?.shoot) op.acted.free.shoot = null;
  const logShot = (t, s) => log(g, {
    zh: `${opName(op, 'zh')} 以${weapon.name.zh}（${weapon.name.en}）射擊 ${opName(t, 'zh')}：${s.dmg} 傷害`,
    en: `${opName(op, 'en')} shoots ${opName(t, 'en')} with ${weapon.name.en}: ${s.dmg} damage`,
  }, `side${op.side}`);
  logShot(target, main);
  const extra = [];
  for (const t of others) {
    if (t.dead) continue;
    // Torrent targets use their own cover; Blast targets are in cover if the primary target was.
    const cover = weapon.rules.torrent ? shotVisibility(g, op, t, weapon).cover : vis.cover;
    const s = shootSequence(g, op, weapon, t, cover, noReroll, poisonedAtStart);
    logShot(t, s);
    extra.push(s);
  }
  // Hot: roll one D6 per action; below the Hit stat, the shooter takes twice the result.
  let hot = null;
  if (weapon.rules.hot && !op.dead) {
    const roll = d6();
    hot = { roll, dmg: roll < main.hit ? roll * 2 : 0 };
    if (hot.dmg) {
      log(g, { zh: `${opName(op, 'zh')} 武器過熱（擲 ${roll}）：自身受到 ${hot.dmg} 傷害`, en: `${opName(op, 'en')} overheats (rolled ${roll}): takes ${hot.dmg} damage` }, `side${op.side}`);
      hot.killed = applyDamage(g, op, op, hot.dmg);
    }
  }
  g.shotTargets = null;
  for (const o of g.ops) o.medicShield = false;
  return { kind: 'shoot', attacker: op.uid, weapon, ap, ...main, extra, hot, suppressed: noReroll };
}

export function bestMelee(op) {
  const ws = tpl(op).weapons.filter((w) => w.type === 'melee');
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
const weaponById = (op, id) => tpl(op).weapons.find((w) => w.id === id);
const other = (k) => (k === 'A' ? 'D' : 'A');
const left = (p) => p.c + p.n;

export function startFight(g, op, weapon, target) {
  const dWeapon = bestMelee(target);
  const ar = effectiveRules(g, op, weapon, target);
  const dr = effectiveRules(g, target, dWeapon, op);
  const aHit = clampHit(weapon.hit + (statPenalty(g, op) ? 1 : 0));
  const dHit = clampHit(dWeapon.hit + (statPenalty(g, target) ? 1 : 0));
  const aRoll = rollPool(weapon.atk, aHit, ar.lethal || 6, ar);
  const dRoll = rollPool(dWeapon.atk, dHit, dr.lethal || 6, dr);
  spend(g, op, 'fight');
  // dueller: (Chapter Tactic) a normal success can block a critical success.
  // tox: Toxic bonus (foe poisoned at the start of the action); shock: Shock not used yet this sequence.
  const side = (o, foe, w, r, roll, hit) => ({
    uid: o.uid, w: w.id, c: roll.crits, n: roll.norms, brutal: !!r.brutal, dueller: hasTactic(g, o, 'dueller'), hit, dice: roll.dice, before: o.wounds,
    tox: r.toxic && foe.poison ? 1 : 0, poison: !!r.poison, shock: !!r.shock && !hasTactic(g, foe, 'resolute'),
  });
  g.fight = { A: side(op, target, weapon, ar, aRoll, aHit), D: side(target, op, dWeapon, dr, dRoll, dHit), turn: 'A', steps: [], done: false };
  stunOnCrit(g, ar, aRoll.crits, target);
  stunOnCrit(g, dr, dRoll.crits, op);
  advanceFight(g);
  return g.fight;
}

export const fightOp = (g, k) => getOp(g, g.fight[k].uid);
export const fightWeapon = (g, k) => weaponById(fightOp(g, k), g.fight[k].w);
/** Which player (side 0/1) must choose next. */
export const fightChooser = (g) => fightOp(g, g.fight.turn).side;

/** Legal choices for the side whose turn it is. */
export function fightOptions(g) {
  const f = g.fight, k = f.turn, me = f[k], foe = f[other(k)];
  const w = fightWeapon(g, k), foeOp = fightOp(g, other(k));
  const opts = [];
  if (me.c) opts.push({ id: 'strike-c', act: 'strike', die: 'c', dmg: w.dmg[1] + (me.tox || 0) });
  if (me.n) opts.push({ id: 'strike-n', act: 'strike', die: 'n', dmg: normalDmg(w, foeOp) + (me.tox || 0) });
  // Parry: a crit cancels any success, a normal cancels a normal (not vs Brutal).
  if (me.c && foe.c) opts.push({ id: 'parry-c-c', act: 'parry', die: 'c', target: 'c' });
  if (me.c && foe.n) opts.push({ id: 'parry-c-n', act: 'parry', die: 'c', target: 'n' });
  if (me.n && foe.n && !foe.brutal) opts.push({ id: 'parry-n-n', act: 'parry', die: 'n', target: 'n' });
  if (me.n && foe.c && me.dueller && !foe.brutal) opts.push({ id: 'parry-n-c', act: 'parry', die: 'n', target: 'c' });
  return opts;
}

export function fightApply(g, optId) {
  const f = g.fight;
  const opt = fightOptions(g).find((o) => o.id === optId);
  if (!opt) return;
  const k = f.turn, me = f[k], foe = f[other(k)];
  me[opt.die]--;
  if (opt.act === 'strike') {
    const meOp = fightOp(g, k), foeOp = fightOp(g, other(k));
    const res = resolveDice(foeOp, [opt.dmg]); // Disgustingly Resilient
    // Shock: the first crit strike in the sequence also discards an unresolved enemy normal (else a crit).
    let shocked = null;
    if (opt.die === 'c' && me.shock) {
      me.shock = false;
      if (foe.n) { foe.n--; shocked = 'n'; } else if (foe.c) { foe.c--; shocked = 'c'; }
    }
    const killed = applyDamage(g, meOp, foeOp, res.dmg);
    poisonOnHit(g, meOp, foeOp, { poison: me.poison }, res.dmg);
    f.steps.push({ side: k, act: 'strike', crit: opt.die === 'c', dmg: res.dmg, killed, resil: res.rolls[0], shocked });
  } else {
    foe[opt.target]--;
    f.steps.push({ side: k, act: 'parry', crit: opt.die === 'c', blocked: opt.target === 'c' });
  }
  f.turn = other(k);
  advanceFight(g);
}

/** Skip sides with no dice, auto-strike when the opponent has nothing left to parry, detect the end. */
function advanceFight(g) {
  const f = g.fight;
  if (fightOp(g, 'A').dead || fightOp(g, 'D').dead || (!left(f.A) && !left(f.D))) return finishFight(g);
  if (!left(f[f.turn])) f.turn = other(f.turn);
  if (left(f[other(f.turn)])) return; // a real choice remains
  // Opponent has no dice: only strikes are possible, so resolve them (crits first).
  fightApply(g, fightOptions(g)[0].id);
}

function finishFight(g) {
  const f = g.fight;
  if (f.done) return;
  f.done = true;
  const a = fightOp(g, 'A'), d = fightOp(g, 'D');
  log(g, {
    zh: `${opName(a, 'zh')} 與 ${opName(d, 'zh')} 近戰：造成 ${f.D.before - d.wounds}，承受 ${f.A.before - a.wounds}`,
    en: `${opName(a, 'en')} fights ${opName(d, 'en')}: dealt ${f.D.before - d.wounds}, took ${f.A.before - a.wounds}`,
  }, `side${a.side}`);
  // Dat All You Got?: after fighting or retaliating, if still standing, inflict D3 damage on the enemy.
  for (const [me, foe] of [[a, d], [d, a]]) {
    if (!tpl(me).datAllYouGot || me.dead || foe.dead) continue;
    const dmg = 1 + Math.floor(Math.random() * 3);
    log(g, { zh: `${opName(me, 'zh')}「就這樣？」：${opName(foe, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(me, 'en')} "Dat All You Got?": ${opName(foe, 'en')} takes ${dmg} damage` }, `side${me.side}`);
    applyDamage(g, me, foe, dmg);
    f.datAllYouGot = { side: me === a ? 'A' : 'D', dmg };
  }
  for (const o of g.ops) o.medicShield = false;
}

export function endFight(g) { g.fight = null; }

/** Computer choice for the current fight die. */
export function fightAutoChoice(g) {
  const f = g.fight, k = f.turn, me = f[k], foe = f[other(k)];
  const meOp = fightOp(g, k), foeOp = fightOp(g, other(k));
  const opts = fightOptions(g);
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
