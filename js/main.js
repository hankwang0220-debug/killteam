import { TEAMS, TEAM_MAP, RULE_LABELS } from './data/teams.js';
import { L, bi, tx, getLang, setLang } from './i18n.js';
import {
  ACTIONS, activate, activeOp, canPlace, placeOp, autoDeployStep, finishDeployStep, availableActions, buyPloy, deployOk, doMove, endActivation,
  engagedEnemies, getOp, isInjured, killGrade, killOpVP, living, moveAllowance, moveStat, newGame, opName,
  TARGET_ACTIONS, doTargetAction, aplNow, mlLevel,
  counterCandidates, passCounter, canSwitchActive, deactivate, endFight, fightApply, fightAutoChoice, fightChooser, fightOp, fightOptions, fightWeapon, startFight,
  radius, resolveShoot, setOrder, shootCheck, startBattle, team, totalVP, tpl, MAX_TP, ployChooser, finishPloys,
  ployCost, ployTaken, shootWeapon, doOptics, injuredPenalty, effectiveRules, statPenalty, doFlail, doDakkaDash, freePending, rollCount,
  shootFlow, canCommandReroll, commandReroll, aiRerollChoice, fightCommandReroll, fightRerollDone,
  startStrategy, setMark, strategySwap, counterSwap, orderSwapCands, fightTargets, doSelfAction,
  NPO, mission, placeBid, doPickUp, doMissionAction, foes,
  readyOps, passChain, orderIssuer, chooseGuardOrder, GUARD_ORDERS, guardOrder, eyeLeft, eyeOfAncestors, placeTactician, placeNavyOrder, scrambleTargets, omniScramble, assignBlood, setGaze, setGloryKill,
} from './game.js';
import { renderBoard } from './board.js';
import { clampPath, findPath, moveCtx } from './path.js';
import { aiAttack, aiBid, aiStep, aiStrategy } from './ai.js';
import { MISSIONS, MISSION_LIST } from './missions.js';
import { HELP } from './help.js';
import { archiveGame, deleteHistory, loadHistory, recordStep, resetRecorder, rewindRecorder, stepNotes, trailsAt, viewAt } from './replay.js';

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const SAVE_KEY = 'kt.save';

let g = null;
const ui = {
  screen: 'home',
  sel: null,          // inspected / selected operative uid
  mode: null,         // {kind:'move', action} | {kind:'shoot', weapon} | {kind:'fight', weapon} | {kind:'target', action}
  path: null,         // movement preview
  result: null,       // dice dialog
  pending: null,      // declared attack waiting for "Roll": {kind:'shoot'|'fight', weapon, target, ai}
  flow: null,         // a Shoot action in progress: {it, step} (step = a Command Re-roll decision for a human)
  undo: [],           // snapshots before the player's undoable actions this activation
  help: false,
  setup: { teams: ['angels', 'kommandos'], ai: 1, tactics: [null, null], mission: 'standard' },
};
let aiTimer = null;

/** Sides the computer plays: the AI player and mission NPOs. */
const isAI = (s) => s === NPO || (!!g && s === g.ai);

// ---------- persistence ----------
function save() { try { if (g) localStorage.setItem(SAVE_KEY, JSON.stringify(g)); } catch { /* ignore */ } }
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    // A save from a team that no longer exists (e.g. the old Astartes Strike Team) can't be resumed.
    return s && s.teams.every((id) => TEAM_MAP[id]) ? s : null;
  } catch { return null; }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } }

// ---------- undo ----------
// On the tabletop players often move a model "just to see" what it could then do. In the Firefight
// phase every player action that rolls no dice can be undone; anything that rolls dice clears the
// history (undoing it would let you re-roll). The history only covers the current player's turn.
function snapshot() {
  const { replay, ...rest } = g;
  return { s: JSON.stringify(rest), snaps: replay?.snaps.length || 0, seq: replay?.seq || 0, turn: g.turn };
}

/** Run a player action in the Firefight phase, keeping an undo point unless it rolled dice. */
function undoable(fn) {
  if (g.phase !== 'firefight') return fn();
  const snap = snapshot(), rolled = rollCount();
  fn();
  if (rollCount() !== rolled) ui.undo = [];
  else { ui.undo.push(snap); if (ui.undo.length > 30) ui.undo.shift(); }
  return undefined;
}

function undo() {
  const u = ui.undo.pop();
  if (!u) return;
  const rep = g.replay;
  g = JSON.parse(u.s);
  if (rep) { g.replay = rep; rewindRecorder(g, u.snaps, u.seq); }
  ui.mode = null; ui.path = null; ui.pending = null; ui.notice = null; ui.sel = g.active;
  save();
  render();
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lang = () => getLang();
const nm = (op) => esc(opName(op, lang()));

// ---------- render root ----------
function render() {
  if (ui.screen !== 'game' && ui.screen !== 'replay') { measure.pts = []; measure.cursor = null; measure.mode = false; }
  if (ui.screen === 'game') noteTurn();
  if (ui.screen === 'home') app.innerHTML = homeView();
  else if (ui.screen === 'setup') app.innerHTML = setupView();
  else if (ui.screen === 'replay') app.innerHTML = replayView();
  else app.innerHTML = gameView();
  drawMeasure();
  renderModal();
  scheduleAI();
}

// ---------- measuring tool ----------
// Right-click adds a point, Esc removes the last one, left-click clears. Points on an operative snap
// to it and distances are measured from base edges, like on the tabletop. Usable at any time.
// On touch screens the 📏 button turns on measuring mode, where taps on the board add points.
const measure = { pts: [], cursor: null, mode: false };

function measureBar() {
  if (!measure.mode) {
    return `<div class="boardtools"><button class="ghost" data-act="mstart">📏 ${L('測量距離', 'Measure')}</button></div>`;
  }
  // Board labels are tiny on a phone, so the toolbar repeats the numbers.
  const segs = measure.pts.slice(1).map((p, i) => segLen(measure.pts[i], p));
  const total = segs.reduce((a, b) => a + b, 0);
  const info = segs.length
    ? `${L('總長', 'Total')} <b>${total.toFixed(1)}"</b>${segs.length > 1 ? ` <small>(${segs.map((d) => `${d.toFixed(1)}"`).join(' + ')})</small>` : ''}`
    : measure.pts.length ? L('再點一個位置', 'Tap another point') : L('點棋盤新增測量點', 'Tap the board to add points');
  return `<div class="boardtools on">
    <span>📏 ${info}</span>
    <button data-act="mundo" ${measure.pts.length ? '' : 'disabled'}>↶ ${L('上一點', 'Undo')}</button>
    <button data-act="mclear" ${measure.pts.length ? '' : 'disabled'}>${L('清除', 'Clear')}</button>
    <button class="primary" data-act="mend">✕ ${L('結束', 'Done')}</button>
  </div>`;
}

/** The state currently drawn on the board (a replay step, or the live game). */
const shownState = () => (ui.screen === 'replay' && ui.replay ? viewAt(ui.replay.rep, ui.replay.i) : g);

function measurePoint(evt) {
  const opEl = evt.target.closest?.('[data-uid]');
  const st = shownState();
  const op = opEl && st ? getOp(st, opEl.dataset.uid) : null;
  if (op && !op.dead) return { x: op.x, y: op.y, r: radius(op) };
  const p = svgPoint(evt);
  return { x: p.x, y: p.y, r: 0 };
}

const segLen = (a, b) => Math.max(0, Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r);

function drawMeasure() {
  const layer = document.getElementById('measure');
  if (!layer) return;
  const bar = document.querySelector('.boardtools');
  if (bar) bar.outerHTML = measureBar();
  if (!measure.pts.length) { layer.innerHTML = ''; return; }
  const last = measure.pts[measure.pts.length - 1], c = measure.cursor;
  const pts = c && Math.hypot(c.x - last.x, c.y - last.y) > 0.05 ? [...measure.pts, c] : measure.pts;
  const f = (n) => +n.toFixed(3);
  const s = [];
  s.push(`<polyline points="${pts.map((p) => `${f(p.x)},${f(p.y)}`).join(' ')}" class="mline"/>`);
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], d = segLen(a, b);
    total += d;
    if (pts.length > 2) s.push(`<text x="${f((a.x + b.x) / 2)}" y="${f((a.y + b.y) / 2 - 0.2)}" class="mseg">${d.toFixed(1)}"</text>`);
  }
  for (const p of measure.pts) s.push(`<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${p.r ? f(p.r + 0.12) : 0.14}" class="mpt ${p.r ? 'snap' : ''}"/>`);
  const end = pts[pts.length - 1];
  if (pts.length > 1) s.push(`<text x="${f(end.x)}" y="${f(end.y - (end.r || 0) - 0.35)}" class="mtotal">${total.toFixed(1)}"</text>`);
  if (!measure.mode) s.push(`<text x="15" y="-0.15" class="mhint">${esc(L('測量：右鍵 新增點 · Esc 上一點 · 左鍵 取消', 'Measure: right-click add point · Esc undo · left-click clear'))}</text>`);
  layer.innerHTML = s.join('');
}

function clearMeasure() { measure.pts = []; measure.cursor = null; drawMeasure(); }

app.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('#board')) return;
  e.preventDefault();
  measure.pts.push(measurePoint(e));
  measure.cursor = null;
  drawMeasure();
});
app.addEventListener('pointermove', (e) => {
  // Touch has no hover, so only a mouse draws the live segment to the cursor.
  if (!measure.pts.length || e.pointerType === 'touch' || !e.target.closest('#board')) return;
  measure.cursor = measurePoint(e);
  drawMeasure();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !measure.pts.length) return;
  measure.pts.pop();
  if (!measure.pts.length) measure.cursor = null;
  drawMeasure();
});
// Measuring mode: a tap on the board adds a point and does nothing else.
// Otherwise a left-click anywhere clears the measurement; on the board that click is used up by the clear.
document.addEventListener('click', (e) => {
  if (e.button !== 0) return;
  if (measure.mode) {
    if (!e.target.closest('#board')) return;
    e.stopPropagation();
    measure.pts.push(measurePoint(e));
    measure.cursor = null;
    drawMeasure();
    return;
  }
  if (!measure.pts.length) return;
  const onBoard = !!e.target.closest('#board');
  clearMeasure();
  if (onBoard) e.stopPropagation();
}, true);

// ---------- deployment drag ----------
// Press and drag an own operative to reposition it; its original spot stays visible until it is dropped.
// An invalid drop (outside the drop zone, on terrain, overlapping) snaps it back.
let drag = null; // { op, from, start, p, moved, el }
let dragEndedAt = -Infinity;

// The click that follows a drag must not also act as a board click (or clear the measurement).
window.addEventListener('click', (e) => {
  if (performance.now() - dragEndedAt < 400) { e.stopPropagation(); dragEndedAt = -Infinity; }
}, true);

function drawDrag() {
  const layer = document.getElementById('dragghost');
  if (!layer || !drag) return;
  const { op, from, p } = drag;
  const f = (n) => +n.toFixed(3), r = radius(op), col = team(g, op.side).color;
  const ok = deployOk(g, op, p);
  drag.el.setAttribute('transform', `translate(${f(p.x)} ${f(p.y)})`);
  layer.innerHTML = `<circle cx="${f(from.x)}" cy="${f(from.y)}" r="${f(r)}" class="trailghost" stroke="${col}"/>
    <line x1="${f(from.x)}" y1="${f(from.y)}" x2="${f(p.x)}" y2="${f(p.y)}" class="trail" stroke="${col}"/>
    <circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(r + 0.12)}" class="ghost ${ok ? 'ok' : 'bad'}"/>
    <text x="${f(p.x)}" y="${f(p.y - r - 0.3)}" class="pathlen">${Math.hypot(p.x - from.x, p.y - from.y).toFixed(1)}"</text>`;
}

app.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || measure.mode || ui.screen !== 'game' || g?.phase !== 'deploy') return;
  const el = e.target.closest('#board [data-uid]');
  const op = el && getOp(g, el.dataset.uid);
  if (!op || !canPlace(g, op) || op.placed === false) return;
  drag = { op, from: { x: op.x, y: op.y }, start: { x: e.clientX, y: e.clientY }, p: { x: op.x, y: op.y }, moved: false, el };
  document.getElementById('board').setPointerCapture(e.pointerId);
});
app.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.start.x, e.clientY - drag.start.y) < 5) return;
  if (!drag.moved) { drag.moved = true; drag.el.classList.add('dragging'); drag.el.parentNode.appendChild(drag.el); }
  drag.p = svgPoint(e);
  drawDrag();
});
const endDrag = (e) => {
  if (!drag) return;
  const d = drag;
  drag = null;
  if (!d.moved) return; // a plain click: selection is handled by the click event
  ui.sel = d.op.uid;
  dragEndedAt = performance.now();
  if (e.type === 'pointerup' && placeOp(g, d.op, d.p)) afterChange(); else render();
};
app.addEventListener('pointerup', endDrag);
app.addEventListener('pointercancel', endDrag);

function topBar(extra = '') {
  const replayBtn = ui.screen === 'game' && g?.replay?.snaps.length
    ? `<button class="ghost" data-act="replay" title="${L('複盤', 'Replay')}">📜 <span class="hidesm">${L('複盤', 'Replay')}</span></button>` : '';
  return `<header class="top">
    <div class="brand" data-act="home">⚔ <span>${L('殺戮小隊 戰術模擬', 'Kill Team Tactics')}</span></div>
    ${extra}
    <div class="topbtns">
      ${replayBtn}
      <button class="ghost" data-act="help">${L('規則', 'Rules')}</button>
      <button class="ghost" data-act="lang">${L('EN', '中文')}</button>
    </div>
  </header>`;
}

// ---------- home ----------
function homeView() {
  const saved = loadSave();
  return `${topBar()}
  <main class="home">
    <section class="hero">
      <h1>${L('殺戮小隊', 'KILL TEAM')}<small>${L('戰術模擬器', 'Tactics Simulator')}</small></h1>
      <p>${L('在 30"×22" 的戰場上指揮你的小隊。交替啟動、擲骰結算、搶奪目標點——完全依照桌遊流程進行。',
    'Command your team on a 30"×22" killzone. Alternate activations, roll dice, seize objectives — just like the tabletop.')}</p>
      <div class="herobtns">
        <button class="primary big" data-act="setup">${L('新遊戲', 'New Game')}</button>
        ${saved && saved.phase !== 'gameover' ? `<button class="big" data-act="resume">${L('繼續上一場', 'Resume')}</button>` : ''}
        <button class="big ghost" data-act="help">${L('規則速查', 'Quick Rules')}</button>
      </div>
    </section>
    ${historyView()}
    <section class="teamgrid">
      ${TEAMS.map((t) => `<article class="teamcard" style="--tc:${t.color}">
        <h3>${esc(bi(t.name))}</h3><div class="tag">${esc(tx(t.style))}</div>
        <p>${esc(tx(t.blurb))}</p>
        <p class="rule"><b>${esc(bi(t.rule.name))}</b>：${esc(tx(t.rule.desc))}</p>
        ${teamInfo(t)}
      </article>`).join('')}
    </section>
  </main>`;
}

// ---------- setup ----------
function setupView() {
  const s = ui.setup;
  const pick = (side) => `<div class="pick">
    <h3>${side === 0 ? L('玩家 1（藍方/左）', 'Player 1 (left)') : L('玩家 2（右）', 'Player 2 (right)')}</h3>
    <div class="picklist">${TEAMS.map((t) => `<button class="teampick ${s.teams[side] === t.id ? 'on' : ''}" style="--tc:${t.color}" data-act="pick" data-side="${side}" data-team="${t.id}">
      <b>${esc(bi(t.name))}</b><span>${esc(tx(t.style))} · ${t.ops.reduce((n, o) => n + o.count, 0)} ${L('人', 'ops')}</span></button>`).join('')}</div>
    ${side === 1 ? `<label class="aitoggle"><input type="checkbox" data-act="ai" ${s.ai === 1 ? 'checked' : ''}> ${L('由電腦控制', 'Computer controlled')}</label>` : ''}
    ${roster(TEAM_MAP[s.teams[side]])}
    ${tacticsPick(side)}
  </div>`;
  const ms = MISSIONS[s.mission] || MISSIONS.standard;
  return `${topBar()}
  <main class="setup">
    <section class="card missionpick"><h3>${L('任務', 'Mission')}</h3>
      <select data-act="mission">${MISSION_LIST.map((m) => `<option value="${m.id}" ${m.id === ms.id ? 'selected' : ''}>${esc(bi(m.name))}</option>`).join('')}</select>
      <p class="hint small">${esc(tx(ms.desc))}${ms.source ? ` <i>（${esc(ms.source)}）</i>` : ''}</p></section>
    <div class="picks">${pick(0)}${pick(1)}</div>
    <div class="setupbar"><button class="ghost" data-act="home">${L('返回', 'Back')}</button>
    <button class="primary big" data-act="start">${L('開始部署', 'Start Deployment')}</button></div>
  </main>`;
}

/** Primary + secondary Chapter Tactic for teams that have them (Angels of Death). */
const setupTactics = (side) => ui.setup.tactics[side] || TEAM_MAP[ui.setup.teams[side]].defaultTactics;

function tacticsPick(side) {
  const t = TEAM_MAP[ui.setup.teams[side]];
  if (!t.tactics) return '';
  const cur = setupTactics(side);
  const sel = (slot) => `<label>${slot ? L('次要', 'Secondary') : L('主要', 'Primary')}
    <select data-act="tactic" data-side="${side}" data-slot="${slot}">
      ${t.tactics.map((x) => `<option value="${x.id}" ${cur[slot] === x.id ? 'selected' : ''} ${cur[1 - slot] === x.id ? 'disabled' : ''}>${esc(bi(x.name))}</option>`).join('')}
    </select></label>`;
  const desc = (id) => t.tactics.find((x) => x.id === id);
  // A single choice (Gellerpox Techno-curse) or primary + secondary (Chapter Tactics).
  if (t.tacticSlots === 1) {
    return `<div class="tactics"><h4>${esc(bi(t.tacticsLabel))}</h4>
      <select data-act="tactic" data-side="${side}" data-slot="0">
        ${t.tactics.map((x) => `<option value="${x.id}" ${cur[0] === x.id ? 'selected' : ''}>${esc(bi(x.name))}</option>`).join('')}
      </select>
      <p class="hint small"><b>${esc(tx(desc(cur[0]).name))}</b>：${esc(tx(desc(cur[0]).desc))}</p>
    </div>`;
  }
  return `<div class="tactics"><h4>${L('戰團戰術', 'Chapter Tactics')}</h4>
    <div class="row">${sel(0)}${sel(1)}</div>
    ${cur.map((id) => `<p class="hint small"><b>${esc(tx(desc(id).name))}</b>：${esc(tx(desc(id).desc))}</p>`).join('')}
  </div>`;
}

