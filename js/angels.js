// Angels of Death (死亡天使) rules engine for the Captain, Chapter Veteran, Adaptive Tactics and the faction equipment.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load.)
import { activeOp, edgeDist, foes, living, log, opName, tpl, team } from './game.js';
import { angelsRosterError, ADAPTIVE_ORDER } from './data/angels.js';

export function isAD(o) { return o?.team === 'angels'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }

export function adSetup(g, roster) {
  g.adUsed = [{}, {}]; g.adaptive = [null, null];
  for (const side of [0, 1]) if (g.teams[side] === 'angels') {
    const error = angelsRosterError(team(g, side), roster[side]);
    if (error) throw new Error(error.en);
  }
}

// ---------- Chapter Tactics: Chapter Veteran and Adaptive Tactics ----------
/** The tactic list that applies to a side now (Adaptive Tactics replaces the secondary for the turning point). */
export function adTactics(g, side) {
  const list = g.tactics?.[side];
  const a = g.adaptive?.[side];
  return list && a && a.tp === g.tp ? [list[0], a.id] : list;
}
/** Chapter Veteran: a Sergeant has one more tactic for the battle. */
export function adVeteran(g, op, id) { return !!tpl(op).chapterVeteran && !!g.vet?.[op.side] && g.vet[op.side] === id; }
export function adPloyBought(g, side, ploy) {
  if (ploy.id !== 'adaptiveTactics') return;
  const have = g.tactics?.[side] || [];
  const pick = ADAPTIVE_ORDER.find((id) => !have.includes(id));
  if (!pick) return;
  g.adaptive[side] = { tp: g.tp, id: pick };
  const t = team(g, side).tactics.find((x) => x.id === pick);
  note(g, side, `適應戰術：本回合次要戰團戰術改為「${t.name.zh}」`, `Adaptive Tactics: the secondary Chapter Tactic is ${t.name.en} this turning point`);
}

// ---------- Captain: Heroic Leader, Iron Halo ----------
function captainOf(g, side) { return living(g, side).find((o) => tpl(o).heroicLeader); }
/**
 * Heroic Leader (once per TP): a firefight ploy costs 0CP when the Captain is the specified operative (the active operative, or the
 * one shot at for Transhuman Physiology), or Adjust Doctrine is free while the Captain is in the killzone and not engaged.
 */
export function adHeroicFree(g, side, id, spec = null) {
  const c = g.teams[side] === 'angels' && captainOf(g, side);
  if (!c || g.adUsed?.[side]?.heroic === g.tp) return false;
  if (id === 'adjustDoctrine' && !foes(g, c).some((e) => edgeDist(c, e) <= 1.01)) return true;
  const who = spec || activeOp(g);
  return !!who && who.uid === c.uid && ['adjustDoctrine', 'shockAssault', 'wrathVengeance', 'transhuman'].includes(id);
}
export function adHeroicUsed(g, side) { if (g.adUsed?.[side]) g.adUsed[side].heroic = g.tp; }
/** Iron Halo: once per battle, ignore the damage of one Normal Dmg attack die. */
export function adIronHalo(g, target) {
  if (!tpl(target).ironHalo || target.haloUsed) return false;
  target.haloUsed = true;
  note(g, target.side, `${opName(target, 'zh')} 鐵光環：無視一次普通傷害`, `${opName(target, 'en')} Iron Halo: ignores one Normal Dmg die`);
  return true;
}

// ---------- equipment ----------
/** Purity Seals: two or more fails, one is discarded and another kept as a normal success (a post step, so it survives re-rolls). */
export function adRoll(g, op, pool, retally) {
  if (!isAD(op) || op.side > 1 || !pool || !equip(g, op.side, 'adSeals') || g.adUsed?.[op.side]?.seals === g.tp) return;
  if (pool.dice.filter((d) => !d.auto && d.res === 'miss').length < 2) return;
  g.adUsed[op.side].seals = g.tp;
  const seals = (p) => { const m = p.dice.filter((d) => !d.auto && d.res === 'miss'); if (m.length >= 2) { m[0].res = 'norm'; m[0].indo = true; p.norms++; } };
  const prev = pool.post;
  pool.post = prev ? (p) => { prev(p); seals(p); } : seals;
  retally(pool);
  note(g, op.side, `純潔印記：${opName(op, 'zh')} 一個失敗保留為普通成功`, `Purity Seals: ${opName(op, 'en')} retains a fail as a normal success`);
}
/** Auspex: shooting an obscured target within 8", enemies within 8" of the shooter cannot be obscured until the end of the activation. */
export function adShootStart(g, op, target, obscured) {
  if (!isAD(op) || op.side > 1 || !equip(g, op.side, 'adAuspex') || g.adUsed?.[op.side]?.auspex === g.tp || !obscured || edgeDist(op, target) > 8) return;
  g.adUsed[op.side].auspex = g.tp;
  op.adAuspex = true;
  note(g, op.side, `偵測儀：${opName(op, 'zh')} 8" 內的敵人不能被遮蔽`, `Auspex: enemies within 8" of ${opName(op, 'en')} can't be obscured`);
}
export function adAuspexOn(op, target) { return !!op.adAuspex && edgeDist(op, target) <= 8.01; }
export function adEnd(op) { if (op) op.adAuspex = false; }
/** Tilting Shields: the opponent cannot retain results below 6 as critical successes against this fighter (once per TP). */
export function adTilting(g, me) {
  if (!isAD(me) || me.side > 1 || !equip(g, me.side, 'adTilting') || g.adUsed?.[me.side]?.tilting === g.tp) return false;
  g.adUsed[me.side].tilting = g.tp;
  note(g, me.side, '傾斜盾：對手只有擲出 6 才算暴擊', "Tilting Shields: the opponent's crits need a 6");
  return true;
}
/** Chapter Reliquaries: Wrath of Vengeance for 0CP when the counteracting operative has an Engage order. */
export function adReliquaries(g, side) {
  const o = activeOp(g);
  return g.teams[side] === 'angels' && equip(g, side, 'adReliquaries') && !!o && o.side === side && o.order === 'engage';
}
