// Missions: map, drop zones, markers, NPOs, mission actions and scoring.
// Maps are rebuilt in 2D from the official mission-pack maps (1 grid square = 1"): walls of
// strongholds and ruins are Heavy terrain, rubble is Heavy or Light, upper floors are left out.
import {
  BOARD, CONTROL, NPO, OBJ_R, addVP, aplNow, applyDamage, contests, controller, d6, deployZones, edgeDist, getOp, isEngaged, missionEngaged, living, log, opName, radius,
  spawnNpo, team, territoryOf, tpl, visibility,
} from './game.js';
import { dist, distPointRect } from './geometry.js';
import { moveCtx } from './path.js';

const wall = (x, y, w, h) => ({ kind: 'heavy', x, y, w, h });
const block = (x, y, w, h) => ({ kind: 'heavy', x, y, w, h });
const rubble = (x, y, w, h) => ({ kind: 'light', x, y, w, h });
const T = 0.3; // wall thickness

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const npos = (g) => living(g, NPO);
const players = (g) => g.ops.filter((o) => !o.dead && o.side !== NPO);
const sideName = (g, s, lang) => (lang === 'zh' ? `${team(g, s).name.zh}` : team(g, s).name.en);

/** The nearest sampled spot clear of all cover and other operative bases. */
function nearestFree(g, op, p) {
  const r = radius(op), ctx = moveCtx(g, op);
  for (let ring = 0; ring <= 6; ring += 0.5) {
    for (let a = 0; a < 16; a++) {
      const q = { x: p.x + Math.cos(a * Math.PI / 8) * ring, y: p.y + Math.sin(a * Math.PI / 8) * ring };
      if (q.x < r || q.y < r || q.x > BOARD.w - r || q.y > BOARD.h - r) continue;
      if (!ctx.free(q)) continue;
      if (g.ops.some((o) => o !== op && !o.dead && dist(o, q) < radius(o) + r + 0.05)) continue;
      return q;
    }
  }
  return null;
}

// ---------- Decaying Generatorium (Ambull mission pack, mission 2) ----------
// Killzone: Volkus. Drop zones on the short edges (6" deep), three objective markers.
const GENERATORIUM_TERRAIN = [
  // Stronghold B (centre top): walls with a door in the top wall.
  wall(11.1, 3.0, 2.4, T), wall(15.3, 3.0, 3.7, T), wall(11.1, 3.0, T, 7.9), wall(18.7, 3.0, T, 7.9), wall(11.1, 10.6, 7.9, T),
  rubble(11.3, 8.3, 1.2, 2.3), // N crates
  rubble(14.0, 7.2, 2.0, 3.4), // I light rubble
  block(16.85, 7.3, 1.85, 3.3), // L machinery
  // Stronghold A (right, in drop zone B): door in the top wall.
  wall(24.1, 3.1, 3.6, T), wall(29.5, 3.1, 0.5, T), wall(24.1, 3.1, T, 7.8), wall(24.1, 10.6, 5.9, T),
  block(27.4, 9.3, 2.5, 1.3), // M machinery
  // Small ruins E and F (left).
  wall(6.05, 2.5, T, 5.3), wall(6.05, 7.5, 2.9, T),
  wall(6.05, 12.1, T, 4.5), wall(6.05, 12.1, 1.5, T),
  // Large ruins C and D (bottom middle), linked by heavy rubble G.
  wall(9.7, 13.7, T, 6.3), wall(9.7, 19.7, 2.0, T), wall(12.8, 19.7, 1.2, T),
  wall(19.6, 14.3, T, 2.7), wall(19.6, 18.5, T, 1.5), wall(16.2, 19.7, 3.7, T),
  block(13.5, 16.1, 3.0, 0.9), // G heavy rubble
  block(23.1, 16.35, 0.9, 2.7), // H heavy rubble
  rubble(14.65, 11.0, 0.7, 2.5), // J light rubble
  rubble(6.05, 20.05, 0.65, 1.95), // K light rubble
];
const GENERATORIUM_OBJECTIVES = [{ x: 15, y: 6.4 }, { x: 12.15, y: 15.9 }, { x: 17.7, y: 15.9 }];

/** NPO activation deck for the Ambull and Borewyrms (cards 1–8). */
const AMBULL_CARDS = {
  borewyrm: { zh: '鑽地蟲啟動', en: 'Borewyrm Activation' },
  radMaggot: { zh: '輻射蛆爆發', en: 'Rad-Maggot Outbreak' },
  energyPulse: { zh: '能量脈衝', en: 'Energy Pulse' },
  ambull: { zh: '安布爾啟動', en: 'Ambull Activation' },
  enraged: { zh: '狂怒的安布爾', en: 'Enraged Ambull Activation' },
};
const ambullCard = (n) => (n <= 4 ? 'borewyrm' : n === 5 ? 'radMaggot' : n === 6 ? 'energyPulse' : n === 7 ? 'ambull' : 'enraged');

/** Intruder deck (cards 9–13): 9–10 nothing, 11–12 a Borewyrm emerges, 13 the Ambull emerges. */
function drawIntruder(g, by) {
  const s = g.npoState;
  const card = s.intruder.pop();
  if (card == null) return;
  const kind = card >= 13 ? 'ambull' : card >= 11 ? 'borewyrm' : null;
  if (!kind || !s.reserve.includes(kind)) {
    log(g, { zh: `入侵者牌 ${card}：沒有事發生`, en: `Intruder card ${card}: nothing happens` }, 'npo');
    return;
  }
  s.reserve.splice(s.reserve.indexOf(kind), 1);
  // From a mission action: next to the active operative. At the end of a turning point: at a random
  // objective marker, near enemy operatives if possible.
  let at;
  if (by) at = { x: by.x, y: by.y };
  else {
    const objs = shuffle([...g.objectives]);
    at = objs.find((o) => players(g).some((p) => dist(p, o) < 3)) || objs[0];
  }
  const op = spawnNpo(g, kind);
  const p = nearestFree(g, op, at);
  if (!p) { g.ops.splice(g.ops.indexOf(op), 1); s.reserve.push(kind); return; }
  op.x = p.x; op.y = p.y;
  log(g, { zh: `入侵者牌 ${card}：${opName(op, 'zh')} 從地底竄出！`, en: `Intruder card ${card}: ${opName(op, 'en')} bursts out of the ground!` }, 'npo');
}

const generatorium = {
  id: 'generatorium',
  name: { zh: '衰敗發電廠（安布爾）', en: 'Decaying Generatorium (Ambull)' },
  desc: {
    zh: '雙人對戰＋第三方 NPO。在目標點執行「抽取能源」得分（每回合最多 2 VP），殺死安布爾得 2 VP，撿起鑽地蟲標記到最後每個 1 VP。每次抽取能源與第 2 回合起每回合結束時抽入侵者牌，可能讓安布爾或鑽地蟲從地底冒出。玩家在目標點控制範圍內不能重擲。4 回合結束時 VP 多者勝。',
    en: 'PvP with third-party NPOs. Siphon Power at objective markers (max 2VP per TP), 2VP for killing the Ambull, 1VP per Borewyrm marker carried at the end. Each Siphon Power and each TP end from TP2 draws an Intruder card that may bring the Ambull or Borewyrms up from below. Operatives near an objective marker can\'t re-roll. Most VP after TP4 wins.',
  },
  source: 'Ambull Mission Pack',
  killOp: false,
  playOut: true,
  npoKillsIgnored: true,
  noRerollNearObjective: true, // Sickening Emissions
  npoMoveCap: 12,
  terrain: GENERATORIUM_TERRAIN,
  objectives: GENERATORIUM_OBJECTIVES,
  setup(g) {
    g.npoState = { deck: [], intruder: shuffle([9, 10, 11, 12, 13]), reserve: ['ambull', 'borewyrm', 'borewyrm'], siphon: [0, 0] };
  },
  onReady(g) {
    g.npoState.deck = shuffle(range(1, 8));
    g.npoState.siphon = [0, 0];
  },
  onTPEnd(g) { if (g.tp >= 2) drawIntruder(g, null); },
  npoSlotDue: (g) => npos(g).length > 0,
  /** Draw an NPO activation card; returns the NPO to activate {op, apl, fights} or null. */
  npoDraw(g) {
    const s = g.npoState;
    if (!s.deck.length) s.deck = shuffle(range(1, 8));
    const n = s.deck.pop(), card = ambullCard(n);
    log(g, { zh: `NPO 啟動牌 ${n}：${AMBULL_CARDS[card].zh}`, en: `NPO activation card ${n}: ${AMBULL_CARDS[card].en}` }, 'npo');
    const ambull = npos(g).find((o) => o.tplId === 'ambull');
    if (card === 'borewyrm') {
      const wyrms = npos(g).filter((o) => o.tplId === 'borewyrm');
      const op = wyrms.find((o) => o.ready) || wyrms[0];
      return op ? { op, apl: 1 } : null;
    }
    if (card === 'radMaggot') {
      for (const o of players(g)) {
        const roll = d6();
        if (roll < tpl(o).save) applyDamage(g, null, o, Math.ceil(roll / 2));
      }
      log(g, { zh: '輻射蛆咬傷所有在地面上的特工（擲骰小於豁免值者受傷）', en: 'Rad-maggots bite every operative on the floor (a roll under its Save hurts)' }, 'npo');
      return null;
    }
    if (card === 'energyPulse') {
      if (!ambull) return null;
      for (const o of players(g).filter((p) => edgeDist(p, ambull) <= 6)) applyDamage(g, ambull, o, d6());
      log(g, { zh: '能量脈衝：安布爾 6" 內的特工各受 D6 傷害', en: 'Energy Pulse: each operative within 6" of the Ambull takes D6 damage' }, 'npo');
      return null;
    }
    if (!ambull || ambull.actTP >= 2) return null;
    return { op: ambull, apl: card === 'enraged' ? 3 : 2, fights: card === 'enraged' ? 2 : 1 };
  },
  /** Drawn to Energy: Ambull and Borewyrms move towards the closest objective marker. */
  npoGoal(g, op) {
    return [...g.objectives].sort((a, b) => dist(op, a) - dist(op, b))[0];
  },
  actions: ['siphon'],
  canPickUp: (g, op, m) => m.kind === 'borewyrm',
  onIncapacitated(g, target, src) {
    if (target.tplId === 'ambull' && src && src.side !== NPO) {
      g.vp[src.side] += 2;
      log(g, { zh: `${sideName(g, src.side, 'zh')} 使安布爾殘廢（+2 VP）`, en: `${sideName(g, src.side, 'en')} brings down the Ambull (+2VP)` }, 'tp');
    }
    if (target.tplId === 'borewyrm') {
      g.markers.push({ id: g.markers.length, kind: 'borewyrm', x: target.x, y: target.y, carriedBy: null });
      log(g, { zh: '鑽地蟲殘廢，留下鑽地蟲標記（可撿起）', en: 'The Borewyrm leaves a Borewyrm marker (can be picked up)' }, 'npo');
    }
  },
  onBattleEnd(g) {
    for (const m of g.markers.filter((x) => x.kind === 'borewyrm' && x.carriedBy)) {
      const c = getOp(g, m.carriedBy);
      if (c && !c.dead && c.side !== NPO) {
        g.vp[c.side]++;
        log(g, { zh: `${opName(c, 'zh')} 帶著鑽地蟲標記（+1 VP）`, en: `${opName(c, 'en')} carries a Borewyrm marker (+1VP)` }, 'tp');
      }
    }
  },
};