/** Collector notes (archetypes, box, availability) for a team, if any. */
function teamInfo(t) {
  const i = t.info;
  if (!i) return '';
  return `<dl class="teaminfo">
    <dt>${L('戰術行動', 'Archetypes')}</dt><dd>${i.archetypes.map((a) => esc(bi(a))).join(' + ')}</dd>
    <dt>${L('戰鬥類型', 'Play style')}</dt><dd>${esc(tx(i.kind))}</dd>
    <dt>${L('隊伍人數', 'Operatives')}</dt><dd>${t.ops.reduce((n, o) => n + o.count, 0)}${i.size ? `（${esc(tx(i.size))}）` : ''}</dd>
    <dt>${L('一盒成軍', 'One box')}</dt><dd>${esc(tx(i.oneBox))}</dd>
    <dt>${L('目前可購買', 'Available')}</dt><dd>${esc(tx(i.buyable))}</dd>
    ${i.note ? `<dt>${L('備註', 'Note')}</dt><dd class="bad">${esc(tx(i.note))}</dd>` : ''}
  </dl>`;
}

function roster(t) {
  return `<div class="roster">
    ${teamInfo(t)}
    <p class="rule"><b>${esc(bi(t.rule.name))}</b>：${esc(tx(t.rule.desc))}</p>
    ${t.ops.map((o) => `<div class="rrow"><span>${o.count > 1 ? `${o.count}× ` : ''}${esc(bi(o.name))}</span>
      <span class="stats">APL ${o.apl} · M ${o.move}" · SV ${o.save}+ · W ${o.wounds}</span></div>`).join('')}
  </div>`;
}

// ---------- game ----------
function gameView() {
  return `${topBar(scoreBar())}
  <main class="game">
    <div class="boardwrap"><div class="boardbox">${renderBoard(g, boardUi())}${inspectView()}${measureBar()}${turnBanner()}${endBanner()}</div></div>
    <aside class="panel">${panelView()}${logView()}</aside>
  </main>`;
}

// ---------- turn banner ----------
const TURN_BANNER_MS = 1900;

/** When play passes to another side in the Firefight phase, start a banner animation on the map. */
function noteTurn() {
  if (!g || g.phase !== 'firefight' || g.active) return;
  const key = `${g.tp}-${g.turn}-${g.counter ? 'c' : ''}-${g.npoSlot ? 'n' : ''}`;
  if (key === ui.turnKey) return;
  const first = ui.turnKey == null;
  ui.turnKey = key;
  ui.turnBanner = { side: g.turn, counter: !!g.counter, at: Date.now(), first };
  setTimeout(() => document.querySelector('.turnanim')?.remove(), TURN_BANNER_MS + 50); // remove it once it has played
}

/** Who the banner calls: "your turn" / "opponent's turn" against the computer, the player otherwise. */
function turnBanner() {
  const b = ui.turnBanner, elapsed = b ? Date.now() - b.at : Infinity;
  if (!b || elapsed > TURN_BANNER_MS || g.phase !== 'firefight') return '';
  const side = b.side, tm = team(g, side);
  let title, kind;
  if (side === NPO) { title = L('NPO 的回合', 'NPOs\' turn'); kind = 'npo'; }
  else if (g.ai != null) { const mine = side !== g.ai; title = mine ? L('你的回合', 'YOUR TURN') : L('對方的回合', 'OPPONENT\'S TURN'); kind = mine ? 'mine' : 'theirs'; }
  else { title = L(`玩家 ${side + 1} 的回合`, `PLAYER ${side + 1}'S TURN`); kind = 'mine'; }
  const sub = `${esc(bi(tm.name))}${b.counter ? ` · ${L('反擊機會', 'Counteract')}` : ''}${g.ai === side ? ' 🤖' : ''}`;
  return `<div class="turnanim ${kind}" style="--tc:${tm.color};animation-delay:-${elapsed}ms"><div><b style="animation-delay:-${elapsed}ms">${title}</b><span>${sub}</span></div></div>`;
}

/**
 * Victory / defeat animation over the map when the battle ends. Against the computer the human is
 * player 1, so it reads "Victory" or "Defeat"; with two humans it names the winning team. Click to
 * dismiss and look at the battlefield.
 */
function endBanner() {
  if (g.phase !== 'gameover' || ui.endDismissed) return '';
  const w = g.winner, vsAI = g.ai != null;
  let kind, title, sub;
  if (w == null) { kind = 'draw'; title = L('平手', 'DRAW'); sub = L('雙方勢均力敵', 'Evenly matched'); }
  else if (vsAI) {
    const human = w !== g.ai;
    kind = human ? 'win' : 'lose';
    title = human ? L('勝利', 'VICTORY') : L('失敗', 'DEFEAT');
    sub = esc(bi(team(g, w).name));
  } else { kind = 'win'; title = L('勝利', 'VICTORY'); sub = esc(bi(team(g, w).name)); }
  const color = w == null ? '#c9a24a' : team(g, w).color;
  const score = `${totalVP(g, 0)} : ${totalVP(g, 1)}`;
  const sparks = kind === 'win' ? Array.from({ length: 24 }, (_, i) => `<i style="--a:${(i * 15) % 360}deg;--d:${0.4 + (i % 6) * 0.12}s;--c:${i % 3 ? color : '#fff'}"></i>`).join('') : '';
  return `<div class="endbanner ${kind}" style="--tc:${color}" data-act="dismissend" title="${L('點一下查看戰場', 'Tap to view the battlefield')}">
    <div class="endsparks">${sparks}</div>
    <div class="endtext"><h1>${title}</h1><p>${sub}</p><small>VP ${score}</small><em>${L('點一下查看戰場', 'Tap to view the battlefield')}</em></div>
  </div>`;
}

// ---------- replay viewer ----------
// ui.replay = { rep, i, from: 'game' | 'home', title, playing }
let replayTimer = null;

function replayView() {
  const R = ui.replay;
  const n = R.rep.snaps.length;
  const view = viewAt(R.rep, R.i);
  const snap = R.rep.snaps[R.i];
  const live = g;
  g = view; // the shared renderers read the module-level state
  try {
    const notes = stepNotes(R.rep, R.i).map((m) => `<li class="note">${esc(tx(m))}</li>`);
    const msgs = snap.msgs.map((e) => `<li class="${e.cls}">${esc(tx(e.msg))}</li>`);
    const lines = [...notes, ...msgs];
    const phase = { deploy: L('部署', 'Deploy'), initiative: L('先攻階段', 'Initiative'), strategy: L('策略階段', 'Strategy'), firefight: L('交火階段', 'Firefight'), gameover: L('遊戲結束', 'Game over') }[view.phase] || '';
    const dice = snap.result ? `<div class="rdice">${resultView(snap.result, true)}</div>`
      : snap.fight ? `<div class="rdice">${fightView(true)}</div>` : '';
    const sel = ui.sel && view.ops.find((o) => o.uid === ui.sel && !o.dead);
    return `${topBar(scoreBar())}
    <main class="game">
      <div class="boardwrap"><div class="boardbox">${renderBoard(view, { sel: ui.sel, trails: trailsAt(R.rep, R.i) })}${measureBar()}</div></div>
      <aside class="panel">
        <section class="card replayctl">
          <h2>📜 ${L('複盤', 'Replay')} <small>${esc(R.title)}</small></h2>
          <div class="rstep">${L(`第 <b>${R.i + 1}</b> / ${n} 步`, `Step <b>${R.i + 1}</b> / ${n}`)} · ${view.phase === 'deploy' ? '' : `TP ${view.tp} · `}${phase}</div>
          <input class="rseek" type="range" min="0" max="${n - 1}" value="${R.i}" data-act="rseek" aria-label="step">
          <div class="rbtns">
            <button data-act="rgo" data-to="0" title="${L('第一步', 'First')}">⏮</button>
            <button data-act="rgo" data-to="${R.i - 1}" ${R.i ? '' : 'disabled'} title="${L('上一步', 'Previous')}">◀</button>
            <button class="primary" data-act="rplay">${R.playing ? '⏸' : '▶'}</button>
            <button data-act="rgo" data-to="${R.i + 1}" ${R.i < n - 1 ? '' : 'disabled'} title="${L('下一步', 'Next')}">▶|</button>
            <button data-act="rgo" data-to="${n - 1}" title="${L('最後一步', 'Last')}">⏭</button>
          </div>
          <p class="hint small">${L('鍵盤 ← → 可逐步檢視；點棋子查看資料。', 'Use ← → to step; tap an operative for details.')}</p>
          <button class="wide" data-act="rexit">${R.from === 'game' ? L('返回遊戲', 'Back to game') : L('返回首頁', 'Back to home')}</button>
        </section>
        <section class="card">
          <h3>${L('這一步', 'This step')}</h3>
          <ol class="rlines">${lines.join('') || `<li class="note">${L('（狀態更新）', '(state update)')}</li>`}</ol>
          ${dice}
        </section>
        ${sel ? datacard(sel) : ''}
      </aside>
    </main>`;
  } finally {
    g = live;
  }
}

function openReplay(rep, from, title) {
  if (!rep?.snaps.length) return;
  stopReplayPlay();
  ui.replay = { rep, i: rep.snaps.length - 1, from, title, playing: false };
  ui.screen = 'replay'; ui.sel = null; ui.mode = null; ui.path = null;
  render();
}

function replayGo(i) {
  const R = ui.replay;
  R.i = Math.max(0, Math.min(R.rep.snaps.length - 1, i));
  render();
}

function stopReplayPlay() {
  clearInterval(replayTimer); replayTimer = null;
  if (ui.replay) ui.replay.playing = false;
}

function toggleReplayPlay() {
  const R = ui.replay;
  if (R.playing) { stopReplayPlay(); return render(); }
  if (R.i >= R.rep.snaps.length - 1) R.i = 0;
  R.playing = true;
  replayTimer = setInterval(() => {
    if (ui.screen !== 'replay') return stopReplayPlay();
    if (R.i >= R.rep.snaps.length - 1) { stopReplayPlay(); return render(); }
    R.i++; render();
  }, 900);
  render();
}

const teamsTitle = (teams) => teams.map((id) => tx(TEAM_MAP[id].name)).join(' vs ');

function historyView() {
  const list = loadHistory();
  if (!list.length) return '';
  return `<section class="history">
    <h2>📜 ${L('對戰紀錄', 'Past Games')}</h2>
    ${list.map((h) => {
    const d = new Date(h.date);
    const win = h.winner == null ? L('平手', 'Draw') : L(`${tx(TEAM_MAP[h.teams[h.winner]].name)} 勝`, `${tx(TEAM_MAP[h.teams[h.winner]].name)} won`);
    return `<div class="hrow">
        <div><b>${esc(teamsTitle(h.teams))}</b>
        <small>${d.toLocaleString(lang() === 'zh' ? 'zh-TW' : 'en')} · ${h.score.join(' : ')} · ${esc(win)} · ${h.replay.snaps.length} ${L('步', 'steps')}</small></div>
        <button class="primary" data-act="replayhist" data-id="${h.id}">${L('複盤', 'Replay')}</button>
        <button class="ghost" data-act="delhist" data-id="${h.id}" title="${L('刪除', 'Delete')}">🗑</button>
      </div>`;
  }).join('')}
  </section>`;
}

function scoreBar() {
  const scoreBox = (side) => {
    const t = team(g, side);
    const isTurn = g.phase === 'firefight' && g.turn === side;
    return `<div class="score ${isTurn ? 'turn' : ''}" style="--tc:${t.color}">
      <div class="sname">${esc(tx(t.name))}${g.ai === side ? ' 🤖' : ''}${lang() === 'zh' ? `<small>${esc(t.name.en)}</small>` : ''}</div>
      <div class="snums"><span title="Victory Points">VP <b>${totalVP(g, side)}</b></span><span title="Command Points">CP <b>${g.cp[side]}</b></span>
      <span title="${L('存活', 'Alive')}">👤 ${living(g, side).length}</span></div>
    </div>`;
  };
  const tpTxt = g.phase === 'deploy' ? L('部署', 'Deploy') : g.phase === 'gameover' ? L('結束', 'End') : `TP ${g.tp}/${MAX_TP}`;
  return `<div class="scorebar">${scoreBox(0)}<div class="tp">${tpTxt}</div>${scoreBox(1)}</div>`;
}

function boardUi() {
  const b = { sel: ui.sel, path: ui.path, highlight: null, ring: null, los: null, canDrag: g.phase === 'deploy' };
  const op = activeOp(g);
  if (op && ui.mode?.kind === 'move') b.ring = { x: op.x, y: op.y, r: moveAllowance(g, op, ui.mode.action) + radius(op) };
  if (op && ui.mode?.kind === 'shoot' && ui.mode.weapon) {
    b.highlight = new Map();
    // Detonate: the target is the friendly Gheistskull.
    for (const t of ui.mode.weapon.rules.detonate ? living(g, op.side).filter((o) => tpl(o).gheistskull) : foes(g, op)) {
      const c = shootCheck(g, op, t, ui.mode.weapon);
      if (!c.ok) continue;
      const r = effectiveRules(g, op, ui.mode.weapon, t);
      const cov = c.cover && !r.ignoreCover && !r.saturate;
      b.highlight.set(t.uid, cov && c.obscured ? 'cover obscured' : cov ? 'cover' : c.obscured ? 'obscured' : 'target');
    }
  }
  if (op && ui.mode?.kind === 'fight') {
    b.highlight = new Map(fightTargets(g, op).map((e) => [e.uid, 'target']));
  }
  if (op && ui.mode?.kind === 'target') {
    b.highlight = new Map(TARGET_ACTIONS[ui.mode.action].targets(g, op).map((e) => [e.uid, 'target']));
  }
  // The attack in progress — declared, being rolled, its result, or a fight: who attacks whom, with a line.
  let atk = null;
  if (ui.pending && op) atk = { a: op.uid, t: ui.pending.target, kind: ui.pending.kind };
  else if (ui.flow?.step) atk = { a: ui.flow.step.seq.op, t: ui.flow.step.seq.target, kind: 'shoot' };
  else if (ui.result?.attacker) atk = { a: ui.result.attacker, t: ui.result.target, kind: ui.result.kind || 'shoot' };
  else if (g.fight) atk = { a: g.fight.A.uid, t: g.fight.D.uid, kind: 'fight' };
  const A = atk && getOp(g, atk.a), Tg = atk && getOp(g, atk.t);
  if (A && Tg) { b.attack = atk; b.los = { a: A, b: Tg }; if (!g.fight) b.highlight = new Map([[Tg.uid, 'target']]); }
  // This turning point's moves, and the latest activation of each side.
  if (g.phase === 'firefight') { b.recent = (g.recent || []).filter((r) => r && r.tp === g.tp); b.trailLog = (g.trailLog || []).filter((e) => e.tp === g.tp); }
  return b;
}

function panelView() {
  if (g.phase === 'deploy') return deployPanel();
  if (g.phase === 'initiative') return initiativePanel();
  if (g.phase === 'strategy') return strategyPanel();
  if (g.phase === 'gameover') return gameOverPanel();
  return firefightPanel();
}

/** Initiative phase: the roll-off, who goes first and the CP gained, before the Strategy phase. */
function initiativePanel() {
  const first = g.initiative, ini = team(g, first), other = team(g, 1 - first);
  const cp = (s) => (s === first ? 1 : g.tp > 1 ? 2 : 1);
  return `<section class="card">
    <h2>${L(`第 ${g.tp} 回合・先攻階段`, `TP ${g.tp} · Initiative Phase`)}</h2>
    <p>${L('主動權擲骰', 'Initiative roll')}：<b style="color:${team(g, 0).color}">${g.initRoll[0]}</b> : <b style="color:${team(g, 1).color}">${g.initRoll[1]}</b></p>
    <p><b style="color:${ini.color}">${esc(bi(ini.name))}</b> ${L('獲得先攻，先啟動特工。', 'wins initiative and activates first.')}</p>
    <p class="hint">${L(`雙方獲得指揮點數：${esc(bi(ini.name))} +${cp(first)}、${esc(bi(other.name))} +${cp(1 - first)}（目前 ${g.cp[0]} : ${g.cp[1]}）。所有特工已回到「準備」狀態。`,
    `Command points gained: ${esc(bi(ini.name))} +${cp(first)}, ${esc(bi(other.name))} +${cp(1 - first)} (now ${g.cp[0]} : ${g.cp[1]}). All operatives are ready.`)}</p>
    <button class="primary wide" data-act="strategy">${L('進入策略階段 ▶', 'Start Strategy phase ▶')}</button>
  </section>`;
}

function deployPanel() {
  const d = g.dep;
  const count = (s) => {
    const all = g.ops.filter((o) => o.side === s);
    return `<span style="color:${team(g, s).color}">${esc(tx(team(g, s).name))} ${all.filter((o) => o.placed !== false).length}/${all.length}</span>`;
  };
  if (!d || d.done) {
    return `<section class="card">
      <h2>${L('部署階段', 'Deployment')}</h2>
      <p>${count(0)} · ${count(1)}</p>
      <p class="hint">${L('雙方都部署完成了。', 'Both teams are set up.')}</p>
      <button class="primary wide" data-act="begin">${L('開始戰鬥 ▶', 'Begin Battle ▶')}</button>
    </section>`;
  }
  const tm = team(g, d.turn), mine = !isAI(d.turn);
  const waiting = g.ops.filter((o) => o.side === d.turn && o.placed === false);
  const left = d.need - d.batch.length;
  return `<section class="card turnbanner" style="--tc:${tm.color}">
    <h2>${L('部署階段', 'Deployment')}</h2>
    <p>${count(0)} · ${count(1)}</p>
    <p><b style="color:${tm.color}">${esc(bi(tm.name))}</b> ${L(`部署這一批：${d.batch.length}/${d.need} 名`, `is setting up this step: ${d.batch.length}/${d.need}`)}${mine ? '' : ' 🤖'}</p>
    ${mine ? `<p class="hint">${L(`雙方輪流，每次部署隊伍的 1/3（無條件進位）。選一名待部署的特工，再點己方部署區（有顏色的區域）放置；這一批放好的特工在按「完成」前都還能拖曳調整。`,
      'Players alternate setting up a third of their team (rounded up). Pick an operative below, then tap inside your coloured zone; operatives placed in this step can still be dragged until you press Done.')}</p>
      ${left > 0 ? `<div class="oplist">${waiting.map((o) => `<button class="${ui.sel === o.uid ? 'on' : ''}" data-act="depsel" data-uid="${o.uid}">${nm(o)}</button>`).join('')}</div>` : ''}
      <div class="row"><button data-act="depauto">${L('自動部署這一批', 'Auto-place this step')}</button>
        <button class="primary" data-act="depdone" ${left > 0 ? 'disabled' : ''}>${L('完成這一批 ▶', 'Done ▶')}</button></div>`
    : `<p class="hint">${L('電腦部署中…', 'The computer is setting up…')}</p>`}
  </section>`;
}

