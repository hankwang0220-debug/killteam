// phobos: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { abilityArmed, activeOp, d6, edgeDist, foes, getOp, isEngaged, living, log, opName, team, teamZh, tpl, visibility } from '../game.js';
import { TEAM_MAP } from '../data/teams.js';


// ---------- Phobos Strike Team (equipment, Tactical Advantage, Comms Array) ----------
export const phEquip = (g, op, id) => !!op && op.side < 2 && op.team === 'phobos' && !!g.equip?.[op.side]?.includes(id);
/** Purity Seals: once per turning point, two or more fails when shooting, fighting or retaliating — discard one, retain another as a normal success. */
export function phRoll(g, op, pool, retally) {
  if (!phEquip(g, op, 'phSeals') || !pool || !abilityArmed(g, op.side, 'phSeals') || g.phSeals?.[op.side] === g.tp) return;
  if (pool.dice.filter((d) => !d.auto && d.res === 'miss').length < 2) return;
  (g.phSeals ||= [0, 0])[op.side] = g.tp;
  const seals = (p) => { const m = p.dice.filter((d) => !d.auto && d.res === 'miss'); if (m.length >= 2) { m[0].res = 'norm'; m[0].indo = true; p.norms++; } };
  const prev = pool.post;
  pool.post = prev ? (p) => { prev(p); seals(p); } : seals;
  retally(pool);
  log(g, { zh: `純潔印記：${opName(op, 'zh')} 一個失敗保留為普通成功`, en: `Purity Seals: ${opName(op, 'en')} retains a fail as a normal success` }, `side${op.side}`);
}
/** Special Issue Ammunition: once per turning point, a bolt carbine / marksman / occulus bolt carbine gains Piercing 1 until the end of the turning point. */
export const PH_AMMO_WEAPONS = ['marksmanCarbine', 'stalkerCarbine', 'occulusCarbine', 'boltCarbinePh', 'customCarbine'];
export function phAmmo(g, op, weapon, r) {
  const a = g.phAmmo?.[op.side];
  if (a?.tp === g.tp && a.uid === op.uid && a.w === weapon.group) { r.piercing = Math.max(r.piercing || 0, 1); return; }
  if (!phEquip(g, op, 'phAmmo') || !PH_AMMO_WEAPONS.includes(weapon.group) || a?.tp === g.tp || !abilityArmed(g, op.side, 'phAmmo') || g.active !== op.uid) return;
  r.piercing = Math.max(r.piercing || 0, 1); r.phAmmoNew = true;
}
export function phAmmoUsed(g, op, weapon) {
  (g.phAmmo ||= [null, null])[op.side] = { tp: g.tp, uid: op.uid, w: weapon.group };
  log(g, { zh: `${opName(op, 'zh')} 裝填特製彈藥：本回合「穿甲 1」`, en: `${opName(op, 'en')} loads Special Issue Ammunition: Piercing 1 this turning point` }, `side${op.side}`);
}
/** Combat Blades: every Phobos operative has a combat blade. */
export const PH_COMBAT_BLADE = { id: 'phBlade', group: 'phBlade', name: { zh: '戰鬥刀刃', en: 'Combat blade' }, type: 'melee', atk: 5, hit: 3, dmg: [3, 4], rules: {} };
/** Tactical Advantage (a Phobos Sergeant), once per battle each: an initiative re-roll; a firefight ploy for 0CP (the Sergeant specified, or Patient Ambush while it's ready and free). */
export const phSgt = (g, side) => living(g, side).find((o) => tpl(o).tacticalAdv && o.x > -50);
export function phTacFree(g, side, id) {
  const s = g.teams[side] === 'phobos' && phSgt(g, side);
  if (!s || g.phTac?.[side]?.ff) return false;
  if (id === 'patientAmbush') return s.ready && !isEngaged(g, s);
  const who = g.ffSpec || activeOp(g);
  return !!who && who.uid === s.uid;
}
export function phTacInitOk(g, side) { return g.teams[side] === 'phobos' && !!phSgt(g, side) && !g.phTac?.[side]?.init && g.phase === 'initiative' && !g.initLocked; }
export function phTacInit(g, side) {
  if (!phTacInitOk(g, side)) return false;
  ((g.phTac ||= [{}, {}])[side] ||= {}).init = true;
  const before = g.initRoll[side];
  g.initRoll[side] = d6();
  log(g, { zh: `${teamZh(g, side)} 戰術優勢：重擲先攻骰 ${before} → ${g.initRoll[side]}（${g.initRoll[0]} : ${g.initRoll[1]}）`, en: `${team(g, side).name.en} Tactical Advantage: re-rolls the initiative die ${before} → ${g.initRoll[side]} (${g.initRoll[0]} : ${g.initRoll[1]})` }, `side${side}`);
  return true;
}
/** Comms Array (Commsman): once per turning point, during a friendly's activation, change a strategy ploy used this turning point for free. */
export function phCommsOk(g, side) {
  return g.teams[side] === 'phobos' && living(g, side).some((o) => tpl(o).commsArray && o.x > -50) && g.phComms?.[side] !== g.tp
    && (g.ploys[side] || []).some((id) => team(g, side).ploys.some((p) => p.id === id));
}
export function phCommsChoose(g, side, newId, oldId) {
  if (!phCommsOk(g, side) || !oldId || !g.ploys[side].includes(oldId)) return false;
  const ploy = team(g, side).ploys.find((p) => p.id === newId), old = team(g, side).ploys.find((p) => p.id === oldId);
  if (!ploy || !old || g.ploys[side].includes(newId)) return false;
  g.ploys[side][g.ploys[side].indexOf(oldId)] = newId;
  (g.phComms ||= [0, 0])[side] = g.tp;
  log(g, { zh: `${teamZh(g, side)} 通訊陣列：「${old.name.zh}」改為「${ploy.name.zh}」（免費）`, en: `${team(g, side).name.en} Comms Array: ${old.name.en} becomes ${ploy.name.en} (free)` }, `side${side}`);
  return true;
}