// ---------- Negotiation (The Archivist mission pack, mission 2) ----------
// Killzone: Volkus. Drop zones on the long edges (3" deep); nine Infocore mission markers.
const NEGOTIATION_TERRAIN = [
  // Stronghold A (left): door in the top wall.
  wall(2.0, 3.1, 3.6, T), wall(7.3, 3.1, 0.6, T), wall(2.0, 3.1, T, 7.8), wall(7.6, 3.1, T, 7.8), wall(2.0, 10.6, 5.9, T),
  block(5.3, 9.3, 2.3, 1.3), // M machinery
  // Stronghold B (centre): door in the right wall.
  wall(11.1, 7.1, 7.9, T), wall(11.1, 14.7, 7.9, T), wall(11.1, 7.1, T, 7.9), wall(18.7, 7.1, T, 2.35), wall(18.7, 11.0, T, 4.0),
  rubble(11.3, 7.4, 2.4, 1.0), // N crates
  block(11.3, 12.85, 3.35, 1.8), // L machinery
  // Large ruins C (bottom right, door on the right) and D (right, door on the left).
  wall(26.65, 14.8, T, 0.7), wall(20.6, 18.6, 6.35, T),
  wall(24.3, 10.8, T, 2.9), wall(24.3, 8.1, 3.7, T),
  // Small ruins E and F.
  wall(8.4, 16.2, T, 2.8), wall(3.0, 18.7, 5.7, T),
  wall(13.0, 3.1, 4.7, T), wall(17.4, 3.1, T, 1.3),
  block(23.1, 3.0, 3.0, 0.9), // G heavy rubble
  block(3.0, 15.0, 2.7, 1.0), // H heavy rubble
  rubble(13.2, 18.05, 3.6, 2.0), // I light rubble
];
const INFOCORES = [
  { x: 10.5, y: 6.95 }, { x: 17.85, y: 6.45 }, { x: 2.6, y: 10.35 }, { x: 28.1, y: 7.55 }, { x: 21.5, y: 11.0 },
  { x: 24.9, y: 13.7 }, { x: 10.5, y: 14.6 }, { x: 18.65, y: 15.4 }, { x: 2.5, y: 15.4 },
];

/** Infocore markers controlled by a side (carried by its operatives, or controlled on the ground). */
const infocoresOf = (g, side) => g.markers.filter((m) => m.kind === 'infocore' && markerSide(g, m) === side).length;
function markerSide(g, m) {
  if (m.carriedBy) { const c = getOp(g, m.carriedBy); return c && !c.dead ? c.side : null; }
  return controller(g, m);
}

const negotiation = {
  id: 'negotiation',
  name: { zh: '談判（檔案管理員）', en: 'Negotiation (The Archivist)' },
  desc: {
    zh: '雙人對戰＋第三方 NPO。撿起並控制資訊核心（APL 3 以上的特工可帶兩個）；每回合結束時，對手控制幾個資訊核心，你就得幾點談判點。第 2 回合起檔案管理員出現，牠要啟動時雙方暗中出價談判點，出價高者本次啟動可操控牠。使檔案管理員殘廢得 1 VP，最後每控制一個資訊核心得 1 VP。4 回合結束時 VP 多者勝。',
    en: 'PvP with a third-party NPO. Pick up and control Infocore markers (APL 3+ operatives can carry two). At the end of each TP you gain Negotiation points equal to the Infocores your opponent controls. From TP2 the Archivist appears; whenever it would activate, both players secretly bid Negotiation points and the higher bid controls it for that activation. 1VP for incapacitating the Archivist, 1VP per Infocore you control at the end. Most VP after TP4 wins.',
  },
  source: 'The Archivist Mission Pack',
  killOp: false,
  playOut: true,
  npoKillsIgnored: true,
  npoMoveCap: 12,
  axis: 'y',
  deploy: [{ x0: 0, x1: 30, y0: 19, y1: 22 }, { x0: 0, x1: 30, y0: 0, y1: 3 }],
  terrain: NEGOTIATION_TERRAIN,
  objectives: [],
  setup(g) {
    g.markers = INFOCORES.map((p, i) => ({ id: i, kind: 'infocore', ...p, carriedBy: null }));
    g.npoState = { deck: [], reserve: ['archivist'] };
    g.negotiation = [0, 0];
  },
  onReady(g) {
    g.npoState.deck = shuffle(range(1, 13));
    if (g.tp === 2 && g.npoState.reserve.length) {
      // Touching the centre of a random neutral killzone edge.
      g.npoState.reserve = [];
      const op = spawnNpo(g, 'archivist');
      const left = Math.random() < 0.5, r = radius(op);
      const p = nearestFree(g, op, { x: left ? r : BOARD.w - r, y: BOARD.h / 2 });
      if (!p) { g.ops.splice(g.ops.indexOf(op), 1); g.npoState.reserve = ['archivist']; return; }
      op.x = p.x; op.y = p.y;
      log(g, { zh: `${opName(op, 'zh')} 從${left ? '左' : '右'}側邊緣出現`, en: `${opName(op, 'en')} arrives at the ${left ? 'left' : 'right'} edge` }, 'npo');
    }
  },
  onTPEnd(g) {
    // Negotiation points: the Infocores your opponent controls.
    for (const s of [0, 1]) {
      const n = infocoresOf(g, 1 - s);
      g.negotiation[s] += n;
      if (n) log(g, { zh: `${sideName(g, s, 'zh')} 獲得 ${n} 點談判點（共 ${g.negotiation[s]}）`, en: `${sideName(g, s, 'en')} gains ${n} Negotiation point(s) (${g.negotiation[s]} total)` }, `side${s}`);
    }
  },
  npoSlotDue: (g) => npos(g).length > 0,
  npoDraw(g) {
    const s = g.npoState;
    if (!s.deck.length) s.deck = shuffle(range(1, 13));
    const n = s.deck.pop();
    const op = npos(g).find((o) => o.tplId === 'archivist');
    const apl = n >= 12 ? 3 : n >= 9 ? 2 : 0;
    log(g, { zh: `NPO 啟動牌 ${n}：${apl ? `檔案管理員啟動（APL ${apl}）` : '略過'}`, en: `NPO activation card ${n}: ${apl ? `the Archivist activates (APL ${apl})` : 'skip'}` }, 'npo');
    if (!apl || !op || op.actTP >= 2) return null;
    return { op, apl, bid: true };
  },
  /** Modified threat principle: the closest player operative in its control range, else the closest one controlling an Infocore. */
  npoTarget(g, op) {
    const ps = players(g).sort((a, b) => dist(op, a) - dist(op, b));
    const close = ps.find((p) => edgeDist(op, p) <= 1);
    if (close) return close;
    const holders = ps.filter((p) => g.markers.some((m) => m.kind === 'infocore' && (m.carriedBy === p.uid || (!m.carriedBy && controller(g, m) === p.side && dist(p, m) - radius(p) <= 1.4))));
    return holders.find((p) => visibility(g, op, p).visible) || holders[0] || null;
  },
  canPickUp: (g, op, m) => m.kind === 'infocore' && op.tplId !== 'archivist',
  carryCap: (g, op) => (tpl(op).apl >= 3 ? 2 : 1),
  onIncapacitated(g, target, src) {
    if (target.tplId === 'archivist' && src && src.side !== NPO && src !== target) {
      g.vp[src.side] += 1;
      log(g, { zh: `${sideName(g, src.side, 'zh')} 使檔案管理員殘廢（+1 VP）`, en: `${sideName(g, src.side, 'en')} incapacitates the Archivist (+1VP)` }, 'tp');
    }
  },
  onBattleEnd(g) {
    for (const s of [0, 1]) {
      const n = infocoresOf(g, s);
      g.vp[s] += n;
      if (n) log(g, { zh: `${sideName(g, s, 'zh')} 控制 ${n} 個資訊核心（+${n} VP）`, en: `${sideName(g, s, 'en')} controls ${n} Infocore(s) (+${n}VP)` }, 'tp');
    }
  },
};

