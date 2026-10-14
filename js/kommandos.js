// Kommandos (歐克蠻人) rules engine for the parts added after the first version: the Grot's Grappling Hook, the Breacha Boy's Breach,
// Sssshhhh!, Krump 'Em!, Kunnin' But Brutal, the Smoke Grenade (Taktical Wot-notz) and the faction equipment.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load.)
import { CHOICES, needChoice, ACTIONS, TARGET_ACTIONS, BOARD, autoFF, availableActions, bestMelee, d6, edgeDist, engagedEnemies, foes, hasPloy, isEngaged, living, log, opName, radius, resolveFight, spend, team, tpl, visibility } from './game.js';
import { dist, distPointRect } from './geometry.js';
import { flatSight } from './sight.js';
import { moveCtx } from './path.js';
import { bestStep, stepTo } from './sanctifiers.js';
import { checkMines } from './game.js';
import { scTrapCheck } from './scouts.js';
import { kommandosRosterError } from './data/kommandos.js';

export function isKM(o) { return o?.team === 'kommandos'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }

export function kmSetup(g, roster) {
  g.kmSmoke = [0, 0];
  for (const side of [0, 1]) if (g.teams[side] === 'kommandos') {
    const error = kommandosRosterError(team(g, side), roster[side]);
    if (error) throw new Error(error.en);
  }
}
/** The Ready step: the Harpoon is available again. */
export function kmReady(g) {
  for (const s of [0, 1]) if (g.teams[s] === 'kommandos' && equip(g, s, 'kmHarpoon') && g.eqUses?.[s]) g.eqUses[s].harpoon = 1;
}

// ---------- equipment weapons ----------
const DYNAMITE = { id: 'eqDynamite', name: { zh: '炸藥捆', en: 'Dynamite' }, type: 'ranged', atk: 5, hit: 4, dmg: [4, 5], rules: { range: 4, blast: 1, heavy: 'reposition', saturate: true, equipGrenade: 'dynamite', noMarkerlight: true }, group: 'eqDynamite' };
const HARPOON = { id: 'eqHarpoon', name: { zh: '魚叉', en: 'Harpoon' }, type: 'ranged', atk: 4, hit: 4, dmg: [4, 5], rules: { range: 8, lethal: 5, stun: true, equipGrenade: 'harpoon', noMarkerlight: true }, group: 'eqHarpoon' };
const CHOPPA = { id: 'eqChoppa', name: { zh: '劈砍刀', en: 'Choppa' }, type: 'melee', atk: 3, hit: 3, dmg: [4, 5], rules: {}, group: 'eqChoppa' };
/** Choppas, Collapsible Stocks, Dynamite and the Harpoon (equipment). */
export function kmWeapons(g, op, ws) {
  if (!isKM(op) || tpl(op).kmSmall || tpl(op).actionsOnly) return ws;
  let out = ws;
  if (equip(g, op.side, 'kmStocks')) out = out.map((w) => (['slugga', 'shokkaPistol'].includes(w.id) ? { ...w, rules: Object.fromEntries(Object.entries(w.rules).filter(([k]) => k !== 'range')) } : w));
  if (equip(g, op.side, 'kmChoppas') && !out.some((w) => w.type === 'melee' && w.name.en === 'Choppa' && w.atk >= 3)) out = [...out, CHOPPA];
  if (equip(g, op.side, 'kmDynamite') && g.eqUses?.[op.side]?.dynamite > 0) out = [...out, DYNAMITE];
  if (equip(g, op.side, 'kmHarpoon') && g.eqUses?.[op.side]?.harpoon > 0) out = [...out, HARPOON];
  return out;
}

// ---------- strategy ploy: Sssshhhh! ----------
export function kmPloyBought(g, side, ploy) {
  if (ploy.id !== 'sssshhhh') return;
  if (g.tp === 1) { note(g, side, '噓——！：第 1 回合不能用', 'Sssshhhh!: not in the first turning point'); return; }
  needChoice(g, side, 'sssshhhh');
}
const shhMovers = (g, side) => living(g, side).filter((o) => isKM(o) && !isEngaged(g, o) && o.x > -50 && (!foes(g, o).some((e) => visibility(g, e, o).visible) || (o.order === 'conceal' && !foes(g, o).some((e) => edgeDist(o, e) <= 6))));
/** The player's free Dashes for Sssshhhh!. */
export function kmChoices() {
  CHOICES.sssshhhh = {
    kind: 'move', title: { zh: '噓——！：沒被敵人看到（或隱蔽且 6" 內沒有敵人）的歐克可以免費衝刺', en: 'Sssshhhh!: an Ork not visible to enemies (or Concealed with no enemy within 6") can make a free Dash' },
    movers: shhMovers, moveKind: () => 'dash', max: () => 3, autoAll: (g, side) => shhAuto(g, side, { id: 'sssshhhh' }),
  };
}
function shhAuto(g, side, ploy) {
  if (ploy.id !== 'sssshhhh') return;
  if (g.tp === 1) { note(g, side, '噓——！：第 1 回合不能用', 'Sssshhhh!: not in the first turning point'); return; }
  for (const o of living(g, side).filter((x) => isKM(x) && !isEngaged(g, x))) {
    const hidden = !foes(g, o).some((e) => visibility(g, e, o).visible);
    const quiet = o.order === 'conceal' && !foes(g, o).some((e) => edgeDist(o, e) <= 6);
    if (!hidden && !quiet) continue;
    const goal = [...(g.objectives || [])].sort((a, b) => dist(o, a) - dist(o, b))[0] || { x: BOARD.w / 2, y: BOARD.h / 2 };
    const q = bestStep(g, o, 3, 'dash', (p) => dist(o, goal) - dist(p, goal));
    if (q) { stepTo(g, o, q); note(g, side, `噓——！：${opName(o, 'zh')} 免費衝刺`, `Sssshhhh!: ${opName(o, 'en')} makes a free Dash`); }
  }
}

