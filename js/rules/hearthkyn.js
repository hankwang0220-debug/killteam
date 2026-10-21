// hearthkyn: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { ACTIONS, CONTROL, EQUIPMENT_LIMIT, OBJ_R, applyDamage, autoFF, carriables, d3, d6, edgeDist, ffDef, foes, hasPloy, living, log, missionActionsFor, opName, radius, team, teamZh, tpl } from '../game.js';
import { dist, distPointSegment, segRect } from '../geometry.js';
import { isWB, wbOverthrow } from './wyrmblade.js';
import { MISSION_ACTIONS } from '../missions.js';


// ---------- Hearthkyn Salvagers ----------
export const hkEquip = (g, op, id) => op.side < 2 && op.team === 'hearthkyn' && !!g.equip?.[op.side]?.includes(id);
/** The objective marker picked for Need Keeps / Toil Earns this turning point (null if the ploy isn't in use). */
export function hkMarker(g, side, ploy) {
  const m = g.hkMarker?.[ploy]?.[side];
  return side < 2 && m?.tp === g.tp && hasPloy(g, side, ploy) ? (g.objectives || []).find((o) => o.id === m.id) || null : null;
}
export const within3 = (o, m) => !!m && dist(o, m) - radius(o) - OBJ_R <= 3 + 0.01;
/** Writ of Claim (equipment, once per battle): re-roll the initiative die while friendlies contest two or more objective markers. */
export function hkWritOk(g, side) {
  return g.teams[side] === 'hearthkyn' && !!g.equip?.[side]?.includes('hkWrit') && !g.hkWritUsed?.[side] && g.phase === 'initiative' && !g.initLocked
    && (g.objectives || []).filter((o) => living(g, side).some((x) => x.x > -50 && dist(x, o) - radius(x) - OBJ_R <= CONTROL)).length >= 2;
}
export function hkUseWrit(g, side) {
  if (!hkWritOk(g, side)) return false;
  (g.hkWritUsed ||= [false, false])[side] = true;
  const before = g.initRoll[side];
  g.initRoll[side] = d6();
  log(g, { zh: `${teamZh(g, side)} 主權令狀：重擲先攻骰 ${before} → ${g.initRoll[side]}（${g.initRoll[0]} : ${g.initRoll[1]}）`, en: `${team(g, side).name.en} Writ of Claim: re-rolls the initiative die ${before} → ${g.initRoll[side]} (${g.initRoll[0]} : ${g.initRoll[1]})` }, `side${side}`);
  return true;
}
/** A Utility Grenade marker (either side's) within 3" of the operative. */
export function hkUtilityNear(g, op) { return (g.hkUtil || []).some((m) => m && dist(op, m) - radius(op) <= 3 + 0.01); }
/** Ready step: a Utility Grenade from the last turning point stays for D3 more activations; older ones go. */
export function hkReady(g) {
  for (const s of [0, 1]) {
    const m = g.hkUtil?.[s];
    if (!m) continue;
    if (m.tp === g.tp - 1) { m.left = d3(); log(g, { zh: `多功能手雷：再留 ${m.left} 次啟動`, en: `Utility Grenade: stays for ${m.left} more activation(s)` }, `side${s}`); }
    else g.hkUtil[s] = null;
  }
}
/** After each activation, a Utility Grenade on its countdown loses one. */
export function hkAfterActivation(g) {
  for (const s of [0, 1]) { const m = g.hkUtil?.[s]; if (m && m.left != null && --m.left <= 0) g.hkUtil[s] = null; }
}
/** Well Supplied (Lugger): one more equipment option, but only if the Lugger is in the kill team. */
export function hkTrimEquipment(g, side) {
  if (g.teams[side] === 'hearthkyn' && !g.ops.some((o) => o.side === side && tpl(o).wellSupplied)) g.equip[side] = g.equip[side].slice(0, EQUIPMENT_LIMIT);
}
/** Plasma Knives (equipment): every Hearthkyn has one (the Field Medic keeps its better version). */
export const HK_PLASMA_KNIFE = { id: 'hkPlasmaKnife', group: 'hkPlasmaKnife', name: { zh: '等離子小刀', en: 'Plasma knife' }, type: 'melee', atk: 3, hit: 4, dmg: [3, 5], rules: { lethal: 5 } };
/**
 * Beam (EtaCarn plasma beamer): each retained critical success inflicts D3 damage on each other operative along the beam line —
 * one a line from the shooter to its base crosses the target's base, beyond the target, without crossing Heavy terrain. The target
 * itself isn't affected. (2D: the operatives behind the target in its "shadow" from the shooter.)
 */