// ---------- mission actions ----------
// cond(g, op) -> null if allowed, else a reason; apply(g, op) performs it.
export const MISSION_ACTIONS = {
  // ----- Crit Ops (Approved Ops 2025) -----
  secure: {
    ap: 1, name: { zh: '確保', en: 'Secure' },
    cond: (g, op) => critCond(g, op, 2, ctrlObj(g, op, (o) => o.secured !== op.side), NO_OBJ),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => x.secured !== op.side);
      o.secured = op.side;
      log(g, { zh: `${opName(op, 'zh')} 確保了${objName(o, 'zh')}`, en: `${opName(op, 'en')} secures ${objName(o, 'en')}` }, `side${op.side}`);
    },
  },
  loot: {
    ap: 1, name: { zh: '掠奪', en: 'Loot' },
    cond: (g, op) => critCond(g, op, 2, ctrlObj(g, op, (o) => o.lootTP !== g.tp), { zh: '沒有可掠奪的目標點（要控制且本回合還沒被掠奪）', en: 'No objective to loot (controlled, not looted this TP)' }),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => x.lootTP !== g.tp);
      o.lootTP = g.tp;
      const n = perTP(g, 'loot');
      log(g, { zh: `${opName(op, 'zh')} 掠奪了${objName(o, 'zh')}`, en: `${opName(op, 'en')} loots ${objName(o, 'en')}` }, `side${op.side}`);
      if (n[op.side] < 2) { n[op.side]++; addVP(g, op.side, 1, 'crit', { zh: '掠奪', en: 'Loot' }); }
      else log(g, { zh: '（本回合掠奪 VP 已達上限 2）', en: '(Loot VP limit of 2 reached this TP)' }, `side${op.side}`);
    },
  },
  transmit: {
    ap: 1, name: { zh: '開始傳輸', en: 'Initiate Transmission' },
    cond: (g, op) => critCond(g, op, 2, ctrlObj(g, op, (o) => o.transmitTP !== g.tp), { zh: '沒有可傳輸的目標點（要控制且還沒在傳輸）', en: 'No objective to transmit from (controlled, not transmitting yet)' }),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => x.transmitTP !== g.tp);
      o.transmitTP = g.tp;
      log(g, { zh: `${opName(op, 'zh')} 讓${objName(o, 'zh')}開始傳輸`, en: `${opName(op, 'en')} starts a transmission at ${objName(o, 'en')}` }, `side${op.side}`);
    },
  },
  ...Object.fromEntries([
    ['orbToTheirs', '移動寶珠到敵方目標點', 'Move Orb to the enemy objective', (g, s) => g.objectives.find((o) => isOwnObj(g, o, 1 - s))],
    ['orbToMine', '移動寶珠到我方目標點', 'Move Orb to your objective', (g, s) => g.objectives.find((o) => isOwnObj(g, o, s))],
    ['orbToCentre', '移動寶珠回中央', 'Move Orb to the centre', (g) => g.objectives.find((o) => o.centre)],
  ].map(([id, zh, en, dest]) => [id, {
    ap: 1, name: { zh, en },
    cond(g, op) {
      const at = g.objectives[g.orb];
      if (!at || (id === 'orbToCentre') === !!at.centre) return { zh: id === 'orbToCentre' ? '寶珠已在中央' : '寶珠不在中央', en: id === 'orbToCentre' ? 'The Orb is already in the centre' : 'The Orb isn\'t in the centre' };
      return critCond(g, op, 2, ctrlObj(g, op, (o) => o === at), { zh: '沒有控制有寶珠的目標點', en: 'Not controlling the objective with the Orb' });
    },
    apply(g, op) {
      const to = dest(g, op.side);
      g.orb = to.id;
      log(g, { zh: `${opName(op, 'zh')} 把寶珠移到${objName(to, 'zh')}`, en: `${opName(op, 'en')} moves the Orb to ${objName(to, 'en')}` }, `side${op.side}`);
    },
  }])),
  download: {
    ap: 1, name: { zh: '下載', en: 'Download' },
    cond: (g, op) => critCond(g, op, 3, ctrlObj(g, op, (o) => !o.downloaded && !isOwnObj(g, o, op.side)), { zh: '沒有可下載的目標點（中央或對手的、要控制且還沒下載過）', en: 'No objective to download (centre or the opponent\'s, controlled, not downloaded yet)' }),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => !x.downloaded && !isOwnObj(g, x, op.side));
      o.downloaded = true;
      log(g, { zh: `${opName(op, 'zh')} 下載了${objName(o, 'zh')}`, en: `${opName(op, 'en')} downloads ${objName(o, 'en')}` }, `side${op.side}`);
      addVP(g, op.side, g.tp >= 4 ? 2 : 1, 'crit', { zh: `第 ${g.tp} 回合下載`, en: `Download in TP${g.tp}` });
    },
  },
  compileData: {
    ap: 1, name: { zh: '彙整資料', en: 'Compile Data' },
    cond: (g, op) => critCond(g, op, 2, ctrlObj(g, op, (o) => o.dataTP !== g.tp), { zh: '沒有可彙整的目標點（要控制且本回合還沒獲得資料點）', en: 'No objective to compile at (controlled, no Data point gained this TP)' }),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => x.dataTP !== g.tp);
      o.dataTP = g.tp; o.data = (o.data || 0) + 1;
      perTP(g, 'compile')[op.side]++;
      log(g, { zh: `${opName(op, 'zh')} 在${objName(o, 'zh')}彙整資料（${o.data} 點）`, en: `${opName(op, 'en')} compiles data at ${objName(o, 'en')} (${o.data} point(s))` }, `side${op.side}`);
    },
  },
  sendData: {
    ap: 1, name: { zh: '傳送資料', en: 'Send Data' },
    cond: (g, op) => critCond(g, op, 4, ctrlObj(g, op, (o) => o.data > 0), { zh: '沒有有資料點的目標點可傳送', en: 'No objective with Data points to send' }),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => x.data > 0), n = o.data;
      o.data = 0;
      addVP(g, op.side, n, 'crit', { zh: `從${objName(o, 'zh')}傳送 ${n} 點資料`, en: `sends ${n} Data point(s) from ${objName(o, 'en')}` });
    },
  },
  reboot: {
    ap: 2, name: { zh: '重啟', en: 'Reboot' },
    cond: (g, op) => critCond(g, op, 2, ctrlObj(g, op, (o) => o.inertTP === g.tp), { zh: '沒有失效的目標點可重啟（要控制它）', en: 'No inert objective you control to reboot' }),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => x.inertTP === g.tp);
      o.inertTP = 0;
      log(g, { zh: `${opName(op, 'zh')} 重啟了${objName(o, 'zh')}`, en: `${opName(op, 'en')} reboots ${objName(o, 'en')}` }, `side${op.side}`);
    },
  },
  // ----- Tac Ops -----
  // Scout Enemy Movement: a ready enemy visible and more than 6" away is monitored until the next Ready step.
  scout: {
    ap: 1, name: { zh: '偵察', en: 'Scout' },
    cond(g, op) {
      if (op.order === 'engage') return { zh: '交戰指令不能執行', en: 'Not with an Engage order' };
      return critCond(g, op, 2, scoutTargets(g, op).length, { zh: '沒有 6" 外、可見且未啟動的敵人', en: 'No ready enemy visible and more than 6" away' });
    },
    /** t: the chosen enemy (the computer, or a click); otherwise the one most friendlies can see. */
    apply(g, op, t) {
      const seen = (e) => living(g, op.side).filter((f) => visibility(g, f, e).visible).length;
      const e = t || scoutTargets(g, op).sort((a, b) => seen(b) - seen(a))[0];
      (e.monitored ||= [0, 0])[op.side] = g.tp;
      reveal(g, op.side);
      return { zh: `偵察並監視 ${opName(e, 'zh')}`, en: `scouts and monitors ${opName(e, 'en')}` };
    },
  },
  // Plant Banner: once per battle, wholly within the opponent's territory and more than 5" from a neutral edge.
  plantBanner: {
    ap: 1, name: { zh: '插旗', en: 'Plant Banner' },
    cond(g, op) {
      if (tacOf(g, op.side)?.bannerDone) return { zh: '整場只能插一次旗', en: 'Once per battle' };
      return critCond(g, op, 2, bannerOk(g, op.side, op), { zh: '要完全在對手領土內、且距離中立邊緣超過 5"', en: 'Must be wholly in your opponent\'s territory, more than 5" from a neutral edge' });
    },
    apply(g, op) {
      tacOf(g, op.side).bannerDone = true;
      g.markers.push({ id: g.markers.length, kind: 'banner', owner: op.side, x: op.x, y: op.y, carriedBy: null });
      reveal(g, op.side);
      log(g, { zh: `${opName(op, 'zh')} 插下旗幟`, en: `${opName(op, 'en')} plants the banner` }, `side${op.side}`);
    },
  },
  // Plant Devices: an objective marker you control gains your Device token.
  plantDevice: {
    ap: 1, name: { zh: '安置裝置', en: 'Plant Device' },
    cond: (g, op) => critCond(g, op, 2, ctrlObj(g, op, (o) => !o.devices?.[op.side]), { zh: '沒有可安置裝置的目標點（要控制且還沒有我方裝置）', en: 'No objective for a device (controlled, no device of yours yet)' }),
    apply(g, op) {
      const o = ctrlObj(g, op, (x) => !x.devices?.[op.side]);
      (o.devices ||= [false, false])[op.side] = true;
      reveal(g, op.side);
      log(g, { zh: `${opName(op, 'zh')} 在${objName(o, 'zh')}安置裝置`, en: `${opName(op, 'en')} plants a device at ${objName(o, 'en')}` }, `side${op.side}`);
    },
  },
  // Sweep & Clear (Tac Op): clear an objective marker you control for the turning point.
  clear: {
    ap: 1, name: { zh: '清除', en: 'Clear' },
    cond(g, op) {
      if (g.tp < 2) return { zh: '第 1 回合不能執行', en: 'Not in the first turning point' };
      if (missionEngaged(g, op)) return { zh: '處於交戰中', en: 'Engaged' };
      if (!clearTarget(g, op)) return { zh: '沒有可清除的目標點（要控制且本回合未清除）', en: 'No objective marker to clear (controlled, not cleared this TP)' };
      return null;
    },
    apply(g, op) {
      const o = clearTarget(g, op);
      (o.cleared ||= [0, 0])[op.side] = g.tp;
      reveal(g, op.side);
      log(g, { zh: `${opName(op, 'zh')} 清除了${objName(o, 'zh')}`, en: `${opName(op, 'en')} clears ${objName(o, 'en')}` }, `side${op.side}`);
    },
  },
  // Retrieval (Tac Op): search an objective marker you control and carry off a Retrieval marker.
  retrieve: {
    ap: 1, name: { zh: '回收', en: 'Retrieve' },
    cond(g, op) {
      if (g.tp < 2) return { zh: '第 1 回合不能執行', en: 'Not in the first turning point' };
      if (missionEngaged(g, op)) return { zh: '處於交戰中', en: 'Engaged' };
      if ((g.markers || []).some((m) => m.carriedBy === op.uid) || g.objectives.some((m) => m.carriedBy === op.uid)) return { zh: '已經帶著標記', en: 'Already carrying a marker' };
      if (!retrieveTarget(g, op)) return { zh: '沒有可搜索的目標點（要控制且還沒搜索過）', en: 'No objective marker to search (controlled, not searched yet)' };
      return null;
    },
    apply(g, op) {
      const o = retrieveTarget(g, op);
      (o.searched ||= [false, false])[op.side] = true;
      g.markers.push({ id: g.markers.length, kind: 'retrieval', owner: op.side, x: op.x, y: op.y, carriedBy: op.uid });
      log(g, { zh: `${opName(op, 'zh')} 搜索${objName(o, 'zh')}，帶走一個回收標記`, en: `${opName(op, 'en')} searches ${objName(o, 'en')} and takes a Retrieval marker` }, `side${op.side}`);
      tacVP(g, op.side, 1, { zh: '回收：第一次搜索這個目標點', en: 'Retrieval: first search of this objective' });
    },
  },
  siphon: {
    ap: 1, name: { zh: '抽取能源', en: 'Siphon Power' },
    cond(g, op) {
      if (g.tp < 2) return { zh: '第 1 回合不能執行', en: 'Not in the first turning point' };
      if (missionEngaged(g, op)) return { zh: '處於交戰中', en: 'Engaged' };
      if (!siphonTarget(g, op)) return { zh: '沒有可抽取的目標點（要控制且本回合未抽取）', en: 'No objective marker to siphon (controlled and not siphoned this TP)' };
      return null;
    },
    apply(g, op) {
      const m = siphonTarget(g, op);
      m.siphonedTP = g.tp;
      const s = g.npoState;
      if (s.siphon[op.side] < 2) {
        s.siphon[op.side]++;
        g.vp[op.side]++;
        log(g, { zh: `${opName(op, 'zh')} 抽取能源（+1 VP）`, en: `${opName(op, 'en')} siphons power (+1VP)` }, `side${op.side}`);
      } else log(g, { zh: `${opName(op, 'zh')} 抽取能源（本回合 VP 已達上限）`, en: `${opName(op, 'en')} siphons power (VP limit reached this TP)` }, `side${op.side}`);
      drawIntruder(g, op);
    },
  },
};