// ---------- Krump 'Em! and Kunnin' But Brutal (firefight ploys) ----------
/** At the end of the Firefight phase: one friendly Kommando with an enemy in control range makes a free Fight. */
export function kmEndFirefight(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'kommandos') {
    const cand = living(g, side).filter((o) => isKM(o) && engagedEnemies(g, o).length).sort((a, b) => b.wounds - a.wounds)[0];
    if (!cand || !autoFF(g, side, 'krumpEm')) continue;
    const t = engagedEnemies(g, cand).sort((a, b) => a.wounds - b.wounds)[0], w = bestMelee(cand);
    note(g, side, `開扁！：${opName(cand, 'zh')} 免費近戰 ${opName(t, 'zh')}`, `Krump 'Em!: ${opName(cand, 'en')} makes a free Fight against ${opName(t, 'en')}`);
    const keep = { ap: cand.ap, acted: cand.acted };
    cand.ap = 1; cand.acted = { ...cand.acted, free: { fight: t.uid } };
    g.seekerFree = cand.uid;
    try { resolveFight(g, cand, w, t); } finally { g.seekerFree = null; }
    cand.ap = keep.ap; cand.acted = keep.acted;
  }
}
/** The first strike of a Concealed Kommando's Charge fight, with a normal success: it counts as a critical success. */
export function kmKunnin(g, f, k, me, op) {
  if (k !== 'A' || !isKM(op) || op.side > 1 || op.order !== 'conceal' || !(op.acted?.charge > 0) || f.steps.length || !me.n) return false;
  return autoFF(g, op.side, 'kunnin');
}

