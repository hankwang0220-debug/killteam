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

export function moveStat(g, op) {
  return tpl(op).move - (injuredPenalty(g, op) ? 2 : 0) + (hasPloy(g, op.side, 'moveMove') ? 1 : 0);
}
export function moveAllowance(g, op, kind) {
  let d = moveStat(g, op);
  if (kind === 'dash') d = 3;
  if (kind === 'charge') d = moveStat(g, op) + 2 + (op.team === 'greenskin' ? 1 : 0);
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
          marked: false, damagedTP: false, dead: false, counteracted: false,
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

export const ployCost = (g, side, ploy) => (freePloyOp(g, side, ploy) ? 0 : ploy.cp);

/** Already used this ploy, or another from its group (e.g. one Combat Doctrine per turning point). */
export const ployTaken = (g, side, ploy) => g.ploys[side].some((id) => id === ploy.id
  || (ploy.group && team(g, side).ploys.find((p) => p.id === id)?.group === ploy.group));

export function buyPloy(g, side, ploy) {
  const cost = ployCost(g, side, ploy);
  if (side !== ployChooser(g) || g.cp[side] < cost || ployTaken(g, side, ploy)) return false;
  g.cp[side] -= cost;
  g.ploys[side].push(ploy.id);
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
    op.ap = tpl(op).apl;
    op.orderSet = false;
    op.prevOrder = op.order;
    op.optics = false; // Optics lasts until the start of the operative's next activation
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
    if (op.counter) { op.counter = false; op.counteracted = true; }
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
    if (dist(o, obj) - radius(o) - OBJ_R <= CONTROL) sum[o.side] += tpl(o).apl;
  }
  if (sum[0] > sum[1]) return 0;
  if (sum[1] > sum[0]) return 1;
  return null;
}

function endTP(g) {
  log(g, { zh: `第 ${g.tp} 回合結束`, en: `End of Turning Point ${g.tp}` }, 'tp');
  g.ploys = [[], []];
  for (const o of g.ops) { o.marked = false; o.damagedTP = false; }
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
  mark: { ap: 1, name: { zh: '標記', en: 'Mark' } },
  optics: { ap: 1, name: { zh: '光學瞄準', en: 'Optics' } },
};

export function actionCost(g, op, id) {
  if (id === 'fallBack' && (hasPloy(g, op.side, 'strikeFade') || hasTactic(g, op, 'mobile'))) return 1;
  return ACTIONS[id].ap;
}

// The second Shoot of an Astartes activation costs +1AP if both use the sniper rifle or heavy bolter.
const DOUBLE_SHOT_GROUPS = ['sniper', 'heavyBolter'];