const nearObj = (op, o) => !o.carriedBy && dist(op, o) - radius(op) - 0.4 <= 1.01;
const clearTarget = (g, op) => g.objectives.find((o) => nearObj(op, o) && (controller(g, o) === op.side || op.rtLarcenous) && o.cleared?.[op.side] !== g.tp);
const retrieveTarget = (g, op) => g.objectives.find((o) => nearObj(op, o) && (controller(g, o) === op.side || op.rtLarcenous) && !o.searched?.[op.side]);

function siphonTarget(g, op) {
  return g.objectives.find((o) => o.siphonedTP !== g.tp && dist(op, o) - radius(op) - 0.4 <= 1.01 && (controller(g, o) === op.side || op.rtLarcenous));
}

// ---------- the standard mission ----------
const standard = {
  id: 'standard',
  name: { zh: '標準對戰（擊殺任務）', en: 'Standard (Kill Op)' },
  desc: { zh: '原本的對戰：擊殺任務計分，五個目標點。', en: 'The original game: Kill Op scoring, five objective markers.' },
};

// ---------- Approved Ops 2025: Crit Ops 5 and 6 (Approved Ops update log) ----------
// The standard killzone with three objective markers: one in each player's territory and one in the centre.
const APPROVED_OBJ = [{ x: 8.5, y: 11 }, { x: 15, y: 11, centre: true }, { x: 21.5, y: 11 }];
const objCount = (g, side) => g.objectives.filter((o) => controller(g, o) === side).length;
/** End of a turning point after the first: 1VP to the side controlling more objective markers. */
function critMajority(g) {
  const a = objCount(g, 0), b = objCount(g, 1);
  if (a !== b) addVP(g, a > b ? 0 : 1, 1, 'crit', { zh: '控制較多目標點', en: 'controls more objective markers' });
}
const objName = (o, lang) => (o.centre ? (lang === 'zh' ? '中央目標點' : 'the centre objective') : lang === 'zh' ? `${o.x < 15 ? '左' : '右'}側目標點` : `the ${o.x < 15 ? 'left' : 'right'} objective`);

const stakeClaim = {
  id: 'stakeClaim',
  name: { zh: '核心任務 5：宣示主權（Stake Claim）', en: 'Crit Op 5: Stake Claim' },
  desc: {
    zh: 'Approved Ops 2025。三個目標點。第 2 回合起，每回合策略階段雙方各選一個目標點（整場每個只能選一次）並宣告：「回合結束時我方控制它」或「回合結束時敵方不在爭奪它」。每回合結束（第 2 回合起）：控制較多目標點 +1 VP；宣告成真 +1 VP。另有擊殺任務與雙方各自的戰術行動（Tac Op）。',
    en: 'Approved Ops 2025. Three objective markers. From TP2, in each Strategy phase each player picks an objective marker (each once per battle) and a claim: "we control it at the end of the TP" or "the enemy doesn\'t contest it at the end of the TP". Each TP end from TP2: +1VP for controlling more objectives, +1VP if the claim is true. Plus the kill op and each player\'s Tac Op.',
  },
  source: 'Approved Ops 2025',
  approved: true,
  objectives: APPROVED_OBJ,
  onTPEnd(g) {
    if (g.tp < 2) return;
    critMajority(g);
    for (const s of [0, 1]) {
      const c = g.claims?.[s];
      if (!c || c.tp !== g.tp) continue;
      const o = g.objectives[c.obj];
      const ok = c.kind === 'control' ? controller(g, o) === s : !contests(g, 1 - s, o);
      if (ok) addVP(g, s, 1, 'crit', { zh: `宣示主權成真（${objName(o, 'zh')}）`, en: `stake claim true (${objName(o, 'en')})` });
    }
  },
};
/** Stake Claim (strategic gambit, TP2+): an objective marker not picked before, and a claim. */
export function setClaim(g, side, obj, kind) {
  const used = g.claimsUsed?.[side] || [];
  if (g.mission !== 'stakeClaim' || g.tp < 2 || (used.includes(obj) && g.claims?.[side]?.obj !== obj)) return false;
  const prev = g.claims?.[side];
  if (prev?.tp === g.tp) (g.claimsUsed ||= [[], []])[side] = used.filter((x) => x !== prev.obj); // changed its mind
  (g.claims ||= [null, null])[side] = { tp: g.tp, obj, kind };
  ((g.claimsUsed ||= [[], []])[side]).push(obj);
  const o = g.objectives[obj];
  log(g, { zh: `${team(g, side).name.zh} 宣示主權：${objName(o, 'zh')}，${kind === 'control' ? '我方會控制它' : '敵方不會爭奪它'}`, en: `${team(g, side).name.en} stakes a claim: ${objName(o, 'en')}, ${kind === 'control' ? 'we will control it' : 'the enemy won\'t contest it'}` }, `side${side}`);
  return true;
}
export const claimChoices = (g, side) => g.objectives.map((o, i) => i).filter((i) => !(g.claimsUsed?.[side] || []).includes(i) || g.claims?.[side]?.tp === g.tp && g.claims[side].obj === i);