function strategyPanel() {
  const cur = ployChooser(g), first = g.initiative;
  const chosen = (s) => {
    const t = team(g, s);
    return g.ploys[s].length ? g.ploys[s].map((id) => esc(bi(t.ploys.find((p) => p.id === id).name))).join('、') : L('未使用計謀', 'No ploys');
  };
  // One side chooses at a time: the initiative player first, then the other player.
  const summary = (s) => {
    const t = team(g, s);
    const state = s === cur ? L('選擇中…', 'choosing…') : s === first ? L('已完成', 'done') : L('等待中', 'waiting');
    return `<div class="ploys" style="--tc:${t.color}"><h3>${esc(bi(t.name))}${g.ai === s ? ' 🤖' : ''} · CP ${g.cp[s]} <small>${state}</small></h3>
      <p class="hint">${chosen(s)}</p></div>`;
  };
  const t = team(g, cur);
  const picker = g.ai === cur
    ? `<p class="hint">${L('電腦選擇計謀中…', 'Computer is choosing ploys…')}</p>`
    : `<div class="ploys" style="--tc:${t.color}"><h3>${esc(bi(t.name))} ${L('選擇計謀', 'chooses ploys')} · CP ${g.cp[cur]}</h3>
      ${t.ploys.map((p) => {
        const on = g.ploys[cur].includes(p.id);
        const cost = ployCost(g, cur, p);
        return `<button class="ploy ${on ? 'on' : ''}" data-act="ploy" data-side="${cur}" data-ploy="${p.id}" ${on || ployTaken(g, cur, p) || g.cp[cur] < cost ? 'disabled' : ''}>
          <b>${esc(bi(p.name))}</b> <span class="cp">${cost < p.cp ? `<s>${p.cp}</s> ` : ''}${cost}CP</span><small>${esc(tx(p.desc))}</small></button>`;
      }).join('')}</div>${gambitView(cur)}
      <button class="primary wide" data-act="ploysdone">${g.stratStep ? L('完成，進入交戰階段 ▶', 'Done — Start Firefight ▶') : L(`完成，換 ${esc(bi(team(g, 1 - cur).name))} ▶`, `Done — ${esc(bi(team(g, 1 - cur).name))}'s turn ▶`)}</button>`;
  const ini = team(g, first);
  return `<section class="card">
    <h2>${L(`第 ${g.tp} 回合・策略階段`, `TP ${g.tp} · Strategy Phase`)}</h2>
    <p>${L('主動權擲骰', 'Initiative roll')}：<b>${g.initRoll[0]}</b> : <b>${g.initRoll[1]}</b> → <b style="color:${ini.color}">${esc(bi(ini.name))}</b> ${L('先手', 'goes first')}</p>
    <p class="hint">${L('雙方輪流花費 CP 使用策略計謀（先手方先選），效果持續到本回合結束。', 'Each side in turn spends CP on strategy ploys (initiative player first); they last until the end of this Turning Point.')}</p>
    ${summary(first)}${summary(1 - first)}
  </section>
  <section class="card turnbanner" style="--tc:${t.color}">${picker}</section>`;
}

/** Farstalker Kinband choices while picking ploys: Call the Kill and up to three order changes. */
function gambitView(side) {
  let html = '';
  const kb = living(g, side).find((o) => tpl(o).callTheKill);
  if (kb) {
    const cur = g.mark?.[side];
    html += `<div class="gambit"><h4>${L('呼喚獵殺（獵殺掮客）', 'Call the Kill (Kill-broker)')}</h4>
      <p class="hint small">${L('選一名敵人作為本回合的標記：射擊、近戰或反擊它時武器獲得「平衡」。標記倒下時會自動選下一個，並觸發勝利尖嘯。', 'Mark an enemy for the turning point: weapons have Balanced against it. When it falls, a new mark is picked and Victory Shriek triggers.')}</p>
      <select data-act="mark" data-side="${side}"><option value="">${L('（不標記）', '(no mark)')}</option>
        ${living(g, 1 - side).map((o) => `<option value="${o.uid}" ${cur === o.uid ? 'selected' : ''}>${nm(o)} ${o.wounds}/${o.maxW}</option>`).join('')}
      </select></div>`;
  }
  const wm = living(g, side).find((o) => tpl(o).watchmaster);
  if (wm) {
    const cur = g.mark?.[side];
    html += `<div class="gambit"><h4>${L('集火摧毀！（看守長）', 'Bring it Down! (Watchmaster)')}</h4>
      <p class="hint small">${L('選一名敵人：本回合友方射擊、近戰或反擊它時，武器獲得「懲罰」。', 'Select an enemy: this TP, friendly weapons have Punishing when shooting, fighting or retaliating against it.')}</p>
      <select data-act="mark" data-side="${side}"><option value="">${L('（不選）', '(none)')}</option>
        ${living(g, 1 - side).map((o) => `<option value="${o.uid}" ${cur === o.uid ? 'selected' : ''}>${nm(o)} ${o.wounds}/${o.maxW}</option>`).join('')}
      </select></div>`;
  }
  // Blooded: assign tokens, Gaze of the Gods, Glory Kill target.
  if (team(g, side).bloodedTokens) {
    const pool = g.bloodPool?.[side] || 0;
    const holders = living(g, side).filter((o) => o.bloodToken);
    const gz = g.gaze?.[side]?.tp === g.tp ? getOp(g, g.gaze[side].uid) : null;
    html += `<div class="gambit"><h4>${L(`血祭標記：未分配 ${pool} 個（持有 ${holders.length} 名）`, `Blooded tokens: ${pool} unassigned (${holders.length} holders)`)}</h4>
      <p class="hint small">${L('點友方把標記給它（每名最多 1 個）：武器「精準 1」。4 名以上持有時，可選一名受「諸神注視」（精準保留的成功當暴擊）。', 'Tap a friendly to give it a token (one each): Accurate 1. With four or more holders, pick one under the Gaze of the Gods (the Accurate success is a critical).')}</p>
      <div class="readylist">${living(g, side).filter((o) => !o.bloodToken).map((o) => `<button data-act="bloodtoken" data-side="${side}" data-uid="${o.uid}" ${pool ? '' : 'disabled'}>${nm(o)}</button>`).join('')}</div>
      ${holders.length >= 4 ? (gz ? `<p>${L('諸神注視', 'Gaze of the Gods')}：<b>${nm(gz)}</b></p>` : `<select data-act="gaze" data-side="${side}"><option value="">${L('（選擇受諸神注視者）', '(choose the Gaze of the Gods)')}</option>${holders.map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}</select>`) : ''}
    </div>`;
    if (g.ploys[side].includes('gloryKill')) {
      const gk = g.gloryKill?.[side];
      html += `<div class="gambit"><h4>${L('榮耀擊殺目標', 'Glory Kill target')}</h4>
        <select data-act="glorykill" data-side="${side}">${living(g, 1 - side).map((o) => `<option value="${o.uid}" ${gk?.uid === o.uid ? 'selected' : ''}>${nm(o)} ${o.wounds}/${o.maxW}</option>`).join('')}</select></div>`;
    }
  }
  // Phobos: Omni-scrambler.
  if (team(g, side).omniScrambler && living(g, side).some((o) => tpl(o).infiltrator)) {
    const cur = g.scramble?.[side]?.tp === g.tp ? getOp(g, g.scramble[side].uid) : null;
    const ts = scrambleTargets(g, side);
    html += `<div class="gambit"><h4>${L('全頻擾亂器（滲透者）', 'Omni-scrambler (Infiltrators)')}</h4>
      <p class="hint small">${L('選一名被友方滲透者看到、或在干擾兵 6" 內的敵人：本回合對手要先啟動等同滲透者人數的特工，它才能行動（或它是最後一名）。', 'Pick an enemy visible to a friendly Infiltrator or within 6" of the Voxbreaker: this TP it can\'t act until your opponent has activated as many operatives as you have Infiltrators (or it\'s the last).')}</p>
      ${cur ? `<p>${L('已選', 'Selected')}：<b>${nm(cur)}</b></p>` : `<select data-act="scramble" data-side="${side}"><option value="">${L('（不使用）', '(none)')}</option>
        ${ts.map((o) => `<option value="${o.uid}">${nm(o)} ${o.wounds}/${o.maxW}</option>`).join('')}</select>`}</div>`;
  }
  // Navy Breachers: where the Attack / Defence Order marker goes.
  const nOrd = g.navyOrder?.[side];
  if (nOrd && nOrd.tp === g.tp) {
    html += `<div class="gambit"><h4>${nOrd.kind === 'attack' ? L('攻擊命令標記', 'Attack Order marker') : L('防禦命令標記', 'Defence Order marker')}</h4>
      <p class="hint small">${L('選一名友方，標記放在它的位置（影響範圍 3"）。', 'Pick a friendly operative; the marker goes where it stands (3" area).')}</p>
      <select data-act="navyorder" data-side="${side}"><option value="">${L('（保持原位）', '(keep where it is)')}</option>
        ${living(g, side).map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}
      </select></div>`;
  }
  // Hearthkyn: Eye of the Ancestors (Grudge tokens) and Tactician (Attack / Defence marker).
  if (living(g, side).some((o) => tpl(o).eyeOfAncestors)) {
    const left = eyeLeft(g, side);
    html += `<div class="gambit"><h4>${L(`先祖之眼（領主）：還可給 ${left} 名`, `Eye of the Ancestors (Theyn): ${left} left`)}</h4>
      <p class="hint small">${L('選敵人給一個宿怨標記（友方倒下 3 人以上時可選 2 名）。標記整場保留。', 'Give enemies a Grudge token (two if three or more friendlies are down). Tokens last the battle.')}</p>
      <div class="readylist">${living(g, 1 - side).map((o) => `<button data-act="grudge" data-side="${side}" data-uid="${o.uid}" ${left ? '' : 'disabled'}>${nm(o)} <small>${o.grudge?.[side] ? `⚑${o.grudge[side]}` : ''}</small></button>`).join('')}</div></div>`;
  }
  if (living(g, side).some((o) => tpl(o).tactician)) {
    const cur = g.tactician?.[side]?.tp === g.tp ? g.tactician[side] : null;
    const opt = (kind, o) => `<option value="${kind}:${o.uid}">${kind === 'attack' ? L('攻擊標記', 'Attack') : L('防禦標記', 'Defence')}：${nm(o)}</option>`;
    html += `<div class="gambit"><h4>${L('戰術家（智械參謀）', 'Tactician (Kognitâar)')}</h4>
      <p class="hint small">${L('攻擊標記放在敵人處：攻擊它 3" 內的敵人時武器「平衡」。防禦標記放在友方處：它 3" 內的友方被射擊時可重擲一顆防禦骰。', 'Attack marker by an enemy: Balanced against enemies within 3" of it. Defence marker by a friendly: friendlies within 3" of it re-roll one defence die when shot.')}</p>
      <select data-act="tactician" data-side="${side}" ${cur ? 'disabled' : ''}><option value="">${cur ? L(`已放置${cur.kind === 'attack' ? '攻擊' : '防禦'}標記`, `${cur.kind === 'attack' ? 'Attack' : 'Defence'} marker placed`) : L('（不放置）', '(none)')}</option>
        ${living(g, 1 - side).map((o) => opt('attack', o)).join('')}${living(g, side).map((o) => opt('defence', o)).join('')}
      </select></div>`;
  }
  const issuer = orderIssuer(g, side);
  if (issuer) {
    const pick = g.gorders?.[side];
    const vox = living(g, side).find((o) => tpl(o).relay);
    html += `<div class="gambit"><h4>${L(`衛兵命令（${nm(issuer)}）`, `Guardsman Order (${nm(issuer)})`)}</h4>
      <p class="hint small">${L('完成計謀選擇時下達給 6" 內的友方，效果到本回合結束（每名特工只算最新的一道）。', 'Issued to friendlies within 6" when you finish choosing ploys; lasts the turning point (only the latest order counts).')}</p>
      <select data-act="gorder" data-side="${side}"><option value="">${L('（不下令）', '(no order)')}</option>
        ${Object.entries(GUARD_ORDERS).map(([id, o]) => `<option value="${id}" ${pick?.id === id ? 'selected' : ''}>${esc(L(o.zh, o.en))}：${esc(L(o.dzh, o.den))}</option>`).join('')}
      </select>
      ${vox ? `<label class="small"><input type="checkbox" data-act="grelay" data-side="${side}" ${pick?.relay ? 'checked' : ''}> ${L(`由 ${nm(vox)} 轉達全隊（需在命令範圍內且不在敵人控制範圍；之後 APL -1）`, `${nm(vox)} relays it to everyone (if it receives it and isn't engaged; then -1 APL)`)}</label>` : ''}
    </div>`;
  }
  if (team(g, side).farstalker) {
    const used = g.orderSwaps?.[side] || 0;
    html += `<div class="gambit"><h4>${L(`遠獵者：變更指令（剩 ${3 - used} 次）`, `Farstalker: change orders (${3 - used} left)`)}</h4>
      <div class="readylist">${orderSwapCands(g, side).map((o) => `<button data-act="swaporder" data-uid="${o.uid}" ${used >= 3 ? 'disabled' : ''}>${nm(o)} <small>${o.order === 'conceal' ? L('◐ 隱蔽→交戰', '◐ → Engage') : L('⚔ 交戰→隱蔽', '⚔ → Conceal')}</small></button>`).join('')}</div></div>`;
  }
  return html;
}

function gameOverPanel() {
  const w = g.winner;
  const m = mission(g);
  if (m.killOp === false) {
    // Mission VP replace the kill op.
    const row = (s) => `<tr><td style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</td><td>${g.kills[s]}</td><td><b>${totalVP(g, s)}</b></td></tr>`;
    return `<section class="card">
      <h2>${w == null ? L('平手！', 'Draw!') : L(`${esc(bi(team(g, w).name))} 獲勝！`, `${esc(bi(team(g, w).name))} wins!`)}</h2>
      <p class="hint">${esc(tx(m.name))}</p>
      <table class="final"><tr><th></th><th>${L('擊殺數', 'Kills')}</th><th>${L('任務 VP', 'Mission VP')}</th></tr>${row(0)}${row(1)}</table>
      <p class="hint small">${esc(tx(m.desc))}</p>
      <button class="wide" data-act="replay">📜 ${L('觀看本場複盤', 'Watch the replay')}</button>
      <button class="primary wide" data-act="setup">${L('再來一場', 'Play Again')}</button>
    </section>`;
  }
  const line = (s) => `<tr><td style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</td><td>${g.kills[s]}</td><td>${killGrade(g, s)}</td><td>${killOpVP(g, s)}</td><td><b>${totalVP(g, s)}</b></td></tr>`;
  return `<section class="card">
    <h2>${w == null ? L('平手！', 'Draw!') : L(`${esc(bi(team(g, w).name))} 獲勝！`, `${esc(bi(team(g, w).name))} wins!`)}</h2>
    <table class="final"><tr><th></th><th>${L('擊殺數', 'Kills')}</th><th>${L('擊殺等級', 'Grade')}</th><th>Kill Op</th><th>${L('總分', 'Total')}</th></tr>${line(0)}${line(1)}</table>
    <p class="hint small">${L('擊殺任務：每升一個擊殺等級得 1 VP；結束時擊殺等級較高者再得 1 VP。', 'Kill Op: 1VP per kill grade reached; +1VP at the end for the higher kill grade.')}</p>
    <button class="wide" data-act="replay">📜 ${L('觀看本場複盤', 'Watch the replay')}</button>
    <button class="primary wide" data-act="setup">${L('再來一場', 'Play Again')}</button>
  </section>`;
}

/** Which operative each side is activating (or activated last) this turning point. */
function recentView() {
  const row = (s) => {
    const tm = team(g, s), rec = g.recent?.[s];
    const o = rec && rec.tp === g.tp ? getOp(g, rec.uid) : null;
    const state = !o ? L('尚未啟動', 'Not yet activated') : g.active === o.uid ? L('啟動中', 'Activating') : L('上一個啟動', 'Last activated');
    const moves = o ? rec.trails.length : 0;
    return `<div class="rrow recent ${g.active && o && g.active === o.uid ? 'now' : ''}" style="--tc:${tm.color}">
      <span><b style="color:${tm.color}">${esc(tx(tm.name))}</b>：${o ? nm(o) : '—'}</span>
      <span class="stats">${state}${moves ? L(`・移動 ${moves} 次`, ` · ${moves} move${moves > 1 ? 's' : ''}`) : ''}</span></div>`;
  };
  return `<div class="recentbox">${row(0)}${row(1)}</div>`;
}

/** A declared attack, shown on the board before any dice are rolled. */
function pendingView() {
  const p = ui.pending, a = activeOp(g), t = getOp(g, p.target);
  const verb = p.kind === 'shoot' ? L('射擊', 'shoots') : L('近戰攻擊', 'fights');
  const by = (o) => `<b style="color:${team(g, o.side).color}">${nm(o)}</b>`;
  return `<div class="pending"><h3>${p.kind === 'shoot' ? '⌖' : '⚔'} ${L('宣告攻擊', 'Attack declared')}</h3>
    <p>${by(a)} ${L('以', 'with')} ${esc(bi(p.weapon.name))} ${verb} ${by(t)}</p>
    <div class="row">
      ${p.ai ? '' : `<button class="ghost" data-act="unroll">${L('收回', 'Take back')}</button>`}
      <button class="primary" data-act="roll">🎲 ${L('擲骰', 'Roll')}</button>
    </div></div>`;
}

// ---------- stepping through a Shoot action (Command Re-roll) ----------
/**
 * Run the shooting generator until a human player has a decision (Command Re-roll of an attack or
 * defence die) or it finishes. The computer's side decides on its own.
 */
