// hunterclade: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CHOICES, activeOp, canActivateOp, edgeDist, foes, hasPloy, living, log, opName, team, teamZh, tpl, visibility } from '../game.js';
import { dist } from '../geometry.js';
import { bestStep, stepTo } from '../sanctifiers.js';
import { TEAM_MAP } from '../data/teams.js';

// ---------- Hunter Clade (the leaders and ploys added with the full roster) ----------
/** Control Protocol (every Hunter Clade leader): Command Override costs 0CP for an operative the leader can see. */
export function huControlFree(g, side, id) {
  if (id !== 'commandOverride' || g.teams[side] !== 'hunterClade') return false;
  const op = g.ffSpec || activeOp(g);
  return !!op && op.side === side && living(g, side).some((l) => tpl(l).controlProtocol && l.x > -50 && (l === op || visibility(g, l, op).visible));
}
/** Control Edict: the Leader and another ready friendly visible within 3" (no more than one Sicarian) activate one after the other. */
export function huEdictPartners(g, op) {
  if (op.team !== 'hunterClade') return [];
  const lead = (o) => !!tpl(o).controlProtocol;
  return living(g, op.side).filter((o) => o !== op && canActivateOp(g, o) && (lead(op) || lead(o)) && !(tpl(op).sicarian && tpl(o).sicarian)
    && edgeDist(o, op) <= 3 && visibility(g, op, o).visible).sort((a, b) => b.wounds - a.wounds);
}
/** Scouting Protocol: Concealed Rangers more than 6" from enemies make free Dashes. */
export const huScoutMovers = (g, side) => living(g, side).filter((o) => o.team === 'hunterClade' && tpl(o).ranger && o.order === 'conceal' && o.x > -50 && !foes(g, o).some((e) => e.x > -50 && edgeDist(e, o) <= 6));
export function registerHunterCladeChoices() {
  CHOICES.huScouting = {
    kind: 'move', title: { zh: '偵察協定：隱蔽的遊騎兵免費衝刺', en: 'Scouting Protocol: Concealed Rangers make free Dashes' },
    movers: huScoutMovers, moveKind: () => 'dash', max: () => 3,
    autoAll(g, side) {
      for (const o of huScoutMovers(g, side)) { // (the computer: towards the nearest objective, staying out of enemy sight where it can)
        const objs = g.objectives || [], near = (p) => Math.min(...objs.map((m) => dist(m, p)));
        if (!objs.length || near(o) <= 2) continue;
        const q = bestStep(g, o, 3, 'dash', (p) => (near(p) < near(o) ? -near(p) - (foes(g, o).some((e) => visibility(g, e, { ...o, x: p.x, y: p.y }).visible) ? 5 : 0) : null));
        if (q) { stepTo(g, o, q); log(g, { zh: `偵察協定：${opName(o, 'zh')} 免費衝刺`, en: `Scouting Protocol: ${opName(o, 'en')} makes a free Dash` }, `side${side}`); }
      }
    },
  };
}
// ---------- Hunter Clade ----------
/** The Doctrina Imperative this operative's team has this turning point (null if none). */
export const doctrina = (g, op) => {
  if (op.docOverride?.tp === g.tp) return { tp: g.tp, mode: op.docOverride.mode, noDep: false }; // Command Override
  const d = op.side < 2 && TEAM_MAP[op.team].doctrina ? g.doctrina?.[op.side] : null;
  return d && d.tp === g.tp ? d : null;
};
export const optimised = (g, op, mode) => doctrina(g, op)?.mode === mode;
export const deprecated = (g, op, mode) => { const d = doctrina(g, op); return !!d && d.mode === mode && !d.noDep; };
/** Strategic gambit: the Imperative until the next Ready step (the Primary Mode's Deprecation can be ignored once per battle). */
export function setDoctrina(g, side, mode, ignoreDep = false) {
  const primary = g.tactics?.[side]?.[0];
  const prev = g.doctrina?.[side];
  if (prev?.tp === g.tp && prev.noDep) g.primaryUsed[side] = false; // changed its mind in the same Strategy phase
  const noDep = ignoreDep && mode === primary && !g.primaryUsed?.[side];
  if (noDep) (g.primaryUsed ||= [false, false])[side] = true;
  (g.doctrina ||= [null, null])[side] = { tp: g.tp, mode, noDep };
  const t = team(g, side).tactics.find((x) => x.id === mode);
  log(g, { zh: `${teamZh(g, side)} 教條指令：${t.name.zh}${noDep ? '（主要模式：無視劣化）' : ''}`, en: `${team(g, side).name.en} Doctrina Imperative: ${t.name.en}${noDep ? ' (Primary Mode: Deprecation ignored)' : ''}` }, `side${side}`);
}
/** Can this side still ignore its Primary Mode's Deprecation? */
export const primaryLeft = (g, side) => !g.primaryUsed?.[side];
/** Hit worsened by the Imperative's Deprecation (Protector: melee; Conqueror: ranged). */
export const doctrinaHit = (g, op, w) => !!w && ((w.type === 'melee' && deprecated(g, op, 'protector')) || (w.type === 'ranged' && deprecated(g, op, 'conqueror')));
export const bulwark = (g, op) => !!g && optimised(g, op, 'bulwark');
/** Rad-Saturation: an enemy within 2" of a friendly Vanguard has its Hit worsened by 1. */
export const radSaturated = (g, op) => op.side < 2 && living(g, 1 - op.side).some((v) => tpl(v).radSat && edgeDist(v, op) <= 2);
/** Debilitating Irradiation: the attacker is irradiated and its target is a Vanguard of a side that bought the ploy. */
export const debilitated = (g, src, target) => target.side < 2 && !!tpl(target).vanguard && hasPloy(g, target.side, 'debilitating') && radSaturated(g, src);
/** Neurostatic Interference: an enemy within 6" of a friendly Infiltrator can't re-roll its attack dice. */
export const neurostatic = (g, op) => op.side < 2 && hasPloy(g, 1 - op.side, 'neurostatic') && living(g, 1 - op.side).some((i) => tpl(i).infiltrator && edgeDist(i, op) <= 6);