export function hkBeam(g, op, target, crits) {
  const heavy = g.terrain.filter((t) => t.kind === 'heavy');
  const along = g.ops.filter((o) => !o.dead && o !== op && o !== target && o.x > -50 && dist(op, o) > dist(op, target)
    && distPointSegment(target, op, o) <= radius(target) + 0.01 && !heavy.some((t) => segRect(op, o, t)));
  for (const o of along) {
    let dmg = 0; for (let i = 0; i < crits; i++) dmg += d3();
    log(g, { zh: `光束：${opName(o, 'zh')} 在光束線上，受到 ${dmg} 傷害`, en: `Beam: ${opName(o, 'en')} is along the beam line and takes ${dmg} damage` }, `side${op.side}`);
    applyDamage(g, op, o, dmg);
  }
}
/** Secure Salvage (Hearthkyn Warrior): contesting a marker, one success against it deals 1 less damage. */
export const hkSecureSalvage = (g, target) => !!tpl(target).secureSalvage && [...(g.objectives || []), ...carriables(g).filter((m) => m.owner === target.side)].some((m) => dist(target, m) - radius(target) - OBJ_R <= CONTROL + 0.01);
/** Worth It (firefight ploy): an incapacitated Hearthkyn performs a free mission action before it's removed. */
// (A Plan Generations in the Making, Wyrmblade Neophytes, works the same way; Overthrow the Oppressors can make it 0CP.)
export function hkWorthIt(g, target) {
  const ploy = target.team === 'hearthkyn' ? 'worthIt' : isWB(target) && tpl(target).neophyte ? 'planGenerations' : null;
  if (!ploy) return;
  // It's still in the killzone for this (it counts for control while it acts).
  const was = target.dead; target.dead = false;
  const id = missionActionsFor(g, target.side).find((a) => !/^tw(Open|Close)_/.test(a) && !MISSION_ACTIONS[a].cond(g, target));
  const free = ploy === 'planGenerations' && !!id && wbOverthrow(g, target);
  g.wbPlanFree = free;
  const used = !!id && autoFF(g, target.side, ploy);
  g.wbPlanFree = false;
  if (!used) { target.dead = was; return; }
  if (free) (g.wbOverthrowTP ||= [0, 0])[target.side] = g.tp;
  let msg;
  try { msg = MISSION_ACTIONS[id].apply(g, target); } finally { target.dead = was; }
  const nm = ffDef(g, target.side, ploy).name;
  log(g, { zh: `${nm.zh}${free ? '（推翻壓迫者：0CP）' : ''}：${opName(target, 'zh')} 倒下前免費執行「${ACTIONS[id].name.zh}」${msg ? `（${msg.zh}）` : ''}`, en: `${nm.en}${free ? ' (Overthrow the Oppressors: 0CP)' : ''}: ${opName(target, 'en')} performs a free ${ACTIONS[id].name.en} before it's removed${msg ? ` (${msg.en})` : ''}` }, `side${target.side}`);
}

/** Horrifying Shrieking (Fleshscreamer) / Terror (Phobos Reivers): an enemy within 3" of one. */
export const shrieked = (g, op) => foes(g, op).some((o) => (tpl(o).shrieking || tpl(o).terror) && edgeDist(o, op) <= 3);