// ---------- actions: Breach, Grappling Hook, Smoke Grenade ----------
const nearTerrain = (g, op) => g.terrain.filter((t) => (t.kind === 'heavy' || t.kind === 'light') && distPointRect(op, t) - radius(op) <= 1.01);
export function kmActions(g, op, add) {
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' };
  // Breaching Charge (universal equipment): once per battle any friendly can Breach.
  const charge = op.side < 2 && g.equip?.[op.side]?.includes('breachingCharge') && !g.eqUses?.[op.side]?.breachCharge;
  if (charge && !tpl(op).kmBreacha) add('kmBreach', !eng && nearTerrain(g, op).length > 0 && !op.acted.kmBreach, eng ? ENG : { zh: '控制範圍內沒有地形', en: 'No terrain in control range' });
  if (!isKM(op)) return;
  if (tpl(op).kmBreacha) add('kmBreach', !eng && nearTerrain(g, op).length > 0 && !op.acted.kmBreach, eng ? ENG : { zh: '控制範圍內沒有地形', en: 'No terrain in control range' });
  if (tpl(op).kmGrapple) {
    const blocked = op.acted.kmGrapple || op.acted.reposition || op.acted.charge || op.acted.fallBack;
    add('kmGrapple', !eng && !blocked, eng ? ENG : { zh: '同一次啟動不能和衝鋒、撤退、重新定位並用', en: 'Not with Charge, Fall Back or Reposition' });
  }
  if (tpl(op).wotNotz) add('kmSmoke', !eng && g.kmSmoke?.[op.side] !== g.tp, eng ? ENG : { zh: '本回合已用過', en: 'Already used this turning point' });
}
export function kmSelf(g, op, id) {
  if (id !== 'kmBreach') return false;
  const t = nearTerrain(g, op).sort((a, b) => distPointRect(op, a) - distPointRect(op, b))[0];
  if (!t) return true;
  spend(g, op, id);
  op.acted.kmBreach = 1;
  if (!tpl(op).kmBreacha) (g.eqUses[op.side] ||= {}).breachCharge = 1; // Breaching Charge used
  const p = { x: Math.max(t.x, Math.min(t.x + t.w, op.x)), y: Math.max(t.y, Math.min(t.y + t.h, op.y)) };
  (g.markers ||= []).push({ id: g.markers.length, kind: 'breach', owner: op.side, x: p.x, y: p.y, rect: { x: t.x, y: t.y, w: t.w, h: t.h }, carriedBy: null });
  note(g, op.side, `${opName(op, 'zh')} 破門：在地形上放破口標記（1" 內厚度 1" 以下的部分可以穿過）`, `${opName(op, 'en')} Breach: a Breach marker on the terrain (parts no more than 1" thick can be crossed within 1")`);
  return true;
}
function clampTo(r, p) { return { x: Math.max(r.x, Math.min(r.x + r.w, p.x)), y: Math.max(r.y, Math.min(r.y + r.h, p.y)) }; }
/** Grappling Hook: a terrain point visible to the Grot; it is set up within 1" of that point, which it can see from there. */
export function kmGrappleCheck(g, op, p) {
  const a = availableActions(g, op).find((x) => x.id === 'kmGrapple');
  if (!a?.ok) return { ok: false, why: a?.why || { zh: '目前不能使用鉤爪', en: 'Grappling Hook unavailable' } };
  const ctx = moveCtx(g, op, 'reposition');
  if (!ctx.free(p)) return { ok: false, why: { zh: '底盤放不下', en: 'The base doesn\'t fit there' } };
  if (ctx.inEnemyER(p)) return { ok: false, why: { zh: '不能在敵人控制範圍內', en: 'Not within an enemy\'s control range' } };
  const r0 = radius(op);
  for (const t of g.terrain.filter((x) => x.kind === 'heavy' || x.kind === 'light')) {
    const others = g.terrain.filter((x) => x !== t), c = clampTo(t, p);
    if (dist(p, c) - r0 > 1.01) continue;
    if (flatSight(others, op, c, r0, 0, {}).visible && flatSight(others, { ...op, x: p.x, y: p.y }, c, r0, 0, {}).visible) return { ok: true, point: c };
  }
  return { ok: false, why: { zh: '落點要在一個看得到的地形點 1" 內，並看得到那一點', en: 'The destination must be within 1" of a terrain point visible to it, and see that point' } };
}
export function kmDoGrapple(g, op, p) {
  const c = kmGrappleCheck(g, op, p);
  if (!c.ok) return false;
  const from = { x: op.x, y: op.y };
  spend(g, op, 'reposition', 1); // treated as a Reposition action
  op.acted.kmGrapple = 1;
  op.acted.movedDist = (op.acted.movedDist || 0) + dist(from, p);
  Object.assign(op, { x: p.x, y: p.y });
  for (const m of g.markers || []) if (m.carriedBy === op.uid) { m.x = p.x; m.y = p.y; }
  note(g, op.side, `${opName(op, 'zh')} 用鉤爪飛到新位置`, `${opName(op, 'en')} grapples to a new position`);
  checkMines(g, op);
  scTrapCheck(g, op);
  return true;
}
/** The computer: a grapple towards an uncontrolled objective (when it isn't in range of one already). */
export function kmGrappleAI(g, op) {
  const goal = [...(g.objectives || [])].sort((a, b) => dist(op, a) - dist(op, b))[0];
  if (!goal || dist(op, goal) < 4) return null;
  let best = null;
  for (const t of g.terrain.filter((x) => x.kind === 'heavy' || x.kind === 'light')) {
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const c = clampTo(t, goal), p = { x: c.x + dx * (radius(op) + 0.6), y: c.y + dy * (radius(op) + 0.6) };
      const gain = dist(op, goal) - dist(p, goal);
      if (gain > 3 && (!best || gain > best.gain) && kmGrappleCheck(g, op, p).ok) best = { p, gain };
    }
  }
  return best?.p || null;
}
export function registerKommandoActions() {
  ACTIONS.kmBreach = { ap: 1, name: { zh: '破門', en: 'Breach' } };
  ACTIONS.kmGrapple = { ap: 1, name: { zh: '鉤爪', en: 'Grappling Hook' } };
  ACTIONS.kmSmoke = { ap: 1, name: { zh: '煙霧彈（戰術小玩意）', en: 'Smoke Grenade (Taktical Wot-notz)' } };
  TARGET_ACTIONS.kmSmoke = {
    targets: (g, o) => (g.kmSmoke?.[o.side] === g.tp ? [] : g.ops.filter((t) => !t.dead && t.x > -50 && edgeDist(o, t) <= 6.01 && (t === o || visibility(g, o, t).visible))),
    apply(g, o, t) {
      g.kmSmoke[o.side] = g.tp;
      (g.smoke ||= []).push({ x: t.x, y: t.y, side: o.side, tp: g.tp, left: null });
      return { zh: `煙霧彈：在 ${opName(t, 'zh')} 處放出煙霧`, en: `Smoke Grenade: smoke on ${opName(t, 'en')}` };
    },
  };
  void d6; void hasPloy;
}