function advanceFlow() {
  const F = ui.flow;
  for (;;) {
    const r = F.it.next();
    if (r.done) { ui.result = r.value; ui.flow = null; return afterChange(); }
    const { stage, seq } = r.value;
    const which = stage === 'attack' ? 'a' : 'd';
    const side = getOp(g, stage === 'attack' ? seq.op : seq.target).side;
    if (isAI(side)) {
      const i = aiRerollChoice(g, side, seq, which);
      if (i >= 0) commandReroll(g, side, seq, which, i);
      continue;
    }
    if (canCommandReroll(g, side, seq, which)) { F.step = { stage, seq, side }; return render(); }
  }
}

/** The dice a human can Command Re-roll (1CP), shown before the action continues. */
function flowView() {
  const { stage, seq, side } = ui.flow.step;
  const a = getOp(g, seq.op), t = getOp(g, seq.target), which = stage === 'attack' ? 'a' : 'd';
  const pool = which === 'a' ? seq.a : seq.d, tm = team(g, side);
  const used = !canCommandReroll(g, side, seq, which);
  const dice = pool.dice.map((d, i) => (d.auto ? die(d, i) : `<button class="diebtn" ${used ? 'disabled' : ''} data-act="rerolldie" data-i="${i}" title="${L('指揮重擲這顆骰（1CP）', 'Command Re-roll this die (1CP)')}">${die(d, i)}</button>`)).join('');
  return `<h2>⌖ ${stage === 'attack' ? L('攻擊骰', 'Attack dice') : L('防禦骰', 'Defence dice')}</h2>
    <p><b style="color:${team(g, a.side).color}">${nm(a)}</b> → <b style="color:${team(g, t.side).color}">${nm(t)}</b> · ${esc(bi(seq.weapon.name))}</p>
    <div class="dicerow"><label>${stage === 'attack' ? `${L('攻擊', 'Attack')} (${seq.hit}+)` : `${L('防禦', 'Defence')} (${seq.save}+)`}</label>${dice}
      <em>${L(`${pool.crits} 暴擊 / ${pool.norms} 成功`, `${pool.crits} crit / ${pool.norms} success`)}</em></div>
    <p class="hint small">${L(`<b style="color:${tm.color}">${esc(tx(tm.name))}</b> 有 ${g.cp[side]} CP：可花 1CP「指揮重擲」一顆骰（點該骰子）。`,
    `<b style="color:${tm.color}">${esc(tx(tm.name))}</b> has ${g.cp[side]}CP: spend 1CP on a Command Re-roll of one die (tap it).`)}${used && !seq.rerolled?.[which] ? ` ${L('（此時不能重擲）', '(not allowed now)')}` : ''}</p>
    <button class="primary wide" data-act="flowgo">${stage === 'attack' ? L('繼續：防禦方擲骰 ▶', 'Continue — defender rolls ▶') : L('繼續：結算傷害 ▶', 'Continue — resolve damage ▶')}</button>`;
}

/** Negotiation: a human player's secret bid of Negotiation points to control the NPO this activation. */
function biddingView() {
  const b = g.bidding;
  const side = [0, 1].find((s) => !isAI(s) && b.bids[s] == null);
  if (side == null) return `<p class="hint">${L('等待出價…', 'Waiting for bids…')}</p>`;
  const tm = team(g, side), pts = g.negotiation?.[side] || 0;
  return `<div class="pending"><h3>🤝 ${L('談判出價', 'Negotiation bid')}</h3>
    <p>${L(`檔案管理員要啟動（APL ${b.apl}）。<b style="color:${tm.color}">${esc(tx(tm.name))}</b> 暗中出價談判點（你有 ${pts} 點），出價較高者本次啟動可操控牠；平手則牠照自己的行為行動。`,
    `The Archivist is activating (APL ${b.apl}). <b style="color:${tm.color}">${esc(tx(tm.name))}</b>, secretly bid Negotiation points (you have ${pts}); the higher bid controls it for this activation, a tie leaves it to its behaviour.`)}</p>
    <div class="row"><input type="number" min="0" max="${pts}" value="0" class="bidinput" data-side="${side}">
      <button class="primary" data-act="bid" data-side="${side}">${L('出價', 'Bid')}</button></div></div>`;
}

/** Mission scoring state shown during the game (VP, Negotiation points, Intruder deck…). */
function missionView() {
  const m = mission(g);
  if (m.id === 'standard') return '';
  const parts = [];
  if (g.negotiation) parts.push(L(`談判點 ${g.negotiation[0]} : ${g.negotiation[1]}`, `Negotiation ${g.negotiation[0]} : ${g.negotiation[1]}`));
  if (g.npoState?.intruder) parts.push(L(`入侵者牌剩 ${g.npoState.intruder.length} 張`, `${g.npoState.intruder.length} Intruder cards left`));
  if (g.npoState?.siphon) parts.push(L(`本回合抽取 VP ${g.npoState.siphon[0]} : ${g.npoState.siphon[1]}（上限 2）`, `Siphon VP this TP ${g.npoState.siphon[0]} : ${g.npoState.siphon[1]} (max 2)`));
  return `<div class="missionbox"><b>${esc(tx(m.name))}</b>${parts.length ? ` · ${parts.join(' · ')}` : ''}</div>`;
}

function firefightPanel() {
  const op = activeOp(g);
  const t = team(g, g.turn);
  const aiTurn = isAI(g.turn);
  let html = `<section class="card turnbanner" style="--tc:${t.color}">
    <h2>${esc(bi(t.name))} ${L('的回合', '— your move')}</h2>${missionView()}${recentView()}`;
  if (g.bidding) return `${html}${biddingView()}</section>`;
  if (aiTurn) {
    html += ui.pending ? pendingView() : `<p class="hint">${op ? L(`電腦正在操作 ${nm(op)}…`, `Computer is acting with ${nm(op)}…`) : L('電腦思考中…', 'Computer is thinking…')}</p>`;
    return `${html}</section>${op ? datacard(op) : ''}`;
  }
  const undoBtn = ui.undo.length ? `<button class="wide" data-act="undo">↶ ${L('回復上一動作', 'Undo last action')}</button>` : '';
  if (!op && g.counter) {
    const cands = counterCandidates(g, g.turn);
    html += `<p><b>${L('反擊機會', 'Counteract')}</b></p>
      <p class="hint">${L('你已沒有準備中的特工。可選一名已行動、交戰指令且本回合未反擊過的特工，免費執行一個 1AP 動作（移動不超過 2"），或略過。',
    'You have no ready operatives. Pick an expended Engage-order operative that has not counteracted this TP to perform one free 1AP action (moving no more than 2"), or pass.')}</p>
      <div class="readylist">${cands.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`;
    const sel = ui.sel && getOp(g, ui.sel);
    if (sel && cands.includes(sel)) html += `<button class="primary wide" data-act="activate" data-uid="${sel.uid}">${L('反擊', 'Counteract with')} ${nm(sel)}</button>`;
    const swaps = orderSwapCands(g, g.turn);
    if (swaps.length) {
      html += `<p class="hint small">${L('遠獵者：也可以改成變更一名特工的指令（算你的反擊，不算該特工的）。', 'Farstalker: or change one operative\'s order instead (counts as your counteract, not the operative\'s).')}</p>
        <div class="readylist">${swaps.map((o) => `<button data-act="counterswap" data-uid="${o.uid}">${nm(o)} <small>${o.order === 'conceal' ? L('◐→⚔', '◐ → Engage') : L('⚔→◐', '⚔ → Conceal')}</small></button>`).join('')}</div>`;
    }
    html += `<button class="wide" data-act="passcounter">${L('略過反擊', 'Pass')}</button>${undoBtn}</section>`;
    return html;
  }
  if (!op) {
    const ready = readyOps(g, g.turn);
    const ch = g.chain;
    const by = ch && getOp(g, ch.by);
    html += ch
      ? ch.kind === 'breach'
        ? `<p class="hint"><b>${L('突破清場', 'Breach and Clear')}</b>：${L(`${nm(by)} 行動完畢，可以接著啟動它 3" 內的一名友方（每回合一次；也可以略過）。`, `${nm(by)} is expended: you may activate a friendly that was within 3" of it next (once per TP; or skip).`)}</p>`
        : `<p class="hint"><b>${ch.must ? L('群體啟動', 'Group Activation') : L('指令', 'Directive')}</b>：${ch.must
        ? L(`${nm(by)} 行動完畢，必須接著啟動另一名同類特工，再換對手。`, `${nm(by)} is expended: another operative of the same kind must activate before the opponent.`)
        : L(`${nm(by)} 行動完畢，可以接著啟動它選定的一名友方（也可以略過）。`, `${nm(by)} is expended: you may activate one of the friendlies it selected next (or skip).`)}</p>`
      : `<p class="hint">${L('選擇一名「準備中」的操作員啟動（點擊棋子或下方名單）。', 'Choose a ready operative to activate (tap it on the board or below).')}</p>`;
    html += `<div class="readylist">${ready.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`;
    const sel = ui.sel && getOp(g, ui.sel);
    if (sel && ready.includes(sel)) html += `<button class="primary wide" data-act="activate" data-uid="${sel.uid}">${L('啟動', 'Activate')} ${nm(sel)}</button>`;
    if (ch && !ch.must) html += `<button class="wide" data-act="passchain">${ch.fallback ? L('不用突破清場（改做群體啟動）', 'Don\'t Breach and Clear (Group Activation instead)') : L('略過，換對手', 'Skip — opponent\'s turn')}</button>`;
    html += `${undoBtn}</section>`;
    return html;
  }

  // Active operative
  const apMax = op.counter ? 1 : aplNow(g, op);
  html += `<div class="activehead"><b>${nm(op)}${op.counter ? ` <small>${L('（反擊）', '(counteract)')}</small>` : ''}</b><span class="ap">${'●'.repeat(Math.max(0, op.ap))}${'○'.repeat(Math.max(0, apMax - op.ap))} AP</span></div>`;
  if (ui.notice) html += `<p class="bad small">${esc(ui.notice)}</p>`;
  else if (canSwitchActive(g)) html += `<p class="hint small">${L('執行第一個動作前，點其他己方特工可以改啟動它。', 'Until the first action, tap another of your operatives to activate it instead.')}</p>`;
  if (!op.orderSet) {
    html += `<div class="orders">
      <button class="${op.order === 'engage' ? 'on' : ''}" data-act="order" data-order="engage">⚔ ${L('交戰 Engage', 'Engage')}</button>
      <button class="${op.order === 'conceal' ? 'on' : ''}" data-act="order" data-order="conceal">◐ ${L('隱蔽 Conceal', 'Conceal')}</button>
    </div><p class="hint small">${L('隱蔽：在掩體中時敵人無法選為目標，但不能射擊、衝鋒或反擊。執行第一個動作後鎖定。', 'Conceal: cannot be targeted while in cover, but cannot Shoot, Charge or counteract. Locks after the first action.')}</p>`;
  } else {
    html += `<p class="hint">${L('指令', 'Order')}：${op.order === 'engage' ? L('⚔ 交戰', '⚔ Engage') : L('◐ 隱蔽', '◐ Conceal')}</p>`;
  }

  if (ui.pending) html += pendingView();
  else if (ui.mode) html += modeView(op);
  else {
    html += `<div class="actions">${availableActions(g, op).map((a) => `<button data-act="action" data-id="${a.id}" ${a.ok ? '' : 'disabled'} title="${a.why ? esc(tx(a.why)) : ''}">
      ${esc(tx(ACTIONS[a.id].name))} <span class="cp">${a.ap}AP</span></button>`).join('')}</div>`;
    if (op.ap <= 0 && !freePending(op)) html += `<p class="hint small">${L('AP 已用完：可以回復上一動作，或結束啟動。', 'Out of AP: undo the last action or end the activation.')}</p>`;
  }
  html += `${undoBtn}<button class="wide ${op.ap <= 0 && !freePending(op) ? 'primary' : ''}" data-act="endact">${L('結束啟動', 'End Activation')}</button></section>`;
  return html + datacard(op);
}

function modeView(op) {
  const m = ui.mode;
  const cancel = `<button class="ghost" data-act="cancel">${L('取消', 'Cancel')}</button>`;
  if (m.kind === 'move') {
    const max = moveAllowance(g, op, m.action);
    let info = L(`點擊棋盤選擇目的地（最多 ${max}"）。`, `Tap the board to choose a destination (max ${max}").`);
    if (m.action === 'charge') info += L('必須結束於敵人交戰範圍 1" 內。', ' Must end within 1" of an enemy.');
    if (m.action === 'fallBack') info += L('必須離開所有敵人的交戰範圍。', ' Must end outside all enemy engagement ranges.');
    if (m.action !== 'charge' && m.action !== 'fallBack') info += L('結束時不能在敵人 1" 交戰範圍內。', ' Cannot end within 1" of an enemy.');
    const p = ui.path;
    const status = p ? (p.ok ? `<p class="ok">✔ ${p.len.toFixed(1)}" / ${max}"</p>` : `<p class="bad">✘ ${esc(p.why)}</p>`) : '';
    return `<div class="mode"><h3>${esc(tx(ACTIONS[m.action].name))}</h3><p class="hint">${info}</p>${status}
      <div class="row">${cancel}<button class="primary" data-act="confirmmove" ${p?.ok ? '' : 'disabled'}>${L('確認移動', 'Confirm')}</button></div></div>`;
  }
  if ((m.kind === 'shoot' || m.kind === 'fight') && !m.weapon) {
    const type = m.kind === 'shoot' ? 'ranged' : 'melee';
    const btn = (w, i) => {
      if (w.type !== type) return '';
      const s = type === 'ranged' ? shootWeapon(g, op, w) : { ok: true, ap: 1 };
      const note = !s.ok ? `<span class="wrules bad">${esc(tx(s.why))}</span>` : s.ap > 1 ? `<span class="wrules">${L(`第二次射擊同一把武器：${s.ap}AP`, `Second Shoot with the same weapon: ${s.ap}AP`)}</span>` : '';
      return `<button class="weapon" data-act="weapon" data-i="${i}" ${s.ok ? '' : 'disabled'}>${weaponLine(w)}${note}</button>`;
    };
    return `<div class="mode"><h3>${L('選擇武器', 'Choose weapon')}</h3>
      ${tpl(op).weapons.map(btn).join('')}
      <div class="row">${cancel}</div></div>`;
  }
  if (m.kind === 'shoot') {
    const area = m.weapon.rules.torrent ? L(`洪流：也會射擊主要目標 ${m.weapon.rules.torrent}" 內其他有效目標。`, ` Torrent: also shoots other valid targets within ${m.weapon.rules.torrent}" of the first.`)
      : m.weapon.rules.blast ? L(`爆炸：也會射擊主要目標 ${m.weapon.rules.blast}" 內所有可見的特工（包括己方）。`, ` Blast: also shoots every operative visible within ${m.weapon.rules.blast}" of the first — friends included.`) : '';
    return `<div class="mode"><h3>${esc(bi(m.weapon.name))}</h3><p class="hint">${L('點擊紅圈標示的敵人射擊。🛡 = 目標在掩護中（保留 1 顆豁免）。', 'Tap a highlighted enemy. 🛡 = target in cover (retains a save).')}${area}</p><div class="row">${cancel}</div></div>`;
  }
  if (m.kind === 'fight') return `<div class="mode"><h3>${esc(bi(m.weapon.name))}</h3><p class="hint">${L('點擊交戰中的敵人。', 'Tap an engaged enemy.')}</p><div class="row">${cancel}</div></div>`;
  if (m.kind === 'target') {
    const hint = {
      markerlight: L('點擊一個可見的敵人，讓它獲得標記光標記。', 'Tap a visible enemy to give it Markerlight tokens.'),
      signal: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      systemJam: L('點擊一個可見的敵人，它下次啟動 APL -1。', 'Tap a visible enemy: -1 APL for its next activation.'),
      medikit: L('點擊控制範圍內受傷的友方（無人機除外），回復 2D3 生命。', 'Tap a wounded friendly (not a drone) in control range to regain 2D3 wounds.'),
      miasma: L('點擊 7" 內可見（或可射擊）的敵人：未中毒則中毒，已中毒則受到 3 傷害。', 'Tap an enemy visible within 7" (or a valid target): it is poisoned, or takes 3 damage if it already was.'),
      getItDun: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      listenIn: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      eyeAbove: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      pechra: L('點擊一個可見的敵人，把鳥標放在它旁邊：友方射擊鳥標 1" 內的敵人時獲得「搜尋（輕型）」。', 'Tap a visible enemy to place the Pech\'ra marker by it: friendly shooting at enemies within 1" of it has Seek Light.'),
      stunGrenade: L('點擊 6" 內可見的敵人：它與 1" 內的每個特工擲 D6，3+ 下次啟動 APL -1。', 'Tap an enemy visible within 6": it and every operative within 1" roll a D6 — on a 3+, -1 APL next activation.'),
      vitality: L('點擊 3" 內可見、受傷的友方：擲 2D6，總和 7 回復 7 生命，否則回復較高的那顆骰。', 'Tap a wounded friendly visible within 3": roll 2D6 — a 7 regains 7 wounds, otherwise the highest die.'),
    }[m.action];
    return `<div class="mode"><h3>${esc(tx(ACTIONS[m.action].name))}</h3><p class="hint">${hint}</p><div class="row">${cancel}</div></div>`;
  }
  return '';
}

function ruleText(rules) {
  return Object.entries(rules).filter(([k]) => RULE_LABELS[k]).map(([k, v]) => {
    const lab = bi(RULE_LABELS[k]);
    if (v === true) return lab;
    if (k === 'heavy' && v === 'dash') return `${lab}${L('（僅限衝刺）', ' (Dash only)')}`;
    if (k === 'range' || k === 'torrent' || k === 'blast') return `${lab} ${v}"`;
    if (k === 'lethal') return `${lab} ${v}+`;
    return `${lab} ${v}`;
  }).join(', ');
}

function weaponLine(w) {
  return `<span class="wname">${w.type === 'ranged' ? '⌖' : '⚔'} ${esc(bi(w.name))}</span>
    <span class="wstats">A${w.atk} · ${w.hit}+ · ${w.dmg[0]}/${w.dmg[1]}</span>
    ${ruleText(w.rules) ? `<span class="wrules">${esc(ruleText(w.rules))}</span>` : ''}`;
}

