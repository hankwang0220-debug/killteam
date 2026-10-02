import { TEAMS, TEAM_MAP, RULE_LABELS } from './data/teams.js';
import { L, bi, tx, getLang, setLang } from './i18n.js';
import {
  ACTIONS, activate, activeOp, autoDeploy, availableActions, buyPloy, deployOk, doMark, doMove, endActivation,
  engagedEnemies, getOp, isInjured, killGrade, killOpVP, living, markCheck, moveAllowance, moveStat, newGame, opName,
  counterCandidates, passCounter, canSwitchActive, deactivate, endFight, fightApply, fightAutoChoice, fightChooser, fightOp, fightOptions, fightWeapon, startFight,
  radius, resolveShoot, setOrder, shootCheck, startBattle, team, totalVP, tpl, MAX_TP, ployChooser, finishPloys,
  ployCost, ployTaken, shootWeapon, doOptics, injuredPenalty,
} from './game.js';
import { renderBoard } from './board.js';
import { clampPath, findPath, moveCtx } from './path.js';
import { aiStep, aiStrategy } from './ai.js';
import { HELP } from './help.js';
import { archiveGame, deleteHistory, loadHistory, recordStep, resetRecorder, stepNotes, trailsAt, viewAt } from './replay.js';

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const SAVE_KEY = 'kt.save';

let g = null;
const ui = {
  screen: 'home',
  sel: null,          // inspected / selected operative uid
  mode: null,         // {kind:'move', action} | {kind:'shoot', weapon} | {kind:'fight', weapon} | {kind:'mark'}
  path: null,         // movement preview
  result: null,       // dice dialog
  help: false,
  setup: { teams: ['angels', 'greenskin'], ai: 1, tactics: [null, null] },
};
let aiTimer = null;

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

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lang = () => getLang();
const nm = (op) => esc(opName(op, lang()));

// ---------- render root ----------
function render() {
  if (ui.screen !== 'game' && ui.screen !== 'replay') { measure.pts = []; measure.cursor = null; measure.mode = false; }
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
  if (!op || op.side === g.ai) return;
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
  if (e.type === 'pointerup' && deployOk(g, d.op, d.p)) { d.op.x = d.p.x; d.op.y = d.p.y; afterChange(); } else render();
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
  return `${topBar()}
  <main class="setup">
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
    <dt>${L('隊伍人數', 'Operatives')}</dt><dd>${t.ops.reduce((n, o) => n + o.count, 0)}</dd>
    <dt>${L('一盒成軍', 'One box')}</dt><dd>${esc(tx(i.oneBox))}</dd>
    <dt>${L('目前可購買', 'Available')}</dt><dd>${esc(tx(i.buyable))}</dd>
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
    <div class="boardwrap"><div class="boardbox">${renderBoard(g, boardUi())}${inspectView()}${measureBar()}</div></div>
    <aside class="panel">${panelView()}${logView()}</aside>
  </main>`;
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
    const phase = { deploy: L('部署', 'Deploy'), strategy: L('策略階段', 'Strategy'), firefight: L('交火階段', 'Firefight'), gameover: L('遊戲結束', 'Game over') }[view.phase] || '';
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
  if (op && ui.mode?.kind === 'shoot') {
    b.highlight = new Map();
    for (const t of living(g, 1 - op.side)) {
      const c = shootCheck(g, op, t, ui.mode.weapon);
      if (c.ok) b.highlight.set(t.uid, c.cover && !t.marked && !ui.mode.weapon.rules.ignoreCover ? 'cover' : 'target');
    }
  }
  if (op && ui.mode?.kind === 'fight') {
    b.highlight = new Map(engagedEnemies(g, op).map((e) => [e.uid, 'target']));
  }
  if (op && ui.mode?.kind === 'mark') {
    b.highlight = new Map(living(g, 1 - op.side).filter((e) => markCheck(g, op, e)).map((e) => [e.uid, 'target']));
  }
  return b;
}

