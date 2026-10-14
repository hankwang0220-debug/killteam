// Plague Marines (瘟疫戰士) rules engine for the parts added after the first version: Cloud of Flies, Nurglings, Curse of Rot, the
// Warrior and the faction equipment. (Careful: game.js and this module import each other, so nothing here may use a top-level const
// while the modules load.)
import { CHOICES, needChoice, getOp, applyDamage, autoFF, changeApl, d3, edgeDist, foes, living, log, opName, radius, team, tpl } from './game.js';
import { dist } from './geometry.js';
import { plagueRosterError } from './data/plague.js';

export function isPM(o) { return o?.team === 'plagueMarines'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }

export function pmSetup(g, roster) {
  for (const side of [0, 1]) if (g.teams[side] === 'plagueMarines') {
    const error = plagueRosterError(team(g, side), roster[side]);
    if (error) throw new Error(error.en);
  }
}

// ---------- equipment ----------
/** Plague Rounds: boltguns and bolt pistols have Poison and Severe. */
export function pmRules(g, op, weapon, target, r) {
  if (isPM(op) && equip(g, op.side, 'pmRounds') && ['boltgunPM', 'boltgunW', 'boltPistolPM'].includes(weapon.id)) { r.poison = true; r.severe = true; }
}
/** Plague Bells: injured stat changes are ignored. */
export function pmBells(g, op) { return isPM(op) && equip(g, op.side, 'pmBells'); }
/** Poison Vents: an enemy activated within 3" of a friendly Plague Marine may be poisoned; a poisoned one takes D3 instead of 1. */
export function pmVents(g, op) {
  if (op.side > 1 || !foes(g, op).some((e) => isPM(e) && equip(g, e.side, 'pmVents') && edgeDist(e, op) <= 3.01)) return { gained: false, dmg: 1 };
  if (!op.poison) {
    const r = d3();
    if (r === 3) { op.poison = true; note(g, 1 - op.side, `毒氣噴口：${opName(op, 'zh')} 中毒`, `Poison Vents: ${opName(op, 'en')} is poisoned`); return { gained: true, dmg: 1 }; }
    return { gained: false, dmg: 1 };
  }
  return { gained: false, dmg: d3() };
}
/** Blight Grenades: a team-limited grenade (twice a battle) for every Plague Marine. */
export const BLIGHT = { id: 'eqBlight', name: { zh: '枯萎手雷', en: 'Blight grenade' }, type: 'ranged', atk: 4, hit: 4, dmg: [2, 4], rules: { range: 6, blast: 2, saturate: true, severe: true, poison: true, equipGrenade: 'blight', noMarkerlight: true }, group: 'eqBlight' };
export function pmWeapons(g, op, ws) {
  if (!isPM(op) || tpl(op).actionsOnly || !equip(g, op.side, 'pmBlight') || !(g.eqUses?.[op.side]?.blight > 0)) return ws;
  return [...ws, BLIGHT];
}