const energyCells = {
  id: 'energyCells',
  name: { zh: '核心任務 6：能源電池（Energy Cells）', en: 'Crit Op 6: Energy Cells' },
  desc: {
    zh: 'Approved Ops 2025。三個目標點可以被撿起帶走：第 2 回合多花 2AP、第 3 回合多花 1AP、第 4 回合正常（第 1 回合不行）。帶著的特工就控制它。每回合結束（第 2 回合起）：控制較多目標點 +1 VP；戰鬥結束時，每帶著一個目標點 +1 VP。另有擊殺任務與雙方各自的戰術行動（Tac Op）。',
    en: 'Approved Ops 2025. The three objective markers can be picked up: +2AP in TP2, +1AP in TP3, normal in TP4 (not in TP1); the carrier controls it. Each TP end from TP2: +1VP for controlling more objectives; at the end of the battle +1VP per objective marker carried. Plus the kill op and each player\'s Tac Op.',
  },
  source: 'Approved Ops 2025',
  approved: true,
  objectives: APPROVED_OBJ,
  carryObjectives: true,
  canPickUpObjective: (g) => g.tp >= 2,
  pickUpExtra: (g) => (g.tp === 2 ? 2 : g.tp === 3 ? 1 : 0),
  onTPEnd(g) { if (g.tp >= 2) critMajority(g); },
  onBattleEnd(g) {
    for (const s of [0, 1]) {
      const n = g.objectives.filter((o) => o.carriedBy && getOp(g, o.carriedBy)?.side === s && !getOp(g, o.carriedBy).dead).length;
      addVP(g, s, n, 'crit', { zh: `帶著 ${n} 個能源電池`, en: `carries ${n} energy cell(s)` });
    }
  },
};

// ---------- Approved Ops 2025: Crit Ops 1–4 and 7–9 (KT2025 mission pack) ----------
/** A player's objective marker: the one in their territory (not the centre one). */
const isOwnObj = (g, o, side) => !o.centre && territoryOf(g, o) === side;
/** The objective marker the active operative controls (within its control range) that passes the test. */
const ctrlObj = (g, op, test = () => true) => g.objectives.find((o) => nearObj(op, o) && (controller(g, o) === op.side || op.rtLarcenous) && test(o)); // (Larcenous: Ratlings only need to contest it)
/** Per-turning-point counter for a side (Loot VP, Compile Data actions…), reset each turning point. */
function perTP(g, key, side) {
  const c = ((g.critTP ||= {})[key] ||= { tp: g.tp, n: [0, 0] });
  if (c.tp !== g.tp) { c.tp = g.tp; c.n = [0, 0]; }
  return c.n;
}
/** The usual mission-action conditions: not in TP1 (or earlier), not within control range of an enemy. */
function critCond(g, op, fromTP, target, why) {
  if (g.tp < fromTP) return fromTP === 2 ? { zh: '第 1 回合不能執行', en: 'Not in the first turning point' } : { zh: `第 ${fromTP} 回合起才能執行`, en: `Not before turning point ${fromTP}` };
  if (missionEngaged(g, op)) return { zh: '處於交戰中', en: 'Engaged' };
  return target ? null : why;
}
const NO_OBJ = { zh: '控制範圍內沒有可用的目標點（要由我方控制）', en: 'No suitable objective marker you control in range' };

const approvedCrit = (id, n, zh, en, descZh, descEn, extra) => ({
  id, name: { zh: `核心任務 ${n}：${zh}（${en}）`, en: `Crit Op ${n}: ${en}` },
  desc: { zh: `Approved Ops 2025。三個目標點。${descZh}另有擊殺任務與雙方各自的戰術行動（Tac Op）。`, en: `Approved Ops 2025. Three objective markers. ${descEn} Plus the kill op and each player's Tac Op.` },
  source: 'Approved Ops 2025', approved: true, objectives: APPROVED_OBJ, ...extra,
});

const secure = approvedCrit('secure', 1, '確保', 'Secure',
  '確保（1AP，第 2 回合起）：自己控制的目標點由我方確保，直到對手確保它為止。每回合結束（第 2 回合起）：有任何我方確保的目標點 +1 VP；我方確保的比對手多 +1 VP。',
  'Secure (1AP, TP2+): an objective you control is secured by you until your opponent secures it. Each TP end from TP2: +1VP if any objective is secured by you, +1VP if more are secured by you than by your opponent.',
  {
    actions: ['secure'],
    onTPEnd(g) {
      if (g.tp < 2) return;
      const n = (s) => g.objectives.filter((o) => o.secured === s).length;
      for (const s of [0, 1]) {
        if (n(s)) addVP(g, s, 1, 'crit', { zh: `確保了 ${n(s)} 個目標點`, en: `has ${n(s)} objective(s) secured` });
        if (n(s) > n(1 - s)) addVP(g, s, 1, 'crit', { zh: '確保的目標點比對手多', en: 'has more objectives secured' });
      }
    },
  });

const loot = approvedCrit('loot', 2, '掠奪', 'Loot',
  '掠奪（1AP，第 2 回合起）：掠奪自己控制、本回合還沒被掠奪過的目標點。每次掠奪 +1 VP（每回合最多 2 VP）。',
  'Loot (1AP, TP2+): loot an objective you control that hasn\'t been looted this TP. +1VP per Loot (max 2VP per TP).',
  { actions: ['loot'] });

const transmission = approvedCrit('transmission', 3, '傳輸', 'Transmission',
  '開始傳輸（1AP，第 2 回合起）：自己控制的目標點開始傳輸，直到下個回合開始。每回合結束（第 2 回合起）：控制任何傳輸中的目標點 +1 VP；控制的傳輸中目標點比敵方多 +1 VP。',
  'Initiate Transmission (1AP, TP2+): an objective you control is transmitting until the start of the next TP. Each TP end from TP2: +1VP for controlling any transmitting objective, +1VP for controlling more transmitting objectives than the enemy.',
  {
    actions: ['transmit'],
    onTPEnd(g) {
      if (g.tp < 2) return;
      const n = (s) => g.objectives.filter((o) => o.transmitTP === g.tp && controller(g, o) === s).length;
      for (const s of [0, 1]) {
        if (n(s)) addVP(g, s, 1, 'crit', { zh: `控制 ${n(s)} 個傳輸中的目標點`, en: `controls ${n(s)} transmitting objective(s)` });
        if (n(s) > n(1 - s)) addVP(g, s, 1, 'crit', { zh: '控制的傳輸中目標點比敵方多', en: 'controls more transmitting objectives' });
      }
    },
  });

const orb = approvedCrit('orb', 4, '寶珠', 'Orb',
  '戰鬥開始時寶珠在中央目標點。移動寶珠（1AP，第 2 回合起，要控制有寶珠的目標點）：在中央時移到任一方玩家的目標點（自選）；在玩家目標點時移回中央。每回合結束（第 2 回合起）：每控制一個沒有寶珠的目標點 +1 VP。',
  'The Orb starts on the centre objective. Move Orb (1AP, TP2+, controlling the objective with the Orb): from the centre to either player\'s objective (your choice); from a player\'s objective back to the centre. Each TP end from TP2: +1VP per objective you control without the Orb.',
  {
    actions: ['orbToTheirs', 'orbToMine', 'orbToCentre'],
    setup(g) { g.orb = g.objectives.findIndex((o) => o.centre); },
    onTPEnd(g) {
      if (g.tp < 2) return;
      for (const s of [0, 1]) {
        const n = g.objectives.filter((o) => o.id !== g.orb && controller(g, o) === s).length;
        addVP(g, s, n, 'crit', { zh: `控制 ${n} 個沒有寶珠的目標點`, en: `controls ${n} objective(s) without the Orb` });
      }
    },
  });

const download = approvedCrit('download', 7, '下載', 'Download',
  '下載（1AP，第 3 回合起）：下載自己控制的中央或對手目標點（每個整場一次）。每回合結束（第 2 回合起）：控制較多目標點 +1 VP（不算已下載的）。第 3 回合每次下載 +1 VP，第 4 回合每次 +2 VP。',
  'Download (1AP, TP3+): download the centre or your opponent\'s objective that you control (each once per battle). Each TP end from TP2: +1VP for controlling more objectives (ignoring downloaded ones). Each Download in TP3 +1VP, in TP4 +2VP.',
  {
    actions: ['download'],
    onTPEnd(g) {
      if (g.tp < 2) return;
      const n = (s) => g.objectives.filter((o) => !o.downloaded && controller(g, o) === s).length;
      if (n(0) !== n(1)) addVP(g, n(0) > n(1) ? 0 : 1, 1, 'crit', { zh: '控制較多（未下載的）目標點', en: 'controls more (not downloaded) objective markers' });
    },
  });

const data = approvedCrit('data', 8, '資料', 'Data',
  '彙整資料（1AP，第 2 回合起）：自己控制、本回合還沒獲得資料點的目標點 +1 資料點。傳送資料（1AP，第 4 回合）：移除自己控制的目標點上所有資料點，每點 +1 VP。第 2、3 回合結束時，本回合執行彙整資料次數比敵方多 +1 VP。',
  'Compile Data (1AP, TP2+): an objective you control that hasn\'t gained a Data point this TP gains 1. Send Data (1AP, TP4): remove all Data points from an objective you control, +1VP per point. At the end of TP2 and TP3, +1VP for performing more Compile Data actions this TP than the enemy.',
  {
    actions: ['compileData', 'sendData'],
    onTPEnd(g) {
      if (g.tp !== 2 && g.tp !== 3) return;
      const n = perTP(g, 'compile');
      if (n[0] !== n[1]) addVP(g, n[0] > n[1] ? 0 : 1, 1, 'crit', { zh: `本回合彙整資料較多（${n[0]}:${n[1]}）`, en: `more Compile Data actions this TP (${n[0]}:${n[1]})` });
    },
  });