// ---------- Phobos Strike Team ----------
/** Voxbreak: an enemy within 6" of a Voxbreaker can't re-roll its attack or defence dice. */
export const voxbroken = (g, op) => foes(g, op).some((o) => tpl(o).voxbreak && edgeDist(o, op) <= 6);

/** Omni-scrambler (STRATEGIC GAMBIT): enemies that may be picked — visible to a friendly Infiltrator, or within 6" of the Voxbreaker. */
export function scrambleTargets(g, side) {
  const inf = living(g, side).filter((o) => tpl(o).infiltrator);
  if (!TEAM_MAP[g.teams[side]].omniScrambler || !inf.length) return [];
  return living(g, 1 - side).filter((t) => inf.some((o) => visibility(g, o, t).visible || (tpl(o).voxbreak && edgeDist(o, t) <= 6)));
}
export function omniScramble(g, side, target) {
  if (!target || g.scramble?.[side]?.tp === g.tp || !scrambleTargets(g, side).includes(target)) return false;
  const n = living(g, side).filter((o) => tpl(o).infiltrator).length;
  (g.scramble ||= [null, null])[side] = { uid: target.uid, tp: g.tp, n };
  log(g, { zh: `${teamZh(g, side)} 全頻擾亂器：${opName(target, 'zh')} 要等對手先啟動 ${n} 名特工才能行動`, en: `${team(g, side).name.en} Omni-scrambler: ${opName(target, 'en')} can't act until ${n} other operatives have activated` }, `side${side}`);
  return true;
}
/** Is this operative held back by an enemy Omni-scrambler right now? */
export function scrambled(g, op, ready) {
  const s = g.scramble?.[1 - op.side];
  if (!s || s.tp !== g.tp || s.uid !== op.uid) return false;
  return (g.actCount?.[op.side] || 0) < s.n && ready.some((o) => o !== op);
}

/** Auspex Scan: shooting an enemy within 8" of the Voxbreaker — it can't be obscured; an Incursor also has Seek Light. */
export function auspexOn(g, op, target) {
  const a = g.auspex?.[op.side];
  const vb = a && getOp(g, a);
  return !!(vb && !vb.dead && target && edgeDist(vb, target) <= 8);
}
