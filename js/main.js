import { TEAMS, TEAM_MAP, RULE_LABELS } from './data/teams.js';
import { L, tx, getLang, setLang } from './i18n.js';
import {
  ACTIONS, activate, activeOp, autoDeploy, availableActions, buyPloy, deployOk, doMark, doMove, endActivation,
  engagedEnemies, getOp, isInjured, killGrade, killOpVP, living, markCheck, moveAllowance, moveStat, newGame, opName,
  counterCandidates, passCounter, endFight, fightApply, fightAutoChoice, fightChooser, fightOp, fightOptions, fightWeapon, startFight,
  radius, resolveShoot, setOrder, shootCheck, startBattle, startFirefight, team, totalVP, tpl, MAX_TP,
} from './game.js';
import { renderBoard } from './board.js';
import { clampPath, findPath, moveCtx } from './path.js';
import { aiStep, aiStrategy } from './ai.js';
import { HELP } from './help.js';

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
  setup: { teams: ['astartes', 'greenskin'], ai: 1 },
};
let aiTimer = null;

// ---------- persistence ----------
function save() { try { if (g) localStorage.setItem(SAVE_KEY, JSON.stringify(g)); } catch { /* ignore */ } }
function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lang = () => getLang();
const nm = (op) => esc(opName(op, lang()));

// ---------- render root ----------
function render() {
  if (ui.screen === 'home') app.innerHTML = homeView();
  else if (ui.screen === 'setup') app.innerHTML = setupView();
  else app.innerHTML = gameView();
  renderModal();
  scheduleAI();
}

function topBar(extra = '') {
  return `<header class="top">
    <div class="brand" data-act="home">⚔ <span>${L('殺戮小隊 戰術模擬', 'Kill Team Tactics')}</span></div>
    ${extra}
    <div class="topbtns">
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
    <section class="teamgrid">
      ${TEAMS.map((t) => `<article class="teamcard" style="--tc:${t.color}">
        <h3>${esc(tx(t.name))}</h3><div class="tag">${esc(tx(t.style))}</div>
        <p>${esc(tx(t.blurb))}</p>
        <p class="rule"><b>${esc(tx(t.rule.name))}</b>：${esc(tx(t.rule.desc))}</p>
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
      <b>${esc(tx(t.name))}</b><span>${esc(tx(t.style))} · ${t.ops.reduce((n, o) => n + o.count, 0)} ${L('人', 'ops')}</span></button>`).join('')}</div>
    ${side === 1 ? `<label class="aitoggle"><input type="checkbox" data-act="ai" ${s.ai === 1 ? 'checked' : ''}> ${L('由電腦控制', 'Computer controlled')}</label>` : ''}
    ${roster(TEAM_MAP[s.teams[side]])}
  </div>`;
  return `${topBar()}
  <main class="setup">
    <div class="picks">${pick(0)}${pick(1)}</div>
    <div class="setupbar"><button class="ghost" data-act="home">${L('返回', 'Back')}</button>
    <button class="primary big" data-act="start">${L('開始部署', 'Start Deployment')}</button></div>
  </main>`;
}