function panelView() {
  if (g.phase === 'deploy') return deployPanel();
  if (g.phase === 'strategy') return strategyPanel();
  if (g.phase === 'gameover') return gameOverPanel();
  return firefightPanel();
}

function deployPanel() {
  return `<section class="card">
    <h2>${L('部署階段', 'Deployment')}</h2>
    <p class="hint">${L('點選己方操作員，再點擊己方部署區（有顏色的區域）放置。已自動部署，可直接開始。',
    'Tap one of your operatives, then tap inside your coloured deployment zone. Already auto-deployed — you can start right away.')}</p>
    <div class="row">
      <button data-act="autodeploy" data-side="0">${L('重新自動部署 P1', 'Auto-deploy P1')}</button>
      ${g.ai === 1 ? '' : `<button data-act="autodeploy" data-side="1">${L('重新自動部署 P2', 'Auto-deploy P2')}</button>`}
    </div>
    <button class="primary wide" data-act="begin">${L('開始戰鬥 ▶', 'Begin Battle ▶')}</button>
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
      }).join('')}</div>
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

function gameOverPanel() {
  const w = g.winner;
  const line = (s) => `<tr><td style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</td><td>${g.kills[s]}</td><td>${killGrade(g, s)}</td><td>${killOpVP(g, s)}</td><td><b>${totalVP(g, s)}</b></td></tr>`;
  return `<section class="card">
    <h2>${w == null ? L('平手！', 'Draw!') : L(`${esc(bi(team(g, w).name))} 獲勝！`, `${esc(bi(team(g, w).name))} wins!`)}</h2>
    <table class="final"><tr><th></th><th>${L('擊殺數', 'Kills')}</th><th>${L('擊殺等級', 'Grade')}</th><th>Kill Op</th><th>${L('總分', 'Total')}</th></tr>${line(0)}${line(1)}</table>
    <p class="hint small">${L('擊殺任務：每升一個擊殺等級得 1 VP；結束時擊殺等級較高者再得 1 VP。', 'Kill Op: 1VP per kill grade reached; +1VP at the end for the higher kill grade.')}</p>
    <button class="wide" data-act="replay">📜 ${L('觀看本場複盤', 'Watch the replay')}</button>
    <button class="primary wide" data-act="setup">${L('再來一場', 'Play Again')}</button>
  </section>`;
}

function firefightPanel() {
  const op = activeOp(g);
  const t = team(g, g.turn);
  const aiTurn = g.ai === g.turn;
  let html = `<section class="card turnbanner" style="--tc:${t.color}">
    <h2>${esc(bi(t.name))} ${L('的回合', '— your move')}</h2>`;
  if (aiTurn) {
    html += `<p class="hint">${L('電腦思考中…', 'Computer is thinking…')}</p></section>`;
    return html + (op ? datacard(op) : '');
  }
  if (!op && g.counter) {
    const cands = counterCandidates(g, g.turn);
    html += `<p><b>${L('反擊機會', 'Counteract')}</b></p>
      <p class="hint">${L('你已沒有準備中的特工。可選一名已行動、交戰指令且本回合未反擊過的特工，免費執行一個 1AP 動作（移動不超過 2"），或略過。',
    'You have no ready operatives. Pick an expended Engage-order operative that has not counteracted this TP to perform one free 1AP action (moving no more than 2"), or pass.')}</p>
      <div class="readylist">${cands.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`;
    const sel = ui.sel && getOp(g, ui.sel);
    if (sel && cands.includes(sel)) html += `<button class="primary wide" data-act="activate" data-uid="${sel.uid}">${L('反擊', 'Counteract with')} ${nm(sel)}</button>`;
    html += `<button class="wide" data-act="passcounter">${L('略過反擊', 'Pass')}</button></section>`;
    return html;
  }
  if (!op) {
    const ready = living(g, g.turn).filter((o) => o.ready);
    html += `<p class="hint">${L('選擇一名「準備中」的操作員啟動（點擊棋子或下方名單）。', 'Choose a ready operative to activate (tap it on the board or below).')}</p>
      <div class="readylist">${ready.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`;
    const sel = ui.sel && getOp(g, ui.sel);
    if (sel && sel.side === g.turn && sel.ready) html += `<button class="primary wide" data-act="activate" data-uid="${sel.uid}">${L('啟動', 'Activate')} ${nm(sel)}</button>`;
    html += '</section>';
    return html;
  }

  // Active operative
  const apMax = op.counter ? 1 : tpl(op).apl;
  html += `<div class="activehead"><b>${nm(op)}${op.counter ? ` <small>${L('（反擊）', '(counteract)')}</small>` : ''}</b><span class="ap">${'●'.repeat(op.ap)}${'○'.repeat(Math.max(0, apMax - op.ap))} AP</span></div>`;
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

  if (ui.mode) html += modeView(op);
  else {
    html += `<div class="actions">${availableActions(g, op).map((a) => `<button data-act="action" data-id="${a.id}" ${a.ok ? '' : 'disabled'} title="${a.why ? esc(tx(a.why)) : ''}">
      ${esc(tx(ACTIONS[a.id].name))} <span class="cp">${a.ap}AP</span></button>`).join('')}</div>`;
  }
  html += `<button class="wide" data-act="endact">${L('結束啟動', 'End Activation')}</button></section>`;
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
  if (m.kind === 'mark') return `<div class="mode"><h3>${L('標記', 'Mark')}</h3><p class="hint">${L('點擊一個可見敵人進行標記。', 'Tap a visible enemy to mark it.')}</p><div class="row">${cancel}</div></div>`;
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
  if (op.optics) flags.push(`<span class="flag mk">${L('光學瞄準', 'Optics')}</span>`);
  if (op.marked) flags.push(`<span class="flag mk">${L('已被標記', 'Marked')}</span>`);
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
  </section>`;
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
      <div class="fhead">${who(k)} <small>${esc(bi(fightWeapon(g, k).name))} · ${f[k].hit}+ · ${fightWeapon(g, k).dmg.join('/')}${p.brutal ? ` · ${bi(RULE_LABELS.brutal)}` : ''}</small></div>
      <div class="dicerow ${f.steps.length ? 'still' : ''}"><label>${k === 'A' ? L('攻方擲骰', 'Attacker roll') : L('守方擲骰', 'Defender roll')}</label>${p.dice.map(die).join('')}</div>
      <div class="remain">${L('剩餘成功骰', 'Unresolved')}：${chips || '—'}</div>
      <div class="wounds">${L('生命', 'Wounds')} ${ops[k].wounds}/${ops[k].maxW}${ops[k].dead ? ' ☠' : ''}</div>
    </div>`;
  };
  const stepTxt = (s) => {
    if (s.act === 'strike') return `<li>${who(s.side)} ${L('打擊', 'strikes')}${s.crit ? L('（暴擊）', ' (crit)') : ''} → ${s.dmg} ${L('傷害', 'dmg')}${s.killed ? ' ☠' : ''}</li>`;
    return `<li>${who(s.side)} ${L('格擋', 'parries')}${s.crit ? L('（用暴擊）', ' (with a crit)') : ''} ${s.blocked ? L('對方一個暴擊', 'an enemy crit') : L('對方一個普通', 'an enemy normal')}</li>`;
  };
  let action;
  if (readonly) {
    action = '';
  } else if (f.done) {
    action = `<button class="primary wide" data-act="fightdone">${L('繼續', 'Continue')}</button>`;
  } else if (g.ai === fightChooser(g)) {
    action = `<p class="hint">${L('電腦選擇中…', 'Computer is choosing…')}</p>`;
  } else {
    const label = (o) => {
      if (o.act === 'strike') return o.die === 'c' ? L(`打擊（暴擊）→ ${o.dmg} 傷害`, `Strike (crit) → ${o.dmg} dmg`) : L(`打擊（普通）→ ${o.dmg} 傷害`, `Strike (normal) → ${o.dmg} dmg`);
      if (o.id === 'parry-c-c') return L('格擋：用暴擊擋掉對方一個暴擊', 'Parry: crit cancels an enemy crit');
      if (o.id === 'parry-c-n') return L('格擋：用暴擊擋掉對方一個普通', 'Parry: crit cancels an enemy normal');
      if (o.id === 'parry-n-c') return L('格擋（決鬥者）：用普通擋掉對方一個暴擊', 'Parry (Dueller): normal cancels an enemy crit');
      return L('格擋：用普通擋掉對方一個普通', 'Parry: normal cancels an enemy normal');
    };
    action = `<p>${L('輪到', 'Your choice,')} ${who(f.turn)} ${L('選擇：', '')}</p>
      <div class="fopts">${fightOptions(g).map((o) => `<button class="${o.act === 'strike' ? 'primary' : ''}" data-act="fightopt" data-id="${o.id}">${label(o)}</button>`).join('')}</div>`;
  }
  return `<h2>⚔ ${L('近戰', 'Fight')}</h2>
    <div class="fsides">${pool('A')}${pool('D')}</div>
    <ol class="steps">${f.steps.map(stepTxt).join('') || (f.done ? `<li>${L('雙方都沒有成功骰', 'No successes on either side')}</li>` : '')}</ol>
    ${action}`;
}

const DIE_NOTES = { rr: ['重擲', 'Re-rolled'], rend: ['撕裂', 'Rending'], sev: ['嚴厲', 'Severe'], indo: ['帝國征程', 'Indomitus'], auto: ['精準', 'Accurate'] };
const die = (d) => {
  const marks = Object.keys(DIE_NOTES).filter((k) => d[k]);
  const cls = marks.map((k) => (k === 'sev' || k === 'indo' || k === 'auto' ? 'rend' : k)).join(' ');
  return `<span class="die ${d.res} ${cls}" title="${marks.map((k) => L(...DIE_NOTES[k])).join(', ')}">${d.v}</span>`;
};

function resultView(r, readonly = false) {
  const a = getOp(g, r.attacker), t = getOp(g, r.target);
  const ca = team(g, a.side).color, ct = team(g, t.side).color;
  if (r.kind === 'shoot') {
    const extra = (r.extra || []).map((s) => {
      const st = getOp(g, s.target);
      return `<h3 class="sub">${L('次要目標', 'Secondary target')}：<b style="color:${team(g, st.side).color}">${nm(st)}</b></h3>${shotView(s, st)}`;
    }).join('');
    return `<h2>⌖ ${L('射擊', 'Shooting')}</h2>
      <p><b style="color:${ca}">${nm(a)}</b> → <b style="color:${ct}">${nm(t)}</b> · ${esc(bi(r.weapon.name))}${r.ap > 1 ? ` · ${r.ap}AP` : ''}</p>
      ${shotView(r, t)}${extra}
      ${readonly ? '' : `<button class="primary wide" data-act="closeresult">${L('繼續', 'Continue')}</button>`}`;
  }
  return '';
}

/** Dice and outcome of one shooting sequence (primary or a Torrent/Blast secondary target). */
function shotView(s, t) {
  const crit = s.coverCrit || 0, norm = s.coverSaves - crit;
  const notes = [];
  if (s.coverSaves) notes.push(L(`掩護：保留 ${s.coverSaves} 顆豁免${crit ? `（${crit} 顆暴擊）` : ''}`, `Cover: ${s.coverSaves} save retained${crit ? ` (${crit} critical)` : ''}`));
  else if (s.saturated) notes.push(L('飽和：無法保留掩護豁免', 'Saturate: no cover saves'));
  if (s.pierce) notes.push(L(`穿甲：少擲 ${s.pierce} 顆`, `Piercing: ${s.pierce} fewer dice`));
  if (s.dev) notes.push(L(`毀滅：額外 ${s.dev} 傷害`, `Devastating: ${s.dev} extra damage`));
  const rt = ruleText(Object.fromEntries(Object.entries(s.rules).filter(([k]) => k !== 'range')));
  return `${rt ? `<p class="hint small">${esc(rt)}</p>` : ''}
    <div class="dicerow"><label>${L('攻擊', 'Attack')} (${s.hit}+)</label>${s.attack.dice.map(die).join('')}
      <em>${L(`${s.attack.crits} 暴擊 / ${s.attack.norms} 命中`, `${s.attack.crits} crit / ${s.attack.norms} hit`)}</em></div>
    <div class="dicerow"><label>${L('防禦', 'Defence')} (${s.save}+)</label>${'<span class="die crit cover">🛡</span>'.repeat(crit)}${'<span class="die norm cover">🛡</span>'.repeat(norm)}${s.defence.dice.map(die).join('')}
      <em>${L(`${s.defence.crits + crit} 暴擊豁免 / ${s.defence.norms + norm} 豁免`, `${s.defence.crits + crit} crit save / ${s.defence.norms + norm} save`)}</em></div>
    ${notes.length ? `<p class="hint small">${notes.join(' · ')}</p>` : ''}
    <div class="outcome">${L(`未擋下：${s.remC} 暴擊、${s.remN} 普通 → <b>${s.dmg}</b> 傷害`, `Unblocked: ${s.remC} crit, ${s.remN} normal → <b>${s.dmg}</b> damage`)}
      <div>${nm(t)}：${s.before} → ${s.after} ${s.killed ? '☠' : ''}</div></div>`;
}

// ---------- AI scheduling ----------
function scheduleAI() {
  clearTimeout(aiTimer);
  if (ui.screen !== 'game' || !g || ui.result || ui.help) return;
  if (g.fight) {
    // The computer picks its own strike/parry dice; humans click.
    if (!g.fight.done && g.ai === fightChooser(g)) {
      aiTimer = setTimeout(() => { fightApply(g, fightAutoChoice(g)); afterChange(); }, 800);
    }
    return;
  }
  if (g.ai == null || g.phase !== 'firefight' || g.turn !== g.ai) return;
  aiTimer = setTimeout(() => {
    const res = aiStep(g);
    const op = activeOp(g);
    if (op) ui.sel = op.uid;
    if (res) ui.result = res;
    afterChange();
  }, 550);
}

function afterChange() {
  ui.notice = null;
  // Auto-end a player activation with no AP left (after a move or mark).
  const a = activeOp(g);
  if (a && !ui.result && !g.fight && g.ai !== g.turn && (a.ap <= 0 || a.dead)) { endActivation(g); ui.sel = null; }
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
    if (sel && sel.side !== g.ai && deployOk(g, sel, p)) { sel.x = p.x; sel.y = p.y; afterChange(); }
    return;
  }
  if (g.phase !== 'firefight') { if (clicked) { ui.sel = clicked.uid; render(); } return; }
  const myTurn = g.ai !== g.turn;

  if (clicked && trySelectOwn(clicked)) return;
  if (op && ui.mode && myTurn) {
    const m = ui.mode;
    if (m.kind === 'move') return previewMove(op, m.action, p);
    if (clicked && clicked.side !== op.side) {
      if (m.kind === 'shoot' && m.weapon && shootCheck(g, op, clicked, m.weapon).ok) {
        ui.result = resolveShoot(g, op, m.weapon, clicked); ui.mode = null; return afterChange();
      }
      if (m.kind === 'fight' && m.weapon && engagedEnemies(g, op).includes(clicked)) {
        startFight(g, op, m.weapon, clicked); ui.mode = null; return afterChange();
      }
      if (m.kind === 'mark' && markCheck(g, op, clicked)) { doMark(g, op, clicked); ui.mode = null; return afterChange(); }
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
  if (g.phase !== 'firefight' || g.ai === g.turn || clicked.side !== g.turn || g.fight) return false;
  const op = activeOp(g);
  if (op && op.uid === clicked.uid) return false;
  const eligible = g.counter ? counterCandidates(g, g.turn).includes(clicked) : clicked.ready;
  if (!eligible) return false;
  if (op) {
    if (!canSwitchActive(g)) {
      ui.sel = clicked.uid;
      ui.notice = L(`${opName(op, 'zh')} 已執行動作，請先「結束啟動」才能換 ${opName(clicked, 'zh')}。`,
        `${opName(op, 'en')} has already acted — end its activation before switching to ${opName(clicked, 'en')}.`);
      render();
      return true;
    }
    deactivate(g);
  }
  doActivate(clicked);
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
  activate(g, op);
  ui.sel = op.uid; ui.mode = null; ui.path = null; ui.notice = null;
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
    case 'resume': g = loadSave(); resetRecorder(); ui.screen = 'game'; ui.sel = null; ui.mode = null; ui.path = null; return render();
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
      g = newGame({ teams: [...ui.setup.teams], ai: ui.setup.ai, tactics: [0, 1].map((s) => (TEAM_MAP[ui.setup.teams[s]].tactics ? setupTactics(s) : null)) });
      ui.screen = 'game'; ui.sel = null; ui.mode = null; ui.path = null; ui.result = null;
      return afterChange();
    case 'autodeploy': autoDeploy(g, +d.side); return afterChange();
    case 'begin': ui.sel = null; startBattle(g); return afterChange();
    case 'ploy': {
      const s = +d.side;
      buyPloy(g, s, team(g, s).ploys.find((p) => p.id === d.ploy));
      return afterChange();
    }
    case 'ploysdone': if (g.phase === 'strategy' && g.ai !== ployChooser(g)) finishPloys(g); return afterChange();
    case 'pickop': { const o = getOp(g, d.uid); if (!trySelectOwn(o)) { ui.sel = d.uid; render(); } return undefined; }
    case 'activate': return doActivate(getOp(g, d.uid));
    case 'closeinspect': ui.sel = null; return render();
    case 'mstart': measure.mode = true; measure.pts = []; measure.cursor = null; return drawMeasure();
    case 'mundo': measure.pts.pop(); return drawMeasure();
    case 'mclear': measure.pts = []; return drawMeasure();
    case 'mend': measure.mode = false; measure.pts = []; measure.cursor = null; return drawMeasure();
    case 'passcounter': passCounter(g); ui.sel = null; return afterChange();
    case 'order': setOrder(g, op, d.order); return afterChange();
    case 'action': {
      if (['reposition', 'dash', 'charge', 'fallBack'].includes(d.id)) ui.mode = { kind: 'move', action: d.id };
      else if (d.id === 'shoot' || d.id === 'fight') {
        const type = d.id === 'shoot' ? 'ranged' : 'melee';
        const ws = tpl(op).weapons.filter((w) => w.type === type);
        ui.mode = { kind: d.id, weapon: ws.length === 1 ? ws[0] : null };
      } else if (d.id === 'mark') ui.mode = { kind: 'mark' };
      else if (d.id === 'optics') { doOptics(g, op); return afterChange(); }
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
      if (ui.path?.ok) doMove(g, op, ui.mode.action, ui.path);
      ui.mode = null; ui.path = null;
      return afterChange();
    case 'endact':
      endActivation(g); ui.mode = null; ui.path = null; ui.sel = null;
      return afterChange();
    case 'fightopt':
      if (g.fight && !g.fight.done && g.ai !== fightChooser(g)) fightApply(g, d.id);
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