/** Floating card on the board for an inspected (clicked) operative that isn't the active one. */
function inspectView() {
  const op = ui.sel && getOp(g, ui.sel);
  if (!op || op.dead || op.uid === g.active) return '';
  // Sit in the corner away from the operative so it never covers it.
  const pos = `${op.x > 15 ? 'left' : 'right'} ${op.y > 11 ? 'top' : 'bottom'}`;
  const who = g.ai === op.side ? L('敵方（電腦）', 'Enemy (computer)')
    : g.ai != null ? L('己方', 'Yours')
      : L(`玩家 ${op.side + 1}`, `Player ${op.side + 1}`);
  return `<div class="inspect ${pos}">${datacard(op, `<span class="who">${who}</span><button class="ghost close" data-act="closeinspect" aria-label="close">✕</button>`)}</div>`;
}

function datacard(op, extra = '') {
  const t = tpl(op);
  const tm = team(g, op.side);
  const flags = [];
  if (injuredPenalty(g, op)) flags.push(`<span class="flag inj">${L('受傷：Move -2"、命中 -1', 'Injured: -2" Move, -1 to hit')}</span>`);
  else if (isInjured(op)) flags.push(`<span class="flag inj">${L('受傷（無所畏懼：無減益）', 'Injured (Know No Fear: no penalty)')}</span>`);
  if (!injuredPenalty(g, op) && statPenalty(g, op)) flags.push(`<span class="flag inj">${L('傳染：Move -2"、命中 -1', 'Contagion: -2" Move, -1 to hit')}</span>`);
  if (op.poison) flags.push(`<span class="flag poison">${L('中毒', 'Poisoned')}</span>`);
  if (g.mark?.[1 - op.side] === op.uid) flags.push(`<span class="flag mk">${L('獵殺標記', 'Marked (Call the Kill)')}</span>`);
  if (op.shriek) flags.push(`<span class="flag">${L('勝利尖嘯：平衡', 'Victory Shriek: Balanced')}</span>`);
  if (op.frenzy) flags.push(`<span class="flag inj">🔥 ${L(`狂暴（被近戰普通命中 ${op.frenzyHits || 0}/2）`, `Frenzy (normal strikes taken ${op.frenzyHits || 0}/2)`)}</span>`);
  if (op.gongOn) flags.push(`<span class="flag">${L('鳴鑼：豁免 +1', 'Gong Knell: +1 Save')}</span>`);
  if (op.bloodToken) flags.push(`<span class="flag mk">${L('血祭標記', 'Blooded token')}</span>`);
  if (g.gaze?.[op.side]?.tp === g.tp && g.gaze[op.side].uid === op.uid) flags.push(`<span class="flag mk">${L('諸神注視', 'Gaze of the Gods')}</span>`);
  for (const [k, zh, en] of [['fortified', '強化', 'Fortified'], ['enraged', '狂怒', 'Enraged']]) if (op.stimms?.[k]) flags.push(`<span class="flag">${L(`興奮劑：${zh}`, `Stimm: ${en}`)}</span>`);
  if (op.shieldingOn) flags.push(`<span class="flag">${L('舉盾中', 'Shielding')}</span>`);
  for (const n of Object.values(op.grudge || {})) if (n) flags.push(`<span class="flag mk">${L(`宿怨 ×${n}`, `Grudge ×${n}`)}</span>`);
  if (g.scramble?.[1 - op.side]?.tp === g.tp && g.scramble[1 - op.side].uid === op.uid) flags.push(`<span class="flag inj">${L('全頻擾亂：延後啟動', 'Omni-scrambled')}</span>`);
  if (op.jam) flags.push(`<span class="flag inj">${L('系統干擾：最後才能啟動', 'System Jam: activates last')}</span>`);
  if (tpl(op).weavefield && op.crestUsed) flags.push(`<span class="flag">${L('紋章已用', 'Crest used')}</span>`);
  const go = guardOrder(g, op);
  if (go) flags.push(`<span class="flag">${L(`命令：${GUARD_ORDERS[go].zh}`, `Order: ${GUARD_ORDERS[go].en}`)}</span>`);
  if (op.energised === g.tp) flags.push(`<span class="flag">${L('充能', 'Energised')}</span>`);
  if (op.longSightOn) flags.push(`<span class="flag">${L('遠視', 'Long-sight')}</span>`);
  if (op.optics) flags.push(`<span class="flag mk">${L('光學瞄準', 'Optics')}</span>`);
  if (op.ml) flags.push(`<span class="flag mk">${L(`標記光 ×${op.ml}`, `Markerlight ×${op.ml}`)}</span>`);
  if (op.aplNext) flags.push(`<span class="flag ${op.aplNext < 0 ? 'inj' : ''}">${L(`下次啟動 APL ${op.aplNext > 0 ? '+' : ''}${op.aplNext}`, `Next activation APL ${op.aplNext > 0 ? '+' : ''}${op.aplNext}`)}</span>`);
  if (tpl(op).drone) flags.push(`<span class="flag">${L('無人機', 'Drone')}</span>`);
  if (op.order === 'conceal') flags.push(`<span class="flag">◐ ${L('隱蔽', 'Concealed')}</span>`);
  if (g.phase === 'firefight' && !op.ready && g.active !== op.uid) flags.push(`<span class="flag">${L('已行動', 'Expended')}</span>`);
  return `<section class="card datacard" style="--tc:${tm.color}">
    ${extra ? `<div class="cardtop">${extra}</div>` : ''}
    <h3>${nm(op)} <small>${esc(bi(tm.name))}</small></h3>
    <div class="statline">
      <div><span>APL</span><b>${t.apl}</b></div><div><span>MOVE</span><b>${moveStat(g, op)}"</b></div>
      <div><span>SAVE</span><b>${t.save}+</b></div><div><span>WOUNDS</span><b>${op.wounds}/${op.maxW}</b></div>
    </div>
    ${flags.length ? `<div class="flags">${flags.join('')}</div>` : ''}
    <table class="weapons"><tr><th></th><th>ATK</th><th>HIT</th><th>DMG</th></tr>
    ${t.weapons.map((w) => `<tr><td>${w.type === 'ranged' ? '⌖' : '⚔'} ${esc(bi(w.name))}${ruleText(w.rules) ? `<div class="wrules">${esc(ruleText(w.rules))}</div>` : ''}</td>
      <td>${w.atk}</td><td>${w.hit}+</td><td>${w.dmg[0]}/${w.dmg[1]}</td></tr>`).join('')}</table>
    ${abilityList(t)}
  </section>`;
}

