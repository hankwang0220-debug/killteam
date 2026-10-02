// Game recording for replays: a compact snapshot after every change, so each step can be reviewed.
import { opName, team } from './game.js';
import { TEAM_MAP } from './data/teams.js';

const HISTORY_KEY = 'kt.history';
const MAX_HISTORY = 10;

const DEAD = 1, READY = 2, CONCEAL = 4, COUNTERED = 16, POISON = 32;
const r2 = (n) => Math.round(n * 100) / 100;

// [x, y, wounds, flags, Markerlight tokens]
function encodeOps(g) {
  return g.ops.map((o) => [r2(o.x), r2(o.y), o.wounds,
    (o.dead ? DEAD : 0) | (o.ready ? READY : 0) | (o.order === 'conceal' ? CONCEAL : 0) | (o.counteracted ? COUNTERED : 0) | (o.poison ? POISON : 0), o.ml || 0]);
}

function ensureReplay(g) {
  if (g.replay) return g.replay;
  g.replay = {
    base: {
      teams: g.teams, ai: g.ai, terrain: g.terrain, objectives: g.objectives,
      ops: g.ops.map(({ uid, side, team: t, tplId, num, maxW }) => ({ uid, side, team: t, tplId, num, maxW })),
    },
    snaps: [],
    seq: 0, // last log entry number already attached to a snapshot
  };
  return g.replay;
}

let lastKey = null;
let lastResult = null;

/**
 * Record a snapshot if anything changed: board state, new log lines, a new dice result (shooting)
 * or progress in a fight. `result` is the shooting dice dialog currently shown, if any.
 */
export function recordStep(g, result) {
  const rep = ensureReplay(g);
  const state = {
    o: encodeOps(g), tp: g.tp, phase: g.phase, turn: g.turn, active: g.active, initiative: g.initiative,
    counter: !!g.counter, cp: [...g.cp], vp: [...g.vp], kills: [...g.kills], ploys: g.ploys.map((p) => [...p]),
  };
  const key = JSON.stringify(state) + (g.fight ? `|f${g.fight.steps.length}${g.fight.done ? 'd' : ''}` : '');
  const msgs = g.log.filter((e) => e.n > rep.seq).map((e) => ({ msg: e.msg, cls: e.cls }));
  const newResult = result && result !== lastResult;
  if (!msgs.length && key === lastKey && !newResult) return;
  lastKey = key;
  if (result) lastResult = result;
  if (msgs.length) rep.seq = g.log[g.log.length - 1].n;
  const snap = { ...state, msgs };
  if (newResult) snap.result = result;
  if (g.fight) snap.fight = JSON.parse(JSON.stringify(g.fight));
  rep.snaps.push(snap);
}

/** Forget the de-duplication memory (e.g. after loading a different game). */
export function resetRecorder() { lastKey = null; lastResult = null; }

/** Rebuild a renderable game state for snapshot i. */
export function viewAt(rep, i) {
  const s = rep.snaps[i], b = rep.base;
  return {
    teams: b.teams, ai: b.ai, terrain: b.terrain, objectives: b.objectives,
    tp: s.tp, phase: s.phase, turn: s.turn, active: s.active, initiative: s.initiative, counter: s.counter,
    cp: s.cp, vp: s.vp, kills: s.kills, ploys: s.ploys || [[], []], log: [], fight: s.fight || null,
    winner: null,
    ops: b.ops.map((o, k) => {
      const [x, y, wounds, f, ml = 0] = s.o[k];
      return {
        ...o, x, y, wounds, dead: !!(f & DEAD), ready: !!(f & READY), order: f & CONCEAL ? 'conceal' : 'engage',
        ml, poison: !!(f & POISON), counteracted: !!(f & COUNTERED), acted: {}, ap: 0,
      };
    }),
  };
}