function roster(t) {
  return `<div class="roster">
    <p class="rule"><b>${esc(tx(t.rule.name))}</b>：${esc(tx(t.rule.desc))}</p>
    ${t.ops.map((o) => `<div class="rrow"><span>${o.count > 1 ? `${o.count}× ` : ''}${esc(tx(o.name))}</span>
      <span class="stats">APL ${o.apl} · M ${o.move}" · SV ${o.save}+ · W ${o.wounds}</span></div>`).join('')}
  </div>`;
}

// ---------- game ----------
function gameView() {
  const scoreBox = (side) => {
    const t = team(g, side);
    const isTurn = g.phase === 'firefight' && g.turn === side;
    return `<div class="score ${isTurn ? 'turn' : ''}" style="--tc:${t.color}">
      <div class="sname">${esc(tx(t.name))}${g.ai === side ? ' 🤖' : ''}</div>
      <div class="snums"><span title="Victory Points">VP <b>${totalVP(g, side)}</b></span><span title="Command Points">CP <b>${g.cp[side]}</b></span>
      <span title="${L('存活', 'Alive')}">👤 ${living(g, side).length}</span></div>
    </div>`;
  };
  const tpTxt = g.phase === 'deploy' ? L('部署', 'Deploy') : g.phase === 'gameover' ? L('結束', 'End') : `TP ${g.tp}/${MAX_TP}`;
  const bar = `<div class="scorebar">${scoreBox(0)}<div class="tp">${tpTxt}</div>${scoreBox(1)}</div>`;
  return `${topBar(bar)}
  <main class="game">
    <div class="boardwrap">${renderBoard(g, boardUi())}</div>
    <aside class="panel">${panelView()}${logView()}</aside>
  </main>`;
}

function boardUi() {
  const b = { sel: ui.sel, path: ui.path, highlight: null, ring: null, los: null };
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
  const sel = ui.sel && getOp(g, ui.sel);
  return `<section class="card">
    <h2>${L('部署階段', 'Deployment')}</h2>
    <p class="hint">${L('點選己方操作員，再點擊己方部署區（有顏色的區域）放置。已自動部署，可直接開始。',
    'Tap one of your operatives, then tap inside your coloured deployment zone. Already auto-deployed — you can start right away.')}</p>
    <div class="row">
      <button data-act="autodeploy" data-side="0">${L('重新自動部署 P1', 'Auto-deploy P1')}</button>
      ${g.ai === 1 ? '' : `<button data-act="autodeploy" data-side="1">${L('重新自動部署 P2', 'Auto-deploy P2')}</button>`}
    </div>
    <button class="primary wide" data-act="begin">${L('開始戰鬥 ▶', 'Begin Battle ▶')}</button>
  </section>${sel ? datacard(sel) : ''}`;
}

function strategyPanel() {
  const side = (s) => {
    const t = team(g, s);
    if (g.ai === s) {
      return `<div class="ploys" style="--tc:${t.color}"><h3>${esc(tx(t.name))} 🤖</h3>
        <p class="hint">${g.ploys[s].length ? g.ploys[s].map((id) => esc(tx(t.ploys.find((p) => p.id === id).name))).join('、') : L('未使用計謀', 'No ploys')}</p></div>`;
    }
    return `<div class="ploys" style="--tc:${t.color}"><h3>${esc(tx(t.name))} · CP ${g.cp[s]}</h3>
      ${t.ploys.map((p) => {
        const on = g.ploys[s].includes(p.id);
        return `<button class="ploy ${on ? 'on' : ''}" data-act="ploy" data-side="${s}" data-ploy="${p.id}" ${on || g.cp[s] < p.cp ? 'disabled' : ''}>
          <b>${esc(tx(p.name))}</b> <span class="cp">${p.cp}CP</span><small>${esc(tx(p.desc))}</small></button>`;
      }).join('')}</div>`;
  };
  const ini = team(g, g.initiative);
  return `<section class="card">
    <h2>${L(`第 ${g.tp} 回合・策略階段`, `TP ${g.tp} · Strategy Phase`)}</h2>
    <p>${L('主動權擲骰', 'Initiative roll')}：<b>${g.initRoll[0]}</b> : <b>${g.initRoll[1]}</b> → <b style="color:${ini.color}">${esc(tx(ini.name))}</b> ${L('先手', 'goes first')}</p>
    <p class="hint">${L('可花費 CP 使用策略計謀，效果持續到本回合結束。', 'Spend CP on strategy ploys; they last until the end of this Turning Point.')}</p>
    ${side(0)}${side(1)}
    <button class="primary wide" data-act="firefight">${L('進入交戰階段 ▶', 'Start Firefight ▶')}</button>
  </section>`;
}

function gameOverPanel() {
  const w = g.winner;
  const line = (s) => `<tr><td style="color:${team(g, s).color}">${esc(tx(team(g, s).name))}</td><td>${g.kills[s]}</td><td>${killGrade(g, s)}</td><td>${killOpVP(g, s)}</td><td><b>${totalVP(g, s)}</b></td></tr>`;
  return `<section class="card">
    <h2>${w == null ? L('平手！', 'Draw!') : L(`${tx(team(g, w).name)} 獲勝！`, `${tx(team(g, w).name)} wins!`)}</h2>
    <table class="final"><tr><th></th><th>${L('擊殺數', 'Kills')}</th><th>${L('擊殺等級', 'Grade')}</th><th>Kill Op</th><th>${L('總分', 'Total')}</th></tr>${line(0)}${line(1)}</table>
    <p class="hint small">${L('擊殺任務：每升一個擊殺等級得 1 VP；結束時擊殺等級較高者再得 1 VP。', 'Kill Op: 1VP per kill grade reached; +1VP at the end for the higher kill grade.')}</p>
    <button class="primary wide" data-act="setup">${L('再來一場', 'Play Again')}</button>
  </section>`;
}

function firefightPanel() {
  const op = activeOp(g);
  const t = team(g, g.turn);
  const aiTurn = g.ai === g.turn;
  let html = `<section class="card turnbanner" style="--tc:${t.color}">
    <h2>${esc(tx(t.name))} ${L('的回合', '— your move')}</h2>`;
  if (aiTurn) {
    html += `<p class="hint">${L('電腦思考中…', 'Computer is thinking…')}</p></section>`;
    const sel = ui.sel && getOp(g, ui.sel);
    return html + (op ? datacard(op) : sel ? datacard(sel) : '');
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
    return html + (sel ? datacard(sel) : '');
  }
  if (!op) {
    const ready = living(g, g.turn).filter((o) => o.ready);
    html += `<p class="hint">${L('選擇一名「準備中」的操作員啟動（點擊棋子或下方名單）。', 'Choose a ready operative to activate (tap it on the board or below).')}</p>
      <div class="readylist">${ready.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`;
    const sel = ui.sel && getOp(g, ui.sel);
    if (sel && sel.side === g.turn && sel.ready) html += `<button class="primary wide" data-act="activate" data-uid="${sel.uid}">${L('啟動', 'Activate')} ${nm(sel)}</button>`;
    html += '</section>';
    return html + (sel ? datacard(sel) : '');
  }

  // Active operative
  const apMax = op.counter ? 1 : tpl(op).apl;
  html += `<div class="activehead"><b>${nm(op)}${op.counter ? ` <small>${L('（反擊）', '(counteract)')}</small>` : ''}</b><span class="ap">${'●'.repeat(op.ap)}${'○'.repeat(Math.max(0, apMax - op.ap))} AP</span></div>`;
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
  const sel = ui.sel && ui.sel !== op.uid ? getOp(g, ui.sel) : null;
  return html + datacard(op) + (sel ? datacard(sel) : '');
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
    return `<div class="mode"><h3>${L('選擇武器', 'Choose weapon')}</h3>
      ${tpl(op).weapons.map((w, i) => (w.type === type ? `<button class="weapon" data-act="weapon" data-i="${i}">${weaponLine(w)}</button>` : '')).join('')}
      <div class="row">${cancel}</div></div>`;
  }
  if (m.kind === 'shoot') return `<div class="mode"><h3>${esc(tx(m.weapon.name))}</h3><p class="hint">${L('點擊紅圈標示的敵人射擊。🛡 = 目標在掩護中（保留 1 顆豁免）。', 'Tap a highlighted enemy. 🛡 = target in cover (retains a save).')}</p><div class="row">${cancel}</div></div>`;
  if (m.kind === 'fight') return `<div class="mode"><h3>${esc(tx(m.weapon.name))}</h3><p class="hint">${L('點擊交戰中的敵人。', 'Tap an engaged enemy.')}</p><div class="row">${cancel}</div></div>`;
  if (m.kind === 'mark') return `<div class="mode"><h3>${L('標記', 'Mark')}</h3><p class="hint">${L('點擊一個可見敵人進行標記。', 'Tap a visible enemy to mark it.')}</p><div class="row">${cancel}</div></div>`;
  return '';
}

function ruleText(rules) {
  return Object.entries(rules).filter(([k]) => RULE_LABELS[k]).map(([k, v]) => {
    const lab = tx(RULE_LABELS[k]);
    if (v === true) return lab;
    if (k === 'range') return `${lab} ${v}"`;
    if (k === 'lethal') return `${lab} ${v}+`;
    return `${lab} ${v}`;
  }).join(', ');
}

