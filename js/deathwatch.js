import { DW_AMMO, deathwatchRosterError } from './data/deathwatch.js';
import { TEAM_MAP } from './data/teams.js';
import { spAfterAction } from './spectres.js';
import { abilityArmed, tpl, living, foes, edgeDist, visibility, hasPloy, radius, territoryOf, isEngaged, inEngagement, d6, log, opName, ACTIONS, spend, weaponsFor, shootCheck, resolveShoot, resolveFight, bestMelee, avgDmg, applyDamage, mission, equipmentLimitFor, playerPicks, closeQuarters } from './game.js';
import { MISSION_ACTIONS } from './missions.js';
export { DW_AMMO };
export const isDeathwatch = (o) => o?.team === 'deathwatch';
export const dwEquip = (g, o, id) => isDeathwatch(o) && g.equip?.[o.side]?.includes(id);
function B(zh, en) { return { zh, en }; }
export function dwSetup(g, roster) {
  for (const s of [0, 1]) if (g.teams[s] === 'deathwatch') {
    const error = deathwatchRosterError(TEAM_MAP.deathwatch, roster[s]);
    if (error) throw new Error(error.en);
  }
}
// All teams share the user's combined four-option equipment cap.
export function dwEquipmentLimit(t) { return equipmentLimitFor(t?.id); }
export const dwCommandFree = (g, side, kind) => g.teams[side] === 'deathwatch' && !g.dwCommand?.[side]?.[kind] && living(g, side).some((o) => tpl(o).dwCommand && o.placed !== false);
export function dwConsumeCommand(g, side, kind) {
  ((g.dwCommand ||= [{}, {}])[side])[kind] = true;
}
export const dwSecondShotExtra = (first, w) => first === 'dwMeltaBomb' || w.group === 'dwMeltaBomb'
  || ['dwAux', 'dwCannon', 'dwIncinerator', 'dwInfernus', 'dwPlasma', 'dwStalker'].includes(first) && ['dwAux', 'dwCannon', 'dwIncinerator', 'dwInfernus', 'dwPlasma', 'dwStalker'].includes(w.group);