/** Movement since the previous snapshot: [{from, to, r-less}] for drawing trails. */
export function trailsAt(rep, i) {
  if (i <= 0) return [];
  const a = rep.snaps[i - 1].o, b = rep.snaps[i].o;
  const out = [];
  for (let k = 0; k < b.length; k++) {
    if (Math.hypot(a[k][0] - b[k][0], a[k][1] - b[k][1]) > 0.05 && !(b[k][3] & DEAD)) {
      out.push({ uid: rep.base.ops[k].uid, from: { x: a[k][0], y: a[k][1] }, to: { x: b[k][0], y: b[k][1] } });
    }
  }
  return out;
}

/** Describe changes the log doesn't mention (activation, order, phase) for step i. */
export function stepNotes(rep, i) {
  const s = rep.snaps[i], p = i > 0 ? rep.snaps[i - 1] : null;
  const view = viewAt(rep, i);
  const notes = [];
  const op = (uid) => view.ops.find((o) => o.uid === uid);
  const nameOf = (uid, lang) => opName(op(uid), lang);
  if (!p) notes.push({ zh: '遊戲開始（部署）', en: 'Game start (deployment)' });
  if (p && s.phase !== p.phase) {
    const names = { deploy: ['部署階段', 'Deployment'], strategy: ['策略階段', 'Strategy phase'], firefight: ['交火階段', 'Firefight phase'], gameover: ['遊戲結束', 'Game over'] };
    const n = names[s.phase] || [s.phase, s.phase];
    notes.push({ zh: `進入${n[0]}`, en: `${n[1]} begins` });
  }
  if (s.active && (!p || s.active !== p.active)) {
    notes.push({ zh: `${nameOf(s.active, 'zh')} ${s.counter ? '反擊' : '開始啟動'}`, en: `${nameOf(s.active, 'en')} ${s.counter ? 'counteracts' : 'is activated'}` });
  }
  if (p && p.active && !s.active && s.phase === p.phase) {
    notes.push({ zh: `${nameOf(p.active, 'zh')} 結束啟動`, en: `${nameOf(p.active, 'en')} ends its activation` });
  }
  if (p) {
    for (let k = 0; k < s.o.length; k++) {
      const was = p.o[k][3] & CONCEAL, now = s.o[k][3] & CONCEAL;
      if (was !== now && !(s.o[k][3] & DEAD)) {
        const uid = rep.base.ops[k].uid;
        notes.push(now ? { zh: `${nameOf(uid, 'zh')} 改為隱蔽指令`, en: `${nameOf(uid, 'en')} switches to Conceal` }
          : { zh: `${nameOf(uid, 'zh')} 改為交戰指令`, en: `${nameOf(uid, 'en')} switches to Engage` });
      }
    }
  }
  if (s.counter && !s.active && (!p || !p.counter)) {
    notes.push({ zh: `${team(view, s.turn).name.zh} 獲得反擊機會`, en: `${team(view, s.turn).name.en} may counteract` });
  }
  return notes;
}

// ---------- archive of finished games ----------
export function loadHistory() {
  // Games with a team that no longer exists (e.g. the old Astartes Strike Team) can't be replayed.
  try { return (JSON.parse(localStorage.getItem(HISTORY_KEY)) || []).filter((h) => h.teams.every((id) => TEAM_MAP[id])); } catch { return []; }
}

function saveHistory(list) {
  // Drop the oldest games if storage is full.
  for (let l = list; ; l = l.slice(0, -1)) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(l)); return; } catch { if (!l.length) return; /* too big, retry smaller */ }
  }
}

export function archiveGame(g, score) {
  if (!g.replay || g.archived) return;
  g.archived = true;
  const list = loadHistory();
  list.unshift({ id: Date.now(), date: new Date().toISOString(), teams: g.teams, ai: g.ai, score, winner: g.winner, replay: g.replay });
  saveHistory(list.slice(0, MAX_HISTORY));
}

export function deleteHistory(id) {
  saveHistory(loadHistory().filter((h) => h.id !== id));
}