// Short descriptions of operative abilities, keyed by the operative flag in teams.js.
const ABILITIES = {
  markerlight: (v) => [`標記光${v > 1 ? '（高強度）' : ''}`, `Markerlight${v > 1 ? ' (high-intensity)' : ''}`, `1AP：可見敵人獲得 ${v} 個標記光標記。`, `1AP: a visible enemy gains ${v} Markerlight token(s).`],
  signal: () => ['信號', 'Signal', '1AP：6" 內可見的另一名友方下次啟動 APL +1。', '1AP: another visible friendly within 6" gets +1 APL next activation.'],
  systemJam: () => ['系統干擾', 'System Jam', '1AP（非隱蔽）：可見敵人下次啟動 APL -1。', '1AP (not Concealed): a visible enemy gets -1 APL next activation.'],
  medikit: () => ['醫療包', 'Medikit', '1AP：控制範圍內受傷的友方（無人機除外）回復 2D3 生命。', '1AP: a wounded friendly (not a drone) in control range regains 2D3 wounds.'],
  medic: () => ['醫療兵！', 'Medic!', '每回合一次：3" 內可見的友方（無人機除外）將失去戰鬥能力時改為剩 1 生命，雙方下次啟動 APL -1。', 'Once per TP: a visible friendly (not a drone) within 3" that would be incapacitated stays on 1 wound; both get -1 APL next activation.'],
  multiVision: () => ['多維視覺', 'Multi-dimensional Vision', '射擊時敵人不能被遮蔽。', 'Enemies cannot be obscured when it shoots.'],
  droneController: () => ['無人機操控員', 'Drone Controller', '在場時友方無人機 Move +2"。', 'While it is in the killzone, friendly drones get +2" Move.'],
  veteran: () => ['老兵', 'Veteran', '使用蒙卡或考陽的回合，兩者效果都適用於它。', "In a TP with Mont'ka or Kauyon, it gets both."],
  drone: () => ['無人機', 'Drone', '控制目標時 APL 視為 -1。', 'Counts as 1 APL lower for objective control.'],
  actionsOnly: (v) => ['動作限制', 'Limited actions', `只能執行：${v.map((a) => ACTIONS[a].name.zh).join('、')}。`, `Only: ${v.map((a) => ACTIONS[a].name.en).join(', ')}.`],
  camoCloak: () => ['迷彩斗篷', 'Camo Cloak', '被射擊時無視飽和，並擁有「隱匿」戰團戰術。', 'Ignores Saturate when shot and has the Stealthy tactic.'],
  optics: () => ['光學瞄準', 'Optics', '1AP：直到下次啟動，射擊時敵人不能被遮蔽。', '1AP: until its next activation, enemies cannot be obscured when it shoots.'],
  doctrineWarfare: () => ['教條戰', 'Doctrine Warfare', '毀滅與戰術教條整場各一次 0CP。', 'Devastator and Tactical doctrines cost 0CP once per battle each.'],
  blessing: () => ['祖父的祝福', "Grandfather's Blessing", '7" 內中毒的敵人失去生命時，回復同等生命（每回合最多 3）。', 'When a poisoned enemy within 7" loses wounds, regains as many (max 3 per TP).'],
  flail: () => ['連枷', 'Flail', '1AP（視為近戰，非隱蔽）：2" 內可見的其他特工（包括己方）各受 D3+2 傷害；敵人 D3 擲出 3 時中毒。', '1AP (counts as Fight, not Concealed): every other operative visible within 2" (friends too) takes D3+2; an enemy rolling a 3 on the D3 is poisoned.'],
  iconBearer: () => ['掌旗手', 'Icon Bearer', '控制目標時 APL 視為 +1。（瘟疫戰士的掌旗手：在敵方領域時「傳染」0CP）', 'Counts as +1 APL for objective control. (Plague Marine Icon Bearer: Contagion costs 0CP while it is in enemy territory.)'],
  ironhorn: () => ['鐵角首領', 'Ironhorn', '隊伍首領。（號令進攻未實作）', 'The leader. (Call the Attack isn\'t modelled.)'],
  warGong: () => ['戰鑼', 'War Gong', '自己沒有狂暴標記時，3" 內的友方受到暴擊傷害可改為普通傷害（對狂暴中的友方，這也不算暴擊傷害）。', 'While it has no Frenzy token, friendlies within 3" can take Normal instead of Critical Dmg (which also doesn\'t count as Critical Dmg for a Frenzied friendly).'],
  gongKnell: () => ['鳴鑼', 'Gong Knell', '1AP：直到下次啟動，被射擊時豁免值改善 1。', '1AP: until its next activation, +1 Save when shot.'],
  whipControl: () => ['鞭子控制', 'Whip Control', '3" 內可見的敵人（它沒有跟其他敵人交戰時）：近戰武器 Atk -1，撤退多花 1AP。', 'An enemy visible within 3" (while it isn\'t engaged with another enemy): -1 Atk on melee weapons, +1AP to Fall Back.'],
  inciteFury: () => ['煽動怒火', 'Incite Fury', '1AP：3" 內可見的另一名友方（薩滿與首領除外）下次啟動 APL +1。', '1AP: another friendly visible within 3" (not the Shaman or Ironhorn) gets +1 APL next activation.'],
  fgShaman: () => ['獸人薩滿', 'Shaman', '暴怒回春（1AP）：6" 內可見、沒有狂暴標記的友方回復 2D3（近戰擊殺過則 6）。黑暗披風（1AP，靈能）：直到下次啟動，它 3" 內可見、隱蔽且在掩體中的友方無法被選為目標。', 'Apoplectic Rejuvenation (1AP): a friendly visible within 6" without a Frenzy token regains 2D3 (6 if it has a melee kill). Mantle of Darkness (1AP, Psychic): until its next activation, Concealed friendlies in cover visible within 3" of it can\'t be targeted.'],
  toxicBlessings: () => ['劇毒祝福', 'Toxic Blessings', '無視 APL 變化，不受震撼影響；受到 3 以上傷害時擲 D6，5+ 減 1。（瘟疫炸彈未實作）', 'Ignores APL changes and Shock; whenever it takes 3+ damage, roll a D6: on a 5+, 1 less. (Pox Bomb isn\'t modelled.)'],
  sweepingBlow: () => ['橫掃重擊', 'Sweeping Blow', '1AP（非隱蔽，有狂暴標記也能用）：2" 內可見的每名其他特工（包括友方）受 D3+1 傷害。', '1AP (not Concealed; usable with a Frenzy token): D3+1 to every other operative visible within 2" (friends too).'],
  leadWithStrength: () => ['以力服眾', 'Lead With Strength', '持有血祭標記、或完全在敵方領域內時，視為受到諸神注視。（血祭聖像未實作）', 'With a Blooded token, or wholly within enemy territory, it counts as under the Gaze of the Gods. (Blooded Icon isn\'t modelled.)'],
  explosiveDemise: () => ['爆炸死亡', 'Explosive Demise', '倒下時擲 2D6（在敵人控制範圍內 1D6），有 4+ 就對 2" 內可見的每名特工造成 D3+2 傷害（還沒丟炸彈則 D6+2）。', 'When incapacitated, roll 2D6 (1D6 if engaged): any 4+ deals D3+2 (D6+2 if the bomb is unused) to each visible operative within 2".'],
  unholySustenance: () => ['邪惡滋養', 'Unholy Sustenance', '近戰或反擊時擊倒對手，回復 D3 生命。', 'Incapacitating the enemy when fighting or retaliating regains D3 wounds.'],
  actuation: () => ['褻瀆啟動', 'Sacrilegious Actuation', '1AP（自己持有血祭標記時）：獲得一個血祭標記。', '1AP (while it has a Blooded token): gain a Blooded token.'],
  stimms: () => ['興奮劑', 'Stimms', '1AP：控制範圍內的友方，受傷時注射「回春」（回復 2D3），否則給「強化」或「狂怒」（整場）。開局給歐格林「強化」。', '1AP: a friendly in control range gets Rejuvenated (2D3 wounds) if hurt, otherwise Fortified or Enraged for the battle. The Ogryn starts Fortified.'],
  wretched: () => ['卑劣者', 'Wretched', '在近戰中倒下時，可先用一顆未結算的成功骰打擊對方。（隱蔽衝鋒依基本規則停用）', 'If incapacitated in a fight, strikes with an unresolved success first. (Charging while Concealed is disabled by the basic rules.)'],
  camo1: () => ['迷彩斗篷', 'Camo Cloak', '被射擊時若能保留掩護豁免，多保留 1 顆。（以血之名未實作）', 'When shot with cover saves, retains one more. (A Name Whispered in Blood isn\'t modelled.)'],
  tough: () => ['堅韌', 'Tough', '近戰、反擊或被射擊時，3 以上的普通傷害 -1。', 'When fighting, retaliating or shot, Normal Dmg of 3+ deals 1 less.'],
  shielding: () => ['舉盾', 'Shielding', '0AP（啟動時）：直到下次啟動 Move -2"，被射擊時可重擲任意防禦骰。', '0AP (when activated): until its next activation, -2" Move and re-roll any defence dice when shot.'],
  disciplinarian: () => ['嚴酷的紀律官', 'Gruelling Disciplinarian', '6" 內的友方無視受傷造成的數值變化。（強制命令未實作）', 'Friendlies within 6" ignore stat changes from being injured. (Enforce isn\'t modelled.)'],
  chemEnhanced: () => ['化學強化', 'Chem-enhanced', '無視 APL 變化，不受震撼與昏迷影響。', 'Ignores APL changes and isn\'t affected by Shock or Stun.'],
  brute: () => ['蠻牛', 'Brute', '隱蔽時，敵人選目標不能用輕型地形擋它（仍保留掩護豁免）。', 'While Concealed, enemies can\'t use Light terrain as cover for it when picking targets (it keeps the cover save).'],
  slowWitted: () => ['遲鈍', 'Slow-witted', '撿標記與任務動作多花 1AP。', '+1AP for Pick Up and mission actions.'],
  avalanche: () => ['肌肉雪崩', 'Avalanche of Muscle', '衝鋒結束時，對控制範圍內一名敵人造成 D3 傷害。', 'After a Charge, D3 damage to one enemy in its control range.'],
  cultAgent: () => ['教派特工', 'Cult Agent', '被射擊時無視「穿甲」與「飽和」；能保留掩護豁免時多保留 1 顆，或把 1 顆當暴擊。', 'When shot, ignores Piercing and Saturate; with cover saves, retains one more or one as a critical.'],
  twoShoots: () => ['神槍手', 'Expert Gunslinger', '每次啟動可執行兩次射擊。', 'Can perform two Shoot actions per activation.'],
  heroic: () => ['英雄的鼓舞', 'Heroic Inspiration', '本回合擊倒過敵人後，3" 內可見的友方新信徒武器「嚴厲」。', 'Once it has incapacitated an enemy this TP, friendly Neophytes visible within 3" of it have Severe.'],
  twoFights: () => ['劍術大師', 'Expert Swordsman', '每次啟動可執行兩次近戰。（之後的 3" 免費衝鋒、閃電突擊、刃之架勢未實作）', 'Can perform two Fight actions per activation. (The free 3" Charge, Quicksilver Strike and Bladed Stance aren\'t modelled.)'],
  bipod: () => ['重武器腳架', 'Heavy Weapon Bipod', '本次啟動沒移動（或反擊時）射擊：武器「無休」，已有無休則改為「無情」。', 'Shooting without having moved this activation (or when counteracting): Ceaseless, or Relentless if it already has it.'],
  miasma: () => ['毒瘴', 'Poisonous Miasma', '1AP（靈能）：7" 內可見的敵人中毒；已中毒則受到 3 傷害。', '1AP (Psychic): an enemy visible within 7" is poisoned, or takes 3 damage if it already was.'],
  krumpin: () => ["揍人時間", "Krumpin' Time", '每次啟動可執行兩次近戰。', 'Can perform two Fight actions per activation.'],
  support: (v) => (v === 'getItDun'
    ? ['快去做！', 'Get It Dun!', '1AP（支援，不能在反擊時）：6" 內可見的另一名友方下次啟動 APL +1。', '1AP (Support, not while counteracting): another visible friendly within 6" gets +1 APL next activation.']
    : v === 'wayfind' ? ['尋路', 'Wayfind', '1AP（支援）：它或偵察車 6" 內可見的另一名友方（機械除外）下次啟動 APL +1。', '1AP (Support): another friendly (not a machine) visible within 6" of it or of the C.A.T. unit gets +1 APL next activation.']
    : v === 'spot' ? ['觀測', 'Spot', '1AP（支援）：選一名可見的敵人；本回合觀測手 3" 內的友方射擊它時「搜尋（輕型）」，且它不會被遮擋。', '1AP (Support): pick a visible enemy; this TP, friendlies within 3" of the Spotter shooting it have Seek Light and it can\'t be obscured.']
    : [v === 'eyeAbove' ? '天上之眼' : '聽好了', v === 'eyeAbove' ? 'From the Eye Above' : 'Listen In', '1AP（支援）：6" 內可見的另一名友方下次啟動 APL +1。', '1AP (Support): another visible friendly within 6" gets +1 APL next activation.']),
  dakkaDash: () => ['達卡衝刺', 'Dakka Dash', '1AP（非隱蔽）：免費衝刺一次並用達卡槍免費射擊一次，順序不限。', '1AP (not Concealed): a free Dash and a free dakka shoota Shoot, in either order.'],
  datAllYouGot: () => ['就這樣？', 'Dat All You Got?', '近戰或反擊後若還站著，對方受到 D3 傷害。', 'After fighting or retaliating, if still standing, the enemy takes D3 damage.'],
  wotNotz: () => ['戰術小玩意', 'Taktical Wot-notz', '每回合一次，一名小子可丟震撼手雷：6" 內可見的敵人及其 1" 內的特工擲 D6，3+ 下次啟動 APL -1。', 'Once per TP, one Boy can throw a Stun Grenade: an enemy visible within 6" and every operative within 1" of it roll a D6 — on a 3+, -1 APL next activation.'],
  callTheKill: () => ['呼喚獵殺／勝利尖嘯', 'Call the Kill / Victory Shriek', '策略階段標記一名敵人，對它攻擊時武器獲得「平衡」；標記倒下時，6" 內一名友方之後都獲得「平衡」（每名一次）。', 'Mark an enemy in the Strategy phase: Balanced against it. When it falls, a friendly within 6" has Balanced for the rest of the battle (once each).'],
  energise: () => ['充能', 'Energise', '1AP：加速弓獲得「致命 5+」，直到本回合結束或用弓射擊後。', '1AP: the accelerator bow has Lethal 5+ until the end of the TP or until it shoots.'],
  coldBlooded: () => ['冷血', 'Cold-blooded', '攻擊受過傷的敵人時「致命 5+」；對方已受傷（生命低於一半）時再加「撕裂」。', 'Lethal 5+ against a wounded enemy; also Rending if it is injured.'],
  hardyCrit: () => ['強韌', 'Hardy', '受到暴擊時只承受普通傷害（若較低）。', 'Critical hits on it inflict Normal Dmg instead (if lower).'],
  viciousDuellist: () => ['兇猛決鬥者', 'Vicious Duellist', '近戰或反擊時，對方每顆失敗的攻擊骰造成 1 傷害。', 'When fighting or retaliating, each enemy attack die that fails deals 1 damage to that enemy.'],
  savageAssault: () => ['野蠻突擊', 'Savage Assault', '每次啟動第一次近戰後若雙方都還站著，可對同一敵人免費再近戰一次。', 'After its first Fight each activation, if both still stand, a free Fight against the same enemy.'],
  badTempered: () => ['脾氣暴躁', 'Bad-tempered', '敵人近戰時若能選牠，就必須改打牠。', 'An enemy fighting while it is a valid choice must fight it instead.'],
  longSight: () => ['遠視', 'Long-sight', '1AP：直到下次啟動，獵槍（隱蔽／定點）「致命 5+」，射擊時敵人不能被遮蔽。', '1AP: until its next activation, the hunting rifle (concealed/stationary) has Lethal 5+ and enemies cannot be obscured.'],
  concealCharge: () => ['潛獵者', 'Stalker', '（隱蔽衝鋒的例外已依基本規則停用；「潛行突襲」仍可使用。）', '(The Conceal-Charge exception is disabled by the basic rules; Stealth Attack still works.)'],
  stealthAttack: () => ['潛行突襲', 'Stealth Attack', '2AP（隱蔽、地形 1" 內）：免費衝鋒（不超過 Move）後免費近戰，第一次打擊後立刻再打擊一次。', '2AP (Concealed, within 1" of terrain): a free Charge (up to its Move) then a free Fight; its first strike is followed by another.'],
  pechra: () => ['標記獵物', 'Marked for the Hunt', '1AP：把鳥標放在可見敵人旁；友方射擊其 1" 內的敵人時獲得「搜尋（輕型）」，直到追蹤者下次啟動。', '1AP: place the Pech\'ra marker by a visible enemy; friendly shooting at enemies within 1" of it has Seek Light until the Tracker\'s next activation.'],
  sorcerer: () => ['巫師', 'Sorcerer', '靈能使用者；9" 內的符文戰士不受巫術自動機影響。', 'A psyker; Rubric Marines within 9" of it aren\'t slowed by Sorcerous Automata.'],
  destiny: () => ['命運之術', 'Destiny', '恩賜：命運扭轉（靈能遠程武器暴擊穿甲 1）。命運庇護（1AP）：可見友方被射擊時可重擲任意防禦骰。摧毀命運（1AP）：9" 內可見的敵人攻擊時必須重擲 6，控制目標時 APL -1。效果到它下次啟動。', 'Boon: Twist of Fate (Psychic ranged Piercing Crits 1). Protected by Fate (1AP): a visible friendly re-rolls any defence dice when shot. Ravage Destiny (1AP): a visible enemy within 9" must re-roll attack 6s and counts 1 lower for control. Until its next activation.'],
  alight: () => ['點燃', 'Alight', '1AP（靈能）：可見的敵人被點燃，友方攻擊它時武器「無休」，直到它下次啟動。', '1AP (Psychic): a visible enemy is set alight — friendly weapons have Ceaseless against it until its next activation.'],
  incorporealSight: () => ['虛體視覺（恩賜）', 'Incorporeal Sight (Boon)', '遠程武器「飽和」；射擊時敵人不會被遮擋。', 'Ranged weapons have Saturate; enemies can\'t be obscured when it shoots.'],
  automata: () => ['巫術自動機', 'Sorcerous Automata', '啟動時若 9" 內沒有友方巫師，本次啟動 APL -1。', 'When activated, -1 APL that activation unless a friendly Sorcerer is within 9".'],
  slowPurposeful: () => ['緩慢而堅定', 'Slow and Purposeful', '本次啟動沒有衝鋒或轉移（或反擊時）射擊，遠程武器「無休」。', 'Shooting without having Charged or Repositioned this activation (or when counteracting): Ceaseless.'],
  savageBrutality: () => ['野蠻暴行', 'Savage Brutality', '每次啟動第一次近戰後，若還站著可再免費近戰一次（可換對象）。', 'After its first Fight each activation, if still standing, a free Fight (any enemy).'],
  notAstartes: () => ['奸奇獸人', 'Tzaangor', '不適用阿斯塔特規則。', 'The Astartes rule doesn\'t apply to it.'],
  infiltrator: () => ['滲透者', 'Infiltrator', '全頻擾亂器：看得到的敵人可被選為擾亂目標；滲透者人數決定對手要先啟動幾名。', 'Omni-scrambler: enemies it can see can be scrambled; the number of Infiltrators sets how many the opponent must activate first.'],
  oversight: () => ['戰略監督', 'Strategic Oversight', '每回合獲得 CP 時，若不在敵人控制範圍內擲 D6，4+ 多 1CP。（通訊陣列未實作）', 'When you gain CP each TP, if it isn\'t engaged, roll a D6: on a 4+, +1CP. (Comms Array isn\'t modelled.)'],
  medicD3: () => ['醫療兵！（D3）', 'Medic! (D3)', '救下的友方剩 D3 生命（而非 1）。', 'The saved friendly is left on D3 wounds (instead of 1).'],
  helix: () => ['螺旋手套', 'Helix Gauntlet', '1AP：控制範圍內的友方回復 D3+3 生命。', '1AP: a friendly in control range regains D3+3 wounds.'],
  voxbreak: () => ['干擾通訊', 'Voxbreak', '6" 內的敵人不能重擲攻擊骰與防禦骰。', 'Enemies within 6" can\'t re-roll attack or defence dice.'],
  auspex: () => ['鳥卜儀掃描', 'Auspex Scan', '1AP：直到下次啟動，友方射擊它 8" 內的敵人時目標不會被遮擋；突襲者再加「搜尋（輕型）」。', '1AP: until its next activation, enemies within 8" of it can\'t be obscured when friendlies shoot them; Incursors also have Seek Light.'],
  incursor: () => ['多光譜陣列', 'Multi-spectrum Array', '射擊時敵人不會被遮擋。（追蹤目標未實作）', 'Enemies can\'t be obscured when it shoots. (Track Target isn\'t modelled.)'],
  terror: () => ['恐懼', 'Terror', '3" 內的敵人撿標記與任務動作多花 1AP；爭奪標記時該方 APL -1。', 'Enemies within 3" pay +1AP for Pick Up and mission actions and count 1 lower when contesting markers.'],
  vanguard: () => ['先鋒', 'Vanguard', '每回合一次，撿標記或任務動作少 1AP。', 'Once per TP, Pick Up or a mission action costs 1 less AP.'],
  commandBreach: () => ['突破指揮', 'Command Breach', '在場時攻擊命令／防禦命令 0CP。（啟動時移動或切換標記未實作）', 'While it is in the killzone, Attack / Defence Order cost 0CP. (Moving or switching the marker during its activation isn\'t modelled.)'],
  emboldened: () => ['奮勇', 'Emboldened', '本回合衝鋒過時，每顆攻擊骰造成 3 以上傷害時擲 D6，5+ 傷害 -1。', 'In a turning point it Charged, whenever an attack die inflicts 3+ damage on it, roll a D6: on a 5+, 1 less.'],
  disengage: () => ['脫離', 'Disengage', '撤退少花 1AP。', 'Fall Back costs 1 less AP.'],
  voidGrenadier: () => ['擲彈兵', 'Grenadier', '破片／穿甲手雷命中 3+；虛空裝甲對爆炸／洪流可重擲兩顆防禦骰。', 'Frag/krak grenades hit on 3+; Void Armour re-rolls two defence dice against Blast/Torrent.'],
  surveyor: () => ['勘測員', 'Surveyor', '操控 C.A.T. 偵察車：它倒下後偵察車不能再啟動。（遙控動作未實作）', 'Operates the C.A.T. unit, which can\'t activate once it falls. (Remote Control isn\'t modelled.)'],
  catUnit: () => ['機械（偵察車）', 'Machine (C.A.T.)', '只能衝鋒、衝刺、撤退、轉移、觀測；不能反擊；敵人控制範圍內或勘測員倒下後不能啟動；觀測對全隊有效；控制目標時 APL -1；不計入擊殺任務。', 'Only Charge, Dash, Fall Back, Reposition and Spot; can\'t retaliate; can\'t activate in enemy control range or once the Surveyor falls; its Spot helps the whole team; -1 APL for control; ignored for the kill op.'],
  gheistskull: () => ['機械（鬼骷髏）', 'Machine (Gheistskull)', '只能加速、衝鋒、衝刺、撤退、轉移；不能反擊；控制目標時 APL -1；不計入擊殺任務。虛空干擾員可引爆它。', 'Only Boost, Charge, Dash, Fall Back and Reposition; can\'t retaliate; -1 APL for control; ignored for the kill op. The Void-jammer can detonate it.'],
  boost: () => ['加速', 'Boost', '1AP（整場一次，第 1 回合除外）：這次啟動的下一次衝鋒多移動 4"。', '1AP (once per battle, not TP1): its next Charge this activation moves +4".'],
  pulse: () => ['干擾脈衝', 'Interference Pulse', '1AP：鬼骷髏 8" 內可見的敵人擲 D6（是鬼骷髏的有效目標 +1），3+ 下次啟動 APL -1。', '1AP: an enemy visible within 8" of the Gheistskull rolls a D6 (+1 if a valid target for it): 3+ = -1 APL next activation.'],
  eyeOfAncestors: () => ['先祖之眼', 'Eye of the Ancestors', '策略階段給一名敵人宿怨標記（友方倒下 3 人以上時 2 名）。', 'Strategy phase: an enemy gains a Grudge token (two enemies once three friendlies are down).'],
  weavefield: () => ['編織力場紋章', 'Weavefield Crest', '整場一次，無視一顆攻擊骰的普通傷害（自動用在第一次）。', 'Once per battle, ignore one attack die\'s Normal Dmg (used automatically the first time).'],
  brawler: () => ['鬥毆者', 'Brawler', '近戰或反擊時：敵人不能有友軍協助；4 以上的普通傷害 -1；倒下時可先用一顆未結算的成功骰打對方。', 'Fighting or retaliating: enemies can\'t be assisted; Normal Dmg of 4+ deals 1 less; if incapacitated, strikes with an unresolved success first.'],
  knux: () => ['指虎重擊', 'Knux Smash', '1AP：控制範圍內的敵人受 D3+1 傷害；D3 擲出 3 時對方下次啟動 APL -1。（推開 3" 與免費衝鋒未實作）', '1AP: an enemy in control range takes D3+1; on a 3, -1 APL next activation. (The 3" push and free Charge aren\'t modelled.)'],
  jumpPack: () => ['噴射背包', 'Jump Pack', '移動時可飛越地形與特工，只看落點。', 'Moves fly over terrain and operatives; only where it lands matters.'],
  signalAny: () => ['信號', 'Signal', '1AP（支援）：場上任一名其他友方下次啟動 APL +1。', '1AP (Support): any other friendly gets +1 APL next activation.'],
  jamToken: () => ['系統干擾', 'System Jam', '1AP：一名有效目標的敵人得到干擾標記，要等其他沒有標記的敵人都行動完才能啟動。', '1AP: an enemy valid target gains a token — it can\'t activate until every enemy without one is expended.'],
  tactician: () => ['戰術家', 'Tactician', '策略階段放置攻擊標記（3" 內的敵人：平衡）或防禦標記（3" 內的友方：被射擊重擲一顆防禦骰）。', 'Strategy phase: an Attack marker (Balanced against enemies within 3") or a Defence marker (friendlies within 3" re-roll one defence die).'],
  panScan: () => ['全光譜掃描', 'Pan Spectral Scan', '1AP：在可見敵人處放標記，射擊它 3" 內的敵人時「精準 1」＋「飽和」，直到它下次啟動。', '1AP: a marker by a visible enemy — shooting enemies within 3" of it: Accurate 1 + Saturate, until its next activation.'],
  wellSupplied: () => ['補給充足', 'Well Supplied', '第 1 回合多得 1CP。', '+1CP in the first turning point.'],
  gotIt: () => ['交給我', 'I\'ve Got It', '每次啟動一次，任務動作少 1AP。', 'Once per activation, a mission action costs 1 less AP.'],
  watchmaster: () => ['看守長', 'Watchmaster', '策略階段下達衛兵命令（6" 內友方），並可「集火摧毀！」：選一名敵人，本回合攻擊它時武器獲得「懲罰」。', 'Issues Guardsman Orders (friendlies within 6") in the Strategy phase, and Bring it Down!: pick an enemy — Punishing against it this TP.'],
  confidant: () => ['心腹', 'Confidant', '副指揮官：看守長倒下後改由它下達衛兵命令。指令：啟動時選定 6" 內可見的準備中友方，行動完後可接著啟動其中一名（用過副指揮官後不能再用）。', 'Second in Command: issues Guardsman Orders once the Watchmaster falls. Directive: friendlies visible within 6" and ready when it activates — one may activate right after it (not after Second in Command is used).'],
  bruiser: () => ['打手', 'Bruiser', '每回合一次，近戰或反擊時無視一次普通成功的傷害；在近戰中倒下時，可先用一顆未結算的成功骰打擊對方。', 'Once per TP when fighting or retaliating, ignores the damage of one normal success; if incapacitated in a fight, strikes with one unresolved success first.'],
  groupAct: () => ['群體啟動', 'Group Activation', '行動完後必須接著啟動另一名準備中的同類特工，再換對手（最多連續兩名）。', 'When expended, another ready operative of the same kind must activate before the opponent (two in a row at most).'],
  hulk: () => ['夢魘巨怪', 'Nightmare Hulk', '敵人選目標時不能用輕型地形擋它（仍保留掩護豁免）；撿標記與任務動作多花 1AP（伏爾格拉除外）。', 'Enemies can\'t use Light terrain as cover for it when picking targets (it keeps the cover save); +1AP for Pick Up and mission actions (not Vulgrar).'],
  resilient: () => ['令人作嘔的韌性', 'Revoltingly Resilient', '每顆攻擊骰造成 3 以上傷害時擲 D6，4+ 傷害 -1。', 'Whenever an attack die inflicts 3+ damage on it, roll a D6: on a 4+, 1 less.'],
  tentacledGrasp: () => ['觸手擒抱', 'Tentacled Grasp', '控制範圍內的敵人撤退時擲 D6（敵人 Wounds 8 以下 +1），4+ 撤退失敗（AP 照扣）。', 'An enemy falling back from its control range rolls a D6 (+1 if its Wounds stat is 8 or less): on a 4+ it can\'t (the AP is spent).'],
  shrieking: () => ['恐怖尖嘯', 'Horrifying Shrieking', '3" 內的敵人撿標記與任務動作多花 1AP；爭奪標記時，若有敵人在它 3" 內，該方總 APL 視為 -1。', 'Enemies within 3" pay +1AP for Pick Up and mission actions; when contesting a marker, the enemy total APL counts 1 lower if any of them is within 3" of it.'],
  spikedCharger: () => ['尖刺衝撞', 'Spiked Charger', '衝鋒結束時，控制範圍內每個敵人各受 D3 傷害。', 'After a Charge, each enemy in its control range takes D3 damage.'],
  daemonic: () => ['惡魔', 'Daemonic', '被射擊時無視穿甲。', 'Ignores Piercing when shot.'],
  small: () => ['小型', 'Small', '隱蔽且在掩體中時不能被選為目標（2" 內除外），任何規則都無法改變。', 'Concealed in cover, it can\'t be targeted (except within 2"), whatever else applies.'],
  relay: () => ['轉達命令', 'Relay Orders', '每回合一次，收到衛兵命令且不在敵人控制範圍時，可轉達給全隊，之後自己 APL -1。', 'Once per TP, when it receives a Guardsman Order and isn\'t engaged, relays it to the whole team, then -1 APL.'],
  emperorProtects: () => ['帝皇庇佑', 'The Emperor Protects', '被射擊時可重擲任意防禦骰（自動重擲失敗的）。', 'When shot, re-roll any defence dice (failed ones are re-rolled automatically).'],
  uplifting: () => ['振奮祈禱書', 'Uplifting Primer', '3" 內的友方武器獲得「嚴厲」。', 'Friendlies within 3" have Severe.'],
  vitality: () => ['腐敗活力', 'Putrescent Vitality', '1AP（靈能，每回合一次）：3" 內可見的友方擲 2D6，7 回復 7，否則回復較高的骰。', '1AP (Psychic, once per TP): a friendly visible within 3" rolls 2D6 — 7 regains 7, otherwise the highest die.'],
};