const reboot = approvedCrit('reboot', 9, '重啟', 'Reboot',
  '目標點編號 1–3。每回合策略階段雙方暗中各選一個目標點後同時公開：選到同一個，它本回合失效；選不同，兩人都沒選的那個失效。重啟（2AP，第 2 回合起）：自己控制的失效目標點恢復。每回合結束（第 2 回合起）：每控制一個未失效的目標點 +1 VP。',
  'Objectives are numbered 1–3. In each Strategy phase both players secretly pick one and reveal together: the same one → it is inert this TP; different ones → the one neither picked is inert. Reboot (2AP, TP2+): an inert objective you control is no longer inert. Each TP end from TP2: +1VP per objective you control that isn\'t inert.',
  {
    actions: ['reboot'],
    onTPEnd(g) {
      if (g.tp < 2) return;
      for (const s of [0, 1]) {
        const n = g.objectives.filter((o) => o.inertTP !== g.tp && controller(g, o) === s).length;
        addVP(g, s, n, 'crit', { zh: `控制 ${n} 個未失效的目標點`, en: `controls ${n} objective(s) that aren't inert` });
      }
    },
  });
/** Reboot gambit: this side's secret pick (an objective index) for this turning point. */
export function setReboot(g, side, obj) {
  if (g.mission !== 'reboot' || !g.objectives[obj]) return false;
  (g.rebootPick ||= [null, null])[side] = { tp: g.tp, obj };
  return true;
}
/** Both picks are in: reveal them and make one objective marker inert for this turning point. */
function resolveReboot(g) {
  const p = g.rebootPick || [];
  if (p[0]?.tp !== g.tp || p[1]?.tp !== g.tp) return;
  const inert = p[0].obj === p[1].obj ? p[0].obj : g.objectives.map((o) => o.id).find((i) => i !== p[0].obj && i !== p[1].obj);
  g.objectives[inert].inertTP = g.tp;
  log(g, { zh: `重啟：雙方選 ${p[0].obj + 1} 號與 ${p[1].obj + 1} 號 → ${inert + 1} 號目標點本回合失效`, en: `Reboot: the players picked ${p[0].obj + 1} and ${p[1].obj + 1} → objective ${inert + 1} is inert this TP` }, 'tp');
}

/** Short state labels drawn under an objective marker (secured, transmitting, Orb, Data, inert…); side: drawn in that team's colour. */
export function objBadges(g, o, lang) {
  const zh = lang === 'zh', b = [];
  if (o.secured != null) b.push({ text: zh ? '已確保' : 'secured', side: o.secured });
  if (o.transmitTP === g.tp) b.push(zh ? '傳輸中' : 'transmitting');
  if (g.mission === 'orb' && g.orb === o.id) b.push(zh ? '寶珠' : 'Orb');
  if (o.downloaded) b.push(zh ? '已下載' : 'downloaded');
  if (o.data) b.push(zh ? `資料 ${o.data}` : `Data ${o.data}`);
  if (o.inertTP === g.tp) b.push(zh ? '失效' : 'inert');
  if (o.lootTP === g.tp) b.push(zh ? '已掠奪' : 'looted');
  for (const s of [0, 1]) if (o.terrorchem?.[s]) b.push({ text: zh ? '毒' : 'poison', side: s }); // Poison Objective (Nemesis Claw)
  for (const s of [0, 1]) if (o.devices?.[s]) b.push({ text: zh ? '裝置' : 'device', side: s }); // (Plant Devices tac op)
  return b;
}

// ---------- Tac Ops (Approved Ops update log): two per archetype ----------
export const TAC_OPS = {
  // Seek & Destroy
  dominate: { arch: 'Seek & Destroy', name: { zh: '支配（Dominate）', en: 'Dominate' },
    desc: { zh: '揭露：第一次有友方使敵人殘廢時。友方每使一名敵人殘廢，那名友方獲得 1 個支配標記。第 3、4 回合結束時，可移除沒殘廢的友方身上的標記，每個 +1 VP（每回合最多 3 VP）。', en: 'Reveal: the first time a friendly incapacitates an enemy. Each time a friendly incapacitates an enemy, that friendly gains a Dominate token. At the end of TP3 and TP4, remove tokens from friendlies that aren\'t incapacitated for 1VP each (max 3VP per TP).' } },
  sweepClear: { arch: 'Seek & Destroy', actions: ['clear'], name: { zh: '掃蕩清除（Sweep & Clear）', en: 'Sweep & Clear' },
    desc: { zh: '揭露：第一次有敵人在爭奪目標點時殘廢，或第一次執行「清除」（先發生者）。爭奪目標點的敵人殘廢時，該目標點獲得我方掃蕩標記到下個準備步驟。清除（1AP，第 2 回合起）：自己控制的目標點本回合已清除。每回合結束（第 2 回合起）：控制任何有我方掃蕩標記的目標點 +1 VP；其中也有已清除的 +2 VP（每回合最多 2 VP）。', en: 'Reveal: the first time an enemy contesting an objective is incapacitated, or the first Clear (whichever comes first). When an enemy contesting an objective is incapacitated, it gains your Swept token until the next Ready step. Clear (1AP, TP2+): an objective you control is cleared this TP. Each TP end from TP2: +1VP if you control any objective with your Swept token; +2VP instead if any of those is also cleared (max 2VP per TP).' } },
  rout: { arch: 'Seek & Destroy', name: { zh: '擊潰（Rout）', en: 'Rout' },
    desc: { zh: '揭露：第一次從這張得分時。友方使敵人殘廢時，若那名友方在對手部署區 6" 內 +1 VP；那名敵人 Wounds 12 以上則 +2 VP（每回合最多 2 VP）。', en: 'Reveal: the first time you score from it. Whenever a friendly incapacitates an enemy while within 6" of your opponent\'s drop zone, +1VP; +2VP instead if that enemy had a Wounds stat of 12+ (max 2VP per TP).' } },
  // Recon
  flank: { arch: 'Recon', name: { zh: '側翼（Flank）', en: 'Flank' },
    desc: { zh: '揭露：策略計謀（本版在第 2 回合策略階段自動揭露）。戰場沿雙方邊緣中點分成左右兩翼；完全在某翼、且在對手領土內的特工爭奪該翼，APL 總和高者控制。揭露後每回合結束（第 2 回合起）：每控制一翼 +1 VP；上一回合（不算第 1 回合）結束時也控制同一翼則 +2 VP（每回合最多 2 VP）。', en: 'Reveal: as a strategic gambit (here: automatically in the TP2 Strategy phase). The killzone is split into two flanks through the middle of each player\'s edge; an operative wholly within a flank and in the opponent\'s territory contests it, higher total APL controls it. After the reveal, each TP end from TP2: +1VP per flank controlled; +2VP instead if you also controlled it at the end of the previous TP (not the first) (max 2VP per TP).' } },
  retrieval: { arch: 'Recon', actions: ['retrieve'], name: { zh: '回收（Retrieval）', en: 'Retrieval' },
    desc: { zh: '揭露：第一次從這張得分時。回收（1AP，第 2 回合起）：在自己控制、我方尚未搜索過的目標點取得一個回收標記帶著（掉了友方可再撿）。每個目標點第一次被我方搜索 +1 VP；戰鬥結束時每帶著一個回收標記 +1 VP。', en: 'Reveal: the first time you score from it. Retrieve (1AP, TP2+): at an objective you control that you haven\'t searched, take a Retrieval marker (friendlies can pick it up again if dropped). +1VP the first time each objective is searched by you; +1VP per Retrieval marker carried at the end of the battle.' } },
  scout: { arch: 'Recon', actions: ['scout'], name: { zh: '偵察敵軍動向（Scout Enemy Movement）', en: 'Scout Enemy Movement' },
    desc: { zh: '揭露：第一次執行「偵察」時。偵察（1AP，第 2 回合起，不能是交戰指令）：選一名可見、在 6" 外且還沒啟動的敵人，它被監視到下個準備步驟。每回合結束（第 2 回合起）：每名被監視、且有友方看得到的敵人 +1 VP（不必是執行偵察的那名；每回合最多 2 VP）。', en: 'Reveal: the first Scout. Scout (1AP, TP2+, not with an Engage order): select a ready enemy visible and more than 6" away; it is monitored until the next Ready step. Each TP end from TP2: +1VP per monitored enemy visible to friendlies (not necessarily the scout; max 2VP per TP).' } },
  // Security
  plantBanner: { arch: 'Security', actions: ['plantBanner'], name: { zh: '插旗（Plant Banner）', en: 'Plant Banner' },
    desc: { zh: '揭露：執行「插旗」時。插旗（1AP，第 2 回合起，整場一次）：在控制範圍內放下旗幟標記，要完全在對手領土內、距離中立邊緣超過 5"；雙方都能撿起旗幟。每回合結束（第 2 回合起）：旗幟在場上、完全在對手領土內且由我方控制 +1 VP；同時沒有敵人爭奪則 +2 VP。', en: 'Reveal: when you Plant Banner. Plant Banner (1AP, TP2+, once per battle): place your Banner marker in control range, wholly in your opponent\'s territory and more than 5" from a neutral edge; either side can pick it up. Each TP end from TP2: +1VP if your Banner is on the killzone floor, wholly in your opponent\'s territory and controlled by you; +2VP instead if no enemy contests it.' } },
  martyrs: { arch: 'Security', name: { zh: '殉道者（Martyrs）', en: 'Martyrs' },
    desc: { zh: '揭露：第一次有友方在爭奪目標點時殘廢。友方在爭奪目標點時殘廢，該目標點獲得 1 個殉道者標記。每回合結束（第 2 回合起）：友方在爭奪有標記的目標點時可移除標記，每個 +1 VP（同時控制則 +2；每回合最多 2 VP）。', en: 'Reveal: the first time a friendly falls while contesting an objective. When a friendly falls while contesting an objective, the objective gains a Martyr token. Each TP end from TP2: if friendlies contest an objective with tokens, remove them for +1VP each (+2 if you also control it; max 2VP per TP).' } },
  envoy: { arch: 'Security', name: { zh: '使節（Envoy）', en: 'Envoy' },
    desc: { zh: '揭露：第一次選使節時。第 2 回合起每回合策略階段選一名之前沒選過的友方當使節。回合結束時使節完全在敵方領土、且不在敵人控制範圍內 +1 VP；本回合也沒失去生命則 +2 VP。', en: 'Reveal: the first time you pick an envoy. From TP2, each Strategy phase pick a friendly not picked before as the envoy. At the TP end, if the envoy is wholly in enemy territory and not in an enemy\'s control range +1VP; +2VP if it also lost no wounds this TP.' } },
  // Infiltration
  trackEnemy: { arch: 'Infiltration', name: { zh: '追蹤敵人（Track Enemy）', en: 'Track Enemy' },
    desc: { zh: '揭露：第一次從這張得分時。敵人被追蹤：6" 內有隱蔽指令的友方能把它當成有效目標，而那名友方不是它的有效目標、也不在敵人控制範圍內。每回合結束（第 2 回合起）：追蹤 1 名敵人 +1 VP（第 4 回合 +2）；追蹤 2 名以上 +2 VP（每回合最多 2 VP）。', en: 'Reveal: the first time you score from it. An enemy is tracked if it\'s a valid target for a friendly within 6" that has a Conceal order, isn\'t a valid target for that enemy and isn\'t in an enemy\'s control range. Each TP end from TP2: one enemy tracked +1VP (+2 in TP4); two or more +2VP (max 2VP per TP).' } },
  plantDevices: { arch: 'Infiltration', actions: ['plantDevice'], name: { zh: '安置裝置（Plant Devices）', en: 'Plant Devices' },
    desc: { zh: '揭露：第一次執行「安置裝置」時。安置裝置（1AP，第 2 回合起）：自己控制、還沒有我方裝置的目標點獲得 1 個裝置標記。每回合結束（第 2 回合起）：對手的目標點有我方裝置 +1 VP；其他有我方裝置、且有敵人在爭奪的目標點每個 +1 VP（每回合最多 2 VP）。', en: 'Reveal: the first Plant Device. Plant Device (1AP, TP2+): an objective you control without your Device token gains one. Each TP end from TP2: +1VP if your opponent\'s objective has your device; +1VP for each other objective with your device that enemies contest (max 2VP per TP).' } },
  stealIntel: { arch: 'Infiltration', name: { zh: '竊取情報（Steal Intelligence）', en: 'Steal Intelligence' },
    desc: { zh: '揭露：第一次有敵人殘廢時。每有敵人殘廢，在它的位置放下我方情報標記；友方可以撿起，每名友方最多帶 2 個情報標記（或 1 個情報加 1 個其他標記）。每回合結束（第 2 回合起）：有友方帶著情報標記 +1 VP；戰鬥結束時每帶著一個情報標記 +1 VP。', en: 'Reveal: the first time an enemy is incapacitated. Whenever an enemy is incapacitated, place your Intelligence marker where it was; friendlies can pick them up, carrying up to two (or one and one other marker). Each TP end from TP2: +1VP if any friendly carries one; +1VP per Intelligence marker carried at the end of the battle.' } },
};
const tacOf = (g, side) => (g.tacOps?.[side] ? g.tacOps[side] : null);
/** Reveal a side's Tac Op (Scout Squad's Spy). */
export const revealTacOp = (g, side) => reveal(g, side);
function reveal(g, side) {
  const t = tacOf(g, side);
  if (!t || t.revealed) return;
  t.revealed = true;
  log(g, { zh: `${team(g, side).name.zh} 揭露戰術行動：${TAC_OPS[t.id].name.zh}`, en: `${team(g, side).name.en} reveals its Tac Op: ${TAC_OPS[t.id].name.en}` }, `side${side}`);
}
const tacVP = (g, side, n, msg) => { if (n > 0) { reveal(g, side); addVP(g, side, n, 'tac', msg); } };
const contesting = (g, op) => g.objectives.filter((o) => !o.carriedBy && dist(op, o) - radius(op) - 0.4 <= 1.01);
const wholly = (g, op, side) => { const along = g.axis === 'y' ? 'y' : 'x', r = radius(op); return [-r, r].every((d) => territoryOf(g, { ...op, [along]: op[along] + d }) === side); };