// ---------- strategy ploys ----------
export function pmPloyBought(g, side, ploy) {
  if (ploy.id === 'cloudFlies') needChoice(g, side, 'cloudFlies');
  if (ploy.id === 'nurglings') needChoice(g, side, 'nurglings');
}
const nurglingTargets = (g, side) => { const pms = living(g, side).filter((o) => isPM(o)); return foes(g, { side }).filter((e) => e.side < 2 && e.x > -50 && pms.some((p) => edgeDist(p, e) <= 3.01 || (e.poison && edgeDist(p, e) <= 7.01))); };
/** The players' picks: Cloud of Flies (the friendly it goes on), Nurglings (an enemy). */
export function pmChoices() {
  const B = (zh, en) => ({ zh, en });
  CHOICES.cloudFlies = {
    kind: 'op', title: B('蒼蠅雲：選一名友方瘟疫戰士（標記放在它身上）', 'Cloud of Flies: pick a friendly Plague Marine (the marker goes on it)'),
    options: (g, side) => living(g, side).filter((o) => isPM(o) && o.x > -50).map((o) => ({ value: o.uid })),
    auto: (g, side) => { const enemies = foes(g, { side }); return living(g, side).filter((o) => isPM(o)).sort((a, b) => Math.min(99, ...enemies.map((e) => edgeDist(a, e))) - Math.min(99, ...enemies.map((e) => edgeDist(b, e))))[0]?.uid ?? null; },
    apply: (g, side, uid) => fliesOn(g, side, getOp(g, uid)),
  };
  CHOICES.nurglings = {
    kind: 'op', title: B('寧古蘭：選一名敵人（友方 3" 內，或 7" 內且有你的中毒標記）', 'Nurglings: pick an enemy (within 3" of a friendly, or 7" if poisoned)'),
    options: (g, side) => nurglingTargets(g, side).map((e) => ({ value: e.uid })),
    auto: (g, side) => nurglingTargets(g, side).sort((a, b) => tpl(b).apl - tpl(a).apl || b.wounds - a.wounds)[0]?.uid ?? null,
    none: (g, side) => note(g, side, '寧古蘭：沒有符合條件的敵人', 'Nurglings: no eligible enemy'),
    apply(g, side, uid) { const t = getOp(g, uid); changeApl(g, t, -1); note(g, side, `寧古蘭：${opName(t, 'zh')} 到下次啟動結束 APL -1`, `Nurglings: ${opName(t, 'en')} gets -1 APL until the end of its next activation`); },
  };
}
function fliesOn(g, side, best) {
  {
    if (!best) return;
    (g.markers ||= []).push({ id: g.markers.length, kind: 'flies', owner: side, x: best.x, y: best.y, tp: g.tp, carriedBy: null });
    note(g, side, `蒼蠅雲：標記放在 ${opName(best, 'zh')} 身上`, `Cloud of Flies: the marker goes on ${opName(best, 'en')}`);
  }
}
/** The Ready step: the Cloud of Flies markers from the last turning point are removed. */
export function pmReady(g) { g.markers = (g.markers || []).filter((m) => m.kind !== 'flies'); }
/** Cloud of Flies: a Plague Marine wholly within 1" of the marker, shot from more than 3" away from it, is obscured. */
export function pmCloud(g, shooter, target) {
  if (!isPM(target) || target.side > 1) return false;
  return (g.markers || []).some((m) => m.kind === 'flies' && m.owner === target.side && dist(target, m) + radius(target) <= 1.01 && dist(shooter, m) > 3);
}

// ---------- Curse of Rot (firefight ploy) ----------
/** A friendly Plague Marine shoots or fights an enemy within 3" (7" if poisoned): each 3 the enemy rolls hurts it and can't be kept. */
export function pmCurse(g, pm, enemy, pool, retally) {
  if (!isPM(pm) || pm.side > 1 || !pool || enemy.dead) return;
  const threes = pool.dice.filter((d) => !d.auto && d.v === 3);
  if (!threes.length || edgeDist(pm, enemy) > (enemy.poison ? 7 : 3) + 0.01) return;
  if (!autoFF(g, pm.side, 'curseOfRot')) return;
  for (const d of threes) d.locked = true; // (can't be re-rolled)
  const strip = (p) => { for (const d of p.dice) if (d.locked && d.res !== 'miss') { if (d.res === 'crit') p.crits--; else if (d.res === 'norm') p.norms--; d.res = 'miss'; } };
  const prev = pool.post;
  pool.post = prev ? (p) => { prev(p); strip(p); } : strip;
  retally(pool);
  note(g, pm.side, `腐朽詛咒：${opName(enemy, 'zh')} 擲出 ${threes.length} 個 3，受到 ${threes.length} 傷害`, `Curse of Rot: ${opName(enemy, 'en')} rolled ${threes.length} three(s) and takes ${threes.length} damage`);
  applyDamage(g, pm, enemy, threes.length);
}