/** Blessings of Infection (fight dice): 3+ fails → one becomes a normal success; else 3+ successes → discard a fail, a normal becomes a crit. */
export function blessings(pool) {
  const fails = pool.dice.filter((d) => d.res === 'miss');
  if (fails.length >= 3) { fails[0].res = 'norm'; fails[0].indo = true; pool.norms++; return; }
  const norm = pool.dice.find((d) => d.res === 'norm');
  if (pool.crits + pool.norms >= 3 && fails.length && norm) { norm.res = 'crit'; norm.rend = true; pool.norms--; pool.crits++; }
}

// ---------- Hearthkyn Salvagers ----------
export function addGrudge(g, side, enemy, why) {
  (enemy.grudge ||= {})[side] = (enemy.grudge[side] || 0) + 1;
  log(g, { zh: `${opName(enemy, 'zh')} 獲得宿怨標記（${why.zh}，共 ${enemy.grudge[side]}）`, en: `${opName(enemy, 'en')} gains a Grudge token (${why.en}; ${enemy.grudge[side]} in total)` }, `side${side}`);
}

/** Eye of the Ancestors (Theyn, STRATEGIC GAMBIT): how many enemies can still be given a Grudge token this TP. */
export function eyeLeft(g, side) {
  if (!living(g, side).some((o) => tpl(o).eyeOfAncestors)) return 0;
  const lost = g.ops.filter((o) => o.side === side && o.dead).length;
  const used = g.eye?.[side]?.tp === g.tp ? g.eye[side].n : 0;
  return Math.max(0, (lost >= 3 ? 2 : 1) - used);
}
export function eyeOfAncestors(g, side, enemy) {
  if (!eyeLeft(g, side) || !enemy || enemy.dead) return false;
  const e = (g.eye ||= [null, null]);
  e[side] = { tp: g.tp, n: (e[side]?.tp === g.tp ? e[side].n : 0) + 1 };
  addGrudge(g, side, enemy, { zh: '先祖之眼', en: 'Eye of the Ancestors' });
  return true;
}

/** Tactician (Kognitâar, STRATEGIC GAMBIT): the Attack marker on an enemy, or the Defence marker on a friendly, for this TP. */
export function placeTactician(g, side, kind, at) {
  (g.tactician ||= [null, null])[side] = at ? { kind, x: at.x, y: at.y, tp: g.tp } : null;
  if (at) log(g, { zh: `${teamZh(g, side)} 戰術家：${kind === 'attack' ? '攻擊' : '防禦'}標記放在 ${opName(at, 'zh')} 處`, en: `${team(g, side).name.en} Tactician: ${kind === 'attack' ? 'Attack' : 'Defence'} marker placed at ${opName(at, 'en')}` }, `side${side}`);
}
/** Weavefield Crest: use the Theyn's once-per-battle ignore of one die's Normal Dmg (the first time it matters). */
export function useCrest(g, op) {
  if (!(tpl(op).weavefield || tpl(op).apotheosis) || op.crestUsed) return false;
  op.crestUsed = true;
  if (tpl(op).apotheosis) log(g, { zh: `${opName(op, 'zh')} 即將成神：無視一次普通傷害`, en: `${opName(op, 'en')} Impending Apotheosis: ignores one Normal Dmg` }, `side${op.side}`); // (Blood Herald)
  else log(g, { zh: `${opName(op, 'zh')} 編織力場紋章：無視一次普通傷害`, en: `${opName(op, 'en')} Weavefield Crest: ignores one Normal Dmg` }, `side${op.side}`);
  return true;
}
export const defenceMarker = (g, op) => { const t = g.tactician?.[op.side]; return !!(t && t.tp === g.tp && t.kind === 'defence' && dist(t, op) - radius(op) <= 3); };