const zoneRect = (z) => ({ x: z.x0, y: z.y0, w: z.x1 - z.x0, h: z.y1 - z.y0 });

/** An operative was incapacitated (counted for the kill op). */
export function tacOnKill(g, src, target) {
  for (const s of [0, 1]) {
    const t = tacOf(g, s);
    if (!t) continue;
    if (t.id === 'dominate' && src && src.side === s && target.side === 1 - s) {
      src.dominate = (src.dominate || 0) + 1;
      reveal(g, s);
    }
    if (t.id === 'rout' && src && src.side === s && target.side === 1 - s && distPointRect(src, zoneRect(deployZones(g)[1 - s])) - radius(src) <= 6 + 0.01) {
      const n = perTP(g, 'rout'), vp = Math.min(2 - n[s], tpl(target).wounds >= 12 ? 2 : 1);
      n[s] += Math.max(0, vp);
      tacVP(g, s, vp, { zh: `擊潰：在敵方部署區 6" 內擊倒 ${opName(target, 'zh')}`, en: `Rout: ${opName(target, 'en')} incapacitated within 6" of the enemy drop zone` });
    }
    if (t.id === 'stealIntel' && target.side === 1 - s) {
      g.markers.push({ id: g.markers.length, kind: 'intel', owner: s, x: target.x, y: target.y, carriedBy: null });
      reveal(g, s);
    }
    if (t.id === 'sweepClear' && target.side === 1 - s) {
      const objs = contesting(g, target);
      for (const o of objs) (o.swept ||= [0, 0])[s] = g.tp;
      if (objs.length) reveal(g, s);
    }
    if (t.id === 'martyrs' && target.side === s && !target.martyrDone) {
      const objs = contesting(g, target);
      target.martyrDone = true; // only the first time it's incapacitated
      for (const o of objs) (o.martyrs ||= [0, 0])[s]++;
      if (objs.length) reveal(g, s);
    }
  }
}