export function dwWholly(g, o, side) {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(o);
  return [-r, r].every((d) => territoryOf(g, { ...o, [along]: o[along] + d }) === side);
}
export function dwReduceDamage(g, o, damage, normal, melee = false) {
  if (!isDeathwatch(o)) return damage;
  const reduce = melee && tpl(o).dwAggressive && damage >= 3 || normal && damage >= 4 && hasPloy(g, o.side, 'dwShieldSlays') && dwWholly(g, o, 1 - o.side);
  return reduce ? damage - 1 : damage;
}
export function dwRules(g, o, w, target, r) {
  if (!isDeathwatch(o)) return;
  if (target && hasPloy(g, o.side, target.order === 'conceal' ? 'dwMissionConceal' : 'dwMissionEngage')) r.balanced = true;
  if (w.type === 'melee' && tpl(o).dwAggressive && g.active === o.uid) {
    r.brutal = true;
    if (o.acted.charge) r.ceaseless = true;
  }
  if (w.type === 'ranged' && dwAuspexOn(g, o, target)) r.saturate = true;
}
export function dwDefence(g, o, r) {
  if (isDeathwatch(o) && hasPloy(g, o.side, 'dwLongVigil') && dwWholly(g, o, o.side)) r.balanced = true;
}
export const dwTriangulation = (g, side, target) => !!target && living(g, side).some((o) => tpl(o).dwDisruptor && !isEngaged(g, o) && visibility(g, o, target).visible);
export const dwAuspexOn = (g, o, target) => !!o.acted?.dwAuspex && (!o.acted.dwAuspexFree || dwTriangulation(g, o.side, target));
export function dwActivate(g, o) {
  if (!isDeathwatch(o)) return;
  o.dwGuard = false;
  if (tpl(o).dwHeadtaker) o.acted.dwUnseen = foes(g, o).filter((e) => !visibility(g, e, o).visible).map((e) => e.uid);
}
// Before activation effects, automatically use cuffs to cleanse poison or restore a reduced APL.
export function dwBeforeActivation(g, o) {
  if (!dwEquip(g, o, 'dwCuffs') || !abilityArmed(g, o, 'dwCuffsAuto') || isEngaged(g, o)) return;
  let note;
  if (o.poison || o.archonPoison || o.neutron || o.terrorchem) { dwCleanse(o); note = B('清除有害標記', 'clears a harmful token'); }
  else if (o.aplNext < 0) { o.aplNext = 0; note = B('清除 APL 減值', 'clears APL reductions'); }
  if (note) { o.acted.dwCuffs = true; log(g, B(`生體掃描護腕：${note.zh}`, `Bioscryer Cuffs: ${note.en}`), `side${o.side}`); }
}
function dwCleanse(o) {
  // One token type per use; Archon torment poison is also a Poison token.
  if (o.poison || o.archonPoison) { o.poison = false; o.archonPoison = null; }
  else if (o.neutron) o.neutron = false;
  else o.terrorchem = false;
}
const ammoUsed = (g, side) => g.dwAmmo?.[side]?.tp === g.tp ? g.dwAmmo[side].ids : [];
export function dwAmmoAvailable(g, o, id) {
  const ids = ammoUsed(g, o.side);
  return isDeathwatch(o) && !ids.includes(id) && (!ids.length || ids.length === 1 && dwEquip(g, o, 'dwAmmoReserve') && !g.dwReserve?.[o.side]);
}
export const dwAmmoWeapon = (w) => w.type === 'ranged' && !w.rules.equipGrenade && w.id !== 'dwMeltaBomb' && !['eqFrag', 'eqKrak'].includes(w.id);
export function dwApplyAmmo(g, o, w) {
  const id = o.acted.dwAmmoPick;
  if (!id || !dwAmmoWeapon(w) || !dwAmmoAvailable(g, o, id) || id === 'blast' && w.rules.torrent) return w;
  const used = ammoUsed(g, o.side);
  if (used.length) (g.dwReserve ||= [false, false])[o.side] = true;
  (g.dwAmmo ||= [null, null])[o.side] = { tp: g.tp, ids: [...used, id] };
  o.acted.dwAmmoPick = null;
  const rules = { ...w.rules };
  for (const [key, value] of Object.entries(DW_AMMO[id].rules)) rules[key] = key === 'lethal' ? Math.min(rules[key] || 6, value) : typeof value === 'number' ? Math.max(rules[key] || 0, value) : value;
  log(g, DW_AMMO[id].name, `side${o.side}`);
  return { ...w, rules };
}
export function dwScrambleTargets(g, side) {
  const o = living(g, side).find((x) => tpl(x).dwDisruptor);
  return o ? foes(g, o).filter((e) => e.side < 2 && (edgeDist(o, e) <= 6 || visibility(g, o, e).visible)) : [];
}
export function dwScramble(g, side, uid) {
  if (g.phase !== 'strategy' || g.dwScramble?.[side]?.tp === g.tp) return false;
  const target = dwScrambleTargets(g, side).find((e) => e.uid === uid); if (!target) return false;
  const r = d6();
  (g.dwScramble ||= [null, null])[side] = { uid, tp: g.tp, n: (g.actCount?.[target.side] || 0) + r };
  log(g, B(`全頻擾亂器：${opName(target, 'zh')} 延後 ${r} 次啟動（或最後一名）`, `Advanced Omni-scrambler: ${opName(target, 'en')} delayed ${r} activations (or until last ready)`), `side${side}`);
  return true;
}
export function dwBlocked(g, o) {
  const s = g.dwScramble?.[1 - o.side];
  return !!s && s.uid === o.uid && s.tp === g.tp && (g.actCount?.[o.side] || 0) < s.n && living(g, o.side).some((e) => e !== o && e.ready);
}
export function dwStrategy(g, side) {
  if (g.dwScramble?.[side]?.tp === g.tp) return;
  const target = dwScrambleTargets(g, side).sort((a, b) => tpl(b).apl - tpl(a).apl)[0];
  if (target) dwScramble(g, side, target.uid);
}
export function registerDwActions() {
  for (const [id, a] of Object.entries(DW_AMMO)) ACTIONS[`dwAmmo_${id}`] = { ap: 0, name: a.name };
  Object.assign(ACTIONS, {
    dwAmmoCancel: { ap: 0, name: B('取消特殊彈藥', 'Cancel ammo') },
    dwCuffsHeal: { ap: 0, name: B('護腕：回復 D3', 'Cuffs: heal D3') },
    dwCuffsApl: { ap: 0, name: B('護腕：清除 APL 變動', 'Cuffs: clear APL changes') },
    dwCuffsCleanse: { ap: 0, name: B('護腕：清除有害標記', 'Cuffs: cleanse token') },
    dwThrallUse: { ap: 0, name: B('伺服僕從：減免任務動作', 'Servo-thrall: discount mission action') },
    dwGuard: { ap: 1, name: B('警戒（自動攻擊）', 'Guard (automatic attack)') },
  });
}
export function dwActions(g, o, add, canShoot) {
  if (!isDeathwatch(o)) return;
  const why = B('條件不符或已使用', 'Unavailable or already used');
  for (const id of Object.keys(DW_AMMO)) add(`dwAmmo_${id}`, dwAmmoAvailable(g, o, id), why);
  if (o.acted.dwAmmoPick) add('dwAmmoCancel', true);
  if (dwEquip(g, o, 'dwCuffs')) for (const id of ['dwCuffsHeal', 'dwCuffsApl', 'dwCuffsCleanse']) add(id, !o.counter && !isEngaged(g, o) && !o.acted.dwCuffs, why);
  if (dwEquip(g, o, 'dwThrall')) add('dwThrallUse', !o.counter && g.dwThrallTP?.[o.side] !== g.tp && !g.dwThrallLost?.[o.side] && !o.acted.dwThrall, why);
  if (tpl(o).dwMarksman) add('dwGuard', !o.counter && !isEngaged(g, o) && o.order === 'engage' && canShoot && !o.dwGuard, why);
}
export function dwSelfAction(g, o, id) {
  if (!isDeathwatch(o) || !id.startsWith('dw')) return false;
  if (id.startsWith('dwAmmo_')) o.acted.dwAmmoPick = id.slice(7);
  else if (id === 'dwAmmoCancel') o.acted.dwAmmoPick = null;
  else if (id.startsWith('dwCuffs')) {
    o.acted.dwCuffs = true;
    if (id === 'dwCuffsHeal') o.wounds = Math.min(o.maxW, o.wounds + Math.ceil(d6() / 2));
    else if (id === 'dwCuffsCleanse') dwCleanse(o);
    else { const old = o.aplNext; o.aplNext = 0; if (!o.aplKeep) o.ap = Math.max(0, o.ap - Math.max(-1, Math.min(1, old || 0))); }
  } else if (id === 'dwThrallUse') o.acted.dwThrall = true;
  else if (id === 'dwGuard') { spend(g, o, 'shoot'); o.acted.shotWith = 'dwGuard'; o.dwGuard = true; }
  else return false;
  log(g, ACTIONS[id].name, `side${o.side}`);
  return true;
}
export function dwMissionDone(g, o, id) {
  if (!isDeathwatch(o) || !o.acted.dwThrall || !MISSION_ACTIONS[id]) return;
  o.acted.dwThrall = false;
  (g.dwThrallTP ||= [0, 0])[o.side] = g.tp;
  if (isEngaged(g, o)) {
    let a, b; do { a = d6(); b = d6(); } while (a === b);
    if (b > a) (g.dwThrallLost ||= [false, false])[o.side] = true;
    log(g, B(`伺服僕從：擲骰 ${a}:${b}${b > a ? '，裝備永久失效' : '，裝備保留'}`, `Servo-thrall: ${a}:${b}${b > a ? ', equipment lost' : ', equipment retained'}`), `side${o.side}`);
  }
}
export function dwDigital(g, o, target) {
  if ((dwEquip(g, o, 'dwDigital') && abilityArmed(g, o, 'dwDigital')) && g.dwDigitalTP?.[o.side] !== g.tp) {
    (g.dwDigitalTP ||= [0, 0])[o.side] = g.tp; applyDamage(g, o, target, 1);
  }
}
// ---------- On guard (close quarters; also Vigilant Marksman, Track Target, Storm-veiled Execution, Deathmark Ambush) ----------
/** The guard's order while it attacks: Track Target / Deathmark Ambush go Engage. */
const guardOrder = (o) => (tpl(o).phTrack || o.hcAmbush ? 'engage' : o.order);
/** The attack an operative on guard could make on the actor: a Fight (it's in control range), a point-blank shot, or an ordinary shot. */
function guardAttack(g, o, actor) {
  const close = inEngagement(o, actor, g);
  const keep = { ap: o.ap, acted: o.acted, order: o.order, pointBlank: o.pointBlank };
  o.ap = 1; o.acted = { free: { shoot: 'any', fight: 'any' } }; o.order = guardOrder(o); o.pointBlank = close;
  try {
    const shots = weaponsFor(g, o).filter((w) => w.type === 'ranged' && shootCheck(g, o, actor, w).ok).map((w) => ({ kind: 'shoot', w, v: avgDmg(w, close ? 1 : 0) }));
    const fight = close && bestMelee(o) ? [{ kind: 'fight', w: bestMelee(o), v: avgDmg(bestMelee(o)) * 1.1 }] : [];
    return [...shots, ...fight].sort((a, b) => b.v - a.v)[0] || null;
  } finally { Object.assign(o, keep); }
}
/** Nobody interrupted after that action: guards in the actor's control range stand down. */
function guardsStandDown(g, actor) {
  for (const o of living(g)) if (o.side !== actor.side && o.dwGuard && actor.x > -50 && inEngagement(o, actor, g)) {
    o.dwGuard = false;
    log(g, B(`${opName(o, 'zh')} 的警戒解除（${opName(actor, 'zh')} 在控制範圍內完成動作，沒有打斷）`, `${opName(o, 'en')} is no longer on guard (${opName(actor, 'en')} ended an action in its control range, not interrupted)`), `side${o.side}`);
  }
}
/** Interrupting: the guard comes off guard, can't counteract this turning point, and fights / shoots (point-blank when in control range). */
function guardStart(g, o, actor) {
  actor.acted.dwGuardInterrupted = true;
  o.dwGuard = false;
  o.noCounterTP = g.tp; // (FAQ: an operative that interrupts on guard can't counteract during that turning point)
  if (tpl(o).phTrack || o.hcAmbush) o.order = 'engage'; // (Track Target, Deathmark Ambush: a Concealed guard goes Engage to attack)
  o.pointBlank = isEngaged(g, o); o.pbActor = actor.uid;
  log(g, B(`${opName(o, 'zh')} 警戒：打斷 ${opName(actor, 'zh')} 的啟動${o.pointBlank ? '（零距離射擊：命中 -1，這次啟動不能反擊）' : ''}`, `${opName(o, 'en')} on guard interrupts ${opName(actor, 'en')}'s activation${o.pointBlank ? ' (point-blank: Hit worsened by 1, no retaliating this activation)' : ''}`), `side${o.side}`);
}
/** A player picked the operative on guard to interrupt with (it's activated for its free Shoot or Fight). */
export function guardPick(g, o) {
  const actor = g.netcounter?.guard && getOpIn(g, g.netcounter.guard.actor);
  if (actor) guardStart(g, o, actor);
}
/** A player passed on interrupting. */
export function guardPassed(g) {
  const actor = getOpIn(g, g.netcounter.guard.actor);
  if (actor && !actor.dead) guardsStandDown(g, actor);
}
const getOpIn = (g, uid) => g.ops.find((o) => o.uid === uid);
/** After an enemy's action: once per activation, an operative on guard may interrupt with a free Shoot or Fight. */
export function dwAfterAction(g, actor) {
  spAfterAction(g, actor); // Elite Fieldcraft (Spectre Squad): interrupts after an enemy's action
  if (g.dwInterrupt || g.phase !== 'firefight' || !actor || actor.side > 1 || actor.dead || g.netcounter) return;
  if (actor.counter) { guardsStandDown(g, actor); return; } // (a counteraction isn't an activation: it can't be interrupted)
  if (actor.acted.dwGuardInterrupted) return; // (once per activation; the guards it passed stay on guard)
  const side = 1 - actor.side;
  const cands = living(g, side).filter((o) => o.dwGuard && !dwBlocked(g, o)).map((o) => ({ o, a: guardAttack(g, o, actor) })).filter((x) => x.a);
  if (!cands.length) { guardsStandDown(g, actor); return; }
  // A player chooses whether to interrupt and with whom (Shoot or Fight for free), or passes.
  if (playerPicks(g, side) && g.active === actor.uid) {
    g.netcounter = { side, only: cands.map((x) => x.o.uid), resume: actor.uid, resumeCounter: false, kind: 'control', onlyActions: ['shoot', 'fight'], ctlMove: 0, guard: { actor: actor.uid },
      label: { title: B('警戒：打斷', 'On guard: interrupt'), hint: B(`${opName(actor, 'zh')} 剛執行完動作。可以選一名警戒中的友方免費射擊或近戰（控制範圍內是零距離射擊：命中 -1）；打斷後它本回合不能反應。略過的話，${opName(actor, 'zh')} 控制範圍內的警戒會解除。`, `${opName(actor, 'en')} has just performed an action. Pick a friendly on guard to Shoot or Fight for free (point-blank within control range: Hit worsened by 1); it can't counteract this turning point. If you pass, guards within ${opName(actor, 'en')}'s control range stand down.`) } };
    g.active = null; g.counter = true; g.turn = side;
    return;
  }
  const { o, a } = cands.sort((x, y) => y.a.v - x.a.v)[0];
  g.dwInterrupt = true;
  try {
    const keep = { acted: o.acted, ap: o.ap, active: g.active, fight: g.fight, ffAtk: g.ffAtk, ffPending: g.ffPending };
    guardStart(g, o, actor);
    o.acted = { free: { shoot: 'any', fight: 'any' } }; o.ap = 1; g.active = o.uid; g.ffPending = null;
    try {
      if (a.kind === 'fight') resolveFight(g, o, a.w, actor);
      else resolveShoot(g, o, a.w, actor);
    } finally { o.acted = keep.acted; o.ap = keep.ap; g.active = keep.active; g.fight = keep.fight; g.ffAtk = keep.ffAtk; g.ffPending = keep.ffPending; o.pointBlank = false; }
    // Vigilant Marksman: once per turning point, straight back on guard (then it can't counteract — already so after interrupting).
    if (!o.dead && tpl(o).dwMarksman && closeQuarters(g) && o.dwReGuardTP !== g.tp && !o.counteracted) { o.dwReGuardTP = g.tp; o.dwGuard = true; }
  } finally { g.dwInterrupt = false; }
}
