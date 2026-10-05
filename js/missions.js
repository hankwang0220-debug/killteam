// Missions: map, drop zones, markers, NPOs, mission actions and scoring.
// Maps are rebuilt in 2D from the official mission-pack maps (1 grid square = 1"): walls of
// strongholds and ruins are Heavy terrain, rubble is Heavy or Light, upper floors are left out.
import {
  BOARD, NPO, applyDamage, controller, d6, edgeDist, getOp, isEngaged, living, log, opName, radius,
  spawnNpo, team, tpl, visibility,
} from './game.js';
import { dist } from './geometry.js';

const wall = (x, y, w, h) => ({ kind: 'heavy', x, y, w, h });
const block = (x, y, w, h) => ({ kind: 'heavy', x, y, w, h });
const rubble = (x, y, w, h) => ({ kind: 'light', x, y, w, h });
const T = 0.3; // wall thickness

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const npos = (g) => living(g, NPO);
const players = (g) => g.ops.filter((o) => !o.dead && o.side !== NPO);
const sideName = (g, s, lang) => (lang === 'zh' ? `${team(g, s).name.zh}` : team(g, s).name.en);

/** The nearest spot to p where op can be placed (clear of Heavy terrain and other operatives). */
function nearestFree(g, op, p) {
  const r = radius(op);
  for (let ring = 0; ring <= 6; ring += 0.5) {
    for (let a = 0; a < 16; a++) {
      const q = { x: p.x + Math.cos(a * Math.PI / 8) * ring, y: p.y + Math.sin(a * Math.PI / 8) * ring };
      if (q.x < r || q.y < r || q.x > BOARD.w - r || q.y > BOARD.h - r) continue;
      if (g.terrain.some((t) => t.kind === 'heavy' && q.x + r > t.x && q.x - r < t.x + t.w && q.y + r > t.y && q.y - r < t.y + t.h)) continue;
      if (g.ops.some((o) => o !== op && !o.dead && dist(o, q) < radius(o) + r + 0.05)) continue;
      return q;
    }
  }
  return p;
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
      log(g, { zh: `${sideName(g, src.side, 'zh')} 擊倒安布爾（+2 VP）`, en: `${sideName(g, src.side, 'en')} brings down the Ambull (+2VP)` }, 'tp');
    }
    if (target.tplId === 'borewyrm') {
      g.markers.push({ id: g.markers.length, kind: 'borewyrm', x: target.x, y: target.y, carriedBy: null });
      log(g, { zh: '鑽地蟲倒下，留下鑽地蟲標記（可撿起）', en: 'The Borewyrm leaves a Borewyrm marker (can be picked up)' }, 'npo');
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
    zh: '雙人對戰＋第三方 NPO。撿起並控制資訊核心（APL 3 以上的特工可帶兩個）；每回合結束時，對手控制幾個資訊核心，你就得幾點談判點。第 2 回合起檔案管理員出現，牠要啟動時雙方暗中出價談判點，出價高者本次啟動可操控牠。擊倒檔案管理員得 1 VP，最後每控制一個資訊核心得 1 VP。4 回合結束時 VP 多者勝。',
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
      log(g, { zh: `${sideName(g, src.side, 'zh')} 擊倒檔案管理員（+1 VP）`, en: `${sideName(g, src.side, 'en')} incapacitates the Archivist (+1VP)` }, 'tp');
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
  siphon: {
    ap: 1, name: { zh: '抽取能源', en: 'Siphon Power' },
    cond(g, op) {
      if (g.tp < 2) return { zh: '第 1 回合不能執行', en: 'Not in the first turning point' };
      if (isEngaged(g, op)) return { zh: '處於交戰中', en: 'Engaged' };
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

function siphonTarget(g, op) {
  return g.objectives.find((o) => o.siphonedTP !== g.tp && dist(op, o) - radius(op) - 0.4 <= 1.01 && controller(g, o) === op.side);
}

// ---------- the standard mission ----------
const standard = {
  id: 'standard',
  name: { zh: '標準對戰（擊殺任務）', en: 'Standard (Kill Op)' },
  desc: { zh: '原本的對戰：擊殺任務計分，五個目標點。', en: 'The original game: Kill Op scoring, five objective markers.' },
};

export const MISSIONS = { standard, generatorium, negotiation };
export const MISSION_LIST = [standard, generatorium, negotiation];

/** Used by the NPO behaviour (ai.js): the activation's target under the mission's threat principle. */
export function npoTargetFor(g, op) {
  const m = MISSIONS[g.mission];
  if (m?.npoTarget) return m.npoTarget(g, op);
  const ps = players(g).sort((a, b) => dist(op, a) - dist(op, b));
  return ps.find((p) => visibility(g, op, p).visible) || ps[0] || null;
}