function abilityList(t) {
  const items = Object.keys(ABILITIES).filter((k) => t[k]).map((k) => {
    const [zh, en, dzh, den] = ABILITIES[k](t[k]);
    return `<li><b>${L(zh, en)}</b>：${L(dzh, den)}</li>`;
  });
  return items.length ? `<ul class="abilities">${items.join('')}</ul>` : '';
}

function logView() {
  const items = g.log.slice(-40).reverse();
  return `<section class="card log"><h3>${L('戰鬥紀錄', 'Battle Log')}</h3>
    <ol>${items.map((e) => `<li class="${e.cls}">${esc(tx(e.msg))}</li>`).join('')}</ol></section>`;
}

// ---------- modals ----------
function renderModal() {
  if (ui.help) {
    modalRoot.innerHTML = `<div class="modal"><div class="dialog help">${HELP[lang()]}
      <button class="primary wide" data-act="closehelp">${L('關閉', 'Close')}</button></div></div>`;
    return;
  }
  if (ui.flow?.step) { modalRoot.innerHTML = `<div class="modal"><div class="dialog">${flowView()}</div></div>`; return; }
  if (ui.result) { modalRoot.innerHTML = `<div class="modal"><div class="dialog">${resultView(ui.result)}</div></div>`; return; }
  if (ui.screen === 'game' && g?.fight) { modalRoot.innerHTML = `<div class="modal"><div class="dialog">${fightView()}</div></div>`; return; }
  modalRoot.innerHTML = '';
}

function fightView(readonly = false) {
  const f = g.fight;
  const ops = { A: fightOp(g, 'A'), D: fightOp(g, 'D') };
  const col = (k) => team(g, ops[k].side).color;
  const who = (k) => `<b style="color:${col(k)}">${nm(ops[k])}</b>`;
  const pool = (k) => {
    const p = f[k];
    const chips = '<span class="die crit small">★</span>'.repeat(p.c) + '<span class="die norm small">✓</span>'.repeat(p.n);
    return `<div class="fside ${!f.done && f.turn === k ? 'now' : ''}" style="--tc:${col(k)}">
      <div class="fhead">${who(k)} <small>${esc(bi(fightWeapon(g, k).name))} · ${f[k].hit}+${p.assist ? L('（友軍協助 +1）', ' (assisted +1)') : ''} · ${fightWeapon(g, k).dmg.join('/')}${p.brutal ? ` · ${bi(RULE_LABELS.brutal)}` : ''}</small></div>
      <div class="dicerow ${f.steps.length ? 'still' : ''}"><label>${k === 'A' ? L('攻方擲骰', 'Attacker roll') : L('守方擲骰', 'Defender roll')}</label>${p.dice.map((d, i) => (!readonly && f.rrOpen?.[k] && !d.auto && canCommandReroll(g, ops[k].side, p, 'a')
        ? `<button class="diebtn" data-act="fightrr" data-k="${k}" data-i="${i}" title="${L('指揮重擲這顆骰（1CP）', 'Command Re-roll this die (1CP)')}">${die(d, i)}</button>` : die(d, i))).join('')}</div>
      <div class="remain">${L('剩餘成功骰', 'Unresolved')}：${chips || '—'}</div>
      <div class="wounds">${L('生命', 'Wounds')} ${ops[k].wounds}/${ops[k].maxW}${ops[k].dead ? ' ☠' : ''}</div>
    </div>`;
  };
  const stepTxt = (s) => {
    if (s.act === 'strike') {
      const extra = [];
      if (s.resil) extra.push(L(`韌性擲 ${s.resil.roll}${s.resil.saved ? '，-1' : ''}`, `Resilient rolled ${s.resil.roll}${s.resil.saved ? ', -1' : ''}`));
      if (s.again) extra.push(L('潛行突襲：立刻再打擊一次', 'Stealth Attack: strikes again'));
      if (s.shrug) extra.push(L('無視這次普通傷害（打手／編織力場紋章）', 'Shrugged off this normal hit (Bruiser / Weavefield Crest)'));
      if (s.lastBlow) extra.push(L('倒下前的最後一擊', 'A last blow before falling'));
      if (s.shocked) extra.push(L(`震撼：移除對方一個${s.shocked === 'c' ? '暴擊' : '普通'}`, `Shock: discards an enemy ${s.shocked === 'c' ? 'crit' : 'normal'}`));
      return `<li>${who(s.side)} ${L('打擊', 'strikes')}${s.crit ? L('（暴擊）', ' (crit)') : ''} → ${s.dmg} ${L('傷害', 'dmg')}${s.killed ? ' ☠' : ''}${extra.length ? ` <small>(${extra.join(' · ')})</small>` : ''}</li>`;
    }
    if (s.act === 'decline') return `<li>${who(s.side)} ${L('放棄一顆成功（不攻擊）', 'holds back a success (no strike)')}</li>`;
    return `<li>${who(s.side)} ${L('格擋', 'parries')}${s.crit ? L('（用暴擊）', ' (with a crit)') : ''} ${s.blocked ? L('對方一個暴擊', 'an enemy crit') : L('對方一個普通', 'an enemy normal')}</li>`;
  };
  let action;
  if (readonly) {
    action = '';
  } else if (f.rrOpen) {
    const names = ['A', 'D'].filter((k) => f.rrOpen[k]).map((k) => `<b style="color:${col(k)}">${nm(ops[k])}</b>（${g.cp[ops[k].side]}CP）`).join('、');
    action = `<p class="hint">${L(`指揮重擲：${names} 可花 1CP 重擲自己的一顆骰（點該骰子，每方一次）。`, `Command Re-roll: ${names} may spend 1CP to re-roll one of their own dice (tap it, once per side).`)}</p>
      <button class="primary wide" data-act="fightrrdone">${L('開始結算 ▶', 'Start resolving ▶')}</button>`;
  } else if (f.done) {
    action = `<button class="primary wide" data-act="fightdone">${L('繼續', 'Continue')}</button>`;
  } else if (isAI(fightChooser(g))) {
    action = `<p class="hint">${L('電腦選擇中…', 'Computer is choosing…')}</p>`;
  } else {
    const label = (o) => {
      if (o.act === 'strike') return o.die === 'c' ? L(`打擊（暴擊）→ ${o.dmg} 傷害`, `Strike (crit) → ${o.dmg} dmg`) : L(`打擊（普通）→ ${o.dmg} 傷害`, `Strike (normal) → ${o.dmg} dmg`);
      if (o.act === 'decline') return L(`放棄：不使用這顆${o.die === 'c' ? '暴擊' : '普通'}成功`, `Hold back: discard a ${o.die === 'c' ? 'crit' : 'normal'} success`);
      if (o.id === 'parry-c-c') return L('格擋：用暴擊擋掉對方一個暴擊', 'Parry: crit cancels an enemy crit');
      if (o.id === 'parry-c-n') return L('格擋：用暴擊擋掉對方一個普通', 'Parry: crit cancels an enemy normal');
      if (o.id === 'parry-n-c') return L('格擋（決鬥者）：用普通擋掉對方一個暴擊', 'Parry (Dueller): normal cancels an enemy crit');
      return L('格擋：用普通擋掉對方一個普通', 'Parry: normal cancels an enemy normal');
    };
    action = `<p>${L('輪到', 'Your choice,')} ${who(f.turn)} ${L('選擇：', '')}</p>
      <div class="fopts">${fightOptions(g).map((o) => `<button class="${o.act === 'strike' ? 'primary' : o.act === 'decline' ? 'ghost' : ''}" data-act="fightopt" data-id="${o.id}">${label(o)}</button>`).join('')}</div>`;
  }
  return `<h2>⚔ ${L('近戰', 'Fight')}</h2>
    <div class="fsides">${pool('A')}${pool('D')}</div>
    <ol class="steps">${f.steps.map(stepTxt).join('') || (f.done ? `<li>${L('雙方都沒有成功骰', 'No successes on either side')}</li>` : '')}${f.datAllYouGot ? `<li>${who(f.datAllYouGot.side)} ${L(`「就這樣？」→ ${f.datAllYouGot.dmg} 傷害`, `"Dat All You Got?" → ${f.datAllYouGot.dmg} dmg`)}</li>` : ''}${f.duellist ? `<li>${who(f.duellist.side)} ${L(`兇猛決鬥者 → ${f.duellist.dmg} 傷害`, `Vicious Duellist → ${f.duellist.dmg} dmg`)}</li>` : ''}${f.savageNext ? `<li>${who('A')} ${L('野蠻突擊：可再免費近戰一次', 'Savage Assault: may fight again for free')}</li>` : ''}${(f.rust || []).map((k) => `<li>${who(k)} ${L('尖嘯鏽刺：有攻擊骰失敗，受到 1 傷害', 'Screaming Rustspikes: failed attack dice, takes 1 damage')}</li>`).join('')}${f.swipeNext ? `<li>${who('A')} ${L('橫掃：可對控制範圍內其他敵人各免費近戰一次', 'Swipe: may fight each other enemy in control range for free')}</li>` : ''}</ol>
    ${action}`;
}

const DIE_NOTES = { gaze: ['諸神注視：當成暴擊', 'Gaze of the Gods: retained as a crit'], grudge: ['宿怨：當成暴擊', 'Grudge: retained as a crit'], obsc: ['遮擋：暴擊變普通', 'Obscured: crit became normal'], obscDrop: ['遮擋：扣除', 'Obscured: discarded'], rr: ['重擲', 'Re-rolled'], rend: ['撕裂', 'Rending'], sev: ['嚴厲', 'Severe'], indo: ['帝國征程', 'Indomitus'], auto: ['精準', 'Accurate'], pun: ['懲罰', 'Punishing'] };
const die = (d, i = 0) => {
  const marks = Object.keys(DIE_NOTES).filter((k) => d[k]);
  const cls = marks.map((k) => (k === 'rr' ? 'rr' : k === 'obscDrop' ? 'dropped' : 'rend')).join(' ');
  return `<span class="die ${d.res} ${cls}" style="--i:${i}" title="${marks.map((k) => L(...DIE_NOTES[k])).join(', ')}">${d.v}</span>`;
};

function resultView(r, readonly = false) {
  const a = getOp(g, r.attacker), t = getOp(g, r.target);
  const ca = team(g, a.side).color, ct = team(g, t.side).color;
  if (r.kind === 'shoot') {
    // Dice are revealed one at a time: attack row, then defence row, then the outcome (the whole dialog
    // is a timeline; each secondary target follows the previous one).
    let t0 = 0.3;
    const main = shotView(r, t, t0); t0 = main.end;
    const extra = (r.extra || []).map((s) => {
      const st = getOp(g, s.target);
      const v = shotView(s, st, t0 + 0.3); t0 = v.end;
      return `<h3 class="sub reveal" style="--base:${t0 - 0.2}s">${L('次要目標', 'Secondary target')}：<b style="color:${team(g, st.side).color}">${nm(st)}</b></h3>${v.html}`;
    }).join('');
    const ml = r.weapon.rules.noMarkerlight ? 0 : t.ml || 0;
    const pre = [];
    if (ml && team(g, a.side).markerlights) pre.push(L(`標記光 ×${ml}`, `Markerlight ×${ml}`));
    if (r.suppressed) pre.push(L('壓制射擊：不能重擲攻擊骰', 'Suppressing Fire: no attack re-rolls'));
    const hot = r.hot ? `<p class="hint small ${r.hot.dmg ? 'bad' : ''}">${L(`過熱：擲 ${r.hot.roll}`, `Hot: rolled ${r.hot.roll}`)} → ${r.hot.dmg ? L(`自身受到 ${r.hot.dmg} 傷害${r.hot.killed ? ' ☠' : ''}`, `takes ${r.hot.dmg} damage${r.hot.killed ? ' ☠' : ''}`) : L('沒事', 'no damage')}</p>` : '';
    return `<div class="${readonly ? 'noanim' : ''}"><h2>⌖ ${L('射擊', 'Shooting')}</h2>
      <p><b style="color:${ca}">${nm(a)}</b> → <b style="color:${ct}">${nm(t)}</b> · ${esc(bi(r.weapon.name))}${r.ap > 1 ? ` · ${r.ap}AP` : ''}</p>
      ${pre.length ? `<p class="hint small">${pre.join(' · ')}</p>` : ''}
      ${main.html}${extra}${hot}
      ${readonly ? '' : `<button class="primary wide reveal" style="--base:${t0 + 0.2}s" data-act="closeresult">${L('繼續', 'Continue')}</button>`}</div>`;
  }
  return '';
}

/** Dice and outcome of one shooting sequence (primary or a Torrent/Blast secondary target). */
function shotView(s, t, t0 = 0) {
  const crit = s.coverCrit || 0, norm = s.coverSaves - crit;
  // Timeline (seconds): attack dice, a pause, defence dice, a pause, the outcome.
  const STEP = 0.3, nA = s.attack.dice.length, chips = crit + norm, nD = s.defence.dice.length + chips;
  const tD = t0 + nA * STEP + 0.7, tO = tD + nD * STEP + 0.7, end = tO + 0.9;
  const notes = [];
  if (s.obscured) notes.push(L('遮擋：暴擊全部變普通，並扣除 1 顆成功', 'Obscured: crits become normal and one success is discarded'));
  if (s.coverOrObscured) notes.push(L(`同時有掩體與遮擋，擇一：使用${s.obscured ? '遮擋' : '掩體'}`, `Cover and obscured — one only: ${s.obscured ? 'obscured' : 'cover'} used`));
  if (s.coverSaves) notes.push(L(`掩護：保留 ${s.coverSaves} 顆豁免${crit ? `（${crit} 顆暴擊）` : ''}`, `Cover: ${s.coverSaves} save retained${crit ? ` (${crit} critical)` : ''}`));
  else if (s.saturated) notes.push(L('飽和：無法保留掩護豁免', 'Saturate: no cover saves'));
  if (s.pierce) notes.push(L(`穿甲：少擲 ${s.pierce} 顆`, `Piercing: ${s.pierce} fewer dice`));
  if (s.dev) notes.push(L(`毀滅：額外 ${s.dev} 傷害`, `Devastating: ${s.dev} extra damage`));
  if (s.tox) notes.push(L('劇毒：傷害 +1', 'Toxic: +1 damage'));
  if (s.skulk) notes.push(L('鬼祟潛行：多保留 1 顆防禦骰', 'Skulk About: one extra defence die retained'));
  if (s.resilient?.length) {
    const saved = s.resilient.filter((x) => x.saved).length;
    notes.push(L(`令人作嘔的韌性：擲 ${s.resilient.map((x) => x.roll).join('、')}，減免 ${saved} 傷害`, `Disgustingly Resilient: rolled ${s.resilient.map((x) => x.roll).join(', ')}, ${saved} damage prevented`));
  }
  if (s.poisoned) notes.push(L('目標中毒', 'Target poisoned'));
  if (s.stunned) notes.push(L('昏迷：目標下次啟動 APL -1', 'Stun: -1 APL next activation'));
  const rt = ruleText(Object.fromEntries(Object.entries(s.rules).filter(([k]) => k !== 'range')));
  const html = `${rt ? `<p class="hint small">${esc(rt)}</p>` : ''}
    <div class="dicerow" style="--base:${t0}s"><label>${L('攻擊', 'Attack')} (${s.hit}+)</label>${s.attack.dice.map(die).join('')}
      <em class="reveal" style="--base:${t0 + nA * STEP + 0.1}s">${L(`${s.attack.crits} 暴擊 / ${s.attack.norms} 命中`, `${s.attack.crits} crit / ${s.attack.norms} hit`)}</em></div>
    <div class="dicerow" style="--base:${tD}s"><label class="reveal" style="--base:${tD}s">${L('防禦', 'Defence')} (${s.save}+)</label>${Array.from({ length: crit }, (_, i) => `<span class="die crit cover" style="--i:${i}">🛡</span>`).join('')}${Array.from({ length: norm }, (_, i) => `<span class="die norm cover" style="--i:${crit + i}">🛡</span>`).join('')}${s.defence.dice.map((d, i) => die(d, i + chips)).join('')}
      <em class="reveal" style="--base:${tD + nD * STEP + 0.1}s">${L(`${s.defence.crits + crit} 暴擊豁免 / ${s.defence.norms + norm} 豁免`, `${s.defence.crits + crit} crit save / ${s.defence.norms + norm} save`)}</em></div>
    ${notes.length ? `<p class="hint small reveal" style="--base:${tO}s">${notes.join(' · ')}</p>` : ''}
    <div class="outcome reveal" style="--base:${tO}s">${L(`未擋下：${s.remC} 暴擊、${s.remN} 普通 → <b>${s.dmg}</b> 傷害`, `Unblocked: ${s.remC} crit, ${s.remN} normal → <b>${s.dmg}</b> damage`)}
      <div>${nm(t)}：${s.before} → ${s.after} ${s.killed ? '☠' : ''}</div></div>`;
  return { html, end };
}

