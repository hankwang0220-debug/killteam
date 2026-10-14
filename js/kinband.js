// Farstalker Kinband (遠獵者) rules engine for the parts added after the first version: Gather, Quick Draw, Ready for Anything, Poach,
// Bound and the faction equipment (Meat, Trophy, Piercing Shot, Toxin Shot).
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load.)
import { abilityArmed, ACTIONS, d3, isEngaged, log, opName, shootCheck, spend, forcedShot, team, tpl } from './game.js';
import { kinbandRosterError } from './data/kinband.js';

export function isKF(o) { return o?.team === 'farstalkers'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }

export function kfSetup(g, roster) {
  g.kfUsed = [{}, {}];
  for (const side of [0, 1]) if (g.teams[side] === 'farstalkers') {
    const error = kinbandRosterError(team(g, side), roster[side]);
    if (error) throw new Error(error.en);
  }
}

// ---------- Poach and Gather: Pick Up Marker and mission actions only need the marker contested ----------
export function kfActions(g, op, add) {
  if (!isKF(op) || !tpl(op).kfHound) return;
  const eng = isEngaged(g, op);
  add('kfGather', !eng && !op.acted.kfGather, eng ? { zh: '處於交戰中', en: 'Engaged' } : { zh: '已用過', en: 'Already used' });
}
export function kfSelf(g, op, id) {
  if (id !== 'kfGather') return false;
  spend(g, op, id);
  op.acted.kfGather = 1;
  op.acted.free = { ...(op.acted.free || {}), dash: true }; // a free Dash (any remaining distance can be used after the free marker action)
  op.kfPoach = true; // a free Pick Up Marker or Place Marker, with the marker only contested
  note(g, op.side, `${opName(op, 'zh')} 採集：可以免費衝刺，途中免費撿起或放置標記`, `${opName(op, 'en')} Gather: a free Dash with a free Pick Up Marker or Place Marker`);
  return true;
}
export function registerKinbandActions() { ACTIONS.kfGather = { ap: 1, name: { zh: '採集', en: 'Gather' } }; }
/** A Gathering Hound's Pick Up Marker costs nothing. */
export const kfGatherFree = (op, id) => id === 'pickUp' && !!op.acted?.kfGather;

// ---------- Quick Draw (Pistolier) ----------
/** An enemy shoots a ready Pistolier: it interrupts with a free Shoot (dual pistols, focused) at that enemy, once per TP. True if the shooter fell. */
export function kfQuickDraw(g, shooter, target) {
  if (!isKF(target) || !tpl(target).quickDraw || target.dead || !target.ready || target.side > 1 || shooter.side === target.side || g.kfUsed?.[target.side]?.quickDraw === g.tp) return false;
  const w = tpl(target).weapons.find((x) => x.id === 'pistolsFocused');
  if (!w) return false;
  const was = target.order;
  const keep = { ap: target.ap, acted: target.acted };
  target.order = 'engage'; target.ap = 1; target.acted = {}; // (as if it could shoot: only the check needs the AP)
  const ok = shootCheck(g, target, shooter, w).ok;
  target.ap = keep.ap; target.acted = keep.acted;
  if (!ok) { target.order = was; return false; }
  g.kfUsed[target.side].quickDraw = g.tp;
  note(g, target.side, `快拔：${opName(target, 'zh')} 搶先對 ${opName(shooter, 'zh')} 開火`, `Quick Draw: ${opName(target, 'en')} shoots ${opName(shooter, 'en')} first`);
  forcedShot(g, target, w, [shooter], true);
  return shooter.dead;
}

// ---------- equipment: Meat, Trophy, Piercing Shot, Toxin Shot ----------
/** Ready for Anything (Warrior): once per TP an extra use of Meat, Piercing Shot or Toxin Shot for a Warrior. */
function mayUse(g, op, key) {
  const u = g.kfUsed[op.side];
  if (u[key] !== g.tp) { u[key] = g.tp; return true; }
  if (tpl(op).kfWarrior && u.ready !== g.tp) { u.ready = g.tp; return true; }
  return false;
}
/** At the start of an activation: Meat heals a wounded operative, Trophy adds an AP. */
export function kfActivate(g, op) {
  if (g.counter || !isKF(op) || op.side > 1 || tpl(op).kfHound || isEngaged(g, op)) return;
  if ((equip(g, op.side, 'kfMeat') && abilityArmed(g, op.side, 'kfMeat')) && op.wounds < op.maxW && mayUse(g, op, 'meat')) {
    const h = Math.min(op.maxW - op.wounds, d3() + 1);
    op.wounds += h;
    note(g, op.side, `生肉：${opName(op, 'zh')} 回復 ${h} 生命`, `Meat: ${opName(op, 'en')} regains ${h} wounds`);
  }
  if ((equip(g, op.side, 'kfTrophy') && abilityArmed(g, op.side, 'kfTrophy')) && !g.kfUsed[op.side].trophy && tpl(op).apl >= 2 && g.tp >= 2) {
    g.kfUsed[op.side].trophy = true;
    op.ap++;
    note(g, op.side, `戰利品：${opName(op, 'zh')} APL +1`, `Trophy: ${opName(op, 'en')} gets +1 APL`);
  }
}
const AMMO_WEAPONS = ['krootRifle', 'krootRifleKB', 'krootRifleCB', 'scattergun', 'pistolsFocused'];
/** The Shoot action begins: Toxin Shot or Piercing Shot (not both) is chosen for a Kroot rifle, scattergun or focused pistols. */
export function kfShootStart(g, op, weapon) {
  op.kfAmmo = null;
  if (!isKF(op) || op.side > 1 || !AMMO_WEAPONS.includes(weapon.id)) return;
  const choose = (key, eq) => (equip(g, op.side, eq) && abilityArmed(g, op.side, eq) && (g.kfUsed[op.side][key] !== g.tp || (tpl(op).kfWarrior && g.kfUsed[op.side].ready !== g.tp)));
  if (choose('toxin', 'kfToxin') && mayUse(g, op, 'toxin')) { op.kfAmmo = { w: weapon.id, kind: 'toxin' }; note(g, op.side, `毒彈：${opName(op, 'zh')} 的武器「致命 5+」與「震懾」`, `Toxin Shot: ${opName(op, 'en')}'s weapon has Lethal 5+ and Stun`); }
  else if (choose('piercing', 'kfPiercing') && mayUse(g, op, 'piercing')) { op.kfAmmo = { w: weapon.id, kind: 'piercing' }; note(g, op.side, `穿甲彈：${opName(op, 'zh')} 的武器「穿甲 1」`, `Piercing Shot: ${opName(op, 'en')}'s weapon has Piercing 1`); }
}
export function kfShootEnd(op) { if (op) op.kfAmmo = null; }
export function kfRules(g, op, weapon, target, r) {
  if (!isKF(op) || !op.kfAmmo || op.kfAmmo.w !== weapon.id) return;
  if (op.kfAmmo.kind === 'toxin') { r.lethal = Math.min(r.lethal || 6, 5); r.stun = true; } else r.piercing = Math.max(r.piercing || 0, 1);
}