/** Can the active operative shoot with this weapon now? {ok, ap, why} */
export function shootWeapon(g, op, w) {
  const no = (zh, en) => ({ ok: false, ap: 1, why: { zh, en } });
  if (w.type !== 'ranged') return no('不是遠程武器', 'Not a ranged weapon');
  if (op.order === 'conceal' && !w.rules.silent) return no('隱蔽指令無法射擊（需「無聲」）', 'Concealed (needs Silent)');
  const reMoved = MOVE_ACTIONS.some((k) => count(op, k));
  if (w.rules.heavy === 'dash' ? reMoved : w.rules.heavy && moved(op)) return no('本次已移動，不能用重型武器', 'Moved — cannot use a Heavy weapon');
  let ap = 1;
  if (count(op, 'shoot')) {
    const first = op.acted.shotWith;
    if (!isBoltWeapon(w) && !op.acted.shotBolt) return no('兩次射擊至少一次要用爆彈武器', 'One of the two Shoots must use a bolt weapon');
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
  add('charge', !chargeEngaged && !conceal && !heavy && !did('charge', 'reposition', 'dash', 'fallBack'), chargeEngaged ? ENG : conceal ? CONC : heavy ? HEAVY : count(op, 'charge') ? DONE : COMBO);
  add('fallBack', engaged && !heavy && !did('fallBack', 'reposition', 'charge'), !engaged ? { zh: '未處於交戰', en: 'Not engaged' } : heavy ? HEAVY : count(op, 'fallBack') ? DONE : COMBO);
  const shots = tpl(op).weapons.filter((w) => w.type === 'ranged').map((w) => shootWeapon(g, op, w));
  const shootWhy = engaged ? ENG : !attackAllowed(op, 'shoot') ? DONE : (shots.find((s) => !s.ok)?.why || DONE);
  add('shoot', hasRanged && !engaged && attackAllowed(op, 'shoot') && shots.some((s) => s.ok), shootWhy);
  add('fight', engaged && attackAllowed(op, 'fight'), !engaged ? { zh: '沒有交戰中的敵人', en: 'No enemy in engagement' } : DONE);
  if (op.team === 'pathfinders') add('mark', !count(op, 'mark'), DONE);
  if (tpl(op).optics) add('optics', !engaged && !count(op, 'optics'), engaged ? ENG : DONE);
  return list;
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
  log(g, { zh: `${opName(op, 'zh')} ${ACTIONS[kind].name.zh} ${path.len.toFixed(1)}"`, en: `${opName(op, 'en')} ${ACTIONS[kind].name.en} ${path.len.toFixed(1)}"` }, `side${op.side}`);
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
      if (dt <= 1 && !close && !(opts.ignoreLight && t.kind === 'light')) cover = true;
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

const shotVisibility = (g, op, target, weapon, extra = {}) => visibility(g, op, target, { noObscure: !!op.optics, ...extra });

/** Is target a valid target for op with this weapon (visible, and not a Concealed operative in cover)? */
function validTarget(g, op, target, weapon) {
  const v = shotVisibility(g, op, target, weapon);
  if (!v.visible) return null;
  if (target.order === 'conceal') {
    const vt = weapon.rules.seekLight ? shotVisibility(g, op, target, weapon, { ignoreLight: true }) : v;
    if (vt.cover) return null;
  }
  return v;
}

/** Can op shoot target with weapon? Returns {ok, cover} */
export function shootCheck(g, op, target, weapon) {
  if (target.dead || target.side === op.side) return { ok: false };
  if (!shootWeapon(g, op, weapon).ok) return { ok: false };
  const v = validTarget(g, op, target, weapon);
  if (!v) return { ok: false };
  if (living(g, op.side).some((f) => inEngagement(f, target))) return { ok: false };
  if (!inRange(op, target, weapon)) return { ok: false };
  return { ok: true, cover: v.cover };
}

export function markCheck(g, op, target) {
  if (target.dead || target.side === op.side) return false;
  const v = visibility(g, op, target);
  return v.visible && !(target.order === 'conceal' && v.cover);
}

export function doMark(g, op, target) {
  target.marked = true;
  spend(g, op, 'mark');
  log(g, { zh: `${opName(op, 'zh')} 標記了 ${opName(target, 'zh')}`, en: `${opName(op, 'en')} marked ${opName(target, 'en')}` }, `side${op.side}`);
}

// ---------- dice ----------
export function effectiveRules(g, op, weapon, target) {
  const r = { ...weapon.rules };
  if (weapon.type === 'melee') {
    if (hasPloy(g, op.side, 'docAssault')) r.balanced = true;
    if (hasPloy(g, op.side, 'waaagh')) r.atkBonus = (r.atkBonus || 0) + 1;
    if (op.team === 'greenskin' && count(op, 'charge')) r.ceaseless = true;
    if (hasTactic(g, op, 'aggressive')) r.rending = true;
  } else {
    if (hasPloy(g, op.side, 'takeAim')) r.balanced = true;
    if (target && hasPloy(g, op.side, edgeDist(op, target) > 6 ? 'docDevastator' : 'docTactical')) r.balanced = true;
    if (hasPloy(g, op.side, 'fireDiscipline')) r.ceaseless = true;
    if (op.team === 'troopers' && target?.damagedTP) r.ceaseless = true;
    if (target?.marked) { r.ignoreCover = true; r.hitMod = (r.hitMod || 0) - 1; }
    if (hasTactic(g, op, 'siege')) r.saturate = true;
    if (hasTactic(g, op, 'sharpshooter') && isBoltWeapon(weapon) && !MOVE_ACTIONS.some((k) => count(op, k))) {
      r.accurate = Math.max(r.accurate || 0, 1); r.severe = true;
    }
  }
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
    // Severe: no critical success retained, so one normal success becomes critical (Rending then doesn't apply).
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.sev = true;
    crits++; norms--;
  } else if (rules.rending && crits > 0 && norms > 0) {
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.rend = true;
    crits++; norms--;
  }
  return { dice, crits, norms };
}

const clampHit = (h) => Math.min(6, Math.max(2, h));

/** Normal damage after the target's defensive traits (greenskin thick hide). */
const normalDmg = (w, target) => (target.team === 'greenskin' && w.dmg[0] >= 4 ? w.dmg[0] - 1 : w.dmg[0]);

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

function applyDamage(g, src, target, dmg) {
  if (dmg <= 0) return false;
  target.wounds -= dmg;
  target.damagedTP = true;
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

/** One shooting sequence (attack dice, defence dice, damage) against one target. */
function shootSequence(g, op, weapon, target, cover) {
  const rules = effectiveRules(g, op, weapon, target);
  const hit = clampHit(weapon.hit + (injuredPenalty(g, op) ? 1 : 0) + (rules.hitMod || 0));
  const atk = weapon.atk + (rules.atkBonus || 0);
  const a = rollPool(atk, hit, rules.lethal || 6, rules);
  const inCover = cover && !rules.ignoreCover;
  const pierce = (rules.piercing || 0) + (a.crits > 0 ? rules.piercingCrits || 0 : 0);
  const defDice = Math.max(0, DEFENCE_DICE - pierce);
  const camo = !!tpl(target).camoCloak; // Camo Cloak ignores Saturate
  const saturated = rules.saturate && !camo;
  // A Concealed target in cover can't be shot at all, so any target here that's in cover gets the cover save.
  const base = inCover && !saturated ? (hasPloy(g, target.side, 'sneakyGits') ? 2 : 1) : 0;
  let coverN = base, coverC = 0;
  if (base && hasTactic(g, target, 'stealthy')) {
    // Stealthy: one more cover save, or one as a critical; Camo Cloak with the Stealthy tactic gets both.
    if (camo && g.tactics?.[target.side]?.includes('stealthy')) coverC = 1;
    else if (a.crits > 0) { coverN--; coverC = 1; } else coverN++;
  }
  coverC = Math.min(coverC, defDice);
  coverN = Math.min(coverN, defDice - coverC);
  const save = tpl(target).save;
  const d = rollPool(defDice - coverN - coverC, save, hasTactic(g, target, 'hardy') ? 5 : 6);
  if (hasPloy(g, target.side, 'indomitus')) {
    // Indomitus: with two or more fails, discard one to retain another as a normal success.
    const misses = d.dice.filter((x) => x.res === 'miss');
    if (misses.length >= 2) { misses[0].res = 'norm'; misses[0].indo = true; d.norms++; }
  }
  const block = bestBlock(a.crits, a.norms, d.crits + coverC, d.norms + coverN, normalDmg(weapon, target), weapon.dmg[1]);
  const dev = (rules.devastating || 0) * a.crits;
  const dmg = block.dmg + dev;
  const before = target.wounds;
  const killed = applyDamage(g, op, target, dmg);
  return {
    target: target.uid, rules, hit, atk, attack: a, save, defDice, coverSaves: coverN + coverC, coverCrit: coverC,
    inCover, saturated: rules.saturate && inCover, pierce, defence: d, dmg, dev, remC: block.remC, remN: block.remN,
    before, after: target.wounds, killed,
  };
}

/** Other targets hit by Torrent / Blast after the primary target. */
function secondaryTargets(g, op, weapon, primary) {
  const { torrent, blast } = weapon.rules;
  if (torrent) {
    return living(g, 1 - op.side).filter((t) => t !== primary && edgeDist(primary, t) <= torrent + 0.01
      && shootCheck(g, op, t, weapon).ok);
  }
  if (blast) {
    // Any operative (friend or foe) visible to and within x of the primary target; Conceal doesn't matter.
    return g.ops.filter((t) => !t.dead && t !== primary && t !== op && edgeDist(primary, t) <= blast + 0.01
      && visibility(g, primary, t).visible);
  }
  return [];
}

export function resolveShoot(g, op, weapon, target) {
  const ap = shootWeapon(g, op, weapon).ap;
  const vis = shotVisibility(g, op, target, weapon);
  const others = secondaryTargets(g, op, weapon, target); // chosen before any damage is dealt
  const main = shootSequence(g, op, weapon, target, vis.cover);
  spend(g, op, 'shoot', ap);
  if (weapon.rules.heavy) op.acted.heavy = weapon.rules.heavy === 'dash' && op.acted.heavy !== 1 ? 'dash' : 1;
  op.acted.shotWith = weapon.group;
  if (isBoltWeapon(weapon)) op.acted.shotBolt = true;
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
    const s = shootSequence(g, op, weapon, t, cover);
    logShot(t, s);
    extra.push(s);
  }
  return { kind: 'shoot', attacker: op.uid, weapon, ap, ...main, extra };
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
  const aHit = clampHit(weapon.hit + (injuredPenalty(g, op) ? 1 : 0));
  const dHit = clampHit(dWeapon.hit + (injuredPenalty(g, target) ? 1 : 0));
  const aRoll = rollPool(weapon.atk + (ar.atkBonus || 0), aHit, ar.lethal || 6, ar);
  const dRoll = rollPool(dWeapon.atk + (dr.atkBonus || 0), dHit, dr.lethal || 6, dr);
  spend(g, op, 'fight');
  // dueller: (Chapter Tactic) a normal success can block a critical success.
  g.fight = {
    A: { uid: op.uid, w: weapon.id, c: aRoll.crits, n: aRoll.norms, brutal: !!ar.brutal, dueller: hasTactic(g, op, 'dueller'), hit: aHit, dice: aRoll.dice, before: op.wounds },
    D: { uid: target.uid, w: dWeapon.id, c: dRoll.crits, n: dRoll.norms, brutal: !!dr.brutal, dueller: hasTactic(g, target, 'dueller'), hit: dHit, dice: dRoll.dice, before: target.wounds },
    turn: 'A', steps: [], done: false,
  };
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
  if (me.c) opts.push({ id: 'strike-c', act: 'strike', die: 'c', dmg: w.dmg[1] });
  if (me.n) opts.push({ id: 'strike-n', act: 'strike', die: 'n', dmg: normalDmg(w, foeOp) });
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
    const killed = applyDamage(g, fightOp(g, k), fightOp(g, other(k)), opt.dmg);
    f.steps.push({ side: k, act: 'strike', crit: opt.die === 'c', dmg: opt.dmg, killed });
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