// ---------- AI scheduling ----------
function scheduleAI() {
  clearTimeout(aiTimer);
  if (ui.screen !== 'game' || !g || ui.result || ui.help || ui.flow) return;
  if (g.fight) {
    // The computer picks its own strike/parry dice; humans click (after any Command Re-roll window).
    if (!g.fight.done && !g.fight.rrOpen && isAI(fightChooser(g))) {
      aiTimer = setTimeout(() => { fightApply(g, fightAutoChoice(g)); afterChange(); }, 800);
    }
    return;
  }
  // Deployment: the computer sets up its step on its own.
  if (g.phase === 'deploy') {
    if (g.dep && !g.dep.done && isAI(g.dep.turn)) aiTimer = setTimeout(() => { autoDeployStep(g); finishDeployStep(g); afterChange(); }, 900);
    return;
  }
  // Negotiation: the computer places its secret bid; human players bid in the panel.
  if (g.bidding && g.ai != null && g.bidding.bids[g.ai] == null) {
    aiTimer = setTimeout(() => { aiBid(g, g.ai); afterChange(); }, 400);
    return;
  }
  // A declared attack waits for the player to press "Roll". NPOs are played by the computer too.
  if (g.phase !== 'firefight' || !isAI(g.turn) || ui.pending || g.bidding) return;
  // Slow enough to follow which operative the computer picked and where it moved: a longer pause after it
  // picks an operative (before its first action) than between later actions.
  const cur = activeOp(g);
  let delay = !cur ? 1000 : Object.keys(cur.acted).length === 0 ? 1800 : 1200;
  // Let the turn banner finish before the computer acts.
  if (ui.turnBanner && ui.turnBanner.side === g.turn) delay = Math.max(delay, TURN_BANNER_MS + 100 - (Date.now() - ui.turnBanner.at));
  aiTimer = setTimeout(() => {
    const res = aiStep(g);
    const op = activeOp(g);
    if (op) ui.sel = op.uid;
    if (res) ui.pending = { ...res, target: res.target.uid, ai: true };
    afterChange();
  }, delay);
}

function afterChange() {
  ui.notice = null;
  // Undo only covers the current player's own actions.
  if (g.phase !== 'firefight' || isAI(g.turn) || ui.undo[0]?.turn !== g.turn) ui.undo = [];
  // Auto-end a player activation with no AP left — unless its last action can still be undone.
  const a = activeOp(g);
  if (a && !ui.result && !g.fight && !isAI(g.turn) && ((a.ap <= 0 && !freePending(a) && !ui.undo.length) || a.dead)) { endActivation(g); ui.sel = null; ui.undo = []; }
  if (g.phase === 'strategy' && g.ai === ployChooser(g)) {
    aiStrategy(g, g.ai);
    finishPloys(g);
  }
  recordStep(g, ui.result);
  if (g.phase === 'gameover') archiveGame(g, [totalVP(g, 0), totalVP(g, 1)]);
  save();
  render();
}

// ---------- board interaction ----------
function svgPoint(evt) {
  const svg = document.getElementById('board');
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function onBoardClick(evt) {
  const opEl = evt.target.closest('[data-uid]');
  const p = svgPoint(evt);
  const clicked = opEl ? getOp(g, opEl.dataset.uid) : null;
  const op = activeOp(g);

  if (g.phase === 'deploy') {
    if (clicked) { ui.sel = clicked.uid; return render(); }
    const sel = ui.sel && getOp(g, ui.sel);
    if (sel && !isAI(sel.side) && placeOp(g, sel, p)) {
      // Next operative still waiting in this step is selected automatically.
      const next = g.dep.batch.length < g.dep.need && g.ops.find((o) => o.side === sel.side && o.placed === false);
      ui.sel = next ? next.uid : sel.uid;
      afterChange();
    }
    return;
  }
  if (g.phase !== 'firefight') { if (clicked) { ui.sel = clicked.uid; render(); } return; }
  const myTurn = !isAI(g.turn);

  // While picking a friendly for Signal / Medikit, tapping your own operative doesn't switch activation.
  const detonating = ui.mode?.kind === 'shoot' && !!ui.mode.weapon?.rules.detonate;
  if (clicked && ui.mode?.kind !== 'target' && !detonating && trySelectOwn(clicked)) return;
  if (op && ui.mode && myTurn) {
    const m = ui.mode;
    if (m.kind === 'move') return previewMove(op, m.action, p);
    if (clicked && (clicked.side !== op.side || detonating)) {
      // Declare the attack first; the dice are rolled when the player presses "Roll".
      if ((m.kind === 'shoot' && m.weapon && shootCheck(g, op, clicked, m.weapon).ok)
        || (m.kind === 'fight' && m.weapon && fightTargets(g, op).includes(clicked))) {
        ui.pending = { kind: m.kind, weapon: m.weapon, target: clicked.uid, ai: false };
        ui.mode = null; ui.sel = clicked.uid;
        return render();
      }
    }
    if (clicked && m.kind === 'target' && TARGET_ACTIONS[m.action].targets(g, op).includes(clicked)) {
      undoable(() => doTargetAction(g, op, m.action, clicked)); ui.mode = null; return afterChange();
    }
    if (clicked) { ui.sel = clicked.uid; render(); }
    return;
  }
  if (clicked) { ui.sel = clicked.uid; render(); }
  else if (ui.sel && ui.sel !== g.active) { ui.sel = null; render(); } // tap empty board: close the info card
}

/**
 * Clicking one of your own operatives that may act makes it the active one, so the action
 * panel always follows the operative you picked. Switching is only allowed before the
 * current operative's first action. Returns true if the click was handled.
 */
function trySelectOwn(clicked) {
  if (g.phase !== 'firefight' || isAI(g.turn) || clicked.side !== g.turn || g.fight) return false;
  const op = activeOp(g);
  if (op && op.uid === clicked.uid) return false;
  const eligible = g.counter ? counterCandidates(g, g.turn).includes(clicked) : readyOps(g, g.turn).includes(clicked);
  if (!eligible) return false;
  if (op) {
    if (!canSwitchActive(g)) {
      ui.sel = clicked.uid;
      ui.notice = L(`${opName(op, 'zh')} 已執行動作，請先「結束啟動」才能換 ${opName(clicked, 'zh')}。`,
        `${opName(op, 'en')} has already acted — end its activation before switching to ${opName(clicked, 'en')}.`);
      render();
      return true;
    }
  }
  undoable(() => { if (op) deactivate(g); activate(g, clicked); });
  ui.sel = clicked.uid; ui.mode = null; ui.path = null; ui.pending = null;
  afterChange();
  return true;
}

function previewMove(op, action, p) {
  const ctx = moveCtx(g, op);
  const max = moveAllowance(g, op, action);
  const r = radius(op);
  const full = findPath(ctx, p);
  if (!full) {
    ui.path = { pts: [{ x: op.x, y: op.y }, p], len: Math.hypot(p.x - op.x, p.y - op.y), ok: false, r,
      why: L('無法到達（被地形或其他棋子阻擋）', 'Unreachable (blocked by terrain or operatives)') };
    return render();
  }
  // Too far: stop at the furthest legal point along the route.
  const endOk = action === 'charge' ? () => true : (q) => !ctx.inEnemyER(q);
  const path = full.len > max + 0.01 ? clampPath(ctx, full, max, endOk) || full : full;
  const end = path.pts[path.pts.length - 1];
  let why = null;
  if (path.len > max + 0.01) why = L(`距離 ${path.len.toFixed(1)}" 超過 ${max}"`, `${path.len.toFixed(1)}" exceeds ${max}"`);
  else if (action === 'charge' && !ctx.inEnemyER(end)) why = L(`衝鋒必須結束於敵人 1" 內（需要 ${full.len.toFixed(1)}"）`, `Charge must end within 1" of an enemy (needs ${full.len.toFixed(1)}")`);
  else if (action === 'fallBack' && ctx.inEnemyER(end)) why = L('撤退必須離開交戰範圍', 'Fall Back must end outside engagement range');
  else if (action !== 'charge' && ctx.inEnemyER(end)) why = L('移動結束時不能在敵人 1" 交戰範圍內', 'Cannot end a move within 1" of an enemy');
  ui.path = { ...path, ok: !why, why, r };
  render();
}

function doActivate(op) {
  if (!op || g.active || !(g.counter ? counterCandidates(g, g.turn) : readyOps(g, g.turn)).includes(op)) return render();
  undoable(() => activate(g, op));
  ui.sel = op.uid; ui.mode = null; ui.path = null; ui.notice = null; ui.pending = null;
  afterChange();
}

// ---------- events ----------
app.addEventListener('click', (e) => {
  if (ui.screen === 'replay' && e.target.closest('#board')) {
    // Replay is read-only: tapping an operative only shows its datacard.
    const opEl = e.target.closest('[data-uid]');
    ui.sel = opEl ? opEl.dataset.uid : null;
    return render();
  }
  if (e.target.closest('#board')) return onBoardClick(e);
  const b = e.target.closest('[data-act]');
  if (!b) return;
  handle(b.dataset.act, b.dataset, e);
});
modalRoot.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (b) handle(b.dataset.act, b.dataset, e);
});
app.addEventListener('change', (e) => {
  if (e.target.dataset.act === 'ai') { ui.setup.ai = e.target.checked ? 1 : null; render(); }
  if (e.target.dataset.act === 'mission') { ui.setup.mission = e.target.value; render(); }
  if (e.target.dataset.act === 'mark' && g?.phase === 'strategy') {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && g.ai !== side) { setMark(g, side, e.target.value ? getOp(g, e.target.value) : null); afterChange(); }
  }
  if ((e.target.dataset.act === 'gaze' || e.target.dataset.act === 'glorykill') && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) {
      if (e.target.dataset.act === 'gaze') setGaze(g, side, getOp(g, e.target.value)); else setGloryKill(g, side, getOp(g, e.target.value));
      afterChange();
    }
  }
  if (e.target.dataset.act === 'scramble' && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) { omniScramble(g, side, getOp(g, e.target.value)); afterChange(); }
  }
  if (e.target.dataset.act === 'navyorder' && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) { placeNavyOrder(g, side, getOp(g, e.target.value)); afterChange(); }
  }
  if (e.target.dataset.act === 'tactician' && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side, [kind, uid] = e.target.value.split(':');
    if (side === ployChooser(g) && !isAI(side)) { placeTactician(g, side, kind, getOp(g, uid)); afterChange(); }
  }
  if ((e.target.dataset.act === 'gorder' || e.target.dataset.act === 'grelay') && g?.phase === 'strategy') {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) {
      const id = document.querySelector(`select[data-act="gorder"][data-side="${side}"]`)?.value || null;
      const relay = !!document.querySelector(`input[data-act="grelay"][data-side="${side}"]`)?.checked;
      chooseGuardOrder(g, side, id, relay);
      afterChange();
    }
  }
  if (e.target.dataset.act === 'tactic') {
    const side = +e.target.dataset.side, slot = +e.target.dataset.slot;
    const cur = [...setupTactics(side)];
    cur[slot] = e.target.value;
    ui.setup.tactics[side] = cur;
    render();
  }
});
app.addEventListener('input', (e) => {
  if (e.target.dataset.act === 'rseek') { stopReplayPlay(); ui.replay.i = +e.target.value; render(); document.querySelector('.rseek')?.focus(); }
});
document.addEventListener('keydown', (e) => {
  if (ui.screen !== 'replay' || e.target.matches?.('input')) return;
  if (e.key === 'ArrowLeft') { stopReplayPlay(); replayGo(ui.replay.i - 1); }
  if (e.key === 'ArrowRight') { stopReplayPlay(); replayGo(ui.replay.i + 1); }
});

function handle(act, d) {
  const op = g && activeOp(g);
  switch (act) {
    case 'home': ui.screen = 'home'; return render();
    case 'help': ui.help = true; return render();
    case 'closehelp': ui.help = false; return render();
    case 'lang': setLang(getLang() === 'zh' ? 'en' : 'zh'); return render();
    case 'setup': ui.screen = 'setup'; return render();
    case 'pick': ui.setup.teams[+d.side] = d.team; ui.setup.tactics[+d.side] = null; return render();
    case 'resume': g = loadSave(); resetRecorder(); ui.screen = 'game'; ui.sel = null; ui.mode = null; ui.path = null; ui.pending = null; ui.flow = null; ui.undo = []; ui.turnKey = null; ui.turnBanner = null; return render();
    case 'replay': return openReplay(g.replay, 'game', teamsTitle(g.teams));
    case 'replayhist': {
      const h = loadHistory().find((x) => String(x.id) === d.id);
      return h && openReplay(h.replay, 'home', teamsTitle(h.teams));
    }
    case 'delhist': deleteHistory(+d.id); return render();
    case 'rgo': stopReplayPlay(); return replayGo(+d.to);
    case 'rplay': return toggleReplayPlay();
    case 'rexit': stopReplayPlay(); ui.screen = ui.replay.from; ui.replay = null; ui.sel = null; return render();
    case 'start':
      clearSave();
      resetRecorder();
      g = newGame({ teams: [...ui.setup.teams], ai: ui.setup.ai, mission: ui.setup.mission, tactics: [0, 1].map((s) => (TEAM_MAP[ui.setup.teams[s]].tactics ? setupTactics(s) : null)) });
      ui.screen = 'game'; ui.sel = null; ui.mode = null; ui.path = null; ui.result = null; ui.pending = null; ui.flow = null; ui.undo = []; ui.endDismissed = false; ui.turnKey = null; ui.turnBanner = null;
      return afterChange();
    case 'depsel': ui.sel = d.uid; return render();
    case 'depauto': autoDeployStep(g); return afterChange();
    case 'depdone': finishDeployStep(g); ui.sel = null; return afterChange();
    case 'begin': ui.sel = null; startBattle(g); return afterChange();
    case 'ploy': {
      const s = +d.side;
      buyPloy(g, s, team(g, s).ploys.find((p) => p.id === d.ploy));
      return afterChange();
    }
    case 'strategy': startStrategy(g); return afterChange();
    case 'ploysdone': if (g.phase === 'strategy' && g.ai !== ployChooser(g)) finishPloys(g); return afterChange();
    case 'pickop': { const o = getOp(g, d.uid); if (!trySelectOwn(o)) { ui.sel = d.uid; render(); } return undefined; }
    case 'activate': return doActivate(getOp(g, d.uid));
    case 'closeinspect': ui.sel = null; return render();
    case 'mstart': measure.mode = true; measure.pts = []; measure.cursor = null; return drawMeasure();
    case 'mundo': measure.pts.pop(); return drawMeasure();
    case 'mclear': measure.pts = []; return drawMeasure();
    case 'mend': measure.mode = false; measure.pts = []; measure.cursor = null; return drawMeasure();
    case 'passcounter': passCounter(g); ui.sel = null; ui.pending = null; return afterChange();
    case 'order': undoable(() => setOrder(g, op, d.order)); return afterChange();
    case 'undo': return undo();
    case 'dismissend': ui.endDismissed = true; return render();
    case 'bloodtoken':
      if (g.phase === 'strategy' && +d.side === ployChooser(g) && !isAI(+d.side)) assignBlood(g, +d.side, getOp(g, d.uid));
      return afterChange();
    case 'grudge':
      if (g.phase === 'strategy' && +d.side === ployChooser(g) && !isAI(+d.side)) eyeOfAncestors(g, +d.side, getOp(g, d.uid));
      return afterChange();
    case 'passchain': undoable(() => passChain(g)); ui.sel = null; return afterChange();
    case 'rerolldie': {
      const s = ui.flow?.step;
      if (s) commandReroll(g, s.side, s.seq, s.stage === 'attack' ? 'a' : 'd', +d.i);
      return render();
    }
    case 'flowgo': ui.flow.step = null; return advanceFlow();
    case 'fightrr': fightCommandReroll(g, d.k, +d.i); return render();
    case 'fightrrdone': fightRerollDone(g); return afterChange();
    case 'bid': {
      const input = document.querySelector(`.bidinput[data-side="${d.side}"]`);
      placeBid(g, +d.side, +(input?.value || 0));
      return afterChange();
    }
    case 'swaporder': strategySwap(g, getOp(g, d.uid)); return afterChange();
    case 'counterswap': counterSwap(g, getOp(g, d.uid)); ui.sel = null; return afterChange();
    case 'roll': {
      // Resolve the declared attack.
      const p = ui.pending;
      if (!p || !op) return undefined;
      ui.pending = null;
      const t = getOp(g, p.target);
      ui.undo = []; // dice are rolled: this action can't be undone
      if (p.kind === 'shoot') { ui.flow = { it: shootFlow(g, op, p.weapon, t), step: null }; return advanceFlow(); }
      startFight(g, op, p.weapon, t);
      return afterChange();
    }
    case 'unroll': ui.pending = null; return render(); // take back a declared (not yet rolled) attack
    case 'action': {
      if (['reposition', 'dash', 'charge', 'fallBack'].includes(d.id)) ui.mode = { kind: 'move', action: d.id };
      else if (d.id === 'shoot' || d.id === 'fight') {
        const type = d.id === 'shoot' ? 'ranged' : 'melee';
        const ws = tpl(op).weapons.filter((w) => w.type === type);
        ui.mode = { kind: d.id, weapon: ws.length === 1 ? ws[0] : null };
      } else if (TARGET_ACTIONS[d.id]) ui.mode = { kind: 'target', action: d.id };
      else if (d.id === 'optics') { undoable(() => doOptics(g, op)); return afterChange(); }
      else if (d.id === 'flail') { undoable(() => doFlail(g, op)); return afterChange(); }
      else if (d.id === 'dakkaDash') { undoable(() => doDakkaDash(g, op)); return afterChange(); }
      else if (['energise', 'longSight', 'stealthAttack', 'boost', 'auspexScan', 'guerrilla', 'shieldingUp', 'actuation', 'gongKnell', 'mantle', 'sweepingBlow'].includes(d.id)) { undoable(() => doSelfAction(g, op, d.id)); return afterChange(); }
      else if (d.id === 'pickUp') { undoable(() => doPickUp(g, op)); return afterChange(); }
      else if (mission(g).actions?.includes(d.id)) { undoable(() => doMissionAction(g, op, d.id)); return afterChange(); }
      ui.path = null;
      return render();
    }
    case 'weapon': {
      const w = tpl(op).weapons[+d.i];
      if (w.type === 'ranged' && !shootWeapon(g, op, w).ok) return undefined;
      ui.mode.weapon = w; return render();
    }
    case 'cancel': ui.mode = null; ui.path = null; return render();
    case 'confirmmove':
      if (ui.path?.ok) { const { action } = ui.mode, path = ui.path; undoable(() => doMove(g, op, action, path)); }
      ui.mode = null; ui.path = null;
      return afterChange();
    case 'endact':
      endActivation(g); ui.mode = null; ui.path = null; ui.sel = null; ui.pending = null;
      return afterChange();
    case 'fightopt':
      if (g.fight && !g.fight.done && !isAI(fightChooser(g))) fightApply(g, d.id);
      return afterChange();
    case 'fightdone': {
      endFight(g);
      const a = activeOp(g);
      if (a && a.dead) endActivation(g); // killed in a fight it started
      return afterChange();
    }
    case 'closeresult': {
      ui.result = null;
      const a = activeOp(g);
      if (a && a.dead) endActivation(g); // killed in a fight it started
      return afterChange();
    }
    default: return undefined;
  }
}

setLang(getLang());
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
