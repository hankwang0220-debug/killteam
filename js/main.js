import { TOMB_WORLD_MAPS, tombWorldMapSvg } from './tombworld-maps.js';
import { tombWorldView } from './tombworld.js';
import { deathwatchRosterError } from './data/deathwatch.js';
import { murderwingRosterError } from './data/murderwing.js';
import { wreckaRosterError } from './data/wrecka.js';
import { nightlordsRosterError } from './data/nightlords.js';
import { prescienceOf, canForeboding, ncForeboding } from './nightlords.js';
import { scoutsRosterError, FORWARD_SCOUTING, cleanScouting, DEFAULT_SCOUTING } from './data/scouts.js';
import { scGambitsLeft, scDiversionTargets, scTactical, scDiversion } from './scouts.js';
import { ratlingsRosterError, ratFreeCount, cleanRatFree, DEFAULT_RAT_FREE, RATLING_PLOYS } from './data/ratlings.js';
import { rtGambitLeft, rtDesignate, slingshotCheck, doSlingshot } from './ratlings.js';
import { SANCTIFIERS_EQUIPMENT, sanctifiersRosterError } from './data/sanctifiers.js';
import { ravenersRosterError } from './data/raveners.js';
import { spectresRosterError } from './data/spectres.js';
import { spPatienceOk, spPatience, spStarshellOk, spStarshell } from './spectres.js';
import { aquilonsRosterError } from './data/aquilons.js';
import { voidDancersRosterError } from './data/voiddancers.js';
import { vespidsRosterError, VS_COMMUNE_PLOYS } from './data/vespids.js';
import { stealthRosterError } from './data/stealthsuits.js';
import { wolfRosterError } from './data/wolfscouts.js';
import { hearthkynRosterError } from './data/hearthkyn.js';
import { navyRosterError } from './data/navy.js';
import { phobosRosterError } from './data/phobos.js';
import { warpcovenRosterError, warpcovenIds, WC_BOONS, WC_BOON_DEFAULT } from './data/warpcoven.js';
import { ceaselessReroll, relentlessReroll, fightCeaseless, fightRelentless, digInReroll, voidReroll, balancedReroll, fightBalanced, abilityArmed, abilityToggle, CHOICES, pendingChoice, resolveChoice, freeMovePath, moversLeft } from './game.js';
import { wsCallStormAt, wsStormOk, wsPlaceStorm, wsBestStorm, wsPounceOk, wsPouncePath, wsPounce, wsGuileOk, wsUseGuile } from './wolfscouts.js';
import { xvDroneOk, xvDrone, xvJamOk, xvJammers } from './stealthsuits.js';
import { vsPoints, vsSkytorchCheck, vsDoSkytorch } from './vespids.js';
import { adHeroicDocOk, adHeroicDocs, adHeroicDoc } from './angels.js';
import { vdChooseOk, vdChoose, vdGrantOk, vdGrantGambit, vdCandidates, vdLeadOk, vdLead, vdHasAccolade } from './voiddancers.js';
import { aqCanAbove, aqSetAbove, aqLandCheck, aqDoLand, aqDropLeft, aqRapidOk, aqRapid, aqAutoDrop, aqMoveDrop, aqOverseerOk, aqUseOverseer } from './aquilons.js';
import { pathfindersRosterError } from './data/pathfinders.js';
import { angelsRosterError } from './data/angels.js';
import { plagueRosterError } from './data/plague.js';
import { kommandosRosterError } from './data/kommandos.js';
import { kinbandRosterError } from './data/kinband.js';
import { deathKorpsRosterError, dkFreeCount, cleanDkFree, DEFAULT_DK_FREE, DK_FREE_PLOYS } from './data/deathkorps.js';
import { dkGambitOk, dkGambit } from './deathkorps.js';
import { kmGrappleCheck, kmDoGrapple } from './kommandos.js';
import { isRV, rvTunnel, rvMarkerLeft, rvPlaceMarker, rvAutoMarker, rvLinkOk, rvLink, rvCanUnderground, rvGoUnderground, rvEmergeCheck, rvDoEmerge } from './raveners.js';
import { sfGambitLeft, sfChooseOrator, sfOrator, sfSermon } from './sanctifiers.js';
import { wreckaOf } from './wrecka.js';
import { shadowPassageCheck, doShadowPassage, withinShadow, isMandrake } from './mandrakes.js';
import { dwScrambleTargets, dwScramble } from './deathwatch.js';
import { isArchon, painOptions, usePain, PAIN_NAMES, painRerollValues, setOmen } from './archon.js';
import { archonReroll, archonFightReroll, archonAutoReroll, skipArchonActivation, bribeSkip, canBribe } from './game.js';
import { TEAMS, TEAM_MAP, RULE_LABELS, IA_GROUPS } from './data/teams.js';
import { L, bi, tx, getLang, setLang } from './i18n.js';
import {
  ACTIONS, activate, activeOp, seekerOptions, useSeeker, seekerMoveCheck, canPlace, placeOp, placeEquipment, autoPlaceEquipment, autoDeployStep, finishDeployStep, availableActions, buyPloy, deployOk, doMove, endActivation,
  engagedEnemies, getOp, isInjured, killGrade, killOpVP, living, moveAllowance, moveStat, newGame, opName, makeTerrain, OBJECTIVES, DEPLOY,
  TARGET_ACTIONS, doTargetAction, aplNow, mlLevel,
  counterCandidates, passCounter, canSwitchActive, deactivate, endFight, fightApply, fightAutoChoice, fightChooser, fightOp, fightOptions, fightWeapon, startFight,
  radius, resolveShoot, setOrder, shootCheck, visibility, hasPloy, startBattle, team, totalVP, tpl, MAX_TP, ployChooser, finishPloys,
  giftsOf, CULT_GIFTS, ployCost, ployTaken, shootWeapon, doOptics, injuredPenalty, effectiveRules, statPenalty, doFlail, doDakkaDash, freePending, rollCount,
  shootFlow, endProxy, reanimMarkers, setDoctrina, primaryLeft,
  ffButtons, useFFButton, ffAttackOptions, ffToggle, ffClearPending, ffDef, ffArmed, ffToggleArm, ffKind, tacOpsFor, PRIMARY_OPS, primaryBonus, primaryBase, primaryPending, choosePrimary,
  EQUIPMENT, EQUIPMENT_LIMIT, equipmentLimitFor, equipmentOptionsFor, cleanEquipment, weaponsFor, SKILLS, setSkills, skillSlots, canCommandReroll, commandReroll, aiRerollChoice, fightCommandReroll, fightRerollDone,
  rvSensesOk, rvUseSenses, hkWritOk, hkUseWrit, phTacInitOk, phTacInit, phCommsChoose, startStrategy, setInitiative, INIT_CARDS, initWinner, useInitCard, lockInitRoll, aiInitCards, setMark, strategySwap, counterSwap, orderSwapCands, fightTargets, doSelfAction,
  NPO, mission, placeBid, doPickUp, doMissionAction, missionActionsFor, foes,
  sprintCheck, doSprint, turnFacing, doTurn, enterFromReserve, isMounted,
  goreOf, SANGUAVITAE, sangOptions, useSang, bleedTargets, useBleed, canFavour, useFavour,
  resourceLeft, resourceOptions, useResource,
  readyOps, passChain, orderIssuer, chooseGuardOrder, GUARD_ORDERS, guardOrder, eyeLeft, eyeOfAncestors, placeTactician, placeNavyOrder, ffReady, zonePending, chooseDropZone, zoneEdge, nodePlace, nodeMove, animateBegin, animateMove, animateEnd, nodalChoose, nodesDone, nodesLeftToPlace, nodeList, placeNodes, scrambleTargets, omniScramble, assignBlood, setGaze, setGloryKill,
} from './game.js';
import { renderBoard, tokenLegend, roleGlyph, roleOf } from './board.js';
import { distPointRect } from './geometry.js';
import { findPath, moveCtx, wholeInchPath } from './path.js';
import { aiAttack, aiBid, aiStep, aiStrategy } from './ai.js';
import { MISSIONS, MISSION_LIST, TAC_OPS, setClaim, claimChoices, setEnvoy, envoyChoices, setReboot } from './missions.js';
import { HELP } from './help.js';
import { modelsView, mountModels, unmountModels } from './viewer3d.js';
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
  settingsOpen: false,
  setup: { teams: ['angels', 'kommandos'], ai: 1, tactics: [null, null], mission: 'standard', map: 'default', terrainRanges: 'nearby', autoFF: (() => { try { return localStorage.getItem('ktAutoFF') === '1'; } catch { return false; } })() },
};
try { const mode = localStorage.getItem('kt.terrainRanges'); if (['nearby', 'always', 'off'].includes(mode)) ui.setup.terrainRanges = mode; } catch { /* optional preference */ }
let aiTimer = null;

/** Sides the computer plays: the AI player and mission NPOs. */
const isAI = (s) => s === NPO || (!!g && s === g.ai);

// ---------- persistence ----------
function save() { try { if (g) localStorage.setItem(SAVE_KEY, JSON.stringify(g)); } catch { /* ignore */ } }
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    // A save from a team that no longer exists (e.g. the old Astartes Strike Team) can't be resumed.
    if (s?.map?.startsWith('tombworld-')) for (const t of s.terrain || []) if (t.kind === 'heavy' && /^[AB][1-4]$/.test(t.component || '')) t.twWall = true;
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
  document.getElementById('terrain-hover')?.remove();
  if (ui.screen !== 'game' && ui.screen !== 'replay') { measure.pts = []; measure.cursor = null; measure.mode = false; angle.pts = []; angle.cursor = null; angle.mode = false; }
  if (ui.screen === 'game') noteTurn();
  if (ui.screen === 'home') app.innerHTML = homeView();
  else if (ui.screen === 'setup') app.innerHTML = setupView();
  else if (ui.screen === 'tombworld') app.innerHTML = topBar() + tombWorldView(ui.tombWorldStates);
  else if (ui.screen === 'replay') app.innerHTML = replayView();
  else if (ui.screen === 'models') app.innerHTML = topBar() + modelsView();
  else app.innerHTML = gameView();
  if (ui.screen === 'models') mountModels(app.querySelector('.m3d')); else unmountModels();
  drawMeasure();
  renderModal();
  scheduleAI();
}

// ---------- measuring tool ----------
// Right-click adds a point, Esc removes the last one, left-click clears. Points on an operative snap
// to it and distances are measured from base edges, like on the tabletop. Usable at any time.
// On touch screens the 📏 button turns on measuring mode, where taps on the board add points.
const measure = { pts: [], cursor: null, mode: false };

// Angle tool (only in battles with Exodite Dragon Masters, whose riders Sprint within 45° of their
// facing): the first tap is the corner — on a rider it also takes its facing as the first side —
// then one or two more taps give the sides, and the angle between them is shown in degrees.
const angle = { pts: [], cursor: null, mode: false };
const angleOn = () => { const st = shownState(); return !!st?.teams?.some((t) => TEAM_MAP[t]?.dragonMasters); };

function angleRays() {
  const [v, ...rest] = angle.pts;
  if (!v) return null;
  const pts = angle.cursor && rest.length < (v.facing != null ? 1 : 2) ? [...rest, angle.cursor] : rest;
  const dirs = [];
  if (v.facing != null) dirs.push({ a: v.facing, len: 4, facing: true });
  for (const p of pts) if (Math.hypot(p.x - v.x, p.y - v.y) > 0.05) dirs.push({ a: Math.atan2(p.y - v.y, p.x - v.x), len: Math.hypot(p.x - v.x, p.y - v.y), p });
  if (dirs.length < 2) return { v, dirs, deg: null };
  let d = Math.abs(dirs[1].a - dirs[0].a) % (2 * Math.PI);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return { v, dirs: dirs.slice(0, 2), deg: d * 180 / Math.PI };
}

function angleBar() {
  const r = angleRays();
  const info = r?.deg != null
    ? `${L('角度', 'Angle')} <b>${r.deg.toFixed(0)}°</b>${r.v.facing != null ? ` <small>${r.deg <= 45.5 ? L('（在正前方 45° 內，可直線疾馳）', '(within 45° of its facing: it can Sprint there)') : r.deg >= 134.5 ? L('（在正後方 45° 內，可向後疾馳）', '(within 45° behind: it can Sprint backwards there)') : L('（超出 45°）', '(beyond 45°)')}</small>` : ''}`
    : !angle.pts.length ? L('點角的頂點（點坐騎時以牠的面向為第一邊）', 'Tap the corner (tap a rider to use its facing as the first side)')
      : L('再點一個位置', 'Tap another point');
  return `<div class="boardtools on">
    <span>📐 ${info}</span>
    <button data-act="aundo" ${angle.pts.length ? '' : 'disabled'}>↶ ${L('上一點', 'Undo')}</button>
    <button data-act="aclear" ${angle.pts.length ? '' : 'disabled'}>${L('清除', 'Clear')}</button>
    <button class="primary" data-act="aend">✕ ${L('結束', 'Done')}</button>
  </div>`;
}

function anglePoint(evt) {
  const opEl = evt.target.closest?.('[data-uid]');
  const st = shownState();
  const op = opEl && st ? getOp(st, opEl.dataset.uid) : null;
  if (op && !op.dead) return { x: op.x, y: op.y, facing: !angle.pts.length && isMounted(op) ? (op.facing || 0) : null };
  const p = svgPoint(evt);
  return { x: p.x, y: p.y, facing: null };
}

function addAnglePoint(p) {
  const v = angle.pts[0];
  // A finished angle starts over with the next tap.
  if (v && angle.pts.length >= (v.facing != null ? 2 : 3)) angle.pts = [];
  angle.pts.push(p); angle.cursor = null;
}

function drawAngle() {
  const r = angleRays();
  if (!r) return '';
  const f = (n) => +n.toFixed(3), s = [], { v } = r;
  s.push(`<circle cx="${f(v.x)}" cy="${f(v.y)}" r="0.16" class="mpt"/>`);
  for (const d of r.dirs) s.push(`<line x1="${f(v.x)}" y1="${f(v.y)}" x2="${f(v.x + Math.cos(d.a) * d.len)}" y2="${f(v.y + Math.sin(d.a) * d.len)}" class="angleLine ${d.facing ? 'facingSide' : ''}"/>`);
  if (r.deg != null) {
    const [a0, a1] = [r.dirs[0].a, r.dirs[1].a];
    let delta = a1 - a0; while (delta > Math.PI) delta -= 2 * Math.PI; while (delta < -Math.PI) delta += 2 * Math.PI;
    const R = 1.2, p0 = { x: v.x + Math.cos(a0) * R, y: v.y + Math.sin(a0) * R }, p1 = { x: v.x + Math.cos(a0 + delta) * R, y: v.y + Math.sin(a0 + delta) * R };
    s.push(`<path d="M${f(v.x)} ${f(v.y)} L${f(p0.x)} ${f(p0.y)} A${R} ${R} 0 0 ${delta > 0 ? 1 : 0} ${f(p1.x)} ${f(p1.y)} Z" class="angleArc"/>`);
    const mid = a0 + delta / 2;
    s.push(`<text x="${f(v.x + Math.cos(mid) * (R + 0.7))}" y="${f(v.y + Math.sin(mid) * (R + 0.7) + 0.2)}" class="angleTxt">${r.deg.toFixed(0)}°</text>`);
  }
  return s.join('');
}

function measureBar() {
  if (angle.mode) return angleBar();
  if (!measure.mode) {
    return `<div class="boardtools"><button class="ghost" data-act="mstart">📏 ${L('測量距離', 'Measure')}</button>${angleOn() ? `<button class="ghost" data-act="astart">📐 ${L('測量角度', 'Angle')}</button>` : ''}</div>`;
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
  if (angle.mode) { layer.innerHTML = drawAngle(); return; }
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
  if (angle.mode) {
    if (!angle.pts.length || e.pointerType === 'touch' || !e.target.closest('#board')) return;
    angle.cursor = anglePoint(e); angle.cursor.facing = null;
    return drawMeasure();
  }
  // Touch has no hover, so only a mouse draws the live segment to the cursor.
  if (!measure.pts.length || e.pointerType === 'touch' || !e.target.closest('#board')) return;
  measure.cursor = measurePoint(e);
  drawMeasure();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && angle.mode && angle.pts.length) { angle.pts.pop(); angle.cursor = null; return drawMeasure(); }
  if (e.key !== 'Escape' || !measure.pts.length) return;
  measure.pts.pop();
  if (!measure.pts.length) measure.cursor = null;
  drawMeasure();
});
// Measuring mode: a tap on the board adds a point and does nothing else.
// Otherwise a left-click anywhere clears the measurement; on the board that click is used up by the clear.
document.addEventListener('click', (e) => {
  if (e.button !== 0) return;
  if (angle.mode) {
    if (!e.target.closest('#board')) return;
    e.stopPropagation();
    addAnglePoint(anglePoint(e));
    drawMeasure();
    return;
  }
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

/** extra: the score bar (shown on the left); status: the turn status field (centre). */
function topBar(extra = '', status = '') {
  const replayBtn = ui.screen === 'game' && g?.replay?.snaps.length
    ? `<button class="ghost" data-act="replay">📜 ${L('複盤', 'Replay')}</button>` : '';
  const tools = `<button class="ghost" data-act="help">${L('規則', 'Rules')}</button>
      <button class="ghost" data-act="models" title="${L('3D 模型', '3D Models')}">${L('3D 模型', '3D Models')}</button>
      <button class="ghost" data-act="lang">${L('EN', '中文')}</button>`;
  const settings = `<details class="game-settings" ${ui.settingsOpen ? 'open' : ''}>
      <summary aria-label="${L('設定', 'Settings')}" title="${L('設定', 'Settings')}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 3-.5 2a8 8 0 0 0-1.7 1L4.8 5.4l-3 5.2L3.3 12a8 8 0 0 0 0 2l-1.5 1.4 3 5.2 2-.6a8 8 0 0 0 1.7 1l.5 2h6l.5-2a8 8 0 0 0 1.7-1l2 .6 3-5.2-1.5-1.4a8 8 0 0 0 0-2l1.5-1.4-3-5.2-2 .6a8 8 0 0 0-1.7-1L15 3Z" transform="translate(0 -1) scale(1 .95)"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </summary>
      <div class="settings-menu" role="group" aria-label="${L('遊戲設定', 'Game settings')}">${replayBtn}${tools}</div>
    </details>`;
  return `<header class="top">
    <div class="topleft">
      <div class="brand" data-act="home">⚔ <span>${L('殺戮小隊 戰術模擬', 'Kill Team Tactics')}</span></div>
      ${extra}
    </div>
    ${status || '<div></div>'}
    <div class="topbtns">
      ${ui.screen === 'game' ? settings : tools}
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
        <button class="primary big" data-act="setup">${L('新戰役', 'New Campaign')}</button>
        ${saved && saved.phase !== 'gameover' ? `<button class="big" data-act="resume">${L('繼續上一場', 'Resume')}</button>` : ''}
        <button class="big ghost" data-act="help">${L('規則速查', 'Quick Rules')}</button>
      </div>
    </section>
    ${historyView()}
  </main>`;
}

// ---------- setup ----------
function setupView() {
  const s = ui.setup;
  const ms = MISSIONS[s.mission] || MISSIONS.standard;
  if (!['teams', 'units', 'kit'].includes(s.step)) return missionStepView(ms);
  const aiHidden = (side) => side === 1 && s.ai === 1 && !s.aiCustom; // the computer picks its own operatives, tactics and scouting
  const sideName = (side) => `${side === 0 ? L('玩家 1（A）', 'Player 1 (A)') : s.ai === 1 ? L('電腦（B）', 'Computer (B)') : L('玩家 2（B）', 'Player 2 (B)')} · ${esc(bi(TEAM_MAP[s.teams[side]].name))}`;
  // Step 2: the team for each side, from a searchable list, with the chosen team's profile underneath.
  const teamPick = (side) => { const t = TEAM_MAP[s.teams[side]]; return `<div class="pick">
    <h3>${side === 0 ? L('玩家 1（A）', 'Player 1 (A)') : L('玩家 2（B）', 'Player 2 (B)')}</h3>
    ${side === 1 ? `<label class="aitoggle"><input type="checkbox" data-act="ai" ${s.ai === 1 ? 'checked' : ''}> ${L('由電腦控制', 'Computer controlled')}</label>${s.ai === 1 ? `<label class="aitoggle"><input type="checkbox" data-act="aicustom" ${s.aiCustom ? 'checked' : ''}> ${L('自訂電腦隊伍（自己選它的特工與武器）', 'Customise the computer team (pick its operatives and weapons)')}</label>` : ''}` : ''}
    <input class="teamsearch" type="search" data-act="teamSearch" data-side="${side}" value="${esc(s.search?.[side] || '')}" placeholder="${L('搜尋隊伍名稱或風格…', 'Search team name or style…')}">
    <div class="picklist">${TEAMS.map((tm) => { const key = `${tm.name.zh} ${tm.name.en} ${tx(tm.style)}`.toLowerCase(); const q = (s.search?.[side] || '').trim().toLowerCase();
      return `<button class="teampick ${s.teams[side] === tm.id ? 'on' : ''}" style="--tc:${tm.color}${q && !key.includes(q) ? ';display:none' : ''}" data-act="pick" data-side="${side}" data-team="${tm.id}" data-search="${esc(key)}">
      <b>${esc(bi(tm.name))}</b><span>${esc(tx(tm.style))} · ${tm.id === 'warpcoven' ? warpcovenIds(tm).length : tm.ops.reduce((n, o) => n + o.count, 0)} ${L('人', 'ops')}</span></button>`; }).join('')}</div>
    <article class="teamcard chosen" style="--tc:${t.color}"><h3>${esc(bi(t.name))}</h3><div class="tag">${esc(tx(t.style))}</div>
      <p>${esc(tx(t.blurb))}</p><p class="rule"><b>${esc(bi(t.rule.name))}</b>：${esc(tx(t.rule.desc))}</p>${teamInfo(t)}</article>
  </div>`; };
  // Step 3: who takes the field and with which weapons.
  const unitsPick = (side) => `<div class="pick"><h3>${sideName(side)}</h3>
    ${aiHidden(side) ? `<p class="hint small">${L('電腦自己決定上場特工與武器（見上方公布的名單）。', 'The computer picks its own operatives and weapons (see the list it announced above).')}</p>` : unitPick(side)}
    ${roster(TEAM_MAP[s.teams[side]], side)}</div>`;
  // Step 4: tactics, Tac Ops, equipment and the team's pre-battle choices.
  const kitPick = (side) => `<div class="pick"><h3>${sideName(side)}</h3>
    ${aiHidden(side) ? '' : tacticsPick(side)}
    ${tacOpPick(side)}
    ${equipPick(side)}
    ${aiHidden(side) ? '' : scoutingPick(side) + ratFreePick(side) + dkFreePick(side) + vsCommunePick(side)}
  </div>`;
  const steps = [['mission', L('任務與地圖', 'Mission & map')], ['teams', L('選擇隊伍', 'Teams')], ['units', L('特工與武器', 'Operatives & weapons')], ['kit', L('戰術與裝備', 'Tactics & equipment')]];
  const at = steps.findIndex(([id]) => id === s.step);
  const mapName = ms.terrain ? L('任務專屬地圖', "The mission's own map") : s.map === 'default' ? L('原有地圖', 'Default map') : bi((TOMB_WORLD_MAPS.find((m) => m.id === s.map) || TOMB_WORLD_MAPS[0]).name);
  const next = s.step === 'kit' ? `<button class="primary big" data-act="start">${L('開始部署', 'Start Deployment')}</button>`
    : `<button class="primary big" data-act="setupStep" data-step="${steps[at + 1][0]}">${L('下一步：', 'Next: ')}${steps[at + 1][1]}</button>`;
  return `${topBar()}
  <main class="setup">
    <ol class="setupsteps">${steps.map(([id, name], i) => `<li class="${i === at ? 'on' : i < at ? 'done' : ''}">${i < at ? `<button class="linklike" data-act="setupStep" data-step="${id}">${i + 1}. ${name}</button>` : `${i + 1}. ${name}`}</li>`).join('')}</ol>
    <section class="card missionpick setup-summary"><div><b>${L('任務', 'Mission')}：</b>${esc(bi(ms.name))}　<b>${L('地圖', 'Map')}：</b>${esc(mapName)}</div>
      <button class="ghost" data-act="setupStep" data-step="mission">${L('更改任務與地圖', 'Change mission and map')}</button></section>
    ${s.step === 'teams' ? `<div class="picks">${teamPick(0)}${teamPick(1)}</div>` : ''}
    ${s.step === 'units' ? `${aiReveal()}<div class="picks">${unitsPick(0)}${unitsPick(1)}</div>` : ''}
    ${s.step === 'kit' ? `${displaySettings()}${aiReveal()}<div class="picks">${kitPick(0)}${kitPick(1)}</div>` : ''}
    <div class="setupbar"><button class="ghost" data-act="setupStep" data-step="${steps[at - 1][0]}">${L('上一步', 'Back')}</button>
    ${next}</div>
  </main>`;
}

/** Display options for the battle (shown on the last setup step). */
function displaySettings() {
  return `<section class="card missionpick"><h3>${L('顯示設定', 'Display settings')}</h3>
      <label>${L('地形 1 吋範圍', 'Terrain 1-inch boundaries')}
      <select data-act="terrainRanges">${[['nearby', L('單位進入範圍時顯示（預設）', 'Show when an operative is within range (default)')], ['always', L('全部顯示', 'Always show')], ['off', L('不顯示', 'Hide')]].map(([id, text]) => `<option value="${id}" ${ui.setup.terrainRanges === id ? 'selected' : ''}>${text}</option>`).join('')}</select></label>
      <p class="hint small">${L('以底座邊緣判定距離；範圍線是距離參考，實際效果依攻擊方向與規則判定。', 'Distances use base edges; boundaries are guides, effects depend on attack direction and rules.')}</p>
      <label><input type="checkbox" data-act="autoff" ${ui.setup.autoFF ? 'checked' : ''}> ${L('交戰計謀預設自動使用（熟悉規則的玩家用；預設關閉）', 'Firefight ploys used automatically from the start (for players who know the rules; off by default)')}</label>
      <p class="hint small">${L('關閉時，被射擊、受傷等時機才觸發的交戰計謀一開始都不會自動用，要在策略階段的「自動使用的交戰計謀」自己勾選。', 'When off, firefight ploys that trigger on being shot, damaged and so on start unticked; tick the ones you want in "Firefight ploys used automatically" in the Strategy phase.')}</p></section>`;
}

/** A small top-down picture of a 30"×22" killzone: drop zones, terrain and objective markers. */
function killzoneSvg(terrain, objectives, deploy, label) {
  const zones = deploy.map((z, i) => `<rect x="${z.x0}" y="${z.y0}" width="${z.x1 - z.x0}" height="${z.y1 - z.y0}" fill="${i ? '#e59b69' : '#75a8b7'}" opacity=".25"/><text x="${(z.x0 + z.x1) / 2}" y="${(z.y0 + z.y1) / 2}" class="tw-map-zone">${i ? 'B' : 'A'}</text>`).join('');
  const solids = terrain.map((t) => `<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" class="${t.kind === 'light' ? 'tw-light' : 'tw-solid'}"/>`).join('');
  const objs = objectives.map((p, i) => `<g class="tw-map-objective"><circle cx="${p.x}" cy="${p.y}" r="1.4"/><circle cx="${p.x}" cy="${p.y}" r=".4"/><text x="${p.x}" y="${p.y + 0.23}">${i + 1}</text></g>`).join('');
  const grid = Array.from({ length: 5 }, (_, i) => `<path d="M${(i + 1) * 5} 0V22"/>`).join('') + Array.from({ length: 3 }, (_, i) => `<path d="M0 ${(i + 1) * 5.5}H30"/>`).join('');
  return `<svg class="tw-map" viewBox="-.7 -.7 31.4 23.4" role="img" aria-label="${esc(label)}"><rect width="30" height="22" class="tw-map-mat"/>${zones}<g class="tw-map-grid">${grid}</g>${solids}${objs}</svg>`;
}

/** Step 1 of a new campaign: the mission, then the map, picked from pictures of every killzone shown below. */
function missionStepView(ms) {
  const s = ui.setup;
  const objectives = ms.objectives?.length ? ms.objectives : OBJECTIVES;
  const card = (id, name, pic, note) => `<button class="mapcard ${ms.terrain || id === s.map ? 'on' : ''}" data-act="pickMap" data-id="${id}" ${ms.terrain ? 'disabled' : ''}>
      <b>${esc(name)}</b>${pic}<span class="hint small">${note}</span></button>`;
  const maps = ms.terrain
    ? card(s.map, L('任務專屬地圖', "The mission's own map"), killzoneSvg(ms.terrain, ms.objectives || [], ms.deploy || DEPLOY, bi(ms.name)), L('此任務使用專屬地圖。', 'This mission uses its own map.'))
    : card('default', L('原有地圖', 'Default map'), killzoneSvg(makeTerrain(), objectives, ms.deploy || DEPLOY, L('原有地圖', 'Default map')), '30″ × 22″')
      + TOMB_WORLD_MAPS.map((m) => card(m.id, bi(m.name), tombWorldMapSvg(m, getLang() === 'zh'), `28″ × 24″ · ${m.axis === 'x' ? L('左右部署', 'Side deployment') : L('上下部署', 'End deployment')}`)).join('');
  return `${topBar()}
  <main class="setup">
    <section class="card missionpick"><h3>${L('① 選擇任務', '① Choose the mission')}</h3>
      <select data-act="mission">${MISSION_LIST.map((m) => `<option value="${m.id}" ${m.id === ms.id ? 'selected' : ''}>${esc(bi(m.name))}</option>`).join('')}</select>
      <p class="hint small">${esc(tx(ms.desc))}${ms.source ? ` <i>（${esc(ms.source)}）</i>` : ''}</p></section>
    <section class="card missionpick"><h3>${L('② 選擇地圖', '② Choose the map')}</h3>
      ${!ms.terrain && s.map !== 'default' ? `<p class="hint small">${L('墓穴世界：圖卡排列的平面近似；艙門預設關閉，開門／關門各 1AP，A1 保持完整。', 'Tomb World: flat approximation of the map card; hatchways start closed; opening/closing costs 1AP, A1 remains intact.')}</p>` : ''}
      <div class="mapgrid">${maps}</div></section>
    <div class="setupbar"><button class="ghost" data-act="home">${L('返回', 'Back')}</button>
    <button class="primary big" data-act="setupStep" data-step="teams">${L('下一步：選擇隊伍', 'Next: choose teams')}</button></div>
  </main>`;
}

/** Against the computer it announces its operatives, weapons, tactics and equipment first (the Tac Op and Primary Op stay secret). */
function aiReveal() {
  const s = ui.setup;
  if (s.ai !== 1) return '';
  let t;
  try {
    t = newGame({ roster: s.roster || [], loadouts: s.loadouts || [], teams: [...s.teams], ai: 1, mission: s.mission, map: s.map, equip: [[], undefined], tactics: [0, 1].map((x) => (TEAM_MAP[s.teams[x]].tactics ? setupTactics(x) : null)) });
  } catch (e) { return ''; }
  const ops = t.ops.filter((o) => o.side === 1).map((o) => `<li>${esc(opName(o, lang()))} <small>${weaponsFor(t, o).map((w) => esc(tx(w.name))).join(' · ')}</small></li>`).join('');
  const eq = (t.equip?.[1] || []).map((id) => esc(tx(EQUIPMENT[id].name))).join('、') || L('（無）', '(none)');
  const tac = (t.tactics?.[1] || []).map((id, i) => `${i ? '、' : ''}${esc(tx(team(t, 1).tactics.find((x) => x.id === id).name))}`).join('');
  return `<section class="card missionpick"><h3>🤖 ${L('電腦已公布的隊伍', 'The computer has announced its team')}</h3>
    <p class="hint small">${L('電腦先公布特工、武器與裝備，你再選自己的。（戰術行動與主要任務仍保密。）', 'The computer shows its operatives, weapons and equipment first; then you choose yours. (Its Tac Op and Primary Op stay secret.)')}</p>
    <ul class="small">${ops}</ul><p class="small"><b>${L('裝備', 'Equipment')}：</b>${eq}</p>${tac ? `<p class="small"><b>${L('戰團戰術', 'Chapter Tactics')}：</b>${tac}</p>` : ''}</section>`;
}

/** Primary + secondary Chapter Tactic for teams that have them (Angels of Death). */
const setupTactics = (side) => ui.setup.tactics[side] || TEAM_MAP[ui.setup.teams[side]].defaultTactics;

/** Step 1 after choosing a team: which operatives take the field and with which weapons (before tactics and equipment). */
function unitPick(side) {
  const body = rosterPick(side) + loadoutPick(side);
  return body ? `<div class="unitpick"><h4>${L('① 選擇上場單位與武器', '① Choose your operatives and weapons')}</h4>
    <p class="hint small">${L('先選好上場的特工和武器，再選戰術與裝備。', 'Pick who takes the field and their weapons first, then tactics and equipment.')}</p>${body}</div>` : '';
}

function rosterPick(side) {
  const t = TEAM_MAP[ui.setup.teams[side]], cur = ui.setup.roster?.[side] || {};
  const sel = (slot, ids, k, now) => `<select data-act="roster" data-side="${side}" data-id="${slot}"${k != null ? ` data-k="${k}"` : ''}>${ids.map((id) => `<option value="${id}" ${now === id ? 'selected' : ''}>${esc(bi(t.ops.find((o) => o.id === id).name))}</option>`).join('')}</select>`;
  return Object.entries(t.replacements || {}).map(([slot, ids]) => {
    const n = t.ops.find((o) => o.id === slot).count;
    // Blades of Khaine: every copy of a slot is picked on its own.
    if (t.perCopyRoster && n > 1) return Array.from({ length: n }, (_, k) => `<label>${esc(bi(t.ops.find((o) => o.id === slot).name))} #${k + 1}${sel(slot, ids, k, (Array.isArray(cur[slot]) ? cur[slot][k] : cur[slot]) || slot)}</label>`).join('');
    return `<label>${esc(bi(t.ops.find((o) => o.id === slot).name))}${sel(slot, ids, null, cur[slot] || slot)}</label>`;
  }).join('') + packagePick(t, side, cur) + rosterWarning(t, cur, side);
}
/** Package picks (Brood Brothers' Broodcoven selections). */
function packagePick(t, side, cur) {
  return Object.entries(t.packages || {}).map(([pid, p]) => `<label>${esc(tx(p.name))}<select data-act="roster" data-side="${side}" data-id="${pid}">${Object.entries(p.options)
    .map(([id, o]) => `<option value="${id}" ${(cur[pid] || Object.keys(p.options)[0]) === id ? 'selected' : ''}>${esc(tx(o.name))}</option>`).join('')}</select></label>`).join('');
}
/**
 * Inquisitorial Agents selection limits: requisitioned operatives from one force and within its limits; each
 * operative once (except the force's repeatable ones); two Gun Servitors only without requisitioned operatives;
 * one Piercing 2 weapon and three Piercing weapons at most.
 */
function inquisitionRosterWarning(t, cur) {
  const T = (id) => t.ops.find((o) => o.id === id);
  const ids = Object.keys(t.replacements).map((slot) => cur[slot] || slot);
  const rq = ids.filter((id) => T(id).rqGroup);
  const groups = [...new Set(rq.map((id) => T(id).rqGroup))];
  const bad = [];
  if (groups.length > 1) bad.push(L('徵用人員只能來自同一支部隊', 'Requisitioned operatives must all come from one force'));
  for (const gid of groups) {
    const gr = IA_GROUPS[gid], mine = rq.filter((id) => T(id).rqGroup === gid);
    if (mine.length > gr.max) bad.push(L(`${tx(gr.name)}最多 ${gr.max} 名`, `${tx(gr.name)}: ${gr.max} at most`));
    if (gr.gunners && mine.filter((id) => T(id).tsGunner).length > gr.gunners) bad.push(L(`槍手最多 ${gr.gunners} 名`, `${gr.gunners} Gunners at most`));
    for (const x of gr.twice || []) if (mine.filter((id) => T(id).rqFrom === x).length > 2) bad.push(L(`${tx(T(`rq_${gid}_${x}`).name)}最多 2 名`, `${tx(T(`rq_${gid}_${x}`).name)}: two at most`));
    if (gid === 'navy' && mine.some((id) => T(id).rqFrom === 'cat') && !mine.some((id) => T(id).rqFrom === 'surveyor')) bad.push(L('C.A.T. 需要勘測員', 'The C.A.T. Unit needs the Surveyor'));
    if (gid === 'navy' && mine.some((id) => T(id).rqFrom === 'gheistskull') && !mine.some((id) => T(id).rqFrom === 'voidJammer')) bad.push(L('鬼骷髏需要虛空干擾員', 'The Gheistskull needs the Void-jammer'));
  }
  const repeatOk = (id) => { const o = T(id); return !!o.rqGroup && IA_GROUPS[o.rqGroup].repeat.includes(o.rqFrom || o.id); };
  const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i && !repeatOk(id)))];
  if (dup.length) bad.push(L(`重複選了：${dup.map((id) => tx(T(id).name)).join('、')}`, `Picked more than once: ${dup.map((id) => tx(T(id).name)).join(', ')}`));
  if (rq.length && ids.filter((id) => T(id).gunServitor).length > 1) bad.push(L('有徵用人員時槍械僕從只能 1 名', 'Only one Gun Servitor with requisitioned operatives'));
  // Piercing: each weapon (all its profiles) once per operative.
  const pierce = [...ids, 'iaInterrogator'].flatMap((id) => [...new Map(T(id).weapons.filter((w) => w.rules.piercing).map((w) => [w.group, w])).values()]);
  if (pierce.filter((w) => w.rules.piercing >= 2).length > 1) bad.push(L('穿甲 2 的武器最多 1 把', 'One Piercing 2 weapon at most'));
  if (pierce.length > 3) bad.push(L(`穿甲武器 ${pierce.length} 把，最多 3 把`, `${pierce.length} Piercing weapons — three at most`));
  return bad.length ? `<p class="bad small">⚠ ${bad.map(esc).join('；')}</p>` : '';
}
/** Brood Brothers selection limits: each option once (Troopers excepted), at most three Gunners / Sniper. */
function rosterWarning(t, cur, side) {
  if (t.id === 'murderwing') { const error = murderwingRosterError(t, cur, ui.setup.loadouts?.[side]); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'nemesisClaw') { const error = nightlordsRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'scoutSquad') { const error = scoutsRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'ratlings') { const error = ratlingsRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'sanctifiers') { const error = sanctifiersRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'wolfScouts') { const error = wolfRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'hearthkyn') { const error = hearthkynRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'navyBreachers') { const error = navyRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'phobos') { const error = phobosRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'stealthSuits') { const error = stealthRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'vespids') { const error = vespidsRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'voidDancers') { const error = voidDancersRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'aquilons') { const error = aquilonsRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'spectres') { const error = spectresRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'raveners') { const error = ravenersRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'tauPathfinders') { const error = pathfindersRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'angels') { const error = angelsRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'plagueMarines') { const error = plagueRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'kommandos') { const error = kommandosRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'farstalkers') { const error = kinbandRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'deathKorps') { const error = deathKorpsRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.id === 'wreckaKrew') { // (and only one Glyphs)
    const error = wreckaRosterError(t, cur), glyphs = ['wkGlyphsW', 'wkGlyphsD'].every((id) => ui.setup.equip?.[side]?.includes(id));
    return [error && tx(error), glyphs && L('圖騰只能選一個（哇啊啊！或大破壞）', 'Pick only one Glyphs (Waaagh! or Destruction)')].filter(Boolean).map((m) => `<p class="bad small">⚠ ${esc(m)}</p>`).join('');
  }
  if (t.id === 'deathwatch') { const error = deathwatchRosterError(t, cur); return error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''; }
  if (t.insidiants) {
    const ids = Object.keys(t.replacements).map((slot) => cur[slot] || slot).map((id) => (id === 'ciCremator2' ? 'ciCremator' : id));
/** Warpcoven: each Sorcerer's Boon of Tzeentch (each boon once). */
function wcBoonPick(t, side, cur) {
  const sorc = [...new Set(warpcovenIds(t, cur))].filter((id) => t.ops.find((o) => o.id === id).sorcerer);
  return sorc.map((id) => {
    const now = cur[`boon_${id}`] || WC_BOON_DEFAULT[id];
    return `<label>${esc(bi(t.ops.find((o) => o.id === id).name))} · ${L('奸奇的恩賜', 'Boon of Tzeentch')}<select data-act="roster" data-side="${side}" data-id="boon_${id}">${Object.entries(WC_BOONS).map(([b, x]) => `<option value="${b}" ${now === b ? 'selected' : ''}>${esc(tx(x.name))}</option>`).join('')}</select></label>
      <p class="hint small">${esc(tx(WC_BOONS[now].desc))}</p>`;
  }).join('');
}
    const dup = ids.filter((id, i) => !['ciWarrior', 'ciCremator'].includes(id) && ids.indexOf(id) !== i);
    const crem = ids.filter((id) => id === 'ciCremator').length;
    const bad = [...(dup.length ? [L(`重複選了：${[...new Set(dup)].map((id) => tx(t.ops.find((o) => o.id === id).name)).join('、')}（只有修女戰士、焚化修女能重複）`, `Picked more than once: ${[...new Set(dup)].map((id) => tx(t.ops.find((o) => o.id === id).name)).join(', ')}`)] : []),
      ...(crem > 2 ? [L(`焚化修女 ${crem} 名，最多 2 名`, `${crem} Cremators — two at most`)] : [])];
    return bad.length ? `<p class="bad small">⚠ ${bad.map(esc).join('；')}</p>` : '';
  }
  if (t.inquisition) return `${inquisitionRosterWarning(t, cur)}`;
  if (t.goreTanks || t.yaegirs) { // Goremongers / Hernkyn Yaegirs: each once, except Aspirants / Warriors
    const rep = t.goreTanks ? 'gmAspirant' : 'hyWarrior';
    const ids = Object.keys(t.replacements).flatMap((slot) => (Array.isArray(cur[slot]) ? cur[slot] : Array(t.ops.find((o) => o.id === slot).count).fill(cur[slot] || slot)));
    const dup = [...new Set(ids.filter((id, i) => id !== rep && ids.indexOf(id) !== i))];
  if (t.id === 'warpcoven') { const error = warpcovenRosterError(t, cur, ui.setup.loadouts?.[side]); return wcBoonPick(t, side, cur) + (error ? `<p class="bad small">⚠ ${esc(tx(error))}</p>` : ''); }
    return dup.length ? `<p class="bad small">⚠ ${esc(L(`重複選了：${dup.map((id) => tx(t.ops.find((o) => o.id === id).name)).join('、')}（只有${tx(t.ops.find((o) => o.id === rep).name)}能重複）`, `Picked more than once: ${dup.map((id) => tx(t.ops.find((o) => o.id === id).name)).join(', ')} (only ${tx(t.ops.find((o) => o.id === rep).name)} can repeat)`))}</p>` : '';
  }
  if (t.obeliskNodes) {
    const isos = (Array.isArray(cur.ccCrawler) ? cur.ccCrawler : []).filter((id) => id === 'ccCrawlerIso').length + (cur.ccCrawler === 'ccCrawlerIso' ? 2 : 0);
    return isos > 1 ? `<p class="bad small">⚠ ${L('跨維度隔離器最多 1 把', 'One transdimensional isolator at most')}</p>` : '';
  }
  if (!t.broodBrothers) return '';
  const ids = Object.keys(t.replacements).map((slot) => cur[slot] || slot);
  const dup = ids.filter((id, i) => id !== 'bbTrooper' && ids.indexOf(id) !== i);
  const special = ids.filter((id) => id.startsWith('bbGun') || id === 'bbSniper').length;
  const bad = [...(dup.length ? [L(`重複選了：${[...new Set(dup)].map((id) => tx(t.ops.find((o) => o.id === id).name)).join('、')}（只有兵員能重複）`, `Picked more than once: ${[...new Set(dup)].map((id) => tx(t.ops.find((o) => o.id === id).name)).join(', ')} (only Troopers can repeat)`)] : []),
    ...(special > 3 ? [L(`槍手與狙擊手合計 ${special} 名，最多 3 名`, `${special} Gunners/Sniper — three at most`)] : [])];
  return bad.length ? `<p class="bad small">⚠ ${bad.map(esc).join('；')}</p>` : '';
}
function loadoutPick(side) {
  const t = TEAM_MAP[ui.setup.teams[side]];
  const cur = ui.setup.loadouts?.[side] || {};
  const rs = ui.setup.roster?.[side] || {};
  const picked = new Set([...t.ops.filter((o) => o.count).flatMap((o) => (rs[o.id] ? [rs[o.id]].flat() : [o.id])), ...(t.id === 'warpcoven' ? warpcovenIds(t, rs) : [])]); // templates in the roster (Warpcoven: from its selections)
  return t.ops.filter((o) => o.loadouts && picked.has(o.id)).map((o) => `<label>${esc(bi(o.name))}<select data-act="loadout" data-side="${side}" data-id="${o.id}">${Object.entries(o.loadouts).map(([id, ws]) => `<option value="${id}" ${(cur[o.id] || Object.keys(o.loadouts)[0]) === id ? 'selected' : ''}>${ws.map((w) => esc(tx(w.name))).join(' + ')}${o.loadoutExtra?.[id] ? ` + ${esc(tx(o.loadoutExtra[id]))}` : ''}</option>`).join('')}</select></label>`).join('');
}

/** Scout Squad: Forward Scouting — up to six options (each up to its own maximum), resolved when deployment ends. */
function scoutingPick(side) {
  if (ui.setup.teams[side] !== 'scoutSquad' || (side === 1 && ui.setup.ai === 1)) return '';
  const cur = cleanScouting(ui.setup.scouting?.[side] ?? DEFAULT_SCOUTING);
  return `<div class="tactics"><h4>${L(`前進偵察（最多 6 個，已選 ${cur.length}）`, `Forward Scouting (up to 6, ${cur.length} chosen)`)}</h4>
    ${FORWARD_SCOUTING.map((o) => {
    const n = cur.filter((x) => x === o.id).length;
    return `<div class="scoutopt small"><button data-act="scoutopt" data-side="${side}" data-id="${o.id}" data-d="-1" ${n ? '' : 'disabled'}>−</button><b>${n}/${o.max}</b>
      <button data-act="scoutopt" data-side="${side}" data-id="${o.id}" data-d="1" ${n >= o.max || cur.length >= 6 ? 'disabled' : ''}>＋</button>
      <span><b>${esc(tx(o.name))}</b><span class="hint"> — ${esc(tx(o.desc))}</span></span></div>`;
  }).join('')}
    <p class="hint small">${L('佈署完成後依序自動執行；戰術機動與誘餌在策略階段使用。', 'Resolved automatically once deployment ends; Tactical Manoeuvre and Diversion are used in the Strategy phase.')}</p></div>`;
}

/** Death Korps: the Trooper slots traded for a ploy that costs 0CP for the battle. */
/** Vespid Stingwings: Commune (the strategy ploy the Strain Leader makes free). */
function vsCommunePick(side) {
  if (ui.setup.teams[side] !== 'vespids' || (side === 1 && ui.setup.ai === 1)) return '';
  const t = TEAM_MAP.vespids, cur = VS_COMMUNE_PLOYS.includes(ui.setup.vsCommune?.[side]) ? ui.setup.vsCommune[side] : 'vsPredators';
  return `<div class="tactics"><h4>${L('交融（首領在場上且沒交戰時 0CP 的策略計謀）', 'Commune (a strategy ploy that costs 0CP while the Strain Leader is in the killzone and not engaged)')}</h4>
    <select data-act="vscommune" data-side="${side}">${t.ploys.filter((p) => VS_COMMUNE_PLOYS.includes(p.id)).map((p) => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${esc(tx(p.name))}</option>`).join('')}</select></div>`;
}
function dkFreePick(side) {
  if (ui.setup.teams[side] !== 'deathKorps' || (side === 1 && ui.setup.ai === 1)) return '';
  const t = TEAM_MAP.deathKorps, n = dkFreeCount(t, ui.setup.roster?.[side] || {});
  if (!n) return '';
  const cur = cleanDkFree(ui.setup.dkFree?.[side] ?? DEFAULT_DK_FREE, n);
  const all = [...t.ploys, ...t.firefight].filter((x) => DK_FREE_PLOYS.includes(x.id));
  return `<div class="tactics"><h4>${L(`免費計謀（${n} 個，已選 ${cur.length}）`, `Free ploys (${n}, ${cur.length} chosen)`)}</h4>
    ${all.map((x) => `<label class="small equip-option"><input type="checkbox" data-act="dkfree" data-side="${side}" data-id="${x.id}" ${cur.includes(x.id) ? 'checked' : ''} ${!cur.includes(x.id) && cur.length >= n ? 'disabled' : ''}> <span class="equip-name">${esc(tx(x.name))}</span></label>`).join('')}
    <p class="hint small">${L('把步兵名額改成計謀：所選計謀整場 0CP。', 'Trade a Trooper slot for a ploy: the chosen ploys cost 0CP all battle.')}</p></div>`;
}

/** Ratlings: the ploys that cost 0CP for the battle (three, fewer for each Ogryn or Bullgryn taken). */
function ratFreePick(side) {
  if (ui.setup.teams[side] !== 'ratlings' || (side === 1 && ui.setup.ai === 1)) return '';
  const t = TEAM_MAP.ratlings, n = ratFreeCount(t, ui.setup.roster?.[side]);
  const cur = cleanRatFree(ui.setup.ratFree?.[side] ?? DEFAULT_RAT_FREE, n);
  const all = [...t.ploys, ...t.firefight].filter((x) => RATLING_PLOYS.includes(x.id));
  return `<div class="tactics"><h4>${L(`免費計謀（${n} 個，已選 ${cur.length}）`, `Free ploys (${n}, ${cur.length} chosen)`)}</h4>
    ${all.map((x) => `<label class="small equip-option"><input type="checkbox" data-act="ratfree" data-side="${side}" data-id="${x.id}" ${cur.includes(x.id) ? 'checked' : ''} ${!cur.includes(x.id) && cur.length >= n ? 'disabled' : ''}> <span class="equip-name">${esc(tx(x.name))}</span></label>`).join('')}
    <p class="hint small">${L('所選計謀整場 0CP；每帶一名歐格林／重盾歐格林少一個。', 'Chosen ploys cost 0CP all battle; one fewer for each Ogryn or Bullgryn.')}</p></div>`;
}

/** Faction and universal equipment: four options combined (the computer takes its usual kit). */
function equipPick(side) {
  if (side === 1 && ui.setup.ai === 1) return '';
  const cur = cleanEquipment(ui.setup.teams[side], ui.setup.equip?.[side]);
  ((ui.setup.equip ||= [[], []])[side]) = cur;
  const limit = equipmentLimitFor(ui.setup.teams[side]);
  return `<div class="tactics"><h4>${L(`裝備（陣營＋通用合計最多 ${limit} 項，已選 ${cur.length}）`, `Equipment (faction + universal: ${limit} total, ${cur.length} chosen)`)}</h4>
    ${equipmentOptionsFor(ui.setup.teams[side]).map((id) => `<label class="small equip-option"><input type="checkbox" data-act="equip" data-side="${side}" data-id="${id}" ${cur.includes(id) ? 'checked' : ''} ${!cur.includes(id) && cur.length >= limit ? 'disabled' : ''}> <span class="equip-name">${esc(tx(EQUIPMENT[id].name))}</span><span class="hint"> — ${esc(tx(EQUIPMENT[id].desc))}</span></label>`).join('')}
    <p class="hint small">${L('裝備會在開戰前自動擺在己方領土。', 'Equipment is set up automatically in your territory before the battle.')}</p></div>`;
}

/** Tac Op for Approved Ops missions (secret from the opponent; the computer picks its own at random). */
function tacOpPick(side) {
  const ms = MISSIONS[ui.setup.mission];
  if (!ms?.approved || (side === 1 && ui.setup.ai === 1)) return '';
  const ids = tacOpsFor(ui.setup.teams[side]);
  const cur = ids.includes(ui.setup.tacOps?.[side]) ? ui.setup.tacOps[side] : ids[0];
  return `<div class="tactics"><h4>${L('戰術行動（Tac Op，對手看不到）', 'Tac Op (secret from the opponent)')}</h4>
    <select data-act="tacop" data-side="${side}">${ids.map((id) => `<option value="${id}" ${id === cur ? 'selected' : ''}>${esc(tx(TAC_OPS[id].name))}（${esc(TAC_OPS[id].arch)}）</option>`).join('')}</select>
    <p class="hint small">${esc(tx(TAC_OPS[cur].desc))}</p></div>`;
}

function tacticsPick(side) {
  const t = TEAM_MAP[ui.setup.teams[side]];
  if (!t.tactics) return '';
  const cur = setupTactics(side);
  const sel = (slot) => `<label>${slot ? L('次要', 'Secondary') : L('主要', 'Primary')}
    <select data-act="tactic" data-side="${side}" data-slot="${slot}">
      ${t.tactics.map((x) => `<option value="${x.id}" ${cur[slot] === x.id ? 'selected' : ''} ${cur[1 - slot] === x.id ? 'disabled' : ''}>${esc(bi(x.name))}</option>`).join('')}
    </select></label>`;
  const desc = (id) => t.tactics.find((x) => x.id === id);
  const vetSel = t.id === 'angels' ? `<label>${L('士官的額外戰術（老練）', 'Sergeants\' extra tactic (Chapter Veteran)')}
    <select data-act="tactic" data-side="${side}" data-slot="2"><option value="">${L('（不選）', '(none)')}</option>${t.tactics.map((x) => `<option value="${x.id}" ${cur[2] === x.id ? 'selected' : ''}>${esc(bi(x.name))}</option>`).join('')}</select></label>` : '';
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
    <div class="row">${sel(0)}${sel(1)}${vetSel}</div>
    ${cur.filter(Boolean).map((id) => `<p class="hint small"><b>${esc(tx(desc(id).name))}</b>：${esc(tx(desc(id).desc))}</p>`).join('')}
  </div>`;
}

/** Collector notes (archetypes, box, availability) for a team, if any. */
function teamInfo(t) {
  const i = t.info;
  if (!i) return '';
  return `<dl class="teaminfo">
    <dt>${L('戰術行動', 'Archetypes')}</dt><dd>${i.archetypes.map((a) => esc(bi(a))).join(' + ')}</dd>
    <dt>${L('戰鬥類型', 'Play style')}</dt><dd>${esc(tx(i.kind))}</dd>
    <dt>${L('隊伍人數', 'Operatives')}</dt><dd>${t.id === 'warpcoven' ? warpcovenIds(t).length : t.ops.reduce((n, o) => n + o.count, 0)}${i.size ? `（${esc(tx(i.size))}）` : ''}</dd>
    <dt>${L('一盒成軍', 'One box')}</dt><dd>${esc(tx(i.oneBox))}</dd>
    <dt>${L('目前可購買', 'Available')}</dt><dd>${esc(tx(i.buyable))}</dd>
    ${t.rulesUrl ? `<dt>${L('官方規則', 'Official rules')}</dt><dd><a href="${esc(t.rulesUrl)}" target="_blank" rel="noopener">PDF</a></dd>` : ''}
    ${i.note ? `<dt>${L('備註', 'Note')}</dt><dd class="bad">${esc(tx(i.note))}</dd>` : ''}
  </dl>`;
}

function roster(t, side) {
  let selected = t.id === 'deathwatch' ? Object.keys(t.replacements).map((slot) => t.ops.find((o) => o.id === (ui.setup.roster?.[side]?.[slot] || slot))) : t.ops.filter((o) => o.count);
  if (t.id === 'mandrakes' || t.id === 'murderwing') {
    const counts = new Map();
    for (const slot of selected) {
      const id = ui.setup.roster?.[side]?.[slot.id] || slot.id;
      counts.set(id, (counts.get(id) || 0) + slot.count);
    }
    selected = [...counts].map(([id, count]) => ({ ...t.ops.find((o) => o.id === id), count }));
  }
  // Teams with a choice of operatives: show who is actually taking the field (each pick once per copy), and their weapons.
  if ((t.replacements || t.id === 'warpcoven') && t.id !== 'deathwatch' && (!t.packages || t.id === 'navyBreachers' || t.id === 'warpcoven') && t.id !== 'mandrakes' && t.id !== 'murderwing') {
    const cur = ui.setup.roster?.[side] || {}, counts = new Map();
    for (const slot of t.ops.filter((o) => o.count)) {
      const pick = cur[slot.id];
      for (let k = 0; k < slot.count; k++) {
        const id = (Array.isArray(pick) ? pick[k] : pick) || slot.id;
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    }
    // Package picks (Navy Breachers' machines) add their operatives too.
    for (const [pid, pk] of Object.entries(t.packages || {})) for (const id of (pk.options[cur[pid]] || Object.values(pk.options)[0]).ops) counts.set(id, (counts.get(id) || 0) + 1);
    selected = [...counts].map(([id, count]) => ({ ...t.ops.find((o) => o.id === id), count }));
  }
  const loadouts = ui.setup.loadouts?.[side] || {};
  const weaponsOf = (o) => (o.loadouts ? o.loadouts[loadouts[o.id]] || Object.values(o.loadouts)[0] : o.weapons) || [];
  return `<div class="roster">
    ${teamInfo(t)}
    <p class="rule"><b>${esc(bi(t.rule.name))}</b>：${esc(tx(t.rule.desc))}</p>
    ${t.firefight?.length ? `<p class="rule small"><b>${L('交戰計謀', 'Firefight ploys')}</b>：${t.firefight.map((p) => esc(tx(p.name))).join('、')}</p>` : ''}
    ${t.techniques?.length ? `<p class="rule small"><b>${L('方陣技法', 'Aspect Techniques')}</b>：${t.techniques.map((p) => esc(tx(p.name))).join('、')}</p>` : ''}
    ${selected.map((o) => `<div class="rrow"><span>${o.count > 1 ? `${o.count}× ` : ''}${esc(bi(o.name))}</span>
      <span class="stats">APL ${o.apl} · M ${o.move}" · SV ${o.save}+ · W ${o.wounds}</span></div>
      <div class="wlist">${weaponsOf(o).map((w) => esc(tx(w.name))).join(' · ')}</div>`).join('')}
  </div>`;
}

// ---------- game ----------
function gameView() {
  return `${topBar(scoreBar(), turnStatus())}
  <main class="game">
    <div class="boardwrap">${opRoster(0)}<div class="boardcol"><div class="boardbox">${renderBoard(g, boardUi())}${inspectView()}${measureBar()}${turnBanner()}${endBanner()}</div>${tokenLegend()}</div>${opRoster(1)}</div>
    <aside class="panel">${panelView()}${logView()}</aside>
  </main>`;
}

/** One side's operatives beside the board: role, wounds, ready / expended, injured, order; tap for its datacard. */
function opRoster(side) {
  if (g.phase === 'deploy' && !g.ops.some((o) => o.side === side && o.placed)) return `<aside class="oproster side${side}"></aside>`;
  const tm = team(g, side);
  const ops = g.ops.filter((o) => o.side === side);
  const alive = ops.filter((o) => !o.dead).length;
  const chip = (o) => {
    const status = o.dead ? L('殘廢', 'Incapacitated') : g.active === o.uid ? L('啟動中', 'Active') : o.ready ? L('待行動', 'Ready') : L('已行動', 'Expended');
    const tags = [
      o.dead ? '' : `<span class="tag ${o.order}">${o.order === 'conceal' ? L('◐隱蔽', '◐ Conceal') : L('⚔交戰', '⚔ Engage')}</span>`,
      !o.dead && isInjured(o) ? `<span class="tag inj">${L('重傷', 'Injured')}</span>` : '',
      !o.dead && o.inspiring ? `<span class="tag insp">${L('激勵', 'Inspiring')}</span>` : '',
      !o.dead && o.counteracted && g.phase === 'firefight' ? `<span class="tag">${L('↺已反應', '↺ Countered')}</span>` : '',
      !o.dead && o.underground ? `<span class="tag">${L('🕳地下', '🕳 Underground')}</span>` : '',
      !o.dead && o.above ? `<span class="tag">${L('🪂天上', '🪂 Above')}</span>` : '',
      !o.dead && vdHasAccolade(g, o) ? `<span class="tag">${g.vd.pivotal[o.side] === o.uid ? L('🎭主角', '🎭 Pivotal') : L('🎭讚譽', '🎭 Accolade')}</span>` : '',
      !o.dead && o.vdHumbled != null ? `<span class="tag">${L('😖羞辱', '😖 Humbled')}</span>` : '',
      !o.dead && o.rvPoison?.some(Boolean) ? `<span class="tag">${L('☠毒素', '☠ Poison')}</span>` : '',
    ].join('');
    const cls = ['opchip', o.dead ? 'dead' : '', !o.dead && !o.ready && g.active !== o.uid ? 'spent' : '', g.active === o.uid ? 'active' : '', (ui.peek || ui.sel) === o.uid ? 'sel' : ''].join(' ');
    return `<button class="${cls}" data-act="peek" data-uid="${o.uid}" title="${esc(opName(o, getLang()))}">
      <svg class="chip-icon" viewBox="-.5 -.5 1 1" aria-hidden="true"><circle r=".48" fill="${tm.color}"/>${roleGlyph(roleOf(g, o), 0.26)}</svg>
      <span class="chip-main"><span class="chip-name"><b>${o.num}</b><span class="nm"> ${esc(tx(tpl(o).name))}</span></span>
        <span class="chip-bar"><i class="${isInjured(o) ? 'inj' : ''}" style="width:${o.dead ? 0 : Math.round(o.wounds / o.maxW * 100)}%"></i></span>
        <span class="chip-sub"><span class="st">${status}</span> ${o.dead ? '' : `${o.wounds}/${o.maxW}`} ${tags}</span></span>
    </button>`;
  };
  return `<aside class="oproster side${side}" style="--tc:${tm.color}"><h4>${esc(tx(tm.name))} <small>${alive}/${ops.length}</small></h4>${ops.map(chip).join('')}</aside>`;
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
    // Replay: the status field describes this step.
    const stepText = [...stepNotes(R.rep, R.i), ...snap.msgs.map((e) => e.msg)].map((m) => esc(tx(m)));
    const turnTeam = view.turn != null && view.turn !== NPO ? team(view, view.turn) : null;
    const showTurn = turnTeam && view.phase === 'firefight';
    const status = statusBox({
      color: showTurn ? turnTeam.color : null,
      icon: '📜', phase: L('複盤', 'Replay'), tp: L(`第 ${R.i + 1}/${n} 步`, `Step ${R.i + 1}/${n}`),
      who: showTurn ? `<b style="color:${turnTeam.color}">${esc(tx(turnTeam.name))}</b> ${L('的回合', '— turn')}` : '',
      doing: stepText[0] || L('（狀態更新）', '(state update)'),
      last: stepText.slice(1).join(' / '),
      key: 'replay',
    });
    return `${topBar(scoreBar(), status)}
    <main class="game">
      <div class="boardwrap"><div class="boardbox">${renderBoard(view, { sel: ui.sel, terrainRanges: ui.setup.terrainRanges, trails: trailsAt(R.rep, R.i) })}${measureBar()}</div>${tokenLegend()}</div>
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
      <span title="${L('存活', 'Alive')}">👤 ${living(g, side).length}</span>${t.id === 'wreckaKrew' ? `<span title="${L('破壞點數', 'Wrecka points')}">💥 <b>${wreckaOf(g, side)}</b></span>` : ''}${t.id === 'nemesisClaw' ? `<span title="${L('預知點數', 'Prescience points')}">🔮 <b>${prescienceOf(g, side)}</b></span>` : ''}</div>
    </div>`;
  };
  const tpTxt = g.phase === 'deploy' ? L('部署', 'Deploy') : g.phase === 'gameover' ? L('結束', 'End') : `TP ${g.tp}/${MAX_TP}`;
  return `<div class="scorebar">${scoreBox(0)}<div class="tp">${tpTxt}</div>${scoreBox(1)}</div>`;
}

/** Top-bar status: whose turn it is, what is happening now, and the latest thing that happened. */
function turnStatus() {
  const teamOf = (s) => (s === NPO || s == null ? null : team(g, s));
  const who = (s) => {
    const t = teamOf(s);
    return t ? `<b style="color:${t.color}">${esc(tx(t.name))}</b>${isAI(s) ? ' 🤖' : ''}` : `<b>${L('非玩家單位', 'NPO')}</b>`;
  };
  let side = null, doing = '';
  if (g.phase === 'deploy') {
    const d = g.dep;
    if (g.eqDeploy && !g.eqDeploy.done) { side = g.eqDeploy.turn; doing = L('輪流部署通用裝備', 'Alternating equipment deployment'); }
    else if (d && !d.done) { side = d.turn; doing = L(`部署中（這一批 ${d.batch.length}/${d.need}）`, `setting up (${d.batch.length}/${d.need} this step)`); }
    else doing = L('雙方部署完成，準備開戰', 'Both teams set up — ready to begin');
  } else if (g.phase === 'initiative') {
    doing = L(`第 ${g.tp} 回合・先攻階段：決定先攻`, `TP ${g.tp} · Initiative phase`);
  } else if (g.phase === 'strategy') {
    side = ployChooser(g);
    doing = L(`第 ${g.tp} 回合・策略階段`, `TP ${g.tp} · Strategy phase`);
  } else if (g.phase === 'gameover') {
    doing = g.winner == null ? L('遊戲結束：平手', 'Game over: draw') : L(`遊戲結束：${tx(team(g, g.winner).name)} 獲勝`, `Game over: ${tx(team(g, g.winner).name)} wins`);
  } else if (g.fight && !g.fight.done) {
    side = fightChooser(g);
    doing = L(`近戰：${nm(fightOp(g, 'A'))} 對 ${nm(fightOp(g, 'D'))}，選擇打擊或格擋`,
      `Fight: ${nm(fightOp(g, 'A'))} vs ${nm(fightOp(g, 'D'))} — strike or block`);
  } else {
    side = g.turn;
    const op = activeOp(g);
    if (op) {
      const act = ui.mode?.action && ACTIONS[ui.mode.action] ? tx(ACTIONS[ui.mode.action].name)
        : ui.mode?.kind === 'shoot' ? L('射擊：選擇目標', 'Shoot: choosing a target')
          : ui.mode?.kind === 'fight' ? L('近戰：選擇目標', 'Fight: choosing a target') : '';
      doing = `${nm(op)} ${op.counter ? L('反擊中', 'is counteracting') : L('啟動中', 'is activated')}${act ? ` · ${esc(act)}` : ''}`;
    } else if (g.counter) {
      doing = L('反擊機會：選一名特工或略過', 'May counteract: pick an operative or pass');
    } else {
      doing = isAI(side) ? L('電腦思考中…', 'Computer is thinking…') : L('選擇一名特工啟動', 'Choose an operative to activate');
    }
  }
  const last = g.log[g.log.length - 1];
  const t = teamOf(side);
  const fighting = g.fight && !g.fight.done;
  const badge = g.phase === 'deploy' ? ['📍', L('部署', 'Deploy')]
    : g.phase === 'initiative' ? ['🎲', L('先攻', 'Initiative')]
      : g.phase === 'strategy' ? ['🧭', L('策略', 'Strategy')]
        : g.phase === 'gameover' ? ['🏁', L('結束', 'Game over')]
          : fighting ? ['🗡', L('近戰', 'Fight')]
            : g.counter ? ['↩', L('反擊', 'Counteract')] : ['⚔', L('交火', 'Firefight')];
  return statusBox({
    color: t ? t.color : null,
    icon: badge[0], phase: badge[1], tp: g.phase === 'deploy' || g.phase === 'gameover' ? '' : `TP ${g.tp}/${MAX_TP}`,
    who: side != null ? `${who(side)} ${L('的回合', '— turn')}` : '',
    doing,
    last: last ? `${L('剛剛', 'Last')}：${esc(tx(last.msg))}` : '',
    key: `${g.phase}|${g.tp}|${side}|${fighting}|${!!g.counter}`,
  });
}

let lastStatusKey = null;
/** The centred status card; it flashes once when the turn or phase changes. */
function statusBox({ color, icon, phase, tp, who, doing, last, key }) {
  const flash = key !== lastStatusKey && lastStatusKey !== null;
  lastStatusKey = key;
  return `<div class="turnstatus ${color ? 'has-team' : ''} ${flash ? 'flash' : ''}" style="--tc:${color || 'var(--brass)'}" role="status" aria-live="polite">
    <div class="tsbadge"><span class="tsicon">${icon}</span><span class="tsphase">${phase}</span>${tp ? `<small>${tp}</small>` : ''}</div>
    <div class="tsbody">
      ${who ? `<div class="tswho">${who}</div><div class="tsdoing">${doing}</div>` : `<div class="tswho">${doing}</div>`}
      ${last ? `<div class="tslast" title="${last.replace(/<[^>]+>/g, '')}">${last}</div>` : ''}
    </div>
  </div>`;
}

function boardUi() {
  const b = { sel: ui.sel, peek: ui.peek, path: ui.path, highlight: null, ring: null, los: null, canDrag: g.phase === 'deploy', terrainRanges: ui.setup.terrainRanges };
  const op = activeOp(g);
  if (op && ui.mode?.kind === 'move' && !['mdPass', 'rtSlingshot', 'kmGrapple', 'rvBurrow', 'aqLand', 'vsSkytorch'].includes(ui.mode.action)) b.ring = { x: op.x, y: op.y, r: moveAllowance(g, op, ui.mode.action) + radius(op) };
  // Exodite riders: where a Sprint can go (or the turn arc).
  if (op && ui.mode?.kind === 'sprint') {
    const tpLeft = 12 - (op.movedTP || 0);
    b.cone = op.acted.leap ? null : { x: op.x, y: op.y, facing: op.facing || 0, fwd: Math.min(9 - (op.acted.sprintFwd || 0), tpLeft, op.counter ? 2 : 9), back: Math.min(3 - (op.acted.sprintBack || 0), tpLeft, op.counter ? 2 : 3) };
    if (op.acted.leap) b.ring = { x: op.x, y: op.y, r: 1 };
  }
  if (op && ui.mode?.kind === 'turn') b.cone = { x: op.x, y: op.y, facing: op.facing || 0, fwd: 4, back: 0 };
  if (op && ui.mode?.kind === 'shoot' && ui.mode.weapon) {
    b.highlight = new Map();
    const op = shooter(activeOp(g)); // (Interstitial Command: the commanded operative shoots)
    // Detonate: the target is the friendly Gheistskull.
    for (const t of ui.mode.weapon.rules.detonate ? living(g, op.side).filter((o) => tpl(o).gheistskull) : ui.mode.weapon.rules.wkExplosive ? [op] : foes(g, op)) { // (Explosive: the Bomb Squig itself)
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
  if (ui.pending && op) atk = { a: ui.pending.by || op.uid, t: ui.pending.target, kind: ui.pending.kind };
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
/** Initiative cards each side holds, as a line. */
function initCardsLine() {
  const held = (s) => (g.initCards?.[s] || []).map((id) => tx(INIT_CARDS[id].name)).join('、') || L('無', 'none');
  return `<p class="hint small">${L('先攻卡', 'Initiative cards')}：${[0, 1].map((s) => `<b style="color:${team(g, s).color}">${esc(tx(team(g, s).name))}</b> ${held(s)}`).join('　')}</p>`;
}
/** Before the result stands: human players may use initiative cards (Re-roll, ±1, ±2, ±3). */
/** Faction equipment that's used automatically when the rules say "you can" (players switch each on): equipment id = switch id. */
const OPTIONAL_EQUIP = ['wcRobes', 'phSeals', 'phAmmo', 'nbSlugs', 'adSeals', 'adAuspex', 'adTilting', 'aqAugury', 'ccPhase', 'ccManip', 'dkBeads', 'dwDigital', 'toxinCoating', 'refinedPoison', 'mistfield', 'starCharts',
  'kfMeat', 'kfTrophy', 'kfPiercing', 'kfToxin', 'mdGlyph', 'mwFuel', 'mwBladefins', 'pfTao', 'pfHiml', 'rtRations', 'rtLucky', 'sfSymbols', 'sfSeals', 'scOculars', 'spTvid',
  'vsConvergence', 'vdToxin', 'vdTalisman', 'vdUnderstudy', 'wkDrill', 'wkOil'];
/** The switchable automatic rules a side has: the team's own list, its optional equipment, and the Bioscryer Cuffs' automatic cleanse. */
function autoAbilitiesFor(g, side) {
  const eq = g.equip?.[side] || [];
  const list = [...(team(g, side).autoAbilities || [])];
  for (const id of OPTIONAL_EQUIP) if (eq.includes(id) && EQUIPMENT[id] && !list.some((a) => a.id === id)) list.push({ id, equip: id, name: EQUIPMENT[id].name, desc: EQUIPMENT[id].desc });
  if (eq.includes('dwCuffs')) list.push({ id: 'dwCuffsAuto', equip: 'dwCuffs', name: { zh: '生體掃描護腕（啟動前自動清除）', en: 'Bioscryer Cuffs (automatic cleanse before activating)' }, desc: { zh: '有毒素或 APL 減值時，啟動前自動用護腕清除（用掉這次啟動的護腕）。', en: 'With a poison token or an APL reduction, the cuffs clear it automatically before it activates (using that activation\'s cuffs).' } });
  return list;
}
/** The firefight ploys a team uses automatically (Animalistic Fury: automatic when retaliating). */
function autoPloys(t) { return [...(t.firefight || []), ...(t.techniques || [])].filter((p) => ffKind(p.id) === 'auto' || p.id === 'animalisticFury'); }
function initCardsPanel() {
  const w = initWinner(g), wt = team(g, w);
  const tie = g.initRoll[0] === g.initRoll[1];
  const moved = g.initRolled && (g.initRolled[0] !== g.initRoll[0] || g.initRolled[1] !== g.initRoll[1]);
  const opts = [0, 1].filter((s) => !isAI(s) && g.initCards[s].length).map((s) => {
    const tm = team(g, s), other = tx(team(g, 1 - s).name);
    const btns = g.initCards[s].filter((id, i, a) => a.indexOf(id) === i).map((id) => {
      if (id === 'reroll') return `<button data-act="initcard" data-side="${s}" data-id="reroll">🎲 ${L('重擲自己的骰子', 'Re-roll your die')}</button>`;
      const n = INIT_CARDS[id].n;
      return [[s, 1, L(`自己 +${n}`, `Yours +${n}`)], [s, -1, L(`自己 −${n}`, `Yours −${n}`)], [1 - s, 1, L(`${other} +${n}`, `${other} +${n}`)], [1 - s, -1, L(`${other} −${n}`, `${other} −${n}`)]]
        .map(([die, sign, lab]) => `<button data-act="initcard" data-side="${s}" data-id="${id}" data-die="${die}" data-sign="${sign}">±${n}：${esc(lab)}</button>`).join('');
    }).join('');
    return `<div class="gambit"><h4 style="color:${tm.color}">${esc(bi(tm.name))}</h4><div class="row">${btns}${wsGuileOk(g, s) ? `<button data-act="initguile" data-side="${s}">🐺 ${L('狼之狡詐：重擲自己的骰子', 'Lupine Guile: re-roll your die')}</button>` : ''}${rvSensesOk(g, s) ? `<button data-act="initsenses" data-side="${s}">🐛 ${L('敏銳感官：重擲自己的骰子', 'Heightened Senses: re-roll your die')}</button>` : ''}${hkWritOk(g, s) ? `<button data-act="initwrit" data-side="${s}">📜 ${L('主權令狀：重擲自己的骰子', 'Writ of Claim: re-roll your die')}</button>` : ''}${phTacInitOk(g, s) ? `<button data-act="inittac" data-side="${s}">🎯 ${L('戰術優勢：重擲自己的骰子（整場一次）', 'Tactical Advantage: re-roll your die (once per battle)')}</button>` : ''}</div></div>`;
  }).join('') + [0, 1].filter((s) => !isAI(s) && !g.initCards[s].length && wsGuileOk(g, s)).map((s) => `<div class="gambit"><h4 style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</h4><div class="row"><button data-act="initguile" data-side="${s}">🐺 ${L('狼之狡詐：重擲自己的骰子', 'Lupine Guile: re-roll your die')}</button></div></div>`).join('') + [0, 1].filter((s) => !isAI(s) && !g.initCards[s].length && rvSensesOk(g, s)).map((s) => `<div class="gambit"><h4 style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</h4><div class="row"><button data-act="initsenses" data-side="${s}">🐛 ${L('敏銳感官：重擲自己的骰子', 'Heightened Senses: re-roll your die')}</button></div></div>`).join('') + [0, 1].filter((s) => !isAI(s) && !g.initCards[s].length && hkWritOk(g, s)).map((s) => `<div class="gambit"><h4 style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</h4><div class="row"><button data-act="initwrit" data-side="${s}">📜 ${L('主權令狀：重擲自己的骰子', 'Writ of Claim: re-roll your die')}</button></div></div>`).join('') + [0, 1].filter((s) => !isAI(s) && !g.initCards[s].length && !hkWritOk(g, s) && phTacInitOk(g, s)).map((s) => `<div class="gambit"><h4 style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</h4><div class="row"><button data-act="inittac" data-side="${s}">🎯 ${L('戰術優勢：重擲自己的骰子（整場一次）', 'Tactical Advantage: re-roll your die (once per battle)')}</button></div></div>`).join('');
  return `<section class="card">
    <h2>${L(`第 ${g.tp} 回合・先攻階段`, `TP ${g.tp} · Initiative Phase`)}</h2>
    <p>${L('主動權擲骰', 'Initiative roll')}：<b style="color:${team(g, 0).color}">${g.initRoll[0]}</b> : <b style="color:${team(g, 1).color}">${g.initRoll[1]}</b>${moved ? L(`（原本 ${g.initRolled[0]} : ${g.initRolled[1]}）`, ` (rolled ${g.initRolled[0]} : ${g.initRolled[1]})`) : ''}</p>
    <p>${L('目前', 'Right now')} <b style="color:${wt.color}">${esc(bi(wt.name))}</b> ${tie ? L('因平手取得選擇權', 'would decide (tie)') : L('擲贏，取得選擇權', 'wins the roll-off')}。</p>
    <p class="hint">${L('可以在確定結果前使用先攻卡（每張用一次）：重擲＝重擲自己的骰子；±N＝自己或對手的骰子加或減 N。', 'Before the result stands you can use initiative cards (once each): Re-roll re-rolls your die; ±N adds or subtracts N from either die.')}</p>
    ${opts}${[0, 1].filter((s) => !isAI(s) && aqOverseerOk(g, s)).map((s) => `<div class="gambit"><h4 style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</h4><div class="row"><button data-act="initoverseer" data-side="${s}">📡 ${L('遠程監督：重擲自己的骰子', 'Remote Overseer: re-roll your die')}</button></div></div>`).join('')}${initCardsLine()}
    <button class="primary wide" data-act="initlock">${L('確定擲骰結果 ▶', 'Confirm the roll-off ▶')}</button>
  </section>`;
}
function initiativePanel() {
  if (!g.initLocked) return initCardsPanel();
  // The roll-off winner (a human player) decides who has initiative.
  if (g.initiative == null) {
    const d = g.initDecider, dt = team(g, d), ot = team(g, 1 - d);
    const tie = g.initRoll[0] === g.initRoll[1];
    return `<section class="card">
      <h2>${L(`第 ${g.tp} 回合・先攻階段`, `TP ${g.tp} · Initiative Phase`)}</h2>
      <p>${L('主動權擲骰', 'Initiative roll')}：<b style="color:${team(g, 0).color}">${g.initRoll[0]}</b> : <b style="color:${team(g, 1).color}">${g.initRoll[1]}</b></p>
      <p><b style="color:${dt.color}">${esc(bi(dt.name))}</b> ${tie ? L('平手：目前沒有先攻的一方（第 1 回合：部署時沒有先攻的一方）勝出並決定。', 'Tie: the player without initiative (TP1: the one without it at set-up) wins and decides.') : L('擲贏，決定誰先攻。', 'wins the roll-off and decides who has initiative.')}</p>
      ${initCardsLine()}
      <p class="hint">${L('先攻方先啟動特工；沒有先攻的一方第 2 回合起多拿 1CP。', 'The player with initiative activates first; from TP2 the other player gains 1 more CP.')}</p>
      <div class="row"><button class="primary" data-act="initpick" data-side="${d}">${L('我方先攻', 'We take initiative')}</button>
      <button data-act="initpick" data-side="${1 - d}">${L(`讓 ${tx(ot.name)} 先攻`, `Give it to ${tx(ot.name)}`)}</button></div>
    </section>`;
  }
  const first = g.initiative, ini = team(g, first), other = team(g, 1 - first);
  const cp = (s) => (s === first ? 1 : g.tp > 1 ? 2 : 1);
  return `<section class="card">
    <h2>${L(`第 ${g.tp} 回合・先攻階段`, `TP ${g.tp} · Initiative Phase`)}</h2>
    <p>${L('主動權擲骰', 'Initiative roll')}：<b style="color:${team(g, 0).color}">${g.initRoll[0]}</b> : <b style="color:${team(g, 1).color}">${g.initRoll[1]}</b></p>
    <p><b style="color:${ini.color}">${esc(bi(ini.name))}</b> ${L('獲得先攻，先啟動特工。', 'wins initiative and activates first.')}</p>
    ${initCardsLine()}
    <p class="hint">${L(`雙方獲得指揮點數：${esc(bi(ini.name))} +${cp(first)}、${esc(bi(other.name))} +${cp(1 - first)}（目前 ${g.cp[0]} : ${g.cp[1]}）。所有特工已回到「準備」狀態。`,
    `Command points gained: ${esc(bi(ini.name))} +${cp(first)}, ${esc(bi(other.name))} +${cp(1 - first)} (now ${g.cp[0]} : ${g.cp[1]}). All operatives are ready.`)}</p>
    <button class="primary wide" data-act="strategy">${L('進入策略階段 ▶', 'Start Strategy phase ▶')}</button>
  </section>`;
}

function omenPick() {
  return [0, 1].filter((s) => g.omen?.[s] && !isAI(s)).map((s) => `<label>${esc(tx(team(g, s).name))} ${L('預兆', 'Omen')}<select data-act="omen" data-side="${s}">${g.ops.filter((o) => !(o.side === s && tpl(o).omen)).map((o) => `<option value="${o.uid}" ${g.omen[s] === o.uid ? 'selected' : ''}>${nm(o)} (${o.side === s ? L('友方重擲 1', 'Friendly re-roll 1s') : L('敵方重擲 6', 'Enemy re-roll 6s')})</option>`).join('')}</select></label>`).join('');
}
function deployPanel() {
  if (zonePending(g)) {
    const s = g.zonePick.side, edge = (e, ax) => (ax === 'y' ? (e === 'low' ? L('上方', 'top') : L('下方', 'bottom')) : (e === 'low' ? L('左側', 'left') : L('右側', 'right'))), ax = g.axis === 'y' ? 'y' : 'x';
    return `<section class="card"><h2>${L('選擇降落區', 'Choose a drop zone')}</h2><p class="hint">${L(`${tx(team(g, s).name)} 擲贏部署骰，可以選擇在棋盤的哪一側降落。`, `${tx(team(g, s).name)} won the roll-off and picks which edge to set up on.`)}</p>
      <div class="row"><button data-act="zone" data-swap="0">${L(`在${edge(zoneEdge(g, s), ax)}`, `On the ${edge(zoneEdge(g, s), ax)}`)}</button><button data-act="zone" data-swap="1">${L(`在${edge(zoneEdge(g, 1 - s), ax)}`, `On the ${edge(zoneEdge(g, 1 - s), ax)}`)}</button></div></section>`;
  }
  if (g.eqDeploy && !g.eqDeploy.done) {
    const d = g.eqDeploy, e = d.queues[d.turn][0], kind = e.item.kind;
    const name = {heavy:L('重掩體','Heavy barricade'),light:L('輕掩體','Light barricade'),wire:L('鐵絲網','Razor wire'),comms:L('通訊裝置','Comms device'),mine:L('地雷','Mine'),ammo:L('彈藥箱','Ammo cache'),tripwire:L('絆線','Tripwire')}[kind] || kind;
    return `<section class="card"><h2>${L('通用裝備部署', 'Equipment deployment')}</h2><h3>${esc(bi(team(g,d.turn).name))} · ${name}</h3>
      <p class="hint">${L('雙方輪流放置一件裝備，全部完成後才部署特工。點棋盤放置目前裝備；裝備地形需符合半區、降落區與間距限制。', 'Alternate placing one equipment item; deploy operatives afterwards. Tap the board to place the current item within its legal area and spacing.')}</p>
      <p>${L('剩餘', 'Remaining')}：P1 ${d.queues[0].length} / P2 ${d.queues[1].length}</p>
      ${ui.notice ? `<p class="bad">${esc(ui.notice)}</p>` : ''}
      ${isAI(d.turn) ? `<p>${L('電腦部署中…','Computer setting up…')}</p>` : `${e.type === 'terrain' ? `<button data-act="eqrotate">${L('旋轉 90°','Rotate 90°')} ${ui.eqRotated ? '↔' : '↕'}</button>` : ''}<button data-act="eqauto">${L('自動放置這件裝備','Auto-place this item')}</button>`}</section>`;
  }
  const d = g.dep;
  const count = (s) => {
    const all = g.ops.filter((o) => o.side === s);
    return `<span style="color:${team(g, s).color}">${esc(tx(team(g, s).name))} ${all.filter((o) => o.placed !== false).length}/${all.length}</span>`;
  };
  if (!d || d.done) {
    return `<section class="card">
      <h2>${L('部署階段', 'Deployment')}</h2>
      <p>${count(0)} · ${count(1)}</p>${omenPick()}
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
    ${mine ? `<p class="hint">${L(`雙方輪流，隊伍分三批部署（盡量平均，人數多的批次先）。選一名待部署的特工，再點己方部署區（有顏色的區域）放置；這一批放好的特工在按「完成」前都還能拖曳調整。`,
      'Players alternate setting up a third of their team (split as evenly as possible, bigger groups first). Pick an operative below, then tap inside your coloured zone; operatives placed in this step can still be dragged until you press Done.')}</p>
      ${left > 0 ? `<div class="oplist">${waiting.map((o) => `<button class="${ui.sel === o.uid ? 'on' : ''}" data-act="depsel" data-uid="${o.uid}">${nm(o)}</button>`).join('')}</div>` : ''}
      ${aqCanAbove(g, d.turn) ? `<button data-act="depabove">🪂 ${L('整批放在天上（待命空降）', 'Set this whole third up above (grav-chute drop)')}</button>` : ''}
      ${ui.sel && getOp(g, ui.sel) && rvCanUnderground(g, getOp(g, ui.sel)) ? `<button data-act="depunder">🕳 ${L('改成在地下部署', 'Set up underground instead')}</button>` : ''}
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
    const state = s === cur ? L('選擇中…', 'choosing…') : L('等待中', 'waiting');
    return `<div class="ploys" style="--tc:${t.color}"><h3>${esc(bi(t.name))}${g.ai === s ? ' 🤖' : ''} · CP ${g.cp[s]}${g.teams[s] === 'vespids' ? ` · ${L('交融', 'Communion')} ${vsPoints(g, s)}` : ''} <small>${state}</small></h3>
      <p class="hint">${chosen(s)}</p></div>`;
  };
  const t = team(g, cur);
  const picker = g.ai === cur
    ? `<p class="hint">${L('電腦選擇計謀中…', 'Computer is choosing ploys…')}</p>`
    : pendingChoice(g, cur) ? `<div class="ploys" style="--tc:${t.color}"><h3>${esc(bi(t.name))} · CP ${g.cp[cur]}</h3>${choiceView(cur)}</div>`
    : `<div class="ploys" style="--tc:${t.color}"><h3>${esc(bi(t.name))} ${L('選擇計謀', 'chooses ploys')} · CP ${g.cp[cur]}</h3>
      ${t.ploys.map((p) => {
        const on = g.ploys[cur].includes(p.id);
        const cost = ployCost(g, cur, p);
        return `<button class="ploy ${on ? 'on' : ''}" data-act="ploy" data-side="${cur}" data-ploy="${p.id}" ${on || ployTaken(g, cur, p) || g.cp[cur] < cost ? 'disabled' : ''}>
          <b>${esc(bi(p.name))}</b> <span class="cp">${cost < p.cp ? `<s>${p.cp}</s> ` : ''}${cost}CP</span><small>${esc(tx(p.desc))}</small></button>`;
      }).join('')}</div>${gambitView(cur)}
      <button class="ploy" data-act="ployspass"><b>${L('跳過', 'Pass')}</b><span class="cp">0CP</span><small>${L('對方使用計謀後，你仍可再選。雙方連續跳過才進入交火階段。', 'You may choose again after the opponent uses a ploy. Two consecutive passes start the Firefight phase.')}</small></button>`;
  const ini = team(g, first);
  return `<section class="card">
    <h2>${L(`第 ${g.tp} 回合・策略階段`, `TP ${g.tp} · Strategy Phase`)}</h2>
    <p>${L('主動權擲骰', 'Initiative roll')}：<b>${g.initRoll[0]}</b> : <b>${g.initRoll[1]}</b> → <b style="color:${ini.color}">${esc(bi(ini.name))}</b> ${L('先手', 'goes first')}</p>
    <p class="hint">${L('雙方輪流花費 CP 使用策略計謀（先手方先選），效果持續到本回合結束。', 'Each side in turn spends CP on strategy ploys (initiative player first); they last until the end of this Turning Point.')}</p>
    ${summary(first)}${summary(1 - first)}
  </section>
  <section class="card turnbanner" style="--tc:${t.color}">${picker}</section>`;
}

/** A pick the player has to make for a ploy or gambit (an operative, a marker, an option or a point on the board). */
function choiceView(side) {
  const p = pendingChoice(g, side), c = p && CHOICES[p.id];
  if (!c) return '';
  const label = (o) => (o.label ? esc(tx(o.label)) : c.kind === 'op' ? (() => { const x = getOp(g, o.value); return x ? `${nm(x)} ${x.wounds}/${x.maxW}` : '?'; })()
    : c.kind === 'objective' ? (() => { const m = g.objectives.find((x) => x.id === o.value); return m ? L(`目標點 ${m.id + 1}（${m.x.toFixed(1)}, ${m.y.toFixed(1)}）`, `Objective ${m.id + 1} (${m.x.toFixed(1)}, ${m.y.toFixed(1)})`) : '?'; })() : esc(String(o.value)));
  if (c.kind === 'move') {
    const left = moversLeft(g, side, c, p.ctx), sel = left.find((o) => o.uid === ui.moveUid);
    const n = p.ctx.n != null ? L(`（最多 ${p.ctx.n} 名，已移動 ${p.ctx.done.length}）`, ` (up to ${p.ctx.n}; ${p.ctx.done.length} moved)`) : L(`（已移動 ${p.ctx.done.length}）`, ` (${p.ctx.done.length} moved)`);
    return `<div class="gambit"><h4>${esc(tx(c.title))}</h4><p class="hint small">${L('先選一名特工，再點棋盤選終點，按「確定移動」；不想動的不用選。全部弄完按「完成」。', 'Pick an operative, tap the board for where it goes and press "Confirm move"; leave out any you don\'t want to move. Press "Done" when finished.')}${n}</p>
      <div class="readylist">${left.map((o) => `<button class="${o.uid === ui.moveUid ? 'on' : ''}" data-act="pickmover" data-uid="${o.uid}">${nm(o)}</button>`).join('')}</div>
      ${sel ? `<p>${L(`點棋盤選 ${nm(sel)} 的終點（最多 ${c.max(g, sel, p.ctx)}"）`, `Tap the board for ${nm(sel)}'s destination (up to ${c.max(g, sel, p.ctx)}")`)}</p>${ui.path && !ui.path.ok && ui.path.why ? `<p class="bad small">${esc(ui.path.why)}</p>` : ''}` : ''}
      <div class="row">${sel ? `<button data-act="pickmove" ${ui.path?.ok ? '' : 'disabled'}>${L('確定移動', 'Confirm move')}</button>` : ''}<button data-act="pickskip">${L('完成', 'Done')}</button>${p.ctx.done.length ? '' : `<button data-act="pickauto">${L('讓電腦移動', 'Let the computer move them')}</button>`}</div></div>`;
  }
  const opts = c.kind === 'point' ? `<p>${L('點棋盤選位置。', 'Tap the board for the spot.')}</p>` : `<div class="readylist">${c.options(g, side, p.ctx).map((o, i) => `<button data-act="choicepick" data-i="${i}">${label(o)}</button>`).join('')}</div>`;
  return `<div class="gambit"><h4>${esc(tx(c.title))}</h4>${c.hint ? `<p class="hint small">${esc(tx(c.hint))}</p>` : ''}${opts}
    <div class="row"><button data-act="pickauto">${L('讓電腦選', 'Let the computer pick')}</button>${c.skippable ? `<button data-act="pickskip">${L('略過', 'Skip')}</button>` : ''}</div></div>`;
}
/** Farstalker Kinband choices while picking ploys: Call the Kill and up to three order changes. */
function gambitView(side) {
  let html = '';
  const archeo=living(g,side).find(o=>tpl(o).omniscanner);
  if(archeo && archeo.seekerTP!==g.tp){
    const options=seekerOptions(g,archeo), selection=ui.seeker;
    html+=`<div class="gambit"><h4>${L('尋覓神聖秘藏（Seeker of Divine Arcana）','Seeker of Divine Arcana')} · 0CP</h4>
      <p class="hint small">${L('立即變更指令及／或執行一個免費行動。未攜帶標記時，移動終點須在降落區（無法到達則盡量靠近），或在目標／任務標記控制範圍。','Change order and/or perform one free action. Without a carried marker, end in your drop zone (or as close as possible), or within control range of an objective/mission marker.')}</p>
      <select data-act="seekerorder"><option value="engage" ${(selection?.order||archeo.order)==='engage'?'selected':''}>${L('交戰','Engage')}</option><option value="conceal" ${(selection?.order||archeo.order)==='conceal'?'selected':''}>${L('隱蔽','Conceal')}</option></select>
      <button data-act="seeker" data-id="">${L('只變更指令','Change order only')}</button>
      ${options.map(a=>`<button data-act="seeker" data-id="${a.id}">${a.id==='seekerPlace'?L('放置標記（Place Marker）','Place Marker'):esc(bi(ACTIONS[a.id]?.name || {zh:a.id,en:a.id}))} · 0AP</button>`).join('')}
      ${selection?.action==='omniscanner'?TARGET_ACTIONS.omniscanner.targets(g,archeo).map(t=>`<button data-act="seekertarget" data-uid="${t.uid}">${nm(t)}</button>`).join(''):''}
      ${['reposition','fallBack'].includes(selection?.action)?`<p>${L('點棋盤選移動終點','Tap the board to choose the destination')}</p><button data-act="seekerconfirm" ${ui.path?.ok?'':'disabled'}>${L('確認免費移動','Confirm free move')}</button><p class="hint">${ui.path?.why||''}</p>`:''}
      ${selection?.action?`<button data-act="seekercancel">${L('取消選擇','Cancel selection')}</button>`:''}</div>`;
  }
  // Scout Squad: Tactical Manoeuvre (twice per battle) and Diversion (once per battle) — strategic gambits.
  if (g.teams[side] === 'scoutSquad' && !isAI(side)) {
    if ((g.scGambit?.[side]?.tactical || 0) > 0) html += `<div class="gambit"><h4>${L(`戰術機動（剩 ${g.scGambit[side].tactical} 次）`, `Tactical Manoeuvre (${g.scGambit[side].tactical} left)`)}</h4>
      <p class="hint small">${L('選一名友方：到它下次啟動結束 APL +1。每回合一次。', 'Pick a friendly: +1 APL until the end of its next activation. Once per TP.')}</p>
      <select data-act="sctactical" data-side="${side}" ${scGambitsLeft(g, side, 'tactical') ? '' : 'disabled'}><option value="">${L(scGambitsLeft(g, side, 'tactical') ? '（選特工）' : '（本回合已用）', scGambitsLeft(g, side, 'tactical') ? '(choose an operative)' : '(used this TP)')}</option>
        ${living(g, side).map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}</select></div>`;
    if ((g.scGambit?.[side]?.diversion || 0) > 0) html += `<div class="gambit"><h4>${L('誘餌（整場一次）', 'Diversion (once per battle)')}</h4>
      <p class="hint small">${L('選戰場邊緣 6" 內的一名敵人：到它下次啟動結束 APL -1。', 'Pick an enemy within 6" of a killzone edge: -1 APL until the end of its next activation.')}</p>
      <select data-act="scdiversion" data-side="${side}"><option value="">${L('（選敵人）', '(choose an enemy)')}</option>
        ${scDiversionTargets(g, side).map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}</select></div>`;
  }
  if (g.teams[side] === 'ratlings' && !isAI(side) && living(g, side).some((o) => tpl(o).rtFixer)) {
    const cur = g.rtTarget?.[side]?.tp === g.tp ? getOp(g, g.rtTarget[side].uid) : null;
    html += `<div class="gambit"><h4>${L('指定目標', 'Target Designation')}</h4>
      <p class="hint small">${L('選一名敵方特工：本回合友方萊特林用步槍射擊它時有「致命 5+」。', 'Pick an enemy operative: this TP friendly RATLING rifles shooting it have Lethal 5+.')}</p>
      <select data-act="rtdesignate" data-side="${side}" ${rtGambitLeft(g, side) ? '' : 'disabled'}><option value="">${cur ? nm(cur) : L('（選敵人）', '(choose an enemy)')}</option>
        ${foes(g, { side }).filter((o) => o.side < 2).map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}</select></div>`;
  }
  if (g.teams[side] === 'sanctifiers' && !isAI(side) && !living(g, side).some((o) => tpl(o).sfConfessor)) {
    const cur = sfOrator(g, side);
    html += `<div class="gambit"><h4>${L('佈道（選佈道者）', 'Ministorum Sermon (pick the orator)')}</h4>
      <p class="hint small">${L('懺悔師已倒下：選一名友方淨化者成為佈道者，直到你再次使用。', 'The Confessor has fallen: pick a friendly SANCTIFIER as the orator until you use this again.')}</p>
      <select data-act="sforator" data-side="${side}" ${sfGambitLeft(g, side) ? '' : 'disabled'}><option value="">${cur ? nm(cur) : L('（選特工）', '(choose an operative)')}</option>
        ${living(g, side).map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}</select></div>`;
  }
  if (g.teams[side] === 'deathKorps' && !isAI(side) && (dkGambitOk(g, side, 'chrono') || dkGambitOk(g, side, 'gas'))) {
    html += `<div class="gambit"><h4>${L('戰略謀略（裝備）', 'Strategic gambits (equipment)')}</h4>
      ${dkGambitOk(g, side, 'chrono') ? `<button data-act="dkgambit" data-side="${side}" data-id="chrono">${L('懷錶：友方免費衝刺（整場一次）', 'Chronometer: free Dashes (once per battle)')}</button>` : ''}
      ${dkGambitOk(g, side, 'gas') ? `<button data-act="dkgambit" data-side="${side}" data-id="gas">${L('毒氣轟炸：放毒氣標記（整場一次）', 'Gas Bombardment: place the Gas marker (once per battle)')}</button>` : ''}</div>`;
  }
  if (primaryPending(g, side) && !isAI(side)) { // Primary Op: a secret choice made once in the first Strategy phase
    const name = { crit: L('核心任務（Crit Op）', 'Crit Op'), tac: L('戰術行動（Tac Op）', 'Tac Op'), kill: L('Kill Op（擊殺）', 'Kill Op') };
    html += `<div class="gambit"><h4>${L('主要任務（Primary Op，策略謀略）', 'Primary Op (strategic gambit)')}</h4>
      <p class="hint small">${L('秘密選一個：該任務的得分 ×1.5（無條件進位），遊戲結束才公布；選 Kill Op 則是（擊殺等級分＋較高者 1 分）×1.5。', 'Choose one in secret: its VP x1.5 (rounded up), revealed at the end; for Kill Op, (grade VP + 1 for the higher grade) x1.5.')}</p>
      <div class="row">${PRIMARY_OPS.map((id) => `<button data-act="primaryop" data-side="${side}" data-id="${id}">${name[id]}</button>`).join('')}</div></div>`;
  }
  if (g.teams[side] === 'wolfScouts' && !isAI(side) && (wsStormOk(g, side) || wsPounceOk(g, side))) {
    html += `<div class="gambit"><h4>${L('狼偵查小隊策略謀略', 'Wolf Scout strategic gambits')}</h4>`;
    if (wsStormOk(g, side)) html += `<p class="hint small">${L('元素風暴：點棋盤放風暴標記（完全在 6" 內就是在風暴內）。', 'Elemental Storm: tap the board for the Storm marker (wholly within 6" is within the storm).')}</p><div class="row"><button class="${ui.stormMode?.side === side ? 'on' : ''}" data-act="wsstorm" data-side="${side}">${ui.stormMode?.side === side ? L('取消', 'Cancel') : L('放置風暴標記', 'Place the Storm marker')}</button><button data-act="wsstormauto" data-side="${side}">${L('自動放置', 'Place automatically')}</button></div>`;
    if (wsPounceOk(g, side)) {
      const kinds = [['charge', L('衝鋒', 'Charge')], ['reposition', L('移動', 'Reposition')], ['fallBack', L('撤退', 'Fall Back')]];
      html += `<p class="hint small">${L('撲擊（整場一次）：芬里斯狼免費衝鋒、移動或撤退；之後到下次啟動結束 APL -1，不能做這三種動作。', 'Pounce (once per battle): the Fenrisian Wolf makes a free Charge, Reposition or Fall Back; then -1 APL and none of those until the end of its next activation.')}</p><div class="row">${kinds.map(([k, lab]) => `<button class="${ui.pounce?.kind === k ? 'on' : ''}" data-act="wspounce" data-side="${side}" data-kind="${k}">${lab}</button>`).join('')}</div>`;
      if (ui.pounce?.side === side) html += `<p>${L('點棋盤選終點', 'Tap the board for the destination')}</p><div class="row"><button data-act="wspounceok" ${ui.path?.ok ? '' : 'disabled'}>${L('確定撲擊', 'Confirm Pounce')}</button><button data-act="wspouncex">${L('取消', 'Cancel')}</button></div>`;
    }
    html += `</div>`;
  }
  if (g.teams[side] === 'stealthSuits' && !isAI(side) && (xvDroneOk(g, side) || xvJamOk(g, side))) {
    html += `<div class="gambit"><h4>${L('XV26 策略謀略', 'XV26 strategic gambits')}</h4>`;
    if (xvDroneOk(g, side)) html += `<label>${L('無人機控制：', 'Drone Controller: ')}<select id="xvDroneSel">${living(g, side).filter((o) => tpl(o).xvDrone && o.x > -50).map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}</select></label><button data-act="xvdrone" data-side="${side}">${L('解除無人機限制（到它下次啟動結束）', 'Lift its Drone limits (until the end of its next activation)')}</button>`;
    if (xvJamOk(g, side)) html += `<button data-act="xvjam" data-side="${side}">${L('反網路干擾器：選一個目標點', 'Counter-Network Jammers: pick an objective marker')}</button>`;
    html += `</div>`;
  }
  if (g.teams[side] === 'voidDancers' && !isAI(side) && (vdChooseOk(g, side) || vdGrantOk(g, side) || vdLeadOk(g, side))) {
    const opts = (list) => list.map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('');
    html += `<div class="gambit"><h4>${L('劇目（策略謀略）', 'Saedath (strategic gambits)')}</h4>`;
    if (vdChooseOk(g, side)) html += `<p class="hint small">${L('選寓言與主角：史詩＝近戰時近戰武器「平衡」，主角近戰中使敵人殘廢即完成演出；通俗劇＝遠程武器「平衡」，射擊使敵人殘廢即完成演出。', 'Pick the allegory and the Pivotal Role: Epic = Balanced melee weapons when fighting, completed by incapacitating an enemy in a fight; Melodrama = Balanced ranged weapons, completed by incapacitating an enemy by shooting.')}</p>
      <label>${L('主角', 'Pivotal Role')} <select id="vdPivot">${opts(living(g, side))}</select></label>
      <div class="row"><button data-act="vdchoose" data-side="${side}" data-al="epic">${L('史詩', 'Epic')}</button><button data-act="vdchoose" data-side="${side}" data-al="melodrama">${L('通俗劇', 'Melodrama')}</button></div>`;
    if (vdGrantOk(g, side)) html += `<label>${L('讓一名友方獲得讚譽', 'One friendly gains the Accolade')} <select id="vdGrant">${opts(vdCandidates(g, side))}</select></label><button data-act="vdgrant" data-side="${side}">${L('確定', 'Confirm')}</button>`;
    if (vdLeadOk(g, side)) html += `<button data-act="vdlead" data-side="${side}">${L('領銜演出：更換寓言（整場一次）', 'Lead the Performance: change the allegory (once per battle)')}</button>`;
    html += `</div>`;
  }
  if (g.teams[side] === 'aquilons' && !isAI(side) && (aqDropLeft(g, side) || aqRapidOk(g, side))) html += `<div class="gambit"><h4>${L('空降（策略謀略）', 'Drop Insertion (strategic gambits)')}</h4>${aqDropLeft(g, side) ? `<p class="hint small">${L('把空降標記水平移動最多 4"：按「移動標記」，點一個標記再點目的地。', 'Move the Drop markers up to 4": press Move markers, tap a marker, then its destination.')}</p><div class="row"><button class="${ui.dropMode?.side === side ? 'on' : ''}" data-act="dropmode" data-side="${side}">${ui.dropMode?.side === side ? L('取消', 'Cancel') : L('移動標記', 'Move markers')}</button><button data-act="dropauto" data-side="${side}">${L('自動（往敵人靠近）', 'Auto (towards the enemy)')}</button></div>` : ''}${aqRapidOk(g, side) ? `<button data-act="aqrapid" data-side="${side}">${L('快速空降：降落區內的士兵免費重新定位（距降落區 3" 內）', 'Rapid Insertion: Troopers in the drop zone make a free Reposition (within 3" of it)')}</button>` : ''}</div>`;
  if (g.teams[side] === 'spectres' && !isAI(side) && spStarshellOk(g, side)) html += `<div class="gambit"><h4>${L('照明彈（策略謀略）', 'Starshell Flare (strategic gambit)')}</h4><button data-act="spstarshell" data-side="${side}">${L('投擲：一名友方魅影免費震撼手雷（自動選目標）', 'Throw: a friendly Spectre makes a free Stun Grenade (target picked automatically)')}</button></div>`;
  if (g.teams[side] === 'raveners' && !isAI(side) && (rvMarkerLeft(g, side) || rvLinkOk(g, side))) { // Raveners: the next Tunnel marker, Synaptic Link
    html += `<div class="gambit"><h4>${L('隧道與突觸連結（策略謀略）', 'Tunnel and Synaptic Link (strategic gambits)')}</h4>`;
    if (rvMarkerLeft(g, side)) html += `<p class="hint small">${L(`放下隧道標記 ${rvTunnel(g, side).length}：落在上一個標記 5" 內。按下後點擊戰場。`, `Place Tunnel marker ${rvTunnel(g, side).length}: within 5" of the last one. Press, then tap the board.`)}</p>
      <div class="row"><button class="${ui.tunnelMode?.side === side ? 'on' : ''}" data-act="tunnelmode" data-side="${side}">${ui.tunnelMode?.side === side ? L('取消', 'Cancel') : L('放置標記', 'Place marker')}</button><button data-act="tunnelauto" data-side="${side}">${L('自動放置', 'Auto')}</button></div>`;
    if (rvLinkOk(g, side)) html += `<button data-act="rvlink" data-side="${side}">${L('突觸連結：擲 D6（2 倍回合數以上 +1CP；小於回合數則首領受傷）', 'Synaptic Link: roll a D6 (twice the turning point or more: +1CP; less than it: the Prime takes that damage)')}</button>`;
    html += `</div>`;
  }
  if (team(g, side).obeliskNodes && !isAI(side)) { // Canoptek Circle: the obelisk nodes are placed / moved by hand
    const left = nodesLeftToPlace(g, side), done = g.nodeTP?.[side] === g.tp, mode = ui.nodeMode?.side === side ? ui.nodeMode : null;
    html += `<div class="gambit"><h4>${L('方尖碑節點（策略謀略）', 'Obelisk nodes (strategic gambit)')}</h4>`;
    if (g.tp === 1) {
      html += left > 0
        ? `<p class="hint small">${L(`第一回合：在己方領域內放置 3 個節點（還差 ${left} 個）。按下後點擊戰場。`, `First turning point: place your three nodes wholly in your territory (${left} to go). Tap the board after pressing the button.`)}</p>
           <div class="row"><button class="${mode ? 'on' : ''}" data-act="nodemode" data-side="${side}" data-m="place">${mode ? L('取消放置', 'Cancel') : L('放置節點', 'Place nodes')}</button><button data-act="nodeauto" data-side="${side}">${L('自動放置', 'Auto place')}</button></div>`
        : `<p class="hint small">${L('3 個節點都放好了。', 'All three nodes are placed.')}</p>`;
    } else {
      html += done ? `<p class="hint small">${L('本回合節點已處理完。', 'The nodes are settled for this turning point.')}</p>`
        : `<p class="hint small">${L('每個節點可水平移動最多 3"：按「移動節點」，點一個節點再點目的地。不想移動就按「完成」。', 'Each node can move up to 3" horizontally: press Move nodes, tap a node, then its destination. Press Done to skip.')}</p>
           <div class="row"><button class="${mode ? 'on' : ''}" data-act="nodemode" data-side="${side}" data-m="move">${mode ? L('取消移動', 'Cancel') : L('移動節點', 'Move nodes')}</button><button data-act="nodesdone" data-side="${side}">${L('完成', 'Done')}</button></div>`;
    }
    html += '</div>';
  }
  const kb = living(g, side).find((o) => tpl(o).callTheKill);
  if (kb) {
    const cur = g.mark?.[side];
    html += `<div class="gambit"><h4>${L('呼喚獵殺（獵殺掮客）', 'Call the Kill (Kill-broker)')}</h4>
      <p class="hint small">${L('選一名敵人作為本回合的標記：射擊、近戰或反擊它時武器獲得「平衡」。標記殘廢時會自動選下一個，並觸發勝利尖嘯。', 'Mark an enemy for the turning point: weapons have Balanced against it. When it falls, a new mark is picked and Victory Shriek triggers.')}</p>
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
  // Crit Op 5 Stake Claim (TP2+): an objective marker not picked before, and a claim.
  if (g.mission === 'stakeClaim' && g.tp >= 2 && !isAI(side)) {
    const cur = g.claims?.[side]?.tp === g.tp ? g.claims[side] : null;
    const objLabel = (i) => { const o = g.objectives[i]; return o.centre ? L('中央目標點', 'Centre objective') : `${L(o.x < 15 ? '左側目標點' : '右側目標點', o.x < 15 ? 'Left objective' : 'Right objective')}`; };
    html += `<div class="gambit"><h4>${L('宣示主權（核心任務）', 'Stake Claim (Crit Op)')}</h4>
      <p class="hint small">${L('選一個目標點（整場每個只能選一次）與宣告；回合結束時宣告成真 +1 VP。沒選的話會自動幫你選。', 'Pick an objective marker (each once per battle) and a claim; +1VP at the end of the TP if it\'s true. If you don\'t pick, one is picked for you.')}</p>
      <select data-act="claimobj" data-side="${side}"><option value="">${L('（選目標點）', '(objective marker)')}</option>${claimChoices(g, side).map((i) => `<option value="${i}" ${cur?.obj === i ? 'selected' : ''}>${objLabel(i)}</option>`).join('')}</select>
      <select data-act="claimkind" data-side="${side}"><option value="control" ${cur?.kind !== 'deny' ? 'selected' : ''}>${L('回合結束時我方控制它', 'We control it at the end of the TP')}</option><option value="deny" ${cur?.kind === 'deny' ? 'selected' : ''}>${L('回合結束時敵方不在爭奪它', 'The enemy won\'t contest it at the end of the TP')}</option></select>
    </div>`;
  }
  // Crit Op 9 Reboot (every TP): secretly pick an objective marker; both picks are revealed when the Strategy phase ends.
  if (g.mission === 'reboot' && !isAI(side)) {
    const cur = g.rebootPick?.[side]?.tp === g.tp ? g.rebootPick[side].obj : null;
    html += `<div class="gambit"><h4>${L('重啟：暗中選目標點（核心任務）', 'Reboot: secret pick (Crit Op)')}</h4>
      <p class="hint small">${L('雙方選同一個 → 它本回合失效；選不同 → 兩人都沒選的那個失效。沒選的話會隨機幫你選。', 'Same pick → that one is inert this TP; different picks → the one neither picked is inert. If you don\'t pick, one is picked at random.')}</p>
      <select data-act="reboot" data-side="${side}"><option value="">${L('（選目標點）', '(objective marker)')}</option>${g.objectives.map((o, i) => `<option value="${i}" ${cur === i ? 'selected' : ''}>${i + 1} ${L('號', '')}${o.centre ? L('（中央）', ' (centre)') : L(o.x < 15 ? '（左側）' : '（右側）', o.x < 15 ? ' (left)' : ' (right)')}</option>`).join('')}</select>
    </div>`;
  }
  // Tac Op Envoy (TP2+): pick the envoy for this turning point.
  if (g.tacOps?.[side]?.id === 'envoy' && g.tp >= 2 && !isAI(side)) {
    const cur = g.tacOps[side].envoy?.tp === g.tp ? g.tacOps[side].envoy.uid : null;
    html += `<div class="gambit"><h4>${L('使節（戰術行動）', 'Envoy (Tac Op)')}</h4>
      <p class="hint small">${L('選一名之前沒當過使節的友方；回合結束時它完全在敵方領土、且不在敵人控制範圍內 +1 VP（沒受傷 +2）。', 'Pick a friendly that hasn\'t been the envoy; +1VP if at the end of the TP it\'s wholly in enemy territory and not in an enemy\'s control range (+2 if unhurt).')}</p>
      <select data-act="envoy" data-side="${side}"><option value="">${L('（選使節）', '(choose the envoy)')}</option>${[...envoyChoices(g, side), ...(cur ? [getOp(g, cur)] : [])].filter((o, i, a) => a.indexOf(o) === i).map((o) => `<option value="${o.uid}" ${cur === o.uid ? 'selected' : ''}>${nm(o)}</option>`).join('')}</select>
    </div>`;
  }
  // Reaction firefight ploys: used automatically while switched on (and affordable, once per turning point).
  // A player's are off unless switched on (the setup option turns them all on): learning when to use them is part of the game.
  const autos = autoPloys(team(g, side));
  if (autos.length && !isAI(side)) {
    html += `<div class="gambit"><h4>${L('自動使用的交戰計謀', 'Firefight ploys used automatically')}</h4>
      <p class="hint small">${L('預設全部關閉。勾選的計謀，在觸發時機（被射擊、受傷、殘廢…）會自動花 CP 使用；沒勾就不會用。想清楚哪個時機值得花 CP 再勾。', 'All off by default. A ticked ploy is spent automatically when its moment comes (shot, damaged, incapacitated…); unticked ones are never used. Think about when each is worth the CP before ticking it.')}</p>
      <div class="row"><button data-act="ffarmall" data-side="${side}" data-on="1">${L('全部開啟', 'All on')}</button><button data-act="ffarmall" data-side="${side}" data-on="0">${L('全部關閉', 'All off')}</button></div>
      ${autos.map((p) => `<label class="small"><input type="checkbox" data-act="ffarm" data-side="${side}" data-id="${p.id}" ${ffArmed(g, side, p.id) ? 'checked' : ''}> ${esc(tx(p.name))}（${p.cp}CP）<span class="hint">${esc(tx(p.desc))}</span></label>`).join('')}
    </div>`;
  }
  // Automatic abilities, equipment and ploy effects the rules leave to the player ("you can"): off until ticked.
  const abil = autoAbilitiesFor(g, side).filter((a) => (!a.equip || g.equip?.[side]?.includes(a.equip)) && (!a.ploy || g.ploys?.[side]?.includes(a.ploy)));
  if (abil.length && !isAI(side)) {
    html += `<div class="gambit"><h4>${L('自動使用的能力與裝備', 'Abilities and equipment used automatically')}</h4>
      <p class="hint small">${L('規則寫「可以」的能力與裝備預設關閉；勾選後在時機到時自動使用（每回合一次的會用掉這回合的次數）。買下的策略計謀預設開啟，也可以取消。', 'Abilities and equipment that say "you can" are off by default (bought strategy ploys start on); ticked ones are used automatically when their moment comes (once-per-TP ones use up that TP\'s use).')}</p>
      ${abil.map((a) => `<label class="small"><input type="checkbox" data-act="abarm" data-side="${side}" data-id="${a.id}" ${abilityArmed(g, side, a.id) ? 'checked' : ''}> ${esc(tx(a.name))}<span class="hint">${esc(tx(a.desc))}</span></label>`).join('')}
    </div>`;
  }
  // Kasrkin: Skill at Arms (two while the Sergeant is in the killzone).
  if (team(g, side).skillAtArms && !isAI(side)) {
    const cur = g.skills?.[side]?.tp === g.tp ? g.skills[side].ids : [];
    const n = skillSlots(g, side);
    const sel = (i) => `<select data-act="skill" data-side="${side}" data-i="${i}"><option value="">${L('（選擇戰技）', '(choose a skill)')}</option>${Object.keys(SKILLS).map((id) => `<option value="${id}" ${cur[i] === id ? 'selected' : ''} ${cur.includes(id) && cur[i] !== id ? 'disabled' : ''}>${esc(tx(SKILLS[id].name))}</option>`).join('')}</select>`;
    html += `<div class="gambit"><h4>${L(`戰技（可選 ${n} 種）`, `Skill at Arms (pick ${n})`)}</h4>
      <p class="hint small">${Object.values(SKILLS).map((s) => `<b>${esc(tx(s.name))}</b>：${esc(tx(s.desc))}`).join('<br>')}</p>
      ${Array.from({ length: n }, (_, i) => sel(i)).join(' ')}
      <p class="hint small">${L('沒選的話會自動選「點燃他們」（與「冷血」）。', 'If you don\'t pick, Light \'Em Up (and Ice In Your Veins) are picked for you.')}</p></div>`;
  }
  if (team(g, side).doctrina) {
    const cur = g.doctrina?.[side]?.tp === g.tp ? g.doctrina[side] : null;
    const tm = team(g, side), primary = g.tactics?.[side]?.[0];
    const pname = tm.tactics.find((x) => x.id === primary)?.name;
    html += `<div class="gambit"><h4>${L('教條指令', 'Doctrina Imperative')}</h4>
      <p class="hint small">${L(`選一種指令給全隊，直到下回合：優化與劣化同時生效。主要模式：${pname ? tx(pname) : '—'}`, `Pick an Imperative for the team until next turning point: both its Optimisation and Deprecation apply. Primary Mode: ${pname ? tx(pname) : '—'}`)}</p>
      <select data-act="doctrina" data-side="${side}"><option value="">${L('（選擇指令）', '(choose an Imperative)')}</option>
        ${tm.tactics.map((x) => `<option value="${x.id}" ${cur?.mode === x.id ? 'selected' : ''}>${esc(bi(x.name))}${x.id === primary ? L('（主要）', ' (Primary)') : ''}</option>`).join('')}
      </select>
      ${primaryLeft(g, side) || cur?.noDep ? `<label class="small"><input type="checkbox" data-act="nodep" data-side="${side}" ${cur?.noDep ? 'checked' : ''}> ${L('選主要模式時無視劣化（整場一次）', 'Ignore the Primary Mode\'s Deprecation (once per battle)')}</label>` : ''}
      ${cur ? `<p class="hint small"><b>${esc(tx(tm.tactics.find((x) => x.id === cur.mode).name))}</b>：${esc(tx(tm.tactics.find((x) => x.id === cur.mode).desc))}${cur.noDep ? L('（劣化已無視）', ' (Deprecation ignored)') : ''}</p>` : ''}
    </div>`;
  }
  if (team(g, side).justiceMark) {
    const cur = g.mark?.[side];
    html += `<div class="gambit"><h4>${L('正義標記', 'Marked for Justice')}</h4>
      <p class="hint small">${L('選一名敵人：本回合友方射擊、近戰或反擊它時，武器獲得「懲罰」。它殘廢時會自動改標記剩餘生命最多的敵人。', 'Select an enemy: this TP, friendly weapons have Punishing against it. When it falls, the enemy with the most wounds left becomes the new mark.')}</p>
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
      <p class="hint small">${L('選敵人給一個宿怨標記（友方殘廢 3 人以上時可選 2 名）。標記整場保留。', 'Give enemies a Grudge token (two if three or more friendlies are down). Tokens last the battle.')}</p>
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
  if (team(g, side).id === 'deathwatch' && dwScrambleTargets(g, side).length) {
    const used = g.dwScramble?.[side]?.tp === g.tp;
    html += `<div class="gambit"><h4>${L('進階全頻擾亂器', 'Advanced Omni-scrambler')}</h4><p class="hint small">${L('選一名敵人延後啟動；未選時自動選 APL 最高者。', 'Choose an enemy to delay; otherwise the highest APL is chosen automatically.')}</p><select data-act="dwscramble" data-side="${side}" ${used ? 'disabled' : ''}><option value="">${used ? L('已使用', 'Used') : L('（自動選擇）', '(automatic)')}</option>${dwScrambleTargets(g, side).map((o) => `<option value="${o.uid}">${nm(o)}</option>`).join('')}</select></div>`;
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
  // Approved Ops: Crit Op and Tac Op VP in their own columns.
  const by = (s, k) => (m.approved ? `<td>${g.vpBy?.[s]?.[k] || 0}</td>` : '');
  const line = (s) => `<tr><td style="color:${team(g, s).color}">${esc(bi(team(g, s).name))}</td><td>${g.kills[s]}</td><td>${killGrade(g, s)}</td>${by(s, 'crit')}${by(s, 'tac')}<td>${killOpVP(g, s)}</td>${m.approved ? `<td>${{ crit: L('核心', 'Crit'), tac: L('戰術', 'Tac'), kill: 'Kill' }[g.primaryOps?.[s]] || ''} +${primaryBonus(g, s)}</td>` : ''}<td><b>${totalVP(g, s)}</b></td></tr>`;
  return `<section class="card">
    <h2>${w == null ? L('平手！', 'Draw!') : L(`${esc(bi(team(g, w).name))} 獲勝！`, `${esc(bi(team(g, w).name))} wins!`)}</h2>
    ${m.approved ? `<p class="hint">${esc(tx(m.name))}</p>` : ''}
    <table class="final"><tr><th></th><th>${L('擊殺數', 'Kills')}</th><th>${L('擊殺等級', 'Grade')}</th>${m.approved ? `<th>${L('核心任務', 'Crit Op')}</th><th>${L('戰術行動', 'Tac Op')}</th>` : ''}<th>Kill Op</th>${m.approved ? `<th>${L('主要任務加成', 'Primary')}</th>` : ''}<th>${L('總分', 'Total')}</th></tr>${line(0)}${line(1)}</table>
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

/** Aim / attack firefight ploys the player can tick for this Shoot or Fight (paid when the dice are rolled). */
function ffToggles(op, kind, weapon, target, aim) {
  const opts = ffAttackOptions(g, op, kind, weapon, target, aim);
  if (!opts.length) return '';
  return `<div class="ffploys">${g.teams[op.side] === 'vespids' ? `<p class="small">${L(`交融點數：${vsPoints(g, op.side)}`, `Communion points: ${vsPoints(g, op.side)}`)}</p>` : ''}<h4>${L(`交戰計謀 · CP ${g.cp[op.side]}（擲骰時才扣）`, `Firefight ploys · CP ${g.cp[op.side]} (paid when rolling)`)}</h4>${opts.map((o) => {
    const p = ffDef(g, op.side, o.id);
    return `<label class="small ${o.ok ? '' : 'off'}"><input type="checkbox" data-act="fftoggle" data-id="${o.id}" data-uid="${op.uid}" data-target="${target?.uid || ''}" ${o.on ? 'checked' : ''} ${o.ok || o.on ? '' : 'disabled'}> ${esc(tx(p.name))}（${o.cp}CP）<span class="hint">${esc(tx(p.desc))}${o.why ? ` — ${esc(tx(o.why))}` : ''}</span></label>`;
  }).join('')}</div>`;
}

/** A declared attack, shown on the board before any dice are rolled. */
function pendingView() {
  const p = ui.pending, a = p.by ? getOp(g, p.by) : activeOp(g), t = getOp(g, p.target);
  const verb = p.kind === 'shoot' ? L('射擊', 'shoots') : L('近戰攻擊', 'fights');
  const by = (o) => `<b style="color:${team(g, o.side).color}">${nm(o)}</b>`;
  return `<div class="pending"><h3>${p.kind === 'shoot' ? '⌖' : '⚔'} ${L('宣告攻擊', 'Attack declared')}</h3>
    <p>${by(a)} ${L('以', 'with')} ${esc(bi(p.weapon.name))} ${verb} ${by(t)}</p>
    ${p.ai ? '' : ffToggles(a, p.kind, p.weapon, t, false)}
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
      archonAutoReroll(g, getOp(g, which === 'a' ? seq.op : seq.target), seq, which);
      const i = aiRerollChoice(g, side, seq, which);
      if (i >= 0) commandReroll(g, side, seq, which, i);
      continue;
    }
    if ((which === 'a' ? seq.a : seq.d)?.balancedLeft || (which === 'a' ? seq.a : seq.d)?.ceaselessLeft || (which === 'a' ? seq.a : seq.d)?.relentlessLeft || (which === 'a' ? seq.a : seq.d)?.digInLeft || (which === 'a' ? seq.a : seq.d)?.rerollLeft || canCommandReroll(g, side, seq, which) || painRerollValues(g, getOp(g, which === 'a' ? seq.op : seq.target), seq, which).length) { F.step = { stage, seq, side }; return render(); }
  }
}

/** The free re-rolls a player still has on this pool: Ceaseless (pick a result) and Relentless (pick the dice, then re-roll them). */
function rerollRows(pool, where, k) {
  const free = pool.dice.map((d, i) => [d, i]).filter(([d]) => !d.auto && !d.rr && !d.locked);
  let html = '';
  if (pool.ceaselessLeft) {
    const values = [...new Set(free.map(([d]) => d.v))].filter((v) => !(pool.noReroll1 && v === 1)).sort((x, y) => x - y);
    if (values.length) html += `<div class="row"><span class="flag mk">♻ ${L('無休：選一個點數，重擲所有該點數的骰', 'Ceaseless: pick a result, re-roll every die showing it')}</span>${values.map((v) => `<button data-act="ceaseless" data-where="${where}" data-k="${k}" data-v="${v}">${L(`重擲所有 ${v}`, `Re-roll all ${v}s`)}</button>`).join('')}</div>`;
  }
  if (pool.relentlessLeft && free.length) {
    const sel = ui.relSel || [];
    html += `<div class="row"><span class="flag mk">⚡ ${L('毫不留情：點選要重擲的骰子（任意顆），再按重擲', 'Relentless: tick the dice to re-roll (any number), then re-roll')}</span>${free.map(([d, i]) => `<button class="${sel.includes(i) ? 'on' : ''}" data-act="relpick" data-i="${i}">${d.v}</button>`).join('')}<button data-act="relgo" data-where="${where}" data-k="${k}" ${sel.length ? '' : 'disabled'}>${L(`重擲選取的 ${sel.length} 顆`, `Re-roll the ${sel.length} picked`)}</button></div>`;
  }
  return html;
}
/** The dice a human can Command Re-roll (1CP), shown before the action continues. */
function flowView() {
  const { stage, seq, side } = ui.flow.step;
  const a = getOp(g, seq.op), t = getOp(g, seq.target), which = stage === 'attack' ? 'a' : 'd';
  const pool = which === 'a' ? seq.a : seq.d, tm = team(g, side);
  const used = !canCommandReroll(g, side, seq, which), bal = !!pool.balancedLeft, vd = pool.rerollLeft || 0;
  const values = [...new Set(pool.dice.filter((d) => !d.auto && !d.rr && !d.locked).map((d) => d.v))].sort((x, y) => x - y);
  const dig = pool.digInLeft && values.length ? `<div class="row"><span class="flag mk">⛨ ${L('可重擲某一點數的所有骰（固守等）', 'Re-roll every die of one result (Dig In! etc.)')}</span>${values.map((v) => `<button data-act="digin" data-v="${v}">${L(`重擲所有 ${v}`, `Re-roll all ${v}s`)}</button>`).join('')}</div>` : '';
  const dice = pool.dice.map((d, i) => (d.auto ? die(d, i) : bal ? `<button class="diebtn" ${d.rr ? 'disabled' : ''} data-act="balancedie" data-i="${i}" title="${L('平衡：免費重擲這顆骰', 'Balanced: re-roll this die for free')}">${die(d, i)}</button>`
    : vd ? `<button class="diebtn" ${d.rr ? 'disabled' : ''} data-act="voiddie" data-i="${i}" title="${L('虛空護甲：免費重擲這顆骰', 'Void Armour: re-roll this die for free')}">${die(d, i)}</button>`
    : `<button class="diebtn" ${used ? 'disabled' : ''} data-act="rerolldie" data-i="${i}" title="${L('指揮重擲這顆骰（1CP）', 'Command Re-roll this die (1CP)')}">${die(d, i)}</button>`)).join('');
  return `<h2>⌖ ${stage === 'attack' ? L('攻擊骰', 'Attack dice') : L('防禦骰', 'Defence dice')}</h2>
    <p><b style="color:${team(g, a.side).color}">${nm(a)}</b> → <b style="color:${team(g, t.side).color}">${nm(t)}</b> · ${esc(bi(seq.weapon.name))}</p>
    <div class="dicerow"><label>${stage === 'attack' ? `${L('攻擊', 'Attack')} (${seq.hit}+)` : `${L('防禦', 'Defence')} (${seq.save}+)`}</label>${dice}
      <em>${L(`${pool.crits} 暴擊 / ${pool.norms} 成功`, `${pool.crits} crit / ${pool.norms} success`)}</em>${bal ? ` <span class="flag mk">⚖ ${L('可平衡：免費重擲一顆', 'Balanced: one free re-roll')}</span>` : ''}${vd ? ` <span class="flag mk">🛡 ${L(`虛空護甲：可免費重擲 ${vd} 顆`, `Void Armour: ${vd} free re-roll(s)`)}</span>` : ''}</div>
    ${dig}${rerollRows(pool, 'flow', '')}${vd && !bal ? `<p class="hint small">${L(`被爆炸或洪流武器射擊，「虛空護甲」可以免費重擲 ${vd} 顆防禦骰（點骰子；不用也可以直接繼續）。用完後再點才是指揮重擲。`, `Shot by a Blast or Torrent weapon: Void Armour lets you re-roll ${vd} defence dice for free (tap them, or just continue). After that, a tap is a Command Re-roll.`)}</p>` : ''}${pool.digInLeft ? `<p class="hint small">${L('這次防禦可以「重擲某一點數的所有骰子」（固守！、防禦命令、皇帝庇佑、預警或超能護盾）：選一個點數，或不用直接繼續。', 'This defence can re-roll every die of one result (Dig In!, Defence Order, The Emperor Protects, Forewarned or Hypershielding): pick a result, or just continue.')}</p>` : ''}
    ${bal ? `<p class="hint small">${L('這次擲骰有「平衡」：可以免費重擲一顆骰（點該骰子；不想用就直接繼續）。用過之後再點骰子才是花 1CP 的指揮重擲。', 'This roll has Balanced: you can re-roll one die for free (tap it; or just continue). After that, tapping a die is a 1CP Command Re-roll.')}</p>` : ''}
    <p class="hint small">${L(`<b style="color:${tm.color}">${esc(tx(tm.name))}</b> 有 ${g.cp[side]} CP：可花 1CP「指揮重擲」一顆骰（點該骰子）。`,
    `<b style="color:${tm.color}">${esc(tx(tm.name))}</b> has ${g.cp[side]}CP: spend 1CP on a Command Re-roll of one die (tap it).`)}${used && !seq.rerolled?.[which] ? ` ${L('（此時不能重擲）', '(not allowed now)')}` : ''}</p>
    ${painRerollValues(g, which === 'a' ? a : t, seq, which).map((v) => `<button data-act="painreroll" data-value="${v}">${L(`刺激感官：重擲所有 ${v}（1 痛苦）`, `Stimulated Senses: re-roll all ${v}s (1 Pain)`)}</button>`).join('')}
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
  if (m.approved) {
    // VP so far: crit op / tac op / kill op; Tac Ops are shown once revealed (or always for a human player's own).
    const by = (s) => g.vpBy?.[s] || {};
    parts.push(L(`核心 ${by(0).crit || 0}:${by(1).crit || 0} · 戰術 ${by(0).tac || 0}:${by(1).tac || 0} · 擊殺 ${killOpVP(g, 0)}:${killOpVP(g, 1)}（等級 ${killGrade(g, 0)}:${killGrade(g, 1)}）`, `Crit ${by(0).crit || 0}:${by(1).crit || 0} · Tac ${by(0).tac || 0}:${by(1).tac || 0} · Kill ${killOpVP(g, 0)}:${killOpVP(g, 1)} (grade ${killGrade(g, 0)}:${killGrade(g, 1)})`));
    if (g.critTP?.compile?.tp === g.tp && (g.tp === 2 || g.tp === 3)) parts.push(L(`本回合彙整資料 ${g.critTP.compile.n[0]}:${g.critTP.compile.n[1]}`, `Compile Data this TP ${g.critTP.compile.n[0]}:${g.critTP.compile.n[1]}`));
    for (const s of [0, 1]) {
      const t = g.tacOps?.[s];
      if (!t) continue;
      const known = t.revealed || !isAI(s);
      parts.push(`${esc(tx(team(g, s).name))}：${known ? `${esc(tx(TAC_OPS[t.id].name))}${t.revealed ? '' : L('（未揭露）', ' (hidden)')}` : L('戰術行動未揭露', 'Tac Op hidden')}`);
    }
    const cl = (s) => g.claims?.[s]?.tp === g.tp ? g.claims[s] : null;
    for (const s of [0, 1]) if (cl(s)) parts.push(L(`${tx(team(g, s).name)} 宣示：${g.objectives[cl(s).obj].centre ? '中央' : g.objectives[cl(s).obj].x < 15 ? '左側' : '右側'}${cl(s).kind === 'control' ? '控制' : '不讓敵方爭奪'}`, `${tx(team(g, s).name)} claims the ${g.objectives[cl(s).obj].centre ? 'centre' : g.objectives[cl(s).obj].x < 15 ? 'left' : 'right'} objective (${cl(s).kind === 'control' ? 'control' : 'deny'})`));
  }
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
    html += g.netcounter?.kind === 'control' && g.netcounter.onlyActions ? `<p><b>${L('煽動', 'Incite')}</b></p>
      <p class="hint">${g.netcounter.onlyActions.includes('fight') ? L('選定的信徒免費近戰一次，之後煽動者繼續啟動；也可以略過。', 'The chosen cultist fights for free, then the Demagogue\'s activation continues; or pass.')
        : L('選定的信徒免費衝鋒（最多 3"）或衝刺一次，之後煽動者繼續啟動；也可以略過。', 'The chosen cultist Charges (up to 3") or Dashes for free, then the Demagogue\'s activation continues; or pass.')}</p>
      <div class="readylist">${cands.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`
      : g.netcounter?.kind === 'control' ? `<p><b>${L('冥工控制', 'Canoptek Control')}</b></p>
      <p class="hint">${L('選定的冥工機械免費執行一個 1AP 動作（移動不超過 2"），之後地占術士繼續啟動；也可以略過。', 'The chosen Canoptek performs a free 1AP action (moving no more than 2"), then the Geomancer\'s activation continues; or pass.')}</p>
      <div class="readylist">${cands.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`
      : g.netcounter ? `<p><b>${L('網路反擊', 'Network Counteract')}</b></p>
      <p class="hint">${L('噪聲網路：選一名 APL 2 以上、本回合還沒反擊過的僕從（準備中的也可以，之後仍能正常啟動），先選指令，再免費執行一個 1AP 動作（移動不超過 2"），或略過。',
    'Noospheric Network: pick a servitor with APL 2+ that hasn\'t counteracted this TP (a ready one too — it can still activate later); select its order, then it performs one free 1AP action (moving no more than 2"), or pass.')}</p>
      <div class="readylist">${cands.map((o) => `<button data-act="pickop" data-uid="${o.uid}">${nm(o)} <small>${o.wounds}/${o.maxW}</small></button>`).join('')}</div>`
      : `<p><b>${L('反擊機會', 'Counteract')}</b></p>
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
    if (!isAI(g.turn) && spPatienceOk(g, g.turn)) html += `<button data-act="sppatience">${L('耐心：跳過這次啟動（每回合一次）', 'Patience: skip this activation (once per TP)')}</button>`;
    if (g.teams[g.turn] === 'phobos' && ffReady(g, g.turn, 'patientAmbush')) html += `<button data-act="patientskip">${L('耐心伏擊：跳過這次啟動機會', 'Patient Ambush: skip this activation opportunity')}</button>`;
    if (g.teams[g.turn] === 'handOfArchon') html += `<button data-act="painskip">${L('惡劣傲慢：跳過啟動機會（1CP）', 'Heinous Arrogance: skip activation opportunity (1CP)')}</button>`;
    if (canForeboding(g, g.turn)) html += `<button data-act="foreboding">${L('預感：花 1 點預知點數跳過這次啟動（每回合一次）', 'Foreboding: spend 1 Prescience point to skip this activation (once per TP)')}</button>`;
    if (!g.animating && !isAI(g.turn) && TEAM_MAP[g.teams[g.turn]]?.obeliskNodes && ffReady(g, g.turn, 'animateNodes')) html += `<button data-act="animate">${L('驅動方尖碑節點（跳過這次啟動）', 'Animate Obelisk Nodes (instead of activating)')}</button>`;
    if (g.animating) html += `<p class="hint">${L(`驅動中：點節點再點目的地，還剩 ${g.animating.left}"。`, `Animating: tap a node, then its destination — ${g.animating.left}" left.`)}</p><button class="primary" data-act="animateend">${L('完成', 'Done')}</button>`;
    if (canBribe(g, g.turn)) html += `<button data-act="bribe">${L('貿易許可證「賄賂」：跳過這次啟動（整場一次）', 'Warrant of Trade — Bribe: skip this activation (once per battle)')}</button>`;
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
  // The order is decided right after the operative is picked: no actions until Engage or Conceal is chosen.
  if (!op.orderSet && !op.orderPicked && !ui.pending) {
    html += `<p><b>${L('選擇這次啟動的指令', 'Choose its order for this activation')}</b></p>
      <div class="orders">
      <button class="primary" data-act="order" data-order="engage">⚔ ${L('交戰 Engage', 'Engage')}</button>
      <button class="primary" data-act="order" data-order="conceal" ${op.frenzy || tpl(op).stoopid ? 'disabled' : ''}>◐ ${L('隱蔽 Conceal', 'Conceal')}</button>
    </div><p class="hint small">${L(`目前是${op.order === 'engage' ? '交戰' : '隱蔽'}指令。交戰：可以射擊、衝鋒、反擊；隱蔽：在掩體中時敵人無法選為目標，只能用「無聲」武器射擊，不能衝鋒。選完後、執行第一個動作前都還能改。`, `Currently ${op.order === 'engage' ? 'Engage' : 'Conceal'}. Engage: shoot, charge, counteract. Conceal: can't be targeted while in cover, Silent weapons only, no Charge. You can still change it until the first action.`)}</p>${undoBtn}</section>${datacard(op)}`;
    return html;
  }
  if (!op.orderSet) {
    html += `<div class="orders">
      <button class="${op.order === 'engage' ? 'on' : ''}" data-act="order" data-order="engage">⚔ ${L('交戰 Engage', 'Engage')}</button>
      <button class="${op.order === 'conceal' ? 'on' : ''}" data-act="order" data-order="conceal">◐ ${L('隱蔽 Conceal', 'Conceal')}</button>
    </div><p class="hint small">${L('隱蔽：在掩體中時敵人無法選為目標；可用「無聲（Silent）」武器射擊，其他武器不能。不能衝鋒，反擊依特工能力。執行第一個動作後鎖定。', 'Conceal: protected while in cover; can Shoot with Silent weapons only. Cannot Charge; counteraction depends on operative abilities. Locks after the first action.')}</p>`;
  } else {
    html += `<p class="hint">${L('指令', 'Order')}：${op.order === 'engage' ? L('⚔ 交戰', '⚔ Engage') : L('◐ 隱蔽', '◐ Conceal')}</p>`;
  }

  if (op.reserve) html += `<p class="hint"><b>${L('還在預備區：點棋盤，沿你的場邊選擇進場位置（視同轉向，花 1AP）。', 'In reserve: tap the board to choose where along your killzone edge it enters (counts as a Turn, 1AP).')}</b></p>`;
  if (ui.pending) html += pendingView();
  else if (ui.mode) html += modeView(op);
  else {
    if (goreOf(op) != null) html += gorePanel(op);
    if (TEAM_MAP[op.team]?.yaegirs && op.side < 2) html += resourcePanel(op);
    if (isArchon(op)) {
      html += `<p>${L('痛苦代幣', 'Pain tokens')}: ${op.pain || 0} · ${op.drug}</p><div class="actions">${painOptions(g, op).map((id) => `<button data-act="painuse" data-id="${id}">${esc(tx(PAIN_NAMES[id]))} (1)</button>`).join('')}</div>`;
      if (op.darknessTargets?.length && !op.orderSet) html += `<label>${L('死亡來自黑暗：目標', 'From Darkness, Death: target')}<select data-act="darkness">${op.darknessTargets.map((uid) => `<option value="${uid}" ${op.acted.darknessTarget === uid ? 'selected' : ''}>${nm(getOp(g, uid))}</option>`).join('')}</select></label>`;
    }
    html += `<div class="actions">${availableActions(g, op).map((a) => `<button data-act="action" data-id="${a.id}" ${a.ok ? '' : 'disabled'} title="${a.why ? esc(tx(a.why)) : ''}">
      ${esc(tx(a.name || ACTIONS[a.id].name))} <span class="cp">${a.ap}AP</span></button>`).join('')}</div>`;
    // Heroic Leader (Angels of Death Captain): a Combat Doctrine when a friendly operative is activated.
    if (adHeroicDocOk(g, op.side)) html += `<div class="ffploys"><h4>${L('英雄領袖：補用戰鬥教條（照常付 CP，每回合一次）', 'Heroic Leader: use a Combat Doctrine (pay its CP, once per TP)')}</h4><div class="actions">${adHeroicDocs(g, op.side).map((p) => `<button data-act="adheroicdoc" data-id="${p.id}">${esc(tx(p.name))} <span class="cp">${p.cp}CP</span></button>`).join('')}</div></div>`;
    // Firefight ploys this operative can use now (交戰計謀).
    const ffb = ffButtons(g, op);
    if (ffb.length) {
      html += `<div class="ffploys"><h4>${L(`交戰計謀 · CP ${g.cp[op.side]}`, `Firefight ploys · CP ${g.cp[op.side]}`)}</h4><div class="actions">${ffb.map((b) => {
        const p = ffDef(g, op.side, b.id);
        return `<button data-act="ffuse" data-id="${b.id}" ${b.ok ? '' : 'disabled'} title="${esc(tx(p.desc))}${b.why ? ` — ${esc(tx(b.why))}` : ''}">${esc(tx(p.name))} <span class="cp">${b.cp}CP</span></button>`;
      }).join('')}</div></div>`;
    }
    if (g.phCommsOpen === op.side) { // Comms Array (Phobos): swap a strategy ploy used this turning point for another, free
      const used = g.ploys[op.side].filter((id) => team(g, op.side).ploys.some((p) => p.id === id));
      html += `<div class="ffploys"><h4>${L('通訊陣列', 'Comms Array')}</h4><div class="row"><select id="phCommsOld">${used.map((id) => `<option value="${id}">${L('改掉：', 'Change: ')}${esc(tx(team(g, op.side).ploys.find((p) => p.id === id).name))}</option>`).join('')}</select><select id="phCommsNew">${team(g, op.side).ploys.filter((p) => !used.includes(p.id)).map((p) => `<option value="${p.id}">${esc(tx(p.name))}</option>`).join('')}</select><button data-act="phcomms">${L('確定', 'Confirm')}</button></div></div>`;
    }
    if (g.nodalOpen === op.side) {
      const used = g.ploys[op.side].filter((id) => team(g, op.side).ploys.some((p) => p.id === id));
      html += `<div class="ffploys"><h4>${L('節點回應', 'Nodal Response')}</h4><div class="row"><select id="nodalNew">${team(g, op.side).ploys.map((p) => `<option value="${p.id}">${esc(tx(p.name))} (${p.cp}CP)</option>`).join('')}</select><select id="nodalOld"><option value="">${L('— 現在使用 —', '— use now —')}</option>${used.map((id) => `<option value="${id}">${L('改掉：', 'Change: ')}${esc(tx(team(g, op.side).ploys.find((p) => p.id === id).name))}</option>`).join('')}</select><button data-act="nodal">${L('確定', 'Confirm')}</button></div></div>`;
    }
    if (op.ap <= 0 && !freePending(op)) html += `<p class="hint small">${L('AP 已用完：可以回復上一動作，或結束啟動。', 'Out of AP: undo the last action or end the activation.')}</p>`;
  }
  html += `${undoBtn}<button class="wide ${op.ap <= 0 && !freePending(op) ? 'primary' : ''}" data-act="endact">${L('結束啟動', 'End Activation')}</button></section>`;
  return html + datacard(op);
}

/** Hernkyn Yaegirs: Resourceful points left this TP and the two uses for the active operative. */
function resourcePanel(op) {
  const n = resourceLeft(g, op.side), opts = resourceOptions(g, op).map((o) => o.id);
  const used = op.acted.resUsed;
  return `<div class="respanel"><h4>⛏ ${L('資源點', 'Resourceful points')}：${n}${used ? ` <small>${L('這次已用', 'used this activation')}</small>` : ''}</h4>${n && !used ? `<div class="actions">
    <button data-act="resource" data-id="apl" ${opts.includes('apl') ? '' : 'disabled'} title="${esc(L('不在交戰中：本次啟動 APL +1', 'Not engaged: +1 APL this activation'))}">${L('APL +1', '+1 APL')}</button>
    <button data-act="resource" data-id="heal" ${opts.includes('heal') ? '' : 'disabled'} title="${esc(L('啟動時、不在交戰中：回復 D3+1（戰士 4）', 'When activated, not engaged: regain D3+1 (Warriors 4)'))}">${L('回復生命', 'Heal')}</button></div>` : ''}</div>`;
}
/** Goremongers: the active operative's GORE TANK, its Sanguavitae, Bleeding tokens and Khorne's Favour. */
const GORE_LABEL = [{ zh: '空', en: 'Empty' }, { zh: '半', en: 'Half' }, { zh: '滿', en: 'Full' }];
function gorePanel(op) {
  const gore = goreOf(op), armed = Object.keys(op.acted.sangArm || {}).filter((k) => op.acted.sangArm[k]);
  const bleed = bleedTargets(g, op);
  const btns = sangOptions(g, op).map((o) => `<button data-act="sang" data-id="${o.id}" ${o.ok ? '' : 'disabled'} title="${esc(tx(SANGUAVITAE[o.id].desc))}${o.why ? ` — ${esc(tx(o.why))}` : ''}">${esc(tx(SANGUAVITAE[o.id].name))}</button>`).join('');
  return `<div class="gorepanel"><h4>🩸 ${L('血槽', 'Gore Tank')}：<span class="gore g${gore}">${'●'.repeat(gore)}${'○'.repeat(2 - gore)} ${esc(tx(GORE_LABEL[gore]))}</span>${armed.length ? ` <small>${L('已準備', 'Ready')}：${armed.map((k) => esc(tx(SANGUAVITAE[k].name))).join('、')}</small>` : ''}</h4>
    <p class="hint small">${L('血之精華（消耗一格血槽；同一種每次一次、每次最多兩種）：', 'Sanguavitae (decrease the tank; each once per activation, two at most):')}</p>
    <div class="actions">${btns}${canFavour(g, op) ? `<button data-act="favour">${L('恐虐的恩寵（血槽 +1）', 'Khorne\'s Favour (tank up)')}</button>` : ''}${bleed.length ? `<button data-act="bleed">${L(`取 ${nm(bleed[0])} 的流血標記（血槽 +1）`, `Take ${nm(bleed[0])}'s Bleeding token (tank up)`)}</button>` : ''}</div></div>`;
    if (pendingChoice(g, op.side) && !isAI(op.side)) html += choiceView(op.side); // a firefight ploy or action's pick (Mutant Herd, Psychic Cabal, Sorcerous Scrolls, Lock It Down)
}

function modeView(op) {
  const m = ui.mode;
  const cancel = `<button class="ghost" data-act="cancel">${L('取消', 'Cancel')}</button>`;
  // Exodite riders: Sprint (straight forwards / backwards, pivot ≤45° first) and Turn (pivot ≤45°).
  if (m.kind === 'sprint') {
    const p = ui.path, fwdLeft = Math.min(9 - (op.acted.sprintFwd || 0), 12 - (op.movedTP || 0)), backLeft = Math.min(3 - (op.acted.sprintBack || 0), 12 - (op.movedTP || 0));
    const info = op.acted.leap ? L('躍起：點 1" 內的位置直接放過去。', 'Leap: tap a spot within 1" to set it up there.')
      : L(`點黃色扇形內的位置：向前最多 ${fwdLeft}"、向後最多 ${backLeft}"（以整吋計）。前進 4" 以上速度 4+，7" 以上 7+。`, `Tap inside a yellow wedge: up to ${fwdLeft}" forwards or ${backLeft}" backwards (whole inches). 4"+ forwards = SPEED 4+, 7"+ = 7+.`);
    const status = p ? (p.ok ? `<p class="ok">✔ ${p.len}"</p>` : `<p class="bad">✘ ${esc(p.why || '')}</p>`) : '';
    return `<div class="mode"><h3>${esc(tx(ACTIONS.edSprint.name))}</h3><p class="hint">${info}</p>${status}<div class="row">${cancel}<button class="primary" data-act="confirmsprint" ${p?.ok ? '' : 'disabled'}>${L('確認疾馳', 'Sprint')}</button></div></div>`;
  }
  if (m.kind === 'wsStorm') return `<div class="mode"><h3>${esc(tx(ACTIONS.wsCallMove.name))}</h3><p class="hint">${L('點棋盤任何位置放風暴標記。', 'Tap anywhere on the board for the Storm marker.')}</p><div class="row">${cancel}</div></div>`;
  if (m.kind === 'turn') {
    return `<div class="mode"><h3>${esc(tx(ACTIONS.edTurn.name))}</h3><p class="hint">${L('點棋盤指定要面向的方向（最多轉 45°）。', 'Tap the board towards where it should face (45° at most).')}</p><div class="row">${cancel}<button class="primary" data-act="confirmturn" ${m.dest ? '' : 'disabled'}>${L('確認轉向（1AP）', 'Turn (1AP)')}</button></div></div>`;
  }
  if (m.kind === 'move') {
    const max = m.action === 'mdPass' ? 40 : m.action === 'rtSlingshot' ? 12 : m.action === 'kmGrapple' || m.action === 'rvBurrow' || m.action === 'aqLand' ? 40 : m.action === 'vsSkytorch' ? moveStat(g, op) + 2 : moveAllowance(g, op, m.action);
    let info = L(`點擊棋盤選擇目的地（最多 ${max}"），落點可自由選擇，總移動距離無條件進位計算。要轉彎：先點轉彎處，按「設為折點」，再點下一段。`, `Tap the board to choose a destination (max ${max}"); choose any legal endpoint; total movement cost rounds up. To turn: tap the corner, press "Set waypoint", then tap the next leg.`);
    if (m.action === 'charge') info += L('必須結束於敵人交戰範圍 1" 內。', ' Must end within 1" of an enemy.');
    if (m.action === 'fallBack') info += L('必須離開所有敵人的交戰範圍。', ' Must end outside all enemy engagement ranges.');
    if (m.action !== 'charge' && m.action !== 'fallBack' && m.action !== 'rtSlingshot' && m.action !== 'kmGrapple' && m.action !== 'rvBurrow' && m.action !== 'aqLand' && m.action !== 'vsSkytorch') info += L('結束時不能在敵人 1" 交戰範圍內。', ' Cannot end within 1" of an enemy.');
    if (m.action === 'mdPass') info = L('點擊暗影落點：不限距離，不能成為敵人的有效目標。本回合不能射擊／近戰。', 'Tap a shadow destination at any distance, outside valid enemy targeting. No Shoot/Fight this TP.');
    if (m.action === 'rtSlingshot') info = L('點擊彈弓落點：看得到、6" 內的地形點，且落點完全在其 6" 內並看得到它。', 'Tap a slingshot destination: a terrain point visible within 6", the destination wholly within 6" of it and seeing it.');
    if (m.action === 'vsSkytorch') info = L('點擊落點（飛行，最多 Move +2"）：火焰會掃過出發點和落點之間的所有特工（敵我皆然，無掩護）。', 'Tap the landing spot (flying, up to Move +2"): the flames sweep over every operative between the start and the landing spot (friend or foe, no cover).');
    if (m.action === 'aqLand') info = L('點擊降落位置：空降標記 3"（士兵 4"）內，或完全在己方降落區內；不能在敵人控制範圍內（先驅除外）。花 1AP（視為重新定位）。', 'Tap where to land: within 3" (Troopers 4") of a Drop marker or wholly in your drop zone; not in enemy control range (Precursors can). Costs 1AP (a Reposition).');
    if (m.action === 'rvBurrow') info = L('點擊你的隧道上的位置：從地下鑽出，可以在敵人控制範圍內；本次啟動 Move -2"。', 'Tap a spot on your TUNNEL: it emerges there, even within enemy control range; Move -2" for this activation.');
    if (m.action === 'kmGrapple') info = L('點擊鉤爪落點：落點要在一個看得到的地形點 1" 內，並看得到那一點；落點可以離得很遠。', 'Tap the grappling destination: within 1" of a terrain point visible to the Grot, and seeing that point; any distance.');
    const p = ui.path;
    const status = p ? (p.ok ? `<p class="ok">✔ ${L('消耗', 'Cost')} ${p.len}" / ${max}"</p>` : p.placement ? `<div class="placement-warning" role="status"><strong>${L('底盤放不下', 'Base does not fit')}</strong><p>${esc(p.why)}</p><p class="hint">${L('紅色輪廓標出底盤與阻擋物，請將落點移開。', 'Red outlines show the base and its blockers. Choose a clear landing point.')}</p></div>` : `<p class="bad" role="status">✘ ${esc(p.why)}</p>`) : '';
    // Waypoints: the current destination can be pinned as a corner, and the route goes on from there.
    const wps = m.wps || [];
    const canPin = !!(p && m.dest && !p.unreachable && !p.breach && (p.exactLen ?? p.len) < max - 0.05);
    const wpRow = ['mdPass', 'rtSlingshot', 'kmGrapple', 'rvBurrow', 'aqLand', 'vsSkytorch'].includes(m.action) ? '' : `<div class="row"><button data-act="addwp" ${canPin ? '' : 'disabled'}>📍 ${L('設為折點', 'Set waypoint')}</button>${wps.length ? `<button data-act="popwp">↶ ${L(`移除折點（${wps.length}）`, `Remove waypoint (${wps.length})`)}</button>` : ''}</div>`;
    return `<div class="mode"><h3>${esc(tx(ACTIONS[m.action].name))}</h3><p class="hint">${info}</p>${status}${wpRow}
      <div class="row">${cancel}<button class="primary" data-act="confirmmove" ${p?.ok ? '' : 'disabled'}>${L('確認移動', 'Confirm')}</button></div></div>`;
  }
  if ((m.kind === 'shoot' || m.kind === 'fight') && !m.weapon) {
    op = shooter(op);
    const type = m.kind === 'shoot' ? 'ranged' : 'melee';
    const btn = (w, i) => {
      if (w.type !== type) return '';
      const s = type === 'ranged' ? shootWeapon(g, op, w) : { ok: true, ap: 1 };
      const note = !s.ok ? `<span class="wrules bad">${esc(tx(s.why))}</span>` : s.ap > 1 ? `<span class="wrules">${L(`第二次射擊同一把武器：${s.ap}AP`, `Second Shoot with the same weapon: ${s.ap}AP`)}</span>` : '';
      return `<button class="weapon" data-act="weapon" data-i="${i}" ${s.ok ? '' : 'disabled'}>${weaponLine(w)}${note}</button>`;
    };
    return `<div class="mode"><h3>${m.by ? L(`間隙指令：${nm(op)} 免費射擊`, `Interstitial Command: ${nm(op)} shoots for free`) : L('選擇武器', 'Choose weapon')}</h3>
      ${weaponsFor(g, op).map(btn).join('')}
      <div class="row">${cancel}</div></div>`;
  }
  if (m.kind === 'shoot') {
    const aim = ffToggles(shooter(op), 'shoot', m.weapon, null, true);
    const area = m.weapon.rules.torrent ? L(`洪流：也會射擊主要目標 ${m.weapon.rules.torrent}" 內其他有效目標。`, ` Torrent: also shoots other valid targets within ${m.weapon.rules.torrent}" of the first.`)
      : m.weapon.rules.blast ? L(`爆炸：也會射擊主要目標 ${m.weapon.rules.blast}" 內所有可見的特工（包括己方）。`, ` Blast: also shoots every operative visible within ${m.weapon.rules.blast}" of the first — friends included.`) : '';
    return `<div class="mode"><h3>${esc(bi(m.weapon.name))}</h3><p class="hint">${L('點擊紅圈標示的敵人射擊。🛡 = 目標在掩護中（保留 1 顆豁免）。', 'Tap a highlighted enemy. 🛡 = target in cover (retains a save).')}${area}</p>${aim}<div class="row">${cancel}</div></div>`;
  }
  if (m.kind === 'fight') return `<div class="mode"><h3>${esc(bi(m.weapon.name))}</h3><p class="hint">${L('點擊交戰中的敵人，或門另一側的合法門間近戰目標（底座接觸門口，目標距門口 2 吋內）。', 'Tap an engaged enemy, or a legal Hatchway Fight target across an access point you touch, within 2 inches of it.')}</p><div class="row">${cancel}</div></div>`;
  if (m.kind === 'target') {
    const hint = {
      markerlight: L('點擊一個可見的敵人，讓它獲得標記光標記。', 'Tap a visible enemy to give it Markerlight tokens.'),
      signal: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      systemJam: L('點擊一個可見的敵人，它下次啟動 APL -1。', 'Tap a visible enemy: -1 APL for its next activation.'),
      medikit: L('點擊控制範圍內受傷的友方（無人機除外），回復 2D3 生命。', 'Tap a wounded friendly (not a drone) in control range to regain 2D3 wounds.'),
      inciteSlaughter: L('點擊 9" 內看得到、正在交戰的友方：它立刻免費近戰一次。', 'Tap an engaged friendly visible within 9": it fights for free right away.'),
      inciteUrgency: L('點擊 9" 內看得到的友方：它立刻免費衝鋒（最多 3"）或衝刺一次。', 'Tap a friendly visible within 9": it Charges (up to 3") or Dashes for free right away.'),
      heinousDeluge: L('點擊一名可當目標的敵人：下次啟動 APL -1。', 'Tap an enemy that\'s a valid target: -1 APL next activation.'),
      maleficVortex: L('點擊一名看得到的敵人：漩渦標記放在那裡，2" 內的敵人各受 1 傷害。', 'Tap a visible enemy: the vortex marker goes there; enemies within 2" take 1 damage each.'),
      spiritualMentor: L('點擊 6" 內看得到的友方：它變為激勵。', 'Tap a friendly visible within 6": it becomes inspiring.'),
      speakDeeds: L('點擊要獲得祝福的友方（6" 內一名激勵中的友方會不再激勵）。', 'Tap the friendly to gain a Benediction (an inspiring friendly within 6" stops being inspiring).'),
      geomantic: L('點擊一名靠近地形（2" 內）、離你 8" 內的敵人：在離它最近的地形點引爆，2" 內每名特工擲 2D6。', 'Tap an enemy within 2" of terrain and within 8": the terrain point nearest it erupts — every operative within 2" rolls 2D6.'),
      canoptekControl: L('點擊一名冥工機械：它立刻免費做一個 1AP 動作。', 'Tap a Canoptek: it performs a free 1AP action now.'),
      remotePilot: L('點擊一架友方無人機：它立刻免費做一個動作（移動不超過 2"，可以做無人機原本不能做的動作）。', 'Tap a friendly drone: it performs a free action now (moving no more than 2", even one its Drone rule restricts).'),
      kmSmoke: L('點擊 6" 內可見的一名特工（敵我皆可）：在那裡放出煙霧。', 'Tap an operative visible within 6" (friend or foe): smoke is placed there.'),
      molecularBreach: L('點擊一名友方：它下次移動改為直接傳送。', 'Tap a friendly: its next move is a teleport.'),
      overcharge: L('點擊一名冥工機械：下次啟動 APL +1。', 'Tap a Canoptek: +1 APL next activation.'),
      cranialOverload: L('點擊一名敵人：下次啟動 APL -1。', 'Tap an enemy: -1 APL next activation.'),
      nanoscarab: L('點擊一名受傷的友方：回復 3D3 生命。', 'Tap a wounded friendly: regains 3D3 wounds.'),
      bbJam: L('點擊一名準備中、可以當目標的敵人：擲 D6，它要等對手再啟動那麼多名特工（或只剩它）才能行動。', 'Tap a ready enemy that\'s a valid target: roll a D6 — it can\'t act until the opponent has activated that many more operatives (or it\'s the last).'),
      telepathicOverload: L('點擊一名可以當目標的敵人：APL -1，直到它的啟動結束。', 'Tap an enemy that\'s a valid target: -1 APL until the end of its activation.'),
      mentalOnslaught: L('點擊一名可以當目標的敵人：2 傷害（6" 內 4），再擲 D6 大於它的 APL 就繼續，最多 8。', 'Tap an enemy that\'s a valid target: 2 damage (4 within 6"), then keep rolling a D6 above its APL for more, up to 8.'),
      omniscanner: L('點擊一個可見或 8" 內的敵人，讓它獲得掃描標記（戰鬥支隊對它攻擊時「無休」）。', 'Tap an enemy visible or within 8" to give it an Omniscanner token (Battleclade weapons have Ceaseless against it).'),
      networkOverride: L('點擊它或自動代理僕從 6" 內的一名僕從，讓它立刻網路反擊。', 'Tap a servitor within 6" of it or the Auto-proxy to network counteract right away.'),
      overrideDash: L('點擊它或自動代理僕從 6" 內的一名僕從，讓它立刻免費衝刺一次。', 'Tap a servitor within 6" of it or the Auto-proxy to make a free Dash right away.'),
      miasma: L('點擊 7" 內可見（或可射擊）的敵人：未中毒則中毒，已中毒則受到 3 傷害。', 'Tap an enemy visible within 7" (or a valid target): it is poisoned, or takes 3 damage if it already was.'),
      getItDun: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      listenIn: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      eyeAbove: L('點擊 6" 內可見的另一名友方，它下次啟動 APL +1。', 'Tap another visible friendly within 6": +1 APL for its next activation.'),
      pechra: L('點擊一個可見的敵人，把鳥標放在它旁邊：友方射擊鳥標 1" 內的敵人時獲得「搜尋（輕型）」。', 'Tap a visible enemy to place the Pech\'ra marker by it: friendly shooting at enemies within 1" of it has Seek Light.'),
      stunGrenade: L('點擊 6" 內可見的敵人：它與 1" 內的每個特工擲 D6，3+ 下次啟動 APL -1。', 'Tap an enemy visible within 6": it and every operative within 1" roll a D6 — on a 3+, -1 APL next activation.'),
      vitality: L('點擊 3" 內可見、受傷的友方：擲 2D6，總和 7 回復 7 生命，否則回復較高的那顆骰。', 'Tap a wounded friendly visible within 3": roll 2D6 — a 7 regains 7 wounds, otherwise the highest die.'),
      battleComms: L('點擊另一名友方：下次啟動 APL +1（最多 3）。', 'Tap another friendly: +1 APL next activation (max 3).'),
      tacticalCommand: L('點擊一名友方：它直到下回合多一種最適合它的戰技。', 'Tap a friendly: it gains one more Skill at Arms (the one that suits it) until next TP.'),
      eqStun: L('點擊 6" 內看得到的敵人：它與 1" 內的每名特工擲 D6，3+ 下次啟動 APL -1。', 'Tap an enemy visible within 6": it and each operative within 1" roll a D6 — 3+ = -1 APL next activation.'),
      eqSmoke: L('點擊 6" 內看得到的特工（敵我皆可）：在它的位置放出 1" 煙霧，煙霧內的特工對 2" 外互相視為被遮擋。', 'Tap an operative visible within 6" (friend or foe): 1" of smoke there; operatives wholly inside are obscured to and from those more than 2" away.'),
      interstitial: L('點擊一名高亮的友方：它立刻免費射擊一次（接著選武器與目標；取消就放棄這次射擊）。', 'Tap a highlighted friendly: it shoots for free right away (then pick its weapon and target; cancelling forfeits the shot).'),
      canoptekRepair: L('點擊 6" 內受傷的友方：回復 2D3 生命。', 'Tap a wounded friendly within 6": it regains 2D3 wounds.'),
      augment: L('點擊 6" 內的友方：它最強的武器獲得兩條規則，直到這名技師下次啟動。', 'Tap a friendly within 6": its best weapon gains two rules until this operative\'s next activation.'),
      reinforce: L('點擊 6" 內的友方：受到 3 以上的傷害時 -1，直到這名技師下次啟動。', 'Tap a friendly within 6": 3+ damage from an attack die is reduced by 1 until this operative\'s next activation.'),
      accelerate: L('點擊 6" 內的死亡標記或不朽者：下次啟動 APL +1。', 'Tap a Deathmark or Immortal within 6": +1 APL next activation.'),
      veriscant: L('點擊一個可見的敵人：直到鑑識官下次啟動，友方攻擊它時「致命 5+」＋「重創」。', 'Tap a visible enemy: until the Malocator\'s next activation, friendlies attacking it have Lethal 5+ and Severe.'),
      apprehend: L('點擊控制範圍內的敵人：它留在獒犬控制範圍內時命中變差 1、不能撤退。', 'Tap an enemy in control range: while it stays in the mastiff\'s control range, -1 to hit and no Fall Back.'),
    }[m.action] || L('點擊一個高亮的目標。', 'Tap a highlighted target.');
    return `<div class="mode"><h3>${esc(tx(ACTIONS[m.action].name))}</h3><p class="hint">${hint}</p><div class="row">${cancel}</div></div>`;
  }
  return '';
}

function ruleText(rules) {
  return Object.entries(rules).filter(([k]) => RULE_LABELS[k]).map(([k, v]) => {
    const lab = bi(RULE_LABELS[k]);
    if (v === true) return lab;
    if (k === 'heavy' && v === 'dash') return `${lab}${L('（僅限衝刺）', ' (Dash only)')}`;
    if (k === 'range' || k === 'torrent' || k === 'blast' || k === 'devSplash') return `${lab} ${v}"`;
    if (k === 'lethal') return `${lab} ${v}+`;
    return `${lab} ${v}`;
  }).join(', ');
}

function weaponLine(w) {
  return `<span class="wname">${w.type === 'ranged' ? '⌖' : '⚔'} ${esc(bi(w.name))}</span>
    <span class="wstats">A${w.atk} · ${w.hit}+ · ${dmgText(w)}</span>
    ${ruleText(w.rules) ? `<span class="wrules">${esc(ruleText(w.rules))}</span>` : ''}`;
}

/** Floating card on the board for an inspected (clicked) operative that isn't the active one. */
function inspectView() {
  // ui.peek: picked from the operative lists beside the board (the active one and fallen ones too).
  const op = (ui.peek && getOp(g, ui.peek)) || (ui.sel && getOp(g, ui.sel));
  if (!op || (!ui.peek && (op.dead || op.uid === g.active))) return '';
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
  if (op.terrorchem?.some(Boolean)) flags.push(`<span class="flag inj">☣ ${L('恐懼毒標記（每次啟動受 D3 傷害）', 'Terrorchem token (D3 damage each activation)')}</span>`);
  if (op.ncTrophy) flags.push(`<span class="flag">${L('血腥戰利品標記', 'Grisly Trophy token')}</span>`);
  if (op.ncFlayTP === g.tp) flags.push(`<span class="flag inj">${L('被活剝：本回合不能控制標記或做任務動作', 'Flayed: cannot control markers or perform mission actions this TP')}</span>`);
  if (op.scTracked?.tp === g.tp) flags.push(`<span class="flag inj">🎯 ${L('被追蹤：被友方射擊時搜尋（輕型）', 'Tracked: shot with Seek Light')}</span>`);
  if (op.scTarget?.some(Boolean)) flags.push(`<span class="flag inj">⊕ ${L('目標標記：被偵察小隊攻擊時可重擲一顆攻擊骰', 'Target token: Scout Squad can re-roll one attack die against it')}</span>`);
  if (op.scRaw) flags.push(`<span class="flag">${L('原生體魄：Move +1"、不受重傷影響', 'Raw Physiology: +1" Move, ignores injury')}</span>`);
  if (sfSermon(g, op)) flags.push(`<span class="flag">✝ ${L('佈道加成：普通／暴擊傷害 4 以上少 1', 'Sermon: Normal and Critical Dmg of 4+ deals 1 less')}</span>`);
  if (sfOrator(g, op.side) === op) flags.push(`<span class="flag">📣 ${L('佈道者', 'Orator')}</span>`);
  if (op.sfBlaze?.some(Boolean)) flags.push(`<span class="flag inj">🔥 ${L('烈焰標記（每次啟動受 D3 傷害）', 'Blaze token (D3 damage each activation)')}</span>`);
  if (op.sfDoused?.some(Boolean)) flags.push(`<span class="flag inj">💧 ${L('濕透標記：被烈焰武器射擊時「搜尋」', 'Doused: Blaze weapons shooting it have Seek')}</span>`);
  if (op.scCovert) flags.push(`<span class="flag">${L('隱蔽陣地', 'Covert Position')}</span>`);
  if (t.ncVisionary) flags.push(`<span class="flag mk">${L(`預知點數 ${prescienceOf(g, op.side)}`, `Prescience ${prescienceOf(g, op.side)}`)}</span>`);
  if (t.mwLord) flags.push(`<span class="flag mk">${L(`詛咒點數 ${op.damnation || 1}/6`, `Damnation ${op.damnation || 1}/6`)}</span>`);
  if (op.mwBoostTP === g.tp) flags.push(`<span class="flag">${L('本回合已噴射', 'Boosted this TP')}</span>`);
  if (op.mwAttackLockTP === g.tp) flags.push(`<span class="flag inj">${L('黑暗之翼：本回合不能攻擊', 'Wings of Darkness: attacks locked this TP')}</span>`);
  if (g.mwChallenge?.includes(op.uid)) flags.push(`<span class="flag inj">${L('挑戰標記', 'Challenge token')}</span>`);
  if (injuredPenalty(g, op)) flags.push(`<span class="flag inj">${L('重傷：Move -2"、命中 -1', 'Injured: -2" Move, -1 to hit')}</span>`);
  else if (isInjured(op)) flags.push(`<span class="flag inj">${L('重傷（無視減益）', 'Injured (penalties ignored)')}</span>`);
  if (!injuredPenalty(g, op) && statPenalty(g, op)) flags.push(`<span class="flag inj">${L('傳染：Move -2"、命中 -1', 'Contagion: -2" Move, -1 to hit')}</span>`);
  if (op.poison) flags.push(`<span class="flag poison">${L('中毒', 'Poisoned')}</span>`);
  // Chaos Cult: Accursed Gifts.
  for (const k of giftsOf(g, op)) flags.push(`<span class="flag mk">${L('受詛恩賜：', 'Gift: ')}${esc(tx(CULT_GIFTS[k]))}</span>`);
  // Celestian Insidiants: inspiring, Benedictions, null range, Suspicion.
  if (op.inspiring) flags.push(`<span class="flag mk">${L('激勵：武器「嚴厲」', 'Inspiring: Severe')}</span>`);
  if (op.ardour) flags.push(`<span class="flag">${L('熱忱：APL +1', 'Ardour: +1 APL')}</span>`);
  if (op.wrath) flags.push(`<span class="flag">${L('憤怒：武器「無休」', 'Wrath: Ceaseless')}</span>`);
  if (tpl(op).nullField) flags.push(`<span class="flag">${L(`虛無範圍 ${op.nullRange || 1}"`, `Null range ${op.nullRange || 1}"`)}</span>`);
  if ([0, 1].some((s) => op.suspect?.[s] === g.tp)) flags.push(`<span class="flag inj">${L('懷疑標記', 'Suspicion')}</span>`);
  if (op.counteracted && g.phase === 'firefight') flags.push(`<span class="flag">↺ ${L('本回合已反應', 'Counteracted this TP')}</span>`); // (the board shows the Counteracted token too)
  if (g.mark?.[1 - op.side] === op.uid) flags.push(`<span class="flag mk">${L('被標記', 'Marked')}</span>`);
  if (engagedEnemies(g, op).some((m) => m.apprehend === op.uid)) flags.push(`<span class="flag inj">${L('被扣押：命中 -1、不能撤退', 'Apprehended: -1 to hit, no Fall Back')}</span>`);
  const doc = TEAM_MAP[op.team].doctrina && g.doctrina?.[op.side]?.tp === g.tp ? g.doctrina[op.side] : null;
  if (doc) flags.push(`<span class="flag mk">${esc(tx(TEAM_MAP[op.team].tactics.find((x) => x.id === doc.mode).name))}${doc.noDep ? L('（無劣化）', ' (no Deprecation)') : ''}</span>`);
  if (op.unleashed) flags.push(`<span class="flag mk">${L('惡魔已釋放', 'Daemon unleashed')}</span>`);
  if (op.skillExtra?.tp === g.tp) flags.push(`<span class="flag">${esc(tx(SKILLS[op.skillExtra.id].name))}</span>`);
  if (op.dmk?.[1 - op.side]) flags.push(`<span class="flag mk">${L('死亡標記', 'Deathmarked')}</span>`);
  if (g.reinforce?.[op.side]?.t === op.uid) flags.push(`<span class="flag">${L('強化金屬', 'Reinforce Metal')}</span>`);
  if (g.augment?.[op.side]?.t === op.uid) flags.push(`<span class="flag">${L('強化武器', 'Augment Weapon')}</span>`);
  if (op.reanimUsed && TEAM_MAP[op.team].reanimation) flags.push(`<span class="flag">${L('已用過復甦', 'Reanimation used')}</span>`);
  if (g.veriscant?.[1 - op.side]?.t === op.uid) flags.push(`<span class="flag mk">${L('真相鑑定', 'Veriscant')}</span>`);
  if (isArchon(op)) flags.push(`<span class="flag">${L('痛苦', 'Pain')} ${op.pain || 0} · ${op.drug}</span>`);
  if (op.archonPoison) flags.push(`<span class="flag inj">${L('折磨毒素 D3', 'Torment poison D3')}</span>`);
  if (op.wardShield) flags.push(`<span class="flag">${L('守護護盾', 'Warding Shield')}</span>`);
  if (op.blinkOn) flags.push(`<span class="flag">${L('瞬移背包啟用', 'Blink Pack enabled')}</span>`);
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
  if (go) flags.push(`<span class="flag">${op.gOrder?.all ? L('命令：全部', 'Orders: all') : L(`命令：${GUARD_ORDERS[go].zh}`, `Order: ${GUARD_ORDERS[go].en}`)}</span>`);
  if (op.energised === g.tp) flags.push(`<span class="flag">${L('充能', 'Energised')}</span>`);
  if (op.longSightOn) flags.push(`<span class="flag">${L('遠視', 'Long-sight')}</span>`);
  if (op.optics) flags.push(`<span class="flag mk">${L('光學瞄準', 'Optics')}</span>`);
  if (op.dwGuard) flags.push(`<span class="flag mk">${L('警戒：自動攔截', 'On guard: automatic interruption')}</span>`);
  if (op.acted?.dwAmmoPick) flags.push(`<span class="flag mk">${L('已選特殊彈藥', 'Special ammo selected')}：${esc(tx(ACTIONS[`dwAmmo_${op.acted.dwAmmoPick}`].name))}</span>`);
  if (op.acted?.dwAuspex) flags.push(`<span class="flag mk">${L('進階鳥卜儀掃描', 'Advanced Auspex Scan')}</span>`);
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
    ${weaponsFor(g, op).map((w) => `<tr><td>${w.type === 'ranged' ? '⌖' : '⚔'} ${esc(bi(w.name))}${ruleText(w.rules) ? `<div class="wrules">${esc(ruleText(w.rules))}</div>` : ''}</td>
      <td>${w.atk}</td><td>${w.hit}+</td><td>${dmgText(w)}</td></tr>`).join('')}</table>
    ${abilityList(t)}
  </section>`;
}

// Short descriptions of operative abilities, keyed by the operative flag in teams.js.
const ABILITIES = {
  markerlight: (v) => [`標記光${v > 1 ? '（高強度）' : ''}`, `Markerlight${v > 1 ? ' (high-intensity)' : ''}`, `1AP：可見敵人獲得 ${v} 個標記光標記。`, `1AP: a visible enemy gains ${v} Markerlight token(s).`],
  signal: () => ['信號', 'Signal', '1AP：6" 內可見的另一名友方下次啟動 APL +1。', '1AP: another visible friendly within 6" gets +1 APL next activation.'],
  systemJam: () => ['系統干擾', 'System Jam', '1AP（非隱蔽）：可見敵人下次啟動 APL -1。', '1AP (not Concealed): a visible enemy gets -1 APL next activation.'],
  medikit: () => ['醫療包', 'Medikit', '1AP：控制範圍內受傷的友方（無人機除外）回復 2D3 生命。', '1AP: a wounded friendly (not a drone) in control range regains 2D3 wounds.'],
  medic: () => ['醫療兵！', 'Medic!', '每回合一次：3" 內可見的友方（無人機除外）將殘廢時改為剩 1 生命，雙方下次啟動 APL -1。', 'Once per TP: a visible friendly (not a drone) within 3" that would be incapacitated stays on 1 wound; both get -1 APL next activation.'],
  multiVision: () => ['多維視覺', 'Multi-dimensional Vision', '射擊時敵人不能被遮蔽。', 'Enemies cannot be obscured when it shoots.'],
  droneController: () => ['無人機操控員・遙控操作', 'Drone Controller · Remote Pilot', '在場時友方無人機 Move +2"。遙控操作 1AP（不在交戰中）：一架友方無人機立刻免費做一個動作（移動不超過 2"，可做無人機規則限制的動作）；可重複使用，但同一架無人機每次啟動不能做兩次相同的動作。', 'While it is in the killzone, friendly drones get +2" Move. Remote Pilot 1AP (not engaged): a friendly drone performs one free action (moving no more than 2", even one its Drone rule restricts); repeatable, but the same drone can\'t take the same free action twice in an activation.'],
  adaptiveOrders: () => ['適應性命令', 'Adaptive Orders', '看守長這回合沒有以策略謀略下達命令時，「鼓舞領導」在他啟動中 0CP。', 'If the Watchmaster doesn\'t issue an order as a strategic gambit, Inspirational Leadership costs 0CP during his activation.'],
  if (op.boon && WC_BOONS[op.boon]) flags.push(`<span class="flag" title="${esc(tx(WC_BOONS[op.boon].desc))}">${L('恩賜', 'Boon')}：${esc(tx(WC_BOONS[op.boon].name))}</span>`); // (Warpcoven)
  if (op.acted?.wcFly) flags.push(`<span class="flag">${L('非物質飛行', 'Immaterial Flight')}</span>`);
  dkSapper: () => ['工兵・地雷手', 'Sapper · Mine Layer', '攜帶地雷標記：可撿起它；「放下地雷標記」（1AP）放下後免費衝刺。遙控引爆器（限用 1 次，只能衝刺後使用）：引爆行動，對地雷標記 2" 內每名特工各射擊一次（無掩護、不被遮蔽），然後移除標記。', 'Carries the Mine marker: it can pick it up; Place Marker (1AP) then a free Dash. Remote detonator (Limited 1, Dash only before it): the Detonate action shoots every operative within 2" of the Mine marker (no cover, not obscured), then removes it.'],
  dkVeteran: () => ['老兵衛兵・仿生', 'Veteran Guardsman · Bionics', '啟動時可收到一道衛兵命令（自動）。3 以上的普通傷害少 1。', 'Receives a Guardsman Order when activated (automatic). Normal Dmg of 3 or more inflicts 1 less.'],
  quickDraw: () => ['快拔', 'Quick Draw', '每回合一次：敵人射擊它（或是爆裂的次要目標）、且它準備中時，它可以搶先免費用雙持手槍（集中）射擊那名敵人（可改交戰指令）。自動使用。', 'Once per TP: when an enemy shoots it (or it is a Blast secondary target) and it is ready, it shoots that enemy first for free with its focused dual pistols (it can change to Engage). Automatic.'],
  kfHound: () => ['採集', 'Gather', '1AP：免費衝刺一次，途中可免費撿起或放置標記（只需爭奪標記）；剩下的距離可以之後再用。', '1AP: a free Dash during which it can Pick Up or Place a Marker for free (the marker only has to be contested); any remaining distance can be used afterwards.'],
  kfWarrior: () => ['準備好面對一切', 'Ready for Anything', '每回合一次，友方戰士啟動中可以額外使用生肉、穿甲彈或毒彈（不佔每回合一次的限制）。', 'Once per TP during a Warrior\'s activation, use Meat, Piercing Shot or Toxin Shot once more (it doesn\'t count towards their limit).'],
  kmGrapple: () => ['鉤爪', 'Grappling Hook', '1AP（視為重新定位，不在交戰中，不能和衝鋒或撤退同一次啟動）：選一個看得到的地形點，被移走後放回該點 1" 內、看得到該點的位置。', '1AP (a Reposition; not engaged; not with Charge or Fall Back): pick a visible point on terrain and be set up again within 1" of it, seeing it.'],
  sneaky: () => ['鬼祟搗蛋', 'Sneaky Zogger', '不能有交戰指令；在掩護中時，2" 外不能被選為有效目標（優先於其他規則）。', 'Can\'t have an Engage order; in cover it can\'t be selected as a valid target beyond 2" (taking precedence over other rules).'],
  wsScout: () => ['元素風暴・狩獵阿斯塔特', 'Elemental Storm · Hunting Astartes', '完全在己方風暴標記 6" 內就是「在風暴內」；在風暴內結束的衝鋒可以用隱蔽指令。可以兩次射擊或兩次近戰（兩次都用電漿第二次 +1AP，不能兩次靈能）；任何指令都能反應，在風暴內反應可以改指令。', 'Wholly within 6" of your Storm marker is within your storm; a Charge ending there can be made on Conceal. Two Shoots or two Fights (plasma twice: +1AP for the second; never two PSYCHIC); counteracts on any order, and in the storm can change order.'],
  wsLupine: () => ['狼之狡詐・老練老兵', 'Lupine Guile · Grizzled Veteran', '整場一次：擲先攻後，若它在場上可以重擲自己的骰子。第一次會殘廢時改為剩 1 生命，本次動作不會殘廢，剩下的攻擊骰全部作廢（之後不能觸發反擊與兇猛鬥士）。', 'Once per battle, after the initiative roll-off, while it\'s in the killzone: re-roll your die. The first time it would be incapacitated it stays on 1 wound for the rest of the action and the remaining attack dice are discarded (no Counterattack or Savage Fighters after it).'],
  wsFang: () => ['靈性外科・治療香膏', 'Spiritual Chirurgy · Healing Balms', '選了它，友方狼偵查兵（芬里斯狼除外）就不受重傷的屬性改變（它之後殘廢也一樣）。治療香膏（1AP，每回合一次，不能在交戰中）：控制範圍內一名友方回復 D3+3 生命。', 'With it in the kill team, friendly Wolf Scouts (not the Wolf) ignore stat changes from being injured (even if it\'s incapacitated later). Healing Balms (1AP, once per TP, not while engaged): a friendly in its control range regains D3+3 wounds.'],
  wsFrost: () => ['風暴處決・獵人感官', 'Storm-veiled Execution · Hunter\'s Senses', '完全在風暴內時，任何戰場、任何指令都能做警戒動作（敵人行動後自動攻擊）。獵人感官（1AP）：到下次啟動前卡賓槍「嚴重」，或「飽和」且敵人不能被遮蔽。', 'Wholly within the storm it can Guard in any killzone and with either order (an automatic attack after an enemy action). Hunter\'s Senses (1AP): until its next activation the carbine has Severe, or Saturate and enemies can\'t be obscured.'],
  wsGunner: () => ['暴風之怒', 'Tempest\'s Fury', '完全在風暴內時，電漿槍「懲罰」，超載模式沒有「過熱」。', 'Wholly within the storm its plasma gun has Punishing and the supercharge profile loses Hot.'],
  wsHunter: () => ['兇暴性情', 'Fierce Temperament', '完全在風暴內時，武器「嚴重」。', 'Wholly within the storm its weapons have Severe.'],
  wsTrap: () => ['干擾地雷', 'Haywire Mine', '攜帶干擾地雷標記（可放下、可撿回，不能放在其他特工控制範圍內）。第一次有其他特工進入地雷控制範圍時：移除標記，該特工下次啟動 APL -1，受 2D3+3 傷害（地雷在風暴標記 6" 內則 D3+6）。地雷兵自己不會觸發。', 'Carries the Haywire Mine marker (placed and picked up again; never within another operative\'s control range). The first time another operative has it within its control range: the marker goes, that operative gets -1 APL and takes 2D3+3 damage (D3+6 within 6" of the Storm marker). The Trapmaster never sets it off.'],
  wsSkjald: () => ['擲符文・召喚風暴', 'Cast the Runes · Call the Storm', '戰鬥前擲 3D6：每個 1-4 在對應回合可以免費指揮重擲一次；有 5-6 得 1CP。召喚風暴（1AP，不能在交戰中）：把風暴標記移到戰場任何位置（點棋盤），或讓一名友方在風暴內、離行動中的敵人 3" 外時被遮蔽（到它下次啟動）。', 'Before the battle roll 3D6: each 1-4 is a free Command Re-roll in that turning point; any 5-6 is 1CP. Call the Storm (1AP, not while engaged): move the Storm marker anywhere (tap the board), or make a friendly obscured while wholly within the storm and more than 3" from the active operative (until its next activation).'],
  wsWolf: () => ['本能掠食者・撲擊', 'Instinctive Predator · Pounce', '只能衝鋒、衝刺、撤退、近戰、警戒、移動；隱蔽指令也能衝鋒。撲擊（整場一次的策略謀略）：免費衝鋒、撤退或移動，之後到下次啟動結束 APL -1、不能再做這三種。', 'Only Charge, Dash, Fall Back, Fight, Guard and Reposition; it can Charge on Conceal. Pounce (once per battle, strategic gambit): a free Charge, Fall Back or Reposition, then -1 APL and none of those until the end of its next activation.'],
  xvSuit: () => ['隱形力場・耐心獵人', 'Stealth Fields · Kauyon', '隱蔽指令時，3" 外的敵人看不到它，撤退少 1AP。射擊敵人時依敵人位置得到「精準 X」：在你領地 3" 內 1、在你領地內 2、在你降落區 3" 內 3。', 'With a Conceal order enemies more than 3" away can\'t see it, and it Falls Back for 1 less AP. Shooting an enemy: Accurate 1 within 3" of your territory, 2 in your territory, 3 within 3" of your drop zone.'],
  xvShasvre: () => ['為了善善上道・無人機控制', 'For the Greater Good · Drone Controller', '它在場上時，若有 2 名以上友方戰鬥服（不含無人機）殘廢，耐心獵人的精準 +1（最多 3）。無人機控制（策略謀略）：一架友方無人機到下次啟動結束不受無人機的前兩條限制。', 'While it is in the killzone and two or more friendly suits (not drones) are incapacitated, Kauyon\'s Accurate is 1 higher (max 3). Drone Controller (strategic gambit): one friendly drone ignores the first two Drone restrictions until the end of its next activation.'],
  xvMarker: () => ['標記光', 'Markerlight', '它的有效目標（或它看得到、在伏擊標記 2" 內的敵人）被標記：友方射擊被標記的敵人時武器「嚴重」。', 'An enemy that is a valid target for it (or visible to it within 2" of the Ambush marker) is marked: friendlies shooting a marked enemy have Severe.'],
  xvDesignator: () => ['集中標記光', 'Focused Markerlight', '1AP：看得到的一名敵人，本回合一次，友方射擊它時遠程武器命中 +1。', '1AP: a visible enemy — once this TP, a friendly shooting it improves its ranged Hit by 1.'],
  xvLiberator: () => ['擲彈兵', 'Grenadier', '自己的破片、穿甲、煙霧、震撼手雷（不算進裝備次數），破片與穿甲命中 +1；還有 EMP 炸彈。', 'Its own frag, krak, smoke and stun grenades (not from the team\'s uses), frag and krak Hit +1; plus the EMP bomb.'],
  xvLodestar: () => ['電子箔片發射器・歸航信標', 'Electrochaff Launcher · Homing Beacon', '每回合一次（自動）：敵人射擊它 3" 內看得到的友方（距射手 2" 以上）時，無視穿甲且被遮蔽。攜帶歸航信標：放下後（1AP），準備步驟擲 D6 +信標 6" 內的目標點數，5+ 得 1CP；敵人撿起就移除。', 'Once per TP (automatic): an enemy shooting a friendly visible within 3" of it (more than 2" from the shooter) ignores Piercing and the friendly is obscured. Carries the Homing Beacon: once placed (1AP), in the Ready step roll a D6 + objectives within 6" of it, 5+ gives 1CP; an enemy picking it up discards it.'],
  xvInfiltrator: () => ['隱密協議', 'Covert Protocols', '任何指令都能反應；隱蔽指令反應時只能撿標記、放標記或任務行動。', 'It can counteract with any order; with a Conceal order it can then only Pick Up, Place a Marker or do mission actions.'],
  xvNeutraliser: () => ['多光譜感測組件・系統干擾', 'Multispectrum Sensor Package · System Jam', '每回合一次（自動）：敵人在它 8" 內啟動時，它 3" 內 Engage 指令的友方改為隱蔽。系統干擾（1AP，隱蔽時 2AP）：看得到的一名敵人下次啟動 APL -1。', 'Once per TP (automatic): when an enemy activates within 8" of it, friendlies within 3" of it with an Engage order switch to Conceal. System Jam (1AP, 2AP while Concealed): a visible enemy has -1 APL for its next activation.'],
  xvDrone: () => ['無人機', 'Drone', '只能衝鋒、衝刺、撤退、近戰、重新定位、射擊（砲無人機還有光子榴彈發射器）；爭奪標記 APL 視為少 1；不計入對手的擊殺任務。', 'Only Charge, Dash, Fall Back, Fight, Reposition and Shoot (the Gun Drone also Photon Grenade Launcher); counts 1 lower APL at markers; ignored for the opponent\'s kill op.'],
  vsVespid: () => ['飛行・中子充能', 'Fly · Neutron Charge', '移動時可以飛行：直接重新放在移動距離內（越過地形與特工）。移動或飛行後，本回合中子武器「穿甲 1」。受交融點數限制（見隊伍規則）。', 'It can FLY whenever it moves: set up again within its move (over terrain and operatives). After moving or flying, its neutron weapons have Piercing 1 for the TP. Bound by Communion (see the team rule).'],
  vsLeader: () => ['交融頭盔・交融', 'Communion Helm · Commune', '它每次啟動可以免費花 1 點交融點數。交融：組隊時選一個策略計謀，它在場上且沒交戰時那個計謀 0CP。（「讓友方免費做任務行動」的選項沒做）', 'Once per activation it can spend a Communion point for free. Commune: a strategy ploy chosen at set-up costs 0CP while it is in the killzone and not engaged. (The free mission action for a friendly isn\'t done.)'],
  vsDrone: () => ['迴避無人機・空中導引', 'Evasive Drone · Aerial Guidance', '只能空中導引、衝鋒、衝刺、撤退、近戰、重新定位；爭奪標記 APL 視為少 1；隱蔽且在掩護中時 2" 外不能被選為目標；射擊它時無視穿甲。空中導引（1AP，支援）：到它下次啟動前，它 6" 內看得到的友方胡蜂射擊它看得到的敵人時「致命 5+」與「飽和」。', 'Only Aerial Guidance, Charge, Dash, Fall Back, Fight and Reposition; counts 1 lower APL at markers; Concealed in cover it can\'t be targeted beyond 2"; Piercing is ignored when it\'s shot. Aerial Guidance (1AP, support): until its next activation, friendly Vespids visible within 6" of it shooting enemies it can see have Lethal 5+ and Saturate.'],
  vsShadestrain: () => ['幽靈裝置・迷彩', 'Ghost Rig · Camouflaged', '隱蔽指令時，敵人要在 6" 內才能選它為目標。被選為目標射擊時，無視穿甲，所有掩護豁免都當成暴擊保留。', 'With a Conceal order it can only be targeted from within 6". Shot as the valid target, Piercing is ignored and all its cover saves are retained as criticals.'],
  vsSwarmguard: () => ['天焰突擊', 'Skytorch Assault', '2AP（Engage 指令、沒交戰）：飛行重新定位最多 Move +2"，再用天焰噴火器射擊出發點與落點之間的每名特工（敵我皆然，無掩護、無遮蔽，從最遠的開始）。', '2AP (Engage order, not engaged): fly up to Move +2", then the skytorch flamer shoots every operative between the start and the landing spot (friend or foe, no cover or obscuring, furthest first).'],
  vsWarrior: () => ['戰士本能', 'Warrior Instincts', '射擊時若這次沒有花交融點數，中子爆能槍「精準 1」。', 'Shooting without spending a Communion point in that sequence, its neutron blaster has Accurate 1.'],
  vsLongsting: () => ['中子碎片', 'Neutron Fragment', '中子軌道步槍：目標沒殘廢但有攻擊骰結算時獲得中子碎片標記，每次啟動時每個標記受 D3 傷害（不能重擲）。', 'Neutron rail rifle: a target that survives with any attack dice resolved gains a Neutron Fragment token; on each activation it takes D3 per token (no re-rolls).'],
  vsSkyblast: () => ['中子轟炸', 'Neutron Bombardment', '中子榴彈發射器射擊後（不論有沒有命中），在主要目標控制範圍內放中子落塵標記。敵人每次啟動（反應不算）第一次進入落塵 2" 內時受 D3 傷害（多個標記不疊加）。標記會一直留在場上。', 'After shooting its neutron grenade launcher (hit or miss), a Neutron Fallout marker goes within the primary target\'s control range. An enemy takes D3 the first time in each of its activations (not counteractions) it is within 2" of one (markers aren\'t cumulative). The markers stay all battle.'],
  vdTroupe: () => ['丑角裝備', 'Harlequin\'s Panoply', '被射擊時若沒有攻擊骰保留為暴擊，穿甲 X 減 1（穿甲 1 無效）。可以穿過敵人的控制範圍移動。（攀爬一律算 2" 在 2D 版本沒有效果）', 'When shot with no critical attack dice retained, Piercing is worsened by 1 (Piercing 1 is ignored). It can move through enemy control range. (Climbing as 2" has no effect in 2D.)'],
  vdLead: () => ['領銜演出', 'Lead the Performance', '整場一次策略謀略：它在場上時，更換你選的寓言（讚譽跟著改變）。', 'Once per battle strategic gambit, while it is in the killzone: change your allegory (the Accolades change with it).'],
  vdPlayer: () => ['笑神的好運', 'Luck of the Laughing God', '每回合一次（全隊共用）：它是指定特工時，一個交戰計謀 0CP（含為它擲的骰子的指揮重擲）；同一個計謀整場只能這樣用一次。', 'Once per TP (team-wide): a firefight ploy costs 0CP when it is the specified operative (including the Command Re-roll for its dice); each ploy only once per battle this way.'],
  vdJester: () => ['殘酷羞辱', 'Humbling Cruelty', '尖嘯炮命中但沒殺死目標時，目標獲得羞辱標記：Move -2"、武器命中變差 1（不與重傷疊加），它下次啟動結束時移除。', 'When its shrieker cannon damages but doesn\'t incapacitate the target, the target gains a Humbling Cruelty token: -2" Move and its weapons\' Hit worsened by 1 (not cumulative with being injured), removed at the end of its next activation.'],
  vdSeer: () => ['心靈之鏡・夢境迷霧', 'Mirror of Minds · Fog of Dreams', '靈能，1AP，不在敵人控制範圍內。心靈之鏡：8" 內的有效目標，雙方各擲 5D6，每一對相同點數造成 D3 傷害（最多 8）。夢境迷霧：看得到的一名準備中敵人，擲 D6；本回合它要等對手再啟動那麼多名特工（或它是最後一名）才能啟動。', 'Psychic, 1AP, not in enemy control range. Mirror of Minds: a valid target within 8"; both roll 5D6, each matching pair deals D3 (max 8). Fog of Dreams: a visible ready enemy, roll a D6; this TP it can\'t activate until that many more enemies have activated (or it is the last).'],
  aqAquilon: () => ['空降部署', 'Drop Insertion', '被放在天上時，啟動時可以「降落」（1AP，視為重新定位：空降標記 3" 內或己方降落區內）或「消耗」留在天上。第 2 回合結束時還在天上就殘廢。降落後到下一次啟動結束前處於遮蔽狀態。', 'When set up above it can Land on activation (1AP, a Reposition: within 3" of a Drop marker or in your drop zone) or Expend and stay above. Still above at the end of TP2 it is incapacitated. A landed operative is obscured until the end of the next activation.'],
  aqTempestor: () => ['風暴老兵・指揮', 'Tempestus Veteran · Command', '整場一次：指揮官啟動中使用一個交戰計謀 0CP；整場一次：指揮官的指揮重擲 0CP。指揮（1AP，沒被交戰）：6" 內看得到的另一名友方風暴天鷹（伺服哨兵除外）下次啟動 APL +1。', 'Once per battle a firefight ploy during its activation costs 0CP, and once per battle its Command Re-roll is free. Command (1AP, not engaged): another friendly TEMPESTUS AQUILON (not the Servo-sentry) visible within 6" gets +1 APL.'],
  aqSentry: () => ['機械・砲塔', 'Machine · Turret', '只能衝刺、撤退、重新定位和射擊；不能反擊或協助近戰。每次啟動可以射擊兩次。', 'Only Dash, Fall Back, Reposition and Shoot; it can\'t retaliate or assist in a fight. It can Shoot twice per activation.'],
  aqGrenadier: () => ['擲彈兵', 'Grenadier', '自己的破片、穿甲、煙霧、震撼手雷（不算進裝備次數），破片與穿甲命中 +1。', 'Its own frag, krak, smoke and stun grenades (not from the team\'s uses); frag and krak Hit +1.'],
  aqGunfighter: () => ['槍戰', 'Gunfight', '8" 內的敵人射擊它時記下被捨棄的失敗攻擊骰；行動結束、殘廢者被移除前，它可以免費射擊那名敵人（集中雙槍），攻擊骰為記下的數量 +1（最多 4）。', 'When an enemy within 8" shoots it, note the attack dice discarded as fails; after the action, before incapacitated operatives are removed, it makes a free Shoot at that enemy (focused laspistols) with that many dice +1 (max 4).'],
  aqMarksman: () => ['狙擊視野', 'Sniper\'s Vantage', '站在高處地形上射擊低 2" 以上、Engage 指令的敵人時，長程雷射槍「嚴重」。（2D 版本沒有高度，因此沒有效果）', 'On Vantage terrain shooting an Engage-order enemy at least 2" lower: Severe. (No effect in 2D: there are no heights.)'],
  aqPrecursor: () => ['動態・兇狠刀手', 'Dynamic · Vicious Knife Fighter', '射擊或近戰後可以免費衝刺（即使這次啟動衝鋒過）。近戰時，結算第一顆攻擊骰後可以立刻再結算一顆（先於對手）。降落時可以落在敵人控制範圍內。', 'After a Shoot or Fight it can make a free Dash (even after a Charge). Fighting, after resolving your first attack die you can resolve another before your opponent. It can land within enemy control range.'],
  aqTrooper: () => ['快速空降・輕盈著陸', 'Rapid Insertion · Swift Landing', '第 1 回合策略謀略：降落區內的士兵免費重新定位（距降落區 3" 內）。降落時可以落在空降標記 4" 內。', 'First-turning-point gambit: Troopers in the drop zone make a free Reposition (within 3" of it). When it lands it can do so within 4" of a Drop marker.'],
  spSergeant: () => ['下達任務', 'Issue Mission', '0AP：選一名視線內、已行動的友方魅影（信標除外、本回合沒打斷過）：本回合它即使已行動也能用野戰技巧打斷，但不能反應。', '0AP: pick an expended friendly SPECTRE in sight that hasn\'t interrupted this TP: it can interrupt with Elite Fieldcraft even though expended, but can\'t counteract.'],
  spBeacon: () => ['通訊中繼信標', 'Vox-relay Beacon', '部署時可放在己方領地任何地方（離標記與裝備地形 2" 外）。消耗品，只能做「信號」（1AP，6" 內友方魅影下次啟動 APL +1）；不能反應、反擊、協助，不能爭奪標記，敵人可以無視它的控制範圍。', 'Pre-Deploy anywhere in your territory (more than 2" from markers and equipment terrain). Expendable: only Signal (1AP, a friendly SPECTRE within 6" gets +1 APL); can\'t counteract, retaliate or assist, can\'t contest markers, enemies can ignore its control range.'],
  spGrenadier: () => ['擲彈兵・熱熔地雷', 'Grenadier · Melta Mine', '自己的破片、穿甲、煙霧手雷（不算進裝備次數），破片與穿甲命中 +1。攜帶熱熔地雷：「放置熱熔地雷」後免費衝刺，其他特工第一次進入它的控制範圍時受 2D6+3 傷害並中斷行動。', 'Its own frag, krak and smoke grenades (not from the team\'s uses), frag and krak Hit +1. Carries the Melta Mine: Place Melta Mine then a free Dash; the first other operative within its control range takes 2D6+3 and its action ends.'],
  spGuide: () => ['預備戰場・偵察地形', 'Prepared Killzone · Scout Terrain', '多選一個裝備（只能是彈藥箱或裝備地形）。偵察地形：己方領地與它 3" 內的地形對友方魅影視為已偵察（攀爬折扣等細節在 2D 版本簡化）。', 'One extra equipment option (an Ammo Cache or equipment terrain). Scout Terrain: terrain in your territory or within 3" of it is scouted (climb and hatch discounts are simplified in 2D).'],
  spHeavy: () => ['武器小組', 'Weapons Team', '啟動時若有裝填手在它控制範圍內，飛彈發射器改為「重型（僅衝刺）」。', 'On activation with a Loader in its control range, its missile launcher has Heavy (Dash only).'],
  spLoader: () => ['武器協助・裝填武器', 'Weapon Assist · Load Weapon', '控制範圍內的友方魅影射擊時可重擲一顆攻擊骰。裝填武器（1AP）：控制範圍內、3" 內沒有敵人的友方免費射擊（自動選最佳目標與武器）。', 'A friendly SPECTRE in its control range shooting can re-roll one attack die. Load Weapon (1AP): a friendly in its control range with no enemy within 3" makes a free Shoot (best target and weapon picked automatically).'],
  spStubGunner: () => ['壓制火力', 'Suppressive Fire', '它有 Engage 指令、沒被其他敵人交戰、本回合沒衝鋒時，3" 內看得到的敵人武器 Atk -1（最低 1）。', 'With an Engage order, not engaged with any other enemy and not having Charged this TP: weapons of enemies visible within 3" get -1 Atk (min 1).'],
  spTrooper: () => ['冷靜', 'Cool-Headed', '每回合一次，一名擁有此規則的友方可以 0 點野戰點用菁英野戰技巧打斷。', 'Once per TP, one friendly with this rule can interrupt with Elite Fieldcraft for 0 points.'],
  spVox: () => ['通訊兵・信號', 'Vox-operator · Signal', '在場上且沒被交戰時，野戰點 +1（每回合共 2 點）。信號（1AP）：視線內的另一名友方魅影下次啟動 APL +1。', 'In the killzone and not engaged: +1 Fieldcraft point (2 per TP). Signal (1AP): another friendly SPECTRE in sight gets +1 APL for its next activation.'],
  spCloak: () => ['偽裝斗篷', 'Camo Cloaks', '被射擊時，掩護豁免多保留一個，或把一個掩護豁免當成暴擊。', 'When shot, retain one more cover save, or one cover save as a critical.'],
  rvRavener: () => ['鑽地・掠食本能', 'Burrow · Predatory Instincts', '鑽地（1AP）：在你的隧道上就移出戰場（地下，不能做其他動作）；在地下就放回隧道上（可以在敵人控制範圍內，本次啟動 Move -2"）。攜帶標記時不能鑽地。啟動時可近戰兩次；任何指令下都能反應，反應中可免費鑽地一次。', 'Burrow (1AP): on your TUNNEL it goes underground (it can only Burrow while there); underground it is set up on the tunnel (even in enemy control range, Move -2" this activation). Not while carrying a marker. Two Fights per activation; it can counteract with any order, with one free Burrow.'],
  rvPrime: () => ['神經掠食冠・突觸連結', 'Neuropredatory Crest · Synaptic Link', '3" 內的敵人不能重擲攻擊／防禦骰、撿標記與任務行動多 1AP；爭奪標記時敵方 APL 總和視為少 1。突觸連結（策略謀略）：擲 D6，不小於 2 倍回合數 +1CP，小於回合數則首領受那麼多傷害。', 'Enemies within 3" can\'t re-roll and pay +1AP to Pick Up / mission actions; at a marker their APL total counts 1 lower. Synaptic Link (strategic gambit): roll a D6 — twice the turning point or more: +1CP; less than it: the Prime takes that damage.'],
  rvFelltalon: () => ['毒猛撲', 'Toxic Lunge', '1AP：選 2" 內看得到的一名敵人（有交戰敵人就只能選他們）；在地下時改選你隧道上的敵人。造成 D3+2 傷害並給毒素標記。地下也能做。', '1AP: an enemy visible within 2" (only engaged ones if any); underground, an enemy on your TUNNEL. D3+2 damage and a Poison token. Can be done underground.'],
  rvTremor: () => ['地底伏擊・敏銳獵手', 'Subterranean Ambush · Hypersensory Hunter', '每回合一次：敵人行動中移動超過 2" 並結束在你的隧道 2" 內，地下且準備中（或沒反應過）的震鐮自動插入：鑽出貼近並近戰那名敵人（用掉你的啟動）。鑽地的同一次啟動可以在隱蔽指令下衝鋒。', 'Once per TP: after an enemy moves more than 2" and ends within 2" of your TUNNEL, an underground Tremorscythe that is ready (or hasn\'t counteracted) interrupts automatically: it emerges beside and fights that enemy (using your activation). It can Charge with a Conceal order after Burrowing.'],
  rvVenomspitter: () => ['脹大背囊', 'Distend Dorsal Sac', '1AP：到射擊過毒液彈、再次執行或鑽地為止，毒液彈「致命 5+」、攻擊 +1、沒有射程限制。', '1AP: until it has shot its venom bolt, does this again or Burrows, the venom bolt has Lethal 5+, +1 Atk and no range limit.'],
  rvWarrior: () => ['本能行為', 'Instinctive Behaviour', '射擊、近戰或反擊受傷的敵人、或本回合撤退過的敵人時，武器「致命 5+」。', 'Shooting, fighting or retaliating against a wounded enemy or one that fell back this TP: Lethal 5+.'],
  rvWrecker: () => ['強化甲殼・碾壓', 'Reinforced Carapace · Crush', '普通與暴擊傷害 4 以上時少 1。碾壓：每次攻擊雙方擲骰比大小（對方生命 9 以下則加 1），贏了加傷害（差距，最多 3）。', 'Normal and Critical Dmg of 4+ inflicts 1 less. Crush: each strike, a roll-off (+1 if the target has Wounds 9 or less); a win adds damage equal to the difference (max 3).'],
  kmBreacha: () => ['破門', 'Breach', '1AP（不在交戰中）：在控制範圍內的地形上放破口標記；標記 1" 內，厚度 1" 以下的地形部分視為可通行。', '1AP (not engaged): place a Breach marker on terrain in control range; within 1" of it, parts of that terrain no more than 1" thick are Accessible.'],
  gotAPlan: () => ['我有計畫，夥計們', 'I Got a Plan, Ladz', '每次啟動一次：撿起標記、放置標記或任務動作少 1AP。', 'Once per activation: Pick Up Marker, Place Marker or a mission action costs 1 less AP.'],
  repulsive: () => ['令人作嘔的堅韌', 'Repulsive Fortitude', '被射擊時，防禦骰 5+ 為暴擊成功。', 'When shot, defence dice results of 5+ are critical successes.'],
  fearless: () => ['戰線無畏', 'Fearless on the Frontline', '在敵人控制範圍內也能做標記光；撤退少 1AP。', 'Can perform Markerlight while within enemy control range; Fall Back costs 1 less AP.'],
  analyse: () => ['分析', 'Analyse', '做標記光時，目標 3" 內它看得到的每名其他敵人也獲得一個標記。它做標記光和射擊時不受「同一目標」限制。', 'When it performs Markerlight, each other enemy visible to it within 3" of the target also gains a token. The same-target limit with Shoot doesn\'t apply to it.'],
  pfAccelerator: () => ['脈衝加速器', 'Pulse Accelerator', '1AP：到它下次啟動前（或它殘廢），它 3" 內其他友方探路者用脈衝武器射擊時獲得「致命 5+」與「嚴重」。', '1AP: until its next activation (or it is incapacitated), another friendly Pathfinder shooting with a pulse weapon within 3" of it has Lethal 5+ and Severe.'],
  pfGrav: () => ['重力抑制器', 'Grav-inhibitor', '敵人移動（衝刺除外）時，若進入它 6" 內且看得到，移動多算 2"。敵人在它 6" 內看得到時近戰或反擊，近戰命中值變差 1。', 'An enemy\'s move (not a Dash) that goes visible to and within 6" of it counts 2" more. An enemy fighting or retaliating visible within 6" has its melee Hit worsened by 1.'],
  pfShield: () => ['護盾產生器', 'Shield Generator', '無視穿甲；每回合一次，無視一個普通傷害的攻擊骰。', 'Ignores Piercing; once per TP, ignores the damage of one Normal Dmg attack die.'],
  veteran: () => ['老兵', 'Veteran', '使用蒙卡或考陽的回合，兩者效果都適用於它。', "In a TP with Mont'ka or Kauyon, it gets both."],
  drone: () => ['無人機', 'Drone', '控制目標時 APL 視為 -1。', 'Counts as 1 APL lower for objective control.'],
  actionsOnly: (v) => ['動作限制', 'Limited actions', `只能執行：${v.map((a) => ACTIONS[a].name.zh).join('、')}。`, `Only: ${v.map((a) => ACTIONS[a].name.en).join(', ')}.`],
  camoCloak: () => ['迷彩斗篷', 'Camo Cloak', '被射擊時無視飽和，並擁有「隱匿」戰團戰術。', 'Ignores Saturate when shot and has the Stealthy tactic.'],
  optics: () => ['光學瞄準', 'Optics', '1AP：直到下次啟動，射擊時敵人不能被遮蔽（強徵小隊神射手：隱蔽／定點處決霰彈槍再加「致命 5+」）。', '1AP: until its next activation, enemies cannot be obscured when it shoots (Exaction Marksman: the concealed/stationary executioner shotgun also has Lethal 5+).'],
  veteranLeadership: () => ['老兵領導', 'Veteran Leadership', '在場時策略階段可選兩種戰技。', 'While it\'s in the killzone, pick two Skills at Arms.'],
  tacticalCommand: () => ['戰術指揮', 'Tactical Command', '0AP：一名友方直到下回合多一種戰技。', '0AP: a friendly gains one more Skill at Arms until next TP.'],
  medikit0: () => ['快速急救', 'Quick Medikit', '醫療包只要 0AP。', 'Its Medikit costs 0AP.'],
  // ---- Scout Squad ----
  scSergeant: () => ['引導與經驗', 'Guidance and Experience', '每次啟動一次（自動）：另一名友方偵察小隊特工到它下次啟動結束 APL +1。有阿斯塔特規則：射擊兩次（至少一次用霰彈槍、爆彈手槍或爆彈槍）或近戰兩次，任何指令都能反擊。', 'Once per activation (automatic): another friendly Scout Squad operative gets +1 APL until the end of its next activation. Astartes: two Shoots (an Astartes shotgun, bolt pistol or boltgun for at least one) or two Fights, and it can counteract under either order.'],
  scGrapnel: () => ['鉤爪發射器・鉤爪突襲', 'Grapnel Launcher · Grapnel Assault', '向上攀爬時垂直距離視為 2"。衝鋒中若攀爬、落下、跳躍或底盤移到高處地形下，本次啟動近戰武器「致命 3+」。', 'Climbing up counts as 2". A Charge that climbs, drops, jumps or goes under Vantage terrain gives its melee weapons Lethal 3+ for the activation.'],
  rtFixer: () => ['固定者・指定目標＋軍需門路', 'Fixer · Target Designation, Munitorum Contacts', '策略階段可指定一名敵人：本回合友方萊特林步槍射擊它「致命 5+」。陣營與通用裝備合計最多 4 項。', 'In the Strategy phase designate an enemy: friendly RATLING rifles shooting it have Lethal 5+ this TP. Faction and universal equipment share a four-option cap.'],
  rtMutt: () => ['戰犬・預警＋野獸', 'Battlemutt · Early Warning, Beast', '只能做移動、撤退、衝刺、拾取、任務行動；敵人在其視線內行動後，可自動免費衝刺 2"。', 'Only Reposition, Fall Back, Dash, Pick Up, mission actions; after an enemy acts in its sight it may take a free 2" Dash (automatic).'],
  rtBomber: () => ['炸彈手・絆線＋地雷', 'Bomber · Tripwire, Mine', '佈署時放置絆線標記（敵人經過 APL -1）；地雷：敵人觸發受 2D3+3 傷害，友方不受影響。', 'Places Tripwire markers (enemy crossing: APL -1); Mines deal 2D3+3 to enemies, friendlies are exempt.'],
  rtHunter: () => ['獵手・潛伏待機', 'Hunter · Lie in Wait', '可衝鋒；被敵人衝鋒時先攻。', 'May charge; strikes first when charged.'],
  rtRaider: () => ['突襲手・彈弓＋鉤爪', 'Raider · Slingshot, Grappling Hook', '彈弓：視為移動，飛到 12" 內的落點；向上攀爬計 2"。彈弓後不能射擊。', 'Slingshot: counts as a Reposition to a point within 12"; climbing up counts as 2". No shooting after Slingshot.'],
  rtSneak: () => ['潛行者・規避', 'Sneak · Evade', '敵人行動後可自動免費衝刺 3"（離開敵人視線）。', 'After an enemy acts it may take a free 3" Dash (automatic).'],
  lightFingered: () => ['手腳靈巧', 'Light-fingered', '拾取標記只花 0AP。', 'Picking up a marker costs 0AP.'],
  wellStocked: () => ['補給充足', 'Well Stocked', '多放一個彈藥箱。', 'Places a second Ammo Cache.'],
  bayonetCharge: () => ['刺刀衝鋒', 'Bayonet Charge', '衝鋒時近戰武器獲得額外優勢。', 'Bonus when charging in melee.'],
  rtBruteShield: () => ['盾牌', 'Shield', '近戰格擋時可用盾牌，成功格擋加倍。', 'Parries with the shield; successful parries count double.'],
  sfConfessor: () => ['懺悔師・號令宣告＋帶領遊行', 'Confessor · Commanding Declamation, Lead the Procession', '號令宣告：6" 內看得到的敵人要射擊、近戰或衝鋒時，擲 D6 高過它的 APL 就取消該動作（AP 不退還），成功後整場不能再用（系統自動）。懺悔師還活著就是佈道者（範圍 6"）。', 'Commanding Declamation: when an enemy within 6" and visible would Shoot, Fight or Charge, a D6 above its APL cancels that action (AP not refunded); once it works it can\'t be used again (automatic). The Confessor is the orator while he lives (range 6").'],
  sfCherub: () => ['小天使・飛行＋激勵', 'Cherub · Fly, Incentivise', '飛行：衝鋒、撤退、重新定位時被移走再放回移動距離內（衝鋒沒有額外距離）。控制目標時 APL 視為少 1；隱蔽且在掩護中時 2" 外不能被選為有效目標；只能做移動、拾取、近戰和激勵。', 'Fly: removed and set up again within its Move for Charge, Fall Back and Reposition (a Charge gains no extra distance). Counts as 1 APL lower for control; Concealed in cover it can\'t be targeted beyond 2"; only movement, Pick Up, Fight and Incentivise.'],
  sfAssassin: () => ['死亡教派刺客・受過訓練的刺客', 'Death Cult Assassin · Trained Assassin', '1AP（不在交戰中）：改變自己的指令。近戰或反擊時可先結算一個成功並用來格擋（Bladed Stance）。', '1AP (not engaged): change its order. Bladed Stance: when fighting or retaliating, one success is resolved first and used to block.'],
  sfConflagrator: () => ['縱火者・淨化聖球架', 'Conflagrator · Sanctification Rack', '可執行「淨化聖球」（1AP），不佔每回合一次的裝備限制。雙重洪流：兩個不同的有效目標各射擊一次（自動選第二個）。', 'Can perform Sanctification Orb (1AP) without using the once-per-TP equipment limit. Twin Torrent: shoots two different valid targets (the second chosen automatically).'],
  sfDrill: () => ['訓練導師・無情教導＋空洞顱骨', 'Drill Abbot · Schola Progenium Disciplinarian, Null Skull', '6" 內的友方淨化者無視重傷造成的數值變化。4" 內的敵人不能有正向的 APL 變化。', 'Friendly SANCTIFIERs within 6" ignore the stat changes of being injured. An enemy within 4" can\'t have a positive APL change.'],
  sfMiraculist: () => ['奇蹟使・奇蹟＋烈焰纏身', 'Miraculist · Miracle, Wreathe in Fire', '奇蹟：第一次會殘廢時留 1 生命、本次動作剩下的骰全部作廢，並免費衝刺或撤退（3"）。烈焰纏身（1AP，限用 1 次）：在交戰中也能對 1" 內所有敵人用烈焰攻擊（無掩護、不被遮蔽）。', 'Miracle: the first time it would be incapacitated it stays on 1 wound, the remaining dice are discarded and it makes a free Dash or Fall Back (3"). Wreathe in Fire (1AP, Limited 1): attacks every enemy within 1", even when engaged (no cover, not obscured).'],
  sfSpread: () => ['傳教士・傳播皇帝之言', 'Missionary · Spread the Word of the God-Emperor', '離其他友方特工超過 6" 時，武器獲得「嚴重」。有聖物的傳教士永遠享有佈道加成。', 'More than 6" from other friendlies, its weapons have Severe. A Missionary with a holy relic always benefits from the Sermon.'],
  fanatical: () => ['迫害者・無情懲戒＋狂熱報復', 'Persecutor · Merciless Castigation, Fanatical Retribution', '每次啟動第一次近戰後，若雙方都沒殘廢，可再對同一敵人免費近戰一次。近戰中殘廢時，可先用一個還沒結算的成功打擊敵人。', 'After its first Fight each activation, if neither is incapacitated, a free Fight against the same enemy. If incapacitated in a fight it strikes with an unresolved success first.'],
  defendFaith: () => ['布道者・捍衛信仰', 'Preacher · Defend the Faith', '控制目標標記時享有佈道加成。', 'While it controls an objective marker it benefits from the Sermon.'],
  sfReliquant: () => ['聖物官・教派聖像＋帝國教派奉獻', 'Reliquant · Cult Icon, Imperial Cult Devotion', '4" 內的標記：只要有友方淨化者爭奪，總 APL 視為高 1。每回合一次：6" 內看得到的準備中友方淨化者殘廢時，它在被移除前免費射擊一次（自動）。', 'Markers within 4": total APL counts as 1 higher while a friendly SANCTIFIER contests. Once per TP, a ready friendly within 6" that is incapacitated shoots for free before it is removed (automatic).'],
  sfSalvationist: () => ['救贖者・轉化力場＋醫療包', 'Salvationist · Conversion Field, Medikit', '距離射擊者超過 6"、在救贖者 6" 內的友方淨化者防禦 +1。醫療包 1AP：控制範圍內一名友方淨化者回復最多 2D3。', 'A friendly SANCTIFIER within 6" of it, shot from more than 6" away, saves 1 better. Medikit 1AP: a friendly within control range regains up to 2D3.'],
  scTracker: () => ['追蹤敵人', 'Track Enemy', '1AP（不在交戰中）：選 8" 內一名敵人，本回合友方偵察小隊特工射擊它時，遠程武器「搜尋（輕型）」。', '1AP (not engaged): select an enemy within 8"; this TP friendly Scout Squad operatives shooting it have Seek Light on their ranged weapons.'],
  scSniper: () => ['狙擊手協同', 'Sniper Synergy', '正受到光學瞄準效果時，鳥卜儀掃描範圍內的目標被它射擊，遠程武器再加「搜尋（輕型）」。', 'While Optics is active, targets inside an Auspex Scan are shot with Seek Light on its ranged weapons.'],
  // ---- Nemesis Claw ----
  ncVisionary: () => ['預知', 'Prescience', '策略階段準備步驟獲得 D3 預知點數（回合結束棄掉；預見者殘廢就不能獲得或使用）。預感：輪到你啟動時花 1 點跳過那次啟動；預兆：一顆普通傷害骰打中它時花 1 點無視（各每回合一次）。「預感」動作 1AP（每回合一次、不在交戰中）：花 1 點換 1CP。', 'Ready step: D3 Prescience points (discarded at the end of the TP; none gained or spent if the Visionary is incapacitated). Foreboding: skip one of your activations for 1 point; Portent: ignore one Normal Dmg die on it for 1 point (each once per TP). Premonition (1AP, once per TP, not engaged): 1 point for 1CP.'],
  ncFearmonger: () => ['恐懼毒', 'Terrorchem', '恐懼毒瓶與污染刀：暴擊造成傷害（含毀滅）時，目標獲得恐懼毒標記，之後每次啟動受 D3 傷害。毒化目標點（1AP）：控制的目標點放毒，第一個爭奪它的敵人得標記並受 2D3 傷害。', 'Terrorchem vial and tainted blade: critical damage (Devastating too) gives the target a token — D3 damage whenever it activates. Poison Objective (1AP): a controlled objective marker is poisoned; the first enemy to contest it gains a token and takes 2D3.'],
  ncScreecher: () => ['尖嚎', 'Screecher', '3" 內的敵人射擊、近戰或反擊時不能重擲攻擊骰。', 'Enemies within 3" shooting, fighting or retaliating can\'t re-roll their attack dice.'],
  ncAppetite: () => ['殘虐胃口', 'Appetite for Cruelty', '對受傷的敵人近戰時，閃電爪「致命 4+」。', 'Fighting a wounded enemy: its lightning claws have Lethal 4+.'],
  ncFlay: () => ['活剝', 'Flay Them Alive', '每回合一次：在控制範圍內使敵人殘廢時，選它或死者 6" 內另一名看得到的敵人：本回合不能控制標記、撿起標記或執行任務動作。', 'Once per TP, incapacitating an enemy in its control range: another enemy visible within 6" of it or the victim can\'t control markers, Pick Up or perform mission actions this TP.'],
  ncTyrant: () => ['剝皮坑暴君', 'Tyrant of the Skinning Pits', '近戰或反擊時，3 以上的普通與暴擊傷害少 1。', 'Fighting or retaliating, Normal and Critical Dmg of 3+ deals 1 less to it.'],
  ncMimicry: () => ['變聲模仿', 'Disconcerting Mimicry', '1AP（不在交戰中）：6" 內一名敵人 APL -1、改變指令、或免費衝刺（位置由我方指定）——每種整場只能選一次，各是一個動作。', '1AP (not engaged): an enemy within 6" gets -1 APL, a changed order or a free Dash (you pick the spot) — each option once per battle, each its own action.'],
  ncIconBearer: () => ['掌旗手', 'Icon Bearer', '控制標記時 APL 視為 +1。', 'Counts as +1 APL when determining control of a marker.'],
  ncCruel: () => ['殘忍折磨者', 'Cruel Tormenter', '攻擊、近戰或反擊重傷或生命 7 以下的敵人時，武器「致命 5+」。', 'Against an injured enemy or one with a Wounds stat of 7 or less (shooting, fighting or retaliating): Lethal 5+.'],
  // ---- Wrecka Krew ----
  wreckaBoss: () => ['破壞頭目', 'Wrecka Boss', '每次射擊或近戰（守衛除外）得 1 破壞點數。', 'Each Shoot or Fight (not Guard) gains 1 Wrecka point.'],
  stoopid: () => ['笨蛋', 'Stoopid', '交戰階段一律是交戰指令；只能衝鋒、衝刺、近戰、重新定位、射擊，只能用資料卡上的武器。', 'Always an Engage order in the Firefight phase; only Charge, Dash, Fight, Reposition and Shoot, with its datacard weapons only.'],
  boom: () => ['轟！', 'Boom!', '還沒用炸藥就殘廢時擲兩顆 D6，任一 4+ 就在移除前免費用炸藥射擊。', 'Incapacitated before using its explosives: roll two D6, on any 4+ it shoots its explosives for free before it\'s removed.'],
  wkReckless: () => ['魯莽脾氣', 'Reckless Temperament', '4 以上的普通傷害 -1；交戰指令時 4 以上的暴擊傷害也 -1。', 'Normal Dmg of 4+ deals 1 less; with an Engage order Critical Dmg of 4+ too.'],
  wkBreakStuff: () => ['搗毀', 'Break Stuff', '1AP：控制範圍內的裝備地形直接拆掉；其他地形打出破口，1" 內厚度 1" 以下的部分可以穿過（不扣攀爬）。', '1AP: equipment terrain in control range is removed; other terrain gets a Breach marker — within 1", parts no more than 1" thick can be crossed (no climbing).'],
  wkArmouredUp: () => ['全副武裝', 'Armoured Up', '被射擊、近戰或反擊時，對手只有擲出 6 才算暴擊（致命、撕裂、嚴重無效）。', 'Shot at, fighting or retaliating: the opponent\'s crits need a 6 (no Lethal, Rending or Severe).'],
  wkKompetitive: () => ['好勝心', 'Kompetitive Streak', '每次射擊一次：目標（含次要目標）本回合已被其他友方射過，得 1 破壞點數。', 'Once per Shoot: a target (secondary ones included) another friendly already shot this TP gains 1 Wrecka point.'],
  blastPadding: () => ['防爆護甲', 'Blast Padding', '被爆炸／洪流武器射擊時可重擲一顆防禦骰；不受範圍毀滅波及。', 'Re-rolls one defence die against Blast / Torrent; not hit by x" Devastating unless it\'s the target.'],
  meltaMine: () => ['熱熔地雷', 'Melta Mine', '1AP（整場一次）：放下熱熔地雷並免費衝刺；其他特工第一次進入它的控制範圍受 2D6+3 傷害。', '1AP (once): place the Melta Mine and Dash for free; the first other operative within its control range takes 2D6+3.'],
  battleComms: () => ['戰場通訊', 'Battle Comms', '1AP（每次啟動最多兩次）：另一名友方下次 APL +1（最多 3）。', '1AP (up to twice per activation): another friendly +1 APL next activation (max 3).'],
  adaptive: () => ['應變裝備', 'Adaptive Equipment', '每回合隊上一名這類特工可用一次震撼彈、一名可用一次煙霧彈（不算裝備次數）。', 'Each TP, one such operative can use a stun grenade and one a smoke grenade, once each (not from equipment).'],
  mark: (v) => [{ khorne: '恐虐印記', nurgle: '納垢印記', slaanesh: '色孽印記', tzeentch: '奸奇印記', undivided: '混沌不分印記' }[v], { khorne: 'Mark of Khorne', nurgle: 'Mark of Nurgle', slaanesh: 'Mark of Slaanesh', tzeentch: 'Mark of Tzeentch', undivided: 'Undivided' }[v], { khorne: '近戰武器「重創」。', nurgle: '受到 3 以上普通傷害時擲 D6，5+ -1。', slaanesh: 'Move +1"。', tzeentch: '遠程武器「重創」。', undivided: '攻擊 6" 內的敵人時武器「無休」。' }[v], { khorne: 'Melee weapons have Severe.', nurgle: 'Normal Dmg of 3+: on a 5+, 1 less.', slaanesh: '+1" Move.', tzeentch: 'Ranged weapons have Severe.', undivided: 'Ceaseless against enemies within 6".' }[v]],
  daemonicAura: () => ['惡魔光環', 'Daemonic Aura', '控制範圍內的敵人撤退時擲 D6，3+ 就不能撤退。', 'An enemy falling back from its control range: on a D6 3+ it can\'t.'],
  soulGorge: () => ['靈魂吞噬', 'Soul Gorge', '近戰後若使敵人殘廢或造成暴擊傷害，回復 D3+1。', 'After a fight in which it incapacitated the enemy or inflicted Critical Dmg, regains D3+1.'],
  noAssistVs: () => ['毀滅猛攻', 'Devastating Onslaught', '和它近戰的敵人不能得到協助。', 'Enemies fighting it can\'t be assisted.'],
  viciousReflexes: () => ['兇猛反射', 'Vicious Reflexes', '反擊時由它先出手。', 'When retaliating, it resolves the first die.'],
  dismember: () => ['恐怖肢解', 'Horrifying Dismemberment', '近戰使敵人殘廢時，附近另一名敵人下次 APL -1。', 'When it incapacitates an enemy in a fight, another enemy nearby gets -1 APL.'],
  grisly: () => ['血腥標記', 'Grisly Mark', '2AP（整場一次）：放下標記；3" 內的敵人撿標記與任務動作 +1AP，爭奪目標 APL 總和 -1。', '2AP (once): place the marker; enemies within 3" pay +1AP for Pick Up / mission actions and count 1 less total APL for control.'],
  unleashDaemon: () => ['釋放惡魔', 'Unleash Daemon', '啟動時（整場一次）：之後 4 以上的傷害 -1，惡魔爪「無休」＋「致命 5+」，但不能撿標記或做任務動作。', 'When activated (once): from then on 4+ damage deals 1 less and its claw has Ceaseless and Lethal 5+, but it can\'t pick up markers or do mission actions.'],
  wastelandStalker: () => ['荒地潛行者', 'Wasteland Stalker', '被射擊時若能保留掩護豁免，可多保留 1 顆，或把 1 顆當暴擊保留。', 'When shot, if it can retain cover saves, it retains one more, or one as a critical success.'],
  canticleDestruction: () => ['毀滅頌歌', 'Canticle of Destruction', '3" 內的友方潛行者（包括自己）近戰時，第一次用暴擊打擊多造成 1 傷害。', 'A friendly Ruststalker within 3" (itself included) fighting: its first critical strike of the sequence deals 1 more damage.'],
  targetingProtocol: () => ['瞄準協議', 'Targeting Protocol', '本次啟動還沒移動（或反擊時）射擊，遠程武器「致命 5+」；射擊後仍可移動。', 'Shooting before it has moved this activation (or counteracting): ranged weapons have Lethal 5+; it can still move afterwards.'],
  radSat: () => ['輻射飽和', 'Rad-Saturation', '友方先鋒軍 2" 內的敵人命中變差 1（不與重傷疊加）。', 'Enemies within 2" of friendly Vanguard have their Hit worsened by 1 (not cumulative with injured).'],
  magnifyRelay: () => ['放大節點', 'Magnify node', '交戰指令且不在敵人控制範圍內時，友方技師／學徒的「放大」武器可借它的位置射擊。', 'With an Engage order and not in an enemy\'s control range, friendly Cryptek / Apprentek Magnify weapons can shoot through it.'],
  interstitial: () => ['間隙指令', 'Interstitial Command', '1AP（支援，非反擊）：6" 內可見的另一名友方（技師、學徒除外；技師也可選不朽者指揮官 6" 內的）立刻免費射擊一次。本版只能用來射擊；本回合已射擊或已被指揮過的不能選。', '1AP (Support, not counteracting): another visible friendly within 6" (not a Cryptek or Apprentek; for a Cryptek, also within 6" of a visible Despotek) shoots for free right away. Here it can only Shoot; not one that already shot or was commanded this TP.'],
  canoptekRepair: () => ['聖甲蟲修復', 'Canoptek Repair', '1AP（支援，每回合全隊一次）：6" 內可見的友方回復 2D3 生命。', '1AP (Support, once per TP for the team): a visible friendly within 6" regains 2D3 wounds.'],
  augment: () => ['強化武器', 'Augment Weapon', '1AP（支援）：直到它下次啟動，6" 內可見友方的一把武器獲得兩條規則（自動選：致命 5+、撕裂；已有就改選重創、飽和）。', '1AP (Support): until its next activation, one weapon of a visible friendly within 6" gains two rules (picked for you: Lethal 5+ and Rending, or Severe / Saturate if it already has them).'],
  reinforce: () => ['強化金屬', 'Reinforce Metal', '1AP（支援）：直到它下次啟動，6" 內可見的一名友方受到 3 以上的傷害時 -1。', '1AP (Support): until its next activation, attack dice inflicting 3+ damage on a visible friendly within 6" deal 1 less.'],
  apprentek: () => ['學徒協助', 'Apprentek Assistance', '擁有技師的特殊動作，但每回合只能用其中一個。', 'Has the Cryptek\'s unique actions, but can only use one of them per turning point.'],
  deathmark: () => ['死亡標記', 'Deathmarked', '射擊後沒殘廢的目標獲得死亡標記；死亡標記射擊有標記的敵人時武器「搜尋」。', 'A target it shoots that survives gains a Deathmarked token; Deathmarks shooting a token holder have Seek.'],
  mdVision: () => ['多維視覺', 'Multi-dimensional Vision', '1AP：直到下次啟動，射擊時敵人不能被遮蔽。', '1AP: until its next activation, enemies cannot be obscured when it shoots.'],
  steadfast: () => ['堅定', 'Steadfast', '爭奪目標時 APL 一律算 3。', 'Counts as APL 3 when determining control of a marker.'],
  accelerate: () => ['加速', 'Accelerate', '1AP：6" 內可見的死亡標記或不朽者下次啟動 APL +1。', '1AP: a visible Deathmark or Immortal within 6" gets +1 APL next activation.'],
  reanimate: () => ['復甦', 'Reanimate', '1AP 擲 D6，3+ 讓 6" 內看得到的復甦標記上的友方復甦；花 2AP 則自動成功。這回合已行動過才殘廢的，復甦後是已行動狀態。', '1AP: roll a D6, on a 3+ the friendly of a Reanimation marker visible within 6" is REANIMATED; 2AP: automatic. One that had already acted this TP comes back expended.'],
  nuncio: () => ['使節天鷹', 'Nuncio-aquila', '3" 內的敵人執行撿起標記與任務動作要多花 1AP；爭奪目標時，若有敵人在它 3" 內，對方 APL 總和 -1。（本版以隊長本身代替標記）', 'Enemies within 3" pay +1AP for Pick Up Marker and mission actions; when a marker is contested, the enemy total APL is 1 lower if one of them is within 3" of it. (The Proctor itself stands in for the marker.)'],
  engenderedFocus: () => ['堅定專注', 'Engendered Focus', '無視自身數值的變化（豁免除外）：重傷不減 Move、命中，APL 不受影響。', 'Ignores changes to its stats (except Save): no injured Move/Hit penalty, APL unchanged.'],
  zealous: () => ['狂熱奉獻', 'Zealous Dedication', '受到 3 以上的傷害時擲 D6：5+ 傷害 -1。', 'Whenever an attack die inflicts 3+ damage on it, roll a D6: on a 5+, 1 less.'],
  arrest: () => ['懲戒者的逮捕', "Castigator's Arrest", '若它控制範圍內只有一名敵人，該敵人不能撤退。', 'If only one enemy is in its control range, that enemy cannot Fall Back.'],
  apprehend: () => ['扣押', 'Apprehend', '0AP：控制範圍內一名敵人，在它離開前命中變差 1（不與重傷疊加）且不能撤退。', "0AP: an enemy in its control range has its Hit worsened by 1 (not cumulative with injured) and can't Fall Back while it stays there."],
  aggressivePattern: () => ['攻擊模式', 'Attack Pattern', '馴犬師為牠選了「凶猛」（近戰武器「毫不留情」）與「迅捷」（Move +2"，已算入 8"）。', 'The Leashmaster picked Aggressive (melee Relentless) and Swift (+2" Move, included in its 8").'],
  veriscant: () => ['真相鑑定', 'Veriscant', '1AP（敏銳專注時 0AP）：一名可見敵人，直到它下次啟動，友方攻擊它時武器「致命 5+」＋「重創」。', '1AP (0AP with Acute Focus): a visible enemy — until its next activation, friendly weapons have Lethal 5+ and Severe against it.'],
  acuteFocus: () => ['敏銳專注', 'Acute Focus', '每次啟動一次：撿起標記、真相鑑定或任務動作少花 1AP。', 'Once per activation: Pick Up Marker, Veriscant or a mission action costs 1 less AP.'],
  stubbornSubjugator: () => ['頑強鎮壓者', 'Stubborn Subjugator', '近戰武器的命中值不受任何變化影響。', 'Changes to the Hit stat of its melee weapons are ignored.'],
  vigilance: () => ['近距警戒', 'Close Quarters Vigilance', '交戰中也能射擊（本次啟動沒衝鋒過，或是反擊時）。', 'Can Shoot while engaged, unless it Charged this activation (fine when counteracting).'],
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
  explosiveDemise: () => ['爆炸死亡', 'Explosive Demise', '殘廢時擲 2D6（在敵人控制範圍內 1D6），有 4+ 就對 2" 內可見的每名特工造成 D3+2 傷害（還沒丟炸彈則 D6+2）。', 'When incapacitated, roll 2D6 (1D6 if engaged): any 4+ deals D3+2 (D6+2 if the bomb is unused) to each visible operative within 2".'],
  unholySustenance: () => ['邪惡滋養', 'Unholy Sustenance', '近戰或反擊時使對手殘廢，回復 D3 生命。', 'Incapacitating the enemy when fighting or retaliating regains D3 wounds.'],
  actuation: () => ['褻瀆啟動', 'Sacrilegious Actuation', '1AP（自己持有血祭標記時）：獲得一個血祭標記。', '1AP (while it has a Blooded token): gain a Blooded token.'],
  stimms: () => ['興奮劑', 'Stimms', '1AP：控制範圍內的友方，受傷時注射「回春」（回復 2D3），否則給「強化」或「狂怒」（整場）。開局給歐格林「強化」。', '1AP: a friendly in control range gets Rejuvenated (2D3 wounds) if hurt, otherwise Fortified or Enraged for the battle. The Ogryn starts Fortified.'],
  wretched: () => ['卑劣者', 'Wretched', '在近戰中殘廢時，可先用一顆未結算的成功骰打擊對方。（隱蔽衝鋒依基本規則停用）', 'If incapacitated in a fight, strikes with an unresolved success first. (Charging while Concealed is disabled by the basic rules.)'],
  camo1: () => ['迷彩斗篷', 'Camo Cloak', '被射擊時若能保留掩護豁免，多保留 1 顆。（以血之名未實作）', 'When shot with cover saves, retains one more. (A Name Whispered in Blood isn\'t modelled.)'],
  tough: () => ['堅韌', 'Tough', '近戰、反擊或被射擊時，3 以上的普通傷害 -1。', 'When fighting, retaliating or shot, Normal Dmg of 3+ deals 1 less.'],
  shielding: () => ['舉盾', 'Shielding', '0AP（啟動時）：直到下次啟動 Move -2"，被射擊時可重擲任意防禦骰。', '0AP (when activated): until its next activation, -2" Move and re-roll any defence dice when shot.'],
  disciplinarian: () => ['嚴酷的紀律官', 'Gruelling Disciplinarian', '6" 內的友方無視重傷造成的數值變化。（強制命令未實作）', 'Friendlies within 6" ignore stat changes from being injured. (Enforce isn\'t modelled.)'],
  chemEnhanced: () => ['化學強化', 'Chem-enhanced', '無視 APL 變化，不受震撼與昏迷影響。', 'Ignores APL changes and isn\'t affected by Shock or Stun.'],
  brute: () => ['蠻牛', 'Brute', '隱蔽時，敵人選目標不能用輕型地形擋它（仍保留掩護豁免）。', 'While Concealed, enemies can\'t use Light terrain as cover for it when picking targets (it keeps the cover save).'],
  slowWitted: () => ['遲鈍', 'Slow-witted', '撿標記與任務動作多花 1AP。', '+1AP for Pick Up and mission actions.'],
  avalanche: () => ['肌肉雪崩', 'Avalanche of Muscle', '衝鋒結束時，對控制範圍內一名敵人造成 D3 傷害。', 'After a Charge, D3 damage to one enemy in its control range.'],
  cultAgent: () => ['教派特工', 'Cult Agent', '被射擊時無視「穿甲」與「飽和」；能保留掩護豁免時多保留 1 顆，或把 1 顆當暴擊。', 'When shot, ignores Piercing and Saturate; with cover saves, retains one more or one as a critical.'],
  twoShoots: () => ['神槍手', 'Expert Gunslinger', '每次啟動可執行兩次射擊。', 'Can perform two Shoot actions per activation.'],
  heroic: () => ['英雄的鼓舞', 'Heroic Inspiration', '本回合使敵人殘廢過後，3" 內可見的友方新信徒武器「嚴厲」。', 'Once it has incapacitated an enemy this TP, friendly Neophytes visible within 3" of it have Severe.'],
  twoFights: () => ['劍術大師', 'Expert Swordsman', '每次啟動可執行兩次近戰。（之後的 3" 免費衝鋒、閃電突擊、刃之架勢未實作）', 'Can perform two Fight actions per activation. (The free 3" Charge, Quicksilver Strike and Bladed Stance aren\'t modelled.)'],
  bipod: () => ['重武器腳架', 'Heavy Weapon Bipod', '本次啟動沒移動（或反擊時）射擊：武器「無休」，已有無休則改為「毫不留情」。', 'Shooting without having moved this activation (or when counteracting): Ceaseless, or Relentless if it already has it.'],
  miasma: () => ['毒瘴', 'Poisonous Miasma', '1AP（靈能）：7" 內可見的敵人中毒；已中毒則受到 3 傷害。', '1AP (Psychic): an enemy visible within 7" is poisoned, or takes 3 damage if it already was.'],
  krumpin: () => ["揍人時間", "Krumpin' Time", '每次啟動可執行兩次近戰。', 'Can perform two Fight actions per activation.'],
  support: (v) => (v === 'getItDun'
    ? ['快去做！', 'Get It Dun!', '1AP（支援，不能在反擊時）：6" 內可見的另一名友方下次啟動 APL +1。', '1AP (Support, not while counteracting): another visible friendly within 6" gets +1 APL next activation.']
    : v === 'wayfind' ? ['尋路', 'Wayfind', '1AP（支援）：它或偵察車 6" 內可見的另一名友方（機械除外）下次啟動 APL +1。', '1AP (Support): another friendly (not a machine) visible within 6" of it or of the C.A.T. unit gets +1 APL next activation.']
    : v === 'spot' ? ['觀測', 'Spot', '1AP（支援）：選一名可見的敵人；本回合觀測手 3" 內的友方射擊它時「搜尋（輕型）」，且它不會被遮擋。', '1AP (Support): pick a visible enemy; this TP, friendlies within 3" of the Spotter shooting it have Seek Light and it can\'t be obscured.']
    : v === 'sfIncentivise' ? ['激勵', 'Incentivise', '1AP（不在交戰中）：選 2" 內看得到的另一名友方淨化者（懺悔師、刺客、奇蹟使、佈道者除外），到它下次啟動結束 APL +1。', '1AP (not engaged): another friendly SANCTIFIER visible within 2" (not Confessor, Assassin, Miraculist or orator) gets +1 APL until the end of its next activation.']
    : v === 'rtIntercept' ? ['攔截通訊', 'Intercept Communications', '1AP（支援）：6" 內可見的另一名友方萊特林到下次啟動結束 APL +1。', '1AP (Support): another friendly RATLING visible within 6" gets +1 APL until the end of its next activation.']
    : [v === 'eyeAbove' ? '天上之眼' : '聽好了', v === 'eyeAbove' ? 'From the Eye Above' : 'Listen In', '1AP（支援）：6" 內可見的另一名友方下次啟動 APL +1。', '1AP (Support): another visible friendly within 6" gets +1 APL next activation.']),
  dakkaDash: () => ['達卡衝刺', 'Dakka Dash', '1AP（非隱蔽）：免費衝刺一次並用達卡槍免費射擊一次，順序不限。', '1AP (not Concealed): a free Dash and a free dakka shoota Shoot, in either order.'],
  datAllYouGot: () => ['就這樣？', 'Dat All You Got?', '近戰或反擊後若還站著，對方受到 D3 傷害。', 'After fighting or retaliating, if still standing, the enemy takes D3 damage.'],
  wotNotz: () => ['戰術小玩意', 'Taktical Wot-notz', '每回合一次，一名小子可丟震撼手雷：6" 內可見的敵人及其 1" 內的特工擲 D6，3+ 下次啟動 APL -1。', 'Once per TP, one Boy can throw a Stun Grenade: an enemy visible within 6" and every operative within 1" of it roll a D6 — on a 3+, -1 APL next activation.'],
  callTheKill: () => ['呼喚獵殺／勝利尖嘯', 'Call the Kill / Victory Shriek', '策略階段標記一名敵人，對它攻擊時武器獲得「平衡」；標記殘廢時，6" 內一名友方之後都獲得「平衡」（每名一次）。', 'Mark an enemy in the Strategy phase: Balanced against it. When it falls, a friendly within 6" has Balanced for the rest of the battle (once each).'],
  energise: () => ['充能', 'Energise', '1AP：加速弓獲得「致命 5+」，直到本回合結束或用弓射擊後。', '1AP: the accelerator bow has Lethal 5+ until the end of the TP or until it shoots.'],
  coldBlooded: () => ['冷血', 'Cold-blooded', '攻擊受過傷的敵人時「致命 5+」；對方已重傷（生命低於一半）時再加「撕裂」。', 'Lethal 5+ against a wounded enemy; also Rending if it is injured.'],
  hardyCrit: () => ['強韌', 'Hardy', '受到暴擊時只承受普通傷害（若較低）。', 'Critical hits on it inflict Normal Dmg instead (if lower).'],
  viciousDuellist: () => ['兇猛決鬥者', 'Vicious Duellist', '近戰或反擊時，對方每顆失敗的攻擊骰造成 1 傷害。', 'When fighting or retaliating, each enemy attack die that fails deals 1 damage to that enemy.'],
  savageAssault: () => ['野蠻突擊', 'Savage Assault', '每次啟動第一次近戰後若雙方都還站著，可對同一敵人免費再近戰一次。', 'After its first Fight each activation, if both still stand, a free Fight against the same enemy.'],
  badTempered: () => ['脾氣暴躁', 'Bad-tempered', '敵人近戰時若能選牠，就必須改打牠。', 'An enemy fighting while it is a valid choice must fight it instead.'],
  longSight: () => ['遠視', 'Long-sight', '1AP：直到下次啟動，獵槍（隱蔽／定點）「致命 5+」，射擊時敵人不能被遮蔽。', '1AP: until its next activation, the hunting rifle (concealed/stationary) has Lethal 5+ and enemies cannot be obscured.'],
  concealCharge: () => ['潛獵者', 'Stalker', '（隱蔽衝鋒的例外已依基本規則停用；「潛行突襲」仍可使用。）', '(The Conceal-Charge exception is disabled by the basic rules; Stealth Attack still works.)'],
  stealthAttack: () => ['潛行突襲', 'Stealth Attack', '2AP（隱蔽、地形 1" 內）：免費衝鋒（不超過 Move）後免費近戰，第一次打擊後立刻再打擊一次。', '2AP (Concealed, within 1" of terrain): a free Charge (up to its Move) then a free Fight; its first strike is followed by another.'],
  pechra: () => ['標記獵物', 'Marked for the Hunt', '1AP：把鳥標放在可見敵人旁；友方射擊其 1" 內的敵人時獲得「搜尋（輕型）」，直到追蹤者下次啟動。', '1AP: place the Pech\'ra marker by a visible enemy; friendly shooting at enemies within 1" of it has Seek Light until the Tracker\'s next activation.'],
  sorcerer: () => ['巫師', 'Sorcerer', '靈能使用者；9" 內的符文戰士不受巫術自動機影響。', 'A psyker; Rubric Marines within 9" of it aren\'t slowed by Sorcerous Automata.'],
  destiny: () => ['命運之術', 'Destiny', '命運庇護（1AP，靈能）：可見友方被射擊時可重擲任意防禦骰。摧毀命運（1AP，靈能）：9" 內可見的敵人攻擊時必須重擲 6，控制目標時 APL -1。效果到它下次啟動。', 'Protected by Fate (1AP, Psychic): a visible friendly re-rolls any defence dice when shot. Ravage Destiny (1AP, Psychic): a visible enemy within 9" must re-roll attack 6s and counts 1 lower for control. Until its next activation.'],
  tempyrion: () => ['時間之術', 'Tempyrion', '重組儀式（1AP，靈能，每回合全隊一次）：6" 內可見的友方回復最多 2D3 生命。時間通量（1AP，靈能）：在 6" 內可見友方旁放標記，它下次啟動結束時若完全在標記 6" 內，就回到標記處。', 'Reconstitution Ritual (1AP, Psychic, once per TP for the team): a friendly visible within 6" regains up to 2D3 wounds. Temporal Flux (1AP, Psychic): a marker by a friendly visible within 6"; at the end of its next activation, if wholly within 6" of the marker, it is set back up there.'],
  herdBanner: () => ['獸群旗幟', 'Herd Banner', '3" 內看得到的友方奸奇獸人受到 3 點以上的普通傷害時 -1。', 'Normal Dmg of 3+ on a friendly Tzaangor visible within 3" of it deals 1 less.'],
  brayhorn: () => ['號角', 'Brayhorn', '0AP：友方奸奇獸人移動 +1"，直到下個策略階段的準備步驟（不能在交戰中）。', '0AP: friendly Tzaangor have +1" Move until the next Strategy phase\'s Ready step (not while engaged).'],
  relicHunters: () => ['遺物獵人', 'Relic Hunters', '整場一次：在對手領域內撿起標記或做任務動作少 1AP（全隊的奸奇獸人戰士共用）。', 'Once per battle: Pick Up Marker or a mission action for 1 less AP in the opponent\'s territory (shared by the team\'s Tzaangor Warriors).'],
  wcWarrior: () => ['戰士', 'Warrior', '可以重複選。', 'Can be picked more than once.'],
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
  surveyor: () => ['勘測員', 'Surveyor', '操控 C.A.T. 偵察車：它殘廢後偵察車不能再啟動。（遙控動作未實作）', 'Operates the C.A.T. unit, which can\'t activate once it falls. (Remote Control isn\'t modelled.)'],
  catUnit: () => ['機械（偵察車）', 'Machine (C.A.T.)', '只能衝鋒、衝刺、撤退、轉移、觀測；不能反擊；敵人控制範圍內或勘測員殘廢後不能啟動；觀測對全隊有效；控制目標時 APL -1；不計入擊殺任務。', 'Only Charge, Dash, Fall Back, Reposition and Spot; can\'t retaliate; can\'t activate in enemy control range or once the Surveyor falls; its Spot helps the whole team; -1 APL for control; ignored for the kill op.'],
  gheistskull: () => ['機械（鬼骷髏）', 'Machine (Gheistskull)', '只能加速、衝鋒、衝刺、撤退、轉移；不能反擊；控制目標時 APL -1；不計入擊殺任務。虛空干擾員可引爆它。', 'Only Boost, Charge, Dash, Fall Back and Reposition; can\'t retaliate; -1 APL for control; ignored for the kill op. The Void-jammer can detonate it.'],
  boost: () => ['加速', 'Boost', '1AP（整場一次，第 1 回合除外）：這次啟動的下一次衝鋒多移動 4"。', '1AP (once per battle, not TP1): its next Charge this activation moves +4".'],
  pulse: () => ['干擾脈衝', 'Interference Pulse', '1AP：鬼骷髏 8" 內可見的敵人擲 D6（是鬼骷髏的有效目標 +1），3+ 下次啟動 APL -1。', '1AP: an enemy visible within 8" of the Gheistskull rolls a D6 (+1 if a valid target for it): 3+ = -1 APL next activation.'],
  eyeOfAncestors: () => ['先祖之眼', 'Eye of the Ancestors', '策略階段給一名敵人宿怨標記（友方殘廢 3 人以上時 2 名）。', 'Strategy phase: an enemy gains a Grudge token (two enemies once three friendlies are down).'],
  tome: (v) => (v === 'denunciation'
    ? ['審判典籍：譴責', 'Inquisitorial Tome: Denunciation', '友方攻擊在它 2" 內的敵人時，武器 Atk +1。（審問官自動拿譴責、典籍骷髏拿聖化）', 'Friendlies attacking an enemy within 2" of it get +1 Atk. (The Interrogator takes Denunciation and the Tome-skull Sanctification automatically.)']
    : ['審判典籍：聖化', 'Inquisitorial Tome: Sanctification', '敵人攻擊在它 2" 內的友方時，武器 Atk -1。', 'Enemies attacking a friendly within 2" of it get -1 Atk.']),
  machine: () => ['機械', 'Machine', '只能衝鋒、衝刺、撤退與移動；不能反擊或協助；爭奪標記時 APL 算少 1；隱蔽指令在掩體中時不能被選為目標（2" 內除外）。', 'Only Charge, Dash, Fall Back and Reposition; can\'t retaliate or assist; counts 1 lower APL for marker control; Concealed in cover it can\'t be targeted (except within 2").'],
  scrivener: () => ['記錄員', 'Scrivener', '對手每個計謀第二次（含）以後使用時，若它在場上 +1CP（每回合最多 2CP，指揮重擲除外）。', 'Each time your opponent uses a ploy again (not Command Re-roll) while it\'s in the killzone, +1CP (2CP per TP at most).'],
  irrefutable: () => ['確鑿報告', 'Irrefutable Report', '它爭奪的目標點或任務標記一定由我方控制。', 'An objective or mission marker it contests is always controlled by you.'],
  iaZealot: () => ['狂信者', 'Zealot', '受到 3 以上的傷害時擲 D6，5+ 減 1。', 'Damage of 3+ on it: roll a D6, on a 5+ it\'s 1 less.'],
  weathered: () => ['飽經風霜', 'Weathered', '每回合一次，近戰或反擊時無視一顆普通成功的傷害。', 'Once per TP, fighting or retaliating, ignore the damage of one normal success.'],
  noEscape: () => ['無處可逃', 'No Escape', '它控制範圍內的敵人撤退時擲 D6（敵人生命屬性較高 -1、受傷 +1），4+ 撤退失敗（AP 照扣）。', 'An enemy in its control range trying to Fall Back rolls a D6 (-1 if its Wounds stat is higher, +1 if wounded): on a 4+ it can\'t (AP still spent).'],
  extractInfo: () => ['榨取情報', 'Extract Information', '敵人在它控制範圍內殘廢時 +1CP。', 'An enemy incapacitated within its control range: +1CP.'],
  hexorcise: () => ['驅魔', 'Hexorcise', '它 6" 內看得到的敵人不能重擲攻擊骰或防禦骰。（「懲戒」動作未實作）', 'Enemies visible within 6" of it can\'t re-roll attack or defence dice. (The Chasten action isn\'t modelled.)'],
  scry: () => ['預視', 'Scry', '1AP，靈能：6" 內一名友方得到「指引」（攻擊時一顆失敗改普通、或一顆普通改暴擊）或「守護」（被射擊時防禦骰同樣處理），直到它下次啟動。', '1AP, PSYCHIC: a friendly within 6" gains Guidance (attack dice: one fail → normal, or one normal → crit) or Protection (the same for defence dice when shot) until its next activation.'],
  cruel: () => ['殘酷', 'Cruel', '攻擊受傷的敵人時武器「毫不留情」。', 'Attacking a wounded enemy: Relentless.'],
  iaBarrage: () => ['手槍彈幕', 'Pistol Barrage', '1AP（交戰指令、本次沒射擊過）：電漿手槍與消音手槍各免費射擊一次。命中值不受任何變化影響。', '1AP (Engage, hasn\'t shot this activation): a free Shoot with each of its pistols. Its ranged Hit can\'t be changed.'],
  lobotomised: () => ['腦葉切除', 'Lobotomised', '啟動時若在另一名特工（非槍械僕從）3" 內且看得到，本次 APL +1。', 'When activated visible within 3" of another agent (not a Gun Servitor): +1 APL this activation.'],
  psychicNull: () => ['靈能虛無', 'Psychic Null', '靈能遠程武器傷不了它；6" 內的任何特工（敵我皆同）不能做靈能動作或用靈能遠程武器。', 'PSYCHIC ranged weapons can\'t damage it; any operative within 6" (friend or foe) can\'t perform PSYCHIC actions or use PSYCHIC ranged weapons.'],
  rqRuthless: () => ['冷酷效率（徵用）', 'Ruthless Efficiency (requisitioned)', '徵用的警察之間：敵人在徵用警察的控制範圍內也能被選為目標。', 'Between requisitioned Exaction Squad operatives: an enemy in one\'s control range can still be targeted.'],
  rqVoidArmour: () => ['虛空護甲（徵用）', 'Void Armour (requisitioned)', '被爆炸或洪流武器射擊時可重擲一顆防禦骰。', 'Shot with Blast or Torrent: re-roll one defence die.'],
  veteranAdventurer: () => ['老練冒險家', 'Veteran Adventurer', '第 2 回合起的準備步驟，它在場上且不在交戰中：多 1 資源點。', 'In each Ready step after the first, if it\'s in the killzone and not engaged: +1 Resourceful point.'],
  outrightConviction: () => ['堅定信念', 'Outright Conviction', '整場第一次將殘廢時改為剩 1 生命，這個動作剩下的時間不會殘廢，剩下的攻擊骰全部作廢（近戰時雙方都是）。', 'The first time it would be incapacitated, it stays on 1 wound and can\'t be incapacitated for the rest of the action; all remaining attack dice are discarded (both sides in a fight).'],
  irrepressible: () => ['不屈的堅韌', 'Irrepressible Hardiness', '在近戰中殘廢時，可先用一顆未結算的成功骰打擊對方。', 'If incapacitated in a fight, it strikes with an unresolved success first.'],
  negotiation: () => ['鍛鎖談判', 'Wroughtlock Negotiation', '策略計策（每回合，自動）：交戰指令時立刻免費射擊一次（電腦方可以先改成交戰）。', 'Strategic gambit (each TP, automatic): with an Engage order it makes a free Shoot at once (the computer may switch to Engage first).'],
  brazenKiller: () => ['大膽殺手', 'Brazen Killer', '用鍛鎖左輪使敵人殘廢：那名敵人 2" 內看得到的其他敵人各擲 D6，大於它的 APL 時下次啟動 APL -1。', 'Incapacitating an enemy with its wroughtlock revolvers: each other enemy visible within 2" of it rolls a D6 — above its APL, -1 APL next activation.'],
  minefield: () => ['地雷區', 'Minefield', '開戰前自動佈下 5 個蓋著的地雷區標記（3 個 HY-Pex 地雷、2 個空的）。敵人進入標記的控制範圍、且附近沒有友方時翻開：地雷造成 3 傷害，再擲 D6，小於它的豁免值再加上點數。它在準備步驟不在交戰中時，會重設控制範圍內一個翻開的標記。', 'Five face-down Minefield markers are set up before the battle (3 HY-Pex mines, 2 blanks). An enemy coming within a marker\'s control range with no friendly near flips it: a mine deals 3, then a D6 below its Save adds that much. When it\'s readied out of enemy control range it resets a flipped marker in its control range.'],
  weavewerke: () => ['編織斗篷', 'Weavewërke Cloak', '被射擊時無視「飽和」；能保留掩體豁免時多保留一個，或把一個改為暴擊豁免。', 'When shot: ignores Saturate; with cover saves it retains one more, or one as a critical.'],
  panVisor: () => ['全光譜目鏡', 'Pan Spectral Visor', '射擊 6" 內的敵人：武器「搜尋（輕型）」，目標不能被遮蔽。', 'Shooting an enemy within 6": Seek Light, and the target can\'t be obscured.'],
  hyTracker: () => ['追蹤者', 'Tracker', '射擊或近戰 6" 內已行動過的敵人：武器「懲罰」。', 'Shooting or fighting an expended enemy within 6": Punishing.'],
  intrepid: () => ['無畏', 'Intrepid', '用資源點時：APL +1 持續到下次啟動；回血改為回復 4。', 'Spending a Resourceful point: +1 APL lasts until its next activation; healing regains 4 instead.'],
  khornesFavour: () => ['恐虐的恩寵', 'Khorne\'s Favour', '每次啟動一次，血槽空的時候可以 +1。', 'Once per activation, if its GORE TANK is empty, increase it.'],
  apotheosis: () => ['即將成神', 'Impending Apotheosis', '整場一次，無視一顆攻擊骰的普通傷害（自動用在第一次）。', 'Once per battle, ignore one attack die\'s Normal Dmg (used automatically the first time).'],
  obsessiveBloodlust: () => ['執迷的血慾', 'Obsessive Bloodlust', '每回合一次：近戰結束後若已不在敵人控制範圍內，可以免費衝鋒最多 2"。', 'Once per TP: after a Fight, if no longer within enemy control range, it can make a free Charge of up to 2".'],
  transfusion: () => ['輸血儀式', 'Transfusion Ritual', '1AP（不在交戰中）：自己血槽 -1，8" 內另一名友方血槽 +1。儀式之刃：每次序列第一次造成傷害時血槽 +1。', '1AP (not engaged): its tank down, another friendly\'s within 8" up. Ritual blade: the first damage it inflicts in a sequence fills its tank.'],
  goreFuel: () => ['血燃', 'Gore-fuel', '1AP（不在交戰中）：血槽 -1，直到用穿肉鉤為止武器「嚴厲」。拖拽：射擊命中時，每顆沒被擋下的成功骰把目標往自己拉 2"（自動拉到最近）。', '1AP (not engaged): tank down; its fleshskewer has Severe until used. Drag: each unblocked success pulls the target 2" towards it (automatically as close as possible).'],
  inciteHunt: () => ['煽動狩獵', 'Incite the Hunt', '從 2" 外使敵人殘廢：那名敵人 8" 內一名友方血槽 +1。雙槍傷到敵人沒殺死：敵人得到流血標記；友方啟動時在 8" 內可以拿走它，血槽 +1。', 'Incapacitating an enemy from more than 2": a friendly within 8" of it fills its tank. Damaging without killing with its pistols: a Bleeding token, taken by a friendly within 8" during its activation to fill its tank.'],
  dashSpray: () => ['衝刺掃射', 'Dash and Spray', '1AP（交戰指令、不在交戰中）：免費衝刺一次，再免費用雙自動手槍（集中）射擊一次，順序不限。', '1AP (Engage, not engaged): a free Dash and a free Shoot with the dual autopistols (focused), in any order.'],
  brutish: () => ['蠻橫', 'Brutish', '受到暴擊傷害時改受普通傷害。', 'Critical Dmg inflicted on it becomes Normal Dmg.'],
  claimSkull: () => ['奪取顱骨', 'Claim Skull', '每回合一次，用巨型鏈鋸斧使敵人殘廢：+1CP。', 'Once per TP, incapacitating an enemy with its great chainaxe: +1CP.'],
  rooftopStalker: () => ['屋頂潛獵者', 'Rooftop Stalker', '（爬升與從高處落下的規則在 2D 版沒有效果）', '(Climbing and dropping from Vantage have no effect in 2D)'],
  mounted: () => ['龍騎兵', 'Draconic Cavalry', '開場在預備區，第一次啟動時沿己方場邊進場（1AP）。不能重新定位／衝刺／衝鋒／撤退，改用「疾馳」（0AP，直線向前 ≤9" 或向後 ≤3"，起點可轉 45°，每回合合計 ≤12"）與「轉向」（1AP，轉 45°）。每回合可啟動兩次，APL 合計最多 4、每次最多 3。疾馳穿過裝備掩體會撞毀它；只被重型地形阻擋。', 'Starts in reserve and enters touching your killzone edge on its first activation (1AP). Can\'t Reposition/Dash/Charge/Fall Back: uses Sprint (0AP, straight forwards ≤9" or backwards ≤3" after pivoting up to 45°, 12" per TP) and Turn (1AP, pivot 45°). Activates twice per TP, 4 APL in total and 3 at most each time. Sprinting through equipment terrain removes it; only Heavy terrain blocks it.'],
  scaleshield: () => ['鱗盾', 'Scaleshield', '沒有暴擊成功時，敵人武器的穿甲降低 1。', 'While the attacker has no critical successes, its weapon\'s Piercing is reduced by 1.'],
  implacable: () => ['不屈獵手', 'Implacable', '使用龍牙時無視重傷的影響。', 'Ignores being injured with its dragon\'s fangs.'],
  songRenewal: () => ['更新之歌', 'Song of Renewal', '靈能，每回合一次，1AP：一名可見的友方回復 2D3 生命，或所有友方各回復 D3（交戰中不能選全體）。', 'Psychic, once per TP, 1AP: a visible friendly regains 2D3 wounds, or every friendly regains D3 (not all while engaged).'],
  drakolithe: () => ['小龍', 'Drakolithe', '只能移動、近戰與撿起；結束時離起點 2" 以上速度 4+，5" 以上 7+。', 'Only moves, fights and picks up; ending more than 2" from where it started = SPEED 4+, more than 5" = 7+.'],
  weavefield: () => ['編織力場紋章', 'Weavefield Crest', '整場一次，無視一顆攻擊骰的普通傷害（自動用在第一次）。', 'Once per battle, ignore one attack die\'s Normal Dmg (used automatically the first time).'],
  brawler: () => ['鬥毆者', 'Brawler', '近戰或反擊時：敵人不能有友軍協助；4 以上的普通傷害 -1；殘廢時可先用一顆未結算的成功骰打對方。', 'Fighting or retaliating: enemies can\'t be assisted; Normal Dmg of 4+ deals 1 less; if incapacitated, strikes with an unresolved success first.'],
  knux: () => ['指虎重擊', 'Knux Smash', '1AP：控制範圍內的敵人受 D3+1 傷害；D3 擲出 3 時對方下次啟動 APL -1。（推開 3" 與免費衝鋒未實作）', '1AP: an enemy in control range takes D3+1; on a 3, -1 APL next activation. (The 3" push and free Charge aren\'t modelled.)'],
  jumpPack: () => ['噴射背包', 'Jump Pack', '移動時可飛越地形與特工，只看落點；墓穴世界的牆、柱與艙門視為無限高，不能飛越（輕掩體仍可）。', 'Moves fly over terrain and operatives; only where it lands matters. Tomb World walls, pillars and hatchways count as infinitely tall and cannot be flown over (its light cover still can).'],
  signalAny: () => ['信號', 'Signal', '1AP（支援）：場上任一名其他友方下次啟動 APL +1。', '1AP (Support): any other friendly gets +1 APL next activation.'],
  jamToken: () => ['系統干擾', 'System Jam', '1AP：一名有效目標的敵人得到干擾標記，要等其他沒有標記的敵人都行動完才能啟動。', '1AP: an enemy valid target gains a token — it can\'t activate until every enemy without one is expended.'],
  tactician: () => ['戰術家', 'Tactician', '策略階段放置攻擊標記（3" 內的敵人：平衡）或防禦標記（3" 內的友方：被射擊重擲一顆防禦骰）。爐心打撈者的智械參謀另有「加速評估」（1AP：把標記移到一名特工處，敵人＝攻擊、友方＝防禦）。', 'Strategy phase: an Attack marker (Balanced against enemies within 3") or a Defence marker (friendlies within 3" re-roll one defence die). The Hearthkyn Kognitâar also has Accelerated Appraisal (1AP: move the marker to an operative — an enemy for Attack, a friendly for Defence).'],
  panScan: () => ['全光譜掃描', 'Pan Spectral Scan', '1AP：在可見敵人處放標記，射擊它 3" 內的敵人時「精準 1」＋「飽和」，直到它下次啟動。', '1AP: a marker by a visible enemy — shooting enemies within 3" of it: Accurate 1 + Saturate, until its next activation.'],
  wellSupplied: () => ['補給充足', 'Well Supplied', '可多選一項裝備，第 1 回合多得 1CP。', 'One more equipment option, and +1CP in the first turning point.'],
  utilityGrenade: () => ['瓦爾-3 多功能手雷', 'Vâyr-3 Utility Grenade', '1AP：在 6" 內一名可見特工處放標記，3" 內撿起標記與任務動作 +1AP；本回合有效，下回合再撐 D3 次啟動。', '1AP: a marker by a visible operative within 6"; Pick Up Marker and mission actions within 3" cost +1AP — this turning point, then D3 more activations.'],
  tacticalAdv: () => ['戰術優勢', 'Tactical Advantage', '整場各一次：先攻擲骰後重擲自己的骰子；以它為指定特工的交戰計謀 0CP（或它待命且沒被纏住時，耐心伏擊 0CP）。', 'Once per battle each: re-roll your initiative die; a firefight ploy for 0CP when it is the specified operative (or Patient Ambush for 0CP while it is ready and free).'],
  commsArray: () => ['通訊陣列', 'Comms Array', '每回合一次：友方啟動中，可免費把本回合用過的一張策略計謀換成另一張。', 'Once per turning point, during a friendly activation: swap a strategy ploy used this turning point for another, free.'],
  phTrack: () => ['追蹤目標', 'Track Target', '任何地圖都能執行「警戒」，隱蔽指令也可以（攻擊時改為交戰指令）。', 'Can Guard in any killzone, even with a Conceal order (it goes Engage when it attacks).'],
  breachwall: () => ['破牆', 'Breachwall', '交戰指令且擋在中間時，底座碰到它的那名友方不能被選為目標（碰到它的友方超過一名時無效）。', 'With an Engage order and intervening, the friendly whose base touches it can\'t be selected as a valid target (no effect if more than one other friendly touches it).'],
  breachPoint: () => ['破口', 'Breach Point', '1AP：在控制範圍內的地形上放破口標記；1" 內厚度 1" 以下的部分可以穿過。', '1AP: a Breach marker on terrain in control range; parts no more than 1" thick within 1" of it can be passed through.'],
  weldShut: () => ['焊死', 'Weld Shut', '1AP：焊死 1" 內一扇關著的艙門，其他人開門要多花 1AP（墓穴世界地圖）。', '1AP: weld a closed hatchway within 1" shut; others pay 1 more AP to open it (Tomb World maps).'],
  remoteControl: () => ['遠端操控', 'Remote Control', '1AP：C.A.T. 偵察車立刻免費執行一個動作（移動不超過 3"）。', '1AP: the C.A.T. Unit performs one free action now (moving no more than 3").'],
  secureSalvage: () => ['確保物資', 'Secure Salvage', '爭奪目標點或己方任務標記時，每次被攻擊有一顆成功的傷害 -1。', 'While it contests an objective or one of your mission markers, one success in each attack against it deals 1 less damage.'],
  gotIt: () => ['交給我', 'I\'ve Got It', '每次啟動一次，任務動作少 1AP。', 'Once per activation, a mission action costs 1 less AP.'],
  watchmaster: () => ['看守長', 'Watchmaster', '策略階段下達衛兵命令（6" 內友方），並可「集火摧毀！」：選一名敵人，本回合攻擊它時武器獲得「懲罰」。', 'Issues Guardsman Orders (friendlies within 6") in the Strategy phase, and Bring it Down!: pick an enemy — Punishing against it this TP.'],
  confidant: () => ['心腹', 'Confidant', '副指揮官：看守長殘廢後改由它下達衛兵命令。指令：啟動時選定 6" 內可見的準備中友方，行動完後可接著啟動其中一名（用過副指揮官後不能再用）。', 'Second in Command: issues Guardsman Orders once the Watchmaster falls. Directive: friendlies visible within 6" and ready when it activates — one may activate right after it (not after Second in Command is used).'],
  bruiser: () => ['打手', 'Bruiser', '每回合一次，近戰或反擊時無視一次普通成功的傷害；在近戰中殘廢時，可先用一顆未結算的成功骰打擊對方。', 'Once per TP when fighting or retaliating, ignores the damage of one normal success; if incapacitated in a fight, strikes with one unresolved success first.'],
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
  // Elucidian Starstriders
  esLeader: () => ['私掠支援', 'Privateer Support', '每個交戰階段一次，她或艦隊員射擊時可改用一種「新曙光號」艦砲（每種整場一次）。', 'Once per Firefight phase, she or a Navis operative can shoot with one of the New Dawn\'s batteries (each once per battle).'],
  digitalLasers: () => ['數位雷射', 'Digital Lasers', '近戰動作擲攻擊骰前，對敵人造成 1 傷害（自動）。', 'Fight action, before the attack dice: 1 damage to the enemy (automatic).'],
  merciless: () => ['無情', 'Merciless', '攻擊已受傷的敵人時武器「平衡」（已有平衡則改為「無休」）。', 'Against an already wounded enemy: Balanced (Ceaseless if it already has Balanced).'],
  ignorePiercing: () => ['干擾力場／迅捷反射', 'Disruption Field / Rapid Reflexes', '被射擊時忽略穿甲。', 'Ignores Piercing when shot.'],
  reputation: () => ['維護名聲', 'Reputation to Maintain', '整場第一次使敵人殘廢時 +1CP。', 'The first time she incapacitates an enemy: +1CP.'],
  voltagheistArray: () => ['電能幽靈陣列', 'Voltagheist Array', '它 4" 內的友方被射擊時可重擲一顆防禦骰。', 'Friendlies within 4" of it re-roll one defence die when shot.'],
  calibrate: () => ['校準電能幽靈', 'Calibrate Voltagheist', '0AP（不在交戰中）：直到下次啟動，充能（電弧手槍「致命 4+」）或力場（在它 4" 內看得到的地方結束移動的敵人受 D6 傷害）。', '0AP (not engaged): until its next activation, Charge (its voltaic pistol has Lethal 4+) or Field (an enemy ending a move visible within 4" takes D6).'],
  esDisciplinarian: () => ['紀律官', 'Disciplinarian', '3" 內的其他艦隊員遠程武器「平衡」（已有平衡則改為「無休」，艦砲除外）。（毫不留情的射擊未實作）', 'Other Navis within 3": ranged Balanced (Ceaseless if they have it; not support assets). (Uncompromising Fire isn\'t modelled.)'],
  navis: () => ['艦隊員', 'Navis', '可以使用私掠支援艦砲。', 'Can use the Privateer Support Assets.'],
  // Chaos Cult
  darkCommune: () => ['黑暗聖會', 'Dark Commune', '被選為目標時，可用「忠實追隨者」讓身邊的信徒代為承受。', 'When targeted, Faithful Follower can make a nearby cultist take the attack.'],
  inciteSlaughter: () => ['煽動', 'Incite', '1AP（支援）：9" 內看得到的另一名友方立刻免費近戰一次（煽動屠殺），或免費衝鋒（最多 3"）／衝刺一次（煽動急進），之後繼續本次啟動。', '1AP (Support): another friendly visible within 9" fights for free (Incite Slaughter), or Charges (up to 3") / Dashes for free (Incite Urgency), then this activation continues.'],
  cutThemDown: () => ['砍倒他們', 'Cut Them Down', '敵人從它的控制範圍撤退前受 D3+1 傷害（在兩名聖刃控制範圍內時 2D3+2）。', 'An enemy falling back from its control range takes D3+1 first (2D3+2 within two of them).'],
  attuned: () => ['同心協力', 'Attuned in Purpose', '啟動後，6" 內另一名準備中的聖刃可以接著啟動。', 'After it activates, another ready Blessed Blade within 6" may activate next.'],
  ruinousIcon: () => ['毀滅聖像', 'Ruinous Icon', '1AP（靈能）：直到它下次啟動，活化（4" 內的友方受到 4 以上的傷害 -1）或衰敗（4" 內的敵人受到的傷害 +1）。', '1AP (Psychic): until its next activation, Invigoration (friendlies within 4": Dmg of 4+ deals 1 less) or Deterioration (enemies within 4": +1 damage).'],
  heinousDeluge: () => ['可憎洪流', 'Heinous Deluge', '1AP（靈能）：可當目標的敵人下次啟動 APL -1。', '1AP (Psychic): an enemy valid target gets -1 APL next activation.'],
  maleficVortex: () => ['惡毒漩渦', 'Malefic Vortex', '1AP（靈能）：把漩渦標記放在看得到的敵人處，2" 內的敵人各受 1 傷害；之後每回合開始時再各受 1 傷害。', '1AP (Psychic): the vortex marker goes by a visible enemy — 1 damage to each enemy within 2", and again at the start of each turning point.'],
  devotee: () => ['信徒', 'Devotee', '群體啟動；在控制範圍內使敵人殘廢時可以變異成突變者。', 'Group Activation; incapacitating an enemy in its control range lets it mutate into a Mutant.'],
  mutant: () => ['突變者', 'Mutant', '有主要受詛恩賜；不能做獨特動作，撿標記與任務動作多 1AP。', 'Has the primary Accursed Gift; no unique actions, +1AP for Pick Up and mission actions.'],
  torment: () => ['折磨者', 'Torment', '有主要與次要受詛恩賜；只能用資料卡上的武器，不能撿標記、做獨特或任務動作。', 'Has the primary and secondary Accursed Gifts; datacard weapons only, no Pick Up, unique or mission actions.'],
  unnaturalRegen: () => ['非自然再生', 'Unnatural Regeneration', '攻擊骰造成 3 以上傷害時擲 D6，5+ 傷害 -1。', 'When an attack die inflicts 3+ damage on it, roll a D6: on a 5+, 1 less.'],
  // Celestian Insidiants
  ciLeader: () => ['神聖榜樣', 'Holy Example', '激勵時，每回合一次以它為對象的交戰計謀 0CP。（未實作）', 'While inspiring, once per TP a firefight ploy for it costs 0CP. (Not modelled.)'],
  spiritualMentor: () => ['靈性導師', 'Spiritual Mentor', '1AP（支援，每回合一次）：6" 內看得到的友方變為激勵。', '1AP (Support, once per TP): a friendly visible within 6" becomes inspiring.'],
  holyDefender: () => ['聖衛', 'Holy Defender', '每回合一次，2" 內看得到的友方被選為射擊或近戰目標時，改由它承受（爆炸、洪流無效；自動）。', 'Once per TP, when a friendly visible within 2" is picked as a Shoot or Fight target, it takes the attack instead (not vs Blast/Torrent; automatic).'],
  controlPlus: () => ['告誡權杖掌旗手', 'Virge Icon Bearer', '爭奪標記時 APL 多算 1。', 'Counts 1 higher APL when controlling markers.'],
  nullField: () => ['虛無力場', 'Null Field', '虛無範圍內（起始 1"，虛無儀式每次 +1"，最多 5"）的敵人 Move -2"、命中變差 1（不與重傷疊加）。1AP 虛無儀式每回合一次。', 'Enemies within its null range (1" to start, +1" per Nullifying Ritual, max 5") have -2" Move and worse Hit (not on top of injured). 1AP Nullifying Ritual once per TP.'],
  pyre: () => ['激勵之火', 'Inspirational Pyre', '每回合一次，手持火焰噴射器傷到敵人但沒使它殘廢時，6" 內一名友方變為激勵。', 'Once per TP, when its hand flamer damages an enemy without incapacitating it, a friendly within 6" becomes inspiring.'],
  speakDeeds: () => ['宣揚她的事蹟', 'Speak of Her Deeds', '1AP（支援）：讓 6" 內一名激勵中的友方不再激勵，另一名 6" 內的友方獲得祝福。', '1AP (Support): an inspiring friendly within 6" stops being inspiring; another friendly within 6" gains a Benediction.'],
  accusingExorcist: () => ['控訴驅魔師', 'Accusing Exorcist', '它激勵時，「懷疑與剷除」0CP。', 'While it\'s inspiring, Suspect & Eliminate costs 0CP.'],
  ultimatum: () => ['熱誠的最後通牒', 'Zealous Ultimatum', '整場一次（策略階段，自動）：向 8" 內的敵人下通牒，擲 D6 4+ 接受。接受：雙方近戰時闊劍 Atk +1，使它殘廢後永久 +1（最多 5）；拒絕：它對修女近戰時 Atk -1。', 'Once per battle (Strategy phase, automatic): an enemy within 8" is issued an ultimatum — a D6 4+ accepts. Accepted: +1 Atk for the broadsword between them, +1 for good after slaying it (max 5); declined: it has -1 Atk fighting the Insidiants.'],
  simulacrum: () => ['虛無擬像掌旗手', 'Simulacrum Icon Bearer', '爭奪標記的敵人中有人在它 3" 內時，敵方 APL 總和 -1。', 'Enemies contesting a marker count 1 lower total APL if one is within 3" of it.'],
  devotion: () => ['奉獻', 'Devotion', '啟動結束時若激勵且控制目標點，6" 內一名友方變為激勵。', 'At the end of its activation, if inspiring and controlling an objective, a friendly within 6" becomes inspiring.'],
  inspiredStrikes: () => ['激勵打擊', 'Inspired Strikes', '激勵時武器暴擊傷害 +1。', 'While inspiring, +1 Critical Dmg.'],
  // Canoptek Circle
  canoptek: () => ['冥工機械', 'Canoptek', '在方尖碑節點矩陣內：武器「精準 1」、APL +1（最多 3）。（全隊特工都適用）', 'Within the Obelisk Node Matrix: Accurate 1 and +1 APL (max 3). (Every friendly gets this.)'],
  ccLeader: () => ['地占術士', 'Geomancer', '在矩陣內同樣獲得精準 1、APL +1（最多 3）。（以節點代替自己做任務動作未實作）', 'Within the matrix it also has Accurate 1 and +1 APL (max 3). (Obelisk Node Control isn\'t modelled.)'],
  geomantic: () => ['地占擾動', 'Geomantic Disturbance', '1AP（非隱蔽、不在交戰中）：8" 內地形上的一點，2" 內每名特工擲 2D6，超過剩餘生命的部分就是傷害（點一名靠近地形的敵人來選點）。', '1AP (not Concealed, not engaged): a point on terrain within 8" — every operative within 2" of it rolls 2D6, the excess over its remaining wounds is damage (tap an enemy near terrain to pick the point).'],
  canoptekControl: () => ['冥工控制', 'Canoptek Control', '1AP（支援，非反擊）：6" 內看得到（或在矩陣內看得到）的冥工機械立刻免費執行一個 1AP 動作（移動不超過 2"），之後繼續本次啟動。', '1AP (Support, not counteracting): a Canoptek visible within 6" (or visible within the matrix) performs a free 1AP action (moving no more than 2"), then this activation continues.'],
  molecularBreach: () => ['分子穿越', 'Molecular Breach', '1AP（支援）：6" 內（或矩陣內）的友方下次移動改為傳送，直接放到移動力（衝刺 3"）範圍內的位置。', '1AP (Support): a friendly within 6" (or within the matrix) teleports on its next move — set up within its Move (3" for a Dash).'],
  overcharge: () => ['超載', 'Overcharge', '1AP：3" 內看得到（或雙方都在矩陣內）的另一名冥工機械下次啟動 APL +1。', '1AP: another Canoptek visible within 3" (or both within the matrix) gets +1 APL next activation.'],
  cranialOverload: () => ['顱腦過載', 'Cranial Overload', '1AP：3" 內看得到（或雙方都在矩陣內）的敵人下次啟動 APL -1。', '1AP: an enemy visible within 3" (or both within the matrix) gets -1 APL next activation.'],
  nanoscarab: () => ['奈米聖甲蟲光束', 'Nanoscarab Beam', '1AP（每回合一次）：6" 內看得到（或雙方都在矩陣內）的友方回復 3D3 生命。', '1AP (once per TP): a friendly visible within 6" (or both within the matrix) regains up to 3D3 wounds.'],
  matrixMedic: () => ['復甦', 'Reanimate', '「醫療兵！」範圍是 6"，或雙方都在矩陣內。', 'Its Medic! reaches 6", or anywhere both are within the matrix.'],
  aggressiveDefence: () => ['侵略性防禦', 'Aggressive Defence', '被 2" 內的敵人打成殘廢時擲 D3，2+ 對該敵人造成等量傷害。', 'Incapacitated by an enemy within 2": roll a D3 — on a 2+, that much damage to it.'],
  expendable: (v, t) => (t?.wkSquig ? ['消耗品', 'Expendable', '不計入對手的擊殺任務，也不算在擊殺任務的開場人數裡。', 'Ignored for the opponent\'s kill op, including the starting number of operatives.'] : ['消耗品', 'Expendable', '不計入對手的擊殺任務。從第 2 回合起，少於 3 隻時每回合在降落區補 1 隻（無盡爬行）。', 'Ignored for the opponent\'s kill op. From the second TP, if fewer than three remain, a new one is set up in your drop zone each TP (A Ceaseless Scuttling).']),
  // Brood Brothers
  bbLeader: () => ['領袖', 'Leader', '有族群聖會特工（巫師、首領或族長）時由它當領袖，指揮官就不是。', 'With a Broodcoven operative (Magus, Primus or Patriarch) it is the Leader instead of the Commander.'],
  coordinate: () => ['協調', 'Coordinate', '策略階段：離我方最近的敵人得到一個交叉火力標記（自動）。', 'Strategy phase: the enemy nearest your operatives gains a Crossfire token (automatic).'],
  devoted: () => ['虔誠', 'Devoted', '每回合一次，近戰或反擊時無視一顆普通成功的傷害。', 'Once per TP when fighting or retaliating, ignore the damage of one normal success.'],
  psiren: () => ['心靈警報器', 'Psiren Caster', '友方攻擊它 6" 內的敵人時，可重擲一顆攻擊骰（自動用在失敗骰）。', 'Friendlies attacking an enemy within 6" of it re-roll one attack die (a fail, automatically).'],
  cultIcon: () => ['教派聖像', 'Cult Icon', '它 4" 內的標記，我方有人爭奪時總 APL +1。（族群奉獻未實作）', 'Markers within 4" of it: +1 to your total APL while a friendly contests them. (Broodmind Devotion isn\'t modelled.)'],
  counterattack: () => ['反擊刀法', 'Counterattack', '近戰或反擊時，對手每結算一顆普通成功，對手受 1 傷害。', 'Fighting or retaliating: each normal success the opponent resolves deals 1 damage to the opponent.'],
  assassin: () => ['刺客', 'Assassin', '隱蔽指令也能衝鋒。（本遊戲規定隱蔽不能衝鋒，此規則不生效）', 'Can Charge with a Conceal order. (This game\'s house rule — Concealed can\'t Charge — overrides it.)'],
  grenadier: () => ['擲彈兵', 'Grenadier', '自帶破片與穿甲手榴彈（命中改善 1，不占用全隊次數，各限用一次）。', 'Its own frag and krak grenades (Hit improved by 1, not from the team\'s uses, once each).'],
  explosives: () => ['爆破', 'Explosives', '1AP（整場兩次，不在交戰中，不能和衝鋒／衝刺／撤退同一次啟動）：第一次放置炸藥標記，第二次引爆，標記 2" 內每名特工受 2D6（中間有重型地形擋住則無）。', '1AP (twice per battle, not engaged, not in an activation with Charge/Dash/Fall Back): first places the marker, then detonates it — 2D6 to every operative within 2" (unless Heavy terrain is in the way).'],
  finalDefiance: () => ['最後的反抗', 'Final Defiance', '殘廢時若已放置炸藥，立刻引爆。', 'If incapacitated with its charge placed, it detonates it.'],
  jam: () => ['干擾', 'Jam', '1AP：一名準備中、可當目標的敵人要等對手再啟動 D6 名特工（或只剩它）才能行動。（花 2AP 選看得到但非有效目標的版本未實作）', '1AP: a ready enemy that\'s a valid target can\'t act until the opponent has activated D6 more operatives (or it\'s the last). (The 2AP visible-only option isn\'t modelled.)'],
  bodyguard: () => ['保鑣', 'Bodyguard', '由它承受攻擊時，「無條件忠誠」只要 0CP。', 'Unquestioning Loyalty costs 0CP when it\'s the one taking the attack.'],
  telepathicOverload: () => ['心靈過載', 'Telepathic Overload', '1AP（靈能）：可當目標的敵人 APL -1，直到它的啟動結束。', '1AP (Psychic): an enemy valid target gets -1 APL until the end of its activation.'],
  mentalOnslaught: () => ['精神衝擊', 'Mental Onslaught', '1AP（靈能）：可當目標的敵人受 2 傷害（6" 內 4），擲 D6 大於它的 APL 就再來，最多 8。', '1AP (Psychic): an enemy valid target takes 2 (4 within 6"); roll a D6 above its APL to repeat, up to 8.'],
  spiritualLeader: () => ['精神領袖', 'Spiritual Leader', '策略階段：本回合友方被射擊時忽略穿甲（自動選這個效果）。', 'Strategy phase: this TP, friendlies ignore Piercing when shot (this option is picked automatically).'],
  fistPatriarch: () => ['族長之拳', 'Fist of the Patriarch', '每次啟動可以射擊兩次或近戰兩次。（謀略大師未實作）', 'Two Shoot or two Fight actions per activation. (Mastermind isn\'t modelled.)'],
  conspire: () => ['密謀', 'Conspire', '1AP（每回合一次，不在交戰中）：獲得 1CP。', '1AP (once per TP, not engaged): +1CP.'],
  alphaPredator: () => ['頂級掠食者', 'Alpha Predator', '被射擊時忽略穿甲；每回合可以啟動兩次（兩次合計最多 4AP、移動最多 9"）。（心靈控制未實作）', 'Ignores Piercing when shot; it can activate twice a TP (4AP and 9" of movement in total). (Mind Control isn\'t modelled.)'],
  intoShadow: () => ['隱入暗影', 'Into Shadow', '1AP（不在交戰中）：改變指令。', '1AP (not engaged): change its order.'],
  // Blades of Khaine
  aspect: (v) => ({ da: ['狂怒復仇者', 'Dire Avenger', '可用狂怒復仇者技法。', 'Can use Dire Avenger Techniques.'], hb: ['嚎叫女妖', 'Howling Banshee', '可用嚎叫女妖技法。', 'Can use Howling Banshee Techniques.'], ss: ['突擊天蠍', 'Striking Scorpion', '可用突擊天蠍技法。', 'Can use Striking Scorpion Techniques.'] }[v]),
  exarch: () => ['督軍', 'Exarch', '每次啟動可以射擊兩次或近戰兩次。', 'It can perform two Shoot or two Fight actions in its activation.'],
  defenceTactics: () => ['防禦戰術', 'Defence Tactics', '爭奪目標點時、或射擊正在爭奪目標點的敵人時，武器「平衡」。', 'While contesting an objective, or shooting an enemy that does, its weapons have Balanced.'],
  bansheeMask: () => ['女妖面具', 'Banshee Mask', '它近戰時，敵人的近戰武器命中值變差 1（不和重傷疊加）。', 'When it fights, the enemy\'s melee Hit is worsened by 1 (not cumulative with being injured).'],
  mandiblasters: () => ['下顎爆能器', 'Mandiblasters', '近戰動作擲攻擊骰前，對敵人造成 2 傷害（自動）。', 'Fight action, before the attack dice: 2 damage to the enemy (automatic).'],
  shimmershield: () => ['微光盾', 'Shimmershield', '選了微光盾的配置時：它 2" 內看得到的友方（含自己）被射擊時忽略穿甲。', 'With the shimmershield option: friendlies visible within 2" of it (itself too) ignore Piercing when shot.'],
  // Battleclade
  servitor: () => ['噪聲網路', 'Noospheric Network', '每次啟動一次，可花 1AP「轉移能量」（APL 要 2 以上）；這次啟動結束後，另一名僕從可以「網路反擊」：先選指令，再免費執行一個 1AP 動作（移動不超過 2"），準備中的僕從之後仍可正常啟動。網路反擊過的僕從本回合不能再反擊。', 'Once per activation, spend 1AP to Transfer Power (APL 2+); after that activation another servitor can Network Counteract: select its order, then one free 1AP action (moving no more than 2"). A ready servitor can still activate later. One that network counteracted can\'t counteract again this TP.'],
  omniscanner: () => ['全知掃描儀', 'Omniscanner', '1AP（不在交戰中）：一名可見或 8" 內的敵人獲得掃描標記；戰鬥支隊對它射擊、近戰或反擊時，武器「無休」。', '1AP (not engaged): an enemy visible or within 8" gains an Omniscanner token; Battleclade weapons have Ceaseless against it.'],
  datacoronal: () => ['數據冠累加器', 'Datacoronal Accumulator', '1AP（支援，不在交戰中）：數一數它或自動代理僕從 6" 內的友方爭奪的目標點數，擲 D3 不大於該數就得 1CP。', '1AP (Support, not engaged): count the objectives contested by friendlies within 6" of it or the Auto-proxy; roll a D3 — equal or less = +1CP.'],
  networkOverride: () => ['網路覆寫', 'Network Override', '1AP（支援，不在交戰中，每次啟動最多兩次、各選不同特工）：它或自動代理僕從 6" 內的一名僕從立刻網路反擊（不用轉移能量），或免費衝刺一次；之後繼續本次啟動。', '1AP (Support, not engaged, twice per activation on different operatives): a servitor within 6" of it or the Auto-proxy network counteracts right away (no Transfer Power needed) or makes a free Dash; then this activation continues.'],
  achillanEye: () => ['阿基蘭之眼', 'Achillan Eye', '友方射擊它看得到的敵人時武器「飽和」（它在敵人控制範圍內時無效）。', 'Friendlies shooting an enemy it can see have Saturate (not while it\'s within an enemy\'s control range).'],
  spotAll: () => ['歐姆尼賽亞的凝視', 'Gaze of the Omnissiah', '它的觀測對全隊有效（不限 3" 內）。', 'Its Spot works for the whole team (not just within 3").'],
  medicNoApl: () => ['機械縫合陣列', 'Mechanosuture Array', '用「醫療兵！」救人時雙方都不會 APL -1。', 'Medic! doesn\'t cost either operative -1 APL.'],
  medikitBig: () => ['快速修復', 'Expedient Repair', '醫療包回復 D3+3 生命。', 'Its Medikit regains D3+3 wounds.'],
};

function abilityList(t) {
  const items = Object.keys(ABILITIES).filter((k) => t[k]).map((k) => {
    const [zh, en, dzh, den] = ABILITIES[k](t[k], t);
    return `<li><b>${L(zh, en)}</b>：${L(dzh, den)}</li>`;
  });
  if (t.ability) items.push(`<li>${esc(tx(t.ability))}</li>`);
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
      <div class="fhead">${who(k)} <small>${esc(bi(fightWeapon(g, k).name))} · ${f[k].hit}+${p.assist ? L(`（友軍協助 +${p.assist}）`, ` (assisted +${p.assist})`) : ''} · ${fightWeapon(g, k).dmg.join('/')}${p.brutal ? ` · ${bi(RULE_LABELS.brutal)}` : ''}</small></div>
      <div class="dicerow ${f.steps.length ? 'still' : ''}"><label>${k === 'A' ? L('攻方擲骰', 'Attacker roll') : L('守方擲骰', 'Defender roll')}</label>${p.dice.map((d, i) => (!readonly && f.rrOpen?.[k] && !d.auto && p.a.balancedLeft
        ? `<button class="diebtn" data-act="fightbal" data-k="${k}" data-i="${i}" ${d.rr ? 'disabled' : ''} title="${L('平衡：免費重擲這顆骰', 'Balanced: re-roll this die for free')}">${die(d, i)}</button>`
        : !readonly && f.rrOpen?.[k] && !d.auto && canCommandReroll(g, ops[k].side, p, 'a')
        ? `<button class="diebtn" data-act="fightrr" data-k="${k}" data-i="${i}" title="${L('指揮重擲這顆骰（1CP）', 'Command Re-roll this die (1CP)')}">${die(d, i)}</button>` : die(d, i))).join('')}${!readonly && f.rrOpen?.[k] && p.a.balancedLeft ? ` <span class="flag mk">⚖ ${L('可平衡：免費重擲一顆', 'Balanced: one free re-roll')}</span>` : ''}</div>
      ${!readonly && f.rrOpen?.[k] && !isAI(ops[k].side) ? rerollRows(p.a, 'fight', k) : ''}
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
      if (s.lastBlow) extra.push(L('殘廢前的最後一擊', 'A last blow before falling'));
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
    const bals = ['A', 'D'].filter((k) => f.rrOpen[k] && f[k].a.balancedLeft).map((k) => nm(ops[k]));
    action = `${bals.length ? `<p class="hint">⚖ ${L(`平衡：${bals.join('、')} 可以免費重擲自己的一顆骰（點該骰子；不用也可以直接開始結算）。用過後再點才是指揮重擲。`, `Balanced: ${bals.join(', ')} can re-roll one of their own dice for free (tap it; or just start resolving). After that, a tap is a Command Re-roll.`)}</p>` : ''}<p class="hint">${L(`指揮重擲：${names} 可花 1CP 重擲自己的一顆骰（點該骰子，每方一次）。`, `Command Re-roll: ${names} may spend 1CP to re-roll one of their own dice (tap it, once per side).`)}</p>
      ${['A', 'D'].filter((k) => f.rrOpen[k]).map((k) => painRerollValues(g, ops[k], f[k], 'a').map((v) => `<button data-act="painfight" data-k="${k}" data-value="${v}">${nm(ops[k])} ${L(`刺激感官：${v}（1 痛苦）`, `Stimulated Senses: ${v} (1 Pain)`)}</button>`).join('')).join('')}
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

/** A weapon's Dmg as printed (Pulsa: none; Detonate: D6+6 / 2D6+6). */
const dmgText = (w) => (w.rules.wkPulsa ? '-' : w.rules.wkDetonate ? 'D6+6/2D6+6' : `${w.dmg[0]}/${w.dmg[1]}`);
function resultView(r, readonly = false) {
  const a = getOp(g, r.attacker), t = getOp(g, r.target);
  const ca = team(g, a.side).color, ct = team(g, t.side).color;
  if (r.kind === 'sfDeclaim') { // an action cancelled: Commanding Declamation (Sanctifier Confessor), Quick Draw (Kroot Pistolier)
    return `<div class="${readonly ? 'noanim' : ''}"><h2>📣 ${r.title ? L(r.title.zh, r.title.en) : L('號令宣告', 'Commanding Declamation')}</h2>
      <p><b style="color:${ca}">${nm(a)}</b> → <b style="color:${ct}">${nm(t)}</b></p>
      <p>${r.text ? L(r.text.zh, r.text.en) : L('這個動作被取消了，AP 不退還。', 'That action was cancelled; the AP is not refunded.')}</p>
      ${readonly ? '' : '<button class="primary wide" data-act="closeresult">' + L('繼續', 'Continue') + '</button>'}</div>`;
  }
  if (r.kind === 'pulsa') { // Pulsa rokkit (Wrecka Krew): the marker's points and the D3 hits
    const hits = r.hits.map((h) => { const o = getOp(g, h.uid); return `<li><b style="color:${team(g, o.side).color}">${nm(o)}</b>：${h.dmg} ${L('傷害', 'damage')}${h.killed ? ' ☠' : ''}</li>`; }).join('');
    return `<div class="${readonly ? 'noanim' : ''}"><h2>⌖ ${esc(bi(r.weapon.name))}</h2>
      <p><b style="color:${ca}">${nm(a)}</b> → <b style="color:${ct}">${nm(t)}</b></p>
      <div class="dicerow"><label>${L('攻擊', 'Attack')}</label>${r.dice.map((d, i) => die(d, i)).join('')}</div>
      <p>${L(`脈衝標記 ${r.pts} 點：${r.pts}" 內的特工 Move -2"、命中 -1（每個準備步驟 -1 點）`, `Pulsa marker with ${r.pts} point(s): operatives within ${r.pts}" get -2" Move and -1 Hit (it loses a point each Ready step)`)}</p>
      <ul>${hits || `<li>${L('沒有特工完全在範圍內', 'No operative wholly within')}</li>`}</ul>
      ${readonly ? '' : '<button class="primary wide" data-act="closeresult">' + L('繼續', 'Continue') + '</button>'}</div>`;
  }
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
  if (s.rules.soulstrike) notes.push(L(`靈魂打擊：防禦骰 ≤ APL ${s.defence.success} 成功，1 為暴擊、6 失敗`, `Soulstrike: defence ≤ APL ${s.defence.success} succeeds; 1 critical, 6 fails`));
  if (s.obscured) notes.push(L('遮擋：暴擊全部變普通，並扣除 1 顆成功', 'Obscured: crits become normal and one success is discarded'));
  if (s.coverOrObscured) notes.push(L(`同一地形提供掩護與遮擋，擇一：使用${s.obscured ? '遮擋' : '掩護'}`, `Same terrain: ${s.obscured ? 'obscured' : 'cover'} chosen`));
  else if (s.inCover && s.obscured) notes.push(L('不同地形提供掩護與遮擋：兩者同時生效', 'Independent cover and obscuring: both apply'));
  if (s.coverSaves) notes.push(L(`掩護：保留 ${s.coverSaves} 顆豁免${crit ? `（${crit} 顆暴擊）` : ''}`, `Cover: ${s.coverSaves} save retained${crit ? ` (${crit} critical)` : ''}`));
  else if (s.saturated) notes.push(L('飽和：無法保留掩護豁免', 'Saturate: no cover saves'));
  if (s.pierce) notes.push(L(`穿甲：少擲 ${s.pierce} 顆`, `Piercing: ${s.pierce} fewer dice`));
  if (s.dev) notes.push(L(`毀滅：暴擊一擲出就先造成 ${s.dev} 傷害（在防禦骰之前）`, `Devastating: ${s.dev} damage dealt as soon as the crits were rolled (before defence dice)`));
  if (s.dev && !s.defDice && s.killed) notes.push(L('目標被毀滅傷害打成殘廢，不用擲防禦骰', 'The Devastating damage incapacitated the target: no defence dice'));
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
    if (g.eqDeploy && !g.eqDeploy.done) {
      if (isAI(g.eqDeploy.turn)) aiTimer = setTimeout(() => { autoPlaceEquipment(g); afterChange(); }, 900);
      return;
    }
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

/** The operative shooting in the current shoot mode (the commanded one for Interstitial Command). */
const shooter = (op) => (ui.mode?.by ? getOp(g, ui.mode.by) : op);
/** Interstitial Command: a human player's commanded operative goes straight to choosing its Shoot. */
function proxyMode() {
  if (!g.proxy || ui.pending || ui.flow || isAI(getOp(g, g.proxy.uid).side)) return;
  const ws = tpl(getOp(g, g.proxy.uid)).weapons.filter((w) => w.type === 'ranged');
  ui.mode = { kind: 'shoot', by: g.proxy.uid, weapon: ws.length === 1 ? ws[0] : null };
}

function afterChange() {
  ui.notice = null;
  if (g.proxy && !ui.mode) proxyMode();
  // Undo only covers the current player's own actions.
  if (g.phase !== 'firefight' || isAI(g.turn) || ui.undo[0]?.turn !== g.turn) ui.undo = [];
  // Auto-end a player activation with no AP left — unless its last action can still be undone.
  const a = activeOp(g);
  if (a && !ui.result && !g.fight && !isAI(g.turn) && ((a.ap <= 0 && !freePending(a) && !ui.undo.length) || a.dead)) { endActivation(g); ui.sel = null; ui.undo = []; }
  if (g.phase === 'strategy' && g.ai === ployChooser(g)) {
    const side = g.ai;
    aiStrategy(g, g.ai);
    if (g.phase === 'strategy' && ployChooser(g) === side) finishPloys(g);
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
  if(g.phase==='strategy' && ['reposition','fallBack'].includes(ui.seeker?.action)){
    const o=getOp(g,ui.seeker.uid),ctx=moveCtx(g,o,ui.seeker.action),p=svgPoint(evt),full=findPath(ctx,p);
    const path=full&&wholeInchPath(ctx,full,moveAllowance(g,o,ui.seeker.action),q=>!ctx.inEnemyER(q));
    const exact=path&&Math.hypot(path.pts.at(-1).x-p.x,path.pts.at(-1).y-p.y)<.05;
    const ok=!!exact&&seekerMoveCheck(g,o,ui.seeker.action,path);
    ui.path=path?{...path,ok,r:radius(o),why:ok?'':L('終點不符合此能力限制，或移動距離不足。','Endpoint violates this ability or exceeds movement.')}:null;
    return render();
  }
  if (g.phase === 'strategy' && ui.dropMode && !isAI(ui.dropMode.side)) { // Tempestus Aquilons: moving a Drop marker
    const side = ui.dropMode.side, p = svgPoint(evt), ms = g.aq.drop[side];
    if (ui.dropMode.idx == null) {
      let bi = -1, bd = 2; ms.forEach((m, i) => { const dd = Math.hypot(m.x - p.x, m.y - p.y); if (dd <= bd && m.movedTP !== g.tp) { bd = dd; bi = i; } });
      if (bi >= 0) { ui.dropMode.idx = bi; ui.notice = L('再點目的地（最多 4"）。', 'Now tap the destination (4" at most).'); }
      return render();
    }
    if (aqMoveDrop(g, side, ui.dropMode.idx, p)) { ui.dropMode.idx = null; if (!aqDropLeft(g, side)) ui.dropMode = null; return afterChange(); }
    ui.notice = L('超過 4" 或不在戰場上。', 'More than 4" away, or off the board.');
    return render();
  }
  if (g.phase === 'strategy' && !isAI(ployChooser(g)) && CHOICES[pendingChoice(g, ployChooser(g))?.id]?.kind === 'move') { // a ploy's free move: the destination
    const s = ployChooser(g), pc = pendingChoice(g, s), c = CHOICES[pc.id], o = moversLeft(g, s, c, pc.ctx).find((x) => x.uid === ui.moveUid);
    if (!o) { ui.notice = L('先在面板選一名特工。', 'Pick an operative in the panel first.'); return render(); }
    const kind = c.moveKind(g, o, pc.ctx), max = c.max(g, o, pc.ctx), ctx = moveCtx(g, o, kind), raw = findPath(ctx, svgPoint(evt));
    const path = raw && freeMovePath(g, o, kind, max, raw.pts), end = path?.pts.at(-1);
    const ok = !!end && (!c.check || c.check(g, s, o, end, pc.ctx));
    ui.path = raw ? { ...(path || raw), ok, r: radius(o), why: ok ? '' : !path ? L(`超過 ${max}"、或終點在敵人控制範圍內／不合法。`, `More than ${max}", or the end is in an enemy's control range / not allowed.`) : L('終點不符合這個計謀的條件。', 'The end point doesn\'t meet this ploy\'s condition.') } : null;
    if (!raw) ui.notice = L('到不了那個位置。', 'It cannot get there.');
    return render();
  }
  if (g.phase === 'strategy' && !isAI(ployChooser(g)) && CHOICES[pendingChoice(g, ployChooser(g))?.id]?.kind === 'point') { // a ploy / gambit pick: a point on the board
    if (!resolveChoice(g, ployChooser(g), svgPoint(evt))) ui.notice = L('這個位置不符合條件。', 'That spot isn\'t allowed.');
    return afterChange();
  }
  if (g.phase === 'strategy' && ui.stormMode && !isAI(ui.stormMode.side)) { // Wolf Scouts: placing the Storm marker
    if (wsPlaceStorm(g, ui.stormMode.side, svgPoint(evt))) ui.stormMode = null; else ui.notice = L('風暴標記要放在戰場上。', 'The Storm marker goes on the board.');
    return afterChange();
  }
  if (g.phase === 'strategy' && ui.pounce && !isAI(ui.pounce.side)) { // Wolf Scouts: the Pounce destination
    const path = wsPouncePath(g, ui.pounce.side, ui.pounce.kind, svgPoint(evt));
    const w = living(g, ui.pounce.side).find((o) => tpl(o).wsWolf);
    const max = w ? moveAllowance(g, w, ui.pounce.kind) : 0, ok = !!path && path.len <= max + 0.01;
    ui.path = path ? { ...path, ok, r: w ? radius(w) : 1, why: ok ? '' : L('超過移動距離，或終點不合法。', 'Too far, or an illegal end point.') } : null;
    return render();
  }
  if (g.phase === 'strategy' && ui.tunnelMode && !isAI(ui.tunnelMode.side)) { // Raveners: placing a Tunnel marker
    if (rvPlaceMarker(g, ui.tunnelMode.side, svgPoint(evt))) ui.tunnelMode = null; else ui.notice = L('標記要在上一個標記 5" 內、戰場內、不在地形上。', 'The marker goes within 5" of the last one, on the board, not on terrain.');
    return afterChange();
  }
  if (g.animating && !isAI(g.animating.side)) { // Animate Obelisk Nodes: tap a node, then where it goes
    const side = g.animating.side, p = svgPoint(evt);
    if (ui.animUid == null) {
      const n = nodeList(g, side).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (n && Math.hypot(n.x - p.x, n.y - p.y) <= 2) { ui.animUid = n.id; ui.notice = L(`再點目的地（還剩 ${g.animating.left}"）。`, `Now tap the destination (${g.animating.left}" left).`); }
      return render();
    }
    if (animateMove(g, side, ui.animUid, p)) { ui.animUid = null; return afterChange(); }
    ui.notice = L('超過剩餘距離或位置不合法。', 'Beyond the distance left, or an illegal spot.');
    return render();
  }
  if (g.phase === 'strategy' && ui.nodeMode && !isAI(ui.nodeMode.side)) { // Canoptek Circle: placing or moving an obelisk node
    const side = ui.nodeMode.side, p = svgPoint(evt);
    if (ui.nodeMode.kind === 'place') {
      if (nodePlace(g, side, p)) { if (!nodesLeftToPlace(g, side)) ui.nodeMode = null; return afterChange(); }
      ui.notice = L('節點要完全放在己方領域內、不能壓在地形或標記上。', 'A node goes wholly within your territory, clear of terrain and markers.');
      return render();
    }
    if (ui.nodeMode.uid == null) {
      const n = nodeList(g, side).filter((m) => m.movedTP !== g.tp).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (n && Math.hypot(n.x - p.x, n.y - p.y) <= 2) { ui.nodeMode.uid = n.id; ui.notice = L('再點目的地（最多 3"）。', 'Now tap the destination (3" at most).'); }
      return render();
    }
    if (nodeMove(g, side, ui.nodeMode.uid, p)) { ui.nodeMode.uid = null; return afterChange(); }
    ui.notice = L('超過 3" 或位置不合法。', 'More than 3", or an illegal spot.');
    return render();
  }
  if (g.phase === 'deploy' && zonePending(g)) return;
  if (g.phase === 'deploy' && g.eqDeploy && !g.eqDeploy.done) {
    if (isAI(g.eqDeploy.turn)) return;
    if (placeEquipment(g, svgPoint(evt), !!ui.eqRotated)) { ui.eqRotated = false; return afterChange(); }
    ui.notice = L('這個位置不符合裝備部署限制，請換位置或使用自動放置。','Illegal equipment position. Choose another position or auto-place.');
    return render();
  }
  ui.peek = null; // (a datacard opened from the lists beside the board closes when the board is used)
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
  // Exodite riders in reserve: a tap on the board picks where along your killzone edge they come in.
  if (op && op.reserve && myTurn && (op.orderSet || op.orderPicked) && op.ap > 0) { undoable(() => enterFromReserve(g, op, p)); return afterChange(); }
  if (op && ui.mode && myTurn) {
    const m = ui.mode;
    if (m.kind === 'move') return previewMove(op, m.action, p);
    if (m.kind === 'wsStorm') { undoable(() => wsCallStormAt(g, op, p)); ui.mode = null; return afterChange(); } // Call the Storm (Wolf Scouts)
    if (m.kind === 'sprint') {
      const c = sprintCheck(g, op, p);
      ui.path = { pts: [{ x: op.x, y: op.y }, p], len: c.inches || Math.hypot(p.x - op.x, p.y - op.y), ok: c.ok, why: c.why ? tx(c.why) : null, r: radius(op) };
      m.dest = p; return render();
    }
    if (m.kind === 'turn') {
      const fa = turnFacing(op, p);
      ui.path = { pts: [{ x: op.x, y: op.y }, { x: op.x + Math.cos(fa) * 3, y: op.y + Math.sin(fa) * 3 }], len: 0, ok: true, r: 0.05 };
      m.dest = p; return render();
    }
    if (clicked && (clicked.side !== op.side || detonating)) {
      // Declare the attack first; the dice are rolled when the player presses "Roll".
      if ((m.kind === 'shoot' && m.weapon && shootCheck(g, shooter(op), clicked, m.weapon).ok)
        || (m.kind === 'fight' && m.weapon && fightTargets(g, op).includes(clicked))) {
        ui.pending = { kind: m.kind, weapon: m.weapon, target: clicked.uid, ai: false, by: m.by || null };
        ui.mode = null; ui.sel = clicked.uid;
        return render();
      }
    }
    if (clicked && m.kind === 'target' && TARGET_ACTIONS[m.action].targets(g, op).includes(clicked)) {
      let complete; undoable(() => { complete = doTargetAction(g, op, m.action, clicked); }); if (complete !== false) ui.mode = null; return afterChange();
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

/** One leg of a move: a straight line if nothing is in the way, otherwise the shortest way around. */
function moveLeg(ctx, from, to) {
  // (a straight line that climbs is only taken when going around isn't cheaper)
  if (ctx.segFree(from, to) && !ctx.climbs?.([from, to])) return { pts: [from, to], len: Math.hypot(to.x - from.x, to.y - from.y) + (ctx.extra?.([from, to]) || 0) };
  return findPath({ ...ctx, op: { ...ctx.op, x: from.x, y: from.y } }, to);
}
/** The route through the player's waypoints (ui.mode.wps), then on to p (or ending at the last waypoint). */
function routeThrough(ctx, op, p) {
  const stops = [...(ui.mode?.wps || []), ...(p ? [p] : [])];
  let pts = [{ x: op.x, y: op.y }], len = 0;
  for (const s of stops) {
    const leg = moveLeg(ctx, pts[pts.length - 1], s);
    if (!leg) return null;
    pts = [...pts, ...leg.pts.slice(1)]; len += leg.len;
  }
  return { pts, len };
}

function previewMove(op, action, p) {
  const ctx = moveCtx(g, op, action);
  const placement = ctx.placement(p);
  if (!placement.ok) {
    const reasons = [placement.outside && L('超出戰場邊界', 'extends beyond the battlefield'), placement.terrain.length && L('與掩體重疊', 'overlaps cover'), placement.operatives.length && L('與其他特工的底盤重疊', 'overlaps another operative’s base')].filter(Boolean);
    ui.mode.dest = p;
    ui.path = { pts: [{ x: op.x, y: op.y }, ...(ui.mode.wps || []), p], len: Math.hypot(p.x - op.x, p.y - op.y), ok: false, r: radius(op), unreachable: true, placement,
      why: L(`${tpl(op).base}mm 底盤${reasons.join('、')}。`, `${tpl(op).base}mm base ${reasons.join(' and ')}.`) };
    return render();
  }
  if (action === 'vsSkytorch') {
    const c = vsSkytorchCheck(g, op, p);
    ui.mode.dest = p;
    ui.path = { pts: [{ x: op.x, y: op.y }, p], len: 0, ok: c.ok, why: c.why ? tx(c.why) : null, r: radius(op) };
    return render();
  }
  if (action === 'aqLand') {
    const c = aqLandCheck(g, op, p);
    ui.mode.dest = p;
    ui.path = { pts: [{ x: p.x, y: p.y }, p], len: 0, ok: c.ok, why: c.why ? tx(c.why) : null, r: radius(op) };
    return render();
  }
  if (action === 'rvBurrow') {
    const c = rvEmergeCheck(g, op, p);
    ui.mode.dest = p;
    ui.path = { pts: [{ x: p.x, y: p.y }, p], len: 0, ok: c.ok, why: c.why ? tx(c.why) : null, r: radius(op) };
    return render();
  }
  if (action === 'kmGrapple') {
    const c = kmGrappleCheck(g, op, p);
    ui.mode.dest = p;
    ui.path = { pts: [{ x: op.x, y: op.y }, p], len: 0, ok: c.ok, why: c.why ? tx(c.why) : null, r: radius(op) };
    return render();
  }
  if (action === 'rtSlingshot') {
    const c = slingshotCheck(g, op, p);
    ui.mode.dest = p;
    ui.path = { pts: [{ x: op.x, y: op.y }, p], len: 0, ok: c.ok, why: c.why ? tx(c.why) : null, r: radius(op) };
    return render();
  }
  if (action === 'mdPass') {
    const c = shadowPassageCheck(g, op, p);
    ui.mode.dest = p;
    ui.path = { pts: [{ x: op.x, y: op.y }, p], len: 0, ok: c.ok, why: c.why ? tx(c.why) : null, r: radius(op) };
    return render();
  }
  const max = moveAllowance(g, op, action);
  const r = radius(op);
  // Molecular Breach (Canoptek Circle): removed and set up again within its Move (3" for a Dash) — no route needed.
  if (op.breachMove) {
    const reach = Math.min(max, action === 'dash' ? 3 : tpl(op).move);
    const snapped = wholeInchPath({ ...ctx, segFree: () => true, extra: () => 0 }, { pts: [{ x: op.x, y: op.y }, p] }, reach, action === 'charge' ? ctx.inEnemyER : (q) => !ctx.inEnemyER(q));
    const len = snapped?.len || Math.ceil(Math.hypot(p.x - op.x, p.y - op.y));
    if (snapped) p = snapped.pts.at(-1);
    const why = !snapped ? L('沒有符合距離與放置條件的落點，請重新選擇', 'No legal endpoint within the movement allowance; choose another location') : len > reach + 0.01 ? L(`距離 ${len}" 超過 ${reach}"`, `${len}" exceeds ${reach}"`)
      : action === 'charge' ? (ctx.inEnemyER(p) ? null : L('衝鋒必須結束於敵人 1" 內', 'Charge must end within 1" of an enemy'))
      : ctx.inEnemyER(p) ? L('不能放在敵人 1" 交戰範圍內', 'Cannot be set up within 1" of an enemy') : null;
    ui.path = { pts: [{ x: op.x, y: op.y }, p], len, ok: !why, why, r, breach: true };
    return render();
  }
  const full = routeThrough(ctx, op, p);
  if (!full) {
    const from = ui.mode?.wps?.at(-1) || { x: op.x, y: op.y };
    ui.path = { pts: [{ x: op.x, y: op.y }, ...(ui.mode?.wps || []), p], len: Math.ceil(Math.hypot(p.x - from.x, p.y - from.y)), ok: false, r, unreachable: true,
      why: L('無法到達（被其他棋子阻擋，或攀爬後會落在敵人控制範圍內）', 'Unreachable (blocked by operatives, or a climb would land within an enemy\'s control range)') };
    return render();
  }
  if (ui.mode) ui.mode.dest = p;
  // Too far: stop at the furthest legal point along the route.
  const endOk = action === 'charge' ? ctx.inEnemyER : (q) => !ctx.inEnemyER(q);
  const snapped = wholeInchPath(ctx, full, max, endOk);
  const path = snapped || { ...full, len: Math.ceil(full.len - 1e-6) };
  const end = path.pts[path.pts.length - 1];
  let why = null;
  if (path.len > max + 0.01) why = L(`距離 ${path.len}" 超過 ${max}"`, `${path.len}" exceeds ${max}"`);
  else if (!snapped) why = L('沒有符合距離與放置條件的落點，請重新選擇', 'No legal endpoint within the movement allowance; choose another location');
  else if (action === 'charge' && !ctx.inEnemyER(end)) why = L(`衝鋒必須結束於敵人 1" 內（需要 ${Math.ceil(full.len)}"）`, `Charge must end within 1" of an enemy (needs ${Math.ceil(full.len)}")`);
  else if (action === 'fallBack' && ctx.inEnemyER(end)) why = L('撤退必須離開交戰範圍', 'Fall Back must end outside engagement range');
  else if (action === 'charge' && op.order === 'conceal' && isMandrake(op) && !withinShadow(g, op) && !withinShadow(g, { ...op, ...end })) why = L('隱蔽衝鋒起點或終點必須在暗影', 'Concealed Charge must start or end in shadow');
  else if (action !== 'charge' && ctx.inEnemyER(end)) why = L('移動結束時不能在敵人 1" 交戰範圍內', 'Cannot end a move within 1" of an enemy');
  ui.path = { ...path, ok: !why, why, r, unreachable: !snapped, climb: ctx.climbs?.(path.pts) || 0 }; // (climb: shown with the distance)
  render();
}

function doActivate(op) {
  if (!op || g.active || !(g.counter ? counterCandidates(g, g.turn) : readyOps(g, g.turn)).includes(op)) return render();
  undoable(() => activate(g, op));
  ui.sel = op.uid; ui.mode = null; ui.path = null; ui.notice = null; ui.pending = null;
  afterChange();
}

// ---------- events ----------
app.addEventListener('toggle', (e) => {
  if (e.target.matches?.('.game-settings')) ui.settingsOpen = e.target.open;
}, true);
function closeSettings() {
  ui.settingsOpen = false;
  const menu = app.querySelector('.game-settings');
  if (menu) menu.open = false;
  return menu;
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.game-settings')) closeSettings();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.settingsOpen) {
    closeSettings()?.querySelector('summary')?.focus();
    e.preventDefault(); e.stopImmediatePropagation();
  }
}, true);
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
// Hovering an operative in the lists beside the board lights it up on the board, and the other way round.
app.addEventListener('pointermove', (e) => {
  const el = e.target.closest('.opchip[data-uid], #board .op[data-uid]');
  const op = g && activeOp(g), target = el && g && getOp(g, el.dataset.uid);
  let tip = document.getElementById('terrain-hover');
  if (ui.screen !== 'game' || !op || !target || target.dead || target.side === op.side || !['shoot', 'fight'].includes(ui.mode?.kind) || e.pointerType === 'touch') { tip?.remove(); return; }
  if (!tip) { tip = document.createElement('div'); tip.id = 'terrain-hover'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
  const near = g.terrain.filter(t => distPointRect(target, t) - radius(target) <= 1 + .001);
  const names = [...new Set(near.map(t => t.kind === 'heavy' ? L('重型地形', 'Heavy terrain') : t.kind === 'wire' ? L('鐵絲網', 'Razor wire') : L('輕型地形', 'Light terrain')))];
  const lines = [];
  if (names.length) lines.push(`${names.join('、')}（${L('底座距地形 1 吋內', 'within 1 inch of base')}）`);
  if (near.some(t => t.kind === 'wire')) lines.push(L('鐵絲網（穿越時額外消耗 1 吋移動距離）', 'Razor wire (crossing costs 1 extra inch of movement)'));
  if (ui.mode.kind === 'fight') {
    lines.push(L('近戰（地形不提供射擊掩護豁免）', 'Fight (terrain grants no shooting cover save)'));
    if (!fightTargets(g, op).includes(target)) lines.push(L('目前不是合法近戰目標', 'Not a valid fight target'));
  } else if (ui.mode.weapon) {
    const attacker = shooter(op), check = shootCheck(g, attacker, target, ui.mode.weapon);
    const v = check.ok ? check : visibility(g, attacker, target);
    const rules = effectiveRules(g, attacker, ui.mode.weapon, target);
    const saturated = rules.saturate && !tpl(target).camoCloak && !tpl(target).weavewerke && !hasPloy(g, target.side, 'rogue') && !tpl(target).cultAgent;
    if (v.cover) lines.push(rules.ignoreCover || saturated
      ? L('掩護（此攻擊忽略地形掩護豁免）', 'Cover (this attack ignores terrain cover saves)')
      : L('掩護（基本效果：可保留 1 顆普通豁免；特殊能力另計）', 'Cover (base effect: may retain 1 normal save; abilities may modify this)'));
    if (v.obscured) lines.push(L('遮蔽（攻擊暴擊變普通成功，再棄掉 1 顆成功骰；武器例外另計）', 'Obscured (attack crits become normal, then discard 1 success; weapon exceptions apply)'));
    if (v.cover && v.obscured && v.defenceOptions?.length && !v.defenceOptions.some(o => o.cover && o.obscured)) lines.push(L('掩護與遮蔽需擇一，不能同時套用', 'Choose cover or obscuring; cannot apply both'));
    if (!v.cover && !v.obscured) lines.push(L('無射擊地形防護（靠近地形不代表這個射擊方向有掩護）', 'No terrain protection for this shot (proximity alone does not grant cover)'));
    if (!check.ok) lines.push(L('目前不是合法射擊目標', 'Not a valid shooting target'));
  }
  tip.innerHTML = `<b>${nm(target)}</b>${lines.map(line => `<div>${esc(line)}</div>`).join('')}`;
  const bounds = tip.getBoundingClientRect();
  tip.style.left = `${Math.max(8, Math.min(e.clientX + 16, innerWidth - bounds.width - 8))}px`;
  tip.style.top = `${Math.max(8, Math.min(e.clientY + 16, innerHeight - bounds.height - 8))}px`;
});
app.addEventListener('pointerleave', () => document.getElementById('terrain-hover')?.remove());
app.addEventListener('mouseover', (e) => {
  const el = e.target.closest('.opchip[data-uid], #board .op[data-uid]');
  const uid = el?.dataset.uid || null;
  for (const x of app.querySelectorAll('.linked')) if (x.dataset.uid !== uid) x.classList.remove('linked');
  if (uid) for (const x of app.querySelectorAll(`.opchip[data-uid="${uid}"], #board .op[data-uid="${uid}"]`)) x.classList.add('linked');
});
modalRoot.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (b) handle(b.dataset.act, b.dataset, e);
});
app.addEventListener('change', (e) => {
  if(e.target.dataset.act==='seekerorder'){ui.seeker={...(ui.seeker||{}),order:e.target.value};return;}
  if (e.target.dataset.act === 'map') { ui.setup.map = e.target.value; return render(); }
  if (e.target.dataset.act === 'terrainRanges') { ui.setup.terrainRanges = e.target.value; try { localStorage.setItem('kt.terrainRanges', e.target.value); } catch { /* optional preference */ } return render(); }
  if (e.target.dataset.act === 'roster') {
    const r = ((ui.setup.roster ||= [{}, {}])[+e.target.dataset.side]), id = e.target.dataset.id;
    if (e.target.dataset.k == null) r[id] = e.target.value;
    else {
      // One pick per copy (Blades of Khaine Aspect Warriors).
      const n = TEAM_MAP[ui.setup.teams[+e.target.dataset.side]].ops.find((o) => o.id === id).count;
      const list = Array.isArray(r[id]) ? r[id] : Array(n).fill(r[id] || id);
      list[+e.target.dataset.k] = e.target.value; r[id] = list;
    }
    return render();
  }
  if (e.target.dataset.act === 'loadout') {
    const side = +e.target.dataset.side;
    ((ui.setup.loadouts ||= [{}, {}])[side])[e.target.dataset.id] = e.target.value;
    const c = ui.setup.loadouts[side];
    if (ui.setup.teams[side] === 'handOfArchon' && c.haLeader === 'blastVenom' && (c.haGunner || 'blaster') === 'blaster' && (c.haHeavy || 'darkLance') === 'darkLance') c.haHeavy = 'cannon';
    return render();
  }
  if (e.target.dataset.act === 'omen') { setOmen(g, +e.target.dataset.side, e.target.value); return afterChange(); }
  if (e.target.dataset.act === 'dwscramble' && g?.phase === 'strategy') {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) dwScramble(g, side, e.target.value);
    return afterChange();
  }
  if (e.target.dataset.act === 'darkness') { const o = activeOp(g); if (o?.darknessTargets?.includes(e.target.value) && !o.orderSet) o.acted.darknessTarget = e.target.value; return afterChange(); }
  if (e.target.dataset.act === 'ai') { ui.setup.ai = e.target.checked ? 1 : null; render(); }
  if (e.target.dataset.act === 'vscommune') { (ui.setup.vsCommune ||= [null, null])[+e.target.dataset.side] = e.target.value; render(); }
  if (e.target.dataset.act === 'aicustom') { ui.setup.aiCustom = e.target.checked; render(); }
  if (e.target.dataset.act === 'autoff') { ui.setup.autoFF = e.target.checked; try { localStorage.setItem('ktAutoFF', e.target.checked ? '1' : ''); } catch {} render(); }
  if (e.target.dataset.act === 'mission') { ui.setup.mission = e.target.value; render(); }
  if (e.target.dataset.act === 'tacop') { (ui.setup.tacOps ||= [null, null])[+e.target.dataset.side] = e.target.value; render(); }
  if ((e.target.dataset.act === 'claimobj' || e.target.dataset.act === 'claimkind') && g?.phase === 'strategy') {
    const side = +e.target.dataset.side;
    const obj = document.querySelector(`select[data-act="claimobj"][data-side="${side}"]`)?.value;
    const kind = document.querySelector(`select[data-act="claimkind"][data-side="${side}"]`)?.value || 'control';
    if (side === ployChooser(g) && !isAI(side) && obj !== '' && obj != null) { setClaim(g, side, +obj, kind); afterChange(); }
  }
  if (e.target.dataset.act === 'reboot' && g?.phase === 'strategy' && e.target.value !== '') {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) { setReboot(g, side, +e.target.value); render(); } // (secret: no log line until both are revealed)
  }
  if (e.target.dataset.act === 'sforator' && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) { sfChooseOrator(g, side, +e.target.value); afterChange(); }
    return;
  }
  if (e.target.dataset.act === 'rtdesignate' && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) { rtDesignate(g, side, +e.target.value); afterChange(); }
    return;
  }
  if ((e.target.dataset.act === 'sctactical' || e.target.dataset.act === 'scdiversion') && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) { (e.target.dataset.act === 'sctactical' ? scTactical : scDiversion)(g, side, e.target.value); afterChange(); }
  }
  if (e.target.dataset.act === 'envoy' && g?.phase === 'strategy' && e.target.value) {
    const side = +e.target.dataset.side;
    if (side === ployChooser(g) && !isAI(side)) { setEnvoy(g, side, getOp(g, e.target.value)); afterChange(); }
  }
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
  if ((e.target.dataset.act === 'doctrina' || e.target.dataset.act === 'nodep') && g?.phase === 'strategy') {
    const side = +e.target.dataset.side;
    const mode = document.querySelector(`select[data-act="doctrina"][data-side="${side}"]`)?.value;
    const nodep = !!document.querySelector(`input[data-act="nodep"][data-side="${side}"]`)?.checked;
    if (side === ployChooser(g) && !isAI(side) && mode) { setDoctrina(g, side, mode, nodep); afterChange(); }
  }
  if (e.target.dataset.act === 'skill' && g?.phase === 'strategy') {
    const side = +e.target.dataset.side;
    const ids = [...document.querySelectorAll(`select[data-act="skill"][data-side="${side}"]`)].map((s) => s.value).filter(Boolean);
    if (side === ployChooser(g) && !isAI(side)) { setSkills(g, side, ids); afterChange(); }
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
  if (e.target.dataset.act === 'teamSearch') { // filter the team list in place (re-rendering would drop the cursor)
    const side = +e.target.dataset.side, q = e.target.value.trim().toLowerCase();
    (ui.setup.search ||= ['', ''])[side] = e.target.value;
    for (const b of e.target.closest('.pick').querySelectorAll('.teampick')) b.style.display = !q || b.dataset.search.includes(q) ? '' : 'none';
    return;
  }
  if (e.target.dataset.act === 'rseek') { stopReplayPlay(); ui.replay.i = +e.target.value; render(); document.querySelector('.rseek')?.focus(); }
});
document.addEventListener('keydown', (e) => {
  if (ui.screen !== 'replay' || e.target.matches?.('input')) return;
  if (e.key === 'ArrowLeft') { stopReplayPlay(); replayGo(ui.replay.i - 1); }
  if (e.key === 'ArrowRight') { stopReplayPlay(); replayGo(ui.replay.i + 1); }
});

function handle(act, d) {
  if (['home', 'help', 'lang', 'replay', 'models'].includes(act)) closeSettings();
  const op = g && activeOp(g);
  switch (act) {
    case 'home': history.replaceState(null, '', location.pathname + location.search); ui.screen = 'home'; return render();
    case 'tombworld': location.hash = 'tombworld'; ui.screen = 'tombworld'; return render();
    case 'models': if (ui.screen !== 'models') ui.modelsFrom = ui.screen; location.hash = 'models'; ui.screen = 'models'; return render();
    case 'modelsBack': history.replaceState(null, '', location.pathname + location.search); ui.screen = ui.modelsFrom || 'home'; return render();
    case 'twplay': ui.setup.map = d.id; ui.setup.mission = 'secure'; ui.setup.step = 'mission'; ui.screen = 'setup'; return render();
    case 'twstate': {
      const states = (ui.tombWorldStates ||= {});
      states[d.id] = d.id === 'A1' ? states[d.id] === 'breached' ? 'intact' : 'breached' : states[d.id] === 'open' ? 'closed' : 'open';
      return render();
    }
    case 'help': ui.help = true; return render();
    case 'closehelp': ui.help = false; return render();
    case 'lang': setLang(getLang() === 'zh' ? 'en' : 'zh'); return render();
    case 'setup': ui.screen = 'setup'; ui.setup.step = 'mission'; return render();
    case 'setupStep': ui.setup.step = d.step; window.scrollTo(0, 0); return render();
    case 'pickMap': ui.setup.map = d.id; return render();
    case 'pick': (ui.setup.roster ||= [{}, {}])[+d.side] = {}; (ui.setup.loadouts ||= [{}, {}])[+d.side] = {}; ui.setup.teams[+d.side] = d.team; (ui.setup.equip ||= [[], []])[+d.side] = cleanEquipment(d.team, ui.setup.equip[+d.side]); ui.setup.tactics[+d.side] = null; return render();
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
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'murderwing' && murderwingRosterError(TEAM_MAP.murderwing, ui.setup.roster?.[side], ui.setup.loadouts?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'wreckaKrew' && wreckaRosterError(TEAM_MAP.wreckaKrew, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'nemesisClaw' && nightlordsRosterError(TEAM_MAP.nemesisClaw, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'scoutSquad' && scoutsRosterError(TEAM_MAP.scoutSquad, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'ratlings' && ratlingsRosterError(TEAM_MAP.ratlings, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'sanctifiers' && sanctifiersRosterError(TEAM_MAP.sanctifiers, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'wolfScouts' && wolfRosterError(TEAM_MAP.wolfScouts, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'stealthSuits' && stealthRosterError(TEAM_MAP.stealthSuits, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'vespids' && vespidsRosterError(TEAM_MAP.vespids, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'voidDancers' && voidDancersRosterError(TEAM_MAP.voidDancers, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'aquilons' && aquilonsRosterError(TEAM_MAP.aquilons, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'spectres' && spectresRosterError(TEAM_MAP.spectres, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'raveners' && ravenersRosterError(TEAM_MAP.raveners, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'tauPathfinders' && pathfindersRosterError(TEAM_MAP.tauPathfinders, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'angels' && angelsRosterError(TEAM_MAP.angels, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'plagueMarines' && plagueRosterError(TEAM_MAP.plagueMarines, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'kommandos' && kommandosRosterError(TEAM_MAP.kommandos, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'farstalkers' && kinbandRosterError(TEAM_MAP.farstalkers, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'deathKorps' && deathKorpsRosterError(TEAM_MAP.deathKorps, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'deathwatch' && deathwatchRosterError(TEAM_MAP.deathwatch, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'hearthkyn' && hearthkynRosterError(TEAM_MAP.hearthkyn, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'navyBreachers' && navyRosterError(TEAM_MAP.navyBreachers, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'phobos' && phobosRosterError(TEAM_MAP.phobos, ui.setup.roster?.[side])) { ui.setup.step = 'units'; return render(); }
      clearSave();
      resetRecorder();
      g = newGame({ vsCommune: ui.setup.vsCommune || [], roster: ui.setup.roster || [], loadouts: ui.setup.loadouts || [], teams: [...ui.setup.teams], ai: ui.setup.ai, mission: ui.setup.mission, map: ui.setup.map, equip: [0, 1].map((s) => (s === 1 && ui.setup.ai === 1 ? undefined : ui.setup.equip?.[s] || [])), tacOps: [0, 1].map((s) => (tacOpsFor(ui.setup.teams[s]).includes(ui.setup.tacOps?.[s]) ? ui.setup.tacOps[s] : s === 1 && ui.setup.ai === 1 ? null : tacOpsFor(ui.setup.teams[s])[0])), tactics: [0, 1].map((s) => (TEAM_MAP[ui.setup.teams[s]].tactics ? setupTactics(s) : null)), scouting: [0, 1].map((s) => (s === 1 && ui.setup.ai === 1 ? undefined : ui.setup.scouting?.[s])), ratFree: [0, 1].map((s) => (s === 1 && ui.setup.ai === 1 ? undefined : ui.setup.ratFree?.[s])), dkFree: [0, 1].map((s) => (s === 1 && ui.setup.ai === 1 ? undefined : ui.setup.dkFree?.[s])) }); // (Scout Squad: Forward Scouting; the computer takes its usual six)
      // Players make their own picks for ploys and gambits (targets, markers, points); the computer picks for itself.
      g.pick = [0, 1].map((s) => s !== g.ai);
      // Automatic firefight ploys start switched off for players (unless the setup option says otherwise); the computer keeps its own.
      if (!ui.setup.autoFF) for (const side of [0, 1]) if (side !== g.ai) { const off = ((g.ffOff ||= [[], []])[side] ||= []); for (const p of autoPloys(team(g, side))) if (!off.includes(p.id)) off.push(p.id); const aoff = ((g.abOff ||= [[], []])[side] ||= []); for (const a of autoAbilitiesFor(g, side)) if (!a.ploy && !aoff.includes(a.id)) aoff.push(a.id); }
      ui.screen = 'game'; ui.sel = null; ui.mode = null; ui.path = null; ui.result = null; ui.pending = null; ui.flow = null; ui.undo = []; ui.endDismissed = false; ui.turnKey = null; ui.turnBanner = null;
      return afterChange();
    case 'depsel': ui.sel = d.uid; return render();
    case 'wsstorm': ui.stormMode = ui.stormMode?.side === +d.side ? null : { side: +d.side }; return render();
    case 'wsstormauto': wsPlaceStorm(g, +d.side, wsBestStorm(g, +d.side)); ui.stormMode = null; return afterChange();
    case 'wspounce': ui.pounce = { side: +d.side, kind: d.kind }; ui.path = null; return render();
    case 'wspounceok': if (ui.pounce && ui.path?.ok) wsPounce(g, ui.pounce.side, ui.pounce.kind, ui.path); ui.pounce = null; ui.path = null; return afterChange();
    case 'wspouncex': ui.pounce = null; ui.path = null; return render();
    case 'initguile': if (!isAI(+d.side) && wsGuileOk(g, +d.side)) { wsUseGuile(g, +d.side); aiInitCards(g); } return afterChange();
    case 'xvdrone': xvDrone(g, +d.side, document.getElementById('xvDroneSel')?.value); return afterChange();
    case 'xvjam': xvJammers(g, +d.side); return afterChange();
    case 'vdchoose': vdChoose(g, +d.side, d.al, document.getElementById('vdPivot')?.value); return afterChange();
    case 'vdgrant': vdGrantGambit(g, +d.side, document.getElementById('vdGrant')?.value); return afterChange();
    case 'vdlead': vdLead(g, +d.side); return afterChange();
    case 'depabove': aqSetAbove(g, g.dep.turn); return afterChange();
    case 'dropmode': ui.dropMode = ui.dropMode?.side === +d.side ? null : { side: +d.side, idx: null }; return render();
    case 'dropauto': aqAutoDrop(g, +d.side); ui.dropMode = null; return afterChange();
    case 'aqrapid': aqRapid(g, +d.side); return afterChange();
    case 'initoverseer': if (!isAI(+d.side) && aqOverseerOk(g, +d.side)) { aqUseOverseer(g, +d.side); aiInitCards(g); } return afterChange();
    case 'depunder': { const o = ui.sel && getOp(g, ui.sel); if (o && rvGoUnderground(g, o)) ui.sel = null; return afterChange(); }
    case 'tunnelmode': ui.tunnelMode = ui.tunnelMode?.side === +d.side ? null : { side: +d.side }; return render();
    case 'tunnelauto': rvAutoMarker(g, +d.side); ui.tunnelMode = null; return afterChange();
    case 'rvlink': rvLink(g, +d.side); return afterChange();
    case 'primaryop': choosePrimary(g, +d.side, d.id); return afterChange();
    case 'nodemode': ui.nodeMode = ui.nodeMode?.side === +d.side && ui.nodeMode.kind === d.m ? null : { side: +d.side, kind: d.m, uid: null }; return render();
    case 'nodeauto': placeNodes(g, +d.side); ui.nodeMode = null; return afterChange();
    case 'nodesdone': nodesDone(g, +d.side); ui.nodeMode = null; return afterChange();
    case 'dkfree': {
      const s = +d.side, n = dkFreeCount(TEAM_MAP.deathKorps, ui.setup.roster?.[s] || {}), cur = cleanDkFree(ui.setup.dkFree?.[s] ?? DEFAULT_DK_FREE, n);
      const i = cur.indexOf(d.id);
      if (i >= 0) cur.splice(i, 1); else if (cur.length < n) cur.push(d.id);
      (ui.setup.dkFree ||= [undefined, undefined])[s] = cur;
      return render();
    }
    case 'dkgambit': if (+d.side === ployChooser(g) && !isAI(+d.side)) { dkGambit(g, +d.side, d.id); } return afterChange();
    case 'ratfree': {
      const s = +d.side, n = ratFreeCount(TEAM_MAP.ratlings, ui.setup.roster?.[s]), cur = cleanRatFree(ui.setup.ratFree?.[s] ?? DEFAULT_RAT_FREE, n);
      const i = cur.indexOf(d.id);
      if (i >= 0) cur.splice(i, 1); else if (cur.length < n) cur.push(d.id);
      (ui.setup.ratFree ||= [undefined, undefined])[s] = cur;
      return render();
    }
    case 'scoutopt': {
      const s = +d.side, cur = cleanScouting(ui.setup.scouting?.[s] ?? DEFAULT_SCOUTING);
      for (const side of [0, 1]) if (ui.setup.teams[side] === 'warpcoven' && warpcovenRosterError(TEAM_MAP.warpcoven, ui.setup.roster?.[side], ui.setup.loadouts?.[side])) { ui.setup.step = 'units'; return render(); }
      if (+d.d > 0) cur.push(d.id); else { const i = cur.lastIndexOf(d.id); if (i >= 0) cur.splice(i, 1); }
      (ui.setup.scouting ||= [undefined, undefined])[s] = cleanScouting(cur);
      return render();
    }
    case 'equip': {
      const s = +d.side, cur = ((ui.setup.equip ||= [[], []])[s] ||= []);
      const i = cur.indexOf(d.id);
      if (i >= 0) cur.splice(i, 1); else if (cur.length < equipmentLimitFor(ui.setup.teams[s]) && equipmentOptionsFor(ui.setup.teams[s]).includes(d.id)) cur.push(d.id);
      return render();
    }
    case 'depauto': autoDeployStep(g); return afterChange();
    case 'depdone': finishDeployStep(g); ui.sel = null; return afterChange();
    case 'begin': ui.sel = null; startBattle(g); return afterChange();
    case 'ploy': {
      const s = +d.side;
      buyPloy(g, s, team(g, s).ploys.find((p) => p.id === d.ploy));
      return afterChange();
    }
    case 'strategy': startStrategy(g); return afterChange();
    case 'initcard': {
      // A human player's initiative card; then the computer may answer with its own.
      if (isAI(+d.side) || !useInitCard(g, +d.side, d.id, d.die == null ? +d.side : +d.die, +(d.sign || 1))) return render();
      aiInitCards(g);
      return afterChange();
    }
    case 'initsenses': if (!isAI(+d.side) && rvSensesOk(g, +d.side)) { rvUseSenses(g, +d.side); aiInitCards(g); } return afterChange();
    case 'initwrit': if (!isAI(+d.side) && hkWritOk(g, +d.side)) { hkUseWrit(g, +d.side); aiInitCards(g); } return afterChange(); // Writ of Claim (Hearthkyn)
    case 'inittac': if (!isAI(+d.side) && phTacInitOk(g, +d.side)) { phTacInit(g, +d.side); aiInitCards(g); } return afterChange(); // Tactical Advantage (Phobos)
    case 'phcomms': undoable(() => phCommsChoose(g, op.side, document.getElementById('phCommsNew').value, document.getElementById('phCommsOld').value)); return afterChange(); // Comms Array (Phobos)
    case 'patientskip': skipArchonActivation(g, g.turn, 'patientAmbush'); return afterChange(); // Patient Ambush (Phobos)
    case 'initlock': if (g.phase === 'initiative') lockInitRoll(g); return afterChange();
    case 'initpick': if (g.phase === 'initiative' && g.initiative == null && !isAI(g.initDecider)) setInitiative(g, +d.side); return afterChange();
    case 'seeker': {
      const o=living(g,ployChooser(g)).find(o=>tpl(o).omniscanner);if(!o||isAI(o.side))return;
      const order=ui.seeker?.order||o.order;
      ui.seeker={uid:o.uid,order,action:d.id};ui.path=null;
      if(!d.id || !['omniscanner','reposition','fallBack'].includes(d.id)){useSeeker(g,o,order,d.id||null);ui.seeker=null;return afterChange();}
      return render();
    }
    case 'seekertarget': if(ui.seeker){useSeeker(g,getOp(g,ui.seeker.uid),ui.seeker.order,'omniscanner',getOp(g,d.uid));ui.seeker=null;} return afterChange();
    case 'seekerconfirm': if(ui.seeker && ui.path?.ok){useSeeker(g,getOp(g,ui.seeker.uid),ui.seeker.order,ui.seeker.action,null,ui.path);ui.seeker=null;ui.path=null;} return afterChange();
    case 'seekercancel': ui.seeker=null;ui.path=null;return render();
    case 'ployspass': ui.seeker=null;ui.path=null; if (g.phase === 'strategy' && g.ai !== ployChooser(g)) finishPloys(g); return afterChange();
    case 'eqrotate': ui.eqRotated = !ui.eqRotated; return render();
    case 'zone': if (zonePending(g)) chooseDropZone(g, g.zonePick.side, d.swap === '1'); return afterChange();
    case 'eqauto': if (g.eqDeploy && !g.eqDeploy.done && !isAI(g.eqDeploy.turn)) autoPlaceEquipment(g); return afterChange();
    case 'pickop': { const o = getOp(g, d.uid); if (!trySelectOwn(o)) { ui.sel = d.uid; render(); } return undefined; }
    case 'activate': return doActivate(getOp(g, d.uid));
    case 'closeinspect': if (ui.peek) ui.peek = null; else ui.sel = null; return render();
    case 'peek': ui.peek = ui.peek === d.uid ? null : d.uid; return render(); // operative lists beside the board: show / hide its datacard
    case 'mstart': measure.mode = true; measure.pts = []; measure.cursor = null; return drawMeasure();
    case 'mundo': measure.pts.pop(); return drawMeasure();
    case 'mclear': measure.pts = []; return drawMeasure();
    case 'mend': measure.mode = false; measure.pts = []; measure.cursor = null; return drawMeasure();
    case 'astart': angle.mode = true; angle.pts = []; angle.cursor = null; measure.pts = []; measure.cursor = null; return drawMeasure();
    case 'aundo': angle.pts.pop(); angle.cursor = null; return drawMeasure();
    case 'aclear': angle.pts = []; angle.cursor = null; return drawMeasure();
    case 'aend': angle.mode = false; angle.pts = []; angle.cursor = null; return drawMeasure();
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
    case 'painuse': usePain(g, op, d.id); return afterChange();
    case 'sang': undoable(() => useSang(g, op, d.id)); return afterChange(); // Goremongers
    case 'bleed': undoable(() => useBleed(g, op, bleedTargets(g, op)[0])); return afterChange();
    case 'favour': undoable(() => useFavour(g, op)); return afterChange();
    case 'resource': undoable(() => useResource(g, op, d.id)); return afterChange(); // Hernkyn Yaegirs
    case 'sppatience': spPatience(g, g.turn); return afterChange();
    case 'spstarshell': spStarshell(g, +d.side); return afterChange();
    case 'painskip': skipArchonActivation(g, g.turn); return afterChange();
    case 'bribe': if (!isAI(g.turn)) undoable(() => bribeSkip(g, g.turn)); return afterChange();
    case 'foreboding': if (!isAI(g.turn)) undoable(() => ncForeboding(g, g.turn)); return afterChange();
    case 'painreroll': { const s = ui.flow?.step; if (s) { const which = s.stage === 'attack' ? 'a' : 'd'; archonReroll(g, getOp(g, which === 'a' ? s.seq.op : s.seq.target), s.seq, which, +d.value); } return render(); }
    case 'painfight': archonFightReroll(g, d.k, +d.value); return render();
    case 'ceaseless': { if (d.where === 'fight') fightCeaseless(g, d.k, +d.v); else { const s = ui.flow?.step; if (s) ceaselessReroll(g, s.seq, s.stage === 'attack' ? 'a' : 'd', +d.v); } ui.relSel = []; return render(); }
    case 'relpick': { const i = +d.i; ui.relSel = (ui.relSel || []).includes(i) ? ui.relSel.filter((x) => x !== i) : [...(ui.relSel || []), i]; return render(); }
    case 'relgo': { if (d.where === 'fight') fightRelentless(g, d.k, ui.relSel || []); else { const s = ui.flow?.step; if (s) relentlessReroll(g, s.seq, s.stage === 'attack' ? 'a' : 'd', ui.relSel || []); } ui.relSel = []; return render(); }
    case 'digin': { const s = ui.flow?.step; if (s) digInReroll(g, s.seq, s.stage === 'attack' ? 'a' : 'd', +d.v); return render(); }
    case 'voiddie': { const s = ui.flow?.step; if (s) voidReroll(g, s.seq, s.stage === 'attack' ? 'a' : 'd', +d.i); return render(); }
    case 'balancedie': { const s = ui.flow?.step; if (s) balancedReroll(g, s.seq, s.stage === 'attack' ? 'a' : 'd', +d.i); return render(); }
    case 'fightbal': fightBalanced(g, d.k, +d.i); return render();
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
      ui.relSel = [];
      if (p.kind === 'shoot') { ui.flow = { it: shootFlow(g, p.by ? getOp(g, p.by) : op, p.weapon, t), step: null }; return advanceFlow(); }
      startFight(g, op, p.weapon, t);
      return afterChange();
    }
    case 'unroll': ui.pending = null; ffClearPending(g); proxyMode(); return render();
    case 'animate': undoable(() => animateBegin(g, g.turn)); ui.animUid = null; return afterChange();
    case 'animateend': undoable(() => animateEnd(g, g.animating.side)); ui.animUid = null; return afterChange();
    case 'nodal': undoable(() => nodalChoose(g, op.side, document.getElementById('nodalNew').value, document.getElementById('nodalOld').value || null)); return afterChange();
    case 'adheroicdoc': undoable(() => adHeroicDoc(g, op.side, d.id)); return afterChange();
    case 'ffuse': undoable(() => useFFButton(g, op, d.id)); return afterChange();
    case 'fftoggle': { const o = getOp(g, d.uid); if (o && !isAI(o.side)) ffToggle(g, o, d.id, getOp(g, d.target)); return render(); }
    case 'choicepick': { const s = g.phase === 'firefight' && activeOp(g) ? activeOp(g).side : ployChooser(g), p = pendingChoice(g, s); if (p && !isAI(s)) { const o = CHOICES[p.id].options(g, s, p.ctx)[+d.i]; if (o) resolveChoice(g, s, o.value); } return afterChange(); }
    case 'pickauto': { const s = g.phase === 'firefight' && activeOp(g) ? activeOp(g).side : ployChooser(g); if (!isAI(s)) resolveChoice(g, s, 'auto'); return afterChange(); }
    case 'pickskip': { const s = g.phase === 'firefight' && activeOp(g) ? activeOp(g).side : ployChooser(g); if (!isAI(s)) resolveChoice(g, s, null); ui.moveUid = null; ui.path = null; return afterChange(); }
    case 'pickmover': ui.moveUid = d.uid; ui.path = null; return render();
    case 'pickmove': { const s = ployChooser(g); if (!isAI(s) && ui.path?.ok && resolveChoice(g, s, { uid: ui.moveUid, pts: ui.path.pts })) { ui.moveUid = null; ui.path = null; } return afterChange(); }
    case 'abarm': if (!isAI(+d.side)) abilityToggle(g, +d.side, d.id); return render();
    case 'ffarmall': if (!isAI(+d.side)) for (const p of autoPloys(team(g, +d.side))) if (ffArmed(g, +d.side, p.id) !== (d.on === '1')) ffToggleArm(g, +d.side, p.id); return render();
    case 'ffarm': if (!isAI(+d.side)) ffToggleArm(g, +d.side, d.id); return render(); // take back a declared (not yet rolled) attack
    case 'action': {
      if (['reposition', 'dash', 'charge', 'fallBack', 'mdPass', 'rtSlingshot', 'kmGrapple'].includes(d.id) || (d.id === 'rvBurrow' && op.underground) || d.id === 'aqLand' || d.id === 'vsSkytorch') ui.mode = { kind: 'move', action: d.id };
      else if (d.id === 'edSprint') ui.mode = { kind: 'sprint' }; // Exodite riders
      else if (d.id === 'edTurn') ui.mode = { kind: 'turn' };
      else if (d.id === 'wsCallMove') ui.mode = { kind: 'wsStorm' }; // Call the Storm: tap where the Storm marker goes
      else if (d.id === 'shoot' || d.id === 'fight') {
        const type = d.id === 'shoot' ? 'ranged' : 'melee';
        const ws = weaponsFor(g, op).filter((w) => w.type === type);
        ui.mode = { kind: d.id, weapon: ws.length === 1 ? ws[0] : null };
      } else if (TARGET_ACTIONS[d.id]) ui.mode = { kind: 'target', action: d.id };
      else if (d.id === 'optics') { undoable(() => doOptics(g, op)); return afterChange(); }
      else if (d.id === 'flail') { undoable(() => doFlail(g, op)); return afterChange(); }
      else if (d.id === 'dakkaDash') { undoable(() => doDakkaDash(g, op)); return afterChange(); }
      else if (d.id.startsWith('dw') || d.id.startsWith('mdSoul') || d.id.startsWith('mw') || d.id === 'wkBreak' || d.id === 'ncPremonition' || d.id === 'ncPoison' || d.id.startsWith('sf') || d.id === 'pfAccel' || d.id === 'kmBreach' || d.id === 'rvBurrow' || d.id === 'rvDistend' || d.id === 'aqExpend' || d.id === 'vsGuidance' || d.id === 'xvPlaceBeacon' || d.id.startsWith('ws') || d.id === 'mvBarricade' || d.id === 'kfGather' || d.id === 'dkPlaceMine' || d.id === 'dkDetonate' || d.id.startsWith('wc')) { undoable(() => doSelfAction(g, op, d.id)); return afterChange(); }
      else if (['pistolBarrage', 'blinkToggle', 'energise', 'longSight', 'stealthAttack', 'boost', 'auspexScan', 'guerrilla', 'shieldingUp', 'actuation', 'gongKnell', 'mantle', 'sweepingBlow', 'mdVision', 'reanimate', 'reanimateSure', 'ammoResupply', 'meltaMine', 'grislyMark', 'unleashDaemon', 'transferPower', 'datacoronal', 'explosives', 'conspire', 'intoShadow', 'nullifyingRitual', 'ruinousInvig', 'ruinousDeter', 'calibCharge', 'calibField'].includes(d.id)) { undoable(() => doSelfAction(g, op, d.id)); return afterChange(); }
      else if (d.id === 'pickUp') { undoable(() => doPickUp(g, op)); return afterChange(); }
      else if (missionActionsFor(g, op.side).includes(d.id)) { undoable(() => doMissionAction(g, op, d.id)); return afterChange(); }
      ui.path = null;
      return render();
    }
    case 'weapon': {
      const sh = shooter(op), w = weaponsFor(g, sh)[+d.i];
      if (w.type === 'ranged' && !shootWeapon(g, sh, w).ok) return undefined;
      ui.mode.weapon = w; return render();
    }
    case 'cancel': if (op) op.warpFirst = null; if (ui.mode?.by) endProxy(g); ffClearPending(g); ui.mode = null; ui.path = null; return render(); // (forfeits an Interstitial Command Shoot)
    case 'confirmsprint': {
      const p = ui.mode?.dest;
      if (p && ui.path?.ok) undoable(() => doSprint(g, op, p));
      ui.mode = null; ui.path = null; return afterChange();
    }
    case 'confirmturn': {
      const p = ui.mode?.dest;
      if (p) undoable(() => doTurn(g, op, p));
      ui.mode = null; ui.path = null; return afterChange();
    }
    case 'addwp': {
      // Pin the current destination as a corner of the route (it must be reachable within the move).
      const m = ui.mode;
      if (m?.kind !== 'move' || !m.dest || !ui.path || ui.path.unreachable || (ui.path.exactLen ?? ui.path.len) >= moveAllowance(g, op, m.action) - 0.05) return render();
      m.wps = [...(m.wps || []), ui.path.pts.at(-1)]; m.dest = null; // (where the route really gets to)
      ui.path = { ...routeThrough(moveCtx(g, op, m.action), op, null), ok: false, r: radius(op), why: L('再點下一段的位置', 'Tap where the next leg goes') };
      return render();
    }
    case 'popwp': {
      const m = ui.mode;
      if (m?.kind !== 'move' || !m.wps?.length) return render();
      m.wps = m.wps.slice(0, -1); m.dest = null;
      ui.path = m.wps.length ? { ...routeThrough(moveCtx(g, op, m.action), op, null), ok: false, r: radius(op), why: L('再點下一段的位置', 'Tap where the next leg goes') } : null;
      return render();
    }
    case 'confirmmove':
      if (ui.path?.ok) { const { action } = ui.mode, path = ui.path; undoable(() => action === 'mdPass' ? doShadowPassage(g, op, path.pts.at(-1)) : action === 'rtSlingshot' ? doSlingshot(g, op, path.pts.at(-1)) : action === 'kmGrapple' ? kmDoGrapple(g, op, path.pts.at(-1)) : action === 'rvBurrow' ? rvDoEmerge(g, op, path.pts.at(-1)) : action === 'aqLand' ? aqDoLand(g, op, path.pts.at(-1)) : action === 'vsSkytorch' ? vsDoSkytorch(g, op, path.pts.at(-1)) : doMove(g, op, action, path)); }
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
if (location.hash === '#tombworld') ui.screen = 'tombworld';
if (location.hash === '#models') ui.screen = 'models';
// The browser's Back/Forward buttons move between the home screen and the Tomb World / 3D model pages.
window.addEventListener('hashchange', () => {
  const screen = location.hash === '#tombworld' ? 'tombworld' : location.hash === '#models' ? 'models' : ui.screen === 'models' ? ui.modelsFrom || 'home' : ui.screen === 'tombworld' ? 'home' : null;
  if (screen && screen !== ui.screen) { if (screen === 'models') ui.modelsFrom = ui.screen; ui.screen = screen; render(); }
});
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