function weaponLine(w) {
  return `<span class="wname">${w.type === 'ranged' ? '⌖' : '⚔'} ${esc(tx(w.name))}</span>
    <span class="wstats">A${w.atk} · ${w.hit}+ · ${w.dmg[0]}/${w.dmg[1]}</span>
    ${ruleText(w.rules) ? `<span class="wrules">${esc(ruleText(w.rules))}</span>` : ''}`;
}

function datacard(op) {
  const t = tpl(op);
  const tm = team(g, op.side);
  const flags = [];
  if (isInjured(op)) flags.push(`<span class="flag inj">${L('受傷：Move -2"、命中 -1', 'Injured: -2" Move, -1 to hit')}</span>`);
  if (op.marked) flags.push(`<span class="flag mk">${L('已被標記', 'Marked')}</span>`);
  if (op.order === 'conceal') flags.push(`<span class="flag">◐ ${L('隱蔽', 'Concealed')}</span>`);
  if (g.phase === 'firefight' && !op.ready && g.active !== op.uid) flags.push(`<span class="flag">${L('已行動', 'Expended')}</span>`);
  return `<section class="card datacard" style="--tc:${tm.color}">
    <h3>${nm(op)} <small>${esc(tx(tm.name))}</small></h3>
    <div class="statline">
      <div><span>APL</span><b>${t.apl}</b></div><div><span>MOVE</span><b>${moveStat(g, op)}"</b></div>
      <div><span>SAVE</span><b>${t.save}+</b></div><div><span>WOUNDS</span><b>${op.wounds}/${op.maxW}</b></div>
    </div>
    ${flags.length ? `<div class="flags">${flags.join('')}</div>` : ''}
    <table class="weapons"><tr><th></th><th>ATK</th><th>HIT</th><th>DMG</th></tr>
    ${t.weapons.map((w) => `<tr><td>${w.type === 'ranged' ? '⌖' : '⚔'} ${esc(tx(w.name))}${ruleText(w.rules) ? `<div class="wrules">${esc(ruleText(w.rules))}</div>` : ''}</td>
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

function fightView() {
  const f = g.fight;
  const ops = { A: fightOp(g, 'A'), D: fightOp(g, 'D') };
  const col = (k) => team(g, ops[k].side).color;
  const who = (k) => `<b style="color:${col(k)}">${nm(ops[k])}</b>`;
  const pool = (k) => {
    const p = f[k];
    const chips = '<span class="die crit small">★</span>'.repeat(p.c) + '<span class="die norm small">✓</span>'.repeat(p.n);
    return `<div class="fside ${!f.done && f.turn === k ? 'now' : ''}" style="--tc:${col(k)}">
      <div class="fhead">${who(k)} <small>${esc(tx(fightWeapon(g, k).name))} · ${f[k].hit}+ · ${fightWeapon(g, k).dmg.join('/')}${p.brutal ? ` · ${L('殘暴', 'Brutal')}` : ''}</small></div>
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
  if (f.done) {
    action = `<button class="primary wide" data-act="fightdone">${L('繼續', 'Continue')}</button>`;
  } else if (g.ai === fightChooser(g)) {
    action = `<p class="hint">${L('電腦選擇中…', 'Computer is choosing…')}</p>`;
  } else {
    const label = (o) => {
      if (o.act === 'strike') return o.die === 'c' ? L(`打擊（暴擊）→ ${o.dmg} 傷害`, `Strike (crit) → ${o.dmg} dmg`) : L(`打擊（普通）→ ${o.dmg} 傷害`, `Strike (normal) → ${o.dmg} dmg`);
      if (o.id === 'parry-c-c') return L('格擋：用暴擊擋掉對方一個暴擊', 'Parry: crit cancels an enemy crit');
      if (o.id === 'parry-c-n') return L('格擋：用暴擊擋掉對方一個普通', 'Parry: crit cancels an enemy normal');
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

const die = (d) => `<span class="die ${d.res}${d.rr ? ' rr' : ''}${d.rend ? ' rend' : ''}" title="${d.rr ? 'Re-rolled' : ''}">${d.v}</span>`;

function resultView(r) {
  const a = getOp(g, r.attacker), t = getOp(g, r.target);
  const ca = team(g, a.side).color, ct = team(g, t.side).color;
  if (r.kind === 'shoot') {
    const notes = [];
    if (r.inCover) notes.push(L(`掩護：保留 ${r.coverSaves} 顆豁免`, `Cover: ${r.coverSaves} save retained`));
    if (r.pierce) notes.push(L(`穿甲：少擲 ${r.pierce} 顆`, `Piercing: ${r.pierce} fewer dice`));
    const rt = ruleText(Object.fromEntries(Object.entries(r.rules).filter(([k]) => k !== 'range')));
    return `<h2>⌖ ${L('射擊', 'Shooting')}</h2>
      <p><b style="color:${ca}">${nm(a)}</b> → <b style="color:${ct}">${nm(t)}</b> · ${esc(tx(r.weapon.name))}</p>
      ${rt ? `<p class="hint small">${esc(rt)}</p>` : ''}
      <div class="dicerow"><label>${L('攻擊', 'Attack')} (${r.hit}+)</label>${r.attack.dice.map(die).join('')}
        <em>${L(`${r.attack.crits} 暴擊 / ${r.attack.norms} 命中`, `${r.attack.crits} crit / ${r.attack.norms} hit`)}</em></div>
      <div class="dicerow"><label>${L('防禦', 'Defence')} (${r.save}+)</label>${'<span class="die norm cover">🛡</span>'.repeat(r.coverSaves)}${r.defence.dice.map(die).join('')}
        <em>${L(`${r.defence.crits} 暴擊豁免 / ${r.defence.norms + r.coverSaves} 豁免`, `${r.defence.crits} crit save / ${r.defence.norms + r.coverSaves} save`)}</em></div>
      ${notes.length ? `<p class="hint small">${notes.join(' · ')}</p>` : ''}
      <div class="outcome">${L(`未擋下：${r.remC} 暴擊、${r.remN} 普通 → <b>${r.dmg}</b> 傷害`, `Unblocked: ${r.remC} crit, ${r.remN} normal → <b>${r.dmg}</b> damage`)}
        <div>${nm(t)}：${r.before} → ${r.after} ${r.killed ? '☠' : ''}</div></div>
      <button class="primary wide" data-act="closeresult">${L('繼續', 'Continue')}</button>`;
  }
  return '';
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
  // Auto-end a player activation with no AP left (after a move or mark).
  const a = activeOp(g);
  if (a && !ui.result && !g.fight && g.ai !== g.turn && (a.ap <= 0 || a.dead)) { endActivation(g); ui.sel = null; }
  if (g.phase === 'strategy' && g.ai != null && !g.aiPloyDone?.[g.tp]) {
    g.aiPloyDone = { ...(g.aiPloyDone || {}), [g.tp]: true };
    aiStrategy(g, g.ai);
  }
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
  if (clicked) {
    ui.sel = clicked.uid;
    if (!op && myTurn && clicked.side === g.turn && clicked.ready && evt.detail >= 2) return doActivate(clicked);
    render();
  }
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
  ui.sel = op.uid; ui.mode = null; ui.path = null;
  afterChange();
}

// ---------- events ----------
app.addEventListener('click', (e) => {
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
});

function handle(act, d) {
  const op = g && activeOp(g);
  switch (act) {
    case 'home': ui.screen = 'home'; return render();
    case 'help': ui.help = true; return render();
    case 'closehelp': ui.help = false; return render();
    case 'lang': setLang(getLang() === 'zh' ? 'en' : 'zh'); return render();
    case 'setup': ui.screen = 'setup'; return render();
    case 'pick': ui.setup.teams[+d.side] = d.team; return render();
    case 'resume': g = loadSave(); ui.screen = 'game'; ui.sel = null; ui.mode = null; ui.path = null; return render();
    case 'start':
      clearSave();
      g = newGame({ teams: [...ui.setup.teams], ai: ui.setup.ai });
      ui.screen = 'game'; ui.sel = null; ui.mode = null; ui.path = null; ui.result = null;
      return afterChange();
    case 'autodeploy': autoDeploy(g, +d.side); return afterChange();
    case 'begin': ui.sel = null; startBattle(g); return afterChange();
    case 'ploy': {
      const s = +d.side;
      buyPloy(g, s, team(g, s).ploys.find((p) => p.id === d.ploy));
      return afterChange();
    }
    case 'firefight': startFirefight(g); return afterChange();
    case 'pickop': ui.sel = d.uid; return render();
    case 'activate': return doActivate(getOp(g, d.uid));
    case 'passcounter': passCounter(g); ui.sel = null; return afterChange();
    case 'order': setOrder(g, op, d.order); return afterChange();
    case 'action': {
      if (['reposition', 'dash', 'charge', 'fallBack'].includes(d.id)) ui.mode = { kind: 'move', action: d.id };
      else if (d.id === 'shoot' || d.id === 'fight') {
        const type = d.id === 'shoot' ? 'ranged' : 'melee';
        const ws = tpl(op).weapons.filter((w) => w.type === type);
        ui.mode = { kind: d.id, weapon: ws.length === 1 ? ws[0] : null };
      } else if (d.id === 'mark') ui.mode = { kind: 'mark' };
      ui.path = null;
      return render();
    }
    case 'weapon': ui.mode.weapon = tpl(op).weapons[+d.i]; return render();
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