/** Tac Op scoring at the end of each turning point. */
export function tacOnTPEnd(g) {
  for (const s of [0, 1]) {
    const t = tacOf(g, s);
    if (!t) continue;
    if (t.id === 'dominate' && g.tp >= 3) {
      let left = 3, n = 0;
      for (const o of living(g, s)) { const k = Math.min(left, o.dominate || 0); o.dominate -= k; left -= k; n += k; }
      tacVP(g, s, n, { zh: `支配：移除 ${n} 個標記`, en: `Dominate: ${n} token(s) removed` });
    }
    if (t.id === 'sweepClear' && g.tp >= 2) {
      const swept = g.objectives.filter((o) => o.swept?.[s] === g.tp && controller(g, o) === s);
      const vp = !swept.length ? 0 : swept.some((o) => o.cleared?.[s] === g.tp) ? 2 : 1;
      tacVP(g, s, vp, { zh: vp === 2 ? '掃蕩清除：控制已掃蕩且已清除的目標點' : '掃蕩清除：控制已掃蕩的目標點', en: vp === 2 ? 'Sweep & Clear: controls a swept and cleared objective' : 'Sweep & Clear: controls a swept objective' });
    }
    if (t.id === 'flank' && g.tp >= 2) {
      const held = flanksHeld(g, s);
      const prev = (t.held ||= {})[g.tp - 1] || [false, false];
      t.held[g.tp] = held;
      const vp = held.reduce((v, h, i) => v + (h ? (prev[i] ? 2 : 1) : 0), 0);
      tacVP(g, s, Math.min(2, vp), { zh: `側翼：控制 ${held.filter(Boolean).length} 翼`, en: `Flank: ${held.filter(Boolean).length} flank(s) controlled` });
    }
    if (t.id === 'martyrs' && g.tp >= 2) {
      let vp = 0;
      for (const o of g.objectives.filter((x) => x.martyrs?.[s] && contests(g, s, x)).sort((a, b) => (controller(g, b) === s) - (controller(g, a) === s))) {
        const each = controller(g, o) === s ? 2 : 1;
        while (o.martyrs[s] > 0 && vp + each <= 2) { o.martyrs[s]--; vp += each; }
      }
      tacVP(g, s, vp, { zh: '殉道者', en: 'Martyrs' });
    }
    if (t.id === 'envoy' && g.tp >= 2) {
      const e = t.envoy?.tp === g.tp ? getOp(g, t.envoy.uid) : null;
      if (e && !e.dead && wholly(g, e, 1 - s) && !living(g, 1 - s).some((x) => edgeDist(x, e) <= CONTROL + 0.01)) {
        tacVP(g, s, e.damagedTP ? 1 : 2, { zh: `使節 ${opName(e, 'zh')} 深入敵境`, en: `envoy ${opName(e, 'en')} is deep in enemy territory` });
      }
    }
    if (t.id === 'scout' && g.tp >= 2) {
      const n = living(g, 1 - s).filter((e) => e.monitored?.[s] === g.tp && living(g, s).some((f) => visibility(g, f, e).visible)).length;
      tacVP(g, s, Math.min(2, n), { zh: `偵察敵軍動向：看得到 ${n} 名被監視的敵人`, en: `Scout Enemy Movement: ${n} monitored enemy(ies) in sight` });
    }
    if (t.id === 'plantBanner' && g.tp >= 2) {
      const b = (g.markers || []).find((m) => m.kind === 'banner' && m.owner === s && !m.carriedBy);
      if (b && markerWholly(g, b, 1 - s) && controller(g, b) === s) {
        const vp = contests(g, 1 - s, b) ? 1 : 2;
        tacVP(g, s, vp, { zh: vp === 2 ? '插旗：控制旗幟且沒有敵人爭奪' : '插旗：控制旗幟', en: vp === 2 ? 'Plant Banner: banner controlled and uncontested' : 'Plant Banner: banner controlled' });
      }
    }
    if (t.id === 'trackEnemy' && g.tp >= 2) {
      const n = living(g, 1 - s).filter((e) => tracked(g, s, e)).length;
      const vp = n >= 2 ? 2 : n === 1 ? (g.tp === 4 ? 2 : 1) : 0;
      tacVP(g, s, vp, { zh: `追蹤敵人：追蹤 ${n} 名`, en: `Track Enemy: ${n} enemy(ies) tracked` });
    }
    if (t.id === 'plantDevices' && g.tp >= 2) {
      const dev = g.objectives.filter((o) => o.devices?.[s]);
      const vp = dev.filter((o) => isOwnObj(g, o, 1 - s)).length + dev.filter((o) => !isOwnObj(g, o, 1 - s) && contests(g, 1 - s, o)).length;
      tacVP(g, s, Math.min(2, vp), { zh: '安置裝置', en: 'Plant Devices' });
    }
    if (t.id === 'stealIntel' && g.tp >= 2 && intelCarried(g, s)) tacVP(g, s, 1, { zh: '竊取情報：有友方帶著情報', en: 'Steal Intelligence: a friendly carries intelligence' });
  }
}
/** Scout targets: ready enemies visible to op and more than 6" away, not monitored by this side yet this TP. */
export const scoutTargets = (g, op) => living(g, 1 - op.side).filter((e) => e.ready && e.monitored?.[op.side] !== g.tp && edgeDist(op, e) > 6 && visibility(g, op, e).visible);
/** A marker (as a disc) wholly within this side's territory. */
const markerWholly = (g, m, side) => { const along = g.axis === 'y' ? 'y' : 'x'; return [-OBJ_R, OBJ_R].every((d) => territoryOf(g, { ...m, [along]: m[along] + d }) === side); };
/** Plant Banner: a marker at op's spot would be wholly in the opponent's territory and more than 5" from both neutral edges. */
function bannerOk(g, side, op) {
  const across = g.axis === 'y' ? 'x' : 'y', size = across === 'y' ? BOARD.h : BOARD.w;
  return markerWholly(g, op, 1 - side) && op[across] - OBJ_R > 5 && size - op[across] - OBJ_R > 5;
}
/** "Valid target" for tracking: visible, and not a Concealed operative in cover. */
const validFor = (g, a, b) => { const v = visibility(g, a, b); return v.visible && !(b.order === 'conceal' && v.cover); };
/** Track Enemy: a Concealed friendly within 6" that can target the enemy, isn't a valid target for it and isn't within an enemy's control range. */
const tracked = (g, s, e) => living(g, s).some((f) => f.order === 'conceal' && edgeDist(f, e) <= 6 && validFor(g, f, e) && !validFor(g, e, f)
  && !living(g, 1 - s).some((x) => edgeDist(x, f) <= CONTROL + 0.01));
const intelCarried = (g, s) => (g.markers || []).filter((m) => m.kind === 'intel' && m.owner === s && m.carriedBy && getOp(g, m.carriedBy)?.side === s && !getOp(g, m.carriedBy).dead).length;
/** Flank: [left, right] — controlled by this side? An operative contests a flank while wholly within it and wholly in the opponent's territory. */
export function flanksHeld(g, s) {
  const across = g.axis === 'y' ? 'x' : 'y', mid = across === 'y' ? BOARD.h / 2 : BOARD.w / 2;
  const inFlank = (o, f) => { const r = radius(o); return f === 0 ? o[across] + r <= mid : o[across] - r >= mid; };
  return [0, 1].map((f) => {
    const sum = (side) => living(g, side).filter((o) => inFlank(o, f) && wholly(g, o, 1 - side)).reduce((a, o) => a + (tpl(o).control ?? aplNow(g, o)), 0);
    return sum(s) > sum(1 - s);
  });
}
export function tacOnBattleEnd(g) {
  for (const s of [0, 1]) {
    if (tacOf(g, s)?.id === 'stealIntel') { const n = intelCarried(g, s); tacVP(g, s, n, { zh: `帶著 ${n} 個情報標記`, en: `carries ${n} Intelligence marker(s)` }); }
    if (tacOf(g, s)?.id !== 'retrieval') continue;
    const n = (g.markers || []).filter((m) => m.kind === 'retrieval' && m.owner === s && m.carriedBy && getOp(g, m.carriedBy)?.side === s && !getOp(g, m.carriedBy).dead).length;
    tacVP(g, s, n, { zh: `帶著 ${n} 個回收標記`, en: `carries ${n} Retrieval marker(s)` });
  }
}
/** Envoy pick (strategic gambit, TP2+): a friendly not picked before (not one ignored for the kill op). */
export const envoyChoices = (g, side) => living(g, side).filter((o) => !tpl(o).expendable && !(tacOf(g, side)?.envoys || []).includes(o.uid));
export function setEnvoy(g, side, op) {
  const t = tacOf(g, side);
  if (t?.id !== 'envoy' || g.tp < 2) return false;
  if (t.envoy?.tp === g.tp) t.envoys = t.envoys.filter((u) => u !== t.envoy.uid); // changed its mind
  t.envoy = { tp: g.tp, uid: op.uid };
  (t.envoys ||= []).push(op.uid);
  reveal(g, side);
  log(g, { zh: `${team(g, side).name.zh} 選 ${opName(op, 'zh')} 當使節`, en: `${team(g, side).name.en} picks ${opName(op, 'en')} as its envoy` }, `side${side}`);
  return true;
}
/** When a side finishes its Strategy phase: Flank is revealed in TP2; Stake Claim and Envoy picks not made yet are made for it. */
export function tacOnStrategyEnd(g, side) {
  const t = tacOf(g, side);
  if (t?.id === 'flank' && g.tp >= 2) reveal(g, side);
  if (t?.id === 'envoy' && g.tp >= 2 && t.envoy?.tp !== g.tp) {
    // Already wholly in enemy territory first (unless next to an enemy), then whoever is closest to the centreline.
    const along = g.axis === 'y' ? 'y' : 'x', mid = along === 'y' ? BOARD.h / 2 : BOARD.w / 2;
    const deep = (o) => (wholly(g, o, 1 - side) && !living(g, 1 - side).some((x) => edgeDist(x, o) <= CONTROL + 0.01) ? 100 : 0) - Math.abs(o[along] - mid);
    const pick = envoyChoices(g, side).sort((a, b) => deep(b) - deep(a))[0];
    if (pick) setEnvoy(g, side, pick);
  }
  if (g.mission === 'stakeClaim' && g.tp >= 2 && g.claims?.[side]?.tp !== g.tp) {
    const own = (o) => territoryOf(g, o) === side;
    const opts = claimChoices(g, side).sort((a, b) => (own(g.objectives[b]) ? 1 : 0) - (own(g.objectives[a]) ? 1 : 0));
    if (opts.length) setClaim(g, side, opts[0], own(g.objectives[opts[0]]) ? 'control' : 'deny');
  }
  // Reboot: a pick not made yet is made at random; once both are in, they're revealed together.
  if (g.mission === 'reboot') {
    if (g.rebootPick?.[side]?.tp !== g.tp) setReboot(g, side, Math.floor(Math.random() * g.objectives.length));
    resolveReboot(g);
  }
}

export const MISSIONS = { standard, generatorium, negotiation, secure, loot, transmission, orb, stakeClaim, energyCells, download, data, reboot };
export const MISSION_LIST = [standard, secure, loot, transmission, orb, stakeClaim, energyCells, download, data, reboot, generatorium, negotiation];

/** Used by the NPO behaviour (ai.js): the activation's target under the mission's threat principle. */
export function npoTargetFor(g, op) {
  const m = MISSIONS[g.mission];
  if (m?.npoTarget) return m.npoTarget(g, op);
  const ps = players(g).sort((a, b) => dist(op, a) - dist(op, b));
  return ps.find((p) => visibility(g, op, p).visible) || ps[0] || null;
}
